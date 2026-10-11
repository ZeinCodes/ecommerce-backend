import express from "express";

import helmet from "helmet";
import cors from "cors";

import swaggerSpec from "./config/swagger.js";

import { apiReference } from "@scalar/express-api-reference";

import usersRouter from "./routes/users.routes.js";
import authRouter from "./routes/auth.routes.js";
import categoriesRouter from "./routes/categories.routes.js";
import productsRouter from "./routes/products.routes.js";
import cartRouter from "./routes/cart.routes.js";
import ordersRouter from "./routes/orders.routes.js";
import addressesRouter from "./routes/addresses.routes.js";
import productReviewsRouter from "./routes/product-reviews.routes.js";
import wishlistRouter from "./routes/wishlist.routes.js";

import errorHandler from "./middlewares/errorHandler.js";
import { generalLimiter } from "./middlewares/rateLimiter.js";

const app = express();

app.set("trust proxy", 1);

// Strict default headers for the API itself.
const apiHelmet = helmet();

// The API reference page (Scalar) needs a looser CSP, so it only applies there.
const docsHelmet = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
            connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
            workerSrc: ["'self'", "blob:"]
        }
    }
});

app.use((req, res, next) => {
    if (req.path.startsWith("/api-reference")) {
        return docsHelmet(req, res, next);
    }

    return apiHelmet(req, res, next);
});

// Comma-separated list of allowed origins, e.g. "https://shop.example.com,http://localhost:5173".
// If CORS_ORIGIN is not set, cross-origin browser requests are not allowed.
const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins.length > 0 ? allowedOrigins : false
    })
);

app.get("/health", (req, res) => {
    res.status(200).json({ success: true, status: "ok" });
});

app.use(generalLimiter);

app.use(express.json({ limit: "100kb" }));

app.use(authRouter);
app.use(usersRouter);
app.use(categoriesRouter);
app.use(productsRouter);
app.use(cartRouter);
app.use(ordersRouter);
app.use(addressesRouter);
app.use(productReviewsRouter);
app.use(wishlistRouter);

app.get("/openapi.json", (req, res) => {
    res.json(swaggerSpec);
});

app.use(
    "/api-reference",
    apiReference({
        spec: {
            url: "/openapi.json"
        }
    })
);

app.use(errorHandler);

export default app;
