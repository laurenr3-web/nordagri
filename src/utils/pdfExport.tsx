import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f6f6f6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 5,
    color: '#555555',
  },
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
    borderColor: '#EEEEEE',
    borderWidth: 1,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    fontSize: 10,
    padding: 5,
    textAlign: 'center',
  },
  tableCell: {
    padding: 5,
    fontSize: 9,
    textAlign: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  summaryValue: {
    fontSize: 10,
  },
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

interface TimeReportPDFProps {
  month: string;
  summary: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  taskDistribution: Array<{
    type: string;
    hours: number;
    percentage: number;
  }>;
  topEquipment: Array<{
    name: string;
    hours: number;
  }>;
}

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

interface TableData {
  headers: { key: string; label: string }[];
  rows: Record<string, any>[];
}

interface TimeEntriesPDFProps {
  title: string;
  subtitle: string;
  tableData: TableData;
}

export const TimeEntriesPDF: React.FC<TimeEntriesPDFProps> = ({ 
  title, 
  subtitle, 
  tableData 
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      
      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          {tableData.headers.map((header, index) => (
            <Text 
              key={index.toString()} 
              style={[styles.tableHeaderCell, { width: `${100 / tableData.headers.length}%` }]}
            >
              {header.label}
            </Text>
          ))}
        </View>
        
        {/* Table Rows */}
        {tableData.rows.map((row, rowIndex) => (
          <View 
            key={rowIndex.toString()} 
            style={[styles.tableRow, { backgroundColor: rowIndex % 2 === 0 ? '#FFFFFF' : '#F9F9F9' }]}
          >
            {tableData.headers.map((header, cellIndex) => (
              <Text 
                key={cellIndex.toString()} 
                style={[styles.tableCell, { width: `${100 / tableData.headers.length}%` }]}
              >
                {row[header.key]?.toString() || ''}
              </Text>
            ))}
          </View>
        ))}
      </View>
      
      <Text style={styles.footer}>
        Généré le {new Date().toLocaleString('fr-FR')} - NordAgri © {new Date().getFullYear()}
      </Text>
    </Page>
  </Document>
);

export const exportTimeReportToPDF = async (
  month: string,
  summary: {
    daily: number;
    weekly: number;
    monthly: number;
  },
  taskDistribution: Array<{
    type: string;
    hours: number;
    percentage: number;
  }>,
  topEquipment: Array<{
    name: string;
    hours: number;
  }>,
  filename: string = 'rapport-de-temps'
): Promise<void> => {
  const blob = await pdf(
    <TimeReportPDF 
      month={month}
      summary={summary}
      taskDistribution={taskDistribution}
      topEquipment={topEquipment}
    />
  ).toBlob();
  
  saveAs(blob, `${filename}.pdf`);
};

export const exportTimeEntriesToPDF = async (
  title: string,
  subtitle: string,
  tableData: TableData,
  filename: string = 'sessions-de-temps'
): Promise<void> => {
  const blob = await pdf(
    <TimeEntriesPDF 
      title={title}
      subtitle={subtitle}
      tableData={tableData}
    />
  ).toBlob();
  
  saveAs(blob, `${filename}.pdf`);
};
