import * as React from 'react';
import { useState, useCallback, useRef, useEffect, memo } from 'react';

interface NoteInputProps {
  initialValue?: string;
  placeholder?: string;
  label?: string;
  onSave: (note: string) => Promise<void>;
  onCancel?: () => void;
  autoFocus?: boolean;
  maxLength?: number;
  className?: string;
}

const NoteInput: React.FC<NoteInputProps> = memo(({
  initialValue = '',
  placeholder = 'Ingrese su nota clínica aquí...',
  label = 'Nota clínica',
  onSave,
  onCancel,
  autoFocus = false,
  maxLength = 2000,
  className = '',
}) => {
  const [note, setNote] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [charCount, setCharCount] = useState(initialValue.length);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setNote(value);
      setCharCount(value.length);
    }
  }, [maxLength]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Guardar con Ctrl+Enter o Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSave();
    }
  }, [note, onSave]);

  const handleSave = useCallback(async () => {
    if (note.trim() === '') return;

    try {
      setIsSaving(true);
      await onSave(note);
      setNote('');
      setCharCount(0);
    } catch (error) {
      console.error('Error al guardar la nota:', error);
    } finally {
      setIsSaving(false);
    }
  }, [note, onSave]);

  const handleCancel = useCallback(() => {
    setNote(initialValue);
    setCharCount(initialValue.length);
    if (onCancel) onCancel();
  }, [initialValue, onCancel]);

  // Ajustar altura automáticamente
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [note]);

  return (
    <div className={`rounded-lg border border-gray-200 shadow-sm p-4 ${className}`}>
      <label htmlFor="clinical-note" className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <textarea
        id="clinical-note"
        ref={textareaRef}
        value={note}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        disabled={isSaving}
        aria-label={label}
      />

      <div className="flex justify-between items-center mt-2">
        <div className="text-xs text-gray-500">
          {charCount}/{maxLength} caracteres
        </div>
        <div className="flex space-x-2">
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition"
              disabled={isSaving}
            >
              Cancelar
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition"
            disabled={isSaving || note.trim() === ''}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
});

NoteInput.displayName = 'NoteInput';

export default NoteInput;
