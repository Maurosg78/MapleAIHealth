import React from 'react';

export interface EMRSetupFormProps {
  onSubmit?: (config: EMRConfig) => void;
}

interface EMRConfig {
  provider: string;
  apiUrl: string;
  apiKey: string;
}

export const EMRSetupForm: React.FC<EMRSetupFormProps> = ({ onSubmit }) => {
  const [config, setConfig] = React.useState<EMRConfig>({
    provider: 'EPIC',
    apiUrl: '',
    apiKey: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(config);
  };

  return (
    <form className="emr-setup-form" onSubmit={handleSubmit}>
      <h2>Configuración del EMR</h2>
      
      <div className="form-group">
        <label htmlFor="provider">Proveedor EMR</label>
        <select
          id="provider"
          name="provider"
          value={config.provider}
          onChange={handleChange}
        >
          <option value="EPIC">EPIC</option>
          <option value="OSCAR">OSCAR</option>
          <option value="ClinicCloud">ClinicCloud</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="apiUrl">URL de la API</label>
        <input
          id="apiUrl"
          name="apiUrl"
          type="text"
          value={config.apiUrl}
          onChange={handleChange}
          placeholder="https://api.emr-provider.com"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="apiKey">Clave API</label>
        <input
          id="apiKey"
          name="apiKey"
          type="password"
          value={config.apiKey}
          onChange={handleChange}
          placeholder="Clave API segura"
          required
        />
      </div>
      
      <button type="submit">Guardar Configuración</button>
    </form>
  );
};

export default EMRSetupForm;
