import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { CheckCircle, Clock, FileText } from 'lucide-react';

const FineRecordManager = () => {
    const { fineRecords, updateFineRecordStatus } = useAppContext();
    const [filter, setFilter] = useState('unpaid'); // 'all', 'unpaid', 'paid'

    const filteredRecords = fineRecords.filter(r => filter === 'all' || r.status === filter);

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
        await updateFineRecordStatus(id, newStatus);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-yellow-600" />
                    벌금 납부 현황
                </h3>
                <select 
                    value={filter} 
                    onChange={e => setFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium outline-none shadow-sm"
                >
                    <option value="unpaid">미납</option>
                    <option value="paid">납부 완료</option>
                    <option value="all">전체 기록</option>
                </select>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {filteredRecords.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 font-bold bg-gray-50 rounded-xl border border-gray-100">조건에 맞는 기록이 없습니다.</div>
                ) : (
                    filteredRecords.map(record => (
                        <div key={record.id} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${record.status === 'paid' ? 'bg-green-50/50 border-green-100' : 'bg-white border-gray-200 shadow-sm hover:border-yellow-300'}`}>
                            <div>
                                <p className="font-bold text-gray-800 text-base flex items-center gap-2">
                                    {record.userName} 
                                    <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full text-xs font-black">
                                        {record.amount}
                                    </span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1.5 break-all line-clamp-2" title={record.reason}>{record.reason}</p>
                                <p className="text-[10px] text-gray-400 mt-1">
                                    판결일: {new Date(record.timestamp).toLocaleDateString()}
                                </p>
                            </div>
                            <button 
                                onClick={() => handleToggleStatus(record.id, record.status)}
                                className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ml-3 ${
                                    record.status === 'paid' 
                                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                }`}
                            >
                                {record.status === 'paid' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                {record.status === 'paid' ? '납부 완료' : '미납 (납부 처리)'}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FineRecordManager;
