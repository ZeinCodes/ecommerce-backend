-- Reset default flags only for the demo accounts; each user may have only one active default.
UPDATE addresses
   SET is_default = FALSE, updated_at = NOW()
 WHERE user_id IN (
    SELECT id FROM users
     WHERE email IN ('user@example.com', 'sara@example.com')
       AND deleted_at IS NULL
 )
   AND deleted_at IS NULL;

INSERT INTO addresses (
    id, user_id, full_name, phone, street, city, state,
    postal_code, country, is_default, deleted_at
)
SELECT
    seed.id::uuid, u.id, seed.full_name, seed.phone, seed.street,
    seed.city, seed.state, seed.postal_code, seed.country,
    seed.is_default, NULL
FROM (
    VALUES
      ('20000000-0000-4000-8000-000000000001', 'user@example.com', 'Test User', '+31-20-555-0101', 'Example Street 10', 'Amsterdam', 'North Holland', '1012 AB', 'Netherlands', TRUE),
      ('20000000-0000-4000-8000-000000000002', 'user@example.com', 'Test User', '+31-20-555-0101', 'Business Square 20', 'Amsterdam', 'North Holland', '1012 AB', 'Netherlands', FALSE),
      ('20000000-0000-4000-8000-000000000003', 'sara@example.com', 'Sara Example', '+31-30-555-0120', 'Canal Road 5', 'Utrecht', 'Utrecht', '3511 AA', 'Netherlands', TRUE)
) AS seed(id, email, full_name, phone, street, city, state, postal_code, country, is_default)
JOIN users u
  ON u.email = seed.email
 AND u.deleted_at IS NULL
ON CONFLICT (id)
DO UPDATE SET
    user_id = EXCLUDED.user_id,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    street = EXCLUDED.street,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    postal_code = EXCLUDED.postal_code,
    country = EXCLUDED.country,
    is_default = EXCLUDED.is_default,
    deleted_at = NULL,
    updated_at = NOW();
