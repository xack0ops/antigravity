export const INITIAL_DATA = {
  // Ministries (Departments) for grouping
  ministries: [
    { id: 'm1', name: '국무회의', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    { id: 'm2', name: '행정안전부', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { id: 'm3', name: '기획재정부', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { id: 'm4', name: '교육부', color: 'bg-green-100 text-green-800 border-green-200' },
    { id: 'm5', name: '문화체육부', color: 'bg-pink-100 text-pink-800 border-pink-200' },
    { id: 'm6', name: '환경보건부', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  ],
  roles: [
    // 1. 국무회의
    {
      id: 'r_president', ministryId: 'm1', name: '대통령',
      description: '학급을 대표하고 부서별 업무를 총괄하며 교실 내 질서를 관리합니다.',
      duties: [
        '교실 내 질서 관리 및 규칙 준수 확인',
        '부서별 업무 조율 및 선생님 소통'
      ]
    },
    {
      id: 'r_speaker', ministryId: 'm1', name: '국회의장',
      description: '친구들의 목소리를 모아 회의를 진행하고 법을 만드는 입법 총괄',
      duties: [
        '청원 확인 및 신규 법안 최종 기록',
        '매주 금요일마다 정기 학급 회의 진행',
        '회의(학급/부서별) 시간 필요 시 선생님께 요청하기'
      ]
    },
    {
      id: 'r_justice', ministryId: 'm1', name: '대법원장',
      description: '불공정이나 규칙 위반을 헌법에 따라 판결하는 사법 총괄',
      duties: [
        '솔로몬의 재판소 최종 판결 및 기록',
        '친구 간 심각한 갈등 중재 (자치 법정 개정)'
      ]
    },

    // 2. 행정안전부
    {
      id: 'r_credit', ministryId: 'm2', name: '질서 부장',
      description: '부서를 총괄하며 학급 내 질서와 안정을 책임집니다.',
      duties: ['질서 유지 총괄', '부서 업무 조율']
    },
    {
      id: 'r_police', ministryId: 'm2', name: '우리반 경찰',
      description: '교실 내 질서를 유지하고 사고를 예방합니다.',
      duties: [
        '점심시간/전담시간 대열 순찰 및 질서 유지',
        '규칙 위반 시 재판소 앱 기록',
        '주간 범죄 예방 캠페인 기획 및 홍보'
      ]
    },
    {
      id: 'r_mediator', ministryId: 'm2', name: '안전 요원',
      description: '벌금 입력 및 교실 내 안전 요소를 점검합니다.',
      duties: [
        '수페 앱 벌금 입력',
        '안전 요소 점검 및 보고'
      ]
    },

    // 3. 기획재정부
    {
      id: 'r_briefing', ministryId: 'm3', name: '경제 부장',
      description: '예산 관리 및 공공근로(알바) 업무를 총괄합니다.',
      duties: ['알바 업무 배정 및 일당 지급 관리']
    },
    {
      id: 'r_wage', ministryId: 'm3', name: '은행원',
      description: '주급 계산 및 학급 상점 운영을 담당합니다.',
      duties: [
        '매주 금요일: 주급(월급) 계산 및 최종 승인 요청',
        '학급 상점 운영 및 수페 앱 결제 확인'
      ]
    },
    {
      id: 'r_audit', ministryId: 'm3', name: '세금 도우미',
      description: '세금 징수 확인 및 재정 감사를 수행합니다.',
      duties: [
        '매주 세금/임대료 징수 확인',
        '반짝마켓 불건전 거래 모니터링'
      ]
    },

    // 4. 교육부
    {
      id: 'r_moe_head', ministryId: 'm4', name: '학습 부장',
      description: '수업 분위기 조성 및 학습 지원을 총괄합니다.',
      duties: ['대통령 합동: 수업 분위기 조성 및 소음 관리']
    },
    {
      id: 'r_homework', ministryId: 'm4', name: '공부 도우미',
      description: '친구들의 과제 제출을 챙기고 인생노트를 점검합니다.',
      duties: ['등교 직후: 인생노트 및 과제 미제출자 점검']
    },
    {
      id: 'r_material', ministryId: 'm4', name: '준비물 도우미',
      description: '수업 준비물 및 태블릿 PC를 관리합니다.',
      duties: [
        '다음 시간 준비물 안내',
        '태블릿 PC 수거 및 충전 상태 점검',
        '학습지 배부 및 채점 보조'
      ]
    },

    // 5. 문화체육부
    {
      id: 'r_event', ministryId: 'm5', name: '행사 부장',
      description: '학급의 각종 행사와 미니 게임을 기획하고 진행합니다.',
      duties: ['학급 미니 게임/행사 기획 및 진행(심판)']
    },
    {
      id: 'r_dj', ministryId: 'm5', name: '우리반 DJ',
      description: '점심시간 및 청소 시간 음악 방송을 담당합니다.',
      duties: ['음악 방송 송출 (신청곡 선곡)']
    },
    {
      id: 'r_toy', ministryId: 'm5', name: '놀이 도우미',
      description: '보드게임 대여 및 부품을 관리합니다.',
      duties: ['보드게임 대여/반납 장부 관리 및 검수']
    },
    {
      id: 'r_media', ministryId: 'm5', name: '추억 사진사',
      description: '학급의 소중한 순간들을 사진으로 기록합니다.',
      duties: ['일상 및 행사 사진 촬영/업로드']
    },

    // 6. 환경보건부
    {
      id: 'r_clean_head', ministryId: 'm6', name: '청소 부장',
      description: '청소 상태를 최종 점검하고 하교 승인을 보고합니다.',
      duties: ['최종 청소 점검 및 하교 승인 보고']
    },
    {
      id: 'r_avengers', ministryId: 'm6', name: '청소 요정',
      description: '교실 청결 유지 및 게시판 미화를 담당합니다.',
      duties: [
        '개인/공용 구역 청소',
        '쓰레기통 비우기 및 분리수거',
        '환경 미화 활동'
      ]
    }
  ],
  
  // Sample Users
  users: [
    { id: 'u1', name: '김철수', ministryId: 'm1', roleIds: ['r_president'], type: 'student', password: '1234' },
    { id: 'u2', name: '이영희', ministryId: 'm2', roleIds: ['r_police'], type: 'student', password: '1234' },
    { id: 'u3', name: '박민수', ministryId: 'm3', roleIds: ['r_store'], type: 'student', password: '1234' },
    { id: 'u4', name: '최지우', ministryId: 'm5', roleIds: ['r_dj'], type: 'student', password: '1234' },
    { id: 'u5', name: '정우성', ministryId: 'm6', roleIds: ['r_avengers'], type: 'student', password: '1234' },
    { id: 'u_admin', name: '선생님', ministryId: null, roleIds: [], type: 'admin', password: '1234' },
  ],

  // Initial Tasks reflecting the duties
  tasks: [
    // 🏛️ 국무회의 (대통령/국회의장/대법원장)
    { id: 't_pres_1', roleId: 'r_president', text: '교실 내 질서 관리: 대열 및 이동 통제, 규칙 준수 확인', type: 'self', frequency: { type: 'daily' } },
    { id: 't_pres_2', roleId: 'r_president', text: '부서별 업무 조율 결과 및 특이사항 선생님께 보고', type: 'self', frequency: { type: 'daily' } },
    
    { id: 't_speak_1', roleId: 'r_speaker', text: '청원 확인 및 신규 법안 최종 기록', type: 'self', frequency: { type: 'daily' }, action: 'open_petition' },
    { id: 't_speak_2', roleId: 'r_speaker', text: '매주 금요일 정기 학급 회의 진행', type: 'self', frequency: { type: 'specific_days', days: [5] } },
    
    { id: 't_just_1', roleId: 'r_justice', text: '재판 신청 건 확인 및 일정 조율', type: 'self', frequency: { type: 'daily' }, action: 'open_judicial' },
    { id: 't_just_2', roleId: 'r_justice', text: '판결문 기록 및 공고', type: 'self', frequency: { type: 'daily' } },

    // 🛡️ 행정안전부
    { id: 't_pol_1', roleId: 'r_police', text: '점심시간/전담시간 대열 순찰 및 질서 유지', type: 'self', frequency: { type: 'daily' } },
    { id: 't_pol_2', roleId: 'r_police', text: '규칙 위반 시 \'솔로몬의 재판소\' 앱 기록', type: 'self', frequency: { type: 'daily' }, action: 'open_judicial' },
    { id: 't_pol_3', roleId: 'r_police', text: '주간 범죄 예방 캠페인 기획 및 홍보', type: 'self', frequency: { type: 'weekly' } },
    { id: 't_safe_1', roleId: 'r_mediator', text: '\'수페 앱\' 벌금 입력 및 안전 요소 점검/보고', type: 'self', frequency: { type: 'daily' } },

    // 💰 기획재정부
    { id: 't_econ_1', roleId: 'r_briefing', text: '공공근로(알바) 업무 배정 및 일당 지급 관리', type: 'self', frequency: { type: 'daily' } },
    { id: 't_audit_1', roleId: 'r_audit', text: '매주 세금/임대료 징수 확인 및 재정 감사', type: 'self', frequency: { type: 'weekly' } },
    { id: 't_audit_2', roleId: 'r_audit', text: '\'63랜드 앱\' 내 반짝마켓 불건전 거래 모니터링', type: 'self', frequency: { type: 'daily' } },
    { id: 't_bank_1', roleId: 'r_wage', text: '매주 금요일: 주급(월급) 계산 및 최종 승인 요청', type: 'self', frequency: { type: 'specific_days', days: [5] } },
    { id: 't_bank_2', roleId: 'r_wage', text: '학급 상점 오픈 및 수페 앱 결제 확인', type: 'self', frequency: { type: 'daily' } },

    // 📚 교육부
    { id: 't_moe_1', roleId: 'r_moe_head', text: '대통령 합동: 수업 분위기 조성 및 소음 관리', type: 'self', frequency: { type: 'daily' } },
    { id: 't_hw_1', roleId: 'r_homework', text: '등교 직후: \'인생노트\' 및 과제 미제출자 점검', type: 'self', frequency: { type: 'daily' } },
    { id: 't_mat_1', roleId: 'r_material', text: '다음 시간 교과서/준비물 안내 (종 치기 1분 전)', type: 'self', frequency: { type: 'daily' } },
    { id: 't_mat_2', roleId: 'r_material', text: '태블릿 PC 수거 및 충전기 연결 상태 점검', type: 'self', frequency: { type: 'daily' } },
    { id: 't_mat_3', roleId: 'r_material', text: '학습지 배부 및 1차 채점 도우미 활동', type: 'self', frequency: { type: 'daily' } },

    // 🎵 문화체육부
    { id: 't_dj_1', roleId: 'r_dj', text: '점심/청소 시간: 태블릿 활용 음악 방송 송출', type: 'self', frequency: { type: 'daily' } },
    { id: 't_toy_1', roleId: 'r_toy', text: '보드게임 대여/반납 장부 관리 및 부품 검수', type: 'self', frequency: { type: 'daily' } },
    { id: 't_media_1', roleId: 'r_media', text: '매일 우리 반 추억 사진 촬영 및 폴더 업로드', type: 'self', frequency: { type: 'daily' } },
    { id: 't_event_1', roleId: 'r_event', text: '학급 미니 게임/행사 기획 및 공정한 진행(심판)', type: 'self', frequency: { type: 'weekly' } },

    // 🧹 환경보건부
    { id: 't_clean_1', roleId: 'r_clean_head', text: '하교 전 최종 청소 상태 점검 및 하교 승인 보고', type: 'self', frequency: { type: 'daily' } },
    { id: 't_fairy_1', roleId: 'r_avengers', text: '하교 전: 개인 자리 및 공용 구역 청소', type: 'self', frequency: { type: 'daily' } },
    { id: 't_fairy_2', roleId: 'r_avengers', text: '하교 전: 쓰레기통 비우기 및 분리수거', type: 'self', frequency: { type: 'daily' } },
    { id: 't_fairy_3', roleId: 'r_avengers', text: '환경 미화 (미술 작품 게시 및 게시판 관리)', type: 'self', frequency: { type: 'weekly' } },
  ]
};

export const CURRICULUM_DATA = {
  "publisher": "아이스크림 미디어 (i-Scream)",
  "grade_semester": "6학년 1학기",
  "subjects": {
    "국어": {
      "total_units": 11,
      "units": [
        {"unit": "독서 단원", "name": "책을 읽고 생각을 나누어요", "sessions": "1~4차시: 독서 계획 세우기 및 질문하며 읽기"},
        {"unit": "1단원", "name": "비유하는 표현", "sessions": "1~8차시: 비유하는 표현의 특징 알고 시와 이야기에서 찾기"},
        {"unit": "2단원", "name": "이야기를 간추려요", "sessions": "1~8차시: 이야기의 구조를 생각하며 전체 내용 요약하기"},
        {"unit": "3단원", "name": "짜임새 있게 구성해요", "sessions": "1~10차시: 공식적인 말하기 상황에서 자료를 활용해 발표하기"},
        {"unit": "4단원", "name": "주장과 근거를 판단해요", "sessions": "1~8차시: 논설문의 특성을 알고 주장과 근거의 타당성 판단하기"},
        {"unit": "5단원", "name": "속담을 활용해요", "sessions": "1~8차시: 상황에 어울리는 속담을 사용하여 생각 전하기"},
        {"unit": "6단원", "name": "내용을 추론해요", "sessions": "1~8차시: 글이나 영상에서 생략된 내용을 단서로 추론하기"},
        {"unit": "7단원", "name": "우리말을 가꾸어요", "sessions": "1~8차시: 우리말 사용 실태를 점검하고 올바른 우리말 사용하기"},
        {"unit": "8단원", "name": "인물의 삶을 찾아서", "sessions": "1~8차시: 인물의 삶과 시대 상황을 고려하며 작품 읽기"},
        {"unit": "9단원", "name": "마음을 나누는 글을 써요", "sessions": "1~8차시: 상황에 따라 마음을 표현하는 글을 쓰고 나누기"},
        {"unit": "연극 단원", "name": "연극으로 표현해요", "sessions": "1~6차시: 희곡의 특성을 이해하고 직접 연극 공연하기"}
      ]
    },
    "수학": {
      "total_units": 6,
      "units": [
        {"unit": "1단원", "name": "분수의 나눗셈", "sessions": "1~10차시: (자연수)÷(자연수), (분수)÷(자연수)의 계산 원리"},
        {"unit": "2단원", "name": "각기둥과 각뿔", "sessions": "1~8차시: 각기둥과 각뿔의 특징과 전개도 이해"},
        {"unit": "3단원", "name": "소수의 나눗셈", "sessions": "1~10차시: (소수)÷(자연수)의 계산 원리와 소수점 위치"},
        {"unit": "4단원", "name": "비와 비율", "sessions": "1~8차시: 비, 비율, 백분율의 의미와 실생활 활용"},
        {"unit": "5단원", "name": "여러 가지 그래프", "sessions": "1~8차시: 띠그래프와 원그래프 해석 및 그리기"},
        {"unit": "6단원", "name": "직육면체의 부피와 겉넓이", "sessions": "1~10차시: 직육면체의 부피 비교 및 겉넓이 구하는 방법"}
      ]
    },
    "사회": {
      "total_units": 2,
      "total_sub_units": 6,
      "units": [
        {
          "major_unit": "1. 우리나라의 정치 발전",
          "sub_units": [
            {"name": "민주주의의 발전과 시민 참여", "sessions": "1~7차시: 4.19, 5.18, 6월 항쟁과 민주화 과정"},
            {"name": "일상생활과 민주주의", "sessions": "8~12차시: 민주주의의 의미와 생활 속 실천, 의사 결정 원리"},
            {"name": "민주정치의 원리와 국가 기관의 역할", "sessions": "13~18차시: 국민 주권과 국회, 정부, 법원의 역할"}
          ]
        },
        {
          "major_unit": "2. 우리나라의 경제 성장",
          "sub_units": [
            {"name": "나라 안의 경제 활동", "sessions": "1~8차시: 가계와 기업의 역할, 시장의 경제 활동"},
            {"name": "나라 사이의 경제 협력", "sessions": "9~14차시: 무역의 의미와 경제 교류 사례 및 갈등 해결"},
            {"name": "우리 경제의 성과와 과제", "sessions": "15~19차시: 경제 성장의 모습과 오늘날 경제 문제"}
          ]
        }
      ]
    },
    "과학": {
      "total_units": 5,
      "units": [
        {"unit": "1단원", "name": "과학자처럼 탐구하기", "sessions": "1~4차시: 문제 인식, 변인 통제 등 과학 탐구 과정"},
        {"unit": "2단원", "name": "지구와 달의 운동", "sessions": "1~10차시: 지구의 자전과 공전, 달의 모양 변화"},
        {"unit": "3단원", "name": "여러 가지 기체", "sessions": "1~11차시: 산소와 이산화탄소의 성질 및 기체의 부피 변화"},
        {"unit": "4단원", "name": "식물의 구조와 기능", "sessions": "1~11차시: 뿌리, 줄기, 잎, 꽃, 열매의 생김새와 하는 일"},
        {"unit": "5단원", "name": "빛과 렌즈", "sessions": "1~9차시: 빛의 굴절과 볼록 렌즈의 특징 관찰"}
      ]
    }
  }
};
