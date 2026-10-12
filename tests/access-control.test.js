import { describe, it, expect } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../src/app.js";
import {
    USER_ID,
    OTHER_USER_ID,
    SOME_ID,
    userToken,
    adminToken,
    refreshTokenFor,
    bearer
} from "./helpers/tokens.js";

describe("authentication", () => {
    const protectedRoutes = [
        ["get", "/cart"],
        ["post", "/cart/items"],
        ["get", "/orders"],
        ["post", "/orders"],
        ["get", "/wishlist"],
        ["get", "/users"]
    ];

    it.each(protectedRoutes)(
        "%s %s returns 401 without a token",
        async (method, path) => {
            const res = await request(app)[method](path);

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        }
    );

    it("rejects a malformed Authorization header", async () => {
        const res = await request(app)
            .get("/cart")
            .set("Authorization", "Token abc");

        expect(res.status).toBe(401);
    });

    it("rejects a random token", async () => {
        const res = await request(app)
            .get("/cart")
            .set(bearer("not.a.jwt"));

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Invalid or expired token");
    });

    it("rejects an expired access token", async () => {
        const expired = jwt.sign(
            { id: USER_ID, role: "user", type: "access" },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: -10 }
        );

        const res = await request(app).get("/cart").set(bearer(expired));

        expect(res.status).toBe(401);
    });

    it("rejects a refresh token used as an access token", async () => {
        const res = await request(app)
            .get("/cart")
            .set(bearer(refreshTokenFor()));

        expect(res.status).toBe(401);
    });

    it("rejects an access-style token signed with the wrong secret", async () => {
        const forged = jwt.sign(
            { id: USER_ID, role: "admin", type: "access" },
            "some-other-secret"
        );

        const res = await request(app).get("/users").set(bearer(forged));

        expect(res.status).toBe(401);
    });
});

describe("authorization", () => {
    it("blocks a normal user from the admin user list", async () => {
        const res = await request(app).get("/users").set(bearer(userToken()));

        expect(res.status).toBe(403);
    });

    it("blocks a normal user from creating products", async () => {
        const res = await request(app)
            .post("/products")
            .set(bearer(userToken()))
            .send({});

        expect(res.status).toBe(403);
    });

    it("blocks a normal user from creating categories", async () => {
        const res = await request(app)
            .post("/categories")
            .set(bearer(userToken()))
            .send({ name: "Books" });

        expect(res.status).toBe(403);
    });

    it("blocks a normal user from deleting products", async () => {
        const res = await request(app)
            .delete(`/products/${SOME_ID}`)
            .set(bearer(userToken()));

        expect(res.status).toBe(403);
    });

    it("blocks a normal user from changing an order status", async () => {
        const res = await request(app)
            .patch(`/orders/${SOME_ID}/status`)
            .set(bearer(userToken()))
            .send({ status: "shipped" });

        expect(res.status).toBe(403);
    });

    it("lets an admin past authorization (fails later on validation, not 401/403)", async () => {
        const res = await request(app)
            .post("/products")
            .set(bearer(adminToken()))
            .send({});

        expect(res.status).toBe(422);
    });

    it("blocks a user from reading another user's profile", async () => {
        const res = await request(app)
            .get(`/users/${OTHER_USER_ID}`)
            .set(bearer(userToken()));

        expect(res.status).toBe(403);
    });

    it("blocks a user from deleting another user's account", async () => {
        const res = await request(app)
            .delete(`/users/${OTHER_USER_ID}`)
            .set(bearer(userToken()));

        expect(res.status).toBe(403);
    });
});
