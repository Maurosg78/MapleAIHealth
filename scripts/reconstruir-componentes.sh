#!/bin/bash

# Script para reconstruir componentes y servicios esenciales
set -e

echo "Reconstruyendo componentes y servicios esenciales..."

# Reconstruir componentes UI básicos
mkdir -p src/components/common

# Avatar
cat > src/components/common/Avatar.tsx << 'EOFILE'
import React from 'react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt = 'Avatar',
  size = 'md' 
}) => {
  return (
    <div className={`avatar avatar-${size}`}>
      {src ? (
        <img src={src} alt={alt} className="avatar-image" />
      ) : (
        <div className="avatar-placeholder">{alt.charAt(0)}</div>
      )}
    </div>
  );
};

export default Avatar;
EOFILE

# Badge
cat > src/components/common/Badge.tsx << 'EOFILE'
import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default' 
}) => {
  return (
    <span className={`badge badge-${variant}`}>
      {children}
    </span>
  );
};

export default Badge;
EOFILE

# Alert
cat > src/components/common/Alert.tsx << 'EOFILE'
import React from 'react';

export interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ 
  children, 
  variant = 'info',
  title,
  onClose 
}) => {
  return (
    <div className={`alert alert-${variant}`}>
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        <div className="alert-message">{children}</div>
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
EOFILE

# Card
cat > src/components/common/Card.tsx << 'EOFILE'
import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'default',
  className = '',
  ...props 
}) => {
  return (
    <div className={`card card-${variant} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
EOFILE

# Modal
cat > src/components/common/Modal.tsx << 'EOFILE'
import React from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          {title && <h3 className="modal-title">{title}</h3>}
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
EOFILE

# Spinner
cat > src/components/common/Spinner.tsx << 'EOFILE'
import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  variant = 'primary' 
}) => {
  return (
    <div className={`spinner spinner-${size} spinner-${variant}`}>
      <div className="spinner-circle"></div>
    </div>
  );
};

export default Spinner;
EOFILE

# Select
cat > src/components/common/Select.tsx << 'EOFILE'
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
EOFILE

# Progress
cat > src/components/common/Progress.tsx << 'EOFILE'
import React from 'react';

export interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({ 
  value, 
  max = 100,
  label,
  showValue = false
}) => {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <div className="progress-container">
      {label && <div className="progress-label">{label}</div>}
      <div className="progress">
        <div 
          className="progress-bar" 
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        ></div>
      </div>
      {showValue && <div className="progress-value">{percentage}%</div>}
    </div>
  );
};

export default Progress;
EOFILE

# TextArea
cat > src/components/common/TextArea.tsx << 'EOFILE'
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
EOFILE

# Skeleton
cat > src/components/common/Skeleton.tsx << 'EOFILE'
import React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circle' | 'rect';
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width, 
  height,
  variant = 'text'
}) => {
  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : 50),
    height: height || (variant === 'text' ? 16 : 50),
  };
  
  return (
    <div 
      className={`skeleton skeleton-${variant}`}
      style={style}
    />
  );
};

export default Skeleton;
EOFILE

# Toast
cat > src/components/common/Toast.tsx << 'EOFILE'
import React from 'react';

export interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info',
  onClose
}) => {
  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">{message}</div>
      {onClose && (
        <button className="toast-close" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
};

export default Toast;
EOFILE

# NotFound
cat > src/components/common/NotFound.tsx << 'EOFILE'
import React from 'react';

export interface NotFoundProps {
  message?: string;
}

export const NotFound: React.FC<NotFoundProps> = ({ 
  message = 'No se encontró el recurso solicitado.'
}) => {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>{message}</p>
    </div>
  );
};

export default NotFound;
EOFILE

# Crear archivo index
cat > src/components/common/index.ts << 'EOFILE'
export { Alert } from './Alert';
export type { AlertProps } from './Alert';

export { Avatar } from './Avatar';
export type { AvatarProps } from './Avatar';

export { Badge } from './Badge';
export type { BadgeProps } from './Badge';

export { Button } from './Button';
export type { ButtonProps } from './Button';

export { Card } from './Card';
export type { CardProps } from './Card';

export { Input } from './Input';
export type { InputProps } from './Input';

export { Modal } from './Modal';
export type { ModalProps } from './Modal';

export { NotFound } from './NotFound';
export type { NotFoundProps } from './NotFound';

export { Progress } from './Progress';
export type { ProgressProps } from './Progress';

export { Select } from './Select';
export type { SelectProps } from './Select';

export { Skeleton } from './Skeleton';
export type { SkeletonProps } from './Skeleton';

export { Spinner } from './Spinner';
export type { SpinnerProps } from './Spinner';

export { TextArea } from './TextArea';
export type { TextAreaProps } from './TextArea';

export { Toast } from './Toast';
export type { ToastProps } from './Toast';
EOFILE

# Reconstruir servicios principales
mkdir -p src/services/emr/implementations

cat > src/services/emr/types.ts << 'EOFILE'
export interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface EMRConsultation {
  id: string;
  patientId: string;
  date: string;
  notes: string;
  status: "active" | "inactive" | "pending" | "cancelled" | "completed";
}

export interface EMRTreatment {
  id: string;
  consultationId: string;
  description: string;
  status: "active" | "inactive" | "pending" | "cancelled" | "completed";
}

export type EMRStatus = "active" | "inactive" | "pending" | "cancelled" | "completed";
EOFILE

# Actualizar archivo API
mkdir -p src/lib
cat > src/lib/api.ts << 'EOFILE'
export interface HttpService {
  get<T>(url: string, params?: Record<string, any>): Promise<T>;
  post<T>(url: string, data?: any): Promise<T>;
  put<T>(url: string, data?: any): Promise<T>;
  delete<T>(url: string): Promise<T>;
}

class ApiService implements HttpService {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.keys(params).forEach(key => 
        url.searchParams.append(key, params[key])
      );
    }
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url.toString(), options);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  }
  
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, params);
  }
  
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }
  
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('PUT', endpoint, data);
  }
  
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }
}

export const apiService = new ApiService(
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
);

export default apiService;
EOFILE

# Actualizar App.tsx
cat > src/App.tsx << 'EOFILE'
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from 'react-query';
import { queryClient } from './lib/queryClient';

const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <React.Suspense fallback={<div>Cargando...</div>}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </React.Suspense>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
EOFILE

# Actualizar main.tsx
cat > src/main.tsx << 'EOFILE'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOFILE

echo "Componentes y servicios esenciales reconstruidos."
