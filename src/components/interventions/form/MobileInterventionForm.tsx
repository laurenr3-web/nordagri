
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { useMobileForm } from '@/hooks/forms/useMobileForm';
import { DraftRecoveryDialog } from '@/components/forms/DraftRecoveryDialog';
import BasicInfoFields from './BasicInfoFields';
import SchedulingFields from './SchedulingFields';
import DetailsFields from './DetailsFields';
import { interventionFormSchema, InterventionFormValues } from './interventionFormSchema';
import { OfflineOperationStatus } from '@/components/offline/OfflineOperationStatus';
import { useOfflineStatus } from '@/providers/OfflineProvider';

interface MobileInterventionFormProps {
  onSubmit: (values: InterventionFormValues) => Promise<void>;
  onCancel: () => void;
  equipments?: { id: number; name: string }[];
  technicians?: { id: string; name: string }[];
  isLoadingEquipment?: boolean;
  isLoadingTechnicians?: boolean;
  initialValues?: Partial<InterventionFormValues>;
  editMode?: boolean;
  interventionId?: number;
}

export function MobileInterventionForm({
  onSubmit,
  onCancel,
  equipments = [],
  technicians = [],
  isLoadingEquipment = false,
  isLoadingTechnicians = false,
  initialValues,
  editMode = false,
  interventionId
}: MobileInterventionFormProps) {
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const { isOnline, addToSyncQueue } = useOfflineStatus();
  
  // Use our mobile form hook with auto-save
  const form = useMobileForm<InterventionFormValues>({
    formType: 'intervention',
    formId: interventionId,
    autoSave: true,
    autoSaveInterval: 30000,
    zodSchema: interventionFormSchema,
    defaultValues: {
      title: "",
      equipment: "",
      equipmentId: 0,
      location: "",
      priority: "medium",
      date: new Date(),
      scheduledDuration: 1,
      technician: "",
      description: "",
      notes: "",
      ...initialValues
    },
    onSubmitOffline: async (data) => {
      // Handle offline submission by adding to sync queue
      try {
        const operation = editMode ? 'update' : 'add';
        const tableName = 'interventions';
        
        if (editMode && interventionId) {
          // Update existing intervention
          await addToSyncQueue(operation, { ...data, id: interventionId }, tableName);
        } else {
          // Create new intervention
          await addToSyncQueue(operation, data, tableName);
        }
        
        toast.success(editMode ? "Intervention mise à jour" : "Intervention créée", {
          description: "Les changements seront synchronisés quand vous serez connecté"
        });
        form.discardDraft();
        onCancel();
      } catch (error) {
        console.error("Erreur lors de l'enregistrement en mode hors-ligne:", error);
        toast.error("Erreur lors de l'enregistrement");
      }
    }
  });
  
  // Check for drafts on mount
  useEffect(() => {
    if (form.isDraftAvailable) {
      setShowDraftDialog(true);
    }
  }, [form.isDraftAvailable]);
  
  // Handle equipment selection to update equipmentId
  const handleEquipmentChange = (value: string) => {
    const selectedEquipment = equipments.find(eq => eq.name === value);
    if (selectedEquipment) {
      form.setValue('equipmentId', selectedEquipment.id);
    }
    return value;
  };
  
  // Handle form submission
  const handleFormSubmit = async (values: InterventionFormValues) => {
    try {
      await onSubmit(values);
      await form.discardDraft(); // Discard draft after successful submission
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      toast.error("Erreur lors de la soumission");
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 mb-8">
            <BasicInfoFields 
              form={form}
              equipments={equipments} 
              isLoadingEquipment={isLoadingEquipment}
              handleEquipmentChange={handleEquipmentChange}
            />
            
            <SchedulingFields form={form} />
            
            <DetailsFields 
              form={form} 
              technicians={technicians}
              isLoadingTechnicians={isLoadingTechnicians}
            />
          </div>

          {form.lastSaved && (
            <div className="text-xs text-muted-foreground mb-4">
              Dernière sauvegarde automatique: {form.lastSaved.toLocaleTimeString()}
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={form.saveDraftManually}
                disabled={form.isAutoSaving}
              >
                {form.isAutoSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Sauvegarder
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                disabled={form.isSubmitting}
              >
                {form.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editMode ? "Mise à jour..." : "Création..."}
                  </>
                ) : (
                  editMode ? "Mettre à jour" : "Créer l'intervention"
                )}
              </Button>
            </div>
          </div>
          
          {!isOnline && (
            <OfflineOperationStatus operation={editMode ? "update" : "create"} />
          )}
        </form>
      </Form>
      
      <DraftRecoveryDialog
        open={showDraftDialog}
        onOpenChange={setShowDraftDialog}
        onRecover={async () => {
          await form.recoverDraft();
          setShowDraftDialog(false);
        }}
        onDiscard={async () => {
          await form.discardDraft();
          setShowDraftDialog(false);
        }}
        lastSaved={form.lastSaved}
        formType="intervention"
      />
    </>
  );
}
