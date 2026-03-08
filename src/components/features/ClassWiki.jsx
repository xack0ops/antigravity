import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Search, BookOpen, Scale, Sparkles, AlertCircle, Coins, HeartHandshake, Users } from 'lucide-react';
import { SUGGESTED_SEARCHES } from '../../data/wikiData';

const ClassWiki = () => {
    const { wikiEntries, users, ministries } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [activeTab, setActiveTab] = useState('search');

    const filteredData = wikiEntries.filter(item => {
        const matchesSearch = 
            item.title.includes(searchTerm) || 
            item.content.includes(searchTerm) ||
            item.keywords.some(k => k.includes(searchTerm));
        const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
        
        return matchesSearch && matchesCategory;
    });

    const getIconForCategory = (cat) => {
        switch(cat) {
            case '규칙': return <Scale className="w-5 h-5 text-red-500" />;
            case '환경': return <Sparkles className="w-5 h-5 text-green-500" />;
            case '경제': return <Coins className="w-5 h-5 text-yellow-500" />;
            case '생활': return <HeartHandshake className="w-5 h-5 text-blue-500" />;
            default: return <BookOpen className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-black text-gray-800">
                     무엇이든 <span className="text-indigo-600">물어보살</span> 🔮
                </h1>
                <p className="text-gray-500">선생님께 질문하기 전, 스스로 답을 찾아보세요!</p>
            </div>

            {/* Inner App Tab Navigator for ClassWiki */}
            <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1 overflow-hidden max-w-sm mx-auto mb-6">
                <button
                    onClick={() => setActiveTab('search')}
                    className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${
                        activeTab === 'search'
                            ? 'bg-indigo-50 text-indigo-600 my-0 shadow-sm'
                            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                    }`}
                >
                    <Search className="w-5 h-5" />
                    규칙 찾기
                </button>
                <button
                    onClick={() => setActiveTab('ministry_status')}
                    className={`flex-1 py-3 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${
                        activeTab === 'ministry_status'
                            ? 'bg-indigo-50 text-indigo-600 my-0 shadow-sm'
                            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                    }`}
                >
                    <Users className="w-5 h-5" />
                    부서 현황
                </button>
            </div>

            {activeTab === 'search' && (
                <div className="animate-in fade-in duration-300 space-y-8">
                    {/* Search Bar */}
                    <div className="max-w-xl mx-auto relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="w-6 h-6 text-gray-400" />
                        </div>
                <input 
                    type="text" 
                    placeholder="무엇이 궁금한가요? (예: 청소, 벌점)" 
                    className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all text-lg font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Suggested Chips */}
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                {SUGGESTED_SEARCHES.map(keyword => (
                    <button
                        key={keyword}
                        onClick={() => setSearchTerm(keyword)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                    >
                        # {keyword}
                    </button>
                ))}
            </div>

            {/* Results Grid */}
            {filteredData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredData.map(item => (
                        <div key={item.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                                        {getIconForCategory(item.category)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-indigo-700 transition-colors">{item.title}</h3>
                                        <span className="text-xs font-bold text-gray-400">{item.relatedDept}</span>
                                    </div>
                                </div>
                                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md font-medium">
                                    {item.category}
                                </span>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                {item.content}
                            </div>
                            <div className="mt-4 flex flex-wrap gap-1">
                                {item.keywords.map(k => (
                                    <span key={k} className="text-xs text-gray-400">#{k}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                     <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-600">검색 결과가 없어요</h3>
                    <p className="text-gray-400 mt-2">다른 단어로 검색해보거나 선생님께 직접 여쭤보세요!</p>
                </div>
                    )}
                </div>
            )}

            {/* ======================== */}
            {/* MINISTRY STATUS TAB */}
            {/* ======================== */}
            {activeTab === 'ministry_status' && (() => {
                const studentsList = users.filter(u => u.type === 'student').sort((a, b) => a.name.localeCompare(b.name));
                const ministryGroups = (ministries || []).map(m => {
                    return {
                        ...m,
                        students: studentsList.filter(s => s.ministryId === m.id)
                    };
                });
                const unassigned = studentsList.filter(s => !s.ministryId);

                return (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="grid gap-4 md:grid-cols-2">
                            {ministryGroups.map(m => (
                                <div key={m.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col hover:border-indigo-200 transition-colors">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl shadow-sm border border-indigo-100">
                                            {m.icon || m.emoji || '🏢'}
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-800">{m.name}</h3>
                                        <span className="ml-auto bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">{m.students.length}명</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {m.students.length > 0 ? m.students.map(s => (
                                            <span key={s.id} className="bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-100 transition-colors cursor-default">
                                                {s.name}
                                            </span>
                                        )) : (
                                            <span className="text-sm text-gray-400 italic py-1">소속 학생이 없습니다</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {unassigned.length > 0 && (
                            <div className="mt-6 bg-gray-50 p-5 rounded-2xl border border-dashed border-gray-200">
                                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                    미배정 학생 <span className="text-sm text-gray-500 font-normal ml-1">({unassigned.length}명)</span>
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {unassigned.map(s => (
                                        <span key={s.id} className="bg-white text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium">
                                            {s.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })()}
        </div>
    );
};

export default ClassWiki;
