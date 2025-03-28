
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePart } from '@/services/supabase/parts/deletePart';
import { toast } from 'sonner';

export const useDeletePart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (partId: number | string) => deletePart(partId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      toast.success('Part deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete part', { 
        description: error?.message || 'An unknown error occurred'
      });
    }
  });
};

export default useDeletePart;
