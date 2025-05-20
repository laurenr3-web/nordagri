
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { TimeEntriesPDFProps } from '@/utils/pdf-export/types';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 24,
    marginBottom: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableHeaderCell: {
    padding: 5,
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: 'grey',
  },
});

export const TimeEntriesPDF: React.FC<TimeEntriesPDFProps> = ({ 
  title, 
  subtitle, 
  tableData 
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View>
        <Text style={styles.header}>{title}</Text>
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
