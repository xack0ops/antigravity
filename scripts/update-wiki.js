import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";
import { WIKI_DATA } from "../src/data/wikiData.js";

const firebaseConfig = {
  apiKey: "AIzaSyBRzq5Jin48orb1ZAQz2UzfPbdkW_FyqWw",
  authDomain: "classnation-637c2.firebaseapp.com",
  projectId: "classnation-637c2",
  storageBucket: "classnation-637c2.firebasestorage.app",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  try {
    const wikiCol = collection(db, 'wiki');
    const snap = await getDocs(wikiCol);
    console.log(`Found ${snap.docs.length} existing wiki documents. Deleting...`);
    
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
    console.log('Old wiki data deleted.');

    console.log(`Inserting ${WIKI_DATA.length} new wiki documents...`);
    for (const item of WIKI_DATA) {
      const ref = doc(db, 'wiki', item.id);
      await setDoc(ref, item);
      console.log(`Inserted ${item.id} (${item.title})`);
    }

    console.log('Wiki data successfully updated in Firestore!');
    // Allow process to gracefully exit
    process.exit(0);
  } catch (error) {
    console.error("Error updating wiki data:", error);
    process.exit(1);
  }
}

main();
