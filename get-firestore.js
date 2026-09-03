import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./src/firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app);

async function test() {
  const querySnapshot = await getDocs(collection(db, "schools/31337/transactions"));
  console.log(`Found ${querySnapshot.size} transactions in Firebase`);
  querySnapshot.forEach((doc) => {
    console.log(doc.id, " => ", doc.data());
  });
  process.exit(0);
}
test().catch(console.error);
