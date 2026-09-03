import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, Transaction, InstituteSettings } from '../types';
import { numberToWordsInINR } from '../services/storageService';

/**
 * Generate and download single student Fee Receipt PDF (A5 format)
 */
export function generateStudentFeeReceiptPDF(student: Student, settings: InstituteSettings): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5',
  });

  const onlineCharges = student.onlineCharges || settings.defaultOnlineCharge || 30;
  const totalAmount = student.totalFee || (student.baseFee + onlineCharges);
  const paidAmount = student.paidAmount;
  const balanceDue = Math.max(0, totalAmount - paidAmount);
  const receiptNo = student.lastReceiptNo || `REC/${settings.academicYear.slice(2, 4)}/0108`;
  const paymentDate = student.paymentDate || new Date().toLocaleString('en-IN');
  const amountInWords = numberToWordsInINR(paidAmount > 0 ? paidAmount : totalAmount);

  // Outer Border Frame
  doc.setLineWidth(0.8);
  doc.setDrawColor(50, 50, 50);
  doc.rect(5, 5, 138, 200);

  doc.setLineWidth(0.3);
  doc.rect(6.5, 6.5, 135, 197);

  // Institution Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text(settings.name.toUpperCase(), 74, 15, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  doc.text(settings.subTitle, 74, 19.5, { align: 'center' });
  doc.text(`${settings.address} ${settings.code ? '| Code: ' + settings.code : ''}`, 74, 23.5, { align: 'center' });

  // Receipt Banner
  doc.setFillColor(46, 91, 80); // #2E5B50
  doc.rect(10, 26, 128, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`FEE RECEIPT — SESSION ${settings.academicYear}`, 74, 30, { align: 'center' });

  // Receipt No & Date Row
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 40);
  doc.text(`Receipt No: ${receiptNo}`, 10, 36.5);
  doc.text(`Date: ${paymentDate}`, 138, 36.5, { align: 'right' });
  doc.setDrawColor(200, 200, 200);
  doc.line(10, 38, 138, 38);

  // Student Details Grid
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Details:', 10, 42.5);

  const leftColX = 10;
  const rightColX = 75;
  let currentY = 47;

  doc.setFont('helvetica', 'normal');
  doc.text(`Reg. No:`, leftColX, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${student.registrationNo}`, leftColX + 22, currentY);

  doc.setFont('helvetica', 'normal');
  doc.text(`Caste Category:`, rightColX, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${student.casteCategory || 'General'}`, rightColX + 24, currentY);

  currentY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.text(`Student Name:`, leftColX, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${student.studentName}`, leftColX + 22, currentY);

  doc.setFont('helvetica', 'normal');
  doc.text(`Exam Type:`, rightColX, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${student.examType || 'REGULAR'}`, rightColX + 24, currentY);

  currentY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.text(`Father Name:`, leftColX, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${student.fatherName}`, leftColX + 22, currentY);

  doc.setFont('helvetica', 'normal');
  doc.text(`Mother Name:`, rightColX, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${student.motherName || 'N/A'}`, rightColX + 24, currentY);

  currentY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.text(`Class/Stream:`, leftColX, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${student.classOrStream || 'Intermediate (12th)'}`, leftColX + 22, currentY);

  doc.setFont('helvetica', 'normal');
  doc.text(`Date of Birth:`, rightColX, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(`${student.dob || 'N/A'}`, rightColX + 24, currentY);

  currentY += 4;
  doc.line(10, currentY, 138, currentY);
  currentY += 3;

  // Fee Table using autotable
  autoTable(doc, {
    startY: currentY,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    headStyles: {
      fillColor: [74, 69, 62],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 30, 30],
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 86 },
      2: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
    },
    head: [['S.N.', 'Fee Head / Particulars', 'Amount (Rs.)']],
    body: [
      ['1.', `Board Exam Registration Fee (${student.casteCategory})`, `Rs. ${(student.baseFee || 0).toLocaleString('en-IN')}.00`],
      ['2.', `Online Processing & Portal Charge (Extra)`, `Rs. ${(onlineCharges || 30).toLocaleString('en-IN')}.00`],
      ['', 'TOTAL PAYABLE FEE:', `Rs. ${(totalAmount || 0).toLocaleString('en-IN')}.00`],
      ['', 'AMOUNT RECEIVED PAID:', `Rs. ${(paidAmount || 0).toLocaleString('en-IN')}.00`],
      ...(balanceDue > 0
        ? [['', 'BALANCE DUE REMAINING:', `Rs. ${(balanceDue || 0).toLocaleString('en-IN')}.00`]]
        : []),
    ],
  });

  // @ts-expect-error - autotable adds lastAutoTable property
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 4 : 130;

  // Amount in Words Box
  doc.setFillColor(245, 245, 240);
  doc.rect(10, finalY, 128, 7, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(50, 50, 50);
  doc.text(`Amount in Words: `, 12, finalY + 4.5);
  doc.setFont('helvetica', 'bold');
  doc.text(amountInWords, 35, finalY + 4.5);

  // Payment Mode & Ref
  let footerY = finalY + 11;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Payment Mode: ${student.paymentMode || 'CASH'}`, 10, footerY);
  doc.text(`Txn Ref / UTR: ${student.transactionRef || 'N/A'}`, 75, footerY);

  footerY += 16;

  // Stamp and Signatures
  doc.setFontSize(7.5);
  doc.text('Student / Guardian Signature', 10, footerY);
  doc.line(10, footerY - 5, 45, footerY - 5);

  doc.setDrawColor(74, 69, 62);
  doc.rect(58, footerY - 10, 28, 10, 'S');
  doc.setFontSize(6.5);
  doc.text('[ COLLEGE STAMP ]', 72, footerY - 4, { align: 'center' });

  doc.setFontSize(7.5);
  doc.text('Authorized Cashier Sign', 138, footerY, { align: 'right' });
  doc.line(100, footerY - 5, 138, footerY - 5);

  // Bottom Note
  doc.setFontSize(6.5);
  doc.setTextColor(120, 120, 120);
  doc.text('Note: Official computer-generated receipt. Keep safely for mark sheet collection.', 74, footerY + 7, { align: 'center' });

  return doc;
}

