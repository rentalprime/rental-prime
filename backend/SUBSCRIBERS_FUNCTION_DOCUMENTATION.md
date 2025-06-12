# Plan Subscribers Function Documentation

## Overview

The `getSubscribers` function in the plans controller provides detailed subscriber statistics for all plans in the system. This function counts both active and total subscriptions for each plan and provides flexible filtering, sorting, and pagination options.

## API Endpoint

**URL:** `GET /api/plans/subscribers`  
**Access:** Private/Super Admin only  
**Authentication:** Requires valid JWT token and super admin privileges

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | `all` | Filter plans by status (`active`, `inactive`, `draft`, `all`) |
| `orderBy` | string | `subscriber_count` | Sort field (`subscriber_count`, `total_subscriptions`, `name`, `price`, `created_at`) |
| `orderDirection` | string | `desc` | Sort direction (`asc`, `desc`) |
| `limit` | number | `50` | Number of results per page |
| `offset` | number | `0` | Pagination offset |

## Response Format

```json
{
  "success": true,
  "count": 10,
  "total": 25,
  "data": [
    {
      "id": "uuid-here",
      "name": "Premium Plan",
      "description": "Premium features for power users",
      "price": 29.99,
      "interval": "monthly",
      "status": "active",
      "features": {
        "listings": 100,
        "featured": 5
      },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "subscriber_count": 15,      // Active subscribers only
      "total_subscriptions": 20    // All subscriptions (active + inactive)
    }
  ]
}
```

## Usage Examples

### 1. Get All Plans with Subscriber Counts
```bash
GET /api/plans/subscribers
```

### 2. Get Only Active Plans
```bash
GET /api/plans/subscribers?status=active
```

### 3. Sort by Most Subscribers
```bash
GET /api/plans/subscribers?orderBy=subscriber_count&orderDirection=desc
```

### 4. Sort by Plan Name (Alphabetical)
```bash
GET /api/plans/subscribers?orderBy=name&orderDirection=asc
```

### 5. Get Paginated Results
```bash
GET /api/plans/subscribers?limit=10&offset=0
```

### 6. Complex Query Example
```bash
GET /api/plans/subscribers?status=active&orderBy=subscriber_count&orderDirection=desc&limit=5&offset=0
```

## Data Fields Explained

- **subscriber_count**: Number of currently active subscriptions for this plan
- **total_subscriptions**: Total number of subscriptions ever created for this plan (including cancelled ones)
- **All other fields**: Standard plan information (name, price, features, etc.)

## Authentication Requirements

This endpoint requires:
1. Valid JWT token in the Authorization header: `Bearer <token>`
2. User must have super admin privileges
3. Requests without proper authentication will return 401 Unauthorized
4. Requests without super admin privileges will return 403 Forbidden

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Super admin privileges required."
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server Error",
  "error": "Detailed error message"
}
```

## Implementation Details

The function works by:
1. Fetching all plans from the database (with optional status filtering)
2. For each plan, counting active subscriptions (`is_active = true`)
3. For each plan, counting total subscriptions (all records)
4. Combining plan data with subscriber counts
5. Sorting results based on specified criteria
6. Applying pagination
7. Returning formatted response

## Performance Considerations

- The function uses Promise.all() for parallel database queries to improve performance
- Each plan requires 2 additional database queries (active count + total count)
- For large numbers of plans, consider implementing database-level aggregation
- Results are not cached, so frequent requests may impact performance

## Testing

Use the provided test file to verify functionality:
```bash
node backend/test-simple-subscribers.js
```

## Related Files

- **Controller**: `backend/controllers/plan.controller.js`
- **Routes**: `backend/routes/plan.routes.js`
- **Test**: `backend/test-simple-subscribers.js`
- **Database Schema**: `database/create_user_subscriptions_table.sql`
