import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("POST /auth/login", () => {
    it("should login with valid credentials", async () => {
        const response = await request(app)
            .post("/auth/login")
            .send({
                email: "hadimosta@gmail.com",
                password: "hadiaust"
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.token).toBeDefined();
    });
});