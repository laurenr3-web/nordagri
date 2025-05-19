
import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';

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

interface TimeSectionProps {
  scheduledDuration?: number;
  actualDuration?: number;
  status: string;
}

export const TimeSection: React.FC<TimeSectionProps> = ({ scheduledDuration, actualDuration, status }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Temps et durée</Text>
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>Durée prévue:</Text>
      <Text style={styles.infoValue}>{scheduledDuration} heure(s)</Text>
    </View>
    {(status === 'completed' || actualDuration) && (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Durée réelle:</Text>
        <Text style={styles.infoValue}>{actualDuration} heure(s)</Text>
      </View>
    )}
  </View>
);
