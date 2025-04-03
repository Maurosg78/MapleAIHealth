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

  const handlePatientSelect = (patientId: string) => {
    if (onPatientSelect) {
      onPatientSelect(patientId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, patientId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePatientSelect(patientId);
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
            <li key={patient.id}>
              <div
                onClick={() => handlePatientSelect(patient.id)}
                onKeyDown={(e) => handleKeyDown(e, patient.id)}
                tabIndex={0}
                role="button"
                aria-label={`Seleccionar paciente ${patient.name}`}
                className="w-full py-2 px-3 hover:bg-gray-100 cursor-pointer"
              >
                {patient.name}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EMRPatientSearch;
