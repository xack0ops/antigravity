import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Minus, History, X, Star, TrendingUp, Coins, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

// 신용등급 뱃지 색상
const getCreditColor = (grade) => {
  if (grade >= 10) return 'bg-yellow-400 text-yellow-900';
  if (grade >= 7)  return 'bg-emerald-400 text-emerald-900';
  if (grade >= 4)  return 'bg-blue-400 text-blue-900';
  if (grade >= 1)  return 'bg-gray-300 text-gray-700';
  return 'bg-gray-100 text-gray-400';
};

const ScoreManager = () => {
  const {
    users, currentUser, roles, ministries,
    scoreTransactions,
    addScoreTransaction, deleteScoreTransaction,
    getUserScoreSummary,
  } = useAppContext();

  const students = users.filter(u => u.type === 'student').sort((a, b) => a.name.localeCompare(b.name));

  const [grantModal, setGrantModal] = useState(null); // { student } | null
  const [historyStudent, setHistoryStudent] = useState(null); // student | null

  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isNegative, setIsNegative] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const openGrantModal = (student) => {
    setGrantModal({ student });
    setAmount('');
    setReason('');
    setIsNegative(false);
    setError('');
  };

  const handleSubmitGrant = async () => {
    const num = parseInt(amount, 10);
    if (!amount || isNaN(num) || num <= 0) { setError('점수를 올바르게 입력해주세요. (양수)'); return; }
    if (!reason.trim()) { setError('사유를 입력해주세요.'); return; }

    setSubmitting(true);
    try {
      await addScoreTransaction({
        userId: grantModal.student.id,
        amount: isNegative ? -num : num,
        reason: reason.trim(),
        isSpend: false,
        grantedBy: currentUser.id,
        grantedByName: currentUser.name,
      });
      setGrantModal(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTxn = async (txnId, txnReason) => {
    if (!window.confirm(`"${txnReason}" 거래 내역을 삭제하시겠습니까?\n삭제하면 점수가 원래대로 돌아갑니다.`)) return;
    await deleteScoreTransaction(txnId);
  };

  const myMinistry = ministries.find(m => m.id === currentUser.ministryId);
  const myRoles = roles.filter(r => currentUser.roleIds?.includes(r.id));

  // 권한 체크: 행정안전부원 or 대통령 역할 or 관리자
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center">
          <Star className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">생활태도 점수 관리</h2>
          <p className="text-sm text-gray-500">학생에게 점수를 부여하거나 차감합니다.</p>
        </div>
      </div>

      {/* 학생 점수 목록 */}
      <div className="space-y-2">
        {students.map(student => {
          const { currentScore, accumulatedScore, creditGrade } = getUserScoreSummary(student.id);
          const isShowingHistory = historyStudent?.id === student.id;
          const studentTxns = scoreTransactions.filter(t => t.userId === student.id);

          return (
            <div key={student.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* 학생 행 */}
              <div className="flex items-center gap-3 p-4">
                {/* 아바타 */}
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-lg shrink-0">
                  {student.name[0]}
                </div>

                {/* 이름 + 점수 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-800">{student.name}</span>
                    {creditGrade > 0 && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getCreditColor(creditGrade)}`}>
                        신용등급 {creditGrade}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                    <span>현재 <b className={`${currentScore < 0 ? 'text-red-500' : 'text-indigo-600'}`}>{currentScore}점</b></span>
                    <span>누적 <b className="text-emerald-600">{accumulatedScore}점</b></span>
                  </div>
                </div>

                {/* 버튼 */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setHistoryStudent(isShowingHistory ? null : student)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                    title="거래 내역"
                  >
                    {isShowingHistory ? <ChevronUp className="w-4 h-4" /> : <History className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openGrantModal(student)}
                    className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl text-sm font-bold transition-colors"
                  >
                    <Plus className="w-4 h-4" /> 점수
                  </button>
                </div>
              </div>

              {/* 거래 내역 (펼침) */}
              {isShowingHistory && (
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-2 max-h-60 overflow-y-auto">
                  {studentTxns.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">거래 내역이 없습니다.</p>
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
                        {/* 관리자 or 부여자만 삭제 가능 */}
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

      {/* 점수 부여/차감 모달 */}
      {grantModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setGrantModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={22} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">점수 부여/차감</h3>
                <p className="text-sm text-gray-500">{grantModal.student.name} 학생</p>
              </div>
            </div>

            {/* +/- 토글 */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setIsNegative(false)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${!isNegative ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                <Plus className="w-4 h-4" /> 점수 부여
              </button>
              <button
                onClick={() => setIsNegative(true)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${isNegative ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                <Minus className="w-4 h-4" /> 점수 차감
              </button>
            </div>

            {/* 점수 입력 */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-1">점수</label>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-black ${isNegative ? 'text-red-500' : 'text-emerald-600'}`}>
                  {isNegative ? '-' : '+'}
                </span>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={e => { setAmount(e.target.value); setError(''); }}
                  placeholder="점수 입력"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-amber-400 transition-all text-lg font-bold"
                  autoFocus
                />
                <span className="text-gray-500 font-bold">점</span>
              </div>
            </div>

            {/* 사유 입력 */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-1">사유 <span className="text-red-400">*</span></label>
              <textarea
                value={reason}
                onChange={e => { setReason(e.target.value); setError(''); }}
                placeholder="점수 부여/차감 사유를 입력하세요..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-amber-400 transition-all resize-none h-24 text-sm"
              />
            </div>

            {error && <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl text-center mb-4">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setGrantModal(null)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                취소
              </button>
              <button
                onClick={handleSubmitGrant}
                disabled={submitting}
                className={`flex-1 py-3 text-white rounded-xl font-bold transition-colors disabled:opacity-50 ${isNegative ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
              >
                {submitting ? '처리 중...' : (isNegative ? '차감하기' : '부여하기')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreManager;
