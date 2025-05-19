
import React from 'react';
import { Text, StyleSheet } from '@react-pdf/renderer';
import { formatDate } from '@/utils/dateHelpers';

const styles = StyleSheet.create({
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

export const ReportFooter: React.FC = () => (
  <Text style={styles.footer}>
    Rapport généré le {formatDate(new Date())} - NordAgri © {new Date().getFullYear()}
  </Text>
);
