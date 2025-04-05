
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertTriangle, QrCode, Info, ArrowLeft } from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';
import { equipmentService } from '@/services/supabase/equipmentService';
import { qrCodeService } from '@/services/supabase/qrCodeService';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const ScanRedirect: React.FC = () => {
  const { id: qrCodeHash } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isValidEquipment, setIsValidEquipment] = useState<boolean | null>(null);
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('Initialisation du scan...');
  const [previousPage, setPreviousPage] = useState<string | null>(null);
  
  // Utiliser useAuthContext au lieu de useAuth avec un paramètre de redirection problématique
  const { user, loading: authLoading, isAuthenticated } = useAuthContext();

  // Sauvegarder la page précédente pour permettre un retour facile
  useEffect(() => {
    try {
      // Obtenir la dernière page visitée depuis l'historique ou sessionStorage
      const referrer = document.referrer;
      const lastPage = sessionStorage.getItem('lastVisitedPage') || '';
      
      // Si on a une référence valide et que ce n'est pas la page de scan actuelle
      if (referrer && !referrer.includes(`/scan/${qrCodeHash}`)) {
        setPreviousPage(referrer);
        sessionStorage.setItem('scanRedirectReturnTo', referrer);
      } 
      // Sinon utiliser la dernière page enregistrée
      else if (lastPage && !lastPage.includes(`/scan/${qrCodeHash}`)) {
        setPreviousPage(lastPage);
        sessionStorage.setItem('scanRedirectReturnTo', lastPage);
      } 
      // Par défaut, retourner à la liste des équipements
      else {
        setPreviousPage('/equipment');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la page précédente:', error);
      setPreviousPage('/equipment');
    }
  }, [qrCodeHash]);

  // Rediriger vers la page d'authentification si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!authLoading && !isAuthenticated && qrCodeHash) {
      // Stocker la route actuelle pour y revenir après authentification
      navigate(`/auth?returnTo=${encodeURIComponent(`/scan/${qrCodeHash}`)}`);
    }
  }, [authLoading, isAuthenticated, qrCodeHash, navigate]);

  // Fonction pour gérer le retour en arrière
  const handleGoBack = () => {
    const returnUrl = sessionStorage.getItem('scanRedirectReturnTo') || '/equipment';
    navigate(returnUrl);
  };

  useEffect(() => {
    const redirectToEquipment = async () => {
      if (authLoading || !isAuthenticated || !qrCodeHash) return;
      
      try {
        setIsLoadingEquipment(true);
        
        // Afficher l'état de progression
        setProcessingStep('Vérification du QR code...');
        
        // Vérifier le QR code dans la base de données
        const equipmentQrCode = await qrCodeService.getEquipmentByQRCodeHash(qrCodeHash);
        
        if (!equipmentQrCode) {
          setIsValidEquipment(false);
          setError("QR code invalide ou expiré. Veuillez scanner un QR code valide.");
          return;
        }
        
        setProcessingStep('Vérification des informations d\'équipement...');
        
        try {
          // Vérifier si l'équipement existe toujours
          const equipment = await equipmentService.getEquipmentById(equipmentQrCode.equipment_id);
          
          // Vérification supplémentaire des droits d'accès à l'équipement
          if (!equipment) {
            setIsValidEquipment(false);
            setError("L'équipement associé à ce QR code n'existe plus.");
            return;
          }
          
          setProcessingStep('Vérification des autorisations...');
          
          // Ici, nous pourrions ajouter des vérifications supplémentaires de permissions
          // Par exemple: const hasAccess = await checkEquipmentAccess(equipment.id, user.id);
          
          // Pour l'instant, on suppose que tout utilisateur authentifié a accès
          setIsValidEquipment(true);
          
          // Afficher une notification de succès
          toast({
            title: "Équipement trouvé",
            description: `Redirection vers ${equipment.name || 'l\'équipement'}`
          });
          
          // Rediriger vers la page détaillée de l'équipement
          navigate(`/equipment/${equipmentQrCode.equipment_id}`);
        } catch (equipmentError) {
          // Gérer spécifiquement les erreurs de conversion d'ID
          if (equipmentError instanceof Error && equipmentError.message.includes("convert")) {
            setError("Format d'identifiant d'équipement invalide dans le QR code.");
          } else {
            setError("Impossible de récupérer les informations de l'équipement.");
          }
          setIsValidEquipment(false);
        }
      } catch (err: any) {
        // Gestion d'erreur améliorée
        console.error('Erreur lors de la redirection:', err);
        
        // Messages d'erreur plus descriptifs
        if (err.code === "PGRST301") {
          setError("Vous n'avez pas les droits d'accès à cet équipement.");
        } else if (err.message?.includes("network")) {
          setError("Problème de connexion au serveur. Veuillez vérifier votre connexion internet.");
        } else {
          setError(err.message || "Une erreur s'est produite lors de la redirection");
        }
        
        setIsValidEquipment(false);
      } finally {
        setIsLoadingEquipment(false);
      }
    };

    redirectToEquipment();
  }, [qrCodeHash, navigate, user, authLoading, isAuthenticated]);

  if (authLoading || isLoadingEquipment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">{processingStep}</p>
        <p className="mt-2 text-sm text-muted-foreground">Veuillez patienter pendant la vérification...</p>
        <Button 
          variant="ghost" 
          className="mt-6 flex items-center" 
          onClick={handleGoBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
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
            <Button 
              variant="outline" 
              onClick={handleGoBack}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Afficher un message plus informatif pendant les transitions
  if (!isValidEquipment && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Info className="h-12 w-12 text-primary mb-4" />
        <p className="text-lg">Traitement en cours...</p>
        <Button 
          variant="ghost" 
          className="mt-6 flex items-center" 
          onClick={handleGoBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>
    );
  }

  return null; // Éviter un flash de contenu avant la redirection
};

export default ScanRedirect;
