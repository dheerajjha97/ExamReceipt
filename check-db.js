import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDoc, deleteDoc, doc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./src/firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
  try {
    console.log("Testing write...");
    const docRef = await addDoc(collection(db, "health_check"), {
      timestamp: new Date().toISOString(),
      status: "ok"
    });
    console.log("Write successful. Doc ID:", docRef.id);

    console.log("Testing read...");
    const docSnap = await getDoc(docRef);
    console.log("Read successful. Data:", docSnap.data());

    console.log("Testing delete...");
    await deleteDoc(docRef);
    console.log("Delete successful.");

    console.log("✅ Firebase Database is fully active and accessible!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Firebase error:", error);
    process.exit(1);
  }
}

check();
