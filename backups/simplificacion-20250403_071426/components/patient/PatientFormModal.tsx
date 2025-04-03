import React from 'react';
import { useState, useEffect } from 'react';

export interface PatientFormModalProps {
  title?: string;
  children?: React.ReactNode;
}

export const PatientFormModal: React.FC<PatientFormModalProps> = ({ title, children }) => {
  return (
    <div className="PatientFormModal">
      {title && <h2>{title}</h2>}
      <div className="PatientFormModal-content">
        {children}
      </div>
    </div>
  );
};

export default PatientFormModal;
