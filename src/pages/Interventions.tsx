
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import InterventionDetailsDialog from '@/components/interventions/InterventionDetailsDialog';
import NewInterventionDialog from '@/components/interventions/NewInterventionDialog';
import InterventionsList from '@/components/interventions/InterventionsList';
import InterventionsSidebar from '@/components/interventions/InterventionsSidebar';
import { Intervention, InterventionFormValues } from '@/types/Intervention';
import { interventionsData } from '@/components/interventions/utils/interventionUtils';

const Interventions = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('all');
  const [interventions, setInterventions] = useState<Intervention[]>(interventionsData);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isNewInterventionDialogOpen, setIsNewInterventionDialogOpen] = useState(false);
  
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
  const handleUpdateStatus = (interventionId: number, status: 'scheduled' | 'in-progress' | 'completed' | 'canceled') => {
    setInterventions(interventions.map(intervention => 
      intervention.id === interventionId ? {
        ...intervention,
        status,
        ...(status === 'completed' ? { duration: intervention.scheduledDuration } : {})
      } : intervention
    ));
    
    toast({
      title: "Status updated",
      description: `Intervention status has been updated to ${status}`,
    });
  };

  // Handle creating a new intervention
  const handleCreateIntervention = (formData: InterventionFormValues) => {
    const newIntervention: Intervention = {
      id: interventions.length > 0 ? Math.max(...interventions.map(i => i.id)) + 1 : 1,
      ...formData,
      coordinates: {
        lat: 34.052235,
        lng: -118.243683
      },
      status: 'scheduled',
      partsUsed: [],
    };
    
    setInterventions([newIntervention, ...interventions]);
    setIsNewInterventionDialogOpen(false);
    
    toast({
      title: "Intervention created",
      description: `New intervention "${formData.title}" has been created`,
    });
  };

  // Handle clearing search
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-6 pb-16 pl-4 pr-4 sm:pl-8 sm:pr-8 md:pl-12 md:pr-12 ml-0 md:ml-64">
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
    </div>
  );
};

export default Interventions;
