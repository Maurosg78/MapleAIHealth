import React from 'react';
import { useState, useEffect } from 'react';

export interface RecentActivitiesProps {
  title?: string;
  children?: React.ReactNode;
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ title, children }) => {
  return (
    <div className="RecentActivities">
      {title && <h2>{title}</h2>}
      <div className="RecentActivities-content">
        {children}
      </div>
    </div>
  );
};

export default RecentActivities;
