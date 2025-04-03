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

interface ToastProps {
  /**
   * El tipo de toast
   */
  type?: 'success' | 'error' | 'warning' | 'info';
  /**
   * El mensaje del toast
   */
  message: string;
  /**
   * Posición del toast
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /**
   * Función para cerrar el toast
   */
  onClose?: () => void;
  /**
   * Duración en milisegundos antes de cerrar automáticamente
   */
  duration?: number;
  /**
   * Clases CSS adicionales
   */
  className?: string;
}

const icons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationCircleIcon,
  info: InformationCircleIcon,
};

const positions = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
};

/**
 * Componente Toast para mostrar notificaciones temporales
 */
export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  message,
  position = 'bottom-right',
  onClose,
  duration = 3000,
  className,
}) => {
  useEffect(() => {
    if (duration && onClose) {

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);



  const baseStyles =
    'fixed p-4 rounded-lg shadow-lg max-w-sm flex items-center gap-3';
  const typeStyles = {
    success: 'bg-green-50 border border-green-200 text-green-800',
    error: 'bg-red-50 border border-red-200 text-red-800',
    warning: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border border-blue-200 text-blue-800',
  };

  const iconColorStyles = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  };

  return createPortal(
    <div
      className={cn(
        baseStyles,
        typeStyles[type],
        positions[position],
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {Icon && (
        <Icon
          className={cn('h-5 w-5', iconColorStyles[type])}
          aria-hidden="true"
        />
      )}
      <div className="flex-1">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto text-current hover:opacity-75 focus:outline-none"
          aria-label="Cerrar notificación"
        >
          ×
        </button>
      )}
    </div>,
    document.body
  );
};
