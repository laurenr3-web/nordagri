
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
    display: 'table',
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

// Generic PDF document component
const PDFDocument = ({ title, subtitle, headers, data }: { 
  title: string; 
  subtitle: string; 
  headers: { label: string; key: string }[]; 
  data: any[] 
}) => (
  Document({
    children: Page({
      size: "A4",
      style: styles.page,
      children: [
        View({
          style: styles.header,
          children: [
            Text({
              style: styles.title,
              children: title
            }),
            Text({
              style: styles.subtitle,
              children: subtitle
            })
          ]
        }),
        
        View({
          style: styles.table,
          children: [
            // Table Header
            View({
              style: [styles.tableRow, styles.tableHeader],
              children: headers.map((header, index) => (
                Text({
                  key: index.toString(),
                  style: [styles.tableHeaderCell, { width: `${100 / headers.length}%` }],
                  children: header.label
                })
              ))
            }),
            
            // Table Rows
            ...data.map((row, rowIndex) => (
              View({
                key: rowIndex.toString(),
                style: [styles.tableRow, { backgroundColor: rowIndex % 2 === 0 ? '#FFFFFF' : '#F9F9F9' }],
                children: headers.map((header, cellIndex) => (
                  Text({
                    key: cellIndex.toString(),
                    style: [styles.tableCell, { width: `${100 / headers.length}%` }],
                    children: row[header.key]?.toString() || ''
                  })
                ))
              })
            ))
          ]
        }),
        
        Text({
          style: styles.footer,
          children: `Généré le ${new Date().toLocaleString('fr-FR')} - NordAgri © ${new Date().getFullYear()}`
        })
      ]
    })
  })
);

// Export data as PDF
export const exportToPDF = async (
  data: any[], 
  headers: { label: string; key: string }[], 
  title: string, 
  subtitle: string,
  filename: string
) => {
  const blob = await pdf(
    PDFDocument({
      title,
      subtitle,
      headers,
      data
    })
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
