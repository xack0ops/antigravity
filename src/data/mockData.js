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
      description: '나라 살림의 총책임자이자, 선생님과 친구들을 연결하는 소통왕',
      duties: [
        '국무회의 진행 (매주 금요일): 5개 부서 장관들과 회의 — 힘든 점·도울 것 파악 후 선생님께 보고',
        '공지사항 전달 (수시): 선생님 전달 사항 즉시 메모 → "자, 주목!" 외치고 크고 정확하게 알리기',
        '학급 분위기 관리: 과격·어수선할 때 앞에 나가 조용히 시키고 지쳤을 때 응원하기',
        '【체크】매일: 전달 사항을 빠짐없이 정확하게 말했나요?',
        '【체크】매일: 칠판 알림판 내용을 최신으로 고쳐 놓았나요?',
        '【체크】매주: 5명 장관에게 "도와줄 거 없어?" 한 번씩 물어봤나요?',
      ]
    },
    {
      id: 'r_speaker', ministryId: 'm1', name: '국회의장',
      description: '친구들의 의견을 모아 우리 반의 규칙(법)을 만드는 회의 대장',
      duties: [
        '학급 회의 진행 (주 1회): 전날 건의함 확인 → 안건 칠판 기재 → 사회 보기 → 골고루 발표 기회 부여',
        '법 만들기·고치기: 통과된 규칙은 선생님 허락 후 발표, 게시판에 예쁜 글씨로 게시',
        '【체크】매주: 건의함 쪽지를 모두 확인했나요?',
        '【체크】매주: 학급 회의를 매끄럽게 진행하고 결과를 게시판에 붙였나요?',
        '【체크】수시: 낡거나 지켜지지 않는 규칙은 없는지 고민했나요?',
      ]
    },
    {
      id: 'r_justice', ministryId: 'm1', name: '대법원장',
      description: '억울한 사람이 없도록 법에 따라 공정하게 판단하는 심판관',
      duties: [
        '최종 판결 (이의 신청): 벌점 항의 시 재판 개최 → 양측 진술 청취 → 우리 반 법에 따라 최종 결정',
        '갈등 해결: 조용한 곳에서 양쪽 말을 끝까지 듣고 명확히 판결 — "A는 ~규칙 위반, B는 ~행동 반성"',
        '【체크】사건 발생 시: 양쪽 이야기를 공평하게 끝까지 들어주었나요?',
        '【체크】사건 발생 시: 기분이 아닌 우리 반 규칙(법)을 근거로 판결했나요?',
        '【체크】매주: 이번 주 판결 내용을 기록장에 적었나요?',
      ]
    },

    // 2. 행정안전부
    {
      id: 'r_credit', ministryId: 'm2', name: '행안부 장관(신용 평가)',
      description: '우리 반의 점수 데이터를 책임지는 신용 관리자이자 부서의 리더',
      duties: [
        '신용 평가 데이터 입력 (매일 점심시간): 경찰에게 생활 태도 기록장 수거 → 선생님 태블릿으로 앱에 상점/벌점 입력 (실수 주의, 비밀 엄수)',
        '부서 총괄: 경찰이 해결하기 힘든 싸움 출동 지원, 금요일에 벌점 현황 선생님께 보고',
        '【체크】매일: 경찰에게 기록장 받아 빠짐없이 앱에 입력했나요?',
        '【체크】매일: 친구 이름을 정확히 입력했나요?',
        '【체크】수시: 점수 정보로 친구를 놀리거나 소문내지 않았나요?',
      ]
    },
    {
      id: 'r_police', ministryId: 'm2', name: '경찰 (질서 유지)',
      description: '위험한 행동을 막고, 다툰 친구의 마음을 이어주는 평화 요원',
      duties: [
        '질서 지키기 3단계: ①눈빛("그만" 신호) → ②말("한 번 더 뛰면 이름 적는다" 경고) → ③기록장에 이름 적고 장관 통보',
        '갈등 해결 — 행감바: [피해자] "어떤 행동 때문에, 감정이 어땠고, 바라는 점은?" 질문',
        '갈등 해결 — 인사약: [가해자] "행동을 인정하니? 사과할래? 앞으로 약속하니?" 확인, 화해 시 벌점 취소',
        '【체크】쉬는 시간: 복도·교실 뒤편 뛰는 친구 없나요?',
        '【체크】다툼 발생 시: 누구 편도 들지 않고 행감바/인사약 순서로 대화를 도왔나요?',
        '【체크】매일: 기록장을 장관님께 잊지 않고 전달했나요?',
      ]
    },
    {
      id: 'r_mediator', ministryId: 'm2', name: '갈등 중재',
      description: '다투는 친구들을 화해시켜줘요.',
      duties: [
        '화해 계약서 작성 돕기',
        '친구 사이 중재 지원',
      ]
    },
    {
      id: 'r_safety', ministryId: 'm2', name: '안전 확인',
      description: '집에 갈 때 문단속과 전기를 확인해요.',
      duties: [
        '창문 잠금 확인',
        '전기 소등 확인 (끄는 건 환경부)',
      ]
    },

    // 3. 기획재정부
    {
      id: 'r_briefing', ministryId: 'm3', name: '기재부 장관 (경제 브리핑)',
      description: '경제 흐름을 읽고 친구들에게 알려주는 경제 대장',
      duties: [
        '경제 뉴스 발표 (매일 아침): 선생님 힌트·뉴스 참고 → 앱 증권 가격 변경 → 칠판 주가 게시 또는 구두 발표',
        '부서 회의: 상점 물건 부족 여부·주급 지급 문제 없는지 부원 챙기기',
        '【체크】매일 아침: 앱 증권 가격 바꾸고 친구들에게 알려줬나요?',
        '【체크】매주: 다른 부원(지급·감사·상점)이 일을 잘하는지 확인했나요?',
      ]
    },
    {
      id: 'r_wage', ministryId: 'm3', name: '주급 지급',
      description: '친구들이 땀 흘려 번 돈을 정확하게 보내주는 인간 계산기',
      duties: [
        '데이터 확인 (매주 금요일): 행안부 장관에게 최종 점수 확인 → (기본급 + 상점 - 벌금) 계산',
        '주급 보내기: 앱에서 친구 이름 선택 → 정확한 금액 입력 → 전송 (숫자 0 실수 주의!)',
        '【체크】매주 금요일: 모든 친구에게 빠짐없이 정확한 금액을 보냈나요?',
        '【체크】매주: 실수로 잘못 보낸 돈은 없나요?',
      ]
    },
    {
      id: 'r_audit', ministryId: 'm3', name: '재정 감사',
      description: '수상한 돈 거래를 찾아내고 우리 반 경제를 투명하게 지키는 탐정',
      duties: [
        '주간 감사 (매주 금요일): 앱 전체 거래 내역 훑기 → 갑작스러운 큰 돈 이동·이상 거래 탐지',
        '조사: 수상한 거래 당사자에게 이유 질문 → 협박·뇌물 의심 시 선생님께 보고',
        '【체크】매주 금요일: 앱 거래 내역을 꼼꼼히 훑어보았나요?',
        '【체크】발견 시: 이상한 거래에 대해 이유를 물어봤나요?',
      ]
    },
    {
      id: 'r_store', ministryId: 'm3', name: '상점 운영',
      description: '최고의 서비스로 간식과 쿠폰을 판매하는 우리 반 사장님',
      duties: [
        '상점 오픈: 정해진 시간에 물건 진열 → "상점 엽니다!" 알리기',
        '판매·결제 (돈 먼저 받기): 친구가 고르면 "먼저 입금해줘" → 앱 입금 알림 확인 후 물건 건네기',
        '물건 관리: 재고 부족 전 장관님께 채워달라고 요청',
        '【체크】상점 열 때: 돈을 먼저 받고(앱 확인) 물건을 주었나요?',
        '【체크】상점 닫을 때: 남은 물건을 깔끔하게 정리했나요?',
      ]
    },

    // 4. 교육부
    {
      id: 'r_moe_head', ministryId: 'm4', name: '교육부 장관',
      description: '팀원들을 지휘해서 우리 반의 수업 준비를 완벽하게 끝내는 사령관',
      duties: [
        '업무 지휘: 아침 자습·수업 전 팀원에게 "자, 검사하자!", "1분단은 네가 맡아!" 등 지시',
        '선생님께 보고: 숙제 미제출 친구 명단 취합 후 보고, 준비 완료 시 "선생님, 수업 준비 끝났습니다!" 보고',
        '【체크】매일: 팀원들이 다 같이 움직이도록 챙겼나요?',
        '【체크】매일: 숙제 미제출 친구 명단을 선생님께 정확히 보고했나요?',
        '【체크】매 시간: 수업 시작 전 "준비 완료" 보고를 잊지 않았나요?',
      ]
    },
    {
      id: 'r_homework', ministryId: 'm4', name: '과제 점검 (교육부 팀원)',
      description: '수업·공부 관련 모든 일을 함께 해결하는 만능 해결사',
      duties: [
        '아침 숙제 검사 (나눠서): 교실을 3구역으로 나눠 자리에 가서 과제(지식 적금 등) 확인·도장 날인 (봐주기 금지!)',
        '자료 나눠주기·태블릿 정리: 학습지 신속 배부, 수업 후 태블릿 함에 개수 세고 충전 선 꼼꼼히 꽂기',
        '학습 도우미: 교과서 페이지 못 찾는 친구에게 조용히 알려주기',
        '【체크】매일 아침: 내 구역 숙제 검사를 꼼꼼히 했나요?',
        '【체크】수업 후: 태블릿 개수 맞음·충전 선 잘 꽂혔는지 확인했나요?',
        '【체크】수업 중: 도움 필요한 친구를 모른 척하지 않고 도왔나요?',
      ]
    },
    {
      id: 'r_material', ministryId: 'm4', name: '자료 배부 (교육부 팀원)',
      description: '학습지를 나눠주고 태블릿을 관리해요.',
      duties: [
        '가정통신문 배부',
        '태블릿 충전 및 개수 확인',
        '수업 학습지 신속 배부',
      ]
    },
    {
      id: 'r_st_support', ministryId: 'm4', name: '학습 지원 (교육부 팀원)',
      description: '어려워하는 친구들을 도와줘요.',
      duties: [
        '수학익힘책 1차 채점',
        '교과서 페이지 안내',
        '수업 중 어려워하는 친구 조용히 도우미',
      ]
    },

    // 5. 문화체육부
    {
      id: 'r_event', ministryId: 'm5', name: '문체부 장관 (행사 총괄)',
      description: '우리 반의 놀이 문화를 지휘하고 부원들의 아이디어를 모으는 리더',
      duties: [
        '행사 기획 회의: 학급 행사 시 부원들과 아이디어 회의 → 선생님께 보고',
        '역할 나누기: 행사 당일 친구들에게 할 일 배분 ("너는 사회, 너는 점수 기록")',
        '부원 챙기기: DJ·놀이·미디어 친구들이 매일 할 일을 잘하는지 확인',
        '【체크】행사 전: 부원들과 아이디어 회의를 했나요?',
        '【체크】행사 중: 소외되는 친구 없이 모두 참여하도록 살폈나요?',
      ]
    },
    {
      id: 'r_dj', ministryId: 'm5', name: 'DJ & 음악',
      description: '점심(잔잔하게)·청소(신나게) 시간에 상황 맞는 노래를 트는 DJ',
      duties: [
        '점심시간: 잔잔한 분위기의 음악 틀기',
        '청소 시간: 신나는 노동요 선곡하여 틀기',
        '욕설·나쁜 말 포함 노래 절대 금지 (어길 시 자격 정지)',
        '행사 시: MC·심판·점수 기록·촬영 등 스태프 역할 수행',
        '【체크】매일: 점심·청소 시간 음악을 빼먹지 않고 틀었나요?',
      ]
    },
    {
      id: 'r_toy', ministryId: 'm5', name: '놀이 관리',
      description: '보드게임을 빌려주고 반납 시 부품을 꼼꼼히 확인하는 매니저',
      duties: [
        '보드게임 대여 시 <대여 장부>에 이름·날짜 기재',
        '반납 시 박스 열어 부품 분실 여부 필수 확인',
        '행사 시 기획·진행 스태프 역할 수행',
        '【체크】매일: 대여 장부를 기록하고 반납 물건을 꼼꼼히 확인했나요?',
      ]
    },
    {
      id: 'r_media', ministryId: 'm5', name: '미디어 (사진)',
      description: '매일 우리 반의 행복한 모습을 사진으로 기록하는 포토그래퍼',
      duties: [
        '매일 우리 반 친구들의 행복한 모습 1장 이상 촬영 (엽기 사진 금지)',
        '행사 영상 촬영 및 기록',
        '【체크】매일: 오늘 사진 1장 이상 찍었나요?',
      ]
    },

    // 6. 환경보건부
    {
      id: 'r_clean_head', ministryId: 'm6', name: '환경부 장관 (청소 감독)',
      description: '청소 상태를 최종 합격시키고 문단속·전기를 책임지는 관리자',
      duties: [
        '청소 지휘·검사: "청소 시작!" 외치기, 청소 덜 된 곳 찾아 재청소 지시',
        '시설 안전 점검 (하교 전 필수): 창문 잠금 흔들어 확인 → TV·에어컨·전등 꺼짐 확인 → "청소 끝! 문단속 끝!" 보고',
        '【체크】매일: 청소 어벤져스 친구들이 열심히 하는지 챙겼나요?',
        '【체크】매일: 창문 잠금·전등 끄기를 직접 눈으로 확인했나요?',
      ]
    },
    {
      id: 'r_avengers', ministryId: 'm6', name: '청소 어벤져스',
      description: '10분 안에 청소를 끝내는 스피드팀 + 보건 위생(겸임)',
      duties: [
        '역할 분담: A(앞바닥·칠판), B(뒷바닥·창틀), C(쓰레기·분리수거), D(책상줄·창문) 고정 담당',
        '임무 수행: 장난치지 않고 맡은 구역 빠르게 완료, 먼저 끝난 친구는 다른 친구 돕기',
        '청소 도구 정리: 청소 후 빗자루·쓰레받기 도구함에 가지런히 정리',
        '보건 위생 (어벤져스 1명 겸임): 종례 전 책상 서랍·바닥 쓰레기 검사, 미치운 시 행안부 신고',
        '환기: 쉬는 시간마다 창문 열어 교실 공기 교체',
        '【체크】매일: 내 구역(쓸기·비우기·닫기)을 확실하게 끝냈나요?',
        '【체크】매일: 친구들이 자기 자리 쓰레기를 잘 치웠는지 검사했나요? (보건 겸임)',
        '【체크】쉬는 시간: 공기가 탁할 때 창문을 열어 환기했나요?',
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
    // 🛡️ 행정안전부 (경찰 및 안전)
    { id: 't_m2_1', roleId: 'r_police', text: '점심시간/전담 시간 대열 순찰 및 질서 유지', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m2_2', roleId: 'r_police', text: '규칙 위반자 발견 시 \'솔로몬의 재판소\' 앱 기록', type: 'self', frequency: { type: 'daily' }, action: 'open_judicial' }, // S
    { id: 't_m2_3', roleId: 'r_safety', text: '하교 전 교실 내 위험 요소 및 시설 파손 점검 (이상 발견시 보고)', type: 'admin', frequency: { type: 'daily' } }, // S/T -> admin
    { id: 't_m2_4', roleId: 'r_police', text: '이번 주 \'범죄 예방 캠페인\' 주제 선정 및 공지', type: 'admin', frequency: { type: 'weekly' } }, // T -> admin
    { id: 't_m2_5', roleId: 'r_mediator', text: '친구 간 갈등 중재 (사안 심각할 때 보고)', type: 'admin', frequency: { type: 'daily' }, action: 'open_judicial' }, // S/T -> admin

    // 💰 기획재정부 (금융 및 상점)
    { id: 't_m3_1', roleId: 'r_store', text: '지정된 시간에 \'학급 상점\' 오픈 및 판매 진행', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m3_2', roleId: 'r_audit', text: '\'63랜드 앱\' 내 반짝마켓 불건전 게시물 모니터링', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m3_3', roleId: 'r_briefing', text: '공공근로(알바) 업무 배정 및 일당 지급 내역 기록', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m3_4', roleId: 'r_wage', text: '모든 국민 주급(월급) 계산 및 최종 승인 요청', type: 'admin', frequency: { type: 'specific_days', days: [5] } }, // T -> admin
    { id: 't_m3_5', roleId: 'r_wage', text: '세금 및 자릿세(임대료) 개별 징수 확인', type: 'self', frequency: { type: 'specific_days', days: [5] } }, // S
    { id: 't_m3_6', roleId: 'r_store', text: '상점 물품 재고 조사 결과 보고', type: 'admin', frequency: { type: 'specific_days', days: [5] } }, // T -> admin

    // 📚 교육부 (학습 지원)
    { id: 't_m4_1', roleId: 'r_homework', text: '등교 직후: \'인생노트\' 제출 여부 점검', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m4_2', roleId: 'r_homework', text: '등교 직후: 선생님이 지정한 과제 미제출자 독촉 및 격려', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m4_3', roleId: 'r_st_support', text: '수업 1분 전: 다음 시간 교과서 및 준비물 안내', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m4_4', roleId: 'r_material', text: '하교 전: 태블릿 PC 수거 확인 및 충전기 연결 상태 점검', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m4_5', roleId: 'r_material', text: '학습지 배부 및 채점 도우미 활동 (알림 시)', type: 'admin', frequency: { type: 'daily' } }, // S/T -> admin

    // 🎵 문화체육부 (행사 및 기록)
    { id: 't_m5_1', roleId: 'r_dj', text: '점심/청소 시간: 태블릿 활용 음악 방송 송출', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m5_2', roleId: 'r_media', text: '오늘의 추억 사진 1장 이상 촬영 및 공유 폴더 업로드', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m5_3', roleId: 'r_toy', text: '보드게임 대여 장부 확인 및 반납 시 장비 검수', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m5_4', roleId: 'r_event', text: '다음 주 진행할 미니 게임(행사) 아이디어 승인 요청', type: 'admin', frequency: { type: 'weekly' } }, // T -> admin
    { id: 't_m5_5', roleId: 'r_media', text: '전담 시간 사진 촬영 사전 허가 받기', type: 'admin', frequency: { type: 'daily' } }, // T -> admin

    // 🧹 환경보건부 (청소 및 미화)
    { id: 't_m6_1', roleId: 'r_avengers', text: '하교 전: 친구들 개인 자리 청결 상태 검사', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m6_2', roleId: 'r_avengers', text: '하교 전: 지정된 공용 구역 어벤져스 청소', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m6_3', roleId: 'r_avengers', text: '하교 전: 쓰레기통 비우기 및 분리수거', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m6_4', roleId: 'r_clean_head', text: '하교 전: 교실 모든 창문 잠금 및 전원 차단 확인', type: 'self', frequency: { type: 'daily' } }, // S
    { id: 't_m6_5', roleId: 'r_clean_head', text: '최종 청소 상태 점검 및 하교 승인', type: 'admin', frequency: { type: 'daily' } }, // T -> admin

    // 🏛️ 국무회의 (대통령, 의장, 법원장)
    { id: 't_m1_1', roleId: 'r_president', text: '[종례 시간] 국가 소식 공지 (담화 내용 사전 확인)', type: 'admin', frequency: { type: 'daily' } }, // T -> admin
    { id: 't_m1_2', roleId: 'r_president', text: '주간 장관 회의 주재 (부서별 업무 보고 진행)', type: 'self', frequency: { type: 'specific_days', days: [1] } }, // S
    { id: 't_m1_3', roleId: 'r_speaker', text: '정기 학급 회의 달빛 회의 진행 및 사회', type: 'self', frequency: { type: 'specific_days', days: [5] } }, // S
    { id: 't_m1_4', roleId: 'r_speaker', text: '청원 확인 및 신규 법안 최종 결재 요청', type: 'admin', frequency: { type: 'daily' }, action: 'open_petition' }, // T -> admin
    { id: 't_m1_5', roleId: 'r_justice', text: '최종 판결 승인 요청 (선생님께)', type: 'admin', frequency: { type: 'daily' }, action: 'open_judicial' }, // T -> admin
    { id: 't_m1_6', roleId: 'r_justice', text: '자치 법정 재판 개정 및 결과 기록', type: 'self', frequency: { type: 'daily' }, action: 'open_judicial' }, // S
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
