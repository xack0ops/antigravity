import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import {
  CheckCircle2, XCircle, MinusCircle, Copy, Trash2,
  BarChart2, X, Coins, User,
  ChevronLeft, ChevronRight, Star
} from 'lucide-react';

// ── 상태 설정 ────────────────────────────────────────────────
const STATUS_OPTIONS = {
  submitted: { label: '제출', icon: CheckCircle2, color: 'bg-green-100 text-green-800 border-green-200', iconColor: 'text-green-600' },
  missing:   { label: '미제출', icon: XCircle,    color: 'bg-red-100 text-red-800 border-red-200',       iconColor: 'text-red-500'   },
  absent:    { label: '결석', icon: MinusCircle, color: 'bg-gray-100 text-gray-700 border-gray-200',    iconColor: 'text-gray-500'  },
};

// ── 날짜 헬퍼 ────────────────────────────────────────────────
const toDateStr = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const isWeekend = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return dow === 0 || dow === 6;
};

// ── 메인 컴포넌트 ───────────────────────────────────────────
const LifeNoteManager = () => {
  const { users, currentUser, addScoreTransaction } = useAppContext();
  const students = users.filter(u => u.type === 'student').sort((a, b) => a.name.localeCompare(b.name));

  const [selectedDate, setSelectedDate] = useState(toDateStr());
  const [records, setRecords] = useState({});
  const [fineHistory, setFineHistory] = useState({});
  // dateStr -> Set of userId strings that already received score
  const [scoreGranted, setScoreGranted] = useState({});
  const [lastSaved, setLastSaved] = useState(null);
  const [grantingScore, setGrantingScore] = useState(false);

  const [showStats, setShowStats] = useState(false);
  const [showFines, setShowFines] = useState(false);
  const [detailStudent, setDetailStudent] = useState(null);

  const todayStr = toDateStr();
  const firstOfMonthStr = toDateStr(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [startDate, setStartDate] = useState(firstOfMonthStr);
  const [endDate, setEndDate] = useState(todayStr);

  const [toast, setToast] = useState('');

  // localStorage 로드
  useEffect(() => {
    try {
      const r = localStorage.getItem('lifeNoteRecords');
      const f = localStorage.getItem('lifeNoteFines');
      const g = localStorage.getItem('lifeNoteScoreGranted');
      if (r) setRecords(JSON.parse(r));
      if (f) setFineHistory(JSON.parse(f));
      if (g) {
        // JSON으로 저장 시 Set은 배열로 직렬화
        const parsed = JSON.parse(g);
        const converted = {};
        Object.keys(parsed).forEach(date => { converted[date] = new Set(parsed[date]); });
        setScoreGranted(converted);
      }
    } catch (e) { console.error(e); }
  }, []);

  // localStorage 저장
  useEffect(() => {
    try {
      localStorage.setItem('lifeNoteRecords', JSON.stringify(records));
      localStorage.setItem('lifeNoteFines', JSON.stringify(fineHistory));
      // Set -> 배열로 직렬화
      const serialized = {};
      Object.keys(scoreGranted).forEach(date => { serialized[date] = [...scoreGranted[date]]; });
      localStorage.setItem('lifeNoteScoreGranted', JSON.stringify(serialized));
      setLastSaved(new Date().toLocaleTimeString('ko-KR'));
    } catch (e) { console.error(e); }
  }, [records, fineHistory, scoreGranted]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // 상태 변경
  const setStatus = (studentId, status) => {
    setRecords(prev => ({
      ...prev,
      [selectedDate]: { ...(prev[selectedDate] || {}), [studentId]: status }
    }));
  };

  const setStatusForDate = (dateStr, studentId, status) => {
    setRecords(prev => ({
      ...prev,
      [dateStr]: { ...(prev[dateStr] || {}), [studentId]: status }
    }));
  };

  const getStatus = (studentId) => records[selectedDate]?.[studentId] || 'missing';

  const setAllSubmitted = () => {
    const newDay = {};
    students.forEach(s => { newDay[s.id] = 'submitted'; });
    setRecords(prev => ({ ...prev, [selectedDate]: newDay }));
  };

  const clearDay = () => {
    if (!window.confirm(`${selectedDate} 데이터를 초기화하시겠습니까?`)) return;
    setRecords(prev => { const n = { ...prev }; delete n[selectedDate]; return n; });
  };

  // 날짜 이동
  const shiftDate = (days) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const next = new Date(y, m - 1, d + days);
    setSelectedDate(toDateStr(next));
  };

  // 현재 날짜 점수 받은 학생 Set
  const grantedSet = scoreGranted[selectedDate] || new Set();

  // 제출자 중 아직 점수 안 받은 학생 목록
  const ungrantedSubmitters = students.filter(s => {
    const st = getStatus(s.id);
    return st === 'submitted' && !grantedSet.has(s.id);
  });

  // 점수 부여 함수
  const grantSubmitScores = async () => {
    if (ungrantedSubmitters.length === 0) {
      showToast('이미 모든 제출자에게 점수가 부여되었습니다.');
      return;
    }
    if (!window.confirm(`${selectedDate} 날짜의 제출자 ${ungrantedSubmitters.length}명에게 1점씩 부여하시겠습니까?`)) return;
    setGrantingScore(true);
    try {
      await Promise.all(
        ungrantedSubmitters.map(s =>
          addScoreTransaction({
            userId: s.id,
            amount: 1,
            reason: `인생노트 제출 (${selectedDate})`,
            isSpend: false,
            grantedBy: currentUser.id,
            grantedByName: currentUser.name,
          })
        )
      );
      // 부여된 학생 기록
      setScoreGranted(prev => {
        const prevSet = new Set(prev[selectedDate] || []);
        ungrantedSubmitters.forEach(s => prevSet.add(s.id));
        return { ...prev, [selectedDate]: prevSet };
      });
      showToast(`⭐ ${ungrantedSubmitters.length}명에게 1점씩 부여 완료!`);
    } catch (e) {
      console.error(e);
      showToast('⚠️ 점수 부여 중 오류가 발생했습니다.');
    } finally {
      setGrantingScore(false);
    }
  };

  // 일별 통계
  const dailyStats = () => {
    const rec = records[selectedDate] || {};
    let submitted = 0, missing = 0, absent = 0;
    students.forEach(s => {
      const st = rec[s.id] || 'missing';
      if (st === 'submitted') submitted++;
      else if (st === 'missing') missing++;
      else absent++;
    });
    return { submitted, missing, absent };
  };

  // 보고서 복사
  const copyReport = () => {
    const { submitted, missing, absent } = dailyStats();
    const rec = records[selectedDate] || {};
    const missingNames = students.filter(s => (rec[s.id] || 'missing') === 'missing').map(s => s.name).join(', ');
    const text = `[교육부 알림]\n📅 날짜: ${selectedDate}\n📝 인생노트 점검 결과\n\n- 제출: ${submitted}명\n- 결석: ${absent}명\n- 미제출: ${missing}명\n\n🚨 미제출자: ${missingNames || '없음'}`;
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed'; el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    try { document.execCommand('copy'); showToast('📋 보고서 복사 완료!'); }
    catch { showToast('⚠️ 복사 실패. 직접 드래그하여 복사하세요.'); }
    document.body.removeChild(el);
  };



  // 기간별 통계 계산
  const calcPeriodStats = () => {
    const stats = {};
    students.forEach(s => { stats[s.id] = { id: s.id, name: s.name, submitted: 0, missing: 0, absent: 0 }; });

    Object.keys(records).forEach(dateStr => {
      if (isWeekend(dateStr)) return;
      if (dateStr < startDate || dateStr > endDate) return;

      const dayRec = records[dateStr] || {};
      const isEffective = students.some(s => (dayRec[s.id] || 'missing') !== 'missing');
      if (!isEffective) return;

      students.forEach(s => {
        const st = dayRec[s.id] || 'missing';
        stats[s.id][st]++;
      });
    });

    return Object.values(stats);
  };

  // 학생 상세 내역
  const getDetailHistory = (studentId) => {
    const history = [];
    const [sy, sm, sd] = startDate.split('-').map(Number);
    const [ey, em, ed] = endDate.split('-').map(Number);
    let curr = new Date(sy, sm - 1, sd);
    const endDt = new Date(ey, em - 1, ed);
    while (curr <= endDt) {
      const ds = toDateStr(curr);
      if (!isWeekend(ds)) {
        history.push({ date: ds, status: records[ds]?.[studentId] || 'missing' });
      }
      curr.setDate(curr.getDate() + 1);
    }
    return history.reverse();
  };

  // 벌금 납부
  const payFine = (studentId, amount) => {
    const student = students.find(s => s.id === studentId);
    if (!window.confirm(`${student?.name} 학생의 벌금 ${amount}코인을 납부 처리하시겠습니까?`)) return;
    const entry = { date: toDateStr(), amount, period: `${startDate}~${endDate}` };
    setFineHistory(prev => ({ ...prev, [studentId]: [...(prev[studentId] || []), entry] }));
    showToast('💰 납부 완료!');
  };

  const deleteFine = (studentId, idx) => {
    if (!window.confirm('납부 내역을 삭제하시겠습니까?')) return;
    setFineHistory(prev => ({ ...prev, [studentId]: prev[studentId].filter((_, i) => i !== idx) }));
  };

  const { submitted, missing, absent } = dailyStats();
  const periodStats = calcPeriodStats();

  return (
    <div className="space-y-4 relative">
      {/* 헤더 */}
      <div className="bg-indigo-600 rounded-2xl p-5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">📒 인생노트 점검</h2>
          <p className="text-indigo-200 text-sm mt-0.5">교육부 주관 · 성실한 기록이 훌륭한 시민을 만듭니다.</p>
          {lastSaved && <p className="text-indigo-300 text-xs mt-1">저장됨 ({lastSaved})</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowFines(true)} className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-3 py-2 rounded-xl font-bold text-sm transition-colors">
            <Coins className="w-4 h-4" /> 벌금
          </button>
          <button onClick={() => setShowStats(true)} className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-2 rounded-xl font-bold text-sm transition-colors">
            <BarChart2 className="w-4 h-4" /> 통계
          </button>
          {/* 날짜 선택 */}
          <div className="flex items-center gap-1 bg-indigo-700 rounded-xl px-3 py-2">
            <button onClick={() => shiftDate(-1)} className="text-indigo-300 hover:text-white transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-white font-bold text-sm outline-none cursor-pointer w-32 text-center" />
            <button onClick={() => shiftDate(1)} className="text-indigo-300 hover:text-white transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* 컨트롤 바 */}
      <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3 flex flex-wrap justify-between items-center gap-3">
        <div className="flex gap-2 flex-wrap">
          <button onClick={setAllSubmitted} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-bold transition-colors">전원 제출</button>
          <button onClick={clearDay} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 text-sm rounded-lg font-bold transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> 초기화
          </button>
          {/* 점수 부여 버튼 */}
          <button
            onClick={grantSubmitScores}
            disabled={grantingScore}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-bold transition-colors disabled:opacity-50
              ${ungrantedSubmitters.length > 0
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-default'}`}
          >
            <Star className="w-3.5 h-3.5" />
            {grantingScore ? '부여 중...' : ungrantedSubmitters.length > 0
              ? `제출자 점수 부여 (${ungrantedSubmitters.length}명)`
              : '점수 부여 완료'}
          </button>
        </div>
        <div className="flex gap-4 text-sm font-bold">
          <span className="text-green-600">제출 {submitted}</span>
          <span className="text-red-500">미제출 {missing}</span>
          <span className="text-gray-400">결석 {absent}</span>
        </div>
      </div>

      {/* 학생 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {students.map(student => {
          const st = getStatus(student.id);
          const cfg = STATUS_OPTIONS[st];
          return (
            <div key={student.id}
              className={`flex justify-between items-center p-3.5 rounded-xl border-2 transition-all ${cfg.color}`}
            >
              {/* 이름 클릭 → 상세 */}
              <button
                onClick={() => setDetailStudent(student)}
                className="flex items-center gap-2.5 hover:opacity-70 transition-opacity text-left"
                title="클릭하여 상세 기록 보기"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                  ${st === 'submitted' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                  {student.name[0]}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-800 underline decoration-dotted underline-offset-2">{student.name}</span>
                  {/* 점수 부여 배지 */}
                  {st === 'submitted' && grantedSet.has(student.id) && (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full" title="점수 부여됨">
                      <Star style={{ width: 10, height: 10 }} /> +1
                    </span>
                  )}
                </div>
              </button>

              {/* 상태 버튼 3개 */}
              <div className="flex gap-1">
                {Object.entries(STATUS_OPTIONS).map(([key, opt]) => {
                  const BtnIcon = opt.icon;
                  return (
                    <button key={key} onClick={() => setStatus(student.id, key)} title={opt.label}
                      className={`p-1.5 rounded-lg transition-all ${st === key ? 'bg-white shadow-sm scale-110' : 'hover:bg-black/5 opacity-40 hover:opacity-80'}`}
                    >
                      <BtnIcon className={`w-4.5 h-4.5 ${st === key ? opt.iconColor : 'text-gray-400'}`} style={{ width: 18, height: 18 }} />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 하단 */}
      <div className="flex justify-end">
        <button onClick={copyReport} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm">
          <Copy className="w-4 h-4" /> 결과 복사
        </button>
      </div>

      {/* ── 통계 / 벌금 모달 ── */}
      {(showStats || showFines) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className={`px-5 py-4 flex justify-between items-center text-white ${showFines ? 'bg-yellow-500' : 'bg-slate-800'}`}>
              <h3 className="text-lg font-bold flex items-center gap-2">
                {showFines ? <><Coins className="w-5 h-5" /> 벌금 관리</> : <><BarChart2 className="w-5 h-5" /> 기간별 통계</>}
              </h3>
              <button onClick={() => { setShowStats(false); setShowFines(false); }} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 기간 선택 */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center gap-3">
              <span className="font-bold text-sm text-gray-600">기간:</span>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-300" />
              <span className="text-gray-400 text-sm">~</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-300" />
              <span className="text-xs text-gray-400">* 주말 및 기록 없는 날 제외</span>
            </div>

            <div className="overflow-auto flex-1">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left">이름</th>
                    {showStats ? (
                      <>
                        <th className="px-4 py-3 text-center text-green-700 bg-green-50">제출</th>
                        <th className="px-4 py-3 text-center text-red-700 bg-red-50">미제출</th>
                        <th className="px-4 py-3 text-center text-gray-600 bg-gray-100">결석</th>
                        <th className="px-4 py-3 text-center">제출율</th>
                      </>
                    ) : (
                      <>
                        <th className="px-4 py-3 text-center text-red-700 bg-red-50">미제출</th>
                        <th className="px-4 py-3 text-center text-yellow-700 bg-yellow-50">벌금</th>
                        <th className="px-4 py-3 text-center">납부</th>
                        <th className="px-4 py-3 text-left">납부 이력</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {periodStats.map(stat => {
                    if (showStats) {
                      const total = stat.submitted + stat.missing;
                      const rate = total > 0 ? Math.round((stat.submitted / total) * 100) : 0;
                      return (
                        <tr key={stat.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-bold text-gray-800">{stat.name}</td>
                          <td className="px-4 py-3 text-center font-bold text-green-600">{stat.submitted}</td>
                          <td className="px-4 py-3 text-center font-bold text-red-500">{stat.missing}</td>
                          <td className="px-4 py-3 text-center text-gray-400">{stat.absent}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs font-bold">{rate}%</span>
                          </td>
                        </tr>
                      );
                    } else {
                      const fine = stat.missing * 10;
                      const history = fineHistory[stat.id] || [];
                      return (
                        <tr key={stat.id} className="hover:bg-gray-50 align-top">
                          <td className="px-4 py-3 font-bold text-gray-800 pt-4">{stat.name}</td>
                          <td className="px-4 py-3 text-center font-bold text-red-500 pt-4">{stat.missing}회</td>
                          <td className="px-4 py-3 text-center font-bold text-yellow-600 pt-4">{fine}C</td>
                          <td className="px-4 py-3 text-center pt-3">
                            {fine > 0
                              ? <button onClick={() => payFine(stat.id, fine)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors">납부</button>
                              : <span className="text-gray-300 text-xs">-</span>
                            }
                          </td>
                          <td className="px-4 py-3">
                            {history.length === 0
                              ? <span className="text-gray-300 text-xs">이력 없음</span>
                              : (
                                <div className="space-y-1 max-h-28 overflow-y-auto">
                                  {[...history].reverse().map((h, i) => (
                                    <div key={i} className="text-xs bg-gray-100 px-2 py-1 rounded-lg flex justify-between items-center gap-2">
                                      <span>{h.date} | {h.amount}C</span>
                                      <button onClick={() => deleteFine(stat.id, history.length - 1 - i)} className="text-red-400 hover:text-red-600 font-bold">×</button>
                                    </div>
                                  ))}
                                </div>
                              )
                            }
                          </td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 학생 상세 모달 ── */}
      {detailStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden">
            <div className="bg-indigo-600 text-white px-5 py-4 flex justify-between items-center">
              <h3 className="text-base font-bold flex items-center gap-2">
                <User className="w-4 h-4" /> {detailStudent.name} 학생 기록
              </h3>
              <button onClick={() => setDetailStudent(null)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2 justify-center flex-wrap">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded-lg px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-400" />
              <span className="text-gray-400 text-xs">~</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded-lg px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-400" />
            </div>

            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {getDetailHistory(detailStudent.id).map((rec, idx) => (
                <div key={idx} className="flex justify-between items-center px-3 py-2 rounded-xl border border-gray-100 bg-white hover:bg-gray-50">
                  <span className="text-sm font-bold text-gray-700 w-24">{rec.date}</span>
                  <div className="flex gap-1">
                    {Object.entries(STATUS_OPTIONS).map(([key, opt]) => (
                      <button key={key}
                        onClick={() => setStatusForDate(rec.date, detailStudent.id, key)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${rec.status === key ? opt.color : 'bg-white text-gray-300 border-gray-100 hover:border-gray-200'}`}
                      >
                        {key === 'submitted' ? 'O' : key === 'missing' ? 'X' : '-'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 토스트 */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl z-[9999] animate-in fade-in slide-in-from-bottom-3">
          {toast}
        </div>
      )}
    </div>
  );
};

export default LifeNoteManager;
