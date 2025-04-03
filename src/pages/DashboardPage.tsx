import React from 'react';

export type DashboardPageProps = Record<string, never>;

const DashboardPage: React.FC<DashboardPageProps> = () => {
  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <div className="dashboard-content">
        <p>Bienvenido al panel de control de MapleAIHealth.</p>
      </div>
    </div>
  );
};

export default DashboardPage;
