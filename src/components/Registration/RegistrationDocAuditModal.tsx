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
  Share2
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
  const [filterType, setFilterType] = useState<'ALL' | 'MISSING_APAAR' | 'MISSING_TC' | 'MISSING_CASTE' | 'MISSING_AADHAR'>('ALL');

  if (!isOpen) return null;

  // Audit Metrics
  const missingAadhar = students.filter(s => s.documents?.aadhar?.status !== 'SUBMITTED');
  const missingApaar = students.filter(s => s.documents?.apaar?.status !== 'SUBMITTED');
  const missingTc = students.filter(s => s.documents?.transferCertificate?.status !== 'SUBMITTED');
  const missingCaste = students.filter(s => {
    const isMandatory = s.casteCategory === 'EBC' || s.casteCategory === 'SC' || s.casteCategory === 'ST';
    return isMandatory && s.documents?.casteCertificate?.status !== 'SUBMITTED';
  });

  let filteredStudents = students;
  if (filterType === 'MISSING_AADHAR') filteredStudents = missingAadhar;
  else if (filterType === 'MISSING_APAAR') filteredStudents = missingApaar;
  else if (filterType === 'MISSING_TC') filteredStudents = missingTc;
  else if (filterType === 'MISSING_CASTE') filteredStudents = missingCaste;
  else {
    filteredStudents = students.filter(s => 
      s.documents?.aadhar?.status !== 'SUBMITTED' ||
      s.documents?.apaar?.status !== 'SUBMITTED' ||
      s.documents?.transferCertificate?.status !== 'SUBMITTED' ||
      ((s.casteCategory === 'EBC' || s.casteCategory === 'SC' || s.casteCategory === 'ST') && s.documents?.casteCertificate?.status !== 'SUBMITTED')
    );
  }

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-amber-700 via-amber-800 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
              <ShieldAlert className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                दस्तावेज अनुपालन एवं लंबित रिपोर्ट (Document Compliance Audit)
              </h2>
              <p className="text-xs text-amber-200">
                आधार, अपार (APAAR कारण सहित), स्थानांतरण (TC) एवं जाति प्रमाण पत्र सत्यापन
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setFilterType('MISSING_TC')}
              className={`p-3.5 rounded-2xl border text-left transition ${
                filterType === 'MISSING_TC' ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400' : 'bg-[#FAF9F5] border-[#E8E4D5]'
              }`}
            >
              <div className="text-xs text-[#5A5A40] font-semibold">लंबित TC (Mandatory)</div>
              <div className="text-xl font-black text-rose-600 mt-0.5">{missingTc.length}</div>
              <div className="text-[10px] text-gray-500">सभी संकाय हेतु आवश्यक</div>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('MISSING_APAAR')}
              className={`p-3.5 rounded-2xl border text-left transition ${
                filterType === 'MISSING_APAAR' ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400' : 'bg-[#FAF9F5] border-[#E8E4D5]'
              }`}
            >
              <div className="text-xs text-[#5A5A40] font-semibold">अनुपलब्ध APAAR ID</div>
              <div className="text-xl font-black text-amber-700 mt-0.5">{missingApaar.length}</div>
              <div className="text-[10px] text-gray-500">कारण सहित दर्ज</div>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('MISSING_CASTE')}
              className={`p-3.5 rounded-2xl border text-left transition ${
                filterType === 'MISSING_CASTE' ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-400' : 'bg-[#FAF9F5] border-[#E8E4D5]'
              }`}
            >
              <div className="text-xs text-[#5A5A40] font-semibold">लंबित जाति प्रमाण पत्र</div>
              <div className="text-xl font-black text-purple-700 mt-0.5">{missingCaste.length}</div>
              <div className="text-[10px] text-gray-500">EBC, SC, ST हेतु अनिवार्य</div>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('MISSING_AADHAR')}
              className={`p-3.5 rounded-2xl border text-left transition ${
                filterType === 'MISSING_AADHAR' ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400' : 'bg-[#FAF9F5] border-[#E8E4D5]'
              }`}
            >
              <div className="text-xs text-[#5A5A40] font-semibold">लंबित आधार कार्ड</div>
              <div className="text-xl font-black text-blue-700 mt-0.5">{missingAadhar.length}</div>
              <div className="text-[10px] text-gray-500">12-अंकीय नंबर</div>
            </button>
          </div>

          {/* List Table */}
          <div className="border border-[#E8E4D5] rounded-2xl overflow-hidden bg-white">
            <div className="px-4 py-3 bg-[#FAF9F5] border-b border-[#E8E4D5] flex items-center justify-between">
              <span className="text-xs font-bold text-[#4A453E]">
                लंबित दस्तावेज सूची ({filteredStudents.length} छात्र):
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
                    <th className="p-2.5">स्थानांतरण (TC)</th>
                    <th className="p-2.5">अपार (APAAR) स्थिति & कारण</th>
                    <th className="p-2.5">जाति प्रमाण पत्र</th>
                    <th className="p-2.5 text-center">कार्रवाई</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4D5]">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <span className="font-bold text-sm block text-gray-700">सभी दस्तावेज पूर्ण हैं!</span>
                        <span className="text-xs">इस श्रेणी में कोई लंबित दस्तावेज नहीं पाया गया।</span>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((stu) => {
                      const isCasteReq = stu.casteCategory === 'EBC' || stu.casteCategory === 'SC' || stu.casteCategory === 'ST';
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
                            {stu.documents?.transferCertificate?.status === 'SUBMITTED' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" /> जमा
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">
                                TC लंबित (Mandatory)
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 max-w-[220px]">
                            {stu.documents?.apaar?.status === 'SUBMITTED' ? (
                              <span className="font-mono text-emerald-700 text-[11px] font-bold">
                                {stu.documents.apaar.docNumber || 'उपलब्ध'}
                              </span>
                            ) : (
                              <div className="text-[11px]">
                                <span className="inline-block px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded font-bold text-[10px] mb-0.5">
                                  अनुपलब्ध (Not Available)
                                </span>
                                <div className="text-[10px] text-amber-800 truncate" title={stu.documents?.apaar?.notAvailableReason}>
                                  {stu.documents?.apaar?.notAvailableReason || 'कारण दर्ज नहीं है'}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="p-2.5">
                            {!isCasteReq ? (
                              <span className="text-gray-400 text-[11px]">लागू नहीं (Gen/BC)</span>
                            ) : stu.documents?.casteCertificate?.status === 'SUBMITTED' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" /> {stu.documents.casteCertificate.docNumber || 'जमा'}
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-[10px]">
                                {stu.casteCategory} प्रमाणपत्र लंबित
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
