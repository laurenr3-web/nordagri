
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Component d'index qui redirige automatiquement vers le tableau de bord
 */
const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirection vers le tableau de bord
    navigate('/dashboard', { replace: true });
  }, [navigate]);
  
  // Rendu d'un conteneur vide pendant la redirection
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-agri-primary border-t-transparent mx-auto"></div>
        <p className="text-sm text-gray-500">Redirection en cours...</p>
      </div>
    </div>
  );
};

export default Index;
