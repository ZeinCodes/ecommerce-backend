-- Development-only demo accounts. Requires migrations 001-012 to be applied.
-- Passwords are hashed by pgcrypto using bcrypt-compatible Blowfish hashes.
-- Never run demo seeds against production.

INSERT INTO users (
    name,
    email,
    password_hash,
    role,
    email_verified_at
)
VALUES
    (
        'Admin Demo',
        'admin@example.com',
        crypt('DemoAdmin#2026', gen_salt('bf', 10)),
        'admin',
        NOW()
    ),
    (
        'Test User',
        'user@example.com',
        crypt('DemoUser#2026', gen_salt('bf', 10)),
        'user',
        NOW()
    ),
    (
        'Sara Example',
        'sara@example.com',
        crypt('DemoSara#2026', gen_salt('bf', 10)),
        'user',
        NOW()
    )
ON CONFLICT (email) WHERE deleted_at IS NULL
DO UPDATE SET
    name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    email_verified_at = COALESCE(users.email_verified_at, EXCLUDED.email_verified_at),
    updated_at = NOW();
