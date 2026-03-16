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
      description: '학급(국가)의 행정을 총괄하고 선생님의 메시지를 전달하는 최고 책임자',
      duties: [
        '행정 총괄: 매주 1회 5개 부서 장관들과 만나 주간 회의 진행 및 조율',
        '국가 업무 승인: 국회 법안 최종 서명 및 부서 예산 집행 승인',
        '대통령 공지 대본: "내일 전담 수업 이동 시 행안부 안내에 잘 따라주시기 바랍니다."',
        '【체크】성품: 친구들에게 권위적이지 않고 "의원님, 장관님" 호칭하며 정중히 대했나요?',
        '【체크】소통: 매일 선생님과 소통하며 학급 방향을 의논했나요?'
      ]
    },
    {
      id: 'r_speaker', ministryId: 'm1', name: '국회의장',
      description: '친구들의 목소리(청원)를 모아 회의를 진행하고 법을 만드는 입법 총괄',
      duties: [
        '청원 관리: 63랜드 앱/게시판에 동의 수가 많은 건의를 학급 회의 주제로 채택',
        '회의 진행: 학급 회의 시나리오에 따라 민주적으로 진행 (특정인 발언 독점 방지)',
        '법전 기록: 회의에서 통과된 새로운 법안을 63랜드 앱 법전 코너에 즉시 기록',
        '【체크】매주: 회의를 공정하게 진행하고 통과된 법을 앱에 빠짐없이 기록했나요?'
      ]
    },
    {
      id: 'r_justice', ministryId: 'm1', name: '대법원장',
      description: '불공정이나 규칙 위반을 헌법에 따라 판결하는 정의의 사법 총괄',
      duties: [
        '최초 판결: 재판소 기록지에 올라온 친구를 불러 확인 후 헌법에 따라 벌점/벌금 확정 (명확한 근거 필요)',
        '법정 개정: 해결되지 않는 갈등 발생 시 자치 법정을 열어 배심원 의견 청취 후 판결',
        '판결 기록: 확정된 판결을 63랜드 앱에 기록하고, 벌금 시 기재부에 징수 요청',
        '【체크】판결 시: 감정에 치우치지 않고 오직 헌법과 규칙에 따라 공정하게 판결했나요?'
      ]
    },

    // 2. 행정안전부
    {
      id: 'r_credit', ministryId: 'm2', name: '행정안전부 장관 (갈등 중재)',
      description: '부서를 총괄하며 학급 내 심각한 갈등 발생 시 중재하는 리더',
      duties: [
        '갈등 중재: 싸우는 친구 즉시 분리 및 진정 (양쪽 이야기 공평하게 듣기)',
        '행감바 인사약 작성: 화해 준비 시 양식 꺼내어 양쪽이 함께 작성하고 약속하게 돕기',
        '주의: 화해 거부나 사안 심각 시 무리하지 않고 파법부나 선생님께 인계',
        '【체크】다툼 발생 시: 누구 편도 들지 않고 행감바/인사약 순서로 대화를 도왔나요?',
      ]
    },
    {
      id: 'r_police', ministryId: 'm2', name: '경찰관 (질서와 안전)',
      description: '점심/전담 시간 대열의 질서를 유지하고 사고 예방 캠페인을 이끄는 수호대',
      duties: [
        '질서 유지: 이동하는 줄 앞/중간/뒤 구역 나누어 대열 이탈 및 뛰기 방지',
        '경고 우선: 위반자 발견 시 먼저 경고 ("이동 중 장난치면 위험합니다. 질서를 지켜주세요.")',
        '솔로몬의 재판소 기록: 경고 무시 2회 이상 시 감정 빼고 단호하게 재판소에 기록',
        '예방 캠페인: 매주 회의로 복도 뛰기 등 주제 선정 후 포스터 제작 및 1분 홍보 발표',
        '【체크】이동 시간: 친구들이 다치지 않게 대열 앞/뒤/중간을 잘 순찰했나요?',
        '【체크】기록 시: 화내지 않고 예의 바르고 단호하게 재판소에 위반 내용을 적었나요?',
      ]
    },
    {
      id: 'r_mediator', ministryId: 'm2', name: '신용안전기록관 (벌금 및 안전)',
      description: '우리 반의 벌금(수페 앱)과 교실 내 위험 요소를 관리하는 책임관',
      duties: [
        '수페 앱(벌금) 입력: 학급 규칙에 따라 벌금 납부 상황 시 앱에 정확하게 부과',
        '더블 체크: 수페 앱(벌금) 및 재판소 기록(벌점) 등록 전 이름/내용 두 번씩 확인',
        '안전 확인: 수시로 교실에 튀어나온 못, 방해 물건 등 살피기',
        '보고 조치: 위험 요소 발견 시 직접 치우지 말고 대통령/선생님께 즉시 안전 보고',
        '【체크】매일: 교실에 친구들이 다칠 만한 위험 요소가 없는지 살피고 보고했나요?',
        '【체크】기록 시: 벌금/벌점 입력 전 이름과 내용이 정확한지 두 번 확인했나요?',
      ]
    },

    // 3. 기획재정부
    {
      id: 'r_briefing', ministryId: 'm3', name: '기획재정부 장관 (예산/알바 관리)',
      description: '우리 반 전체 예산 관리, 공공근로(알바) 인력 관리 및 알바비 즉시 지급',
      duties: [
        '알바생 모집: 돈이 부족하거나 파산한 친구에게 궂은일(교실 쓸기, 분리수거 등) 알바 제공',
        '업무 확인 및 지급: 알바 완료 검사 후 수페 앱이나 코인으로 일당 즉시 지급',
        '학급 예산 의견 수렴: 학급 간식이나 필요한 물건 의견 모아 선생님께 구매 요청',
        '【체크】예산 사용 시: 앱에 [예산 사용처]와 [사용 금액]을 그때그때 정확하게 입력했나요?',
      ]
    },
    {
      id: 'r_wage', ministryId: 'm3', name: '한국은행원 (상점 주인)',
      description: '주급 계산/지급 및 상점(서랍장) 운영을 담당하는 은행원이자 사장님',
      duties: [
        '주급 계산 및 지급: 매주 금요일 기본소득/월급 합산 후 수페 앱으로 정확히 먼저 지급',
        '상점 오픈 및 결제: 상점(서랍장)을 열고, 수페 앱 결제 내역 확인 후 물건 건네주기',
        '재고 조사: 매주 한 번 서랍장 안 간식/학용품 개수를 직접 세어보고 장부와 비교',
        '【체크】매주: 친구들에게 코인(주급)을 단 1코인의 오차도 없이 두 번 계산해서 보냈나요?',
        '【체크】상점 오픈/마감: 문이 활짝 열려있지 않게 오픈 시간 외에는 잘 닫아두었나요?',
      ]
    },
    {
      id: 'r_audit', ministryId: 'm3', name: '국세청장 (재정 감사)',
      description: '세금/임대료 징수 및 벌금 내역 대조, 63랜드 앱 반짝마켓 감시',
      duties: [
        '공과금 징수: 주급을 받은 친구들에게 세금 및 자리 임대료 걷기 (본인 직접 납부 안내)',
        '벌금 대조/독촉: 행안부 벌금 기록지를 수페 앱과 대조 후 미납자에게 독촉',
        '반짝마켓 앱 모니터링: 장난, 사기, 바가지 등 불건전 거래 상시 감시 및 경고',
        '【체크】매주: 벌금 낼 사람이 수페 앱으로 모두 냈는지 꼼꼼하게 대조/독촉했나요?',
        '【체크】수시: 앱 반짝마켓에서 나쁜 사람이나 사기꾼은 없는지 감시했나요?',
      ]
    },

    // 4. 교육부
    {
      id: 'r_moe_head', ministryId: 'm4', name: '교육부 장관',
      description: '부서를 총괄하며 매 시간 수업 준비를 최종 점검하는 미니 선생님',
      duties: [
        '수업 전 안내 대본: "다음 시간은 수학입니다! 교과서와 익힘책, 연필을 꺼내주세요!"',
        '순회 점검: 친구들이 책을 폈는지 둘러보고, 못 찾은 친구는 조용히 다가가 펴주기',
        '완료 보고 대본 (선생님 오시면): "교육부, 수업 준비 100% 완료 확인했습니다!"',
        '미니 선생님: 선생님 정답지로 수학 익힘책 1차 채점 도우미 (맞은 것만 ○, 틀린 건 ☆)',
        '【체크】매 시간: 종 치기 전에 수업 준비를 안내하고 선생님께 씩씩하게 보고했나요?',
      ]
    },
    {
      id: 'r_homework', ministryId: 'm4', name: '과제 확인관',
      description: '아침마다 친구들의 인생노트와 숙제 제출을 친절하게 챙겨주는 도우미',
      duties: [
        '앱 점검: 아침 자습 시간에 63랜드 앱으로 [인생노트] 및 [과제] 제출 여부 확인',
        '독촉 및 격려: 미제출자가 끝까지 과제를 낼 수 있도록 다가가 챙겨주고 격려하기',
        '친절한 말투: 다그치기보다 "숙제 잊었어? 내일까지 꼭 챙겨와~" 하고 멘토처럼 말하기',
        '【체크】매일 아침: 앱으로 과제 제출 여부를 꼼꼼하게 점검했나요?',
      ]
    },
    {
      id: 'r_material', ministryId: 'm4', name: '수업 지원관',
      description: '학습지를 빛의 속도로 나눠주고 태블릿 PC와 충전을 완벽하게 관리하는 요원',
      duties: [
        '빛의 속도 배부: 담당 분단의 학습지나 준비물을 빠르고 정확하게 배부',
        '태블릿 관리: 자신의 번호에 맞는 태블릿을 가져가도록 안내',
        '충전 필수 확인 (핵심): 사용 후 태블릿이 제자리에 꽂히고 충전 선이 연결되었는지 100% 확인',
        '멘토링 도우미: 모르는 친구에게 답 대신 힌트를 주어 스스로 풀게 돕기 (상점 연계 가능)',
        '【체크】학습지 배부 시: 내 분단을 책임지고 가장 빠르고 정확하게 나눠주었나요?',
        '【체크】기기 사용 후: 모든 태블릿에 충전 선이 연결되었는지 직접 눈으로 확인했나요?',
      ]
    },

    // 5. 문화체육부
    {
      id: 'r_event', ministryId: 'm5', name: '문화체육부 장관 (행사 총괄)',
      description: '우리 반 친구들이 학교에 오는 것을 즐겁게 만들어주는 부서 총괄 리더',
      duties: [
        '학급 미니 체육대회 및 행사 기획, 메인 MC 및 심판 수행',
        '행사 관련 종목 및 룰 선정 (설문조사 및 국회 건의 참고)',
        'MC 대본: "지금부터 제1회 육삼랜드 미니 올림픽을 시작하겠습니다! 선수들 입장해 주세요!"',
        '【체크】행사 중: 반칙을 하거나 룰을 어기는 사람에게 친한 친구라도 단호하고 공정하게 심판했나요?',
      ]
    },
    {
      id: 'r_dj', ministryId: 'm5', name: '음악 방송국장',
      description: '점심시간 및 청소 시간 음악 방송을 책임지는 방송국장',
      duties: [
        '신청곡 수합 및 사전 필터링 (욕설 및 부적절한 노래 제외)',
        '센스 있는 선곡: 청소 시 신나는 노동요, 비오는 날 차분한 노래 등 분위기에 맞는 선곡',
        '점심시간(식사 후) 및 종례 후 청소 시간 음악 방송 진행 (학급 태블릿 이용)',
        '【체크】매일: 규칙에 맞지 않는 노래를 빼고 즐거운 방송을 진행했나요?',
      ]
    },
    {
      id: 'r_toy', ministryId: 'm5', name: '보드게임 관리관',
      description: '보드게임 대여 관리와 부품 분실/파손을 확인하는 책임관',
      duties: [
        '대여 장부 작성: 빌려갈 때 이름과 시간 기재 확인',
        '상태 및 부품 검수: 게임 후 반납 시 직접 부품(말, 카드 등) 개수 확인',
        '파손/분실 발견 시: 행안부/선생님께 보고하여 수페 앱으로 변상금 조치',
        '【체크】매일: 대여 장부를 기록하고 반납 물건을 꼼꼼히 확인했나요?',
      ]
    },
    {
      id: 'r_media', ministryId: 'm5', name: '미디어 기록관',
      description: '매일 우리 반의 의미 있는 순간들을 추억으로 남기는 포토그래퍼',
      duties: [
        '오늘의 한 장: 자연스러운 일상, 토론, 재밌게 노는 모습 매일 1장 이상 촬영',
        '행사 영상 기록 및 선생님이 지정해주신 폴더(또는 앱)에 날짜별 올리기',
        '주의: 전담 시간에 사진을 찍기 전 반드시 전담 선생님의 허락 받기',
        '【체크】매일: 오늘 우리 반의 의미 있는 사진 1장 이상 찍었나요?',
      ]
    },

    // 6. 환경보건부
    {
      id: 'r_clean_head', ministryId: 'm6', name: '환경보건부 장관 (청소 감독)',
      description: '청소 상태를 최종 감독하고 문단속·전기를 책임지는 하교 승인권자',
      duties: [
        '개인 자리 점검: 종례 직후 서랍/바닥 쓰레기 검사 후 통과/재청소 지시',
        '최종 검사: 어벤져스 청소 후 교실과 복도 바닥, 칠판 등을 매의 눈으로 꼼꼼히 검사',
        '하교 승인 요청 대본: "환경보건부, 교실 구역 청소 및 쓰레기 분리수거 모두 완료했습니다! 하교해도 좋습니까?"',
        '【체크】매일: 바닥 쓰레기와 칠판을 꼼꼼히 점검하고 선생님께 하교 승인을 받았나요?',
      ]
    },
    {
      id: 'r_avengers', ministryId: 'm6', name: '청소 어벤져스',
      description: '지정 구역을 빛의 속도로 청소하고 게시판 미화를 담당하는 특공대',
      duties: [
        '구역 청소: 교실 앞/뒤/복도 등 담당 구역을 빗자루나 걸레로 청소',
        '분리수거 및 정리: 쓰레기통 꽉 차면 2인 1조 배출, 창문 잠금 및 전원(불/선풍기) 차단',
        '환경 미화: 미술 작품 합동 전시(줄/각도 맞추기) 및 오래된 게시물 폐기',
        '【체크】매일: 내 구역 청소, 쓰레기 비우기, 창문/전원 닫기를 확실하게 끝냈나요?',
        '【체크】수시: 미술 작품 전시 시 찢어지지 않게 힘을 합쳐 예쁘게 붙였나요?'
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
