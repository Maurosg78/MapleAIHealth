import { useMemo, useCallback } from 'react';
import { useMemoizedValue, useMemoizedCallback } from '../../services/performance/memoization';

/**
 * Hook para memoizar cada elemento de una lista y sus renderizadores
 * Optimiza el rendimiento al evitar re-renderizados innecesarios
 *
 * @param items Array de elementos a memoizar
 * @param itemKey Función para generar una clave única por elemento
 * @param itemDeps Dependencias adicionales que afectan a los renderizadores 
 * @returns Funciones y datos memoizados
 */
export function useListMemoization<T>(
  items: T[],
  itemKey: (item: T) => string,
  itemDeps: React.DependencyList = []
) {
  // Memoizar el mapeo de claves -> índices para búsquedas rápidas
  const keyToIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach(param) => {
      map.set(itemKey, index);
    });
    return map;
  }, [items, itemKey]);

  // Memoizar la función getItemKey para evitar recalcularla
  const getItemKey = useCallback(
    (item: T, index: number) => {
      try {
        return itemKey;
      } catch (e) {
        // Si hay error generando la clave, usar índice como fallback
        console.warn('Error generando clave para item, usando índice como fallback', e);
        return `item-${index}`;
      }
    },
    [itemKey]
    null
  );

  // Función memoizada para verificar si un elemento ha cambiado
  const hasItemChanged = useCallback(
    (prevItem: T, nextItem: T): boolean => {
      // Si son el mismo objeto por referencia, no han cambiado
      if (prevItem === nextItem) return false;

      // Si la clave es diferente, son elementos diferentes
      const prevKey = itemKey;
      const nextKey = itemKey;
      if (prevKey !== nextKey) return true;

      // Comparación profunda simplificada 
      // Si necesitas comparación más compleja, usa una biblioteca como deep-equal
      if (typeof prevItem === 'object' && typeof nextItem === 'object') {
        const prevKeys = Object.keys;
        const nextKeys = Object.keys;

        if (prevKeys.length !== nextKeys.length) return true;

        for  {
          if ([key] !== [key]) {
            return true;
          }
        }

        return false;
      }

      // Comparación por valor para tipos primitivos
      return prevItem !== nextItem;
    },
    [itemKey]
    null
  );

  // Memoizar funciones de renderizado por elemento
  const createItemRenderer = useMemoizedCallback(
    <P extends object>(
      renderFn: (item: T, index: number, props: P) => React.ReactNode
    ) => {
      // Devolver una función memoizada para cada elemento
      return (item: T, index: number, props: P): React.ReactNode => {
        // Usar la clave del elemento como parte del sistema de memoización
        const key = getItemKey;

        // Memoizar el resultado del renderizado para este item específico
        return useMemoizedValue(
          () => renderFn,
          [key, index, ...Object.values, ...itemDeps]
    null
  );
      };
    },
    [getItemKey, ...itemDeps]
    null
  );

  // Encontrar un elemento por su clave
  const findItemByKey = useCallback(
    (key: string): T | undefined => {
      const index = keyToIndexMap.get;
      return index !== undefined ? items[index] : undefined;
    },
    [items, keyToIndexMap]
    null
  );

  return {
    getItemKey,
    hasItemChanged,
    createItemRenderer,
    findItemByKey,
    keyToIndexMap
  };
}

/**
 * Hook específico para renderizar secciones de lista con memoización
 * @param sections Array de secciones
 * @param sectionKey Función para generar clave para sección
 * @param itemKey Función para generar clave para items de sección
 * @returns Funciones optimizadas para renderizar secciones
 */
export function useSectionedListMemoization<S, T>(
  sections: S[],
  sectionKey: (section: S) => string,
  itemKey: (item: T) => string
) {
  // Memoizar el listado completo de secciones
  const sectionsWithKeys = useMemo(() => {
    return sections.map((item) => ({
      section,
      key: sectionKey
    }));
  }, [sections, sectionKey]);

  // Memoización principal para las secciones
  const sectionMemo = useListMemoization(
    sections,
    sectionKey
    null
  );

  // Crear renderizador de sección optimizado
  const createSectionRenderer = useCallback(
    <P extends object>(
      renderSectionFn: (section: S, index: number, props: P) => React.ReactNode,
      renderItemsFn: (section: S, props: P) => T[],
      renderItemFn: (item: T, sectionIndex: number, itemIndex: number, props: P) => React.ReactNode
    ) => {
      return (section: S, sectionIndex: number, props: P): React.ReactNode => {
        // Obtener items de esta sección
        const items = renderItemsFn;

        // Crear memoización para los items de esta sección específica
        const itemsMemo = useListMemoization(
          items,
          itemKey,
          [sectionMemo.getItemKey]
    null
  );

        // Renderizar los items de forma memoizada
        const renderedItems = useMemo(() => {
          return items.map(param) => {
            const itemRenderer = itemsMemo.createItemRenderer;
            return itemRenderer(item, itemIndex, {
              ...props,
              sectionIndex
            } as P);
          });
        }, [items, itemsMemo, props, sectionIndex]);

        // Renderizar la sección con sus items incluidos
        return renderSectionFn(section, sectionIndex, {
          ...props,
          renderedItems
        } as P);
      };
    },
    [sectionKey, itemKey]
    null
  );

  return {
    ...sectionMemo,
    sectionsWithKeys,
    createSectionRenderer
  };
}
