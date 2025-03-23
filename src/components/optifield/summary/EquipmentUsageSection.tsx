
import React from 'react';
import { Card } from '@/components/ui/card';
import { Tractor, Clock, AlertTriangle, Calendar, Gauge } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { MOCK_EQUIPMENT } from './mockData';
import { getMaintenanceStatusColor } from './types';

const EquipmentUsageSection: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Tractor className="h-5 w-5 text-primary" />
        <span>Utilisation des équipements</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_EQUIPMENT.map(equipment => (
          <Card key={equipment.id} className="overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-medium truncate">{equipment.name}</h3>
              <AlertTriangle className={`h-5 w-5 ${getMaintenanceStatusColor(equipment.maintenanceStatus)}`} />
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{equipment.hoursToday} heures aujourd'hui</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{equipment.hoursWeek}h cette semaine</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1">
                    <Gauge className="h-3 w-3" />
                    Efficacité
                  </span>
                  <span className="font-medium">{equipment.efficiency}%</span>
                </div>
                <Progress value={equipment.efficiency} className="h-2" />
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                <span>Temps total: {equipment.hoursTotal}h</span>
                <span className={equipment.hoursToday > 0 ? "text-green-500 font-medium" : "text-muted-foreground"}>
                  {equipment.hoursToday > 0 ? "Actif" : "Inactif"}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EquipmentUsageSection;
