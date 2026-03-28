import React, { useState } from 'react';
import { X, UserPlus, FileCheck, Wrench, Shield, Scale, BellRing, ChevronRight, ChevronDown } from 'lucide-react';

const SECTIONS = [
  {
    id: 'overview',
    icon: <Shield className="w-5 h-5" />,
    title: '선생님 대시보드란?',
    color: 'bg-indigo-600',
    lightColor: 'bg-indigo-50 border-indigo-200',
    textColor: 'text-indigo-800',
    emoji: '👨‍🏫',
    content: `선생님 연수원에 오신 것을 환영합니다! 선생님 대시보드에서는 학급 경영 시스템 전체를 감독하고, 학생들을 관리하며, 각 부서의 핵심적인 데이터를 직접 통제할 수 있습니다.`,
    steps: [
      { 
        icon: '👥', title: '학생 역할 배정', desc: '학생들에게 부서와 역할을 부여하고 비밀번호를 관리합니다.',
        details: ['상단의 [학생 전체 명단]에서 부서를 직관적으로 지정할 수 있습니다.']
      },
      { 
        icon: '✅', title: '업무 승인', desc: '선생님의 확인이 필요한 학생 시스템 업무를 원클릭으로 승인합니다.',
        details: ['우측 패널에 대기중인 업무가 실시간으로 쌓입니다.']
      },
      { 
        icon: '🛠️', title: '부서 도구함 리모컨', desc: '일정 관리, 상점 아이템 등록, 벌금 등 부서별 최고 권한 기능을 모두 확인하고 강제로 조작할 수 있습니다.',
        actionBox: { label: '부서 제어판', buttonName: '부서 도구함 열기', color: 'bg-emerald-600' }
      },
    ]
  },
  {
    id: 'management',
    icon: <UserPlus className="w-5 h-5" />,
    title: '학생 관리 & 현황',
    color: 'bg-blue-600',
    lightColor: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-800',
    emoji: '📋',
    content: '학생 명단을 관리하고, 부서와 역할을 배정하며 학생별 임무 달성도를 한눈에 파악하는 탭입니다.',
    steps: [
      { 
        icon: '➕', title: '학생 추가/삭제', desc: '학생 카드를 열고 [학생 삭제]를 눌러 전출 처리할 수 있습니다.',
        details: ['우측 상단의 [학생 추가] 버튼을 눌러 수동으로 계정을 생성할 수 있습니다.'],
        actionBox: { label: '학생 계정 생성', buttonName: '➕ 학생 추가', color: 'bg-indigo-600' }
      },
      { 
        icon: '🏛️', title: '부서 및 역할 부여', desc: '학생 목록을 클릭해 카드를 펼치고, [소속 부서]를 골라주세요. 이후 아래 체크박스에서 해당 부서의 역할을 복수로 배분할 수 있습니다.',
        details: ['교육부, 행정안전부, 재판소 등 63랜드의 모든 정부 부처를 배정할 수 있습니다.']
      },
      { 
        icon: '📊', title: '업무 달성 게이지', desc: '학생 이름 옆에 (완료/전체) 숫자가 뜨고 작은 초록색 바가 차오릅니다. 오늘 배정된 임무를 얼마나 잘 마쳤는지 확인할 수 있습니다.' 
      },
      { 
        icon: '🔑', title: '비밀번호 강제 초기화', desc: '학생이 암호를 잊어버렸을 때, 즉시 접근을 복구해줄 수 있습니다.',
        details: ['학생 카드를 펼치면 우측에 비밀번호 설정 섹션이 표시됩니다.'],
        actionBox: { label: '초기화 액션', buttonName: '새 비밀번호 설정', color: 'bg-blue-50 text-blue-600' }
      },
      { 
        icon: '👁️', title: '이 학생으로 접속 (테스트)', desc: '해당 학생의 화면과 권한으로 즉시 화면이 전환되어 바로 테스트할 수 있습니다.',
        details: ['다시 선생님으로 돌아오시려면 상단의 복귀 버튼을 누르세요.'],
        actionBox: { label: '테스트 기능', buttonName: '👁️ 로그인 테스트', color: 'bg-gray-100 text-gray-700' }
      },
    ]
  },
  {
    id: 'approval',
    icon: <FileCheck className="w-5 h-5" />,
    title: '업무 승인',
    color: 'bg-amber-500',
    lightColor: 'bg-amber-50 border-amber-200',
    textColor: 'text-amber-800',
    emoji: '📝',
    content: '학생 관리 패널의 우측에 위치하며, "선생님 검사 대기중"인 모든 업무가 실시간으로 쌓이는 곳입니다.',
    steps: [
      { 
        icon: '⏳', title: '실시간 알림', desc: '학생이 확인 요청을 누르면 즉시 여기에 카드가 나타납니다.',
        details: ['페이지를 새로고침하지 않아도 즉각 반영됩니다.']
      },
      { 
        icon: '✅', title: '원클릭 승인', desc: '[참 잘했어요] 버튼을 누르면 즉각 검사 완료로 처리되어 학생의 달성 게이지가 올라갑니다.',
        actionBox: { label: '승인 버튼', buttonName: '참 잘했어요', color: 'bg-emerald-50 text-emerald-600' }
      },
      { 
        icon: '🎉', title: '빈 화면', desc: '모든 승인이 완료되면 "훌륭합니다!" 메시지와 함께 화면이 깨끗하게 비워집니다.' 
      },
    ]
  },
  {
    id: 'tools',
    icon: <Wrench className="w-5 h-5" />,
    title: '부서 도구함',
    color: 'bg-emerald-600',
    lightColor: 'bg-emerald-50 border-emerald-200',
    textColor: 'text-emerald-800',
    emoji: '🧰',
    content: '학년 말, 학기 초, 혹은 긴급 수정이 필요할 때 각 부서 장관들만 쓰는 기능을 선생님 권한으로 직접 만지는 메뉴입니다.',
    steps: [
      { 
        icon: '📅', title: '일정 관리자', desc: '기본 시간표 외에 특정 날짜의 특별 일정을 달력에서 관리할 수 있습니다.',
        details: ['[일정 관리자]를 열어 특정 날짜를 선택하고 과목을 수정하세요.', '개별 설정이 없는 날은 기본 시간표가 자동으로 노출됩니다.'],
        actionBox: { label: '접근 버튼', buttonName: '일정 관리자', color: 'bg-indigo-50 text-indigo-700' }
      },
      { 
        icon: '🏢', title: '업무 및 부서 관리 (조직도)', desc: '1년 동안 운영할 부서를 개설하고, 역할을 마스터 통제합니다.',
        details: ['직업별로 부여할 [할 일 목록]을 자유롭게 커스텀할 수 있습니다.']
      },
      { 
        icon: '🎁', title: '점수 관리 (상점 세팅)', desc: '생활태도 점수로 살 수 있는 [상점 상품]을 올리거나 내립니다. 전체 학생의 점수 부여/차감 내역을 확인합니다.',
      },
      { 
        icon: '⚖️', title: '국무회의 제어', desc: '청원 게시판을 모니터링하고 잘못된 청원을 지우거나 설문조사를 직접 만듭니다.',
        actionBox: { label: '안건 관리', buttonName: '국무회의 관리', color: 'bg-red-50 text-red-700' }
      },
      { 
        icon: '📓', title: '벌금 및 예산 관리', desc: '학생 과제 대시보드, 학급 벌금/예산 회계 장부를 열람하고 틀린 내용을 선생님 권한으로 정정합니다.' 
      },
    ]
  },
  {
    id: 'messages',
    icon: <BellRing className="w-5 h-5" />,
    title: '학생 전달 메시지',
    color: 'bg-rose-500',
    lightColor: 'bg-rose-50 border-rose-200',
    textColor: 'text-rose-800',
    emoji: '📢',
    content: '지각한 학생, 과제 미제출 학생, 혹은 반 전체에게 알림장(알림 뱃지)을 울리게 하는 강력한 확성기입니다.',
    steps: [
      { 
        icon: '✉️', title: '메시지 발송', desc: '메시지를 남기면, 해당 학생의 홈 화면 [알림장]에 보라색 알림 카드가 강제로 띄워집니다.',
        details: ['여러 학생을 한 번에 선택해 발송할 수 있습니다. (전체 선택도 가능)'],
        actionBox: { label: '발송 조작', buttonName: 'N명에게 알림장 발송하기', color: 'bg-rose-600' }
      },
      { 
        icon: '👀', title: '읽음 확인', desc: '발송된 메시지 카드에서 몇 명이 읽었고, 누가 안 읽었는지 추적할 수 있습니다.',
        details: ['학생이 알림장을 더블클릭/더치하여 지우는 순간 [읽음] 처리됩니다.']
      },
      { 
        icon: '📥', title: '수신 메시지함', desc: '학생들이 [선생님께 할 말]을 통해 보낸 쪽지들이 여기에 도착합니다.',
        details: ['학생이 메시지를 보내면 즉시 목록의 맨 위에 강조되어 표시됩니다.']
      },
    ]
  },
  {
    id: 'judicial',
    icon: <Scale className="w-5 h-5" />,
    title: '재판소 및 교육과정',
    color: 'bg-slate-700',
    lightColor: 'bg-slate-50 border-slate-200',
    textColor: 'text-slate-800',
    emoji: '🏛️',
    content: '학급 내 사법 정보와 교육과정 통계를 열람하는 기능들입니다.',
    steps: [
      { 
        icon: '⚖️', title: '솔로몬의 재판소', desc: '계류 중인 모든 사건, 판결 내역, 법의 제정을 통제합니다.',
        details: ['학생들의 대법관 권한을 위임받아 직접 사건을 해결하거나 법안을 조작할 수 있습니다.'],
        actionBox: { label: '사법부', buttonName: '재판소 입장하기', color: 'bg-slate-800' }
      },
      { 
        icon: '📈', title: '교육과정 통계', desc: '시간표에 입력되었던 단원 데이터가 누적되어 교과 진행 상황(%) 막대 그래프가 뜹니다.',
        details: ['각 과목별로 63랜드 시작 후 얼마나 수업을 했는지 자동 집계됩니다.']
      },
    ]
  }
];

