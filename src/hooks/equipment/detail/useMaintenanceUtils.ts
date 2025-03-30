
export function useMaintenanceUtils() {
  // Helper pour obtenir la date de la dernière maintenance
  const getLastMaintenanceDate = (tasks: any[]): string => {
    if (!tasks || tasks.length === 0) return 'N/A';
    
    const completedTasks = tasks.filter(task => 
      task.status === 'completed' && task.completedDate
    );
    
    if (completedTasks.length === 0) return 'N/A';
    
    // Trier par date de complétion (la plus récente d'abord)
    const sortedTasks = [...completedTasks].sort((a, b) => 
      new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime()
    );
    
    // Formater la date pour l'affichage
    return new Date(sortedTasks[0].completedDate).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Helper pour obtenir les informations du prochain service
  const getNextServiceInfo = (tasks: any[]): { type: string, due: string } => {
    if (!tasks || tasks.length === 0) {
      return { type: 'Regular maintenance', due: 'Non planifié' };
    }
    
    // Trouver les tâches planifiées (non complétées) et les trier par date d'échéance
    const scheduledTasks = tasks.filter(task => 
      task.status === 'scheduled' || task.status === 'in-progress'
    );
    
    if (scheduledTasks.length === 0) {
      return { type: 'Regular maintenance', due: 'Non planifié' };
    }
    
    // Trier par date d'échéance (la plus proche d'abord)
    const sortedTasks = [...scheduledTasks].sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
    
    const nextTask = sortedTasks[0];
    
    // Calculer le temps restant avant l'échéance
    const dueDate = new Date(nextTask.dueDate);
    const today = new Date();
    const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let dueText = '';
    if (daysRemaining < 0) {
      dueText = `En retard de ${Math.abs(daysRemaining)} jour(s)`;
    } else if (daysRemaining === 0) {
      dueText = 'Aujourd\'hui';
    } else if (daysRemaining === 1) {
      dueText = 'Demain';
    } else if (daysRemaining < 30) {
      dueText = `Dans ${daysRemaining} jour(s)`;
    } else {
      dueText = dueDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    
    return { 
      type: nextTask.title || nextTask.type || 'Maintenance', 
      due: dueText 
    };
  };

  return {
    getLastMaintenanceDate,
    getNextServiceInfo
  };
}
