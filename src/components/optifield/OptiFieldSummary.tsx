
import React from 'react';
import { Card } from '@/components/ui/card';
import { Tractor, Clock, MapPin, AlertTriangle, Calendar, Gauge } from 'lucide-react';
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

const getProgressColor = (progress: number) => {
  if (progress === 100) return 'bg-green-500';
  if (progress > 50) return 'bg-amber-500';
  if (progress > 0) return 'bg-blue-500';
  return 'bg-gray-300';
};

const OptiFieldSummary: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Dashboard summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-agri-50 to-agri-100 border-agri-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-full">
                <Tractor className="h-5 w-5 text-agri-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-agri-900">Équipements actifs</h3>
                <p className="text-2xl font-bold text-agri-800">1 / 3</p>
              </div>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-white text-agri-700">33%</span>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-harvest-50 to-harvest-100 border-harvest-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-full">
                <Clock className="h-5 w-5 text-harvest-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-harvest-900">Temps de travail</h3>
                <p className="text-2xl font-bold text-harvest-800">3h 15min</p>
              </div>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-white text-harvest-700">Aujourd'hui</span>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-br from-soil-50 to-soil-100 border-soil-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-full">
                <MapPin className="h-5 w-5 text-soil-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-soil-900">Parcelle active</h3>
                <p className="text-2xl font-bold text-soil-800">1 / 3</p>
              </div>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-white text-soil-700">33%</span>
          </div>
        </Card>
      </div>
      
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
    </div>
  );
};

export default OptiFieldSummary;
