
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Download, Printer, Share } from 'lucide-react';

interface Statistics {
  totalHours: number;
  taskCount: number;
  mainTask: string;
  dailyAverage: number;
}

interface TaskDistribution {
  type: string;
  hours: number;
  color: string;
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: Date;
  statistics: Statistics;
  taskDistribution: TaskDistribution[];
}

function ReportModal({ isOpen, onClose, month, statistics, taskDistribution }: ReportModalProps) {
  const handlePrint = () => {
    window.print();
  };
  
  const handleDownload = () => {
    // Basic implementation - in a real app this would create a PDF
    alert('Cette fonctionnalité sera disponible prochainement');
  };
  
  const handleShare = () => {
    // Basic implementation - in a real app this would share the report
    if (navigator.share) {
      navigator.share({
        title: `Rapport d'activité - ${format(month, 'MMMM yyyy', { locale: fr })}`,
        text: 'Voici mon rapport d\'activité'
      }).catch(err => {
        console.error('Erreur lors du partage:', err);
      });
    } else {
      alert('Partage non supporté par votre navigateur');
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Rapport d'activité - {format(month, 'MMMM yyyy', { locale: fr })}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Statistiques générales</h3>
              <ul className="space-y-1 text-sm">
                <li>Heures totales: <span className="font-medium">{statistics.totalHours.toFixed(1)}h</span></li>
                <li>Types de tâches: <span className="font-medium">{statistics.taskCount}</span></li>
                <li>Tâche principale: <span className="font-medium">{statistics.mainTask}</span></li>
                <li>Moyenne quotidienne: <span className="font-medium">{statistics.dailyAverage.toFixed(1)}h</span></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Répartition des tâches</h3>
              {taskDistribution.length > 0 ? (
                <ul className="space-y-1 text-sm">
                  {taskDistribution.slice(0, 5).map((task, index) => (
                    <li key={index}>
                      <span className="inline-block w-3 h-3 mr-2" style={{ backgroundColor: task.color }}></span>
                      {task.type}: <span className="font-medium">{task.hours.toFixed(1)}h</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Performance</h3>
            <p className="text-sm">
              Votre performance ce mois représente {statistics.totalHours > 0 ? Math.min(100, (statistics.totalHours / 160) * 100).toFixed(0) : 0}% 
              d'un mois de travail standard (160h).
            </p>
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleDownload} size="sm">
              <Download className="mr-2 h-4 w-4" />
              Télécharger PDF
            </Button>
            <Button variant="outline" onClick={handlePrint} size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
            <Button onClick={handleShare} size="sm">
              <Share className="mr-2 h-4 w-4" />
              Partager
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ReportModal;
