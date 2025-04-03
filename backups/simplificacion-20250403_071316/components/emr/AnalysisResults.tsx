import React from 'react';
import { useState, useEffect } from 'react';

export interface AnalysisResultsProps {
  title?: string;
  children?: React.ReactNode;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ title, children }) => {
  return (
    <div className="AnalysisResults">
      {title && <h2>{title}</h2>}
      <div className="AnalysisResults-content">
        {children}
      </div>
    </div>
  );
};

export default AnalysisResults;
