CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_products_category_id_active
ON products(category_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_products_name_trgm
ON products
USING GIN (name gin_trgm_ops);