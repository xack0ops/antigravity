import React, { useState } from 'react';
import { X, Home, Briefcase, ShoppingBag, Search, ScrollText, Gavel, KeyRound, ChevronRight, ChevronDown } from 'lucide-react';

const SECTIONS = [
  {
    id: 'overview',
    icon: <Home className="w-5 h-5" />,
    title: '63랜드란?',
    color: 'bg-indigo-500',
    lightColor: 'bg-indigo-50 border-indigo-200',
    textColor: 'text-indigo-700',
    emoji: '🏫',
    content: `63랜드는 우리 반 학급 경영 시스템입니다. 선생님과 학생들이 함께 사용하는 포털로, 다양한 기능을 통해 즐겁고 체계적인 학급 생활을 할 수 있어요!`,
    steps: [
      { 
        icon: '🔐', title: '로그인', desc: '선생님이 부여한 아이디와 비밀번호로 로그인합니다.',
        details: ['초기 비밀번호는 1234입니다.', '로그인 후 [계정 설정]에서 나만의 비밀번호로 꼭 변경해주세요!'],
        actionBox: { label: '버튼 생김새', buttonName: '로그인', color: 'bg-indigo-600' }
      },
      { 
        icon: '🏠', title: '홈 화면 확인', desc: '오늘의 일정, 알림장, 나의 점수를 한눈에 확인하세요.',
        details: ['시간표는 매일 자동으로 갱신됩니다.', '오른쪽 위에 달린 🔔 알림 뱃지에 숫자가 뜨면 꼭 확인하세요!']
      },
      { 
        icon: '📱', title: '하단 탭으로 이동', desc: '화면 아래 탭을 눌러 다양한 기능을 이용하세요.',
        details: ['홈, 나의 업무, 반짝마켓, 물어보살, 국무회의, 재판소 총 6개의 탭이 있습니다.']
      },
    ]
  },
  {
    id: 'home',
    icon: <Home className="w-5 h-5" />,
    title: '홈 탭',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-700',
    emoji: '🏠',
    content: '앱을 처음 열면 보이는 메인 화면입니다. 오늘의 중요한 정보를 모두 한 곳에서 확인할 수 있어요.',
    steps: [
      { 
        icon: '⭐', title: '생활태도 점수', desc: '내 현재 점수와 신용등급을 확인할 수 있어요.',
        details: ['점수를 모으면 신용등급이 올라갑니다.', '신용등급이 올라가면 특별한 상품을 살 수 있는 권한이 생길지도 몰라요!'],
        actionBox: { label: '점수 내역 확인', buttonName: '내역 보기', color: 'bg-gray-200 text-gray-700' }
      },
      { 
        icon: '🛍️', title: '점수 사용하기', desc: '모은 점수로 선생님이 등록한 혜택 아이템을 구매할 수 있어요.',
        details: ['아이템을 구매하면 즉시 점수가 차감됩니다.', '구매 내역은 선생님께 바로 전달됩니다.'],
        actionBox: { label: '포인트 상점', buttonName: '점수 사용하기', color: 'bg-blue-50 text-blue-600' }
      },
      { 
        icon: '📅', title: '오늘의 일정', desc: '오늘 진행되는 1~6교시 수업을 확인할 수 있어요.',
        details: ['어떤 과목인지, 단원명은 무엇인지 미리 볼 수 있어요.']
      },
      { 
        icon: '📋', title: '알림장', desc: '중요한 알림이 색깔별로 나타나요.',
        details: [
          '🔵 파란색: 미제출 과제/수행평가 알림', 
          '🟣 보라색: 선생님이 보낸 공지 메시지', 
          '🔴 빨간색: 투표가 필요한 새로운 청원',
          '분홍색, 남색 등 다양한 알림을 클릭하면 바로 해당 화면으로 이동합니다.'
        ]
      },
    ]
  },
  {
    id: 'myjob',
    icon: <Briefcase className="w-5 h-5" />,
    title: '나의 업무 탭',
    color: 'bg-violet-500',
    lightColor: 'bg-violet-50 border-violet-200',
    textColor: 'text-violet-700',
    emoji: '💼',
    content: '내 역할과 오늘 해야 할 일을 확인하고 체크할 수 있는 탭이에요. 부서별로 특별 기능도 있어요!',
    steps: [
      { 
        icon: '🏷️', title: '역할 카드', desc: '내가 속한 부서와 담당 역할이 표시됩니다.',
        details: ['매일 해야 할 일이 무엇인지 확인하세요.', '[나의 임무 다시보기]를 클릭하면 언제든 세부 행동 요령을 볼 수 있습니다.'],
        actionBox: { label: '임무 보기 기능', buttonName: '나의 임무 다시보기', color: 'bg-indigo-50 text-indigo-600' }
      },
      { 
        icon: '✅', title: '오늘의 할 일 체크', desc: '오늘 해야 할 업무 목록이 나타납니다. 동그라미를 클릭하면 완료 처리돼요!',
        details: ['초록색 체크: 내가 직접 완료 처리하는 개인 업무입니다.', '주황색 뱃지: 완료를 누르면 선생님께 승인 요청이 갑니다. 선생님이 통과시켜주셔야 최종 완료됩니다.'],
      },
      { 
        icon: '🔔', title: '선생님께 꼭 전달할 말이 있어요', desc: '선생님이 자리를 비우셨을 때 긴급하게 전달할 내용을 남길 수 있어요.',
        details: ['이 기능으로 메시지를 보내면, 선생님 대시보드 쪽지함에 가장 먼저 뜹니다!'],
        actionBox: { label: '메시지 작성', buttonName: '✍️ 내용 남기기', color: 'bg-rose-50 text-rose-600' }
      },
      { 
        icon: '⭐', title: '점수 부여/차감 (행정안전부 전용)', desc: '다른 학생에게 점수를 부여하거나 차감할 수 있는 강력한 기능입니다.',
        details: ['반드시 정해진 교칙에 따라서만 점수를 조정해야 합니다.', '누가 언제 점수를 주었는지 모두 기록됩니다.']
      },
      { icon: '📓', title: '인생노트 점검 (교육부 전용)', desc: '친구들의 인생노트 제출 여부를 기록하고 관리할 수 있어요.', details: ['버튼 클릭 한 번으로 미제출자를 제출자로 바꿀 수 있습니다.'] },
      { icon: '📝', title: '과제 점검 (교육부 전용)', desc: '선생님이 올리신 과제/수행평가를 친구들이 제출했는지 체크합니다.' },
      { icon: '💰', title: '벌금 관리 (기획재정부 전용)', desc: '재판소에서 선고된 벌금, 과태료 등을 거두고 기록합니다.', actionBox: { label: '벌금 납부 처리', buttonName: '납부 완료', color: 'bg-green-100 text-green-700' } },
      { icon: '🏦', title: '학급 예산 (기획재정부 전용)', desc: '학급에 할당된 전체 예산을 관리하고 어디에 사용했는지 기장합니다.' },
    ]
  },
  {
    id: 'market',
    icon: <ShoppingBag className="w-5 h-5" />,
    title: '반짝마켓 탭',
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50 border-orange-200',
    textColor: 'text-orange-700',
    emoji: '🛒',
    content: '반 친구들과 물건을 교환하거나, 소소한 알바를 구하거나, 번개 모임을 만들 수 있는 공간이에요!',
    steps: [
      { 
        icon: '✍️', title: '공고 글 쓰기', desc: '분류(물물교환/반짝알바/반짝번개)를 선택하고 재미난 글을 올려보세요.',
        details: ['우측 상단의 빨간색 [글쓰기] 버튼을 누르면 됩니다.'],
        actionBox: { label: '게시물 작성', buttonName: '✍️ 글쓰기', color: 'bg-red-50 text-red-600' }
      },
      { 
        icon: '🔄', title: '물물교환 & 알바', desc: '안 쓰는 물건을 올리거나 도움을 요청할 수 있어요.',
        details: ['댓글과 좋아요 기능으로 소통해보세요.']
      },
      { 
        icon: '⚡', title: '반짝번개', desc: '함께 놀거나 활동할 사람을 모집합니다.',
        details: ['모집 인원을 설정하면 선착순으로 친구들이 [함께하기!]를 누를 수 있습니다.', '지정된 인원이 꽉 차면 자동으로 모집이 완료됩니다.'],
        actionBox: { label: '모집 참여 버튼', buttonName: '함께하기! (1/3)', color: 'bg-amber-100 text-amber-700' }
      },
      { 
        icon: '🏷️', title: '내 글 관리', desc: '내가 쓴 글은 언제든 삭제하거나 완료 처리할 수 있습니다.',
        actionBox: { label: '글 관리 기눙', buttonName: '✅ 완료 / 🗑️ 삭제', color: 'bg-gray-100 text-gray-700' }
      },
    ]
  },
  {
    id: 'wiki',
    icon: <Search className="w-5 h-5" />,
    title: '물어보살 탭',
    color: 'bg-teal-500',
    lightColor: 'bg-teal-50 border-teal-200',
    textColor: 'text-teal-700',
    emoji: '🔮',
    content: '우리 반 규칙이나 학급 운영 방식을 모를 때 스스로 검색해서 찾아볼 수 있는 지식 창고입니다.',
    steps: [
      { 
        icon: '🔍', title: '키워드 검색', desc: '검색창에 궁금한 단어를 입력하면 즉시 답을 찾아줍니다.',
        details: ['예: "벌금", "복장", "간식", "화장실" 등의 키워드를 검색해보세요.']
      },
      { 
        icon: '🏢', title: '부서 현황 조회', desc: '반 친구들이 어느 부서에서 무슨 일을 하는지 찾아볼 수 있습니다.',
        details: ['물어보살 메인 화면 상단의 [부서 현황] 탭을 눌러보세요.']
      },
      { 
        icon: '📂', title: '주제별 탐색', desc: '검색을 하지 않아도 규칙, 환경, 경제, 생활 등 카테고리별로 모아볼 수 있습니다.' 
      },
    ]
  },
  {
    id: 'petition',
    icon: <ScrollText className="w-5 h-5" />,
    title: '국무회의 탭',
    color: 'bg-red-500',
    lightColor: 'bg-red-50 border-red-200',
    textColor: 'text-red-700',
    emoji: '🏛️',
    content: '우리 반 민주주의의 핵심! 건의사항을 청원하고, 설문조사에 참여하고, 회의 방식을 확인할 수 있어요.',
    steps: [
      { 
        icon: '✍️', title: '청원 작성하기', desc: '바꾸고 싶거나 건의할 내용이 있다면 누구나 청원을 올릴 수 있습니다.',
        details: ['상단의 [청원하기] 버튼을 눌러 제목과 이유를 적으세요.'],
        actionBox: { label: '청원 등록 창', buttonName: '청원하기', color: 'bg-blue-600' }
      },
      { 
        icon: '👍', title: '친구 청원에 동의하기', desc: '좋은 의견이라고 생각되면 동의 버튼을 누르세요.',
        details: ['의견에 찬성한다면 [동의합니다]를 누릅니다.', '동의자 수가 10명을 돌파하면 공식 국무회의 안건으로 상정됩니다!'],
        actionBox: { label: '찬성 표현', buttonName: '👍 동의합니다 (5명)', color: 'bg-green-50 text-green-700' }
      },
      { 
        icon: '📊', title: '설문조사', desc: '학급 운영을 위해 진행되는 투표나 설문에 편리하게 참여할 수 있습니다.',
      },
      { 
        icon: '📋', title: '회의/심사 가이드', desc: '국회의장이 회의를 매끄럽게 진행할 수 있도록 돕는 대본 안내서가 포함되어 있습니다.',
        details: ['관리자나 국회의장 역할은 이 가이드를 직접 편집할 수 있습니다.']
      },
    ]
  },
  {
    id: 'judicial',
    icon: <Gavel className="w-5 h-5" />,
    title: '재판소 탭',
    color: 'bg-slate-600',
    lightColor: 'bg-slate-50 border-slate-200',
    textColor: 'text-slate-700',
    emoji: '⚖️',
    content: '"솔로몬의 재판소"는 학급에서 생기는 다툼이나 규칙 위반 사건을 공정하게 기록하고 판결을 내리는 시스템입니다.',
    steps: [
      { 
        icon: '📥', title: '사건 접수 (학생용)', desc: '불미스러운 일이나 규칙 위반을 목격/경험했다면 신고할 수 있습니다.',
        details: [
          '피해자, 가해자, 장소, 일시를 자세히 적습니다.', 
          '다툼, 욕설, 기물 파손 등 정확한 카테고리를 고르세요.',
          '익명으로 신고할 수 있는 옵션이 제공됩니다.'
        ],
        actionBox: { label: '신고서 제출', buttonName: '이 사건 접수하기', color: 'bg-indigo-600' }
      },
      { 
        icon: '📁', title: '사건 처리 상태', desc: '내가 신고한 사건이 어느 단계인지 투명하게 볼 수 있습니다.',
        details: ['대기중(노란색) → 조사중(파란색) → 판결입력(보라색) → 해결완료(초록색) 순서로 흐릅니다.']
      },
      { 
        icon: '📜', title: '63법전', desc: '우리 반 최고의 법 테두리입니다.',
        details: ['징계 사유와 그에 따른 형벌(벌금, 봉사 등)이 담긴 처벌법과 좋은 일을 권장하는 복지법이 나뉘어 기록되어 있습니다.']
      },
      { 
        icon: '👨‍⚖️', title: '사건 판결 (담당자 전용)', desc: '행정안전부 및 사법부(대법원장) 학생이 사건 상태를 옮기고 법을 적용해 판결을 입력합니다.',
        details: ['법전에서 조항을 고르면 자동으로 판결문(벌금 얼마 부과 등)이 생성됩니다!'],
        actionBox: { label: '판결 권한', buttonName: '판결 입력', color: 'bg-purple-100 text-purple-700' }
      },
    ]
  },
  {
    id: 'settings',
    icon: <KeyRound className="w-5 h-5" />,
    title: '계정 설정',
    color: 'bg-gray-500',
    lightColor: 'bg-gray-50 border-gray-200',
    textColor: 'text-gray-700',
    emoji: '⚙️',
    content: '내 정보와 계정 보안을 관리하는 영역입니다.',
    steps: [
      { 
        icon: '🔑', title: '비밀번호 변경', desc: '보안을 위해 1~2달에 한 번씩 비밀번호를 바꿔주세요.',
        details: ['홈 화면 헤더의 열쇠 버튼을 누르면 즉시 변경할 수 있습니다.'],
        actionBox: { label: '변경 버튼 아이콘', buttonName: '🔑 비번 변경', color: 'bg-gray-200 text-gray-700' }
      },
      { 
        icon: '🚪', title: '로그아웃', desc: '다른 컴퓨터나 패드에서 친구가 내 계정을 쓰지 않도록 자리에서 뜰 때는 로그아웃을 눌러주세요.' 
      },
    ]
  },
];

