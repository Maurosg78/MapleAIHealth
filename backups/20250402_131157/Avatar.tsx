
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarVariant = 'circle' | 'square' | 'rounded';

interface AvatarProps {
  /**
   * La URL de la imagen del avatar
   */
  src?: string;
  /**
   * El texto alternativo para la imagen
   */
  alt?: string;
  /**
   * El tamaño del avatar
   */
  size?: AvatarSize;
  /**
   * La variante del avatar que determina su forma
   */
  variant?: AvatarVariant;
  /**
   * Si el avatar está deshabilitado
   */
  disabled?: boolean;
  /**
   * Si el avatar está en estado de carga
   */
  isLoading?: boolean;
  /**
   * Clases CSS adicionales
   */
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

const variantStyles: Record<AvatarVariant, string> = {
  circle: 'rounded-full',
  square: 'rounded-none',
  rounded: 'rounded-lg',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  variant = 'circle',
  disabled = false,
  isLoading = false,
  className,
}) => {
  const getInitials = (alt: string) => {
    return alt
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div
      className={twMerge(
        'relative inline-flex items-center justify-center bg-gray-200 text-gray-600 font-medium',
        sizeStyles[size],
        variantStyles[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        isLoading && 'animate-pulse',
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className={twMerge(
            'w-full h-full object-cover',
            variantStyles[variant]
          )}
        />
      ) : (
        <span aria-label={alt}>{getInitials(alt)}</span>
      )}
      {isLoading && (
        <div
          className={twMerge(
            'absolute inset-0 bg-gray-200 animate-pulse',
            variantStyles[variant]
          )}
        />
      )}
    </div>
  );
};