const AdminManual = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedStep, setExpandedStep] = useState(null);

  const currentSection = SECTIONS.find(s => s.id === activeSection) || SECTIONS[0];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[100]">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-indigo-900 px-6 py-5 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-xl">
              ⚙️
            </div>
            <div>
              <h2 className="text-xl font-black text-white">관리자 시스템 매뉴얼</h2>
              <p className="text-indigo-200 text-xs font-medium mt-0.5">선생님을 위한 63랜드 통합 관제센터 안내서</p>
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
          {/* Left Sidebar */}
          <div className="w-16 sm:w-56 bg-slate-50 border-r border-slate-100 shrink-0 overflow-y-auto">
            <div className="p-2 sm:p-3 space-y-1">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => { setActiveSection(section.id); setExpandedStep(null); }}
                  className={`w-full flex items-center gap-3 px-2 sm:px-3 py-2.5 rounded-xl text-left transition-all ${
                    activeSection === section.id
                      ? `${section.lightColor} border font-bold shadow-sm`
                      : 'hover:bg-slate-200 text-slate-500 border border-transparent'
                  }`}
                >
                  <div className={`w-8 h-8 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 text-base
                    ${activeSection === section.id ? section.color + ' text-white' : 'bg-slate-200 text-slate-500'}
                  `}>
                    {section.emoji}
                  </div>
                  <span className={`text-sm hidden sm:block ${activeSection === section.id ? section.textColor : 'text-slate-600'}`}>
                    {section.title}
                  </span>
                  {activeSection === section.id && (
                    <ChevronRight className={`w-4 h-4 ml-auto hidden sm:block ${section.textColor}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50">
            <div className="p-5 sm:p-8 space-y-6">
              {/* Section Header */}
              <div className={`rounded-2xl p-5 ${currentSection.lightColor} border`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 ${currentSection.color} rounded-xl flex items-center justify-center text-xl shadow-inner`}>
                    {currentSection.emoji}
                  </div>
                  <h3 className={`text-xl font-black ${currentSection.textColor}`}>{currentSection.title}</h3>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{currentSection.content}</p>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">🛠 기능 상세 안내</h4>
                {currentSection.steps.map((step, index) => (
                  <div
                    key={index}
                    className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
                  >
                    <button
                      className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50 transition-colors"
                      onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                    >
                      <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-xl shrink-0">
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 text-sm">{step.title}</p>
                        <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{step.desc.split('\n')[0]}</p>
                      </div>
                      <div className="shrink-0">
                        {expandedStep === index
                          ? <ChevronDown className="w-5 h-5 text-slate-400" />
                          : <ChevronRight className="w-5 h-5 text-slate-300" />
                        }
                      </div>
                    </button>

                    {expandedStep === index && (
                      <div className={`px-5 pb-5 pt-3 ${currentSection.lightColor} border-t`} style={{borderColor: 'rgba(0,0,0,0.05)'}}>
                        <div className="bg-white/95 rounded-xl p-5 shadow-sm space-y-4">
                          <p className="text-sm font-bold text-gray-800 leading-relaxed whitespace-pre-line border-l-4 border-slate-400 pl-3">
                            {step.desc}
                          </p>
                          
                          {step.details && (
                            <ul className="space-y-2.5 mt-4 ml-1">
                              {step.details.map((detail, idx) => (
                                <li key={idx} className="flex gap-2.5 items-start">
                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0"></div>
                                  <span className="text-sm text-gray-600 leading-relaxed font-medium">{detail}</span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {step.actionBox && (
                            <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
                              <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">{step.actionBox.label}</p>
                              <div className="flex items-center">
                                <button className={`px-4 flex items-center justify-center gap-1.5 py-2 rounded-xl text-white font-bold shadow-sm transition-transform active:scale-95 ${step.actionBox.color}`}>
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

              {/* Visual Aids per section */}
              {activeSection === 'management' && (
                <div className="space-y-3 mt-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">🔄 학생 관리 프로세스</h4>
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-center flex items-center justify-center gap-2">
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg">1. 이름 추가</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 mx-1"/>
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg">2. 부서 할당</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 mx-1"/>
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg">3. 역할복수체크</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 mx-1"/>
                    <span className="bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-lg">4. 업무 부여 완료</span>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManual;
