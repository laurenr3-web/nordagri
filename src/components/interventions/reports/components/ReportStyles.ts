
import { StyleSheet } from '@react-pdf/renderer';

export const reportStyles = StyleSheet.create({
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 10,
    color: '#555555',
    textAlign: 'center',
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
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 5,
  },
  infoLabel: {
    width: '30%',
    fontWeight: 'bold',
    fontSize: 10,
  },
  infoValue: {
    width: '70%',
    fontSize: 10,
  },
  description: {
    fontSize: 10,
    marginBottom: 10,
    padding: 5,
    backgroundColor: '#f9f9f9',
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginVertical: 10,
    border: '1 solid #EEEEEE',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    fontSize: 10,
    padding: 5,
    textAlign: 'center',
  },
  tableCell: {
    fontSize: 9,
    padding: 5,
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
