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
import { Student, Transaction, InstituteSettings } from '../types';

// Helper function to remove undefined values before sending to Firestore
function sanitizeForFirestore<T>(data: T): Record<string, any> {
  const clean: Record<string, any> = {};
  if (data && typeof data === 'object') {
    Object.entries(data as Record<string, any>).forEach(([key, value]) => {
      if (value !== undefined) {
        clean[key] = value;
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

export async function saveTransactionToCloud(transaction: Transaction, schoolCode: string): Promise<void> {
  try {
    const txnRef = doc(db, `schools/${schoolCode}/transactions`, transaction.id);
    const sanitizedTxn = sanitizeForFirestore({ ...transaction, schoolCode });
    await setDoc(txnRef, sanitizedTxn, { merge: true });
  } catch (error) {
    console.error('Failed to sync transaction to cloud:', error);
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

export async function clearSchoolCloudData(schoolCode: string): Promise<void> {
  try {
    const studentsSnap = await getDocs(collection(db, `schools/${schoolCode}/students`));
    studentsSnap.forEach(async (document) => {
      await deleteDoc(doc(db, `schools/${schoolCode}/students`, document.id));
    });
    const txnsSnap = await getDocs(collection(db, `schools/${schoolCode}/transactions`));
    txnsSnap.forEach(async (document) => {
      await deleteDoc(doc(db, `schools/${schoolCode}/transactions`, document.id));
    });
  } catch (error) {
    console.error('Failed to clear cloud data:', error);
  }
}

export function subscribeSchoolData(
  schoolCode: string,
  onStudentsChange: (students: Student[]) => void,
  onTxnsChange: (txns: Transaction[]) => void,
  onSettingsChange: (settings: InstituteSettings | null) => void
): () => void {
  const studentsRef = collection(db, `schools/${schoolCode}/students`);
  const txnsRef = collection(db, `schools/${schoolCode}/transactions`);
  const settingsRef = doc(db, `schools/${schoolCode}/settings`, 'config');

  const unsubStudents = onSnapshot(studentsRef, (snapshot) => {
    const list: Student[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Student);
    });
    // Sort by sNo
    list.sort((a, b) => (a.sNo || 0) - (b.sNo || 0));
    onStudentsChange(list);
  }, (err) => console.error('Students cloud listener error:', err));

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
    unsubTxns();
    unsubSettings();
  };
}
