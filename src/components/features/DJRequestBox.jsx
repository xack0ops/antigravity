import React, { useState, useEffect } from 'react';
import { subscribeToCollection, addSongRequest, toggleSongPlayed, deleteSongRequest } from '../../utils/firebaseUtils';
import { Music, Mic2, PlayCircle, Clock, Trash2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const DJRequestBox = () => {
    const { currentUser } = useAppContext();
    const isAdmin = currentUser?.type === 'admin';
    const [requests, setRequests] = useState([]);
    const [isWriting, setIsWriting] = useState(false);
    
    // Form State
    const [title, setTitle] = useState('');
    const [singer, setSinger] = useState('');
    const [story, setStory] = useState('');

    useEffect(() => {
        const unsub = subscribeToCollection('song_requests', setRequests);
        return () => unsub();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!title || !singer) return;
        
        try {
            await addSongRequest(title, singer, currentUser?.name || '익명', story);
            alert('노래 신청이 완료되었습니다!');
            setIsWriting(false);
            setTitle('');
            setSinger('');
            setStory('');
        } catch (error) {
            console.error("Error adding song request:", error);
            alert('신청 중 오류가 발생했습니다.');
        }
    };

    const handleDelete = async (requestId) => {
        if(window.confirm('정말 이 신청곡을 삭제하시겠습니까?')) {
            try {
                await deleteSongRequest(requestId);
            } catch(error) {
                console.error("Delete failed:", error);
                alert('삭제 실패. 권한이 있는지 확인하세요.');
            }
        }
    };

    const handleTogglePlay = async (requestId, currentStatus) => {
        try {
            await toggleSongPlayed(requestId, currentStatus);
        } catch (error) {
             console.error("Toggle play failed:", error);
             alert('상태 변경 실패.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 text-white text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Music className="w-32 h-32" />
                </div>
                <h2 className="text-3xl font-black mb-2 relative z-10">🎵 점심시간 DJ 신청곡</h2>
                <p className="opacity-90 relative z-10">듣고 싶은 노래를 신청하면 DJ가 틀어드려요!</p>
                
                <button 
                    onClick={() => setIsWriting(!isWriting)}
                    className="mt-6 bg-white text-pink-600 px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all relative z-10 flex items-center gap-2 mx-auto"
                >
                    <Mic2 className="w-5 h-5" />
                    노래 신청하기
                </button>
            </div>

            {isWriting && (
                <form onSubmit={handleSubmit} className="bg-pink-50 p-6 rounded-2xl border border-pink-100 animate-in zoom-in-95 space-y-4 shadow-sm">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                            type="text" 
                            placeholder="노래 제목" 
                            className="px-4 py-3 rounded-xl border border-pink-200 outline-none focus:ring-2 focus:ring-pink-500"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                        <input 
                            type="text" 
                            placeholder="가수 이름" 
                            className="px-4 py-3 rounded-xl border border-pink-200 outline-none focus:ring-2 focus:ring-pink-500"
                            value={singer}
                            onChange={e => setSinger(e.target.value)}
                        />
                   </div>
                    <textarea 
                        placeholder="사연이 있다면 적어주세요 (선택)" 
                        className="w-full px-4 py-3 rounded-xl border border-pink-200 outline-none h-24 resize-none"
                        value={story}
                        onChange={e => setStory(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <button type="submit" className="bg-pink-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-600 transition-colors">
                            제출
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-3">
                {requests.map(req => (
                    <div 
                        key={req.id} 
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${req.played ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-pink-100 hover:shadow-md'}`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${req.played ? 'bg-gray-200 text-gray-400' : 'bg-pink-100 text-pink-500'}`}>
                            {req.played ? <Clock className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className={`font-bold text-lg truncate ${req.played ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{req.title}</h4>
                            <p className="text-sm text-gray-500 truncate">{req.singer} • 신청: {req.requester}</p>
                            {req.story && <p className="text-xs text-gray-400 mt-1 italic truncate">"{req.story}"</p>}
                        </div>
                        
                        {isAdmin && (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleTogglePlay(req.id, req.played)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${req.played ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                >
                                    {req.played ? '재생 취소' : '재생'}
                                </button>
                                <button 
                                    onClick={() => handleDelete(req.id)}
                                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                    title="삭제하기"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                
                {requests.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                        <p>아직 신청곡이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DJRequestBox;
