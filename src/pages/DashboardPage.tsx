import React, { useState } from 'react';
import ClinicalDashboard from '../components/dashboard/ClinicalDashboard';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'clinical'>('clinical');

  return (
    <div className="dashboard-page space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

        <div className="flex space-x-2">
          <Button
            onClick={() => setActiveTab('general')}
            className={`${activeTab === 'general' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
          >
            General
          </Button>
          <Button
            onClick={() => setActiveTab('clinical')}
            className={`${activeTab === 'clinical' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Clínico
          </Button>
        </div>
      </div>

      {activeTab === 'general' ? (
        <div className="dashboard-content space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Dashboard General</h2>
            <p className="text-gray-600">
              El Dashboard General está en desarrollo. Por favor, utilice el Dashboard Clínico para
              visualizar las estadísticas de evidencia médica.
            </p>
          </Card>
        </div>
      ) : (
        <ClinicalDashboard />
      )}
    </div>
  );
};

export default DashboardPage;
