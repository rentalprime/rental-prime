# Assign Plan Functionality Documentation

## Overview

This document describes the new `assignplan` functionality that allows vendors to assign subscription plans to themselves in the Rental Prima application.

## Database Schema

### user_subscriptions Table

A new table `user_subscriptions` has been created to manage user plan subscriptions:

```sql
CREATE TABLE user_subscriptions (
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
```

### Indexes

The following indexes have been created for optimal performance:
- `idx_user_subscriptions_user_id` on `user_id`
- `idx_user_subscriptions_plan_id` on `plan_id`
- `idx_user_subscriptions_is_active` on `is_active`
- `idx_user_subscriptions_start_date` on `start_date`
- `idx_user_subscriptions_end_date` on `end_date`

## API Endpoint

### POST /api/subscriptions/assign

Assigns a plan to the authenticated vendor (self-assignment).

**Access:** Private/Vendor only

### GET /api/subscriptions

Get all subscriptions for the authenticated vendor.

**Access:** Private/Vendor only

**Query Parameters:**
- `status` - Filter by status (active, inactive, all)
- `limit` - Number of results per page (default: 50)
- `offset` - Pagination offset (default: 0)

### PUT /api/subscriptions/:id/cancel

Cancel a specific subscription for the authenticated vendor.

**Access:** Private/Vendor only

**Request Body:**
```json
{
  "plan_id": "uuid-string"
}
```

**Notes:**
- Vendors can only assign plans to themselves. The `user_id` is automatically taken from the authenticated vendor's token.
- The `start_date` is **always set to the current timestamp** when the request is processed.
- The `end_date` is **always automatically calculated** based on the plan's interval:
  - **monthly**: +1 month from start_date
  - **quarterly**: +3 months from start_date
  - **half-yearly**: +6 months from start_date
  - **yearly**: +1 year from start_date
- Manual `start_date` and `end_date` specification is **not allowed** to ensure consistency and immediate activation.

**Success Response (201):**
```json
{
  "success": true,
  "message": "Plan assigned successfully",
  "data": {
    "id": "subscription-uuid",
    "user_id": "vendor-uuid",
    "plan_id": "plan-uuid",
    "start_date": "2024-01-15T10:00:00Z",
    "end_date": "2024-02-15T10:00:00Z",
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "users": {
      "id": "vendor-uuid",
      "name": "John Vendor",
      "email": "john@vendor.com"
    },
    "plans": {
      "id": "plan-uuid",
      "name": "Premium Plan",
      "price": 29.99,
      "interval": "monthly"
    }
  }
}
```

**Error Responses:**

- **400 Bad Request:** Missing required fields, invalid UUID format, or vendor already has active subscription
- **403 Forbidden:** User is not a vendor
- **404 Not Found:** Plan not found
- **500 Internal Server Error:** Server error

## Automatic End Date Calculation

The system automatically calculates the subscription end date based on the plan's billing interval:

| Plan Interval | Duration Added | Example |
|---------------|----------------|---------|
| `monthly` | +1 month | Jan 15 → Feb 15 |
| `quarterly` | +3 months | Jan 15 → Apr 15 |
| `half-yearly` | +6 months | Jan 15 → Jul 15 |
| `yearly` | +1 year | Jan 15, 2024 → Jan 15, 2025 |

**Behavior:**
- The `start_date` is **always set to the current timestamp** (immediate activation)
- The `end_date` is **always automatically calculated** based on the plan's interval
- Manual `start_date` and `end_date` specification is not allowed to ensure consistency
- If the plan has an unrecognized interval, it defaults to monthly (+1 month)

**Examples:**
```javascript
// Monthly plan (starts immediately)
auto_start_date: "2024-01-15T10:30:45Z" // Current timestamp
auto_calculated_end_date: "2024-02-15T10:30:45Z"

// Yearly plan (starts immediately)
auto_start_date: "2024-01-15T10:30:45Z" // Current timestamp
auto_calculated_end_date: "2025-01-15T10:30:45Z"

// Quarterly plan (handles month-end dates automatically)
auto_start_date: "2024-01-31T10:30:45Z" // Current timestamp
auto_calculated_end_date: "2024-04-30T10:30:45Z" // Adjusts for shorter months
```

