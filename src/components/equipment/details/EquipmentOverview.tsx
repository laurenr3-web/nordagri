
import React from 'react';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Tag, 
  Wrench, 
  AlertTriangle 
} from 'lucide-react';

interface EquipmentOverviewProps {
  equipment: EquipmentItem;
}

const EquipmentOverview: React.FC<EquipmentOverviewProps> = ({ equipment }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate usage percentage safely with optional chaining
  const usagePercentage = equipment.usage 
    ? Math.round((equipment.usage.hours / equipment.usage.target) * 100)
    : 0;

  return (
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
            {equipment.usage ? `${equipment.usage.hours} / ${equipment.usage.target} hours` : 'No usage data'}
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
  );
};

export default EquipmentOverview;
