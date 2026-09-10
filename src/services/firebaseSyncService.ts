import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Student, Transaction, InstituteSettings, RegistrationStudent } from '../types';

// Helper function to remove undefined values before sending to Firestore
function sanitizeForFirestore<T>(data: T): Record<string, any> {
  const clean: Record<string, any> = {};
  if (data && typeof data === 'object') {
    Object.entries(data as Record<string, any>).forEach(([key, value]) => {
      if (value !== undefined) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          clean[key] = sanitizeForFirestore(value);
        } else {
          clean[key] = value;
        }
      }
    });
  }
  return clean;
}

export async function saveStudentToCloud(student: Student, schoolCode: string): Promise<void> {
  try {
    const studentRef = doc(db, `schools/${schoolCode}/students`, student.id);
    const sanitizedStudent = sanitizeForFirestore({ ...student, schoolCode });
    await setDoc(studentRef, sanitizedStudent, { merge: true });
  } catch (error) {
    console.error('Failed to sync student to cloud:', error);
  }
}

export async function deleteStudentFromCloud(studentId: string, schoolCode: string = '31337'): Promise<void> {
  try {
    const studentRef = doc(db, `schools/${schoolCode}/students`, studentId);
    await deleteDoc(studentRef);
  } catch (error) {
    console.error('Failed to delete student from cloud:', error);
  }
}

export async function saveRegistrationStudentToCloud(student: RegistrationStudent, schoolCode: string): Promise<void> {
  try {
    const studentRef = doc(db, `schools/${schoolCode}/registrationStudents`, student.id);
    const sanitizedStudent = sanitizeForFirestore({ ...student, schoolCode });
    await setDoc(studentRef, sanitizedStudent, { merge: true });
  } catch (error) {
    console.error('Failed to sync registration student to cloud:', error);
  }
}

export async function deleteRegistrationStudentFromCloud(studentId: string, schoolCode: string = '31337'): Promise<void> {
  try {
    const studentRef = doc(db, `schools/${schoolCode}/registrationStudents`, studentId);
    await deleteDoc(studentRef);
  } catch (error) {
    console.error('Failed to delete registration student from cloud:', error);
  }
}

export async function saveTransactionToCloud(transaction: Transaction, schoolCode: string): Promise<void> {
  try {
    const txnRef = doc(db, `schools/${schoolCode}/transactions`, transaction.id);
    const sanitizedTxn = sanitizeForFirestore({ ...transaction, schoolCode });
    await setDoc(txnRef, sanitizedTxn, { merge: true });
  } catch (error) {
    console.error('Failed to sync transaction to cloud:', error);
  }
}

export async function deleteTransactionFromCloud(transactionId: string, schoolCode: string = '31337'): Promise<void> {
  try {
    const docRef = doc(db, `schools/${schoolCode}/transactions`, transactionId);
    await deleteDoc(docRef);
    console.log(`Transaction ${transactionId} deleted from cloud.`);
  } catch (error) {
    console.error("Error deleting transaction from cloud:", error);
  }
}

export async function saveSettingsToCloud(settings: InstituteSettings, schoolCode: string): Promise<void> {
  try {
    const settingsRef = doc(db, `schools/${schoolCode}/settings`, 'config');
    const sanitizedSettings = sanitizeForFirestore({ ...settings, schoolCode });
    await setDoc(settingsRef, sanitizedSettings, { merge: true });
  } catch (error) {
    console.error('Failed to sync settings to cloud:', error);
  }
}

export async function clearRegistrationCloudData(schoolCode: string): Promise<void> {
  try {
    const regSnap = await getDocs(collection(db, `schools/${schoolCode}/registrationStudents`));
    const deletePromises = regSnap.docs.map((document) =>
      deleteDoc(doc(db, `schools/${schoolCode}/registrationStudents`, document.id))
    );
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Failed to clear registration cloud data:', error);
  }
}

