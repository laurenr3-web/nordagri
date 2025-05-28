
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
  
  // Add defensive check for params
  let id: string | undefined;
  try {
    const params = useParams<{ id: string }>();
    id = params.id;
  } catch (error) {
    console.error('Error getting params:', error);
    // Fallback: try to get id from URL manually
    const urlParts = window.location.pathname.split('/');
    id = urlParts[urlParts.length - 1];
  }

  // If we still can't get an ID, redirect to equipment list
  if (!id) {
    React.useEffect(() => {
      navigate('/equipment');
    }, [navigate]);
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
