import { MetricFilters } from '../components/comparison/MetricFilterDialog';

// Clave para almacenar las comparaciones en localStorage
const STORAGE_KEY = 'mapleHealth_savedComparisons';

// Estructura de datos para una comparación guardada
export interface SavedComparison {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  patientIds: string[];
  selectedMetricId: string;
  filters: MetricFilters | null;
  tags?: string[];
}

// Interfaz para crear una nueva comparación
export interface NewComparisonData {
  name: string;
  description?: string;
  patientIds: string[];
  selectedMetricId: string;
  filters?: MetricFilters | null;
  tags?: string[];
}

/**
 * Servicio para manejar el almacenamiento y recuperación de comparaciones de pacientes
 */
export const comparisonStorageService = {
  /**
   * Obtener todas las comparaciones guardadas
   */
  getAllComparisons(): SavedComparison[] {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (!storedData) return [];
      
      return JSON.parse(storedData);
    } catch (error) {
      console.error('Error al obtener comparaciones guardadas:', error);
      return [];
    }
  },

  /**
   * Obtener una comparación específica por su ID
   */
  getComparisonById(id: string): SavedComparison | null {
    try {
      const comparisons = this.getAllComparisons();
      return comparisons.find(comp => comp.id === id) || null;
    } catch (error) {
      console.error(`Error al obtener la comparación con ID ${id}:`, error);
      return null;
    }
  },

  /**
   * Guardar una nueva comparación
   */
  saveComparison(data: NewComparisonData): SavedComparison {
    try {
      // Obtener las comparaciones existentes
      const existingComparisons = this.getAllComparisons();
      
      // Crear una nueva comparación con ID único y fechas
      const newComparison: SavedComparison = {
        id: Date.now().toString(), // ID único basado en timestamp
        name: data.name,
        description: data.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        patientIds: data.patientIds,
        selectedMetricId: data.selectedMetricId,
        filters: data.filters || null,
        tags: data.tags || []
      };
      
      // Añadir la nueva comparación a la lista
      const updatedComparisons = [...existingComparisons, newComparison];
      
      // Guardar la lista actualizada
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedComparisons));
      
      return newComparison;
    } catch (error) {
      console.error('Error al guardar la comparación:', error);
      throw new Error('No se pudo guardar la comparación');
    }
  },

  /**
   * Actualizar una comparación existente
   */
  updateComparison(id: string, updates: Partial<SavedComparison>): SavedComparison {
    try {
      // Obtener las comparaciones existentes
      const comparisons = this.getAllComparisons();
      
      // Encontrar el índice de la comparación a actualizar
      const comparisonIndex = comparisons.findIndex(comp => comp.id === id);
      
      if (comparisonIndex === -1) {
        throw new Error(`No se encontró ninguna comparación con ID ${id}`);
      }
      
      // Actualizar la comparación
      const updatedComparison: SavedComparison = {
        ...comparisons[comparisonIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Reemplazar la comparación en la lista
      comparisons[comparisonIndex] = updatedComparison;
      
      // Guardar la lista actualizada
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comparisons));
      
      return updatedComparison;
    } catch (error) {
      console.error(`Error al actualizar la comparación con ID ${id}:`, error);
      throw new Error('No se pudo actualizar la comparación');
    }
  },

  /**
   * Eliminar una comparación
   */
  deleteComparison(id: string): boolean {
    try {
      // Obtener las comparaciones existentes
      const comparisons = this.getAllComparisons();
      
      // Filtrar la comparación a eliminar
      const updatedComparisons = comparisons.filter(comp => comp.id !== id);
      
      // Si las longitudes son iguales, no se encontró la comparación
      if (updatedComparisons.length === comparisons.length) {
        return false;
      }
      
      // Guardar la lista actualizada
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedComparisons));
      
      return true;
    } catch (error) {
      console.error(`Error al eliminar la comparación con ID ${id}:`, error);
      return false;
    }
  },

  /**
   * Buscar comparaciones por nombre, descripción o etiquetas
   */
  searchComparisons(query: string): SavedComparison[] {
    try {
      if (!query.trim()) return this.getAllComparisons();
      
      const comparisons = this.getAllComparisons();
      const normalizedQuery = query.toLowerCase().trim();
      
      return comparisons.filter(comp => 
        comp.name.toLowerCase().includes(normalizedQuery) ||
        (comp.description && comp.description.toLowerCase().includes(normalizedQuery)) ||
        comp.tags?.some(tag => tag.toLowerCase().includes(normalizedQuery))
      );
    } catch (error) {
      console.error(`Error al buscar comparaciones con consulta "${query}":`, error);
      return [];
    }
  }
};

export default comparisonStorageService; 