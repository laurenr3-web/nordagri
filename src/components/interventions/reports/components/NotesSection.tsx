
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
  description: {
    fontSize: 10,
    marginBottom: 10,
    padding: 5,
    backgroundColor: '#f9f9f9',
  },
});

interface NotesSectionProps {
  notes?: string;
  reportNotes?: string;
}

export const NotesSection: React.FC<NotesSectionProps> = ({ notes, reportNotes }) => {
  if (!notes && !reportNotes) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notes et observations</Text>
      <Text style={styles.description}>
        {reportNotes || notes}
      </Text>
    </View>
  );
};
