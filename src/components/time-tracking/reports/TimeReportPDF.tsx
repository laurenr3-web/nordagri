
import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TimeReportPDFProps } from '@/utils/pdf-export/types';

// Define PDF styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    padding: 30,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 20,
    borderBottom: '1px solid #CCCCCC',
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333333',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 10,
    color: '#555555',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444444',
    borderBottom: '1px solid #EEEEEE',
    paddingBottom: 5,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderBottom: '1px solid #EEEEEE',
    paddingBottom: 15,
  },
  summaryItem: {
    width: '30%',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  distributionContainer: {
    marginBottom: 15,
  },
  distributionItem: {
    marginBottom: 8,
  },
  distributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  distributionLabel: {
    width: '60%',
    fontSize: 10,
  },
  distributionValue: {
    width: '20%',
    fontSize: 10,
    textAlign: 'right',
  },
  distributionPercentage: {
    width: '20%',
    fontSize: 10,
    textAlign: 'right',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#EEEEEE',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#4F46E5',
  },
  equipmentContainer: {
    marginBottom: 15,
  },
  equipmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 5,
    borderBottom: '1px solid #EEEEEE',
  },
  equipmentName: {
    width: '60%',
    fontSize: 10,
  },
  equipmentHours: {
    width: '40%',
    fontSize: 10,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#666666',
    borderTop: '1px solid #CCCCCC',
    paddingTop: 10,
  }
});

export const TimeReportPDF: React.FC<TimeReportPDFProps> = ({ 
  month, 
  summary, 
  taskDistribution, 
  topEquipment 
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Rapport de Temps</Text>
          <Text style={styles.subtitle}>{month}</Text>
        </View>

        {/* Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumé</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Heures Aujourd'hui</Text>
              <Text style={styles.summaryValue}>{summary.daily.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Heures Cette Semaine</Text>
              <Text style={styles.summaryValue}>{summary.weekly.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Heures Ce Mois</Text>
              <Text style={styles.summaryValue}>{summary.monthly.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Task Distribution Section */}
        {taskDistribution.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Répartition par Type de Tâche</Text>
            <View style={styles.distributionContainer}>
              {taskDistribution.map((task, index) => (
                <View key={index} style={styles.distributionItem}>
                  <View style={styles.distributionRow}>
                    <Text style={styles.distributionLabel}>{task.type || 'Non spécifié'}</Text>
                    <Text style={styles.distributionValue}>{task.hours.toFixed(2)}h</Text>
                    <Text style={styles.distributionPercentage}>
                      {(task.percentage || 0).toFixed(1)}%
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${task.percentage || 0}%` }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Equipment Section */}
        {topEquipment.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Équipements les Plus Utilisés</Text>
            <View style={styles.equipmentContainer}>
              {topEquipment.map((equipment, index) => (
                <View key={index} style={styles.equipmentItem}>
                  <Text style={styles.equipmentName}>{equipment.name}</Text>
                  <Text style={styles.equipmentHours}>{equipment.hours.toFixed(2)} heures</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            {`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
