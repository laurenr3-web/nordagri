
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EquipmentDetailErrorProps {
  id?: string;
  error: string | null;
}

const EquipmentDetailError: React.FC<EquipmentDetailErrorProps> = ({ id, error }) => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-7xl mx-auto">
      <Button 
        variant="outline" 
        size="sm" 
        className="mb-4"
        onClick={() => navigate('/equipment')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux équipements
      </Button>
      <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">Équipement non trouvé</h2>
        <p className="text-muted-foreground">
          L'équipement avec l'ID {id} n'a pas pu être trouvé.
        </p>
        {error && (
          <p className="text-destructive mt-2">
            Erreur: {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default EquipmentDetailError;
