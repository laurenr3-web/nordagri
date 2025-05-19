
import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer';
import { Intervention } from '@/types/Intervention';
import { formatDate } from '@/utils/dateHelpers';

// Register fonts for PDF
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmWUlfBBc9.ttf', fontWeight: 700 },
  ]
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto',
    fontSize: 12,
    lineHeight: 1.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: '1px solid #ddd',
    paddingBottom: 10,
  },
  logo: {
    width: 120,
    height: 'auto',
  },
  headerText: {
    textAlign: 'right',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 4,
  },
  infoSection: {
    marginBottom: 15,
  },
  table: {
    width: 'auto',
    borderWidth: 1,
    borderColor: '#e4e4e4',
    borderStyle: 'solid',
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e4',
    borderBottomStyle: 'solid',
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableCell: {
    padding: 6,
    fontSize: 10,
  },
  col20: { width: '20%' },
  col25: { width: '25%' },
  col30: { width: '30%' },
  col40: { width: '40%' },
  col50: { width: '50%' },
  col60: { width: '60%' },
  col80: { width: '80%' },
  flexRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  label: {
    fontWeight: 'bold',
    width: '30%',
    paddingRight: 10,
    fontSize: 10,
  },
  value: {
    width: '70%',
    fontSize: 10,
  },
  image: {
    width: 150,
    height: 150,
    objectFit: 'contain',
    margin: 5,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  signatureContainer: {
    marginTop: 40,
    borderTop: '1px solid #ddd',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: {
    width: '45%',
  },
  signatureLabel: {
    fontWeight: 'bold',
    marginBottom: 50,
    fontSize: 10,
  },
  signatureImage: {
    width: '100%',
    height: 50,
    objectFit: 'contain',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
    borderTop: '1px solid #ddd',
    paddingTop: 5,
  },
  notes: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    fontSize: 10,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 15,
    right: 30,
    fontSize: 8,
  },
});

interface InterventionReportPDFProps {
  intervention: Intervention;
  companyName?: string;
  companyLogo?: string;
  companyDetails?: string;
  signature?: string;
  reportNotes?: string;
  actualDuration?: number;
  images?: string[];
  technician?: string;
}

