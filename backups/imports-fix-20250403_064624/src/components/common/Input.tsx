import { 
   useState, useEffect 
 } from "react"
export interface InputProps
import { 
   Button, Input, Select, Modal, Spinner 
 } from "@chakra-ui/react"
  extends React.InputHTMLAttributes<HTMLInputElement> {
import React from "react"
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  value?: string;
  type?: string;
}

export const getIconStyles = (
  leftIcon?: React.ReactNode,
  rightIcon?: React.ReactNode
): string => {
  if (leftIcon) return 'pl-10';
  if (rightIcon) return 'pr-10';
  return '';
};

export export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId =
      id ?? `input-${Math.random().toString(36).substring(2, 11)}`;
    const baseStyles =
      'px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors';

    export const errorStyles = error
      ? 'border-red-500 focus:ring-red-200'
      : 'border-gray-300 focus:ring-primary-200 focus:border-primary-500';
    export const disabledStyles = disabled
      ? 'bg-gray-100 cursor-not-allowed'
      : 'bg-white';





    return (
      <div className={twMerge('flex flex-col gap-1', widthStyles)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={twMerge(
              baseStyles,
              widthStyles,
              errorStyles,
              disabledStyles,
              iconStyles,
              className
            )}
            disabled={disabled}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';
