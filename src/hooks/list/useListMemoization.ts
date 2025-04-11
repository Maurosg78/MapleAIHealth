import { useMemo, useCallback, useRef } from 'react';

// Interfaces para los tipos de retorno
interface ListMemoizationResult<T> {
  items: T[];
  getItemKey: (item: T, index: number) => string;
  hasItemChanged: (prevItem: T, nextItem: T) => boolean;
  createItemRenderer: <P extends object>(
    renderFn: (item: T, index: number, props: P) => React.ReactNode
  ) => (item: T, index: number, props: P) => React.ReactNode;
  findItemByKey: (key: string) => T | undefined;
}

interface SectionedListMemoizationResult<S, T> extends ListMemoizationResult<S> {
  sectionsWithKeys: Array<{ section: S; key: string }>;
  createSectionRenderer: <P extends object>(
    renderSectionFn: (section: S, index: number, props: P) => React.ReactNode,
    renderItemsFn: (section: S, props: P) => T[],
    renderItemFn: (item: T, sectionIndex: number, itemIndex: number, props: P) => React.ReactNode
  ) => (section: S, sectionIndex: number, props: P) => React.ReactNode;
}

/**
 * Hook para memoizar cada elemento de una lista y sus renderizadores
 * Optimiza el rendimiento al evitar re-renderizados innecesarios
 *
 * @param items Array de elementos a memoizar
 * @param itemKey Función para generar una clave única por elemento
 * @returns Funciones y datos memoizados
 */
export function useListMemoization<T>(
  items: T[],
  itemKey: (item: T) => string
): ListMemoizationResult<T> {
  // Mapeo de claves a índices para acceso rápido
  const keyToIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item, index) => {
      map.set(itemKey(item), index);
    });
    return map;
  }, [items, itemKey]);

  // Memoizar la función getItemKey para evitar recalcularla
  const getItemKey = useCallback(
    (item: T, index: number) => {
      try {
        return itemKey(item);
      } catch (e) {
        // Si hay error generando la clave, usar índice como fallback
        console.warn('Error generando clave para item, usando índice como fallback', e);
        return `item-${index}`;
      }
    },
    [itemKey]
  );

  // Función memoizada para verificar si un elemento ha cambiado
  const hasItemChanged = useCallback(
    (prevItem: T, nextItem: T): boolean => {
      // Si son el mismo objeto por referencia, no han cambiado
      if (prevItem === nextItem) return false;

      // Si la clave es diferente, son elementos diferentes
      const prevKey = itemKey(prevItem);
      const nextKey = itemKey(nextItem);
      if (prevKey !== nextKey) return true;

      // Comparación profunda simplificada
      // Si necesitas comparación más compleja, usa una biblioteca como deep-equal
      if (typeof prevItem === 'object' && typeof nextItem === 'object' && prevItem !== null && nextItem !== null) {
        const prevKeys = Object.keys(prevItem as object);
        const nextKeys = Object.keys(nextItem as object);

        if (prevKeys.length !== nextKeys.length) return true;

        for (const key of prevKeys) {
          if ((prevItem as Record<string, unknown>)[key] !== (nextItem as Record<string, unknown>)[key]) {
            return true;
          }
        }

        return false;
      }

      // Comparación por valor para tipos primitivos
      return prevItem !== nextItem;
    },
    [itemKey]
  );

  // Referencia para almacenar resultados memoizados
  const renderCache = useRef(new Map<string, React.ReactNode>());

  // Memoizar funciones de renderizado por elemento
  const createItemRenderer = useCallback(
    <P extends object>(
      renderFn: (item: T, index: number, props: P) => React.ReactNode
    ) => {
      // Devolver una función para cada elemento
      return (item: T, index: number, props: P): React.ReactNode => {
        // Usar la clave del elemento como parte del sistema de memoización
        const key = getItemKey(item, index);

        // Crear una key única para este renderizado específico
        const cacheKey = `${key}-${index}-${JSON.stringify(props)}`;

        // Verificar si ya tenemos un resultado en caché
        if (!renderCache.current.has(cacheKey)) {
          renderCache.current.set(cacheKey, renderFn(item, index, props));
        }

        return renderCache.current.get(cacheKey);
      };
    },
    [getItemKey]
  );

  // Encontrar un elemento por su clave
  const findItemByKey = useCallback(
    (key: string): T | undefined => {
      const index = keyToIndexMap.get(key);
      return index !== undefined ? items[index] : undefined;
    },
    [items, keyToIndexMap]
  );

  return {
    items,
    getItemKey,
    hasItemChanged,
    createItemRenderer,
    findItemByKey
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
): SectionedListMemoizationResult<S, T> {
  // Memoizar el listado completo de secciones
  const sectionsWithKeys = useMemo(() => {
    return sections.map((section) => ({
      section,
      key: sectionKey(section)
    }));
  }, [sections, sectionKey]);

  // Memoización principal para las secciones
  const sectionMemo = useListMemoization(
    sections,
    sectionKey
  );

  // Referencia para almacenar los items renderizados por sección
  const renderedItemsCache = useRef(new Map<string, React.ReactNode>());

  // Crear renderizador de sección optimizado
  const createSectionRenderer = useCallback(
    <P extends object>(
      renderSectionFn: (section: S, index: number, props: P) => React.ReactNode,
      renderItemsFn: (section: S, props: P) => T[],
      renderItemFn: (item: T, sectionIndex: number, itemIndex: number, props: P) => React.ReactNode
    ) => {
      // Implementación que evita llamar a hooks dentro de callbacks
      return (section: S, sectionIndex: number, props: P): React.ReactNode => {
        // Obtener items de esta sección
        const items = renderItemsFn(section, props);
        const sectionKey = sectionMemo.getItemKey(section, sectionIndex);

        // Crear clave única para esta sección y props
        const cacheKey = `${sectionKey}-${JSON.stringify(props)}`;

        // Renderizar los items manualmente
        const renderedItems: React.ReactNode[] = [];

        items.forEach((item, itemIndex) => {
          const itemCacheKey = `${cacheKey}-item-${itemIndex}-${itemKey(item)}`;

          if (!renderedItemsCache.current.has(itemCacheKey)) {
            // Renderizar el item y guardar en caché
            renderedItemsCache.current.set(
              itemCacheKey,
              renderItemFn(item, sectionIndex, itemIndex, {
                ...props,
                sectionIndex
              } as P)
            );
          }

          renderedItems.push(renderedItemsCache.current.get(itemCacheKey));
        });

        // Renderizar la sección con sus items incluidos
        return renderSectionFn(section, sectionIndex, {
          ...props,
          renderedItems
        } as P);
      };
    },
    [sectionMemo, itemKey]
  );

  return {
    ...sectionMemo,
    sectionsWithKeys,
    createSectionRenderer
  };
}
