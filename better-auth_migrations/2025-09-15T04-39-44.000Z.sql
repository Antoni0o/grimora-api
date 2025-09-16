-- Better Auth Migration
-- Generated: 2025-09-15T04:39:44.000Z
-- This migration creates the necessary tables for Better Auth authentication

-- User table
CREATE TABLE IF NOT EXISTS "user" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text,
    "email" text NOT NULL,
    "emailVerified" boolean DEFAULT false,
    "image" text,
    "createdAt" timestamptz DEFAULT now() NOT NULL,
    "updatedAt" timestamptz DEFAULT now() NOT NULL
);

-- Session table
CREATE TABLE IF NOT EXISTS "session" (
    "id" text PRIMARY KEY NOT NULL,
    "expiresAt" timestamptz NOT NULL,
    "token" text NOT NULL UNIQUE,
    "createdAt" timestamptz DEFAULT now() NOT NULL,
    "updatedAt" timestamptz DEFAULT now() NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Account table
CREATE TABLE IF NOT EXISTS "account" (
    "id" text PRIMARY KEY NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" text NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamptz,
    "refreshTokenExpiresAt" timestamptz,
    "scope" text,
    "password" text,
    "createdAt" timestamptz DEFAULT now() NOT NULL,
    "updatedAt" timestamptz DEFAULT now() NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

-- Verification table
CREATE TABLE IF NOT EXISTS "verification" (
    "id" text PRIMARY KEY NOT NULL,
    "identifier" text NOT NULL,
    "value" text NOT NULL,
    "expiresAt" timestamptz NOT NULL,
    "createdAt" timestamptz DEFAULT now() NOT NULL,
    "updatedAt" timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_session_userId" ON "session"("userId");
CREATE INDEX IF NOT EXISTS "idx_session_token" ON "session"("token");
CREATE INDEX IF NOT EXISTS "idx_account_userId" ON "account"("userId");
CREATE INDEX IF NOT EXISTS "idx_account_providerId_accountId" ON "account"("providerId", "accountId");
CREATE INDEX IF NOT EXISTS "idx_verification_identifier" ON "verification"("identifier");
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "user"("email");
