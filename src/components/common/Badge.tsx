import { 
   useState, useEffect 
 } from 'react'
import { 
   Button, Input, Select, Modal, Spinner 
 } from '@chakra-ui/react'
import React from 'react'
export type BadgeType = 'success' | 'error' | 'warning' | 'info';
export type BadgeVariant = 'solid' | 'outlined' | 'ghost';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  type?: BadgeType;
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  icon?: string;
  className?: string;
}

const typeStyles: Record<BadgeType, Record<BadgeVariant, string>> = {
  success: {
    solid: 'bg-green-100 text-green-800',
    outlined: 'border-green-200 text-green-800',
    ghost: 'text-green-800',
  },
  error: {
    solid: 'bg-red-100 text-red-800',
    outlined: 'border-red-200 text-red-800',
    ghost: 'text-red-800',
  },
  warning: {
    solid: 'bg-yellow-100 text-yellow-800',
    outlined: 'border-yellow-200 text-yellow-800',
    ghost: 'text-yellow-800',
  },
  info: {
    solid: 'bg-blue-100 text-blue-800',
    outlined: 'border-blue-200 text-blue-800',
    ghost: 'text-blue-800',
  },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-base px-3 py-1',
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
  return (
    <div
      className={twMerge(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        sizeStyles[size],
        typeStyles[type][variant],
        className
      )}
    >
      {icon && (
        <img
          src={icon}
          alt=""
          className={twMerge('flex-shrink-0', iconSizeStyles[size])}
        />
      )}
      {children}
    </div>
  );
};
