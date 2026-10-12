import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import crypto from "node:crypto";
import bcrypt from "bcrypt";

vi.mock("../src/repositories/users.repository.js");
vi.mock("../src/repositories/refresh_token.repositories.js");
vi.mock("resend", () => ({
    Resend: class {
        emails = { send: () => Promise.resolve({}) };
    }
}));

import app from "../src/app.js";
import * as usersRepo from "../src/repositories/users.repository.js";
import * as refreshRepo from "../src/repositories/refresh_token.repositories.js";
import { verifyAccessToken, generateAccessToken } from "../src/utils/jwt.js";
import { USER_ID, refreshTokenFor } from "./helpers/tokens.js";

const sha256 = (value) =>
    crypto.createHash("sha256").update(value).digest("hex");

const PASSWORD = "Password123!";

const verifiedUser = {
    id: USER_ID,
    name: "Test User",
    email: "test@example.com",
    role: "user",
    password_hash: bcrypt.hashSync(PASSWORD, 4),
    email_verified_at: new Date()
};

beforeEach(() => {
    vi.resetAllMocks();
});

describe("POST /auth/login", () => {
    it("logs in with valid credentials and returns both tokens", async () => {
        usersRepo.findUserByEmail.mockResolvedValue(verifiedUser);
        refreshRepo.createRefreshToken.mockResolvedValue({});

        const res = await request(app)
            .post("/auth/login")
            .send({ email: "test@example.com", password: PASSWORD });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.refreshToken).toBeDefined();

        const decoded = verifyAccessToken(res.body.accessToken);
        expect(decoded.id).toBe(USER_ID);
        expect(decoded.role).toBe("user");

        // Only the hash of the refresh token is stored, never the token itself
        expect(refreshRepo.createRefreshToken).toHaveBeenCalledWith(
            USER_ID,
            sha256(res.body.refreshToken),
            expect.any(Date)
        );

        expect(JSON.stringify(res.body)).not.toContain("password_hash");
    });

    it("lowercases the email before looking the user up", async () => {
        usersRepo.findUserByEmail.mockResolvedValue(verifiedUser);
        refreshRepo.createRefreshToken.mockResolvedValue({});

        await request(app)
            .post("/auth/login")
            .send({ email: "TEST@Example.com", password: PASSWORD });

        expect(usersRepo.findUserByEmail).toHaveBeenCalledWith("test@example.com");
    });

    it("rejects a wrong password with 401", async () => {
        usersRepo.findUserByEmail.mockResolvedValue(verifiedUser);

        const res = await request(app)
            .post("/auth/login")
            .send({ email: "test@example.com", password: "WrongPassword1" });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Invalid credentials");
        expect(refreshRepo.createRefreshToken).not.toHaveBeenCalled();
    });

    it("returns the same 401 for an unknown email (no user enumeration)", async () => {
        usersRepo.findUserByEmail.mockResolvedValue(undefined);

        const res = await request(app)
            .post("/auth/login")
            .send({ email: "nobody@example.com", password: PASSWORD });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Invalid credentials");
    });

    it("rejects an unverified email with 403", async () => {
        usersRepo.findUserByEmail.mockResolvedValue({
            ...verifiedUser,
            email_verified_at: null
        });

        const res = await request(app)
            .post("/auth/login")
            .send({ email: "test@example.com", password: PASSWORD });

        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/verify your email/i);
    });

    it("returns 422 for an invalid email", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ email: "not-an-email", password: PASSWORD });

        expect(res.status).toBe(422);
        expect(res.body.errors.email).toBeDefined();
        expect(usersRepo.findUserByEmail).not.toHaveBeenCalled();
    });

    it("returns 422 when the password is missing", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ email: "other@example.com" });

        expect(res.status).toBe(422);
        expect(res.body.errors.password).toBeDefined();
    });

    it("returns 422 for unknown fields (strict schema)", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ email: "other@example.com", password: PASSWORD, role: "admin" });

        expect(res.status).toBe(422);
    });
});

