import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
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
            ...props
        },
        ref
    ) => {
        const baseStyles =
            'px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors';
        const widthStyles = fullWidth ? 'w-full' : 'w-auto';
        const errorStyles = error
            ? 'border-red-500 focus:ring-red-200'
            : 'border-gray-300 focus:ring-primary-200 focus:border-primary-500';
        const disabledStyles = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';
        const iconStyles = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';

        return (
            <div className={twMerge('flex flex-col gap-1', widthStyles)}>
                {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
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
                {(error || helperText) && (
                    <p className={twMerge('text-sm', error ? 'text-red-500' : 'text-gray-500')}>
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
