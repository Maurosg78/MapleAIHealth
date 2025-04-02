import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonProps {
  /**
   * La variante del skeleton
   */
  variant?: 'circular' | 'rectangular' | 'rounded' | 'text';
  /**
   * El tamaño del skeleton
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * El ancho del skeleton
   */
  width?: string | number;
  /**
   * La altura del skeleton
   */
  height?: string | number;
  /**
   * Si el skeleton está animado
   */
  animated?: boolean;
  /**
   * Clases CSS adicionales
   */
  className?: string;
  children?: React.ReactNode;
}

/**
 * Obtiene la clase CSS para el ancho del skeleton
 */
const getWidthClass = (width: string | number): string => {
  if (typeof width === 'number') {
    return `w-[${width}px]`;
  }
  if (width === '100%') {
    return 'w-full';
  }
  return `w-[${width}]`;
};

/**
 * Obtiene la clase CSS para la altura del skeleton
 */
const getHeightClass = (height: string | number): string => {
  if (typeof height === 'number') {
    return `h-[${height}px]`;
  }
  return `h-[${height}]`;
};

const variantStyles = {
  circular: 'rounded-full',
  rectangular: 'rounded-none',
  rounded: 'rounded',
  text: 'rounded',
};

const sizeStyles = {
  sm: 'h-3',
  md: 'h-4',
  lg: 'h-6',
};

/**
 * Componente Skeleton para mostrar estados de carga
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rounded',
  size = 'md',
  width = '100%',
  height,
  animated = true,
  className,
  children,
}) => {
  const widthClass = getWidthClass(width);
  const heightClass = height ? getHeightClass(height) : sizeStyles[size];

  return (
    <output
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        animated && 'animate-pulse',
        variantStyles[variant],
        widthClass,
        heightClass,
        className
      )}
      aria-label="Cargando"
    >
      {children}
    </output>
  );
};
