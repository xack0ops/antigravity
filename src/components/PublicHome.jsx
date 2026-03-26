import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Calendar, ClipboardList, Home, Gavel, ScrollText, Search, Briefcase, LogOut, KeyRound, X, Star, ShoppingBag, History, AlertCircle, BellRing, BookOpen, Users } from 'lucide-react';
import { getLocalDateString } from '../utils/dateUtils';
import { subscribeToCollection } from '../utils/firebaseUtils';
import StateCouncil from './features/StateCouncil';
import JudicialSystem from './features/JudicialSystem';
import ClassWiki from './features/ClassWiki';
import MyJob from './features/MyJob';
import FleaMarket from './features/FleaMarket';
import UserManual from './features/UserManual';

const PublicHome = () => {
  const { subscribeToTimetable, currentUser, logout, updatePassword, scoreShop, getUserScoreSummary, addScoreTransaction, originalAdminId, stopImpersonating, studentNotices, markNoticeRead, ministries, users } = useAppContext();
  const [timetable, setTimetable] = useState({ periods: Array(6).fill('') });
  const [activeTab, setActiveTab] = useState('home');
  const [subTab, setSubTab] = useState(null);
  const today = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });

  // Notifications State
  const [activeSurveys, setActiveSurveys] = useState([]);
  const [activeAssignments, setActiveAssignments] = useState([]);
  const [activePetitions, setActivePetitions] = useState([]);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [showUserManual, setShowUserManual] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);

  const openPasswordModal = () => {
    setShowPasswordModal(true);
    setPwCurrent(''); setPwNew(''); setPwConfirm('');
    setPwError(''); setPwSuccess(false);
  };

  const [showScoreShop, setShowScoreShop] = useState(false);
  const [spendingItem, setSpendingItem] = useState(null);
  const [spendSuccess, setSpendSuccess] = useState(false);

  const [showScoreHistory, setShowScoreHistory] = useState(false);

  const scoreSummary = currentUser ? getUserScoreSummary(currentUser.id) : { currentScore: 0, accumulatedScore: 0, creditGrade: 0 };

  const getCreditColor = (grade) => {
    if (grade >= 10) return { bg: 'bg-yellow-100', text: 'text-yellow-700', badge: 'bg-yellow-400 text-yellow-900' };
    if (grade >= 7)  return { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-400 text-emerald-900' };
    if (grade >= 4)  return { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-400 text-blue-900' };
    if (grade >= 1)  return { bg: 'bg-gray-50', text: 'text-gray-600', badge: 'bg-gray-300 text-gray-700' };
    return { bg: 'bg-gray-50', text: 'text-gray-400', badge: 'bg-gray-100 text-gray-400' };
  };

  const handleSpend = async (item) => {
    if (scoreSummary.currentScore < item.cost) {
      alert(`점수가 부족합니다. (현재 ${scoreSummary.currentScore}점 / 필요 ${item.cost}점)`);
      return;
    }
    setSpendingItem(item);
  };

  const confirmSpend = async () => {
    if (!spendingItem) return;
    await addScoreTransaction({
      userId: currentUser.id,
      amount: -spendingItem.cost,
      reason: `사용처: ${spendingItem.name}`,
      isSpend: true,
      grantedBy: currentUser.id,
      grantedByName: currentUser.name,
    });
    setSpendingItem(null);
    setSpendSuccess(true);
    setTimeout(() => setSpendSuccess(false), 2500);
  };

  useEffect(() => {
    const dateStr = getLocalDateString();
    const unsubscribe = subscribeToTimetable(dateStr, (data) => {
      setTimetable(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let unsubSurveys = () => {};
    let unsubAssignments = () => {};
    let unsubPetitions = () => {};

    if (activeTab === 'home' && currentUser) {
      unsubSurveys = subscribeToCollection('surveys', setActiveSurveys);
      unsubAssignments = subscribeToCollection('assignments', setActiveAssignments);
      unsubPetitions = subscribeToCollection('petitions', setActivePetitions);
    }
    
    return () => {
        unsubSurveys();
        unsubAssignments();
        unsubPetitions();
    }
  }, [activeTab, currentUser]);

  const navItems = [
    { id: 'home',     label: '홈',          icon: <Home     className="w-6 h-6"/> },
    { id: 'myjob',   label: '나의 업무',    icon: <Briefcase className="w-6 h-6"/> },
    { id: 'market',  label: '반짝마켓',     icon: <ShoppingBag className="w-6 h-6"/> },
    { id: 'wiki',    label: '물어보살',     icon: <Search   className="w-6 h-6"/> },
    { id: 'petition',label: '국무회의',     icon: <ScrollText className="w-6 h-6"/> },
    { id: 'judicial',label: '재판소',       icon: <Gavel    className="w-6 h-6"/> },
  ];

  // 청원 마지막 확인 시각 helpers (localStorage 사용)
  const getPetitionLastChecked = (userId) => {
    const val = localStorage.getItem(`petitionLastChecked_${userId}`);
    return val ? new Date(val) : null;
  };
  const savePetitionLastChecked = (userId) => {
    localStorage.setItem(`petitionLastChecked_${userId}`, new Date().toISOString());
  };
  const navigateToPetition = (tab = 'petition') => {
    if (currentUser) savePetitionLastChecked(currentUser.id);
    setActiveTab('petition');
    setSubTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">

      {/* Top Header - 간소화 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="w-full px-5 md:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setActiveTab('home')}
            >
              <span className="text-xl font-black text-indigo-600">🏫 63랜드</span>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full hidden sm:inline-block">
                학생 포털
              </span>
            </div>

            {/* User Info */}
            {currentUser && (
              <div className="flex items-center gap-3 bg-gray-50 px-2 sm:px-4 py-2 rounded-full border border-gray-200 w-auto ml-auto">
                {originalAdminId && (
                  <button
                    onClick={stopImpersonating}
                    className="text-[11px] sm:text-xs font-bold bg-amber-100 text-amber-700 px-2 sm:px-3 py-1.5 rounded-full hover:bg-amber-200 transition-colors whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">선생님 계정으로 </span>복귀
                  </button>
                )}
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-black text-indigo-600 shrink-0">
                  {currentUser.name[0]}
                </div>
                <span className="text-sm font-bold text-gray-700 hidden sm:block">{currentUser.name}</span>
                <button
                  onClick={openPasswordModal}
                  className="p-2 bg-white rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm"
                  title="비밀번호 변경"
                >
                  <KeyRound className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowUserManual(true)}
                  className="p-2 bg-white rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm"
                  title="63랜드 설명서"
                >
                  <BookOpen className="w-4 h-4" />
                </button>
                <button
                  onClick={logout}
                  className="p-2 bg-white rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                  title="로그아웃"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content — pb-24 로 하단 탭 바 공간 확보 */}
      <main className="flex-1 w-full mx-auto px-4 md:px-8 pt-6 pb-28 animate-in fade-in duration-300 max-w-5xl">

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Greeting */}
            <div className="bg-white rounded-3xl px-7 py-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-800 mb-1">오늘도 즐거운 배움! 👋</h1>
                <p className="text-gray-500 font-medium">{today}</p>
              </div>
              <button
                onClick={() => setShowDepartmentModal(true)}
                className="flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-5 py-3 rounded-2xl text-sm font-bold transition-colors shrink-0 shadow-sm"
              >
                <Users className="w-5 h-5" />
                <span>현재 부서 현황</span>
              </button>
            </div>

            {/* 점수 카드 */}
            {currentUser && (() => {
              const { currentScore, accumulatedScore, creditGrade } = scoreSummary;
              const cc = getCreditColor(creditGrade);
              return (
                <div className={`${cc.bg} rounded-3xl px-7 py-5 border border-gray-100 shadow-sm`}>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center">
                        <Star className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">생활태도 점수</p>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className={`text-2xl font-black ${currentScore < 0 ? 'text-red-500' : cc.text}`}>{currentScore}점</span>
                          {creditGrade > 0 && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cc.badge}`}>신용등급 {creditGrade}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">누적 <strong className="text-gray-600">{accumulatedScore}점</strong></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowScoreHistory(true)}
                        className="flex items-center gap-2 bg-white/50 hover:bg-white/80 text-gray-700 px-4 py-2.5 rounded-2xl text-sm font-bold transition-colors shadow-sm"
                      >
                        <History className="w-4 h-4" /> 내역 보기
                      </button>
                      {scoreShop.length > 0 && (
                        <button
                          onClick={() => { setShowScoreShop(true); setSpendSuccess(false); }}
                          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-2xl text-sm font-bold transition-colors shadow-sm"
                        >
                          <ShoppingBag className="w-4 h-4" /> 점수 사용하기
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 시간표 + 알림장 — 태블릿에서 2컬럼 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 시간표 */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-indigo-50 px-7 py-5 border-b border-indigo-100 flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-lg font-bold text-indigo-900">오늘의 수업</h2>
                </div>
                <div className="px-7 py-5 space-y-3">
                  {timetable?.periods?.map((subject, index) => (
                    <div key={index} className="flex items-center gap-4 group">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center font-black text-gray-400 text-sm group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors shrink-0">
                        {index + 1}
                      </div>
                      <div className={`flex-1 px-4 py-3 md:py-4 rounded-2xl font-bold text-base border transition-all ${subject ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-gray-50 border-transparent text-gray-400 italic'}`}>
                        {subject || '수업 없음'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 알림장 */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="bg-orange-50 px-7 py-5 border-b border-orange-100 flex items-center gap-3">
                  <ClipboardList className="w-6 h-6 text-orange-600" />
                  <h2 className="text-lg font-bold text-orange-900">알림장</h2>
                </div>
                <div className="flex-1 flex flex-col p-6 space-y-4 overflow-y-auto">
                  {/* Calculate Pending Items */}
                  {(() => {
                    const unsubmittedAssignments = activeAssignments.filter(assignment => 
                      !assignment.submittedUsers?.includes(currentUser?.id)
                    );
                    const unvotedSurveys = activeSurveys.filter(survey =>
                      !survey.votedUsers?.includes(currentUser?.id)
                    );
                    const newPetitions = activePetitions.filter(petition => {
                      if (petition.agreedUsers?.includes(currentUser?.id)) return false;
                      if (petition.agreeCount >= 10) return false;
                      const lastChecked = currentUser ? getPetitionLastChecked(currentUser.id) : null;
                      if (!lastChecked) return true;
                      const created = petition.createdAt?.toDate ? petition.createdAt.toDate() : (petition.createdAt ? new Date(petition.createdAt) : null);
                      return created ? created > lastChecked : false;
                    });
                    const unreadNotices = (studentNotices || []).filter(n =>
                      n.recipientIds?.includes(currentUser?.id) && !n.readBy?.includes(currentUser?.id)
                    );
                    
                    const hasNotifications = unsubmittedAssignments.length > 0 || unvotedSurveys.length > 0 || newPetitions.length > 0 || unreadNotices.length > 0;

                    if (!hasNotifications) {
                      return (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                            <img
                              src="https://em-content.zobj.net/source/microsoft-teams/363/party-popper_1f389.png"
                              alt="Party"
                              className="w-10 h-10"
                            />
                          </div>
                          <h3 className="text-lg font-bold text-gray-800">등록된 알림이 없어요</h3>
                          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                            해야 할 과제나 참여할 설문조사가 없습니다.<br />오늘도 행복한 하루 보내세요!
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {unsubmittedAssignments.map(assignment => (
                          <div 
                            key={assignment.id} 
                            onClick={() => setActiveTab('myjob')}
                            className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3 cursor-pointer hover:bg-blue-100 transition-colors"
                          >
                            <div className="bg-blue-200 text-blue-700 p-2 rounded-xl shrink-0">
                              <ClipboardList className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-blue-600 bg-blue-100/50 px-2 py-0.5 rounded-full">과제/수행평가</span>
                                <h4 className="font-bold text-gray-800 text-sm">{assignment.title}</h4>
                              </div>
                              <p className="text-xs text-gray-500">클릭하여 [나의 업무] 탭으로 이동 후 제출 확인</p>
                            </div>
                          </div>
                        ))}
                        
                        {unvotedSurveys.map(survey => (
                          <div 
                            key={survey.id} 
                            onClick={() => {
                              setActiveTab('petition');
                              setSubTab('survey');
                            }}
                            className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-start gap-3 cursor-pointer hover:bg-indigo-100 transition-colors"
                          >
                            <div className="bg-indigo-200 text-indigo-700 p-2 rounded-xl shrink-0">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-100/50 px-2 py-0.5 rounded-full">설문조사 ({survey.ministryName})</span>
                                <h4 className="font-bold text-gray-800 text-sm">{survey.title}</h4>
                              </div>
                              <p className="text-xs text-gray-500">클릭하여 [국무회의] 탭으로 이동 후 투표 참여</p>
                            </div>
                          </div>
                        ))}

                        {newPetitions.map(petition => (
                          <div
                            key={petition.id}
                            onClick={() => navigateToPetition('petition')}
                            className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 cursor-pointer hover:bg-red-100 transition-colors"
                          >
                            <div className="bg-red-200 text-red-700 p-2 rounded-xl shrink-0">
                              <ScrollText className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-red-600 bg-red-100/50 px-2 py-0.5 rounded-full">새 청원</span>
                                <h4 className="font-bold text-gray-800 text-sm">{petition.title}</h4>
                              </div>
                              <p className="text-xs text-gray-500">새로운 청원이 올라왔어요! 클릭하여 [국무회의] 탭에서 확인하세요</p>
                            </div>
                          </div>
                        ))}

                        {unreadNotices.map(notice => (
                          <div
                            key={notice.id}
                            onClick={() => markNoticeRead(notice.id, currentUser.id)}
                            className="bg-purple-50 border border-purple-100 p-4 rounded-2xl flex items-start gap-3 cursor-pointer hover:bg-purple-100 transition-colors"
                          >
                            <div className="bg-purple-200 text-purple-700 p-2 rounded-xl shrink-0">
                              <BellRing className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-purple-600 bg-purple-100/50 px-2 py-0.5 rounded-full">📢 선생님 메시지</span>
                              </div>
                              <p className="text-sm font-bold text-gray-800 whitespace-pre-wrap">{notice.content}</p>
                              <p className="text-xs text-gray-400 mt-1">클릭하시면 확인 처리됩니다</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-center text-xs text-gray-400 font-medium">
                  학생 개별 역할은 &apos;나의 업무&apos; 탭에서 확인하세요
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MY JOB TAB */}
        {activeTab === 'myjob' && (
          <div className="max-w-3xl mx-auto">
            <MyJob onNavigate={(tabId) => setActiveTab(tabId)} />
          </div>
        )}

        {/* WIKI TAB */}
        {activeTab === 'wiki' && (
          <div className="max-w-4xl mx-auto">
            <ClassWiki />
          </div>
        )}

        {/* PETITION TAB (State Council) */}
        {activeTab === 'petition' && (
          <div className="max-w-3xl mx-auto">
            <StateCouncil defaultTab={subTab || 'petition'} />
          </div>
        )}

        {/* JUDICIAL TAB */}
        {activeTab === 'judicial' && <JudicialSystem />}

        {/* MARKET TAB */}
        {activeTab === 'market' && <FleaMarket />}
      </main>

      {/* =============== 하단 탭 내비게이션 (태블릿 최적화) =============== */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
        <div className="flex w-full max-w-5xl mx-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'petition') {
                  navigateToPetition();
                } else {
                  setActiveTab(item.id);
                  setSubTab(null);
                }
              }}
              className={`
                flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all select-none
                ${activeTab === item.id
                  ? 'text-indigo-600'
                  : 'text-gray-400 hover:text-gray-600 active:bg-gray-50'}
              `}
            >
              {/* 아이콘 배경 강조 */}
              <div className={`
                flex items-center justify-center w-12 h-8 rounded-2xl transition-all
                ${activeTab === item.id ? 'bg-indigo-100' : ''}
              `}>
                {item.icon}
              </div>
              <span className={`text-xs font-bold leading-none ${activeTab === item.id ? 'text-indigo-600' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Score History Modal */}
      {showScoreHistory && currentUser && (() => {
        const { scoreTransactions } = useAppContext();
        const myTransactions = scoreTransactions
          .filter(t => t.userId === currentUser.id)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 10);

        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl relative">
              <button onClick={() => setShowScoreHistory(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <X size={22} />
              </button>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <History className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">생활태도 점수 내역</h3>
                  <p className="text-sm text-gray-500">최근 10개의 기록만 표시됩니다.</p>
                </div>
              </div>

              <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50 max-h-[60vh] overflow-y-auto">
                {myTransactions.length === 0 ? (
                  <p className="py-10 text-center text-sm text-gray-400">점수 기록이 없습니다.</p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {myTransactions.map(txn => (
                      <div key={txn.id} className="p-4 bg-white hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start gap-4 mb-1">
                          <p className="text-sm font-bold text-gray-800 leading-snug">{txn.reason}</p>
                          <div className={`font-black shrink-0 ${txn.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {txn.amount > 0 ? '+' : ''}{txn.amount}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-400">{new Date(txn.timestamp).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          {txn.isSpend && <span className="text-[10px] bg-purple-100 text-purple-600 font-bold px-1.5 py-0.5 rounded-full">사용됨</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Score Shop Modal */}
      {showScoreShop && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-7 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => { setShowScoreShop(false); setSpendingItem(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={22} />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-amber-100 rounded-2xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">점수 사용하기</h3>
                <p className="text-sm text-gray-500">현재 점수: <strong className="text-indigo-600">{scoreSummary.currentScore}점</strong></p>
              </div>
            </div>

            {spendSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-3 mb-4 text-center text-green-700 font-bold text-sm">
                ✅ 사용이 완료되었습니다!
              </div>
            )}

            {spendingItem ? (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                  <p className="font-bold text-gray-800 text-lg">{spendingItem.name}</p>
                  {spendingItem.description && <p className="text-sm text-gray-500 mt-1">{spendingItem.description}</p>}
                  <p className="text-amber-600 font-black text-2xl mt-2">{spendingItem.cost}점 사용</p>
                </div>
                <p className="text-center text-sm text-gray-500">정말 사용하시겠습니까?</p>
                <div className="flex gap-3">
                  <button onClick={() => setSpendingItem(null)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">취소</button>
                  <button onClick={confirmSpend} className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors">사용하기</button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {scoreShop.map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                      {item.description && <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>}
                    </div>
                    <button
                      onClick={() => handleSpend(item)}
                      disabled={scoreSummary.currentScore < item.cost}
                      className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-colors ${
                        scoreSummary.currentScore >= item.cost
                          ? 'bg-amber-500 text-white hover:bg-amber-600'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {item.cost}점
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl">
            <button onClick={() => setShowPasswordModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">비밀번호 변경</h2>
            </div>

            {pwSuccess ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">✅</div>
                <p className="font-bold text-green-600 text-lg">비밀번호가 변경되었습니다!</p>
                <button onClick={() => setShowPasswordModal(false)} className="mt-6 w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">닫기</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">현재 비밀번호</label>
                  <input
                    type="password"
                    value={pwCurrent}
                    onChange={(e) => { setPwCurrent(e.target.value); setPwError(''); }}
                    placeholder="현재 비밀번호 입력"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">새 비밀번호</label>
                  <input
                    type="password"
                    value={pwNew}
                    onChange={(e) => { setPwNew(e.target.value); setPwError(''); }}
                    placeholder="새 비밀번호 입력"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">새 비밀번호 확인</label>
                  <input
                    type="password"
                    value={pwConfirm}
                    onChange={(e) => { setPwConfirm(e.target.value); setPwError(''); }}
                    placeholder="새 비밀번호 다시 입력"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                  />
                </div>
                {pwError && (
                  <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl text-center">{pwError}</p>
                )}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowPasswordModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">취소</button>
                  <button
                    onClick={async () => {
                      const currentPw = currentUser.password || '1234';
                      if (!pwCurrent) { setPwError('현재 비밀번호를 입력해주세요.'); return; }
                      if (pwCurrent !== currentPw) { setPwError('현재 비밀번호가 틀렸습니다.'); return; }
                      if (!pwNew) { setPwError('새 비밀번호를 입력해주세요.'); return; }
                      if (pwNew.length < 4) { setPwError('비밀번호는 4자 이상이어야 합니다.'); return; }
                      if (pwNew !== pwConfirm) { setPwError('새 비밀번호가 일치하지 않습니다.'); return; }
                      await updatePassword(currentUser.id, pwNew);
                      setPwSuccess(true);
                    }}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                  >
                    변경하기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Department Status Modal */}
      {showDepartmentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-7 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative">
            <button onClick={() => setShowDepartmentModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
            
            <div className="flex items-center gap-3 mb-6 shrink-0">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">현재 부서 현황</h2>
                <p className="text-sm text-gray-500">우리 반 친구들이 어느 부서에서 일하고 있는지 확인해보세요!</p>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 pr-2 space-y-4">
              {(() => {
                const students = users.filter(u => u.type === 'student');
                const unassignedStudents = students.filter(s => !s.ministryId);
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ministries.map(ministry => {
                      const ministryStudents = students.filter(s => s.ministryId === ministry.id);
                      if (ministryStudents.length === 0) return null;
                      
                      return (
                        <div key={ministry.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">{ministry.icon || '🏢'}</span>
                            <h3 className="font-bold text-gray-800">{ministry.name}</h3>
                            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                              {ministryStudents.length}명
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {ministryStudents.map(s => (
                              <span key={s.id} className="bg-white border border-gray-200 text-gray-700 text-sm font-medium px-3 py-1.5 rounded-xl shadow-sm">
                                {s.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {unassignedStudents.length > 0 && (
                      <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">⏳</span>
                          <h3 className="font-bold text-orange-800">미배정 / 구직중</h3>
                          <span className="bg-orange-200 text-orange-800 text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                            {unassignedStudents.length}명
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {unassignedStudents.map(s => (
                            <span key={s.id} className="bg-white border border-orange-200 text-orange-700 text-sm font-medium px-3 py-1.5 rounded-xl shadow-sm">
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {showUserManual && <UserManual onClose={() => setShowUserManual(false)} />}
    </div>
  );
};

export default PublicHome;
