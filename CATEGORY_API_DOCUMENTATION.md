# Category API Documentation

This document describes the complete CRUD API for the categories table in the Rental Prima application.

## Table Schema

```sql
CREATE TABLE public.categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  slug TEXT UNIQUE
);
```

## Base URL
```
/api/categories
```

## Authentication
- **Public endpoints**: GET requests (read operations)
- **Protected endpoints**: POST, PUT, DELETE (require admin/super_admin role)

---

## Endpoints

### 1. Get All Categories
**GET** `/api/categories`

**Description**: Retrieve all categories with optional filtering and pagination.

**Query Parameters**:
- `status` (string, optional): Filter by status ('active', 'inactive', 'all')
- `parent_id` (string, optional): Filter by parent category ('null'/'root' for root categories)
- `search` (string, optional): Search in name, description, and slug
- `limit` (number, optional): Number of results per page (default: 50)
- `offset` (number, optional): Number of results to skip (default: 0)
- `orderBy` (string, optional): Sort field ('name', 'created_at', 'updated_at', 'status')
- `orderDirection` (string, optional): Sort direction ('asc', 'desc')

**Response**:
```json
{
  "success": true,
  "count": 10,
  "total": 25,
  "data": [
    {
      "id": "uuid",
      "name": "Electronics",
      "description": "Electronic devices and gadgets",
      "image_url": "https://example.com/image.jpg",
      "status": "active",
      "parent_id": null,
      "slug": "electronics",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "parent": null,
      "children": [
        {
          "id": "uuid",
          "name": "Smartphones",
          "slug": "smartphones",
          "status": "active"
        }
      ]
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 25,
    "pages": 1
  }
}
```

### 2. Get Single Category
**GET** `/api/categories/:id`

**Description**: Retrieve a single category by ID with parent and children information.

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Electronics",
    "description": "Electronic devices and gadgets",
    "image_url": "https://example.com/image.jpg",
    "status": "active",
    "parent_id": null,
    "slug": "electronics",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "parent": null,
    "children": [...]
  }
}
```

### 3. Create Category
**POST** `/api/categories`

**Authentication**: Required (admin/super_admin)

**Request Body**:
```json
{
  "name": "Electronics",
  "description": "Electronic devices and gadgets",
  "image_url": "https://example.com/image.jpg",
  "status": "active",
  "parent_id": null,
  "slug": "electronics"
}
```

**Required Fields**: `name`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "generated-uuid",
    "name": "Electronics",
    "description": "Electronic devices and gadgets",
    "image_url": "https://example.com/image.jpg",
    "status": "active",
    "parent_id": null,
    "slug": "electronics",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "parent": null,
    "children": []
  }
}
```

### 4. Update Category
**PUT** `/api/categories/:id`

**Authentication**: Required (admin/super_admin)

**Request Body** (all fields optional):
```json
{
  "name": "Updated Electronics",
  "description": "Updated description",
  "image_url": "https://example.com/new-image.jpg",
  "status": "inactive",
  "parent_id": "parent-uuid",
  "slug": "updated-electronics"
}
```

**Response**: Same as create category response with updated data.

### 5. Delete Category
**DELETE** `/api/categories/:id`

**Authentication**: Required (admin/super_admin)

**Query Parameters**:
- `force` (boolean, optional): Force delete category with subcategories

**Response**:
```json
{
  "success": true,
  "data": {},
  "message": "Category deleted successfully"
}
```

### 6. Get Category Hierarchy
**GET** `/api/categories/hierarchy`

**Description**: Get all categories organized in a tree structure.

**Query Parameters**:
- `status` (string, optional): Filter by status ('active', 'inactive', 'all')

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Electronics",
      "children": [
        {
          "id": "uuid",
          "name": "Smartphones",
          "children": []
        }
      ]
    }
  ]
}
```

### 7. Get Category by Slug
**GET** `/api/categories/slug/:slug`

**Description**: Retrieve a category by its slug.

**Response**: Same as get single category response.

### 8. Get Category Statistics
**GET** `/api/categories/stats`

**Authentication**: Required (admin/super_admin)

**Description**: Get statistical information about categories.

**Response**:
```json
{
  "success": true,
  "data": {
    "total": 25,
    "active": 20,
    "inactive": 5,
    "root": 5,
    "withChildren": 3,
    "withoutChildren": 22
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development mode)"
}
```

**Common HTTP Status Codes**:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

---

## Features

### ✅ Implemented Features
- Complete CRUD operations
- Hierarchical category structure (parent-child relationships)
- Slug-based URL friendly identifiers
- Search functionality
- Pagination and sorting
- Status management (active/inactive)
- Validation and error handling
- Recursive deletion with force option
- Category statistics
- Tree structure hierarchy view

### 🔧 Validation Rules
- Category name is required
- Slug must be unique
- Parent category must exist if specified
- Category cannot be its own parent
- Status must be 'active' or 'inactive'
- Slug is auto-generated from name if not provided

### 🛡️ Security Features
- Authentication required for write operations
- Role-based authorization (admin/super_admin)
- Input validation and sanitization
- SQL injection protection via Supabase
