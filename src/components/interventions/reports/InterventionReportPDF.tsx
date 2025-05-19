import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { InterventionReportPDFOptions } from '@/utils/pdf-export/types';

// Définir correctement le type pour les pièces avec unitPrice
interface PartUsed {
  partId: number;
  name: string;
  quantity: number;
  unitPrice?: number; // Ajout de la propriété unitPrice comme optionnelle
}

interface InterventionReportPDFProps {
  intervention: {
    id: number;
    title: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
    priority?: string;
    equipment?: { 
      id: number;
      name: string;
      serialNumber?: string;
      model?: string;
    };
    partsUsed?: PartUsed[];
    notes?: string;
  };
  options?: InterventionReportPDFOptions;
}

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  // ... autres styles
});

export const InterventionReportPDF: React.FC<InterventionReportPDFProps> = ({ 
  intervention, 
  options 
}) => {
  // Fonction pour calculer le total des pièces
  const calculatePartsTotal = () => {
    if (!intervention.partsUsed || intervention.partsUsed.length === 0) {
      return 0;
    }
    
    return intervention.partsUsed.reduce((total, part) => {
      // Vérifier si unitPrice existe et utiliser 0 comme valeur par défaut
      const price = part.unitPrice || 0;
      return total + (price * part.quantity);
    }, 0);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header avec logo et informations de l'entreprise */}
        {/* ... votre code existant */}
        
        {/* Contenu du rapport */}
        {/* ... votre code existant */}
        
        {/* Section des pièces utilisées */}
        <View>
          {intervention.partsUsed && intervention.partsUsed.length > 0 ? (
            <View>
              <Text>Pièces utilisées:</Text>
              <View>
                {/* En-têtes du tableau */}
                <View>
                  <Text>Désignation</Text>
                  <Text>Quantité</Text>
                  <Text>Prix unitaire</Text>
                  <Text>Total HT</Text>
                </View>
                
                {/* Lignes du tableau */}
                {intervention.partsUsed.map((part, index) => (
                  <View key={index}>
                    <Text>{part.name}</Text>
                    <Text>{part.quantity}</Text>
                    <Text>{part.unitPrice ? `${part.unitPrice.toFixed(2)} €` : '0.00 €'}</Text>
                    <Text>{part.unitPrice ? `${(part.unitPrice * part.quantity).toFixed(2)} €` : '0.00 €'}</Text>
                  </View>
                ))}
                
                {/* Ligne du total */}
                <View>
                  <Text>Total HT</Text>
                  <Text>{calculatePartsTotal().toFixed(2)} €</Text>
                </View>
              </View>
            </View>
          ) : (
            <Text>Aucune pièce utilisée pour cette intervention</Text>
          )}
        </View>
        
        {/* ... reste du document */}
      </Page>
    </Document>
  );
};
