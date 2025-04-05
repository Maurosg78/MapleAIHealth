import * as React from 'react';

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  labelId?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  className = '',
  id,
  labelId,
  ...props
}) => {
  // Generar un ID único si no se proporciona uno
  const textareaId =
    id || `textarea-${Math.random().toString(36).substring(2, 10)}`;
  const labelFor = labelId || textareaId;

  // Construir los componentes de forma condicional
  const renderTextArea = () => {
    if (error) {
      return (
        <textarea
          id={textareaId}
          className={`textarea textarea-error ${className}`}
          aria-invalid="true"
          aria-describedby={`${textareaId}-error`}
          {...props}
        />
      );
    } else {
      return (
        <textarea
          id={textareaId}
          className={`textarea ${className}`}
          aria-invalid="false"
          {...props}
        />
      );
    }
  };

  return (
    <div className="textarea-container">
      {label && (
        <label htmlFor={labelFor} className="textarea-label">
          {label}
        </label>
      )}
      {renderTextArea()}
      {error && (
        <div
          id={`${textareaId}-error`}
          className="textarea-error-message"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default TextArea;
