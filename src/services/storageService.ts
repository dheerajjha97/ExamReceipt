import { Student, Transaction, InstituteSettings, GitHubConfig } from '../types';
import { initialStudents, initialInstituteSettings, initialTransactions } from '../data/mockStudents';

const KEYS = {
  STUDENTS: 'fee_app_students_v2',
  TRANSACTIONS: 'fee_app_transactions_v2',
  SETTINGS: 'fee_app_settings_v2',
  GITHUB_CONFIG: 'fee_app_github_config_v2',
  RECEIPT_COUNTER: 'fee_app_receipt_counter_v2',
};

// Storage getters
export function getStoredStudents(): Student[] {
  try {
    const data = localStorage.getItem(KEYS.STUDENTS);
    if (data) {
      const parsed: Student[] = JSON.parse(data);
      // Ensure backward-compatibility with existing stored student records
      return parsed.map((s, idx) => {
        const isPaid = s.paymentStatus === 'PAID';
        const defaultStatus = isPaid ? 'SUBMITTED' : (idx % 2 === 0 ? 'ISSUED' : 'NOT_ISSUED');
        const formNo = s.formNo || `EF-2026-${(100 + (s.sNo || idx + 1)).toString().padStart(4, '0')}`;
        const formIssueDate = s.formIssueDate || (defaultStatus !== 'NOT_ISSUED' ? (s.paymentDate || '2026-08-22 10:00') : undefined);
        const formSubmissionDate = s.formSubmissionDate || (defaultStatus === 'SUBMITTED' ? (s.paymentDate || '2026-08-25 11:00') : undefined);

        return {
          ...s,
          formIssueStatus: s.formIssueStatus || defaultStatus,
          formNo,
          formIssueDate,
          formSubmissionDate,
        };
      });
    }
  } catch (e) {
    console.error('Failed to load students from localStorage:', e);
  }
  // Initialize with default students
  saveStudentsToStorage(initialStudents);
  return initialStudents;
}

export function saveStudentsToStorage(students: Student[]): void {
  try {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save students to localStorage:', e);
  }
}

export function getStoredTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load transactions from localStorage:', e);
  }
  saveTransactionsToStorage(initialTransactions);
  return initialTransactions;
}

export function saveTransactionsToStorage(transactions: Transaction[]): void {
  try {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions to localStorage:', e);
  }
}

export function getStoredSettings(): InstituteSettings {
  try {
    const data = localStorage.getItem(KEYS.SETTINGS);
    if (data) {
      return { ...initialInstituteSettings, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return initialInstituteSettings;
}

export function saveSettingsToStorage(settings: InstituteSettings): void {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function getStoredGitHubConfig(): GitHubConfig {
  const defaultConfig: GitHubConfig = {
    owner: '',
    repo: '',
    branch: 'main',
    filePath: 'data/fee_database.json',
    token: '',
    autoSync: false,
  };

  try {
    const data = localStorage.getItem(KEYS.GITHUB_CONFIG);
    if (data) {
      return { ...defaultConfig, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Failed to load GitHub config:', e);
  }
  return defaultConfig;
}

export function saveGitHubConfigToStorage(config: GitHubConfig): void {
  try {
    localStorage.setItem(KEYS.GITHUB_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save GitHub config:', e);
  }
}

// Next Receipt Number Generator
export function getNextReceiptNumber(): string {
  let counter = 108;
  try {
    const storedCounter = localStorage.getItem(KEYS.RECEIPT_COUNTER);
    if (storedCounter) {
      counter = parseInt(storedCounter, 10);
    }
  } catch (e) {
    console.error('Receipt counter error:', e);
  }

  const settings = getStoredSettings();
  const yearSuffix = settings.academicYear.replace(/20(\d{2})/g, '$1'); // e.g. 2026-2027 -> 26-27
  const pad = String(counter).padStart(4, '0');
  const receiptNo = `REC/${yearSuffix}/${pad}`;

  // Increment counter for next use
  localStorage.setItem(KEYS.RECEIPT_COUNTER, String(counter + 1));
  return receiptNo;
}

// Sync helper with GitHub backend
export async function syncDatabaseWithGitHub(
  action: 'PUSH' | 'PULL',
  config?: GitHubConfig,
  currentStudents?: Student[],
  currentTransactions?: Transaction[]
): Promise<{ success: boolean; message: string; data?: { students: Student[]; transactions: Transaction[] } }> {
  const ghConfig = config || getStoredGitHubConfig();

  if (!ghConfig.token || !ghConfig.owner || !ghConfig.repo) {
    return {
      success: false,
      message: 'GitHub credentials (token, repo owner, repository name) are required.',
    };
  }

  const payloadContent = {
    app: 'Matric & Inter Fee Receipt Manager',
    updatedAt: new Date().toISOString(),
    students: currentStudents || getStoredStudents(),
    transactions: currentTransactions || getStoredTransactions(),
    settings: getStoredSettings(),
  };

  try {
    if (action === 'PUSH') {
      const response = await fetch('/api/github/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: ghConfig.token,
          owner: ghConfig.owner,
          repo: ghConfig.repo,
          branch: ghConfig.branch || 'main',
          filePath: ghConfig.filePath || 'data/fee_database.json',
          content: payloadContent,
          commitMessage: `Fee Database Sync [${new Date().toLocaleString('en-IN')}]`,
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to commit database to GitHub');
      }

      // Update last synced time
      const updatedConfig = { ...ghConfig, lastSyncedAt: new Date().toISOString() };
      saveGitHubConfigToStorage(updatedConfig);

      return {
        success: true,
        message: `Successfully synced database to GitHub (${ghConfig.owner}/${ghConfig.repo})!`,
      };
    } else {
      // PULL
      const response = await fetch('/api/github/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: ghConfig.token,
          owner: ghConfig.owner,
          repo: ghConfig.repo,
          branch: ghConfig.branch || 'main',
          filePath: ghConfig.filePath || 'data/fee_database.json',
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to fetch database from GitHub');
      }

      const fetched = resData.data;
      if (fetched && Array.isArray(fetched.students)) {
        saveStudentsToStorage(fetched.students);
        if (Array.isArray(fetched.transactions)) {
          saveTransactionsToStorage(fetched.transactions);
        }
        if (fetched.settings) {
          saveSettingsToStorage(fetched.settings);
        }

        const updatedConfig = { ...ghConfig, lastSyncedAt: new Date().toISOString() };
        saveGitHubConfigToStorage(updatedConfig);

        return {
          success: true,
          message: `Successfully loaded database from GitHub repository!`,
          data: {
            students: fetched.students,
            transactions: fetched.transactions || [],
          },
        };
      } else {
        throw new Error('Invalid JSON format found in GitHub file.');
      }
    }
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Error communicating with GitHub repository.',
    };
  }
}

// Convert numbers to Indian Currency Words (e.g., 1430 => "Rupees One Thousand Four Hundred Thirty Only")
export function numberToWordsInINR(num: number): string {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    const digit = n % 10;
    if (n < 100) return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : ' ');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? 'and ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
  }

  if (num === 0) return 'Rupees Zero Only';
  const whole = Math.floor(num);
  const fraction = Math.round((num - whole) * 100);

  let res = 'Rupees ' + inWords(whole).trim();
  if (fraction > 0) {
    res += ' and ' + inWords(fraction).trim() + ' Paise';
  }
  return res + ' Only';
}
