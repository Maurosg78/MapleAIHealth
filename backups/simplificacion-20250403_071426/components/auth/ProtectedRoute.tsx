import React from 'react';
import { useState, useEffect } from 'react';

export interface ProtectedRouteProps {
  title?: string;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ title, children }) => {
  return (
    <div className="ProtectedRoute">
      {title && <h2>{title}</h2>}
      <div className="ProtectedRoute-content">
        {children}
      </div>
    </div>
  );
};

export default ProtectedRoute;
