import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Clock, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  compact?: boolean;
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
  style,
  compact = false
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'maintenance': return <Wrench className="h-4 w-4 text-blue-500" />;
      case 'repair': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'repair': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isOverdue = nextService?.due.includes('retard') || nextService?.due.includes('Overdue');
  const isUpcoming = nextService?.due.includes('jours') || nextService?.due.includes('demain') || nextService?.due.includes('semaine') || nextService?.due.includes('days') || nextService?.due.includes('week');

  if (compact) {
    return (
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.01]",
          "border border-agri-100 bg-gradient-to-r from-white to-agri-25",
          className
        )}
        style={style}
        onClick={onClick}
      >
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {getStatusIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-agri-900 truncate text-sm">{name}</h4>
                <Badge className={cn("text-xs border", getStatusColor())}>
                  {status === 'operational' && 'OK'}
                  {status === 'maintenance' && 'Maintenance'}
                  {status === 'repair' && 'Réparation'}
                  {status === 'inactive' && 'Inactif'}
                </Badge>
              </div>
              
              <p className="text-xs text-agri-600 mb-2">{type}</p>
              
              {nextService && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-agri-500" />
                  <span className={cn(
                    "text-xs font-medium",
                    isOverdue ? 'text-red-600' : isUpcoming ? 'text-harvest-600' : 'text-agri-600'
                  )}>
                    {nextService.due}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const usagePercentage = usage ? Math.min(Math.round((usage.hours / usage.target) * 100), 100) : 0;
  const progressColor = usagePercentage > 90 ? 'bg-orange-500' : 'bg-emerald-500';

  return (
    <Card 
      className={cn(
        "bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300 equipment-card animate-fadeIn",
        className
      )}
      style={{
        ...style,
        opacity: 1,
        animation: 'fadeIn 0.5s forwards',
      }}
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-32 object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop";
          }}
        />
        <div className="absolute top-2 right-2">
          <Badge 
            className={cn("rounded-md", getStatusColor())}
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
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className={cn("h-2 rounded-full", progressColor)}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
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
            <span className={cn(
              isOverdue ? 'text-red-600' : isUpcoming ? 'text-orange-600' : 'text-green-600'
            )}>
              {nextService.due}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
