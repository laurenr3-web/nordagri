
import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatDate } from '@/utils/dateHelpers';

const styles = StyleSheet.create({
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
});

interface ReportHeaderProps {
  id: number;
  date: string | Date;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ id, date }) => (
  <View style={styles.header}>
    <Text style={styles.title}>Rapport d'Intervention</Text>
    <Text style={styles.subtitle}>
      Référence: #{id} - 
      Date: {typeof date === 'string' 
              ? formatDate(new Date(date)) 
              : formatDate(date)}
    </Text>
  </View>
);
