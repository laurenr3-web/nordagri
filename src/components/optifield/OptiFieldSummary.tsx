
import React from 'react';
import { Card } from '@/components/ui/card';
import { Tractor, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface EquipmentUsage {
  id: string;
  name: string;
  hoursToday: number;
  hoursWeek: number;
  hoursTotal: number;
  efficiency: number;
  maintenanceStatus: 'good' | 'warning' | 'critical';
}

interface FieldUsage {
  id: string;
  name: string;
  area: string;
  hoursWorked: number;
  lastOperation: string;
  progress: number;
}

const MOCK_EQUIPMENT: EquipmentUsage[] = [
  {
    id: '1',
    name: 'Tracteur John Deere 6250R',
    hoursToday: 3.5,
    hoursWeek: 27.5,
    hoursTotal: 1245,
    efficiency: 87,
    maintenanceStatus: 'good'
  },
  {
    id: '2',
    name: 'Tracteur New Holland T7',
    hoursToday: 0,
    hoursWeek: 15.2,
    hoursTotal: 895,
    efficiency: 78,
    maintenanceStatus: 'warning'
  },
  {
    id: '3',
    name: 'Moissonneuse Claas Lexion',
    hoursToday: 0,
    hoursWeek: 0,
    hoursTotal: 456,
    efficiency: 91,
    maintenanceStatus: 'critical'
  }
];

const MOCK_FIELDS: FieldUsage[] = [
  {
    id: '1',
    name: 'Les Grandes Terres',
    area: '15.3 ha',
    hoursWorked: 12.5,
    lastOperation: 'Labour',
    progress: 65
  },
  {
    id: '2',
    name: 'Parcelle Nord',
    area: '8.7 ha',
    hoursWorked: 8.2,
    lastOperation: 'Semis',
    progress: 100
  },
  {
    id: '3',
    name: 'Parcelle Sud',
    area: '10.2 ha',
    hoursWorked: 0,
    lastOperation: 'Aucune',
    progress: 0
  }
];

const getMaintenanceStatusColor = (status: EquipmentUsage['maintenanceStatus']) => {
  switch (status) {
    case 'good': return 'text-green-500';
    case 'warning': return 'text-amber-500';
    case 'critical': return 'text-red-500';
    default: return 'text-gray-500';
  }
};

const OptiFieldSummary: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Utilisation des équipements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_EQUIPMENT.map(equipment => (
            <Card key={equipment.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Tractor className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{equipment.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        <span className="font-medium">{equipment.hoursToday}</span> heures aujourd'hui
                      </span>
                    </div>
                    <AlertTriangle className={`h-5 w-5 ${getMaintenanceStatusColor(equipment.maintenanceStatus)}`} />
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Efficacité</span>
                      <span className="font-medium">{equipment.efficiency}%</span>
                    </div>
                    <Progress value={equipment.efficiency} className="h-1.5" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">État des parcelles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_FIELDS.map(field => (
            <Card key={field.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{field.name}</h3>
                  <p className="text-sm text-muted-foreground">{field.area}</p>
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">Dernière opération: </span>
                    <span>{field.lastOperation}</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progression</span>
                      <span className="font-medium">{field.progress}%</span>
                    </div>
                    <Progress value={field.progress} className="h-1.5" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OptiFieldSummary;
