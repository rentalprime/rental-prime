-- Seed roles for the rental platform
-- This script creates all necessary roles for the system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."roles" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" VARCHAR(50) NOT NULL UNIQUE,
  "description" TEXT,
  "permissions" JSONB DEFAULT '{}'::jsonb,
  "is_system_role" BOOLEAN DEFAULT false,
  "status" VARCHAR(20) DEFAULT 'active',
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_roles_name ON "public"."roles"("name");
CREATE INDEX IF NOT EXISTS idx_roles_status ON "public"."roles"("status");
CREATE INDEX IF NOT EXISTS idx_roles_is_system_role ON "public"."roles"("is_system_role");

-- Insert all required roles
INSERT INTO "public"."roles" (name, description, permissions, is_system_role, status)
VALUES 
  -- Super Admin Role - Full system access
  ('super_admin', 'Super Administrator with full system access', 
   '{"all": true, "admin_users": {"create": true, "read": true, "update": true, "delete": true}, "users": {"create": true, "read": true, "update": true, "delete": true}, "listings": {"create": true, "read": true, "update": true, "delete": true}, "categories": {"create": true, "read": true, "update": true, "delete": true}, "roles": {"create": true, "read": true, "update": true, "delete": true}}'::jsonb, 
   true, 'active'),
   
  -- Admin/Moderator Role - Limited administrative access
  ('admin', 'Administrator with limited system access', 
   '{"users": {"read": true, "update": true}, "listings": {"read": true, "update": true, "delete": true}, "categories": {"read": true, "update": true}}'::jsonb, 
   true, 'active'),
   
  -- Moderator Role - Content moderation access
  ('moderator', 'Moderator with content management access', 
   '{"users": {"read": true, "update": true}, "listings": {"read": true, "update": true, "delete": true}}'::jsonb, 
   false, 'active'),
   
  -- Vendor Role - Business users who can create listings
  ('vendor', 'Vendor who can create and manage listings', 
   '{"listings": {"create": true, "read": true, "update": true, "delete": true}, "profile": {"read": true, "update": true}}'::jsonb, 
   false, 'active'),
   
  -- Customer Role - Regular users who can browse and rent
  ('customer', 'Customer who can browse and rent items', 
   '{"listings": {"read": true}, "profile": {"read": true, "update": true}, "bookings": {"create": true, "read": true, "update": true}}'::jsonb, 
   false, 'active')
   
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions,
  updated_at = CURRENT_TIMESTAMP;

-- Add comments for documentation
COMMENT ON TABLE "public"."roles" IS 'System roles for user access control';
COMMENT ON COLUMN "public"."roles"."id" IS 'Unique identifier for role';
COMMENT ON COLUMN "public"."roles"."name" IS 'Role name (unique)';
COMMENT ON COLUMN "public"."roles"."description" IS 'Role description';
COMMENT ON COLUMN "public"."roles"."permissions" IS 'JSON object defining role permissions';
COMMENT ON COLUMN "public"."roles"."is_system_role" IS 'Whether this is a system role (cannot be deleted)';
COMMENT ON COLUMN "public"."roles"."status" IS 'Role status (active/inactive)';

-- Display created roles
SELECT name, description, is_system_role, status FROM "public"."roles" ORDER BY name;
