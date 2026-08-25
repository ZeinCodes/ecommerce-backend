ALTER TABLE order_items
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE order_items
ADD CONSTRAINT unique_order_product
UNIQUE (order_id, product_id);