
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search,
  CheckCircle2,
  Clock,
  X,
  MapPin,
  User,
  CalendarCheck,
  Wrench
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import InterventionDetailsDialog from '@/components/interventions/InterventionDetailsDialog';
import NewInterventionDialog from '@/components/interventions/NewInterventionDialog';

// Define type for our intervention
export interface Intervention {
  id: number;
  title: string;
  equipment: string;
  equipmentId: number;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: 'scheduled' | 'in-progress' | 'completed' | 'canceled';
  priority: 'high' | 'medium' | 'low';
  date: Date;
  duration?: number;
  scheduledDuration?: number;
  technician: string;
  description: string;
  partsUsed: Array<{ id: number; name: string; quantity: number; }>;
  notes: string;
}

// Define type for the form values
interface InterventionFormValues {
  title: string;
  equipment: string;
  equipmentId: number;
  location: string;
  priority: 'high' | 'medium' | 'low';
  date: Date;
  scheduledDuration: number;
  technician: string;
  description: string;
  notes: string;
}

// Sample field interventions data with properly typed status
const interventionsData: Intervention[] = [
  {
    id: 1,
    title: 'Emergency Repair - Hydraulic System',
    equipment: 'John Deere 8R 410',
    equipmentId: 1,
    location: 'North Field',
    coordinates: {
      lat: 34.052235,
      lng: -118.243683
    },
    status: 'completed',
    priority: 'high',
    date: new Date(2023, 5, 5),
    duration: 3.5,
    technician: 'Michael Torres',
    description: 'Hydraulic hose burst during operation. Emergency repair performed on-site.',
    partsUsed: [
      { id: 101, name: 'Hydraulic Hose 3/4"', quantity: 1 },
      { id: 102, name: 'Quick Connect Fitting', quantity: 2 }
    ],
    notes: 'Recommend full hydraulic system inspection during next scheduled maintenance.'
  },
  {
    id: 2,
    title: 'Harvester Setup Configuration',
    equipment: 'Case IH Axial-Flow',
    equipmentId: 2,
    location: 'East Field',
    coordinates: {
      lat: 34.056235,
      lng: -118.253683
    },
    status: 'in-progress',
    priority: 'medium',
    date: new Date(2023, 5, 10),
    scheduledDuration: 4,
    technician: 'Sarah Johnson',
    description: 'Pre-harvest setup and calibration for wheat harvesting season.',
    partsUsed: [],
    notes: 'Calibration needs to be completed before June 15.'
  },
  {
    id: 3,
    title: 'Starter Motor Replacement',
    equipment: 'Kubota M7-172',
    equipmentId: 3,
    location: 'Workshop',
    coordinates: {
      lat: 34.050235,
      lng: -118.233683
    },
    status: 'scheduled',
    priority: 'medium',
    date: new Date(2023, 5, 12),
    scheduledDuration: 2,
    technician: 'David Chen',
    description: 'Starter motor showing signs of failure. Preventive replacement before field work.',
    partsUsed: [],
    notes: 'Part ordered and expected to arrive June 11.'
  },
  {
    id: 4,
    title: 'GPS Precision Calibration',
    equipment: 'John Deere 8R 410',
    equipmentId: 1,
    location: 'South Field',
    coordinates: {
      lat: 34.048235,
      lng: -118.263683
    },
    status: 'scheduled',
    priority: 'low',
    date: new Date(2023, 5, 15),
    scheduledDuration: 2,
    technician: 'Sarah Johnson',
    description: 'Annual GPS calibration for precision farming systems.',
    partsUsed: [],
    notes: 'Calibration equipment needs to be brought from main office.'
  },
  {
    id: 5,
    title: 'Tire Pressure Adjustments',
    equipment: 'New Holland T6.180',
    equipmentId: 5,
    location: 'West Field',
    coordinates: {
      lat: 34.062235,
      lng: -118.273683
    },
    status: 'completed',
    priority: 'low',
    date: new Date(2023, 5, 8),
    duration: 1,
    technician: 'Michael Torres',
    description: 'Adjustment of tire pressure for optimal field conditions.',
    partsUsed: [],
    notes: 'All tires now set to manufacturer recommended PSI for current soil conditions.'
  },
  {
    id: 6,
    title: 'Transmission Diagnostic',
    equipment: 'Fendt 942 Vario',
    equipmentId: 6,
    location: 'Central Field',
    coordinates: {
      lat: 34.049235,
      lng: -118.253683
    },
    status: 'canceled',
    priority: 'high',
    date: new Date(2023, 5, 7),
    scheduledDuration: 3,
    technician: 'David Chen',
    description: 'Investigate reported transmission slipping issue.',
    partsUsed: [],
    notes: 'Intervention canceled - equipment needed for urgent field operation. Rescheduled for June 14.'
  },
  {
    id: 7,
    title: 'Air Conditioning Repair',
    equipment: 'Massey Ferguson 8S.245',
    equipmentId: 4,
    location: 'East Field',
    coordinates: {
      lat: 34.058235,
      lng: -118.243683
    },
    status: 'completed',
    priority: 'medium',
    date: new Date(2023, 5, 6),
    duration: 2.5,
    technician: 'Sarah Johnson',
    description: 'Cabin AC not cooling properly. Refrigerant leak suspected.',
    partsUsed: [
      { id: 103, name: 'AC Refrigerant R134a', quantity: 1 },
      { id: 104, name: 'O-Ring Seal Kit', quantity: 1 }
    ],
    notes: 'Leak found and sealed. System recharged and working properly.'
  },
  {
    id: 8,
    title: 'Fuel System Cleaning',
    equipment: 'John Deere 8R 410',
    equipmentId: 1,
    location: 'Workshop',
    coordinates: {
      lat: 34.052235,
      lng: -118.243683
    },
    status: 'scheduled',
    priority: 'medium',
    date: new Date(2023, 5, 18),
    scheduledDuration: 3,
    technician: 'Michael Torres',
    description: 'Scheduled fuel system cleaning and injector service.',
    partsUsed: [],
    notes: 'Part of seasonal maintenance program.'
  }
];

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

  // Helper function to format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Helper function for status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge variant="outline" className="bg-secondary flex items-center gap-1 text-muted-foreground">
            <CalendarCheck size={12} />
            <span>Scheduled</span>
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge className="bg-harvest-100 text-harvest-800 flex items-center gap-1">
            <Clock size={12} />
            <span>In Progress</span>
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-agri-100 text-agri-800 flex items-center gap-1">
            <CheckCircle2 size={12} />
            <span>Completed</span>
          </Badge>
        );
      case 'canceled':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 flex items-center gap-1">
            <X size={12} />
            <span>Canceled</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-secondary text-muted-foreground">
            {status}
          </Badge>
        );
    }
  };
  
  // Helper function for priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <Badge className="bg-red-100 text-red-800">High</Badge>
        );
      case 'medium':
        return (
          <Badge className="bg-harvest-100 text-harvest-800">Medium</Badge>
        );
      case 'low':
        return (
          <Badge className="bg-agri-100 text-agri-800">Low</Badge>
        );
      default:
        return (
          <Badge variant="outline">{priority}</Badge>
        );
    }
  };

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
  
  // Intervention card component
  const InterventionCard = ({ intervention }: { intervention: Intervention }) => (
    <BlurContainer 
      key={intervention.id}
      className="mb-6 animate-fade-in overflow-hidden"
    >
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="font-medium text-lg leading-tight mb-1">{intervention.title}</h3>
            <div className="flex flex-wrap items-center gap-2 text-muted-foreground text-sm">
              <span>{intervention.equipment}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{intervention.location}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {getStatusBadge(intervention.status)}
            {getPriorityBadge(intervention.priority)}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Date</p>
            <p className="font-medium">{formatDate(intervention.date)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Duration</p>
            <p className="font-medium">
              {intervention.status === 'completed' && intervention.duration ? 
                `${intervention.duration} hrs (Actual)` : 
                `${intervention.scheduledDuration} hrs (Scheduled)`
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Technician</p>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                <User size={14} className="text-primary" />
              </div>
              <p className="font-medium">{intervention.technician}</p>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-1">Description</p>
          <p className="text-sm">{intervention.description}</p>
        </div>
        
        {intervention.partsUsed && intervention.partsUsed.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Parts Used</p>
            <div className="bg-secondary/50 p-3 rounded-md">
              {intervention.partsUsed.map((part, index) => (
                <div key={part.id} className={`flex justify-between text-sm ${index > 0 ? 'mt-2' : ''}`}>
                  <span>{part.name}</span>
                  <span className="font-medium">Qty: {part.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {intervention.notes && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Notes</p>
            <p className="text-sm italic">{intervention.notes}</p>
          </div>
        )}
        
        <div className="flex justify-end gap-2">
          {intervention.status === 'scheduled' && (
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={() => handleStartWork(intervention)}
            >
              <Wrench size={16} />
              <span>Start Work</span>
            </Button>
          )}
          <Button 
            className="gap-1"
            onClick={() => handleViewDetails(intervention)}
          >
            <span>Details</span>
          </Button>
        </div>
      </div>
    </BlurContainer>
  );

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
                
                <TabsContent value="all" className="mt-6 space-y-4">
                  {filteredInterventions.length > 0 ? (
                    filteredInterventions.map(intervention => (
                      <InterventionCard key={intervention.id} intervention={intervention} />
                    ))
                  ) : (
                    <BlurContainer className="p-8 text-center">
                      <p className="text-muted-foreground">No interventions found matching your search criteria.</p>
                      <Button variant="link" onClick={() => setSearchTerm('')}>
                        Clear search
                      </Button>
                    </BlurContainer>
                  )}
                </TabsContent>
                
                <TabsContent value="scheduled" className="mt-6 space-y-4">
                  {filteredInterventions.length > 0 ? (
                    filteredInterventions.map(intervention => (
                      <InterventionCard key={intervention.id} intervention={intervention} />
                    ))
                  ) : (
                    <BlurContainer className="p-8 text-center">
                      <p className="text-muted-foreground">No scheduled interventions found.</p>
                    </BlurContainer>
                  )}
                </TabsContent>
                
                <TabsContent value="in-progress" className="mt-6 space-y-4">
                  {filteredInterventions.length > 0 ? (
                    filteredInterventions.map(intervention => (
                      <InterventionCard key={intervention.id} intervention={intervention} />
                    ))
                  ) : (
                    <BlurContainer className="p-8 text-center">
                      <p className="text-muted-foreground">No interventions currently in progress.</p>
                    </BlurContainer>
                  )}
                </TabsContent>
                
                <TabsContent value="completed" className="mt-6 space-y-4">
                  {filteredInterventions.length > 0 ? (
                    filteredInterventions.map(intervention => (
                      <InterventionCard key={intervention.id} intervention={intervention} />
                    ))
                  ) : (
                    <BlurContainer className="p-8 text-center">
                      <p className="text-muted-foreground">No completed interventions found.</p>
                    </BlurContainer>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="space-y-6">
              <BlurContainer className="p-4">
                <h3 className="font-medium mb-4">Upcoming Interventions</h3>
                <div className="space-y-4">
                  {interventions
                    .filter(intervention => intervention.status === 'scheduled')
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .slice(0, 3)
                    .map((intervention) => (
                      <div 
                        key={intervention.id} 
                        className="flex items-start gap-3 pb-3 border-b last:border-0 cursor-pointer hover:bg-secondary/20 p-2 rounded-md transition-colors"
                        onClick={() => handleViewDetails(intervention)}
                      >
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center
                          ${intervention.priority === 'high' ? 'bg-red-100 text-red-800' : 
                            intervention.priority === 'medium' ? 'bg-harvest-100 text-harvest-800' : 
                            'bg-agri-100 text-agri-800'}`}>
                          <Wrench size={20} />
                        </div>
                        <div>
                          <h4 className="font-medium">{intervention.title}</h4>
                          <p className="text-sm text-muted-foreground mb-1">{intervention.equipment}</p>
                          <p className="text-xs">Date: {formatDate(intervention.date)}</p>
                        </div>
                      </div>
                    ))
                  }
                  
                  {interventions.filter(i => i.status === 'scheduled').length === 0 && (
                    <p className="text-sm text-muted-foreground">No upcoming interventions scheduled.</p>
                  )}
                </div>
              </BlurContainer>
              
              <BlurContainer className="p-4">
                <h3 className="font-medium mb-4">Intervention Statistics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Total Interventions</span>
                    <span className="font-medium">{interventions.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Scheduled</span>
                    <span className="font-medium">{interventions.filter(i => i.status === 'scheduled').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>In Progress</span>
                    <span className="font-medium">{interventions.filter(i => i.status === 'in-progress').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Completed</span>
                    <span className="font-medium">{interventions.filter(i => i.status === 'completed').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Canceled</span>
                    <span className="font-medium">{interventions.filter(i => i.status === 'canceled').length}</span>
                  </div>
                </div>
              </BlurContainer>
              
              <BlurContainer className="p-4">
                <h3 className="font-medium mb-4">By Equipment</h3>
                <div className="space-y-3">
                  {Object.entries(
                    interventions.reduce((acc, intervention) => {
                      acc[intervention.equipment] = (acc[intervention.equipment] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).sort((a, b) => b[1] - a[1]).map(([equipment, count]) => (
                    <div key={equipment} className="flex items-center justify-between">
                      <span className="truncate max-w-[75%]">{equipment}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </BlurContainer>
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
    </div>
  );
};

export default Interventions;
