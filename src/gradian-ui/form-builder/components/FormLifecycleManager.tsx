// Schema-based Form Wrapper Component

import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import { ulid } from 'ulid';
import { 
  FormWrapperProps, 
  FormState, 
  FormContextType, 
  FormSchema, 
  FormData, 
  FormErrors, 
  FormTouched 
} from '@/gradian-ui/schema-manager/types/form-schema';
import { FormSection } from './FormSection';
import { AccordionFormSection } from './AccordionFormSection';
import { RepeatingSection } from './RepeatingSection';
import { FormElementFactory } from '../form-elements';
import { Button } from '../../../components/ui/button';
import { FormAlert } from '../../../components/ui/form-alert';
import { cn, validateField as validateFieldUtil } from '../../shared/utils';
import { loggingCustom } from '../../../shared/utils';
import { LogType } from '../../../shared/constants/application-variables';
import { getActionConfig, getSingularName, isEditMode } from '../utils/action-config';
import { ChevronsDown, ChevronsUp } from 'lucide-react';
import { GoToTopForm } from '../form-elements/go-to-top-form';
import { FormModal } from './FormModal';
import { apiRequest } from '@/shared/utils/api';

// Form Context
const FormContext = createContext<FormContextType | null>(null);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a SchemaFormWrapper');
  }
  return context;
};

// Helper function to ensure repeating section items have unique IDs
const ensureRepeatingItemIds = (values: FormData, schema: FormSchema): FormData => {
  const newValues = { ...values };
  
  schema.sections.forEach(section => {
    if (section.isRepeatingSection && newValues[section.id]) {
      const items = newValues[section.id];
      if (Array.isArray(items)) {
        newValues[section.id] = items.map((item: any, index: number) => {
          // Only add id if it doesn't already exist
          if (!item.id) {
            return {
              ...item,
              id: ulid()
            };
          }
          return item;
        });
      }
    }
  });
  
  return newValues;
};

