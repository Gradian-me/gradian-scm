// Form Schema Types for Dynamic Form Rendering

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'password' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'datetime-local' | 'file';
  component: 'text' | 'email' | 'tel' | 'number' | 'password' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'datetime-local' | 'file';
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    min?: number;
    max?: number;
    custom?: (value: any) => { isValid: boolean; error?: string };
  };
  options?: Array<{ label: string; value: string; disabled?: boolean }>;
  defaultValue?: any;
  layout?: {
    width?: string;
    order?: number;
    colSpan?: number;
    rowSpan?: number;
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
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
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

export interface FormSchema {
  id: string;
  name: string;
  title: string;
  description?: string;
  cardConfig?: CardConfig;
  sections: FormSection[];
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
}

export interface FormData {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormTouched {
  [key: string]: boolean;
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
}

export interface FormSectionProps {
  section: FormSection;
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
