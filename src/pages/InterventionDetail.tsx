
import React from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

interface InterventionDetailProps {
  // Props if needed
}

const InterventionDetail: React.FC<InterventionDetailProps> = () => {
  const { id } = useParams<{ id: string }>();

  React.useEffect(() => {
    // Load data when the component mounts
    console.log(`Loading intervention details for ID: ${id}`);
  }, [id]);

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Détails de l'intervention</h1>
          <button 
            onClick={() => toast.info('Fonctionnalité en développement')}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          >
            Modifier
          </button>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6 mb-6">
          <p className="text-muted-foreground mb-4">ID: {id}</p>
          <p className="text-lg mb-2">Chargement des détails de l'intervention...</p>
        </div>
      </div>
    </div>
  );
};

export default InterventionDetail;
