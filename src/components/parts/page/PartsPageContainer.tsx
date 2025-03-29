
import React, { useState, useEffect } from 'react';
import { usePartsContext } from '@/contexts/PartsContext';
import LoadingState from './states/LoadingState';
import ErrorState from './states/ErrorState';
import ContextNotAvailable from './states/ContextNotAvailable';
import PartsPageContent from './PartsPageContent';

const PartsPageContainer = () => {
  console.log("PartsPageContainer - Rendering and attempting to use context");
  
  // All hooks declarations at the beginning
  const [isContextReady, setIsContextReady] = useState(false);
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
  
  // Don't use hooks inside a try/catch block
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

  return (
    <PartsPageContent 
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isPhotoModalOpen={isPhotoModalOpen}
      setIsPhotoModalOpen={setIsPhotoModalOpen}
      handlePhotoTaken={handlePhotoTaken}
    />
  );
};

export default PartsPageContainer;
