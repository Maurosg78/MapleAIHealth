import React from 'react';
import { twMerge } from 'tailwind-merge';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';
export type SkeletonSize = 'sm' | 'md' | 'lg';

interface SkeletonProps {
    /**
     * La variante del skeleton que determina su forma
     */
    variant?: SkeletonVariant;
    /**
     * El tamaño del skeleton
     */
    size?: SkeletonSize;
    /**
     * Si el skeleton está animado
     */
    animated?: boolean;
    /**
     * Clases CSS adicionales
     */
    className?: string;
}

const variantStyles: Record<SkeletonVariant, string> = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
};

const sizeStyles: Record<SkeletonSize, string> = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-6',
};

export const Skeleton: React.FC<SkeletonProps> = ({
    variant = 'text',
    size = 'md',
    animated = true,
    className,
}) => {
    return (
        <div
            role="status"
            aria-label="Cargando"
            className={twMerge(
                'bg-gray-200',
                variantStyles[variant],
                sizeStyles[size],
                animated && 'animate-pulse',
                className
            )}
        />
    );
};
