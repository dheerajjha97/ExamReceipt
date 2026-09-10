import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  FileCode, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ClipboardList,
  Edit2,
  Trash2,
  BookOpen
} from 'lucide-react';
import { RegistrationStudent, InstituteSettings, CasteCategory } from '../../types';

interface RegistrationUploadModalProps {
  isOpen: boolean;
  settings: InstituteSettings;
  onClose: () => void;
  onImport: (importedStudents: RegistrationStudent[]) => void;
  currentTotalStudents: number;
}

export const RegistrationUploadModal: React.FC<RegistrationUploadModalProps> = ({
  isOpen,
  settings,
  onClose,
  onImport,
  currentTotalStudents,
}) => {
  const [activeTab, setActiveTab] = useState<'IMAGE' | 'PDF' | 'TEXT'>('IMAGE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [defaultStream, setDefaultStream] = useState<string>('Science (I.Sc)');
  
  // Extracted preview state before confirmation
  const [extractedStudents, setExtractedStudents] = useState<RegistrationStudent[]>([]);
  const [detectedInstitute, setDetectedInstitute] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    setExtractionError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleExtract = async () => {
    setIsExtracting(true);
    setExtractionError(null);

    try {
      let payload: any = {};

      if (activeTab === 'TEXT') {
        if (!rawText.trim()) {
          throw new Error('कृपया टेक्स्ट बॉक्स में छात्रों की सूची पेस्ट करें।');
        }
        payload = { rawText: rawText.trim() };
      } else {
        if (!filePreview || !selectedFile) {
          throw new Error('कृपया फाइल (इमेज या PDF) चुनें।');
        }
        payload = {
          fileData: filePreview,
          mimeType: selectedFile.type,
          filename: selectedFile.name,
        };
      }

      const res = await fetch('/api/extract-registration-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success || !json.data) {
        throw new Error(json.error || 'दस्तावेज से डेटा प्राप्त नहीं हो सका।');
      }

      const data = json.data;
      setDetectedInstitute(data.instituteName || '');

      const parsedList = (data.students || []).map((s: any, idx: number) => {
        const cat = (s.casteCategory || 'BC') as CasteCategory;
        const isCasteMandatory = cat === 'EBC' || cat === 'SC' || cat === 'ST';
        const stStream = s.stream || data.stream || defaultStream;
        const now = new Date();
        const dateStr = `${now.toISOString().slice(0, 10)} 10:00`;

        const studentObj: RegistrationStudent = {
          id: `REG-${Date.now()}-${idx}`,
          sNo: currentTotalStudents + idx + 1,
          ofssNo: s.ofssNo || s.formNo || '',
          formNo: s.formNo || `REG-2026-${(currentTotalStudents + idx + 1).toString().padStart(3, '0')}`,
          bsebUniqueId: s.bsebUniqueId || '',
          studentName: (s.studentName || 'STUDENT').toUpperCase(),
          fatherName: (s.fatherName || 'FATHER').toUpperCase(),
          motherName: (s.motherName || '').toUpperCase(),
          dob: s.dob || '15-05-2008',
          boardName: s.boardName || 'BSEB',
          gender: s.gender || 'MALE',
          casteCategory: cat,
          stream: stStream,
          mobile: s.mobile || '',
          email: s.email || '',
          matricRollCode: s.matricRollCode || settings.code || '31337',
          matricRollNo: s.matricRollNo || '',
          matricPassingYear: s.matricPassingYear || '2024',
          prevSchoolName: s.prevSchoolName || '',
          registrationFee: 515,
          paidAmount: 515,
          paymentStatus: 'PAID',
          paymentMode: 'CASH',
          paymentDate: dateStr,
          transactionRef: 'CASH-REG',
          documents: {
            aadhar: {
              status: s.aadharNo ? 'SUBMITTED' : 'PENDING',
              docNumber: s.aadharNo || '',
              verified: Boolean(s.aadharNo),
            },
            apaar: {
              status: s.apaarId ? 'SUBMITTED' : 'NOT_AVAILABLE',
              docNumber: s.apaarId || undefined,
              notAvailableReason: s.apaarId ? undefined : 'Parental consent letter pending',
              verified: Boolean(s.apaarId),
            },
            transferCertificate: {
              status: s.tcNo ? 'SUBMITTED' : 'SUBMITTED',
              docNumber: s.tcNo || 'TC/2024/001',
              verified: true,
            },
            casteCertificate: {
              status: isCasteMandatory ? (s.casteCertNo ? 'SUBMITTED' : 'PENDING') : 'EXEMPTED',
              docNumber: s.casteCertNo || '',
              verified: Boolean(s.casteCertNo),
            },
            matricMarksheet: {
              status: 'SUBMITTED',
              verified: true,
            },
          },
          registrationStatus: 'FEE_PAID',
          remarks: 'AI OCR Imported (₹515 Registration Fee)',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return studentObj;
      });

      setExtractedStudents(parsedList);
    } catch (err: any) {
      console.error(err);
      setExtractionError(err.message || 'दस्तावेज प्रोसेस करते समय त्रुटि हुई।');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConfirmImport = () => {
    if (extractedStudents.length === 0) return;
    onImport(extractedStudents);
    onClose();
  };

  const handleRemoveRow = (id: string) => {
    setExtractedStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleTextSampleLoad = () => {
    setRawText(`1\tREG-2026-101\tRAHUL KUMAR\tBINOD SINGH\tSUNITA DEVI\t12-05-2008\tMALE\tBC\tScience (I.Sc)\t9876543210\t7458 9201 3345\t9102 4458 1190\tTC/2024/110\t\n2\tREG-2026-102\tPOOJA KUMARI\tSURENDRA SAH\tMEENA DEVI\t18-09-2008\tFEMALE\tEBC\tArts (I.A)\t9123456789\t8891 2341 9012\t\tTC/2024/112\tBICC/2024/9912\n3\tREG-2026-103\tSANJAY PASWAN\tRAMESH PASWAN\tKANTI DEVI\t05-11-2008\tMALE\tSC\tCommerce (I.Com)\t9934123450\t4501 8920 1123\t\tTC/2024/115\tBICC/2024/7741`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white/95 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-[#2E5B50] to-[#1C3B34] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                स्मार्ट पंजीकरण अपलोडर (Image, PDF & Text Import)
              </h2>
              <p className="text-xs text-emerald-100">
                AI OCR द्वारा तुरंत छात्र सूची, आधार, अपार, TC एवं जाति विवरण निकालें &bull; शुल्क: ₹515
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {extractedStudents.length === 0 ? (
            <>
              {/* Tabs: Image vs PDF vs Text */}
              <div className="flex items-center gap-2 p-1.5 bg-[#FAF9F5] rounded-2xl border border-[#E8E4D5]">
                <button
                  type="button"
                  onClick={() => { setActiveTab('IMAGE'); setSelectedFile(null); setFilePreview(null); }}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                    activeTab === 'IMAGE'
                      ? 'bg-[#2E5B50] text-white shadow-md'
                      : 'text-[#5A5A40] hover:bg-[#EFECE1]'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>1. इमेज / फोटो (Image OCR)</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('PDF'); setSelectedFile(null); setFilePreview(null); }}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                    activeTab === 'PDF'
                      ? 'bg-[#2E5B50] text-white shadow-md'
                      : 'text-[#5A5A40] hover:bg-[#EFECE1]'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>2. PDF दस्तावेज (PDF Extract)</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('TEXT'); setSelectedFile(null); setFilePreview(null); }}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                    activeTab === 'TEXT'
                      ? 'bg-[#2E5B50] text-white shadow-md'
                      : 'text-[#5A5A40] hover:bg-[#EFECE1]'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>3. टेक्स्ट / Excel पेस्ट (Raw Text)</span>
                </button>
              </div>

              {/* Stream selector */}
              <div className="flex items-center justify-between p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                <div className="flex items-center gap-2 text-xs text-[#2E5B50] font-bold">
                  <BookOpen className="w-4 h-4" />
                  <span>डिफ़ॉल्ट संकाय (Default Stream):</span>
                </div>
                <select
                  value={defaultStream}
                  onChange={(e) => setDefaultStream(e.target.value)}
                  className="px-3 py-1.5 bg-white rounded-xl border border-emerald-300 text-xs font-bold text-[#2E5B50]"
                >
                  <option value="Science (I.Sc)">विज्ञान संकाय • Science (I.Sc)</option>
                  <option value="Arts (I.A)">कला संकाय • Arts (I.A)</option>
                  <option value="Commerce (I.Com)">वाणिज्य संकाय • Commerce (I.Com)</option>
                  <option value="Vocational">व्यावसायिक • Vocational</option>
                </select>
              </div>

              {/* Dropzone for Image / PDF */}
              {activeTab !== 'TEXT' ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#DDD8C5] hover:border-[#2E5B50] rounded-3xl p-8 text-center cursor-pointer bg-[#FAF9F5] hover:bg-emerald-50/40 transition group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={activeTab === 'IMAGE' ? 'image/*' : '.pdf,application/pdf'}
                    className="hidden"
                  />
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white shadow-xs border border-[#DDD8C5] flex items-center justify-center group-hover:scale-105 transition">
                    <UploadCloud className="w-7 h-7 text-[#2E5B50]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#4A453E] mb-1">
                    {selectedFile ? selectedFile.name : `यहाँ ${activeTab === 'IMAGE' ? 'इमेज (JPG/PNG)' : 'PDF फाइल'} ड्रैग करें या क्लिक करके चुनें`}
                  </h3>
                  <p className="text-xs text-[#5A5A40]">
                    {selectedFile
                      ? `साइज़: ${(selectedFile.size / 1024).toFixed(1)} KB &bull; क्लिक करके बदलें`
                      : 'मेरिट लिस्ट, एडमिशन फॉर्म या हस्तलिखित रजिस्टर की साफ फोटो अपलोड करें'}
                  </p>
                </div>
              ) : (
                /* Raw Text input */
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#4A453E]">
                      छात्रों का विवरण (Excel / CSV / WhatsApp Text पेस्ट करें):
                    </label>
                    <button
                      type="button"
                      onClick={handleTextSampleLoad}
                      className="text-[11px] text-[#2E5B50] font-bold hover:underline"
                    >
                      डेमो डेटा भरें (Load Sample)
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="e.g.
1. ADITYA RAJ - Father: SURESH PRASAD - Stream: Science - Aadhaar: 745892013345 - TC: TC/2024/045 - Category: BC
2. PRIYA KUMARI - Father: RAMESHWAR SAH - Stream: Arts - Category: EBC - Caste Cert: BICC/2024/99120"
                    className="w-full p-3 bg-[#FAF9F5] rounded-2xl border border-[#DDD8C5] focus:ring-2 focus:ring-[#2E5B50] text-xs font-mono"
                  />
                </div>
              )}

              {/* Extraction Error alert */}
              {extractionError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{extractionError}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="button"
                disabled={isExtracting || (activeTab === 'TEXT' ? !rawText.trim() : !selectedFile)}
                onClick={handleExtract}
                className="w-full py-3.5 rounded-2xl bg-[#2E5B50] hover:bg-[#23463E] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>AI द्वारा पंजीकरण सूची विश्लेषित हो रही है... (Extracting)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-emerald-300" />
                    <span>दस्तावेज से छात्र रिकॉर्ड निकालें (Extract Students)</span>
                  </>
                )}
              </button>
            </>
          ) : (
            /* Extracted Preview Confirmation View */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="text-xs font-bold text-emerald-950">
                      कुल {extractedStudents.length} छात्र रिकॉर्ड सफलतापूर्वक पहचाने गए
                    </h3>
                    <p className="text-[11px] text-emerald-800">
                      सभी छात्रों पर ₹515 पंजीकरण शुल्क एवं आवश्यक दस्तावेज चेकलिस्ट लागू की गई है।
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setExtractedStudents([])}
                  className="px-3 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-100"
                >
                  &larr; फिर से स्कैन करें
                </button>
              </div>

              {/* Table Preview */}
              <div className="border border-[#E8E4D5] rounded-2xl overflow-hidden max-h-[50vh] overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF9F5] text-[#5A5A40] sticky top-0 border-b border-[#E8E4D5] uppercase font-bold tracking-wider">
                    <tr>
                      <th className="p-2.5">क्र.</th>
                      <th className="p-2.5">OFSS सं.</th>
                      <th className="p-2.5">छात्र का नाम (Name)</th>
                      <th className="p-2.5">पिता का नाम (Father)</th>
                      <th className="p-2.5">माता का नाम (Mother)</th>
                      <th className="p-2.5">जन्म तिथि (DOB)</th>
                      <th className="p-2.5">बोर्ड (Board)</th>
                      <th className="p-2.5">कोटि (Category)</th>
                      <th className="p-2.5 text-right">शुल्क</th>
                      <th className="p-2.5 text-center">हटाएं</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E4D5]">
                    {extractedStudents.map((stu, i) => (
                      <tr key={stu.id} className="hover:bg-amber-50/40">
                        <td className="p-2.5 font-mono text-gray-500 font-bold">{i + 1}</td>
                        <td className="p-2.5 font-mono font-bold text-[#2E5B50] whitespace-nowrap">
                          {stu.ofssNo || stu.formNo || '—'}
                        </td>
                        <td className="p-2.5 font-bold uppercase text-gray-900">{stu.studentName}</td>
                        <td className="p-2.5 text-gray-700 uppercase">{stu.fatherName}</td>
                        <td className="p-2.5 text-gray-600 uppercase">{stu.motherName || '—'}</td>
                        <td className="p-2.5 font-mono text-gray-700 whitespace-nowrap">{stu.dob || '—'}</td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-900 rounded font-bold text-[10px]">
                            {stu.boardName || 'BSEB'}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 rounded text-[11px] font-bold">
                            {stu.casteCategory}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">₹515</td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(stu.id)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded transition"
                            title="सूची से हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Confirm Import Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700"
                >
                  रद्द करें (Cancel)
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-6 py-2.5 rounded-xl bg-[#2E5B50] hover:bg-[#23463E] text-white font-bold text-xs shadow-md flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{extractedStudents.length} छात्र पंजीकरण डाटाबेस में जोड़ें</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
