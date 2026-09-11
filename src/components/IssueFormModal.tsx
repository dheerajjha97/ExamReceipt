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
  Building,
  Check,
  ShieldCheck,
  IdCard,
  Camera,
  Award,
  AlertCircle,
  Receipt,
  FileCheck
} from 'lucide-react';
import { Student, InstituteSettings, FormIssueStatus } from '../types';
import { printIsolatedElement } from '../utils/printHelper';

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

interface ExamDocItem {
  id: string;
  name: string;
  hindi: string;
  isMandatory: boolean;
  status: 'YES' | 'NO';
  remarks?: string;
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

  const isCasteMandatory = 
    student?.casteCategory === 'EBC' || 
    student?.casteCategory === 'SC' || 
    student?.casteCategory === 'ST';

  // Examination Required Documents Checklist State
  const [examDocs, setExamDocs] = useState<ExamDocItem[]>([
    { id: 'examForm', name: 'Filled 12th Exam Form', hindi: 'भरा हुआ मूल 12वीं परीक्षा प्रपत्र', isMandatory: true, status: 'YES' },
    { id: 'regCard', name: '11th BSEB Registration Card Copy', hindi: '11वीं सूचीकरण / पंजीयन कार्ड की छायाप्रति', isMandatory: true, status: 'YES' },
    { id: 'matricMarksheet', name: '10th / Matric Marksheet Copy', hindi: '10वीं/मैट्रिक अंक पत्र की छायाप्रति', isMandatory: true, status: 'YES' },
    { id: 'sentupMarksheet', name: '11th Passed / Sent-Up Marksheet', hindi: '11वीं उत्तीर्ण अंक पत्र / जांच परीक्षा', isMandatory: true, status: 'YES' },
    { id: 'aadhar', name: 'Aadhaar Card Copy', hindi: 'आधार कार्ड की छायाप्रति', isMandatory: true, status: 'YES' },
    { id: 'photoSign', name: '2 Passport Photos & Signature', hindi: 'पासपोर्ट साइज 2 फोटो व हस्ताक्षर', isMandatory: true, status: 'YES' },
    { id: 'casteCert', name: 'Caste Certificate (For Concession)', hindi: 'जाति प्रमाण पत्र (आरक्षण व शुल्क छूट)', isMandatory: isCasteMandatory, status: isCasteMandatory ? 'YES' : 'YES' },
    { id: 'feeSlip', name: 'Exam Fee Payment Slip', hindi: 'परीक्षा शुल्क भुगतान रसीद', isMandatory: true, status: student?.paymentStatus === 'PAID' ? 'YES' : 'NO' },
  ]);

  useEffect(() => {
    if (student) {
      setStatus(student.formIssueStatus || 'ISSUED');
      setFormNo(
        student.formNo || `EF-${settings.academicYear.slice(2, 4)}-${(student.sNo || 100).toString().padStart(4, '0')}`
      );
      setIssueDate(student.formIssueDate || new Date().toLocaleString('en-IN').slice(0, 16));
      setSubmissionDate(student.formSubmissionDate || new Date().toLocaleString('en-IN').slice(0, 16));

      const isCasteReq = 
        student.casteCategory === 'EBC' || 
        student.casteCategory === 'SC' || 
        student.casteCategory === 'ST';

      setExamDocs([
        { id: 'examForm', name: 'Filled 12th Exam Form', hindi: 'भरा हुआ मूल 12वीं परीक्षा प्रपत्र', isMandatory: true, status: 'YES' },
        { id: 'regCard', name: '11th BSEB Registration Card Copy', hindi: '11वीं सूचीकरण / पंजीयन कार्ड की छायाप्रति', isMandatory: true, status: 'YES' },
        { id: 'matricMarksheet', name: '10th / Matric Marksheet Copy', hindi: '10वीं/मैट्रिक अंक पत्र की छायाप्रति', isMandatory: true, status: 'YES' },
        { id: 'sentupMarksheet', name: '11th Passed / Sent-Up Marksheet', hindi: '11वीं उत्तीर्ण अंक पत्र / जांच परीक्षा', isMandatory: true, status: 'YES' },
        { id: 'aadhar', name: 'Aadhaar Card Copy', hindi: 'आधार कार्ड की छायाप्रति', isMandatory: true, status: 'YES' },
        { id: 'photoSign', name: '2 Passport Photos & Signature', hindi: 'पासपोर्ट साइज 2 फोटो व हस्ताक्षर', isMandatory: true, status: 'YES' },
        { id: 'casteCert', name: 'Caste Certificate (For Concession)', hindi: 'जाति प्रमाण पत्र (आरक्षण व शुल्क छूट)', isMandatory: isCasteReq, status: isCasteReq ? 'YES' : 'YES' },
        { id: 'feeSlip', name: 'Exam Fee Payment Slip', hindi: 'परीक्षा शुल्क भुगतान रसीद', isMandatory: true, status: student.paymentStatus === 'PAID' ? 'YES' : 'NO' },
      ]);
    }
  }, [student, settings]);

