
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';
import { useQrCodeVerification } from '@/hooks/equipment/useQrCodeVerification';
import { toast } from 'sonner';
import QRCodeErrorView from '@/components/qrcode/QRCodeErrorView';

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

  // Show loading state
  if (authLoading || isLoading || qrVerificationLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Vérification en cours...</p>
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
      />
    );
  }

  // Default return (should not be displayed as we navigate away)
  return null;
};

export default ScanRedirect;
