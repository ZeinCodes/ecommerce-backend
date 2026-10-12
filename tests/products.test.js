import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";

vi.mock("../src/services/products.service.js");

import app from "../src/app.js";
import productsService from "../src/services/products.service.js";
import { adminToken, bearer } from "./helpers/tokens.js";

beforeEach(() => {
    vi.resetAllMocks();
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe("GET /products", () => {
    it("returns products with pagination metadata", async () => {
        productsService.getAllProducts.mockResolvedValue({
            products: [{ id: "p1", name: "Keyboard" }],
            total: 45
        });

        const res = await request(app).get(
            "/products?page=2&limit=20&sortBy=price&order=asc"
        );

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.result).toHaveLength(1);
        expect(res.body.pagination).toEqual({
            page: 2,
            limit: 20,
            total: 45,
            totalPages: 3,
            hasNextPage: true,
            hasPreviousPage: true
        });

        expect(productsService.getAllProducts).toHaveBeenCalledWith(
            2, 20, undefined, undefined, undefined, undefined, "price", "asc"
        );
    });

    it("applies defaults when no query is given", async () => {
        productsService.getAllProducts.mockResolvedValue({ products: [], total: 0 });

        const res = await request(app).get("/products");

        expect(res.status).toBe(200);
        expect(res.body.pagination.hasNextPage).toBe(false);
        expect(productsService.getAllProducts).toHaveBeenCalledWith(
            1, 20, undefined, undefined, undefined, undefined, "created_at", "desc"
        );
    });

    it.each([
        ["an unknown sort column", "sortBy=password"],
        ["a limit above 100", "limit=1000"],
        ["page 0", "page=0"],
        ["an invalid category id", "category_id=abc"],
        ["an unknown query parameter", "hack=1"]
    ])("returns 422 for %s", async (_label, query) => {
        const res = await request(app).get(`/products?${query}`);

        expect(res.status).toBe(422);
        expect(productsService.getAllProducts).not.toHaveBeenCalled();
    });

    it("returns a generic 500 and logs the real error for unexpected failures", async () => {
        const logSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        productsService.getAllProducts.mockRejectedValue(new Error("boom: secret detail"));

        const res = await request(app).get("/products");

        expect(res.status).toBe(500);
        expect(res.body.message).toBe("Internal server error");
        expect(JSON.stringify(res.body)).not.toContain("secret detail");
        expect(logSpy).toHaveBeenCalled();
    });
});

describe("POST /products (validation)", () => {
    const validBody = {
        category_id: "44444444-4444-4444-8444-444444444444",
        name: "Keyboard",
        price: 49.99,
        stock: 10,
        sku: "KB-001"
    };

    it("rejects a price with more than 2 decimal places", async () => {
        const res = await request(app)
            .post("/products")
            .set(bearer(adminToken()))
            .send({ ...validBody, price: 10.999 });

        expect(res.status).toBe(422);
        expect(res.body.errors.price).toMatch(/2 decimal/i);
    });

    it("rejects a negative price", async () => {
        const res = await request(app)
            .post("/products")
            .set(bearer(adminToken()))
            .send({ ...validBody, price: -1 });

        expect(res.status).toBe(422);
    });

    it("rejects unknown fields", async () => {
        const res = await request(app)
            .post("/products")
            .set(bearer(adminToken()))
            .send({ ...validBody, is_admin: true });

        expect(res.status).toBe(422);
    });

    it("accepts a valid body and calls the service", async () => {
        productsService.postProduct.mockResolvedValue({ id: "new", ...validBody });

        const res = await request(app)
            .post("/products")
            .set(bearer(adminToken()))
            .send(validBody);

        expect(res.status).toBe(201);
        expect(productsService.postProduct).toHaveBeenCalledWith(
            validBody.category_id,
            validBody.name,
            undefined,
            validBody.price,
            validBody.stock,
            validBody.sku
        );
    });
});

describe("route parameter validation", () => {
    it.each([
        "/products/not-a-uuid",
        "/categories/123",
        "/products/not-a-uuid/images"
    ])("GET %s returns 422 before touching the database", async (path) => {
        const res = await request(app).get(path);

        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
    });
});
