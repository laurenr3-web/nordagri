
import { Intervention, InterventionFormValues } from '@/types/Intervention';

// Mock data for interventions while we don't have a real backend
const mockInterventions: Intervention[] = [
  {
    id: 1,
    title: "Reparation pompe hydraulique",
    equipment: "Tracteur John Deere 5050E",
    description: "Remplacement de la pompe hydraulique qui fuit",
    location: "Hangar principal",
    status: "scheduled",
    priority: "high",
    technician: "Marc Dubois",
    date: new Date("2025-05-20"),
    scheduledDuration: 3
  },
  {
    id: 2,
    title: "Maintenance préventive",
    equipment: "Moissonneuse Claas Lexion 8900",
    description: "Vérification complète avant la saison",
    location: "Atelier",
    status: "in-progress",
    priority: "medium",
    technician: "Sophie Martin",
    date: new Date("2025-05-18"),
    scheduledDuration: 4
  },
  {
    id: 3,
    title: "Changement filtre à huile",
    equipment: "Tracteur New Holland T7",
    description: "Remplacement du filtre à huile et vidange",
    location: "Parcelle Est",
    status: "completed",
    priority: "low",
    technician: "Pierre Leroy",
    date: new Date("2025-05-15"),
    scheduledDuration: 1,
    duration: 1.5
  }
];

/**
 * Service for managing interventions through Supabase
 */
export const interventionService = {
  /**
   * Get all interventions
   */
  async getInterventions(): Promise<Intervention[]> {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 500));
    
    return [...mockInterventions];
  },
  
  /**
   * Get intervention by ID
   */
  async getInterventionById(id: number): Promise<Intervention | null> {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 300));
    
    const intervention = mockInterventions.find(i => Number(i.id) === Number(id));
    return intervention || null;
  },
  
  /**
   * Add a new intervention
   */
  async addIntervention(intervention: InterventionFormValues): Promise<Intervention> {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 700));
    
    const newId = mockInterventions.length + 1;
    const newIntervention: Intervention = {
      id: newId,
      title: intervention.title,
      description: intervention.description,
      equipment: intervention.equipment,
      location: intervention.location || "",
      status: intervention.status || "scheduled",
      priority: intervention.priority,
      technician: intervention.technician || "",
      date: intervention.date,
      scheduledDuration: intervention.scheduledDuration || 1
    };
    
    mockInterventions.push(newIntervention);
    return newIntervention;
  },
  
  /**
   * Update intervention
   */
  async updateIntervention(id: number, updates: Partial<Intervention>): Promise<Intervention> {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 600));
    
    const index = mockInterventions.findIndex(i => Number(i.id) === Number(id));
    
    if (index === -1) {
      throw new Error(`Intervention with ID ${id} not found`);
    }
    
    mockInterventions[index] = {
      ...mockInterventions[index],
      ...updates
    };
    
    return mockInterventions[index];
  },
  
  /**
   * Update intervention status
   */
  async updateInterventionStatus(id: number, status: 'scheduled' | 'in-progress' | 'completed' | 'canceled'): Promise<Intervention> {
    return this.updateIntervention(id, { status });
  },
  
  /**
   * Delete intervention
   */
  async deleteIntervention(id: number): Promise<void> {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 400));
    
    const index = mockInterventions.findIndex(i => Number(i.id) === Number(id));
    
    if (index === -1) {
      throw new Error(`Intervention with ID ${id} not found`);
    }
    
    mockInterventions.splice(index, 1);
  }
};
