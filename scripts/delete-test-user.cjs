// 특정 ID 유저 삭제 스크립트
const https = require('https');

const PROJECT_ID = 'classnation-637c2';
const API_KEY = 'AIzaSyBRzq5Jin48orb1ZAQz2UzfPbdkW_FyqWw';

// 삭제할 유저 ID
const IDS_TO_DELETE = ['Vz4ljEW0xbHNx2ozNFf6'];

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

async function deleteUser(id) {
  const path = `/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${id}?key=${API_KEY}`;
  const options = {
    hostname: 'firestore.googleapis.com',
    path,
    method: 'DELETE',
  };
  return httpsRequest(options);
}

async function main() {
  for (const id of IDS_TO_DELETE) {
    const res = await deleteUser(id);
    if (res.status === 200) console.log(`✅ 삭제됨: ${id}`);
    else console.log(`❌ 실패: ${id} (${res.status}) - ${res.body}`);
  }
}

main().catch(console.error);
