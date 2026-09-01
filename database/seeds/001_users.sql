-- database/seeds/001_users.sql

INSERT INTO users (
    name,
    email,
    password_hash,
    role
)
VALUES
(
    'Admin User',
    'admin@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0L8mQeO5J5Y8ZJ5J5Y8ZJ5Y8ZJ5Y8ZJ5Y8ZJ5',
    'admin'
),
(
    'Test User',
    'user@example.com',
    '$2b$12$LQv3c1yqBWVHxkd0L8mQeO5J5Y8ZJ5J5Y8ZJ5Y8ZJ5Y8ZJ5',
    'user'
);