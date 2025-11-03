# Dynamic Schema System

This directory contains the centralized schema registry for all entities in the application.

## Overview

The dynamic schema system allows you to define entity schemas once and automatically generate:
- Pages with full CRUD functionality
- Forms with validation
- Card views (grid/list)
- Filtering and search
- Modal dialogs

## Usage

### 1. Define a Schema

Add your schema to `data/all-schemas.json`:

```json
{
  "id": "my-entities",
  "singular_name": "My Entity",
  "plural_name": "My Entities",
  "description": "Add a new entity",
  "sections": [
    // ... define your sections
  ],
  "fields": [
    // ... define your fields
  ]
}
```

### 2. Access the Dynamic Page

Once registered, your entity page will be automatically available at:
```
/page/my-entities
```

### 3. Use Schema Utilities

```typescript
// Server-side
import { getSchemaById, findSchemaById } from '@/gradian-ui/schema-manager/utils/schema-registry.server';

// Client-side
import { fetchSchemaById } from '@/gradian-ui/schema-manager/utils/schema-registry';

// Get schema (throws error if not found) - Server-side only
const schema = await getSchemaById('vendors');

// Find schema (returns null if not found) - Server-side only
const maybeSchema = await findSchemaById('vendors');

// Fetch schema (works on both client and server)
const fetchedSchema = await fetchSchemaById('vendors');
```

## Benefits

1. **Single Source of Truth**: Schema defined once, used everywhere
2. **No Code Duplication**: Reusable components for all entities
3. **Easy Maintenance**: Update schema in one place
4. **Type Safety**: Full TypeScript support
5. **Scalability**: Add new entities without writing boilerplate

## Files

- `data/all-schemas.json` - Central schema registry (JSON format)
- `@/gradian-ui/schema-manager/utils/schema-registry.server.ts` - Server-side schema utilities
- `@/gradian-ui/schema-manager/utils/schema-registry.ts` - Client-side schema utilities
- `../../components/dynamic/DynamicPageRenderer.tsx` - Universal page renderer
- `../../shared/hooks/use-dynamic-entity.ts` - Generic entity hook
- `../../app/page/[schema-id]/page.tsx` - Dynamic route handler

## Migration Guide

To migrate existing entity pages:

1. Move schema definition to `all-schemas.ts`
2. Update imports to use `getSchemaById('entity-id')`
3. Test the `/page/[entity-id]` route
4. Gradually remove hardcoded pages in favor of dynamic routes

## Example

See the `vendors` entity as a reference implementation. It demonstrates:
- Schema definition with multiple sections
- Repeating sections (contacts)
- Field validation
- Custom roles (title, subtitle, badge, etc.)
- Card metadata for display

