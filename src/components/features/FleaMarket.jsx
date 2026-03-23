import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { getLocalDateString } from '../../utils/dateUtils';
import { 
  ShoppingBag, 
  Briefcase, 
  Zap, 
  Plus, 
  X, 
  CheckCircle2, 
  Trash2, 
  Users,
  Clock,
  Gamepad2
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: '전체보기', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: '물물교환', label: '물물교환', icon: <ShoppingBag className="w-4 h-4" />, color: 'text-orange-500', bg: 'bg-orange-100' },
  { id: '반짝알바', label: '반짝알바', icon: <Briefcase className="w-4 h-4" />, color: 'text-blue-500', bg: 'bg-blue-100' },
  { id: '반짝번개', label: '반짝번개', icon: <Zap className="w-4 h-4" />, color: 'text-amber-500', bg: 'bg-amber-100' },
  { id: '보드게임', label: '보드게임', icon: <Gamepad2 className="w-4 h-4" />, color: 'text-purple-500', bg: 'bg-purple-100' },
];

const FleaMarket = () => {
    const { 
        currentUser, marketPosts, addMarketPost, updateMarketPostStatus, deleteMarketPost, joinMarketPost, leaveMarketPost,
        boardGames, boardGameRentals, rentBoardGame, returnBoardGame, users
    } = useAppContext();
    const [activeCategory, setActiveCategory] = useState('all');
    const [showWriteModal, setShowWriteModal] = useState(false);
    
    // Form State for Posts
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: '물물교환',
        targetCount: 2 // 반짝번개 모집 인원 (본인 포함)
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State for Board Games
    const [showRentModal, setShowRentModal] = useState(false);
    const [selectedGameToRent, setSelectedGameToRent] = useState(null);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    if (!currentUser) return null;

    const filteredPosts = marketPosts.filter(post => 
        activeCategory === 'all' ? true : post.category === activeCategory
    );

    const handleWriteSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.content.trim()) return;

        setIsSubmitting(true);
        try {
            const postData = {
                title: formData.title.trim(),
                content: formData.content.trim(),
                category: formData.category,
                authorId: currentUser.id,
                authorName: currentUser.name,
                // 번개의 경우 모집인원 저장 (참여자 목록은 addMarketPost에서 []로 초기화됨)
                targetCount: formData.category === '반짝번개' ? Number(formData.targetCount) : null
            };
            await addMarketPost(postData);
            setShowWriteModal(false);
            setFormData({ title: '', content: '', category: '물물교환', targetCount: 2 });
        } catch (error) {
            console.error(error);
            alert("게시글 등록에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getCategoryStyle = (catName) => {
        const cat = CATEGORIES.find(c => c.id === catName);
        return cat ? { color: cat.color, bg: cat.bg, icon: cat.icon } : CATEGORIES[1];
    };

    const handleRentSubmit = async () => {
        if (!selectedGameToRent) return;
        setIsSubmitting(true);
        try {
            // Include full user objects for display
            const participantsData = selectedParticipants.map(id => {
                const u = users.find(user => user.id === id);
                return { id: u.id, name: u.name };
            });
            await rentBoardGame(selectedGameToRent.id, selectedGameToRent.name, participantsData);
            setShowRentModal(false);
            setSelectedGameToRent(null);
            setSelectedParticipants([]);
            setSearchTerm('');
            alert('보드게임을 대여했습니다! 🎮 다 놀고 나면 꼭 반납해주세요.');
        } catch (error) {
            console.error(error);
            alert("대여에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                        <ShoppingBag className="w-7 h-7 text-indigo-500" />
                        우리 반 반짝마켓 🛒
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 font-medium">안 쓰는 물건, 소소한 알바, 재미있는 번개 모임까지!</p>
                </div>
                {activeCategory !== '보드게임' && (
                    <button
                        onClick={() => setShowWriteModal(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-md active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        글쓰기
                    </button>
                )}
            </div>

            {/* Category Tabs */}
            <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap flex-shrink-0 ${
                            activeCategory === cat.id 
                            ? 'bg-gray-800 text-white shadow-md' 
                            : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {cat.label !== '전체보기' && cat.icon}
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Post / Board Game List */}
            {activeCategory === '보드게임' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in">
                    {boardGames.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                            <Gamepad2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">현재 등록된 보드게임이 없습니다.</p>
                            <p className="text-sm text-purple-400 mt-1">문화체육부에 보드게임 등록을 요청해보세요!</p>
                        </div>
                    ) : (
                        boardGames.map(game => {
                            const isAvailable = game.status === 'available';
                            const activeRental = !isAvailable ? boardGameRentals.find(r => r.id === game.currentRentalId) : null;
                            const isMyBorrow = activeRental && activeRental.borrowerId === currentUser.id;

                            // Calculate Duration
                            let durationText = '';
                            if (activeRental) {
                                const start = new Date(activeRental.startTime);
                                const diffMs = Math.max(0, new Date() - start);
                                const diffMins = Math.floor(diffMs / (1000 * 60));
                                if (diffMins < 60) durationText = `${diffMins}분 째`;
                                else durationText = `${Math.floor(diffMins / 60)}시간 ${diffMins % 60}분 째`;
                            }

                            return (
                                <div 
                                    key={game.id} 
                                    className={`bg-white rounded-3xl border p-5 transition-all flex flex-col justify-between h-full
                                        ${!isAvailable ? 'border-purple-200 bg-purple-50/30' : 'border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300'}
                                    `}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner">
                                                <Gamepad2 className="w-6 h-6" />
                                            </div>
                                            <span className={`px-3 py-1 rounded-xl text-xs font-bold ${isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-200 text-purple-800'}`}>
                                                {isAvailable ? '대여 가능' : '대여 중'}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-black text-gray-800 mb-2 truncate" title={game.name}>{game.name}</h3>
                                        
                                        {!isAvailable && activeRental && (
                                            <div className="bg-white/60 p-3 rounded-xl border border-purple-100 text-sm mb-4 space-y-2">
                                                <div className="flex items-center gap-2 font-bold text-gray-700">
                                                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">
                                                        {activeRental.borrowerName[0]}
                                                    </div>
                                                    {activeRental.borrowerName} <span className="text-xs text-purple-600 font-medium">님이 대여함</span>
                                                </div>
                                                {activeRental.participants?.length > 0 && (
                                                    <div className="text-gray-600 flex items-center gap-1.5 text-xs bg-white px-2 py-1.5 rounded-lg border border-gray-100">
                                                        <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                                        <span className="truncate">함께하는 친구: {activeRental.participants.map(p => p.name).join(', ')}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                                                    <span>{new Date(activeRental.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 시작</span>
                                                    <span className="font-bold text-purple-600">{durationText} 이용중</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-100 mt-auto">
                                        {isAvailable ? (
                                            <button
                                                onClick={() => {
                                                    setSelectedGameToRent(game);
                                                    setShowRentModal(true);
                                                    setSearchTerm('');
                                                    setSelectedParticipants([]);
                                                }}
                                                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                                            >
                                                대여하기
                                            </button>
                                        ) : isMyBorrow ? (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('정말 보드게임을 반납하시겠습니까? 빠진 부품이 없는지 확인해주세요!')) {
                                                        returnBoardGame(game.id, activeRental.id);
                                                    }
                                                }}
                                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center shadow-md active:scale-[0.98] animate-pulse hover:animate-none"
                                            >
                                                <CheckCircle2 className="w-5 h-5" />
                                                반납하기 (종료)
                                            </button>
                                        ) : (
                                            <button disabled className="w-full py-3 bg-gray-100 text-gray-400 rounded-2xl font-bold cursor-not-allowed">
                                                다른 친구가 놀고 있어요
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in">
                    {filteredPosts.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">아직 등록된 게시글이 없어요.</p>
                            <p className="text-sm text-gray-400 mt-1">첫 번째 글을 작성해 보세요!</p>
                        </div>
                    ) : (
                        filteredPosts.map(post => {
                            const isCompleted = post.status === 'completed';
                            const isMyPost = post.authorId === currentUser.id;
                            const style = getCategoryStyle(post.category);
                            const participants = post.participants || [];
                            const isJoined = participants.some(p => p.id === currentUser.id);
                            const isFull = post.category === '반짝번개' && (participants.length + 1) >= post.targetCount;

                            return (
                                <div 
                                    key={post.id} 
                                    className={`bg-white rounded-3xl border p-5 transition-all
                                        ${isCompleted ? 'border-gray-200' : 'border-gray-100 shadow-sm hover:shadow-md'}
                                    `}
                                >
                                    <div className={`flex items-start justify-between mb-3 ${isCompleted ? 'opacity-50' : ''}`}>
                                        <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${style.bg} ${style.color}`}>
                                            {style.icon}
                                            {post.category}
                                        </div>
                                        <div className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(post.timestamp).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <h3 className={`text-lg font-bold mb-2 line-clamp-2 ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                        {post.title}
                                    </h3>
                                    <p className={`text-sm mb-4 line-clamp-3 leading-relaxed ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {post.content}
                                    </p>

                                    <div className={`flex items-center justify-between text-sm pt-4 border-t ${isCompleted ? 'border-gray-100 opacity-50 text-gray-400' : 'border-gray-50 text-gray-500 font-medium'}`}>
                                        <span className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                {post.authorName[0]}
                                            </div>
                                            {post.authorName}
                                        </span>
                                        
                                        {/* 번개 모임 인원 표시 */}
                                        {post.category === '반짝번개' && (
                                            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg">
                                                <Users className="w-3.5 h-3.5" />
                                                <span className={`${isFull ? 'text-amber-600 font-bold' : ''}`}>
                                                    {participants.length + 1} / {post.targetCount}명
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* 번개 모임 참여자 목록 (내용이 있을때만) */}
                                    {post.category === '반짝번개' && participants.length > 0 && !isCompleted && (
                                        <div className="mt-3 bg-amber-50/50 rounded-xl p-2.5 flex flex-wrap gap-1.5">
                                            <div className="w-full text-[10px] font-bold text-amber-600 mb-0.5 px-1">함께하는 친구들</div>
                                            {participants.map(p => (
                                                <span key={p.id} className="text-xs bg-white border border-amber-100 text-amber-700 px-2 py-1 rounded-md shadow-sm font-medium">
                                                    {p.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* 액션 버튼 영역 */}
                                    <div className="mt-4 flex gap-2">
                                        {/* 번개 모임 액션 (본인 글이 아닐 때) */}
                                        {post.category === '반짝번개' && !isMyPost && !isCompleted && (
                                            <button
                                                onClick={() => isJoined ? leaveMarketPost(post.id, currentUser.id) : joinMarketPost(post.id, currentUser)}
                                                disabled={!isJoined && isFull}
                                                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-1.5
                                                    ${isJoined 
                                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                                                        : isFull 
                                                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200' 
                                                            : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                    }    
                                                `}
                                            >
                                                <Users className="w-4 h-4" />
                                                {isJoined ? '취소하기' : isFull ? '마감됨' : '함께하기!'}
                                            </button>
                                        )}

                                        {/* 제작자 액션 (완료/삭제) */}
                                        {isMyPost && (
                                            <>
                                                {!isCompleted ? (
                                                    <button
                                                        onClick={() => updateMarketPostStatus(post.id, 'completed')}
                                                        className="flex-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 py-2 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-1.5"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        {post.category === '반짝번개' ? '모집완료' : '거래완료'}
                                                    </button>
                                                ) : (
                                                    <div className="flex-1 bg-gray-50 text-gray-400 py-2 rounded-xl text-sm font-bold flex items-center justify-center">
                                                        완료된 글입니다
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('정말 이 글을 삭제할까요?')) {
                                                            deleteMarketPost(post.id);
                                                        }
                                                    }}
                                                    className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors shrink-0"
                                                    title="삭제"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Write Modal */}
            {showWriteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl relative">
                        <button onClick={() => setShowWriteModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                        
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Plus className="w-6 h-6 text-indigo-500" />
                            마켓 글쓰기
                        </h2>

                        <form onSubmit={handleWriteSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">분류</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                        <button
                                            type="button"
                                            key={cat.id}
                                            onClick={() => setFormData({ ...formData, category: cat.id })}
                                            className={`py-3 rounded-2xl font-bold flex flex-col items-center justify-center gap-1.5 border-2 transition-all
                                                ${formData.category === cat.id 
                                                    ? `border-[currentColor] ${cat.bg} ${cat.color}`
                                                    : 'border-gray-100 bg-white text-gray-400 hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            {cat.icon}
                                            <span className="text-[13px]">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {formData.category === '반짝번개' && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">모집 인원 (나 포함)</label>
                                    <select
                                        value={formData.targetCount}
                                        onChange={(e) => setFormData({ ...formData, targetCount: e.target.value })}
                                        className="w-full border-2 border-gray-200 p-3 rounded-2xl focus:outline-none focus:border-amber-400 bg-amber-50/50 font-bold text-gray-700"
                                    >
                                        {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                            <option key={num} value={num}>{num}명</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">제목</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full border-2 border-gray-200 p-4 rounded-2xl focus:outline-none focus:border-indigo-500 font-bold"
                                    placeholder={
                                        formData.category === '물물교환' ? '어떤 물건을 교환하고 싶나요?' :
                                        formData.category === '반짝알바' ? '어떤 도움이 필요한가요?' :
                                        '무엇을 함께 할까요?'
                                    }
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">상세 내용</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full border-2 border-gray-200 p-4 rounded-2xl focus:outline-none focus:border-indigo-500 min-h-[120px] resize-none text-sm"
                                    placeholder="친구들이 이해하기 쉽게 자세히 적어주세요!"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors mt-2"
                            >
                                {isSubmitting ? '등록 중...' : '등록하기'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Board Game Rent Modal */}
            {showRentModal && selectedGameToRent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative flex flex-col max-h-[90vh]">
                        <button onClick={() => setShowRentModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                        
                        <h2 className="text-xl font-black text-gray-800 mb-2 flex items-center gap-2">
                            <Gamepad2 className="w-6 h-6 text-purple-500" />
                            {selectedGameToRent.name} 대여하기
                        </h2>
                        <p className="text-sm text-gray-500 font-medium mb-6">시작 버튼을 누르면 대여 시간이 기록됩니다.</p>

                        <div className="flex-1 overflow-y-auto min-h-0 hide-scrollbar pr-2 mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-3">누구와 함께 하나요? (다중 선택)</label>
                            
                            {/* Select All or Search could go here if needed, but a simple list is fine */}
                            <div className="grid grid-cols-2 gap-2">
                                {users.filter(u => u.id !== currentUser.id && u.type !== 'admin').map(user => {
                                    const isSelected = selectedParticipants.includes(user.id);
                                    return (
                                        <button
                                            key={user.id}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setSelectedParticipants(prev => prev.filter(id => id !== user.id));
                                                } else {
                                                    setSelectedParticipants(prev => [...prev, user.id]);
                                                }
                                            }}
                                            className={`p-3 rounded-2xl border-2 font-bold text-sm flex items-center gap-2 transition-all text-left
                                                ${isSelected 
                                                    ? 'border-purple-500 bg-purple-50 text-purple-700' 
                                                    : 'border-gray-100 bg-white text-gray-600 hover:border-purple-200 hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${isSelected ? 'bg-purple-500 border-purple-500' : 'border-gray-300'}`}>
                                                {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                                            </div>
                                            <span className="truncate">{user.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-auto shrink-0 pt-4 border-t border-gray-100">
                            <button
                                onClick={handleRentSubmit}
                                disabled={isSubmitting}
                                className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? '처리 중...' : '시작 (대여하기)'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FleaMarket;
