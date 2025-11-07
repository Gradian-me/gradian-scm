# Schema Manager Usage Examples

## Complete End-to-End Example

### 1. Define Your Schema with UI Config

```typescript
// domains/vendor/schemas/vendor-form.schema.ts
import { FormSchema } from '../types/form-schema';

export const vendorFormSchema: FormSchema = {
  id: 'vendor-form',
  name: 'Vendor Form',
  title: 'Create New Vendor',
  
  // UI Configuration - Everything happens here!
  ui: {
    entityName: 'Vendor',
    createTitle: 'Create New Vendor',
    editTitle: 'Edit Vendor',
    basePath: 'vendors',
    filters: {
      status: {
        type: 'all',
        options: ['all', 'ACTIVE', 'INACTIVE', 'PENDING']
      },
      category: {
        type: 'all',
        options: ['all', 'technology', 'manufacturing']
      }
    }
  },
  
  // Your form sections
  sections: [
    {
      id: 'basic-information',
      title: 'Vendor Information',
      fields: [
        {
          id: 'company-name',
          name: 'name',
          label: 'Company Name',
          type: 'text',
          required: true,
          validation: {
            required: true,
            minLength: 2
          }
        },
        // ... more fields
      ]
    }
  ]
};
```

### 2. Create Your Domain Hook

```typescript
// domains/vendor/hooks/useVendorUI.ts
import { useSchemaManager } from '../../../gradian-ui/schema-manager';
import { vendorFormSchema } from '../schemas/vendor-form.schema';
import { Vendor } from '../types';

export const useVendorUI = () => {
  // That's it! Everything is auto-generated from the schema
  return useSchemaManager<Vendor>(vendorFormSchema);
};
```

### 3. Use in Your Components

```typescript
// components/VendorList.tsx
import { useVendorUI } from '../hooks/useVendorUI';

const VendorList = () => {
  const {
    // Modal management
    isCreateModalOpen,
    openCreateModal,
    openEditModal,
    closeModal,
    modalTitle,
    
    // Form state
    formState,
    
    // Search & filters
    searchTerm,
    handleSearch,
    handleFilterChange,
    currentFilters,
    
    // Actions
    handleDeleteEntity,
    handleViewEntity
  } = useVendorUI();

  return (
    <div>
      {/* Search */}
      <input 
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search vendors..."
      />
      
      {/* Filters */}
      <select onChange={(e) => handleFilterChange('status', e.target.value)}>
        <option value="all">All Status</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
      </select>
      
      {/* Create Button */}
      <button onClick={openCreateModal}>
        Create New Vendor
      </button>
      
      {/* List */}
      {vendors.map(vendor => (
        <div key={vendor.id}>
          <h3>{vendor.name}</h3>
          <button onClick={() => openEditModal(vendor)}>Edit</button>
          <button onClick={() => handleDeleteEntity(vendor)}>Delete</button>
        </div>
      ))}
      
      {/* Modal */}
      {isCreateModalOpen && (
        <Modal title={modalTitle}>
          {/* Your form component */}
          <VendorForm 
            formState={formState}
            onCancel={closeModal}
          />
        </Modal>
      )}
    </div>
  );
};
```

### 4. Form Auto-Population

When you call `openEditModal(entity)`, the form is automatically populated with all fields:

```typescript
const handleEdit = (vendor: Vendor) => {
  openEditModal(vendor);
  
  // This automatically calls:
  // formState.setValue('name', vendor.name);
  // formState.setValue('email', vendor.email);
  // formState.setValue('phone', vendor.phone);
  // ... for ALL fields in your schema!
};
```

### 5. With Custom Handlers

```typescript
// Add custom handlers to the schema
export const vendorFormSchema: FormSchema = {
  // ... other config
  
  ui: {
    entityName: 'Vendor',
    createTitle: 'Create New Vendor',
    editTitle: 'Edit Vendor',
    basePath: 'vendors',
    
    // Custom delete handler
    onDelete: async (vendor: Vendor) => {
      const confirmed = await showDeleteConfirm(vendor.name);
      if (confirmed) {
        await deleteVendorAPI(vendor.id);
      }
    },
    
    // Custom view handler
    onView: (vendor: Vendor) => {
      router.push(`/vendors/${vendor.id}/details`);
    }
  }
};
```

## Advanced: Adding Custom Logic

```typescript
export const useVendorUI = () => {
  const manager = useSchemaManager<Vendor>(vendorFormSchema);
  
  // Add custom logic
  const handleCustomAction = useCallback((vendor: Vendor) => {
    // Your custom logic
  }, []);
  
  return {
    ...manager,
    handleCustomAction,
  };
};
```

## Example for Different Entity: Tender

### Schema

```typescript
export const tenderFormSchema: FormSchema = {
  id: 'tender-form',
  name: 'Tender Form',
  
  ui: {
    entityName: 'Tender',
    createTitle: 'Create New Tender',
    editTitle: 'Edit Tender',
    basePath: 'tenders',
    filters: {
      status: {
        type: 'all',
        options: ['all', 'draft', 'published', 'closed']
      }
    }
  },
  
  sections: [...]
};
```

### Hook

```typescript
export const useTenderUI = () => 
  useSchemaManager<Tender>(tenderFormSchema);
```

**Same pattern, different entity!**

## Key Points

1. **Single Source of Truth**: Everything comes from the schema
2. **No Boilerplate**: Auto-generated handlers
3. **Type-Safe**: Full TypeScript support
4. **Reusable**: Same pattern for all entities
5. **Auto-Population**: Forms populate automatically
6. **Consistent**: Same behavior everywhere

## Benefits Summary

| Aspect | Traditional | With Schema Manager |
|--------|-------------|---------------------|
| Lines of code | 200+ | 10-20 |
| Boilerplate | Manual | Auto-generated |
| Maintenance | Multiple files | One schema |
| Type safety | Manual | Automatic |
| Consistency | Varies | Guaranteed |

## See Also

- `README.md` - Framework overview
- `src/domains/vendor` - Complete working example

