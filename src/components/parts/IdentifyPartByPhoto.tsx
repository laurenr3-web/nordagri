
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Camera, Search } from 'lucide-react';
import PartPhotoCapture from './PartPhotoCapture';
import { identifyPartFromImage } from '@/services/openai/partVisionService';
import { getPartTechnicalInfo } from '@/services/parts/technicalInfoService';

interface IdentifyPartByPhotoProps {
  onPartIdentified: (partInfo: {
    name: string;
    reference?: string;
    manufacturer?: string;
    technicalInfo?: any;
  }) => void;
}

const IdentifyPartByPhoto: React.FC<IdentifyPartByPhotoProps> = ({ onPartIdentified }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [identificationResult, setIdentificationResult] = useState<any | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  
  const handlePhotoTaken = (imageBase64: string) => {
    setCapturedImage(imageBase64);
    identifyPart(imageBase64);
  };
  
  const identifyPart = async (imageBase64: string) => {
    setIsIdentifying(true);
    try {
      const result = await identifyPartFromImage(imageBase64);
      setIdentificationResult(result);
      
      // Notifier l'utilisateur
      if (result.confidence === 'high') {
        toast.success(`Pièce identifiée: ${result.probableName}`, {
          description: result.referenceNumber 
            ? `Référence: ${result.referenceNumber}` 
            : undefined
        });
      } else {
        toast.info(`Pièce identifiée avec ${result.confidence === 'medium' ? 'une confiance moyenne' : 'une faible confiance'}`, {
          description: "Les informations peuvent ne pas être précises à 100%."
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'identification:", error);
      toast.error("Échec de l'identification", {
        description: "Impossible d'identifier la pièce. Essayez avec une photo plus claire."
      });
      setIdentificationResult(null);
    } finally {
      setIsIdentifying(false);
    }
  };
  
  const fetchDetailedInfo = async () => {
    if (!identificationResult) return;
    
    setIsFetchingDetails(true);
    try {
      // Si on a une référence, utiliser celle-ci
      if (identificationResult.referenceNumber) {
        const technicalInfo = await getPartTechnicalInfo(
          identificationResult.referenceNumber, 
          identificationResult.manufacturer
        );
        
        onPartIdentified({
          name: identificationResult.probableName,
          reference: identificationResult.referenceNumber,
          manufacturer: identificationResult.manufacturer,
          technicalInfo: technicalInfo
        });
        
        toast.success("Informations détaillées récupérées");
      } else {
        // Sinon, utiliser le nom et le type
        const searchQuery = `${identificationResult.probableName} ${identificationResult.type} ${identificationResult.manufacturer || ''}`;
        const technicalInfo = await getPartTechnicalInfo(searchQuery);
        
        onPartIdentified({
          name: identificationResult.probableName,
          manufacturer: identificationResult.manufacturer,
          technicalInfo: technicalInfo
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des détails:", error);
      toast.error("Erreur lors de la récupération des détails", {
        description: "Les informations sur la pièce n'ont pas pu être chargées."
      });
    } finally {
      setIsFetchingDetails(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Identifier par photo
        </CardTitle>
        <CardDescription>
          Prenez une photo de la pièce pour l'identifier et obtenir ses informations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <PartPhotoCapture 
          onPhotoTaken={handlePhotoTaken} 
          isLoading={isIdentifying} 
        />
        
        {identificationResult && (
          <div className="space-y-4 mt-4 border-t pt-4">
            <div>
              <h3 className="font-medium text-lg">{identificationResult.probableName}</h3>
              {identificationResult.referenceNumber && (
                <p className="text-sm">Référence: {identificationResult.referenceNumber}</p>
              )}
              {identificationResult.manufacturer && (
                <p className="text-sm">Fabricant: {identificationResult.manufacturer}</p>
              )}
              <p className="text-sm text-muted-foreground mt-2">{identificationResult.description}</p>
            </div>
            
            {identificationResult.possibleUses?.length > 0 && (
              <div>
                <h4 className="font-medium text-sm">Utilisations possibles:</h4>
                <ul className="text-sm list-disc pl-5 mt-1">
                  {identificationResult.possibleUses.map((use: string, index: number) => (
                    <li key={index}>{use}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <Button 
              onClick={fetchDetailedInfo}
              disabled={isFetchingDetails}
              className="w-full"
            >
              {isFetchingDetails ? (
                <>Recherche en cours...</>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher des informations détaillées
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IdentifyPartByPhoto;
