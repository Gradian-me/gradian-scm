// Form Schema Types for Dynamic Form Rendering

export interface FormField {
  id: string;
  name: string;
  label: string;
  sectionId: string; // Reference to the section this field belongs to
  type: 'text' | 'email' | 'tel' | 'number' | 'password' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'datetime-local' | 'file';
  component: 'text' | 'email' | 'tel' | 'number' | 'password' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'datetime-local' | 'file';
  placeholder?: string;
  icon?: string;
  displayType?: 'text' | 'number' | 'currency' | 'percentage' | 'array' | 'computed';
  truncate?: boolean;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  role?: 'title' | 'subtitle' | 'description' | 'image' | 'avatar' | 'icon' | 'rating' | 'badge' | 'status' | 'email' | 'location' | 'tel' | 'expiration';
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
  colSpan?: number; // Number of columns this field should span
  order?: number; // Order for field display
  // Keep layout and styling for backward compatibility
  layout?: {
    width?: string;
    rowSpan?: number;
    variant?: 'default' | 'outlined' | 'filled' | 'underlined';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
  };
  styling?: {
    variant?: 'default' | 'outlined' | 'filled' | 'underlined';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
  };
  conditional?: {
    dependsOn: string;
    condition: (value: any) => boolean;
  };
  // @deprecated - Use ui property instead. Kept for backward compatibility.
  display?: {
    icon?: string;
    type?: 'text' | 'number' | 'currency' | 'percentage' | 'array' | 'computed';
    source?: string;
    compute?: (data: any) => any;
    displayType?: 'badges' | 'list' | 'grid';
    maxDisplay?: number;
    showMore?: boolean;
    truncate?: boolean;
    format?: string;
  };
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  columns?: number; // Default: 2 if not specified
  gap?: number;
  // Keep layout for backward compatibility
  layout?: {
    columns?: number;
    gap?: number;
    direction?: 'row' | 'column';
  };
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
  initialState?: 'expanded' | 'collapsed'; // New property for initial state
}

export interface CardConfig {
  title: string;
  subtitle?: string;
  avatar?: string;
  status?: string;
  rating?: string;
  sections: Array<{
    id: string;
    title: string;
    fields: Array<{
      name: string;
      type: string;
      label: string;
    }>;
  }>;
}

export interface CardSection {
  id: string;
  title: string;
  colSpan?: number;
  fieldIds: string[];
}

export interface CardMetadata {
  id: string;
  name: string;
  title?: string;
  subtitle?: string;
  description?: string;
  avatar?: {
    field?: string;
    fallback?: string;
    imagePath?: string;
  };
  status?: {
    field?: string;
    colorMap?: Record<string, string>;
  };
  rating?: {
    field?: string;
    maxRating?: number;
    showValue?: boolean;
  };
  sections: Array<{
    id: string;
    title: string;
    width?: string; // Width percentage, defaults to '100%'
    colSpan?: number; // Number of columns to span in grid (1 or 2)
    fieldIds: string[]; // References to form field IDs
    // Section-level layout (overrides individual field displayType if needed)
    layout?: 'grid' | 'list';
    columns?: number;
  }>;
  styling?: {
    variant?: 'default' | 'minimal' | 'elevated' | 'outlined' | 'filled';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    rounded?: boolean;
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  };
  behavior?: {
    clickable?: boolean;
    hoverable?: boolean;
  };
  animations?: {
    stagger?: boolean;
    duration?: number;
    delay?: number;
  };
}

export interface ListMetadata {
  id: string;
  name: string;
  layout: {
    type: 'grid' | 'list';
    columns?: {
      default: number;
      sm?: number;
      md?: number;
      lg?: number;
      xl?: number;
    };
    gap?: number;
  };
  emptyState?: {
    icon: string;
    title: string;
    description: string;
    searchDescription?: string;
  };
  loadingState?: {
    skeleton?: boolean;
    count?: number;
  };
  animations?: {
    stagger?: boolean;
    duration?: number;
    delay?: number;
  };
}

export interface FormSchema {
  id: string;
  name: string;
  title: string;
  description?: string;
  fields: FormField[]; // All fields at schema level, each with a sectionId
  cardConfig?: CardConfig;
  cardMetadata?: CardSection[];
  listMetadata?: ListMetadata;
  sections: FormSection[]; // Sections no longer contain fields
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
  validation?: {
    mode?: 'onChange' | 'onBlur' | 'onSubmit';
    showErrors?: boolean;
    showSuccess?: boolean;
  };
  actions?: Array<'submit' | 'cancel' | 'reset'>;
  showActionsInModal?: boolean; // If true, actions will be rendered by Modal component, not in the form itself
}

export interface FormData {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormTouched {
  [key: string]: boolean | boolean[];
}

export interface FormState {
  values: FormData;
  errors: FormErrors;
  touched: FormTouched;
  dirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
}

export interface FormActions {
  setValue: (fieldName: string, value: any) => void;
  setError: (fieldName: string, error: string) => void;
  setTouched: (fieldName: string, touched: boolean) => void;
  validateField: (fieldName: string) => boolean;
  validateForm: () => boolean;
  reset: () => void;
  submit: () => Promise<void>;
  addRepeatingItem: (sectionId: string) => void;
  removeRepeatingItem: (sectionId: string, index: number) => void;
}

export interface FormContextType {
  state: FormState;
  actions: FormActions;
  schema: FormSchema;
}

export interface FormWrapperProps {
  schema: FormSchema;
  onSubmit: (data: FormData) => void | Promise<void>;
  onReset?: () => void;
  onFieldChange?: (fieldName: string, value: any) => void;
  initialValues?: FormData;
  validationMode?: 'onChange' | 'onBlur' | 'onSubmit';
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  onMount?: (submitFn: () => void) => void;
  hideActions?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;
}

export interface FormSectionProps {
  section: FormSection;
  schema: FormSchema; // Schema needed to get fields for the section
  values: FormData;
  errors: FormErrors;
  touched: FormTouched;
  onChange: (fieldName: string, value: any) => void;
  onBlur: (fieldName: string) => void;
  onFocus: (fieldName: string) => void;
  disabled?: boolean;
  repeatingItems?: any[];
  onAddRepeatingItem?: () => void;
  onRemoveRepeatingItem?: (index: number) => void;
  initialState?: 'expanded' | 'collapsed'; // New prop for initial state
  isExpanded?: boolean; // Controlled expanded state
  onToggleExpanded?: () => void; // Callback to toggle expanded state
}

export interface RepeatingSectionProps {
  section: FormSection;
  items: any[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItem: (item: any, index: number) => React.ReactNode;
  values: FormData;
  errors: FormErrors;
  touched: FormTouched;
  onChange: (fieldName: string, value: any) => void;
  onBlur: (fieldName: string) => void;
  onFocus: (fieldName: string) => void;
  disabled?: boolean;
}