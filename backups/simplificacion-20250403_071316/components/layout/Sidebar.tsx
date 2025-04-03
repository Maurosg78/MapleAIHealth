import React from 'react';
import { useState, useEffect } from 'react';

export interface SidebarProps {
  title?: string;
  children?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ title, children }) => {
  return (
    <div className="Sidebar">
      {title && <h2>{title}</h2>}
      <div className="Sidebar-content">
        {children}
      </div>
    </div>
  );
};

export default Sidebar;
