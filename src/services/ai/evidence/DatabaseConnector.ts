import { EvidenceSource } from '../types';

/**
 * Interfaz para conectores a bases de datos médicas
 * Define los métodos requeridos para conectar y consultar diferentes bases de datos
 */
export interface DatabaseConnector {
  /**
   * Nombre del conector
   */
  name: string;

  /**
   * Verifica la conexión con la base de datos
   * @returns true si la conexión es exitosa
   */
  connect(): Promise<boolean>;

  /**
   * Busca en la base de datos usando una consulta
   * @param query Consulta de búsqueda
   * @returns Resultados de la búsqueda
   */
  search(query: string): Promise<unknown[]>;

  /**
   * Verifica una fuente contra la base de datos
   * @param source Fuente a verificar
   * @returns Resultado de la verificación
   */
  verify(source: EvidenceSource): Promise<{
    verified: boolean;
    reliability?: 'high' | 'moderate' | 'low' | 'unknown';
  }>;
}
