import React from 'react';
import { useState, useEffect } from 'react';

export interface RecentActivityProps {
  title?: string;
  children?: React.ReactNode;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ title, children }) => {
  return (
    <div className="RecentActivity">
      {title && <h2>{title}</h2>}
      <div className="RecentActivity-content">
        {children}
      </div>
    </div>
  );
};

export default RecentActivity;
