import React, { useState, useMemo, useEffect } from 'react';
import { 
  UploadCloud, 
  FileText, 
  FileSpreadsheet,
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  RefreshCw, 
  Plus, 
  Download,
  IndianRupee,
  Layers,
  Check,
  CheckSquare,
  Square,
  Trash2,
  ShieldAlert,
  AlertTriangle,
  Info,
  Filter,
  UserCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Student, ExtractedStudent, ExtractionResult } from '../types';
import { 
  detectDuplicates, 
  getDuplicateSummary, 
  StudentDuplicateStatus, 
  DuplicateSummary 
} from '../utils/duplicateDetector';

interface PdfUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportStudents: (newStudents: Student[]) => void;
  existingStudents?: Student[];
  defaultOnlineCharge: number;
}

export const PdfUploadModal: React.FC<PdfUploadModalProps> = ({
  isOpen,
  onClose,
  onImportStudents,
  existingStudents = [],
  defaultOnlineCharge = 30,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractionResult | null>(null);
  const [overrideStream, setOverrideStream] = useState<string>('Intermediate Science (12th)');
  const [overrideOnlineCharge, setOverrideOnlineCharge] = useState<number>(defaultOnlineCharge);

  // Duplicate Resolution & Selection States
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CLEAN' | 'DUPLICATE'>('ALL');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Calculate duplicate statuses for all extracted students
  const duplicateStatuses: StudentDuplicateStatus[] = useMemo(() => {
    if (!extractedData || !extractedData.students) return [];
    return detectDuplicates(extractedData.students, existingStudents);
  }, [extractedData, existingStudents]);

  const duplicateSummary: DuplicateSummary = useMemo(() => {
    return getDuplicateSummary(duplicateStatuses);
  }, [duplicateStatuses]);

  // When extracted data updates, auto-select non-duplicate records by default
  useEffect(() => {
    if (extractedData && extractedData.students.length > 0) {
      const statuses = detectDuplicates(extractedData.students, existingStudents);
      const initialSelected = new Set<number>();
      
      // Auto-select clean records (or all records if none are exact duplicates)
      statuses.forEach((status, idx) => {
        if (!status.isExactMatch) {
          initialSelected.add(idx);
        }
      });

      // If all are exact duplicates or none selected, default to select all so user can manually decide
      if (initialSelected.size === 0) {
        extractedData.students.forEach((_, idx) => initialSelected.add(idx));
      }

      setSelectedIndices(initialSelected);
      setActiveFilter('ALL');
      setExpandedIndex(null);
    } else {
      setSelectedIndices(new Set());
    }
  }, [extractedData, existingStudents]);

  const isExcelFile = (file: File): boolean => {
    const name = file.name.toLowerCase();
    return (
      name.endsWith('.xlsx') ||
      name.endsWith('.xls') ||
      name.endsWith('.csv') ||
      file.type.includes('spreadsheet') ||
      file.type.includes('excel') ||
      file.type.includes('csv')
    );
  };

  const parseExcelSheet = async (file: File): Promise<ExtractionResult> => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

    if (!rows || rows.length === 0) {
      throw new Error('The uploaded Excel sheet contains no data rows.');
    }

    const findValue = (row: Record<string, any>, keywords: string[]): string => {
      for (const key of Object.keys(row)) {
        const lowerKey = key.toLowerCase().trim();
        if (keywords.some((kw) => lowerKey.includes(kw))) {
          const val = row[key];
          return val !== undefined && val !== null ? String(val).trim() : '';
        }
      }
      return '';
    };

    const students: ExtractedStudent[] = rows
      .map((row, index) => {
        const regNo = findValue(row, ['registration', 'reg', 'roll', 'रजिस्ट्रेशन']);
        const name = findValue(row, ['student', 'name', 'candidate', 'नाम']);
        const father = findValue(row, ['father', 'पिता']);
        const mother = findValue(row, ['mother', 'माता']);
        const dob = findValue(row, ['dob', 'birth', 'date', 'जन्म']);
        const caste = findValue(row, ['caste', 'category', 'cat', 'कोटि', 'जाति']);
        const examType = findValue(row, ['exam', 'type', 'प्रकार']);
        const feeStr = findValue(row, ['fee', 'amount', 'total', 'शुल्क']);
        const sNoVal = findValue(row, ['sno', 'sl', 'sr', 'no', 's.n', 's_no']);

        // Skip rows that don't look like student records
        if (!name && !regNo && !father) return null;

        let parsedCaste: 'General' | 'BC' | 'EBC' | 'SC' | 'ST' = 'General';
        const casteUpper = caste.toUpperCase();
        if (casteUpper.includes('SC')) parsedCaste = 'SC';
        else if (casteUpper.includes('ST')) parsedCaste = 'ST';
        else if (casteUpper.includes('EBC') || casteUpper.includes('BC-1') || casteUpper.includes('BC1')) parsedCaste = 'EBC';
        else if (casteUpper.includes('BC') || casteUpper.includes('BC-2') || casteUpper.includes('OBC')) parsedCaste = 'BC';

        let parsedExamType: 'REGULAR' | 'EX-REGULAR' | 'IMPROVEMENT' | 'COMPARTMENTAL' = 'REGULAR';
        const examUpper = examType.toUpperCase();
        if (examUpper.includes('EX') || examUpper.includes('PRIVATE')) parsedExamType = 'EX-REGULAR';
        else if (examUpper.includes('IMP') || examUpper.includes('BETTERMENT')) parsedExamType = 'IMPROVEMENT';
        else if (examUpper.includes('COMP') || examUpper.includes('COMPART')) parsedExamType = 'COMPARTMENTAL';

        let feeNum = parseFloat(feeStr.replace(/[^0-9.]/g, '')) || 0;
        if (!feeNum) {
          feeNum = (parsedCaste === 'SC' || parsedCaste === 'ST' || parsedCaste === 'EBC') ? 1140 : 1400;
        }

        const extracted: ExtractedStudent = {
          sNo: parseInt(sNoVal, 10) || index + 1,
          registrationNo: regNo || `R-31337${String(index + 10).padStart(3, '0')}-25`,
          studentName: (name || `STUDENT ${index + 1}`).toUpperCase(),
          fatherName: father.toUpperCase() || 'NOT MENTIONED',
          motherName: mother.toUpperCase() || 'NOT MENTIONED',
          dob: dob || '',
          casteCategory: parsedCaste,
          examType: parsedExamType,
          feeAmount: feeNum,
        };
        return extracted;
      })
      .filter((s): s is ExtractedStudent => s !== null);

    if (students.length === 0) {
      throw new Error('Could not identify any student data rows in the Excel file. Please use the Sample Template headers.');
    }

    return { students };
  };

  const processFile = async (file: File) => {
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

    // Direct Instant Excel parsing
    if (isExcelFile(file)) {
      setIsExtracting(true);
      try {
        const result = await parseExcelSheet(file);
        setExtractedData(result);
      } catch (err: any) {
        console.error('Excel Parsing Error:', err);
        setExtractionError(err.message || 'Failed to parse Excel file.');
      } finally {
        setIsExtracting(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadSampleExcel = () => {
    const sampleRows = [
      {
        "S.No": 1,
        "Registration No": "R-313370001-25",
        "Student Name": "AMIT KUMAR",
        "Father Name": "RAMESH SINGH",
        "Mother Name": "SUNITA DEVI",
        "DOB": "15/04/2007",
        "Caste Category": "BC",
        "Exam Type": "REGULAR",
        "Fee Amount": 1400
      },
      {
        "S.No": 2,
        "Registration No": "R-313370002-25",
        "Student Name": "PRIYA KUMARI",
        "Father Name": "SURESH ROY",
        "Mother Name": "KAVITA DEVI",
        "DOB": "20/08/2007",
        "Caste Category": "EBC",
        "Exam Type": "REGULAR",
        "Fee Amount": 1140
      },
      {
        "S.No": 3,
        "Registration No": "R-313370003-25",
        "Student Name": "RAHUL KUMAR",
        "Father Name": "DINESH PASWAN",
        "Mother Name": "MANTI DEVI",
        "DOB": "10/01/2006",
        "Caste Category": "SC",
        "Exam Type": "EX-REGULAR",
        "Fee Amount": 1140
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Student_List");
    XLSX.writeFile(wb, "Student_Import_Sample_Template.xlsx");
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

    const selectedStudents = extractedData.students.filter((_, idx) => selectedIndices.has(idx));
    if (selectedStudents.length === 0) return;

    const formattedStudents: Student[] = selectedStudents.map((item, originalIndex) => {
      const baseFee = Number(item.feeAmount) || (item.casteCategory === 'SC' || item.casteCategory === 'ST' || item.casteCategory === 'EBC' ? 1140 : 1400);
      const onlineCharges = overrideOnlineCharge;
      const totalFee = baseFee + onlineCharges;

      // Clean Reg No
      const regNo = item.registrationNo || `R-31337${String(originalIndex + 30).padStart(3, '0')}-25`;

      return {
        id: `STU-${Date.now()}-${originalIndex}`,
        sNo: item.sNo || originalIndex + 1,
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

  const toggleSelectAll = () => {
    if (!extractedData) return;
    if (selectedIndices.size === extractedData.students.length) {
      setSelectedIndices(new Set());
    } else {
      const all = new Set<number>();
      extractedData.students.forEach((_, idx) => all.add(idx));
      setSelectedIndices(all);
    }
  };

  const selectOnlyCleanRecords = () => {
    const cleanSet = new Set<number>();
    duplicateStatuses.forEach((status, idx) => {
      if (!status.hasDuplicate) {
        cleanSet.add(idx);
      }
    });
    setSelectedIndices(cleanSet);
  };

  const deselectDuplicates = () => {
    const nextSet = new Set(selectedIndices);
    duplicateStatuses.forEach((status, idx) => {
      if (status.hasDuplicate) {
        nextSet.delete(idx);
      }
    });
    setSelectedIndices(nextSet);
  };

  const toggleRowSelect = (index: number) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedIndices(next);
  };

  // Filter students based on active tab
  const visibleIndices = useMemo(() => {
    if (!extractedData) return [];
    return extractedData.students
      .map((_, idx) => idx)
      .filter((idx) => {
        const status = duplicateStatuses[idx];
        if (activeFilter === 'CLEAN') return !status?.hasDuplicate;
        if (activeFilter === 'DUPLICATE') return status?.hasDuplicate;
        return true;
      });
  }, [extractedData, duplicateStatuses, activeFilter]);

  if (!isOpen) return null;

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
                <h2 className="text-base font-bold text-[#FDFCF8]">Import Student List (Excel / PDF / Image)</h2>
                <span className="bg-[#2E5B50] text-[#E2ECE9] text-[10px] px-2 py-0.5 rounded-full font-mono border border-[#3B6E62]">
                  Excel Direct & AI OCR
                </span>
              </div>
              <p className="text-xs text-[#C2BEB5]">
                Upload Excel Sheet (.xlsx, .csv), PDF exam list, or document photo to extract student table automatically
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
            <div className="space-y-3">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-[#DDD8C5] hover:border-[#5A5A40] rounded-2xl p-8 text-center bg-[#F7F5EE] hover:bg-[#EFECE1] transition cursor-pointer space-y-4"
              >
                <input
                  type="file"
                  id="file-upload-input"
                  accept=".xlsx,.xls,.csv,.pdf,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <label htmlFor="file-upload-input" className="cursor-pointer space-y-3 block">
                  <div className="flex items-center justify-center gap-3 mx-auto">
                    <div className="w-14 h-14 rounded-full bg-[#2E5B50]/10 text-[#2E5B50] flex items-center justify-center shadow-inner border border-[#2E5B50]/20">
                      <FileSpreadsheet className="w-7 h-7" />
                    </div>
                    <div className="w-14 h-14 rounded-full bg-[#EFECE1] text-[#5A5A40] flex items-center justify-center shadow-inner border border-[#E6E2D3]">
                      <FileText className="w-7 h-7" />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#4A453E]">
                      {selectedFile ? selectedFile.name : 'Click to Browse or Drag & Drop Excel Sheet (.xlsx / .csv) or PDF / Image'}
                    </p>
                    <p className="text-[#787267] mt-1">
                      Supports Excel Sheets (.xlsx, .xls, .csv), PDF documents, or Image screenshots (JPG, PNG)
                    </p>
                  </div>
                </label>

                {selectedFile && !isExcelFile(selectedFile) && (
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

              {/* Sample Excel Template Banner */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#E2ECE9]/60 border border-[#B8D5CE] p-3.5 rounded-xl">
                <div className="flex items-center gap-2 text-[#2E5B50]">
                  <FileSpreadsheet className="w-5 h-5 text-[#2E5B50] shrink-0" />
                  <span className="font-semibold text-xs">Excel File Format Nahi Hai? Ready-made Template Download Karein:</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleExcel}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2E5B50] hover:bg-[#254A41] text-white font-bold rounded-lg shadow-xs transition shrink-0 text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample Excel (.xlsx)</span>
                </button>
              </div>

              {/* Format Guide Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-[#4A453E]">
                <div className="p-3 bg-[#FDFCF8] border border-[#E6E2D3] rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-[#2E5B50] font-bold text-xs">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>1. Excel (.xlsx / .csv)</span>
                  </div>
                  <p className="text-[11px] text-[#787267]">
                    Instant upload! Column headers: <strong>Registration No, Student Name, Father Name, Mother Name, Category, Fee</strong>.
                  </p>
                </div>

                <div className="p-3 bg-[#FDFCF8] border border-[#E6E2D3] rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-[#5A5A40] font-bold text-xs">
                    <FileText className="w-4 h-4" />
                    <span>2. Board PDF List</span>
                  </div>
                  <p className="text-[11px] text-[#787267]">
                    Upload official Bihar Board / State Board PDF file. AI automatically scans and creates rows.
                  </p>
                </div>

                <div className="p-3 bg-[#FDFCF8] border border-[#E6E2D3] rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-[#8C5A2B] font-bold text-xs">
                    <Layers className="w-4 h-4" />
                    <span>3. Photo / Screenshot</span>
                  </div>
                  <p className="text-[11px] text-[#787267]">
                    Upload clear photo (JPG/PNG) of printed student list or register. AI OCR extracts all details.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isExtracting && (
            <div className="p-8 text-center space-y-3 bg-[#F7F5EE] rounded-xl border border-[#E6E2D3]">
              <RefreshCw className="w-8 h-8 animate-spin text-[#5A5A40] mx-auto" />
              <p className="text-sm font-bold text-[#4A453E]">Reading student table & extracting data...</p>
              <p className="text-[#787267]">
                Gemini 2.5 Flash is analyzing registration numbers, names, father/mother names, DOBs, categories, and fees.
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

          {/* Extracted Data Review & Duplicate Resolution Section */}
          {extractedData && (
            <div className="space-y-4">
              
              {/* Duplicate Warning / Clean Status Banner */}
              {duplicateSummary.hasDuplicates ? (
                <div className="bg-[#FFF8EE] border border-[#E6C687] p-4 rounded-xl space-y-2 text-[#66460D]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm">
                          {duplicateSummary.duplicateCount} Duplicate Record{duplicateSummary.duplicateCount > 1 ? 's' : ''} Detected
                        </p>
                        <p className="text-xs text-[#785412] mt-0.5">
                          {duplicateSummary.exactMatchCount > 0 && (
                            <span className="font-semibold text-[#B45309] mr-2">
                              • {duplicateSummary.exactMatchCount} matching existing registration numbers (unselected by default)
                            </span>
                          )}
                          {duplicateSummary.nameMatchCount > 0 && (
                            <span className="font-semibold text-[#D97706] mr-2">
                              • {duplicateSummary.nameMatchCount} potential student name matches
                            </span>
                          )}
                          {duplicateSummary.inBatchDuplicateCount > 0 && (
                            <span className="font-semibold text-[#B45309]">
                              • {duplicateSummary.inBatchDuplicateCount} duplicates within this uploaded file
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setExtractedData(null);
                        setSelectedFile(null);
                      }}
                      className="px-3 py-1.5 bg-[#FDFCF8] text-[#4A453E] border border-[#DDD8C5] hover:bg-[#F7F5EE] rounded-lg text-xs font-semibold shrink-0"
                    >
                      Upload Another File
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#E6C687]/50 text-xs">
                    <span className="text-[#8C5A2B] font-medium">Quick Resolution:</span>
                    <button
                      onClick={selectOnlyCleanRecords}
                      className="px-2.5 py-1 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] font-semibold rounded border border-[#F59E0B]/30 flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      Select Only Clean Records ({duplicateSummary.cleanCount})
                    </button>
                    <button
                      onClick={deselectDuplicates}
                      className="px-2.5 py-1 bg-[#FDFCF8] hover:bg-[#F7F5EE] text-[#787267] rounded border border-[#DDD8C5]"
                    >
                      Deselect All Duplicates
                    </button>
                    <button
                      onClick={toggleSelectAll}
                      className="px-2.5 py-1 bg-[#FDFCF8] hover:bg-[#F7F5EE] text-[#787267] rounded border border-[#DDD8C5]"
                    >
                      {selectedIndices.size === extractedData.students.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#E2ECE9] border border-[#3B6E62] p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-[#2E5B50]">
                    <CheckCircle2 className="w-5 h-5 text-[#2E5B50] shrink-0" />
                    <div>
                      <p className="font-bold text-sm">
                        Extracted {extractedData.students.length} Student Records — All Unique!
                      </p>
                      <p className="text-[#3B6E62] text-xs">
                        No duplicate registration numbers or student names were found in your existing database.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setExtractedData(null);
                      setSelectedFile(null);
                    }}
                    className="px-3 py-1.5 bg-[#FDFCF8] text-[#4A453E] border border-[#DDD8C5] hover:bg-[#F7F5EE] rounded-lg text-xs font-semibold shrink-0"
                  >
                    Upload Another File
                  </button>
                </div>
              )}

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

              {/* Filter Tabs & Selection Counters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5 bg-[#EFECE1] p-1 rounded-lg border border-[#E6E2D3]">
                  <button
                    onClick={() => setActiveFilter('ALL')}
                    className={`px-3 py-1 rounded-md font-semibold transition text-xs ${
                      activeFilter === 'ALL'
                        ? 'bg-[#FDFCF8] text-[#4A453E] shadow-xs'
                        : 'text-[#787267] hover:text-[#4A453E]'
                    }`}
                  >
                    All Records ({extractedData.students.length})
                  </button>

                  <button
                    onClick={() => setActiveFilter('CLEAN')}
                    className={`px-3 py-1 rounded-md font-semibold transition text-xs flex items-center gap-1 ${
                      activeFilter === 'CLEAN'
                        ? 'bg-[#FDFCF8] text-[#2E5B50] shadow-xs'
                        : 'text-[#787267] hover:text-[#2E5B50]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Clean ({duplicateSummary.cleanCount})
                  </button>

                  {duplicateSummary.duplicateCount > 0 && (
                    <button
                      onClick={() => setActiveFilter('DUPLICATE')}
                      className={`px-3 py-1 rounded-md font-semibold transition text-xs flex items-center gap-1 ${
                        activeFilter === 'DUPLICATE'
                          ? 'bg-[#FEF3C7] text-[#92400E] shadow-xs border border-[#F59E0B]/30'
                          : 'text-[#D97706] hover:text-[#B45309]'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
                      Duplicates ({duplicateSummary.duplicateCount})
                    </button>
                  )}
                </div>

                <div className="text-xs font-semibold text-[#5A5A40] flex items-center gap-2">
                  <span>
                    Selected for import: <strong className="text-[#2E5B50] font-mono text-sm">{selectedIndices.size}</strong> of {extractedData.students.length}
                  </span>
                </div>
              </div>

              {/* Students Review Table */}
              <div className="border border-[#E6E2D3] rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#EFECE1] sticky top-0 z-10 border-b border-[#E6E2D3] font-semibold text-[#4A453E]">
                    <tr>
                      <th className="p-2.5 text-center w-10">
                        <button
                          onClick={toggleSelectAll}
                          title="Select / Deselect All Visible"
                          className="p-1 rounded text-[#5A5A40] hover:bg-[#E6E2D3]"
                        >
                          {selectedIndices.size === extractedData.students.length ? (
                            <CheckSquare className="w-4 h-4 text-[#2E5B50]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#787267]" />
                          )}
                        </button>
                      </th>
                      <th className="p-2.5 text-center">S.N</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Registration No</th>
                      <th className="p-2.5">Student Name</th>
                      <th className="p-2.5">Father Name</th>
                      <th className="p-2.5">Mother Name</th>
                      <th className="p-2.5">DOB</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5 text-right">Fee (+₹{overrideOnlineCharge})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E2D3]">
                    {visibleIndices.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-8 text-center text-[#787267]">
                          No records match the active filter criteria.
                        </td>
                      </tr>
                    ) : (
                      visibleIndices.map((idx) => {
                        const st = extractedData.students[idx];
                        const dupStatus = duplicateStatuses[idx];
                        const isSelected = selectedIndices.has(idx);
                        const isExpanded = expandedIndex === idx;

                        const baseFee = Number(st.feeAmount) || (st.casteCategory === 'SC' || st.casteCategory === 'ST' || st.casteCategory === 'EBC' ? 1140 : 1400);
                        const totalFee = baseFee + overrideOnlineCharge;

                        let rowBg = 'hover:bg-[#F7F5EE]';
                        if (dupStatus.isExactMatch) {
                          rowBg = isSelected ? 'bg-[#FEF2F2] hover:bg-[#FEE2E2]' : 'bg-[#FFF5F5] opacity-75';
                        } else if (dupStatus.isNameMatch) {
                          rowBg = isSelected ? 'bg-[#FFFBEB] hover:bg-[#FEF3C7]' : 'bg-[#FFFAF0] opacity-85';
                        } else if (dupStatus.isInBatchDuplicate) {
                          rowBg = isSelected ? 'bg-[#FFF1F2] hover:bg-[#FFE4E6]' : 'bg-[#FFF5F5] opacity-80';
                        }

                        return (
                          <React.Fragment key={idx}>
                            <tr className={`transition-colors ${rowBg}`}>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleRowSelect(idx)}
                                  className="p-1 rounded text-[#5A5A40]"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-4 h-4 text-[#2E5B50]" />
                                  ) : (
                                    <Square className="w-4 h-4 text-[#8C857B]" />
                                  )}
                                </button>
                              </td>

                              <td className="p-2 text-center font-mono text-[#787267]">
                                {st.sNo || idx + 1}
                              </td>

                              {/* Duplicate Status Badge */}
                              <td className="p-2 whitespace-nowrap">
                                {dupStatus.isExactMatch ? (
                                  <button
                                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5] flex items-center gap-1 hover:brightness-95"
                                  >
                                    <ShieldAlert className="w-3 h-3 text-[#DC2626]" />
                                    <span>Exact Reg Duplicate</span>
                                  </button>
                                ) : dupStatus.isInBatchDuplicate ? (
                                  <button
                                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFE4E6] text-[#9F1239] border border-[#FECDD3] flex items-center gap-1 hover:brightness-95"
                                  >
                                    <AlertTriangle className="w-3 h-3 text-[#E11D48]" />
                                    <span>File Duplicate</span>
                                  </button>
                                ) : dupStatus.isNameMatch ? (
                                  <button
                                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] flex items-center gap-1 hover:brightness-95"
                                  >
                                    <AlertTriangle className="w-3 h-3 text-[#D97706]" />
                                    <span>Name Match</span>
                                  </button>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E2ECE9] text-[#2E5B50] border border-[#B8D5CE] inline-flex items-center gap-1">
                                    <Check className="w-3 h-3" />
                                    <span>New Record</span>
                                  </span>
                                )}
                              </td>

                              <td className="p-2 font-mono font-semibold text-[#4A453E]">
                                {st.registrationNo}
                              </td>

                              <td className="p-2 font-bold text-[#4A453E]">
                                {st.studentName}
                              </td>

                              <td className="p-2 text-[#787267]">
                                {st.fatherName}
                              </td>

                              <td className="p-2 text-[#787267]">
                                {st.motherName}
                              </td>

                              <td className="p-2 font-mono text-[#787267]">
                                {st.dob}
                              </td>

                              <td className="p-2 font-semibold text-[#4A453E]">
                                {st.casteCategory || 'General'}
                              </td>

                              <td className="p-2 text-right font-mono font-bold text-[#4A453E]">
                                ₹{totalFee} <span className="text-[10px] text-[#8C857B] font-normal">(Base: ₹{baseFee})</span>
                              </td>
                            </tr>

                            {/* Details Drawer / Card for Duplicates */}
                            {(dupStatus.hasDuplicate || isExpanded) && (
                              <tr className="bg-[#FFFDFA] border-b border-[#E6E2D3]">
                                <td colSpan={10} className="p-3 pl-10">
                                  <div className="bg-[#F7F5EE] border border-[#DDD8C5] p-3 rounded-lg text-xs space-y-1.5">
                                    <div className="flex items-center gap-2 font-bold text-[#8C5A2B]">
                                      <Info className="w-4 h-4 text-[#D97706]" />
                                      <span>Duplicate Warning Details:</span>
                                    </div>

                                    {dupStatus.conflicts.map((conf, cIdx) => (
                                      <div key={cIdx} className="pl-6 text-[#5A5A40]">
                                        <p className="font-semibold text-[#4A453E]">• {conf.reason}</p>
                                        <p className="text-[11px] text-[#787267] font-mono">
                                          Existing DB Record: Reg No [{conf.existingStudent.registrationNo}] - {conf.existingStudent.studentName} (Father: {conf.existingStudent.fatherName})
                                        </p>
                                      </div>
                                    ))}

                                    <div className="pl-6 pt-1 text-[11px] text-[#787267] italic">
                                      Tip: Uncheck the checkbox on the left if you do not want to import this duplicate student again.
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#EFECE1] px-6 py-4 border-t border-[#E6E2D3] flex items-center justify-between text-xs">
          <div className="text-[#787267]">
            {extractedData ? (
              <span>
                <strong>{selectedIndices.size}</strong> of {extractedData.students.length} students selected for import.
              </span>
            ) : (
              'Select an Excel (.xlsx / .csv), PDF or image file to extract students.'
            )}
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
                disabled={selectedIndices.size === 0}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#5A5A40] hover:bg-[#484833] text-white rounded-lg font-semibold shadow transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>Import {selectedIndices.size} Selected Students</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
