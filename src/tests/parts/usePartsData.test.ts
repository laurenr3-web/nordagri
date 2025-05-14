
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePartsData } from '@/hooks/parts/usePartsData';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'test-user' } } }, error: null })
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { farm_id: 1 }, error: null })
        }),
        mockResolvedValue: vi.fn().mockResolvedValue([])
      })
    })
  }
}));

// Mock the getParts service
vi.mock('@/services/supabase/parts', () => ({
  getParts: vi.fn().mockResolvedValue([
    { id: 1, name: 'Air Filter', category: 'Filters', stock: 10 },
    { id: 2, name: 'Oil Filter', category: 'Filters', stock: 5 },
    { id: 3, name: 'Spark Plug', category: 'Engine', stock: 20 }
  ])
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

  const Wrapper = ({ children }: { children: ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };

  return Wrapper;
};

describe('usePartsData', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should fetch parts data', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePartsData(), { wrapper });

    await waitFor(() => !result.current.isLoading);

    expect(result.current.data).toHaveLength(3);
    expect(result.current.data?.[0].name).toBe('Air Filter');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle errors', async () => {
    const { getParts } = require('@/services/supabase/parts');
    getParts.mockRejectedValueOnce(new Error('Failed to fetch parts'));

    const wrapper = createWrapper();
    const { result } = renderHook(() => usePartsData(), { wrapper });

    await waitFor(() => result.current.error !== null);

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should convert compatibility to numbers', async () => {
    const { getParts } = require('@/services/supabase/parts');
    getParts.mockResolvedValueOnce([
      {
        id: 1,
        name: 'Test Part',
        category: 'Test',
        stock: 5,
        compatibility: ['1', '2', '3']
      }
    ]);

    const wrapper = createWrapper();
    const { result } = renderHook(() => usePartsData(), { wrapper });

    await waitFor(() => !result.current.isLoading);

    expect(result.current.data?.[0].compatibility).toEqual([1, 2, 3]);
  });
});
