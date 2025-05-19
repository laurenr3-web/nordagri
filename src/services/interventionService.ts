
import { Intervention } from '@/types/Intervention';

// Basic service for intervention operations
export const fetchInterventions = async (): Promise<Intervention[]> => {
  // This would normally fetch from an API, but for now return an empty array
  return [];
};

export const fetchInterventionById = async (id: string | number): Promise<Intervention | null> => {
  // This would normally fetch from an API
  return null;
};

export const createIntervention = async (intervention: Partial<Intervention>): Promise<Intervention> => {
  // This would normally post to an API
  return { id: 1, title: 'New Intervention', ...intervention } as Intervention;
};

export const updateIntervention = async (id: string | number, data: Partial<Intervention>): Promise<Intervention> => {
  // This would normally put to an API
  return { id: Number(id), ...data } as Intervention;
};

export const deleteIntervention = async (id: string | number): Promise<boolean> => {
  // This would normally delete from an API
  return true;
};
