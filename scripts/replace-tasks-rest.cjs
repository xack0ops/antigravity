const https = require('https');

const PROJECT_ID = 'classnation-637c2';
const API_KEY = 'AIzaSyBRzq5Jin48orb1ZAQz2UzfPbdkW_FyqWw';

function httpsRequest(options, postBody = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (postBody) {
        req.write(typeof postBody === 'string' ? postBody : JSON.stringify(postBody));
    }
    req.end();
  });
}

// 🎯 FIX: Corrected toFirestore (no double-nesting)
function toFirestoreFields(obj) {
    const fields = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value === undefined || value === null) continue;
        if (typeof value === 'string') fields[key] = { stringValue: value };
        else if (typeof value === 'boolean') fields[key] = { booleanValue: value };
        else if (typeof value === 'number') fields[key] = Number.isInteger(value) ? { integerValue: value.toString() } : { doubleValue: value };
        else if (Array.isArray(value)) {
            fields[key] = { arrayValue: { values: value.map(v => {
                if (typeof v === 'string') return { stringValue: v };
                if (typeof v === 'object') return { mapValue: { fields: toFirestoreFields(v) } };
                return { stringValue: String(v) };
            }) } };
        } else if (typeof value === 'object') fields[key] = { mapValue: { fields: toFirestoreFields(value) } };
    }
    return fields;
}

// Data from mockData.js
const NEW_ROLES = [
    { id: 'r_president', ministryId: 'm1', name: '대통령', description: '학급을 대표하고 부서별 업무를 총괄하며 교실 내 질서를 관리합니다.', duties: ['교실 내 질서 관리 및 규칙 준수 확인', '부서별 업무 조율 및 선생님 소통'] },
    { id: 'r_speaker', ministryId: 'm1', name: '국회의장', description: '학급 회의를 진행하고 법안 및 청원을 관리합니다.', duties: ['청원 확인 및 신규 법안 최종 기록', '매주 금요일 정기 학급 회의 진행'] },
    { id: 'r_justice', ministryId: 'm1', name: '대법원장', description: '학급의 규칙 위반 사례를 심판하고 법을 해석합니다.', duties: ['재판 진행 및 판결 기록', '학급 규칙 해석 및 안내'] },
    { id: 'r_credit', ministryId: 'm2', name: '질서 부장', description: '부서를 총괄하며 학급 내 질서와 안정을 책임집니다.', duties: ['질서 유지 총괄', '부서 업무 조율'] },
    { id: 'r_police', ministryId: 'm2', name: '우리반 경찰', description: '교실 내 질서를 유지하고 사고를 예방합니다.', duties: ['점심시간/전담시간 대열 순찰 및 질서 유지', '규칙 위반 시 재판소 앱 기록', '주간 범죄 예방 캠페인 기획 및 홍보'] },
    { id: 'r_mediator', ministryId: 'm2', name: '안전 요원', description: '벌금 입력 및 교실 내 안전 요소를 점검합니다.', duties: ['수페 앱 벌금 입력', '안전 요소 점검 및 보고'] },
    { id: 'r_briefing', ministryId: 'm3', name: '경제 부장', description: '예산 관리 및 공공근로(알바) 업무를 총괄합니다.', duties: ['알바 업무 배정 및 일당 지급 관리'] },
    { id: 'r_wage', ministryId: 'm3', name: '은행원', description: '주급 계산 및 학급 상점 운영을 담당합니다.', duties: ['매주 금요일: 주급(월급) 계산 및 최종 승인 요청', '학급 상점 운영 및 수페 앱 결제 확인'] },
    { id: 'r_audit', ministryId: 'm3', name: '세금 도우미', description: '세금 징수 확인 및 재정 감사를 수행합니다.', duties: ['매주 세금/임대료 징수 확인', '반짝마켓 불건전 거래 모니터링'] },
    { id: 'r_moe_head', ministryId: 'm4', name: '학습 부장', description: '수업 분위기 조성 및 학습 지원을 총괄합니다.', duties: ['대통령 합동: 수업 분위기 조성 및 소음 관리'] },
    { id: 'r_homework', ministryId: 'm4', name: '공부 도우미', description: '친구들의 과제 제출을 챙기고 인생노트를 점검합니다.', duties: ['등교 직후: 인생노트 및 과제 미제출자 점검'] },
    { id: 'r_material', ministryId: 'm4', name: '준비물 도우미', description: '수업 준비물 및 태블릿 PC를 관리합니다.', duties: ['다음 시간 준비물 안내', '태블릿 PC 수거 및 충전 상태 점검', '학습지 배부 및 채점 보조'] },
    { id: 'r_event', ministryId: 'm5', name: '행사 부장', description: '학급의 각종 행사와 미니 게임을 기획하고 진행합니다.', duties: ['학급 미니 게임/행사 기획 및 진행(심판)'] },
    { id: 'r_dj', ministryId: 'm5', name: '우리반 DJ', description: '점심시간 및 청소 시간 음악 방송을 담당합니다.', duties: ['음악 방송 송출 (신청곡 선곡)'] },
    { id: 'r_toy', ministryId: 'm5', name: '놀이 도우미', description: '보드게임 대여 및 부품을 관리합니다.', duties: ['보드게임 대여/반납 장부 관리 및 검수'] },
    { id: 'r_media', ministryId: 'm5', name: '추억 사진사', description: '학급의 소중한 순간들을 사진으로 기록합니다.', duties: ['일상 및 행사 사진 촬영/업로드'] },
    { id: 'r_clean_head', ministryId: 'm6', name: '청소 부장', description: '청소 상태를 최종 점검하고 하교 승인을 보고합니다.', duties: ['최종 청소 점검 및 하교 승인 보고'] },
    { id: 'r_avengers', ministryId: 'm6', name: '청소 요정', description: '교실 청결 유지 및 게시판 미화를 담당합니다.', duties: ['개인/공용 구역 청소', '쓰레기통 비우기 및 분리수거', '환경 미화 활동'] },
];