export const InterventionReportPDF: React.FC<InterventionReportPDFProps> = ({ 
  intervention,
  companyName = "NordAgri",
  companyLogo,
  companyDetails = "123 Rue Agricole, 59000 Lille\nTél: 03 20 12 34 56\nEmail: contact@nordagri.fr",
  signature,
  reportNotes,
  actualDuration,
  images = [],
  technician
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header with logo and company info */}
      <View style={styles.header}>
        <View>
          {companyLogo ? (
            <Image src={companyLogo} style={styles.logo} />
          ) : (
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{companyName}</Text>
          )}
        </View>
        <View style={styles.headerText}>
          <Text style={{ fontSize: 10 }}>{companyDetails}</Text>
        </View>
      </View>
      
      {/* Report title */}
      <Text style={styles.title}>RAPPORT D'INTERVENTION</Text>
      
      {/* General Information */}
      <Text style={styles.subtitle}>INFORMATIONS GÉNÉRALES</Text>
      <View style={styles.infoSection}>
        <View style={styles.flexRow}>
          <Text style={styles.label}>Référence:</Text>
          <Text style={styles.value}>#{intervention.id}</Text>
        </View>
        <View style={styles.flexRow}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>
            {typeof intervention.date === 'string' 
              ? formatDate(new Date(intervention.date))
              : formatDate(intervention.date)}
          </Text>
        </View>
        <View style={styles.flexRow}>
          <Text style={styles.label}>Priorité:</Text>
          <Text style={styles.value}>
            {intervention.priority === 'high' 
              ? 'Haute' 
              : intervention.priority === 'medium' 
                ? 'Moyenne'
                : 'Basse'}
          </Text>
        </View>
        <View style={styles.flexRow}>
          <Text style={styles.label}>Statut:</Text>
          <Text style={styles.value}>
            {intervention.status === 'completed' 
              ? 'Terminée' 
              : intervention.status === 'in-progress'
                ? 'En cours'
                : 'Planifiée'}
          </Text>
        </View>
        <View style={styles.flexRow}>
          <Text style={styles.label}>Technicien:</Text>
          <Text style={styles.value}>{technician || intervention.technician || 'Non assigné'}</Text>
        </View>
        <View style={styles.flexRow}>
          <Text style={styles.label}>Localisation:</Text>
          <Text style={styles.value}>{intervention.location || 'Non spécifiée'}</Text>
        </View>
      </View>
      
      {/* Equipment Information */}
      <Text style={styles.subtitle}>ÉQUIPEMENT</Text>
      <View style={styles.infoSection}>
        <View style={styles.flexRow}>
          <Text style={styles.label}>Équipement:</Text>
          <Text style={styles.value}>{intervention.equipment || 'Non spécifié'}</Text>
        </View>
        <View style={styles.flexRow}>
          <Text style={styles.label}>ID Équipement:</Text>
          <Text style={styles.value}>{intervention.equipmentId || 'Non spécifié'}</Text>
        </View>
      </View>
      
      {/* Intervention Description */}
      <Text style={styles.subtitle}>DESCRIPTION DE L'INTERVENTION</Text>
      <View style={styles.infoSection}>
        <Text style={{ fontSize: 10, marginBottom: 5 }}>{intervention.description || 'Aucune description fournie.'}</Text>
      </View>
      
      {/* Time Tracking */}
      <Text style={styles.subtitle}>TEMPS D'INTERVENTION</Text>
      <View style={styles.infoSection}>
        <View style={styles.flexRow}>
          <Text style={styles.label}>Durée planifiée:</Text>
          <Text style={styles.value}>{intervention.scheduledDuration || 0} heure(s)</Text>
        </View>
        <View style={styles.flexRow}>
          <Text style={styles.label}>Durée réelle:</Text>
          <Text style={styles.value}>{actualDuration || intervention.duration || 0} heure(s)</Text>
        </View>
      </View>
      
      {/* Parts Used - Table */}
      {intervention.partsUsed && intervention.partsUsed.length > 0 && (
        <>
          <Text style={styles.subtitle}>PIÈCES UTILISÉES</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.col40]}>Nom</Text>
              <Text style={[styles.tableCell, styles.col20]}>Quantité</Text>
              <Text style={[styles.tableCell, styles.col20]}>Prix unitaire</Text>
              <Text style={[styles.tableCell, styles.col20]}>Total</Text>
            </View>
            
            {intervention.partsUsed.map((part, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col40]}>{part.name}</Text>
                <Text style={[styles.tableCell, styles.col20]}>{part.quantity}</Text>
                <Text style={[styles.tableCell, styles.col20]}>{part.unitPrice ? `${part.unitPrice}€` : 'N/A'}</Text>
                <Text style={[styles.tableCell, styles.col20]}>
                  {part.unitPrice ? `${(part.quantity * part.unitPrice).toFixed(2)}€` : 'N/A'}
                </Text>
              </View>
            ))}
            
            {/* Total if pricing is available */}
            {intervention.partsUsed.some(part => part.unitPrice) && (
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, styles.col60]}>Total</Text>
                <Text style={[styles.tableCell, styles.col20]}></Text>
                <Text style={[styles.tableCell, styles.col20]}>
                  {intervention.partsUsed.reduce((sum, part) => 
                    sum + (part.quantity * (part.unitPrice || 0)), 0).toFixed(2)}€
                </Text>
              </View>
            )}
          </View>
        </>
      )}
      
      {/* Photos */}
      {images.length > 0 && (
        <>
          <Text style={styles.subtitle}>PHOTOS</Text>
          <View style={styles.imagesContainer}>
            {images.map((image, index) => (
              <Image key={index} src={image} style={styles.image} />
            ))}
          </View>
        </>
      )}
      
      {/* Notes */}
      <Text style={styles.subtitle}>NOTES</Text>
      <View style={styles.notes}>
        <Text>{intervention.notes || reportNotes || 'Aucune note supplémentaire.'}</Text>
      </View>
      
      {/* Signature */}
      <View style={styles.signatureContainer}>
        <View style={styles.signatureBox}>
          <Text style={styles.signatureLabel}>Signature du technicien:</Text>
          {signature && <Image src={signature} style={styles.signatureImage} />}
        </View>
        <View style={styles.signatureBox}>
          <Text style={styles.signatureLabel}>Signature du client:</Text>
        </View>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text>Rapport généré le {formatDate(new Date())} par le système Nordagri.</Text>
      </View>
      
      {/* Page Number */}
      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
        `${pageNumber} / ${totalPages}`
      )} fixed />
    </Page>
  </Document>
);

export default InterventionReportPDF;
