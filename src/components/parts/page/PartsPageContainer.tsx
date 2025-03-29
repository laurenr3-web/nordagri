
import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import PartToolbar from '@/components/parts/PartToolbar';
import PhotoCaptureModal from '@/components/parts/PhotoCaptureModal';
import { usePartsContext } from '@/contexts/PartsContext';
import PartsHeader from './PartsHeader';
import PartsDialogs from './PartsDialogs';
import LoadingState from './states/LoadingState';
import ErrorState from './states/ErrorState';
import ContextNotAvailable from './states/ContextNotAvailable';
import PartsTabsContent from './PartsTabsContent';

const PartsPageContainer = () => {
  console.log("PartsPageContainer - Rendering and attempting to use context");
  
  // All state declarations need to be unconditional
  const [isContextReady, setIsContextReady] = useState(false);
  const [contextError, setContextError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState('inventory');
  
  useEffect(() => {
    // This effect will run after the component is mounted
    // Set a small delay to ensure the context provider is fully initialized
    const timer = setTimeout(() => {
      setIsContextReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Loading state while waiting for context to be ready
  if (!isContextReady) {
    return <LoadingState />;
  }
  
  // Don't use hooks inside a try/catch block, it violates React's rules of hooks
  let contextValues;
  try {
    contextValues = usePartsContext();
  } catch (error) {
    console.error("Error accessing PartsContext:", error);
    return <ErrorState error={error instanceof Error ? error : null} />;
  }
  
  if (!contextValues) {
    return <ContextNotAvailable />;
  }
  
  const {
    isPhotoModalOpen,
    setIsPhotoModalOpen,
    handlePhotoTaken
  } = contextValues;
  
  // Log successful context access
  useEffect(() => {
    console.log("PartsPageContainer - Successfully connected to context");
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar className="border-r">
        <Navbar />
      </Sidebar>
      
      <div className="flex-1 p-6">
        <PartsHeader />
        
        {/* Barre d'outils avec bouton caméra */}
        <PartToolbar 
          onPhotoClick={() => setIsPhotoModalOpen(true)} 
        />
        
        <PartsTabsContent 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
        
        {/* Render dialogs explicitly to ensure they're always in the DOM */}
        <PartsDialogs />
      </div>
      
      {/* Modal de capture photo */}
      <PhotoCaptureModal 
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onPhotoTaken={handlePhotoTaken}
      />
    </div>
  );
};

export default PartsPageContainer;
