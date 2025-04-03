#!/bin/bash

echo "Reconstruyendo páginas básicas..."

mkdir -p src/pages

# DashboardPage
cat > src/pages/DashboardPage.tsx << 'EOFILE'
import React from 'react';

export interface DashboardPageProps {}

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
EOFILE

# NotFoundPage
cat > src/pages/NotFoundPage.tsx << 'EOFILE'
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-page">
      <h1>404 - Página no encontrada</h1>
      <p>Lo sentimos, la página que buscas no existe.</p>
      <Link to="/">Volver al inicio</Link>
    </div>
  );
};

export default NotFoundPage;
EOFILE

echo "Páginas básicas reconstruidas."
