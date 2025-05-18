
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Intervention } from '@/types/Intervention';
import { formatDate } from '@/utils/dateHelpers';

// Définition des styles pour le PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f6f6f6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 10,
    color: '#555555',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    padding: 5,
    backgroundColor: '#f0f0f0',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 5,
  },
  infoLabel: {
    width: '30%',
    fontWeight: 'bold',
    fontSize: 10,
  },
  infoValue: {
    width: '70%',
    fontSize: 10,
  },
  description: {
    fontSize: 10,
    marginBottom: 10,
    padding: 5,
    backgroundColor: '#f9f9f9',
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginVertical: 10,
    border: '1 solid #EEEEEE',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    fontSize: 10,
    padding: 5,
    textAlign: 'center',
  },
  tableCell: {
    fontSize: 9,
    padding: 5,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#999999',
  },
});

interface InterventionReportPDFProps {
  intervention: Intervention;
  reportNotes?: string;
  actualDuration?: number;
}

export const InterventionReportPDF: React.FC<InterventionReportPDFProps> = ({ 
  intervention,
  reportNotes,
  actualDuration
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Rapport d'Intervention</Text>
        <Text style={styles.subtitle}>
          Référence: #{intervention.id} - 
          Date: {typeof intervention.date === 'string' 
                  ? formatDate(new Date(intervention.date)) 
                  : formatDate(intervention.date)}
        </Text>
      </View>
      
      {/* Informations générales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations Générales</Text>
        <View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Titre:</Text>
            <Text style={styles.infoValue}>{intervention.title}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>
              {typeof intervention.date === 'string' 
                ? formatDate(new Date(intervention.date)) 
                : formatDate(intervention.date)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Statut:</Text>
            <Text style={styles.infoValue}>
              {intervention.status === 'scheduled' && 'Planifiée'}
              {intervention.status === 'in-progress' && 'En cours'}
              {intervention.status === 'completed' && 'Terminée'}
              {intervention.status === 'canceled' && 'Annulée'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Priorité:</Text>
            <Text style={styles.infoValue}>
              {intervention.priority === 'high' && 'Haute'}
              {intervention.priority === 'medium' && 'Moyenne'}
              {intervention.priority === 'low' && 'Basse'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Technicien:</Text>
            <Text style={styles.infoValue}>{intervention.technician || 'Non assigné'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Lieu:</Text>
            <Text style={styles.infoValue}>{intervention.location}</Text>
          </View>
        </View>
      </View>
      
      {/* Equipement */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Équipement</Text>
        <View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Équipement:</Text>
            <Text style={styles.infoValue}>{intervention.equipment}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID Équipement:</Text>
            <Text style={styles.infoValue}>{intervention.equipmentId}</Text>
          </View>
        </View>
      </View>
      
      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description de l'intervention</Text>
        <Text style={styles.description}>{intervention.description}</Text>
      </View>
      
      {/* Temps et durée */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Temps et durée</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Durée prévue:</Text>
          <Text style={styles.infoValue}>{intervention.scheduledDuration} heure(s)</Text>
        </View>
        {(intervention.status === 'completed' || actualDuration) && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Durée réelle:</Text>
            <Text style={styles.infoValue}>{actualDuration || intervention.duration} heure(s)</Text>
          </View>
        )}
      </View>
      
      {/* Pièces utilisées */}
      {intervention.partsUsed && intervention.partsUsed.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pièces utilisées</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableHeaderCell, { width: '10%' }]}>ID</Text>
              <Text style={[styles.tableHeaderCell, { width: '60%' }]}>Nom</Text>
              <Text style={[styles.tableHeaderCell, { width: '30%' }]}>Quantité</Text>
            </View>
            {intervention.partsUsed.map((part, index) => (
              <View key={`part-${index}`} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '10%' }]}>{part.partId}</Text>
                <Text style={[styles.tableCell, { width: '60%' }]}>{part.name}</Text>
                <Text style={[styles.tableCell, { width: '30%' }]}>{part.quantity}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {/* Notes de rapport */}
      {(reportNotes || intervention.notes) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes et observations</Text>
          <Text style={styles.description}>
            {reportNotes || intervention.notes}
          </Text>
        </View>
      )}
      
      <Text style={styles.footer}>
        Rapport généré le {formatDate(new Date())} - NordAgri © {new Date().getFullYear()}
      </Text>
    </Page>
  </Document>
);

export default InterventionReportPDF;
