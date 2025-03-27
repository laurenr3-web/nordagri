
import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { useEquipmentDetail } from '@/hooks/equipment/useEquipmentDetail';
import EquipmentDetailLoading from '@/components/equipment/detail/EquipmentDetailLoading';
import EquipmentDetailError from '@/components/equipment/detail/EquipmentDetailError';
import EquipmentDetailContent from '@/components/equipment/detail/EquipmentDetailContent';

const EquipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { equipment, loading, error, handleEquipmentUpdate } = useEquipmentDetail(id);
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {loading && (
        <EquipmentDetailLoading id={id} />
      )}
      
      {!loading && error && (
        <EquipmentDetailError id={id} error={error} />
      )}
      
      {!loading && !error && equipment && (
        <EquipmentDetailContent 
          equipment={equipment}
          onUpdate={handleEquipmentUpdate}
        />
      )}
    </div>
  );
};

export default EquipmentDetail;
