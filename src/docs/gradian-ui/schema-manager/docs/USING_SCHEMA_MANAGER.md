# Using Schema Manager - Complete Guide

## Quick Start

### For Any Entity

Just use `useEntity` with the entity name and schema:

```typescript
// In your component
import { useEntity } from '../../../gradian-ui/schema-manager';
import { vendorFormSchema } from '../schemas/vendor-form.schema';
import { Vendor } from '../types';

const MyComponent = () => {
  const {
    // Modal state
    isCreateModalOpen,
    isEditModalOpen,
    isModalOpen,
    modalTitle,
    
    // Form state
    vendorFormState,
    
    // Search & filters
    searchTerm,
    filterStatus,
    filterCategory,
    handleSearch,
    handleFilterChange,
    
    // Actions
    openCreateModal,
    openEditModal,
    closeCreateModal,
    closeEditModal,
    handleViewVendor,
    handleEditVendor,
    handleDeleteVendor,
  } = useEntity<Vendor>('Vendor', vendorFormSchema);
  
  // Use it!
};
```

## No Need for Domain-Specific Hooks

**Before:**
```typescript
// domains/vendor/hooks/useVendorUI.ts (46 lines)
export const useVendorUI = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // ... 40+ more lines of boilerplate
};
```

**After:**
```typescript
// Just import and use directly!
const vendorUI = useEntity<Vendor>('Vendor', vendorFormSchema);
```

**The file is completely removed!** ✨

## What's Auto-Generated

### From Entity Name + Schema

For `'Vendor'`:
- ✅ `handleViewVendor`
- ✅ `handleEditVendor`
- ✅ `handleDeleteVendor`
- ✅ `vendorFormState`
- ✅ `filterStatus` (from filterStates)
- ✅ `filterCategory` (from filterStates)

For `'Tender'`:
- ✅ `handleViewTender`
- ✅ `handleEditTender`
- ✅ `handleDeleteTender`
- ✅ `tenderFormState`

## Complete Examples

### Vendor Page

```typescript
import { useEntity } from '../../../gradian-ui/schema-manager';
import { vendorFormSchema } from '../schemas/vendor-form.schema';
import { Vendor } from '../types';

export function VendorPage() {
  const {
    // State
    searchTerm,
    filterStatus,
    isCreateModalOpen,
    isEditModalOpen,
    vendorFormState,
    
    // Handlers
    handleSearch,
    handleFilterChange,
    openCreateModal,
    openEditModal,
    closeModal,
    handleViewVendor,
    handleEditVendor,
    handleDeleteVendor,
  } = useEntity<Vendor>('Vendor', vendorFormSchema);
  
  return (
    <div>
      <input onChange={e => handleSearch(e.target.value)} />
      <button onClick={openCreateModal}>Add Vendor</button>
      {vendors.map(vendor => (
        <button onClick={() => handleEditVendor(vendor)}>Edit</button>
      ))}
    </div>
  );
}
```

### Any Entity (Tender Example)

```typescript
import { useEntity } from '../../../gradian-ui/schema-manager';
import { tenderFormSchema } from '../schemas/tender-form.schema';
import { Tender } from '../types';

export function TenderPage() {
  const {
    // Same structure for any entity!
    searchTerm,
    tenderFormState,
    handleSearch,
    openCreateModal,
    handleEditTender,
    handleDeleteTender,
  } = useEntity<Tender>('Tender', tenderFormSchema);
  
  // Works exactly the same!
}
```

## Key Benefits

1. **No Hook Files**: Completely removed domain-specific UI hooks
2. **Consistent**: Same interface for all entities
3. **Type-Safe**: Full TypeScript support
4. **Auto-Generated**: Everything from the schema
5. **Minimal Code**: Use entity hook directly

## Migration

**Old way:**
```typescript
import { useVendorUI } from '../hooks/useVendorUI';
const vendorUI = useVendorUI();
```

**New way:**
```typescript
import { useEntity } from '../../../gradian-ui/schema-manager';
const vendorUI = useEntity<Vendor>('Vendor', vendorFormSchema);
```

That's it! Everything else works the same.

