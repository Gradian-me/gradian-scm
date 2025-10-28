// Unified Form Schema - Simplified approach

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'password' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'datetime-local' | 'file';
  component: 'text' | 'email' | 'tel' | 'number' | 'password' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'datetime-local' | 'file';
  placeholder?: string;
  icon?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  role?: 'title' | 'subtitle' | 'description' | 'image' | 'avatar' | 'icon' | 'rating' | 'badge' | 'status' | 'email' | 'location' | 'tel';
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    min?: number;
    max?: number;
    custom?: (value: any) => { isValid: boolean; error?: string };
  };
  options?: Array<{ label: string; value: string; disabled?: boolean; icon?: string; color?: string }>;
  defaultValue?: any;
  ui?: {
    width?: string;
    order?: number;
    colSpan?: number; // Number of columns this field should span
    rowSpan?: number;
    variant?: 'default' | 'outlined' | 'filled' | 'underlined';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
  };
  display?: {
    type?: 'text' | 'number' | 'currency' | 'percentage' | 'array' | 'computed';
    displayType?: 'badges' | 'list' | 'grid';
    maxDisplay?: number;
    showMore?: boolean;
    truncate?: boolean;
  };
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  columns?: number; // Default: 2 if not specified
  gap?: number;
  styling?: {
    variant?: 'default' | 'card' | 'minimal';
    className?: string;
  };
  isRepeatingSection?: boolean;
  repeatingConfig?: {
    minItems?: number;
    maxItems?: number;
    addButtonText?: string;
    removeButtonText?: string;
    emptyMessage?: string;
    itemTitle?: (index: number) => string;
  };
  initialState?: 'expanded' | 'collapsed';
}

export interface CardSection {
  id: string;
  title: string;
  colSpan?: number;
  fieldIds: string[];
}

export interface FormSchema {
  id: string;
  name: string;
  title: string;
  description?: string;
  singular_name?: string;
  plural_name?: string;
  sections: FormSection[];
  cardMetadata?: CardSection[];
  layout?: {
    direction?: 'column' | 'row';
    gap?: number;
    spacing?: 'sm' | 'md' | 'lg';
  };
  styling?: {
    variant?: 'default' | 'card' | 'minimal';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
  };
  actions?: {
    submit?: {
      label: string;
      variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' | 'gradient';
      loading?: string;
    };
    reset?: {
      label: string;
      variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' | 'gradient';
    };
    cancel?: {
      label: string;
      variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' | 'gradient';
    };
  };
  validation?: {
    mode?: 'onChange' | 'onBlur' | 'onSubmit';
    showErrors?: boolean;
    showSuccess?: boolean;
  };
}

export interface FormData {
  [key: string]: any;
}

export interface FormState {
  values: FormData;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  dirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
}