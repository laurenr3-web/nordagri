
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/ui/layouts/MainLayout';
import { useEquipmentDetail } from '@/hooks/equipment/useEquipmentDetail';
import EquipmentDetailLoading from '@/components/equipment/detail/EquipmentDetailLoading';
import EquipmentDetailError from '@/components/equipment/detail/EquipmentDetailError';
import EquipmentDetailContent from '@/components/equipment/detail/EquipmentDetailContent';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';

const EquipmentDetail = () => {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const id = params.id;

  // If no ID is found, redirect to equipment list
  React.useEffect(() => {
    if (!id) {
      navigate('/equipment');
    }
  }, [id, navigate]);

  // Don't render anything if no ID
  if (!id) {
    return null;
  }

  const { equipment, loading, error, handleEquipmentUpdate } = useEquipmentDetail(id);
  
  return (
    <MainLayout>
      <LayoutWrapper>
        {loading && (
          <EquipmentDetailLoading id={id} />
        )}
        
        {!loading && error && (
          <EquipmentDetailError id={id} error={error} />
        )}
        
        {!loading && !error && equipment && (
          <EquipmentDetailContent 
            equipment={equipment}
            onUpdate={async (updatedData) => {
              await handleEquipmentUpdate(updatedData);
            }}
          />
        )}
      </LayoutWrapper>
    </MainLayout>
  );
};

export default EquipmentDetail;
