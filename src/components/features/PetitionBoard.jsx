import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { subscribeToCollection, addPetition, agreeToPetition, deletePetition, subscribeToDoc, updateFeatureData } from '../../utils/firebaseUtils';
import { ThumbsUp, PenTool, AlertCircle, Trash2, BookOpen, MessageSquare, Gavel, Save, X, Edit3 } from 'lucide-react';

const DEFAULT_GUIDES = {
    jah: {
        title: "🏛️ 육삼랜드 정기 국회: '좋.아.해' 주간 회의 시나리오",
        description: "💡 [좋.아.해 정기 국회]란? 매주 금요일(또는 정해진 요일)에 열리는 일상적인 회의입니다. 한 주 동안 우리 반의 '좋'은 점(칭찬, 부서 성과), '아'쉬운 점(문제점, 불편한 점)을 나누고, 이를 '해'결할 방법(해결책, 다음 주 계획)을 함께 의논하는 부드럽고 긍정적인 회의 방식입니다.",
        script: `[개회 선언 및 서기 임명]
국회의장: "지금부터 제 [몇]주 차 육삼랜드 정기 국회를 시작하겠습니다. 모두 바른 자세로 앉아 주시기 바랍니다. 오늘 회의의 서기(기록)는 [서기 학생 이름] 의원님께서 수고해 주시겠습니다. 오늘 회의는 우리 반의 한 주를 돌아보는 '좋.아.해' 순서로 진행하겠습니다."

[1단계: 좋 - 좋은 점 나누기 (칭찬 및 성과)]
국회의장: "첫 번째 순서는 '좋(좋은 점)'입니다. 우선 각 부서별로 이번주에 어떤 일을 했는지 업무 보고부터 하겠습니다. 이번 주 우리 육삼랜드에서 좋았던 일, 각 부서에서 잘 해낸 일, 혹은 칭찬하고 싶은 친구가 있다면 자유롭게 발표해 주십시오."

[2단계: 아 - 아쉬운 점 나누기 (불편 사항 및 문제점)]
국회의장: "두 번째 순서는 '아(아쉬운 점)'입니다. 이번 주 생활하면서 불편했던 점, 각 부서에서 일을 하며 힘들었던 점이나 우리 반이 고쳐야 할 문제가 있다면 말씀해 주십시오."

[3단계: 해 - 해결 방법 찾기 및 다음 주 계획]
국회의장: "마지막 순서는 '해(해결 방법)'입니다. 불평만 하고 끝나면 안 되겠죠? 방금 나온 '아쉬운 점'들을 어떻게 해결하면 좋을지, 구체적인 아이디어나 다음 주 부서 계획을 말씀해 주십시오."

[폐회 선언]
국회의장: "이상으로 오늘 준비된 '좋.아.해' 순서를 모두 마쳤습니다. 다음 한 주도 스스로 문제를 해결하고 발전하는 육삼랜드 국민이 되어주시길 바랍니다. 이것으로 제 [몇]주 차 육삼랜드 정기 국회를 모두 마치겠습니다. 땅! 땅! 땅!"`
    },
    petition: {
        title: "🏛️ 육삼랜드 국회 시나리오: 우리 반 청원 심사 및 규칙 만들기",
        description: "💡 [학급 청원 회의]란? 학급 게시판에 올라온 건의사항 중, 일정 수(10명) 이상의 동의 받은 안건만 국회의 정식 회의 주제로 다룹니다. 감정적인 불평불만을 줄이고, 다수가 공감하는 진짜 문제를 효율적으로 해결하는 실제 민주주의 방식입니다.",
        script: `[1단계: 회의 시작 및 청원 내용 발표]
국회의장: "지금부터 제 [몇]회 육삼랜드 국회를 시작하겠습니다. 오늘 서기(기록)는 [서기 학생 이름] 의원님께서 수고해 주시겠습니다. 오늘 다룰 핵심 주제는 육삼랜드 국민 [동의한 인원수]명의 서명을 받아 정식으로 뽑힌 [청원 제목] 청원입니다."

[2단계: 궁금한 점 묻고 답하기]
국회의장: "본격적인 찬성/반대 토론에 앞서, 이 내용에 대해 궁금한 점이 있거나 진짜로 할 수 있는 일인지 확인하고 싶은 의원님들은 질문해 주시기 바랍니다."

[3단계: 찬성/반대 토론 및 내용 고치기]
국회의장: "궁금증이 어느 정도 해결된 것 같습니다. 지금부터 이 법안에 대한 찬성 또는 반대 의견을 듣겠습니다."

[4단계: 최종 투표]
국회의장: "충분히 토론이 진행되었습니다. 그럼 최종 투표를 시작하겠습니다. 처음 제안(원안)과 고친 제안(수정안)에 대해 투표하겠습니다."

[5단계: 회의 마무리 및 새 규칙 발표]
국회의장: "투표 결과 발표하겠습니다. 통과된 규칙은 내일부터 즉시 우리 반에 적용됩니다. 이상으로 제 [몇]회 육삼랜드 국회를 모두 마치겠습니다. 땅! 땅! 땅!"`
    }
};

