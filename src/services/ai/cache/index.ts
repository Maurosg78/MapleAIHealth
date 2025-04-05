import {
  SmartCacheInvalidationStrategy,
  ISmartCacheInvalidationStrategy,
  smartCacheInvalidationStrategy,
  QueryCategory,
  CacheTag,
  CacheMetadata,
} from './SmartCacheInvalidationStrategy';

import {
  CachePrioritizationService,
  ICachePrioritizationStrategy,
  cachePrioritizationService,
  PrioritizationStrategy,
  CachePrioritizationConfig,
  CacheItemStats,
} from './CachePrioritizationService';

// Exportar todo lo necesario
export {
  SmartCacheInvalidationStrategy,
  smartCacheInvalidationStrategy,
  CachePrioritizationService,
  cachePrioritizationService,
};

// Exportar tipos
export type {
  ISmartCacheInvalidationStrategy,
  QueryCategory,
  CacheTag,
  CacheMetadata,
  ICachePrioritizationStrategy,
  PrioritizationStrategy,
  CachePrioritizationConfig,
  CacheItemStats,
};
