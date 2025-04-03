import React from 'react';
import { useState, useEffect } from 'react';

export interface PatientFormModal2Props {
  title?: string;
  children?: React.ReactNode;
}

export const PatientFormModal2: React.FC<PatientFormModal2Props> = ({ title, children }) => {
  return (
    <div className="PatientFormModal2">
      {title && <h2>{title}</h2>}
      <div className="PatientFormModal2-content">
        {children}
      </div>
    </div>
  );
};

export default PatientFormModal2;
