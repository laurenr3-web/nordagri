
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Tag, 
  BarChart3, 
  Wrench, 
  AlertTriangle
} from 'lucide-react';

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
}

const EquipmentDetails: React.FC<EquipmentDetailsProps> = ({ equipment }) => {
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

      <div>
        <h2 className="text-2xl font-semibold">{equipment.name}</h2>
        <p className="text-muted-foreground">{equipment.manufacturer} • {equipment.model} • {equipment.year}</p>
      </div>

      <Separator />
      
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

      <div className="pt-4">
        <h3 className="text-sm text-muted-foreground mb-2">Equipment Status</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 p-4 bg-secondary/50 rounded-md text-center">
            <BarChart3 size={20} className="mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium">Performance Analysis</p>
          </div>
          <div className="flex-1 p-4 bg-secondary/50 rounded-md text-center">
            <Wrench size={20} className="mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium">Maintenance History</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetails;
