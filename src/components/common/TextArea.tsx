import React from 'react';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ 
  label, 
  error, 
  className = '',
  ...props 
}) => {
  return (
    <div className="textarea-container">
      {label && <label className="textarea-label">{label}</label>}
      <textarea className={`textarea ${error ? 'textarea-error' : ''} ${className}`} {...props} />
      {error && <div className="textarea-error-message">{error}</div>}
    </div>
  );
};

export default TextArea;
