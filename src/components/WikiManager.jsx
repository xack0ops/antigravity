import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Search, Plus, Trash2, Edit2, Save, X, BookOpen } from 'lucide-react';

const WikiManager = ({ onClose }) => {
    const { wikiEntries, addWikiEntry, updateWikiEntry, deleteWikiEntry } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        category: '규칙',
        content: '',
        relatedDept: '',
        keywords: ''
    });
    const [isAdding, setIsAdding] = useState(false);

    const categories = ['규칙', '환경', '경제', '생활', '시설', '매뉴얼', '기타'];

    const filteredEntries = wikiEntries.filter(entry => 
        entry.title.includes(searchTerm) || 
        entry.content.includes(searchTerm)
    );

    const handleEdit = (entry) => {
        setEditingId(entry.id);
        setFormData({
            title: entry.title,
            category: entry.category,
            content: entry.content,
            relatedDept: entry.relatedDept,
            keywords: entry.keywords.join(', ')
        });
        setIsAdding(false);
    };

    const handleAddNew = () => {
        setEditingId(null);
        setFormData({
            title: '',
            category: '규칙',
            content: '',
            relatedDept: '',
            keywords: ''
        });
        setIsAdding(true);
    };

    const handleSave = async () => {
        const entryData = {
            ...formData,
            keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k)
        };

        if (isAdding) {
            await addWikiEntry(entryData);
            setIsAdding(false);
        } else {
            await updateWikiEntry(editingId, entryData);
            setEditingId(null);
        }
        alert('저장되었습니다.');
    };

    const handleDelete = async (id) => {
        if(window.confirm('정말 삭제하시겠습니까?')) {
            await deleteWikiEntry(id);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-indigo-600"/> 물어보살 관리자
                </h3>
                <button 
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 font-bold text-sm"
                >
                    ✕ 닫기
                </button>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="제목 또는 내용 검색..."
                        className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={handleAddNew}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> 추가
                </button>
            </div>

            <div className="flex-1 overflow-hidden flex gap-6">
                {/* List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {filteredEntries.map(entry => (
                        <div 
                            key={entry.id} 
                            onClick={() => handleEdit(entry)}
                            className={`p-4 border rounded-xl cursor-pointer transition-all ${editingId === entry.id ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-gray-200 hover:border-indigo-300'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">
                                    {entry.category}
                                </span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <h4 className="font-bold text-gray-800 mb-1">{entry.title}</h4>
                            <p className="text-sm text-gray-500 line-clamp-2">{entry.content}</p>
                        </div>
                    ))}
                </div>

                {/* Editor */}
                {(isAdding || editingId) && (
                    <div className="w-96 bg-gray-50 p-6 rounded-xl border border-gray-200 overflow-y-auto animate-in slide-in-from-right-4">
                        <h4 className="font-bold text-lg mb-4 text-gray-800">
                            {isAdding ? '새 항목 추가' : '항목 수정'}
                        </h4>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">카테고리</label>
                                <select 
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.category}
                                    onChange={e => setFormData({...formData, category: e.target.value})}
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">제목</label>
                                <input 
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">관련 부서</label>
                                <input 
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.relatedDept}
                                    onChange={e => setFormData({...formData, relatedDept: e.target.value})}
                                    placeholder="예: 환경부"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">내용</label>
                                <textarea 
                                    className="w-full p-2 border rounded-lg h-32"
                                    value={formData.content}
                                    onChange={e => setFormData({...formData, content: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">검색 키워드 (쉼표로 구분)</label>
                                <input 
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.keywords}
                                    onChange={e => setFormData({...formData, keywords: e.target.value})}
                                    placeholder="예: 청소, 빗자루"
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button 
                                    onClick={handleSave}
                                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 items-center justify-center flex gap-2"
                                >
                                    <Save className="w-4 h-4" /> 저장
                                </button>
                                <button 
                                    onClick={() => { setEditingId(null); setIsAdding(false); }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WikiManager;
