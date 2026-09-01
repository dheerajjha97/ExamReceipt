import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const PWD_KEY_PREFIX = 'fee_app_pwd_';

export function getLocalSchoolPassword(schoolCode: string): string {
  try {
    const saved = localStorage.getItem(`${PWD_KEY_PREFIX}${schoolCode}`);
    if (saved) return saved;
  } catch (e) {
    console.error(e);
  }
  return '12345'; // Default password
}

export function setLocalSchoolPassword(schoolCode: string, newPass: string): void {
  try {
    localStorage.setItem(`${PWD_KEY_PREFIX}${schoolCode}`, newPass);
  } catch (e) {
    console.error(e);
  }
}

export async function verifySchoolPassword(schoolCode: string, passInput: string): Promise<boolean> {
  const localPass = getLocalSchoolPassword(schoolCode);
  
  // Also attempt to verify from Firestore cloud if available
  try {
    const credRef = doc(db, 'schools', schoolCode, 'config', 'auth');
    const snap = await getDoc(credRef);
    if (snap.exists() && snap.data().password) {
      const cloudPass = snap.data().password;
      setLocalSchoolPassword(schoolCode, cloudPass);
      return passInput.trim() === cloudPass;
    }
  } catch (err) {
    console.warn('Firestore password check bypassed, using local fallback:', err);
  }

  return passInput.trim() === localPass;
}

export async function updateSchoolPassword(schoolCode: string, newPass: string): Promise<void> {
  setLocalSchoolPassword(schoolCode, newPass);
  
  try {
    const credRef = doc(db, 'schools', schoolCode, 'config', 'auth');
    await setDoc(credRef, {
      schoolCode,
      password: newPass,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Cloud password update error:', err);
  }
}
