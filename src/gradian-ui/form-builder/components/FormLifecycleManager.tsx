// Schema-based Form Wrapper Component

import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';
import { 
  FormWrapperProps, 
  FormState, 
  FormContextType, 
  FormSchema, 
  FormData, 
  FormErrors, 
  FormTouched 
} from '../types/form-schema';
import { FormSection } from './FormSection';
import { AccordionFormSection } from './AccordionFormSection';
import { RepeatingSection } from './RepeatingSection';
import { FormElementFactory } from './FormElementFactory';
import { Button } from '../../../components/ui/button';
import { FormAlert } from '../../../components/ui/form-alert';
import { cn, validateField as validateFieldUtil } from '../../shared/utils';
import { loggingCustom } from '../../../shared/utils';
import { LogType } from '../../../shared/constants/application-variables';

// Form Context
const FormContext = createContext<FormContextType | null>(null);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a SchemaFormWrapper');
  }
  return context;
};

// Form State Reducer
type FormAction =
  | { type: 'SET_VALUE'; fieldName: string; value: any }
  | { type: 'SET_ERROR'; fieldName: string; error: string }
  | { type: 'SET_TOUCHED'; fieldName: string; touched: boolean }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'RESET'; initialValues: FormData }
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
        const newArray = [...currentArray];
        
        // Ensure the item exists at this index
        if (!newArray[index]) {
          newArray[index] = {};
        }
        
        // Update the specific field in the item
        newArray[index] = {
          ...newArray[index],
          [fieldName]: action.value,
        };
        
        console.log(`[FormReducer] Updating repeating section item:`, {
          sectionId,
          itemIndex: index,
          fieldName,
          value: action.value,
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
        values: action.initialValues,
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
        const section = action.schema.sections.find(s => s.id === sectionId);
        field = section?.fields.find(f => f.name === fieldName);
        fieldValue = state.values[sectionId]?.[index]?.[fieldName];
      } else {
        // Regular field
        field = action.schema.sections
          .flatMap(section => section.fields)
          .find(f => f.name === action.fieldName);
        fieldValue = state.values[action.fieldName];
      }
      
      if (!field?.validation) return state;
      
      const result = validateFieldUtil(fieldValue, field.validation);
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
      
      action.schema.sections.forEach(section => {
        section.fields.forEach(field => {
          if (field.validation) {
            const result = validateFieldUtil(state.values[field.name], field.validation);
            if (!result.isValid) {
              newErrors[field.name] = result.error || 'Invalid value';
              isValid = false;
            }
          }
        });
      });
      
      return {
        ...state,
        errors: newErrors,
        isValid,
      };
    }

    case 'ADD_REPEATING_ITEM': {
      const currentArray = state.values[action.sectionId] || [];
      return {
        ...state,
        values: {
          ...state.values,
          [action.sectionId]: [...currentArray, action.defaultValue],
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
  onFieldChange,
  initialValues = {},
  validationMode = 'onSubmit',
  disabled = false,
  className,
  children,
  onMount,
  hideActions = false,
  error,
  onErrorDismiss,
  ...props
}) => {
  const [state, dispatch] = useReducer(formReducer, {
    values: initialValues,
    errors: {},
    touched: {},
    dirty: false,
    isValid: true,
    isSubmitting: false,
  });
  
  const [addItemError, setAddItemError] = React.useState<string | null>(null);

  // Deep comparison to avoid unnecessary resets
  const prevInitialValuesRef = React.useRef<string>(JSON.stringify(initialValues));
  
  // Update form state when initialValues change (for editing scenarios)
  // Only reset if the actual content has changed
  useEffect(() => {
    const currentInitialValues = JSON.stringify(initialValues);
    if (prevInitialValuesRef.current !== currentInitialValues) {
      prevInitialValuesRef.current = currentInitialValues;
      dispatch({ type: 'RESET', initialValues });
    }
  }, [initialValues]);

  const setValue = useCallback((fieldName: string, value: any) => {
    loggingCustom(LogType.FORM_DATA, 'info', `Setting field "${fieldName}" to:`, value);
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

  const validateForm = useCallback(() => {
    // Validate synchronously and update state
    let isValid = true;
    const newErrors: FormErrors = {};
    
    schema.sections.forEach(section => {
      // Check repeating section constraints
      if (section.isRepeatingSection && section.repeatingConfig) {
        const items = state.values[section.id] || [];
        const { minItems, maxItems } = section.repeatingConfig;
        
        if (minItems !== undefined && items.length < minItems) {
          const errorMessage = `At least ${minItems} item(s) are required`;
          newErrors[section.id] = errorMessage;
          isValid = false;
        }
        
        if (maxItems !== undefined && items.length > maxItems) {
          const errorMessage = `Maximum ${maxItems} item(s) allowed`;
          newErrors[section.id] = errorMessage;
          isValid = false;
        }
        
        // Validate fields within each repeating item
        items.forEach((item: any, itemIndex: number) => {
          section.fields.forEach(field => {
            if (field.validation) {
              const fieldValue = item[field.name];
              const result = validateFieldUtil(fieldValue, field.validation);
              if (!result.isValid) {
                const errorKey = `${section.id}[${itemIndex}].${field.name}`;
                newErrors[errorKey] = result.error || 'Invalid value';
                isValid = false;
              }
            }
          });
        });
      } else {
        // Validate individual fields in non-repeating sections
        section.fields.forEach(field => {
          if (field.validation) {
            const result = validateFieldUtil(state.values[field.name], field.validation);
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
    dispatch({ type: 'RESET', initialValues });
    onReset?.();
  }, [initialValues, onReset]);

  const addRepeatingItem = useCallback((sectionId: string) => {
    const section = schema.sections.find(s => s.id === sectionId);
    if (!section?.isRepeatingSection) return;
    
    // Clear any previous add item error
    setAddItemError(null);
    
    // Validate existing items before allowing a new one
    const items = state.values[sectionId] || [];
    let hasErrors = false;
    const newErrors: FormErrors = {};
    const errorFields: string[] = [];
    
    // Check if there are existing items to validate
    if (items.length > 0) {
      items.forEach((item: any, itemIndex: number) => {
        section.fields.forEach(field => {
          if (field.validation) {
            const fieldValue = item[field.name];
            const result = validateFieldUtil(fieldValue, field.validation);
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
      
      setAddItemError(errorMessage);
      
      loggingCustom(LogType.FORM_DATA, 'warn', 
        `Cannot add new item to "${section.title}": Please fix validation errors in existing items first.`
      );
      
      // Clear the error after 5 seconds
      setTimeout(() => setAddItemError(null), 5000);
      
      return;
    }
    
    // Add the new item
    const defaultValue = section.fields.reduce((acc, field) => {
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
    const isValid = validateForm();
    
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
        
        if (minItems !== undefined && items.length < minItems) {
          sectionValid = false;
          sectionErrors.push(`At least ${minItems} item(s) required, found ${items.length}`);
        }
        
        if (maxItems !== undefined && items.length > maxItems) {
          sectionValid = false;
          sectionErrors.push(`Maximum ${maxItems} item(s) allowed, found ${items.length}`);
        }
        
        // Check for errors within repeating items
        items.forEach((item: any, itemIndex: number) => {
          section.fields.forEach(field => {
            const errorKey = `${section.id}[${itemIndex}].${field.name}`;
            if (state.errors[errorKey]) {
              sectionValid = false;
              sectionErrors.push(`Item ${itemIndex + 1} - ${field.name}: ${state.errors[errorKey]}`);
            }
          });
        });
      } else {
        // Check errors for non-repeating section fields
        section.fields.forEach(field => {
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

  // If this is rendered inside a form (FormDialog), don't create another form element
  const isInsideForm = typeof window !== 'undefined' && 
    document.getElementById('form-dialog-form')?.closest('form');

  const renderSections = () => {
    return schema.sections.map((section) => {
      return (
        <AccordionFormSection
          key={section.id}
          section={section}
          values={state.values}
          errors={state.errors}
          touched={state.touched}
          onChange={setValue}
          onBlur={(fieldName: string) => setTouched(fieldName, true)}
          onFocus={() => {}}
          disabled={disabled}
          initialState={section.initialState || 'expanded'}
          repeatingItems={section.isRepeatingSection ? (state.values[section.id] || []) : undefined}
          onAddRepeatingItem={section.isRepeatingSection ? () => addRepeatingItem(section.id) : undefined}
          onRemoveRepeatingItem={section.isRepeatingSection ? (index: number) => removeRepeatingItem(section.id, index) : undefined}
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
        const field = section?.fields.find(f => f.name === fieldName);
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
          {/* Add Item Error Alert */}
          {addItemError && (
            <div className="mb-4">
              <FormAlert 
                type="warning" 
                message={addItemError} 
                onDismiss={() => setAddItemError(null)}
                dismissible={true}
              />
            </div>
          )}
          
          {/* Error Alert - always shown when there are errors */}
          {(error || firstValidationError) && (
            <div className="mb-4">
              <FormAlert 
                type="error" 
                message={error || firstValidationError} 
                onDismiss={error ? onErrorDismiss : undefined}
                dismissible={!!error}
              />
            </div>
          )}
          
          {schema.actions && !hideActions && (
            <div className="space-y-3 pb-2 mb-2 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex justify-end space-x-3">
                {schema.actions.cancel && (
                  <Button
                    type="button"
                    variant={schema.actions.cancel?.variant || 'outline'}
                    onClick={reset}
                    disabled={disabled}
                  >
                    {schema.actions.cancel?.label}
                  </Button>
                )}
                {schema.actions.reset && (
                  <Button
                    type="button"
                    variant={schema.actions.reset?.variant || 'outline'}
                    onClick={reset}
                    disabled={disabled}
                  >
                    {schema.actions.reset?.label}
                  </Button>
                )}
                {schema.actions.submit && (
                  <Button
                    type="button"
                    variant={schema.actions.submit?.variant || 'default'}
                    disabled={disabled || state.isSubmitting}
                    onClick={(e) => {
                      e.preventDefault();
                      submit();
                    }}
                  >
                    {state.isSubmitting 
                      ? schema.actions.submit?.loading || 'Submitting...'
                      : schema.actions.submit?.label
                    }
                  </Button>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {renderSections()}
          </div>
        </>
      )}
    </>
  );

  return (
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
  );
};

SchemaFormWrapper.displayName = 'SchemaFormWrapper';
