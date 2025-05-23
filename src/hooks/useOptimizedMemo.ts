
import { useMemo, useCallback, DependencyList } from 'react';

/**
 * Hook optimisé pour la mémorisation avec débounce optionnel
 */
export function useOptimizedMemo<T>(
  factory: () => T,
  deps: DependencyList,
  debounceMs?: number
): T {
  return useMemo(() => {
    if (debounceMs) {
      let timeoutId: NodeJS.Timeout;
      const debounced = () => {
        clearTimeout(timeoutId);
        return new Promise<T>((resolve) => {
          timeoutId = setTimeout(() => {
            resolve(factory());
          }, debounceMs);
        });
      };
      return debounced() as T;
    }
    return factory();
  }, deps);
}

/**
 * Hook pour créer des callbacks mémorisés avec gestion d'erreur
 */
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T {
  return useCallback((...args: Parameters<T>) => {
    try {
      return callback(...args);
    } catch (error) {
      console.error('Callback error:', error);
      throw error;
    }
  }, deps) as T;
}
