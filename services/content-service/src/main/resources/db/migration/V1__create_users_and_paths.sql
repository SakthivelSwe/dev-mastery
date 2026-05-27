-- =============================================================
-- V1: Users and Learning Paths
-- Foundation tables for user accounts and content structure.
-- =============================================================

-- Extension for UUID generation (PostgreSQL 13+ built-in)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- USERS
-- Stores all authenticated users across providers.
-- auth_provider: 'google' | 'github' | 'email'
-- subscription: 'free' | 'pro' (future paid tier)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    avatar_url      TEXT,
    auth_provider   VARCHAR(50)  NOT NULL CHECK (auth_provider IN ('google', 'github', 'email')),
    subscription    VARCHAR(50)  NOT NULL DEFAULT 'free' CHECK (subscription IN ('free', 'pro')),
    role            VARCHAR(50)  NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE users IS 'All authenticated users. Supports Google, GitHub, and email auth providers.';
COMMENT ON COLUMN users.auth_provider IS 'Authentication method: google | github | email';
COMMENT ON COLUMN users.subscription IS 'Subscription tier: free | pro';
COMMENT ON COLUMN users.role IS 'Access level: user | admin';

-- ─────────────────────────────────────────────────────────────
-- LEARNING PATHS
-- Top-level groupings: Java Mastery, DSA, Spring Boot, etc.
-- Each path has a difficulty range (level_min → level_max).
-- ─────────────────────────────────────────────────────────────
CREATE TABLE learning_paths (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(100) UNIQUE NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    icon            VARCHAR(100),              -- e.g. 'java', 'spring', 'graph'
    accent_color    VARCHAR(20),               -- e.g. '#F89820' for Java
    level_min       INT          NOT NULL CHECK (level_min BETWEEN 1 AND 5),
    level_max       INT          NOT NULL CHECK (level_max BETWEEN 1 AND 5),
    total_topics    INT          NOT NULL DEFAULT 0,
    estimated_hours INT          NOT NULL DEFAULT 0,
    order_index     INT          NOT NULL,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT learning_paths_level_range CHECK (level_min <= level_max)
);

COMMENT ON TABLE learning_paths IS 'Top-level learning tracks: Java Mastery, DSA, Spring Boot, Frontend, System Design, Design Patterns, Interview Prep.';
COMMENT ON COLUMN learning_paths.slug IS 'URL-safe identifier: java-mastery, dsa-mastery, spring-boot-mastery, etc.';
COMMENT ON COLUMN learning_paths.accent_color IS 'Brand color for this path, matches design system tokens.';

-- ─────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────
CREATE INDEX idx_users_email         ON users(email);
CREATE INDEX idx_users_auth_provider ON users(auth_provider);
CREATE INDEX idx_users_created_at    ON users(created_at DESC);

CREATE INDEX idx_paths_slug          ON learning_paths(slug);
CREATE INDEX idx_paths_order         ON learning_paths(order_index);
CREATE INDEX idx_paths_active        ON learning_paths(is_active) WHERE is_active = TRUE;
