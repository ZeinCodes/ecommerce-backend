INSERT INTO wishlist_items (user_id, product_id)
SELECT u.id, p.id
FROM (
    VALUES
        ('user@example.com', 'PHN-APP-001'),
        ('user@example.com', 'LAP-LEN-001'),
        ('sara@example.com', 'KIT-AFR-001')
) AS seed(email, sku)
JOIN users u ON u.email = seed.email AND u.deleted_at IS NULL
JOIN products p ON p.sku = seed.sku AND p.deleted_at IS NULL
ON CONFLICT (user_id, product_id) DO NOTHING;
