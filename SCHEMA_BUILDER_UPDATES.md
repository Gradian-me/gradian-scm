# Schema Builder UI/UX Enhancements

## Status Summary

### ✅ Completed
1. **Removed `name` and `title`** from FormSchema - now using only `id`, `singular_name`, and `plural_name`
2. **Fixed build errors** - all TypeScript errors resolved
3. **Created Accordion component** - Radix UI accordion ready for use
4. **Created ConfirmationAlert component** - modern alert dialog using Radix UI

### 🔧 Remaining Work

The following enhancements need to be implemented in `src/app/builder/schemas/[schema-id]/page.tsx`:

#### 1. Accordion for Fields
Replace the current expand/collapse with Accordion component:
- Import Accordion from `@/components/ui/accordion`
- Wrap fields list in Accordion with one AccordionItem per field
- Each field becomes collapsible independently

#### 2. Modern Minimal Field Cards
Redesign field cards to be cleaner:
- Remove heavy borders, use subtle shadows
- Simplify the layout with better spacing
- Make the reorder handles more visible but less intrusive
- Better typography hierarchy

#### 3. Unique Name Validation
Add validation before save:
```typescript
const validateUniqueNames = () => {
  // Check section titles are unique
  const sectionTitles = schema.sections.map(s => s.title);
  const duplicateSections = sectionTitles.filter((t, i) => sectionTitles.indexOf(t) !== i);
  
  // Check field names are unique
  const fieldNames = schema.fields.map(f => f.name);
  const duplicateFields = fieldNames.filter((n, i) => fieldNames.indexOf(n) !== i);
  
  return { valid: duplicateSections.length === 0 && duplicateFields.length === 0, errors: ... };
};
```

#### 4. Add Field Button Style
Match the RepeatingSection add button:
- Full width button at the end
- Dashed border style
- Plus icon in center
- Purple hover state

#### 5. Section Reorder Dialog
Create a dialog with simple drag list:
- Import `@dnd-kit/sortable` for drag functionality
- Display only section names
- Minimal interface for quick reordering
- Apply changes to schema order

#### 6. Replace Browser Alerts
Replace all `alert()` and `confirm()` calls:
- Use ConfirmationAlert component
- Create a state-managed alert system
- Better UX with styled dialogs

## Implementation Priority
1. Unique validation (critical for data integrity)
2. Accordion for fields (better UX)
3. Modern field cards (visual polish)
4. Alert system (UX improvement)
5. Add button style (consistency)
6. Section reorder (nice-to-have)

## Files to Modify
- `src/app/builder/schemas/[schema-id]/page.tsx` - Main schema editor
- Add: `src/components/ui/alert-dialog.tsx` if missing
- Consider: Creating separate components for field/section editors

