CREATE TABLE addresses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id),
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX adresses_user_idx 
ON addresses (user_id)
WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX adresses_one_default_per_user 
ON addresses (user_id)
WHERE is_default = TRUE AND deleted_at IS NULL;

ALTER TABLE orders
ADD COLUMN shipping_address_id uuid REFERENCES addresses(id),
ADD COLUMN shipping_address JSONB;