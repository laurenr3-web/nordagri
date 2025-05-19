
import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { TimeEntriesPDFProps } from '@/utils/pdf-export/types';

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
  table: {
    display: 'table',
    width: 'auto',
    marginTop: 10,
    marginBottom: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#EEEEEE',
    borderBottom: '1px solid #CCCCCC',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #CCCCCC',
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
  },
  cell10: {
    width: '10%',
  },
  cell15: {
    width: '15%',
  },
  cell20: {
    width: '20%',
  },
  cell25: {
    width: '25%',
  },
  cell30: {
    width: '30%',
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

export const TimeEntriesPDF: React.FC<TimeEntriesPDFProps> = ({ title, subtitle, tableData }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            {tableData.headers.map((header, index) => (
              <Text 
                key={header.key} 
                style={[
                  styles.tableCell, 
                  header.key === 'date' ? styles.cell15 :
                  header.key === 'employee' ? styles.cell25 :
                  header.key === 'task' ? styles.cell25 :
                  header.key === 'equipment' ? styles.cell25 :
                  styles.cell10
                ]}
              >
                {header.label}
              </Text>
            ))}
          </View>

          {/* Table Rows */}
          {tableData.rows.map((row, rowIndex) => (
            <View 
              key={rowIndex} 
              style={rowIndex === tableData.rows.length - 1 ? styles.tableRowLast : styles.tableRow}
            >
              {tableData.headers.map((header) => (
                <Text 
                  key={`${rowIndex}-${header.key}`} 
                  style={[
                    styles.tableCell, 
                    header.key === 'date' ? styles.cell15 :
                    header.key === 'employee' ? styles.cell25 :
                    header.key === 'task' ? styles.cell25 :
                    header.key === 'equipment' ? styles.cell25 :
                    styles.cell10
                  ]}
                >
                  {row[header.key]?.toString() || ''}
                </Text>
              ))}
            </View>
          ))}
        </View>

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
