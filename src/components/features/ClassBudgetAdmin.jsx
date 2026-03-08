import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Wallet } from 'lucide-react';

const ClassBudgetAdmin = () => {
    const { classBudget, updateClassBudget } = useAppContext();
    const [amount, setAmount] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setAmount(classBudget.toString());
    }, [classBudget]);

    const handleSave = async () => {
        const num = parseInt(amount, 10);
        if (isNaN(num) || num < 0) {
            alert('올바른 금액을 입력하세요.');
            return;
        }
        setIsSaving(true);
        try {
            await updateClassBudget(num);
            alert('학급 예산이 성공적으로 설정되었습니다!');
        } catch (error) {
            alert('예산 설정 중 오류가 발생했습니다.');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 max-w-lg">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800">학급 총 예산 설정</h3>
                    <p className="text-sm text-gray-500">기획재정부가 관리할 한 학기(또는 한 달) 총 예산을 입력하세요.</p>
                </div>
            </div>
            
            <div className="flex gap-3 mt-6">
                <div className="flex-1 relative">
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        placeholder="예산 금액 입력"
                        className="w-full pl-4 pr-10 py-3 text-lg font-bold border border-gray-200 rounded-xl outline-none focus:ring-2 focus:border-transparent focus:ring-emerald-400 transition-all text-right"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">원</span>
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                    {isSaving ? '저장 중...' : '저장하기'}
                </button>
            </div>
        </div>
    );
};

export default ClassBudgetAdmin;
