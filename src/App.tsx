import React from 'react';
import EvidenceViewerDemo from './components/examples/EvidenceViewerDemo';

const App: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Maple AI Health - Visualización de Evidencia</h1>
      <EvidenceViewerDemo />
    </div>
  );
};

export default App;
