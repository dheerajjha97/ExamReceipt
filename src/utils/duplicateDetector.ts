import { ExtractedStudent, Student } from '../types';

export type DuplicateType =
  | 'EXISTING_REG_NO'
  | 'EXISTING_NAME_AND_FATHER'
  | 'EXISTING_NAME_ONLY'
  | 'FILE_DUPLICATE_REG_NO'
  | 'FILE_DUPLICATE_NAME';

export interface DuplicateMatchInfo {
  type: DuplicateType;
  severity: 'danger' | 'warning' | 'info';
  badgeText: string;
  description: string;
  matchedStudentName?: string;
  matchedRegNo?: string;
  matchedFatherName?: string;
  matchedStudentId?: string;
  matchedRowNumber?: number;
  existingStudent?: Student;
}

export interface StudentDuplicateStatus {
  index: number;
  hasDuplicate: boolean;
  isExactMatch: boolean; // Exact Reg No or Exact Name + Father match
  isNameMatch: boolean;
  isInBatchDuplicate: boolean;
  primaryMatch?: DuplicateMatchInfo;
  allMatches: DuplicateMatchInfo[];
  conflicts: { reason: string; existingStudent: Partial<Student> }[];
}

export interface DuplicateSummary {
  totalExtracted: number;
  totalDuplicates: number;
  duplicateCount: number;
  hasDuplicates: boolean;
  exactDuplicates: number;
  exactMatchCount: number;
  nameMatchesOnly: number;
  nameMatchCount: number;
  existingDbDuplicates: number;
  intraFileDuplicates: number;
  inBatchDuplicateCount: number;
  cleanRecords: number;
  cleanCount: number;
}

/**
 * Normalizes text for comparison: lowercases, trims, collapses multiple spaces
 */
