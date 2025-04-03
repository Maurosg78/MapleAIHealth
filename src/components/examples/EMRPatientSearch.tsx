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