const NEW_TASKS = [
    { id: 't_pres_1', roleId: 'r_president', text: '교실 내 질서 관리: 대열 및 이동 통제, 규칙 준수 확인', type: 'self', frequency: { type: 'daily' } },
    { id: 't_pres_2', roleId: 'r_president', text: '부서별 업무 조율 결과 및 특이사항 선생님께 보고', type: 'self', frequency: { type: 'daily' } },
    { id: 't_speak_1', roleId: 'r_speaker', text: '청원 확인 및 신규 법안 최종 기록', type: 'self', frequency: { type: 'daily' }, action: 'open_petition' },
    { id: 't_speak_2', roleId: 'r_speaker', text: '매주 금요일 정기 학급 회의 진행', type: 'self', frequency: { type: 'specific_days', days: [5] } },
    { id: 't_just_1', roleId: 'r_justice', text: '재판 신청 건 확인 및 일정 조율', type: 'self', frequency: { type: 'daily' }, action: 'open_judicial' },
    { id: 't_just_2', roleId: 'r_justice', text: '판결문 기록 및 공고', type: 'self', frequency: { type: 'daily' } },
    { id: 't_pol_1', roleId: 'r_police', text: '점심시간/전담시간 대열 순찰 및 질서 유지', type: 'self', frequency: { type: 'daily' } },
    { id: 't_pol_2', roleId: 'r_police', text: '규칙 위반 시 \'솔로몬의 재판소\' 앱 기록', type: 'self', frequency: { type: 'daily' }, action: 'open_judicial' },
    { id: 't_pol_3', roleId: 'r_police', text: '주간 범죄 예방 캠페인 기획 및 홍보', type: 'self', frequency: { type: 'weekly' } },
    { id: 't_safe_1', roleId: 'r_mediator', text: '\'수페 앱\' 벌금 입력 및 안전 요소 점검/보고', type: 'self', frequency: { type: 'daily' } },
    { id: 't_econ_1', roleId: 'r_briefing', text: '공공근로(알바) 업무 배정 및 일당 지급 관리', type: 'self', frequency: { type: 'daily' } },
    { id: 't_audit_1', roleId: 'r_audit', text: '매주 세금/임대료 징수 확인 및 재정 감사', type: 'self', frequency: { type: 'weekly' } },
    { id: 't_audit_2', roleId: 'r_audit', text: '\'63랜드 앱\' 내 반짝마켓 불건전 거래 모니터링', type: 'self', frequency: { type: 'daily' } },
    { id: 't_bank_1', roleId: 'r_wage', text: '매주 금요일: 주급(월급) 계산 및 최종 승인 요청', type: 'self', frequency: { type: 'specific_days', days: [5] } },
    { id: 't_bank_2', roleId: 'r_wage', text: '학급 상점 오픈 및 수페 앱 결제 확인', type: 'self', frequency: { type: 'daily' } },
    { id: 't_moe_1', roleId: 'r_moe_head', text: '대통령 합동: 수업 분위기 조성 및 소음 관리', type: 'self', frequency: { type: 'daily' } },
    { id: 't_hw_1', roleId: 'r_homework', text: '등교 직후: \'인생노트\' 및 과제 미제출자 점검', type: 'self', frequency: { type: 'daily' } },
    { id: 't_mat_1', roleId: 'r_material', text: '다음 시간 교과서/준비물 안내 (종 치기 1분 전)', type: 'self', frequency: { type: 'daily' } },
    { id: 't_mat_2', roleId: 'r_material', text: '태블릿 PC 수거 및 충전기 연결 상태 점검', type: 'self', frequency: { type: 'daily' } },
    { id: 't_mat_3', roleId: 'r_material', text: '학습지 배부 및 1차 채점 도우미 활동', type: 'self', frequency: { type: 'daily' } },
    { id: 't_dj_1', roleId: 'r_dj', text: '점심/청소 시간: 태블릿 활용 음악 방송 송출', type: 'self', frequency: { type: 'daily' } },
    { id: 't_toy_1', roleId: 'r_toy', text: '보드게임 대여/반납 장부 관리 및 부품 검수', type: 'self', frequency: { type: 'daily' } },
    { id: 't_media_1', roleId: 'r_media', text: '매일 우리 반 추억 사진 촬영 및 폴더 업로드', type: 'self', frequency: { type: 'daily' } },
    { id: 't_event_1', roleId: 'r_event', text: '학급 미니 게임/행사 기획 및 공정한 진행(심판)', type: 'self', frequency: { type: 'weekly' } },
    { id: 't_clean_1', roleId: 'r_clean_head', text: '하교 전 최종 청소 상태 점검 및 하교 승인 보고', type: 'self', frequency: { type: 'daily' } },
    { id: 't_fairy_1', roleId: 'r_avengers', text: '하교 전: 개인 자리 및 공용 구역 청소', type: 'self', frequency: { type: 'daily' } },
    { id: 't_fairy_2', roleId: 'r_avengers', text: '하교 전: 쓰레기통 비우기 및 분리수거', type: 'self', frequency: { type: 'daily' } },
    { id: 't_fairy_3', roleId: 'r_avengers', text: '환경 미화 (미술 작품 게시 및 게시판 관리)', type: 'self', frequency: { type: 'weekly' } },
];

