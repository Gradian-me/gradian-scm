# Schema Manager

**General framework for managing any schema-driven CRUD operations**

## Overview

Schema Manager is a complete framework that automatically generates:
- ✅ Zod validation schemas
- ✅ Form state management
- ✅ UI hooks with modal management
- ✅ Filter and search functionality
- ✅ CRUD handlers
- ✅ TypeScript types

**All from a single schema definition!**

## Quick Start

### Step 1: Add UI Config to Your Schema

```typescript
// domains/vendor/schemas/vendor-form.schema.ts
export const vendorFormSchema: FormSchema = {
  id: 'vendor-form',
  name: 'Vendor Form',
  title: 'Create New Vendor',
  
  // Add UI configuration
  ui: {
    entityName: 'Vendor',
    createTitle: 'Create New Vendor',
    editTitle: 'Edit Vendor',
    basePath: 'vendors',
    filters: {
      status: {
        type: 'all',
        options: ['all', 'ACTIVE', 'INACTIVE', 'PENDING']
      }
    }
  },
  
  sections: [...]
};
```

### Step 2: Use in Your Domain Hook

```typescript
// domains/vendor/hooks/useVendorUI.ts
import { useSchemaManager } from '../../../gradian-ui/schema-manager';
import { vendorFormSchema } from '../schemas/vendor-form.schema';

export const useVendorUI = () => {
  // Everything is auto-generated!
  return useSchemaManager<Vendor>(vendorFormSchema);
};
```

**That's it!** Everything is now auto-generated.

## What You Get

### Auto-Generated Schemas

```typescript
import { generateSchemasFromForm } from '../utils/schema-to-zod';

const {
  createSchema,    // Zod schema for creation
  updateSchema,    // Zod schema for updates
  validationRules, // For useFormState
  initialValues    // Default form values
} = generateSchemasFromForm(schema);
```

### Auto-Generated UI Hook

```typescript
const manager = useSchemaManager<YourEntity>(schema);

manager.formState           // Form state with validation
manager.openCreateModal()   // Open create modal
manager.openEditModal(entity) // Auto-populates form!
manager.handleSearch()      // Search functionality
manager.handleFilterChange() // Filters
manager.handleDeleteEntity() // Delete handler
```

## Available Functions

### `useSchemaManager<T>(schema: FormSchema)`

Main hook that generates everything for a schema with UI config.

**Returns:**
```typescript
{
  // Modal state
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  modalTitle: string;
  
  // Form state
  formState: FormState;
  
  // Search & filters
  searchTerm: string;
  filterStates: Record<string, any>;
  currentFilters: Record<string, any>;
  
  // Handlers
  openCreateModal: () => void;
  openEditModal: (entity: T) => void;
  handleSearch: (query: string) => void;
  handleFilterChange: (key: string, value: any) => void;
  
  // Manager methods
  getSchema: () => FormSchema;
  getConfig: () => SchemaManagerConfig;
  getSchemas: () => GeneratedSchemas<T>;
}
```

### `createDomainHook<T>(schema: FormSchema)`

Creates a domain-specific hook from a schema.

```typescript
export const useVendorUI = createDomainHook<Vendor>(vendorFormSchema);
```

### `generateSchemasFromForm(schema: FormSchema)`

Generates Zod schemas, validation rules, and initial values.

### `createEntityUIHook<T>(entityName, schema, config)`

Creates a UI hook with explicit configuration.

## Complete Example

### Schema Definition

```typescript
// domains/tender/schemas/tender-form.schema.ts
export const tenderFormSchema: FormSchema = {
  id: 'tender-form',
  name: 'Tender Form',
  title: 'Create New Tender',
  
  ui: {
    entityName: 'Tender',
    createTitle: 'Create New Tender',
    editTitle: 'Edit Tender',
    basePath: 'tenders',
    filters: {
      status: {
        type: 'all',
        options: ['all', 'draft', 'published', 'closed']
      },
      category: {
        type: 'all',
        options: ['all', 'technology', 'services']
      }
    }
  },
  
  sections: [
    {
      id: 'basic',
      title: 'Basic Information',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          validation: { required: true, minLength: 2 }
        }
      ]
    }
  ]
};
```

### Domain Hook

```typescript
// domains/tender/hooks/useTenderUI.ts
import { useSchemaManager } from '../../../gradian-ui/schema-manager';
import { tenderFormSchema } from '../schemas/tender-form.schema';
import { Tender } from '../types';

export const useTenderUI = () => {
  return useSchemaManager<Tender>(tenderFormSchema);
};
```

### Usage in Component

```typescript
const TenderList = () => {
  const {
    openCreateModal,
    openEditModal,
    handleDeleteEntity,
    handleSearch,
    formState
  } = useTenderUI();
  
  return (
    <>
      <button onClick={openCreateModal}>Create</button>
      <input onChange={e => handleSearch(e.target.value)} />
      {tenders.map(tender => (
        <button onClick={() => openEditModal(tender)}>Edit</button>
      ))}
    </>
  );
};
```

## Architecture

```
schema-manager/
├── index.ts              # Main exports
├── types/
│   └── index.ts         # TypeScript types
├── utils/
│   ├── schema-to-zod.ts    # Generates Zod schemas
│   └── schema-to-store.ts  # Generates UI hooks
├── hooks/
│   └── useSchemaManager.ts # Main hook
└── README.md            # This file
```

## Benefits

| Feature | Benefit |
|---------|---------|
| Single source of truth | Define once, use everywhere |
| Auto-generated | No boilerplate code |
| Type-safe | Full TypeScript support |
| Reusable | Works with any schema |
| Consistent | Same behavior for all entities |
| Maintainable | Update schema, everything updates |

## Migration Guide

### Before

```typescript
// Manual implementation
const [isOpen, setIsOpen] = useState(false);
const [searchTerm, setSearchTerm] = useState('');
const formState = useFormState({...}, {...});
const handleOpen = () => setIsOpen(true);
// ... 100+ lines of boilerplate
```

### After

```typescript
// Auto-generated from schema
export const useVendorUI = () => 
  useSchemaManager<Vendor>(vendorFormSchema);
```

## Next Steps

Apply to any domain:
- Tenders
- Purchase Orders
- Invoices
- Shipments
- Any CRUD operations

Just add `ui` config to your schema and you're done!

## See Also

- `SCHEMA_TO_ZOD_GUIDE.md` - Validation generation
- `SCHEMA_TO_STORE_GUIDE.md` - UI hook generation