## Validation Rules

1. **Required Fields:** `plan_id` is mandatory
2. **UUID Format:** `plan_id` must be a valid UUID
3. **Vendor Authentication:** User must be authenticated as a vendor
4. **Plan Existence:** Plan must exist and be active
5. **Automatic Start Date:** Start date is always set to current timestamp (immediate activation)
6. **Automatic End Date:** End date is always calculated based on plan interval (no manual override)
7. **Date Validation:** End date is automatically ensured to be after start date
8. **Duplicate Prevention:** Vendor cannot have multiple active subscriptions to the same plan
9. **Self-Assignment Only:** Vendors can only assign plans to themselves

## Files Modified/Created

### Backend Files
- `backend/routes/subscription.routes.js` - New subscription routes with vendor authorization
- `backend/controllers/subscription.controller.js` - New subscription controller with assignPlan function
- `backend/utils/dateCalculator.js` - New utility for date calculations and interval handling
- `backend/middlewares/auth.js` - Added authorizeVendor middleware
- `backend/server.js` - Added subscription routes

### Database Files
- `database/create_user_subscriptions_table.sql` - SQL script to create the table
- `create-user-subscriptions-table.js` - Node.js script to run the migration

### Testing Files
- `test-assign-plan.js` - Test script to verify functionality
- `test-vendor-assign-plan.js` - Test script specifically for vendor assignment
- `test-interval-calculation.js` - Test script to verify interval-based end date calculation
- `test-date-calculator.js` - Test script for date calculator utility functions

## Setup Instructions

1. **Create the user_subscriptions table:**
   ```bash
   node create-user-subscriptions-table.js
   ```

2. **Test the functionality:**
   ```bash
   node test-assign-plan.js
   node test-vendor-assign-plan.js
   node test-interval-calculation.js
   node test-date-calculator.js
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

## Usage Examples

### Using cURL

```bash
# Assign a plan to yourself (as a vendor) - both dates automatically set
curl -X POST http://localhost:5000/api/subscriptions/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VENDOR_TOKEN" \
  -d '{
    "plan_id": "987fcdeb-51a2-43d1-b123-456789abcdef"
  }'
```

### Using JavaScript/Fetch

```javascript
// Both start_date and end_date automatically set
const response = await fetch('/api/subscriptions/assign', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${vendorToken}`
  },
  body: JSON.stringify({
    plan_id: 'plan-uuid-here'
    // start_date is set to current timestamp
    // end_date is automatically calculated based on plan interval
  })
});

const result = await response.json();
console.log('Subscription created:', result.data);
```

## Benefits of Fully Automatic Dates

### Business Benefits
- **Immediate Activation**: Subscriptions start instantly when assigned
- **Consistent Billing**: All subscriptions follow exact plan intervals
- **No User Errors**: Eliminates incorrect manual date calculations
- **Simplified Process**: Users only need to select a plan
- **Billing Integrity**: Ensures proper revenue recognition and billing cycles

### Technical Benefits
- **Reduced Complexity**: Minimal API with only plan_id required
- **Better Performance**: No date validation overhead
- **Consistent Data**: All subscriptions follow the same calculation logic
- **Easier Testing**: Predictable behavior for all scenarios
- **Audit Trail**: Clear timestamp of when subscription was created

### User Experience Benefits
- **One-Click Subscription**: Simplest possible subscription process
- **No Confusion**: No need to understand billing cycles or calculate dates
- **Instant Access**: Immediate activation of plan benefits
- **Error-Free**: No possibility of date-related mistakes

## Security Considerations

- Only authenticated vendors can assign plans to themselves
- All inputs are validated for proper UUID format
- Foreign key constraints ensure data integrity
- Duplicate active subscriptions are prevented
- Self-assignment only - vendors cannot assign plans to other users
- Automatic timestamps prevent date manipulation

## Future Enhancements

Potential future improvements could include:
- Bulk plan assignment
- Plan upgrade/downgrade functionality
- Subscription renewal automation
- Usage tracking and limits
- Payment integration for automatic billing
