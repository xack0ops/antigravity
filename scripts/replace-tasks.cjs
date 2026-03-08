const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Ensure you have this file in the scripts folder

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

// 🛡️ 행정안전부 (경찰 및 안전)
// 💰 기획재정부 (금융 및 상점)
// 📚 교육부 (학습 지원)
// 🎵 문화체육부 (행사 및 기록)
// 🧹 환경보건부 (청소 및 미화)
// 🏛️ 국무회의 (대통령, 의장, 법원장)
const newTasks = [
    { id: 't_m2_1', roleId: 'r_police', text: '점심시간/전담 시간 대열 순찰 및 질서 유지', type: 'self', frequency: { type: 'daily' } },
    { id: 't_m2_2', roleId: 'r_police', text: '규칙 위반자 발견 시 \'솔로몬의 재판소\' 앱 기록', type: 'self', frequency: { type: 'daily' }, action: 'open_judicial' },
    { id: 't_m2_3', roleId: 'r_safety', text: '하교 전 교실 내 위험 요소 및 시설 파손 점검 (이상 발견시 보고)', type: 'admin', frequency: { type: 'daily' } },
    { id: 't_m2_4', roleId: 'r_police', text: '이번 주 \'범죄 예방 캠페인\' 주제 선정 및 공지', type: 'admin', frequency: { type: 'weekly' } },
    { id: 't_m2_5', roleId: 'r_mediator', text: '친구 간 갈등 중재 (사안 심각할 때 보고)', type: 'admin', frequency: { type: 'daily' }, action: 'open_judicial' },

    { id: 't_m3_1', roleId: 'r_store', text: '지정된 시간에 \'학급 상점\' 오픈 및 판매 진행', type: 'self', frequency: { type: 'daily' } },
    { id: 't_m3_2', roleId: 'r_audit', text: '\'63랜드 앱\' 내 반짝마켓 불건전 게시물 모니터링', type: 'self', frequency: { type: 'daily' } },
    { id: 't_m3_3', roleId: 'r_briefing', text: '공공근로(알바) 업무 배정 및 일당 지급 내역 기록', type: 'self', frequency: { type: 'daily' } },
    { id: 't_m3_4', roleId: 'r_wage', text: '모든 국민 주급(월급) 계산 및 최종 승인 요청', type: 'admin', frequency: { type: 'specific_days', days: [5] } },
    { id: 't_m3_5', roleId: 'r_wage', text: '세금 및 자릿세(임대료) 개별 징수 확인', type: 'self', frequency: { type: 'specific_days', days: [5] } },
    { id: 't_m3_6', roleId: 'r_store', text: '상점 물품 재고 조사 결과 보고', type: 'admin', frequency: { type: 'specific_days', days: [5] } },

    { id: 't_m4_1', roleId: 'r_homework', text: '등교 직후: \'인생노트\' 제출 여부 점검', type: 'self', frequency: { type: 'daily' } },
    { id: 't_m4_2', roleId: 'r_homework', text: '등교 직후: 선생님이 지정한 과제 미제출자 독촉 및 격려', type: 'self', frequency: { type: 'daily' } },
    { id: 't_m4_3', roleId: 'r_st_support', text: '수업 1분 전: 다음 시간 교과서 및 준비물 안내', type: 'self', frequency: { type: 'daily' } },
    { id: 't_m4_4', roleId: 'r_material', text: '하교 전: 태블릿 PC 수거 확인 및 충전기 연결 상태 점검', type: 'self', frequency: { type: 'daily' } },
    { id: 't_m4_5', roleId: 'r_material', text: '학습지 배부 및 채점 도우미 활동 (알림 시)', type: 'admin', frequency: { type: 'daily' } },

    { id: 't_m5_1', roleId: 'r_dj', text: '점심/청소 시간: 태블릿 활용 음악 방송 송출', type: 'self', frequency: { type: 'daily' } },
    { id: 't_m5_2', roleId: 'r_media', text: '오늘의 추억 사진 1장 이상 촬영 및 공유 폴더 업로드', type: 'self', frequency: { type: 'daily' } },
    { id: 't_m5_3', roleId: 'r_toy', text: '보드게임 대여 장부 확인 및 반납 시 장비 검수', type: 'self', frequency: { type: 'daily' } },
    { id: 't_m5_4', roleId: 'r_event', text: '다음 주 진행할 미니 게임(행사) 아이디어 승인 요청', type: 'admin', frequency: { type: 'weekly' } },
    { id: 't_m5_5', roleId: 'r_media', text: '전담 시간 사진 촬영 사전 허가 받기', type: 'admin', frequency: { type: 'daily' } },

    { id: 't_m6_1', roleId: 'r_avengers', text: '하교 전: 친구들 개인 자리 청결 상태 검사', type: 'self', frequency: { type: 'daily' } },
    { id: 't_m6_2', roleId: 'r_avengers', text: '하교 전: 지정된 공용 구역 어벤져스 청소', type: 'self', frequency: { type: 'daily' } },
    { id: 't_m6_3', roleId: 'r_avengers', text: '하교 전: 쓰레기통 비우기 및 분리수거', type: 'self', frequency: { type: 'daily' } },
    { id: 't_m6_4', roleId: 'r_clean_head', text: '하교 전: 교실 모든 창문 잠금 및 전원 차단 확인', type: 'self', frequency: { type: 'daily' } },
    { id: 't_m6_5', roleId: 'r_clean_head', text: '최종 청소 상태 점검 및 하교 승인', type: 'admin', frequency: { type: 'daily' } },

    { id: 't_m1_1', roleId: 'r_president', text: '[종례 시간] 국가 소식 공지 (담화 내용 사전 확인)', type: 'admin', frequency: { type: 'daily' } },
    { id: 't_m1_2', roleId: 'r_president', text: '주간 장관 회의 주재 (부서별 업무 보고 진행)', type: 'self', frequency: { type: 'specific_days', days: [1] } },
    { id: 't_m1_3', roleId: 'r_speaker', text: '정기 학급 회의 달빛 회의 진행 및 사회', type: 'self', frequency: { type: 'specific_days', days: [5] } },
    { id: 't_m1_4', roleId: 'r_speaker', text: '청원 확인 및 신규 법안 최종 결재 요청', type: 'admin', frequency: { type: 'daily' }, action: 'open_petition' },
    { id: 't_m1_5', roleId: 'r_justice', text: '최종 판결 승인 요청 (선생님께)', type: 'admin', frequency: { type: 'daily' }, action: 'open_judicial' },
    { id: 't_m1_6', roleId: 'r_justice', text: '자치 법정 재판 개정 및 결과 기록', type: 'self', frequency: { type: 'daily' }, action: 'open_judicial' },
];

async function replaceTasks() {
    try {
        console.log("Fetching existing tasks...");
        const usersSnapshot = await db.collection('tasks').get();
        const batch = db.batch();

        let deleteCount = 0;
        usersSnapshot.forEach(doc => {
            batch.delete(doc.ref);
            deleteCount++;
        });

        console.log(`Deleting ${deleteCount} existing tasks...`);
        
        console.log("Adding new tasks...");
        newTasks.forEach(task => {
            const docRef = db.collection('tasks').doc(task.id);
            // new tasks get default status
            batch.set(docRef, { ...task, status: 'pending' });
        });

        await batch.commit();
        console.log(`Replaced all tasks. Added ${newTasks.length} tasks successfully.`);
        process.exit(0);
    } catch (e) {
        console.error("Error replacing tasks:", e);
        process.exit(1);
    }
}

replaceTasks();
