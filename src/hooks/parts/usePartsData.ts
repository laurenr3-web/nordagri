
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Part } from '@/types/Part';
import { useToast } from '@/hooks/use-toast';
import { partsService } from '@/services/supabase/partsService';

export const usePartsData = (initialParts: Part[] = []) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [parts, setParts] = useState<Part[]>(initialParts);

  // Fetch parts from Supabase with corrected query options
  const { data: supabaseParts, isLoading, isError } = useQuery({
    queryKey: ['parts'],
    queryFn: () => partsService.getParts(),
    staleTime: 0, // Consider data stale immediately
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Use effect to handle data updates instead of onSuccess callback
  useEffect(() => {
    if (supabaseParts && supabaseParts.length > 0) {
      console.log('Fetched parts from Supabase:', supabaseParts);
      setParts(supabaseParts);
    } else if (supabaseParts && supabaseParts.length === 0 && initialParts.length > 0) {
      console.log('No parts in Supabase, using initial data');
      setParts(initialParts);
    }
  }, [supabaseParts, initialParts]);

  // Handle error case with useEffect
  useEffect(() => {
    if (isError && initialParts.length > 0) {
      console.log('Error occurred when fetching from Supabase, using initial data');
      setParts(initialParts);
    }
  }, [isError, initialParts]);

  // Add part mutation
  const addPartMutation = useMutation({
    mutationFn: (part: Omit<Part, 'id'>) => {
      console.log('Adding part to Supabase:', part);
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
      console.error('Error adding part:', error);
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
      console.log('Updating part in Supabase:', part);
      return partsService.updatePart(part);
    },
    onSuccess: (updatedPart) => {
      // Invalidate and refetch to ensure data consistency
      queryClient.refetchQueries({ queryKey: ['parts'], type: 'all' });
      
      // If we have the individual part query, also refetch that
      if (updatedPart.id) {
        queryClient.refetchQueries({ queryKey: ['parts', updatedPart.id], type: 'all' });
      }
      
      setParts(prevParts => prevParts.map(p => p.id === updatedPart.id ? updatedPart : p));
      
      toast({
        title: "Pièce mise à jour",
        description: `${updatedPart.name} a été mis à jour`,
      });
    },
    onError: (error) => {
      console.error('Error updating part:', error);
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
      console.log('Deleting part from Supabase:', partId);
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
      console.error('Error deleting part:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la pièce",
        variant: "destructive",
      });
    }
  });

  // Function to add a part
  const handleAddPart = (part: Omit<Part, 'id'>) => {
    console.log('Adding part:', part);
    addPartMutation.mutate(part);
  };
  
  // Function to update a part
  const handleUpdatePart = (part: Part) => {
    console.log('Updating part:', part);
    updatePartMutation.mutate(part);
  };
  
  // Function to delete a part
  const handleDeletePart = (partId: number) => {
    console.log('Deleting part:', partId);
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
