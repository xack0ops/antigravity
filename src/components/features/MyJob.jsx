import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Info, Circle, CheckCircle2, Clock, X, BellRing, Send } from 'lucide-react';

const MyJob = ({ onNavigate }) => {
    const { currentUser, tasks, roles, ministries, toggleTask, addTeacherMessage } = useAppContext();
    const [showPopup, setShowPopup] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [messageSending, setMessageSending] = useState(false);

    if (!currentUser) return null;

    const myMinistry = ministries.find(m => m.id === currentUser.ministryId);
    const myRoles = roles.filter(r => currentUser.roleIds?.includes(r.id));
    const roleColor = myMinistry ? myMinistry.color : 'border-gray-200 bg-gray-50';
    
    const myTasks = tasks.filter(t => {
        if (!currentUser.roleIds?.includes(t.roleId)) return false;
        const freq = t.frequency || { type: 'daily', days: [] };
        if (freq.type === 'specific_days') {
            // 8시간을 빼서 오전 8시를 기준으로 요일이 변경되도록 설정
            const resetBoundaryDate = new Date(Date.now() - (8 * 60 * 60 * 1000));
            const todayDay = resetBoundaryDate.getDay();
            return freq.days.includes(todayDay);
        }
        return true;
    });

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

    if (myRoles.length === 0) return (
        <div className="text-center py-12">
            <h2 className="text-xl font-bold text-gray-800">아직 역할이 없습니다.</h2>
            <p className="text-gray-500">선생님께 역할을 배정해달라고 말씀드리세요.</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Role Card */}
            <div className={`rounded-2xl p-6 md:p-8 border ${roleColor} relative overflow-hidden transition-all shadow-sm bg-white`}>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Info size={100} />
                </div>
                <div className="relative z-0">
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                        <span className="text-xs font-bold uppercase tracking-wider border border-current px-2 py-0.5 rounded-full">
                            {myMinistry?.name || '소속 없음'}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black mb-3 text-gray-800">{myRoles.map(r=>r.name).join(' & ')}</h1>
                    <div className="space-y-1 mb-4">
                        {myRoles.map(r => (
                            <p key={r.id} className="text-base md:text-lg font-medium text-gray-600"><span className="font-bold">[{r.name}]</span> {r.description}</p>
                        ))}
                    </div>
                    
                    <button 
                        onClick={() => setShowPopup(true)} 
                        className="inline-flex items-center gap-1 text-sm font-bold underline opacity-80 hover:opacity-100 text-gray-700 py-2"
                    >
                        나의 임무 다시보기
                    </button>
                </div>
            </div>

            {/* Task List */}
            <div>
                <div className="flex flex-col gap-3 mb-5">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800">오늘의 할 일</h3>
                    <button
                        onClick={() => setShowMessageModal(true)}
                        className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-white px-4 py-4 rounded-2xl font-bold text-base transition-all shadow-md w-full"
                    >
                        <BellRing className="w-5 h-5" />
                        선생님께 꼭 전달할 말이 있어요 🔔
                    </button>
                </div>
                <div className="space-y-3">
                    {myTasks.length === 0 ? (
                        <div className="p-8 text-center bg-white rounded-xl border border-dashed border-gray-200 text-gray-400">
                            <p>부여된 업무가 없습니다. 자유시간!</p>
                        </div>
                    ) : (
                        myTasks.map(task => (
                        <TaskItem 
                            key={task.id} 
                            task={task} 
                            toggleTask={toggleTask} 
                            onNavigate={onNavigate}
                        />
                        ))
                    )}
                </div>
            </div>

            {/* Teacher Message Modal */}
            {showMessageModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
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
                                선생님이 돌아오셨을 때 꼭 알고 계셔야 할 중요한 내용을 남겨주세요.<br />
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

             {/* Role Onboarding Popup */}
            {showPopup && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl transform transition-all scale-100">
                        <button 
                            onClick={() => setShowPopup(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={24} />
                        </button>
                        
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${roleColor} bg-opacity-20`}>
                            <Info className="w-8 h-8 opacity-80" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-2">반가워요! 👋</h2>
                        <p className="text-gray-600 mb-6">
                            오늘의 역할은 <span className="font-bold text-indigo-600">{myRoles.map(r=>r.name).join(', ')}</span> 입니다.
                        </p>

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

                        <button 
                            onClick={() => setShowPopup(false)}
                            className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg"
                        >
                            확인했습니다!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const TaskItem = ({ task, toggleTask, onNavigate }) => {
    const isCompleted = task.status === 'completed' || task.status === 'verified';
    const isPending = task.status === 'waiting_approval';
    const isAdminTask = task.type === 'admin';
  
    let borderClass = "border-gray-200";
    let bgClass = "bg-white";
    let icon = <Circle className="w-6 h-6 text-gray-300" />;
    let textClass = "text-gray-800";
  
    if (isCompleted) {
      borderClass = "border-green-200";
      bgClass = "bg-green-50";
      icon = <CheckCircle2 className="w-6 h-6 text-green-500" />;
      textClass = "text-gray-400 line-through";
    } else if (isPending) {
      borderClass = "border-yellow-200";
      bgClass = "bg-yellow-50";
      icon = <Clock className="w-6 h-6 text-yellow-500 animate-pulse" />;
    }
  
    const handleClick = () => {
      if (isCompleted) return;
      toggleTask(task.id);
    };
  
    const showAction = task.action || ['t3', 't10', 't11'].includes(task.id);

    return (
      <div 
        className={`
          flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200
          ${borderClass} ${bgClass}
          ${!isCompleted ? 'hover:shadow-md hover:border-blue-300 active:scale-[0.99]' : ''}
        `}
      >
        <div onClick={!isCompleted ? handleClick : undefined} className="shrink-0 cursor-pointer p-1">
          {isCompleted
            ? <CheckCircle2 className="w-8 h-8 text-green-500" />
            : isPending
              ? <Clock className="w-8 h-8 text-yellow-500 animate-pulse" />
              : <Circle className="w-8 h-8 text-gray-300" />}
        </div>
        <div className="flex-1">
          <p onClick={!isCompleted ? handleClick : undefined} className={`font-bold text-lg md:text-xl ${textClass} cursor-pointer leading-snug`}>
            {task.text}
          </p>
          
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

               {showAction && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onNavigate) {
                            if (task.action === 'open_judicial' || ['t3', 't10', 't11'].includes(task.id)) {
                                onNavigate('judicial');
                            }
                        }
                    }}
                    className="bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm ml-auto animate-pulse hover:animate-none"
                    title="업무 도구 열기"
                >
                    실행하기 →
                </button>
              )}
          </div>
        </div>
      </div>
    );
};

export default MyJob;
