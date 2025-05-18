
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

interface EquipmentSectionProps {
  equipment: string;
  equipmentId: number;
}

export const EquipmentSection: React.FC<EquipmentSectionProps> = ({ equipment, equipmentId }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Équipement</Text>
    <View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Équipement:</Text>
        <Text style={styles.infoValue}>{equipment}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>ID Équipement:</Text>
        <Text style={styles.infoValue}>{equipmentId}</Text>
      </View>
    </View>
  </View>
);
