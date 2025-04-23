/**
 * Función para ejecutar una función después de un período de tiempo
 * para evitar múltiples ejecuciones en ráfaga
 * 
 * @param func Función a ejecutar
 * @param wait Tiempo de espera en milisegundos
 * @returns Función debounce que se puede llamar múltiples veces
 */
export function debounce<F extends (...args: never[]) => unknown>(
  func: F,
  wait: number
): F {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  // Usamos una aserción de tipo porque sabemos que la firma es compatible
  const debouncedFunction = function(this: unknown, ...args: Parameters<F>): void {
    const later = (): void => {
      timeout = null;
      func.apply(this, args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  } as unknown as F;
  
  return debouncedFunction;
} 