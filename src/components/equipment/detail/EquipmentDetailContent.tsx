
import React, { useState } from 'react';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import EquipmentHeader from '../detail/EquipmentHeader';
import EditEquipmentDialog from '../dialogs/EditEquipmentDialog';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { equipmentService } from '@/services/supabase/equipmentService';
import { useQueryClient } from '@tanstack/react-query';
import EquipmentTabs from '../details/EquipmentTabs';
import { Card, CardContent } from '@/components/ui/card';
import EquipmentImageGallery from '../details/EquipmentImageGallery';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFarmRole } from '@/hooks/useFarmRole';
import QuickActions from './QuickActions';
import UpdateHoursDialog from './UpdateHoursDialog';

interface EquipmentDetailContentProps {
  equipment: EquipmentItem;
  onUpdate: (data: EquipmentItem) => Promise<void>;
}

const EquipmentDetailContent = ({ equipment, onUpdate }: EquipmentDetailContentProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localEquipment, setLocalEquipment] = useState(equipment);
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [hoursInput, setHoursInput] = useState('');
  const [isSavingHours, setIsSavingHours] = useState(false);
  const [isUpdateHoursOpen, setIsUpdateHoursOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { canEdit, canDelete } = useFarmRole();

  const handleEditEquipment = () => {
    setIsEditDialogOpen(true);
  };

  const handleEquipmentUpdate = async (updatedData: EquipmentItem) => {
    try {
      console.log('Starting equipment update with data:', updatedData);
      setLocalEquipment(updatedData);
      await onUpdate(updatedData);
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment', updatedData.id] });
      setIsEditDialogOpen(false);
      toast.success('Équipement mis à jour avec succès');
    } catch (error: any) {
      console.error('Error updating equipment:', error);
      toast.error('Impossible de mettre à jour cet équipement', {
        description: error.message || 'Une erreur s\'est produite'
      });
    }
  };
  
  const handleEquipmentDelete = async () => {
    try {
      setIsDeleting(true);
      const equipmentId = typeof equipment.id === 'string' 
        ? parseInt(equipment.id, 10) 
        : equipment.id;
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      await equipmentService.deleteEquipment(equipmentId);
      toast.success(`L'équipement ${equipment.name} a été supprimé avec succès`);
      navigate('/equipment');
    } catch (error: any) {
      console.error('Error deleting equipment:', error);
      toast.error(`Impossible de supprimer cet équipement: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartEditHours = () => {
    setHoursInput(String(localEquipment.valeur_actuelle || 0));
    setIsEditingHours(true);
  };

  const handleSaveHours = async () => {
    const newValue = parseFloat(hoursInput);
    if (isNaN(newValue) || newValue < 0) {
      toast.error('Veuillez entrer une valeur valide');
      return;
    }

    setIsSavingHours(true);
    try {
      const equipmentId = typeof localEquipment.id === 'string'
        ? parseInt(localEquipment.id, 10)
        : localEquipment.id;

      const { error } = await supabase
        .from('equipment')
        .update({ 
          valeur_actuelle: newValue, 
          last_wear_update: new Date().toISOString() 
        })
        .eq('id', equipmentId);

      if (error) throw error;

      setLocalEquipment(prev => ({ ...prev, valeur_actuelle: newValue }));
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment', localEquipment.id] });
      setIsEditingHours(false);
      toast.success(`Compteur mis à jour: ${newValue} ${(localEquipment.unite_d_usure || 'heures') === 'heures' ? 'h' : 'km'}`);
    } catch (error: any) {
      console.error('Error updating hours:', error);
      toast.error('Impossible de mettre à jour le compteur');
    } finally {
      setIsSavingHours(false);
    }
  };

  const formatWearValue = (value: number | null | undefined, unit: string) => {
    if (value === null || value === undefined) return 'Non disponible';
    return `${value} ${unit === 'heures' ? 'h' : unit === 'kilometres' ? 'km' : unit}`;
  };

  const unitLabel = (localEquipment.unite_d_usure || 'heures') === 'heures' ? 'Heures moteur' : 'Kilomètres';

  return (
    <div className="flex flex-col w-full max-w-[500px] mx-auto p-4 pb-16">
      <EquipmentHeader 
        equipment={localEquipment} 
        onEdit={handleEditEquipment} 
        onDelete={handleEquipmentDelete}
        isDeleting={isDeleting}
        canEdit={canEdit}
        canDelete={canDelete}
      />
      
      {canEdit && (
        <>
          <QuickActions
            onUpdateHours={() => setIsUpdateHoursOpen(true)}
            onMaintenance={() => navigate(`/maintenance?equipment=${localEquipment.id}`)}
            onObservation={() => navigate(`/observations/new?equipment=${localEquipment.id}`)}
            unitLabel={unitLabel}
          />
          <Separator className="my-4" />
        </>
      )}

      <div className="space-y-4">
        <Card className="overflow-hidden rounded-xl">
          <CardContent className="p-4">
            <div className="space-y-4">
              <EquipmentImageGallery 
                equipment={localEquipment} 
              />
              
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">{unitLabel}</h3>
                  {!isEditingHours && canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleStartEditHours}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                {isEditingHours ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="number"
                      value={hoursInput}
                      onChange={(e) => setHoursInput(e.target.value)}
                      className="h-9 text-base"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveHours();
                        if (e.key === 'Escape') setIsEditingHours(false);
                      }}
                    />
                    <span className="text-sm text-muted-foreground shrink-0">
                      {(localEquipment.unite_d_usure || 'heures') === 'heures' ? 'h' : 'km'}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary shrink-0"
                      onClick={handleSaveHours}
                      disabled={isSavingHours}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground shrink-0"
                      onClick={() => setIsEditingHours(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-lg font-medium">
                    {formatWearValue(localEquipment.valeur_actuelle, localEquipment.unite_d_usure || 'heures')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-xl">
          <CardContent className="p-4">
            <EquipmentTabs equipment={localEquipment} />
          </CardContent>
        </Card>
      </div>

      {isEditDialogOpen && (
        <EditEquipmentDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          equipment={localEquipment}
          onSubmit={handleEquipmentUpdate}
        />
      )}

      <UpdateHoursDialog
        open={isUpdateHoursOpen}
        onOpenChange={setIsUpdateHoursOpen}
        equipmentId={localEquipment.id}
        currentValue={localEquipment.valeur_actuelle}
        unit={localEquipment.unite_d_usure || 'heures'}
        onUpdated={(newValue) => {
          setLocalEquipment(prev => ({ ...prev, valeur_actuelle: newValue }));
        }}
      />
    </div>
  );
};

export default EquipmentDetailContent;
