
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface EquipmentUsage {
  hours: number;
  target: number;
}

interface NextService {
  type: string;
  due: string;
}

interface EquipmentCardProps {
  name: string;
  type: string;
  image: string;
  status: 'operational' | 'maintenance' | 'repair' | 'inactive';
  usage?: EquipmentUsage;
  nextService?: NextService;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ 
  name, 
  type, 
  image, 
  status, 
  usage, 
  nextService,
  onClick,
  className = "",
  style 
}) => {
  // Calculate usage percentage for progress bar
  const usagePercentage = usage ? Math.min(Math.round((usage.hours / usage.target) * 100), 100) : 0;
  
  // Determine if maintenance is overdue
  const isOverdue = nextService?.due.includes('retard');
  const isUpcoming = nextService?.due.includes('jours') || nextService?.due.includes('demain');

  // Select progress bar color based on usage
  const progressColor = usagePercentage > 90 ? 'bg-orange-500' : 'bg-emerald-500';

  return (
    <Card 
      className={`bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300 equipment-card ${className}`}
      style={{
        ...style,
      }}
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-32 object-cover"
          onError={(e) => {
            // Fallback image if the provided one fails to load
            e.currentTarget.src = "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop";
          }}
        />
        <div className="absolute top-2 right-2">
          <Badge 
            className={`${
              status === 'operational' ? 'bg-green-100 text-green-800' :
              status === 'maintenance' ? 'bg-blue-100 text-blue-800' :
              status === 'repair' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            } rounded-md`}
          >
            {status === 'operational' && 'Opérationnel'}
            {status === 'maintenance' && 'Maintenance'}
            {status === 'repair' && 'Réparation'}
            {status === 'inactive' && 'Inactif'}
          </Badge>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-lg mb-1 truncate">{name}</h3>
        <p className="text-muted-foreground text-sm mb-4">{type}</p>
        
        {usage && (
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1.5">
              <span>Utilisation</span>
              <span>{usage.hours} / {usage.target} hrs</span>
            </div>
            <Progress 
              value={usagePercentage} 
              className="h-2 rounded-full bg-gray-100" 
              indicatorClassName={progressColor}
            />
          </div>
        )}
        
        {nextService && (
          <div className="flex items-center gap-1.5 text-sm mt-3">
            {isOverdue ? (
              <AlertTriangle size={16} className="text-red-500" />
            ) : isUpcoming ? (
              <Clock size={16} className="text-orange-500" /> 
            ) : (
              <CheckCircle size={16} className="text-green-500" />
            )}
            <span className={`
              ${isOverdue ? 'text-red-600' : isUpcoming ? 'text-orange-600' : 'text-green-600'}
            `}>
              {nextService.due}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
