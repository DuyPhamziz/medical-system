-- Authentication and authorization schema (PostgreSQL)
-- If using spring.jpa.hibernate.ddl-auto=update this file is optional,
-- but it is useful for controlled production rollout.

CREATE TABLE IF NOT EXISTS role (
    role_id VARCHAR(64) PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_account (
    user_id UUID PRIMARY KEY,
    username VARCHAR(120) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL,
    role_id VARCHAR(64) NOT NULL REFERENCES role(role_id),
    role_locked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_user_account_email ON user_account(email);
CREATE INDEX IF NOT EXISTS idx_user_account_role_id ON user_account(role_id);