  const handleToggleDocStatus = (docId: string, newStatus: 'YES' | 'NO') => {
    setExamDocs(prev => prev.map(item => item.id === docId ? { ...item, status: newStatus } : item));
  };

  const handleSetAllDocs = (statusToSet: 'YES' | 'NO') => {
    setExamDocs(prev => prev.map(item => ({ ...item, status: statusToSet })));
  };

  const handleSave = (shouldProceedToFee = false) => {
    if (!student) return;
    const updatedIssueDate = status !== 'NOT_ISSUED' ? (issueDate || new Date().toLocaleString('en-IN')) : '';
    const updatedSubDate = status === 'SUBMITTED' ? (submissionDate || new Date().toLocaleString('en-IN')) : '';

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
    if (!student) return;

    const slipHtml = `
      <div style="border: 2px dashed #4A453E; padding: 18px; border-radius: 10px; background: #FAF9F5; font-family: sans-serif; color: #333;">
        <div style="text-align: center; border-bottom: 2px solid #2E5B50; padding-bottom: 8px; margin-bottom: 12px;">
          <h2 style="margin: 0; font-size: 16px; color: #2E5B50; text-transform: uppercase;">${settings.name}</h2>
          <p style="margin: 2px 0 0; font-size: 11px; color: #666;">${settings.subTitle || 'परीक्षा संभाग'}</p>
          <p style="margin: 2px 0 0; font-size: 11px; color: #666;">Code: ${settings.code} | Session: ${settings.academicYear}</p>
        </div>
        <div style="background: #2E5B50; color: white; text-align: center; font-weight: bold; padding: 5px; font-size: 12px; margin-bottom: 12px; border-radius: 4px;">
          12TH EXAMINATION FORM & DOCUMENT RECEIVING TOKEN
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 10px;">
          <tr>
            <td style="padding: 3px 0; font-weight: bold; color: #555;">Form Serial No:</td>
            <td style="padding: 3px 0; font-weight: bold; color: #2E5B50; font-family: monospace;">${formNo}</td>
            <td style="padding: 3px 0; font-weight: bold; color: #555;">Issue Date:</td>
            <td style="padding: 3px 0; font-weight: bold; color: #111;">${issueDate}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0; font-weight: bold; color: #555;">Reg. Number:</td>
            <td style="padding: 3px 0; font-weight: bold; color: #111; font-family: monospace;">${student.registrationNo}</td>
            <td style="padding: 3px 0; font-weight: bold; color: #555;">Class / Stream:</td>
            <td style="padding: 3px 0; font-weight: bold; color: #111;">${student.classOrStream}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0; font-weight: bold; color: #555;">Student Name:</td>
            <td style="padding: 3px 0; font-weight: bold; color: #111;">${student.studentName}</td>
            <td style="padding: 3px 0; font-weight: bold; color: #555;">Father's Name:</td>
            <td style="padding: 3px 0; font-weight: bold; color: #111;">${student.fatherName}</td>
          </tr>
          <tr>
            <td style="padding: 3px 0; font-weight: bold; color: #555;">Caste Category:</td>
            <td style="padding: 3px 0; font-weight: bold; color: #111;">${student.casteCategory}</td>
            <td style="padding: 3px 0; font-weight: bold; color: #555;">Fee Payable:</td>
            <td style="padding: 3px 0; font-weight: bold; color: #111;">₹${student.totalFee} (${student.paymentStatus})</td>
          </tr>
        </table>
        
        <h4 style="margin: 10px 0 4px; font-size: 11px; color: #2E5B50;">दस्तावेज़ सत्यापन स्थिति (Document Verification Checklist):</h4>
        <table style="width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 10px; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background: #EFECE1;">
              <th style="border: 1px solid #cbd5e1; padding: 4px; width: 30px; text-align: center;">क्र.</th>
              <th style="border: 1px solid #cbd5e1; padding: 4px; text-align: left;">दस्तावेज़ का नाम</th>
              <th style="border: 1px solid #cbd5e1; padding: 4px; width: 100px; text-align: center;">प्राप्ति स्थिति</th>
            </tr>
          </thead>
          <tbody>
            ${examDocs.map((doc, idx) => `
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 4px; text-align: center;">${idx + 1}</td>
                <td style="border: 1px solid #cbd5e1; padding: 4px;">${doc.hindi} (${doc.name})</td>
                <td style="border: 1px solid #cbd5e1; padding: 4px; font-weight: bold; text-align: center; color: ${doc.status === 'YES' ? '#047857' : '#b91c1c'};">
                  ${doc.status === 'YES' ? '✓ प्राप्त (YES)' : '✗ लंबित (NO)'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; margin-top: 25px; font-size: 10px;">
          <div style="text-align: center;">
            <div style="width: 130px; border-bottom: 1px solid #666; margin-bottom: 2px;"></div>
            छात्र हस्ताक्षर (Student)
          </div>
          <div style="text-align: center;">
            <div style="width: 150px; border-bottom: 1px solid #666; margin-bottom: 2px;"></div>
            काउंटर क्लर्क मुहर (Clerk Stamp)
          </div>
        </div>

        <div style="margin-top: 15px; border-top: 1px solid #ccc; padding-top: 6px; text-align: center; font-size: 9px; color: #777;">
          Generated on ${new Date().toLocaleString('en-IN')} | ${settings.name} Exam Cell
        </div>
      </div>
    `;

    printIsolatedElement(slipHtml, {
      documentTitle: `परीक्षा_टोकन_${student.registrationNo}`,
      landscape: false,
      pageMargin: '6mm 8mm 6mm 8mm'
    });
  };

  if (!isOpen || !student) return null;

  const yesCount = examDocs.filter(d => d.status === 'YES').length;
  const missingMandatory = examDocs.filter(d => d.isMandatory && d.status === 'NO');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn select-none">
      <div className="bg-slate-900 rounded-3xl shadow-2xl max-w-xl w-full border border-white/10 overflow-hidden my-auto text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-950/80 border-b border-white/10 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-2xl shadow-lg shadow-teal-500/20">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                परीक्षा प्रपत्र निर्गत व जमा प्रबंधन
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  12th Exam
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                दस्तावेज़ सत्यापन एवं फॉर्म जमा • {student.studentName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          
          {/* Student Banner */}
          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-sm font-black text-white block uppercase">{student.studentName}</span>
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
          <div className="space-y-2">
            <label className="font-bold text-slate-300 block text-xs uppercase tracking-wider">
              फॉर्म स्थिति चरण चुनें (Form Stage):
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              
              {/* Option 1: Not Issued */}
              <button 
                type="button"
                onClick={() => setStatus('NOT_ISSUED')}
                className={`text-left p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  status === 'NOT_ISSUED' 
                    ? 'border-rose-500/50 bg-rose-500/15 text-white shadow-lg ring-1 ring-rose-500/50' 
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    status === 'NOT_ISSUED' ? 'border-rose-500 bg-rose-500' : 'border-slate-600'
                  }`}>
                    {status === 'NOT_ISSUED' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className="font-bold text-xs">1. फॉर्म नहीं लिया</span>
                </div>
                <span className="text-[10px] text-slate-400">लंबित (Pending)</span>
              </button>

              {/* Option 2: Blank Form Issued */}
              <button 
                type="button"
                onClick={() => setStatus('ISSUED')}
                className={`text-left p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  status === 'ISSUED' 
                    ? 'border-amber-500/50 bg-amber-500/20 text-white shadow-lg ring-1 ring-amber-500/50' 
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    status === 'ISSUED' ? 'border-amber-500 bg-amber-500' : 'border-slate-600'
                  }`}>
                    {status === 'ISSUED' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className="font-bold text-xs text-amber-300">2. फॉर्म लिया</span>
                </div>
                <span className="text-[10px] text-slate-400">प्रपत्र निर्गत किया</span>
              </button>

              {/* Option 3: Form Submitted */}
              <button 
                type="button"
                onClick={() => setStatus('SUBMITTED')}
                className={`text-left p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  status === 'SUBMITTED' 
                    ? 'border-teal-500/60 bg-teal-500/25 text-white shadow-lg ring-1 ring-teal-500/60' 
                    : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    status === 'SUBMITTED' ? 'border-teal-500 bg-teal-500' : 'border-slate-600'
                  }`}>
                    {status === 'SUBMITTED' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className="font-bold text-xs text-teal-300">3. फॉर्म जमा किया</span>
                </div>
                <span className="text-[10px] text-slate-400">दस्तावेज़ सहित जमा</span>
              </button>

            </div>
          </div>

          {/* REQUIRED DOCUMENTS CHECKLIST (POPUPS ON FORM SUBMIT) */}
          {status === 'SUBMITTED' && (
            <div className="bg-teal-950/40 p-4 rounded-2xl border border-teal-500/30 space-y-3 animate-fadeIn">
              
              <div className="flex items-center justify-between pb-2 border-b border-teal-500/20">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span className="font-black text-white text-xs">आवश्यक दस्तावेज़ सत्यापन (Yes / No करें)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSetAllDocs('YES')}
                    className="px-2 py-0.5 bg-teal-600 hover:bg-teal-500 text-white rounded-md font-bold text-[10px] transition cursor-pointer"
                  >
                    सभी YES ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAllDocs('NO')}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md font-bold text-[10px] transition cursor-pointer"
                  >
                    सभी NO ✗
                  </button>
                </div>
              </div>

              {/* Document items list */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {examDocs.map((doc, idx) => {
                  const isYes = doc.status === 'YES';
                  return (
                    <div 
                      key={doc.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition ${
                        isYes 
                          ? 'bg-teal-900/30 border-teal-500/40 text-slate-100' 
                          : 'bg-rose-950/30 border-rose-500/40 text-slate-300'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-white">
                            {idx + 1}. {doc.hindi}
                          </span>
                          {doc.isMandatory ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              अनिवार्य
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-700 text-slate-300">
                              वैकल्पिक
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block">{doc.name}</span>
                      </div>

                      {/* YES/NO Toggle */}
                      <div className="flex items-center gap-1 shrink-0 bg-slate-950/70 p-0.5 rounded-lg border border-white/10">
                        <button
                          type="button"
                          onClick={() => handleToggleDocStatus(doc.id, 'YES')}
                          className={`px-2.5 py-1 rounded text-[11px] font-black transition cursor-pointer flex items-center gap-0.5 ${
                            isYes 
                              ? 'bg-teal-500 text-slate-950 shadow-xs' 
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>YES</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleDocStatus(doc.id, 'NO')}
                          className={`px-2.5 py-1 rounded text-[11px] font-black transition cursor-pointer flex items-center gap-0.5 ${
                            !isYes 
                              ? 'bg-rose-600 text-white shadow-xs' 
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <X className="w-3 h-3 stroke-[3]" />
                          <span>NO</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Warning if mandatory docs missing */}
              {missingMandatory.length > 0 && (
                <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center gap-2 text-amber-300 text-[11px]">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    ⚠️ <strong>सूचना:</strong> {missingMandatory.length} अनिवार्य दस्तावेज़ लंबित (NO) हैं।
                  </span>
                </div>
              )}

            </div>
          )}

          {/* Form Serial No & Dates */}
          {status !== 'NOT_ISSUED' && (
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-3 animate-fadeIn">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">फॉर्म क्रमांक (Serial No):</label>
                  <input
                    type="text"
                    value={formNo}
                    onChange={(e) => setFormNo(e.target.value)}
                    placeholder="e.g. EF-26-0010"
                    className="w-full px-3 py-2 bg-slate-950/80 border border-white/10 rounded-xl font-mono text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">
                    {status === 'SUBMITTED' ? 'फॉर्म जमा तिथि व समय:' : 'फॉर्म निर्गत तिथि:'}
                  </label>
                  <input
                    type="text"
                    value={status === 'SUBMITTED' ? submissionDate : issueDate}
                    onChange={(e) => status === 'SUBMITTED' ? setSubmissionDate(e.target.value) : setIssueDate(e.target.value)}
                    placeholder="YYYY-MM-DD HH:mm"
                    className="w-full px-3 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  />
                </div>
              </div>

              {/* Print Token Action */}
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-slate-200 font-bold rounded-xl border border-white/10 transition text-xs shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-teal-400" />
                  <span>दस्तावेज़ टोकन / पर्ची प्रिंट करें</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950/80 px-5 py-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-bold transition border border-white/10 cursor-pointer"
          >
            रद्द करें (Cancel)
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition shadow-md border border-white/10 cursor-pointer"
            >
              {status === 'SUBMITTED' ? 'दस्तावेज़ सहित फॉर्म जमा करें' : 'स्थिति सुरक्षित करें'}
            </button>

            {student.paymentStatus !== 'PAID' && (
              <button
                type="button"
                onClick={() => {
                  setStatus('SUBMITTED');
                  handleSave(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white rounded-xl font-bold transition shadow-lg shadow-teal-500/20 cursor-pointer"
              >
                <span>जमा करें व फीस लें</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

