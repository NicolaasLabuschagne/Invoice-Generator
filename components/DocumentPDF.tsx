import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logoSection: {
    width: '40%',
  },
  companyInfo: {
    width: '50%',
    textAlign: 'right',
    fontSize: 9,
  },
  companyName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  docTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ef4444', // Red as in screenshot
    textAlign: 'center',
    marginVertical: 15,
    letterSpacing: 2,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  infoBox: {
    width: '45%',
  },
  infoTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    textDecoration: 'underline',
    marginBottom: 5,
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#000',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minHeight: 20,
    alignItems: 'center',
  },
  cell: {
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  cellLast: {
    padding: 4,
    borderRightWidth: 0,
  },
  // Main Table Columns
  colDate: { width: '12%' },
  colEvent: { width: '25%' },
  colStart: { width: '10%' },
  colEnd: { width: '10%' },
  colRate: { width: '12%', textAlign: 'right' },
  colMedics: { width: '8%', textAlign: 'center' },
  colHrs: { width: '10%', textAlign: 'center' },
  colTotal: { width: '13%', textAlign: 'right' },

  // Auxiliary Table Columns
  colAux: { width: '57%' },
  colUnitPrice: { width: '15%', textAlign: 'right' },
  colQty: { width: '13%', textAlign: 'center' },
  colAuxTotal: { width: '15%', textAlign: 'right' },

  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  totalsTable: {
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  grandTotalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#000',
    padding: 4,
    marginTop: 5,
    backgroundColor: '#fff',
  },
  grandTotalLabel: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  grandTotalValue: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  vatText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 8,
    fontStyle: 'italic',
  },
  termsSection: {
    marginTop: 30,
  },
  termsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 5,
  },
  termsText: {
    fontSize: 8,
    lineHeight: 1.3,
    color: '#2563eb',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ef4444',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#ef4444',
    fontStyle: 'italic',
  },
});

interface PDFProps {
  data: any;
  type: 'Quote' | 'Invoice';
  profile?: any;
}

