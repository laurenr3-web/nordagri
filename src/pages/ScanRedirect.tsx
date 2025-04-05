
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle, QrCode } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { equipmentService } from '@/services/supabase/equipmentService';
import { qrCodeService } from '@/services/supabase/qrCodeService';
import { Button } from '@/components/ui/button';

const ScanRedirect: React.FC = () => {
  const { id: qrCodeHash } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isValidEquipment, setIsValidEquipment] = useState<boolean | null>(null);
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Vérifier l'authentification
  const { user, loading: authLoading } = useAuth(true, `/scan/${qrCodeHash}`);

  useEffect(() => {
    const redirectToEquipment = async () => {
      if (authLoading || !user || !qrCodeHash) return;
      
      try {
        setIsLoadingEquipment(true);
        
        // Vérifier le QR code dans la base de données
        const equipmentQrCode = await qrCodeService.getEquipmentByQRCodeHash(qrCodeHash);
        
        if (!equipmentQrCode) {
          setIsValidEquipment(false);
          setError("QR code invalide ou expiré. Veuillez scanner un QR code valide.");
          return;
        }
        
        // Vérifier si l'équipement existe toujours
        const equipment = await equipmentService.getEquipmentById(equipmentQrCode.equipment_id);
        
        if (equipment) {
          setIsValidEquipment(true);
          // Rediriger vers la page détaillée de l'équipement
          navigate(`/equipment/${equipmentQrCode.equipment_id}`);
        } else {
          setIsValidEquipment(false);
          setError("L'équipement associé à ce QR code n'existe plus.");
        }
      } catch (err: any) {
        console.error('Erreur lors de la redirection:', err);
        setIsValidEquipment(false);
        setError(err.message || "Une erreur s'est produite lors de la redirection");
      } finally {
        setIsLoadingEquipment(false);
      }
    };

    redirectToEquipment();
  }, [qrCodeHash, navigate, user, authLoading]);

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
          <div className="flex items-center justify-center mb-4">
            <QrCode className="h-12 w-12 text-destructive" />
            <AlertTriangle className="h-12 w-12 text-destructive ml-2" />
          </div>
          <h1 className="text-2xl font-bold">QR Code non valide</h1>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('/equipment')}>
              Voir tous les équipements
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null; // Éviter un flash de contenu avant la redirection
};

export default ScanRedirect;
