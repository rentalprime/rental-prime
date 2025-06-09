# Authorization System Summary

## Overview
This document provides a comprehensive overview of the standardized authorization system implemented across the Rental Prima application.

## Authentication & Authorization Middleware

### Location
`backend/middlewares/auth.js` - Centralized authentication and authorization middleware

### Available Middleware Functions

#### 1. `protect` - Authentication Middleware
- **Purpose**: Verifies JWT tokens and authenticates users
- **Features**:
  - Supports Bearer tokens in Authorization header
  - Supports tokens in cookies
  - Verifies tokens with Supabase Auth
  - Fetches user data from both `users` and `admin_users` tables
  - Includes role information in user object
- **Usage**: `router.use(protect)` or `router.get('/', protect, controller)`

#### 2. `authorize(...userTypes)` - User Type Authorization
- **Purpose**: Restricts access based on user_type field
- **Parameters**: Variable number of user types (e.g., 'admin', 'super_admin', 'vendor', 'customer')
- **Usage**: `router.use(authorize('admin', 'super_admin'))`

#### 3. `authorizeRole(...roleNames)` - Role-Based Authorization
- **Purpose**: Restricts access based on role names from roles table
- **Parameters**: Variable number of role names
- **Usage**: `router.use(authorizeRole('admin', 'super_admin'))`

#### 4. `authorizeAdmin` - Admin Access
- **Purpose**: Allows access to admin and super_admin users
- **Usage**: `router.use(authorizeAdmin)`

#### 5. `authorizeSuperAdmin` - Super Admin Only
- **Purpose**: Restricts access to super_admin users only
- **Usage**: `router.use(authorizeSuperAdmin)`

#### 6. `checkPermission(resource, action)` - Permission-Based Authorization
- **Purpose**: Checks specific permissions from the roles.permissions JSONB field
- **Parameters**: resource (string), action (string)
- **Usage**: `router.use(checkPermission('users', 'create'))`

## Route Protection Summary

### Admin Management (`/api/admins`)
- **Purpose**: Manage admin users (stored in `admin_users` table)
- **Protection**: `protect` + `authorizeSuperAdmin`
- **Access**: Super admin only
- **Routes**: All CRUD operations for admin users
- **User Types**: admin, super_admin, moderator

### User Management (`/api/users`)
- **Purpose**: Manage vendors and customers (stored in `users` table)
- **Protection**: `protect` + `authorizeAdmin`
- **Access**: Admin and super admin (from admin_users table)
- **Routes**: All CRUD operations for vendor/customer users
- **User Types**: vendor, customer

### Role Management (`/api/roles`)
- **Protection**: `protect` + `authorizeAdmin`
- **Access**: Admin and super admin
- **Routes**: All CRUD operations

### Category Management (`/api/categories`)
- **Read Operations**: Public access (no auth required)
- **Write Operations**: `protect` + `authorizeAdmin`
- **Routes**:
  - GET `/` - Public
  - POST `/` - Admin only
  - GET `/hierarchy` - Public
  - GET `/stats` - Admin only
  - GET `/:id` - Public
  - PUT `/:id` - Admin only
  - DELETE `/:id` - Admin only

### Listing Management (`/api/listings`)
- **Read Operations**: Public access
- **Write Operations**: `protect` + `authorizeAdmin`
- **Routes**:
  - GET `/` - Public
  - POST `/` - Admin only
  - GET `/featured` - Public
  - GET `/:id` - Public
  - PUT `/:id` - Admin only
  - DELETE `/:id` - Admin only

### Payment Management (`/api/payments`)
- **Protection**: `protect` + `authorizeAdmin`
- **Access**: Admin and super admin
- **Routes**: Read operations only

### Plan Management (`/api/plans`)
- **Read Operations**: Public access
- **Write Operations**: `protect` + `authorizeSuperAdmin`
- **Routes**:
  - GET `/` - Public
  - GET `/:id` - Public
  - POST `/` - Super admin only
  - PUT `/:id` - Super admin only
  - DELETE `/:id` - Super admin only

### Settings Management (`/api/settings`)
- **Read Operations**: `protect` + `authorizeAdmin`
- **Write Operations**: `protect` + `authorizeSuperAdmin`
- **Routes**:
  - GET `/` - Admin access
  - PUT `/` - Super admin only

### Notifications (`/api/notifications`)
- **Protection**: `protect` + `authorizeAdmin`
- **Access**: Admin and super admin
- **Routes**: All CRUD operations

### Authentication (`/api/auth`)
- **Public Routes**: `/register`, `/login`
- **Protected Routes**: `/me` (uses `protect` middleware)

## Role Structure

### Database Structure

### Table Separation
The system uses two separate tables for different user types:

#### `admin_users` Table
- **Purpose**: Stores all administrative users
- **User Types**: `super_admin`, `admin`, `moderator`
- **Access**: Managed via `/api/admins` endpoints
- **Authorization**: Only super admin can manage these users

#### `users` Table
- **Purpose**: Stores vendors and customers
- **User Types**: `vendor`, `customer`
- **Access**: Managed via `/api/users` endpoints
- **Authorization**: Admin and super admin can manage these users

### Database Roles
Based on the roles table, the following roles are available:
- `super_admin` - Full system access (admin_users table)
- `admin` - Administrative access (admin_users table)
- `moderator` - Limited admin access (admin_users table)
- `vendor` - Vendor-specific access (users table)
- `customer` - Customer access (users table)
- `support` - Support team access
- `accountant` - Financial access

## Security Features

### Token Verification
- Supports Supabase JWT tokens
- Fallback to custom JWT verification
- Automatic user data fetching with role information

### Permission System
- Role-based permissions stored in JSONB format
- Granular permission checking available
- Super admin bypass for all permissions

### Error Handling
- Consistent error responses
- Detailed error messages for debugging
- Proper HTTP status codes (401, 403, 500)

## Migration Notes

### Changes Made
1. **Standardized Middleware**: Consolidated two different auth systems into one
2. **Enabled Protection**: Uncommented and activated authorization on critical routes
3. **Fixed Role Names**: Standardized role naming conventions
4. **Enhanced Security**: Added proper authorization to previously unprotected routes

### Removed Files
- `backend/middleware/auth.middleware.js` (consolidated into `backend/middlewares/auth.js`)

## Usage Examples

```javascript
// Basic authentication
router.use(protect);

// Admin access required
router.use(protect, authorizeAdmin);

// Super admin only
router.use(protect, authorizeSuperAdmin);

// Specific user types
router.use(protect, authorize('vendor', 'admin'));

// Permission-based access
router.use(protect, checkPermission('listings', 'create'));

// Mixed protection levels
router.route('/')
  .get(getItems) // Public
  .post(protect, authorizeAdmin, createItem); // Admin only
```

## Testing Recommendations

1. Test authentication with valid/invalid tokens
2. Test authorization with different user types and roles
3. Verify public routes remain accessible
4. Test admin-only and super-admin-only routes
5. Verify error responses for unauthorized access
