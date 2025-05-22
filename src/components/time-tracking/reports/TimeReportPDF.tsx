
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { TimeReportPDFProps } from '@/utils/pdf-export/types';
import { styles } from '@/utils/pdf-export/styles';

export const TimeReportPDF: React.FC<TimeReportPDFProps> = ({
  month,
  summary,
  taskDistribution,
  topEquipment
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text>Rapport de suivi du temps</Text>
        <Text style={{ fontSize: 16, marginTop: 5 }}>{month}</Text>
      </View>

      <View style={styles.summary}>
        <Text style={styles.subheader}>Résumé</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Heures quotidiennes:</Text>
          <Text style={styles.summaryValue}>{summary.daily.toFixed(2)} h</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Heures hebdomadaires:</Text>
          <Text style={styles.summaryValue}>{summary.weekly.toFixed(2)} h</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Heures mensuelles:</Text>
          <Text style={styles.summaryValue}>{summary.monthly.toFixed(2)} h</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subheader}>Distribution par type de tâche</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, { width: '40%' }]}>Type de tâche</Text>
            <Text style={[styles.tableCell, { width: '30%' }]}>Heures</Text>
            <Text style={[styles.tableCell, { width: '30%' }]}>Pourcentage</Text>
          </View>
          {taskDistribution.map((task, i) => (
            <View style={styles.tableRow} key={i.toString()}>
              <Text style={[styles.tableCell, { width: '40%' }]}>{task.type}</Text>
              <Text style={[styles.tableCell, { width: '30%' }]}>{task.hours.toFixed(2)} h</Text>
              <Text style={[styles.tableCell, { width: '30%' }]}>{task.percentage.toFixed(1)}%</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subheader}>Équipements les plus utilisés</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, { width: '70%' }]}>Équipement</Text>
            <Text style={[styles.tableCell, { width: '30%' }]}>Heures</Text>
          </View>
          {topEquipment.map((equipment, i) => (
            <View style={styles.tableRow} key={i.toString()}>
              <Text style={[styles.tableCell, { width: '70%' }]}>{equipment.name}</Text>
              <Text style={[styles.tableCell, { width: '30%' }]}>{equipment.hours.toFixed(2)} h</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.footer}>
        Généré le {new Date().toLocaleDateString('fr-FR')} - NordAgri © {new Date().getFullYear()}
      </Text>
    </Page>
  </Document>
);
