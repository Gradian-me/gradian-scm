// Form Wrapper Component
// DEPRECATED: This component is deprecated in favor of SchemaFormWrapper
// Use SchemaFormWrapper from FormLifecycleManager instead

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { FormWrapperProps, FormState, FormContextType, FormConfig } from '../types';
import { getDefaultConfig } from '../utils';

import { cn, validateField } from '../../../shared/utils';
import { FormHeader } from './FormHeader';
import { FormContent } from './FormContent';
import { FormFooter } from './FormFooter';

// Form Context
const FormContext = createContext<FormContextType | null>(null);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormWrapper');
  }
  return context;
};

// Form State Reducer
type FormAction =
  | { type: 'SET_VALUE'; fieldName: string; value: any }
  | { type: 'SET_ERROR'; fieldName: string; error: string }
  | { type: 'SET_TOUCHED'; fieldName: string; touched: boolean }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'RESET'; initialValues: Record<string, any> }
  | { type: 'VALIDATE_FIELD'; fieldName: string; config: FormConfig }
  | { type: 'VALIDATE_FORM'; config: FormConfig };

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
      const field = action.config.fields.find(f => f.name === action.fieldName);
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
      const newErrors: Record<string, string> = {};
      let isValid = true;
      
      action.config.fields.forEach(field => {
        if (field.validation) {
          const result = validateField(state.values[field.name], field.validation);
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
    
    default:
      return state;
  }
};

export const FormWrapper: React.FC<FormWrapperProps> = ({
  config: rawConfig,
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
  // Apply default configuration
  const config = getDefaultConfig(rawConfig);

  // Use the validation mode from config if provided
  const effectiveValidationMode = config.validation?.mode || validationMode;

  const [state, dispatch] = useReducer(formReducer, {
    values: initialValues,
    errors: {},
    touched: {},
    dirty: false,
    isValid: true,
    isSubmitting: false,
  });

  const setValue = useCallback((fieldName: string, value: any) => {
    dispatch({ type: 'SET_VALUE', fieldName, value });
    onFieldChange?.(fieldName, value);
    
    if (effectiveValidationMode === 'onChange') {
      dispatch({ type: 'VALIDATE_FIELD', fieldName, config });
    }
  }, [onFieldChange, effectiveValidationMode, config]);

  const setError = useCallback((fieldName: string, error: string) => {
    dispatch({ type: 'SET_ERROR', fieldName, error });
  }, []);

  const setTouched = useCallback((fieldName: string, touched: boolean) => {
    dispatch({ type: 'SET_TOUCHED', fieldName, touched });
    
    if (effectiveValidationMode === 'onBlur') {
      dispatch({ type: 'VALIDATE_FIELD', fieldName, config });
    }
  }, [effectiveValidationMode, config]);

  const validateField = useCallback((fieldName: string) => {
    dispatch({ type: 'VALIDATE_FIELD', fieldName, config });
    return !state.errors[fieldName];
  }, [config, state.errors]);

  const validateForm = useCallback(() => {
    dispatch({ type: 'VALIDATE_FORM', config });
    return state.isValid;
  }, [config, state.isValid]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET', initialValues });
    onReset?.();
  }, [initialValues, onReset]);

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
    },
    config,
  };

  const formClasses = cn(
    'w-full space-y-8 p-6',
    config.styling?.variant === 'card' && 'bg-white rounded-2xl shadow-lg border border-gray-100',
    config.styling?.variant === 'minimal' && 'space-y-6',
    config.styling?.size === 'sm' && 'text-sm space-y-4',
    config.styling?.size === 'lg' && 'text-lg space-y-10',
    className
  );

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
            <FormHeader
              title={config.title}
              description={config.description}
            />
            <FormContent
              fields={config.fields}
              values={state.values}
              errors={state.errors}
              onChange={setValue}
              onBlur={(fieldName: string) => setTouched(fieldName, true)}
              onFocus={() => {}}
              disabled={disabled}
              layout={config.layout}
            />
            <FormFooter
              actions={config.actions}
              onSubmit={submit}
              onReset={reset}
              disabled={disabled}
              loading={state.isSubmitting}
            />
          </>
        )}
      </form>
    </FormContext.Provider>
  );
};

FormWrapper.displayName = 'FormWrapper';
