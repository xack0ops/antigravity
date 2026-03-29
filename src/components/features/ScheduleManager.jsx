import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { getLocalDateString } from '../../utils/dateUtils';
import TimetableEditor from '../TimetableEditor';
import { 
    Calendar as CalendarIcon, 
    ChevronLeft, 
    ChevronRight, 
    RotateCcw, 
    Trash2, 
    Info, 
    Plus,
    CalendarDays,
    LayoutGrid,
    Clock,
    X
} from 'lucide-react';

const ScheduleManager = ({ isReadOnly = false, onClose }) => {
    const { fetchTimetable, currentTimetable, saveTimetable, deleteTimetableOverride, fetchAllTimetables } = useAppContext();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('monthly'); // 'daily' | 'monthly'
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [allTimetables, setAllTimetables] = useState([]);
    
    // Daily View States
    const [editPeriods, setEditPeriods] = useState(Array(6).fill(''));
    const [editEvents, setEditEvents] = useState([]);
    const [newEventText, setNewEventText] = useState('');
    const [isModified, setIsModified] = useState(false);
    const lastSyncedTimetableRef = useRef(null);

    // Initial fetch of all timetables
    const loadAllData = async () => {
        const data = await fetchAllTimetables();
        setAllTimetables(data);
    };

    useEffect(() => {
        loadAllData();
    }, [calendarDate]);

    // Fetch on date change
    useEffect(() => {
        const dateStr = getLocalDateString(selectedDate);
        // Clear local state immediately to prevent stale data UI
        setEditPeriods(Array(6).fill(''));
        setEditEvents([]);
        setIsModified(false);
        
        fetchTimetable(dateStr);
    }, [selectedDate, fetchTimetable]);

    // Sync state when currentTimetable changes (fetching specific date)
    useEffect(() => {
        const dateStr = getLocalDateString(selectedDate);
        
        // ONLY sync if:
        // 1. the date matches the selected date
        // 2. and we haven't already synced this specific timetable object
        if (currentTimetable && 
            currentTimetable.date === dateStr && 
            currentTimetable !== lastSyncedTimetableRef.current) {
            
            setEditPeriods(currentTimetable.periods || Array(6).fill(''));
            setEditEvents(currentTimetable.events || []);
            setIsModified(!currentTimetable.isDefault);
            
            // Mark as synced
            lastSyncedTimetableRef.current = currentTimetable;
        }
    }, [currentTimetable, selectedDate]);

    const handleSave = async (periods) => {
        if (!window.confirm('일정을 저장하시겠습니까?')) return;
        const dateStr = getLocalDateString(selectedDate);
        await saveTimetable(dateStr, periods, editEvents);
        await loadAllData();
        alert('일정이 저장되었습니다.');
    };

    const addEvent = () => {
        const text = newEventText.trim();
        if (!text) return;
        setEditEvents([...editEvents, text]);
        setNewEventText('');
    };

    const removeEvent = (index) => {
        setEditEvents(editEvents.filter((_, i) => i !== index));
    };

    const handleReset = async () => {
        if (!window.confirm('이 날짜의 개별 일정을 삭제하고 기본 시간표로 되돌리시겠습니까?')) return;
        const dateStr = getLocalDateString(selectedDate);
        await deleteTimetableOverride(dateStr);
        fetchTimetable(dateStr);
        await loadAllData();
        alert('기본 시간표로 복구되었습니다.');
    };

    const changeDate = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + days);
        setSelectedDate(newDate);
    };

    const changeMonth = (months) => {
        const newDate = new Date(calendarDate);
        newDate.setMonth(calendarDate.getMonth() + months);
        setCalendarDate(newDate);
    };

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6;

    // Helper to format date for display
    const formatDate = (date, options) => date.toLocaleDateString('ko-KR', options);

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-2xl shadow-indigo-900/5 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-indigo-200">
                        <CalendarIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                            {isReadOnly ? '학급 일정표' : '일정 관리자'}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-sm text-gray-400 font-bold">
                                {isReadOnly ? '선생님이 등록한 최신 일정을 보여줍니다.' : '실시간 학급 일정 동기화 중'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex p-1.5 bg-gray-100/80 rounded-2xl border border-gray-200">
                        <button 
                            onClick={() => setViewMode('monthly')}
                            className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl text-sm font-black transition-all ${viewMode === 'monthly' ? 'bg-white text-indigo-600 shadow-sm transform scale-105' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                            <span className="hidden sm:inline">월별 보기</span>
                            <span className="sm:hidden">월</span>
                        </button>
                        <button 
                            onClick={() => setViewMode('daily')}
                            className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl text-sm font-black transition-all ${viewMode === 'daily' ? 'bg-white text-indigo-600 shadow-sm transform scale-105' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Clock className="w-4 h-4" />
                            <span className="hidden sm:inline">일별 상세보기</span>
                            <span className="sm:hidden">일</span>
                        </button>
                    </div>
                    
                    {onClose && (
                        <button 
                            onClick={onClose}
                            className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-2xl transition-colors border border-gray-200"
                            title="닫기"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>

            {viewMode === 'monthly' ? (
                /* MONTHLY VIEW */
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl shadow-indigo-900/5 space-y-8">
                    {/* Month Navigator */}
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                            <h3 className="text-3xl font-black text-gray-800">
                                {formatDate(calendarDate, { year: 'numeric', month: 'long' })}
                            </h3>
                            <button 
                                onClick={() => setCalendarDate(new Date())}
                                className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-black rounded-full hover:bg-indigo-100 transition-colors"
                            >
                                오늘로 가기
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-gray-100 rounded-2xl border border-gray-100 transition-all active:scale-90">
                                <ChevronLeft className="w-6 h-6 text-gray-600" />
                            </button>
                            <button onClick={() => changeMonth(1)} className="p-3 hover:bg-gray-100 rounded-2xl border border-gray-100 transition-all active:scale-90">
                                <ChevronRight className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-3">
                        {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                            <div key={day} className={`text-center py-4 text-xs font-black tracking-widest ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
                                {day}
                            </div>
                        ))}
                        
                        {(() => {
                            const year = calendarDate.getFullYear();
                            const month = calendarDate.getMonth();
                            const daysInMonth = getDaysInMonth(year, month);
                            const firstDay = getFirstDayOfMonth(year, month);
                            const cells = [];
                            
                            for (let i = 0; i < firstDay; i++) {
                                cells.push(<div key={`empty-${i}`} className="h-28 md:h-36 bg-gray-50/50 rounded-3xl" />);
                            }
                            
                            for (let d = 1; d <= daysInMonth; d++) {
                                const date = new Date(year, month, d);
                                const dateStr = getLocalDateString(date);
                                const isToday = dateStr === getLocalDateString(new Date());
                                const schedule = allTimetables.find(t => t.id === dateStr);
                                const hasOverride = schedule && !schedule.isDefault;
                                const events = schedule?.events || [];
                                const dayOfWeek = date.getDay();

                                cells.push(
                                    <div 
                                        key={d} 
                                        onClick={() => {
                                            setSelectedDate(date);
                                            setViewMode('daily');
                                        }}
                                        className={`
                                            h-28 md:h-36 p-4 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden
                                            ${isToday ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 border-indigo-500 scale-105 z-10' : 'bg-white border-gray-100 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1'}
                                        `}
                                    >
                                        <div className="flex justify-between items-start relative z-10">
                                            <span className={`text-lg font-black ${isToday ? 'text-white' : dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : 'text-gray-800'}`}>
                                                {d}
                                            </span>
                                            {hasOverride && (
                                                <div className={`w-2 h-2 rounded-full ${isToday ? 'bg-white' : 'bg-amber-400'} animate-pulse shadow-sm`} />
                                            )}
                                        </div>
                                        
                                        <div className="mt-3 space-y-1.5 relative z-10">
                                            {events.slice(0, 2).map((evt, idx) => (
                                                <div key={idx} className={`text-[10px] md:text-xs font-bold px-2 py-1 rounded-lg truncate ${isToday ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'}`}>
                                                    {evt}
                                                </div>
                                            ))}
                                            {events.length > 2 && (
                                                <div className={`text-[9px] font-bold px-1 ${isToday ? 'text-white/70' : 'text-gray-400'}`}>
                                                    + {events.length - 2}
                                                </div>
                                            )}
                                            {hasOverride && events.length === 0 && (
                                                <div className={`text-[9px] md:text-[10px] font-black truncate flex items-center gap-1 ${isToday ? 'text-white' : 'text-emerald-600'}`}>
                                                    <RotateCcw className="w-3 h-3" />
                                                    특별 일정
                                                </div>
                                            )}
                                        </div>

                                        {/* Background Decoration */}
                                        {!isToday && isWeekend(date) && (
                                            <div className="absolute bottom-0 right-0 p-2 opacity-[0.03] select-none pointer-events-none">
                                                <span className="text-4xl font-black">OFF</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            
                            const total = firstDay + daysInMonth;
                            const remaining = (Math.ceil(total / 7) * 7) - total;
                            for (let i = 0; i < remaining; i++) {
                                cells.push(<div key={`empty-end-${i}`} className="h-28 md:h-36 bg-gray-50/50 rounded-3xl" />);
                            }

                            return cells;
                        })()}
                    </div>
                </div>
            ) : (
                /* DAILY VIEW */
                <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
                    {/* Daily Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                        <div className="flex items-center gap-6">
                            <button onClick={() => changeDate(-1)} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-90">
                                <ChevronLeft className="w-6 h-6 text-gray-400" />
                            </button>
                            <div className="text-center min-w-[200px]">
                                <h3 className="text-4xl font-black text-gray-800 tracking-tighter">
                                    {formatDate(selectedDate, { month: 'long', day: 'numeric' })}
                                </h3>
                                <div className={`inline-block mt-2 px-4 py-1 rounded-full text-sm font-black uppercase tracking-widest ${isWeekend(selectedDate) ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-600'}`}>
                                    {formatDate(selectedDate, { weekday: 'long' })}
                                </div>
                            </div>
                            <button onClick={() => changeDate(1)} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-90">
                                <ChevronRight className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        
                        {isModified && !isReadOnly && (
                            <button 
                                onClick={handleReset}
                                className="flex items-center gap-2 px-6 py-3.5 bg-red-50 text-red-600 rounded-2xl text-sm font-black hover:bg-red-100 transition-all shadow-sm group"
                            >
                                <Trash2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                기본 일정으로 초기화
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Event Manager Panel */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl shadow-indigo-900/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-all duration-700"></div>
                                
                                <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3 relative z-10">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                        <CalendarDays className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    특별 일정 & 행사
                                </h3>

                                <div className="space-y-4 relative z-10">
                                    {!isReadOnly && (
                                        <div className="bg-gray-50 rounded-[1.5rem] p-2 border border-gray-100 transition-all focus-within:ring-4 focus-within:ring-indigo-100">
                                            <input 
                                                type="text"
                                                value={newEventText}
                                                onChange={(e) => setNewEventText(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && addEvent()}
                                                placeholder="예: 현장체험학습, 개교기념일"
                                                className="w-full px-4 py-3 bg-transparent outline-none text-sm font-bold placeholder:text-gray-300"
                                            />
                                            <button 
                                                onClick={addEvent}
                                                className="w-full mt-2 py-3.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                일정 추가
                                            </button>
                                        </div>
                                    )}

                                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                        {editEvents.length === 0 ? (
                                            <div className="text-center py-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                                                <CalendarDays className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                                                <p className="text-xs font-bold text-gray-400">등록된 행사가 없습니다.</p>
                                            </div>
                                        ) : (
                                            editEvents.map((event, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl group/item hover:border-indigo-200 transition-all shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-indigo-400 group-hover/item:scale-150 transition-transform"></div>
                                                        <span className="text-sm font-black text-gray-700">{event}</span>
                                                    </div>
                                                    {!isReadOnly && (
                                                        <button 
                                                            onClick={() => removeEvent(idx)}
                                                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover/item:opacity-100"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {!isReadOnly && (
                                <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-600/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-all duration-700"></div>
                                    <h3 className="text-lg font-black mb-6 flex items-center gap-3 relative z-10">
                                        <Info className="w-5 h-5 text-indigo-400" />
                                        관리 도움말
                                    </h3>
                                    <ul className="space-y-4 text-xs font-bold text-gray-400 relative z-10">
                                        <li className="flex gap-3">
                                            <span className="text-indigo-400 shrink-0">01</span>
                                            <p className="leading-relaxed">달력에서 날짜를 클릭하면 해당일의 상세 일정 수정 화면으로 전환됩니다.</p>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="text-indigo-400 shrink-0">02</span>
                                            <p className="leading-relaxed">내용을 수정한 후 반드시 <span className="text-indigo-100">[전체 일정 저장]</span> 버튼을 눌러야 반영됩니다.</p>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="text-indigo-400 shrink-0">03</span>
                                            <p className="leading-relaxed">주말은 자동으로 공백 처리되나, 필요한 경우 수업을 수동으로 입력할 수 있습니다.</p>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Timetable Editor Panel */}
                        <div className="lg:col-span-8">
                            <div className="bg-white rounded-[2.5rem] p-4 md:p-8 border border-gray-100 shadow-2xl shadow-indigo-900/5 min-h-[600px]">
                                <div className="flex items-center gap-3 mb-8 px-4">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                        <LayoutGrid className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-800">
                                        {isReadOnly ? '상세 시간표' : '시간표 교정기'}
                                    </h3>
                                </div>
                                {isReadOnly ? (
                                    <div className="space-y-4 px-4">
                                        {editPeriods.map((subject, idx) => (
                                            <div key={idx} className="flex items-center gap-6 group">
                                                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center font-black text-gray-400 text-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <div className={`flex-1 px-6 py-5 rounded-[1.25rem] font-black text-lg border transition-all ${subject ? 'bg-white border-gray-100 text-gray-800 shadow-sm' : 'bg-gray-50/50 border-transparent text-gray-400 italic font-bold'}`}>
                                                    {subject || '수업 없음'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <TimetableEditor 
                                        key={getLocalDateString(selectedDate)}
                                        initialPeriods={editPeriods}
                                        onSave={handleSave}
                                        onCancel={() => {}} 
                                        className="p-0 border-0 shadow-none"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleManager;
