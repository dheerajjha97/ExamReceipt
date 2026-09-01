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
    <div className="fixed inset-0 z-50 bg-[#2D2A26]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FDFCF8] rounded-3xl shadow-2xl max-w-lg w-full border border-[#E6E2D3] overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="bg-[#4A453E] text-white px-6 py-4 flex items-center justify-between border-b border-[#3E3A33]">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#5A5A40] text-white rounded-2xl">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#FDFCF8]">Manage Examination Form</h2>
              <p className="text-xs text-[#C2BEB5]">
                Form collection & submission tracking for {student.studentName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#C2BEB5] hover:text-white rounded-full hover:bg-[#3E3A33] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Student Banner */}
          <div className="bg-[#F7F5EE] p-3.5 rounded-2xl border border-[#E6E2D3] flex items-center justify-between">
            <div>
              <span className="text-xs font-black text-[#4A453E] block">{student.studentName}</span>
              <span className="text-[11px] text-[#787267]">{student.classOrStream} • Reg: <code className="font-mono text-[#5A5A40] font-bold">{student.registrationNo}</code></span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#2E5B50] block">₹{student.totalFee} Payable</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                student.paymentStatus === 'PAID' ? 'bg-[#E2ECE9] text-[#2E5B50]' : 'bg-[#F9E8E8] text-[#8C2B2B]'
              }`}>
                Fee: {student.paymentStatus}
              </span>
            </div>
          </div>

          {/* Form Status Radio Cards */}
          <div className="space-y-2">
            <label className="font-bold text-[#4A453E] block">Examination Form Stage / Status:</label>
            
            <div className="grid grid-cols-1 gap-2.5">
              
              {/* Option 1: Not Issued */}
              <label 
                onClick={() => setStatus('NOT_ISSUED')}
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                  status === 'NOT_ISSUED' 
                    ? 'border-[#8C2B2B] bg-[#F9E8E8]/40 shadow-xs' 
                    : 'border-[#DDD8C5] bg-[#FDFCF8] hover:bg-[#F7F5EE]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    status === 'NOT_ISSUED' ? 'border-[#8C2B2B] bg-[#8C2B2B]' : 'border-[#999]'
                  }`}>
                    {status === 'NOT_ISSUED' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <span className="font-bold text-[#4A453E] block">1. Form Not Collected (Pending)</span>
                    <span className="text-[11px] text-[#787267]">Student has not yet collected the blank examination form.</span>
                  </div>
                </div>
              </label>

              {/* Option 2: Blank Form Issued */}
              <label 
                onClick={() => setStatus('ISSUED')}
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                  status === 'ISSUED' 
                    ? 'border-[#B8860B] bg-[#FFFBEA] shadow-xs' 
                    : 'border-[#DDD8C5] bg-[#FDFCF8] hover:bg-[#F7F5EE]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    status === 'ISSUED' ? 'border-[#B8860B] bg-[#B8860B]' : 'border-[#999]'
                  }`}>
                    {status === 'ISSUED' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <span className="font-bold text-[#8C6D1F] block">2. Blank Form Issued / Collected</span>
                    <span className="text-[11px] text-[#787267]">Student collected blank exam form to fill at home.</span>
                  </div>
                </div>
              </label>

              {/* Option 3: Form Submitted */}
              <label 
                onClick={() => setStatus('SUBMITTED')}
                className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition ${
                  status === 'SUBMITTED' 
                    ? 'border-[#2E5B50] bg-[#E2ECE9] shadow-xs' 
                    : 'border-[#DDD8C5] bg-[#FDFCF8] hover:bg-[#F7F5EE]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    status === 'SUBMITTED' ? 'border-[#2E5B50] bg-[#2E5B50]' : 'border-[#999]'
                  }`}>
                    {status === 'SUBMITTED' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <span className="font-bold text-[#2E5B50] block">3. Filled Form & Fee Submitted</span>
                    <span className="text-[11px] text-[#787267]">Student returned completed form with documents and fee.</span>
                  </div>
                </div>
              </label>

            </div>
          </div>

          {/* Form Serial No & Dates */}
          {status !== 'NOT_ISSUED' && (
            <div className="bg-[#F7F5EE] p-4 rounded-2xl border border-[#E6E2D3] space-y-3 animate-fadeIn">
              
              <div>
                <label className="font-bold text-[#4A453E] block mb-1">Exam Form Serial / Number:</label>
                <input
                  type="text"
                  value={formNo}
                  onChange={(e) => setFormNo(e.target.value)}
                  placeholder="e.g. EF-2026-0108"
                  className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-xl font-mono text-xs text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#2E5B50]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#4A453E] block mb-1">Form Issue Date:</label>
                  <input
                    type="text"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    placeholder="YYYY-MM-DD HH:mm"
                    className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-xl text-xs text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#2E5B50]"
                  />
                </div>

                {status === 'SUBMITTED' && (
                  <div>
                    <label className="font-semibold text-[#4A453E] block mb-1">Form Submission Date:</label>
                    <input
                      type="text"
                      value={submissionDate}
                      onChange={(e) => setSubmissionDate(e.target.value)}
                      placeholder="YYYY-MM-DD HH:mm"
                      className="w-full px-3 py-2 bg-[#FDFCF8] border border-[#DDD8C5] rounded-xl text-xs text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#2E5B50]"
                    />
                  </div>
                )}
              </div>

              {/* Print Token Action */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EFECE1] hover:bg-[#E6E2D3] text-[#4A453E] font-bold rounded-xl border border-[#DDD8C5] transition text-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-[#2E5B50]" />
                  <span>Print Blank Form Collection Slip</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-[#EFECE1] px-6 py-4 border-t border-[#E6E2D3] flex flex-wrap items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-[#EFECE1] hover:bg-[#E6E2D3] text-[#4A453E] rounded-2xl font-bold transition border border-[#DDD8C5]"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-4 py-2.5 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-2xl font-bold transition shadow"
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
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#2E5B50] hover:bg-[#254A41] text-white rounded-2xl font-bold transition shadow-md hover:-translate-y-0.5 active:translate-y-0"
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
