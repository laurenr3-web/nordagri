
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import InterventionDetailsDialog from '@/components/interventions/InterventionDetailsDialog';
import NewInterventionDialog from '@/components/interventions/NewInterventionDialog';
import InterventionsList from '@/components/interventions/InterventionsList';
import InterventionsSidebar from '@/components/interventions/InterventionsSidebar';
import { Intervention, InterventionFormValues } from '@/types/Intervention';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { interventionService } from '@/services/supabase/interventionService';

const Interventions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('all');
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isNewInterventionDialogOpen, setIsNewInterventionDialogOpen] = useState(false);
  
  // Fetch interventions on component mount
  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        setIsLoading(true);
        const data = await interventionService.getInterventions();
        setInterventions(data);
      } catch (error) {
        console.error('Error fetching interventions:', error);
        toast.error('Erreur lors du chargement des interventions');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInterventions();
  }, []);
  
  // Filter interventions based on search term and current view
  const filteredInterventions = interventions.filter(intervention => {
    const matchesSearch = 
      intervention.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intervention.equipment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intervention.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intervention.technician.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (currentView === 'all') return matchesSearch;
    return matchesSearch && intervention.status === currentView;
  }).sort((a, b) => b.date.getTime() - a.date.getTime());

  // Handle viewing details
  const handleViewDetails = (intervention: Intervention) => {
    setSelectedIntervention(intervention);
    setIsDetailsDialogOpen(true);
  };

  // Handle starting work on an intervention
  const handleStartWork = (intervention: Intervention) => {
    handleUpdateStatus(intervention.id, 'in-progress');
  };

  // Handle updating an intervention status
  const handleUpdateStatus = async (interventionId: number, status: 'scheduled' | 'in-progress' | 'completed' | 'canceled') => {
    try {
      await interventionService.updateInterventionStatus(interventionId, status);
      
      setInterventions(interventions.map(intervention => 
        intervention.id === interventionId ? {
          ...intervention,
          status,
          ...(status === 'completed' ? { duration: intervention.scheduledDuration } : {})
        } : intervention
      ));
      
      toast.success("Status updated", {
        description: `Intervention status has been updated to ${status}`
      });
    } catch (error) {
      console.error('Error updating intervention status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  // Handle creating a new intervention
  const handleCreateIntervention = async (formData: InterventionFormValues) => {
    try {
      const newIntervention = await interventionService.addIntervention(formData);
      setInterventions([newIntervention, ...interventions]);
      setIsNewInterventionDialogOpen(false);
      
      toast.success("Intervention created", {
        description: `New intervention "${formData.title}" has been created`
      });
    } catch (error) {
      console.error('Error creating intervention:', error);
      toast.error('Erreur lors de la création de l\'intervention');
    }
  };

  // Handle clearing search
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        
        <div className="flex-1 w-full">
          <div className="pt-6 pb-16 px-4 sm:px-8 md:px-12">
            <div className="max-w-7xl mx-auto">
              <header className="mb-8 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="chip chip-primary mb-2">Field Operations</div>
                    <h1 className="text-3xl font-medium tracking-tight mb-1">Field Interventions</h1>
                    <p className="text-muted-foreground">
                      Track and manage equipment interventions across your fields
                    </p>
                  </div>
                  
                  <div className="mt-4 sm:mt-0">
                    <Button 
                      className="gap-2"
                      onClick={() => setIsNewInterventionDialogOpen(true)}
                    >
                      <Plus size={16} />
                      <span>New Intervention</span>
                    </Button>
                  </div>
                </div>
              </header>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <BlurContainer className="p-4 mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input 
                        placeholder="Search interventions by title, equipment, location..." 
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </BlurContainer>
                  
                  <Tabs defaultValue="all" className="mb-6" value={currentView} onValueChange={setCurrentView}>
                    <TabsList>
                      <TabsTrigger value="all">All Interventions</TabsTrigger>
                      <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                      <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                      <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                    
                    <InterventionsList 
                      filteredInterventions={filteredInterventions}
                      currentView={currentView}
                      onClearSearch={handleClearSearch}
                      onViewDetails={handleViewDetails}
                      onStartWork={handleStartWork}
                    />
                  </Tabs>
                </div>
                
                <InterventionsSidebar 
                  interventions={interventions}
                  onViewDetails={handleViewDetails}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dialogs */}
      <InterventionDetailsDialog 
        intervention={selectedIntervention}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        onStatusChange={handleUpdateStatus}
      />
      
      <NewInterventionDialog 
        open={isNewInterventionDialogOpen}
        onOpenChange={setIsNewInterventionDialogOpen}
        onSubmit={handleCreateIntervention}
      />
    </SidebarProvider>
  );
};

export default Interventions;
