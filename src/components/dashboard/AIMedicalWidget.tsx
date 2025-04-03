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
