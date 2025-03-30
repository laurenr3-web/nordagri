
import React from 'react';

export function monitorPerformance() {
  // Track component render times
  if (process.env.NODE_ENV === 'development') {
    const originalCreateElement = React.createElement;
    React.createElement = function(...args) {
      const start = performance.now();
      const element = originalCreateElement.apply(this, args);
      const end = performance.now();
      
      if (typeof args[0] === 'function' && args[0].name) {
        const renderTime = end - start;
        if (renderTime > 5) { // Only log slow renders > 5ms
          console.warn(`Slow render: ${args[0].name} took ${renderTime.toFixed(2)}ms`);
        }
      }
      
      return element;
    };
  }
  
  // Monitor long tasks
  if (typeof PerformanceObserver !== 'undefined') {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // 50ms is a long task
            console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
          }
        });
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.error('Performance monitoring not supported:', error);
    }
  }

  // Basic timing API for manual performance measurements
  return {
    measureFunction: <T>(fn: () => T, label: string): T => {
      const start = performance.now();
      const result = fn();
      const duration = performance.now() - start;
      
      if (duration > 10) {
        console.warn(`Function '${label}' took ${duration.toFixed(2)}ms to execute`);
      }
      
      return result;
    }
  };
}

// Helper to measure React component render time with a HOC
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string = Component.displayName || Component.name
): React.FC<P> {
  if (process.env.NODE_ENV !== 'development') {
    return Component as React.FC<P>;
  }
  
  const WrappedComponent: React.FC<P> = (props) => {
    const start = performance.now();
    const element = React.createElement(Component, props as any);
    const end = performance.now();
    
    React.useEffect(() => {
      const renderTime = end - start;
      if (renderTime > 5) {
        console.warn(`Component '${componentName}' took ${renderTime.toFixed(2)}ms to render`);
      }
    }, []);
    
    return element;
  };
  
  WrappedComponent.displayName = `WithPerformanceTracking(${componentName})`;
  return WrappedComponent;
}
