
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { ExternalLink, BarChart } from 'lucide-react';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { useNavigate } from 'react-router-dom';

interface EquipmentListProps {
  equipment: EquipmentItem[];
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  handleEquipmentClick: (equipment: EquipmentItem) => void;
}

const EquipmentList: React.FC<EquipmentListProps> = ({
  equipment,
  getStatusColor,
  getStatusText,
  handleEquipmentClick
}) => {
  const navigate = useNavigate();

  const handleViewDetails = (item: EquipmentItem) => {
    console.log('Viewing details for:', item.id);
    handleEquipmentClick(item);
  };

  const handleNavigateToDetail = (id: number) => {
    console.log('Navigating to equipment detail page:', id);
    navigate(`/equipment/${id}`);
  };

  return (
    <BlurContainer className="overflow-hidden rounded-lg animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary/50">
              <th className="text-left p-3 font-medium">Equipment</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Manufacturer</th>
              <th className="text-left p-3 font-medium">Serial Number</th>
              <th className="text-left p-3 font-medium">Year</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Location</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {equipment.map((item) => (
              <tr key={item.id} className="hover:bg-secondary/30">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-md overflow-hidden flex-shrink-0 cursor-pointer"
                      onClick={() => handleNavigateToDetail(item.id)}
                    >
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span 
                      className="font-medium cursor-pointer hover:text-primary"
                      onClick={() => handleNavigateToDetail(item.id)}
                    >
                      {item.name}
                    </span>
                  </div>
                </td>
                <td className="p-3">{item.type}</td>
                <td className="p-3">{item.manufacturer}</td>
                <td className="p-3">{item.serialNumber}</td>
                <td className="p-3">{item.year}</td>
                <td className="p-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                    {getStatusText(item.status)}
                  </span>
                </td>
                <td className="p-3">{item.location}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-2 gap-1"
                      onClick={() => handleViewDetails(item)}
                      aria-label="Voir les détails de l'équipement dans une boîte de dialogue"
                    >
                      <span>Dialogue</span>
                      <ExternalLink size={14} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-2 gap-1"
                      onClick={() => handleNavigateToDetail(item.id)}
                      aria-label="Voir la page de détails de l'équipement"
                    >
                      <span>Page</span>
                      <ExternalLink size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BlurContainer>
  );
};

export default EquipmentList;
