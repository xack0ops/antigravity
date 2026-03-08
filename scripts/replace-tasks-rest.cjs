const https = require('https');

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

const newTasks = [
    { id: 't_m2_1', roleId: 'r_police', text: '점심시간/전담 시간 대열 순찰 및 질서 유지', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m2_2', roleId: 'r_police', text: '규칙 위반자 발견 시 \'솔로몬의 재판소\' 앱 기록', type: 'self', frequency: { type: 'daily' }, action: 'open_judicial' }, // S
    { id: 't_m2_3', roleId: 'r_safety', text: '하교 전 교실 내 위험 요소 및 시설 파손 점검 (이상 발견시 보고)', type: 'admin', frequency: { type: 'daily' } }, // S/T -> admin
    { id: 't_m2_4', roleId: 'r_police', text: '이번 주 \'범죄 예방 캠페인\' 주제 선정 및 공지', type: 'admin', frequency: { type: 'weekly' } }, // T -> admin
    { id: 't_m2_5', roleId: 'r_mediator', text: '친구 간 갈등 중재 (사안 심각할 때 보고)', type: 'admin', frequency: { type: 'daily' }, action: 'open_judicial' }, // S/T -> admin

    { id: 't_m3_1', roleId: 'r_store', text: '지정된 시간에 \'학급 상점\' 오픈 및 판매 진행', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m3_2', roleId: 'r_audit', text: '\'63랜드 앱\' 내 반짝마켓 불건전 게시물 모니터링', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m3_3', roleId: 'r_briefing', text: '공공근로(알바) 업무 배정 및 일당 지급 내역 기록', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m3_4', roleId: 'r_wage', text: '모든 국민 주급(월급) 계산 및 최종 승인 요청', type: 'admin', frequency: { type: 'specific_days', days: [5] } }, // T -> admin
    { id: 't_m3_5', roleId: 'r_wage', text: '세금 및 자릿세(임대료) 개별 징수 확인', type: 'self', frequency: { type: 'specific_days', days: [5] } }, // S
    { id: 't_m3_6', roleId: 'r_store', text: '상점 물품 재고 조사 결과 보고', type: 'admin', frequency: { type: 'specific_days', days: [5] } }, // T -> admin

    { id: 't_m4_1', roleId: 'r_homework', text: '등교 직후: \'인생노트\' 제출 여부 점검', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m4_2', roleId: 'r_homework', text: '등교 직후: 선생님이 지정한 과제 미제출자 독촉 및 격려', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m4_3', roleId: 'r_st_support', text: '수업 1분 전: 다음 시간 교과서 및 준비물 안내', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m4_4', roleId: 'r_material', text: '하교 전: 태블릿 PC 수거 확인 및 충전기 연결 상태 점검', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m4_5', roleId: 'r_material', text: '학습지 배부 및 채점 도우미 활동 (알림 시)', type: 'admin', frequency: { type: 'daily' } }, // S/T -> admin

    { id: 't_m5_1', roleId: 'r_dj', text: '점심/청소 시간: 태블릿 활용 음악 방송 송출', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m5_2', roleId: 'r_media', text: '오늘의 추억 사진 1장 이상 촬영 및 공유 폴더 업로드', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m5_3', roleId: 'r_toy', text: '보드게임 대여 장부 확인 및 반납 시 장비 검수', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m5_4', roleId: 'r_event', text: '다음 주 진행할 미니 게임(행사) 아이디어 승인 요청', type: 'admin', frequency: { type: 'weekly' } }, // T -> admin
    { id: 't_m5_5', roleId: 'r_media', text: '전담 시간 사진 촬영 사전 허가 받기', type: 'admin', frequency: { type: 'daily' } }, // T -> admin

    { id: 't_m6_1', roleId: 'r_avengers', text: '하교 전: 친구들 개인 자리 청결 상태 검사', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m6_2', roleId: 'r_avengers', text: '하교 전: 지정된 공용 구역 어벤져스 청소', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m6_3', roleId: 'r_avengers', text: '하교 전: 쓰레기통 비우기 및 분리수거', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m6_4', roleId: 'r_clean_head', text: '하교 전: 교실 모든 창문 잠금 및 전원 차단 확인', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m6_5', roleId: 'r_clean_head', text: '최종 청소 상태 점검 및 하교 승인', type: 'admin', frequency: { type: 'daily' } }, // T -> admin

    { id: 't_m1_1', roleId: 'r_president', text: '[종례 시간] 국가 소식 공지 (담화 내용 사전 확인)', type: 'admin', frequency: { type: 'daily' } }, // T -> admin
    { id: 't_m1_2', roleId: 'r_president', text: '주간 장관 회의 주재 (부서별 업무 보고 진행)', type: 'self', frequency: { type: 'specific_days', days: [1] } }, // S
    { id: 't_m1_3', roleId: 'r_speaker', text: '정기 학급 회의 달빛 회의 진행 및 사회', type: 'self', frequency: { type: 'specific_days', days: [5] } }, // S
    { id: 't_m1_4', roleId: 'r_speaker', text: '청원 확인 및 신규 법안 최종 결재 요청', type: 'admin', frequency: { type: 'daily' }, action: 'open_petition' }, // T -> admin
    { id: 't_m1_5', roleId: 'r_justice', text: '최종 판결 승인 요청 (선생님께)', type: 'admin', frequency: { type: 'daily' }, action: 'open_judicial' }, // T -> admin
    { id: 't_m1_6', roleId: 'r_justice', text: '자치 법정 재판 개정 및 결과 기록', type: 'self', frequency: { type: 'daily' }, action: 'open_judicial' }, // S
];

function objToFirestoreDocument(obj) {
    const fields = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value === undefined || value === null) continue;

        if (typeof value === 'string') {
            fields[key] = { stringValue: value };
        } else if (typeof value === 'boolean') {
            fields[key] = { booleanValue: value };
        } else if (typeof value === 'number') {
            if (Number.isInteger(value)) {
                fields[key] = { integerValue: value.toString() };
            } else {
                fields[key] = { doubleValue: value };
            }
        } else if (Array.isArray(value)) {
            fields[key] = {
                arrayValue: {
                    values: value.map(v => objToFirestoreDocument({ temp: v }).temp)
                }
            };
        } else if (typeof value === 'object') {
            fields[key] = {
                mapValue: {
                    fields: objToFirestoreDocument(value)
                }
            };
        }
    }
    return fields;
}

async function doWork() {
    // 1. Delete all existing tasks
    console.log('Fetching existing tasks...');
    let res = await httpsRequest({
        hostname: 'firestore.googleapis.com',
        path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/tasks?key=${API_KEY}&pageSize=1000`,
        method: 'GET'
    });
    const parsed = JSON.parse(res.body);
    const docs = parsed.documents || [];
    
    console.log(`Found ${docs.length} tasks to delete.`);
    for (const doc of docs) {
        const id = doc.name.split('/').pop();
        await httpsRequest({
            hostname: 'firestore.googleapis.com',
            path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/tasks/${id}?key=${API_KEY}`,
            method: 'DELETE'
        });
    }

    // 2. Insert new tasks
    for (const t of newTasks) {
        let taskData = { ...t, status: 'pending' };
        let firestoreFields = objToFirestoreDocument(taskData);

        const postData = JSON.stringify({ fields: firestoreFields });
        const options = {
            hostname: 'firestore.googleapis.com',
            path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/tasks?documentId=${t.id}&key=${API_KEY}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        await httpsRequest(options, postData);
    }
    console.log(`Added ${newTasks.length} new tasks.`);
}

doWork().catch(console.error);
