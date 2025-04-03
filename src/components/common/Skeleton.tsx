import React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circle' | 'rect';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width, 
  height,
  variant = 'text'
}) => {
  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : 50),
    height: height || (variant === 'text' ? 16 : 50),
  };
  
  return (
    <div 
      className={`skeleton skeleton-${variant}`}
      style={style}
    />
  );
};

export default Skeleton;
