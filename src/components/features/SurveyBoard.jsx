import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { subscribeToCollection, addSurvey, voteSurvey, deleteSurvey } from '../../utils/firebaseUtils';
import { PieChart, Plus, CheckCircle2, AlertCircle, Trash2, Users } from 'lucide-react';

const SurveyBoard = () => {
    const { currentUser, ministries } = useAppContext();
    const [surveys, setSurveys] = useState([]);
    const [isWriting, setIsWriting] = useState(false);
    
    // New Survey Form State
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newOptions, setNewOptions] = useState(['', '']); 
    
    // Track selected option per survey
    const [selectedOptions, setSelectedOptions] = useState({});

    useEffect(() => {
        const unsub = subscribeToCollection('surveys', setSurveys);
        return () => unsub();
    }, []);

    const handleAddOption = () => {
        setNewOptions([...newOptions, '']);
    };

    const handleOptionChange = (index, value) => {
        const updated = [...newOptions];
        updated[index] = value;
        setNewOptions(updated);
    };

    const handleRemoveOption = (index) => {
        if (newOptions.length <= 2) return; // Minimum 2 options
        const updated = newOptions.filter((_, i) => i !== index);
        setNewOptions(updated);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validOptions = newOptions.filter(opt => opt.trim() !== '');
        
        if (!newTitle.trim() || validOptions.length < 2) {
            alert('설문 제목과 최소 2개 이상의 선택지를 입력해주세요.');
            return;
        }

        const ministryName = ministries.find(m => m.id === currentUser?.ministryId)?.name || '기타';

        await addSurvey(newTitle, newDesc, validOptions, currentUser?.name, ministryName);
        setIsWriting(false);
        setNewTitle('');
        setNewDesc('');
        setNewOptions(['', '']);
    };

    const handleVote = async (surveyId) => {
        const optionIdx = selectedOptions[surveyId];
        if (optionIdx === undefined) return;
        
        try {
            await voteSurvey(surveyId, currentUser.id, optionIdx);
            // Clear selection after successful vote
            setSelectedOptions(prev => {
                const updated = { ...prev };
                delete updated[surveyId];
                return updated;
            });
        } catch (error) {
            alert('투표 중 오류가 발생했습니다. (이미 투표했거나 항목이 없습니다)');
        }
    };

    const calculatePercentage = (votes, totalVotes) => {
        if (totalVotes === 0) return 0;
        return Math.round((votes / totalVotes) * 100);
    }

    // Role check logic matching PetitionBoard
    const isAdmin = currentUser?.type === 'admin';

    // Everyone can create surveys (or you can restrict to specific roles as needed)
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">📊 부서 설문조사</h2>
                    <p className="text-gray-500 text-sm mt-1">부서 업무에 필요한 의견을 학급 전체에 물어보세요!</p>
                </div>
                <button 
                    onClick={() => setIsWriting(!isWriting)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                    <Plus className="w-4 h-4" />
                    {isWriting ? '작성 취소' : '설문 올리기'}
                </button>
            </div>

            {isWriting && (
                <form onSubmit={handleSubmit} className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 animate-in slide-in-from-top-4 space-y-4">
                    <input 
                        type="text" 
                        placeholder="설문조사 제목 (예: 국어 시간 발표 방식 투표)" 
                        className="w-full px-4 py-3 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-800"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                    />
                    <textarea 
                        placeholder="이 설문에 대한 부연 설명을 적어주세요. (선택)" 
                        className="w-full px-4 py-3 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none"
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                    />
                    
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-indigo-100">
                        <label className="text-sm font-bold text-gray-700">투표 선택지 (최소 2개)</label>
                        {newOptions.map((opt, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                                <span className="font-bold text-indigo-400 w-5">{idx + 1}.</span>
                                <input 
                                    type="text" 
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-400 outline-none text-sm"
                                    placeholder={`선택지 ${idx + 1}`}
                                    value={opt}
                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                />
                                {newOptions.length > 2 && (
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveOption(idx)}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button 
                            type="button"
                            onClick={handleAddOption}
                            className="w-full py-2 mt-2 border-2 border-dashed border-indigo-200 text-indigo-500 rounded-lg font-bold text-sm hover:bg-indigo-50 hover:border-indigo-300 transition-colors flex justify-center items-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> 항목 추가
                        </button>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md">
                            설문 등록하기
                        </button>
                    </div>
                </form>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {surveys.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>진행 중인 설문조사가 없습니다.</p>
                    </div>
                ) : (
                    surveys.map(survey => {
                        const hasVoted = survey.votedUsers?.includes(currentUser?.id);
                        
                        return (
                        <div key={survey.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative group flex flex-col hover:border-indigo-200 transition-colors">
                             {isAdmin && (
                                <button
                                    onClick={() => {
                                        if (window.confirm("이 설문조사를 삭제하시겠습니까?\n모든 투표 결과가 사라집니다.")) {
                                            deleteSurvey(survey.id);
                                        }
                                    }}
                                    className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="설문조사 삭제"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                            
                            <div className="flex items-center gap-2 mb-3">
                                <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-full">
                                    {survey.ministryName}
                                </span>
                                <span className="text-gray-400 text-xs font-medium">
                                    {new Date(survey.createdAt?.toDate()).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-gray-800 mb-1">{survey.title}</h3>
                            {survey.description && <p className="text-sm text-gray-500 mb-4">{survey.description}</p>}
                            
                            <div className="mt-4 mb-2 space-y-3 flex-1">
                                {survey.options?.map((opt, idx) => {
                                    const percent = calculatePercentage(opt.votes, survey.totalVotes);
                                    const isSelected = selectedOptions[survey.id] === idx;
                                    
                                    return (
                                    <div key={idx} className="relative">
                                        <button 
                                            onClick={() => {
                                                if (!hasVoted && !isAdmin) {
                                                    setSelectedOptions(prev => ({ ...prev, [survey.id]: idx }));
                                                }
                                            }}
                                            disabled={hasVoted || isAdmin} // Admins usually don't participate or can optionally
                                            className={`w-full text-left relative overflow-hidden rounded-xl border p-3 flex justify-between items-center transition-all ${
                                                hasVoted 
                                                    ? 'cursor-default border-indigo-100' // Changed to show results if voted
                                                    : isAdmin 
                                                        ? 'cursor-not-allowed border-gray-100' 
                                                        : isSelected 
                                                            ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200 ring-offset-1' 
                                                            : 'hover:border-indigo-400 hover:bg-gray-50 border-gray-200 active:scale-[0.98]'
                                            }`}
                                        >
                                            {/* Results Bar Background */}
                                            {hasVoted && (
                                                <div 
                                                    className="absolute inset-0 bg-indigo-50 opacity-80" 
                                                    style={{ width: `${percent}%`, transition: 'width 1s ease-in-out' }}
                                                />
                                            )}
                                            
                                            <span className={`relative z-10 font-bold text-sm break-all ${hasVoted ? 'text-gray-800' : 'text-gray-700'}`}>
                                                {opt.text}
                                            </span>
                                            
                                            {hasVoted && (
                                                <span className="relative z-10 text-xs font-black text-indigo-600 ml-2 whitespace-nowrap bg-white/50 px-2 py-0.5 rounded">
                                                    {percent}% ({opt.votes}명)
                                                </span>
                                            )}
                                            {!hasVoted && !isAdmin && (
                                                <div className={`w-5 h-5 rounded-full border-2 ml-2 shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'}`}>
                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                )})}
                            </div>

                            {!hasVoted && !isAdmin && selectedOptions[survey.id] !== undefined && (
                                <button
                                    onClick={() => handleVote(survey.id)}
                                    className="w-full mt-2 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-md animate-in slide-in-from-bottom-2"
                                >
                                    투표하기
                                </button>
                            )}

                            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5" /> 총 {survey.totalVotes || 0}명 참여
                                </span>
                                {hasVoted && (
                                    <span className="text-xs font-bold text-indigo-500 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> 투표 완료
                                    </span>
                                )}
                            </div>
                        </div>
                    )})
                )}
            </div>
        </div>
    )
}

export default SurveyBoard;
