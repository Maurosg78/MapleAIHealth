import React from 'react';
import { twMerge } from 'tailwind-merge';

export type ProgressType = 'primary' | 'success' | 'error' | 'warning' | 'info';
export type ProgressSize = 'sm' | 'md' | 'lg';

interface ProgressProps {
    /**
     * El valor actual del progreso (0-100)
     */
    value: number;
    /**
     * El tipo de progreso que determina el color
     */
    type?: ProgressType;
    /**
     * El tamaño del componente
     */
    size?: ProgressSize;
    /**
     * Si el progreso está en estado indeterminado
     */
    isIndeterminate?: boolean;
    /**
     * Si el progreso está deshabilitado
     */
    disabled?: boolean;
    /**
     * Clases CSS adicionales
     */
    className?: string;
}

const typeStyles: Record<ProgressType, string> = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
    info: 'bg-blue-600',
};

const sizeStyles: Record<ProgressSize, string> = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
};

export const Progress: React.FC<ProgressProps> = ({
    value,
    type = 'primary',
    size = 'md',
    isIndeterminate = false,
    disabled = false,
    className,
}) => {
    // Asegurar que el valor esté entre 0 y 100
    const progressValue = Math.min(Math.max(value, 0), 100);

    return (
        <div
            role="progressbar"
            aria-valuenow={isIndeterminate ? undefined : progressValue}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-busy={isIndeterminate}
            className={twMerge(
                'w-full bg-gray-200 rounded-full overflow-hidden',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
        >
            <div
                className={twMerge(
                    'transition-all duration-300 ease-in-out',
                    typeStyles[type],
                    sizeStyles[size],
                    isIndeterminate ? 'animate-progress-indeterminate' : 'rounded-full'
                )}
                style={!isIndeterminate ? { width: `${progressValue}%` } : undefined}
            />
        </div>
    );
};