const PetitionBoard = () => {
    const { currentUser } = useAppContext();
    const [petitions, setPetitions] = useState([]);
    const [isWriting, setIsWriting] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [activeTab, setActiveTab] = useState('petitions');
    const [guides, setGuides] = useState(DEFAULT_GUIDES);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(null);

    useEffect(() => {
        const unsubPetitions = subscribeToCollection('petitions', async (data) => {
            const now = new Date();
            const validPetitions = [];
            const expiredPetitionIds = [];

            data.forEach(petition => {
                if (petition.agreeCount < 10) {
                    const createdAt = petition.createdAt?.toDate ? petition.createdAt.toDate() : (petition.createdAt ? new Date(petition.createdAt) : null);
                    
                    if (createdAt) {
                        const diffTime = Math.abs(now - createdAt);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (diffDays > 14) {
                            expiredPetitionIds.push(petition.id);
                        } else {
                            validPetitions.push(petition);
                        }
                    } else {
                        validPetitions.push(petition);
                    }
                } else {
                    validPetitions.push(petition);
                }
            });

            setPetitions(validPetitions);

            if (expiredPetitionIds.length > 0) {
                for (const id of expiredPetitionIds) {
                    try {
                        await deletePetition(id);
                    } catch (error) {
                        console.error("Failed to auto-delete petition:", id, error);
                    }
                }
            }
        });
        const unsubGuides = subscribeToDoc('features', 'assembly_guides', (data) => {
            if (data) {
                setGuides({
                    jah: data.jah || DEFAULT_GUIDES.jah,
                    petition: data.petition || DEFAULT_GUIDES.petition
                });
            }
        });

        return () => {
            unsubPetitions();
            unsubGuides();
        };
    }, []);

    const handleEditStart = () => {
        setEditData({ 
            jah: { ...guides.jah },
            petition: { ...guides.petition }
        });
        setIsEditing(true);
    };

    const handleEditCancel = () => {
        setIsEditing(false);
        setEditData(null);
    };

    const handleSaveGuides = async () => {
        try {
            await updateFeatureData('assembly_guides', editData);
            setIsEditing(false);
            setEditData(null);
            alert('가이드가 성공적으로 저장되었습니다.');
        } catch (error) {
            console.error('Error saving guides:', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">🏛️ 국무회의 청원 게시판</h2>
                    <p className="text-gray-500 text-sm mt-1">우리 반을 위한 좋은 의견을 제안해주세요!</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => { setActiveTab('petitions'); setIsEditing(false); }}
                        className={`px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm ${activeTab === 'petitions' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        <MessageSquare className="w-4 h-4" /> 청원 목록
                    </button>
                    <button onClick={() => { setActiveTab('guide'); setIsEditing(false); }}
                        className={`px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm ${activeTab === 'guide' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        <BookOpen className="w-4 h-4" /> 좋.아.해 회의 가이드
                    </button>
                    <button onClick={() => { setActiveTab('petitionGuide'); setIsEditing(false); }}
                        className={`px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm ${activeTab === 'petitionGuide' ? 'bg-teal-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        <Gavel className="w-4 h-4" /> 청원 심사 가이드
                    </button>
                    
                    {currentUser?.type === 'admin' && (activeTab === 'guide' || activeTab === 'petitionGuide') && (
                        <div className="flex items-center gap-2 ml-auto">
                            {isEditing ? (
                                <>
                                    <button onClick={handleSaveGuides} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-md">
                                        <Save className="w-4 h-4" /> 저장
                                    </button>
                                    <button onClick={handleEditCancel} className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-600 transition-all shadow-md">
                                        <X className="w-4 h-4" /> 취소
                                    </button>
                                </>
                            ) : (
                                <button onClick={handleEditStart} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md">
                                    <Edit3 className="w-4 h-4" /> 가이드 수정
                                </button>
                            )}
                        </div>
                    )}

                    {activeTab === 'petitions' && (
                        <button 
                            onClick={() => setIsWriting(!isWriting)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 ml-auto md:ml-2"
                        >
                            <PenTool className="w-4 h-4" />
                            {isWriting ? '닫기' : '청원하기'}
                        </button>
                    )}
                </div>
            </div>

            {activeTab === 'petitions' && (
                <div className="space-y-6">
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
                                            <p className="text-sm text-gray-400 mt-1">제안자: {petition.author} • {petition.createdAt ? new Date(petition.createdAt.toDate()).toLocaleDateString() : ''}</p>
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
            )}

            {activeTab === 'guide' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden text-left">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center">
                            {isEditing ? (
                                <div className="space-y-4 max-w-4xl mx-auto text-left">
                                    <label className="text-xs font-bold text-blue-200 uppercase tracking-wider">제목 수정</label>
                                    <input 
                                        type="text"
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 font-black text-2xl focus:bg-white/20 outline-none text-white placeholder:text-white/50"
                                        value={editData.jah.title}
                                        onChange={e => setEditData({...editData, jah: {...editData.jah, title: e.target.value}})}
                                    />
                                    <label className="text-xs font-bold text-blue-200 uppercase tracking-wider block mt-4">설명 수정</label>
                                    <textarea 
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm font-medium leading-relaxed focus:bg-white/20 outline-none text-white placeholder:text-white/50 min-h-[100px]"
                                        value={editData.jah.description}
                                        onChange={e => setEditData({...editData, jah: {...editData.jah, description: e.target.value}})}
                                    />
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-black mb-2">{guides.jah.title}</h2>
                                    <p className="text-blue-100 font-medium text-sm max-w-2xl mx-auto leading-relaxed mt-4 bg-blue-800/30 p-4 rounded-xl">
                                        {guides.jah.description}
                                    </p>
                                </>
                            )}
                        </div>

                        <div className="p-6 md:p-8">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-gray-500 flex items-center gap-2">
                                        <Edit3 className="w-4 h-4" /> 상세 진행 대본 수정
                                    </label>
                                    <textarea 
                                        className="w-full min-h-[500px] p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm leading-relaxed"
                                        value={editData.jah.script}
                                        onChange={e => setEditData({...editData, jah: {...editData.jah, script: e.target.value}})}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {guides.jah.script.split('\n\n').map((section, idx) => {
                                        const isStep = section.startsWith('[');
                                        return (
                                            <div key={idx} className={`${isStep ? 'bg-indigo-50 p-5 rounded-2xl border-l-4 border-indigo-500 font-bold text-indigo-900 mt-8 first:mt-0' : 'pl-4 text-gray-700 leading-relaxed whitespace-pre-wrap'}`}>
                                                {section}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'petitionGuide' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white rounded-2xl border border-teal-100 shadow-sm overflow-hidden text-left">
                        <div className="bg-gradient-to-r from-teal-600 to-emerald-700 p-6 text-white text-center">
                            {isEditing ? (
                                <div className="space-y-4 max-w-4xl mx-auto text-left">
                                    <label className="text-xs font-bold text-teal-200 uppercase tracking-wider">제목 수정</label>
                                    <input 
                                        type="text"
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 font-black text-2xl focus:bg-white/20 outline-none text-white placeholder:text-white/50"
                                        value={editData.petition.title}
                                        onChange={e => setEditData({...editData, petition: {...editData.petition, title: e.target.value}})}
                                    />
                                    <label className="text-xs font-bold text-teal-200 uppercase tracking-wider block mt-4">설명 수정</label>
                                    <textarea 
                                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm font-medium leading-relaxed focus:bg-white/20 outline-none text-white placeholder:text-white/50 min-h-[100px]"
                                        value={editData.petition.description}
                                        onChange={e => setEditData({...editData, petition: {...editData.petition, description: e.target.value}})}
                                    />
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-black mb-2">{guides.petition.title}</h2>
                                    <p className="text-teal-100 font-medium text-sm max-w-2xl mx-auto leading-relaxed mt-4 bg-teal-800/30 p-4 rounded-xl">
                                        {guides.petition.description}
                                    </p>
                                </>
                            )}
                        </div>

                        <div className="p-6 md:p-8">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-gray-500 flex items-center gap-2">
                                        <Edit3 className="w-4 h-4" /> 상세 진행 대본 수정
                                    </label>
                                    <textarea 
                                        className="w-full min-h-[500px] p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none font-mono text-sm leading-relaxed"
                                        value={editData.petition.script}
                                        onChange={e => setEditData({...editData, petition: {...editData.petition, script: e.target.value}})}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {guides.petition.script.split('\n\n').map((section, idx) => {
                                        const isStep = section.startsWith('[');
                                        return (
                                            <div key={idx} className={`${isStep ? 'bg-teal-50 p-5 rounded-2xl border-l-4 border-teal-500 font-bold text-teal-900 mt-8 first:mt-0' : 'pl-4 text-gray-700 leading-relaxed whitespace-pre-wrap'}`}>
                                                {section}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PetitionBoard;
