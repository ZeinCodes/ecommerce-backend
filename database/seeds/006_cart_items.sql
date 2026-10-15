-- Seed a non-empty cart for user@example.com. Stock remains available for checkout.
INSERT INTO cart_items (user_id, product_id, quantity)
SELECT u.id, p.id, seed.quantity
FROM (
    VALUES
        ('user@example.com', 'MEN-TSH-001', 2),
        ('user@example.com', 'ACC-MOU-001', 1)
) AS seed(email, sku, quantity)
JOIN users u ON u.email = seed.email AND u.deleted_at IS NULL
JOIN products p ON p.sku = seed.sku AND p.deleted_at IS NULL
WHERE TRUE
ON CONFLICT (user_id, product_id) WHERE deleted_at IS NULL
DO UPDATE SET
    quantity = EXCLUDED.quantity,
    updated_at = NOW();
