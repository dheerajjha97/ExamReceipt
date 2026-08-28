import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Search, 
  Download, 
  Filter, 
  IndianRupee, 
  CheckCircle2, 
  Calendar, 
  Receipt, 
  QrCode, 
  Wallet,
  Sparkles,
  TrendingUp,
  FileSpreadsheet,
  PlusCircle,
  Printer,
  Trash2,
  Tag
} from 'lucide-react';
import { Transaction, PaymentMode } from '../types';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onViewStudentReceipt?: (registrationNo: string) => void;
  onOpenLogTransaction?: () => void;
  onDeleteTransaction?: (txnId: string) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  onViewStudentReceipt,
  onOpenLogTransaction,
  onDeleteTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [streamFilter, setStreamFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        txn.studentName.toLowerCase().includes(q) ||
        txn.registrationNo.toLowerCase().includes(q) ||
        txn.receiptNo.toLowerCase().includes(q) ||
        txn.transactionRef.toLowerCase().includes(q) ||
        txn.collectedBy.toLowerCase().includes(q) ||
        (txn.remarks && txn.remarks.toLowerCase().includes(q));

      const matchesMode = modeFilter === 'ALL' || txn.paymentMode === modeFilter;
      const matchesType = typeFilter === 'ALL' || (txn.transactionType || 'Board Exam Fee') === typeFilter;
      const matchesStream = streamFilter === 'ALL' || txn.classOrStream === streamFilter;

      let matchesDate = true;
      if (startDate || endDate) {
        const txnDateStr = txn.paymentDate.split(' ')[0]; // expect YYYY-MM-DD or DD-MM-YYYY
        if (startDate && txnDateStr < startDate) matchesDate = false;
        if (endDate && txnDateStr > endDate) matchesDate = false;
      }

      return matchesSearch && matchesMode && matchesType && matchesStream && matchesDate;
    });
  }, [transactions, searchQuery, modeFilter, typeFilter, streamFilter, startDate, endDate]);

  // Analytics
  const summary = useMemo(() => {
    const totalCollected = filteredTransactions.reduce((acc, t) => acc + t.paidAmount, 0);
    const totalBaseFee = filteredTransactions.reduce((acc, t) => acc + t.baseFee, 0);
    const totalOnlineCharges = filteredTransactions.reduce((acc, t) => acc + (t.onlineCharges || 30), 0);

    const upiCount = filteredTransactions.filter((t) => t.paymentMode === 'UPI' || t.paymentMode === 'QR_CODE').length;
    const cashCount = filteredTransactions.filter((t) => t.paymentMode === 'CASH').length;
    const netBankingCount = filteredTransactions.filter((t) => t.paymentMode === 'NET_BANKING' || t.paymentMode === 'CARD').length;

    return {
      totalCollected,
      totalBaseFee,
      totalOnlineCharges,
      upiCount,
      cashCount,
      netBankingCount,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  // CSV Export
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = [
      'Txn ID',
      'Receipt No',
      'Transaction Type',
      'Student Name',
      'Registration No',
      'Class/Stream',
      'Base Fee (INR)',
      'Online Charges (INR)',
      'Total Amount (INR)',
      'Paid Amount (INR)',
      'Due Amount (INR)',
      'Payment Mode',
      'Transaction Ref/UTR',
      'Payment Date',
      'Collected By',
      'Remarks',
    ];

    const csvRows = [headers.join(',')];

    filteredTransactions.forEach((t) => {
      const row = [
        t.id,
        `"${t.receiptNo}"`,
        `"${t.transactionType || 'Board Exam Fee'}"`,
        `"${t.studentName}"`,
        `"${t.registrationNo}"`,
        `"${t.classOrStream}"`,
        t.baseFee,
        t.onlineCharges || 30,
        t.totalAmount,
        t.paidAmount,
        t.dueAmount,
        t.paymentMode,
        `"${t.transactionRef}"`,
        `"${t.paymentDate}"`,
        `"${t.collectedBy}"`,
        `"${t.remarks || ''}"`,
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Fee_Transactions_Statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Log Action */}
      <div className="bg-[#4A453E] text-white p-6 rounded-2xl border border-[#3E3A33] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#5A5A40] text-[#E6E2D3] rounded-xl border border-[#737356]">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#FDFCF8]">Transaction Management & Financial Ledger</h2>
              <span className="bg-[#2E5B50] text-[#E2ECE9] text-[10px] px-2 py-0.5 rounded font-mono border border-[#3B6E62]">
                Real-time Audit Log
              </span>
            </div>
            <p className="text-xs text-[#C2BEB5]">
              Log financial transactions, filter transaction history by mode, stream, or date, and sync automatically with your GitHub database repository.
            </p>
          </div>
        </div>

        {onOpenLogTransaction && (
          <button
            onClick={onOpenLogTransaction}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2E5B50] hover:bg-[#254A41] text-white rounded-xl text-xs font-bold shadow-md transition shrink-0 border border-[#3B6E62]"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            <span>+ Log New Transaction</span>
          </button>
        )}
      </div>

      {/* Financial Analytics Summary Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#FDFCF8] p-4 rounded-xl border border-[#E6E2D3] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#787267] text-xs font-semibold">
            <span>Total Revenue Collected</span>
            <IndianRupee className="w-4 h-4 text-[#2E5B50]" />
          </div>
          <p className="text-2xl font-black tracking-tight text-[#2E5B50]">
            ₹{summary.totalCollected.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#787267]">
            Across {summary.count} fee payment transactions
          </p>
        </div>

        <div className="bg-[#FDFCF8] p-4 rounded-xl border border-[#E6E2D3] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#787267] text-xs font-semibold">
            <span>Base Board Fees</span>
            <Receipt className="w-4 h-4 text-[#5A5A40]" />
          </div>
          <p className="text-2xl font-black text-[#4A453E]">
            ₹{summary.totalBaseFee.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#787267]">
            Board registration & examination fees
          </p>
        </div>

        <div className="bg-[#2E5B50] text-[#E2ECE9] p-4 rounded-xl border border-[#254A41] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#E2ECE9] text-xs font-semibold">
            <span>Online Charges (+₹30)</span>
            <Sparkles className="w-4 h-4 text-[#A8D3C5]" />
          </div>
          <p className="text-2xl font-black text-white">
            ₹{summary.totalOnlineCharges.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#C2E0D8]">
            Portal & online gateway handling charges
          </p>
        </div>

        <div className="bg-[#FDFCF8] p-4 rounded-xl border border-[#E6E2D3] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#787267] text-xs font-semibold">
            <span>Payment Mode Breakdown</span>
            <QrCode className="w-4 h-4 text-[#5A5A40]" />
          </div>
          <div className="flex items-center justify-between text-xs pt-1 font-semibold">
            <span className="text-[#2E5B50]">UPI/QR: {summary.upiCount}</span>
            <span className="text-[#8C5E28]">Cash: {summary.cashCount}</span>
            <span className="text-[#5A5A40]">Online: {summary.netBankingCount}</span>
          </div>
          <p className="text-[10px] text-[#787267] pt-1">
            Real-time multi-mode transaction recording
          </p>
        </div>

      </div>

      {/* Comprehensive Filter Controls */}
      <div className="bg-[#FDFCF8] p-4 rounded-xl border border-[#E6E2D3] shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-[#E6E2D3] pb-2 text-xs font-bold text-[#4A453E]">
          <span className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-[#5A5A40]" />
            Filterable Transaction History
          </span>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5A5A40] hover:bg-[#484833] text-white font-semibold rounded-lg shadow-sm transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Statement (CSV)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#787267]" />
            <input
              type="text"
              placeholder="Search by student, receipt no, UTR, remarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-xs text-[#4A453E] placeholder-[#787267] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
            />
          </div>

          {/* Payment Mode Filter */}
          <div className="space-y-1">
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="w-full bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg px-3 py-2 text-[#4A453E] font-medium focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
            >
              <option value="ALL">All Payment Modes</option>
              <option value="UPI">UPI (PhonePe / GPay)</option>
              <option value="QR_CODE">QR Code Scan</option>
              <option value="CASH">Counter Cash</option>
              <option value="NET_BANKING">Net Banking</option>
              <option value="CARD">Debit/Credit Card</option>
              <option value="OTHER">Cheque / Other</option>
            </select>
          </div>

          {/* Transaction Type Filter */}
          <div className="space-y-1">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg px-3 py-2 text-[#4A453E] font-medium focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
            >
              <option value="ALL">All Transaction Types</option>
              <option value="Board Exam Fee">Board Examination Fee</option>
              <option value="Registration Fee">Registration Fee</option>
              <option value="Late Fine">Late Fine / Penalty</option>
              <option value="Certificate Fee">Certificate Fee</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>

          {/* Class / Stream Filter */}
          <div className="space-y-1">
            <select
              value={streamFilter}
              onChange={(e) => setStreamFilter(e.target.value)}
              className="w-full bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg px-3 py-2 text-[#4A453E] font-medium focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
            >
              <option value="ALL">All Streams / Classes</option>
              <option value="Intermediate Science (12th)">Intermediate Science (12th)</option>
              <option value="Intermediate Arts (12th)">Intermediate Arts (12th)</option>
              <option value="Intermediate Commerce (12th)">Intermediate Commerce (12th)</option>
              <option value="Matriculation (10th)">Matriculation (10th)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Transaction Log Table */}
      <div className="bg-[#FDFCF8] rounded-xl border border-[#E6E2D3] shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F7F5EE] text-[#4A453E] font-semibold border-b border-[#E6E2D3] uppercase tracking-wider">
                <th className="p-3">Receipt No</th>
                <th className="p-3">Type</th>
                <th className="p-3">Student & Reg No</th>
                <th className="p-3">Class / Stream</th>
                <th className="p-3 text-right">Base Fee</th>
                <th className="p-3 text-right">Online Chg</th>
                <th className="p-3 text-right">Total Fee</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3 text-center">Mode</th>
                <th className="p-3">Txn Ref / UTR</th>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Collector</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E2D3]">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={13} className="p-12 text-center text-[#787267]">
                    No transactions recorded matching your search filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-[#F7F5EE] transition">
                    
                    {/* Receipt No */}
                    <td className="p-3 font-mono font-bold text-[#5A5A40] whitespace-nowrap">
                      {txn.receiptNo}
                    </td>

                    {/* Type */}
                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EFECE1] text-[#4A453E] border border-[#DDD8C5]">
                        {txn.transactionType || 'Board Exam Fee'}
                      </span>
                    </td>

                    {/* Student & Reg No */}
                    <td className="p-3">
                      <p className="font-bold text-[#4A453E]">{txn.studentName}</p>
                      <p className="font-mono text-[10px] text-[#787267]">{txn.registrationNo}</p>
                    </td>

                    {/* Class */}
                    <td className="p-3 text-[#4A453E] font-medium max-w-[140px] truncate">
                      {txn.classOrStream}
                    </td>

                    {/* Base Fee */}
                    <td className="p-3 text-right font-mono text-[#4A453E]">
                      ₹{txn.baseFee}
                    </td>

                    {/* Online Charge */}
                    <td className="p-3 text-right font-mono font-bold text-[#5A5A40]">
                      +₹{txn.onlineCharges || 30}
                    </td>

                    {/* Total Fee */}
                    <td className="p-3 text-right font-mono font-bold text-[#4A453E]">
                      ₹{txn.totalAmount}
                    </td>

                    {/* Paid Amount */}
                    <td className="p-3 text-right font-mono font-bold text-[#2E5B50]">
                      ₹{txn.paidAmount}
                    </td>

                    {/* Payment Mode */}
                    <td className="p-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        txn.paymentMode === 'UPI' || txn.paymentMode === 'QR_CODE'
                          ? 'bg-[#E2ECE9] text-[#2E5B50] border border-[#3B6E62]'
                          : txn.paymentMode === 'CASH'
                          ? 'bg-[#F9F3E5] text-[#8C5E28] border border-[#E8D7B8]'
                          : 'bg-[#EFECE1] text-[#5A5A40] border border-[#DDD8C5]'
                      }`}>
                        {txn.paymentMode}
                      </span>
                    </td>

                    {/* Txn Ref */}
                    <td className="p-3 font-mono text-[11px] text-[#787267] truncate max-w-[130px]">
                      {txn.transactionRef || 'N/A'}
                    </td>

                    {/* Date */}
                    <td className="p-3 font-mono text-[#787267] whitespace-nowrap">
                      {txn.paymentDate}
                    </td>

                    {/* Collected By */}
                    <td className="p-3 text-[#4A453E] font-medium">
                      {txn.collectedBy || 'Counter'}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {onViewStudentReceipt && (
                          <button
                            onClick={() => onViewStudentReceipt(txn.registrationNo)}
                            title="View / Print Receipt"
                            className="p-1.5 text-[#5A5A40] hover:text-[#4A453E] hover:bg-[#EFECE1] rounded-md transition"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteTransaction && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete transaction receipt ${txn.receiptNo}?`)) {
                                onDeleteTransaction(txn.id);
                              }
                            }}
                            title="Delete Transaction Log"
                            className="p-1.5 text-[#8C2B2B] hover:text-red-700 hover:bg-[#F9EAEA] rounded-md transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-[#F7F5EE] px-4 py-3 border-t border-[#E6E2D3] flex justify-between items-center text-xs text-[#787267]">
          <div>
            Showing <strong>{filteredTransactions.length}</strong> transactions
          </div>
          <div>
            Total Revenue in Table: <strong className="text-[#2E5B50] font-mono font-bold">₹{summary.totalCollected.toLocaleString('en-IN')}</strong>
          </div>
        </div>

      </div>
    </div>
  );
};

