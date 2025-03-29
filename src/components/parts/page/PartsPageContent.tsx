
import React, { useEffect } from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import PartToolbar from '@/components/parts/PartToolbar';
import PhotoCaptureModal from '@/components/parts/PhotoCaptureModal';
import PartsHeader from './PartsHeader';
import PartsDialogs from './PartsDialogs';
import PartsTabsContent from './PartsTabsContent';

interface PartsPageContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isPhotoModalOpen: boolean;
  setIsPhotoModalOpen: (isOpen: boolean) => void;
  handlePhotoTaken: (imageData: string) => Promise<void>;
}

const PartsPageContent: React.FC<PartsPageContentProps> = ({
  activeTab,
  setActiveTab,
  isPhotoModalOpen,
  setIsPhotoModalOpen,
  handlePhotoTaken
}) => {
  // Log successful rendering
  useEffect(() => {
    console.log("PartsPageContent - Successfully rendered");
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

export default PartsPageContent;
