
import { supabase, withRetry } from '@/integrations/supabase/client';
import { Intervention, InterventionFormValues, convertCoordinates } from '@/types/Intervention';
import { RetryableError, ValidationError, getSupabaseErrorMessage } from '@/utils/errorHandling';
import { toast } from 'sonner';

// Validation des entrées
const validateIntervention = (intervention: InterventionFormValues): boolean => {
  const errors: Record<string, string> = {};
  
  if (!intervention.title?.trim()) {
    errors.title = 'Le titre est requis';
  }
  
  if (!intervention.equipment?.trim()) {
    errors.equipment = 'L\'équipement est requis';
  }
  
  if (!intervention.location?.trim()) {
    errors.location = 'Le lieu est requis';
  }
  
  if (!intervention.date) {
    errors.date = 'La date est requise';
  }
  
  // Si des erreurs sont trouvées
  if (Object.keys(errors).length > 0) {
    throw new ValidationError(
      'Veuillez corriger les problèmes dans le formulaire',
      errors
    );
  }
  
  return true;
};

export const interventionService = {
  // Récupérer toutes les interventions
  async getInterventions(): Promise<Intervention[]> {
    return withRetry(async () => {
      try {
        const { data, error } = await supabase
          .from('interventions')
          .select('*');
        
        if (error) {
          console.error('Error fetching interventions:', error);
          toast.error('Erreur lors du chargement des interventions', {
            description: getSupabaseErrorMessage(error)
          });
          throw error;
        }
        
        if (!data) {
          return [];
        }
        
        // Convert database records to frontend objects with safe handling
        return data.map(item => ({
          id: item.id,
          title: item.title,
          equipment: item.equipment || '',
          equipmentId: item.equipment_id,
          location: item.location || '',
          coordinates: item.coordinates ? 
            (typeof item.coordinates === 'object' && item.coordinates !== null ? 
              convertCoordinates.toLatitudeLongitude({
                lat: typeof item.coordinates === 'object' && 'lat' in item.coordinates ? 
                  Number(item.coordinates.lat) || 0 : 0, 
                lng: typeof item.coordinates === 'object' && 'lng' in item.coordinates ? 
                  Number(item.coordinates.lng) || 0 : 0 
              }) : 
              { latitude: 0, longitude: 0 }
            ) : undefined,
          status: (item.status as Intervention['status']) || 'scheduled',
          priority: (item.priority as Intervention['priority']) || 'medium',
          date: new Date(item.date || Date.now()),
          duration: item.duration || undefined,
          scheduledDuration: item.scheduled_duration || undefined,
          technician: item.technician || '',
          description: item.description || '',
          partsUsed: item.parts_used ? 
            (Array.isArray(item.parts_used) ? 
              item.parts_used.map((p: any) => ({
                id: p.id || 0,
                name: p.name || '',
                quantity: p.quantity || 0
              })) : []
            ) : [],
          notes: item.notes || '',
        }));
      } catch (error: any) {
        // Si c'est une erreur temporaire, on l'enrobe pour le système de réessai
        if (error.code === 'PGRST301' || error.code === '40001' || error.code === '55P03') {
          throw new RetryableError(`Erreur temporaire lors de la récupération des interventions: ${error.message}`);
        }
        
        console.error('Error in getInterventions:', error);
        toast.error('Erreur lors du chargement des interventions', {
          description: getSupabaseErrorMessage(error)
        });
        throw error;
      }
    });
  },
  
  // Récupérer une intervention par son ID
  async getInterventionById(id: string | number): Promise<Intervention> {
    return withRetry(async () => {
      try {
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        
        if (isNaN(numericId)) {
          throw new ValidationError(`ID d'intervention invalide: ${id}`);
        }
        
        const { data, error } = await supabase
          .from('interventions')
          .select('*')
          .eq('id', numericId)
          .maybeSingle();  // Utilisez maybeSingle pour ne pas générer d'erreur si aucune donnée n'est trouvée
        
        if (error) {
          console.error(`Error fetching intervention with id ${id}:`, error);
          toast.error(`Erreur lors de la récupération de l'intervention #${id}`, {
            description: getSupabaseErrorMessage(error)
          });
          throw error;
        }
        
        if (!data) {
          toast.error(`Intervention #${id} introuvable`);
          throw new Error(`Intervention with id ${id} not found`);
        }
        
        return {
          id: data.id,
          title: data.title || '',
          equipment: data.equipment || '',
          equipmentId: data.equipment_id,
          location: data.location || '',
          coordinates: data.coordinates && typeof data.coordinates === 'object' ? 
            convertCoordinates.toLatitudeLongitude({
              lat: typeof data.coordinates === 'object' && 'lat' in data.coordinates ? 
                Number(data.coordinates.lat) || 0 : 0, 
              lng: typeof data.coordinates === 'object' && 'lng' in data.coordinates ? 
                Number(data.coordinates.lng) || 0 : 0 
            }) : 
            undefined,
          status: (data.status as Intervention['status']) || 'scheduled',
          priority: (data.priority as Intervention['priority']) || 'medium',
          date: new Date(data.date || Date.now()),
          duration: data.duration || undefined,
          scheduledDuration: data.scheduled_duration || undefined,
          technician: data.technician || '',
          description: data.description || '',
          partsUsed: Array.isArray(data.parts_used) ? 
            data.parts_used.map((p: any) => ({
              id: p.id || 0,
              name: p.name || '',
              quantity: p.quantity || 0
            })) : [],
          notes: data.notes || ''
        };
      } catch (error: any) {
        if (error.message.includes('not found')) {
          toast.error(`Intervention #${id} introuvable`);
        } else {
          toast.error(`Erreur lors de la récupération de l'intervention #${id}`, {
            description: getSupabaseErrorMessage(error)
          });
        }
        throw error;
      }
    });
  },
  
  // Ajouter une intervention
  async addIntervention(intervention: InterventionFormValues): Promise<Intervention> {
    return withRetry(async () => {
      try {
        // Validation des entrées
        validateIntervention(intervention);
        
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          toast.error('Erreur d\'authentification', {
            description: 'Vous devez être connecté pour créer une intervention'
          });
          throw sessionError;
        }
        
        if (!sessionData.session) {
          toast.error('Session expirée', {
            description: 'Veuillez vous reconnecter pour continuer'
          });
          throw new Error('No active session found');
        }
        
        const newIntervention = {
          title: intervention.title.trim(),
          equipment: intervention.equipment.trim(),
          equipment_id: intervention.equipmentId,
          location: intervention.location.trim(),
          coordinates: intervention.coordinates || { latitude: 0, longitude: 0 },
          status: 'scheduled',
          priority: intervention.priority,
          date: intervention.date.toISOString(),
          scheduled_duration: intervention.scheduledDuration,
          technician: intervention.technician?.trim() || '',
          description: intervention.description?.trim() || '',
          notes: intervention.notes?.trim() || '',
          parts_used: [], // Ensure this is a JSON compatible array
          owner_id: sessionData.session?.user.id
        };
        
        toast.loading('Création de l\'intervention en cours...', {
          id: 'add-intervention'
        });
        
        const { data, error } = await supabase
          .from('interventions')
          .insert(newIntervention)
          .select()
          .single();
        
        if (error) {
          console.error('Error adding intervention:', error);
          toast.error('Erreur lors de la création de l\'intervention', {
            description: getSupabaseErrorMessage(error),
            id: 'add-intervention'
          });
          throw error;
        }
        
        toast.success('Intervention créée avec succès', {
          id: 'add-intervention'
        });
        
        return {
          id: data.id,
          title: data.title,
          equipment: data.equipment,
          equipmentId: data.equipment_id,
          location: data.location,
          coordinates: data.coordinates && typeof data.coordinates === 'object' ? 
            convertCoordinates.toLatitudeLongitude({
              lat: typeof data.coordinates === 'object' && 'lat' in data.coordinates ? 
                Number(data.coordinates.lat) || 0 : 0, 
              lng: typeof data.coordinates === 'object' && 'lng' in data.coordinates ? 
                Number(data.coordinates.lng) || 0 : 0 
            }) : 
            undefined,
          status: (data.status as Intervention['status']) || 'scheduled',
          priority: (data.priority as Intervention['priority']) || 'medium',
          date: new Date(data.date),
          duration: data.duration || undefined,
          scheduledDuration: data.scheduled_duration || undefined,
          technician: data.technician,
          description: data.description || '',
          partsUsed: Array.isArray(data.parts_used) ? 
            data.parts_used.map((p: any) => ({
              id: p.id || 0,
              name: p.name || '',
              quantity: p.quantity || 0
            })) : [],
          notes: data.notes || ''
        };
      } catch (error: any) {
        // Gérer les erreurs de validation séparément
        if (error instanceof ValidationError && error.fieldErrors) {
          console.error('Validation errors:', error.fieldErrors);
          
          // Afficher une notification pour chaque erreur de champ
          Object.entries(error.fieldErrors).forEach(([field, message]) => {
            toast.error(`Erreur: ${field}`, {
              description: message
            });
          });
          
          toast.dismiss('add-intervention');
        } else {
          console.error('Error in addIntervention:', error);
          toast.error('Erreur lors de la création de l\'intervention', {
            description: getSupabaseErrorMessage(error),
            id: 'add-intervention'
          });
        }
        
        throw error;
      }
    }, 2);  // Maximum 2 tentatives pour cette opération
  },
  
  // Mettre à jour une intervention
  async updateIntervention(intervention: Intervention): Promise<Intervention> {
    return withRetry(async () => {
      try {
        // Validation de base
        if (!intervention.id) {
          throw new ValidationError('ID d\'intervention manquant');
        }
        
        toast.loading('Mise à jour de l\'intervention...', {
          id: 'update-intervention'
        });
        
        // Convert coordinates to database format
        const coordinates = intervention.coordinates ? 
          { latitude: intervention.coordinates.latitude, longitude: intervention.coordinates.longitude } : 
          undefined;

        // Ensure parts_used is in JSON compatible format
        const parts_used = intervention.partsUsed ? 
          JSON.parse(JSON.stringify(intervention.partsUsed)) : [];

        const updates = {
          title: intervention.title?.trim(),
          equipment: intervention.equipment?.trim(),
          equipment_id: intervention.equipmentId,
          location: intervention.location?.trim(),
          coordinates: coordinates,
          status: intervention.status,
          priority: intervention.priority,
          date: intervention.date.toISOString(),
          duration: intervention.duration,
          scheduled_duration: intervention.scheduledDuration,
          technician: intervention.technician?.trim(),
          description: intervention.description?.trim(),
          parts_used: parts_used,
          notes: intervention.notes?.trim(),
          updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
          .from('interventions')
          .update(updates)
          .eq('id', intervention.id)
          .select()
          .single();
        
        if (error) {
          console.error(`Error updating intervention with id ${intervention.id}:`, error);
          toast.error('Erreur lors de la mise à jour de l\'intervention', {
            description: getSupabaseErrorMessage(error),
            id: 'update-intervention'
          });
          throw error;
        }
        
        toast.success('Intervention mise à jour avec succès', {
          id: 'update-intervention'
        });
        
        return {
          id: data.id,
          title: data.title,
          equipment: data.equipment,
          equipmentId: data.equipment_id,
          location: data.location,
          coordinates: data.coordinates && typeof data.coordinates === 'object' ? 
            convertCoordinates.toLatitudeLongitude({
              lat: typeof data.coordinates === 'object' && 'lat' in data.coordinates ? 
                Number(data.coordinates.lat) || 0 : 0, 
              lng: typeof data.coordinates === 'object' && 'lng' in data.coordinates ? 
                Number(data.coordinates.lng) || 0 : 0 
            }) : 
            undefined,
          status: (data.status as Intervention['status']) || 'scheduled',
          priority: (data.priority as Intervention['priority']) || 'medium',
          date: new Date(data.date),
          duration: data.duration || undefined,
          scheduledDuration: data.scheduled_duration || undefined,
          technician: data.technician,
          description: data.description || '',
          partsUsed: Array.isArray(data.parts_used) ? 
            data.parts_used.map((p: any) => ({
              id: p.id || 0,
              name: p.name || '',
              quantity: p.quantity || 0
            })) : [],
          notes: data.notes || ''
        };
      } catch (error: any) {
        console.error(`Error in updateIntervention:`, error);
        
        toast.error('Erreur lors de la mise à jour de l\'intervention', {
          description: getSupabaseErrorMessage(error),
          id: 'update-intervention'
        });
        
        throw error;
      }
    });
  },
  
  // Mettre à jour le statut d'une intervention
  async updateInterventionStatus(id: number, status: string): Promise<void> {
    return withRetry(async () => {
      try {
        const toastId = `status-${id}`;
        toast.loading(`Mise à jour du statut...`, { id: toastId });
        
        const updates = { 
          status,
          ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {})
        };
        
        const { error } = await supabase
          .from('interventions')
          .update(updates)
          .eq('id', id);
        
        if (error) {
          console.error('Error updating intervention status:', error);
          toast.error('Erreur lors de la mise à jour du statut', {
            description: getSupabaseErrorMessage(error),
            id: toastId
          });
          throw error;
        }
        
        toast.success(`Statut mis à jour avec succès`, { id: toastId });
      } catch (error: any) {
        console.error('Error in updateInterventionStatus:', error);
        toast.error('Erreur lors de la mise à jour du statut', {
          description: getSupabaseErrorMessage(error)
        });
        throw error;
      }
    });
  },
  
  // Supprimer une intervention
  async deleteIntervention(id: number): Promise<void> {
    return withRetry(async () => {
      try {
        const toastId = `delete-${id}`;
        toast.loading('Suppression de l\'intervention...', { id: toastId });
        
        const { error } = await supabase
          .from('interventions')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('Error deleting intervention:', error);
          toast.error('Erreur lors de la suppression de l\'intervention', {
            description: getSupabaseErrorMessage(error),
            id: toastId
          });
          throw error;
        }
        
        toast.success('Intervention supprimée avec succès', { id: toastId });
      } catch (error: any) {
        console.error('Error in deleteIntervention:', error);
        toast.error('Erreur lors de la suppression de l\'intervention', {
          description: getSupabaseErrorMessage(error)
        });
        throw error;
      }
    });
  }
};
