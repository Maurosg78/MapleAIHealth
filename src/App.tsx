import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/patients" element={<div>Pacientes</div>} />
          <Route path="/patients/new" element={<div>Nuevo Paciente</div>} />
          <Route path="/patients/:id" element={<div>Detalle del Paciente</div>} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
