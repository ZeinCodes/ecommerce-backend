INSERT INTO product_reviews (user_id, product_id, rating, user_comment)
SELECT u.id, p.id, seed.rating, seed.user_comment
FROM (
    VALUES
        ('user@example.com', 'PHN-SAM-001', 5, 'Excellent performance and battery life.'),
        ('sara@example.com', 'LAP-DELL-001', 4, 'Good everyday laptop and value for money.'),
        ('user@example.com', 'RUN-NIK-001', 5, 'Comfortable for daily training.'),
        ('sara@example.com', 'ACC-KEY-001', 4, 'Solid keyboard with a satisfying typing feel.')
) AS seed(email, sku, rating, user_comment)
JOIN users u ON u.email = seed.email AND u.deleted_at IS NULL
JOIN products p ON p.sku = seed.sku AND p.deleted_at IS NULL
WHERE TRUE
ON CONFLICT (user_id, product_id) WHERE deleted_at IS NULL
DO UPDATE SET
    rating = EXCLUDED.rating,
    user_comment = EXCLUDED.user_comment,
    updated_at = NOW();
