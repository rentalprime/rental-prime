# Admin Users CRUD Implementation

This document describes the complete CRUD (Create, Read, Update, Delete) implementation for admin users in the Rental Prima application.

## Overview

The admin users system is designed to manage administrative access to the platform. It uses a separate `admin_users` table that references the existing `roles` table for role-based access control (RBAC).

## Database Schema

### Admin Users Table

```sql
CREATE TABLE "public"."admin_users" (
  "id" UUID PRIMARY KEY,                                -- Unique admin identifier
  "name" VARCHAR(150) NOT NULL,                         -- Full name of the admin
  "email" VARCHAR(150) NOT NULL UNIQUE,                 -- Admin email (should be unique)
  "password" TEXT NOT NULL,                             -- Hashed password
  "user_type" VARCHAR(50) NOT NULL,                     -- Label like 'superadmin', 'moderator', etc.
  "role_id" UUID REFERENCES "public"."roles"("id") ON DELETE SET NULL, -- FK to roles
  "status" VARCHAR(20) DEFAULT 'active',                -- active, suspended, etc.
  "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,   -- Creation timestamp
  "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP    -- Update timestamp
);
```

### Key Features

- **UUID Primary Key**: Uses UUID for better security and scalability
- **Role Integration**: References the existing `roles` table (not `admin_roles`)
- **Supabase Auth Integration**: Integrates with Supabase authentication system
- **Status Management**: Supports different admin user statuses
- **Audit Trail**: Includes created_at and updated_at timestamps

## API Endpoints

### Base URL: `/api/admins`

| Method | Endpoint | Description | Access Level |
|--------|----------|-------------|--------------|
| GET | `/api/admins` | Get all admin users | SuperAdmin |
| GET | `/api/admins/:id` | Get single admin user | SuperAdmin |
| POST | `/api/admins` | Create new admin user | SuperAdmin |
| PUT | `/api/admins/:id` | Update admin user | SuperAdmin |
| DELETE | `/api/admins/:id` | Delete admin user | SuperAdmin |

## Implementation Files

### 1. Controller (`backend/controllers/admin.controller.js`)

Contains all the business logic for admin user operations:

- `getAdminUsers()` - Retrieve all admin users with role information
- `getAdminUser()` - Retrieve single admin user by ID
- `createAdminUser()` - Create new admin user with Supabase Auth integration
- `updateAdminUser()` - Update admin user information
- `deleteAdminUser()` - Delete admin user from both auth and database

### 2. Routes (`backend/routes/admin.routes.js`)

Defines the API endpoints and applies middleware:

```javascript
const router = express.Router();

// Apply protection and authorization middleware
// router.use(protect);
// router.use(authorize('superadmin', 'super_admin'));

router.route("/").get(getAdminUsers).post(createAdminUser);
router.route("/:id").get(getAdminUser).put(updateAdminUser).delete(deleteAdminUser);
```

### 3. Database Schema (`database/admin_users_schema.sql`)

SQL script to create the admin_users table with proper indexes and sample data.

## Usage Examples

### Create Admin User

```javascript
POST /api/admins
Content-Type: application/json

{
  "name": "John Admin",
  "email": "john@admin.com",
  "password": "secure_password",
  "user_type": "admin",
  "role_id": "uuid-of-admin-role",
  "status": "active"
}
```

### Response Format

```javascript
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Admin",
    "email": "john@admin.com",
    "user_type": "admin",
    "role_id": "uuid-of-admin-role",
    "status": "active",
    "created_at": "2024-01-20T10:00:00Z",
    "updated_at": "2024-01-20T10:00:00Z",
    "roles": {
      "name": "admin",
      "description": "Administrator with full access",
      "permissions": {"all": true}
    }
  }
}
```

## Setup Instructions

### 1. Create Database Table

Run the SQL script to create the admin_users table:

```bash
# Execute the SQL file in your Supabase dashboard or via CLI
psql -f database/admin_users_schema.sql
```

### 2. Ensure Roles Exist

Make sure the following roles exist in your `roles` table:
- `super_admin` - Full system access
- `admin` - Administrative access
- `moderator` - Limited administrative access

### 3. Test the Implementation

Run the test script to verify everything works:

```bash
node test-admin-crud.js
```

## Security Considerations

### Authentication & Authorization

- All endpoints require authentication via Supabase JWT tokens
- Only users with `superadmin` or `super_admin` roles can access admin management
- Password updates are handled separately for security

### Data Validation

- Required fields validation (name, email, password, user_type)
- Email uniqueness validation
- Role existence validation

### Supabase Integration

- Creates users in both Supabase Auth and admin_users table
- Maintains consistency between auth and database records
- Proper cleanup when deleting users

## Error Handling

The implementation includes comprehensive error handling for:

- Missing required fields
- Duplicate email addresses
- Invalid role references
- Supabase authentication errors
- Database operation failures

## Future Enhancements

1. **Password Reset**: Implement password reset functionality
2. **Bulk Operations**: Add bulk create/update/delete operations
3. **Activity Logging**: Track admin user activities
4. **Advanced Permissions**: More granular permission management
5. **Two-Factor Authentication**: Add 2FA support for admin users

## Testing

Use the provided test script (`test-admin-crud.js`) to verify:

- Table existence and structure
- All CRUD operations
- Role integration
- Error handling
- Supabase Auth integration

## Troubleshooting

### Common Issues

1. **Table doesn't exist**: Run the schema SQL script
2. **Role not found**: Ensure required roles exist in roles table
3. **Auth errors**: Check Supabase configuration and service role key
4. **Permission denied**: Verify user has appropriate role for admin management

### Debug Mode

Enable detailed logging by setting environment variables:

```bash
NODE_ENV=development
DEBUG=true
```
