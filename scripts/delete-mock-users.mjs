// 샘플 유저(김철수, 이영희 등) Firestore에서 삭제 스크립트
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, deleteDoc, getDocs, collection, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBRzq5Jin48orb1ZAQz2UzfPbdkW_FyqWw",
  authDomain: "classnation-637c2.firebaseapp.com",
  projectId: "classnation-637c2",
  storageBucket: "classnation-637c2.firebasestorage.app",
  messagingSenderId: "781573304054",
  appId: "1:781573304054:web:4ad2e74f4531d1e074c6d7",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// mockData.js에 정의된 샘플 유저 ID들
const MOCK_USER_IDS = ['u1', 'u2', 'u3', 'u4', 'u5'];

async function deleteMockUsers() {
  console.log('🗑️  샘플 유저 삭제 시작...');
  let deleted = 0;
  let notFound = 0;

  for (const id of MOCK_USER_IDS) {
    const ref = doc(db, 'users', id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const name = snap.data().name;
      await deleteDoc(ref);
      console.log(`  ✅ 삭제됨: ${name} (${id})`);
      deleted++;
    } else {
      console.log(`  ⚠️  없음 (이미 삭제됨): ${id}`);
      notFound++;
    }
  }

  console.log(`\n완료: ${deleted}명 삭제, ${notFound}명 이미 없음`);
  process.exit(0);
}

deleteMockUsers().catch(e => { console.error(e); process.exit(1); });
