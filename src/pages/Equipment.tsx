import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, 
  Plus, 
  Filter, 
  SlidersHorizontal, 
  Tractor, 
  TractorIcon,
  Truck, 
  Cog, 
  BarChart,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import EquipmentForm from '@/components/equipment/EquipmentForm';
import EquipmentDetails from '@/components/equipment/EquipmentDetails';
import { toast } from '@/hooks/use-toast';

// Sample data
const initialEquipmentData = [
  {
    id: 1,
    name: 'John Deere 8R 410',
    type: 'Tractor',
    category: 'heavy',
    manufacturer: 'John Deere',
    model: '8R 410',
    year: 2022,
    status: 'operational',
    location: 'North Field',
    lastMaintenance: '2023-05-15',
    image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop',
    usage: { hours: 342, target: 500 },
    serialNumber: 'JD8R410-22-7834',
    purchaseDate: '2022-03-12',
    nextService: { type: 'Filter Change', due: 'In 3 weeks' }
  },
  {
    id: 2,
    name: 'Case IH Axial-Flow',
    type: 'Harvester',
    category: 'heavy',
    manufacturer: 'Case IH',
    model: 'Axial-Flow 250',
    year: 2021,
    status: 'maintenance',
    location: 'East Field',
    lastMaintenance: '2023-04-22',
    image: 'https://images.unsplash.com/photo-1599033329459-cc8c31c7eb6c?q=80&w=500&auto=format&fit=crop',
    usage: { hours: 480, target: 500 },
    serialNumber: 'CIAF250-21-4532',
    purchaseDate: '2021-06-18',
    nextService: { type: 'Full Service', due: 'In 2 days' }
  },
  {
    id: 3,
    name: 'Kubota M7-172',
    type: 'Tractor',
    category: 'medium',
    manufacturer: 'Kubota',
    model: 'M7-172',
    year: 2020,
    status: 'repair',
    location: 'Workshop',
    lastMaintenance: '2023-03-05',
    image: 'https://images.unsplash.com/photo-1585911171167-1f66ea3de00c?q=80&w=500&auto=format&fit=crop',
    usage: { hours: 620, target: 500 },
    serialNumber: 'KM7172-20-9876',
    purchaseDate: '2020-11-23',
    nextService: { type: 'Engine Check', due: 'Overdue' }
  },
  {
    id: 4,
    name: 'Massey Ferguson 8S.245',
    type: 'Tractor',
    category: 'heavy',
    manufacturer: 'Massey Ferguson',
    model: '8S.245',
    year: 2023,
    status: 'operational',
    location: 'South Field',
    lastMaintenance: '2023-05-30',
    image: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?q=80&w=500&auto=format&fit=crop',
    usage: { hours: 120, target: 500 },
    serialNumber: 'MF8S245-23-2341',
    purchaseDate: '2023-02-15',
    nextService: { type: 'First Service', due: 'In 1 month' }
  },
  {
    id: 5,
    name: 'New Holland T6.180',
    type: 'Tractor',
    category: 'medium',
    manufacturer: 'New Holland',
    model: 'T6.180',
    year: 2021,
    status: 'operational',
    location: 'West Field',
    lastMaintenance: '2023-04-15',
    image: 'https://images.unsplash.com/photo-1590599145244-e577fa879033?q=80&w=500&auto=format&fit=crop',
    usage: { hours: 356, target: 500 },
    serialNumber: 'NHT6180-21-6543',
    purchaseDate: '2021-05-10',
    nextService: { type: 'Oil Change', due: 'In 2 weeks' }
  },
  {
    id: 6,
    name: 'Fendt 942 Vario',
    type: 'Tractor',
    category: 'heavy',
    manufacturer: 'Fendt',
    model: '942 Vario',
    year: 2022,
    status: 'maintenance',
    location: 'Workshop',
    lastMaintenance: '2023-02-28',
    image: 'https://images.unsplash.com/photo-1581381236742-2489aa307e6e?q=80&w=500&auto=format&fit=crop',
    usage: { hours: 410, target: 500 },
    serialNumber: 'F942V-22-8765',
    purchaseDate: '2022-01-20',
    nextService: { type: 'Transmission Check', due: 'Tomorrow' }
  }
];

