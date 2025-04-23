
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type OfflineRecordType = "time_session" | "fuel_log";

interface OfflineRecord {
  type: OfflineRecordType;
  data: any;
  retryCount?: number;
}

const LOCAL_KEY = "agri_offline_queue_v1";

function getQueue(): OfflineRecord[] {
  const raw = localStorage.getItem(LOCAL_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function saveQueue(arr: OfflineRecord[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(arr));
}

// Hook pour exposer des fonctions d'ajout depuis les features
export function useOfflineSync() {
  // Ajoute une opération à la queue locale
  const queueOffline = useCallback((type: OfflineRecordType, data: any) => {
    const current = getQueue();
    saveQueue([...current, { type, data }]);
  }, []);

  // Essaie de synchroniser toutes les entrées en attente vers Supabase
  const trySyncAll = useCallback(async () => {
    const queue = getQueue();
    if (!queue.length) return true;
    let successCount = 0;
    let failCount = 0;
    let newQueue: OfflineRecord[] = [];

    for (const record of queue) {
      try {
        if (record.type === "time_session") {
          // Nouvelle session de temps : insert dans time_sessions
          const { error } = await supabase.from("time_sessions").insert(record.data);
          if (error) throw error;
          successCount++;
        } else if (record.type === "fuel_log") {
          // Nouveau plein : insert dans fuel_logs
          const { error } = await supabase.from("fuel_logs").insert(record.data);
          if (error) throw error;
          successCount++;
        }
      } catch (err) {
        failCount++;
        newQueue.push({ ...record, retryCount: (record.retryCount || 0) + 1 });
      }
    }
    if (successCount) {
      toast.success("Reconnexion – Données synchronisées", {
        description: `${successCount} enregistrements ont été synchronisés avec succès.`,
      });
    }
    // Garder juste ceux qui ont échoué
    saveQueue(newQueue);
    return failCount === 0;
  }, []);

  // Sur reconnexion réseau
  useEffect(() => {
    const handleOnline = () => {
      trySyncAll();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
    // eslint-disable-next-line
  }, []); // trySyncAll est stable

  // API à exposer
  return { queueOffline, trySyncAll, getOfflineQueue: getQueue };
}
