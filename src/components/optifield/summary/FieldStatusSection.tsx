
import React from 'react';
import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { MOCK_FIELDS } from './mockData';
import { getProgressColor } from './types';

const FieldStatusSection: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        <span>État des parcelles</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_FIELDS.map(field => (
          <Card key={field.id} className="overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-medium">{field.name}</h3>
              <p className="text-sm text-muted-foreground">{field.area}</p>
            </div>
            <div className="p-4 space-y-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Dernière opération: </span>
                <span className="font-medium">{field.lastOperation}</span>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Progression</span>
                  <span className="font-medium">{field.progress}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getProgressColor(field.progress)} transition-all duration-500`}
                    style={{ width: `${field.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                <span>Temps travaillé: {field.hoursWorked}h</span>
                <span className={field.progress === 100 ? "text-green-500 font-medium" : ""}>
                  {field.progress === 100 ? "Terminé" : field.progress > 0 ? "En cours" : "Non commencé"}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FieldStatusSection;
