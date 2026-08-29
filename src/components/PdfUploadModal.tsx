import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  Plus, 
  Download,
  IndianRupee,
  Layers
} from 'lucide-react';
import { Student, ExtractedStudent, ExtractionResult } from '../types';

interface PdfUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportStudents: (newStudents: Student[]) => void;
  defaultOnlineCharge: number;
}

export const PdfUploadModal: React.FC<PdfUploadModalProps> = ({
  isOpen,
  onClose,
  onImportStudents,
  defaultOnlineCharge = 30,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractionResult | null>(null);
  const [overrideStream, setOverrideStream] = useState<string>('Intermediate Science (12th)');
  const [overrideOnlineCharge, setOverrideOnlineCharge] = useState<number>(defaultOnlineCharge);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setExtractionError(null);
      setExtractedData(null);

      // Create preview for image
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setFilePreviewUrl(url);
      } else {
        setFilePreviewUrl(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setExtractionError(null);
      setExtractedData(null);

      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setFilePreviewUrl(url);
      } else {
        setFilePreviewUrl(null);
      }
    }
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read uploaded file.'));
      reader.readAsDataURL(file);
    });
  };

  const handleRunAiExtraction = async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    setExtractionError(null);

    try {
      const fileData = await readFileAsDataUrl(selectedFile);
      const isPdf = selectedFile.name.toLowerCase().endsWith('.pdf') || selectedFile.type.includes('pdf');
      const mimeType = selectedFile.type || (isPdf ? 'application/pdf' : 'image/jpeg');

      const response = await fetch('/api/extract-students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData,
          mimeType,
          filename: selectedFile.name,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      let resData: any = {};

      if (contentType.includes('application/json')) {
        resData = await response.json();
      } else {
        const rawText = await response.text();
        if (response.status === 404 || rawText.includes('The page could not be found') || rawText.includes('404')) {
          throw new Error('API route /api/extract-students was not found on this deployment server. Please ensure GEMINI_API_KEY environment variable is set in your Vercel project settings.');
        } else {
          throw new Error(rawText.slice(0, 150) || `Server returned non-JSON response (HTTP ${response.status})`);
        }
      }

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to extract data from document');
      }

      if (!resData.data || !resData.data.students || resData.data.students.length === 0) {
        throw new Error('No student records were detected in this document. Please make sure the uploaded PDF or image contains a clear table.');
      }

      setExtractedData(resData.data);
      if (resData.data?.classOrStream) {
        setOverrideStream(resData.data.classOrStream);
      }
    } catch (err: any) {
      console.error('Extraction failed:', err);
      setExtractionError(err.message || 'AI OCR extraction failed. Please ensure file is clear and readable.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConfirmImport = () => {
    if (!extractedData || !extractedData.students || extractedData.students.length === 0) return;

    const formattedStudents: Student[] = extractedData.students.map((item, index) => {
      const baseFee = Number(item.feeAmount) || (item.casteCategory === 'SC' || item.casteCategory === 'ST' || item.casteCategory === 'EBC' ? 1140 : 1400);
      const onlineCharges = overrideOnlineCharge;
      const totalFee = baseFee + onlineCharges;

      // Clean Reg No
      const regNo = item.registrationNo || `R-31337${String(index + 30).padStart(3, '0')}-25`;

      return {
        id: `STU-${Date.now()}-${index}`,
        sNo: item.sNo || index + 1,
        registrationNo: regNo,
        studentName: (item.studentName || 'UNKNOWN STUDENT').toUpperCase(),
        fatherName: (item.fatherName || 'NOT MENTIONED').toUpperCase(),
        motherName: (item.motherName || 'NOT MENTIONED').toUpperCase(),
        dob: item.dob || '01-01-2008',
        casteCategory: item.casteCategory || 'General',
        examType: item.examType || 'REGULAR',
        classOrStream: overrideStream,
        phone: '',
        baseFee,
        onlineCharges,
        totalFee,
        paidAmount: 0,
        paymentStatus: 'UNPAID',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    onImportStudents(formattedStudents);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2A26]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FDFCF8] rounded-2xl shadow-2xl max-w-4xl w-full border border-[#E6E2D3] overflow-hidden my-6">
        
        {/* Modal Top Bar */}
        <div className="bg-[#4A453E] text-white px-6 py-4 flex items-center justify-between border-b border-[#3E3A33]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#5A5A40] text-[#E6E2D3] rounded-lg border border-[#737356]">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#FDFCF8]">Extract Student List from PDF / Image</h2>
                <span className="bg-[#2E5B50] text-[#E2ECE9] text-[10px] px-2 py-0.5 rounded-full font-mono border border-[#3B6E62]">
                  Gemini 3.7 Flash AI
                </span>
              </div>
              <p className="text-xs text-[#C2BEB5]">
                Upload Bihar Board / Inter / Matric exam list document to extract student table automatically
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#C2BEB5] hover:text-white rounded-lg hover:bg-[#3E3A33] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
          
          {/* Upload Drop Zone */}
          {!extractedData && (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-[#DDD8C5] hover:border-[#5A5A40] rounded-2xl p-8 text-center bg-[#F7F5EE] hover:bg-[#EFECE1] transition cursor-pointer space-y-4"
            >
              <input
                type="file"
                id="file-upload-input"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <label htmlFor="file-upload-input" className="cursor-pointer space-y-3 block">
                <div className="w-16 h-16 rounded-full bg-[#EFECE1] text-[#5A5A40] flex items-center justify-center mx-auto shadow-inner border border-[#E6E2D3]">
                  <FileText className="w-8 h-8" />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#4A453E]">
                    {selectedFile ? selectedFile.name : 'Click to Browse or Drag & Drop PDF / Image file'}
                  </p>
                  <p className="text-[#787267] mt-1">
                    Supports PDF documents or Image screenshots of Matric & Intermediate Fee Lists (JPG, PNG, WEBP)
                  </p>
                </div>
              </label>

              {selectedFile && (
                <div className="pt-2 flex items-center justify-center gap-3">
                  <span className="px-3 py-1 bg-[#EFECE1] text-[#5A5A40] rounded-full font-medium border border-[#DDD8C5]">
                    File selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>

                  <button
                    type="button"
                    onClick={handleRunAiExtraction}
                    disabled={isExtracting}
                    className="flex items-center gap-2 px-5 py-2 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-lg font-semibold shadow transition disabled:opacity-50"
                  >
                    {isExtracting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>AI Scanning & Extracting Rows...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Extract Details with AI</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Loading Indicator */}
          {isExtracting && (
            <div className="p-8 text-center space-y-3 bg-[#F7F5EE] rounded-xl border border-[#E6E2D3]">
              <RefreshCw className="w-8 h-8 animate-spin text-[#5A5A40] mx-auto" />
              <p className="text-sm font-bold text-[#4A453E]">Reading student table & extracting data...</p>
              <p className="text-[#787267]">
                Gemini 3.7 Flash is analyzing registration numbers, names, father/mother names, DOBs, categories, and fees.
              </p>
            </div>
          )}

          {/* Error display */}
          {extractionError && (
            <div className="p-4 bg-[#F9EAEA] border border-[#E0A8A8] rounded-xl text-[#8C2B2B] flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#8C2B2B] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Extraction Error</p>
                <p className="text-[#682424]">{extractionError}</p>
              </div>
            </div>
          )}

          {/* Extracted Data Review Table */}
          {extractedData && (
            <div className="space-y-4">
              <div className="bg-[#E2ECE9] border border-[#3B6E62] p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[#2E5B50]">
                  <CheckCircle2 className="w-5 h-5 text-[#2E5B50] shrink-0" />
                  <div>
                    <p className="font-bold text-sm">
                      Extracted {extractedData.students.length} Student Records
                    </p>
                    <p className="text-[#3B6E62]">
                      Review extracted data below before importing to database.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setExtractedData(null);
                    setSelectedFile(null);
                  }}
                  className="px-3 py-1.5 bg-[#FDFCF8] text-[#4A453E] border border-[#DDD8C5] hover:bg-[#F7F5EE] rounded-lg text-xs font-semibold"
                >
                  Upload Another File
                </button>
              </div>

              {/* Import Options Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F7F5EE] p-4 rounded-xl border border-[#E6E2D3]">
                <div>
                  <label className="block font-semibold text-[#4A453E] mb-1">
                    Assign Class / Stream to Extracted Students:
                  </label>
                  <select
                    value={overrideStream}
                    onChange={(e) => setOverrideStream(e.target.value)}
                    className="w-full bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg px-3 py-1.5 text-[#4A453E] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                  >
                    <option value="Intermediate Science (12th)">Intermediate Science (12th)</option>
                    <option value="Intermediate Arts (12th)">Intermediate Arts (12th)</option>
                    <option value="Intermediate Commerce (12th)">Intermediate Commerce (12th)</option>
                    <option value="Matriculation (10th)">Matriculation (10th)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#4A453E] mb-1">
                    Include Extra Online Charges (₹):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C857B] font-bold">₹</span>
                    <input
                      type="number"
                      value={overrideOnlineCharge}
                      onChange={(e) => setOverrideOnlineCharge(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-1.5 bg-[#FDFCF8] border border-[#DDD8C5] rounded-lg text-[#4A453E] font-bold focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="border border-[#E6E2D3] rounded-xl overflow-x-auto max-h-80">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#EFECE1] sticky top-0 border-b border-[#E6E2D3] font-semibold text-[#4A453E]">
                    <tr>
                      <th className="p-2.5 text-center">S.N</th>
                      <th className="p-2.5">Registration No</th>
                      <th className="p-2.5">Student Name</th>
                      <th className="p-2.5">Father Name</th>
                      <th className="p-2.5">Mother Name</th>
                      <th className="p-2.5">DOB</th>
                      <th className="p-2.5">Caste</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5 text-right">Fee (+₹30)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E2D3]">
                    {extractedData.students.map((st, idx) => {
                      const baseFee = Number(st.feeAmount) || (st.casteCategory === 'SC' || st.casteCategory === 'ST' || st.casteCategory === 'EBC' ? 1140 : 1400);
                      const totalFee = baseFee + overrideOnlineCharge;

                      return (
                        <tr key={idx} className="hover:bg-[#F7F5EE]">
                          <td className="p-2 text-center font-mono text-[#787267]">{st.sNo || idx + 1}</td>
                          <td className="p-2 font-mono font-semibold text-[#4A453E]">{st.registrationNo}</td>
                          <td className="p-2 font-bold text-[#4A453E]">{st.studentName}</td>
                          <td className="p-2 text-[#787267]">{st.fatherName}</td>
                          <td className="p-2 text-[#787267]">{st.motherName}</td>
                          <td className="p-2 font-mono text-[#787267]">{st.dob}</td>
                          <td className="p-2 font-semibold text-[#4A453E]">{st.casteCategory || 'General'}</td>
                          <td className="p-2 text-[#5A5A40] font-mono">{st.examType || 'REGULAR'}</td>
                          <td className="p-2 text-right font-mono font-bold text-[#4A453E]">
                            ₹{totalFee} <span className="text-[10px] text-[#8C857B] font-normal">(Base: ₹{baseFee})</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#EFECE1] px-6 py-4 border-t border-[#E6E2D3] flex items-center justify-between text-xs">
          <div className="text-[#787267]">
            {extractedData
              ? `Ready to add ${extractedData.students.length} students to app database.`
              : 'Select a PDF or image file to extract.'}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#EFECE1] hover:bg-[#E6E2D3] text-[#4A453E] rounded-lg font-medium transition border border-[#DDD8C5]"
            >
              Cancel
            </button>

            {extractedData && (
              <button
                onClick={handleConfirmImport}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-lg font-semibold shadow transition"
              >
                <Plus className="w-4 h-4" />
                <span>Import {extractedData.students.length} Students</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
