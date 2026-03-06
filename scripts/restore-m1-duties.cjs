// 국무회의(m1) 역할 보유 내용 확인 + duties 없으면 mockData에서 복원
const https = require('https');

const PROJECT_ID = 'classnation-637c2';
const API_KEY = 'AIzaSyBRzq5Jin48orb1ZAQz2UzfPbdkW_FyqWw';

// mockData의 국무회의 역할 duties 원본
const MOCK_DUTIES = {
  '국회의장': [
    '학급 회의 진행 (주 1회): 전날 건의함 확인 → 안건 칠판 기재 → 사회 보기 → 골고루 발표 기회 부여',
    '법 만들기·고치기: 통과된 규칙은 선생님 허락 후 발표, 게시판에 예쁜 글씨로 게시',
    '【체크】매주: 건의함 쪽지를 모두 확인했나요?',
    '【체크】매주: 학급 회의를 매끄럽게 진행하고 결과를 게시판에 붙였나요?',
    '【체크】수시: 낡거나 지켜지지 않는 규칙은 없는지 고민했나요?',
  ],
  '대법원장': [
    '최종 판결 (이의 신청): 벌점 항의 시 재판 개최 → 양측 진술 청취 → 우리 반 법에 따라 최종 결정',
    '갈등 해결: 조용한 곳에서 양쪽 말을 끝까지 듣고 명확히 판결 — "A는 ~규칙 위반, B는 ~행동 반성"',
    '【체크】사건 발생 시: 양쪽 이야기를 공평하게 끝까지 들어주었나요?',
    '【체크】사건 발생 시: 기분이 아닌 우리 반 규칙(법)을 근거로 판결했나요?',
    '【체크】매주: 이번 주 판결 내용을 기록장에 적었나요?',
  ],
};

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

async function getDoc(id) {
  const options = {
    hostname: 'firestore.googleapis.com',
    path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/roles/${id}?key=${API_KEY}`,
    method: 'GET',
  };
  return httpsRequest(options);
}

async function patchDuties(id, duties) {
  const firestoreArray = {
    arrayValue: {
      values: duties.map(d => ({ stringValue: d }))
    }
  };
  const body = JSON.stringify({
    fields: { duties: firestoreArray }
  });
  const options = {
    hostname: 'firestore.googleapis.com',
    path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/roles/${id}?updateMask.fieldPaths=duties&key=${API_KEY}`,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
  };
  return httpsRequest(options, body);
}

async function listRoles() {
  const options = {
    hostname: 'firestore.googleapis.com',
    path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/roles?key=${API_KEY}&pageSize=100`,
    method: 'GET',
  };
  return httpsRequest(options);
}

async function main() {
  const res = await listRoles();
  const data = JSON.parse(res.body);

  const m1Roles = (data.documents || []).filter(doc => {
    const minId = doc.fields?.ministryId?.stringValue;
    return minId === 'm1';
  });

  console.log('🔍 국무회의(m1) 현재 역할:\n');
  for (const doc of m1Roles) {
    const id = doc.name.split('/').pop();
    const name = doc.fields?.name?.stringValue || '';
    const duties = doc.fields?.duties?.arrayValue?.values?.map(v => v.stringValue) || [];
    console.log(`  [${id}] ${name} → duties ${duties.length}개`);
    if (duties.length === 0 && MOCK_DUTIES[name]) {
      console.log(`    ⚠️  duties 없음! mockData에서 복원합니다...`);
      const patchRes = await patchDuties(id, MOCK_DUTIES[name]);
      if (patchRes.status === 200) {
        console.log(`    ✅ 복원 완료 (${MOCK_DUTIES[name].length}개)`);
      } else {
        console.log(`    ❌ 복원 실패: ${patchRes.body}`);
      }
    } else if (duties.length > 0) {
      console.log(`    ✅ duties 정상`);
    }
  }
  console.log('\n완료!');
}

main().catch(console.error);
