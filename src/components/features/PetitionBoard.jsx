import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { subscribeToCollection, addPetition, agreeToPetition, deletePetition } from '../../utils/firebaseUtils';
import { ThumbsUp, PenTool, AlertCircle, Trash2 } from 'lucide-react';

const PetitionBoard = () => {
    const { currentUser } = useAppContext();
    const [petitions, setPetitions] = useState([]);
    const [isWriting, setIsWriting] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');

    useEffect(() => {
        const unsub = subscribeToCollection('petitions', setPetitions);
        return () => unsub();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!newTitle || !newContent) return;
        
        await addPetition(newTitle, newContent, currentUser?.name || '익명');
        setIsWriting(false);
        setNewTitle('');
        setNewContent('');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">🏛️ 국무회의 청원 게시판</h2>
                    <p className="text-gray-500 text-sm mt-1">우리 반을 위한 좋은 의견을 제안해주세요!</p>
                </div>
                <button 
                    onClick={() => setIsWriting(!isWriting)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                    <PenTool className="w-4 h-4" />
                    {isWriting ? '닫기' : '청원하기'}
                </button>
            </div>

            {isWriting && (
                <form onSubmit={handleSubmit} className="bg-blue-50 p-6 rounded-2xl border border-blue-100 animate-in slide-in-from-top-4 space-y-4">
                    <input 
                        type="text" 
                        placeholder="청원 제목 (예: 급식 당번 규칙을 바꿔주세요)" 
                        className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-800"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                    />
                    <textarea 
                        placeholder="제안하는 내용과 이유를 자세히 적어주세요." 
                        className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                        value={newContent}
                        onChange={e => setNewContent(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                            등록
                        </button>
                    </div>
                </form>
            )}

            <div className="grid gap-4">
                {petitions.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>아직 등록된 청원이 없습니다.<br/>첫 번째 제안자가 되어주세요!</p>
                    </div>
                ) : (
                    petitions.map(petition => {
                        const hasAgreed = petition.agreedUsers?.includes(currentUser?.id);
                        return (
                        <div 
                            key={petition.id} 
                            className={`bg-white p-6 rounded-2xl shadow-sm border transition-all ${petition.agreeCount >= 10 ? 'border-red-400 ring-4 ring-red-50' : 'border-gray-100 hover:border-blue-200'} relative group`}
                        >
                            {currentUser?.type === 'admin' && (
                                <button
                                    onClick={() => {
                                        if (window.confirm("이 청원을 정말 삭제하시겠습니까?")) {
                                            deletePetition(petition.id);
                                        }
                                    }}
                                    className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="청원 삭제"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}

                            <div className="flex justify-between items-start mb-4 pr-10">
                                <div>
                                    {petition.agreeCount >= 10 && (
                                        <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full mb-2 animate-pulse">
                                            🔥 답변 대기 중 (10명 달성!)
                                        </span>
                                    )}
                                    <h3 className="text-xl font-bold text-gray-800">{petition.title}</h3>
                                    <p className="text-sm text-gray-400 mt-1">제안자: {petition.author} • {new Date(petition.createdAt?.toDate()).toLocaleDateString()}</p>
                                </div>
                                <div className="text-center bg-gray-50 px-4 py-2 rounded-xl">
                                    <span className="block text-xs text-gray-400 font-bold mb-1">동의</span>
                                    <span className={`text-2xl font-black ${petition.agreeCount >= 10 ? 'text-red-500' : 'text-blue-600'}`}>
                                        {petition.agreeCount}
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-wrap">{petition.content}</p>
                            <button 
                                onClick={() => {
                                    if(!hasAgreed) agreeToPetition(petition.id, currentUser.id);
                                }}
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                                    petition.agreeCount >= 10 || hasAgreed
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                }`}
                                disabled={petition.agreeCount >= 10 || hasAgreed}
                            >
                                <ThumbsUp className="w-5 h-5" />
                                {petition.agreeCount >= 10 ? '목표 달성 완료!' : hasAgreed ? '이미 동의했습니다' : '동의합니다'}
                            </button>
                        </div>
                    )})
                )}
            </div>
        </div>
    );
};

export default PetitionBoard;