const Equipment = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [equipmentData, setEquipmentData] = useState(initialEquipmentData);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<typeof initialEquipmentData[0] | null>(null);
  
  // Filter equipment based on search term and category
  const filteredEquipment = equipmentData.filter(equipment => {
    const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || equipment.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddEquipment = (data: any) => {
    const newEquipment = {
      id: equipmentData.length + 1,
      name: data.name,
      type: data.type,
      category: data.category,
      manufacturer: data.manufacturer,
      model: data.model,
      year: parseInt(data.year),
      status: data.status,
      location: data.location,
      lastMaintenance: new Date().toISOString().split('T')[0],
      image: data.image,
      usage: { hours: 0, target: 500 },
      serialNumber: data.serialNumber,
      purchaseDate: data.purchaseDate,
      nextService: { type: 'First Service', due: 'In 1 month' }
    };
    
    setEquipmentData([...equipmentData, newEquipment]);
    setIsAddDialogOpen(false);
    toast({
      title: "Equipment added",
      description: `${data.name} has been added to your equipment list.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-agri-100 text-agri-800';
      case 'maintenance':
        return 'bg-harvest-100 text-harvest-800';
      case 'repair':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-secondary text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'operational':
        return 'Operational';
      case 'maintenance':
        return 'In Maintenance';
      case 'repair':
        return 'Needs Repair';
      default:
        return status;
    }
  };

  const getEquipmentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'tractor':
        return <Tractor className="h-5 w-5" />;
      case 'harvester':
        return <TractorIcon className="h-5 w-5" />;
      case 'truck':
        return <Truck className="h-5 w-5" />;
      default:
        return <Cog className="h-5 w-5" />;
    }
  };

  const handleEquipmentClick = (equipment: typeof initialEquipmentData[0]) => {
    setSelectedEquipment(equipment);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-6 pb-16 pl-4 pr-4 sm:pl-8 sm:pr-8 md:pl-12 md:pr-12 ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="chip chip-primary mb-2">Equipment Fleet</div>
                <h1 className="text-3xl font-medium tracking-tight mb-1">Farm Equipment</h1>
                <p className="text-muted-foreground">
                  Monitor and manage your agricultural machinery
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus size={16} />
                  <span>Add Equipment</span>
                </Button>
              </div>
            </div>
          </header>
          
          <BlurContainer className="p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search equipment, manufacturer, model..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2" size="sm">
                  <Filter size={16} />
                  <span>Filter</span>
                </Button>
                <Button variant="outline" className="gap-2" size="sm">
                  <SlidersHorizontal size={16} />
                  <span>Sort</span>
                </Button>
                <Button variant="outline" size="icon" className={currentView === 'grid' ? 'bg-secondary' : ''} onClick={() => setCurrentView('grid')}>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 2H6.5V6.5H2V2ZM2 8.5H6.5V13H2V8.5ZM8.5 2H13V6.5H8.5V2ZM8.5 8.5H13V13H8.5V8.5Z" fill="currentColor"/>
                  </svg>
                </Button>
                <Button variant="outline" size="icon" className={currentView === 'list' ? 'bg-secondary' : ''} onClick={() => setCurrentView('list')}>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 3H13V5H2V3ZM2 7H13V9H2V7ZM2 11H13V13H2V11Z" fill="currentColor"/>
                  </svg>
                </Button>
              </div>
            </div>
          </BlurContainer>
          
          <Tabs defaultValue="all" className="mb-6" value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList>
              <TabsTrigger value="all">All Equipment</TabsTrigger>
              <TabsTrigger value="heavy">Heavy Machinery</TabsTrigger>
              <TabsTrigger value="medium">Medium Machinery</TabsTrigger>
              <TabsTrigger value="light">Light Equipment</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {currentView === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEquipment.map((equipment, index) => (
                <BlurContainer 
                  key={equipment.id} 
                  className="overflow-hidden animate-scale-in cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
                  raised
                  onClick={() => handleEquipmentClick(equipment)}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={equipment.image} 
                      alt={equipment.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(equipment.status)}`}>
                        {getStatusText(equipment.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                          {getEquipmentIcon(equipment.type)}
                        </div>
                        <div>
                          <h3 className="font-medium">{equipment.name}</h3>
                          <p className="text-sm text-muted-foreground">{equipment.manufacturer} • {equipment.model}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Serial Number</p>
                        <p className="font-medium">{equipment.serialNumber}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Year</p>
                        <p className="font-medium">{equipment.year}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium">{equipment.location}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Usage</p>
                        <p className="font-medium">{equipment.usage.hours} hrs</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Next:</span> {equipment.nextService.type}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8 px-2 gap-1" onClick={(e) => {
                          e.stopPropagation();
                          handleEquipmentClick(equipment);
                        }}>
                          <span>Details</span>
                          <ChevronRight size={14} />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 px-2">
                          <BarChart size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </BlurContainer>
              ))}
            </div>
          ) : (
            <BlurContainer className="overflow-hidden rounded-lg animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary/50">
                      <th className="text-left p-3 font-medium">Equipment</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Manufacturer</th>
                      <th className="text-left p-3 font-medium">Serial Number</th>
                      <th className="text-left p-3 font-medium">Year</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Location</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredEquipment.map((equipment) => (
                      <tr key={equipment.id} className="hover:bg-secondary/30">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-md overflow-hidden flex-shrink-0">
                              <img 
                                src={equipment.image} 
                                alt={equipment.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-medium">{equipment.name}</span>
                          </div>
                        </td>
                        <td className="p-3">{equipment.type}</td>
                        <td className="p-3">{equipment.manufacturer}</td>
                        <td className="p-3">{equipment.serialNumber}</td>
                        <td className="p-3">{equipment.year}</td>
                        <td className="p-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(equipment.status)}`}>
                            {getStatusText(equipment.status)}
                          </span>
                        </td>
                        <td className="p-3">{equipment.location}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 px-2 gap-1"
                              onClick={() => handleEquipmentClick(equipment)}
                            >
                              <span>Details</span>
                              <ExternalLink size={14} />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <BarChart size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </BlurContainer>
          )}
          
          {filteredEquipment.length === 0 && (
            <div className="mt-10 text-center">
              <p className="text-muted-foreground">No equipment found matching your criteria.</p>
              <Button variant="link" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
                Reset filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Equipment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Equipment</DialogTitle>
          </DialogHeader>
          <EquipmentForm 
            onSubmit={handleAddEquipment}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Equipment Details Dialog */}
      <Dialog open={!!selectedEquipment} onOpenChange={(open) => !open && setSelectedEquipment(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Equipment Details</DialogTitle>
          </DialogHeader>
          {selectedEquipment && <EquipmentDetails equipment={selectedEquipment} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Equipment;
