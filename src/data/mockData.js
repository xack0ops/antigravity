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
    // 1. 국무회의 (State Council)
    { 
      id: 'r_president', ministryId: 'm1', name: '대통령', 
      description: '나라 살림의 책임자! 국무회의를 이끌고 선생님 말씀을 전해요.',
      duties: ['6개 부서 장관 회의 진행', '선생님 전달 사항 공지', '학급 전체 살림 챙기기']
    },
    { 
      id: 'r_speaker', ministryId: 'm1', name: '국회의장', 
      description: '법을 만드는 회의의 대장! 학급 회의를 진행해요.',
      duties: ['학급 회의 진행', '건의 사항 수집', '학급 규칙(법) 만들기 및 수정']
    },
    { 
      id: 'r_justice', ministryId: 'm1', name: '대법원장', 
      description: '정의의 사도! 규칙을 어긴 친구를 공정하게 심판해요.',
      duties: ['규칙 위반자 판결', '친구 간 다툼 해결', '억울한 사람 없게 하기']
    },

    // 2. 행정안전부 (MOIS)
    { 
      id: 'r_credit', ministryId: 'm2', name: '신용 평가', 
      description: '친구들의 생활 태도 점수를 기록하고 등급을 관리해요.',
      duties: ['생활 태도 점수 퍼플 앱 입력', '신용 등급 관리']
    },
    { 
      id: 'r_police', ministryId: 'm2', name: '질서 유지(경찰)', 
      description: '위험하게 뛰거나 장난치는 친구가 없는지 살펴요.',
      duties: ['복도/교실 질서 유지', '위험한 장난 예방']
    },
    { 
      id: 'r_mediator', ministryId: 'm2', name: '갈등 중재', 
      description: '다투는 친구들을 화해시켜줘요.',
      duties: ['화해 계약서 작성 돕기', '친구 사이 중재']
    },
    { 
      id: 'r_safety', ministryId: 'm2', name: '안전 확인', 
      description: '집에 갈 때 문단속과 전기를 확인해요.',
      duties: ['창문 잠금 확인', '전기 소등 확인 (끄는 건 환경부)']
    },

    // 3. 기획재정부 (MOEF)
    { 
      id: 'r_wage', ministryId: 'm3', name: '주급 지급', 
      description: '매주 금요일 친구들에게 주급을 보내줘요.',
      duties: ['금요일마다 주급 지급', '행안부 점수 확인']
    },
    { 
      id: 'r_audit', ministryId: 'm3', name: '재정 감사', 
      description: '돈 거래가 정확한지 꼼꼼하게 확인해요.',
      duties: ['거래 내역 매주 확인', '이상한 거래 적발']
    },
    { 
      id: 'r_store', ministryId: 'm3', name: '상점 운영', 
      description: '맛있는 간식과 쿠폰을 팔아요.',
      duties: ['상점 열기', '퍼플 결제 확인', '물건 판매']
    },
    { 
      id: 'r_briefing', ministryId: 'm3', name: '경제 브리핑', 
      description: '오늘의 증권 소식을 알려줘요.',
      duties: ['아침마다 증권 변경 공지', '경제 뉴스 전달']
    },

    // 4. 교육부 (MOE)
    { 
      id: 'r_moe_head', ministryId: 'm4', name: '교육부 장관', 
      description: '수업 준비 상태를 선생님께 보고해요.',
      duties: ['모든 친구 준비 확인', '선생님께 "준비 완료" 외치기']
    },
    { 
      id: 'r_homework', ministryId: 'm4', name: '과제 점검', 
      description: '아침마다 친구들이 숙제를 냈는지 확인해요.',
      duties: ['숙제 명단 작성', '미제출자 확인']
    },
    { 
      id: 'r_material', ministryId: 'm4', name: '자료 배부', 
      description: '학습지를 나눠주고 태블릿을 관리해요.',
      duties: ['가정통신문 배부', '태블릿 충전 및 개수 확인']
    },
    { 
      id: 'r_st_support', ministryId: 'm4', name: '학습 지원', 
      description: '어려워하는 친구들을 도와줘요.',
      duties: ['수학익힘책 1차 채점', '교과서 페이지 안내']
    },

    // 5. 문화체육부 (MCST)
    { 
      id: 'r_event', ministryId: 'm5', name: '행사 기획', 
      description: '즐거운 반 행사를 기획하고 진행해요(MC).',
      duties: ['학급 운동회 아이디어', '미니게임 진행']
    },
    { 
      id: 'r_dj', ministryId: 'm5', name: 'DJ & 음악', 
      description: '신나는 음악으로 분위기를 띄워요.',
      duties: ['점심/청소 시간 노래 틀기', '신청곡 받기']
    },
    { 
      id: 'r_toy', ministryId: 'm5', name: '놀이 관리', 
      description: '보드게임을 빌려주고 정리해요.',
      duties: ['보드게임 대여 장부 작성', '부품 분실 확인']
    },
    { 
      id: 'r_media', ministryId: 'm5', name: '미디어', 
      description: '우리 반의 추억을 사진과 영상으로 남겨요.',
      duties: ['매일 사진 1장 찍기', '행사 영상 촬영']
    },

    // 6. 환경보건부 (MOEH)
    { 
      id: 'r_clean_head', ministryId: 'm6', name: '청소 감독', 
      description: '청소 상태를 검사하고 하교 허락을 받아와요.',
      duties: ['청소 구역 검사', '선생님께 검사 맡기']
    },
    { 
      id: 'r_avengers', ministryId: 'm6', name: '청소 어벤져스', 
      description: '빛보다 빠르게 교실을 치워요!',
      duties: ['바닥 쓸기 & 쓰레기 비우기', '창문 닫기', '게시판 꾸미기(함께)', '1인1역 검사']
    }
  ],
  
  // Sample Users
  users: [
    { id: 'u1', name: '김철수', roleId: 'r_president', type: 'student', password: '1234' },
    { id: 'u2', name: '이영희', roleId: 'r_police', type: 'student', password: '1234' },
    { id: 'u3', name: '박민수', roleId: 'r_store', type: 'student', password: '1234' },
    { id: 'u4', name: '최지우', roleId: 'r_dj', type: 'student', password: '1234' },
    { id: 'u5', name: '정우성', roleId: 'r_avengers', type: 'student', password: '1234' },
    { id: 'u_admin', name: '선생님', roleId: null, type: 'admin', password: '1234' },
  ],

  // Initial Tasks reflecting the duties
  tasks: [
    { id: 't1', roleId: 'r_president', text: '선생님 전달사항 칠판에 적기', type: 'self' },
    { id: 't2', roleId: 'r_president', text: '국무회의 안건 정리하기', type: 'admin' },
    { id: 't3', roleId: 'r_police', text: '복도 통행지도 및 위반자 기록', type: 'self', action: 'open_judicial' },
    { id: 't4', roleId: 'r_store', text: '상점 물품 재고 조사', type: 'admin' },
    { id: 't5', roleId: 'r_dj', text: '청소 시간 노동요 선곡', type: 'self' },
    { id: 't6', roleId: 'r_avengers', text: '쓰레기통 비우기', type: 'admin' },
    { id: 't7', roleId: 'r_avengers', text: '게시판 떨어진 것 붙이기', type: 'self' },
    { id: 't8', roleId: 'r_moe_head', text: '수업 준비 완료 보고', type: 'self' },
    { id: 't9', roleId: 'r_homework', text: '숙제 미제출자 명단 제출', type: 'admin' },
    { id: 't10', roleId: 'r_justice', text: '갈등 중재 및 판결 기록', type: 'admin', action: 'open_judicial' },
    { id: 't11', roleId: 'r_credit', text: '생활 태도 점수 기록', type: 'self', action: 'open_judicial' },
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
