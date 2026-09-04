# E-commerce API

A RESTful e-commerce backend built with **Node.js, Express.js, and PostgreSQL**.

The API provides authentication, authorization, product and category management, user management, order processing, pagination, filtering, searching, sorting, validation, centralized error handling, database transactions, and API documentation with Scalar/OpenAPI.

---

## Features

* RESTful API architecture
* User authentication with JWT
* Role-based authorization
* User management
* Category management
* Product management
* Order creation and management
* Order ownership protection
* Pagination
* Filtering
* Searching
* Sorting
* Request validation with Zod
* Centralized error handling
* Custom application errors
* PostgreSQL transactions
* Database indexes
* Soft deletion
* Password validation
* Security headers with Helmet
* API documentation with Scalar / OpenAPI

---

## Tech Stack

* **Node.js**
* **Express.js**
* **PostgreSQL**
* **pg** — PostgreSQL client for Node.js
* **Zod** — Request validation
* **JSON Web Token (JWT)** — Authentication
* **bcrypt** — Password hashing
* **Helmet** — HTTP security headers
* **Scalar** — API documentation
* **Nodemon** — Development server

---

## Project Structure

```text
ecommerce/
│
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── schema.sql
│
├── src/
│   ├── config/
│   │   └── swagger.js
│   │
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── routes/
│   ├── middlewares/
│   ├── validators/
│   ├── errors/
│   ├── utils/
│   ├── db/
│   ├── app.js
│   └── server.js
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## Architecture

The application follows a layered architecture:

```text
Client
  ↓
Routes
  ↓
Middleware
  ↓
Controllers
  ↓
Services
  ↓
Repositories
  ↓
PostgreSQL
```

### Routes

Define the API endpoints and the middleware used by each endpoint.

### Middleware

Handles cross-cutting concerns such as:

* Authentication
* Authorization
* Validation
* Error handling
* Security

### Controllers

Handle HTTP requests and responses.

### Services

Contain the application's business logic.

### Repositories

Handle communication with PostgreSQL and execute database queries.

---

## Database

The application uses PostgreSQL.

### Main Tables

```text
users
categories
products
orders
order_items
```

### Relationships

```text
users
  │
  └── orders
          │
          └── order_items
                    │
                    └── products
                              │
                              └── categories
```

The project uses database migrations to manage schema changes.

---

## Installation

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd ecommerce
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the environment file

Create a `.env` file in the project root:

```env
PORT=3000

DATABASE_URL=your_database_url

JWT_SECRET=your_jwt_secret

JWT_EXPIRES_IN=your_expiration
```

Do not commit your `.env` file to Git.

### 4. Create the database

Create a PostgreSQL database and configure the connection using your environment variables.

### 5. Run the migrations

Run the project's database migrations in order.

```text
001_inital_migration.sql
002_add_partial_unique_index_for_user_email.sql
003_add_created_at_and_unique_constraint_to_order_items.sql
004_add_partial_unique_indexes_to_products_and_categories.sql
004_creating_partial_indexies.sql
```

### 6. Start the development server

```bash
npm run dev
```

The API will run on:

```text
http://localhost:3000
```

---

# Authentication

Authentication uses **JWT Bearer tokens**.

### Login

```http
POST /auth/login
```

Request:

```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

Successful response:

```json
{
  "success": true,
  "message": "Welcome Back John",
  "token": "your-jwt-token"
}
```

Use the returned token in protected endpoints:

```http
Authorization: Bearer <token>
```

---

# Authorization

The API supports role-based authorization.

Available roles:

```text
user
admin
```

Administrative operations require an authenticated user with the `admin` role.

---

# API Endpoints

## Authentication

| Method | Endpoint      | Authentication | Description |
| ------ | ------------- | -------------- | ----------- |
| POST   | `/auth/login` | No             | Login       |

## Users

| Method | Endpoint     | Authentication | Description |
| ------ | ------------ | -------------- | ----------- |
| GET    | `/users`     | Admin          | Get users   |
| GET    | `/users/:id` | Admin          | Get user    |
| POST   | `/users`     | Admin          | Create user |
| PATCH  | `/users/:id` | Owner          | Update user |
| DELETE | `/users/:id` | Owner          | Delete user |

