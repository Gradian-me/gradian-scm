// Unified Form Schema - Simplified approach

export interface FormField {
  id: string;
  name: string;
  label: string;
  sectionId: string; // Reference to the section this field belongs to
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
    // Layout properties
    width?: string;
    order?: number;
    colSpan?: number; // Number of columns this field should span
    rowSpan?: number;
    // Styling properties
    variant?: 'default' | 'outlined' | 'filled' | 'underlined';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    // Display properties (merged from display)
    type?: 'text' | 'number' | 'currency' | 'percentage' | 'array' | 'computed';
    displayType?: 'badges' | 'list' | 'grid';
    maxDisplay?: number;
    showMore?: boolean;
    truncate?: boolean;
    icon?: string;
    source?: string;
    compute?: (data: any) => any;
    format?: string;
  };
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
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

export interface DetailPageSection {
  id: string;
  title: string;
  description?: string;
  colSpan?: number; // Number of columns this section should span in the grid
  fieldIds: string[]; // Field IDs to display as key-value pairs
  columnArea?: 'main' | 'sidebar'; // Which area to place this section in (main or sidebar)
  layout?: {
    columns?: number; // Number of columns for the key-value grid inside the card (default: 2)
    gap?: number;
  };
  styling?: {
    variant?: 'default' | 'card' | 'minimal';
    className?: string;
  };
}

export interface ComponentRendererConfig {
  id: string;
  componentType: 'kpi' | 'chart' | 'metric' | 'custom'; // Type of component to render
  componentName?: string; // Name of the custom component (for 'custom' type)
  fieldIds?: string[]; // Field IDs to extract data from
  dataPath?: string; // Path to data in the object (e.g., 'performanceMetrics.onTimeDelivery')
  config?: any; // Component-specific configuration (e.g., KPIIndicator config)
  props?: Record<string, any>; // Additional props to pass to the component
  colSpan?: number; // Number of columns this component should span
}

export interface DetailPageMetadata {
  sections?: DetailPageSection[]; // Info card sections with key-value pairs
  componentRenderers?: ComponentRendererConfig[]; // Custom components to render (e.g., KPIIndicator)
  layout?: {
    mainColumns?: number; // Number of columns for main content area (default: 2)
    sidebarColumns?: number; // Number of columns for sidebar (default: 1)
    // totalColumns is calculated automatically as mainColumns + sidebarColumns
    gap?: number;
  };
  header?: {
    showBackButton?: boolean;
    showActions?: boolean;
    actions?: Array<'edit' | 'delete' | 'export'>;
  };
}

export interface FormSchema {
  id: string;
  name: string;
  title: string;
  description?: string;
  singular_name?: string;
  plural_name?: string;
  fields: FormField[]; // All fields at schema level, each with a sectionId
  sections: FormSection[]; // Sections no longer contain fields
  cardMetadata?: CardSection[];
  detailPageMetadata?: DetailPageMetadata;
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