/**
 * Download single student PDF fee receipt
 */
export function downloadStudentFeeReceiptPDF(student: Student, settings: InstituteSettings) {
  const doc = generateStudentFeeReceiptPDF(student, settings);
  const fileName = `Fee_Receipt_${student.registrationNo}_${student.studentName.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}

/**
 * Generate and download COMPLETE Transaction Ledger PDF (Multi-page report)
 */
export function downloadCompleteTransactionLedgerPDF(
  transactions: Transaction[],
  settings: InstituteSettings,
  filterDescription: string = 'All Recorded Transactions'
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const totalRevenue = transactions.reduce((acc, t) => acc + (t.paidAmount || 0), 0);
  const totalOnlineCharges = transactions.reduce((acc, t) => acc + (t.onlineCharges || 30), 0);
  const cashTotal = transactions.filter(t => t.paymentMode === 'CASH').reduce((acc, t) => acc + (t.paidAmount || 0), 0);
  const onlineTotal = transactions.filter(t => t.paymentMode !== 'CASH').reduce((acc, t) => acc + (t.paidAmount || 0), 0);

  // Header Banner
  doc.setFillColor(74, 69, 62); // #4A453E
  doc.rect(0, 0, 297, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(settings.name.toUpperCase(), 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${settings.subTitle} | Session ${settings.academicYear}`, 14, 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('FINANCIAL TRANSACTION AUDIT LEDGER', 283, 11, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report Generated: ${new Date().toLocaleString('en-IN')}`, 283, 18, { align: 'right' });

  // Summary Metrics Bar
  doc.setFillColor(245, 244, 238);
  doc.rect(14, 28, 269, 14, 'F');
  doc.setDrawColor(220, 215, 200);
  doc.rect(14, 28, 269, 14, 'S');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);

  doc.text(`Total Transactions: `, 20, 36);
  doc.setFont('helvetica', 'bold');
  doc.text(`${transactions.length}`, 52, 36);

  doc.setFont('helvetica', 'normal');
  doc.text(`Total Revenue Collected: `, 75, 36);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(46, 91, 80); // green accent
  doc.text(`Rs. ${totalRevenue.toLocaleString('en-IN')}`, 115, 36);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`Cash: `, 155, 36);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs. ${cashTotal.toLocaleString('en-IN')}`, 166, 36);

  doc.setFont('helvetica', 'normal');
  doc.text(`Online/UPI: `, 198, 36);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs. ${onlineTotal.toLocaleString('en-IN')}`, 218, 36);

  doc.setFont('helvetica', 'normal');
  doc.text(`Online Charges: `, 245, 36);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs. ${totalOnlineCharges.toLocaleString('en-IN')}`, 271, 36);

  // Filter description note
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'italic');
  doc.text(`Filter View: ${filterDescription}`, 14, 46);

  // Transactions Table
  const tableData = transactions.map((txn, index) => [
    (index + 1).toString(),
    txn.receiptNo,
    txn.paymentDate || 'N/A',
    txn.registrationNo,
    txn.studentName,
    txn.classOrStream || 'Intermediate',
    (txn as unknown as { casteCategory?: string }).casteCategory || 'General',
    txn.paymentMode || 'CASH',
    txn.transactionRef || '-',
    `Rs. ${(txn.baseFee || 0).toLocaleString('en-IN')}`,
    `Rs. ${(txn.onlineCharges || 30).toLocaleString('en-IN')}`,
    `Rs. ${(txn.paidAmount || 0).toLocaleString('en-IN')}`,
  ]);

  autoTable(doc, {
    startY: 49,
    margin: { left: 14, right: 14, bottom: 15 },
    theme: 'striped',
    headStyles: {
      fillColor: [46, 91, 80], // #2E5B50
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 30, 30],
    },
    columnStyles: {
      0: { cellWidth: 9, halign: 'center' }, // S.No
      1: { cellWidth: 28, fontStyle: 'bold' }, // Receipt No
      2: { cellWidth: 26 }, // Date
      3: { cellWidth: 26, fontStyle: 'bold' }, // Reg No
      4: { cellWidth: 38, fontStyle: 'bold' }, // Student Name
      5: { cellWidth: 26 }, // Stream
      6: { cellWidth: 18 }, // Category
      7: { cellWidth: 16, fontStyle: 'bold' }, // Mode
      8: { cellWidth: 24 }, // Ref
      9: { cellWidth: 19, halign: 'right' }, // Base
      10: { cellWidth: 19, halign: 'right' }, // Online
      11: { cellWidth: 20, halign: 'right', fontStyle: 'bold' }, // Total
    },
    head: [[
      'S.N.', 'Receipt No', 'Date', 'Reg No', 'Student Name', 'Class/Stream', 'Category', 'Mode', 'Txn Ref', 'Base (Rs.)', 'Online (Rs.)', 'Paid (Rs.)'
    ]],
    body: tableData,
    foot: [[
      '', 'TOTAL SUMMARY', '', '', `${transactions.length} Records`, '', '', '', '', 
      `Rs. ${transactions.reduce((acc, t) => acc + (t.baseFee || 0), 0).toLocaleString('en-IN')}`,
      `Rs. ${totalOnlineCharges.toLocaleString('en-IN')}`,
      `Rs. ${totalRevenue.toLocaleString('en-IN')}`
    ]],
    footStyles: {
      fillColor: [74, 69, 62],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    didDrawPage: (data) => {
      // Header for page 2+
      if (data.pageNumber > 1) {
        doc.setFillColor(74, 69, 62);
        doc.rect(0, 0, 297, 12, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(`${settings.name} — Transaction Ledger (${settings.academicYear})`, 14, 8);
        doc.text(`Page ${data.pageNumber}`, 283, 8, { align: 'right' });
      }

      // Footer on all pages
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(7.5);
      doc.setTextColor(120, 120, 120);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated by ${settings.name} Board Exam Management Cell`, 14, pageHeight - 6);
      doc.text(`Page ${data.pageNumber}`, 283, pageHeight - 6, { align: 'right' });
    },
  });

  doc.save(`Complete_Transaction_Ledger_${new Date().toISOString().slice(0, 10)}.pdf`);
}
