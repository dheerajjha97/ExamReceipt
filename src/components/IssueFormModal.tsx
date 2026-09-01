import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  CheckCircle2, 
  Calendar, 
  Printer, 
  ArrowRight,
  Sparkles,
  ClipboardCheck,
  Building
} from 'lucide-react';
import { Student, InstituteSettings, FormIssueStatus } from '../types';

interface IssueFormModalProps {
  isOpen: boolean;
  student: Student | null;
  settings: InstituteSettings;
  onClose: () => void;
  onUpdateFormStatus: (
    studentId: string,
    formIssueStatus: FormIssueStatus,
    formNo: string,
    formIssueDate?: string,
    formSubmissionDate?: string
  ) => void;
  onProceedToFeeCollection?: (student: Student) => void;
}

export const IssueFormModal: React.FC<IssueFormModalProps> = ({
  isOpen,
  student,
  settings,
  onClose,
  onUpdateFormStatus,
  onProceedToFeeCollection,
}) => {
  const [status, setStatus] = useState<FormIssueStatus>(student?.formIssueStatus || 'ISSUED');
  const [formNo, setFormNo] = useState<string>(
    student?.formNo || `EF-${settings.academicYear.slice(2, 4)}-${(student?.sNo || 100).toString().padStart(4, '0')}`
  );
  const [issueDate, setIssueDate] = useState<string>(
    student?.formIssueDate || new Date().toISOString().slice(0, 16).replace('T', ' ')
  );
  const [submissionDate, setSubmissionDate] = useState<string>(
    student?.formSubmissionDate || new Date().toISOString().slice(0, 16).replace('T', ' ')
  );

  useEffect(() => {
    if (student) {
      setStatus(student.formIssueStatus || 'ISSUED');
      setFormNo(
        student.formNo || `EF-${settings.academicYear.slice(2, 4)}-${(student.sNo || 100).toString().padStart(4, '0')}`
      );
      setIssueDate(student.formIssueDate || new Date().toLocaleString('en-IN').slice(0, 16));
      setSubmissionDate(student.formSubmissionDate || new Date().toLocaleString('en-IN').slice(0, 16));
    }
  }, [student, settings]);

  const handleSave = (shouldProceedToFee = false) => {
    const updatedIssueDate = status !== 'NOT_ISSUED' ? (issueDate || new Date().toLocaleString('en-IN')) : undefined;
    const updatedSubDate = status === 'SUBMITTED' ? (submissionDate || new Date().toLocaleString('en-IN')) : undefined;

    onUpdateFormStatus(
      student.id,
      status,
      formNo.trim() || `EF-${student.registrationNo.slice(-6)}`,
      updatedIssueDate,
      updatedSubDate
    );

    onClose();

    if (shouldProceedToFee && onProceedToFeeCollection) {
      onProceedToFeeCollection({
        ...student,
        formIssueStatus: status,
        formNo,
        formIssueDate: updatedIssueDate,
        formSubmissionDate: updatedSubDate,
      });
    }
  };

  // Print Form Collection Slip (Paper token for student)
  const handlePrintSlip = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Exam Form Collection Token - ${student.registrationNo}</title>
        <style>
          body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 20px; color: #333; max-width: 500px; margin: auto; }
          .ticket { border: 2px dashed #4A453E; padding: 20px; border-radius: 12px; background: #FAF9F5; }
          .header { text-align: center; border-bottom: 2px solid #2E5B50; padding-bottom: 10px; margin-bottom: 15px; }
          .header h2 { margin: 0; font-size: 16px; color: #2E5B50; text-transform: uppercase; }
          .header p { margin: 3px 0 0; font-size: 11px; color: #666; }
          .title { background: #2E5B50; color: white; text-align: center; font-weight: bold; padding: 6px; font-size: 13px; margin-bottom: 15px; border-radius: 4px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; }
          .label { font-weight: bold; color: #555; }
          .val { font-weight: bold; color: #111; }
          .footer { margin-top: 20px; border-top: 1px solid #ccc; pt: 10px; text-align: center; font-size: 10px; color: #777; }
          .signatures { display: flex; justify-content: space-between; margin-top: 40px; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <h2>${settings.name}</h2>
            <p>${settings.subTitle}</p>
            <p>Code: ${settings.code} | Session: ${settings.academicYear}</p>
          </div>
          <div class="title">EXAMINATION FORM COLLECTION TOKEN / SLIP</div>
          <div class="row"><span class="label">Form Serial No:</span><span class="val" style="color: #2E5B50;">${formNo}</span></div>
          <div class="row"><span class="label">Issue Date:</span><span class="val">${issueDate}</span></div>
          <div class="row"><span class="label">Reg. Number:</span><span class="val">${student.registrationNo}</span></div>
          <div class="row"><span class="label">Student Name:</span><span class="val">${student.studentName}</span></div>
          <div class="row"><span class="label">Father's Name:</span><span class="val">${student.fatherName}</span></div>
          <div class="row"><span class="label">Class / Stream:</span><span class="val">${student.classOrStream}</span></div>
          <div class="row"><span class="label">Caste Category:</span><span class="val">${student.casteCategory}</span></div>
          <div class="row"><span class="label">Fee Payable:</span><span class="val">₹${student.totalFee} (${student.paymentStatus})</span></div>
          
          <div style="background: #EFECE1; padding: 8px; border-radius: 6px; margin-top: 12px; font-size: 11px;">
            📌 <strong>Instructions for Student:</strong><br/>
            1. Fill all details in the blank examination form carefully in block letters.<br/>
            2. Attach photo, Aadhaar copy & previous mark sheet.<br/>
            3. Submit completed form along with exam fee of ₹${student.totalFee} at the counter.
          </div>

          <div class="signatures">
            <div>___________________<br/>Student Signature</div>
            <div>___________________<br/>Counter Clerk Sign & Stamp</div>
          </div>

          <div class="footer">
            Generated on ${new Date().toLocaleString('en-IN')} | ${settings.name} Exam Cell
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-lg w-full border border-white/10 overflow-hidden my-6 text-slate-100">
        
        {/* Modal Header */}
        <div className="bg-slate-950/70 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-2xl shadow-lg shadow-teal-500/20">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Manage Examination Form
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Active
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Issue & track examination form for {student.studentName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Student Banner */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-sm font-black text-white block">{student.studentName}</span>
              <span className="text-[11px] text-slate-400 font-medium">
                {student.classOrStream} • Reg: <code className="font-mono text-teal-300 font-bold">{student.registrationNo}</code>
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-400 block">₹{student.totalFee} Fee</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                student.paymentStatus === 'PAID' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {student.paymentStatus}
              </span>
            </div>
          </div>

          {/* Form Status Radio Cards */}
          <div className="space-y-2.5">
            <label className="font-bold text-slate-300 block text-xs uppercase tracking-wider">Select Form Status Stage:</label>
            
            <div className="grid grid-cols-1 gap-2.5">
              
              {/* Option 1: Not Issued */}
              <label 
                onClick={() => setStatus('NOT_ISSUED')}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                  status === 'NOT_ISSUED' 
                    ? 'border-rose-500/50 bg-rose-500/10 text-white shadow-lg' 
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    status === 'NOT_ISSUED' ? 'border-rose-500 bg-rose-500' : 'border-slate-600'
                  }`}>
                    {status === 'NOT_ISSUED' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block">1. Form Not Collected (Pending)</span>
                    <span className="text-[11px] text-slate-400">Student has not collected the blank examination form.</span>
                  </div>
                </div>
              </label>

              {/* Option 2: Blank Form Issued */}
              <label 
                onClick={() => setStatus('ISSUED')}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                  status === 'ISSUED' 
                    ? 'border-amber-500/50 bg-amber-500/15 text-white shadow-lg' 
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    status === 'ISSUED' ? 'border-amber-500 bg-amber-500' : 'border-slate-600'
                  }`}>
                    {status === 'ISSUED' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <span className="font-bold text-amber-300 block">2. Blank Form Issued to Student</span>
                    <span className="text-[11px] text-slate-400">Blank examination form issued to student to fill.</span>
                  </div>
                </div>
              </label>

              {/* Option 3: Form Submitted */}
              <label 
                onClick={() => setStatus('SUBMITTED')}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                  status === 'SUBMITTED' 
                    ? 'border-teal-500/50 bg-teal-500/15 text-white shadow-lg' 
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    status === 'SUBMITTED' ? 'border-teal-500 bg-teal-500' : 'border-slate-600'
                  }`}>
                    {status === 'SUBMITTED' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <span className="font-bold text-teal-300 block">3. Filled Form & Fee Submitted</span>
                    <span className="text-[11px] text-slate-400">Form returned with photos, Aadhaar & exam fee.</span>
                  </div>
                </div>
              </label>

            </div>
          </div>

          {/* Form Serial No & Dates */}
          {status !== 'NOT_ISSUED' && (
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3 animate-fadeIn">
              
              <div>
                <label className="font-bold text-slate-300 block mb-1">Exam Form Serial Number:</label>
                <input
                  type="text"
                  value={formNo}
                  onChange={(e) => setFormNo(e.target.value)}
                  placeholder="e.g. EF-26-0010"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl font-mono text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Form Issue Date:</label>
                  <input
                    type="text"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    placeholder="YYYY-MM-DD HH:mm"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  />
                </div>

                {status === 'SUBMITTED' && (
                  <div>
                    <label className="font-semibold text-slate-300 block mb-1">Form Submission Date:</label>
                    <input
                      type="text"
                      value={submissionDate}
                      onChange={(e) => setSubmissionDate(e.target.value)}
                      placeholder="YYYY-MM-DD HH:mm"
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    />
                  </div>
                )}
              </div>

              {/* Print Token Action */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/15 text-slate-200 font-bold rounded-xl border border-white/10 transition text-xs shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-teal-400" />
                  <span>Print Form Token / Slip</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950/70 px-6 py-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl font-bold transition border border-white/10"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition shadow-md border border-white/10"
            >
              Save Form Status
            </button>

            {student.paymentStatus !== 'PAID' && (
              <button
                type="button"
                onClick={() => {
                  setStatus('SUBMITTED');
                  handleSave(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white rounded-2xl font-bold transition shadow-lg shadow-teal-500/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Save & Collect Fee</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
