-- Migration: Create user_subscriptions table
-- This table manages user plan subscriptions

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,  -- reference to users/vendors table
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    start_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_is_active ON user_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_start_date ON user_subscriptions(start_date);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_end_date ON user_subscriptions(end_date);

-- Add comment to document the table
COMMENT ON TABLE user_subscriptions IS 'Manages user plan subscriptions with start/end dates and active status';
COMMENT ON COLUMN user_subscriptions.user_id IS 'Reference to users table (vendors/customers)';
COMMENT ON COLUMN user_subscriptions.plan_id IS 'Reference to plans table';
COMMENT ON COLUMN user_subscriptions.start_date IS 'When the subscription starts';
COMMENT ON COLUMN user_subscriptions.end_date IS 'When the subscription ends (NULL for unlimited)';
COMMENT ON COLUMN user_subscriptions.is_active IS 'Whether the subscription is currently active';
