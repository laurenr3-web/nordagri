
import { InterventionDB, Intervention, InterventionFormValues } from '@/types/models/intervention';
import { Json } from '@/integrations/supabase/types';

/**
 * Map database status to client status
 */
const mapStatusToClient = (status: string): 'scheduled' | 'in-progress' | 'completed' | 'cancelled' => {
  switch(status) {
    case 'in_progress':
      return 'in-progress';
    case 'canceled':
      return 'cancelled';
    case 'scheduled':
    case 'completed':
      return status as any;
    default:
      return 'scheduled';
  }
};

/**
 * Map client status to database status
 */
const mapStatusToDb = (status?: string): string => {
  switch(status) {
    case 'in-progress':
      return 'in_progress';
    case 'cancelled':
      return 'canceled';
    case 'scheduled':
    case 'completed':
      return status || 'scheduled';
    default:
      return 'scheduled';
  }
};

/**
 * Convert database intervention to client intervention
 */
export const dbToClientIntervention = (dbIntervention: InterventionDB): Intervention => {
  return {
    id: dbIntervention.id,
    title: dbIntervention.title,
    equipment: dbIntervention.equipment,
    equipmentId: dbIntervention.equipment_id,
    description: dbIntervention.description || '',
    status: mapStatusToClient(dbIntervention.status),
    priority: dbIntervention.priority as any,
    date: new Date(dbIntervention.date),
    scheduledDuration: dbIntervention.scheduled_duration,
    duration: dbIntervention.duration,
    technician: dbIntervention.technician,
    location: dbIntervention.location,
    notes: dbIntervention.notes || '',
    partsUsed: dbIntervention.parts_used as any[] || [],
    coordinates: dbIntervention.coordinates as any,
    ownerId: dbIntervention.owner_id
  };
};

/**
 * Convert client intervention form values to database intervention
 */
export const clientFormToDbIntervention = (formData: InterventionFormValues): Partial<InterventionDB> => {
  return {
    title: formData.title,
    equipment: formData.equipment,
    equipment_id: formData.equipmentId,
    location: formData.location,
    priority: formData.priority,
    status: mapStatusToDb(formData.status),
    date: formData.date instanceof Date ? formData.date.toISOString() : formData.date as string,
    scheduled_duration: formData.scheduledDuration,
    technician: formData.technician || '',
    description: formData.description,
    notes: formData.notes,
    coordinates: formData.coordinates ? {
      latitude: formData.coordinates.latitude,
      longitude: formData.coordinates.longitude
    } : null
  };
};

/**
 * Convert client intervention to database intervention
 */
export const clientToDbIntervention = (intervention: Intervention): Partial<InterventionDB> => {
  return {
    id: intervention.id,
    title: intervention.title,
    equipment: intervention.equipment,
    equipment_id: intervention.equipmentId,
    description: intervention.description,
    status: mapStatusToDb(intervention.status),
    priority: intervention.priority,
    date: intervention.date instanceof Date ? intervention.date.toISOString() : intervention.date as string,
    scheduled_duration: intervention.scheduledDuration,
    duration: intervention.duration,
    technician: intervention.technician,
    location: intervention.location,
    notes: intervention.notes,
    parts_used: intervention.partsUsed,
    coordinates: intervention.coordinates,
    owner_id: intervention.ownerId
  };
};
