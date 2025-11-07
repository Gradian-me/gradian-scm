# Schema Builder Component System

## Overview

The Schema Builder is a comprehensive, component-based system for creating and managing dynamic form schemas. It's built with modularity and scalability in mind.

## Architecture

### Directory Structure

```
schema-manager/
├── components/          # Reusable UI components
│   ├── FieldEditor.tsx  # Individual field configuration
│   ├── SectionEditor.tsx # Section with fields management
│   ├── SchemaBuilder.tsx # Main builder component
│   └── index.ts         # Component exports
├── hooks/               # State management hooks
│   ├── useSchemaBuilder.ts # Main builder hook
│   └── index.ts         # Hook exports
├── types/               # TypeScript types
│   ├── builder.ts       # Builder-specific types
│   └── index.ts         # Type exports
├── utils/               # Utility functions
│   ├── builder-utils.ts # Builder utilities
│   └── index.ts         # Utility exports
└── index.ts             # Main export
```

## Core Components

### 1. FieldEditor

**Purpose**: Edit individual form fields

**Props**: `FieldEditorProps`
- `field`: The field to edit
- `onUpdate`: Update handler
- `onDelete`: Delete handler
- `sections`: Available sections
- `canMoveUp/Down`: Reordering flags
- `onMoveUp/Down`: Move handlers

**Features**:
- Inline editing
- Field type selection
- Role assignment
- Validation options
- Visual state management

### 2. SectionEditor

**Purpose**: Manage sections with their fields

**Props**: `SectionEditorProps`
- `section`: Section data
- `fields`: Fields in section
- `onUpdate/Delete`: Section handlers
- `onAddField`: Field creation
- `onFieldUpdate/Delete/Move`: Field handlers
- `sections`: All sections
- `config`: Builder configuration

**Features**:
- Section metadata editing
- Field listing and management
- Drag-to-reorder support
- Collapsible interface

### 3. SchemaBuilder

**Purpose**: Main builder interface

**Features**:
- Tabbed interface (General/Sections)
- Schema-level settings
- Section and field management
- Loading and error states
- Save/cancel actions

## Hook: useSchemaBuilder

**Purpose**: Centralized state management

**Returns**: `{ state, actions }`

### State

```typescript
{
  schema: FormSchema | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  expandedSections: Set<string>;
  selectedTab: 'general' | 'sections';
  validationErrors: Record<string, string[]>;
}
```

### Actions

- `loadSchema(schemaId)` - Load from API
- `saveSchema()` - Save to API
- `deleteSchema()` - Delete schema
- `updateSchema(updates)` - Update schema fields
- `addSection()` - Create new section
- `updateSection(id, updates)` - Modify section
- `deleteSection(id)` - Remove section
- `addField(sectionId)` - Create field
- `updateField(id, updates)` - Modify field
- `deleteField(id)` - Remove field
- `moveField(sectionId, from, to)` - Reorder fields
- `toggleSection(id)` - Expand/collapse
- `validateSchema()` - Run validation
- `reset()` - Clear state

## Utilities

### Field Management

- `getFieldsForSection(schema, sectionId)` - Get section fields
- `getNextFieldOrder(schema, sectionId)` - Calculate order
- `generateFieldId()` - Create unique IDs
- `generateSectionId()` - Create unique IDs

### Validation

- `validateSchema(schema)` - Full validation
- Returns: `{ valid: boolean, errors: Record<string, string[]> }`

### Schema Operations

- `createEmptySchema()` - New schema
- `cloneSchema(schema, ...)` - Duplicate schema
- `exportSchemaToJson(schema)` - Export to JSON
- `importSchemaFromJson(json)` - Import from JSON
- `cleanSchema(schema)` - Fix orphaned fields

### Constants

- `FIELD_TYPES` - Available field types
- `ROLES` - Available field roles

## Types

### Builder Config

```typescript
SchemaBuilderConfig {
  apiBaseUrl?: string;
  onSave?: (schema) => Promise<void>;
  onDelete?: (schemaId) => Promise<void>;
  onCancel?: () => void;
  enableValidation?: boolean;
  enableReorder?: boolean;
  enableExport?: boolean;
  enableImport?: boolean;
}
```

### Component Props

All component props are fully typed in `types/builder.ts`.

## Usage Examples

### Basic Usage

```tsx
import { SchemaBuilder } from '@/gradian-ui/schema-manager';

function MyPage() {
  return <SchemaBuilder schemaId="vendors" />;
}
```

### With Custom Config

```tsx
import { SchemaBuilder, useSchemaBuilder } from '@/gradian-ui/schema-manager';

function CustomBuilder() {
  const config = {
    onSave: async (schema) => {
      // Custom save logic
    },
    enableExport: true,
    enableImport: true,
  };

  return <SchemaBuilder schemaId="vendors" config={config} />;
}
```

### Using the Hook Directly

```tsx
import { useSchemaBuilder } from '@/gradian-ui/schema-manager';

function MyComponent() {
  const { state, actions } = useSchemaBuilder({
    apiBaseUrl: '/api/schemas'
  });

  useEffect(() => {
    actions.loadSchema('vendors');
  }, []);

  return (
    <div>
      {state.schema && <div>{state.schema.title}</div>}
      <button onClick={actions.saveSchema}>Save</button>
    </div>
  );
}
```

### Individual Components

```tsx
import { FieldEditor } from '@/gradian-ui/schema-manager';

function MyFieldEditor() {
  const field = { id: '1', name: 'test', ... };
  const sections = [...];

  return (
    <FieldEditor
      field={field}
      onUpdate={(updates) => console.log(updates)}
      onDelete={() => console.log('delete')}
      sections={sections}
    />
  );
}
```

## Best Practices

1. **State Management**: Use the provided hook for all state
2. **Validation**: Run validation before saving
3. **Error Handling**: Always handle errors from async operations
4. **Component Reuse**: Use individual components for custom layouts
5. **Configuration**: Provide custom configs for flexibility
6. **Type Safety**: Leverage TypeScript types throughout

## Integration

The builder integrates seamlessly with:
- Existing form-builder components
- API routes (`/api/schemas`)
- Schema management utilities
- Dynamic page renderer

## Future Enhancements

- Advanced validation rules editor
- Drag-and-drop interface
- Visual preview mode
- Template library
- Collaboration features
- Version control
- Schema testing tools

