
import { supabase } from '@/integrations/supabase/client';

/**
 * Ce script recherche toutes les sessions qui ont un custom_task_type mais pas de task_type_id
 * et essaie de leur attribuer automatiquement un task_type_id en fonction de leur custom_task_type
 */
export async function fixTimeSessionsTaskTypes() {
  console.log("Début de la correction des types de tâches...");
  
  try {
    // 1. Récupérer tous les types de tâches disponibles
    const { data: taskTypes, error: taskTypesError } = await supabase
      .from('task_types')
      .select('id, name');
      
    if (taskTypesError) throw taskTypesError;
    
    if (!taskTypes || taskTypes.length === 0) {
      console.error("Aucun type de tâche trouvé dans la base de données");
      return;
    }
    
    console.log(`${taskTypes.length} types de tâches trouvés dans la base de données`);
    
    // Créer un mapping simple pour la correspondance
    const taskTypeMap = new Map();
    taskTypes.forEach(type => {
      taskTypeMap.set(type.name.toLowerCase(), type.id);
    });
    
    // 2. Récupérer toutes les sessions qui ont custom_task_type mais pas task_type_id
    const { data: sessions, error: sessionsError } = await supabase
      .from('time_sessions')
      .select('id, custom_task_type')
      .is('task_type_id', null)
      .not('custom_task_type', 'is', null);
      
    if (sessionsError) throw sessionsError;
    
    if (!sessions || sessions.length === 0) {
      console.log("Aucune session à corriger trouvée");
      return;
    }
    
    console.log(`${sessions.length} sessions sans task_type_id trouvées`);
    
    // 3. Pour chaque session, essayer de trouver un task_type_id correspondant
    let updatedCount = 0;
    let notFoundCount = 0;
    
    for (const session of sessions) {
      const customType = session.custom_task_type.toLowerCase();
      let foundId = null;
      
      // Recherche directe
      if (taskTypeMap.has(customType)) {
        foundId = taskTypeMap.get(customType);
      } else {
        // Recherche approximative (contient)
        for (const [typeName, typeId] of taskTypeMap.entries()) {
          if (customType.includes(typeName) || typeName.includes(customType)) {
            foundId = typeId;
            break;
          }
        }
      }
      
      if (foundId) {
        // Mettre à jour la session
        const { error: updateError } = await supabase
          .from('time_sessions')
          .update({ task_type_id: foundId })
          .eq('id', session.id);
          
        if (updateError) {
          console.error(`Erreur lors de la mise à jour de la session ${session.id}:`, updateError);
        } else {
          updatedCount++;
        }
      } else {
        notFoundCount++;
      }
    }
    
    console.log(`${updatedCount} sessions ont été mises à jour avec un task_type_id`);
    console.log(`${notFoundCount} sessions n'ont pas pu être associées à un type connu`);
    
    // 4. Si des sessions n'ont pas pu être associées, suggérer de créer de nouveaux types
    if (notFoundCount > 0) {
      // Récupérer les types uniques qui n'ont pas trouvé de correspondance
      const { data: uniqueTypes } = await supabase
        .from('time_sessions')
        .select('custom_task_type')
        .is('task_type_id', null)
        .not('custom_task_type', 'is', null);
        
      if (uniqueTypes && uniqueTypes.length > 0) {
        const missingTypes = [...new Set(uniqueTypes.map(s => s.custom_task_type))];
        console.log("Types manquants qui pourraient être ajoutés à la table task_types:");
        missingTypes.forEach(type => console.log(`- ${type}`));
      }
    }
    
    return {
      totalScanned: sessions.length,
      updatedCount,
      notFoundCount
    };
    
  } catch (error) {
    console.error("Erreur lors de la correction des types de tâches:", error);
    throw error;
  }
}

// Fonction d'assistance pour exécuter le script depuis la console du navigateur
export function runFixScript() {
  fixTimeSessionsTaskTypes()
    .then(result => {
      console.log("Correction terminée avec succès:", result);
    })
    .catch(error => {
      console.error("La correction a échoué:", error);
    });
}

// Exposer la fonction dans window pour exécution depuis la console
if (typeof window !== 'undefined') {
  (window as any).fixTimeSessionsTaskTypes = runFixScript;
}
