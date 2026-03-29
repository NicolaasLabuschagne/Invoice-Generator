import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottomWidth: 2,
    borderBottomColor: '#1e293b',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  companyInfo: {
    textAlign: 'right',
  },
  clientInfo: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  table: {
    width: 'auto',
    marginBottom: 40,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    padding: 8,
  },
  col1: { width: '60%' },
  col2: { width: '20%', textAlign: 'center' },
  col3: { width: '20%', textAlign: 'right' },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  totalBox: {
    width: '40%',
    padding: 10,
    backgroundColor: '#1e293b',
    color: 'white',
    borderRadius: 4,
  },
  totalLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

interface PDFProps {
  data: any;
  type: 'Quote' | 'Invoice';
}

const DocumentPDF: React.FC<PDFProps> = ({ data, type }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{type.toUpperCase()}</Text>
          <Text style={{ marginTop: 4, color: '#64748b' }}>
            #{type === 'Quote' ? data.quoteNumber : data.invoiceNumber}
          </Text>
        </View>
        <View style={styles.companyInfo}>
          <Text style={{ fontWeight: 'bold' }}>Service SaaS Corp</Text>
          <Text>123 Service St, Business City</Text>
          <Text>contact@servicesaas.com</Text>
          <Text>+1 (555) 012-3456</Text>
        </View>
      </View>

      <View style={styles.clientInfo}>
        <Text style={styles.sectionTitle}>Bill To:</Text>
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>{data.client.name}</Text>
        <Text>Attn: {data.client.contactPerson}</Text>
        <Text>{data.client.address}</Text>
        <Text>{data.client.email}</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Description</Text>
          <Text style={styles.col2}>Date</Text>
          <Text style={styles.col3}>Amount</Text>
        </View>
        {data.jobs && data.jobs.length > 0 ? data.jobs.map((job: any) => (
          <View key={job.id} style={styles.tableRow}>
            <Text style={styles.col1}>{job.eventName} ({job.medics} medics x {job.hours} hrs)</Text>
            <Text style={styles.col2}>{new Date(job.date).toLocaleDateString()}</Text>
            <Text style={styles.col3}>${job.totalCost.toFixed(2)}</Text>
          </View>
        )) : (
          <View style={styles.tableRow}>
            <Text style={styles.col1}>Professional Services - Service Assignment</Text>
            <Text style={styles.col2}>{new Date(data.createdAt).toLocaleDateString()}</Text>
            <Text style={styles.col3}>${data.totalAmount.toFixed(2)}</Text>
          </View>
        )}
      </View>

      <View style={styles.totalSection}>
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total Amount Due</Text>
          <Text style={styles.totalAmount}>${data.totalAmount.toFixed(2)}</Text>
        </View>
      </View>

      <View style={{ marginTop: 60 }}>
        <Text style={styles.sectionTitle}>Terms & Conditions</Text>
        <Text style={{ color: '#64748b', lineHeight: 1.5 }}>
          Please make payment within 30 days of receiving this {type.toLowerCase()}.
          Quotes are valid for 15 days from the date of issue.
          Thank you for your business!
        </Text>
      </View>
    </Page>
  </Document>
);

export default DocumentPDF;
