/**
 * Comprehensive Date Normalization & Helper Utility
 * Handles Indian format (DD/MM/YYYY), ISO (YYYY-MM-DD), Date objects, and Timestamps seamlessly.
 */

export function normalizeDateToYYYYMMDD(dateVal?: string | Date | null): string {
  if (!dateVal) return '';

  if (dateVal instanceof Date) {
    if (isNaN(dateVal.getTime())) return '';
    const y = dateVal.getFullYear();
    const m = String(dateVal.getMonth() + 1).padStart(2, '0');
    const d = String(dateVal.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const trimmed = String(dateVal).trim();
  if (!trimmed) return '';

  // 1. Match DD/MM/YYYY or DD-MM-YYYY (e.g., '12/09/2026', '12/09/2026 11:30', '05-09-2026')
  const ddmmyyyy = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (ddmmyyyy) {
    const day = ddmmyyyy[1].padStart(2, '0');
    const month = ddmmyyyy[2].padStart(2, '0');
    const year = ddmmyyyy[3];
    return `${year}-${month}-${day}`;
  }

  // 2. Match YYYY-MM-DD or YYYY/MM/DD (e.g., '2026-09-12', '2026-09-12 11:30', '2026/09/12')
  const yyyymmdd = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (yyyymmdd) {
    const year = yyyymmdd[1];
    const month = yyyymmdd[2].padStart(2, '0');
    const day = yyyymmdd[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 3. Try standard Date parsing as fallback
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return trimmed.slice(0, 10);
}

export function formatDateToDDMMYYYY(dateVal?: string | Date | null): string {
  const norm = normalizeDateToYYYYMMDD(dateVal);
  if (!norm || norm.length < 10) return '';
  const [y, m, d] = norm.split('-');
  return `${d}/${m}/${y}`;
}

export function getTodayLocalYYYYMMDD(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getYesterdayLocalYYYYMMDD(): string {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDaysAgoLocalYYYYMMDD(days: number): string {
  const now = new Date();
  now.setDate(now.getDate() - days);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getMonthStartLocalYYYYMMDD(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
}

export function isDateInRange(
  dateVal?: string | Date | null,
  startDate?: string,
  endDate?: string
): boolean {
  if (!startDate && !endDate) return true;
  const norm = normalizeDateToYYYYMMDD(dateVal);
  if (!norm) return false;
  if (startDate && norm < startDate) return false;
  if (endDate && norm > endDate) return false;
  return true;
}
