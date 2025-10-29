# Dynamic Schema System Implementation

## Overview

This document describes the implementation of a fully dynamic, schema-driven entity management system that eliminates hardcoded entity pages and enables scalable application development.

## What Was Built

### 1. Centralized Schema Registry (`src/shared/schemas/all-schemas.ts`)
- Moved vendor schema from domain-specific location to centralized registry
- Created `ALL_SCHEMAS` object to store all entity schemas
- Provides helper functions: `getAllSchemaIds()`, `schemaExists()`

### 2. Schema Registry Utilities (`src/shared/utils/schema-registry.ts`)
- `findSchemaById(schemaId)` - Find schema by ID (returns null if not found)
- `getSchemaById(schemaId)` - Get schema by ID (throws error if not found)
- `getAvailableSchemaIds()` - List all registered schema IDs
- `getSchemaMetadata(schemaId)` - Extract metadata from schema
- `isValidSchemaId(schemaId)` - Validate schema ID

### 3. Dynamic Entity Hook (`src/shared/hooks/use-dynamic-entity.ts`)
Generic hook for managing any entity based on schema:
- CRUD operations (create, read, update, delete)
- State management (loading, error, filters)
- Modal management (create/edit modals)
- Filter handling (search, status, category)
- Form state management

### 4. Dynamic Page Renderer (`src/components/dynamic/DynamicPageRenderer.tsx`)
Universal component that renders any entity page:
- Accepts schema and entity name as props
- Renders grid/list views
- Handles create/edit/delete operations
- Manages search and filtering
- Shows loading and error states
- Displays empty states
- Email validation for contacts

### 5. Dynamic Route (`src/app/page/[schema-id]/page.tsx`)
Next.js dynamic route that:
- Accepts any schema ID as URL parameter
- Fetches schema from registry
- Renders `DynamicPageRenderer` with schema
- Generates static params for all registered schemas
- Handles 404 for invalid schema IDs
- Auto-generates page metadata

### 6. API Request Utility Enhancement (`src/shared/utils/api.ts`)
Added `apiRequest<T>()` function:
- Generic API request function
- Supports all HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Returns standardized `ApiResponse<T>`
- Error handling built-in

## How It Works

### Adding a New Entity

1. **Define Schema** in `src/shared/schemas/all-schemas.ts`:
```typescript
export const productSchema: FormSchema = {
  id: 'products',
  name: 'products',
  title: 'Create New Product',
  singular_name: 'Product',
  plural_name: 'Products',
  sections: [/* ... */]
};

export const ALL_SCHEMAS: Record<string, FormSchema> = {
  vendors: vendorSchema,
  products: productSchema, // Register here
};
```

2. **Access Automatically**:
- Page available at: `/page/products`
- No additional code needed!

### Using Dynamic Schema in Existing Pages

```typescript
import { getSchemaById } from '@/shared/utils/schema-registry';

// Load schema dynamically
const mySchema = getSchemaById('vendors');

// Use with any component
<DynamicPageRenderer schema={mySchema} entityName="Vendor" />
```

## Files Created/Modified

### Created:
1. `src/shared/schemas/all-schemas.ts` - Central schema registry
2. `src/shared/utils/schema-registry.ts` - Schema utilities
3. `src/shared/hooks/use-dynamic-entity.ts` - Generic entity hook
4. `src/shared/hooks/index.ts` - Hooks barrel export
5. `src/components/dynamic/DynamicPageRenderer.tsx` - Universal page renderer
6. `src/app/page/[schema-id]/page.tsx` - Dynamic route
7. `src/shared/schemas/README.md` - Documentation
8. `DYNAMIC_SCHEMA_IMPLEMENTATION.md` - This file

### Modified:
1. `src/domains/vendor/schemas/vendor-form.schema.ts` - Re-exports from centralized schema
2. `src/domains/vendor/components/VendorPage.tsx` - Uses dynamic schema loading
3. `src/shared/utils/api.ts` - Added `apiRequest()` function

## Benefits

1. **Zero Hardcoding**: No entity-specific code in pages
2. **Single Source of Truth**: Schema defined once
3. **Automatic CRUD**: Full functionality generated from schema
4. **Type Safety**: Full TypeScript support throughout
5. **Scalability**: Add entities by just adding schema
6. **Maintainability**: Update schema, everything updates
7. **Consistency**: All entities use same UI/UX patterns
8. **DRY Principle**: Maximum code reuse

## Usage Examples

### Example 1: Access Vendor Page Dynamically
```
Navigate to: /page/vendors
```

### Example 2: Get Schema Programmatically
```typescript
import { getSchemaById } from '@/shared/utils/schema-registry';

const schema = getSchemaById('vendors');
console.log(schema.plural_name); // "Vendors"
```

### Example 3: Add New Entity (Tenders)
```typescript
// 1. Add to all-schemas.ts
export const tenderSchema: FormSchema = { /* ... */ };

export const ALL_SCHEMAS = {
  vendors: vendorSchema,
  tenders: tenderSchema, // Just add this line
};

// 2. Access at /page/tenders - Done!
```

## Migration Path

To fully migrate to dynamic system:

1. ✅ Move schema to centralized registry
2. ✅ Update existing imports to use `getSchemaById()`
3. ⏭️ Replace `/vendors` with `/page/vendors` route
4. ⏭️ Remove hardcoded `VendorPage` component
5. ⏭️ Repeat for other entities (tenders, purchase-orders, etc.)

## API Endpoint Convention

The dynamic system expects API endpoints following this pattern:
- List: `GET /{schema-id}`
- Get: `GET /{schema-id}/{id}`
- Create: `POST /{schema-id}`
- Update: `PUT /{schema-id}/{id}`
- Delete: `DELETE /{schema-id}/{id}`

Example for vendors:
- `GET /vendors`
- `POST /vendors`
- `PUT /vendors/123`
- `DELETE /vendors/123`

## Next Steps

1. Test the `/page/vendors` route
2. Add more entities (tenders, purchase-orders, shipments)
3. Gradually migrate existing entity pages
4. Remove domain-specific page components once migration is complete
5. Add more schema configurations (custom validation, conditional fields, etc.)

## Notes

- The system maintains backward compatibility
- Existing `/vendors` route continues to work
- Can gradually migrate to `/page/vendors`
- No breaking changes to existing functionality

