import https from 'https';
import { WIKI_DATA } from '../src/data/wikiData.js';

const PROJECT_ID = 'classnation-637c2';
const API_KEY = 'AIzaSyBRzq5Jin48orb1ZAQz2UzfPbdkW_FyqWw';

function httpsRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function valueToFirestore(v) {
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') {
    if (Number.isInteger(v)) return { integerValue: v.toString() };
    return { doubleValue: v };
  }
  if (Array.isArray(v)) {
    return { arrayValue: { values: v.map(item => valueToFirestore(item)) } };
  }
  if (v && typeof v === 'object') {
    return { mapValue: toFirestoreDoc(v) };
  }
  return { nullValue: null };
}

function toFirestoreDoc(obj) {
  const fields = {};
  for (const [key, value] of Object.entries(obj)) {
    fields[key] = valueToFirestore(value);
  }
  return { fields };
}

async function main() {
  console.log("Fetching existing wiki docs...");
  const getRes = await httpsRequest({
    hostname: 'firestore.googleapis.com',
    path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/wiki?key=${API_KEY}`,
    method: 'GET'
  });
  
  if (getRes.status !== 200) {
     console.error("Failed to fetch docs:", getRes.body);
     return;
  }
  
  const existingDocs = JSON.parse(getRes.body).documents || [];
  
  for (const doc of existingDocs) {
    const docId = doc.name.split('/').pop();
    console.log(`Deleting ${docId}...`);
    await httpsRequest({
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/wiki/${docId}?key=${API_KEY}`,
      method: 'DELETE'
    });
  }

  for (const item of WIKI_DATA) {
    const docId = item.id;
    const firestoreData = toFirestoreDoc(item);
    console.log(`Inserting ${docId}...`);
    const postData = JSON.stringify(firestoreData);
    
    // Use PATCH to create or update document at specific path
    const res = await httpsRequest({
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/wiki/${docId}?key=${API_KEY}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, postData);
    
    if (res.status !== 200) {
      console.error(`Failed to insert ${docId}:`, res.body);
    }
  }

  console.log("All done!");
}

main().catch(console.error);
