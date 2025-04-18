import React, { useState } from 'react';

interface DataRequestFormProps {
  missingFields: string[];
  onSubmit: (data: Record<string, string>) => void;
  onCancel: () => void;
}

/**
 * Formulario para solicitar información clínica faltante al profesional médico
 * 
 * ADVERTENCIA DE SEGURIDAD MÉDICA - PRIORIDAD ALTA
 * Este formulario solicita explícitamente los datos necesarios sin proponer 
 * valores por defecto para evitar cualquier tipo de sugerencia que pudiera 
 * condicionar al profesional médico.
 */
export const DataRequestForm: React.FC<DataRequestFormProps> = ({
  missingFields,
  onSubmit,
  onCancel
}) => {
  // Convertir los campos faltantes en un objeto de formulario
  const initialFormData = missingFields.reduce((acc, field) => {
    // Extraer el nombre del campo de la cadena "Se requiere [campo]"
    const fieldName = field.match(/Se requiere (.+?)(]|$)/)?.[1] || field;
    acc[fieldName] = '';
    return acc;
  }, {} as Record<string, string>);

  const [formData, setFormData] = useState(initialFormData);
  const formId = 'clinical-data-request-form';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Formatear nombre de campo para mostrar y para propósitos de accesibilidad
  const formatFieldName = (fieldName: string): string => {
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/_/g, ' ');
  };

  return (
    <div className="bg-white shadow-md rounded-lg border border-gray-200 p-5">
      <h2 id={`${formId}-title`} className="text-lg font-medium text-gray-900 mb-4">
        Solicitud de Información Clínica
      </h2>
      
      <div className="mb-4 bg-blue-50 p-3 rounded text-sm text-blue-800">
        <p id={`${formId}-description`}>
          <strong>Nota importante:</strong> La información solicitada es necesaria para proporcionar 
          asistencia clínica adecuada. Por favor, complete todos los campos requeridos 
          con información precisa.
        </p>
      </div>
      
      <form 
        id={formId}
        onSubmit={handleSubmit}
        aria-labelledby={`${formId}-title`}
        aria-describedby={`${formId}-description`}
      >
        <div className="space-y-4">
          {Object.keys(formData).map((fieldName) => {
            // Determinar el tipo de campo según el nombre
            const isTextArea = fieldName.includes('descripción') || 
                               fieldName.includes('historia') || 
                               fieldName.includes('antecedentes') ||
                               fieldName.includes('estado funcional');

            const formattedFieldName = formatFieldName(fieldName);
            const fieldId = `field-${fieldName.replace(/\s+/g, '-').toLowerCase()}`;
            
            return (
              <div key={fieldName} className="flex flex-col">
                <label 
                  htmlFor={fieldId} 
                  className="block text-sm font-medium text-gray-700 mb-1"
                  id={`${fieldId}-label`}
                >
                  {formattedFieldName}
                  <span className="text-red-500 ml-1" aria-hidden="true">*</span>
                  <span className="sr-only"> (obligatorio)</span>
                </label>
                <p id={`${fieldId}-description`} className="sr-only">
                  Ingrese {formattedFieldName.toLowerCase()} del paciente
                </p>
                {isTextArea ? (
                  <textarea
                    id={fieldId}
                    name={fieldName}
                    value={formData[fieldName]}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    rows={3}
                    required
                    aria-required="true"
                    aria-labelledby={`${fieldId}-label`}
                    aria-describedby={`${fieldId}-description`}
                    placeholder={`Ingrese ${formattedFieldName.toLowerCase()}`}
                  />
                ) : (
                  <input
                    type="text"
                    id={fieldId}
                    name={fieldName}
                    value={formData[fieldName]}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    required
                    aria-required="true"
                    aria-labelledby={`${fieldId}-label`}
                    aria-describedby={`${fieldId}-description`}
                    placeholder={`Ingrese ${formattedFieldName.toLowerCase()}`}
                  />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Enviar información
          </button>
        </div>
      </form>
    </div>
  );
}; 