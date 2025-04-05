
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, AlertTriangle, QrCode } from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';
import { equipmentService } from '@/services/supabase/equipmentService';
import { qrCodeService } from '@/services/supabase/qrCodeService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ScanRedirect: React.FC = () => {
  const { id: qrCodeHash } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isValidEquipment, setIsValidEquipment] = useState<boolean | null>(null);
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Utiliser AuthContext au lieu de useAuth pour éviter les problèmes de redirection cyclique
  const { user, loading: authLoading, isAuthenticated } = useAuthContext();

  useEffect(() => {
    // Si l'utilisateur n'est pas authentifié et que le chargement d'auth est terminé, 
    // le rediriger vers la page d'authentification avec un returnTo
    if (!authLoading && !isAuthenticated) {
      const currentPath = location.pathname;
      navigate(`/auth?returnTo=${encodeURIComponent(currentPath)}`, { replace: true });
      return;
    }

    const redirectToEquipment = async () => {
      // Ne pas continuer si authentification en cours ou pas d'utilisateur authentifié ou pas de hash
      if (authLoading || !user || !qrCodeHash) return;
      
      try {
        setIsLoadingEquipment(true);
        toast.info("Vérification du QR code...");
        
        // Vérifier le QR code dans la base de données
        const equipmentQrCode = await qrCodeService.getEquipmentByQRCodeHash(qrCodeHash);
        
        if (!equipmentQrCode) {
          setIsValidEquipment(false);
          setError("QR code invalide ou expiré. Veuillez scanner un QR code valide.");
          toast.error("QR code invalide");
          return;
        }
        
        // Vérifier si l'ID d'équipement est un nombre valide
        const equipmentId = equipmentQrCode.equipment_id;
        if (isNaN(equipmentId) || equipmentId <= 0) {
          setIsValidEquipment(false);
          setError("ID d'équipement invalide associé à ce QR code.");
          toast.error("ID d'équipement invalide");
          return;
        }
        
        // Vérifier si l'équipement existe toujours
        const equipment = await equipmentService.getEquipmentById(equipmentId);
        
        if (equipment) {
          setIsValidEquipment(true);
          // Rediriger vers la page détaillée de l'équipement
          toast.success("Équipement trouvé, redirection...");
          navigate(`/equipment/${equipmentId}`);
        } else {
          setIsValidEquipment(false);
          setError("L'équipement associé à ce QR code n'existe plus.");
          toast.error("Équipement introuvable");
        }
      } catch (err: any) {
        console.error('Erreur lors de la redirection:', err);
        setIsValidEquipment(false);
        setError(err.message || "Une erreur s'est produite lors de la redirection");
        toast.error("Erreur de redirection");
      } finally {
        setIsLoadingEquipment(false);
      }
    };

    if (isAuthenticated) {
      redirectToEquipment();
    }
  }, [qrCodeHash, navigate, user, authLoading, isAuthenticated, location.pathname]);

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
            <Button variant="outline" onClick={() => {
              setError(null);
              setIsLoadingEquipment(true);
              window.location.reload();
            }}>
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
