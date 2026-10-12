import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

vi.mock("../src/services/orders.service.js");

import app from "../src/app.js";
import ordersService from "../src/services/orders.service.js";
import {
    USER_ID,
    SOME_ID,
    userToken,
    adminToken,
    bearer
} from "./helpers/tokens.js";

beforeEach(() => {
    vi.resetAllMocks();
});

describe("POST /orders", () => {
    it("passes the chosen address_id to the service", async () => {
        ordersService.createOrder.mockResolvedValue({ id: "order-1" });

        const res = await request(app)
            .post("/orders")
            .set(bearer(userToken()))
            .send({ address_id: SOME_ID });

        expect(res.status).toBe(201);
        expect(ordersService.createOrder).toHaveBeenCalledWith(USER_ID, SOME_ID);
    });

    it("works without a body (falls back to the default address)", async () => {
        ordersService.createOrder.mockResolvedValue({ id: "order-1" });

        const res = await request(app)
            .post("/orders")
            .set(bearer(userToken()));

        expect(res.status).toBe(201);
        expect(ordersService.createOrder).toHaveBeenCalledWith(USER_ID, undefined);
    });

    it("rejects an invalid address_id with 422", async () => {
        const res = await request(app)
            .post("/orders")
            .set(bearer(userToken()))
            .send({ address_id: "abc" });

        expect(res.status).toBe(422);
        expect(ordersService.createOrder).not.toHaveBeenCalled();
    });

    it("rejects unknown fields (e.g. a client-supplied total)", async () => {
        const res = await request(app)
            .post("/orders")
            .set(bearer(userToken()))
            .send({ total_price: 0.01 });

        expect(res.status).toBe(422);
    });
});

describe("PATCH /orders/:id/status", () => {
    it("rejects an invalid status for an admin", async () => {
        const res = await request(app)
            .patch(`/orders/${SOME_ID}/status`)
            .set(bearer(adminToken()))
            .send({ status: "teleported" });

        expect(res.status).toBe(422);
    });

    it("lets an admin update the status", async () => {
        ordersService.updateOrderStatus.mockResolvedValue({ id: SOME_ID, status: "shipped" });

        const res = await request(app)
            .patch(`/orders/${SOME_ID}/status`)
            .set(bearer(adminToken()))
            .send({ status: "shipped" });

        expect(res.status).toBe(200);
        expect(ordersService.updateOrderStatus).toHaveBeenCalledWith(SOME_ID, "shipped");
    });
});

describe("GET /orders/:id", () => {
    it("returns 422 for a malformed order id", async () => {
        const res = await request(app)
            .get("/orders/not-a-uuid")
            .set(bearer(userToken()));

        expect(res.status).toBe(422);
    });
});