// Form State Reducer
type FormAction =
  | { type: 'SET_VALUE'; fieldName: string; value: any }
  | { type: 'SET_ERROR'; fieldName: string; error: string }
  | { type: 'SET_TOUCHED'; fieldName: string; touched: boolean }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'RESET'; initialValues: FormData; schema: FormSchema }
  | { type: 'VALIDATE_FIELD'; fieldName: string; schema: FormSchema }
  | { type: 'VALIDATE_FORM'; schema: FormSchema }
  | { type: 'ADD_REPEATING_ITEM'; sectionId: string; defaultValue: any }
  | { type: 'REMOVE_REPEATING_ITEM'; sectionId: string; index: number };

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_VALUE': {
      // Handle nested paths for repeating sections (e.g., "contacts[0].name")
      const match = action.fieldName.match(/^(.+)\[(\d+)\]\.(.+)$/);
      
      if (match) {
        // This is a repeating section field
        const [, sectionId, itemIndex, fieldName] = match;
        const index = parseInt(itemIndex);
        const currentArray = state.values[sectionId] || [];
        
        // Create a deep copy of the array to avoid mutations
        const newArray = currentArray.map((item: any) => ({ ...item }));
        
        // Ensure the array is long enough and item exists at this index
        while (newArray.length <= index) {
          newArray.push({
            id: ulid()
          });
        }
        
        // If item at index doesn't have required structure, ensure it has an ID
        if (!newArray[index].id) {
          console.warn(`[FormReducer] Item at index ${index} missing id, adding one`);
          newArray[index] = {
            ...newArray[index],
            id: ulid()
          };
        }
        
        // Update the specific field in the item, preserving all other fields including id
        newArray[index] = {
          ...newArray[index],
          [fieldName]: action.value,
        };
        
        console.log(`[FormReducer] Updating repeating section item:`, {
          sectionId,
          itemIndex: index,
          fieldName,
          value: action.value,
          itemId: newArray[index].id,
          before: currentArray[index],
          after: newArray[index],
        });
        
        return {
          ...state,
          values: {
            ...state.values,
            [sectionId]: newArray,
          },
          dirty: true,
        };
      }
      
      // Regular field update
      console.log(`[FormReducer] Updating regular field:`, {
        fieldName: action.fieldName,
        value: action.value,
      });
      
      return {
        ...state,
        values: { ...state.values, [action.fieldName]: action.value },
        dirty: true,
      };
    }
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.fieldName]: action.error },
      };
    
    case 'SET_TOUCHED':
      return {
        ...state,
        touched: { ...state.touched, [action.fieldName]: action.touched },
      };
    
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.isSubmitting,
      };
    
    case 'RESET':
      return {
        values: ensureRepeatingItemIds(action.initialValues, action.schema),
        errors: {},
        touched: {},
        dirty: false,
        isValid: true,
        isSubmitting: false,
      };
    
    case 'VALIDATE_FIELD': {
      // Handle nested paths for repeating sections (e.g., "contacts[0].name")
      const match = action.fieldName.match(/^(.+)\[(\d+)\]\.(.+)$/);
      
      let field;
      let fieldValue;
      
      if (match) {
        // This is a repeating section field
        const [, sectionId, itemIndex, fieldName] = match;
        const index = parseInt(itemIndex);
        field = action.schema.fields.find(f => f.sectionId === sectionId && f.name === fieldName);
        fieldValue = state.values[sectionId]?.[index]?.[fieldName];
      } else {
        // Regular field
        field = action.schema.fields.find(f => f.name === action.fieldName);
        fieldValue = state.values[action.fieldName];
      }
      
      if (!field || (!field.required && !field.validation)) return state;
      
      const validationRules = {
        ...field.validation,
        // Ensure required is set if field.required is true
        required: field.required || field.validation?.required || false
      };
      const result = validateFieldUtil(fieldValue, validationRules);
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.fieldName]: result.isValid ? '' : result.error || 'Invalid value',
        },
      };
    }
    
    case 'VALIDATE_FORM': {
      const newErrors: FormErrors = {};
      let isValid = true;
      
      action.schema.fields.forEach(field => {
        // Check if field is required or has validation rules
        if (field.required || field.validation) {
          const validationRules = {
            ...field.validation,
            // Ensure required is set if field.required is true
            required: field.required || field.validation?.required || false
          };
          const result = validateFieldUtil(state.values[field.name], validationRules);
          if (!result.isValid) {
            newErrors[field.name] = result.error || 'Invalid value';
            isValid = false;
          }
        }
      });
      
      return {
        ...state,
        errors: newErrors,
        isValid,
      };
    }

    case 'ADD_REPEATING_ITEM': {
      const currentArray = state.values[action.sectionId] || [];
      // Add a unique ID to help React track items properly
      const itemWithId = {
        ...action.defaultValue,
        id: ulid()
      };
      return {
        ...state,
        values: {
          ...state.values,
          [action.sectionId]: [...currentArray, itemWithId],
        },
        dirty: true,
      };
    }

    case 'REMOVE_REPEATING_ITEM': {
      const currentArray = state.values[action.sectionId] || [];
      const newArray = currentArray.filter((_: any, index: number) => index !== action.index);
      return {
        ...state,
        values: {
          ...state.values,
          [action.sectionId]: newArray,
        },
        dirty: true,
      };
    }
    
    default:
      return state;
  }
};

