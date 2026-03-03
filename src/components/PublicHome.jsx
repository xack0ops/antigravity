import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Calendar, ClipboardList, Home, Gavel, ScrollText, Search, Briefcase, LogOut, KeyRound, X, Star, ShoppingBag } from 'lucide-react';
import { getLocalDateString } from '../utils/dateUtils';
import PetitionBoard from './features/PetitionBoard';
import JudicialSystem from './features/JudicialSystem';
import ClassWiki from './features/ClassWiki';
import MyJob from './features/MyJob';

const PublicHome = () => {
  const { subscribeToTimetable, currentUser, logout, updatePassword, scoreShop, getUserScoreSummary, addScoreTransaction } = useAppContext();
  const [timetable, setTimetable] = useState({ periods: Array(6).fill('') });
  const [activeTab, setActiveTab] = useState('home');
  const today = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  const openPasswordModal = () => {
    setShowPasswordModal(true);
    setPwCurrent(''); setPwNew(''); setPwConfirm('');
    setPwError(''); setPwSuccess(false);
  };

  const [showScoreShop, setShowScoreShop] = useState(false);
  const [spendingItem, setSpendingItem] = useState(null);
  const [spendSuccess, setSpendSuccess] = useState(false);

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

  const navItems = [
    { id: 'home',     label: '홈',          icon: <Home     className="w-6 h-6"/> },
    { id: 'myjob',   label: '나의 업무',    icon: <Briefcase className="w-6 h-6"/> },
    { id: 'wiki',    label: '물어보살',     icon: <Search   className="w-6 h-6"/> },
    { id: 'petition',label: '국무회의',     icon: <ScrollText className="w-6 h-6"/> },
    { id: 'judicial',label: '재판소',       icon: <Gavel    className="w-6 h-6"/> },
  ];

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
              <span className="text-xl font-black text-indigo-600">🏫 우리 반 나라</span>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full hidden sm:inline-block">
                학생 포털
              </span>
            </div>

            {/* User Info */}
            {currentUser && (
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-black text-indigo-600">
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
            <div className="bg-white rounded-3xl px-7 py-6 border border-gray-100 shadow-sm">
              <h1 className="text-2xl md:text-3xl font-black text-gray-800 mb-1">오늘도 즐거운 배움! 👋</h1>
              <p className="text-gray-500 font-medium">{today}</p>
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
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-2 animate-bounce">
                    <img
                      src="https://em-content.zobj.net/source/microsoft-teams/363/party-popper_1f389.png"
                      alt="Party"
                      className="w-10 h-10"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">등록된 알림이 없어요</h3>
                    <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                      선생님이 아직 내용을 올리지 않으셨네요.<br />오늘도 행복한 하루 보내세요!
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-center text-xs text-gray-400 font-medium">
                  학생 개별 역할은 '나의 업무' 탭에서 확인하세요
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

        {/* PETITION TAB */}
        {activeTab === 'petition' && (
          <div className="max-w-3xl mx-auto">
            <PetitionBoard />
          </div>
        )}

        {/* JUDICIAL TAB */}
        {activeTab === 'judicial' && (
          <div className="max-w-3xl mx-auto">
            <JudicialSystem />
          </div>
        )}

      </main>

      {/* =============== 하단 탭 내비게이션 (태블릿 최적화) =============== */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
        <div className="flex w-full max-w-5xl mx-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
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

    </div>
  );
};

export default PublicHome;
