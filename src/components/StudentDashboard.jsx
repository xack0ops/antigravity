import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { INITIAL_DATA } from '../data/mockData';
import { LogOut, Info, Circle, CheckCircle2, Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Edit3, FolderDown, MessageCircleQuestion, X, BellRing, Send, Gavel, KeyRound } from 'lucide-react';
import { getLocalDateString } from '../utils/dateUtils';
import TimetableEditor from './TimetableEditor';
import JudicialSystem from './features/JudicialSystem';

const StudentDashboard = () => {
  const { currentUser, tasks, roles, ministries, toggleTask, logout, currentTimetable, fetchTimetable, saveTimetable, addTeacherMessage, updatePassword } = useAppContext();
  const [showPopup, setShowPopup] = useState(false);
  const [showJudicial, setShowJudicial] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageSending, setMessageSending] = useState(false);
  
  const [studentPassword, setStudentPassword] = useState('');
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Timetable State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isEditingTimetable, setIsEditingTimetable] = useState(false);
  const [editPeriods, setEditPeriods] = useState(Array(6).fill(''));

  useEffect(() => {
    if (currentUser && !localStorage.getItem(`onboarding_${currentUser.id}`)) {
      setShowPopup(true);
      localStorage.setItem(`onboarding_${currentUser.id}`, 'true');
    }
  }, [currentUser]);

  useEffect(() => {
    const dateStr = getLocalDateString(selectedDate);
    fetchTimetable(dateStr);
  }, [selectedDate]);

  useEffect(() => {
    setEditPeriods(currentTimetable?.periods || Array(6).fill(''));
  }, [currentTimetable]);

  if (!currentUser) return <div className="min-h-screen flex items-center justify-center">로그인이 필요합니다.</div>;

  const myMinistry = ministries.find(m => m.id === currentUser.ministryId);
  const myRoles = roles.filter(r => currentUser.roleIds?.includes(r.id));
  const roleColor = myMinistry ? myMinistry.color : 'border-gray-200 bg-gray-50';

  const myTasks = tasks.filter(t => {
      if (!currentUser.roleIds?.includes(t.roleId)) return false;
      const freq = t.frequency || { type: 'daily', days: [] };
      if (freq.type === 'specific_days') {
          // 8시간을 빼서 오전 8시를 기준으로 요일이 변경되도록 설정
          const resetBoundaryDate = new Date(Date.now() - (8 * 60 * 60 * 1000));
          const todayDay = resetBoundaryDate.getDay(); // 0 is Sunday
          return freq.days.includes(todayDay);
      }
      return true; // daily and weekly tasks always show up
  });

  const canAccessJudicial = currentUser.type === 'admin' ||
    myMinistry?.name === '행정안전부' ||
    myRoles.some(r => r.name === '대법원장');

  const handleDateChange = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
    setIsEditingTimetable(false);
  };

  const handleSaveTimetable = async (newPeriods) => {
    const dateStr = getLocalDateString(selectedDate);
    await saveTimetable(dateStr, newPeriods);
    setIsEditingTimetable(false);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    setMessageSending(true);
    try {
      await addTeacherMessage({
        content: messageText.trim(),
        authorId: currentUser.id,
        authorName: currentUser.name,
      });
      setMessageText('');
      setShowMessageModal(false);
      alert('선생님께 전달되었습니다! 선생님이 돌아오시면 확인하실 거예요 😊');
    } finally {
      setMessageSending(false);
    }
  };

  const isEducationMinistry = myMinistry?.id === 'm4';

  if (myRoles.length === 0 && currentUser.type !== 'admin') return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">아직 부서/역할이 없어요!</h2>
        <p className="mb-6 text-gray-600">선생님께 역할을 배정해달라고 말씀드리세요.</p>
        <button onClick={logout} className="px-4 py-2 bg-gray-200 rounded-lg font-bold">로그아웃</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-100 px-6 py-4 md:py-5 md:px-8 flex justify-between items-center sticky top-0 z-10">
        <div className="font-bold text-gray-800 text-lg md:text-xl flex items-center gap-2">
          <span className="text-xl md:text-2xl">🏫</span> 우리 반 나라
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-600 font-bold text-sm md:text-base hidden sm:inline-block">{currentUser.name} {currentUser.type === 'student' ? '학생' : '선생님'}</span>
          
          {isEditingPassword ? (
              <div className="flex items-center gap-1">
                  <input 
                      type="text" 
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="새 비밀번호"
                      className="px-2 py-1.5 border border-indigo-200 rounded-lg text-sm outline-none w-24 md:w-28 h-9 font-medium focus:ring-2 focus:ring-indigo-400"
                  />
                  <button 
                      onClick={() => {
                          if (studentPassword) {
                              updatePassword(currentUser.id, studentPassword);
                              alert('비밀번호가 변경되었습니다!');
                          }
                          setIsEditingPassword(false);
                          setStudentPassword('');
                      }}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 text-sm font-bold rounded-lg h-9 transition-colors"
                  >변경</button>
                  <button onClick={() => setIsEditingPassword(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1.5 text-sm font-bold rounded-lg h-9 transition-colors">취소</button>
              </div>
          ) : (
              <button 
                  onClick={() => setIsEditingPassword(true)}
                  className="flex items-center gap-1 text-gray-500 hover:text-indigo-600 text-xs md:text-sm font-bold bg-gray-100 hover:bg-gray-200 px-2.5 md:px-3 py-2 rounded-lg transition-colors h-9"
                  title="내 수첩 비밀번호 변경"
              >
                  <KeyRound className="w-4 h-4" /> <span className="hidden sm:inline-block">비번 변경</span>
              </button>
          )}

          <button onClick={logout} className="text-gray-500 hover:text-red-500 bg-gray-100 hover:bg-red-50 px-2.5 md:px-3 flex items-center gap-1 py-2 rounded-lg transition-colors h-9 font-bold">
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline-block">로그아웃</span>
          </button>
        </div>
      </nav>

      {showJudicial ? (
        <main className="flex-1 max-w-2xl w-full mx-auto p-4 md:p-6 space-y-6 pb-32">
          <button onClick={() => setShowJudicial(false)} className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-800 mb-4 py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5" /> 돌아가기
          </button>
          <JudicialSystem />
        </main>
      ) : (
        <main className="flex-1 max-w-2xl w-full mx-auto p-4 md:p-6 space-y-6 pb-32">
          {/* Judicial System Card */}
          {canAccessJudicial && (
            <div onClick={() => setShowJudicial(true)} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-slate-400 cursor-pointer group transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                  <Gavel className="w-6 h-6 text-slate-500 group-hover:text-yellow-400 transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">사법 기록부</h3>
                  <p className="text-slate-500 text-sm">상/벌점 및 갈등 사건 기록하기</p>
                </div>
              </div>
            </div>
          )}

          {/* Timetable */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-500" /> 오늘의 배움
              </h3>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button onClick={() => handleDateChange(-1)} className="p-1 hover:bg-white rounded shadow-sm transition-all"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
                <span className="text-sm font-bold text-gray-700 min-w-[100px] text-center">
                  {selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                </span>
                <button onClick={() => handleDateChange(1)} className="p-1 hover:bg-white rounded shadow-sm transition-all"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
              </div>
            </div>
            <div className="space-y-4">
              {isEditingTimetable ? (
                <TimetableEditor initialPeriods={editPeriods} onSave={handleSaveTimetable} onCancel={() => setIsEditingTimetable(false)} />
              ) : (
                <>
                  <div className="grid gap-2">
                    {currentTimetable?.periods && currentTimetable.periods.some(p => p) ? (
                      currentTimetable.periods.map((subject, index) => (
                        <div key={index} className="flex items-center gap-3 group">
                          <div className="w-12 text-center text-xs font-bold text-gray-400 bg-gray-50 py-2 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">{index + 1}교시</div>
                          <div className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${subject ? 'bg-gray-50 text-gray-800' : 'text-gray-400 bg-gray-50/50 italic'}`}>
                            {subject || '(내용 없음)'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <Info className="w-6 h-6 mx-auto mb-1 opacity-50" />
                        <p className="text-sm">아직 작성된 배움 기록이 없어요.</p>
                      </div>
                    )}
                  </div>
                  {isEducationMinistry && (
                    <div className="mt-3 flex justify-end">
                      <button onClick={() => setIsEditingTimetable(true)} className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                        <Edit3 className="w-3 h-3" /> 교육부 수정 권한
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Role Card */}
          <div className={`rounded-2xl p-6 border ${roleColor} relative overflow-hidden transition-all shadow-sm`}>
            <div className="absolute top-0 right-0 p-4 opacity-10"><Info size={100} /></div>
            <div className="relative z-0">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <span className="text-xs font-bold uppercase tracking-wider border border-current px-2 py-0.5 rounded-full">{myMinistry?.name || '소속 없음'}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black mb-3">{myRoles.map(r => r.name).join(' & ')}</h1>
              <div className="space-y-1 mb-4">
                 {myRoles.map(r => (
                     <p key={r.id} className="text-sm md:text-base font-medium opacity-90"><span className="font-bold">[{r.name}]</span> {r.description}</p>
                 ))}
              </div>
              <button onClick={() => setShowPopup(true)} className="inline-flex items-center gap-1 text-sm font-bold underline opacity-80 hover:opacity-100">나의 임무 다시보기</button>
            </div>
          </div>

          {/* Task List */}
          <div>
            <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-xl font-bold text-gray-800">오늘의 할 일</h3>
              <button
                onClick={() => setShowMessageModal(true)}
                className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md w-full sm:w-auto justify-center"
              >
                <BellRing className="w-4 h-4 flex-shrink-0" />
                선생님께 꼭 전달할 말이 있어요 🔔
              </button>
            </div>
            <div className="space-y-3 md:space-y-4">
              {myTasks.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-xl border border-dashed border-gray-200 text-gray-400">
                  <p className="text-base">부여된 업무가 없습니다. 자유시간!</p>
                </div>
              ) : (
                myTasks.map(task => (
                  <TaskItem key={task.id} task={task} toggleTask={toggleTask} onAction={(action) => { if (action === 'open_judicial') setShowJudicial(true); }} />
                ))
              )}
            </div>
          </div>
        </main>
      )}

      {/* Floating Buttons */}
      <a href="https://drive.google.com/drive/folders/1bcfiobJCVe5jgupNddCugfMImnwPZh8E?usp=drive_link" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-28 right-5 md:bottom-32 md:right-8 flex items-center gap-2 bg-green-600 active:bg-green-800 hover:bg-green-700 text-white px-5 py-3.5 rounded-full shadow-lg transition-all hover:scale-105 z-40 group">
        <FolderDown className="w-6 h-6" />
        <span className="font-bold">양식 자료실</span>
        <div className="absolute -top-12 right-0 bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">필요한 양식을 다운로드하세요!</div>
      </a>
      <a href="https://notebooklm.google.com/notebook/0d29ee19-3edb-4d83-aaab-924ce33cf291" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-10 right-5 md:bottom-14 md:right-8 flex items-center gap-2 bg-indigo-600 active:bg-indigo-800 hover:bg-indigo-700 text-white px-5 py-3.5 rounded-full shadow-lg transition-all hover:scale-105 z-40 group">
        <MessageCircleQuestion className="w-6 h-6" />
        <span className="font-bold">AI 튜터에게 질문하기</span>
        <div className="absolute -top-12 right-0 bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">궁금한 점을 물어보세요!</div>
      </a>

      {/* Teacher Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-2xl">
            <button onClick={() => { setShowMessageModal(false); setMessageText(''); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <BellRing className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">선생님, 이건 꼭 알고 계셔야 해요!</h2>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-5">
              <p className="text-sm text-amber-800 leading-relaxed">
                🏫 <strong>선생님이 부재중이신가요?</strong><br />
                선생님이 돌아오셨을 때 꼭 알고 계셔야 할 중요한 내용을 여기에 남겨주세요.<br />
                <span className="text-amber-600 text-xs mt-1 block">작성자 이름({currentUser.name})이 함께 전달됩니다.</span>
              </p>
            </div>
            <textarea
              className="w-full border-2 border-gray-200 rounded-2xl p-4 text-base resize-none focus:outline-none focus:border-amber-400 transition-colors h-44"
              placeholder="선생님께 꼭 전달해야 할 내용을 써주세요..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowMessageModal(false); setMessageText(''); }} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">취소</button>
              <button onClick={handleSendMessage} disabled={!messageText.trim() || messageSending}
                className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                {messageSending ? '전달 중...' : '선생님께 전달하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl">
            <button onClick={() => setShowPopup(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${roleColor} bg-opacity-20`}>
              <Info className="w-8 h-8 opacity-80" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">반가워요! 👋</h2>
            <p className="text-gray-600 mb-6">오늘의 역할은 <span className="font-bold text-indigo-600">{myRoles.map(r=>r.name).join(', ')}</span> 입니다.</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left max-h-48 overflow-y-auto">
              <h3 className="font-bold text-gray-700 mb-3 text-sm">나의 주요 업무</h3>
              <div className="space-y-4">
                  {myRoles.map(role => (
                      <div key={role.id}>
                          <h4 className="text-xs font-bold text-indigo-500 mb-1">[{role.name}]</h4>
                          <ul className="space-y-1 text-sm text-gray-600">
                            {role.duties.map((duty, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                                {duty}
                              </li>
                            ))}
                          </ul>
                      </div>
                  ))}
              </div>
            </div>
            <button onClick={() => setShowPopup(false)} className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">확인했습니다!</button>
          </div>
        </div>
      )}

      <div className="text-center py-6 text-gray-400 text-xs mt-auto">
        <p>© 2026 우리 반 나라 · 학급 경영 시스템</p>
        <p className="mt-1 font-mono text-[10px] opacity-50">v1.2 (Updated)</p>
      </div>
    </div>
  );
};

const TaskItem = ({ task, toggleTask, onAction }) => {
  const isCompleted = task.status === 'completed' || task.status === 'verified';
  const isPending = task.status === 'waiting_approval';
  const isAdminTask = task.type === 'admin';

  let borderClass = "border-gray-200", bgClass = "bg-white";
  let icon = <Circle className="w-6 h-6 text-gray-300" />;
  let textClass = "text-gray-800";

  if (isCompleted) {
    borderClass = "border-green-200"; bgClass = "bg-green-50";
    icon = <CheckCircle2 className="w-6 h-6 text-green-500" />;
    textClass = "text-gray-400 line-through";
  } else if (isPending) {
    borderClass = "border-yellow-200"; bgClass = "bg-yellow-50";
    icon = <Clock className="w-6 h-6 text-yellow-500 animate-pulse" />;
  }

  return (
    <div className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 ${borderClass} ${bgClass} ${!isCompleted ? 'hover:shadow-md hover:border-blue-300 active:scale-[0.99]' : ''}`}>
      <div onClick={!isCompleted ? () => toggleTask(task.id) : undefined} className="cursor-pointer shrink-0 p-1">
        {isCompleted
          ? <CheckCircle2 className="w-8 h-8 text-green-500" />
          : isPending
            ? <Clock className="w-8 h-8 text-yellow-500 animate-pulse" />
            : <Circle className="w-8 h-8 text-gray-300" />}
      </div>
      <div className="flex-1">
        <p onClick={!isCompleted ? () => toggleTask(task.id) : undefined} className={`font-bold text-lg md:text-xl ${textClass} cursor-pointer leading-snug`}>{task.text}</p>
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-2">
            {isAdminTask ? (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {isCompleted ? '선생님 확인 완료' : (isPending ? '검사 대기중...' : '선생님 확인 필요')}
              </span>
            ) : (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {isCompleted ? '완료됨' : '스스로 체크'}
              </span>
            )}
          </div>
          {(task.action || task.id === 't3' || task.id === 't11' || task.id === 't10') && (
            <button onClick={(e) => { e.stopPropagation(); onAction(task.action || 'open_judicial'); }}
              className="bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm animate-pulse hover:animate-none ml-auto">
              실행하기 →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
