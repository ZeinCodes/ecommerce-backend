-- Remove old unique constraint
ALTER TABLE users
DROP CONSTRAINT users_email_key;

-- Add unique index only for active users
CREATE UNIQUE INDEX users_email_unique_active
ON users(email)
WHERE deleted_at IS NULL;