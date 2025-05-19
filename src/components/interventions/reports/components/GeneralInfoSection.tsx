
import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatDate } from '@/utils/dateHelpers';
import { Intervention } from '@/types/Intervention';

const styles = StyleSheet.create({
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
});

interface GeneralInfoSectionProps {
  intervention: Intervention;
}

export const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({ intervention }) => {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Planifiée';
      case 'in-progress': return 'En cours';
      case 'completed': return 'Terminée';
      case 'canceled': return 'Annulée';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return priority;
    }
  };

  return (
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
            {getStatusLabel(intervention.status)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Priorité:</Text>
          <Text style={styles.infoValue}>
            {getPriorityLabel(intervention.priority)}
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
  );
};
