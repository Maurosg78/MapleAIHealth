import * as React from 'react';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
  labelId?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className = '',
  id,
  labelId,
  ...props
}) => {
  // Generar un ID único si no se proporciona uno
  const selectId = id || `select-${Math.random().toString(36).substring(2, 10)}`;
  const labelFor = labelId || selectId;

  // Construir los componentes de forma condicional
  const renderSelect = () => {
    if (error) {
      return (
        <select
          id={selectId}
          className={`select select-error ${className}`}
          aria-invalid="true"
          aria-describedby={`${selectId}-error`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    } else {
      return (
        <select
          id={selectId}
          className={`select ${className}`}
          aria-invalid="false"
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }
  };

  return (
    <div className="select-container">
      {label && (
        <label htmlFor={labelFor} className="select-label">
          {label}
        </label>
      )}
      {renderSelect()}
      {error && (
        <div
          id={`${selectId}-error`}
          className="select-error-message"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default Select;
