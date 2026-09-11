import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileCheck2, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Check, 
  HelpCircle,
  Clock,
  IdCard,
  Camera,
  Layers,
  Award,
  BookOpen,
  Receipt,
  UserCheck,
  Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  InstituteSettings, 
  CasteCategory, 
  RegistrationDocStatus,
  RegistrationDocuments,
  RegistrationStudent,
  Student
} from '../types';
import { printIsolatedElement } from '../utils/printHelper';

export interface DocChecklistItem {
  id: string;
  nameHindi: string;
  nameEng: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isMandatory: boolean;
  status: 'YES' | 'NO';
  docNumber?: string;
  remarks?: string;
}

interface FormSubmitDocChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  formType: '11TH_REGISTRATION' | '12TH_EXAMINATION' | 'GENERAL_ADMISSION';
  student: {
    id: string;
    studentName: string;
    fatherName?: string;
    motherName?: string;
    registrationNo?: string;
    formNo?: string;
    casteCategory?: CasteCategory | string;
    stream?: string;
    classOrStream?: string;
    mobile?: string;
    totalFee?: number;
    paymentStatus?: string;
    documents?: RegistrationDocuments | any;
  };
  settings: InstituteSettings;
  onConfirmSubmit: (verifiedDocs: Record<string, { submitted: boolean; docNumber?: string; remarks?: string }>, submissionDate: string) => void;
}

