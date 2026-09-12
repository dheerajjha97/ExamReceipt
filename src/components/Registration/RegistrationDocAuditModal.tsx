import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  FileText, 
  Filter, 
  Info,
  Phone,
  Share2,
  IdCard,
  Building,
  Camera,
  ShieldCheck
} from 'lucide-react';
import { RegistrationStudent, InstituteSettings } from '../../types';

interface RegistrationDocAuditModalProps {
  isOpen: boolean;
  students: RegistrationStudent[];
  settings: InstituteSettings;
  onClose: () => void;
  onSelectStudent: (student: RegistrationStudent) => void;
}

export const RegistrationDocAuditModal: React.FC<RegistrationDocAuditModalProps> = ({
  isOpen,
  students,
  settings,
  onClose,
  onSelectStudent,
}) => {
  const [filterType, setFilterType] = useState<
    'ALL' | 'MISSING_AADHAR' | 'MISSING_BANK' | 'MISSING_CASTE' | 'MISSING_PHOTO' | 'FORM_NOT_ISSUED' | 'FORM_NOT_SUBMITTED'
  >('ALL');

  if (!isOpen) return null;

  // 4 Required Documents Audit Metrics
  const missingAadhar = students.filter(s => s.documents?.aadhar?.status !== 'SUBMITTED');
  const missingBank = students.filter(s => s.documents?.bankPassbook?.status !== 'SUBMITTED');
  const missingCaste = students.filter(s => {
    const isMandatory = s.casteCategory === 'EBC' || s.casteCategory === 'SC' || s.casteCategory === 'ST' || s.casteCategory === 'BC';
    return isMandatory && s.documents?.casteCertificate?.status !== 'SUBMITTED';
  });
  const missingPhoto = students.filter(s => s.documents?.photo?.status !== 'SUBMITTED' && s.documents?.photoSign?.status !== 'SUBMITTED');
  const formNotIssued = students.filter(s => !s.isFormIssued);
  const formNotSubmitted = students.filter(s => !s.isFormSubmitted);

  let filteredStudents = students;
  if (filterType === 'MISSING_AADHAR') filteredStudents = missingAadhar;
  else if (filterType === 'MISSING_BANK') filteredStudents = missingBank;
  else if (filterType === 'MISSING_CASTE') filteredStudents = missingCaste;
  else if (filterType === 'MISSING_PHOTO') filteredStudents = missingPhoto;
  else if (filterType === 'FORM_NOT_ISSUED') filteredStudents = formNotIssued;
  else if (filterType === 'FORM_NOT_SUBMITTED') filteredStudents = formNotSubmitted;
  else {
    filteredStudents = students.filter(s => 
      !s.isFormIssued ||
      !s.isFormSubmitted ||
      s.documents?.aadhar?.status !== 'SUBMITTED' ||
      s.documents?.bankPassbook?.status !== 'SUBMITTED' ||
      (s.documents?.photo?.status !== 'SUBMITTED' && s.documents?.photoSign?.status !== 'SUBMITTED') ||
      ((s.casteCategory === 'EBC' || s.casteCategory === 'SC' || s.casteCategory === 'ST' || s.casteCategory === 'BC') && s.documents?.casteCertificate?.status !== 'SUBMITTED')
    );
  }

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-amber-700 via-amber-800 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
              <ShieldAlert className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                11वीं पंजीयन दस्तावेज अनुपालन एवं लंबित रिपोर्ट (4 Required Documents Audit)
              </h2>
              <p className="text-xs text-amber-200">
                1. आधार कार्ड &bull; 2. बैंक पासबुक &bull; 3. जाति प्रमाण पत्र &bull; 4. पासपोर्ट फोटो सत्यापन
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintReport}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span>रिपोर्ट प्रिंट</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Audit Metric Cards */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <button
              type="button"
              onClick={() => setFilterType('MISSING_AADHAR')}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                filterType === 'MISSING_AADHAR' ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400' : 'bg-[#FAF9F5] border-[#E8E4D5]'
              }`}
            >
              <div className="text-xs text-[#5A5A40] font-semibold flex items-center gap-1">
                <IdCard className="w-3.5 h-3.5 text-blue-600" />
                <span>1. आधार कार्ड</span>
              </div>
              <div className="text-lg font-black text-blue-700 mt-0.5">{missingAadhar.length}</div>
              <div className="text-[10px] text-gray-500">लंबित आधार</div>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('MISSING_BANK')}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                filterType === 'MISSING_BANK' ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400' : 'bg-[#FAF9F5] border-[#E8E4D5]'
              }`}
            >
              <div className="text-xs text-[#5A5A40] font-semibold flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. बैंक पासबुक</span>
              </div>
              <div className="text-lg font-black text-emerald-700 mt-0.5">{missingBank.length}</div>
              <div className="text-[10px] text-gray-500">खाता/IFSC बाकी</div>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('MISSING_CASTE')}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                filterType === 'MISSING_CASTE' ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-400' : 'bg-[#FAF9F5] border-[#E8E4D5]'
              }`}
            >
              <div className="text-xs text-[#5A5A40] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>3. जाति प्रमाण पत्र</span>
              </div>
              <div className="text-lg font-black text-purple-700 mt-0.5">{missingCaste.length}</div>
              <div className="text-[10px] text-gray-500">आरक्षित कोटि अनिवार्य</div>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('MISSING_PHOTO')}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                filterType === 'MISSING_PHOTO' ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400' : 'bg-[#FAF9F5] border-[#E8E4D5]'
              }`}
            >
              <div className="text-xs text-[#5A5A40] font-semibold flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-rose-600" />
                <span>4. फोटो (Photo)</span>
              </div>
              <div className="text-lg font-black text-rose-700 mt-0.5">{missingPhoto.length}</div>
              <div className="text-[10px] text-gray-500">फोटो चस्पा बाकी</div>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('FORM_NOT_ISSUED')}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                filterType === 'FORM_NOT_ISSUED' ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400' : 'bg-[#FAF9F5] border-[#E8E4D5]'
              }`}
            >
              <div className="text-xs text-[#5A5A40] font-semibold">फॉर्म नहीं लिया</div>
              <div className="text-lg font-black text-rose-600 mt-0.5">{formNotIssued.length}</div>
              <div className="text-[10px] text-gray-500">वितरण बाकी</div>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('FORM_NOT_SUBMITTED')}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                filterType === 'FORM_NOT_SUBMITTED' ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-400' : 'bg-[#FAF9F5] border-[#E8E4D5]'
              }`}
            >
              <div className="text-xs text-[#5A5A40] font-semibold">फॉर्म जमा नहीं</div>
              <div className="text-lg font-black text-orange-600 mt-0.5">{formNotSubmitted.length}</div>
              <div className="text-[10px] text-gray-500">संकलन बाकी</div>
            </button>
          </div>

          {/* List Table */}
          <div className="border border-[#E8E4D5] rounded-2xl overflow-hidden bg-white">
            <div className="px-4 py-3 bg-[#FAF9F5] border-b border-[#E8E4D5] flex items-center justify-between">
              <span className="text-xs font-bold text-[#4A453E]">
                लंबित दस्तावेज छात्र सूची ({filteredStudents.length} छात्र):
              </span>
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                className="text-xs text-[#2E5B50] font-bold hover:underline"
              >
                सभी लंबित दिखाएं (Show All)
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F2] text-[#5A5A40] sticky top-0 border-b border-[#E8E4D5]">
                  <tr>
                    <th className="p-2.5">फॉर्म सं.</th>
                    <th className="p-2.5">छात्र / पिता का नाम</th>
                    <th className="p-2.5">संकाय & कोटि</th>
                    <th className="p-2.5">1. आधार कार्ड</th>
                    <th className="p-2.5">2. बैंक पासबुक</th>
                    <th className="p-2.5">3. जाति प्रमाण पत्र</th>
                    <th className="p-2.5">4. फोटो (Photo)</th>
                    <th className="p-2.5 text-center">कार्रवाई</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4D5]">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <span className="font-bold text-sm block text-gray-700">सभी 4 अनिवार्य दस्तावेज पूर्ण हैं!</span>
                        <span className="text-xs">इस श्रेणी में कोई लंबित दस्तावेज नहीं पाया गया।</span>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((stu) => {
                      const isCasteReq = stu.casteCategory === 'EBC' || stu.casteCategory === 'SC' || stu.casteCategory === 'ST' || stu.casteCategory === 'BC';
                      const isAadharOk = stu.documents?.aadhar?.status === 'SUBMITTED';
                      const isBankOk = stu.documents?.bankPassbook?.status === 'SUBMITTED';
                      const isCasteOk = !isCasteReq || stu.documents?.casteCertificate?.status === 'SUBMITTED';
                      const isPhotoOk = stu.documents?.photo?.status === 'SUBMITTED' || stu.documents?.photoSign?.status === 'SUBMITTED';

                      return (
                        <tr key={stu.id} className="hover:bg-amber-50/30">
                          <td className="p-2.5 font-mono font-bold text-[#2E5B50]">{stu.formNo}</td>
                          <td className="p-2.5">
                            <strong className="block text-gray-900 uppercase">{stu.studentName}</strong>
                            <span className="text-[11px] text-gray-500 uppercase">{stu.fatherName}</span>
                          </td>
                          <td className="p-2.5">
                            <span className="block font-medium text-gray-700">{stu.stream}</span>
                            <span className="inline-block px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-bold">
                              {stu.casteCategory}
                            </span>
                          </td>
                          <td className="p-2.5">
                            {isAadharOk ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{stu.documents?.aadhar?.docNumber || 'जमा ✓'}</span>
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-900 rounded font-bold text-[10px]">
                                आधार लंबित
                              </span>
                            )}
                          </td>
                          <td className="p-2.5">
                            {isBankOk ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{stu.documents?.bankPassbook?.accountNumber || stu.documents?.bankPassbook?.bankName || 'जमा ✓'}</span>
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-bold text-[10px]">
                                पासबुक लंबित
                              </span>
                            )}
                          </td>
                          <td className="p-2.5">
                            {!isCasteReq ? (
                              <span className="text-gray-400 text-[11px]">लागू नहीं (Gen)</span>
                            ) : isCasteOk ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" /> {stu.documents?.casteCertificate?.docNumber || 'जमा ✓'}
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-[10px]">
                                {stu.casteCategory} जाति लंबित
                              </span>
                            )}
                          </td>
                          <td className="p-2.5">
                            {isPhotoOk ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" /> फोटो प्राप्त
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">
                                फोटो लंबित
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                onSelectStudent(stu);
                                onClose();
                              }}
                              className="px-2.5 py-1 bg-[#2E5B50] hover:bg-[#23463E] text-white rounded-lg text-xs font-bold"
                            >
                              अपडेट करें
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
