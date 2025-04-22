
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
  table: {
    display: 'flex',
    width: 'auto',
    marginVertical: 10,
    borderColor: '#EEEEEE',
    borderWidth: 1,
  },
  tableRow: {
    margin: 'auto',
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

interface PDFDocumentProps {
  title: string;
  subtitle: string;
  headers: { label: string; key: string }[];
  data: any[];
}

// Generic PDF document component
const PDFDocument: React.FC<PDFDocumentProps> = ({ title, subtitle, headers, data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      
      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          {headers.map((header, index) => (
            <Text 
              key={index.toString()} 
              style={[styles.tableHeaderCell, { width: `${100 / headers.length}%` }]}
            >
              {header.label}
            </Text>
          ))}
        </View>
        
        {/* Table Rows */}
        {data.map((row, rowIndex) => (
          <View 
            key={rowIndex.toString()} 
            style={[styles.tableRow, { backgroundColor: rowIndex % 2 === 0 ? '#FFFFFF' : '#F9F9F9' }]}
          >
            {headers.map((header, cellIndex) => (
              <Text 
                key={cellIndex.toString()} 
                style={[styles.tableCell, { width: `${100 / headers.length}%` }]}
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

// Export data as PDF
export const exportToPDF = async (
  data: any[], 
  headers: { label: string; key: string }[], 
  title: string, 
  subtitle: string,
  filename: string
): Promise<void> => {
  const blob = await pdf(
    <PDFDocument 
      title={title}
      subtitle={subtitle}
      headers={headers}
      data={data}
    />
  ).toBlob();
  
  saveAs(blob, `${filename}.pdf`);
};

// Format data for export
export const formatDataForExport = (data: any[], mapFunction?: (item: any) => any) => {
  if (!data || data.length === 0) return [];
  
  if (mapFunction) {
    return data.map(mapFunction);
  }
  
  return data;
};
