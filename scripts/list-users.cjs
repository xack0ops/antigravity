// Firestore 사용자 목록 확인 스크립트
const https = require('https');

const PROJECT_ID = 'classnation-637c2';
const API_KEY = 'AIzaSyBRzq5Jin48orb1ZAQz2UzfPbdkW_FyqWw';

function httpsRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function listUsers() {
  const path = `/v1/projects/${PROJECT_ID}/databases/(default)/documents/users?key=${API_KEY}&pageSize=100`;
  const options = {
    hostname: 'firestore.googleapis.com',
    path,
    method: 'GET',
  };
  const res = await httpsRequest(options);
  const data = JSON.parse(res.body);
  
  if (!data.documents) {
    console.log('users 컬렉션이 비어있거나 없습니다.');
    console.log(res.body);
    return;
  }

  console.log(`👥 현재 Firestore users 목록 (${data.documents.length}명):\n`);
  data.documents.forEach(doc => {
    const id = doc.name.split('/').pop();
    const name = doc.fields?.name?.stringValue || '(이름없음)';
    const type = doc.fields?.type?.stringValue || '?';
    console.log(`  [${id}] ${name} (${type})`);
  });
}

listUsers().catch(console.error);
