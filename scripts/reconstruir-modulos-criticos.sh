#!/bin/bash

# Script para reconstruir los módulos con más errores
set -e

echo "Reconstruyendo archivos críticos con más errores..."

# Componentes con muchos errores
mkdir -p src/components/ai
cat > src/components/ai/ResponseFeedback.tsx << 'EOFILE'
import React from 'react';

export interface ResponseFeedbackProps {
  responseId?: string;
  onFeedbackSubmit?: (feedback: { helpful: boolean; comment?: string }) => void;
}

export const ResponseFeedback: React.FC<ResponseFeedbackProps> = ({ 
  responseId,
  onFeedbackSubmit
}) => {
  const [helpful, setHelpful] = React.useState<boolean | null>(null);
  const [comment, setComment] = React.useState('');

  const handleSubmit = () => {
    if (helpful !== null && onFeedbackSubmit) {
      onFeedbackSubmit({ helpful, comment });
    }
  };

  return (
    <div className="response-feedback">
      <h4>¿Fue útil esta respuesta?</h4>
      <div className="feedback-buttons">
        <button 
          onClick={() => setHelpful(true)}
          className={helpful === true ? 'selected' : ''}
        >
          Sí
        </button>
        <button 
          onClick={() => setHelpful(false)}
          className={helpful === false ? 'selected' : ''}
        >
          No
        </button>
      </div>
      {helpful === false && (
        <textarea
          placeholder="¿Cómo podemos mejorar?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      )}
      <button 
        onClick={handleSubmit}
        disabled={helpful === null}
      >
        Enviar
      </button>
    </div>
  );
};

export default ResponseFeedback;
EOFILE

# Dashboard components
mkdir -p src/components/dashboard
cat > src/components/dashboard/AIMedicalWidget.tsx << 'EOFILE'
import React from 'react';

export interface AIMedicalWidgetProps {
  title?: string;
}

export const AIMedicalWidget: React.FC<AIMedicalWidgetProps> = ({ 
  title = 'Asistente IA Medical'
}) => {
  const [query, setQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsLoading(true);
      // Simulación de llamada a API
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="ai-medical-widget">
      <h3>{title}</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Haz una pregunta médica..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" disabled={isLoading || !query.trim()}>
          {isLoading ? 'Procesando...' : 'Preguntar'}
        </button>
      </form>
    </div>
  );
};

export default AIMedicalWidget;
EOFILE

# EMR components
mkdir -p src/components/examples
cat > src/components/examples/EMRPatientSearch.tsx << 'EOFILE'
import React from 'react';

export interface EMRPatientSearchProps {
  onPatientSelect?: (patientId: string) => void;
}

export const EMRPatientSearch: React.FC<EMRPatientSearchProps> = ({ 
  onPatientSelect 
}) => {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<Array<{ id: string; name: string }>>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsSearching(true);
      // Simulación de búsqueda
      setTimeout(() => {
        setResults([
          { id: '1', name: 'Juan Pérez' },
          { id: '2', name: 'María González' }
        ]);
        setIsSearching(false);
      }, 500);
    }
  };

  return (
    <div className="emr-patient-search">
      <h3>Búsqueda de Pacientes</h3>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Buscar paciente..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" disabled={isSearching || !query.trim()}>
          {isSearching ? 'Buscando...' : 'Buscar'}
        </button>
      </form>
      {results.length > 0 && (
        <ul className="results-list">
          {results.map(patient => (
            <li key={patient.id} onClick={() => onPatientSelect?.(patient.id)}>
              {patient.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EMRPatientSearch;
EOFILE

# Setup components
mkdir -p src/components/setup
cat > src/components/setup/EMRSetupForm.tsx << 'EOFILE'
import React from 'react';

export interface EMRSetupFormProps {
  onSubmit?: (config: EMRConfig) => void;
}

interface EMRConfig {
  provider: string;
  apiUrl: string;
  apiKey: string;
}

export const EMRSetupForm: React.FC<EMRSetupFormProps> = ({ onSubmit }) => {
  const [config, setConfig] = React.useState<EMRConfig>({
    provider: 'EPIC',
    apiUrl: '',
    apiKey: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(config);
  };

  return (
    <form className="emr-setup-form" onSubmit={handleSubmit}>
      <h2>Configuración del EMR</h2>
      
      <div className="form-group">
        <label htmlFor="provider">Proveedor EMR</label>
        <select
          id="provider"
          name="provider"
          value={config.provider}
          onChange={handleChange}
        >
          <option value="EPIC">EPIC</option>
          <option value="OSCAR">OSCAR</option>
          <option value="ClinicCloud">ClinicCloud</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="apiUrl">URL de la API</label>
        <input
          id="apiUrl"
          name="apiUrl"
          type="text"
          value={config.apiUrl}
          onChange={handleChange}
          placeholder="https://api.emr-provider.com"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="apiKey">Clave API</label>
        <input
          id="apiKey"
          name="apiKey"
          type="password"
          value={config.apiKey}
          onChange={handleChange}
          placeholder="Clave API segura"
          required
        />
      </div>
      
      <button type="submit">Guardar Configuración</button>
    </form>
  );
};

export default EMRSetupForm;
EOFILE

# Pages with errors
mkdir -p src/pages
cat > src/pages/PatientsPage.tsx << 'EOFILE'
import React from 'react';

export interface PatientType {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email?: string;
  phone?: string;
}

const PatientsPage: React.FC = () => {
  const [patients, setPatients] = React.useState<PatientType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Simular carga de datos
    const loadPatients = async () => {
      try {
        // Simulación de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setPatients([
          { 
            id: '1', 
            firstName: 'Juan', 
            lastName: 'Pérez', 
            dateOfBirth: '1985-05-15',
            email: 'juan@example.com',
            phone: '555-123-4567'
          },
          { 
            id: '2', 
            firstName: 'María', 
            lastName: 'González', 
            dateOfBirth: '1990-10-20',
            email: 'maria@example.com'
          },
        ]);
        setIsLoading(false);
      } catch (err) {
        setError('Error al cargar pacientes');
        setIsLoading(false);
      }
    };
    
    loadPatients();
  }, []);

  if (isLoading) return <div>Cargando pacientes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="patients-page">
      <h1>Pacientes</h1>
      
      <table className="patients-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Fecha Nacimiento</th>
            <th>Email</th>
            <th>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(patient => (
            <tr key={patient.id}>
              <td>{patient.firstName}</td>
              <td>{patient.lastName}</td>
              <td>{patient.dateOfBirth}</td>
              <td>{patient.email || '-'}</td>
              <td>{patient.phone || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {patients.length === 0 && (
        <div className="no-patients">
          No hay pacientes registrados.
        </div>
      )}
    </div>
  );
};

export default PatientsPage;
EOFILE

echo "Reconstrucción de módulos críticos completada."
