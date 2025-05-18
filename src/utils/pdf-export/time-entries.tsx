
import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { TimeEntriesPDFProps } from './types';
import { styles } from './styles';

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
