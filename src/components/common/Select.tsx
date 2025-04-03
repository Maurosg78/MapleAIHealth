import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  options,
  error,
  className = '',
  ...props 
}) => {
  return (
    <div className="select-container">
      {label && <label className="select-label">{label}</label>}
      <select className={`select ${error ? 'select-error' : ''} ${className}`} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <div className="select-error-message">{error}</div>}
    </div>
  );
};

export default Select;
