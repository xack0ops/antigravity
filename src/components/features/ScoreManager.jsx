import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Minus, History, X, Star, Trash2, ChevronUp, ChevronDown, Check, Users } from 'lucide-react';

// 신용등급 뱃지 색상
const getCreditColor = (grade) => {
  if (grade >= 10) return 'bg-yellow-400 text-yellow-900';
  if (grade >= 7)  return 'bg-emerald-400 text-emerald-900';
  if (grade >= 4)  return 'bg-blue-400 text-blue-900';
  if (grade >= 1)  return 'bg-gray-300 text-gray-700';
  return 'bg-gray-100 text-gray-400';
};

// 빠른 점수 프리셋
const QUICK_AMOUNTS = [1, 2, 3, 5, 10];

const ScoreManager = () => {
  const {
    users, currentUser, roles, ministries,
    scoreTransactions,
    addScoreTransaction, deleteScoreTransaction,
    getUserScoreSummary,
  } = useAppContext();

  const students = users
    .filter(u => u.type === 'student')
    .sort((a, b) => a.name.localeCompare(b.name));

  // 선택된 학생 ids
  const [selectedIds, setSelectedIds] = useState(new Set());
  // 부여/차감 여부
  const [isNegative, setIsNegative] = useState(false);
  // 점수 (빠른 선택 or 직접 입력)
  const [amount, setAmount] = useState('');
  // 사유
  const [reason, setReason] = useState('');
  // 에러
  const [error, setError] = useState('');
  // 로딩
  const [submitting, setSubmitting] = useState(false);
  // 내역 보기 학생
  const [historyStudent, setHistoryStudent] = useState(null);

  const myMinistry = ministries.find(m => m.id === currentUser.ministryId);
  const myRoles = roles.filter(r => currentUser.roleIds?.includes(r.id));

  const canManageScore =
    currentUser.type === 'admin' ||
    myMinistry?.name === '행정안전부' ||
    myRoles.some(r => r.name === '대통령');

  if (!canManageScore) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-bold">접근 권한이 없습니다.</p>
        <p className="text-sm mt-1">행정안전부원 또는 대통령만 이용 가능합니다.</p>
      </div>
    );
  }

  const toggleStudent = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setError('');
  };

  const selectAll = () => {
    setSelectedIds(new Set(students.map(s => s.id)));
  };

  const clearAll = () => {
    setSelectedIds(new Set());
  };

  const handleQuickAmount = (val) => {
    setAmount(String(val));
    setError('');
  };

  const handleSubmit = async () => {
    if (selectedIds.size === 0) { setError('학생을 한 명 이상 선택하세요.'); return; }
    const num = parseInt(amount, 10);
    if (!amount || isNaN(num) || num <= 0) { setError('점수를 올바르게 입력하세요. (양수)'); return; }
    if (!reason.trim()) { setError('사유를 입력하세요.'); return; }

    setSubmitting(true);
    try {
      await Promise.all(
        [...selectedIds].map(userId =>
          addScoreTransaction({
            userId,
            amount: isNegative ? -num : num,
            reason: reason.trim(),
            isSpend: false,
            grantedBy: currentUser.id,
            grantedByName: currentUser.name,
          })
        )
      );
      // 초기화
      setSelectedIds(new Set());
      setAmount('');
      setReason('');
      setError('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTxn = async (txnId, txnReason) => {
    if (!window.confirm(`"${txnReason}" 거래 내역을 삭제하시겠습니까?\n삭제하면 점수가 원래대로 돌아갑니다.`)) return;
    await deleteScoreTransaction(txnId);
  };

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center">
          <Star className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">생활태도 점수 관리</h2>
          <p className="text-sm text-gray-500">학생을 선택하고 점수를 한번에 부여하세요.</p>
        </div>
      </div>

      {/* ── 메인 패널 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* 왼쪽: 학생 선택 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-600 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              대상 학생 선택
              {selectedIds.size > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {selectedIds.size}명
                </span>
              )}
            </span>
            <div className="flex gap-2 text-xs font-bold">
              <button onClick={selectAll} className="text-indigo-500 hover:text-indigo-700 transition-colors">전체</button>
              <span className="text-gray-300">|</span>
              <button onClick={clearAll} className="text-gray-400 hover:text-gray-600 transition-colors">초기화</button>
            </div>
          </div>

          {/* 학생 태그 그리드 */}
          <div className="flex flex-wrap gap-2">
            {students.map(student => {
              const { currentScore } = getUserScoreSummary(student.id);
              const selected = selectedIds.has(student.id);
              return (
                <button
                  key={student.id}
                  onClick={() => toggleStudent(student.id)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold
                    transition-all duration-150 border-2
                    ${selected
                      ? 'bg-amber-500 border-amber-500 text-white shadow-md scale-105'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-amber-300 hover:bg-amber-50'}
                  `}
                >
                  {selected && <Check className="w-3.5 h-3.5" />}
                  {student.name}
                  <span className={`text-xs ${selected ? 'text-amber-100' : 'text-gray-400'}`}>
                    {currentScore}점
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 오른쪽: 점수 입력 패널 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">

          {/* 부여 / 차감 토글 */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsNegative(false)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${!isNegative ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              <Plus className="w-4 h-4" /> 점수 부여
            </button>
            <button
              onClick={() => setIsNegative(true)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${isNegative ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              <Minus className="w-4 h-4" /> 점수 차감
            </button>
          </div>

          {/* 빠른 점수 선택 */}
          <div>
            <label className="text-xs font-bold text-gray-500 mb-2 block">빠른 선택</label>
            <div className="flex gap-2 flex-wrap">
              {QUICK_AMOUNTS.map(v => (
                <button
                  key={v}
                  onClick={() => handleQuickAmount(v)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border-2 ${
                    amount === String(v)
                      ? isNegative
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-amber-300'
                  }`}
                >
                  {v}점
                </button>
              ))}
              {/* 직접 입력 */}
              <input
                type="number"
                min="1"
                value={QUICK_AMOUNTS.includes(parseInt(amount, 10)) ? '' : amount}
                onChange={e => { setAmount(e.target.value); setError(''); }}
                placeholder="직접 입력"
                className="w-24 px-3 py-2 rounded-xl border-2 border-gray-200 text-sm font-bold outline-none focus:border-amber-400 transition-all text-center"
              />
            </div>
          </div>

          {/* 사유 입력 */}
          <div>
            <label className="text-xs font-bold text-gray-500 mb-2 block">사유 <span className="text-red-400">*</span></label>
            <textarea
              value={reason}
              onChange={e => { setReason(e.target.value); setError(''); }}
              placeholder="점수 부여/차감 사유를 입력하세요..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-amber-400 transition-all resize-none h-20 text-sm"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-bold bg-red-50 px-4 py-2.5 rounded-xl text-center">
              {error}
            </p>
          )}

          {/* 제출 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full py-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-50 shadow-sm hover:shadow-md text-base
              ${isNegative ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
          >
            {submitting
              ? '처리 중...'
              : selectedIds.size > 0
                ? `${selectedIds.size}명에게 ${amount || '?'}점 ${isNegative ? '차감' : '부여'}하기`
                : (isNegative ? '차감하기' : '부여하기')}
          </button>
        </div>
      </div>

      {/* ── 학생별 현황 & 내역 ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-600 mb-3">학생별 점수 현황</h3>
        <div className="space-y-2">
          {students.map(student => {
            const { currentScore, accumulatedScore, creditGrade } = getUserScoreSummary(student.id);
            const isShowingHistory = historyStudent?.id === student.id;
            const studentTxns = scoreTransactions.filter(t => t.userId === student.id);

            return (
              <div key={student.id} className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-base shrink-0">
                    {student.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-800 text-sm">{student.name}</span>
                      {creditGrade > 0 && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getCreditColor(creditGrade)}`}>
                          신용등급 {creditGrade}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                      <span>현재 <b className={currentScore < 0 ? 'text-red-500' : 'text-indigo-600'}>{currentScore}점</b></span>
                      <span>누적 <b className="text-emerald-600">{accumulatedScore}점</b></span>
                    </div>
                  </div>
                  <button
                    onClick={() => setHistoryStudent(isShowingHistory ? null : student)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    내역
                    {isShowingHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {isShowingHistory && (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-2 max-h-52 overflow-y-auto">
                    {studentTxns.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-3">거래 내역이 없습니다.</p>
                    ) : (
                      studentTxns.map(txn => (
                        <div key={txn.id} className="flex items-start justify-between gap-2 bg-white rounded-xl px-3 py-2 border border-gray-100 text-sm">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${txn.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                {txn.amount > 0 ? '+' : ''}{txn.amount}점
                              </span>
                              {txn.isSpend && <span className="text-[10px] bg-purple-100 text-purple-600 font-bold px-1.5 py-0.5 rounded-full">사용</span>}
                            </div>
                            <p className="text-gray-600 truncate">{txn.reason}</p>
                            <p className="text-xs text-gray-400">{txn.grantedByName} · {new Date(txn.timestamp).toLocaleDateString('ko-KR')}</p>
                          </div>
                          {(currentUser.type === 'admin' || txn.grantedBy === currentUser.id) && (
                            <button
                              onClick={() => handleDeleteTxn(txn.id, txn.reason)}
                              className="text-gray-300 hover:text-red-400 p-1 transition-colors shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScoreManager;
