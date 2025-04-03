import React from 'react';

export export interface SkeletonProps {
  // Props definidas automáticamente
  children?: React.ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({ children }) => {
  return (
    <div className="Skeleton">
      {children}
    </div>
  );
};

export default Skeleton;
