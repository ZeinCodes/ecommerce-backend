import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import * as authService from "../src/services/auth.service.js";
import UnauthorizedError from "../src/errors/UnauthorizedError.js";
import ForbiddenError from "../src/errors/ForbiddenError.js";

vi.mock("../src/services/auth.service.js", () => ({
    login: vi.fn(),
    register: vi.fn(),
    verifyEmail: vi.fn(),
    resendVerification: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn()
}));

describe("POST /auth/login", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("logs in with valid credentials and returns both tokens", async () => {
        authService.login.mockResolvedValue({
            accessToken: "access-token",
            refreshToken: "refresh-token",
            user: { id: "u1", name: "John", email: "john@example.com", role: "user" }
        });

        const response = await request(app)
            .post("/auth/login")
            .send({ email: "John@Example.com", password: "Password123" });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("Welcome Back John");
        expect(response.body.accessToken).toBe("access-token");
        expect(response.body.refreshToken).toBe("refresh-token");

        // The validator lowercases the email before it reaches the service
        expect(authService.login).toHaveBeenCalledWith(
            "john@example.com",
            "Password123"
        );
    });

    it("returns 401 for invalid credentials", async () => {
        authService.login.mockRejectedValue(
            new UnauthorizedError("Invalid credentials")
        );

        const response = await request(app)
            .post("/auth/login")
            .send({ email: "wrong@example.com", password: "WrongPass123" });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Invalid credentials");
    });

    it("returns 403 when the email is not verified", async () => {
        authService.login.mockRejectedValue(
            new ForbiddenError("Please verify your email first")
        );

        const response = await request(app)
            .post("/auth/login")
            .send({ email: "unverified@example.com", password: "Password123" });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe("Please verify your email first");
    });

    it("returns 422 for an invalid email and does not call the service", async () => {
        const response = await request(app)
            .post("/auth/login")
            .send({ email: "not-an-email", password: "Password123" });

        expect(response.status).toBe(422);
        expect(response.body.success).toBe(false);
        expect(response.body.errors.email).toBeDefined();
        expect(authService.login).not.toHaveBeenCalled();
    });

    it("returns 422 when unknown fields are sent", async () => {
        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "extra@example.com",
                password: "Password123",
                role: "admin"
            });

        expect(response.status).toBe(422);
        expect(authService.login).not.toHaveBeenCalled();
    });

    it("returns 400 for a malformed JSON body", async () => {
        const response = await request(app)
            .post("/auth/login")
            .set("Content-Type", "application/json")
            .send("{ this is not json");

        expect(response.status).toBe(400);
        expect(response.body.message).toBe("Invalid JSON body");
    });

    it("returns 413 when the body is larger than the limit", async () => {
        const response = await request(app)
            .post("/auth/login")
            .set("Content-Type", "application/json")
            .send(JSON.stringify({ email: "a".repeat(200 * 1024) }));

        expect(response.status).toBe(413);
    });
});

describe("POST /auth/register", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 201 with a generic message", async () => {
        authService.register.mockResolvedValue(undefined);

        const response = await request(app)
            .post("/auth/register")
            .send({
                name: "John Doe",
                email: "New@Example.com",
                password: "Password123"
            });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(authService.register).toHaveBeenCalledWith(
            "John Doe",
            "new@example.com",
            "Password123"
        );
    });

    it("returns 422 for a short password", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({
                name: "John Doe",
                email: "short@example.com",
                password: "123"
            });

        expect(response.status).toBe(422);
        expect(response.body.errors.password).toBeDefined();
        expect(authService.register).not.toHaveBeenCalled();
    });

    it("returns 422 when a role is sent (no privilege escalation)", async () => {
        const response = await request(app)
            .post("/auth/register")
            .send({
                name: "Evil User",
                email: "evil@example.com",
                password: "Password123",
                role: "admin"
            });

        expect(response.status).toBe(422);
        expect(authService.register).not.toHaveBeenCalled();
    });
});

describe("POST /auth/refresh and /auth/logout", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("refresh returns new tokens", async () => {
        authService.refresh.mockResolvedValue({
            accessToken: "new-access",
            refreshToken: "new-refresh"
        });

        const response = await request(app)
            .post("/auth/refresh")
            .send({ refreshToken: "old-refresh" });

        expect(response.status).toBe(200);
        expect(response.body.accessToken).toBe("new-access");
        expect(response.body.refreshToken).toBe("new-refresh");
        expect(authService.refresh).toHaveBeenCalledWith("old-refresh");
    });

    it("refresh returns 401 for a rejected token", async () => {
        authService.refresh.mockRejectedValue(
            new UnauthorizedError("Invalid refresh token")
        );

        const response = await request(app)
            .post("/auth/refresh")
            .send({ refreshToken: "reused-token" });

        expect(response.status).toBe(401);
    });

    it("refresh returns 422 when refreshToken is missing", async () => {
        const response = await request(app)
            .post("/auth/refresh")
            .send({});

        expect(response.status).toBe(422);
        expect(response.body.errors.refreshToken).toBeDefined();
    });

    it("logout returns 200", async () => {
        authService.logout.mockResolvedValue({});

        const response = await request(app)
            .post("/auth/logout")
            .send({ refreshToken: "some-refresh-token" });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Successfully logged out");
    });
});

describe("email verification and password reset", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("verify-email returns 200 without a result field", async () => {
        authService.verifyEmail.mockResolvedValue(undefined);

        const response = await request(app)
            .post("/auth/verify-email")
            .send({ token: "verification-token" });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body).not.toHaveProperty("result");
    });

    it("forgot-password always answers with the same generic message", async () => {
        authService.forgotPassword.mockResolvedValue(undefined);

        const response = await request(app)
            .post("/auth/forgot-password")
            .send({ email: "anyone@example.com" });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(
            "If that email exists, a reset link has been sent"
        );
    });
});
