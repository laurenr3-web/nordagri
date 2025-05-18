
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InterventionContentRenderer from './views/InterventionContentRenderer';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Plus, FileDown } from 'lucide-react';
import { Intervention } from '@/types/Intervention';
import { toast } from 'sonner';
import { exportInterventionToPDF } from '@/utils/pdfExport';

interface InterventionsListProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  filteredInterventions: Intervention[];
  onViewDetails: (intervention: Intervention) => void;
  onStartWork: (intervention: Intervention) => void;
  onOpenNewInterventionDialog: () => void;
}

const InterventionsList: React.FC<InterventionsListProps> = ({
  currentView,
  setCurrentView,
  filteredInterventions,
  onViewDetails,
  onStartWork,
  onOpenNewInterventionDialog
}) => {
  const isMobile = useIsMobile();

  // Exportation de toutes les interventions en PDF
  const handleExportAllToPDF = async () => {
    if (filteredInterventions.length === 0) {
      toast.error("Aucune intervention à exporter");
      return;
    }
    
    try {
      // Nous exportons seulement la première intervention pour l'instant (comme exemple)
      // Dans une implémentation complète, vous voudriez probablement créer un PDF contenant toutes les interventions
      const intervention = filteredInterventions[0];
      await exportInterventionToPDF(intervention, {}, `toutes-interventions-${new Date().toISOString().split('T')[0]}`);
      toast.success("Interventions exportées en PDF avec succès");
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      toast.error("Une erreur s'est produite lors de l'export");
    }
  };

  return (
    <div className="flex flex-col flex-grow">
      <div className="flex items-center justify-between mb-4">
        <Tabs 
          defaultValue="scheduled" 
          value={currentView}
          onValueChange={setCurrentView}
          className="w-full"
        >
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="scheduled">Planifiées</TabsTrigger>
            <TabsTrigger value="in-progress">En cours</TabsTrigger>
            <TabsTrigger value="completed">Terminées</TabsTrigger>
            <TabsTrigger value="field-tracking">Suivi terrain</TabsTrigger>
            <TabsTrigger value="requests">Demandes</TabsTrigger>
            <TabsTrigger value="observations">Observations</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={onOpenNewInterventionDialog} 
              size={isMobile ? "sm" : "default"}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              {!isMobile && <span>Nouvelle</span>}
            </Button>
            <Button 
              onClick={handleExportAllToPDF}
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              className="flex items-center gap-1"
            >
              <FileDown className="h-4 w-4" />
              {!isMobile && <span>Exporter PDF</span>}
            </Button>
          </div>
          
          <div className="flex-grow">
            <TabsContent value="scheduled" className="mt-4">
              <InterventionContentRenderer 
                currentView="scheduled"
                filteredInterventions={filteredInterventions}
                onViewDetails={onViewDetails}
                onStartWork={onStartWork}
              />
            </TabsContent>
            <TabsContent value="in-progress" className="mt-4">
              <InterventionContentRenderer 
                currentView="in-progress"
                filteredInterventions={filteredInterventions}
                onViewDetails={onViewDetails}
                onStartWork={onStartWork}
              />
            </TabsContent>
            <TabsContent value="completed" className="mt-4">
              <InterventionContentRenderer 
                currentView="completed"
                filteredInterventions={filteredInterventions}
                onViewDetails={onViewDetails}
                onStartWork={onStartWork}
              />
            </TabsContent>
            <TabsContent value="field-tracking" className="mt-4">
              <InterventionContentRenderer 
                currentView="field-tracking"
                filteredInterventions={filteredInterventions}
                onViewDetails={onViewDetails}
                onStartWork={onStartWork}
              />
            </TabsContent>
            <TabsContent value="requests" className="mt-4">
              <InterventionContentRenderer 
                currentView="requests"
                filteredInterventions={filteredInterventions}
                onViewDetails={onViewDetails}
                onStartWork={onStartWork}
              />
            </TabsContent>
            <TabsContent value="observations" className="mt-4">
              <InterventionContentRenderer 
                currentView="observations"
                filteredInterventions={filteredInterventions}
                onViewDetails={onViewDetails}
                onStartWork={onStartWork}
              />
            </TabsContent>
            <TabsContent value="history" className="mt-4">
              <InterventionContentRenderer 
                currentView="history"
                filteredInterventions={filteredInterventions}
                onViewDetails={onViewDetails}
                onStartWork={onStartWork}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default InterventionsList;
