
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';
import { useQrCodeVerification } from '@/hooks/equipment/useQrCodeVerification';
import { toast } from 'sonner';
import QRCodeErrorView from '@/components/qrcode/QRCodeErrorView';
import { Button } from '@/components/ui/button';

/**
 * Composant pour la redirection après scan d'un QR code
 * - Vérifie l'authentification
 * - Valide le QR code
 * - Redirige vers la page de détail de l'équipement correspondant
 */
const ScanRedirect: React.FC = () => {
  const { id: qrCodeHash } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Auth state
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  
  // QR code verification
  const { verifyQrCode, isLoading: qrVerificationLoading, error: qrVerificationError } = useQrCodeVerification();
  
  // Component state
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [previousPage, setPreviousPage] = useState<string | null>(null);

  // Capture la page précédente lors du chargement initial
  useEffect(() => {
    // Vérifie si la page précédente existe dans l'historique ou utilise une valeur par défaut
    if (window.history.length > 1) {
      // Utilise sessionStorage pour stocker l'origine de la navigation
      const referrer = document.referrer || sessionStorage.getItem('lastVisitedPage') || '/dashboard';
      setPreviousPage(referrer);
    } else {
      setPreviousPage('/dashboard');
    }
    
    // Sauvegarde la page actuelle pour les navigations futures
    sessionStorage.setItem('lastVisitedPage', location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    // Handle authentication check
    if (!authLoading && !isAuthenticated) {
      const currentPath = location.pathname;
      navigate(`/auth?returnTo=${encodeURIComponent(currentPath)}`, { replace: true });
      return;
    }

    // Process QR code once authenticated
    const processQrCode = async () => {
      if (!qrCodeHash || !isAuthenticated) return;
      
      try {
        setIsLoading(true);
        toast.info("Vérification du QR code...");
        
        // Verify QR code
        const { isValid, equipmentId } = await verifyQrCode(qrCodeHash);
        
        if (isValid && equipmentId) {
          toast.success("Équipement trouvé, redirection...");
          navigate(`/equipment/${equipmentId}`, { replace: true });
        } else {
          setError(qrVerificationError || "QR code invalide");
          toast.error("QR code invalide");
        }
      } catch (err: any) {
        console.error('Erreur de redirection:', err);
        setError(err.message || "Une erreur s'est produite");
        toast.error("Erreur de redirection");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && !authLoading) {
      processQrCode();
    }
  }, [qrCodeHash, navigate, isAuthenticated, authLoading, verifyQrCode, qrVerificationError, location.pathname]);

  // Handle retry action
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    window.location.reload();
  };
  
  // Handle back action
  const handleGoBack = () => {
    // Si l'historique existe, on retourne à la page précédente
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Sinon on va à la page d'équipements
      navigate('/equipment');
    }
  };

  // Show loading state
  if (authLoading || isLoading || qrVerificationLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg mb-6">Vérification en cours...</p>
        
        <Button 
          variant="outline" 
          onClick={handleGoBack}
          className="flex items-center gap-2"
        >
          <ChevronLeft size={16} />
          Retour
        </Button>
      </div>
    );
  }

  // Show error state
  if (error || qrVerificationError) {
    const errorMessage = error || qrVerificationError || "Une erreur inconnue s'est produite";
    
    return (
      <QRCodeErrorView 
        error={errorMessage}
        onRetry={handleRetry}
        redirectPath={previousPage || '/equipment'} 
        redirectText="Retour"
      />
    );
  }

  // Default return (should not be displayed as we navigate away)
  return null;
};

export default ScanRedirect;
