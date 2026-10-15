-- Order line prices are snapshots; they are intentionally not derived at read time.
INSERT INTO order_items (order_id, product_id, quantity, price, created_at)
SELECT o.id, p.id, seed.quantity, seed.price,
       TIMESTAMPTZ '2026-10-01 10:00:00+00'
FROM (
    VALUES
        ('30000000-0000-4000-8000-000000000001', 'LAP-DELL-001', 1, 699.99),
        ('30000000-0000-4000-8000-000000000001', 'ACC-HUB-001', 2, 39.99),
        ('30000000-0000-4000-8000-000000000002', 'PHN-SAM-001', 1, 899.99),
        ('30000000-0000-4000-8000-000000000002', 'KIT-AFR-001', 1, 89.99)
) AS seed(order_id, sku, quantity, price)
JOIN orders o ON o.id = seed.order_id::uuid AND o.deleted_at IS NULL
JOIN products p ON p.sku = seed.sku AND p.deleted_at IS NULL
WHERE TRUE
ON CONFLICT (order_id, product_id)
DO UPDATE SET
    quantity = EXCLUDED.quantity,
    price = EXCLUDED.price;
