import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Componente reutilizable para las secciones SOAP (Subjetivo, Objetivo, Análisis, Plan)
 * Proporciona una estructura común y estilos para cada sección
 */
export const SOAPSection: React.FC<Props> = ({ title, children, className = '' }) => {
  return (
    <div className={`soap-section ${className}`}>
      <h3 className="soap-section-title">{title}</h3>
      <div className="soap-section-content">
        {children}
      </div>
    </div>
  );
};

interface ArrayFieldProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onAdd: () => void;
  onRemove: (index: number) => void;
  addButtonText: string;
  readOnly?: boolean;
}

/**
 * Componente reutilizable para campos de tipo array en las secciones SOAP
 * Permite añadir, editar y eliminar elementos de un array
 */
export function ArrayField<T>({ 
  items, 
  renderItem, 
  onAdd, 
  onRemove, 
  addButtonText,
  readOnly = false 
}: ArrayFieldProps<T>) {
  return (
    <div className="soap-array-field">
      {items.map((item, index) => (
        <div key={index} className="soap-array-item">
          {renderItem(item, index)}
          {!readOnly && (
            <button
              type="button"
              className="soap-button"
              onClick={() => onRemove(index)}
            >
              -
            </button>
          )}
        </div>
      ))}
      {!readOnly && (
        <button
          type="button"
          className="soap-button"
          onClick={onAdd}
        >
          {addButtonText}
        </button>
      )}
    </div>
  );
}

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Componente para campos de formulario con etiqueta
 */
export const FormField: React.FC<FormFieldProps> = ({ label, children, className = '' }) => {
  return (
    <div className={`soap-form-field ${className}`}>
      <label className="soap-field-label">{label}</label>
      <div className="soap-field-input">
        {children}
      </div>
    </div>
  );
};

export default SOAPSection; 