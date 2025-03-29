
import { Part } from '@/types/Part';
import { useDeletePart } from '@/hooks/parts/useDeletePart';

export const usePartDelete = (parts: Part[], setParts: (parts: Part[]) => void, refetch: () => void, toast: any) => {
  const deletePartMutation = useDeletePart();
  
  const handleDeletePart = (partId: number | string) => {
    console.log('👉 Deleting part:', partId);
    
    // Vérifier si la pièce existe
    const partToDelete = parts.find(p => p.id === partId);
    if (!partToDelete) {
      toast({
        title: "Erreur",
        description: "Pièce introuvable",
        variant: "destructive",
      });
      return;
    }
    
    // Feedback visuel immédiat
    setParts(parts.filter(p => p.id !== partId));
    
    deletePartMutation.mutate(partId, {
      onSuccess: () => {
        console.log('🔄 Refetching parts after delete');
        toast({
          title: "Pièce supprimée",
          description: `${partToDelete.name} a été supprimée de l'inventaire`,
        });
        refetch(); // Force un refetch après la suppression
      },
      onError: (error) => {
        toast({
          title: "Erreur de suppression",
          description: error.message,
          variant: "destructive",
        });
        // Restaurer la pièce dans l'état local
        setParts([...parts]);
        refetch();
      }
    });
  };

  return { handleDeletePart };
};
