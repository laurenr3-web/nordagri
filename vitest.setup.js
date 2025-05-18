
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Ajouter des matchers manquants pour toHaveValue
expect.extend({
  toHaveValue(received, value) {
    const inputValue = received.value;
    
    return {
      pass: inputValue === value,
      message: () => `expected ${received} to have value ${value} but got ${inputValue}`
    };
  },
  
  toBeTruthy(received) {
    return {
      pass: !!received,
      message: () => `expected ${received} to be truthy`
    };
  },
  
  toHaveBeenCalledWith(received, ...args) {
    const calls = received.mock.calls;
    
    return {
      pass: calls.some(call => 
        call.length === args.length && 
        call.every((arg, i) => this.equals(arg, args[i]))
      ),
      message: () => `expected ${received} to have been called with ${args} but was called with ${calls}`
    };
  }
});

// Mock pour window.URL
global.URL.createObjectURL = vi.fn();
global.URL.revokeObjectURL = vi.fn();
