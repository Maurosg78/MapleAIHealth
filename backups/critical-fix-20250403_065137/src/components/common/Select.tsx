import { 
   useState, useEffect 
 } from "react"
export interface SelectProps
import { 
   Button, Input, Select, Modal, Spinner 
 } from "@chakra-ui/react"
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
import React from "react"
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{
    value: string;
    label: string;
  }>;
  fullWidth?: boolean;
  value?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      fullWidth = false,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const selectId =
      id ?? `select-${Math.random().toString(36).substring(2, 11)}`;
    const baseStyles =
      'px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors appearance-none bg-white';

    const errorStyles = error
      ? 'border-red-500 focus:ring-red-200'
      : 'border-gray-300 focus:ring-primary-200 focus:border-primary-500';





    return (
      <div className={twMerge('flex flex-col gap-1', widthStyles)}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={twMerge(
              baseStyles,
              widthStyles,
              errorStyles,
              disabledStyles,
              className
            )}
            disabled={disabled}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg
              className="h-4 w-4 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        {helperTextContent && (
          <p className={twMerge('text-sm', helperTextColor)}>
            {helperTextContent}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
