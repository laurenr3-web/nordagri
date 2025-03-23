
import React from 'react';
import { Card } from '@/components/ui/card';
import { Tractor, Clock, MapPin } from 'lucide-react';

const SummaryCards: React.FC = () => {
  return (
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
  );
};

export default SummaryCards;
