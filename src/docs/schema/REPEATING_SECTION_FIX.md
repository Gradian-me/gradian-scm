# Repeating Section Editing Fix

## Problem
Repeating section items (like vendor contacts) could be edited in **edit mode** but not in **new/create mode**. When typing in fields, the item card would disappear.

## Root Causes

### Cause 1: `useFormState` Hook Not Handling Nested Paths
**File**: `src/gradian-ui/shared/hooks/index.ts`

The `setValue` function in `useFormState` was treating nested paths like `contacts[0].name` as simple keys:
```typescript
// BEFORE (incorrect):
setValues(prev => ({ ...prev, [field]: value }));
// Result: { "contacts[0].name": "John" } ❌
```

**Fix**: Added regex pattern matching to detect and properly handle nested paths:
```typescript
// AFTER (correct):
const match = fieldStr.match(/^(.+)\[(\d+)\]\.(.+)$/);
if (match) {
  const [, sectionId, itemIndex, nestedField] = match;
  // Update nested structure correctly
  newArray[index] = { ...newArray[index], [nestedField]: value };
}
// Result: { contacts: [{ name: "John" }] } ✓
```

### Cause 2: `onFieldChange` Callback Causing Form Resets
**Files**: 
- `src/domains/vendor/components/VendorPage.tsx`
- `src/components/dynamic/DynamicPageRenderer.tsx`
- `src/domains/vendor/components/VendorDetailPage.tsx`

The `onFieldChange` callback was synchronizing every keystroke back to `vendorFormState.values`:
```typescript
// PROBLEMATIC CODE:
onFieldChange={(fieldName, value) => vendorFormState.setValue(fieldName as any, value)}
```

**The Problem Flow**:
1. User types in a repeating section field
2. `onFieldChange` updates `vendorFormState.values`
3. `initialValues` changes (because it references `vendorFormState.values`)
4. FormLifecycleManager detects `initialValues` change
5. Form **resets itself** with the new values
6. Item card disappears / input loses focus

**Fix**: Removed the `onFieldChange` callback entirely. The form manages its own internal state and only needs to sync on submit, not on every keystroke.

```typescript
// BEFORE:
<SchemaFormWrapper
  initialValues={vendorFormState.values}
  onFieldChange={(fieldName, value) => vendorFormState.setValue(fieldName as any, value)}
/>

// AFTER:
<SchemaFormWrapper
  initialValues={vendorFormState.values}
  // onFieldChange removed - form has its own state management
/>
```

## Why It Worked in Edit Mode
In edit mode, the form was initialized with complete existing data:
```typescript
initialValues={currentVendor ? {
  contacts: currentVendor.contacts || [],
  // ... other fields
} : vendorFormState.values}
```

Since `currentVendor` doesn't change during typing, the `initialValues` remained stable and didn't trigger resets.

## Why It Failed in New Mode
In new mode:
```typescript
initialValues={vendorFormState.values}
```

Every keystroke → `onFieldChange` → `vendorFormState.values` changes → `initialValues` changes → form resets!

## Changes Made

### 1. Updated `useFormState` Hook
**File**: `src/gradian-ui/shared/hooks/index.ts`
**Lines**: 55-100

Added nested path handling in the `setValue` function.

### 2. Removed `onFieldChange` Callbacks
**Files**:
- `src/domains/vendor/components/VendorPage.tsx` (line 485)
- `src/components/dynamic/DynamicPageRenderer.tsx` (line 469)
- `src/domains/vendor/components/VendorDetailPage.tsx` (line 514)

## Testing
1. Navigate to Vendors page
2. Click "Create New Vendor"
3. Scroll to "Contacts" section
4. Click "Add Contact"
5. Type in the contact fields (name, email, phone, etc.)
6. **Verify**: Fields should now accept input without disappearing ✅
7. Add multiple contacts and edit them
8. Submit the form and verify data is saved correctly

## Technical Details

### Form State Architecture
The `SchemaFormWrapper` component has its own internal state managed by a reducer:
- State updates: Handled by `formReducer` dispatching actions
- Field changes: Handled internally via `setValue` callback
- Validation: Managed internally
- Submission: Passes final values to `onSubmit`

**External state synchronization via `onFieldChange` is not needed** because:
1. The form's internal state is the source of truth
2. The parent only needs the final values on submit
3. Syncing every keystroke causes performance issues and reset loops

### useEffect Reset Detection
`FormLifecycleManager.tsx` (line 293-299):
```typescript
useEffect(() => {
  const currentInitialValues = JSON.stringify(initialValues);
  if (prevInitialValuesRef.current !== currentInitialValues) {
    dispatch({ type: 'RESET', initialValues, schema });
  }
}, [initialValues, schema]);
```

This watches for `initialValues` changes and resets the form. This is useful for edit mode when loading new entity data, but causes issues when `initialValues` is derived from a state that changes during typing.

## Lessons Learned
1. **Don't sync form state on every keystroke**: Forms should manage their own state
2. **Be careful with initialValues**: If they change during editing, the form will reset
3. **Nested paths need special handling**: Simple object spreading doesn't work for `contacts[0].name`
4. **Test both create and edit modes**: They may have different state management flows

## Status
✅ **FIXED** - Repeating sections now work correctly in both create and edit modes.

