# E-commerce API

[![Backend Tests](https://github.com/ZeinCodes/ecommerce-backend/actions/workflows/tests.yml/badge.svg)](https://github.com/ZeinCodes/ecommerce-backend/actions/workflows/tests.yml)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)

A production-minded REST API for an online store, built with **Node.js, Express 5 and PostgreSQL**. It covers the full shopping flow: accounts with email verification, a product catalog with images, carts, transactional order placement, reviews, wishlists and admin tools.

**Live API reference:** <https://ecommerce-backend-six-chi.vercel.app/api-reference)> <!-- TODO: replace with your deployed URL -->

<img width="1891" height="906" alt="Screenshot" src="https://github.com/user-attachments/assets/b3860207-14a1-4eeb-95bb-4c61095f4dc1" />
---

## Table of contents

- [Highlights](#highlights)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API overview](#api-overview)
- [Example requests](#example-requests)
- [Testing and CI](#testing-and-ci)
- [Design decisions](#design-decisions)
- [Deployment](#deployment)
- [Project structure](#project-structure)

---

## Highlights

**Authentication and accounts**
- Register, log in and log out with JWT access tokens (15 minutes) and rotating refresh tokens (30 days).
- Refresh, email verification and password reset tokens are stored as hashes, never in plain text.
- Email verification is required before login; emails are sent through Resend.
- Role-based access control (`user`, `admin`) plus ownership checks, so users can only touch their own data.

**Shopping**
- Products and categories with pagination, search, price filtering and sorting.
- Product images uploaded to Cloudinary (JPEG, PNG or WebP, up to 5 MB each, 3 per upload).
- Cart, saved shipping addresses, wishlist and product reviews.
- Orders with a price breakdown (subtotal, tax, shipping) and an admin-managed status lifecycle.

**Engineering**
- Layered architecture: routes, controllers, services and repositories.
- Request validation with Zod (strict schemas reject unknown fields).
- Centralized error handling with custom error classes and sanitized 500 responses.
- Security: Helmet, a CORS allowlist, per-route rate limiting, a 100 kb body limit and bcrypt password hashing.
- Soft deletion, database indexes and 17 versioned SQL migrations.
- Graceful shutdown, a `/health` endpoint and a scheduled cleanup of expired tokens.
- Interactive API documentation generated from OpenAPI annotations (Scalar).
- Automated tests running in CI on every push and pull request.

---

## Tech stack

| Area | Technology |
| --- | --- |
| Runtime and framework | Node.js, Express 5 |
| Database | PostgreSQL (`pg`) |
| Validation | Zod |
| Authentication | JSON Web Tokens, bcrypt |
| Security | Helmet, CORS, express-rate-limit |
| File uploads | Multer and Cloudinary |
| Email | Resend |
| API docs | swagger-jsdoc and Scalar (OpenAPI 3) |
| Testing | Vitest and Supertest |
| CI | GitHub Actions |

---

## Architecture

Each request flows through a fixed set of layers, and each layer has a single job.

```text
Client
  │
  ▼
Routes          endpoints, rate limiting, auth and validation middleware
  │
  ▼
Controllers     translate HTTP requests into service calls and responses
  │
  ▼
Services        business rules (stock checks, ownership, token flows)
  │
  ▼
Repositories    SQL queries and transactions
  │
  ▼
PostgreSQL
```

---

## Getting started

### Prerequisites

- Node.js 22 or newer
- PostgreSQL (with the `psql` command available on your path)
- Optional for full functionality: a [Cloudinary](https://cloudinary.com) account (images) and a [Resend](https://resend.com) account (emails)

### 1. Clone and install

```bash
git clone https://github.com/ZeinCodes/ecommerce-backend.git
cd ecommerce-backend
npm install
```

### 2. Configure the environment

```bash
cp .env.example .env
```

Fill in the values (see [Environment variables](#environment-variables)). Generate strong JWT secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Create the database

Create an empty database, point `DB_URL` at it (the same value you put in `.env`), then apply the migrations in order:

```bash
createdb ecommerce
export DB_URL="postgres://user:password@localhost:5432/ecommerce"

for file in database/migrations/*.sql; do
  psql "$DB_URL" -f "$file"
done
```

`database/schema.sql` contains the full resulting schema if you prefer a single file.

**Optional, development only:** load sample users, categories and products.

```bash
psql "$DB_URL" -f database/seeds/001_users.sql
psql "$DB_URL" -f database/seeds/002_categories.sql
psql "$DB_URL" -f database/seeds/003_products.sql
```

> Never run the seed files against a production database. They create a sample admin account.

### 4. Run the server

```bash
npm run dev     # development, restarts on file changes
npm start       # production
```

The API runs at `http://localhost:3000` and the interactive documentation at `http://localhost:3000/api-reference`.

### Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the server with nodemon |
| `npm start` | Start the server |
| `npm test` / `npm run test:run` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |

---

## Environment variables

The server refuses to start if a required variable is missing.

| Variable | Required | Description |
| --- | --- | --- |
| `DB_URL` | Always | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Always | Secret used to sign access tokens |
| `JWT_REFRESH_SECRET` | Always | Secret used to sign refresh tokens (use a different value) |
| `FRONTEND_URL` | Production | Base URL used in verification and reset email links |
| `MAIL_FROM` | Production | Sender address for outgoing email |
| `RESEND_API_KEY` | Production | Resend API key |
| `CLOUDINARY_CLOUD_NAME` | Production | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Production | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Production | Cloudinary API secret |
| `CORS_ORIGIN` | Production | Comma-separated list of allowed browser origins |
| `NODE_ENV` | Optional | Set to `production` to enforce the production requirements and strict database TLS |
| `PORT` | Optional | Port to listen on (default `3000`) |
| `DB_CA_CERT` | Optional | CA certificate for databases that require a custom certificate |

---

## API overview

Interactive documentation with request and response schemas is served at **`/api-reference`**, and the raw OpenAPI document at **`/openapi.json`**.

**Access levels:** *Public* needs no token. *User* needs a valid access token (`Authorization: Bearer <token>`). *Owner* means the resource owner or an admin. *Admin* means admin only.

### Auth

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Create an account and send a verification email |
| POST | `/auth/verify-email` | Public | Verify an email address with a token |
| POST | `/auth/resend-verification` | Public | Send a new verification email |
| POST | `/auth/login` | Public | Log in and receive access and refresh tokens |
| POST | `/auth/refresh` | Public | Exchange a refresh token for a new token pair |
| POST | `/auth/logout` | Public | Revoke a refresh token |
| POST | `/auth/forgot-password` | Public | Request a password reset email |
| POST | `/auth/reset-password` | Public | Set a new password with a reset token |

### Users

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/users` | Admin | List users (paginated) |
| POST | `/users` | Admin | Create a user |
| GET | `/users/:id` | Owner | Get a user |
| PATCH | `/users/:id` | Owner | Update a user |
| DELETE | `/users/:id` | Owner | Delete a user |

### Categories

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/categories` | Public | List categories (pagination, `name` filter) |
| GET | `/categories/:id` | Public | Get a category |
| POST | `/categories` | Admin | Create a category |
| PATCH | `/categories/:id` | Admin | Update a category |
| DELETE | `/categories/:id` | Admin | Delete a category |

### Products

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/products` | Public | List products. Query: `page`, `limit`, `name`, `category_id`, `min_price`, `max_price`, `sortBy` (`created_at`, `name`, `price`, `stock`), `order` (`asc`, `desc`) |
| GET | `/products/:id` | Public | Get a product |
| POST | `/products` | Admin | Create a product |
| PATCH | `/products/:id` | Admin | Update a product |
| DELETE | `/products/:id` | Admin | Delete a product |
| GET | `/products/:productId/images` | Public | List product images |
| POST | `/products/:productId/images` | Admin | Upload up to 3 images (`multipart/form-data`, field `images`) |
| DELETE | `/products/:productId/images/:imageId` | Admin | Delete an image |

### Reviews

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/products/:productId/reviews` | Public | List reviews for a product (paginated) |
| GET | `/products/:productId/reviews/:reviewId` | Public | Get a review |
| POST | `/products/:productId/reviews` | User | Write a review |
| PATCH | `/products/:productId/reviews/:reviewId` | User | Edit a review |
| DELETE | `/products/:productId/reviews/:reviewId` | User | Delete a review |

### Cart, wishlist and addresses

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/cart` | User | Get the current cart |
| POST | `/cart/items` | User | Add a product to the cart |
| PATCH | `/cart/items/:id` | User | Change an item quantity |
| DELETE | `/cart/items/:id` | User | Remove an item |
| GET | `/wishlist` | User | List wishlist items |
| POST | `/wishlist/:productId` | User | Add a product to the wishlist |
| DELETE | `/wishlist/:productId` | User | Remove a product from the wishlist |
| GET | `/addresses` | User | List saved addresses |
| GET | `/addresses/:id` | User | Get an address |
| POST | `/addresses` | User | Create an address |
| PATCH | `/addresses/:id` | User | Update an address |
| DELETE | `/addresses/:id` | User | Delete an address |

### Orders

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/orders` | User | Place an order from the current cart |
| GET | `/orders` | User | List your orders (admins see all orders) |
| GET | `/orders/:id` | User | Get an order |
| GET | `/orders/:id/items` | User | List the items in an order |
| PATCH | `/orders/:id/status` | Admin | Set status: `pending`, `processing`, `shipped`, `delivered` or `cancelled` |

### Utility

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/health` | Public | Health check |
| GET | `/openapi.json` | Public | OpenAPI document |
| GET | `/api-reference` | Public | Interactive API documentation |

---

## Example requests

**Register, then log in** (verify your email first; login is blocked until you do):

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe", "email": "jane@example.com", "password": "a-strong-password"}'

curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jane@example.com", "password": "a-strong-password"}'
```

**Browse products:**

```bash
curl "http://localhost:3000/products?name=shirt&min_price=10&max_price=50&sortBy=price&order=asc&limit=10"
```

**Add to cart and place an order** (replace `$TOKEN` with your access token):

```bash
curl -X POST http://localhost:3000/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": "<product-uuid>", "quantity": 2}'

curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"address_id": "<address-uuid>"}'
```

Errors use a consistent shape:

```json
{
  "success": false,
  "message": "Human-readable description of what went wrong",
  "errors": []
}
```

---

## Testing and CI

```bash
npm test
```

The suite uses Vitest and Supertest and covers authentication flows, route-level access control (public, user, owner and admin), product and order endpoints, and core app behavior such as health checks, the OpenAPI document and malformed input. Tests run against the Express app with mocked services, so they need **no database or external services**.

GitHub Actions runs the suite on every push and pull request to `main` (see [`.github/workflows/tests.yml`](.github/workflows/tests.yml)).

---

## Design decisions

- **Orders are transactional.** Placing an order locks the cart and product rows, checks stock, snapshots prices and the shipping address, decrements stock, creates the order and clears the cart in a single transaction, so concurrent checkouts cannot oversell. Cancelling an order restores stock.
- **Money is calculated in cents** and converted at the end, which avoids floating-point rounding errors. Tax (10%) and flat shipping are defined in `src/config/orderPricing.js`.
- **Refresh tokens rotate.** Each refresh issues a new token and invalidates the old one. Only hashes are stored, and a six-hour job removes expired and used tokens.
- **Login is protected twice.** One limiter works per IP and another per email address, with successful logins not counted, which slows credential stuffing without locking out real users.
- **Safe error responses.** Known errors return clear messages; database constraint violations map to 400, 404 or 409; anything unexpected is logged server-side and returns a generic 500.
- **Soft deletion** keeps historical data such as past orders intact.
- **Strict validation.** Zod schemas reject unknown fields, so clients cannot sneak extra data into updates.

---

## Deployment

The project is configured for Vercel: `api/index.js` exports the Express app and `vercel.json` routes all requests to it. It also runs as a normal Node.js server (`npm start`) on any host that provides a PostgreSQL database.

Deployment checklist:

1. Set every variable from the [environment table](#environment-variables) in your host's dashboard, with `NODE_ENV=production` and new, random JWT secrets.
2. Apply the migrations to the production database. Do not run the seed files.
3. Create your admin account manually.
4. Check `/health` and `/api-reference` on the deployed URL.
5. On serverless platforms, the in-process token cleanup job does not run. Trigger `cleanupExpiredTokens` from a scheduled job instead. Rate limits are kept in memory per instance, so use a shared store such as Redis if you need global limits.

---

## Project structure

```text
.
├── .github/workflows/     CI pipeline
├── api/                   Serverless entry point
├── database/
│   ├── migrations/        Versioned SQL migrations (001-017)
│   ├── seeds/             Sample data for development
│   └── schema.sql         Full schema
├── src/
│   ├── config/            Swagger, Cloudinary, order pricing
│   ├── controllers/       HTTP layer
│   ├── services/          Business logic
│   ├── repositories/      SQL queries and transactions
│   ├── routes/            Endpoints with OpenAPI annotations
│   ├── middlewares/       Auth, rate limiting, validation, errors, uploads
│   ├── validators/        Zod schemas
│   ├── errors/            Custom error classes
│   ├── jobs/              Scheduled token cleanup
│   ├── db/                PostgreSQL pool
│   ├── utils/             JWT helpers
│   ├── app.js             Express app
│   └── server.js          Startup, env validation, graceful shutdown
├── tests/                 Vitest and Supertest suites
├── vercel.json
└── package.json
```

---

## Author

Built by [ZeinCodes](https://github.com/ZeinCodes).
