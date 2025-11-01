# Domain Removal Migration Plan

## Overview

The `domains/vendor`, `domains/tender`, and `domains/purchase-order` folders can be removed as they have been replaced by the new dynamic schema-based system at `/page/[schema-id]`.

## Current State

### ✅ Dynamic System (Replaces Old Domains)

**Location**: `src/app/page/[schema-id]/`

**How It Works**:
- Reads schemas from `data/all-schemas.json`
- Generates pages dynamically based on schema
- Uses `DynamicPageRenderer` + `useDynamicEntity` hook
- Handles vendors, tenders, purchase-orders, products, etc. generically

**Key Files**:
- `src/components/dynamic/DynamicPageRenderer.tsx` - Main renderer
- `src/shared/hooks/use-dynamic-entity.ts` - Generic CRUD hook
- `src/app/api/data/[schema-id]/route.ts` - Dynamic API

### ❌ Old Domain System (Can Be Removed)

**Locations**:
- `src/domains/vendor/`
- `src/domains/tender/`
- `src/domains/purchase-order/`

**What They Do**:
- Domain-specific components (VendorPage, TenderPage, etc.)
- Domain-specific services, repositories, hooks
- Old stores (vendor.store.ts, tender.store.ts, purchase-order.store.ts)

## Files Currently Using Old Domains

### 1. Route Pages (Need Migration)

**Current**:
```typescript
// src/app/vendors/page.tsx
import { VendorPage } from '@/domains/vendor/components/VendorPage';
export default function VendorsPage() {
  return <VendorPage />;
}

// src/app/tenders/page.tsx
import { TenderPage } from '@/domains/tender/components/TenderPage';

// src/app/purchase-orders/page.tsx
import { PurchaseOrderPage } from '@/domains/purchase-order/components/PurchaseOrderPage';
```

**Migration**: These pages can be deleted as dynamic pages at `/page/vendors`, `/page/tenders`, `/page/purchase-orders` already work.

### 2. Dynamic System Still Imports Domain Components

**Issue Found**:
```typescript
// src/components/dynamic/DynamicPageRenderer.tsx
import { DynamicFilterPane } from '../../domains/vendor/components/DynamicFilterPane';
import { asFormSchema } from '../../domains/vendor/utils/schema-utils';
```

**Solution**: Move these generic components to `src/shared/`.

### 3. Stores (Need Cleanup)

**Files**:
- `src/stores/vendor.store.ts`
- `src/stores/tender.store.ts`
- `src/stores/purchase-order.store.ts`

**Solution**: These can be removed as `useDynamicEntity` replaces them.

## Migration Steps

### Step 1: Move Generic Components to Shared

#### 1.1 Move `DynamicFilterPane`

**From**: `src/domains/vendor/components/DynamicFilterPane.tsx`  
**To**: `src/shared/components/DynamicFilterPane.tsx`

**Action**:
1. Copy file to `src/shared/components/`
2. Update imports in `DynamicPageRenderer.tsx`
3. Delete original

#### 1.2 Move `asFormSchema` Utility

**From**: `src/domains/vendor/utils/schema-utils.ts`  
**To**: `src/shared/utils/schema-utils.ts`

**Action**:
1. Copy `asFormSchema` function to `src/shared/utils/schema-utils.ts`
2. Update imports in `DynamicPageRenderer.tsx`
3. Keep original if other parts of `schema-utils.ts` are still used

**Note**: `schema-utils.ts` also has domain-specific types. Move only `asFormSchema`.

### Step 2: Update DynamicPageRenderer Imports

**Before**:
```typescript
import { DynamicFilterPane } from '../../domains/vendor/components/DynamicFilterPane';
import { asFormSchema } from '../../domains/vendor/utils/schema-utils';
```

**After**:
```typescript
import { DynamicFilterPane } from '../../shared/components/DynamicFilterPane';
import { asFormSchema } from '../../shared/utils/schema-utils';
```

### Step 3: Delete Old Route Pages

Delete these files (dynamic routes already handle them):
- `src/app/vendors/page.tsx`
- `src/app/tenders/page.tsx`
- `src/app/purchase-orders/page.tsx`
- `src/app/vendors/[id]/page.tsx`
- `src/app/tenders/[id]/page.tsx`
- `src/app/purchase-orders/[id]/page.tsx`

### Step 4: Delete Domain Folders

**Folders to Remove**:
- `src/domains/vendor/`
- `src/domains/tender/`
- `src/domains/purchase-order/`

**Keep**:
- `src/domains/dashboard/` - Still actively used
- `src/domains/notifications/` - Still actively used

### Step 5: Delete Old Stores

**Files to Remove**:
- `src/stores/vendor.store.ts`
- `src/stores/tender.store.ts`
- `src/stores/purchase-order.store.ts`

**Keep**:
- `src/stores/dashboard.store.ts` - Still in use

### Step 6: Check for Other Dependencies

Search for any remaining imports:
```bash
grep -r "from.*domains/(vendor|tender|purchase-order)" src/
grep -r "from.*stores/(vendor|tender|purchase-order)" src/
```

## Testing After Migration

### Test Dynamic Routes

Verify these routes still work:
- `/page/vendors` - List all vendors
- `/page/vendors/123` - View vendor detail
- `/page/tenders` - List all tenders
- `/page/tenders/456` - View tender detail
- `/page/purchase-orders` - List all purchase orders
- `/page/purchase-orders/789` - View purchase order detail

### Test CRUD Operations

For each entity:
1. **Create**: Click "Add" button → Fill form → Submit
2. **Read**: View list, view detail, search/filter
3. **Update**: Click edit → Modify data → Save
4. **Delete**: Click delete → Confirm

### Test Navigation

Verify:
- Sidebar links work
- Breadcrumbs work
- Back buttons work

## Files to Keep in Domains

These are NOT part of the schema-based system:
- `domains/dashboard/` - Custom dashboard logic
- `domains/notifications/` - Notification system

These can remain as they serve specialized purposes.

## Benefits of Removal

1. **Reduced Code**: ~1500+ lines of duplicate code removed
2. **Single Source of Truth**: All entities use same renderer
3. **Easier Maintenance**: One system to maintain
4. **Consistency**: All entities behave the same way
5. **Easier to Add Entities**: Just add schema, no new domain code

## Rollback Plan

If issues arise:
1. Git revert the migration commits
2. Re-add deleted domain folders from git history
3. Restore old route pages

## Estimated Impact

- **Files Deleted**: ~40+ files
- **Lines Removed**: ~5000+ lines
- **Folders Removed**: 3 domain folders
- **Risk Level**: Low (dynamic system already working)
- **Testing Time**: 1-2 hours

## Next Steps

1. Review this migration plan
2. Create backup branch: `git checkout -b backup-before-domain-cleanup`
3. Execute migration steps in order
4. Test thoroughly
5. Remove backup branch if successful

