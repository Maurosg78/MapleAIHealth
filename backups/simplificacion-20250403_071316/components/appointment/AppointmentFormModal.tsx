import React from 'react';
import { useState, useEffect } from 'react';

export interface AppointmentFormModalProps {
  title?: string;
  children?: React.ReactNode;
}

export const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({ title, children }) => {
  return (
    <div className="AppointmentFormModal">
      {title && <h2>{title}</h2>}
      <div className="AppointmentFormModal-content">
        {children}
      </div>
    </div>
  );
};

export default AppointmentFormModal;
