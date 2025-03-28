import React from 'react';
import { twMerge } from 'tailwind-merge';

export type BadgeType = 'success' | 'error' | 'warning' | 'info';
export type BadgeVariant = 'solid' | 'outlined' | 'ghost';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
    type?: BadgeType;
    variant?: BadgeVariant;
    size?: BadgeSize;
    children: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
}

const typeStyles: Record<BadgeType, Record<BadgeVariant, string>> = {
    success: {
        solid: 'bg-green-100 text-green-800 border-green-200',
        outlined: 'bg-white text-green-800 border-green-200',
        ghost: 'bg-transparent text-green-800',
    },
    error: {
        solid: 'bg-red-100 text-red-800 border-red-200',
        outlined: 'bg-white text-red-800 border-red-200',
        ghost: 'bg-transparent text-red-800',
    },
    warning: {
        solid: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        outlined: 'bg-white text-yellow-800 border-yellow-200',
        ghost: 'bg-transparent text-yellow-800',
    },
    info: {
        solid: 'bg-blue-100 text-blue-800 border-blue-200',
        outlined: 'bg-white text-blue-800 border-blue-200',
        ghost: 'bg-transparent text-blue-800',
    },
};

const sizeStyles: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
};

const iconSizeStyles: Record<BadgeSize, string> = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
};

export const Badge: React.FC<BadgeProps> = ({
    type = 'info',
    variant = 'solid',
    size = 'md',
    children,
    icon,
    className,
}) => {
    const defaultIcon = (
        <svg
            className={twMerge('mr-1.5', iconSizeStyles[size])}
            viewBox="0 0 20 20"
            fill="currentColor"
        >
            {type === 'success' && (
                <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                />
            )}
            {type === 'error' && (
                <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                />
            )}
            {type === 'warning' && (
                <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                />
            )}
            {type === 'info' && (
                <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                />
            )}
        </svg>
    );

    return (
        <span
            className={twMerge(
                'inline-flex items-center rounded-full border font-medium',
                typeStyles[type][variant],
                sizeStyles[size],
                className
            )}
        >
            {(icon || defaultIcon) && <span className="flex-shrink-0">{icon || defaultIcon}</span>}
            {children}
        </span>
    );
};
