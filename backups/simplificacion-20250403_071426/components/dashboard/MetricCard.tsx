import React from 'react';
import { useState, useEffect } from 'react';

export interface MetricCardProps {
  title?: string;
  children?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, children }) => {
  return (
    <div className="MetricCard">
      {title && <h2>{title}</h2>}
      <div className="MetricCard-content">
        {children}
      </div>
    </div>
  );
};

export default MetricCard;
