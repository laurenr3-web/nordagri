
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { TimeReportPDFProps } from './types';
import { styles } from './styles';

export const TimeReportPDF: React.FC<TimeReportPDFProps> = ({ 
  month, 
  summary, 
  taskDistribution, 
  topEquipment 
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Rapport de temps</Text>
        <Text style={styles.subtitle}>{month}</Text>
      </View>
      
      {/* Summary Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Récapitulatif des heures</Text>
        <View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Heures aujourd'hui:</Text>
            <Text style={styles.summaryValue}>{summary.daily.toFixed(1)}h</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Heures cette semaine:</Text>
            <Text style={styles.summaryValue}>{summary.weekly.toFixed(1)}h</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Heures ce mois:</Text>
            <Text style={styles.summaryValue}>{summary.monthly.toFixed(1)}h</Text>
          </View>
        </View>
      </View>
      
      {/* Task Distribution Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Répartition par type de tâche</Text>
        <View>
          {taskDistribution.map((task, index) => (
            <View key={`task-${index}`} style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{task.type}:</Text>
              <Text style={styles.summaryValue}>{task.hours.toFixed(1)}h ({task.percentage.toFixed(1)}%)</Text>
            </View>
          ))}
        </View>
      </View>
      
      {/* Top Equipment Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Équipements les plus utilisés</Text>
        <View>
          {topEquipment.map((equipment, index) => (
            <View key={`equipment-${index}`} style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{equipment.name}:</Text>
              <Text style={styles.summaryValue}>{equipment.hours.toFixed(1)}h</Text>
            </View>
          ))}
        </View>
      </View>
      
      <Text style={styles.footer}>
        Généré le {new Date().toLocaleString('fr-FR')} - NordAgri © {new Date().getFullYear()}
      </Text>
    </Page>
  </Document>
);
