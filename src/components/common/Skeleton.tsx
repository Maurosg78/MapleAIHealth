import * as React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width, height, className = '' }) => {
  const getClassName = () => {
    return `skeleton-loading ${className}`.trim();
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
