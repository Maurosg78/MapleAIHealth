import { RangeOfMotionData } from "../types/clinical";;;;;

/**
 * Valida que los valores de rango de movimiento sean números válidos
 */
export const validateROMValues = (rom?: RangeOfMotionData): boolean => {
  if (!rom) return true;
  
  const { active, passive, normal } = rom;
  
  // Verificar que los valores definidos sean números válidos
  if (active !== undefined && (isNaN(active) || active < 0)) return false;
  if (passive !== undefined && (isNaN(passive) || passive < 0)) return false;
  if (normal !== undefined && (isNaN(normal) || normal < 0)) return false;
  
  return true;
}; 