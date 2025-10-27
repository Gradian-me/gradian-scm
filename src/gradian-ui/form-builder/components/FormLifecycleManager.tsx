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
    case 'SET_VALUE':
      return {
        ...state,
        values: { ...state.values, [action.fieldName]: action.value },
        dirty: true,
      };
    
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
      const field = action.schema.sections
        .flatMap(section => section.fields)
        .find(f => f.name === action.fieldName);
      
      if (!field?.validation) return state;
      
      const result = validateFieldUtil(state.values[action.fieldName], field.validation);
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
      }
      
      // Validate individual fields
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
    if (section?.isRepeatingSection) {
      const defaultValue = section.fields.reduce((acc, field) => {
        acc[field.name] = field.defaultValue || '';
        return acc;
      }, {} as any);
      dispatch({ type: 'ADD_REPEATING_ITEM', sectionId, defaultValue });
    }
  }, [schema]);

  const removeRepeatingItem = useCallback((sectionId: string, index: number) => {
    dispatch({ type: 'REMOVE_REPEATING_ITEM', sectionId, index });
  }, []);

  const submit = useCallback(async () => {
    if (disabled) return;
    
    dispatch({ type: 'SET_SUBMITTING', isSubmitting: true });
    
    // Validate synchronously
    const isValid = validateForm();
    
    if (isValid && onSubmit) {
      try {
        await onSubmit(state.values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    dispatch({ type: 'SET_SUBMITTING', isSubmitting: false });
  }, [disabled, validateForm, onSubmit, state.values]);

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
      if (section.isRepeatingSection) {
        const repeatingItems = state.values[section.id] || [];
        return (
          <RepeatingSection
            key={section.id}
            section={section}
            items={repeatingItems}
            onAdd={() => addRepeatingItem(section.id)}
            onRemove={(index) => removeRepeatingItem(section.id, index)}
            renderItem={(item, index) => (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map((field) => {
                    if (!field) return null;
                    
                    const fieldName = `${field.name}[${index}]`;
                    const fieldValue = item[field.name];
                    const fieldError = state.errors[fieldName];
                    const fieldTouched = typeof state.touched[fieldName] === 'boolean' 
                      ? state.touched[fieldName] 
                      : false;

                    return (
                      <div key={field.id} className="space-y-2">
                        <FormElementFactory
                          field={field as any}
                          value={fieldValue}
                          error={fieldError}
                          touched={fieldTouched as boolean}
                          onChange={(value) => {
                            // Update the nested value in the array
                            const currentArray = state.values[section.id] || [];
                            const updatedArray = [...currentArray];
                            updatedArray[index] = {
                              ...updatedArray[index],
                              [field.name]: value
                            };
                            
                            // Update the section's array in the form values
                            setValue(section.id, updatedArray);
                          }}
                          onBlur={() => setTouched(fieldName, true)}
                          onFocus={() => setTouched(fieldName, true)}
                          disabled={disabled || field.disabled}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            values={state.values}
            errors={state.errors}
            touched={state.touched}
            onChange={setValue}
            onBlur={(fieldName: string) => setTouched(fieldName, true)}
            onFocus={() => {}}
            disabled={disabled}
          />
        );
      }

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

  // Get first validation error for display (prioritize section-level errors)
  const firstValidationError = useMemo(() => {
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
