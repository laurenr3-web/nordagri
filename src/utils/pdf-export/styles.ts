
import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
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
