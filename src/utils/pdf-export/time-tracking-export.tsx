
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { TableData, TimeReportPDFProps } from './types';

// Implement a simple TimeReportPDF component since it's missing
const TimeReportPDF = ({ month, summary, taskDistribution, topEquipment }: TimeReportPDFProps) => (
  <Document>
    <Page size="A4" style={{ padding: 30, fontFamily: 'Helvetica' }}>
      <View>
        <Text style={{ fontSize: 24, marginBottom: 20 }}>Rapport du temps - {month}</Text>
        
        <Text style={{ fontSize: 18, marginTop: 20, marginBottom: 10 }}>Résumé</Text>
        <View style={{ marginBottom: 20 }}>
          <Text>Temps aujourd'hui: {summary.daily.toFixed(1)} heures</Text>
          <Text>Temps cette semaine: {summary.weekly.toFixed(1)} heures</Text>
          <Text>Temps ce mois: {summary.monthly.toFixed(1)} heures</Text>
        </View>
        
        <Text style={{ fontSize: 18, marginTop: 20, marginBottom: 10 }}>Distribution par type de tâche</Text>
        {taskDistribution.map((task, i) => (
          <View key={i} style={{ flexDirection: 'row', marginBottom: 5 }}>
            <Text style={{ width: '60%' }}>{task.type}</Text>
            <Text style={{ width: '20%' }}>{task.hours.toFixed(1)}h</Text>
            <Text style={{ width: '20%' }}>{task.percentage.toFixed(1)}%</Text>
          </View>
        ))}
        
        <Text style={{ fontSize: 18, marginTop: 20, marginBottom: 10 }}>Équipement le plus utilisé</Text>
        {topEquipment.map((equipment, i) => (
          <View key={i} style={{ flexDirection: 'row', marginBottom: 5 }}>
            <Text style={{ width: '70%' }}>{equipment.name}</Text>
            <Text style={{ width: '30%' }}>{equipment.hours.toFixed(1)}h</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

// Implement a simple TimeEntriesPDF component since it's missing
const TimeEntriesPDF = ({ title, subtitle, tableData }: { title: string, subtitle: string, tableData: TableData }) => (
  <Document>
    <Page size="A4" style={{ padding: 30, fontFamily: 'Helvetica' }}>
      <View>
        <Text style={{ fontSize: 24, marginBottom: 10 }}>{title}</Text>
        <Text style={{ fontSize: 16, marginBottom: 20 }}>{subtitle}</Text>
        
        <View style={{ marginBottom: 10, flexDirection: 'row', borderBottomWidth: 1, paddingBottom: 5 }}>
          {tableData.headers.map((header, index) => (
            <Text 
              key={index} 
              style={{ 
                fontWeight: 'bold',
                width: `${100 / tableData.headers.length}%` 
              }}
            >
              {header.label}
            </Text>
          ))}
        </View>
        
        {tableData.rows.map((row, rowIndex) => (
          <View 
            key={rowIndex} 
            style={{ 
              flexDirection: 'row', 
              marginBottom: 5,
              backgroundColor: rowIndex % 2 === 0 ? '#f9f9f9' : '#ffffff'
            }}
          >
            {tableData.headers.map((header, cellIndex) => (
              <Text 
                key={cellIndex} 
                style={{ width: `${100 / tableData.headers.length}%` }}
              >
                {row[header.key]?.toString() || ''}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export const exportTimeReportToPDF = async (
  month: string,
  summary: TimeReportPDFProps['summary'],
  taskDistribution: TimeReportPDFProps['taskDistribution'],
  topEquipment: TimeReportPDFProps['topEquipment'],
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
