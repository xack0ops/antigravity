import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Trash2, Clock, Users, PlaySquare, History } from 'lucide-react';

const BoardGameManager = () => {
    const { currentUser, boardGames, boardGameRentals, addBoardGame, deleteBoardGame, deleteBoardGameRental } = useAppContext();
    const [newGameName, setNewGameName] = useState('');
    
    const isAdmin = currentUser?.type === 'admin';

    const handleAddGame = async (e) => {
        e.preventDefault();
        if (!newGameName.trim()) return;
        await addBoardGame(newGameName.trim());
        setNewGameName('');
    };

    const activeRentals = boardGameRentals.filter(r => r.status === 'active');
    const completedRentals = boardGameRentals.filter(r => r.status === 'completed').slice(0, 50); // 최근 50건
    
    // Helper to calculate duration since start time
    const getDuration = (startTimeIso) => {
        const start = new Date(startTimeIso);
        const now = new Date();
        const diffMs = Math.max(0, now - start);
        const diffMins = Math.floor(diffMs / (1000 * 60));
        if (diffMins < 60) return `${diffMins}분`;
        const diffHours = Math.floor(diffMins / 60);
        return `${diffHours}시간 ${diffMins % 60}분`;
    };

    // Helper to calculate duration for completed rentals
    const getCompletedDuration = (startTimeIso, endTimeIso) => {
        if (!endTimeIso) return '-';
        const start = new Date(startTimeIso);
        const end = new Date(endTimeIso);
        const diffMs = Math.max(0, end - start);
        const diffMins = Math.floor(diffMs / (1000 * 60));
        if (diffMins < 60) return `${diffMins}분`;
        const diffHours = Math.floor(diffMins / 60);
        return `${diffHours}시간 ${diffMins % 60}분`;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 relative z-10">
            {/* Active Rentals Panel */}
            <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm relative overflow-visible">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 relative z-10">
                    <PlaySquare className="w-5 h-5 text-purple-500" />
                    현재 대여 중인 게임
                </h3>
                <div className="space-y-3 relative z-10">
                    {activeRentals.length === 0 ? (
                        <div className="p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-500 font-medium border border-gray-100">
                            현재 대여 중인 보드게임이 없습니다.
                        </div>
                    ) : (
                        activeRentals.map(rental => (
                            <div key={rental.id} className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                        {rental.gameName}
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">대여 중</span>
                                    </h4>
                                    <div className="text-sm text-gray-600 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <div className="flex items-center gap-1.5 font-medium">
                                            <div className="w-5 h-5 bg-purple-200 text-purple-800 rounded-full flex items-center justify-center text-[10px] font-bold">
                                                {rental.borrowerName[0]}
                                            </div>
                                            {rental.borrowerName}
                                            {rental.participants?.length > 0 && ` 외 ${rental.participants.length}명`}
                                        </div>
                                        {rental.participants?.length > 0 && (
                                            <div className="text-gray-500 flex items-center gap-1 text-xs bg-white px-2 py-0.5 rounded-md border border-purple-100">
                                                <Users className="w-3.5 h-3.5 text-purple-400" />
                                                {rental.participants.map(p => p.name).join(', ')}
                                            </div>
                                        )}
                                        <div className="text-gray-500 flex items-center gap-1 text-xs">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(rental.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 빌림
                                            <span className="text-purple-600 font-bold ml-1">({getDuration(rental.startTime)}째 사용중)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Board Game Catalog */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm relative overflow-visible">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        보드게임 목록 관리
                    </h3>
                    <form onSubmit={handleAddGame} className="flex gap-2">
                        <input
                            type="text"
                            value={newGameName}
                            onChange={(e) => setNewGameName(e.target.value)}
                            placeholder="새 게임 이름..."
                            className="text-sm border-2 border-gray-200 rounded-xl px-3 py-2 w-full sm:w-48 focus:outline-none focus:border-purple-400 font-bold text-gray-800"
                        />
                        <button
                            type="submit"
                            disabled={!newGameName.trim()}
                            className="bg-purple-600 hover:bg-purple-700 text-white p-2.5 rounded-xl transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="등록하기"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </form>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10">
                    {boardGames.length === 0 ? (
                        <div className="col-span-full py-6 text-center text-sm text-gray-500 border border-dashed border-gray-200 rounded-xl">
                            등록된 보드게임이 없습니다. 위에서 게임을 등록하세요!
                        </div>
                    ) : (
                        boardGames.map(game => (
                            <div key={game.id} className="flex items-center justify-between p-3 border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl">
                                <div className="flex-1 min-w-0 pr-2">
                                    <h4 className="font-bold text-sm text-gray-800 truncate">{game.name}</h4>
                                    <p className={`text-xs font-bold mt-0.5 ${game.status === 'rented' ? 'text-purple-500' : 'text-emerald-500'}`}>
                                        {game.status === 'rented' ? '대여 중' : '대여 가능'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        if(window.confirm(`'${game.name}' 보드게임을 목록에서 완전히 삭제하시겠습니까?`)) {
                                            deleteBoardGame(game.id);
                                        }
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors shadow-sm bg-white"
                                    title="삭제"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Rental History Catalog */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm relative overflow-visible">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 relative z-10">
                    <History className="w-5 h-5 text-gray-500" />
                    최근 대여 기록
                </h3>
                
                <div className="space-y-2">
                    {completedRentals.length === 0 ? (
                        <div className="p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-500 font-medium border border-gray-100">
                            아직 대여 기록이 없습니다.
                        </div>
                    ) : (
                        completedRentals.map(rental => (
                            <div key={rental.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <h4 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                                        {rental.gameName}
                                    </h4>
                                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                                        <div className="flex items-center gap-1 font-medium">
                                            <span className="text-gray-700">{rental.borrowerName}</span>
                                            {rental.participants?.length > 0 && ` 외 ${rental.participants.length}명`}
                                        </div>
                                        {rental.participants?.length > 0 && (
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                ({rental.participants.map(p => p.name).join(', ')})
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-xs text-gray-400 flex flex-col sm:items-end gap-0.5">
                                        <div>{new Date(rental.endTime).toLocaleDateString()} {new Date(rental.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ~ {new Date(rental.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                        <div className="font-medium text-gray-500">이용 시간: {getCompletedDuration(rental.startTime, rental.endTime)}</div>
                                    </div>
                                    {isAdmin && (
                                        <button
                                            onClick={() => {
                                                if (window.confirm('이 대여 기록을 정말 삭제하시겠습니까?')) {
                                                    deleteBoardGameRental(rental.id);
                                                }
                                            }}
                                            className="p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors shrink-0"
                                            title="기록 삭제"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default BoardGameManager;
