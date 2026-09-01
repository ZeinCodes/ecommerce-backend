-- =============================
-- Fix database schema
-- =============================

-- ==========================================
-- 1. Remove redundant product category index
-- ==========================================
-- Migration 001 created a normal index on category_id.
-- Migration 005 added a more appropriate partial index
-- for active products.
DROP INDEX IF EXISTS idx_products_category_id;


-- ==========================================
-- 2. Change timestamps to TIMESTAMPTZ
-- ==========================================
-- TIMESTAMPTZ is preferable for APIs because it
-- represents an absolute point in time correctly
-- across different time zones.

ALTER TABLE users
    ALTER COLUMN created_at TYPE TIMESTAMPTZ
        USING created_at AT TIME ZONE 'UTC',
    ALTER COLUMN updated_at TYPE TIMESTAMPTZ
        USING updated_at AT TIME ZONE 'UTC',
    ALTER COLUMN deleted_at TYPE TIMESTAMPTZ
        USING deleted_at AT TIME ZONE 'UTC';


ALTER TABLE categories
    ALTER COLUMN created_at TYPE TIMESTAMPTZ
        USING created_at AT TIME ZONE 'UTC',
    ALTER COLUMN updated_at TYPE TIMESTAMPTZ
        USING updated_at AT TIME ZONE 'UTC',
    ALTER COLUMN deleted_at TYPE TIMESTAMPTZ
        USING deleted_at AT TIME ZONE 'UTC';


ALTER TABLE products
    ALTER COLUMN created_at TYPE TIMESTAMPTZ
        USING created_at AT TIME ZONE 'UTC',
    ALTER COLUMN updated_at TYPE TIMESTAMPTZ
        USING updated_at AT TIME ZONE 'UTC',
    ALTER COLUMN deleted_at TYPE TIMESTAMPTZ
        USING deleted_at AT TIME ZONE 'UTC';


ALTER TABLE orders
    ALTER COLUMN created_at TYPE TIMESTAMPTZ
        USING created_at AT TIME ZONE 'UTC',
    ALTER COLUMN updated_at TYPE TIMESTAMPTZ
        USING updated_at AT TIME ZONE 'UTC',
    ALTER COLUMN deleted_at TYPE TIMESTAMPTZ
        USING deleted_at AT TIME ZONE 'UTC';


ALTER TABLE order_items
    ALTER COLUMN created_at TYPE TIMESTAMPTZ
        USING created_at AT TIME ZONE 'UTC';


-- ==========================================
-- 3. Prevent negative order totals
-- ==========================================
ALTER TABLE orders
ADD CONSTRAINT orders_total_price_non_negative
CHECK (total_price >= 0);