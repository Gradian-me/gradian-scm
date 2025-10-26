# Gradian UI

A comprehensive, configurable UI component library built for the Gradian Supply Chain Management system.

## Overview

Gradian UI provides a complete set of reusable, configurable components organized into logical domains. All components are designed to be data-driven and configuration-based, eliminating hardcoded values and promoting consistency across the application.

## Architecture

The library is organized into the following main domains:

### 🏗️ Form Builder
- **Form Elements**: TextInput, SelectInput, Textarea, Checkbox, RadioGroup
- **Form Wrapper**: FormWrapper, FormHeader, FormContent, FormFooter, FormActions

### 🎨 Layout
- **Grid Builder**: GridBuilder, GridItem, GridRow, GridColumn
- **Header**: Header, HeaderBrand, HeaderNavigation, HeaderActions
- **Profile Selector**: ProfileSelector, ProfileDropdown, ProfileItem
- **Notification Bar**: NotificationBar, NotificationContainer, NotificationItem

### 📊 Analytics
- **Charts**: Line, Bar, Pie, Donut charts
- **Indicators**: KPI indicators with trends and progress

### 📋 Data Display
- **Card**: Card, CardHeader, CardContent, CardFooter, CardImage
- **List**: List components for data display

## Key Features

### 🎯 Configuration-Driven
All components accept configuration objects that define their behavior, styling, and data requirements.

### 🔧 Generic and Reusable
Components are designed to work with any data structure through configuration metadata.

### 🎨 Consistent Styling
Built on Tailwind CSS with consistent design tokens and theming support.

### ♿ Accessible
All components include proper ARIA attributes and keyboard navigation support.

### 📱 Responsive
Components adapt to different screen sizes and breakpoints.

### 🎭 Themeable
Support for light/dark themes and custom color schemes.

## Usage

### Basic Example

```tsx
import { FormWrapper, Card, KPIIndicator } from '@/gradian-ui';

// Form with configuration
const formConfig = {
  id: 'user-form',
  name: 'User Form',
  fields: [
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      validation: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
    }
  ]
};

// Card with configuration
const cardConfig = {
  id: 'user-card',
  name: 'User Card',
  title: 'John Doe',
  subtitle: 'Software Engineer',
  actions: [
    { id: 'edit', label: 'Edit', variant: 'primary' }
  ]
};

// KPI with configuration
const kpiConfig = {
  id: 'revenue-kpi',
  name: 'Revenue KPI',
  title: 'Total Revenue',
  format: 'currency',
  trend: { enabled: true, period: 'month' }
};

function MyComponent() {
  return (
    <div>
      <FormWrapper config={formConfig} onSubmit={handleSubmit} />
      <Card config={cardConfig} />
      <KPIIndicator config={kpiConfig} value={125000} previousValue={100000} />
    </div>
  );
}
```

### Using Hooks

```tsx
import { useFormState, useComponentData } from '@/gradian-ui';

function MyForm() {
  const { values, errors, setValue, validateForm } = useFormState({
    email: '',
    password: ''
  }, {
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { required: true, minLength: 8 }
  });

  return (
    <form>
      {/* Form fields */}
    </form>
  );
}
```

## Component Structure

Each component follows a consistent structure:

```
component-name/
├── components/          # React components
├── types/              # TypeScript type definitions
├── utils/              # Component-specific utilities
├── hooks/              # Component-specific hooks
├── configs/            # Default configurations
├── docs/               # Documentation and examples
└── index.ts            # Exports
```

## Configuration Schema

All components use a standardized configuration schema:

```typescript
interface ComponentConfig {
  id: string;
  name: string;
  type: string;
  props?: Record<string, any>;
  children?: ComponentConfig[];
  metadata?: {
    description?: string;
    version?: string;
    author?: string;
    lastModified?: string;
  };
}
```

## Theming

The library supports theming through configuration:

```typescript
import { defaultTheme, darkTheme } from '@/gradian-ui';

// Use default theme
<Component theme={defaultTheme} />

// Use dark theme
<Component theme={darkTheme} />

// Custom theme
<Component theme={{
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  // ... other theme properties
}} />
```

## Best Practices

1. **Always use configuration objects** instead of hardcoded props
2. **Leverage hooks** for state management and data fetching
3. **Use TypeScript** for better type safety
4. **Follow the component structure** for consistency
5. **Document your configurations** for better maintainability

## Contributing

When adding new components:

1. Follow the established folder structure
2. Include comprehensive TypeScript types
3. Add configuration support
4. Include documentation and examples
5. Add proper accessibility attributes
6. Test with different themes and screen sizes

## License

This library is part of the Gradian Supply Chain Management system.
