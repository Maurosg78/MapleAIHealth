import React from 'react';
import { useState, useEffect } from 'react';

export interface AppointmentsPageProps {}

const AppointmentsPage: React.FC<AppointmentsPageProps> = () => {
  return (
    <div className="page AppointmentsPage">
      <h1>AppointmentsPage</h1>
      <div className="page-content">
        {/* Contenido básico para AppointmentsPage */}
      </div>
    </div>
  );
};

export default AppointmentsPage;
