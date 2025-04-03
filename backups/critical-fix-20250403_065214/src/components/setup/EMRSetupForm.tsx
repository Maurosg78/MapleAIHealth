import { useState, useEffect } from 'react';
// Definir interfaz para la configuración de EMR
import { Button, Input, Select, Modal, Spinner } from '@chakra-ui/react';
import React from 'react';
interface EMRAdapterConfig {
  baseUrl?: string;
  username?: string;
  password?: string;
  apiUrl?: string;
  apiKey?: string;
  clinicId?: string;
  clientId?: string;
  clientSecret?: string;
  [key: string]: string | undefined;
}

export interface EMRSetupFormProps {
  onSetupComplete: (adapterName: string, config: EMRAdapterConfig) => void;
  initialAdapterName?: string;
  initialConfig?: EMRAdapterConfig;
}

/**
 * Componente para configurar y probar adaptadores EMR
 */
export const EMRSetupForm: React.FC<EMRSetupFormProps> = ({
  onSetupComplete,
  initialAdapterName,
  initialConfig,
}) => {
  // Estado para el adaptador seleccionado
  const [selectedAdapter, setSelectedAdapter] = useState(
    initialAdapterName ?? ''
  );

  // Estado para guardar los adaptadores disponibles
  const [availableAdapters, setAvailableAdapters] = useState<
    Array<{
      id: string;
      name: string;
      description: string;
    }>
  >([]);

  // Estado para guardar la configuración del adaptador

  // Estado para indicar si estamos probando la conexión

  // Estado para mensajes
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  // Cargar los adaptadores disponibles al montar el componente
  useEffect(() => {
    setAvailableAdapters(adapters);

    // Si no hay adaptador inicial seleccionado y tenemos adaptadores disponibles
    if (!selectedAdapter && adapters.length > 0) {
      setSelectedAdapter(adapters[0].id);
    }
  }, [selectedAdapter]);

  // Actualizar un campo de configuración
  const handleConfigChange = (field: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Renderizar campos de configuración según el adaptador seleccionado
  const renderConfigFields = () => {
    switch (selectedAdapter) {
      case 'OSCAR':
        return (
          <>
            <div className="form-group">
              <label htmlFor="baseUrl">
                URL Base <span className="required">*</span>
              </label>
              <input
                id="baseUrl"
                type="text"
                placeholder="https://oscar-instance.hospital.ca"
                value={config.baseUrl ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleConfigChange('baseUrl', e.target.value)
                }
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">
                Usuario <span className="required">*</span>
              </label>
              <input
                id="username"
                type="text"
                placeholder="usuario-oscar"
                value={config.username ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleConfigChange('username', e.target.value)
                }
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Contraseña <span className="required">*</span>
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={config.password ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleConfigChange('password', e.target.value)
                }
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="clinicId">
                ID de Clínica <span className="required">*</span>
              </label>
              <input
                id="clinicId"
                type="text"
                placeholder="12345"
                value={config.clinicId ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleConfigChange('clinicId', e.target.value)
                }
                className="form-input"
              />
            </div>
          </>
        );

      case 'CLINICCLOUD':
        return (
          <>
            <div className="form-group">
              <label htmlFor="apiUrl">
                URL de la API <span className="required">*</span>
              </label>
              <input
                id="apiUrl"
                type="text"
                placeholder="https://api.cliniccloud.es"
                value={config.apiUrl ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleConfigChange('apiUrl', e.target.value)
                }
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="apiKey">
                API Key <span className="required">*</span>
              </label>
              <input
                id="apiKey"
                type="text"
                placeholder="tu-api-key"
                value={config.apiKey ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleConfigChange('apiKey', e.target.value)
                }
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="clinicId">
                ID de Clínica <span className="required">*</span>
              </label>
              <input
                id="clinicId"
                type="text"
                placeholder="id-de-tu-clinica"
                value={config.clinicId ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleConfigChange('clinicId', e.target.value)
                }
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="clientId">Client ID (OAuth, opcional)</label>
              <input
                id="clientId"
                type="text"
                placeholder="oauth-client-id"
                value={config.clientId ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleConfigChange('clientId', e.target.value)
                }
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="clientSecret">
                Client Secret (OAuth, opcional)
              </label>
              <input
                id="clientSecret"
                type="password"
                placeholder="••••••••"
                value={config.clientSecret ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleConfigChange('clientSecret', e.target.value)
                }
                className="form-input"
              />
            </div>
          </>
        );

      case 'EPIC':
        return (
          <>
            <div className="form-group">
              <label htmlFor="baseUrl">
                URL Base <span className="required">*</span>
              </label>
              <input
                id="baseUrl"
                type="text"
                placeholder="https://epic-fhir-api.hospital.org"
                value={config.baseUrl ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleConfigChange('baseUrl', e.target.value)
                }
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="apiKey">API Key</label>
              <input
                id="apiKey"
                type="text"
                placeholder="tu-api-key"
                value={config.apiKey ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleConfigChange('apiKey', e.target.value)
                }
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="clientId">Client ID (OAuth2)</label>
              <input
                id="clientId"
                type="text"
                placeholder="tu-client-id"
                value={config.clientId ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleConfigChange('clientId', e.target.value)
                }
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="clientSecret">Client Secret (OAuth2)</label>
              <input
                id="clientSecret"
                type="password"
                placeholder="••••••••"
                value={config.clientSecret ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleConfigChange('clientSecret', e.target.value)
                }
                className="form-input"
              />
            </div>
          </>
        );

      case 'GENERIC':
        return (
          <div className="info-box">
            <p>
              El adaptador genérico no requiere configuración. Es útil para
              desarrollo y demostración.
            </p>
          </div>
        );

      default:
        return (
          <div className="warning-box">
            <p>Selecciona un adaptador EMR para configurarlo.</p>
          </div>
        );
    }
  };

  // Probar la conexión con el adaptador configurado
  const testConnection = async () => {
    try {
      setIsTesting(true);

      // Obtener una instancia del adaptador seleccionado con la configuración actual

      // Probar la conexión

      if (result) {
        setMessage({
          text: `La conexión con ${selectedAdapter} se ha establecido correctamente.`,
          type: 'success',
        });
      } else {
        setMessage({
          text: 'No se pudo establecer conexión con el sistema EMR.',
          type: 'error',
        });
      }
    } catch (error) {
      setMessage({
        text: `Error: ${(error as Error).message}`,
        type: 'error',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Guardar la configuración
  const saveConfiguration = () => {
    // Validar configuración según el adaptador seleccionado
    if (selectedAdapter === 'OSCAR') {
      if (
        !config.baseUrl ||
        !config.username ||
        !config.password ||
        !config.clinicId
      ) {
        setMessage({
          text: 'Por favor completa todos los campos requeridos.',
          type: 'warning',
        });
        return;
      }
    } else if (selectedAdapter === 'CLINICCLOUD') {
      if (!config.apiUrl || !config.apiKey || !config.clinicId) {
        setMessage({
          text: 'Por favor completa todos los campos requeridos.',
          type: 'warning',
        });
        return;
      }
    } else if (selectedAdapter === 'EPIC') {
      if (!config.baseUrl) {
        setMessage({
          text: 'Por favor completa todos los campos requeridos.',
          type: 'warning',
        });
        return;
      }
    }

    // Notificar al componente padre
    onSetupComplete(selectedAdapter, config);

    setMessage({
      text: `Configuración de ${selectedAdapter} guardada exitosamente.`,
      type: 'success',
    });
  };

  const selectedAdapterInfo = availableAdapters.find(
    (a) => a.id === selectedAdapter
  );

  return (
    <div className="card">
      <div className="card-content">
        <h2 className="card-title">Configuración de Sistema EMR</h2>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
            <button
              className="close-message"
              onClick={() => setMessage(null)}
              aria-label="Cerrar mensaje"
            >
              ×
            </button>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="emr-select">Sistema EMR</label>
          <select
            id="emr-select"
            value={selectedAdapter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedAdapter(e.target.value)
            }
            className="form-select"
            aria-label="Seleccionar sistema EMR"
          >
            {availableAdapters.map((adapter) => (
              <option key={adapter.id} value={adapter.id}>
                {adapter.name}
              </option>
            ))}
          </select>

          {selectedAdapterInfo && (
            <p className="helper-text">{selectedAdapterInfo.description}</p>
          )}
        </div>

        <div className="form-fields">{renderConfigFields()}</div>

        <div className="button-group">
          <button
            className="button outline"
            onClick={testConnection}
            disabled={!selectedAdapter || isTesting}
          >
            {isTesting ? 'Probando...' : 'Probar Conexión'}
          </button>

          <button
            className="button primary"
            onClick={saveConfiguration}
            disabled={!selectedAdapter}
          >
            Guardar Configuración
          </button>
        </div>
      </div>

      <style>{`
        .card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          background: white;
        }
        .card-content {
          padding: 1.5rem;
        }
        .card-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        .required {
          color: #e53e3e;
        }
        .form-input, .form-select {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #cbd5e0;
          border-radius: 0.375rem;
          font-size: 1rem;
        }
        .form-fields {
          margin: 1rem 0;
        }
        .info-box, .warning-box {
          padding: 1rem;
          border-radius: 0.375rem;
          margin-bottom: 1rem;
        }
        .info-box {
          background: #ebf8ff;
          border: 1px solid #4299e1;
        }
        .warning-box {
          background: #fffaf0;
          border: 1px solid #f6ad55;
        }
        .button-group {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        .button {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 0.375rem;
          cursor: pointer;
        }
        .button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .outline {
          background: white;
          color: #2c7a7b;
          border: 1px solid #2c7a7b;
        }
        .primary {
          background: #3182ce;
          color: white;
          border: none;
        }
        .helper-text {
          font-size: 0.75rem;
          color: #718096;
          margin-top: 0.5rem;
        }
        .message {
          padding: 0.75rem 1rem;
          margin-bottom: 1rem;
          border-radius: 0.375rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .success {
          background: #c6f6d5;
          border: 1px solid #38a169;
          color: #276749;
        }
        .error {
          background: #fed7d7;
          border: 1px solid #e53e3e;
          color: #c53030;
        }
        .warning {
          background: #feebc8;
          border: 1px solid #dd6b20;
          color: #c05621;
        }
        .info {
          background: #bee3f8;
          border: 1px solid #3182ce;
          color: #2c5282;
        }
        .close-message {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default EMRSetupForm;
