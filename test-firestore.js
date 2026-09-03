import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./src/firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app);

async function test() {
  const querySnapshot = await getDocs(collection(db, "schools/31337/students"));
  console.log(`Found ${querySnapshot.size} students in Firebase`);
  process.exit(0);
}
test().catch(console.error);
