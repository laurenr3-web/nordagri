import React, { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import PullToRefreshIndicator from './PullToRefreshIndicator';

export const PullToRefresh: React.FC = () => {
  const queryClient = useQueryClient();

  const onRefresh = useCallback(async () => {
    // Refetch every active query — uses existing query keys, no invented keys.
    await queryClient.invalidateQueries({ refetchType: 'active' });
    // Small minimum spinner duration for feedback
    await new Promise((r) => setTimeout(r, 350));
  }, [queryClient]);

  const { state, distance, threshold } = usePullToRefresh({ onRefresh, threshold: 80 });

  return <PullToRefreshIndicator state={state} distance={distance} threshold={threshold} />;
};

export default PullToRefresh;