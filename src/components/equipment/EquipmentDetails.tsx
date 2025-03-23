
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Tag, 
  BarChart3, 
  Wrench, 
  AlertTriangle,
  Pencil,
  History,
  Activity
} from 'lucide-react';
import EditEquipmentDialog from './dialogs/EditEquipmentDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EquipmentHistory from './tabs/EquipmentHistory';
import EquipmentPerformance from './tabs/EquipmentPerformance';

interface EquipmentDetailsProps {
  equipment: {
    id: number;
    name: string;
    type: string;
    category: string;
    manufacturer: string;
    model: string;
    year: number;
    status: string;
    location: string;
    lastMaintenance: string;
    image: string;
    usage: { hours: number; target: number };
    serialNumber: string;
    purchaseDate: string;
    nextService?: { type: string; due: string };
  };
  onUpdate?: (updatedEquipment: any) => void;
}

const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({ equipment, onUpdate }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const usagePercentage = Math.round((equipment.usage.hours / equipment.usage.target) * 100);

  const handleEquipmentUpdate = (updatedEquipment: any) => {
    if (onUpdate) {
      onUpdate(updatedEquipment);
    }
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="relative aspect-video overflow-hidden rounded-md">
        <img 
          src={equipment.image} 
          alt={equipment.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge className={getStatusColor(equipment.status)}>
            {getStatusText(equipment.status)}
          </Badge>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">{equipment.name}</h2>
          <p className="text-muted-foreground">{equipment.manufacturer} • {equipment.model} • {equipment.year}</p>
        </div>
        <Button 
          onClick={() => setIsEditDialogOpen(true)} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
        >
          <Pencil size={16} />
          Modifier
        </Button>
      </div>

      <Separator />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start mb-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History size={16} />
            Historique
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-1">
            <Activity size={16} />
            Performance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-muted-foreground">Equipment Type</h3>
                <p className="font-medium flex items-center gap-2">
                  <Tag size={16} className="text-muted-foreground" />
                  {equipment.type}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm text-muted-foreground">Serial Number</h3>
                <p className="font-medium">{equipment.serialNumber}</p>
              </div>
              
              <div>
                <h3 className="text-sm text-muted-foreground">Current Location</h3>
                <p className="font-medium flex items-center gap-2">
                  <MapPin size={16} className="text-muted-foreground" />
                  {equipment.location}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm text-muted-foreground">Purchase Date</h3>
                <p className="font-medium flex items-center gap-2">
                  <Calendar size={16} className="text-muted-foreground" />
                  {formatDate(equipment.purchaseDate)}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm text-muted-foreground">Usage</h3>
                <p className="font-medium flex items-center gap-2">
                  <Clock size={16} className="text-muted-foreground" />
                  {equipment.usage.hours} / {equipment.usage.target} hours
                </p>
                <div className="w-full bg-secondary rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm text-muted-foreground">Last Maintenance</h3>
                <p className="font-medium flex items-center gap-2">
                  <Wrench size={16} className="text-muted-foreground" />
                  {formatDate(equipment.lastMaintenance)}
                </p>
              </div>
              
              {equipment.nextService && (
                <div>
                  <h3 className="text-sm text-muted-foreground">Next Service</h3>
                  <div className="flex items-center gap-2 font-medium">
                    <AlertTriangle size={16} className={equipment.nextService.due.includes('Overdue') ? 'text-destructive' : 'text-harvest-500'} />
                    <span>{equipment.nextService.type}</span>
                    <span className="text-muted-foreground">({equipment.nextService.due})</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <EquipmentHistory equipment={equipment} />
        </TabsContent>
        
        <TabsContent value="performance">
          <EquipmentPerformance equipment={equipment} />
        </TabsContent>
      </Tabs>
      
      {/* Edit Equipment Dialog */}
      {isEditDialogOpen && (
        <EditEquipmentDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          equipment={equipment}
          onSubmit={handleEquipmentUpdate}
        />
      )}
    </div>
  );
};

export default EquipmentDetails;