const DocumentPDF: React.FC<PDFProps> = ({ data, type, profile }) => {
  const jobs = data.jobs || [];
  const subtotal = data.totalAmount || 0;
  const discountPercent = data.discount || 0;
  const discountAmount = (discountPercent / 100) * subtotal;
  const grandTotal = subtotal - discountAmount;

  // Group auxiliary items
  const allAuxItems: any[] = [];
  jobs.forEach((job: any) => {
    if (job.selectedItems && Array.isArray(job.selectedItems)) {
      job.selectedItems.forEach((item: any) => {
        allAuxItems.push({
          name: item.name,
          value: item.value,
          qty: 1, // Defaulting to 1 as current schema doesn't have qty per job item
          total: item.value
        });
      });
    }
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            {profile?.logoUrl ? (
              <Image src={profile.logoUrl} style={{ width: 120, height: 'auto' }} />
            ) : null}
          </View>
          <View style={styles.companyInfo}>
            <Text style={[styles.companyName, profile?.themeColor ? { color: profile.themeColor } : {}]}>
              {profile?.companyName || 'SERVICE SAAS CORP'}
            </Text>
            <Text>{profile?.companyAddress || '123 Service St, Business City'}</Text>
            <Text>Cell: {profile?.companyPhone || '+1 (555) 012-3456'}</Text>
            <Text>Email: {profile?.companyEmail || 'contact@servicesaas.com'}</Text>
            <Text>Private Ambulance Services</Text>
            <Text>{profile?.licenceInfo || 'Licence nr: WCPG44'}</Text>
          </View>
        </View>

        {/* Document Title */}
        <Text style={styles.docTitle}>{type === 'Quote' ? 'QUOTATION' : 'INVOICE'}</Text>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>BILL TO:</Text>
            <Text style={{ fontWeight: 'bold' }}>{data.client.name}</Text>
            <Text>{data.client.contactPerson}</Text>
            <Text>{data.client.address}</Text>
            <Text>{new Date(data.createdAt).toLocaleDateString()}</Text>
            <Text>{type === 'Quote' ? data.quoteNumber : data.invoiceNumber}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Payment Info:</Text>
            {profile?.bankInfo ? profile.bankInfo.split('\n').map((line: string, i: number) => (
              <Text key={i}>{line}</Text>
            )) : <Text>Bank details not configured in settings.</Text>}
            {type === 'Invoice' && (
              <Text style={{ marginTop: 5, fontWeight: 'bold' }}>
                Ref: {data.invoiceNumber}
              </Text>
            )}
          </View>
        </View>

        {/* Main Jobs Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.colDate]}>Date</Text>
            <Text style={[styles.cell, styles.colEvent]}>Event</Text>
            <Text style={[styles.cell, styles.colStart]}>Start Time</Text>
            <Text style={[styles.cell, styles.colEnd]}>End Time</Text>
            <Text style={[styles.cell, styles.colRate]}>R / Hr</Text>
            <Text style={[styles.cell, styles.colMedics]}>Medics</Text>
            <Text style={[styles.cell, styles.colHrs]}>Total Hrs</Text>
            <Text style={[styles.cellLast, styles.colTotal]}>Total R</Text>
          </View>
          {jobs.map((job: any, index: number) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.cell, styles.colDate]}>{new Date(job.date).toLocaleDateString()}</Text>
              <Text style={[styles.cell, styles.colEvent]}>{job.eventName}</Text>
              <Text style={[styles.cell, styles.colStart]}>{job.startTime || '-'}</Text>
              <Text style={[styles.cell, styles.colEnd]}>{job.endTime || '-'}</Text>
              <Text style={[styles.cell, styles.colRate]}>{job.hourlyRate.toFixed(2)}</Text>
              <Text style={[styles.cell, styles.colMedics]}>{job.medics}</Text>
              <Text style={[styles.cell, styles.colHrs]}>{job.hours.toFixed(2)}</Text>
              <Text style={[styles.cellLast, styles.colTotal]}>{(job.medics * job.hours * job.hourlyRate).toFixed(2)}</Text>
            </View>
          ))}
          {/* Empty rows to match design */}
          {[...Array(Math.max(0, 3 - jobs.length))].map((_, i) => (
            <View key={`empty-${i}`} style={styles.tableRow}>
              <Text style={[styles.cell, styles.colDate]}></Text>
              <Text style={[styles.cell, styles.colEvent]}></Text>
              <Text style={[styles.cell, styles.colStart]}></Text>
              <Text style={[styles.cell, styles.colEnd]}></Text>
              <Text style={[styles.cell, styles.colRate]}></Text>
              <Text style={[styles.cell, styles.colMedics]}></Text>
              <Text style={[styles.cell, styles.colHrs]}></Text>
              <Text style={[styles.cellLast, styles.colTotal]}></Text>
            </View>
          ))}
        </View>

        {/* Auxiliary Table */}
        <View style={[styles.table, { marginTop: 20 }]}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.colAux]}>Auxilairy</Text>
            <Text style={[styles.cell, styles.colUnitPrice]}>Unit Price</Text>
            <Text style={[styles.cell, styles.colQty]}>Qty</Text>
            <Text style={[styles.cellLast, styles.colAuxTotal]}>Total</Text>
          </View>
          {allAuxItems.map((item: any, index: number) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.cell, styles.colAux]}>{item.name}</Text>
              <Text style={[styles.cell, styles.colUnitPrice]}>{item.value.toFixed(2)}</Text>
              <Text style={[styles.cell, styles.colQty]}>{item.qty}</Text>
              <Text style={[styles.cellLast, styles.colAuxTotal]}>{item.total.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.tableRow}>
            <Text style={[styles.cell, styles.colAux]}>Equipment</Text>
            <Text style={[styles.cell, styles.colUnitPrice]}></Text>
            <Text style={[styles.cell, styles.colQty]}></Text>
            <Text style={[styles.cellLast, styles.colAuxTotal]}></Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.cell, styles.colAux]}>Transport</Text>
            <Text style={[styles.cell, styles.colUnitPrice]}></Text>
            <Text style={[styles.cell, styles.colQty]}></Text>
            <Text style={[styles.cellLast, styles.colAuxTotal]}></Text>
          </View>
        </View>

        {/* Totals and VAT */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          <Text style={styles.vatText}>Not VAT Registered</Text>
          <View style={styles.totalsTable}>
            <View style={styles.totalRow}>
              <Text>Invoice Total:</Text>
              <Text>R{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>Discount {discountPercent}%:</Text>
              <Text>R{discountAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.grandTotalBox}>
              <Text style={styles.grandTotalLabel}>Grand Total:</Text>
              <Text style={styles.grandTotalValue}>R{grandTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsSection}>
          <Text style={styles.termsTitle}>TERMS & CONDITIONS</Text>
          <Text style={styles.termsText}>
            {type === 'Quote'
              ? (profile?.quoteTemplate || 'PAYMENT:\n• A 50% deposit is required to confirm the booking.\n• The remaining balance must be paid on or before the event date.')
              : (profile?.invoiceTemplate || 'Thank you for your business!')
            }
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {profile?.licenceInfo ? profile.licenceInfo.split('\n').map((line: string, i: number) => (
            <Text key={i} style={styles.footerText}>{line}</Text>
          )) : (
            <Text style={styles.footerText}>Medical Services Licenced under WC Gov. Ambulance Services: Licence nr: 44 (23/7/4/122)</Text>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default DocumentPDF;
