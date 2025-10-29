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

Add your schema to `all-schemas.ts`:

```typescript
export const myEntitySchema: FormSchema = {
  id: 'my-entities',
  name: 'my-entities',
  title: 'Create New My Entity',
  description: 'Add a new entity',
  singular_name: 'My Entity',
  plural_name: 'My Entities',
  sections: [
    // ... define your fields
  ]
};

// Register in the ALL_SCHEMAS object
export const ALL_SCHEMAS: Record<string, FormSchema> = {
  vendors: vendorSchema,
  myEntities: myEntitySchema, // Add your schema here
};
```

### 2. Access the Dynamic Page

Once registered, your entity page will be automatically available at:
```
/page/my-entities
```

### 3. Use Schema Utilities

```typescript
import { getSchemaById, findSchemaById } from '@/shared/utils/schema-registry';

// Get schema (throws error if not found)
const schema = getSchemaById('vendors');

// Find schema (returns null if not found)
const maybeSchema = findSchemaById('vendors');
```

## Benefits

1. **Single Source of Truth**: Schema defined once, used everywhere
2. **No Code Duplication**: Reusable components for all entities
3. **Easy Maintenance**: Update schema in one place
4. **Type Safety**: Full TypeScript support
5. **Scalability**: Add new entities without writing boilerplate

## Files

- `all-schemas.ts` - Central schema registry
- `../utils/schema-registry.ts` - Helper utilities for finding schemas
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