export function normalizeText(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Normalizes registration number by removing spaces, hyphens, and slashes
 */
export function normalizeRegNo(regNo: string | undefined | null): string {
  if (!regNo) return '';
  return regNo
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Detects duplicate students against existing database records and within the imported document itself.
 */
export function detectDuplicates(
  extractedStudents: ExtractedStudent[],
  existingStudents: Student[] = []
): StudentDuplicateStatus[] {
  // Pre-index existing students for quick lookups
  const existingByRegNo = new Map<string, Student>();
  const existingByName = new Map<string, Student[]>();

  existingStudents.forEach((student) => {
    const normReg = normalizeRegNo(student.registrationNo);
    if (normReg) {
      existingByRegNo.set(normReg, student);
    }

    const normName = normalizeText(student.studentName);
    if (normName) {
      const list = existingByName.get(normName) || [];
      list.push(student);
      existingByName.set(normName, list);
    }
  });

  // Track occurrences within the file
  const fileRegNoIndices = new Map<string, number>();
  const fileNameIndices = new Map<string, number>();

  return extractedStudents.map((current, index) => {
    const matches: DuplicateMatchInfo[] = [];
    const normCurrentReg = normalizeRegNo(current.registrationNo);
    const normCurrentName = normalizeText(current.studentName);
    const normCurrentFather = normalizeText(current.fatherName);

    // 1. Check against existing database by Registration Number
    if (normCurrentReg && existingByRegNo.has(normCurrentReg)) {
      const existing = existingByRegNo.get(normCurrentReg)!;
      matches.push({
        type: 'EXISTING_REG_NO',
        severity: 'danger',
        badgeText: 'Reg No in Database',
        description: `Reg No "${current.registrationNo}" already registered for "${existing.studentName}" (${existing.classOrStream || 'Existing Student'}).`,
        matchedStudentName: existing.studentName,
        matchedRegNo: existing.registrationNo,
        matchedStudentId: existing.id,
        existingStudent: existing,
      });
    }

    // 2. Check against existing database by Student Name & Father Name
    if (normCurrentName && existingByName.has(normCurrentName)) {
      const existingList = existingByName.get(normCurrentName)!;
      
      // Look for match with same Father Name
      const exactFatherMatch = existingList.find((ex) => {
        const normExFather = normalizeText(ex.fatherName);
        return (
          normExFather &&
          normCurrentFather &&
          normExFather !== 'not mentioned' &&
          normExFather === normCurrentFather
        );
      });

      if (exactFatherMatch) {
        // Prevent duplicate match if already matched by reg no
        if (!matches.some((m) => m.existingStudent?.id === exactFatherMatch.id)) {
          matches.push({
            type: 'EXISTING_NAME_AND_FATHER',
            severity: 'danger',
            badgeText: 'Name & Father Matched',
            description: `Student "${current.studentName}" with Father "${current.fatherName}" already exists in system (Reg: ${exactFatherMatch.registrationNo}).`,
            matchedStudentName: exactFatherMatch.studentName,
            matchedFatherName: exactFatherMatch.fatherName,
            matchedRegNo: exactFatherMatch.registrationNo,
            matchedStudentId: exactFatherMatch.id,
            existingStudent: exactFatherMatch,
          });
        }
      } else {
        // Same name but different/unknown father name
        const firstMatch = existingList[0];
        if (!matches.some((m) => m.existingStudent?.id === firstMatch.id)) {
          matches.push({
            type: 'EXISTING_NAME_ONLY',
            severity: 'warning',
            badgeText: 'Same Name in Database',
            description: `A student named "${firstMatch.studentName}" is already in system (Reg: ${firstMatch.registrationNo}, Father: ${firstMatch.fatherName || 'N/A'}).`,
            matchedStudentName: firstMatch.studentName,
            matchedRegNo: firstMatch.registrationNo,
            matchedStudentId: firstMatch.id,
            existingStudent: firstMatch,
          });
        }
      }
    }

    // 3. Check for duplicates within this file (Intra-batch)
    if (normCurrentReg) {
      if (fileRegNoIndices.has(normCurrentReg)) {
        const prevIndex = fileRegNoIndices.get(normCurrentReg)!;
        matches.push({
          type: 'FILE_DUPLICATE_REG_NO',
          severity: 'danger',
          badgeText: `File Duplicate (Row #${prevIndex + 1})`,
          description: `Registration No "${current.registrationNo}" is repeated in this file (also in Row #${prevIndex + 1}).`,
          matchedRowNumber: prevIndex + 1,
        });
      } else {
        fileRegNoIndices.set(normCurrentReg, index);
      }
    }

    // Check duplicate name + father inside file
    const fileCompositeKey = `${normCurrentName}|${normCurrentFather}`;
    if (normCurrentName && normCurrentFather && normCurrentFather !== 'not mentioned') {
      if (fileNameIndices.has(fileCompositeKey)) {
        const prevIndex = fileNameIndices.get(fileCompositeKey)!;
        if (!matches.some((m) => m.type === 'FILE_DUPLICATE_REG_NO')) {
          matches.push({
            type: 'FILE_DUPLICATE_NAME',
            severity: 'warning',
            badgeText: `File Name Repeat (Row #${prevIndex + 1})`,
            description: `Student "${current.studentName}" (Father: "${current.fatherName}") appears multiple times in this document.`,
            matchedRowNumber: prevIndex + 1,
          });
        }
      } else {
        fileNameIndices.set(fileCompositeKey, index);
      }
    }

    const hasDuplicate = matches.length > 0;
    const isExactMatch = matches.some(
      (m) =>
        m.type === 'EXISTING_REG_NO' ||
        m.type === 'EXISTING_NAME_AND_FATHER' ||
        m.type === 'FILE_DUPLICATE_REG_NO'
    );
    const isNameMatch = matches.some(
      (m) => m.type === 'EXISTING_NAME_ONLY' || m.type === 'FILE_DUPLICATE_NAME'
    );
    const isInBatchDuplicate = matches.some(
      (m) => m.type === 'FILE_DUPLICATE_REG_NO' || m.type === 'FILE_DUPLICATE_NAME'
    );
    const conflicts = matches.map((m) => ({
      reason: m.description,
      existingStudent: (m.existingStudent || {
        registrationNo: m.matchedRegNo || 'FILE DUP',
        studentName: m.matchedStudentName || current.studentName,
        fatherName: m.matchedFatherName || current.fatherName,
      }) as Student,
    }));

    return {
      index,
      hasDuplicate,
      isExactMatch,
      isNameMatch,
      isInBatchDuplicate,
      primaryMatch: matches[0],
      allMatches: matches,
      conflicts,
    };
  });
}

/**
 * Calculates a summary of duplicates found
 */
export function getDuplicateSummary(statuses: StudentDuplicateStatus[]): DuplicateSummary {
  const totalExtracted = statuses.length;
  let totalDuplicates = 0;
  let exactDuplicates = 0;
  let nameMatchesOnly = 0;
  let existingDbDuplicates = 0;
  let intraFileDuplicates = 0;

  statuses.forEach((s) => {
    if (s.hasDuplicate) {
      totalDuplicates++;
      if (s.isExactMatch) {
        exactDuplicates++;
      } else {
        nameMatchesOnly++;
      }

      if (
        s.allMatches.some(
          (m) =>
            m.type === 'EXISTING_REG_NO' ||
            m.type === 'EXISTING_NAME_AND_FATHER' ||
            m.type === 'EXISTING_NAME_ONLY'
        )
      ) {
        existingDbDuplicates++;
      }

      if (
        s.allMatches.some(
          (m) =>
            m.type === 'FILE_DUPLICATE_REG_NO' ||
            m.type === 'FILE_DUPLICATE_NAME'
        )
      ) {
        intraFileDuplicates++;
      }
    }
  });

  return {
    totalExtracted,
    totalDuplicates,
    duplicateCount: totalDuplicates,
    hasDuplicates: totalDuplicates > 0,
    exactDuplicates,
    exactMatchCount: exactDuplicates,
    nameMatchesOnly,
    nameMatchCount: nameMatchesOnly,
    existingDbDuplicates,
    intraFileDuplicates,
    inBatchDuplicateCount: intraFileDuplicates,
    cleanRecords: totalExtracted - totalDuplicates,
    cleanCount: totalExtracted - totalDuplicates,
  };
}
