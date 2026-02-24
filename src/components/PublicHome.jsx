import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Calendar, ClipboardList, Home, Gavel, ScrollText, Search, Briefcase, LogOut } from 'lucide-react';
import { getLocalDateString } from '../utils/dateUtils';
import PetitionBoard from './features/PetitionBoard';
import JudicialSystem from './features/JudicialSystem';
import ClassWiki from './features/ClassWiki';
import MyJob from './features/MyJob';

const PublicHome = () => {
  const { subscribeToTimetable, currentUser, logout } = useAppContext();
  const [timetable, setTimetable] = useState({ periods: Array(6).fill('') });
  const [activeTab, setActiveTab] = useState('home');
  const today = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });

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

    </div>
  );
};

export default PublicHome;
