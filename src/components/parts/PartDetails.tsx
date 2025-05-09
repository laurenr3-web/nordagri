
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Part } from '@/types/Part';
import { ArrowLeft, Edit, Trash2, MinusCircle } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import PartImage from './details/PartImage';
import PartActions from './details/PartActions';
import PartBasicInfo from './details/PartBasicInfo';
import PartInventoryInfo from './details/PartInventoryInfo';
import PartCompatibility from './details/PartCompatibility';
import PartReorderInfo from './details/PartReorderInfo';
import WithdrawalHistory from './details/WithdrawalHistory';
import EditPartDialog from './dialogs/EditPartDialog';
import WithdrawalDialog from './dialogs/WithdrawalDialog';
import { useDeletePart } from '@/hooks/parts';
import { usePartsWithdrawal } from '@/hooks/parts/usePartsWithdrawal';
import { toast } from 'sonner';

interface PartDetailsProps {
  part: Part;
  onEdit?: (part: Part) => void;
  onDelete?: (partId: number | string) => void;
  onDialogClose?: () => void;
  onBack?: () => void;
}

const PartDetails: React.FC<PartDetailsProps> = ({ part, onEdit, onDelete, onDialogClose, onBack }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const deleteMutation = useDeletePart();
  const navigate = useNavigate();
  const { openWithdrawalDialog, isWithdrawalDialogOpen, selectedPart, setIsWithdrawalDialogOpen } = usePartsWithdrawal();

  // Ensure part data is valid
  if (!part) {
    console.error('PartDetails rendered without a valid part object');
    return (
      <div className="p-4 text-center text-muted-foreground">
        Données de pièce non disponibles. Veuillez réessayer.
      </div>
    );
  }

  // When the component mounts or part changes, verify the part ID
  useEffect(() => {
    if (part) {
      const partId = typeof part.id === 'string' ? parseInt(part.id, 10) : part.id;
      if (isNaN(partId)) {
        console.error('Invalid part ID in PartDetails:', part.id);
        toast.error('ID de pièce invalide');
      } else {
        console.log('PartDetails loaded with valid part ID:', partId);
      }
    }
  }, [part]);

  const handleDelete = async () => {
    try {
      if (onDelete) {
        await onDelete(part.id);
      } else {
        // Use mutation for deletion if no handler is provided
        await deleteMutation.mutateAsync(part.id);
      }
      
      // Close dialogs after successful deletion
      if (onDialogClose) {
        onDialogClose();
      }
      
      // Navigate to parts page after successful deletion
      navigate('/parts');
    } catch (error) {
      console.error('Error deleting part:', error);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleEdit = (updatedPart: Part) => {
    if (onEdit) {
      onEdit(updatedPart);
    }
    
    // First close the edit dialog
    setIsEditDialogOpen(false);
    
    // Then close the main dialog after the update is confirmed
    if (onDialogClose) {
      setTimeout(() => onDialogClose(), 300);
    }
  };

  const handleTabChange = (value: string) => {
    console.log('Changing tab to:', value);
    setActiveTab(value);
  };

  const openEditDialog = (e: React.MouseEvent) => {
    // Prevent event from bubbling up which might cause redirection
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  // Handler to open the delete confirmation dialog
  const openDeleteDialog = (e: React.MouseEvent) => {
    // Prevent event from bubbling up which might cause redirection
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  // Handler pour ouvrir la dialogue de retrait
  const handleWithdrawal = (e: React.MouseEvent) => {
    e.stopPropagation();
    openWithdrawalDialog(part);
  };

  return (
    <div className="space-y-6">
      {onBack && (
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={openEditDialog}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button 
              variant="destructive" 
              onClick={openDeleteDialog}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      )}

      <PartImage part={part} />

      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold">{part.name}</h2>
          <p className="text-muted-foreground">{part.partNumber}</p>
        </div>
        
        <Button 
          variant="secondary" 
          onClick={handleWithdrawal} 
          className="flex items-center gap-1"
        >
          <MinusCircle className="h-4 w-4 mr-1" />
          Retirer une pièce
        </Button>
      </div>

      {!onBack && <PartActions onEdit={openEditDialog} onDelete={openDeleteDialog} onWithdrawal={handleWithdrawal} />}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="details">Détails</TabsTrigger>
          <TabsTrigger value="history">Historique des retraits</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6 mt-6">
          <Separator />
          
          <div className="grid grid-cols-2 gap-6">
            <PartBasicInfo part={part} />
            <PartInventoryInfo part={part} />
          </div>

          <PartCompatibility compatibility={part.compatibility} />

          <PartReorderInfo part={part} />
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          {activeTab === 'history' && <WithdrawalHistory part={part} />}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent onClick={e => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cette pièce sera supprimée définitivement de notre base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={e => e.stopPropagation()}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Part Dialog */}
      {isEditDialogOpen && (
        <EditPartDialog 
          isOpen={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen}
          part={part}
          onSubmit={handleEdit}
          onMainDialogClose={onDialogClose}
        />
      )}

      {/* Withdrawal Dialog */}
      <WithdrawalDialog 
        isOpen={isWithdrawalDialogOpen && selectedPart?.id === part.id} 
        onOpenChange={setIsWithdrawalDialogOpen}
        part={selectedPart}
      />
    </div>
  );
};

export default PartDetails;
