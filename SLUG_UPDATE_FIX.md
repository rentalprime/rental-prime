# Category Slug Auto-Update Fix

## Problem
When updating a category name through the frontend, the slug was not being automatically updated to reflect the new name. This happened because:

1. The frontend form only sends the `name` field when updating a category
2. The backend only updated the slug if a `slug` field was explicitly provided in the request
3. Since no `slug` was provided, the old slug remained unchanged

## Solution
Modified the `updateCategory` function in `backend/controllers/category.controller.js` to automatically regenerate the slug whenever the category name is updated.

### Changes Made

**Before:**
```javascript
// Update slug if provided
if (slug !== undefined) {
  const newSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  // ... validation logic
  updateData.slug = newSlug;
}
```

**After:**
```javascript
// Update slug if provided OR if name is being updated
let newSlug = null;
if (slug !== undefined) {
  // Use provided slug
  newSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
} else if (name !== undefined) {
  // Auto-generate slug from new name
  newSlug = name.trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// If we have a new slug, validate it's unique
if (newSlug) {
  // ... validation logic
  updateData.slug = newSlug;
}
```

## How It Works Now

1. **Manual Slug Update**: If a `slug` field is provided in the request, it uses that slug
2. **Automatic Slug Generation**: If no `slug` is provided but the `name` is being updated, it automatically generates a new slug from the new name
3. **Slug Validation**: In both cases, it validates that the new slug is unique before applying the update
4. **Error Handling**: If the generated slug conflicts with an existing category, it returns an error

## Examples

| Original Name | Original Slug | Updated Name | New Slug |
|---------------|---------------|--------------|----------|
| "Mobile Phones" | "mobile-phones" | "Smart Phones" | "smart-phones" |
| "Home & Garden" | "home-garden" | "Home Decor" | "home-decor" |
| "Sports Equipment" | "sports-equipment" | "Fitness Gear" | "fitness-gear" |

## Testing

Use the `test-slug-update.js` script to verify the functionality:

```bash
node test-slug-update.js
```

This script will:
1. Create a test category
2. Update its name
3. Verify the slug was automatically updated
4. Clean up the test data

## Backward Compatibility

This change is fully backward compatible:
- Existing API behavior is preserved
- Frontend code requires no changes
- Manual slug updates still work as before
- Only adds automatic slug generation when name changes

## Benefits

1. **User Experience**: Category slugs now stay in sync with category names
2. **SEO Friendly**: URLs automatically reflect current category names
3. **Maintenance**: Reduces manual work to keep slugs updated
4. **Consistency**: Ensures slug format is always consistent with naming conventions
