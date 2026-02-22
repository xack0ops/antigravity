import React, { useState, useEffect } from 'react';
import { subscribeToDoc, updateFeatureData } from '../../utils/firebaseUtils';
import { Camera, ImagePlus, PenLine } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const PhotoFrame = () => {
    const { currentUser } = useAppContext();
    const [photoData, setPhotoData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // Edit Form
    const [url, setUrl] = useState('');
    const [caption, setCaption] = useState('');

    useEffect(() => {
        const unsub = subscribeToDoc('features', 'photo', setPhotoData);
        return () => unsub();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        await updateFeatureData('photo', { url, caption });
        setIsEditing(false);
    };

    // Admin or Media Role check
    const isMediaManager = currentUser?.type === 'admin' || (currentUser?.roleId && currentUser.roleId.includes('media'));

    // Default Placeholder
    const displayUrl = photoData?.url || 'https://images.unsplash.com/photo-1577896335477-2858506f48db?q=80&w=1000&auto=format&fit=crop';
    const displayCaption = photoData?.caption || '우리 반의 소중한 추억을 남겨보세요!';

    return (
        <div className="relative group rounded-3xl overflow-hidden shadow-xl aspect-[16/10] bg-gray-900 border-4 border-white">
            <img 
                src={displayUrl} 
                alt="Today's Best" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-24 text-white">
                <div className="flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <span className="bg-pink-600 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Camera className="w-3 h-3" /> 이달의 포토제닉
                             </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold leading-tight">
                            {displayCaption}
                        </h2>
                    </div>

                    {isMediaManager && (
                        <button 
                            onClick={() => { setIsEditing(true); setUrl(photoData?.url || ''); setCaption(photoData?.caption || ''); }}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-2 rounded-full transition-colors"
                        >
                            <PenLine className="w-5 h-5 text-white" />
                        </button>
                    )}
                </div>
            </div>

            {isEditing && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
                    <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <ImagePlus className="w-5 h-5 text-pink-500" />
                            사진 변경하기
                        </h3>
                        <div>
                            <label className="text-xs font-bold text-gray-500 mb-1 block">이미지 주소 (URL)</label>
                            <input 
                                type="text" 
                                placeholder="https://..." 
                                className="w-full px-3 py-2 border rounded-xl text-sm"
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 mb-1 block">한 줄 설명 (캡션)</label>
                            <input 
                                type="text" 
                                placeholder="사진에 대한 설명을 적어주세요" 
                                className="w-full px-3 py-2 border rounded-xl text-sm"
                                value={caption}
                                onChange={e => setCaption(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">취소</button>
                            <button type="submit" className="px-4 py-2 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700">저장</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PhotoFrame;
