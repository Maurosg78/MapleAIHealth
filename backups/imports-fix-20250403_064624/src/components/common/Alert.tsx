import { 
   useState, useEffect 
 } from "react"
  CheckCircleIcon,
import { 
   Button, Input, Select, Modal, Spinner 
 } from "@chakra-ui/react"
  XCircleIcon,
import { 
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface AlertProps {
  /**
   * El tipo de alerta
   */
  type?: 'success' | 'error' | 'warning' | 'info';
  /**
   * El título de la alerta (opcional)
   */
  title?: string;
  /**
   * El contenido de la alerta
   */
  children: React.ReactNode;
  /**
   * Clases CSS adicionales
   */
  className?: string;
  /**
   * Función para cerrar la alerta
   */
  onClose?: () => void;
  /**
   * Variante de estilo
   */
  variant?: 'solid' | 'outlined' | 'ghost';
  /**
   * Icono personalizado
   */
  icon?: React.ReactNode;
}

const icons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationCircleIcon,
  info: InformationCircleIcon,
};

/**
 * Componente Alert para mostrar mensajes importantes
 */
export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  className,
  onClose,
  variant = 'solid',
  icon,
}) => {



  const variantStyles = {
    solid: {
      success: 'bg-green-50 text-green-800 border border-green-200',
      error: 'bg-red-50 text-red-800 border border-red-200',
      warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
      info: 'bg-blue-50 text-blue-800 border border-blue-200',
    },
    outlined: {
      success: 'bg-white border border-green-500 text-green-800',
      error: 'bg-white border border-red-500 text-red-800',
      warning: 'bg-white border border-yellow-500 text-yellow-800',
      info: 'bg-white border border-blue-500 text-blue-800',
    },
    ghost: {
      success: 'bg-transparent text-green-800',
      error: 'bg-transparent text-red-800',
      warning: 'bg-transparent text-yellow-800',
      info: 'bg-transparent text-blue-800',
    },
  };

  const iconColorStyles = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  };

  return (
    <output
      className={cn(baseStyles, variantStyles[variant][type], className)}
      role="alert"
    >
      {icon ||
        (Icon && (
          <Icon
            className={cn('h-5 w-5', iconColorStyles[type])}
            aria-hidden="true"
          />
        ))}
      <div className="flex-1">
        {title && <div className="font-medium mb-1">{title}</div>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto text-current hover:opacity-75 focus:outline-none"
          aria-label="Cerrar alerta"
        >
          ×
        </button>
      )}
    </output>
  );
};
