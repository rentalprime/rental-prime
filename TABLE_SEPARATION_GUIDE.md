# Table Separation Guide

## Overview
The Rental Prima application uses a dual-table architecture to separate administrative users from regular platform users (vendors and customers).

## Table Structure

### `admin_users` Table
**Purpose**: Administrative users who manage the platform

#### User Types
- `super_admin` - Full system access, can manage everything including other admins
- `admin` - Platform management, can manage users, listings, categories, etc.
- `moderator` - Limited administrative access

#### API Endpoints
- **Base Route**: `/api/admins`
- **Authorization**: Super admin only (`authorizeSuperAdmin`)
- **Controller**: `admin.controller.js`

#### Sample Operations
```javascript
// Get all admin users
GET /api/admins

// Create new admin user
POST /api/admins
{
  "name": "John Admin",
  "email": "john@admin.com",
  "password": "password123",
  "user_type": "admin",
  "role_id": "admin-role-uuid"
}

// Update admin user
PUT /api/admins/:id

// Delete admin user
DELETE /api/admins/:id
```

### `users` Table
**Purpose**: Platform users (vendors and customers)

#### User Types
- `vendor` - Users who list items for rent
- `customer` - Users who rent items from vendors

#### API Endpoints
- **Base Route**: `/api/users`
- **Authorization**: Admin access (`authorizeAdmin`) - admins can manage vendors/customers
- **Controller**: `user.controller.js`

#### Sample Operations
```javascript
// Get all vendors and customers
GET /api/users

// Create new vendor/customer
POST /api/users
{
  "name": "Jane Vendor",
  "email": "jane@vendor.com",
  "password": "password123",
  "user_type": "vendor",
  "role_id": "vendor-role-uuid"
}

// Update vendor/customer
PUT /api/users/:id

// Delete vendor/customer
DELETE /api/users/:id
```

## Authentication Flow

### Admin Users (admin_users table)
1. Admin logs in via `/api/auth/login`
2. System checks `admin_users` table first
3. If found, user gets admin privileges
4. Can access admin-only routes

### Vendors/Customers (users table)
1. User logs in via `/api/auth/login`
2. System checks `users` table if not found in admin_users
3. User gets vendor/customer privileges
4. Can access public routes and own resources

## Authorization Middleware Behavior

### `protect` Middleware
```javascript
// Checks admin_users table first
const { data: adminData } = await supabase
  .from("admin_users")
  .select("*, roles(*)")
  .eq("id", user.id)
  .single();

if (adminData) {
  req.user = adminData;
  req.userTable = "admin_users";
} else {
  // Falls back to users table
  const { data: userData } = await supabase
    .from("users")
    .select("*, roles(*)")
    .eq("id", user.id)
    .single();
  
  req.user = userData;
  req.userTable = "users";
}
```

### `authorizeAdmin` Middleware
```javascript
// Only allows users from admin_users table with admin privileges
const isFromAdminTable = req.userTable === "admin_users";
const hasAdminRole = userRole === "admin" || userRole === "super_admin";

if (isFromAdminTable && hasAdminRole) {
  return next(); // Allow access
}
```

### `authorizeSuperAdmin` Middleware
```javascript
// Only allows super admin from admin_users table
const isFromAdminTable = req.userTable === "admin_users";
const isSuperAdmin = userRole === "super_admin" || userType === "super_admin";

if (isFromAdminTable && isSuperAdmin) {
  return next(); // Allow access
}
```

## Route Access Matrix

| Route | Admin Users (admin_users) | Vendors/Customers (users) |
|-------|---------------------------|---------------------------|
| `/api/admins/*` | ✅ Super Admin Only | ❌ No Access |
| `/api/users/*` | ✅ Admin & Super Admin | ❌ No Access |
| `/api/roles/*` | ✅ Admin & Super Admin | ❌ No Access |
| `/api/categories/*` (write) | ✅ Admin & Super Admin | ❌ No Access |
| `/api/listings/*` (write) | ✅ Admin & Super Admin | ❌ No Access |
| `/api/payments/*` | ✅ Admin & Super Admin | ❌ No Access |
| `/api/settings/*` (read) | ✅ Admin & Super Admin | ❌ No Access |
| `/api/settings/*` (write) | ✅ Super Admin Only | ❌ No Access |
| `/api/notifications/*` | ✅ Admin & Super Admin | ❌ No Access |
| Public routes | ✅ Yes | ✅ Yes |

## Security Benefits

### Separation of Concerns
- **Admin users** are completely isolated from regular users
- **Different permission levels** for different user types
- **Reduced attack surface** - vendors/customers can't access admin functions

### Role-Based Access Control
- **Granular permissions** based on user table and role
- **Hierarchical access** - super admin > admin > vendor/customer
- **Table-aware authorization** - middleware knows which table user comes from

### Data Integrity
- **Admin operations** only affect admin_users table
- **User operations** only affect users table
- **No cross-contamination** between user types

## Best Practices

### When Creating New Endpoints

1. **Determine user type** - Who should access this endpoint?
2. **Choose appropriate table** - admin_users or users?
3. **Apply correct middleware**:
   - Super admin only: `protect + authorizeSuperAdmin`
   - Admin access: `protect + authorizeAdmin`
   - Vendor/Customer: `protect + authorizeVendorCustomer`
   - Public: No middleware

### Example Implementation
```javascript
// Admin-only endpoint
router.get('/admin-stats', protect, authorizeAdmin, getAdminStats);

// Super admin only endpoint  
router.post('/system-config', protect, authorizeSuperAdmin, updateSystemConfig);

// Vendor-specific endpoint
router.get('/my-listings', protect, authorizeVendorCustomer('vendor'), getMyListings);

// Public endpoint
router.get('/public-listings', getPublicListings);
```

## Migration Notes

### From Single Table to Dual Table
If migrating from a single user table:

1. **Create admin_users table** with admin user data
2. **Keep users table** for vendors/customers only
3. **Update authentication middleware** to check both tables
4. **Update authorization middleware** to be table-aware
5. **Test all endpoints** with different user types

### Data Migration Script
```sql
-- Move admin users to admin_users table
INSERT INTO admin_users (id, name, email, password, user_type, role_id, status, created_at, updated_at)
SELECT id, name, email, password, user_type, role_id, status, created_at, updated_at
FROM users 
WHERE user_type IN ('super_admin', 'admin', 'moderator');

-- Remove admin users from users table
DELETE FROM users WHERE user_type IN ('super_admin', 'admin', 'moderator');
```

This dual-table architecture provides better security, clearer separation of concerns, and more maintainable code structure.
