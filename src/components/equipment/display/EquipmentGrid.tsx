
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { Tractor, TractorIcon, Truck, Cog, BarChart, ChevronRight } from 'lucide-react';

interface EquipmentItem {
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
  nextService: { type: string; due: string };
}

interface EquipmentGridProps {
  equipment: EquipmentItem[];
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  handleEquipmentClick: (equipment: EquipmentItem) => void;
}

const EquipmentGrid: React.FC<EquipmentGridProps> = ({
  equipment,
  getStatusColor,
  getStatusText,
  handleEquipmentClick
}) => {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {equipment.map((item, index) => (
        <BlurContainer 
          key={item.id} 
          className="overflow-hidden animate-scale-in cursor-pointer"
          style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
          raised
          onClick={() => handleEquipmentClick(item)}
        >
          <div className="aspect-video relative overflow-hidden">
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute top-2 right-2">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                {getStatusText(item.status)}
              </span>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  {getEquipmentIcon(item.type)}
                </div>
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.manufacturer} • {item.model}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
              <div>
                <p className="text-muted-foreground">Serial Number</p>
                <p className="font-medium">{item.serialNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Year</p>
                <p className="font-medium">{item.year}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="font-medium">{item.location}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Usage</p>
                <p className="font-medium">{item.usage?.hours || 0} hrs</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Next:</span> {item.nextService?.type || 'N/A'}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 px-2 gap-1" onClick={(e) => {
                  e.stopPropagation();
                  handleEquipmentClick(item);
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
  );
};

export default EquipmentGrid;
