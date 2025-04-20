import { EventEmitter } from 'events';

export interface CacheDependency {
  sourceKey: string;
  targetKey: string;
  type: 'strong' | 'weak';
}

export class CacheDependencyManager extends EventEmitter {
  private dependencies: Map<string, Set<string>> = new Map();
  private reverseDependencies: Map<string, Set<string>> = new Map();
  private dependencyQueue: string[] = [];
  private isProcessing: boolean = false;

  constructor() {
    super();
  }

  public addDependency(dependency: CacheDependency): void {
    const { sourceKey, targetKey, type } = dependency;

    // Agregar dependencia directa
    if (!this.dependencies.has(sourceKey)) {
      this.dependencies.set(sourceKey, new Set());
    }
    this.dependencies.get(sourceKey)!.add(targetKey);

    // Agregar dependencia inversa
    if (!this.reverseDependencies.has(targetKey)) {
      this.reverseDependencies.set(targetKey, new Set());
    }
    this.reverseDependencies.get(targetKey)!.add(sourceKey);

    // Emitir evento de nueva dependencia
    this.emit('dependencyAdded', { sourceKey, targetKey, type });
  }

  public removeDependency(sourceKey: string, targetKey: string): void {
    this.dependencies.get(sourceKey)?.delete(targetKey);
    this.reverseDependencies.get(targetKey)?.delete(sourceKey);
  }

  public getDependencies(key: string): Set<string> {
    return this.dependencies.get(key) || new Set();
  }

  public getDependents(key: string): Set<string> {
    return this.reverseDependencies.get(key) || new Set();
  }

  public async invalidate(key: string): Promise<void> {
    this.dependencyQueue.push(key);
    await this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.dependencyQueue.length > 0) {
      const key = this.dependencyQueue.shift()!;
      const dependents = this.getDependents(key);

      // Emitir evento de invalidación
      this.emit('invalidation', { key, dependents });

      // Agregar dependientes a la cola
      for (const dependent of dependents) {
        if (!this.dependencyQueue.includes(dependent)) {
          this.dependencyQueue.push(dependent);
        }
      }
    }

    this.isProcessing = false;
  }

  public clear(): void {
    this.dependencies.clear();
    this.reverseDependencies.clear();
    this.dependencyQueue = [];
  }
} 