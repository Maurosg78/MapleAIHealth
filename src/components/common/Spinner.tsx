import React from 'react';
import { twMerge } from 'tailwind-merge';

export type SpinnerType = 'primary' | 'success' | 'error' | 'warning' | 'info';
export type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
    /**
     * El tipo de spinner que determina el color
     */
    type?: SpinnerType;
    /**
     * El tamaño del spinner
     */
    size?: SpinnerSize;
    /**
     * Si el spinner está deshabilitado
     */
    disabled?: boolean;
    /**
     * Clases CSS adicionales
     */
    className?: string;
}

const typeStyles: Record<SpinnerType, string> = {
    primary: 'text-primary-600',
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
};

const sizeStyles: Record<SpinnerSize, string> = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
};

export const Spinner: React.FC<SpinnerProps> = ({
    type = 'primary',
    size = 'md',
    disabled = false,
    className,
}) => {
    return (
        <div
            role="status"
            aria-label="Cargando"
            className={twMerge('inline-block animate-spin', disabled && 'opacity-50', className)}
        >
            <svg
                className={twMerge('animate-spin', typeStyles[type], sizeStyles[size])}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
        </div>
    );
};
