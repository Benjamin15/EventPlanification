import { useState, useCallback } from 'react';

export interface ErrorInfo {
  message: string;
  field?: string;
  code?: string;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [field: string]: ValidationRule;
}

export const useErrorHandling = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{[field: string]: string}>({});

  const addError = useCallback((error: ErrorInfo) => {
    setErrors(prev => [...prev, { ...error, id: Date.now() }]);
    
    if (error.field) {
      setFieldErrors(prev => ({
        ...prev,
        [error.field!]: error.message
      }));
    }
  }, []);

  const clearError = useCallback((index: number) => {
    setErrors(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
    setFieldErrors({});
  }, []);

  const handleApiError = useCallback((error: any) => {
    console.error('Erreur API:', error);
    
    if (error.response?.data?.detail) {
      if (Array.isArray(error.response.data.detail)) {
        // Erreurs de validation FastAPI
        error.response.data.detail.forEach((err: any) => {
          addError({
            message: err.msg,
            field: err.loc?.[err.loc.length - 1],
            code: err.type
          });
        });
      } else {
        addError({
          message: error.response.data.detail,
          code: error.response.status?.toString()
        });
      }
    } else if (error.message) {
      addError({
        message: error.message
      });
    } else {
      addError({
        message: 'Une erreur inattendue s\'est produite'
      });
    }
  }, [addError]);

  return {
    errors,
    fieldErrors,
    addError,
    clearError,
    clearFieldError,
    clearAllErrors,
    handleApiError
  };
};

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<{[field: string]: string}>({});

  const validateField = useCallback((field: string, value: any): string | null => {
    const rule = rules[field];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'Ce champ est requis';
    }

    // Skip other validations if value is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // String length validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return `Minimum ${rule.minLength} caractères requis`;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return `Maximum ${rule.maxLength} caractères autorisés`;
      }
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return 'Format invalide';
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [rules]);

  const validateForm = useCallback((formData: {[field: string]: any}): boolean => {
    const newErrors: {[field: string]: string} = {};
    let isValid = true;

    Object.keys(rules).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, validateField]);

  const validateSingleField = useCallback((field: string, value: any): boolean => {
    const error = validateField(field, value);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
    return !error;
  }, [validateField]);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateForm,
    validateSingleField,
    clearFieldError,
    clearAllErrors
  };
};

// Règles de validation communes
export const commonValidationRules = {
  required: { required: true },
  email: { 
    required: true, 
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
  },
  url: { 
    pattern: /^https?:\/\/.+/ 
  },
  eventName: { 
    required: true, 
    minLength: 3, 
    maxLength: 100 
  },
  description: { 
    maxLength: 500 
  },
  location: { 
    required: true, 
    minLength: 3, 
    maxLength: 200 
  },
  participantName: { 
    required: true, 
    minLength: 2, 
    maxLength: 50 
  },
  price: {
    custom: (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num)) return 'Veuillez entrer un nombre valide';
      if (num < 0) return 'Le prix ne peut pas être négatif';
      if (num > 10000) return 'Le prix semble trop élevé';
      return null;
    }
  },
  date: {
    custom: (value: string) => {
      if (!value) return null;
      const date = new Date(value);
      if (isNaN(date.getTime())) return 'Date invalide';
      if (date < new Date()) return 'La date ne peut pas être dans le passé';
      return null;
    }
  }
};