describe("POST /auth/register", () => {
    const body = {
        name: "New User",
        email: "new@example.com",
        password: PASSWORD
    };

    it("creates the user and returns a generic message", async () => {
        usersRepo.findUserByEmail.mockResolvedValue(undefined);
        usersRepo.registerUserWithVerification.mockResolvedValue({
            name: body.name,
            email: body.email
        });

        const res = await request(app).post("/auth/register").send(body);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);

        const args = usersRepo.registerUserWithVerification.mock.calls[0];
        expect(args[0]).toBe(body.name);
        expect(args[1]).toBe(body.email);
        // password is hashed, never stored in plain text
        expect(args[2]).not.toBe(PASSWORD);
        expect(bcrypt.compareSync(PASSWORD, args[2])).toBe(true);
    });

    it("returns the same response when the email already exists (no enumeration)", async () => {
        usersRepo.findUserByEmail.mockResolvedValue(verifiedUser);

        const res = await request(app).post("/auth/register").send(body);

        expect(res.status).toBe(201);
        expect(res.body.message).toBe(
            "If that account exists an email has been sent to verify it"
        );
        expect(usersRepo.registerUserWithVerification).not.toHaveBeenCalled();
    });

    it("rejects a short password with 422", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({ ...body, password: "short" });

        expect(res.status).toBe(422);
        expect(res.body.errors.password).toBeDefined();
    });

    it("does not let a client choose its own role", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({ ...body, role: "admin" });

        expect(res.status).toBe(422);
        expect(usersRepo.registerUserWithVerification).not.toHaveBeenCalled();
    });
});

describe("POST /auth/verify-email", () => {
    it("verifies using the hash of the token", async () => {
        usersRepo.verifyEmail.mockResolvedValue(undefined);

        const res = await request(app)
            .post("/auth/verify-email")
            .send({ token: "abc123" });

        expect(res.status).toBe(200);
        expect(usersRepo.verifyEmail).toHaveBeenCalledWith(sha256("abc123"));
    });

    it("returns 422 without a token", async () => {
        const res = await request(app).post("/auth/verify-email").send({});

        expect(res.status).toBe(422);
    });
});

describe("POST /auth/refresh", () => {
    it("rotates the refresh token and returns a new pair", async () => {
        const oldToken = refreshTokenFor();

        usersRepo.findUserById.mockResolvedValue({ id: USER_ID, role: "user" });
        refreshRepo.rotateRefreshToken.mockResolvedValue("rotated");

        const res = await request(app)
            .post("/auth/refresh")
            .send({ refreshToken: oldToken });

        expect(res.status).toBe(200);
        expect(res.body.accessToken).toBeDefined();
        expect(res.body.refreshToken).toBeDefined();
        expect(res.body.refreshToken).not.toBe(oldToken);

        expect(refreshRepo.rotateRefreshToken).toHaveBeenCalledWith(
            sha256(oldToken),
            USER_ID,
            sha256(res.body.refreshToken),
            expect.any(Date)
        );
    });

    it("treats a reused token as theft: 401 and all sessions revoked", async () => {
        usersRepo.findUserById.mockResolvedValue({ id: USER_ID, role: "user" });
        refreshRepo.rotateRefreshToken.mockResolvedValue("missing");

        const res = await request(app)
            .post("/auth/refresh")
            .send({ refreshToken: refreshTokenFor() });

        expect(res.status).toBe(401);
        expect(usersRepo.revokeUserRefreshTokens).toHaveBeenCalledWith(USER_ID);
    });

    it("rejects a garbage token with 401", async () => {
        const res = await request(app)
            .post("/auth/refresh")
            .send({ refreshToken: "not-a-jwt" });

        expect(res.status).toBe(401);
        expect(refreshRepo.rotateRefreshToken).not.toHaveBeenCalled();
    });

    it("rejects an access token used as a refresh token", async () => {
        const accessToken = generateAccessToken({ id: USER_ID, role: "user" });

        const res = await request(app)
            .post("/auth/refresh")
            .send({ refreshToken: accessToken });

        expect(res.status).toBe(401);
    });

    it("returns 422 without a refreshToken", async () => {
        const res = await request(app).post("/auth/refresh").send({});

        expect(res.status).toBe(422);
    });
});

describe("POST /auth/logout", () => {
    it("deletes the stored refresh token", async () => {
        const token = refreshTokenFor();
        refreshRepo.deleteRefreshToken.mockResolvedValue({ id: "row" });

        const res = await request(app)
            .post("/auth/logout")
            .send({ refreshToken: token });

        expect(res.status).toBe(200);
        expect(refreshRepo.deleteRefreshToken).toHaveBeenCalledWith(sha256(token));
    });

    it("returns 401 when the token is not stored", async () => {
        refreshRepo.deleteRefreshToken.mockResolvedValue(undefined);

        const res = await request(app)
            .post("/auth/logout")
            .send({ refreshToken: refreshTokenFor() });

        expect(res.status).toBe(401);
    });
});

describe("POST /auth/forgot-password", () => {
    it("returns the generic message for an unknown email and sends nothing", async () => {
        usersRepo.findUserByEmail.mockResolvedValue(undefined);

        const res = await request(app)
            .post("/auth/forgot-password")
            .send({ email: "nobody@example.com" });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe(
            "If that email exists, a reset link has been sent"
        );
        expect(usersRepo.createPasswordResetToken).not.toHaveBeenCalled();
    });
});
