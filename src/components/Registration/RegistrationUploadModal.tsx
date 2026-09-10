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
import { RegistrationStudent, InstituteSettings, CasteCategory, calculateRegistrationFee, isBSEBBoard } from '../../types';

interface RegistrationUploadModalProps {
  isOpen: boolean;
  settings: InstituteSettings;
  initialTab?: 'IMAGE' | 'PDF' | 'TEXT';
  onClose: () => void;
  onImport: (importedStudents: RegistrationStudent[]) => void;
  currentTotalStudents: number;
}

export const RegistrationUploadModal: React.FC<RegistrationUploadModalProps> = ({
  isOpen,
  settings,
  initialTab = 'TEXT',
  onClose,
  onImport,
  currentTotalStudents,
}) => {
  const [activeTab, setActiveTab] = useState<'IMAGE' | 'PDF' | 'TEXT'>(initialTab);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [serviceCharge, setServiceCharge] = useState<number>(30); // ₹30 Service / processing charge
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [defaultStream, setDefaultStream] = useState<string>('Science (I.Sc)');
  
  // Extracted preview state before confirmation
  const [extractedStudents, setExtractedStudents] = useState<RegistrationStudent[]>([]);
  const [detectedInstitute, setDetectedInstitute] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial tab when modal opens
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Direct High-Speed Excel / TSV / OFSS Table Parser
  const parseDirectTabularText = (text: string, stream: string, extraFee: number = 30): RegistrationStudent[] => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return [];

    const results: RegistrationStudent[] = [];
    const now = new Date();
    const dateStr = `${now.toISOString().slice(0, 10)} 10:00`;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();
      
      // Skip headers
      if (
        (lower.includes('ofss') && (lower.includes('name') || lower.includes('father') || lower.includes('dob'))) ||
        (lower.includes('s.no') && (lower.includes('board') || lower.includes('fee')))
      ) {
        continue;
      }

      let cols: string[] = [];
      if (line.includes('\t')) {
        cols = line.split('\t').map(c => c.trim()).filter(c => c.length > 0);
      } else if (line.includes(',')) {
        cols = line.split(',').map(c => c.trim()).filter(c => c.length > 0);
      } else {
        cols = line.split(/\s{2,}/).map(c => c.trim()).filter(c => c.length > 0);
      }

      if (cols.length < 2) continue;

      let idx = 0;
      let sNo = currentTotalStudents + results.length + 1;
      let ofssNo = '';
      let name = '';
      let fatherName = '';
      let motherName = '';
      let dob = '';
      let boardName = 'BSEB,Bihar';
      let category = 'Regular';
      let baseFee = 485;

      // 1. S.No
      if (/^\d+$/.test(cols[idx]) && cols[idx].length <= 4) {
        sNo = parseInt(cols[idx], 10);
        idx++;
      }

      // 2. OFSS No. (e.g. 26J54670842 or 24J...)
      if (cols[idx] && (/^\d{2}[A-Z0-9]{5,}/i.test(cols[idx]) || /\d{6,}/.test(cols[idx]))) {
        ofssNo = cols[idx];
        idx++;
      }

      // 3. Student Name
      if (cols[idx]) {
        name = cols[idx];
        idx++;
      }

      // 4. Father Name
      if (cols[idx]) {
        fatherName = cols[idx];
        idx++;
      }

      // 5. Mother Name
      if (cols[idx]) {
        if (/^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/.test(cols[idx])) {
          dob = cols[idx];
          idx++;
        } else {
          motherName = cols[idx];
          idx++;
        }
      }

      // 6. DOB (if not already taken)
      if (!dob && cols[idx]) {
        if (/^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/.test(cols[idx])) {
          dob = cols[idx];
          idx++;
        }
      }

      // 7. Board Name (e.g. BSEB,Bihar or CBSE,Delhi)
      if (cols[idx]) {
        const candidate = cols[idx];
        if (candidate.toLowerCase().includes('bseb') || candidate.toLowerCase().includes('cbse') || candidate.toLowerCase().includes('icse') || candidate.toLowerCase().includes('bihar') || candidate.toLowerCase().includes('delhi')) {
          boardName = candidate;
          idx++;
        } else if (!dob && /^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/.test(candidate)) {
          dob = candidate;
          idx++;
        } else {
          boardName = candidate;
          idx++;
        }
      }

      // 8. Category (Regular / BC / EBC / SC / ST / General)
      if (cols[idx]) {
        const catCandidate = cols[idx];
        if (/^\d+$/.test(catCandidate)) {
          baseFee = parseInt(catCandidate, 10);
          idx++;
        } else {
          category = catCandidate;
          idx++;
        }
      }

      // 9. Fee Amount (e.g. 485 or 685)
      if (cols[idx] && /^\d+$/.test(cols[idx])) {
        baseFee = parseInt(cols[idx], 10);
        idx++;
      } else {
        // Fallback base fee logic based on Board
        const feeCalc = calculateRegistrationFee(boardName, extraFee);
        baseFee = feeCalc.baseFee;
      }

      // If board is not BSEB, ensure baseFee is 685 unless explicitly specified differently
      if (!isBSEBBoard(boardName) && baseFee === 485) {
        baseFee = 685;
      }

      const totalFee = baseFee + extraFee; // 485 + 30 = 515, or 685 + 30 = 715

      let casteCat: CasteCategory = 'BC';
      const catUpper = category.toUpperCase();
      if (catUpper.includes('GEN') || catUpper.includes('REGULAR')) {
        casteCat = 'General';
      } else if (catUpper.includes('EBC')) {
        casteCat = 'EBC';
      } else if (catUpper.includes('SC')) {
        casteCat = 'SC';
      } else if (catUpper.includes('ST')) {
        casteCat = 'ST';
      } else if (catUpper.includes('BC')) {
        casteCat = 'BC';
      }

      const isFemale = name.toLowerCase().includes('kumari') || name.toLowerCase().includes('devi') || name.toLowerCase().includes('sharma') && name.toLowerCase().includes('kumari');

      const studentObj: RegistrationStudent = {
        id: `REG-${Date.now()}-${results.length}`,
        sNo: currentTotalStudents + results.length + 1,
        ofssNo: ofssNo || `REG-2026-${(currentTotalStudents + results.length + 1).toString().padStart(3, '0')}`,
        formNo: `REG-2026-${(currentTotalStudents + results.length + 1).toString().padStart(3, '0')}`,
        studentName: (name || 'STUDENT').toUpperCase(),
        fatherName: (fatherName || 'FATHER').toUpperCase(),
        motherName: (motherName || '').toUpperCase(),
        dob: dob || '15-05-2008',
        boardName: boardName,
        gender: isFemale ? 'FEMALE' : 'MALE',
        casteCategory: casteCat,
        stream: stream,
        mobile: '',
        email: '',
        matricRollCode: settings.code || '31337',
        matricRollNo: '',
        matricPassingYear: '2024',
        prevSchoolName: '',
        baseFee: baseFee,
        serviceCharge: extraFee,
        registrationFee: totalFee,
        paidAmount: totalFee,
        paymentStatus: 'PAID',
        paymentMode: 'CASH',
        paymentDate: dateStr,
        transactionRef: 'CASH-REG',
        documents: {
          aadhar: { status: 'SUBMITTED', verified: true },
          apaar: { status: 'SUBMITTED', verified: true },
          transferCertificate: { status: 'SUBMITTED', verified: true },
          casteCertificate: {
            status: (casteCat === 'EBC' || casteCat === 'SC' || casteCat === 'ST') ? 'SUBMITTED' : 'EXEMPTED',
            verified: true
          },
          matricMarksheet: { status: 'SUBMITTED', verified: true },
        },
        registrationStatus: 'FEE_PAID',
        remarks: `Direct Paste: Base ₹${baseFee} + Extra ₹${extraFee} = ₹${totalFee}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (studentObj.studentName && studentObj.studentName !== 'STUDENT') {
        results.push(studentObj);
      }
    }

    return results;
  };

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

  // Instant Direct Client-Side Parse for Text / Excel Paste
  const handleDirectParse = () => {
    if (!rawText.trim()) {
      setExtractionError('कृपया टेक्स्ट बॉक्स में एक्सेल या OFSS डेटा पेस्ट करें।');
      return;
    }

    const parsed = parseDirectTabularText(rawText.trim(), defaultStream, serviceCharge);
    if (parsed.length > 0) {
      setExtractedStudents(parsed);
      setExtractionError(null);
    } else {
      // If direct table parse didn't find clear columns, fallback to AI Extraction
      handleAIExtract();
    }
  };

  const handleAIExtract = async () => {
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
        const bName = s.boardName || 'BSEB,Bihar';
        const feeCalc = calculateRegistrationFee(bName, serviceCharge);
        const base = s.baseFee || feeCalc.baseFee;
        const total = base + serviceCharge;

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
          boardName: bName,
          gender: s.gender || 'MALE',
          casteCategory: cat,
          stream: stStream,
          mobile: s.mobile || '',
          email: s.email || '',
          matricRollCode: s.matricRollCode || settings.code || '31337',
          matricRollNo: s.matricRollNo || '',
          matricPassingYear: s.matricPassingYear || '2024',
          prevSchoolName: s.prevSchoolName || '',
          baseFee: base,
          serviceCharge: serviceCharge,
          registrationFee: total,
          paidAmount: total,
          paymentStatus: 'PAID',
          paymentMode: 'CASH',
          paymentDate: dateStr,
          transactionRef: 'CASH-REG',
          documents: {
            aadhar: {
              status: s.aadharNo ? 'SUBMITTED' : 'SUBMITTED',
              docNumber: s.aadharNo || '',
              verified: Boolean(s.aadharNo),
            },
            apaar: {
              status: s.apaarId ? 'SUBMITTED' : 'SUBMITTED',
              docNumber: s.apaarId || undefined,
              verified: true,
            },
            transferCertificate: {
              status: s.tcNo ? 'SUBMITTED' : 'SUBMITTED',
              docNumber: s.tcNo || 'TC/2024/001',
              verified: true,
            },
            casteCertificate: {
              status: isCasteMandatory ? (s.casteCertNo ? 'SUBMITTED' : 'SUBMITTED') : 'EXEMPTED',
              docNumber: s.casteCertNo || '',
              verified: true,
            },
            matricMarksheet: {
              status: 'SUBMITTED',
              verified: true,
            },
          },
          registrationStatus: 'FEE_PAID',
          remarks: `AI Parsed: ₹${base} + ₹${serviceCharge} = ₹${total}`,
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
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-bold text-[#4A453E] flex items-center gap-1.5">
                      <ClipboardList className="w-4 h-4 text-[#2E5B50]" />
                      <span>Excel / OFSS तालिका कॉपी-पेस्ट करें (Direct Table Paste):</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleTextSampleLoad}
                        className="text-[11px] text-[#2E5B50] font-bold hover:underline bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                      >
                        डेमो डेटा भरें (Load Sample)
                      </button>
                    </div>
                  </div>

                  {/* Fee Rule & Service Charge Setup */}
                  <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 flex items-center justify-between flex-wrap gap-3">
                    <div className="text-xs text-amber-950 font-medium">
                      <strong className="block text-amber-900 font-bold">शुल्क गणना नियम (Fee Calculation):</strong>
                      <span>BSEB मूल शुल्क ₹485 + सेवा शुल्क ₹{serviceCharge} = <strong className="text-emerald-800 font-bold font-mono">₹{485 + serviceCharge}</strong> &bull; CBSE/अन्य ₹685 + ₹{serviceCharge} = <strong className="text-emerald-800 font-bold font-mono">₹{685 + serviceCharge}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-amber-300">
                      <label className="text-[11px] font-bold text-amber-900">+ सेवा शुल्क:</label>
                      <span className="text-xs font-bold text-gray-700">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={serviceCharge}
                        onChange={(e) => setServiceCharge(Number(e.target.value) || 0)}
                        className="w-14 text-xs font-bold text-emerald-800 font-mono text-center focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <textarea
                    rows={7}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder={`यहाँ Excel / OFSS से कॉपी किया गया डेटा सीधे पेस्ट (Ctrl+V) करें:
उदा.
S.No	OFSS No.	Name	Father Name	Mother Name	DOB	Board Name	Category	Fee Amount
1	26J54670842	ABHIJIT RAM	ASHOK RAM	REKHA DEVI	22-05-2009	BSEB,Bihar	Regular	485
2	26J47535564	ALKA KUMARI	LALU SAH	ANITA DEVI	01-01-2009	BSEB,Bihar	Regular	485
3	26J61508157	ANKITA SINGH	MUKESH RAJ	RAKHI KUMARI	07-02-2010	CBSE,Delhi	Regular	685`}
                    className="w-full p-3 bg-[#FAF9F5] rounded-2xl border border-[#DDD8C5] focus:ring-2 focus:ring-[#2E5B50] text-xs font-mono leading-relaxed"
                  />

                  <p className="text-[11px] text-gray-500">
                    💡 <strong>सुझाव:</strong> Excel या Google Sheets की तालिका को सीधे कॉपी करके यहाँ पेस्ट करें। सिस्टम स्वचालित रूप से सभी 7 कॉलम और शुल्क (485+30 = ₹515) की गणना कर लेगा।
                  </p>
                </div>
              )}

              {/* Extraction Error alert */}
              {extractionError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{extractionError}</span>
                </div>
              )}

              {/* Action buttons */}
              {activeTab === 'TEXT' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!rawText.trim()}
                    onClick={handleDirectParse}
                    className="w-full py-3 rounded-2xl bg-[#2E5B50] hover:bg-[#23463E] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <ClipboardList className="w-4 h-4 text-emerald-300" />
                    <span>⚡ तुरंत तालिका पार्स करें (Instant Table Parse)</span>
                  </button>

                  <button
                    type="button"
                    disabled={isExtracting || !rawText.trim()}
                    onClick={handleAIExtract}
                    className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>AI प्रोसेस हो रहा है...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-200" />
                        <span>✨ AI स्मार्ट एक्सट्रैक्ट (AI Fallback)</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isExtracting || !selectedFile}
                  onClick={handleAIExtract}
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
              )}
            </>
          ) : (
            /* Extracted Preview Confirmation View */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold text-emerald-950">
                      कुल {extractedStudents.length} छात्र रिकॉर्ड सफलतापूर्वक पहचाने गए
                    </h3>
                    <p className="text-[11px] text-emerald-800">
                      सभी छात्रों पर Base Fee + ₹{serviceCharge} (उदा. ₹485 + ₹30 = ₹515) पंजीकरण शुल्क लागू किया गया है।
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setExtractedStudents([])}
                  className="px-3 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-100 transition"
                >
                  &larr; फिर से पेस्ट / स्कैन करें
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
                      <th className="p-2.5 text-right">शुल्क (₹485+30)</th>
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
                          <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-900 rounded font-bold text-[10px] whitespace-nowrap">
                            {stu.boardName || 'BSEB,Bihar'}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-900 rounded text-[11px] font-bold">
                            {stu.casteCategory}
                          </span>
                        </td>
                        <td className="p-2.5 text-right whitespace-nowrap">
                          <span className="font-mono font-bold text-emerald-700">₹{stu.registrationFee || 515}</span>
                          <span className="text-[9px] text-gray-500 block">({stu.baseFee || 485}+{stu.serviceCharge || 30})</span>
                        </td>
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
