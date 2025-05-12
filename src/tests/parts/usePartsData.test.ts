
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePartsData } from '@/hooks/parts/usePartsData';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Mock the parts service
vi.mock('@/services/supabase/partsService', () => ({
  partsService: {
    getParts: vi.fn(),
    getPartById: vi.fn(),
    addPart: vi.fn(),
    updatePart: vi.fn(),
    deletePart: vi.fn()
  }
}));

// Mock the filter hook
vi.mock('@/hooks/parts/usePartsFilter', () => ({
  usePartsFilter: () => ({
    filters: { search: '', category: [] },
    setFilters: vi.fn(),
    activeFilters: []
  })
}));

// Create a wrapper component with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('usePartsData', () => {
  const mockParts = [
    { id: 1, name: 'Air Filter', category: 'Filters', stock: 10 },
    { id: 2, name: 'Oil Filter', category: 'Filters', stock: 5 },
    { id: 3, name: 'Spark Plug', category: 'Engine', stock: 20 }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    
    // Import the parts service after mocking
    const { partsService } = require('@/services/supabase/partsService');
    
    // Setup default mock implementations
    partsService.getParts.mockResolvedValue(mockParts);
    partsService.getPartById.mockImplementation((id) => 
      Promise.resolve(mockParts.find(part => part.id === id) || null)
    );
    partsService.addPart.mockImplementation((part) => 
      Promise.resolve({ id: 4, ...part })
    );
    partsService.updatePart.mockImplementation((part) => 
      Promise.resolve(part)
    );
    partsService.deletePart.mockResolvedValue(undefined);
  });

  it('should fetch parts data', async () => {
    const wrapper = createWrapper();
    const { result, waitFor } = renderHook(() => usePartsData(), { wrapper });
    
    await waitFor(() => !result.current.isLoading);
    
    expect(result.current.data).toEqual(mockParts);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should refetch parts when filters change', async () => {
    const wrapper = createWrapper();
    const { result, waitFor, rerender } = renderHook(() => usePartsData(), { wrapper });
    
    await waitFor(() => !result.current.isLoading);
    
    // Import the service again to access the mock
    const { partsService } = require('@/services/supabase/partsService');
    
    // Clear the mock calls
    partsService.getParts.mockClear();
    
    // Set up a new mock response for filtered data
    const filteredParts = [mockParts[0], mockParts[1]];
    partsService.getParts.mockResolvedValue(filteredParts);
    
    // Simulate a filter change by forcing a rerender
    rerender();
    
    await waitFor(() => result.current.data !== mockParts);
    
    expect(result.current.data).toEqual(filteredParts);
  });

  it('should handle errors', async () => {
    const wrapper = createWrapper();
    
    // Import the service again to access the mock
    const { partsService } = require('@/services/supabase/partsService');
    
    // Setup mock to throw an error
    partsService.getParts.mockRejectedValue(new Error('Failed to fetch parts'));
    
    const { result, waitFor } = renderHook(() => usePartsData(), { wrapper });
    
    await waitFor(() => !result.current.isLoading);
    
    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeUndefined();
  });

  it('should sort parts by name by default', async () => {
    const wrapper = createWrapper();
    
    // Setup unsorted parts
    const unsortedParts = [
      { id: 3, name: 'Spark Plug', category: 'Engine', stock: 20 },
      { id: 1, name: 'Air Filter', category: 'Filters', stock: 10 },
      { id: 2, name: 'Oil Filter', category: 'Filters', stock: 5 }
    ];
    
    // Import the service again to access the mock
    const { partsService } = require('@/services/supabase/partsService');
    partsService.getParts.mockResolvedValue(unsortedParts);
    
    const { result, waitFor } = renderHook(() => usePartsData(), { wrapper });
    
    await waitFor(() => !result.current.isLoading);
    
    // Expect parts to be sorted alphabetically by name
    expect(result.current.data?.[0].name).toBe('Air Filter');
    expect(result.current.data?.[1].name).toBe('Oil Filter');
    expect(result.current.data?.[2].name).toBe('Spark Plug');
  });
});
