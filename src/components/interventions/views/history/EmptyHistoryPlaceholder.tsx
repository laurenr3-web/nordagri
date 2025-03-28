
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { History } from 'lucide-react';

interface EmptyHistoryPlaceholderProps {
  selectedEquipment: string;
}

const EmptyHistoryPlaceholder: React.FC<EmptyHistoryPlaceholderProps> = ({ selectedEquipment }) => {
  return (
    <BlurContainer className="p-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-muted/30 rounded-full">
          <History className="h-10 w-10 text-muted-foreground" />
        </div>
        <div>
          <p className="text-lg font-medium">Aucune intervention trouvée</p>
          <p className="text-muted-foreground mt-2">
            {selectedEquipment === 'all' 
              ? 'Aucun historique d\'intervention n\'est disponible pour les équipements.'
              : `Aucun historique d'intervention n'est disponible pour "${selectedEquipment}".`}
          </p>
        </div>
      </div>
    </BlurContainer>
  );
};

export default EmptyHistoryPlaceholder;
