
interface ModalProps {
  /**
   * El contenido del modal
   */
  children: React.ReactNode;
  /**
   * Si el modal está abierto
   */
  isOpen: boolean;
  /**
   * Función para cerrar el modal
   */
  onClose: () => void;
  /**
   * El título del modal
   */
  title?: string;
  /**
   * Clases CSS adicionales
   */
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  children,
  isOpen,
  onClose,
  title,
  className,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }

    const handleClose = () => {
      onClose();
    };

    dialog.addEventListener('close', handleClose);
    return () => {
      dialog.removeEventListener('close', handleClose);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleOverlayKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <button
        className="fixed inset-0 w-full h-full bg-black/50 backdrop-blur-sm"
        onClick={handleOverlayClick}
        onKeyDown={handleOverlayKeyDown}
        aria-label="Cerrar modal (clic fuera)"
      />
      <dialog
        ref={dialogRef}
        className={cn(
          'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
          'rounded-lg shadow-xl border border-gray-200',
          'p-6 max-w-lg w-full',
          'bg-white dark:bg-gray-800',
          'focus:outline-none focus:ring-2 focus:ring-primary-500',
          'animate-fade-in',
          className
        )}
      >
        <div className="relative">
          {title && (
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            aria-label="Cerrar modal (botón x)"
          >
            ×
          </button>
          {children}
        </div>
      </dialog>
    </>,
    document.body
  );
};
