# Dynamic Schema System - JSON-Based Refactor

## Overview
Refactored the schema system from hardcoded TypeScript schemas to a fully dynamic JSON-based approach. All schemas are now stored in `data/all-schemas.json` and loaded dynamically at runtime.

## Changes Made

### 1. Created JSON Schema File
- **File**: `data/all-schemas.json`
- Contains all schemas in JSON format (RegExp patterns as strings)
- Easy to add new schemas without modifying TypeScript code

### 2. Created Schema API Endpoint
- **File**: `src/app/api/schemas/route.ts`
- Endpoint: `GET /api/schemas` - Returns all schemas
- Endpoint: `GET /api/schemas?id=vendors` - Returns specific schema
- Serves schemas from JSON file to both server and client

### 3. Refactored Schema Loader (Server-Side Only)
- **File**: `src/shared/utils/schema-loader.ts`
- Uses Node.js `fs` module (server-side only)
- Reads schemas from JSON file
- Converts string patterns to RegExp objects
- Protected against client-side imports

### 4. Updated Schema Registry (Universal)
- **File**: `src/shared/utils/schema-registry.ts`
- Works on both server and client side
- **Server-side functions** (synchronous):
  - `getSchemaById(id)` - Get schema or throw error
  - `findSchemaById(id)` - Get schema or return null
  - `schemaExists(id)` - Check if schema exists
  - `getAvailableSchemaIds()` - Get all schema IDs
  - `getAllSchemasArray()` - Get all schemas
  - `getSchemaMetadata(id)` - Get schema metadata
  
- **Client-side functions** (async):
  - `fetchSchemaById(id)` - Fetch schema from API
  - `fetchAllSchemas()` - Fetch all schemas from API
  - `fetchSchemaIds()` - Fetch all schema IDs
  - `schemaExistsAsync(id)` - Check if schema exists (async)

### 5. Deprecated Old Schema File
- **File**: `src/shared/schemas/all-schemas.ts`
- Now re-exports functions from schema-registry
- Contains deprecation notice
- Maintains backward compatibility

## How to Add a New Schema

1. Open `data/all-schemas.json`
2. Add your new schema object to the array:
```json
{
  "id": "products",
  "name": "products",
  "title": "Create New Product",
  "description": "Add a new product",
  "singular_name": "Product",
  "plural_name": "Products",
  "sections": [
    {
      "id": "basic-info",
      "title": "Basic Information",
      "fields": [
        {
          "id": "product-name",
          "name": "name",
          "label": "Product Name",
          "type": "text",
          "component": "text",
          "required": true,
          "validation": {
            "required": true
          }
        }
      ]
    }
  ]
}
```
3. Save the file
4. The schema is now available at `/page/products`
5. API endpoints automatically work at `/api/data/products`

## Benefits

✅ **No Hardcoding**: Add schemas by editing JSON, not TypeScript
✅ **Fully Dynamic**: Routes and APIs work automatically for any schema
✅ **Type-Safe**: Still uses TypeScript FormSchema interface
✅ **Server & Client Compatible**: Works seamlessly on both sides
✅ **Easy to Maintain**: All schemas in one JSON file
✅ **No Domain Folders Needed**: Remove domain-specific folders later

## Usage Examples

### Server-Side (Next.js Server Components, API Routes)
```typescript
import { getSchemaById } from '@/shared/utils/schema-registry';

// In a Server Component or API route
export default function Page() {
  const schema = getSchemaById('vendors'); // Synchronous
  return <div>{schema.title}</div>;
}
```

### Client-Side (React Components)
```typescript
'use client';
import { fetchSchemaById } from '@/shared/utils/schema-registry';

export default function ClientComponent() {
  const [schema, setSchema] = useState(null);
  
  useEffect(() => {
    fetchSchemaById('vendors').then(setSchema); // Async
  }, []);
  
  return <div>{schema?.title}</div>;
}
```

## Files Modified
- ✅ `data/all-schemas.json` - Created (all schemas)
- ✅ `src/app/api/schemas/route.ts` - Created (API endpoint)
- ✅ `src/shared/utils/schema-loader.ts` - Created (server-side loader)
- ✅ `src/shared/utils/schema-registry.ts` - Refactored (universal registry)
- ✅ `src/shared/schemas/all-schemas.ts` - Deprecated (backward compatibility)
- ✅ `src/domains/vendor/schemas/vendor-form.schema.ts` - Updated (uses registry)

## Next Steps
- Remove domain-specific folders (`src/domains/vendor`, etc.)
- All functionality now works through the dynamic schema system
- Add more schemas to `data/all-schemas.json` as needed

