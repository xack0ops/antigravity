import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Wallet, Plus, Trash2, Receipt } from 'lucide-react';

const BudgetManager = () => {
    const { classBudget, budgetTransactions, addBudgetTransaction, deleteBudgetTransaction, currentUser } = useAppContext();
    const [reason, setReason] = useState('');
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalUsed = budgetTransactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const remaining = classBudget - totalUsed;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const num = parseInt(amount, 10);
        
        if (!reason.trim()) { alert('지출 항목(사유)을 입력하세요.'); return; }
        if (isNaN(num) || num <= 0) { alert('올바른 지출 금액을 입력하세요.'); return; }
        if (num > remaining) {
            if (!window.confirm(`남은 예산(${remaining.toLocaleString()}원)보다 지출 금액이 큽니다. 계속 진행하시겠습니까?`)) {
                return;
            }
        }

        setIsSubmitting(true);
        try {
            await addBudgetTransaction({
                reason: reason.trim(),
                amount: num,
                executedBy: currentUser.id,
                executedByName: currentUser.name
            });
            setReason('');
            setAmount('');
        } catch (error) {
            console.error(error);
            alert('지출 내역 등록 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id, reason) => {
        if (window.confirm(`'${reason}' 지출 내역을 정말 삭제하시겠습니까?`)) {
            await deleteBudgetTransaction(id);
        }
    };

    // Format utility
    const formatWon = (num) => num.toLocaleString('ko-KR') + '원';

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">학급 예산 관리</h2>
                    <p className="text-sm text-gray-500">학급 비용 지출 내역을 기록하고 남은 예산을 확인하세요.</p>
                </div>
            </div>

            {/* 예산 요약 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-bold text-gray-500 mb-1">총 학급 예산</p>
                    <p className="text-2xl font-black text-gray-800">{formatWon(classBudget)}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-bold text-gray-500 mb-1">사용 금액</p>
                    <p className="text-2xl font-black text-rose-500">{formatWon(totalUsed)}</p>
                </div>
                <div className="bg-emerald-500 p-5 rounded-2xl border border-emerald-600 shadow-sm flex flex-col items-center justify-center text-center text-white">
                    <p className="text-sm font-bold text-emerald-100 mb-1">남은 예산</p>
                    <p className="text-2xl font-black">{formatWon(remaining)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 지출 등록 폼 */}
                <div className="lg:col-span-1 border border-gray-100 bg-white rounded-2xl p-5 shadow-sm h-fit">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-emerald-500" /> 새로운 지출 등록
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">지출 항목 (사유)</label>
                            <input 
                                type="text" 
                                value={reason} 
                                onChange={e => setReason(e.target.value)}
                                placeholder="예: 과자 파티용 간식"
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 text-sm focus:bg-white transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5">지출 금액</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={amount} 
                                    onChange={e => setAmount(e.target.value)}
                                    placeholder="0"
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 text-sm focus:bg-white transition-colors text-right pr-8 font-bold"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors shadow-sm"
                        >
                            {isSubmitting ? '등록 중...' : '지출 내역 추가'}
                        </button>
                    </form>
                </div>

                {/* 지출 내역 리스트 */}
                <div className="lg:col-span-2 border border-gray-100 bg-white rounded-2xl p-5 shadow-sm max-h-[500px] flex flex-col">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-gray-500" /> 지출 상세 내역
                    </h3>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                        {budgetTransactions.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <p className="text-sm">아직 등록된 지출 내역이 없습니다.</p>
                            </div>
                        ) : (
                            budgetTransactions.map(txn => (
                                <div key={txn.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-xl border border-gray-100 gap-3 group hover:bg-white hover:shadow-sm transition-all">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-800 text-md truncate">{txn.reason}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(txn.timestamp).toLocaleDateString()} · 담당: {txn.executedByName}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 shrink-0 justify-between w-full sm:w-auto mt-2 sm:mt-0">
                                        <span className="font-black text-rose-500 text-lg">
                                            -{formatWon(txn.amount)}
                                        </span>
                                        <button 
                                            onClick={() => handleDelete(txn.id, txn.reason)}
                                            className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="내역 삭제"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetManager;
