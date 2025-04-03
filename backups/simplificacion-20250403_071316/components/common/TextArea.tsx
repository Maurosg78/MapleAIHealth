import React from 'react';

export export interface TextAreaProps {
  // Props definidas automáticamente
  children?: React.ReactNode;
}

export const TextArea: React.FC<TextAreaProps> = ({ children }) => {
  return (
    <div className="TextArea">
      {children}
    </div>
  );
};

export default TextArea;