async function doWork() {
    console.log('🚀 DEEP FIX: Syncing structural data and cleaning user role assignments...');

    // 1. Fetch current roles/users/tasks
    const rolesRes = await httpsRequest({ hostname: 'firestore.googleapis.com', path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/roles?key=${API_KEY}`, method: 'GET' });
    const usersRes = await httpsRequest({ hostname: 'firestore.googleapis.com', path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/users?key=${API_KEY}`, method: 'GET' });
    const tasksRes = await httpsRequest({ hostname: 'firestore.googleapis.com', path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/tasks?key=${API_KEY}&pageSize=1000`, method: 'GET' });

    const currentRoles = (JSON.parse(rolesRes.body).documents || []).map(d => ({ id: d.name.split('/').pop(), name: d.fields.name?.stringValue }));
    const currentUsers = (JSON.parse(usersRes.body).documents || []).map(d => ({ 
        id: d.name.split('/').pop(), 
        name: d.fields.name?.stringValue,
        roleIds: (d.fields.roleIds?.arrayValue?.values || []).map(v => v.stringValue)
    }));
    const currentTasks = (JSON.parse(tasksRes.body).documents || []).map(d => d.name.split('/').pop());

    const nameToIdMap = {};
    NEW_ROLES.forEach(r => nameToIdMap[r.name] = r.id);

    // 2. Clear all tasks FIRST
    console.log('Cleaning all existing tasks...');
    for (const id of currentTasks) {
        await httpsRequest({ hostname: 'firestore.googleapis.com', path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/tasks/${id}?key=${API_KEY}`, method: 'DELETE' });
    }

    // 3. Sync Roles with standard IDs
    console.log('Syncing roles and generating migration map...');
    for (const role of NEW_ROLES) {
        await httpsRequest({
            hostname: 'firestore.googleapis.com',
            path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/roles/${role.id}?key=${API_KEY}`,
            method: 'PATCH'
        }, { fields: toFirestoreFields(role) });
    }

    // 4. Force migrate users to standard IDs based on ROLE NAME lookup
    console.log('Migrating users to standard Role IDs...');
    for (const user of currentUsers) {
        let needsUpdate = false;
        let finalRoleIds = [];

        for (const roleId of user.roleIds) {
            const roleObj = currentRoles.find(r => r.id === roleId);
            if (roleObj && nameToIdMap[roleObj.name]) {
                const standardId = nameToIdMap[roleObj.name];
                if (!finalRoleIds.includes(standardId)) {
                    finalRoleIds.push(standardId);
                    if (roleId !== standardId) needsUpdate = true;
                }
            } else if (roleId.startsWith('r_')) {
                // Keep standard IDs if they already exist
                if (!finalRoleIds.includes(roleId)) finalRoleIds.push(roleId);
            }
        }

        if (needsUpdate || finalRoleIds.length !== user.roleIds.length) {
            console.log(`User ${user.name}: [${user.roleIds.join(',')}] -> [${finalRoleIds.join(',')}]`);
            await httpsRequest({
                hostname: 'firestore.googleapis.com',
                path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${user.id}?key=${API_KEY}&updateMask.fieldPaths=roleIds`,
                method: 'PATCH'
            }, { fields: toFirestoreFields({ roleIds: finalRoleIds }) });
        }
    }

    // 5. Delete all duplicate/bad roles (ID not in NEW_ROLES list)
    console.log('Deleting duplicate/custom roles from Firestore...');
    const standardIds = NEW_ROLES.map(r => r.id);
    for (const role of currentRoles) {
        if (!standardIds.includes(role.id)) {
            console.log(`Deleting role: ${role.name} (${role.id})`);
            await httpsRequest({ hostname: 'firestore.googleapis.com', path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/roles/${role.id}?key=${API_KEY}`, method: 'DELETE' });
        }
    }

    // 6. Push Tasks with CORRECT structure
    console.log('Pushing tasks with correct structural mapping...');
    for (const task of NEW_TASKS) {
        await httpsRequest({
            hostname: 'firestore.googleapis.com',
            path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/tasks?documentId=${task.id}&key=${API_KEY}`,
            method: 'POST'
        }, { fields: toFirestoreFields({ ...task, status: 'pending' }) });
    }

    console.log('✅ DEEP FIX COMPLETE!');
}

doWork().catch(err => {
    console.error('❌ FATAL ERROR:', err);
    process.exit(1);
});
