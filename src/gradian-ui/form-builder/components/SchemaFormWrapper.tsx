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
import { cn, validateField } from '../../shared/utils';

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
      
      const result = validateField(state.values[action.fieldName], field.validation);
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
            const result = validateField(state.values[field.name], field.validation);
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

  // Update form state when initialValues change (for editing scenarios)
  useEffect(() => {
    dispatch({ type: 'RESET', initialValues });
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
    dispatch({ type: 'VALIDATE_FORM', schema });
    return state.isValid;
  }, [schema, state.isValid]);

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

  const formClasses = cn(
    'w-full space-y-6 p-4',
    'rounded-2xl', // More rounded corners
    schema.styling?.className,
    className
  );

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
                    const fieldName = `${field.name}[${index}]`;
                    const fieldValue = item[field.name];
                    const fieldError = state.errors[fieldName];
                    const fieldTouched = state.touched[fieldName];

                    return (
                      <div key={field.id} className="space-y-2">
                        <FormElementFactory
                          field={field}
                          value={fieldValue}
                          error={fieldError}
                          touched={fieldTouched}
                          onChange={(value) => setValue(fieldName, value)}
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

  return (
    <FormContext.Provider value={contextValue}>
      <form
        className={formClasses}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        {...props}
      >
        {children || (
          <>
            <div className="space-y-2 pb-4">
              <h2 className="text-xl font-semibold text-gray-900">{schema.title}</h2>
              {schema.description && (
                <p className="text-gray-600 text-sm">{schema.description}</p>
              )}
            </div>

            <div className="space-y-4">
              {renderSections()}
            </div>

            {schema.actions && (
              <div className="flex justify-end space-x-3 pt-6 pb-2 border-t border-gray-200">
                {schema.actions.cancel && (
                  <Button
                    type="button"
                    variant={schema.actions.cancel.variant || 'outline'}
                    onClick={reset}
                    disabled={disabled}
                  >
                    {schema.actions.cancel.label}
                  </Button>
                )}
                {schema.actions.reset && (
                  <Button
                    type="button"
                    variant={schema.actions.reset.variant || 'outline'}
                    onClick={reset}
                    disabled={disabled}
                  >
                    {schema.actions.reset.label}
                  </Button>
                )}
                {schema.actions.submit && (
                  <Button
                    type="submit"
                    variant={schema.actions.submit.variant || 'default'}
                    disabled={disabled || state.isSubmitting}
                  >
                    {state.isSubmitting 
                      ? schema.actions.submit.loading || 'Submitting...'
                      : schema.actions.submit.label
                    }
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </form>
    </FormContext.Provider>
  );
};

SchemaFormWrapper.displayName = 'SchemaFormWrapper';
