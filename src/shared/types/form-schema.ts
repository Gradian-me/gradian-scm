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
  source?: string; // Data path for nested values (e.g., "user.profile.name")
  compute?: (data: any) => any; // Function to compute field value from data
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  icon?: string;
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

export interface RepeatingTableRendererConfig {
  id: string;
  schemaId: string;
  sectionId: string;
  columns?: string[]; // Field IDs to display as columns (if empty, show all fields from section)
  title?: string;
  description?: string;
  tableProperties?: {
    sortingEnabled?: boolean;
    paginationEnabled?: boolean;
    paginationPageSize?: number;
    alwaysShowPagination?: boolean; // If true, always show pagination even with one page (default: false)
    showAsCards?: boolean; // If true, show table rows as cards in responsive mode
    cardColumns?: 1 | 2 | 3; // Number of columns for key-value pairs in cards (default: 1)
    aggregationAlignment?: 'start' | 'center' | 'end'; // Alignment for aggregation values (default: 'end')
    aggregationColumns?: 1 | 2 | 3; // Number of columns for aggregation grid (default: 3, 1 = full width)
    aggregations?: Array<{
      column: string; // Column ID (field ID)
      aggregationTypes: Array<'sum' | 'avg' | 'min' | 'max' | 'first' | 'last' | 'count' | 'countdistinct' | 'stdev'>;
      unit?: string; // Unit to display after the value (e.g., "USD", "%", "kg")
      precision?: number; // Number of decimal places (default: 2)
    }>;
  };
  colSpan?: number; // Number of columns this table should span
  columnArea?: 'main' | 'sidebar'; // Which area to place this table in (main or sidebar)
}

export interface DetailPageMetadata {
  sections?: DetailPageSection[]; // Info card sections with key-value pairs
  componentRenderers?: ComponentRendererConfig[]; // Custom components to render (e.g., KPIIndicator)
  tableRenderers?: RepeatingTableRendererConfig[]; // Repeating section tables to render
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
  description?: string;
  singular_name: string;
  plural_name: string;
  icon?: string;
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
  actions?: Array<'submit' | 'cancel' | 'reset'>;
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