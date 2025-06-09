-- Create admin_users table
-- This table is separate from the regular users table to manage admin-specific users

CREATE TABLE IF NOT EXISTS "public"."admin_users" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),                -- Unique admin identifier
  "name" VARCHAR(150) NOT NULL,                                    -- Full name of the admin
  "email" VARCHAR(150) NOT NULL UNIQUE,                            -- Admin email (should be unique)
  "password" TEXT NOT NULL,                                        -- Hashed password
  "user_type" VARCHAR(50) NOT NULL,                                -- Label like 'superadmin', 'moderator', etc.
  "role_id" UUID REFERENCES "public"."roles"("id") ON DELETE SET NULL, -- FK to roles table (not admin_roles)
  "status" VARCHAR(20) DEFAULT 'active',                           -- active, suspended, etc.
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,              -- Creation timestamp
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP               -- Update timestamp
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON "public"."admin_users"("email");
CREATE INDEX IF NOT EXISTS idx_admin_users_role_id ON "public"."admin_users"("role_id");
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON "public"."admin_users"("status");
CREATE INDEX IF NOT EXISTS idx_admin_users_user_type ON "public"."admin_users"("user_type");

-- Add comments for documentation
COMMENT ON TABLE "public"."admin_users" IS 'Admin users table for managing administrative access';
COMMENT ON COLUMN "public"."admin_users"."id" IS 'Unique identifier for admin user';
COMMENT ON COLUMN "public"."admin_users"."name" IS 'Full name of the admin user';
COMMENT ON COLUMN "public"."admin_users"."email" IS 'Email address for admin login';
COMMENT ON COLUMN "public"."admin_users"."password" IS 'Hashed password for authentication';
COMMENT ON COLUMN "public"."admin_users"."user_type" IS 'Type of admin user (superadmin, moderator, etc.)';
COMMENT ON COLUMN "public"."admin_users"."role_id" IS 'Foreign key reference to roles table';
COMMENT ON COLUMN "public"."admin_users"."status" IS 'Current status of admin user (active, suspended, etc.)';

-- Insert sample admin users (optional - for testing)
-- First, ensure we have the required roles
INSERT INTO "public"."roles" (name, description, permissions, is_system_role, status)
VALUES 
  ('super_admin', 'Super Administrator with full system access', 
   '{"all": true, "admin_users": {"create": true, "read": true, "update": true, "delete": true}}'::jsonb, 
   true, 'active'),
  ('moderator', 'Moderator with limited administrative access', 
   '{"users": {"read": true, "update": true}, "listings": {"read": true, "update": true, "delete": true}}'::jsonb, 
   false, 'active')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions,
  updated_at = CURRENT_TIMESTAMP;

-- Insert sample admin users
DO $$
DECLARE
    super_admin_role_id UUID;
    moderator_role_id UUID;
BEGIN
    -- Get role IDs
    SELECT id INTO super_admin_role_id FROM "public"."roles" WHERE name = 'super_admin';
    SELECT id INTO moderator_role_id FROM "public"."roles" WHERE name = 'moderator';

    -- Insert sample super admin user
    INSERT INTO "public"."admin_users" (name, email, password, user_type, role_id, status)
    VALUES ('Super Admin', 'superadmin@rentalprimasuperadmin.com', 'hashed_password_here', 'superadmin', super_admin_role_id, 'active')
    ON CONFLICT (email) DO NOTHING;

    -- Insert sample moderator user
    INSERT INTO "public"."admin_users" (name, email, password, user_type, role_id, status)
    VALUES ('Moderator User', 'moderator@rentalprimasuperadmin.com', 'hashed_password_here', 'moderator', moderator_role_id, 'active')
    ON CONFLICT (email) DO NOTHING;
END $$;