export const FormSubmitDocChecklistModal: React.FC<FormSubmitDocChecklistModalProps> = ({
  isOpen,
  onClose,
  formType,
  student,
  settings,
  onConfirmSubmit,
}) => {
  const isCasteMandatory = 
    student.casteCategory === 'EBC' || 
    student.casteCategory === 'SC' || 
    student.casteCategory === 'ST';

  // Helper to build initial items based on form type and existing student docs
  const getInitialDocItems = (): DocChecklistItem[] => {
    const existingDocs = student.documents || {};

    if (formType === '11TH_REGISTRATION') {
      return [
        {
          id: 'aadhar',
          nameHindi: 'आधार कार्ड की छायाप्रति',
          nameEng: 'Aadhaar Card Photocopy',
          description: 'छात्र का 12-अंकीय आधार कार्ड (नाम व जन्मतिथि सत्यापन हेतु)',
          icon: IdCard,
          isMandatory: true,
          status: existingDocs.aadhar?.status === 'SUBMITTED' ? 'YES' : 'YES', // default YES for quick convenience
          docNumber: existingDocs.aadhar?.docNumber || '',
          remarks: existingDocs.aadhar?.remarks || '',
        },
        {
          id: 'matricMarksheet',
          nameHindi: '10वीं / मैट्रिक अंक पत्र की छायाप्रति',
          nameEng: '10th / Matric Marksheet Copy',
          description: 'बिहार बोर्ड (BSEB) अथवा अन्य मान्यता प्राप्त बोर्ड का मैट्रिक अंक पत्र',
          icon: FileText,
          isMandatory: true,
          status: existingDocs.matricMarksheet?.status === 'SUBMITTED' ? 'YES' : 'YES',
          docNumber: existingDocs.matricMarksheet?.docNumber || '',
          remarks: existingDocs.matricMarksheet?.remarks || '',
        },
        {
          id: 'transferCertificate',
          nameHindi: 'मूल स्थानांतरण प्रमाण पत्र (TC / SLC / CLC)',
          nameEng: 'Original TC / SLC / CLC Certificate',
          description: 'पूर्व विद्यालय से निर्गत मूल टीसी (Original School Leaving Certificate)',
          icon: Award,
          isMandatory: true,
          status: existingDocs.transferCertificate?.status === 'SUBMITTED' ? 'YES' : 'YES',
          docNumber: existingDocs.transferCertificate?.docNumber || '',
          remarks: existingDocs.transferCertificate?.remarks || '',
        },
        {
          id: 'casteCertificate',
          nameHindi: 'जाति प्रमाण पत्र (Caste Certificate)',
          nameEng: 'Caste Certificate (EBC / SC / ST)',
          description: isCasteMandatory 
            ? `कोटि ${student.casteCategory || 'आरक्षित'} हेतु अनिवार्य (अद्यतन अनुमंडल/अंचल स्तर)` 
            : 'General / BC कोटि हेतु आवश्यक नहीं (छूट प्राप्त)',
          icon: ShieldCheck,
          isMandatory: isCasteMandatory,
          status: isCasteMandatory 
            ? (existingDocs.casteCertificate?.status === 'SUBMITTED' ? 'YES' : 'NO')
            : 'YES',
          docNumber: existingDocs.casteCertificate?.docNumber || '',
          remarks: existingDocs.casteCertificate?.remarks || '',
        },
        {
          id: 'photoSign',
          nameHindi: 'पासपोर्ट आकार 2 रंगीन फोटो व हस्ताक्षर',
          nameEng: '2 Passport Size Color Photos & Signature',
          description: 'सफेद/हल्के बैकग्राउंड वाली नवीनतम फोटो एवं छात्र के स्पष्ट हस्ताक्षर',
          icon: Camera,
          isMandatory: true,
          status: 'YES',
          remarks: '',
        },
        {
          id: 'signedForm',
          nameHindi: 'हस्ताक्षरित मूल 11वीं पंजीयन प्रपत्र',
          nameEng: 'Signed Original Registration Form',
          description: 'छात्र एवं अभिभावक के हस्ताक्षर युक्त विधिवत भरा हुआ पंजीयन फॉर्म',
          icon: FileCheck2,
          isMandatory: true,
          status: 'YES',
          docNumber: student.formNo || '',
          remarks: '',
        },
        {
          id: 'apaar',
          nameHindi: 'अपार / एबीसी कार्ड (APAAR / ABC ID)',
          nameEng: 'APAAR ID / ABC Account (If Available)',
          description: 'राष्ट्रीय स्वचालित स्थायी शैक्षणिक खाता (वैकल्पिक / यदि उपलब्ध हो)',
          icon: BookOpen,
          isMandatory: false,
          status: existingDocs.apaar?.status === 'SUBMITTED' ? 'YES' : 'NO',
          docNumber: existingDocs.apaar?.docNumber || '',
          remarks: existingDocs.apaar?.notAvailableReason || '',
        },
        {
          id: 'feeReceipt',
          nameHindi: '11वीं पंजीयन शुल्क भुगतान रसीद',
          nameEng: 'Registration Fee Payment Receipt Slip',
          description: `₹${student.totalFee || 515} पंजीयन शुल्क रसीद संख्या`,
          icon: Receipt,
          isMandatory: false,
          status: student.paymentStatus === 'PAID' ? 'YES' : 'NO',
          remarks: student.paymentStatus === 'PAID' ? 'शुल्क पूर्ण प्राप्त' : 'शुल्क बकाया',
        },
      ];
    } else {
      // 12th Examination Form Documents
      return [
        {
          id: 'signedExamForm',
          nameHindi: 'भरा हुआ मूल 12वीं परीक्षा प्रपत्र',
          nameEng: 'Filled & Signed 12th Exam Form',
          description: 'छात्र व अभिभावक के हस्ताक्षर युक्त पूर्ण रूप से भरा हुआ मूल फॉर्म',
          icon: FileCheck2,
          isMandatory: true,
          status: 'YES',
          docNumber: student.formNo || '',
          remarks: '',
        },
        {
          id: 'examRegistrationCard',
          nameHindi: '11वीं सूचीकरण / पंजीयन पत्र (Registration Card)',
          nameEng: '11th BSEB Registration Card Copy',
          description: 'बिहार विद्यालय परीक्षा समिति द्वारा निर्गत 11वीं पंजीयन कार्ड की छायाप्रति',
          icon: IdCard,
          isMandatory: true,
          status: 'YES',
          docNumber: student.registrationNo || '',
          remarks: '',
        },
        {
          id: 'matricMarksheet',
          nameHindi: '10वीं / मैट्रिक अंक पत्र की छायाप्रति',
          nameEng: '10th / Matric Marksheet Copy',
          description: 'मैट्रिक बोर्ड परीक्षा का मूल अंक पत्र / स्व-अभिप्रमाणित छायाप्रति',
          icon: FileText,
          isMandatory: true,
          status: 'YES',
          remarks: '',
        },
        {
          id: 'previousMarksheet',
          nameHindi: '11वीं उत्तीर्ण अंक पत्र / जांच परीक्षा रिपोर्ट',
          nameEng: '11th Passed / Sent-Up Exam Marksheet',
          description: 'कक्षा 11वीं वार्षिक मूल्यांकन परीक्षा उत्तीर्ण प्रमाण पत्र',
          icon: Award,
          isMandatory: true,
          status: 'YES',
          remarks: '',
        },
        {
          id: 'aadhar',
          nameHindi: 'आधार कार्ड की छायाप्रति',
          nameEng: 'Aadhaar Card Copy',
          description: 'छात्र का स्पष्ट 12-अंकीय आधार कार्ड छायाप्रति',
          icon: IdCard,
          isMandatory: true,
          status: 'YES',
          remarks: '',
        },
        {
          id: 'photoSign',
          nameHindi: 'पासपोर्ट आकार 2 रंगीन फोटो (नाम व तिथि युक्त)',
          nameEng: '2 Passport Color Photos with Name & Date',
          description: 'प्रपत्र पर चिपकाने व रिकॉर्ड हेतु नवीनतम रंगीन पासपोर्ट फोटो',
          icon: Camera,
          isMandatory: true,
          status: 'YES',
          remarks: '',
        },
        {
          id: 'casteCertificate',
          nameHindi: 'जाति प्रमाण पत्र (Caste Certificate)',
          nameEng: 'Caste Certificate (For Concession/Category)',
          description: isCasteMandatory 
            ? `कोटि ${student.casteCategory || 'आरक्षित'} शुल्क छूट व सत्यापन हेतु अनिवार्य` 
            : 'सामान्य / पिछड़ा वर्ग (General/BC) हेतु अनिवार्य नहीं',
          icon: ShieldCheck,
          isMandatory: isCasteMandatory,
          status: isCasteMandatory ? 'YES' : 'YES',
          remarks: '',
        },
        {
          id: 'feeReceipt',
          nameHindi: '12वीं परीक्षा शुल्क भुगतान रसीद',
          nameEng: '12th Exam Fee Collection Slip',
          description: `₹${student.totalFee || 1430} परीक्षा शुल्क रसीद सत्यापन`,
          icon: Receipt,
          isMandatory: true,
          status: student.paymentStatus === 'PAID' ? 'YES' : 'NO',
          remarks: student.paymentStatus === 'PAID' ? 'शुल्क प्राप्त' : 'शुल्क बकाया',
        },
      ];
    }
  };

  const [docList, setDocList] = useState<DocChecklistItem[]>(getInitialDocItems);
  const [submissionDate, setSubmissionDate] = useState<string>(() => {
    const now = new Date();
    return `${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  });
  const [collectorNote, setCollectorNote] = useState<string>('');
  const [showPrintPrompt, setShowPrintPrompt] = useState(false);

  // Sync when student changes
  useEffect(() => {
    if (student) {
      setDocList(getInitialDocItems());
      const now = new Date();
      setSubmissionDate(`${now.toLocaleDateString('en-GB')} ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`);
      setCollectorNote('');
      setShowPrintPrompt(false);
    }
  }, [student, formType]);

  // Toggle Single Doc Status
  const handleToggleDoc = (id: string, newStatus: 'YES' | 'NO') => {
    setDocList(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: newStatus };
      }
      return item;
    }));
  };

  // Update Doc Detail / Remark
  const handleDocDetailChange = (id: string, field: 'docNumber' | 'remarks', value: string) => {
    setDocList(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Quick Action: Mark All YES
  const handleMarkAllYes = () => {
    setDocList(prev => prev.map(item => ({
      ...item,
      status: 'YES'
    })));
  };

  // Quick Action: Mark All NO
  const handleMarkAllNo = () => {
    setDocList(prev => prev.map(item => ({
      ...item,
      status: 'NO'
    })));
  };

  // Summary counts
  const totalDocs = docList.length;
  const yesDocsCount = docList.filter(d => d.status === 'YES').length;
  const noDocsCount = totalDocs - yesDocsCount;
  const missingMandatoryDocs = docList.filter(d => d.isMandatory && d.status === 'NO');

  // Submit Handler
  const handleConfirm = () => {
    const formattedDocs: Record<string, { submitted: boolean; docNumber?: string; remarks?: string }> = {};
    
    docList.forEach(item => {
      formattedDocs[item.id] = {
        submitted: item.status === 'YES',
        docNumber: item.docNumber?.trim() || undefined,
        remarks: item.remarks?.trim() || (item.status === 'NO' ? 'लंबित (Pending)' : undefined),
      };
    });

    onConfirmSubmit(formattedDocs, submissionDate);
    onClose();
  };

  // Print Acknowledgement / Doc Receiving Slip
  const handlePrintSlip = () => {
    const streamLabel = student.stream || student.classOrStream || 'Intermediate';
    const formTitle = formType === '11TH_REGISTRATION' 
      ? '11वीं सूचीकरण / पंजीयन प्रपत्र एवं दस्तावेज़ प्राप्ति रसीद' 
      : '12वीं परीक्षा प्रपत्र एवं आवश्यक दस्तावेज़ प्राप्ति रसीद';

    const slipHtml = `
      <div style="border: 2px solid #0f766e; border-radius: 8px; padding: 18px; font-family: sans-serif; color: #1e293b;">
        <div style="text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 10px; margin-bottom: 12px;">
          <h2 style="margin: 0; font-size: 17px; color: #0f766e; text-transform: uppercase; font-weight: 800;">${settings.name}</h2>
          <p style="margin: 3px 0 0; font-size: 11px; color: #475569;">${settings.subTitle || 'इंटरमीडिएट संभाग (कला, विज्ञान, वाणिज्य)'}</p>
          <p style="margin: 2px 0 0; font-size: 11px; color: #475569;">संस्थान कोड: <strong>${settings.code}</strong> | शैक्षणिक सत्र: <strong>${settings.academicYear}</strong></p>
        </div>

        <div style="background: #0f766e; color: #ffffff; text-align: center; font-weight: 700; padding: 5px; font-size: 12px; margin: 8px 0 14px; border-radius: 4px;">
          ${formTitle}
        </div>

        <table style="width: 100%; margin-bottom: 12px; font-size: 11px; border-collapse: collapse; border: 1px solid #cbd5e1;">
          <tbody>
            <tr>
              <td style="padding: 5px 8px; font-weight: 600; color: #475569; width: 25%; background: #f8fafc;">छात्र का नाम:</td>
              <td style="padding: 5px 8px; font-weight: 700; color: #0f172a; width: 25%;">${student.studentName}</td>
              <td style="padding: 5px 8px; font-weight: 600; color: #475569; width: 25%; background: #f8fafc;">पिता का नाम:</td>
              <td style="padding: 5px 8px; font-weight: 700; color: #0f172a; width: 25%;">${student.fatherName || '—'}</td>
            </tr>
            <tr>
              <td style="padding: 5px 8px; font-weight: 600; color: #475569; background: #f8fafc;">पंजीयन / फॉर्म नं:</td>
              <td style="padding: 5px 8px; font-weight: 700; font-family: monospace;">${student.registrationNo || student.formNo || '—'}</td>
              <td style="padding: 5px 8px; font-weight: 600; color: #475569; background: #f8fafc;">संकाय / वर्ग:</td>
              <td style="padding: 5px 8px; font-weight: 700;">${streamLabel}</td>
            </tr>
            <tr>
              <td style="padding: 5px 8px; font-weight: 600; color: #475569; background: #f8fafc;">कोटि (Category):</td>
              <td style="padding: 5px 8px; font-weight: 700;">${student.casteCategory || 'General'}</td>
              <td style="padding: 5px 8px; font-weight: 600; color: #475569; background: #f8fafc;">जमा तिथि:</td>
              <td style="padding: 5px 8px; font-weight: 700;">${submissionDate}</td>
            </tr>
          </tbody>
        </table>

        <h4 style="margin: 10px 0 6px; font-size: 11px; color: #0f766e; text-transform: uppercase;">जमा किए गए आवश्यक दस्तावेज़ों की सूची (Checklist):</h4>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 10px; border: 1px solid #1e293b;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="width: 28px; padding: 4px; border: 1px solid #1e293b; text-align: center;">क्र.</th>
              <th style="padding: 4px; border: 1px solid #1e293b; text-align: left;">दस्तावेज़ का नाम (Document)</th>
              <th style="width: 90px; padding: 4px; border: 1px solid #1e293b; text-align: center;">स्थिति</th>
              <th style="padding: 4px; border: 1px solid #1e293b; text-align: left;">विवरण / रिमार्क</th>
            </tr>
          </thead>
          <tbody>
            ${docList.map((doc, idx) => `
              <tr>
                <td style="text-align: center; padding: 4px; border: 1px solid #1e293b;">${idx + 1}</td>
                <td style="padding: 4px; border: 1px solid #1e293b;">
                  <strong>${doc.nameHindi}</strong> (${doc.nameEng})
                </td>
                <td style="text-align: center; padding: 4px; border: 1px solid #1e293b; font-weight: bold;">
                  ${doc.status === 'YES' 
                    ? '<span style="color: #047857;">✓ प्राप्त (YES)</span>' 
                    : '<span style="color: #b91c1c;">✗ लंबित (NO)</span>'
                  }
                </td>
                <td style="padding: 4px; border: 1px solid #1e293b;">${doc.docNumber ? `क्र: ${doc.docNumber} ` : ''}${doc.remarks || (doc.status === 'NO' ? 'लंबित' : 'स्वीकृत')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${missingMandatoryDocs.length > 0 ? `
          <div style="background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 6px 10px; font-size: 10px; color: #92400e; margin-top: 10px; border-radius: 4px;">
            ⚠️ <strong>सूचना:</strong> कुल ${missingMandatoryDocs.length} अनिवार्य दस्तावेज़ (${missingMandatoryDocs.map(d => d.nameHindi).join(', ')}) अभी लंबित हैं। छात्र को 7 दिनों के भीतर जमा करने का निर्देश दिया जाता है।
          </div>
        ` : ''}

        <div style="display: flex; justify-content: space-between; margin-top: 30px; font-size: 10px;">
          <div style="text-align: center;">
            <div style="width: 140px; border-bottom: 1px solid #1e293b; margin-bottom: 2px;"></div>
            <strong>छात्र / अभिभावक के हस्ताक्षर</strong>
          </div>
          <div style="text-align: center;">
            <div style="width: 160px; border-bottom: 1px solid #1e293b; margin-bottom: 2px;"></div>
            <strong>काउंटर प्रभारी / मुहर (Seal & Sign)</strong>
          </div>
        </div>

        <div style="margin-top: 14px; border-top: 1px dashed #cbd5e1; padding-top: 6px; text-align: center; font-size: 9px; color: #64748b;">
          यह रसीद कंप्यूटर जनरेटेड है • मुद्रण तिथि: ${new Date().toLocaleString('en-IN')} • ${settings.name}
        </div>
      </div>
    `;

    printIsolatedElement(slipHtml, {
      documentTitle: `दस्तावेज़_रसीद_${student.studentName}`,
      landscape: false,
      pageMargin: '6mm 8mm 6mm 8mm'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn select-none">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]"
      >
        {/* Header with colorful top bar */}
        <div className="relative bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 text-white p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-inner">
                <FileCheck2 className="w-6 h-6 text-emerald-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                    फॉर्म जमा एवं आवश्यक दस्तावेज़ सत्यापन
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-emerald-950 shadow-xs uppercase">
                    Checklist
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 font-medium">
                  {formType === '11TH_REGISTRATION' ? 'कक्षा 11वीं पंजीयन प्रपत्र (11th Registration)' : 'कक्षा 12वीं परीक्षा प्रपत्र (12th Examination Form)'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/15 transition cursor-pointer"
              title="बंद करें"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Student Quick Summary Pill Strip */}
          <div className="mt-3.5 pt-3 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
              <span className="text-[10px] text-emerald-200 font-bold block">छात्र का नाम</span>
              <span className="font-extrabold text-white truncate block uppercase text-xs">
                {student.studentName}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
              <span className="text-[10px] text-emerald-200 font-bold block">पिता का नाम</span>
              <span className="font-bold text-white truncate block uppercase text-xs">
                {student.fatherName || '—'}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
              <span className="text-[10px] text-emerald-200 font-bold block">पंजीयन / फॉर्म नं.</span>
              <span className="font-mono font-bold text-emerald-200 truncate block text-xs">
                {student.formNo || student.registrationNo || 'NEW-001'}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
              <span className="text-[10px] text-emerald-200 font-bold block">संकाय व कोटि</span>
              <span className="font-bold text-white truncate block text-xs">
                {student.stream || student.classOrStream || 'Science'} • {student.casteCategory || 'General'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Toolbar: Mark All Yes / No & Live Counter */}
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-bold">दस्तावेज़ स्थिति:</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-[11px] border border-emerald-200">
              ✓ प्राप्त: {yesDocsCount}
            </span>
            <span className={`px-2 py-0.5 rounded-md font-extrabold text-[11px] border ${
              noDocsCount > 0 
                ? 'bg-rose-100 text-rose-800 border-rose-200' 
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              ✗ लंबित: {noDocsCount}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleMarkAllYes}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition shadow-2xs cursor-pointer flex items-center gap-1"
              title="सभी दस्तावेज़ों को YES करें"
            >
              <Check className="w-3.5 h-3.5" />
              <span>सभी Yes (प्राप्त)</span>
            </button>
            <button
              type="button"
              onClick={handleMarkAllNo}
              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-[11px] transition shadow-2xs cursor-pointer flex items-center gap-1"
              title="सभी दस्तावेज़ों को NO करें"
            >
              <X className="w-3.5 h-3.5" />
              <span>सभी No (लंबित)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Document Checklist Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          <div className="space-y-2.5">
            {docList.map((item, index) => {
              const Icon = item.icon;
              const isYes = item.status === 'YES';

              return (
                <div 
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isYes 
                      ? 'bg-emerald-50/50 border-emerald-200 shadow-2xs' 
                      : 'bg-rose-50/30 border-rose-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Doc Title & Info */}
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isYes 
                          ? 'bg-emerald-600 text-white shadow-xs' 
                          : 'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-slate-900 text-xs sm:text-sm">
                            {index + 1}. {item.nameHindi}
                          </span>

                          {item.isMandatory ? (
                            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-black bg-rose-100 text-rose-800 border border-rose-200 uppercase">
                              अनिवार्य
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              वैकल्पिक / छूट
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {item.nameEng} • <span className="text-slate-600">{item.description}</span>
                        </p>
                      </div>
                    </div>

                    {/* YES / NO Segmented Pill Button */}
                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleToggleDoc(item.id, 'YES')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                          isYes 
                            ? 'bg-emerald-600 text-white shadow-sm scale-102' 
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>YES (प्राप्त)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleDoc(item.id, 'NO')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer ${
                          !isYes 
                            ? 'bg-rose-600 text-white shadow-sm scale-102' 
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                      >
                        <X className="w-3.5 h-3.5 stroke-[3]" />
                        <span>NO (लंबित)</span>
                      </button>
                    </div>

                  </div>

                  {/* Optional Doc Number / Remark Input (if YES or if user wants to add notes) */}
                  {(isYes || item.docNumber || item.remarks) && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-bold">रिमार्क/दस्तावेज़ संख्या:</span>
                      <input
                        type="text"
                        value={item.remarks || item.docNumber || ''}
                        onChange={(e) => handleDocDetailChange(item.id, 'remarks', e.target.value)}
                        placeholder="उदा. फोटोकॉपी प्राप्त / मूल प्रति सत्यापित"
                        className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Alert if mandatory documents are NO */}
          {missingMandatoryDocs.length > 0 && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-2.5 text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-black block text-amber-950">
                  चेतावनी: {missingMandatoryDocs.length} अनिवार्य दस्तावेज़ लंबित (NO) हैं!
                </span>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  लंबित दस्तावेज़: {missingMandatoryDocs.map(d => d.nameHindi).join(', ')}। आप फिर भी फॉर्म जमा स्वीकार कर सकते हैं (लंबित स्थिति रिकॉर्ड में दर्ज रहेगी)।
                </p>
              </div>
            </div>
          )}

          {/* Submission Timestamp & Reception Note */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">फॉर्म जमा तिथि व समय:</label>
              <input
                type="text"
                value={submissionDate}
                onChange={(e) => setSubmissionDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">काउंटर क्लर्क रिमार्क (वैकल्पिक):</label>
              <input
                type="text"
                value={collectorNote}
                onChange={(e) => setCollectorNote(e.target.value)}
                placeholder="उदा. सभी मूल प्रमाण पत्र जांचे गए"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-100 px-4 sm:px-5 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintSlip}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-300 transition shadow-2xs cursor-pointer"
              title="दस्तावेज़ प्राप्ति टोकन / रसीद प्रिंट करें"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-700" />
              <span>दस्तावेज़ पर्ची प्रिंट</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-slate-600 hover:text-slate-900 font-bold transition cursor-pointer"
            >
              रद्द करें (Cancel)
            </button>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 hover:from-emerald-500 hover:to-indigo-600 text-white rounded-xl font-black transition shadow-md shadow-emerald-600/20 active:scale-98 cursor-pointer text-xs sm:text-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>सत्यापित कर फॉर्म जमा करें (Submit Form)</span>
          </button>

        </div>
      </motion.div>
    </div>
  );
};
