
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getParts } from '@/services/supabase/parts';

export const usePartsLoading = (initialParts: any[] = []) => {
  const [parts, setParts] = useState<any[]>(initialParts);

  // Fetch parts using React Query
  const { data: supabaseParts, isLoading, isError, refetch } = useQuery({
    queryKey: ['parts'],
    queryFn: () => getParts(),
    staleTime: 0, // Toujours considérer les données comme périmées
    refetchOnWindowFocus: true, // Refetch quand la fenêtre récupère le focus
    refetchInterval: 30000 // Refetch toutes les 30 secondes
  });

  // Handle data updates
  useEffect(() => {
    if (supabaseParts && supabaseParts.length > 0) {
      console.log('📥 Setting parts from Supabase:', supabaseParts);
      setParts(supabaseParts);
    } else if (supabaseParts && supabaseParts.length === 0 && initialParts.length > 0) {
      console.log('ℹ️ Using initial data as Supabase returned empty');
      setParts(initialParts);
    }
  }, [supabaseParts, initialParts]);

  return {
    parts,
    setParts,
    isLoading,
    isError,
    refetch
  };
};
