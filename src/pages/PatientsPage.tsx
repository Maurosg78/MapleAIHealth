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
