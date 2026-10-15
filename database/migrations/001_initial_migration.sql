-- =============================
-- E-commerce database schema
-- PostgreSQL
-- =============================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- ===========================
-- Users
-- ===========================
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role in ('user', 'admin')) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,    
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
-- ===========================
-- Categories
-- ===========================
CREATE TABLE categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,    
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);
-- ===========================
-- Products
-- ===========================
CREATE TABLE products (
    id uuid PRIMARY KEY default gen_random_uuid(),
    category_id uuid NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) CHECK(price >= 0) NOT NULL,
    stock INT CHECK(stock >= 0) NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,    
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT fk_products_category
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE RESTRICT
);
-- ===========================
-- Orders
-- ===========================
CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status in (
        'pending',
        'processing',          
        'shipped',          
        'delivered',          
        'cancelled'   
    )),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,    
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT fk_orders_users
    FOREIGN KEY (user_id)
    REFERENCES users(id) 
    ON DELETE RESTRICT 
);
-- ===========================
-- Order_Items
-- ===========================
CREATE TABLE order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity INT CHECK(quantity > 0) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,

    CONSTRAINT fk_order_items_orders
    FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_order_items_products
    FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE RESTRICT
);
-- ===========================
-- Foreign KEY indexes
-- ===========================
CREATE INDEX idx_products_category_id
ON products(category_id);

CREATE INDEX idx_orders_user_id
ON orders(user_id);

CREATE INDEX idx_order_items_order_id
ON order_items(order_id);

CREATE INDEX idx_order_items_product_id
ON order_items(product_id);