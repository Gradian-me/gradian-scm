// Shared Hooks for Gradian UI Components

import { useState, useEffect, useCallback, useRef } from 'react';
import { ComponentHookData, ComponentConfig } from '../types';

/**
 * Hook for managing component data with loading and error states
 */
export const useComponentData = <T>(
  dataFetcher: () => Promise<T>,
  dependencies: any[] = []
): ComponentHookData & { data: T | null } => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dataFetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

/**
 * Hook for managing form state with validation
 */
export const useFormState = <T extends Record<string, any>>(
  initialValues: T,
  validationRules?: Partial<Record<keyof T, any>>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validateField = useCallback((field: keyof T) => {
    if (!validationRules?.[field]) return true;

    const rule = validationRules[field];
    const value = values[field];

    // Basic validation logic
    if (rule.required && (!value || value.toString().trim() === '')) {
      setErrors(prev => ({ ...prev, [field]: 'This field is required' }));
      return false;
    }

    if (value && rule.minLength && value.toString().length < rule.minLength) {
      setErrors(prev => ({ ...prev, [field]: `Minimum length is ${rule.minLength}` }));
      return false;
    }

    if (value && rule.maxLength && value.toString().length > rule.maxLength) {
      setErrors(prev => ({ ...prev, [field]: `Maximum length is ${rule.maxLength}` }));
      return false;
    }

    if (value && rule.min !== undefined) {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < rule.min) {
        setErrors(prev => ({ ...prev, [field]: `Minimum value is ${rule.min}` }));
        return false;
      }
    }

    if (value && rule.max !== undefined) {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue > rule.max) {
        setErrors(prev => ({ ...prev, [field]: `Maximum value is ${rule.max}` }));
        return false;
      }
    }

    if (value && rule.pattern && !rule.pattern.test(value.toString())) {
      setErrors(prev => ({ ...prev, [field]: 'Invalid format' }));
      return false;
    }

    if (value && rule.custom) {
      const result = rule.custom(value);
      if (typeof result === 'string') {
        setErrors(prev => ({ ...prev, [field]: result }));
        return false;
      }
      if (!result) {
        setErrors(prev => ({ ...prev, [field]: 'Invalid value' }));
        return false;
      }
    }

    setErrors(prev => ({ ...prev, [field]: undefined }));
    return true;
  }, [values, validationRules]);

  const validateForm = useCallback(() => {
    if (!validationRules) return true;

    let isValid = true;
    const newErrors: Partial<Record<keyof T, string>> = {};

    Object.keys(validationRules).forEach(field => {
      const fieldKey = field as keyof T;
      if (!validateField(fieldKey)) {
        isValid = false;
      }
    });

    return isValid;
  }, [validateField, validationRules]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const isFieldValid = useCallback((field: keyof T) => {
    return !errors[field] && (touched[field] || values[field] !== initialValues[field]);
  }, [errors, touched, values, initialValues]);

  const isFormValid = useCallback(() => {
    return Object.keys(errors).length === 0 && validateForm();
  }, [errors, validateForm]);

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateField,
    validateForm,
    reset,
    isFieldValid,
    isFormValid,
  };
};

/**
 * Hook for managing component visibility and animations
 */
export const useVisibility = (initialVisible: boolean = false) => {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [isAnimating, setIsAnimating] = useState(false);

  const show = useCallback(() => {
    setIsVisible(true);
    setIsAnimating(true);
  }, []);

  const hide = useCallback(() => {
    setIsAnimating(true);
    // Delay hiding to allow animation to complete
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimating(false);
    }, 300);
  }, []);

  const toggle = useCallback(() => {
    if (isVisible) {
      hide();
    } else {
      show();
    }
  }, [isVisible, show, hide]);

  return {
    isVisible,
    isAnimating,
    show,
    hide,
    toggle,
  };
};

/**
 * Hook for managing component focus
 */
export const useFocus = () => {
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const focus = useCallback(() => {
    ref.current?.focus();
    setIsFocused(true);
  }, []);

  const blur = useCallback(() => {
    ref.current?.blur();
    setIsFocused(false);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return {
    isFocused,
    ref,
    focus,
    blur,
    handleFocus,
    handleBlur,
  };
};

/**
 * Hook for managing component resize
 */
export const useResize = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return { dimensions, ref };
};

/**
 * Hook for managing component configuration
 */
export const useComponentConfig = (config: ComponentConfig) => {
  const [currentConfig, setCurrentConfig] = useState(config);

  const updateConfig = useCallback((updates: Partial<ComponentConfig>) => {
    setCurrentConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const resetConfig = useCallback(() => {
    setCurrentConfig(config);
  }, [config]);

  return {
    config: currentConfig,
    updateConfig,
    resetConfig,
  };
};

/**
 * Hook for managing local storage
 */
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
};
