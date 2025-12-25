/**
 * useFormValidation - Hook para validação de formulários com Zod
 */

import { useState, useCallback, useMemo } from "react";
import { z } from "zod";
import { getValidationErrors } from "@/lib/inputValidation";

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>;
  initialValues?: Partial<T>;
  onSubmit?: (data: T) => void | Promise<void>;
}

interface UseFormValidationReturn<T> {
  values: Partial<T>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  setValue: (field: keyof T, value: unknown) => void;
  setValues: (values: Partial<T>) => void;
  setTouched: (field: keyof T) => void;
  validate: () => boolean;
  validateField: (field: keyof T) => string | null;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
  getFieldProps: (field: keyof T) => {
    value: unknown;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    error?: string;
  };
}

export function useFormValidation<T extends Record<string, unknown>>({
  schema,
  initialValues = {},
  onSubmit,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [values, setValuesState] = useState<Partial<T>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouchedState] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback((): boolean => {
    const result = schema.safeParse(values);
    
    if (result.success) {
      setErrors({});
      return true;
    }
    
    setErrors(getValidationErrors(result.error));
    return false;
  }, [schema, values]);

  const validateField = useCallback((field: keyof T): string | null => {
    const result = schema.safeParse(values);
    
    if (result.success) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
      return null;
    }
    
    const fieldErrors = getValidationErrors(result.error);
    const fieldError = fieldErrors[field as string] || null;
    
    setErrors(prev => ({
      ...prev,
      [field as string]: fieldError || '',
    }));
    
    return fieldError;
  }, [schema, values]);

  const setValue = useCallback((field: keyof T, value: unknown) => {
    setValuesState(prev => ({ ...prev, [field]: value }));
  }, []);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
  }, []);

  const setTouched = useCallback((field: keyof T) => {
    setTouchedState(prev => ({ ...prev, [field as string]: true }));
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouchedState(allTouched);
    
    if (!validate()) {
      return;
    }
    
    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values as T);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setTouchedState({});
    setIsSubmitting(false);
  }, [initialValues]);

  const getFieldProps = useCallback((field: keyof T) => ({
    value: values[field] ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValue(field, e.target.value);
    },
    onBlur: () => {
      setTouched(field);
      validateField(field);
    },
    error: touched[field as string] ? errors[field as string] : undefined,
  }), [values, errors, touched, setValue, setTouched, validateField]);

  const isValid = useMemo(() => {
    const result = schema.safeParse(values);
    return result.success;
  }, [schema, values]);

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    setValue,
    setValues,
    setTouched,
    validate,
    validateField,
    handleSubmit,
    reset,
    getFieldProps,
  };
}

export default useFormValidation;
