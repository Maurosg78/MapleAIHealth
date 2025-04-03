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
  const getClassName = () => {
    const classes = ['skeleton', `skeleton-${variant}`];
    
    if (width) classes.push('skeleton-custom-width');
    if (height) classes.push('skeleton-custom-height');
    
    return classes.join(' ');
  };
  
  return (
    <div 
      className={getClassName()}
      data-width={width}
      data-height={height}
    />
  );
};

export default Skeleton;
