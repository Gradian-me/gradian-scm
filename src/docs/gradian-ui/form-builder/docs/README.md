# Form Builder Components

The Form Builder domain provides comprehensive form components that are fully configurable and data-driven.

## Components

### Form Elements

#### TextInput
A versatile text input component supporting various input types and validation.

**Props:**
- `config: FormFieldConfig` - Configuration object
- `value: any` - Current value
- `onChange: (value: any) => void` - Change handler
- `error?: string` - Error message
- `disabled?: boolean` - Disabled state

**Example:**
```tsx
const textInputConfig = {
  name: 'email',
  label: 'Email Address',
  type: 'email',
  placeholder: 'Enter your email',
  validation: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
};

<TextInput
  config={textInputConfig}
  value={email}
  onChange={setEmail}
  error={errors.email}
/>
```

#### SelectInput
Dropdown select component with search and multi-select support.

**Props:**
- `config: FormFieldConfig` - Configuration object
- `options: Array<{label: string, value: any}>` - Options array
- `multiple?: boolean` - Multi-select mode
- `searchable?: boolean` - Search functionality
- `clearable?: boolean` - Clear button

**Example:**
```tsx
const selectConfig = {
  name: 'country',
  label: 'Country',
  type: 'select',
  validation: { required: true }
};

<SelectInput
  config={selectConfig}
  options={countries}
  searchable
  clearable
/>
```

#### Textarea
Multi-line text input with resize options.

**Props:**
- `config: FormFieldConfig` - Configuration object
- `rows?: number` - Number of rows
- `resize?: 'none' | 'both' | 'horizontal' | 'vertical'` - Resize behavior

#### Checkbox
Single checkbox input with validation.

**Props:**
- `config: FormFieldConfig` - Configuration object
- `checked?: boolean` - Checked state
- `indeterminate?: boolean` - Indeterminate state

#### RadioGroup
Radio button group with multiple options.

**Props:**
- `config: FormFieldConfig` - Configuration object
- `options: Array<{label: string, value: any}>` - Options array
- `direction?: 'horizontal' | 'vertical'` - Layout direction

### Form Wrapper

#### FormWrapper
Main form container with validation and state management.

**Props:**
- `config: FormConfig` - Form configuration
- `onSubmit?: (data: Record<string, any>) => void` - Submit handler
- `onReset?: () => void` - Reset handler
- `initialValues?: Record<string, any>` - Initial form values
- `validationMode?: 'onChange' | 'onBlur' | 'onSubmit'` - Validation timing

**Example:**
```tsx
const formConfig = {
  id: 'user-form',
  name: 'User Form',
  title: 'Create User',
  fields: [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      validation: { required: true }
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      validation: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
    }
  ],
  actions: {
    submit: { label: 'Create User', variant: 'primary' },
    reset: { label: 'Reset', variant: 'secondary' }
  }
};

<FormWrapper
  config={formConfig}
  onSubmit={handleSubmit}
  onReset={handleReset}
/>
```

#### FormHeader
Form header with title and description.

**Props:**
- `title?: string` - Form title
- `description?: string` - Form description
- `icon?: React.ReactNode` - Header icon
- `actions?: React.ReactNode` - Header actions

#### FormContent
Form content area with field layout.

**Props:**
- `fields: FormElementConfig[]` - Form fields
- `values: Record<string, any>` - Form values
- `errors: Record<string, string>` - Field errors
- `onChange: (fieldName: string, value: any) => void` - Change handler
- `layout?: LayoutConfig` - Layout configuration

#### FormFooter
Form footer with action buttons.

**Props:**
- `actions?: FormActionProps[]` - Action buttons
- `onSubmit?: () => void` - Submit handler
- `onReset?: () => void` - Reset handler
- `disabled?: boolean` - Disabled state

## Configuration Schema

### FormFieldConfig
```typescript
interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'file';
  placeholder?: string;
  validation?: ValidationRule;
  options?: Array<{ label: string; value: any }>;
  defaultValue?: any;
  layout?: {
    width?: string;
    order?: number;
    hidden?: boolean;
  };
  styling?: {
    variant?: 'default' | 'outlined' | 'filled';
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  };
  behavior?: {
    autoFocus?: boolean;
    autoComplete?: string;
    readOnly?: boolean;
    disabled?: boolean;
  };
}
```

### FormConfig
```typescript
interface FormConfig {
  id: string;
  name: string;
  title?: string;
  description?: string;
  fields: FormElementConfig[];
  layout?: {
    columns?: number;
    gap?: number;
    direction?: 'row' | 'column';
  };
  actions?: {
    submit?: FormActionProps;
    reset?: FormActionProps;
    cancel?: FormActionProps;
  };
  validation?: {
    mode?: 'onChange' | 'onBlur' | 'onSubmit';
    showErrors?: boolean;
    showSuccess?: boolean;
  };
  styling?: {
    variant?: 'default' | 'card' | 'minimal';
    size?: 'sm' | 'md' | 'lg';
    spacing?: 'compact' | 'normal' | 'relaxed';
  };
}
```

## Validation Rules

```typescript
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}
```

## Usage Examples

### Simple Contact Form
```tsx
const contactFormConfig = {
  id: 'contact-form',
  name: 'Contact Form',
  title: 'Get in Touch',
  fields: [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      validation: { required: true, minLength: 2 }
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      validation: { required: true }
    },
    {
      name: 'message',
      label: 'Message',
      type: 'textarea',
      validation: { required: true, maxLength: 500 }
    }
  ],
  actions: {
    submit: { label: 'Send Message', variant: 'primary' }
  }
};
```

### Multi-Step Form
```tsx
const multiStepFormConfig = {
  id: 'registration-form',
  name: 'Registration Form',
  fields: [
    // Step 1: Personal Info
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      validation: { required: true }
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      validation: { required: true }
    },
    // Step 2: Account Info
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      validation: { required: true }
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      validation: { required: true, minLength: 8 }
    }
  ]
};
```

## Best Practices

1. **Use configuration objects** instead of hardcoded props
2. **Leverage validation rules** for form validation
3. **Use FormWrapper** for complex forms with multiple fields
4. **Implement proper error handling** and user feedback
5. **Test with different validation scenarios**
6. **Follow accessibility guidelines** for form elements
