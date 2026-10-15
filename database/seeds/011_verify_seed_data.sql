-- Run after all seed files. This prints counts for the demo records.
SELECT 'demo_users' AS entity, COUNT(*)::bigint AS row_count
  FROM users WHERE email IN ('admin@example.com', 'user@example.com', 'sara@example.com') AND deleted_at IS NULL
UNION ALL
SELECT 'active_categories', COUNT(*)::bigint FROM categories WHERE deleted_at IS NULL
UNION ALL
SELECT 'active_products', COUNT(*)::bigint FROM products WHERE deleted_at IS NULL
UNION ALL
SELECT 'product_images_for_seed_products', COUNT(*)::bigint
  FROM product_images pi JOIN products p ON p.id = pi.product_id
 WHERE p.sku IN ('LAP-DELL-001', 'PHN-SAM-001', 'ACC-KEY-001', 'RUN-NIK-001', 'FUR-CHR-001', 'KIT-AFR-001')
UNION ALL
SELECT 'demo_addresses', COUNT(*)::bigint
  FROM addresses a JOIN users u ON u.id = a.user_id
 WHERE u.email IN ('user@example.com', 'sara@example.com') AND a.deleted_at IS NULL
UNION ALL
SELECT 'active_demo_cart_items', COUNT(*)::bigint
  FROM cart_items ci JOIN users u ON u.id = ci.user_id
 WHERE u.email = 'user@example.com' AND ci.deleted_at IS NULL
UNION ALL
SELECT 'demo_orders', COUNT(*)::bigint
  FROM orders o JOIN users u ON u.id = o.user_id
 WHERE u.email IN ('user@example.com', 'sara@example.com') AND o.deleted_at IS NULL
UNION ALL
SELECT 'demo_order_items', COUNT(*)::bigint
  FROM order_items oi JOIN orders o ON o.id = oi.order_id
 WHERE o.id IN ('30000000-0000-4000-8000-000000000001'::uuid, '30000000-0000-4000-8000-000000000002'::uuid)
UNION ALL
SELECT 'active_demo_reviews', COUNT(*)::bigint
  FROM product_reviews r JOIN users u ON u.id = r.user_id
 WHERE u.email IN ('user@example.com', 'sara@example.com') AND r.deleted_at IS NULL
UNION ALL
SELECT 'demo_wishlist_items', COUNT(*)::bigint
  FROM wishlist_items w JOIN users u ON u.id = w.user_id
 WHERE u.email IN ('user@example.com', 'sara@example.com');

-- This should return zero rows: all demo order items must refer to existing orders and products.
SELECT oi.id
  FROM order_items oi
  LEFT JOIN orders o ON o.id = oi.order_id
  LEFT JOIN products p ON p.id = oi.product_id
 WHERE o.id IS NULL OR p.id IS NULL;
