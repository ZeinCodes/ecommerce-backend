import { describe, it, expect } from "vitest";
import request from "supertest";

import app from "../src/app.js";

describe("app basics", () => {
    it("GET /health returns ok", async () => {
        const res = await request(app).get("/health");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true, status: "ok" });
    });

    it("GET /openapi.json serves the generated spec", async () => {
        const res = await request(app).get("/openapi.json");

        expect(res.status).toBe(200);
        expect(res.body.openapi).toBe("3.0.0");
        expect(Object.keys(res.body.paths).length).toBeGreaterThan(0);
    });

    it("returns 400 for malformed JSON", async () => {
        const res = await request(app)
            .post("/auth/forgot-password")
            .set("Content-Type", "application/json")
            .send("{ this is not json");

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid JSON body");
    });

    it("returns 413 for a body over the size limit", async () => {
        const res = await request(app)
            .post("/auth/forgot-password")
            .send({ email: "a@example.com", padding: "x".repeat(200 * 1024) });

        expect(res.status).toBe(413);
    });
});

describe("security headers", () => {
    it("sets helmet headers and hides x-powered-by", async () => {
        const res = await request(app).get("/health");

        expect(res.headers["x-powered-by"]).toBeUndefined();
        expect(res.headers["x-content-type-options"]).toBe("nosniff");
    });

    it("keeps the strict CSP on the API", async () => {
        const res = await request(app).get("/health");

        const csp = res.headers["content-security-policy"];

        expect(csp).toBeDefined();
        expect(csp).not.toContain("cdn.jsdelivr.net");

        // helmet's default allows inline styles, but scripts must stay strict
        const scriptSrc = csp.match(/script-src ([^;]*)/)[1];
        expect(scriptSrc).not.toContain("unsafe-inline");
    });

    it("uses the relaxed CSP only on /api-reference", async () => {
        const res = await request(app).get("/api-reference");

        expect(res.headers["content-security-policy"]).toContain("cdn.jsdelivr.net");
    });

    it("does not send CORS headers when CORS_ORIGIN is not configured", async () => {
        const res = await request(app)
            .get("/health")
            .set("Origin", "https://evil.example.com");

        expect(res.headers["access-control-allow-origin"]).toBeUndefined();
    });
});