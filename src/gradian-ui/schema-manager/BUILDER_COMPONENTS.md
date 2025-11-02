# Schema Builder Components

## Quick Start

```tsx
import { SchemaBuilder } from '@/gradian-ui/schema-manager';

export default function BuilderPage() {
  return <SchemaBuilder schemaId="vendors" />;
}
```

## Components

### SchemaBuilder
Main builder component with tabs and all functionality built-in.

### FieldEditor
Individual field configuration with expandable details.

### SectionEditor
Section management with embedded field listing.

## Hooks

### useSchemaBuilder(config)
Complete state management for schema building.

```tsx
const { state, actions } = useSchemaBuilder({
  apiBaseUrl: '/api/schemas',
  onSave: async (schema) => { /* custom save */ },
});

// Use it
await actions.loadSchema('vendors');
await actions.saveSchema();
actions.addField('section-123');
```

## Utilities

- `getFieldsForSection(schema, sectionId)` - Get section fields
- `validateSchema(schema)` - Validate entire schema
- `createEmptySchema()` - New empty schema
- `exportSchemaToJson(schema)` - Export to JSON
- `importSchemaFromJson(json)` - Import from JSON
- `FIELD_TYPES` - Available field types
- `ROLES` - Available roles

See full documentation in `docs/SCHEMA_BUILDER.md`.

