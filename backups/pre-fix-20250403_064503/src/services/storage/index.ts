   HttpService 
 } from "../../../lib/api"
  set<T>(key: string, value: T): void
import { 
interface StorageService {
  get<T>(key: string): T | null;
  remove(key: string): void;
  clear(): void;
}

class LocalStorageService implements StorageService {
  get<T>(key: string): T | null {
    try {

      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}

export