## Categories

| Method | Endpoint          | Authentication | Description     |
| ------ | ----------------- | -------------- | --------------- |
| GET    | `/categories`     | No             | Get categories  |
| GET    | `/categories/:id` | No             | Get category    |
| POST   | `/categories`     | Admin          | Create category |
| PATCH  | `/categories/:id` | Admin          | Update category |
| DELETE | `/categories/:id` | Admin          | Delete category |

## Products

| Method | Endpoint        | Authentication | Description    |
| ------ | --------------- | -------------- | -------------- |
| GET    | `/products`     | No             | Get products   |
| GET    | `/products/:id` | No             | Get product    |
| POST   | `/products`     | Admin          | Create product |
| PATCH  | `/products/:id` | Admin          | Update product |
| DELETE | `/products/:id` | Admin          | Delete product |

## Orders

| Method | Endpoint             | Authentication | Description         |
| ------ | -------------------- | -------------- | ------------------- |
| GET    | `/orders`            | Yes            | Get orders          |
| GET    | `/orders/:id`        | Yes            | Get order           |
| GET    | `/orders/:id/items`  | Yes            | Get order items     |
| POST   | `/orders`            | Yes            | Create order        |
| PATCH  | `/orders/:id/status` | Admin          | Update order status |

---

# Pagination

Collection endpoints support pagination.

Example:

```http
GET /products?page=1&limit=20
```

Available parameters include:

```text
page
limit
```

---

# Filtering

Products can be filtered by category and price.

Example:

```http
GET /products?category_id=<category-id>&min_price=10&max_price=100
```

---

# Searching

Products can be searched by name.

Example:

```http
GET /products?name=phone
```

The database uses a PostgreSQL trigram index to improve partial text searches.

---

# Sorting

Products can be sorted by supported fields.

Example:

```http
GET /products?sortBy=price&order=asc
```

Supported sorting fields include:

```text
created_at
name
price
stock
```

---

# Validation

Request validation is handled using **Zod**.

Invalid requests return a validation error containing field-specific messages.

Example:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "email": "Invalid email address",
    "password": "Password must be at least 8 characters"
  }
}
```

---

# Error Handling

The API uses centralized error handling and custom application errors.

Common HTTP status codes:

```text
400  Bad Request
401  Unauthorized
403  Forbidden
404  Not Found
409  Conflict
422  Validation Failed
500  Internal Server Error
```

---

# Database Transactions

Order creation uses a PostgreSQL transaction to ensure that related operations succeed or fail together.

The order creation process includes:

```text
BEGIN
  ↓
Check products
  ↓
Lock products
  ↓
Check stock
  ↓
Create order
  ↓
Create order items
  ↓
Update product stock
  ↓
COMMIT
```

If an operation fails:

```text
ROLLBACK
```

This prevents partially created orders and inconsistent stock.

---

# Security

The API includes several security measures:

* JWT authentication
* Role-based authorization
* Password hashing
* Password validation
* Helmet security headers
* Input validation with Zod
* Ownership checks for protected resources
* Parameterized PostgreSQL queries

---

## API Documentation

The API is documented using **OpenAPI** and displayed through **Scalar**.

Once the server is running, open the interactive docs at:

```text
https://ecommerce-backend-6bcwy5xbo-24lights.vercel.app/api-reference
```

Or view the raw OpenAPI specification (JSON) at:

```text
https://ecommerce-backend-6bcwy5xbo-24lights.vercel.app/openapi.json
```

The documentation lets you browse all available endpoints, view request/response schemas, and send live test requests directly from the browser.
---

# Development

Start the development server:

```bash
npm run dev
```

The project uses Nodemon to automatically restart the server when files change.

---

# Future Improvements

Possible future improvements include:

* Automated tests
* Production deployment
* Refresh tokens
* Rate limiting
* Advanced logging
* CI/CD
* Production database configuration
* Docker support

---

## Author

**Zein**

Backend / Software Engineering Project
