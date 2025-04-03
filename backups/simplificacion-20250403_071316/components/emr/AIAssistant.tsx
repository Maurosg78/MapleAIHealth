import React from 'react';
import { useState, useEffect } from 'react';

export interface AIAssistantProps {
  title?: string;
  children?: React.ReactNode;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ title, children }) => {
  return (
    <div className="AIAssistant">
      {title && <h2>{title}</h2>}
      <div className="AIAssistant-content">
        {children}
      </div>
    </div>
  );
};

export default AIAssistant;