const UserManual = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedStep, setExpandedStep] = useState(null);

  const currentSection = SECTIONS.find(s => s.id === activeSection) || SECTIONS[0];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[100]">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-xl">
              📖
            </div>
            <div>
              <h2 className="text-xl font-black text-white">63랜드 사용 설명서</h2>
              <p className="text-indigo-200 text-xs font-medium mt-0.5">처음 오신 분도 쉽게 따라할 수 있어요!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Section Navigator */}
          <div className="w-14 sm:w-52 bg-gray-50 border-r border-gray-100 shrink-0 overflow-y-auto">
            <div className="p-2 sm:p-3 space-y-1">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => { setActiveSection(section.id); setExpandedStep(null); }}
                  className={`w-full flex items-center gap-3 px-2 sm:px-3 py-2.5 rounded-xl text-left transition-all ${
                    activeSection === section.id
                      ? `${section.lightColor} border font-bold`
                      : 'hover:bg-gray-100 text-gray-500 border border-transparent'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-base
                    ${activeSection === section.id ? section.color + ' text-white' : 'bg-gray-200 text-gray-500'}
                  `}>
                    {section.emoji}
                  </div>
                  <span className={`text-sm hidden sm:block ${activeSection === section.id ? section.textColor : 'text-gray-600'}`}>
                    {section.title}
                  </span>
                  {activeSection === section.id && (
                    <ChevronRight className={`w-4 h-4 ml-auto hidden sm:block ${section.textColor}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 sm:p-7 space-y-6">
              {/* Section Header */}
              <div className={`rounded-2xl p-5 ${currentSection.lightColor} border`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 ${currentSection.color} rounded-xl flex items-center justify-center text-xl`}>
                    {currentSection.emoji}
                  </div>
                  <h3 className={`text-xl font-black ${currentSection.textColor}`}>{currentSection.title}</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{currentSection.content}</p>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">📌 주요 기능 안내</h4>
                {currentSection.steps.map((step, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
                  >
                    <button
                      className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl shrink-0">
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 text-sm">{step.title}</p>
                        <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{step.desc.split('\n')[0]}</p>
                      </div>
                      <div className="shrink-0">
                        {expandedStep === index
                          ? <ChevronDown className="w-5 h-5 text-gray-400" />
                          : <ChevronRight className="w-5 h-5 text-gray-300" />
                        }
                      </div>
                    </button>

                    {expandedStep === index && (
                      <div className={`px-5 pb-5 pt-3 ${currentSection.lightColor} border-t`} style={{borderColor: 'rgba(0,0,0,0.05)'}}>
                        <div className="bg-white/95 rounded-xl p-5 shadow-sm space-y-4">
                          <p className="text-sm font-bold text-gray-800 leading-relaxed whitespace-pre-line border-l-4 border-indigo-400 pl-3">
                            {step.desc}
                          </p>
                          
                          {step.details && (
                            <ul className="space-y-2.5 mt-4 ml-1">
                              {step.details.map((detail, idx) => (
                                <li key={idx} className="flex gap-2.5 items-start">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                                  <span className="text-sm text-gray-600 leading-relaxed font-medium">{detail}</span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {step.actionBox && (
                            <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                              <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">{step.actionBox.label}</p>
                              <div className="flex items-center">
                                <button className={`px-4 flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold shadow-sm transition-transform active:scale-95 ${step.actionBox.color}`}>
                                  {step.actionBox.buttonName}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Visual Guide */}
              {activeSection === 'home' && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">📱 화면 구성 안내</h4>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-xs font-black text-indigo-600">상단</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">상단 헤더</p>
                        <p className="text-gray-500 text-xs mt-0.5">🏫 63랜드 로고 | 내 이름 | 🔑 비밀번호 변경 | 📖 설명서 | 로그아웃</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-xs font-black text-blue-600">중앙</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">메인 콘텐츠 영역</p>
                        <p className="text-gray-500 text-xs mt-0.5">현재 탭의 내용이 표시됩니다.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-xs font-black text-gray-600">하단</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">하단 탭 바</p>
                        <p className="text-gray-500 text-xs mt-0.5">홈 | 나의 업무 | 반짝마켓 | 물어보살 | 국무회의 | 재판소</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Score System Explanation */}
              {activeSection === 'home' && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">⭐ 신용등급 시스템</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { grade: '1~3', label: '일반', color: 'bg-gray-100 text-gray-700', badge: 'bg-gray-300' },
                      { grade: '4~6', label: '반짝', color: 'bg-blue-50 text-blue-700', badge: 'bg-blue-400' },
                      { grade: '7~9', label: '빛나는', color: 'bg-emerald-50 text-emerald-700', badge: 'bg-emerald-400' },
                      { grade: '10+', label: '전설', color: 'bg-yellow-50 text-yellow-700', badge: 'bg-yellow-400' },
                    ].map(g => (
                      <div key={g.grade} className={`rounded-xl p-3 border ${g.color} border-current/20 flex items-center gap-2`}>
                        <div className={`w-6 h-6 rounded-full ${g.badge} flex items-center justify-center`}>
                          <span className="text-[9px] font-black text-white">{g.grade}</span>
                        </div>
                        <span className="font-bold text-sm">{g.label} 등급</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Petition Flow Visual */}
              {activeSection === 'petition' && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">🔄 청원 진행 흐름</h4>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      {[
                        { step: '1', label: '청원 작성', icon: '✍️', color: 'bg-blue-500' },
                        { step: '→', label: '', icon: null, color: '' },
                        { step: '2', label: '동의 10명', icon: '👍', color: 'bg-orange-500' },
                        { step: '→', label: '', icon: null, color: '' },
                        { step: '3', label: '국회 안건', icon: '🏛️', color: 'bg-red-500' },
                        { step: '→', label: '', icon: null, color: '' },
                        { step: '4', label: '토론/투표', icon: '🗳️', color: 'bg-purple-500' },
                      ].map((item, i) => (
                        item.icon ? (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <div className={`w-10 h-10 ${item.color} text-white rounded-full flex items-center justify-center text-xl`}>
                              {item.icon}
                            </div>
                            <span className="text-xs font-bold text-gray-600 text-center">{item.label}</span>
                          </div>
                        ) : (
                          <ChevronRight key={i} className="w-5 h-5 text-gray-300 shrink-0" />
                        )
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Judicial Status Flow */}
              {activeSection === 'judicial' && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">🔄 사건 처리 단계</h4>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      {[
                        { label: '📥 접수', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
                        { label: '🔍 조사중', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                        { label: '⚖️ 판결', color: 'bg-purple-100 text-purple-700 border-purple-200' },
                        { label: '✅ 해결', color: 'bg-green-100 text-green-700 border-green-200' },
                      ].map((s, i) => (
                        <React.Fragment key={i}>
                          <div className={`rounded-xl px-2 py-2 border text-xs font-bold text-center flex-1 ${s.color}`}>
                            {s.label}
                          </div>
                          {i < 3 && <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />}
                        </React.Fragment>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center">
                      학생이 신고 → 담당자가 접수 결정 → 조사 → 판결 → 해결 처리
                    </p>
                  </div>
                </div>
              )}

              {/* Market Categories Visual */}
              {activeSection === 'market' && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">📂 게시글 분류</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: '🔄', title: '물물교환', desc: '안 쓰는 물건 교환', color: 'bg-orange-50 border-orange-200 text-orange-700' },
                      { icon: '💼', title: '반짝알바', desc: '잠깐 도움 요청', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                      { icon: '⚡', title: '반짝번개', desc: '함께할 활동 모집', color: 'bg-amber-50 border-amber-200 text-amber-700' },
                    ].map((cat, i) => (
                      <div key={i} className={`rounded-2xl border p-3 text-center ${cat.color}`}>
                        <div className="text-2xl mb-1">{cat.icon}</div>
                        <p className="font-bold text-sm">{cat.title}</p>
                        <p className="text-xs mt-0.5 opacity-70">{cat.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-2xl p-4 text-center text-xs text-gray-400">
                <p>💡 궁금한 점이 있으면 선생님께 여쭤보거나</p>
                <p className="mt-0.5">나의 업무 탭의 <strong className="text-gray-600">&quot;선생님께 꼭 전달할 말이 있어요&quot;</strong> 버튼을 이용해주세요!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManual;
