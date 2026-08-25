ALTER TABLE categories
DROP CONSTRAINT categories_name_key;

CREATE UNIQUE INDEX categories_name_unique_active
ON categories(name)
WHERE deleted_at IS NULL;

ALTER TABLE products
DROP CONSTRAINT products_sku_key;

CREATE UNIQUE INDEX products_sku_unique_active
ON products(sku)
WHERE deleted_at IS NULL;