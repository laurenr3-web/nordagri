
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Intervention } from '@/types/Intervention';
import { InterventionReportPDFOptions } from '@/utils/pdf-export/types';

// Définir correctement le type pour les pièces avec unitPrice
interface PartUsed {
  id: number;
  name: string;
  quantity: number;
  unitPrice?: number; // Ajout de la propriété unitPrice comme optionnelle
}

interface InterventionReportPDFProps extends InterventionReportPDFOptions {
  intervention: Intervention;
}

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    textAlign: 'right',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  label: {
    width: '30%',
    fontWeight: 'bold',
  },
  value: {
    width: '70%',
  },
  table: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    borderBottomStyle: 'solid',
    paddingVertical: 5,
  },
  tableHeader: {
    backgroundColor: '#F5F5F5',
  },
  tableCell: {
    padding: 5,
  },
  tableCol1: {
    width: '50%',
  },
  tableCol2: {
    width: '20%',
    textAlign: 'center',
  },
  tableCol3: {
    width: '30%',
    textAlign: 'right',
  },
  signature: {
    marginTop: 30,
  },
  signatureImage: {
    maxWidth: 150,
    height: 70,
    objectFit: 'contain',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#666666',
  },
  image: {
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
    maxHeight: 200,
    objectFit: 'contain',
  },
});

export const InterventionReportPDF: React.FC<InterventionReportPDFProps> = ({ 
  intervention, 
  companyName,
  companyLogo,
  companyDetails,
  signature,
  reportNotes,
  actualDuration,
  images,
  technician
}) => {
  // Fonction pour formater la date
  const formatDate = (date: Date | string): string => {
    if (!date) return 'Non spécifié';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return dateObj.toLocaleDateString('fr-FR', options);
  };

  // Fonction pour calculer le total des pièces
  const calculatePartsTotal = () => {
    if (!intervention.partsUsed || intervention.partsUsed.length === 0) {
      return 0;
    }
    
    return intervention.partsUsed.reduce((total, part) => {
      // Vérifier si unitPrice existe et utiliser 0 comme valeur par défaut
      const price = (part as PartUsed).unitPrice || 0;
      return total + (price * part.quantity);
    }, 0);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header avec logo et informations de l'entreprise */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Rapport d'Intervention #{intervention.id}</Text>
            <Text>Date: {formatDate(intervention.date)}</Text>
          </View>
          <View style={styles.headerRight}>
            {companyLogo && (
              <Image src={companyLogo} style={{ width: 100 }} />
            )}
            <Text>{companyName || 'Votre Entreprise'}</Text>
            <Text>{companyDetails || ''}</Text>
          </View>
        </View>

        {/* Informations générales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Générales</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Titre:</Text>
            <Text style={styles.value}>{intervention.title}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Priorité:</Text>
            <Text style={styles.value}>
              {intervention.priority === 'high' ? 'Élevée' :
               intervention.priority === 'medium' ? 'Moyenne' : 'Basse'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Statut:</Text>
            <Text style={styles.value}>
              {intervention.status === 'completed' ? 'Terminée' :
               intervention.status === 'in-progress' ? 'En cours' : 
               intervention.status === 'cancelled' ? 'Annulée' : 'Planifiée'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Technicien:</Text>
            <Text style={styles.value}>{technician || intervention.technician || 'Non assigné'}</Text>
          </View>
        </View>
        
        {/* Équipement */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Équipement</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nom:</Text>
            <Text style={styles.value}>{intervention.equipment}</Text>
          </View>
          {intervention.location && (
            <View style={styles.row}>
              <Text style={styles.label}>Localisation:</Text>
              <Text style={styles.value}>{intervention.location}</Text>
            </View>
          )}
        </View>
        
        {/* Description */}
        {intervention.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text>{intervention.description}</Text>
          </View>
        )}
        
        {/* Durée */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Temps</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Durée prévue:</Text>
            <Text style={styles.value}>{intervention.scheduledDuration || 'Non spécifié'} heure(s)</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Durée réelle:</Text>
            <Text style={styles.value}>{actualDuration || intervention.duration || 'Non spécifié'} heure(s)</Text>
          </View>
        </View>
        
        {/* Section des pièces utilisées */}
        {intervention.partsUsed && intervention.partsUsed.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pièces utilisées</Text>
            <View style={styles.table}>
              {/* En-têtes du tableau */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, styles.tableCol1]}>Désignation</Text>
                <Text style={[styles.tableCell, styles.tableCol2]}>Quantité</Text>
                <Text style={[styles.tableCell, styles.tableCol3]}>Prix unitaire</Text>
              </View>
              
              {/* Lignes du tableau */}
              {intervention.partsUsed.map((part, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.tableCol1]}>{part.name}</Text>
                  <Text style={[styles.tableCell, styles.tableCol2]}>{part.quantity}</Text>
                  <Text style={[styles.tableCell, styles.tableCol3]}>
                    {(part as PartUsed).unitPrice ? `${(part as PartUsed).unitPrice?.toFixed(2)} €` : '-'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Notes */}
        {(reportNotes || intervention.notes) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text>{reportNotes || intervention.notes}</Text>
          </View>
        )}
        
        {/* Images */}
        {images && images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Images</Text>
            {images.map((img, index) => (
              <Image key={index} src={img} style={styles.image} />
            ))}
          </View>
        )}
        
        {/* Signature */}
        {signature && (
          <View style={styles.signature}>
            <Text style={styles.sectionTitle}>Signature</Text>
            <Image src={signature} style={styles.signatureImage} />
          </View>
        )}
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text>Rapport généré le {new Date().toLocaleDateString('fr-FR')}</Text>
        </View>
      </Page>
    </Document>
  );
};