export async function clearSchoolCloudData(schoolCode: string): Promise<void> {
  try {
    const studentsSnap = await getDocs(collection(db, `schools/${schoolCode}/students`));
    studentsSnap.forEach(async (document) => {
      await deleteDoc(doc(db, `schools/${schoolCode}/students`, document.id));
    });
    const regSnap = await getDocs(collection(db, `schools/${schoolCode}/registrationStudents`));
    regSnap.forEach(async (document) => {
      await deleteDoc(doc(db, `schools/${schoolCode}/registrationStudents`, document.id));
    });
    const txnsSnap = await getDocs(collection(db, `schools/${schoolCode}/transactions`));
    txnsSnap.forEach(async (document) => {
      await deleteDoc(doc(db, `schools/${schoolCode}/transactions`, document.id));
    });
  } catch (error) {
    console.error('Failed to clear cloud data:', error);
  }
}

const MOCK_REG_IDS = new Set([
  'REG-31337-001',
  'REG-31337-002',
  'REG-31337-003',
  'REG-31337-004',
  'REG-31337-005',
]);

const MOCK_REG_NAMES = new Set([
  'ADITYA RAJ',
  'PRIYA KUMARI',
  'AMIT PASWAN',
  'SHIKHA KUMARI',
  'VIKASH KUMAR MANJHI',
]);

export async function purgeMockRegistrationStudents(schoolCode: string): Promise<void> {
  try {
    const regSnap = await getDocs(collection(db, `schools/${schoolCode}/registrationStudents`));
    const deletePromises: Promise<void>[] = [];
    regSnap.forEach((docSnapshot) => {
      const data = docSnapshot.data() as RegistrationStudent;
      const normalizedName = (data.studentName || '').toUpperCase().trim();
      if (MOCK_REG_IDS.has(docSnapshot.id) || MOCK_REG_IDS.has(data.id) || MOCK_REG_NAMES.has(normalizedName)) {
        deletePromises.push(deleteDoc(doc(db, `schools/${schoolCode}/registrationStudents`, docSnapshot.id)));
      }
    });
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
      console.log(`Purged ${deletePromises.length} mock registration student records from Firestore.`);
    }
  } catch (error) {
    console.error('Failed to purge mock registration students:', error);
  }
}

export function subscribeSchoolData(
  schoolCode: string,
  onStudentsChange: (students: Student[]) => void,
  onTxnsChange: (txns: Transaction[]) => void,
  onSettingsChange: (settings: InstituteSettings | null) => void,
  onRegStudentsChange?: (regStudents: RegistrationStudent[]) => void
): () => void {
  const studentsRef = collection(db, `schools/${schoolCode}/students`);
  const regStudentsRef = collection(db, `schools/${schoolCode}/registrationStudents`);
  const txnsRef = collection(db, `schools/${schoolCode}/transactions`);
  const settingsRef = doc(db, `schools/${schoolCode}/settings`, 'config');

  // Purge any mock registration records from cloud asynchronously
  purgeMockRegistrationStudents(schoolCode);

  const unsubStudents = onSnapshot(studentsRef, (snapshot) => {
    const list: Student[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Student);
    });
    list.sort((a, b) => (a.sNo || 0) - (b.sNo || 0));
    onStudentsChange(list);
  }, (err) => console.error('Students cloud listener error:', err));

  const unsubRegStudents = onSnapshot(regStudentsRef, (snapshot) => {
    if (onRegStudentsChange) {
      const list: RegistrationStudent[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as RegistrationStudent;
        const normalizedName = (data.studentName || '').toUpperCase().trim();
        // Ignore mock registration records
        if (MOCK_REG_IDS.has(docSnap.id) || MOCK_REG_IDS.has(data.id) || MOCK_REG_NAMES.has(normalizedName)) {
          deleteDoc(doc(db, `schools/${schoolCode}/registrationStudents`, docSnap.id)).catch(() => {});
          return;
        }
        list.push(data);
      });
      list.sort((a, b) => (a.sNo || 0) - (b.sNo || 0));
      onRegStudentsChange(list);
    }
  }, (err) => console.error('Reg students cloud listener error:', err));

  const unsubTxns = onSnapshot(txnsRef, (snapshot) => {
    const list: Transaction[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Transaction);
    });
    onTxnsChange(list);
  }, (err) => console.error('Transactions cloud listener error:', err));

  const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
    if (docSnap.exists()) {
      onSettingsChange(docSnap.data() as InstituteSettings);
    }
  }, (err) => console.error('Settings cloud listener error:', err));

  return () => {
    unsubStudents();
    unsubRegStudents();
    unsubTxns();
    unsubSettings();
  };
}
