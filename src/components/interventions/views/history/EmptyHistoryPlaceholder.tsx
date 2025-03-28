
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';

interface EmptyHistoryPlaceholderProps {
  selectedEquipment: string;
}

const EmptyHistoryPlaceholder: React.FC<EmptyHistoryPlaceholderProps> = ({ selectedEquipment }) => {
  return (
    <BlurContainer className="p-8 text-center">
      <p className="text-muted-foreground">
        Aucune intervention trouvée pour {selectedEquipment === 'all' ? 'les équipements' : `"${selectedEquipment}"`}
      </p>
    </BlurContainer>
  );
};

export default EmptyHistoryPlaceholder;
