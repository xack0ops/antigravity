const https = require('https');

const PROJECT_ID = 'classnation-637c2';
const API_KEY = 'AIzaSyBRzq5Jin48orb1ZAQz2UzfPbdkW_FyqWw';

function httpsRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.end();
  });
}

async function debugData() {
    console.log('--- DEBUG: ROLES ---');
    const rolesRes = await httpsRequest({
        hostname: 'firestore.googleapis.com',
        path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/roles?key=${API_KEY}`,
        method: 'GET'
    });
    (rolesRes.documents || []).forEach(d => {
        console.log(`Role: [${d.fields.name?.stringValue}] ID: ${d.name.split('/').pop()}`);
    });

    console.log('\n--- DEBUG: USERS ---');
    const usersRes = await httpsRequest({
        hostname: 'firestore.googleapis.com',
        path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/users?key=${API_KEY}`,
        method: 'GET'
    });
    (usersRes.documents || []).forEach(d => {
        const roles = (d.fields.roleIds?.arrayValue?.values || []).map(v => v.stringValue);
        console.log(`User: [${d.fields.name?.stringValue}] RoleIDs: [${roles.join(', ')}]`);
    });

    console.log('\n--- DEBUG: TASKS ---');
    const tasksRes = await httpsRequest({
        hostname: 'firestore.googleapis.com',
        path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/tasks?key=${API_KEY}`,
        method: 'GET'
    });
    (tasksRes.documents || []).forEach(d => {
        console.log(`Task: [${d.fields.text?.stringValue}] RoleID: ${d.fields.roleId?.stringValue}`);
    });
}

debugData().catch(console.error);
