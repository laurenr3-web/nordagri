
import { supabase } from '@/integrations/supabase/client';
import { MaintenanceType, MaintenancePriority } from '@/hooks/maintenance/maintenanceSlice';
import { MaintenancePlan, MaintenanceFrequency, MaintenanceUnit } from '@/hooks/maintenance/useMaintenancePlanner';

export class MaintenancePlansService {
  async getMaintenancePlans(): Promise<MaintenancePlan[]> {
    const { data, error } = await supabase
      .from('maintenance_plans')
      .select('*')
      .order('next_due_date', { ascending: true });

    if (error) {
      console.error('Error fetching maintenance plans:', error);
      throw new Error('Failed to fetch maintenance plans');
    }

    return data.map(plan => ({
      id: plan.id,
      title: plan.title,
      description: plan.description || undefined,
      equipmentId: plan.equipment_id,
      equipmentName: plan.equipment_name,
      frequency: plan.frequency as MaintenanceFrequency,
      interval: plan.interval,
      unit: plan.unit as MaintenanceUnit,
      type: plan.type as MaintenanceType,
      priority: plan.priority as MaintenancePriority,
      engineHours: plan.engine_hours || 0,
      nextDueDate: new Date(plan.next_due_date),
      lastPerformedDate: plan.last_performed_date ? new Date(plan.last_performed_date) : undefined,
      assignedTo: plan.assigned_to,
      active: plan.active,
      trigger_unit: plan.trigger_unit as 'hours' | 'kilometers' | 'none',
      trigger_hours: plan.trigger_hours,
      trigger_kilometers: plan.trigger_kilometers,
    }));
  }

  async getMaintenancePlansForEquipment(equipmentId: number): Promise<MaintenancePlan[]> {
    const { data, error } = await supabase
      .from('maintenance_plans')
      .select('*')
      .eq('equipment_id', equipmentId)
      .order('next_due_date', { ascending: true });

    if (error) {
      console.error('Error fetching maintenance plans for equipment:', error);
      throw new Error('Failed to fetch maintenance plans for equipment');
    }

    return data.map(plan => ({
      id: plan.id,
      title: plan.title,
      description: plan.description || undefined,
      equipmentId: plan.equipment_id,
      equipmentName: plan.equipment_name,
      frequency: plan.frequency as MaintenanceFrequency,
      interval: plan.interval,
      unit: plan.unit as MaintenanceUnit,
      type: plan.type as MaintenanceType,
      priority: plan.priority as MaintenancePriority,
      engineHours: plan.engine_hours || 0,
      nextDueDate: new Date(plan.next_due_date),
      lastPerformedDate: plan.last_performed_date ? new Date(plan.last_performed_date) : undefined,
      assignedTo: plan.assigned_to,
      active: plan.active,
      trigger_unit: plan.trigger_unit as 'hours' | 'kilometers' | 'none',
      trigger_hours: plan.trigger_hours,
      trigger_kilometers: plan.trigger_kilometers,
    }));
  }

  async addMaintenancePlan(plan: MaintenancePlan): Promise<MaintenancePlan> {
    const { data, error } = await supabase
      .from('maintenance_plans')
      .insert({
        title: plan.title,
        description: plan.description,
        equipment_id: plan.equipmentId,
        equipment_name: plan.equipmentName,
        frequency: plan.frequency,
        interval: plan.interval,
        unit: plan.unit,
        type: plan.type,
        priority: plan.priority,
        engine_hours: plan.engineHours,
        next_due_date: plan.nextDueDate.toISOString(),
        last_performed_date: plan.lastPerformedDate ? plan.lastPerformedDate.toISOString() : null,
        assigned_to: plan.assignedTo,
        active: plan.active,
        trigger_unit: plan.trigger_unit,
        trigger_hours: plan.trigger_hours,
        trigger_kilometers: plan.trigger_kilometers,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding maintenance plan:', error);
      throw new Error('Failed to add maintenance plan');
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      equipmentId: data.equipment_id,
      equipmentName: data.equipment_name,
      frequency: data.frequency as MaintenanceFrequency,
      interval: data.interval,
      unit: data.unit as MaintenanceUnit,
      type: data.type as MaintenanceType,
      priority: data.priority as MaintenancePriority,
      engineHours: data.engine_hours || 0,
      nextDueDate: new Date(data.next_due_date),
      lastPerformedDate: data.last_performed_date ? new Date(data.last_performed_date) : undefined,
      assignedTo: data.assigned_to,
      active: data.active,
      trigger_unit: data.trigger_unit as 'hours' | 'kilometers' | 'none',
      trigger_hours: data.trigger_hours,
      trigger_kilometers: data.trigger_kilometers,
    };
  }

  async updateMaintenancePlan(planId: number, updates: Partial<MaintenancePlan>): Promise<void> {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.equipmentId !== undefined) updateData.equipment_id = updates.equipmentId;
    if (updates.equipmentName !== undefined) updateData.equipment_name = updates.equipmentName;
    if (updates.frequency !== undefined) updateData.frequency = updates.frequency;
    if (updates.interval !== undefined) updateData.interval = updates.interval;
    if (updates.unit !== undefined) updateData.unit = updates.unit;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.engineHours !== undefined) updateData.engine_hours = updates.engineHours;
    if (updates.nextDueDate !== undefined) updateData.next_due_date = updates.nextDueDate.toISOString();
    if (updates.lastPerformedDate !== undefined) updateData.last_performed_date = updates.lastPerformedDate.toISOString();
    if (updates.assignedTo !== undefined) updateData.assigned_to = updates.assignedTo;
    if (updates.active !== undefined) updateData.active = updates.active;
    if (updates.trigger_unit !== undefined) updateData.trigger_unit = updates.trigger_unit;
    if (updates.trigger_hours !== undefined) updateData.trigger_hours = updates.trigger_hours;
    if (updates.trigger_kilometers !== undefined) updateData.trigger_kilometers = updates.trigger_kilometers;

    const { error } = await supabase
      .from('maintenance_plans')
      .update(updateData)
      .eq('id', planId);

    if (error) {
      console.error('Error updating maintenance plan:', error);
      throw new Error('Failed to update maintenance plan');
    }
  }
}

export const maintenancePlansService = new MaintenancePlansService();
