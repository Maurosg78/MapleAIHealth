import React from 'react';
import { useState, useEffect } from 'react';

export interface NoteInputProps {
  title?: string;
  children?: React.ReactNode;
}

export const NoteInput: React.FC<NoteInputProps> = ({ title, children }) => {
  return (
    <div className="NoteInput">
      {title && <h2>{title}</h2>}
      <div className="NoteInput-content">
        {children}
      </div>
    </div>
  );
};

export default NoteInput;
