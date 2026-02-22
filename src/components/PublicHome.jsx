import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Calendar, ClipboardList, Home, Gavel, ScrollText, Menu, X, Search, Briefcase, LogOut } from 'lucide-react';
import { getLocalDateString } from '../utils/dateUtils';
import PetitionBoard from './features/PetitionBoard';
import JudicialSystem from './features/JudicialSystem';
import PhotoFrame from './features/PhotoFrame';
import ClassWiki from './features/ClassWiki';
import MyJob from './features/MyJob';

const PublicHome = () => {
  const { subscribeToTimetable, currentUser, logout } = useAppContext();
  const [timetable, setTimetable] = useState({ periods: Array(6).fill('') });
  const [activeTab, setActiveTab] = useState('home'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const today = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });

  useEffect(() => {
    const dateStr = getLocalDateString();
    const unsubscribe = subscribeToTimetable(dateStr, (data) => {
        setTimetable(data);
    });
    return () => unsubscribe();
  }, []);

  const navItems = [
      { id: 'home', label: '우리반 홈', icon: <Home className="w-5 h-5"/> },
      { id: 'myjob', label: '나의 업무', icon: <Briefcase className="w-5 h-5"/> },
      { id: 'wiki', label: '무엇이든 물어보살', icon: <Search className="w-5 h-5"/> },
      { id: 'petition', label: '국무회의(청원)', icon: <ScrollText className="w-5 h-5"/> },
      { id: 'judicial', label: '솔로몬의 재판소', icon: <Gavel className="w-5 h-5"/> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header & Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="flex justify-between items-center h-16 md:gap-4">
                {/* Logo */}
                <div className="flex items-center gap-2 shrink-0" onClick={() => setActiveTab('home')}>
                    <span className="text-2xl font-black text-indigo-600 cursor-pointer">우리 반 나라</span>
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full hidden sm:inline-block">학생 포털</span>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar mask-linear flex-1 justify-center px-4">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shrink-0 ${activeTab === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* User Info & Mobile Menu Toggle */}
                <div className="flex items-center gap-3 shrink-0">
                    {currentUser && (
                        <div className="hidden sm:flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                             <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">{currentUser.name[0]}</div>
                             <span className="text-sm font-bold text-gray-700">{currentUser.name}</span>
                             <button 
                                onClick={logout}
                                className="p-1.5 bg-white rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                                title="로그아웃"
                            >
                                <LogOut className="w-4 h-4" />
                             </button>
                        </div>
                    )}
                    
                    <button 
                        className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>
        </div>

        {/* Mobile Nav Drawer */}
        {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 bg-white">
                <div className="px-4 py-2 space-y-1">
                     {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                            className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                    <div className="h-px bg-gray-100 my-2" />
                    {currentUser && (
                         <div className="flex items-center justify-between px-4 py-3">
                            <span className="font-bold text-gray-700">{currentUser.name} 님</span>
                            <button onClick={logout} className="text-sm font-bold text-red-500">로그아웃</button>
                         </div>
                    )}
                </div>
            </div>
        )}
      </header>
      
      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 animate-in fade-in duration-300">
        
        {/* HOME TAB */}
        {activeTab === 'home' && (
            <div className="space-y-8">
                {/* 1. Hero Section: Photo Frame */}
                <section>
                    <PhotoFrame />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 2. Left Column: Timetable (2/3 width) */}
                    <div className="lg:col-span-2 space-y-8">
                         {/* Greeting */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-start gap-4">
                            <div>
                                <h1 className="text-3xl font-black text-gray-800 mb-2">오늘도 즐거운 배움! 👋</h1>
                                <p className="text-gray-500 font-medium">{today}</p>
                            </div>
                        </div>

                        {/* Timetable */}
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden">
                            <div className="bg-indigo-50 p-6 border-b border-indigo-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                                    <Calendar className="w-6 h-6 text-indigo-600" />
                                    오늘의 수업
                                </h2>
                            </div>
                            <div className="p-6 md:p-8">
                                <div className="space-y-3">
                                    {timetable?.periods?.map((subject, index) => (
                                        <div key={index} className="flex items-center gap-4 group">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center font-bold text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                {index + 1}
                                            </div>
                                            <div className={`flex-1 p-4 rounded-2xl font-bold text-lg border transition-all ${subject ? 'bg-white border-gray-200 text-gray-800 shadow-sm' : 'bg-gray-50 border-transparent text-gray-400 italic'}`}>
                                                {subject || '수업 없음'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Right Column: Notices (1/3 width) */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden h-full min-h-[400px] flex flex-col">
                             <div className="bg-orange-50 p-6 border-b border-orange-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-orange-900 flex items-center gap-2">
                                    <ClipboardList className="w-6 h-6 text-orange-600" />
                                    알림장
                                </h2>
                            </div>
                            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-2 animate-bounce">
                                    <img src="https://em-content.zobj.net/source/microsoft-teams/363/party-popper_1f389.png" alt="Party" className="w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">등록된 알림이 없어요</h3>
                                    <p className="text-gray-500 mt-2 text-sm leading-relaxed">선생님이 아직 내용을 올리지 않으셨네요.<br/>오늘도 행복한 하루 보내세요!</p>
                                </div>
                            </div>
                             <div className="bg-gray-50 p-4 border-t border-gray-100 text-center text-xs text-gray-400 font-medium">
                                학생 개별 역할은 '나의 업무' 탭에서 확인하세요
                             </div>
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
            <div className="max-w-2xl mx-auto">
                <JudicialSystem />
            </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 relative z-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
             <p className="text-gray-400 text-sm font-medium">© 2026 우리 반 나라 - 학급 경영 시스템</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicHome;
