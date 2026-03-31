import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 20, // Reduced padding to save space
    fontSize: 8, // Reduced base font size
    fontFamily: 'Helvetica',
    color: '#1e293b',
  },
  contentWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  logoSection: {
    width: '35%',
  },
  companyInfo: {
    width: '55%',
    textAlign: 'right',
    fontSize: 8,
  },
  companyName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 2,
  },
  docTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    textAlign: 'center',
    marginVertical: 8,
    letterSpacing: 1.5,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoBox: {
    width: '45%',
  },
  infoTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    textDecoration: 'underline',
    marginBottom: 3,
  },
  table: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#000',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9', // Light gray for header distinction
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minHeight: 16,
    alignItems: 'center',
  },
  cell: {
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  cellLast: {
    padding: 3,
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

  totalsArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  totalsTable: {
    width: '35%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 1,
  },
  grandTotalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#000',
    padding: 3,
    marginTop: 3,
    backgroundColor: '#fff',
  },
  grandTotalLabel: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  grandTotalValue: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  vatText: {
    fontSize: 7,
    fontStyle: 'italic',
    marginTop: 5,
  },
  termsSection: {
    marginTop: 10,
  },
  termsTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 3,
  },
  termsText: {
    fontSize: 7.5,
    lineHeight: 1.2,
    color: '#1e293b',
  },
  footer: {
    marginTop: 'auto', // Push to bottom of content
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ef4444',
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
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
  const currency = profile?.currency || '$';
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
          qty: 1,
          total: item.value
        });
      });
    }
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.contentWrapper}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoSection}>
              {profile?.logoUrl ? (
                <Image src={profile.logoUrl} style={{ width: 80, height: 'auto' }} />
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
              )) : <Text>Bank details not configured.</Text>}
              {type === 'Invoice' && (
                <Text style={{ marginTop: 3, fontWeight: 'bold' }}>
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
              <Text style={[styles.cell, styles.colStart]}>Start</Text>
              <Text style={[styles.cell, styles.colEnd]}>End</Text>
              <Text style={[styles.cell, styles.colRate]}>{currency} / Hr</Text>
              <Text style={[styles.cell, styles.colMedics]}>Medics</Text>
              <Text style={[styles.cell, styles.colHrs]}>Hrs</Text>
              <Text style={[styles.cellLast, styles.colTotal]}>Total {currency}</Text>
            </View>
            {jobs.map((job: any, index: number) => (
              <View key={index} style={[styles.tableRow, index === jobs.length - 1 ? { borderBottomWidth: 0 } : {}]}>
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
          </View>

          {/* Auxiliary Table */}
          {allAuxItems.length > 0 && (
            <View style={[styles.table, { marginTop: 8 }]}>
              <View style={styles.tableHeader}>
                <Text style={[styles.cell, styles.colAux]}>Auxiliary Items</Text>
                <Text style={[styles.cell, styles.colUnitPrice]}>Unit Price</Text>
                <Text style={[styles.cell, styles.colQty]}>Qty</Text>
                <Text style={[styles.cellLast, styles.colAuxTotal]}>Total</Text>
              </View>
              {allAuxItems.map((item: any, index: number) => (
                <View key={index} style={[styles.tableRow, index === allAuxItems.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                  <Text style={[styles.cell, styles.colAux]}>{item.name}</Text>
                  <Text style={[styles.cell, styles.colUnitPrice]}>{item.value.toFixed(2)}</Text>
                  <Text style={[styles.cell, styles.colQty]}>{item.qty}</Text>
                  <Text style={[styles.cellLast, styles.colAuxTotal]}>{item.total.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Totals and VAT Area */}
          <View style={styles.totalsArea}>
            <Text style={styles.vatText}>Not VAT Registered</Text>
            <View style={styles.totalsTable}>
              <View style={styles.totalRow}>
                <Text>Subtotal:</Text>
                <Text>{currency}{subtotal.toFixed(2)}</Text>
              </View>
              {discountPercent > 0 && (
                <View style={styles.totalRow}>
                  <Text>Discount {discountPercent}%:</Text>
                  <Text>-{currency}{discountAmount.toFixed(2)}</Text>
                </View>
              )}
              <View style={styles.grandTotalBox}>
                <Text style={styles.grandTotalLabel}>Grand Total:</Text>
                <Text style={styles.grandTotalValue}>{currency}{grandTotal.toFixed(2)}</Text>
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
        </View>
      </Page>
    </Document>
  );
};

export default DocumentPDF;