export const SchemaFormWrapper: React.FC<FormWrapperProps> = ({
  schema,
  onSubmit,
  onReset,
  onCancel,
  onFieldChange,
  initialValues = {},
  validationMode = 'onSubmit',
  disabled = false,
  className,
  children,
  onMount,
  hideActions = false,
  error,
  errorStatusCode,
  onErrorDismiss,
  ...props
}) => {
  const [state, dispatch] = useReducer(formReducer, {
    values: ensureRepeatingItemIds(initialValues, schema),
    errors: {},
    touched: {},
    dirty: false,
    isValid: true,
    isSubmitting: false,
  });
  
  const [addItemErrors, setAddItemErrors] = React.useState<Record<string, string | null>>({});
  
  // State to track which sections are expanded
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>(() => {
    // Initialize based on section initialState prop
    const initial: Record<string, boolean> = {};
    schema.sections.forEach(section => {
      initial[section.id] = section.initialState !== 'collapsed';
    });
    return initial;
  });

  // Deep comparison to avoid unnecessary resets
  const prevInitialValuesRef = React.useRef<string>(JSON.stringify(initialValues));
  
  // Update form state when initialValues change (for editing scenarios)
  // Only reset if the actual content has changed
  useEffect(() => {
    const currentInitialValues = JSON.stringify(initialValues);
    if (prevInitialValuesRef.current !== currentInitialValues) {
      prevInitialValuesRef.current = currentInitialValues;
      dispatch({ type: 'RESET', initialValues, schema });
    }
  }, [initialValues, schema]);

  // Update expanded sections when schema sections change
  const sectionIds = useMemo(() => schema.sections.map(s => s.id).join(','), [schema.sections]);
  useEffect(() => {
    setExpandedSections(prev => {
      const newExpanded: Record<string, boolean> = {};
      schema.sections.forEach(section => {
        // Preserve existing state if section still exists, otherwise use initialState
        newExpanded[section.id] = prev[section.id] !== undefined 
          ? prev[section.id]
          : (section.initialState !== 'collapsed');
      });
      return newExpanded;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionIds]);

  const setValue = useCallback((fieldName: string, value: any) => {
    loggingCustom(LogType.FORM_DATA, 'info', `Setting field "${fieldName}" to: ${JSON.stringify(value)}`);
    dispatch({ type: 'SET_VALUE', fieldName, value });
    onFieldChange?.(fieldName, value);
    
    if (validationMode === 'onChange') {
      dispatch({ type: 'VALIDATE_FIELD', fieldName, schema });
    }
  }, [onFieldChange, validationMode, schema]);

  const setError = useCallback((fieldName: string, error: string) => {
    dispatch({ type: 'SET_ERROR', fieldName, error });
  }, []);

  const setTouched = useCallback((fieldName: string, touched: boolean) => {
    dispatch({ type: 'SET_TOUCHED', fieldName, touched });
    
    if (validationMode === 'onBlur') {
      dispatch({ type: 'VALIDATE_FIELD', fieldName, schema });
    }
  }, [validationMode, schema]);

  const validateField = useCallback((fieldName: string) => {
    dispatch({ type: 'VALIDATE_FIELD', fieldName, schema });
    return !state.errors[fieldName];
  }, [schema, state.errors]);

  const validateForm = useCallback(async () => {
    // Validate synchronously and update state
    let isValid = true;
    const newErrors: FormErrors = {};
    
    // For relation-based sections, we need to fetch relations count for validation
    const relationCounts: Record<string, number> = {};
    const hasEntityId = !!(state.values?.id);
    
    // Fetch relation counts for relation-based sections
    if (hasEntityId) {
      const relationPromises = schema.sections
        .filter(section => 
          section.isRepeatingSection && 
          section.repeatingConfig?.targetSchema && 
          section.repeatingConfig?.relationTypeId
        )
        .map(async (section) => {
          try {
            const response = await apiRequest<{ count: number; data: any[] }>(
              `/api/relations?sourceSchema=${schema.id}&sourceId=${state.values.id}&relationTypeId=${section.repeatingConfig!.relationTypeId}&targetSchema=${section.repeatingConfig!.targetSchema}`
            );
            if (response.success) {
              relationCounts[section.id] = response.data?.count || (Array.isArray(response.data?.data) ? response.data.data.length : 0);
            }
          } catch (error) {
            console.error(`Error fetching relations count for section ${section.id}:`, error);
            relationCounts[section.id] = 0;
          }
        });
      
      await Promise.all(relationPromises);
    }
    
    schema.sections.forEach(section => {
      // Check repeating section constraints
      if (section.isRepeatingSection && section.repeatingConfig) {
        const { minItems, maxItems } = section.repeatingConfig;
        
        // Check if this is a relation-based repeating section
        const isRelationBased = section.repeatingConfig.targetSchema && section.repeatingConfig.relationTypeId;
        
        // For relation-based sections, use relation count; for regular sections, use form values
        let itemCount: number;
        if (isRelationBased) {
          // For relation-based sections, items are stored as relations, not in form values
          // Use the fetched relation count if available, otherwise skip validation
          if (hasEntityId && relationCounts[section.id] !== undefined) {
            itemCount = relationCounts[section.id];
          } else {
            // Entity not saved yet or count not available - skip minItems validation
            itemCount = hasEntityId ? 0 : -1; // -1 means skip validation
          }
        } else {
          // For regular repeating sections, items are in form values
          const items = state.values[section.id] || [];
          itemCount = items.length;
        }
        
        // For relation-based sections, only enforce minItems after the entity has been saved (has an ID)
        // This allows users to save the form first, then add related items
        if (minItems !== undefined && itemCount >= 0 && itemCount < minItems) {
          // Skip minItems validation for relation-based sections if entity hasn't been saved yet
          if (isRelationBased && !hasEntityId) {
            // Allow saving without items for relation-based sections on initial save
          } else {
            const errorMessage = `At least ${minItems} item(s) are required`;
            newErrors[section.id] = errorMessage;
            isValid = false;
          }
        }
        
        if (maxItems !== undefined && itemCount >= 0 && itemCount > maxItems) {
          const errorMessage = `Maximum ${maxItems} item(s) allowed`;
          newErrors[section.id] = errorMessage;
          isValid = false;
        }
        
        // Validate fields within each repeating item
        // Note: For relation-based sections, field validation is handled by the relation items themselves
        // We only validate inline form values for non-relation-based sections
        if (!isRelationBased) {
          const items = state.values[section.id] || [];
          const sectionFields = schema.fields.filter(f => f.sectionId === section.id);
          items.forEach((item: any, itemIndex: number) => {
            sectionFields.forEach(field => {
              // Check if field is required or has validation rules
              if (field.required || field.validation) {
                const validationRules = {
                  ...field.validation,
                  // Ensure required is set if field.required is true
                  required: field.required || field.validation?.required || false
                };
                const fieldValue = item[field.name];
                const result = validateFieldUtil(fieldValue, validationRules);
                if (!result.isValid) {
                  const errorKey = `${section.id}[${itemIndex}].${field.name}`;
                  newErrors[errorKey] = result.error || 'Invalid value';
                  isValid = false;
                }
              }
            });
          });
        }
      } else {
        // Validate individual fields in non-repeating sections
        const sectionFields = schema.fields.filter(f => f.sectionId === section.id);
        sectionFields.forEach(field => {
          // Check if field is required or has validation rules
          if (field.required || field.validation) {
            const validationRules = {
              ...field.validation,
              // Ensure required is set if field.required is true
              required: field.required || field.validation?.required || false
            };
            const result = validateFieldUtil(state.values[field.name], validationRules);
            if (!result.isValid) {
              newErrors[field.name] = result.error || 'Invalid value';
              isValid = false;
            }
          }
        });
      }
    });
    
    // Update errors in state immediately and mark fields as touched
    Object.entries(newErrors).forEach(([fieldName, error]) => {
      dispatch({ type: 'SET_ERROR', fieldName, error });
      dispatch({ type: 'SET_TOUCHED', fieldName, touched: true });
    });
    
    // Clear errors for fields that are now valid
    Object.keys(state.errors).forEach(fieldName => {
      if (!newErrors[fieldName] && state.errors[fieldName]) {
        dispatch({ type: 'SET_ERROR', fieldName, error: '' });
      }
    });
    
    return isValid;
  }, [schema, state.values, state.errors]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET', initialValues, schema });
    onReset?.();
  }, [initialValues, onReset, schema]);

  // State for relation-based repeating sections
  const [relationModalState, setRelationModalState] = React.useState<{
    isOpen: boolean;
    sectionId: string;
    targetSchema?: string;
    relationTypeId?: string;
  }>({ isOpen: false, sectionId: '' });
  
  // Trigger to refresh relation-based sections (increments when relations are created)
  const [refreshRelationsTrigger, setRefreshRelationsTrigger] = React.useState(0);

  const addRepeatingItem = useCallback((sectionId: string) => {
    const section = schema.sections.find(s => s.id === sectionId);
    if (!section?.isRepeatingSection) return;
    
    // Check if this is a relation-based repeating section
    const isRelationBased = section.repeatingConfig?.targetSchema && section.repeatingConfig?.relationTypeId;
    
    if (isRelationBased && section.repeatingConfig) {
      // For relation-based sections, open FormModal for target schema
      const currentEntityId = state.values?.id;
      
      if (!currentEntityId) {
        // Entity must be saved first
        setAddItemErrors(prev => ({ 
          ...prev, 
          [sectionId]: 'Please save the form first before adding related items' 
        }));
        setTimeout(() => setAddItemErrors(prev => ({ ...prev, [sectionId]: null })), 5000);
        return;
      }
      
      // Open modal for creating new entity in target schema
      setRelationModalState({
        isOpen: true,
        sectionId,
        targetSchema: section.repeatingConfig.targetSchema,
        relationTypeId: section.repeatingConfig.relationTypeId,
      });
      
      return;
    }
    
    // Traditional inline fields repeating section
    // Clear any previous add item error for this section
    setAddItemErrors(prev => ({ ...prev, [sectionId]: null }));
    
    // Validate existing items before allowing a new one
    const items = state.values[sectionId] || [];
    let hasErrors = false;
    const newErrors: FormErrors = {};
    const errorFields: string[] = [];
    
    // Check if there are existing items to validate
    if (items.length > 0) {
      const sectionFields = schema.fields.filter(f => f.sectionId === sectionId);
      items.forEach((item: any, itemIndex: number) => {
        sectionFields.forEach(field => {
          // Check if field is required or has validation rules
          if (field.required || field.validation) {
            const validationRules = {
              ...field.validation,
              // Ensure required is set if field.required is true
              required: field.required || field.validation?.required || false
            };
            const fieldValue = item[field.name];
            const result = validateFieldUtil(fieldValue, validationRules);
            if (!result.isValid) {
              const errorKey = `${sectionId}[${itemIndex}].${field.name}`;
              newErrors[errorKey] = result.error || 'Invalid value';
              hasErrors = true;
              errorFields.push(`Item ${itemIndex + 1} - ${field.label || field.name}`);
              
              // Mark field as touched to show the error
              dispatch({ type: 'SET_TOUCHED', fieldName: errorKey, touched: true });
            }
          }
        });
      });
      
      // Update errors in state
      Object.entries(newErrors).forEach(([fieldName, error]) => {
        dispatch({ type: 'SET_ERROR', fieldName, error });
      });
    }
    
    // If there are validation errors, don't add a new item
    if (hasErrors) {
      const errorMessage = `Please fix validation errors in existing items before adding a new one. Fields with errors: ${errorFields.slice(0, 3).join(', ')}${errorFields.length > 3 ? ` and ${errorFields.length - 3} more...` : ''}`;
      
      setAddItemErrors(prev => ({ ...prev, [sectionId]: errorMessage }));
      
      loggingCustom(LogType.FORM_DATA, 'warn', 
        `Cannot add new item to "${section.title}": Please fix validation errors in existing items first.`
      );
      
      // Clear the error after 5 seconds
      setTimeout(() => setAddItemErrors(prev => ({ ...prev, [sectionId]: null })), 5000);
      
      return;
    }
    
    // Add the new item
    const sectionFields = schema.fields.filter(f => f.sectionId === sectionId);
    const defaultValue = sectionFields.reduce((acc, field) => {
      acc[field.name] = field.defaultValue || '';
      return acc;
    }, {} as any);
    
    loggingCustom(LogType.FORM_DATA, 'info', 
      `Adding new item to repeating section "${section.title}"`
    );
    
    dispatch({ type: 'ADD_REPEATING_ITEM', sectionId, defaultValue });
  }, [schema, state.values]);

  const removeRepeatingItem = useCallback((sectionId: string, index: number) => {
    dispatch({ type: 'REMOVE_REPEATING_ITEM', sectionId, index });
  }, []);

  const submit = useCallback(async () => {
    if (disabled) return;
    
    dispatch({ type: 'SET_SUBMITTING', isSubmitting: true });
    
    // Log form data before validation
    loggingCustom(LogType.FORM_DATA, 'info', '=== FORM SUBMISSION STARTED ===');
    loggingCustom(LogType.FORM_DATA, 'info', `Form Values: ${JSON.stringify(state.values, null, 2)}`);
    
    // Validate synchronously
    const isValid = await validateForm();
    
    // Log validation results
    loggingCustom(LogType.FORM_DATA, isValid ? 'info' : 'warn', `Form Validation Status: ${isValid ? 'VALID' : 'INVALID'}`);
    
    // Log errors for each field
    Object.entries(state.errors).forEach(([fieldName, error]) => {
      if (error) {
        loggingCustom(LogType.FORM_DATA, 'error', `Field "${fieldName}": ${error}`);
      }
    });
    
    // Log section-level validation
    schema.sections.forEach(section => {
      let sectionValid = true;
      let sectionErrors: string[] = [];
      
      if (section.isRepeatingSection && section.repeatingConfig) {
        const items = state.values[section.id] || [];
        const { minItems, maxItems } = section.repeatingConfig;
        
        // Check if this is a relation-based repeating section
        const isRelationBased = section.repeatingConfig.targetSchema && section.repeatingConfig.relationTypeId;
        const hasEntityId = !!(state.values?.id);
        
        if (minItems !== undefined && items.length < minItems) {
          // Skip minItems validation for relation-based sections if entity hasn't been saved yet
          if (isRelationBased && !hasEntityId) {
            // Allow saving without items for relation-based sections on initial save
          } else {
            sectionValid = false;
            sectionErrors.push(`At least ${minItems} item(s) required, found ${items.length}`);
          }
        }
        
        if (maxItems !== undefined && items.length > maxItems) {
          sectionValid = false;
          sectionErrors.push(`Maximum ${maxItems} item(s) allowed, found ${items.length}`);
        }
        
        // Check for errors within repeating items
        const sectionFields = schema.fields.filter(f => f.sectionId === section.id);
        items.forEach((item: any, itemIndex: number) => {
          sectionFields.forEach(field => {
            const errorKey = `${section.id}[${itemIndex}].${field.name}`;
            if (state.errors[errorKey]) {
              sectionValid = false;
              sectionErrors.push(`Item ${itemIndex + 1} - ${field.name}: ${state.errors[errorKey]}`);
            }
          });
        });
      } else {
        // Check errors for non-repeating section fields
        const sectionFields = schema.fields.filter(f => f.sectionId === section.id);
        sectionFields.forEach(field => {
          if (state.errors[field.name]) {
            sectionValid = false;
            sectionErrors.push(`${field.name}: ${state.errors[field.name]}`);
          }
        });
      }
      
      loggingCustom(LogType.FORM_DATA, sectionValid ? 'info' : 'warn', 
        `Section "${section.title || section.id}": ${sectionValid ? 'VALID' : 'INVALID'}${sectionErrors.length > 0 ? ` - ${sectionErrors.join(', ')}` : ''}`
      );
    });
    
    // Log overall validation summary
    const totalErrors = Object.values(state.errors).filter(err => err).length;
    loggingCustom(LogType.FORM_DATA, 'info', `Validation Summary: ${totalErrors} error(s) found`);
    
    if (isValid && onSubmit) {
      try {
        await onSubmit(state.values);
        loggingCustom(LogType.FORM_DATA, 'info', 'Form submitted successfully');
      } catch (error) {
        loggingCustom(LogType.FORM_DATA, 'error', `Form submission error: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      loggingCustom(LogType.FORM_DATA, 'warn', 'Form submission blocked due to validation errors');
    }
    
    loggingCustom(LogType.FORM_DATA, 'info', '=== FORM SUBMISSION ENDED ===');
    
    dispatch({ type: 'SET_SUBMITTING', isSubmitting: false });
  }, [disabled, validateForm, onSubmit, state.values, state.errors, schema]);

  // Get action configurations dynamically
  const editMode = isEditMode(initialValues);
  const singularName = getSingularName(schema);
  const actionConfigs = useMemo(() => {
    const defaultActions: Array<'submit' | 'cancel' | 'reset'> = ['cancel', 'reset', 'submit'];
    const actions = schema.actions || defaultActions;
    // Ensure actions is always an array
    const actionsArray = Array.isArray(actions) ? actions : defaultActions;
    return actionsArray.map(actionType => getActionConfig(actionType, singularName, editMode));
  }, [schema.actions, singularName, editMode]);

  const contextValue: FormContextType = {
    state,
    actions: {
      setValue,
      setError,
      setTouched,
      validateField,
      validateForm,
      reset,
      submit,
      addRepeatingItem,
      removeRepeatingItem,
    },
    schema,
  };

  // Call onMount with submit function if provided
  useEffect(() => {
    onMount?.(submit);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submit]);

  const formClasses = cn(
    'w-full space-y-6',
    schema.styling?.className,
    className
  );

  // Collapse/Expand all functions
  const collapseAll = useCallback(() => {
    const collapsed: Record<string, boolean> = {};
    schema.sections.forEach(section => {
      collapsed[section.id] = false;
    });
    setExpandedSections(collapsed);
  }, [schema.sections]);

  const expandAll = useCallback(() => {
    const expanded: Record<string, boolean> = {};
    schema.sections.forEach(section => {
      expanded[section.id] = true;
    });
    setExpandedSections(expanded);
  }, [schema.sections]);

  // Toggle individual section
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  // Check if all sections are expanded or collapsed
  const allExpanded = useMemo(() => {
    return schema.sections.every(section => expandedSections[section.id] === true);
  }, [schema.sections, expandedSections]);

  const allCollapsed = useMemo(() => {
    return schema.sections.every(section => expandedSections[section.id] === false);
  }, [schema.sections, expandedSections]);

  // If this is rendered inside a form (FormDialog), don't create another form element
  const isInsideForm = typeof window !== 'undefined' && 
    document.getElementById('form-dialog-form')?.closest('form');

  const renderSections = () => {
    return schema.sections.map((section) => {
      return (
        <AccordionFormSection
          key={section.id}
          section={section}
          schema={schema}
          values={state.values}
          errors={state.errors}
          touched={state.touched}
          onChange={setValue}
          onBlur={(fieldName: string) => setTouched(fieldName, true)}
          onFocus={() => {}}
          disabled={disabled}
          isExpanded={expandedSections[section.id] ?? (section.initialState !== 'collapsed')}
          onToggleExpanded={() => toggleSection(section.id)}
          repeatingItems={section.isRepeatingSection ? (state.values[section.id] || []) : undefined}
          onAddRepeatingItem={section.isRepeatingSection ? () => addRepeatingItem(section.id) : undefined}
          onRemoveRepeatingItem={section.isRepeatingSection ? (index: number) => removeRepeatingItem(section.id, index) : undefined}
          addItemError={section.isRepeatingSection ? addItemErrors[section.id] : undefined}
          refreshRelationsTrigger={section.isRepeatingSection && section.repeatingConfig?.targetSchema ? refreshRelationsTrigger : undefined}
          isAddingItem={section.isRepeatingSection && relationModalState.isOpen && relationModalState.sectionId === section.id}
        />
      );
    });
  };

  // Get first validation error for display (prioritize section-level errors, then repeating item errors)
  const firstValidationError = useMemo(() => {
    // First check for section-level errors (min/max items)
    const sectionErrors = Object.entries(state.errors).filter(([key, value]) => {
      const section = schema.sections.find(s => s.id === key);
      return section?.isRepeatingSection && value;
    });
    
    if (sectionErrors.length > 0) {
      const [sectionId, errorMessage] = sectionErrors[0];
      const section = schema.sections.find(s => s.id === sectionId);
      // Add section title for FormAlert display
      return section ? `${section.title}: ${errorMessage}` : errorMessage;
    }
    
    // Then check for repeating item field errors
    const repeatingSectionItemErrors = Object.entries(state.errors).filter(([key, value]) => {
      return key.includes('[') && key.includes(']') && value;
    });
    
    if (repeatingSectionItemErrors.length > 0) {
      const [errorKey, errorMessage] = repeatingSectionItemErrors[0];
      // Parse the error key to get section id, item index, and field name
      const match = errorKey.match(/^(.+)\[(\d+)\]\.(.+)$/);
      if (match) {
        const [, sectionId, itemIndex, fieldName] = match;
        const section = schema.sections.find(s => s.id === sectionId);
        const field = schema.fields.find(f => f.sectionId === sectionId && f.name === fieldName);
        return section 
          ? `${section.title} - Item ${parseInt(itemIndex) + 1} (${field?.label || fieldName}): ${errorMessage}`
          : errorMessage;
      }
      return errorMessage;
    }
    
    // Finally check for regular field errors
    return Object.values(state.errors).find(err => err) || '';
  }, [state.errors, schema.sections]);

  const formContent = (
    <>
      {children || (
        <>
          {/* Error Alert - always shown when there are errors */}
          {(error || firstValidationError) && (
            <div className="mb-4">
              <FormAlert 
                type="error" 
                message={error || firstValidationError} 
                onDismiss={error ? onErrorDismiss : undefined}
                dismissible={!!error}
                statusCode={error ? errorStatusCode : undefined}
              />
            </div>
          )}
          
          {actionConfigs.length > 0 && !hideActions && (
            <div className="space-y-3 pb-2 mb-2 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex justify-end space-x-3">
                {actionConfigs.map((config) => {
                  if (config.type === 'submit') {
                    return (
                      <Button
                        key={config.type}
                        type="button"
                        variant={config.variant}
                        disabled={disabled || state.isSubmitting}
                        onClick={(e) => {
                          e.preventDefault();
                          submit();
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {!state.isSubmitting && config.icon}
                          {state.isSubmitting ? (
                            config.loading || 'Submitting...'
                          ) : (
                            <span className="hidden md:inline">{config.label}</span>
                          )}
                        </div>
                      </Button>
                    );
                  } else if (config.type === 'cancel') {
                    return (
                      <Button
                        key={config.type}
                        type="button"
                        variant={config.variant}
                        onClick={(e) => {
                          e.preventDefault();
                          onCancel?.();
                        }}
                        disabled={disabled}
                      >
                        <div className="flex items-center gap-2">
                          {config.icon}
                          <span className="hidden md:inline">{config.label}</span>
                        </div>
                      </Button>
                    );
                  } else if (config.type === 'reset') {
                    return (
                      <Button
                        key={config.type}
                        type="button"
                        variant={config.variant}
                        onClick={reset}
                        disabled={disabled}
                      >
                        <div className="flex items-center gap-2">
                          {config.icon}
                          <span className="hidden md:inline">{config.label}</span>
                        </div>
                      </Button>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
          
          {/* Collapse/Expand All Buttons */}
          {schema.sections.length > 0 && (
            <div className="flex justify-end gap-2 mb-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={collapseAll}
                disabled={allCollapsed || disabled}
                className="flex items-center gap-2"
              >
                <ChevronsUp className="h-4 w-4" />
                <span className="hidden md:inline">Collapse All</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={expandAll}
                disabled={allExpanded || disabled}
                className="flex items-center gap-2"
              >
                <ChevronsDown className="h-4 w-4" />
                <span className="hidden md:inline">Expand All</span>
              </Button>
            </div>
          )}
          
          <div className="space-y-4">
            {renderSections()}
          </div>
        </>
      )}
      
      {/* FormModal for relation-based repeating sections */}
      {relationModalState.isOpen && relationModalState.targetSchema && (
        <FormModal
          schemaId={relationModalState.targetSchema}
          mode="create"
          enrichData={(formData) => {
            // enrichData is called with form data before submission
            return formData;
          }}
          onSuccess={async (createdEntity) => {
            // After successful entity creation, create the relation
            const currentEntityId = state.values?.id;
            const targetEntityId = createdEntity?.id || (createdEntity as any)?.data?.id;
            
            if (currentEntityId && relationModalState.relationTypeId && targetEntityId && relationModalState.targetSchema) {
              try {
                const relationResponse = await apiRequest('/api/relations', {
                  method: 'POST',
                  body: {
                    sourceSchema: schema.id,
                    sourceId: currentEntityId,
                    targetSchema: relationModalState.targetSchema,
                    targetId: targetEntityId,
                    relationTypeId: relationModalState.relationTypeId,
                  },
                });
                
                if (!relationResponse.success) {
                  console.error('Failed to create relation:', relationResponse.error);
                  // Could show an error message here
                } else {
                  loggingCustom(LogType.FORM_DATA, 'info', 'Relation created successfully');
                  // Trigger refresh of relation-based sections
                  setRefreshRelationsTrigger(prev => prev + 1);
                }
              } catch (error) {
                console.error('Error creating relation:', error);
              }
            }
            
            // Close modal and clear state
            setRelationModalState({ isOpen: false, sectionId: '' });
          }}
          onClose={() => {
            setRelationModalState({ isOpen: false, sectionId: '' });
          }}
        />
      )}
    </>
  );

  return (
    <>
      <FormContext.Provider value={contextValue}>
        {typeof window !== 'undefined' && document.getElementById('form-dialog-form') ? (
          <div
            className={formClasses}
            {...props}
          >
            {formContent}
          </div>
        ) : (
          <form
            className={formClasses}
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            {...props}
          >
            {formContent}
          </form>
        )}
      </FormContext.Provider>
      {/* Go to Top Button */}
      <GoToTopForm threshold={100} />
    </>
  );
};

SchemaFormWrapper.displayName = 'SchemaFormWrapper';
