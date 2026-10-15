-- Demo order 1: processing and therefore cancellable by an admin.
-- Product seed stock values already account for its quantities.
INSERT INTO orders (
    id, user_id, subtotal, shipping_cost, tax_amount, total_price,
    status, shipping_address_id, shipping_address, created_at, updated_at, deleted_at
)
SELECT
    '30000000-0000-4000-8000-000000000001'::uuid,
    u.id,
    779.97, 5.00, 78.00, 862.97,
    'processing',
    a.id,
    jsonb_build_object(
        'full_name', a.full_name,
        'phone', a.phone,
        'street', a.street,
        'city', a.city,
        'state', a.state,
        'postal_code', a.postal_code,
        'country', a.country
    ),
    TIMESTAMPTZ '2026-10-01 10:00:00+00',
    TIMESTAMPTZ '2026-10-01 10:00:00+00',
    NULL
FROM users u
JOIN addresses a ON a.id = '20000000-0000-4000-8000-000000000001'::uuid
WHERE u.email = 'user@example.com' AND u.deleted_at IS NULL
ON CONFLICT (id)
DO UPDATE SET
    user_id = EXCLUDED.user_id,
    subtotal = EXCLUDED.subtotal,
    shipping_cost = EXCLUDED.shipping_cost,
    tax_amount = EXCLUDED.tax_amount,
    total_price = EXCLUDED.total_price,
    status = EXCLUDED.status,
    shipping_address_id = EXCLUDED.shipping_address_id,
    shipping_address = EXCLUDED.shipping_address,
    created_at = EXCLUDED.created_at,
    updated_at = NOW(),
    deleted_at = NULL;

-- Demo order 2: a completed historical order belonging to a second customer.
INSERT INTO orders (
    id, user_id, subtotal, shipping_cost, tax_amount, total_price,
    status, shipping_address_id, shipping_address, created_at, updated_at, deleted_at
)
SELECT
    '30000000-0000-4000-8000-000000000002'::uuid,
    u.id,
    989.98, 5.00, 99.00, 1093.98,
    'delivered',
    a.id,
    jsonb_build_object(
        'full_name', a.full_name,
        'phone', a.phone,
        'street', a.street,
        'city', a.city,
        'state', a.state,
        'postal_code', a.postal_code,
        'country', a.country
    ),
    TIMESTAMPTZ '2026-09-15 14:30:00+00',
    TIMESTAMPTZ '2026-09-15 14:30:00+00',
    NULL
FROM users u
JOIN addresses a ON a.id = '20000000-0000-4000-8000-000000000003'::uuid
WHERE u.email = 'sara@example.com' AND u.deleted_at IS NULL
ON CONFLICT (id)
DO UPDATE SET
    user_id = EXCLUDED.user_id,
    subtotal = EXCLUDED.subtotal,
    shipping_cost = EXCLUDED.shipping_cost,
    tax_amount = EXCLUDED.tax_amount,
    total_price = EXCLUDED.total_price,
    status = EXCLUDED.status,
    shipping_address_id = EXCLUDED.shipping_address_id,
    shipping_address = EXCLUDED.shipping_address,
    created_at = EXCLUDED.created_at,
    updated_at = NOW(),
    deleted_at = NULL;
