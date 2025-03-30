
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { equipmentService } from '@/services/supabase/equipmentService';
import { Button } from '@/components/ui/button';

const ScanRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isValidEquipment, setIsValidEquipment] = useState<boolean | null>(null);
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Vérifier l'authentification
  const { user, loading: authLoading } = useAuth(true, `/scan/${id}`);

  useEffect(() => {
    const checkEquipment = async () => {
      if (authLoading || !user) return;
      
      try {
        setIsLoadingEquipment(true);
        // Vérifier si l'équipement existe
        const equipment = await equipmentService.getEquipmentById(Number(id));
        
        if (equipment) {
          setIsValidEquipment(true);
          // Rediriger immédiatement vers la page détaillée de l'équipement
          navigate(`/equipment/${id}`);
        } else {
          setIsValidEquipment(false);
          setError("Équipement non trouvé. Vérifiez que le QR code est correct.");
        }
      } catch (err: any) {
        console.error('Erreur lors de la vérification de l\'équipement:', err);
        setIsValidEquipment(false);
        setError(err.message || "Une erreur s'est produite lors de la validation de l'équipement");
      } finally {
        setIsLoadingEquipment(false);
      }
    };

    checkEquipment();
  }, [id, navigate, user, authLoading]);

  if (authLoading || isLoadingEquipment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Vérification en cours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-destructive/10 p-6 rounded-lg text-center max-w-md">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
          <h1 className="text-2xl font-bold mt-4">Erreur de redirection</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <div className="mt-6">
            <Button onClick={() => navigate('/equipment')}>
              Voir tous les équipements
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null; // Éviter un flash de contenu avant la redirection
};

export default ScanRedirect;
