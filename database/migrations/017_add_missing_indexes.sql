-- =============================
-- Add missing indexes
-- =============================
CREATE INDEX idx_product_images_product_id
ON product_images (product_id);

CREATE INDEX idx_cart_items_product_active
ON cart_items (product_id)
WHERE deleted_at IS NULL;

CREATE INDEX idx_refresh_tokens_user_id
ON refresh_tokens (user_id);

CREATE INDEX idx_refresh_tokens_expires_at
ON refresh_tokens (expires_at);

CREATE INDEX idx_password_reset_tokens_user_unused
ON password_reset_tokens (user_id)
WHERE used_at IS NULL;

CREATE INDEX idx_email_verification_tokens_user_unused
ON email_verification_tokens (user_id)
WHERE used_at IS NULL;

CREATE INDEX idx_orders_user_active_created
ON orders (user_id, created_at DESC, id DESC)
WHERE deleted_at IS NULL;

CREATE INDEX idx_orders_active_created
ON orders (created_at DESC, id DESC)
WHERE deleted_at IS NULL;

CREATE INDEX idx_products_active_created
ON products (created_at DESC, id DESC)
WHERE deleted_at IS NULL;

DROP INDEX IF EXISTS idx_product_reviews_product_active;

CREATE INDEX idx_product_reviews_product_active_created
ON product_reviews (product_id, created_at DESC, id DESC)
INCLUDE (rating)
WHERE deleted_at IS NULL;

DROP INDEX IF EXISTS idx_order_items_order_id;