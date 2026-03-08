import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { db } from '../../firebase';
import {
  doc, setDoc, onSnapshot, collection, deleteDoc, updateDoc
} from 'firebase/firestore';
import {
  X, Plus, FileText, CheckCircle2, XCircle, MinusCircle, Trash2, Copy
} from 'lucide-react';
import { getLocalDateString } from '../../utils/dateUtils';

// ── 상태 설정 ────────────────────────────────────────────────
const STATUS_OPTIONS = {
  submitted: { label: '제출', icon: CheckCircle2, color: 'bg-green-100 text-green-800 border-green-200', iconColor: 'text-green-600' },
  missing:   { label: '미제출', icon: XCircle,    color: 'bg-red-100 text-red-800 border-red-200',       iconColor: 'text-red-500'   },
  absent:    { label: '결석', icon: MinusCircle, color: 'bg-gray-100 text-gray-700 border-gray-200',    iconColor: 'text-gray-500'  },
};

const AssignmentManager = () => {
  const { users } = useAppContext();
  const students = users.filter(u => u.type === 'student').sort((a, b) => a.name.localeCompare(b.name));

  // Firestore 데이터
  const [assignments, setAssignments] = useState([]); // [{ id, title, date, records: {} }]
  
  // UI 상태
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  
  const [toast, setToast] = useState('');

  // ── Firestore 실시간 구독 ────────────────────────────────
  useEffect(() => {
    // 과제 목록 구독 (class_assignments 컬렉션)
    const unsub = onSnapshot(collection(db, 'class_assignments'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // 최신 생성된 과제가 위로 오게 정렬
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAssignments(list);
      
      // 선택된 과제가 없거나, 삭제되었을 경우 첫 번째 항목을 선택
      if (list.length > 0) {
        if (!selectedAssignmentId || !list.find(a => a.id === selectedAssignmentId)) {
          setSelectedAssignmentId(list[0].id);
        }
      } else {
        setSelectedAssignmentId(null);
      }
    });

    return () => unsub();
  }, [selectedAssignmentId]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // ── 헬퍼 함수 ───────────────────────────────────────────
  const currentAssignment = assignments.find(a => a.id === selectedAssignmentId);

  // ── 액션 ───────────────────────────────────────────────
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const newId = `assign_${Date.now()}`;
      await setDoc(doc(db, 'class_assignments', newId), {
        title: newTitle.trim(),
        date: new Date().toISOString(),
        records: {} // 초기 레코드 비어있음
      });
      setNewTitle('');
      setShowCreateModal(false);
      setSelectedAssignmentId(newId);
      showToast('새 과제가 생성되었습니다.');
    } catch (error) {
      console.error(error);
      showToast('과제 생성에 실패했습니다.');
    }
  };

  const handleDeleteAssignment = async () => {
    if (!currentAssignment) return;
    if (window.confirm(`'${currentAssignment.title}' 과제와 점검 기록을 모두 삭제하시겠습니까?`)) {
      await deleteDoc(doc(db, 'class_assignments', currentAssignment.id));
      showToast('과제가 삭제되었습니다.');
    }
  };

  const setStatus = async (studentId, status) => {
    if (!currentAssignment) return;
    const updatedRecords = { ...currentAssignment.records, [studentId]: status };
    await updateDoc(doc(db, 'class_assignments', currentAssignment.id), {
      records: updatedRecords
    });
  };

  const getStatus = (studentId) => currentAssignment?.records?.[studentId] || 'missing';

  const setAllSubmitted = async () => {
    if (!currentAssignment) return;
    const updatedRecords = { ...currentAssignment.records };
    students.forEach(s => { updatedRecords[s.id] = 'submitted'; });
    await updateDoc(doc(db, 'class_assignments', currentAssignment.id), {
      records: updatedRecords
    });
    showToast('전원 제출 처리되었습니다.');
  };

  const clearCurrentAssignment = async () => {
    if (!currentAssignment) return;
    if (!window.confirm(`점검 데이터를 모두 초기화하시겠습니까?`)) return;
    await updateDoc(doc(db, 'class_assignments', currentAssignment.id), {
      records: {}
    });
    showToast('초기화 완료');
  };

  // 통계
  const stats = () => {
    if (!currentAssignment) return { submitted: 0, missing: 0, absent: 0 };
    let submitted = 0, missing = 0, absent = 0;
    students.forEach(s => {
      const st = getStatus(s.id);
      if (st === 'submitted') submitted++;
      else if (st === 'missing') missing++;
      else absent++;
    });
    return { submitted, missing, absent };
  };

  // 보고서 복사
  const copyReport = () => {
    if (!currentAssignment) return;
    const { submitted, missing, absent } = stats();
    const missingNames = students.filter(s => getStatus(s.id) === 'missing').map(s => s.name).join(', ');
    const text = `[교육부 과제 점검 알림]\n📚 과제명: ${currentAssignment.title}\n📅 일시: ${getLocalDateString(new Date(currentAssignment.date))}\n\n- 제출: ${submitted}명\n- 결석: ${absent}명\n- 미제출: ${missing}명\n\n🚨 미제출자: ${missingNames || '없음'}`;
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed'; el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    try { document.execCommand('copy'); showToast('📋 과제 점검 보고서 복사 완료!'); }
    catch { showToast('⚠️ 복사 실패. 직접 드래그하여 복사하세요.'); }
    document.body.removeChild(el);
  };

  const currentStats = stats();

  return (
    <div className="space-y-4 relative">
      {/* 헤더 */}
      <div className="bg-sky-600 rounded-2xl p-5 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5" /> 과제 점검
            </h2>
            <button 
                onClick={() => setShowCreateModal(true)} 
                className="flex items-center gap-1.5 bg-white text-sky-700 px-3 py-1.5 rounded-lg font-bold text-sm hover:bg-sky-50 transition-colors"
            >
                <Plus className="w-4 h-4" /> 새 과제 등록
            </button>
          </div>
          
          {assignments.length > 0 ? (
            <div className="w-full">
              <select
                value={selectedAssignmentId || ''}
                onChange={(e) => setSelectedAssignmentId(e.target.value)}
                className="w-full bg-sky-700 text-white border border-sky-500 rounded-xl px-3 py-2.5 font-bold outline-none cursor-pointer focus:ring-2 focus:ring-sky-400"
              >
                {assignments.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({getLocalDateString(new Date(a.date))})
                  </option>
                ))}
              </select>
            </div>
          ) : (
             <p className="text-sky-200 text-sm">등록된 과제가 없습니다.</p>
          )}
        </div>
      </div>

      {currentAssignment ? (
          <>
            {/* 컨트롤 바 */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3 flex flex-wrap justify-between items-center gap-3">
                <div className="flex gap-2 flex-wrap">
                    <button onClick={setAllSubmitted} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-bold transition-colors">전원 제출</button>
                    <button onClick={clearCurrentAssignment} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 text-sm rounded-lg font-bold transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> 점검 내용 초기화
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex gap-3 text-sm font-bold">
                        <span className="text-green-600">제출 {currentStats.submitted}</span>
                        <span className="text-red-500">미제출 {currentStats.missing}</span>
                        <span className="text-gray-400">결석 {currentStats.absent}</span>
                    </div>
                </div>
            </div>

            {/* 학생 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 relative">
                {students.map(student => {
                const st = getStatus(student.id);
                const cfg = STATUS_OPTIONS[st];
                return (
                    <div key={student.id}
                    className={`flex justify-between items-center p-3.5 rounded-xl border-2 transition-all ${cfg.color}`}
                    >
                    {/* 이름 */}
                    <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                        ${st === 'submitted' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                        {student.name[0]}
                        </div>
                        <span className="font-bold text-gray-800">{student.name}</span>
                    </div>

                    {/* 상태 변경 버튼 */}
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

            {/* 하단 바 (결과 복사 / 삭제) */}
            <div className="flex justify-between items-center pt-2">
                <button onClick={handleDeleteAssignment} className="text-red-400 hover:text-red-600 text-sm font-bold underline">
                  이 과제 영구 삭제
                </button>
                <button onClick={copyReport} className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm transition-colors shadow-sm">
                <Copy className="w-4 h-4" /> 점검 결과 복사
                </button>
            </div>
          </>
      ) : (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
             <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
             <p className="text-gray-500 font-bold mb-1">진행 중인 과제가 없습니다.</p>
             <p className="text-sm text-gray-400">새 과제를 등록하고 점검을 시작해 보세요.</p>
          </div>
      )}

      {/* 새 과제 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full relative shadow-2xl">
                <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
                <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-sky-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">새 과제 등록</h2>
                <p className="text-sm text-gray-500 mb-6">점검할 새로운 과제/수행평가 제목을 입력하세요.</p>
                
                <form onSubmit={handleCreateAssignment}>
                    <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="예: 국어 1단원 독후감 제출"
                        className="w-full border-2 border-gray-200 rounded-xl p-3 mb-4 focus:outline-none focus:border-sky-500 font-bold text-gray-700"
                        autoFocus
                        required
                    />
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">취소</button>
                        <button type="submit" disabled={!newTitle.trim()} className="flex-1 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 disabled:opacity-50 transition-colors">생성하기</button>
                    </div>
                </form>
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

export default AssignmentManager;
