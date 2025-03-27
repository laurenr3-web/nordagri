
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Part } from '@/types/Part';
import { useToast } from '@/hooks/use-toast';
import { partsService } from '@/services/supabase/partsService';

export const usePartsData = (initialParts: Part[] = []) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [parts, setParts] = useState<Part[]>(initialParts);

  // Fetch parts using React Query
  const { data: supabaseParts, isLoading, isError } = useQuery({
    queryKey: ['parts'],
    queryFn: () => partsService.getParts(),
    staleTime: 0,
    refetchOnWindowFocus: true
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

  // Handle error cases
  useEffect(() => {
    if (isError && initialParts.length > 0) {
      console.log('⚠️ Using initial data due to Supabase error');
      setParts(initialParts);
    }
  }, [isError, initialParts]);

  // Add part mutation
  const addPartMutation = useMutation({
    mutationFn: (part: Omit<Part, 'id'>) => {
      console.log('➕ Adding new part:', part);
      return partsService.addPart(part);
    },
    onSuccess: (newPart) => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      setParts(prevParts => [...prevParts, newPart]);
      
      toast({
        title: "Pièce ajoutée",
        description: `${newPart.name} a été ajouté à l'inventaire`,
      });
    },
    onError: (error) => {
      console.error('❌ Error adding part:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la pièce",
        variant: "destructive",
      });
    }
  });

  // Update part mutation
  const updatePartMutation = useMutation({
    mutationFn: (part: Part) => {
      console.log('✏️ Updating part:', part);
      return partsService.updatePart(part);
    },
    onSuccess: (updatedPart) => {
      // Force refetch to ensure consistency
      queryClient.refetchQueries({ 
        queryKey: ['parts'],
        type: 'all',
        exact: false
      });
      
      setParts(prevParts => prevParts.map(p => p.id === updatedPart.id ? updatedPart : p));
      
      toast({
        title: "Pièce mise à jour",
        description: `${updatedPart.name} a été mis à jour`,
      });
    },
    onError: (error) => {
      console.error('❌ Error updating part:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la pièce",
        variant: "destructive",
      });
    }
  });

  // Delete part mutation
  const deletePartMutation = useMutation({
    mutationFn: (partId: number) => {
      console.log('🗑️ Deleting part:', partId);
      return partsService.deletePart(partId);
    },
    onSuccess: (_, partId) => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      setParts(prevParts => prevParts.filter(p => p.id !== partId));
      
      toast({
        title: "Pièce supprimée",
        description: "La pièce a été supprimée de l'inventaire",
      });
    },
    onError: (error) => {
      console.error('❌ Error deleting part:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la pièce",
        variant: "destructive",
      });
    }
  });

  // Action handlers
  const handleAddPart = (part: Omit<Part, 'id'>) => {
    console.log('👉 Adding part:', part);
    addPartMutation.mutate(part);
  };
  
  const handleUpdatePart = (part: Part) => {
    console.log('👉 Updating part:', part);
    updatePartMutation.mutate(part);
  };
  
  const handleDeletePart = (partId: number) => {
    console.log('👉 Deleting part:', partId);
    deletePartMutation.mutate(partId);
  };

  return {
    parts,
    isLoading,
    isError,
    handleAddPart,
    handleUpdatePart,
    handleDeletePart,
  };
};
