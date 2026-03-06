// 샘플 유저 삭제 - Firebase REST API 사용 (Node.js 직접 실행용)
// 사용법: node scripts/delete-mock-users-rest.cjs

const https = require('https');

const PROJECT_ID = 'classnation-637c2';
const API_KEY = 'AIzaSyBRzq5Jin48orb1ZAQz2UzfPbdkW_FyqWw';

// mockData.js에 정의된 샘플 유저 ID들
const MOCK_IDS = ['u1', 'u2', 'u3', 'u4', 'u5'];

function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function deleteDoc(collectionName, docId) {
  const path = `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionName}/${docId}`;
  const options = {
    hostname: 'firestore.googleapis.com',
    path: `${path}?key=${API_KEY}`,
    method: 'DELETE',
  };
  return httpsRequest(options);
}

async function getDoc(collectionName, docId) {
  const path = `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionName}/${docId}`;
  const options = {
    hostname: 'firestore.googleapis.com',
    path: `${path}?key=${API_KEY}`,
    method: 'GET',
  };
  return httpsRequest(options);
}

async function setDoc(collectionName, docId, fields) {
  const path = `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionName}/${docId}`;
  // 필드를 Firestore REST 형식으로 변환
  const firestoreFields = {};
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string') firestoreFields[k] = { stringValue: v };
    else if (typeof v === 'number') firestoreFields[k] = { integerValue: v };
  }
  const body = JSON.stringify({ fields: firestoreFields });
  const options = {
    hostname: 'firestore.googleapis.com',
    path: `${path}?key=${API_KEY}`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  };
  return httpsRequest(options, body);
}

async function main() {
  console.log('🗑️  샘플 유저(김철수, 이영희 등) 삭제 시작...\n');

  let deleted = 0;
  let notFound = 0;

  for (const id of MOCK_IDS) {
    // 존재 여부 확인
    const getRes = await getDoc('users', id);
    if (getRes.status === 404) {
      console.log(`  ⚠️  이미 없음: ${id}`);
      notFound++;
      continue;
    }
    const userData = JSON.parse(getRes.body);
    const name = userData.fields?.name?.stringValue || id;

    // 삭제
    const delRes = await deleteDoc('users', id);
    if (delRes.status === 200) {
      console.log(`  ✅ 삭제 완료: ${name} (${id})`);
      deleted++;
    } else {
      console.log(`  ❌ 삭제 실패: ${id} (status ${delRes.status})`);
      console.log(`     응답: ${delRes.body}`);
    }
  }

  console.log(`\n📊 결과: ${deleted}명 삭제, ${notFound}명 없음`);

  // settings/initialized 플래그 저장 (재시드 방지)
  console.log('\n🛡️  settings/initialized 플래그 저장 중...');
  const flagRes = await setDoc('settings', 'initialized', {
    seededAt: new Date().toISOString(),
    version: '1',
  });
  if (flagRes.status === 200) {
    console.log('  ✅ 플래그 저장 완료! (앞으로 실수로 샘플 데이터가 다시 생기지 않음)');
  } else {
    console.log(`  ❌ 플래그 저장 실패 (status ${flagRes.status}): ${flagRes.body}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
