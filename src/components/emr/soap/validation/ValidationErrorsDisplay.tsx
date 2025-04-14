import React from 'react';

interface ValidationErrorsDisplayProps {
  errors: string[];
  className?: string;
}

/**
 * Componente para mostrar errores de validación
 * 
 * @param errors - Lista de mensajes de error a mostrar
 * @param className - Clases adicionales para el contenedor
 */
export const ValidationErrorsDisplay: React.FC<ValidationErrorsDisplayProps> = ({
  errors,
  className = '',
}) => {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div 
      className={`bg-red-50 border border-red-200 rounded-md p-4 mt-4 ${className}`}
      role="alert"
      aria-labelledby="validation-errors-title"
    >
      <h3 
        id="validation-errors-title"
        className="text-sm font-medium text-red-800 mb-2"
      >
        Campos requeridos faltantes:
      </h3>
      <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
        {errors.map((error, index) => (
          <li key={`error-${index}`}>{error}</li>
        ))}
      </ul>
    </div>
  );
}; 