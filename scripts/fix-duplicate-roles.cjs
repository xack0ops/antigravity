// Firestore roles 컬렉션 목록 확인 및 국무회의(m1) 중복 역할 정리
const https = require('https');

const PROJECT_ID = 'classnation-637c2';
const API_KEY = 'AIzaSyBRzq5Jin48orb1ZAQz2UzfPbdkW_FyqWw';

function httpsGet(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'firestore.googleapis.com',
      path: `${path}?key=${API_KEY}&pageSize=200`,
      method: 'GET',
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function deleteDoc(collection, id) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}/${id}?key=${API_KEY}`,
      method: 'DELETE',
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const res = await httpsGet(`/v1/projects/${PROJECT_ID}/databases/(default)/documents/roles`);
  const data = JSON.parse(res.body);

  if (!data.documents) {
    console.log('roles 없음:', res.body);
    return;
  }

  console.log(`📋 전체 역할 목록 (${data.documents.length}개):\n`);

  // 역할 파싱
  const roles = data.documents.map(doc => {
    const id = doc.name.split('/').pop();
    const name = doc.fields?.name?.stringValue || '(이름없음)';
    const ministryId = doc.fields?.ministryId?.stringValue || '?';
    return { id, name, ministryId, doc };
  });

  // 부서별 출력
  const byMinistry = {};
  roles.forEach(r => {
    if (!byMinistry[r.ministryId]) byMinistry[r.ministryId] = [];
    byMinistry[r.ministryId].push(r);
  });

  Object.entries(byMinistry).forEach(([minId, rs]) => {
    console.log(`  [${minId}]`);
    rs.forEach(r => console.log(`    - [${r.id}] ${r.name}`));
  });

  // 중복 감지: 같은 부서에서 같은 이름이 2개 이상인 경우
  console.log('\n🔍 중복 검사 중...\n');
  const toDelete = [];

  Object.entries(byMinistry).forEach(([minId, rs]) => {
    const nameGroups = {};
    rs.forEach(r => {
      if (!nameGroups[r.name]) nameGroups[r.name] = [];
      nameGroups[r.name].push(r);
    });
    Object.entries(nameGroups).forEach(([name, group]) => {
      if (group.length > 1) {
        console.log(`  ⚠️  중복 발견: [${minId}] "${name}" (${group.length}개)`);
        // mockData 고정 ID (r_로 시작하되 타임스탬프 아닌 것) 를 원본으로 유지
        // 나머지(r_숫자 타임스탬프) 삭제
        const originals = group.filter(r => !/^r_\d{10,}$/.test(r.id));
        const duplicates = group.filter(r => /^r_\d{10,}$/.test(r.id));
        
        if (originals.length > 0 && duplicates.length > 0) {
          duplicates.forEach(d => {
            console.log(`    → 삭제 예정: [${d.id}] (타임스탬프 ID)`);
            toDelete.push(d);
          });
        } else {
          // 모두 타임스탬프이거나 모두 고정이면 마지막 것 유지, 나머지 삭제
          const keep = group[0];
          group.slice(1).forEach(d => {
            console.log(`    → 삭제 예정: [${d.id}] (중복, [${keep.id}] 유지)`);
            toDelete.push(d);
          });
        }
      }
    });
  });

  if (toDelete.length === 0) {
    console.log('  ✅ 중복 없음!\n');
    return;
  }

  console.log(`\n🗑️  중복 역할 ${toDelete.length}개 삭제 중...`);
  for (const role of toDelete) {
    const delRes = await deleteDoc('roles', role.id);
    if (delRes.status === 200) {
      console.log(`  ✅ 삭제: [${role.id}] ${role.name}`);
    } else {
      console.log(`  ❌ 실패: [${role.id}] (${delRes.status})`);
    }
  }
  console.log('\n완료!');
}

main().catch(console.error);
