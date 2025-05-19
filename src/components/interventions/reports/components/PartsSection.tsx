
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
});

interface Part {
  partId: number;
  name: string;
  quantity: number;
}

interface PartsSectionProps {
  parts: Part[];
}

export const PartsSection: React.FC<PartsSectionProps> = ({ parts }) => {
  if (!parts || parts.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Pièces utilisées</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableHeaderCell, { width: '10%' }]}>ID</Text>
          <Text style={[styles.tableHeaderCell, { width: '60%' }]}>Nom</Text>
          <Text style={[styles.tableHeaderCell, { width: '30%' }]}>Quantité</Text>
        </View>
        {parts.map((part, index) => (
          <View key={`part-${index}`} style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '10%' }]}>{part.partId}</Text>
            <Text style={[styles.tableCell, { width: '60%' }]}>{part.name}</Text>
            <Text style={[styles.tableCell, { width: '30%' }]}>{part.quantity}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
