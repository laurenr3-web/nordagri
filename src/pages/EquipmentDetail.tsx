
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import EquipmentDetails from '@/components/equipment/EquipmentDetails';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

// Sample equipment data - in a real app, this would come from an API
const equipmentData = [{
  id: 1,
  name: 'John Deere 8R 410',
  type: 'Tractor',
  category: 'Heavy Equipment',
  manufacturer: 'John Deere',
  model: '8R 410',
  year: 2022,
  status: 'operational',
  location: 'North Field',
  lastMaintenance: '2023-05-15',
  image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop',
  usage: {
    hours: 342,
    target: 500
  },
  serialNumber: 'JD8R410-2022-1234',
  purchaseDate: '2022-02-10',
  nextService: {
    type: 'Filter Change',
    due: 'In 3 weeks'
  }
}, {
  id: 2,
  name: 'Case IH Axial-Flow',
  type: 'Combine Harvester',
  category: 'Harvesting Equipment',
  manufacturer: 'Case IH',
  model: 'Axial-Flow 250',
  year: 2021,
  status: 'maintenance',
  location: 'Equipment Shed',
  lastMaintenance: '2023-04-20',
  image: 'https://images.unsplash.com/photo-1599033329459-cc8c31c7eb6c?q=80&w=500&auto=format&fit=crop',
  usage: {
    hours: 480,
    target: 500
  },
  serialNumber: 'CASE-AF250-2021-5678',
  purchaseDate: '2021-07-15',
  nextService: {
    type: 'Full Service',
    due: 'In 2 days'
  }
}, {
  id: 3,
  name: 'Kubota M7-172',
  type: 'Tractor',
  category: 'Medium Equipment',
  manufacturer: 'Kubota',
  model: 'M7-172',
  year: 2020,
  status: 'repair',
  location: 'Workshop',
  lastMaintenance: '2023-03-10',
  image: 'https://images.unsplash.com/photo-1585911171167-1f66ea3de00c?q=80&w=500&auto=format&fit=crop',
  usage: {
    hours: 620,
    target: 500
  },
  serialNumber: 'KUB-M7172-2020-9012',
  purchaseDate: '2020-05-22',
  nextService: {
    type: 'Engine Check',
    due: 'Overdue'
  }
}];

const EquipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [equipmentState, setEquipmentState] = useState<any[]>(equipmentData);
  
  // Find the equipment with the matching ID
  const equipmentIndex = equipmentState.findIndex(item => item.id === Number(id));
  const equipment = equipmentState[equipmentIndex];
  
  const handleEquipmentUpdate = (updatedEquipment: any) => {
    const newEquipmentState = [...equipmentState];
    newEquipmentState[equipmentIndex] = updatedEquipment;
    setEquipmentState(newEquipmentState);
    toast.success('Equipment updated successfully');
  };
  
  if (!equipment) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-6 pb-16 pl-4 pr-4 sm:pl-8 sm:pr-8 md:pl-12 md:pr-12 ml-0 md:ml-64">
          <div className="max-w-7xl mx-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-4"
              onClick={() => navigate('/equipment')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Equipment
            </Button>
            <div className="p-8 text-center">
              <h2 className="text-2xl font-semibold mb-4">Equipment Not Found</h2>
              <p className="text-muted-foreground">
                The equipment with ID {id} could not be found.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-6 pb-16 pl-4 pr-4 sm:pl-8 sm:pr-8 md:pl-12 md:pr-12 ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-4"
            onClick={() => navigate('/equipment')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Equipment
          </Button>
          <EquipmentDetails equipment={equipment} onUpdate={handleEquipmentUpdate} />
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetail;
