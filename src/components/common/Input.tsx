import * as React from 'react';
import { memo, useId } from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  labelId?: string;
  helperText?: string;
}

const Input: React.FC<InputProps> = memo(({
  label,
  error,
  className = '',
  id,
  labelId,
  helperText,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const labelFor = labelId || inputId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const baseStyles = 'block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm';
  const errorStyles = 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500';
  const normalStyles = 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500';

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={labelFor}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`${baseStyles} ${error ? errorStyles : normalStyles} ${className}`}
        aria-invalid="true"
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        {...props}
      />
      {error && (
        <p
          id={errorId}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          id={helperId}
          className="mt-1 text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
