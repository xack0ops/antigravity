import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { LogOut, CheckCircle2, KeyRound, UserPlus, Trash2, ChevronDown, ChevronUp, BookOpen, Wrench, Calendar, X, Scale, BellRing, Sheet, Loader2, ExternalLink, Shield, Star, Plus, Edit2, Gamepad2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { GOOGLE_CLIENT_ID, GOOGLE_SHEETS_SCOPE } from '../googleConfig';
import JudicialSystem from './features/JudicialSystem';
import { INITIAL_DATA, CURRICULUM_DATA } from '../data/mockData';
import { getLocalDateString } from '../utils/dateUtils';
import TimetableEditor from './TimetableEditor';
import WikiManager from './WikiManager';
import JobManagement from './features/JobManagement';
import ScoreManager from './features/ScoreManager';
import LifeNoteManager from './features/LifeNoteManager';
import AssignmentManager from './features/AssignmentManager';
import FineRecordManager from './features/FineRecordManager';
import ClassBudgetAdmin from './features/ClassBudgetAdmin';
import StateCouncil from './features/StateCouncil';
import AdminManual from './features/AdminManual';
import BoardGameManager from './features/BoardGameManager';

const AdminDashboard = () => {
  const { users, roles, tasks, ministries, assignStudentRoles, verifyTask, updatePassword, addUser, deleteUser, logout, fetchAllTimetables, saveTimetable, teacherMessages, deleteTeacherMessage, currentUser, scoreTransactions, scoreShop, addScoreShopItem, updateScoreShopItem, deleteScoreShopItem, getUserScoreSummary, impersonateUser, studentNotices, addStudentNotice, deleteStudentNotice } = useAppContext();
  const [activeTab, setActiveTab] = useState('management'); // 'management', 'curriculum', 'tools', 'judicial', 'messages'
  const [activeTool, setActiveTool] = useState(null); // 'timetable', etc.
  const [showAdminManual, setShowAdminManual] = useState(false);
  
  // Curriculum State
  const [timetables, setTimetables] = useState([]);
  const [curriculumStats, setCurriculumStats] = useState({});
  const [assignmentTab, setAssignmentTab] = useState('life_note'); // 'life_note' or 'assignment'

  useEffect(() => {
      if (activeTab === 'curriculum') {
          loadCurriculumStats();
      }
  }, [activeTab]);

  const loadCurriculumStats = async () => {
      const data = await fetchAllTimetables();
      setTimetables(data);
      calculateStats(data);
  };

  const calculateStats = (data) => {
      const stats = {};
      // Iterate all timetables
      data.forEach(entry => {
          if (!entry.periods) return;
          entry.periods.forEach((p, index) => {
              if (!p) return;
              // Parse string like "[수학] 1단원 - ..."
              const match = p.match(/^\[(.*?)\] (.*?) -/);
              if (match) {
                  const subject = match[1];
                  const unitName = match[2];
                  const key = `${subject}_${unitName}`;
                  
                  if (!stats[key]) stats[key] = { count: 0, lastDate: '1970-01-01', history: [] };
                  
                  stats[key].count += 1;
                  stats[key].history.push({
                      date: entry.id,
                      periodIndex: index,
                      text: p
                  });
                  
                  if (entry.id > stats[key].lastDate) stats[key].lastDate = entry.id;
              }
          });
      });
      // Sort history by date desc
      Object.values(stats).forEach(stat => {
          stat.history.sort((a, b) => b.date.localeCompare(a.date));
      });
      setCurriculumStats(stats);
  };

  const [editingPasswordId, setEditingPasswordId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  
  // Admin Password
  const [adminPassword, setAdminPassword] = useState('');
  const [isEditingAdminPw, setIsEditingAdminPw] = useState(false);
  
  // New User State
  const [newStudentName, setNewStudentName] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  // Expanded Row State
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  
  const students = users.filter(u => u.type === 'student').sort((a,b) => a.name.localeCompare(b.name));
  const pendingTasks = tasks.filter(t => t.status === 'waiting_approval');

  const getStudentName = (roleId) => {
      const student = students.find(s => s.roleIds?.includes(roleId));
      return student ? student.name : '알 수 없음';
  };

  const getMinistryColor = (ministryId) => {
    const ministry = ministries.find(m => m.id === ministryId);
    return ministry ? ministry.color : 'text-gray-500 bg-gray-100';
  };

  const handlePasswordUpdate = (userId) => {
      if(!newPassword) {
          setEditingPasswordId(null);
          return;
      }
      updatePassword(userId, newPassword);
      setEditingPasswordId(null);
      setNewPassword('');
      alert('비밀번호가 변경되었습니다!');
  };

  const handleAddStudent = (e) => {
      e.preventDefault();
      if(newStudentName.trim()) {
          addUser(newStudentName.trim());
          setNewStudentName('');
          setIsAddingStudent(false);
      }
  };

  const handleDeleteStudent = (userId, name) => {
      if(window.confirm(`${name} 학생을 정말 삭제하시겠습니까?`)) {
          deleteUser(userId);
      }
  }

  // Progress Calculation
  const getStudentProgress = (student) => {
      if (!student.roleIds || student.roleIds.length === 0) return { total: 0, done: 0, percent: 0 };
      const studentTasks = tasks.filter(t => student.roleIds.includes(t.roleId));
      if (studentTasks.length === 0) return { total: 0, done: 0, percent: 0 };

      // Done = verified AND completed (self)
      const doneCount = studentTasks.filter(t => 
        t.status === 'verified' || (t.type === 'self' && t.status === 'completed')
      ).length;
      
      const percent = Math.round((doneCount / studentTasks.length) * 100);
      return { total: studentTasks.length, done: doneCount, percent };
  }

  const toggleExpand = (userId) => {
      if (expandedStudentId === userId) setExpandedStudentId(null);
      else setExpandedStudentId(userId);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">선생님 대시보드</h1>
          <p className="text-gray-500">학생들의 역할을 관리하고 업무를 승인해주세요.</p>
        </div>
        <div className="flex gap-2 items-center">
            {isEditingAdminPw ? (
                <div className="flex items-center gap-1">
                    <input 
                        type="text" 
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="새 비밀번호"
                        className="px-2 py-1.5 border rounded-lg text-sm outline-none w-28"
                    />
                    <button 
                        onClick={() => {
                            if(adminPassword) {
                                updatePassword(currentUser.id, adminPassword);
                                alert('비밀번호가 변경되었습니다.');
                            }
                            setIsEditingAdminPw(false);
                            setAdminPassword('');
                        }}
                        className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold"
                    >확인</button>
                    <button onClick={() => setIsEditingAdminPw(false)} className="bg-gray-200 px-3 py-1.5 rounded-lg text-sm font-bold">취소</button>
                </div>
            ) : (
                <button 
                    onClick={() => setIsEditingAdminPw(true)}
                    className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 border border-gray-200 gap-2 text-sm font-bold"
                >
                    <KeyRound className="w-4 h-4" />
                    내 수첩(비번) 변경
                </button>
            )}
            <button 
                onClick={() => setShowAdminManual(true)}
                className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg shadow-sm hover:bg-indigo-100 border border-indigo-200 gap-2 font-bold text-sm transition-colors"
                title="선생님 대시보드 설명서"
            >
                <BookOpen className="w-4 h-4" />
                관리자 설명서
            </button>
            <button 
            onClick={logout}
            className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 border border-gray-200 gap-2 font-bold text-sm"
            >
            <LogOut className="w-4 h-4" />
            로그아웃
            </button>
        </div>
      </div>

       <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('management')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'management'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <UserPlus size={18} />
                학생 관리
              </div>
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'curriculum'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BookOpen size={18} />
                교육과정 및 통계
              </div>
            </button>
             <button
              onClick={() => setActiveTab('tools')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'tools'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Wrench size={18} />
                부서 도구함
              </div>
            </button>
            <button
              onClick={() => setActiveTab('judicial')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'judicial'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Scale size={18} />
                솔로몬의 재판소
              </div>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'messages'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BellRing size={18} />
                학생 전달 메시지
                {teacherMessages.length > 0 && <span className="bg-amber-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{teacherMessages.length}</span>}
              </div>
            </button>
          </div>

          {/* Content Area */}
          <div className="space-y-6">
            {activeTab === 'management' && (
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Student Management Panel */}
                    <div className="bg-white rounded-xl shadow-sm p-6 overflow-hidden flex flex-col max-h-[85vh]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                            학생 관리 & 현황
                        </h2>
                        <button 
                            onClick={() => setIsAddingStudent(!isAddingStudent)}
                            className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition-colors"
                        >
                            <UserPlus className="w-4 h-4" /> 학생 추가
                        </button>
                    </div>

                    {/* Add Student Form */}
                    {isAddingStudent && (
                        <form onSubmit={handleAddStudent} className="mb-4 p-4 bg-blue-50 rounded-xl flex gap-2 animate-in slide-in-from-top-2">
                            <input 
                                type="text" 
                                placeholder="이름을 입력하세요" 
                                className="flex-1 px-3 py-2 rounded-lg border border-blue-200 outline-none focus:ring-2 focus:ring-blue-400"
                                value={newStudentName}
                                onChange={(e) => setNewStudentName(e.target.value)}
                                autoFocus
                            />
                            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600">추가</button>
                        </form>
                    )}

                    <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                        {students.map(student => {
                        const progress = getStudentProgress(student);
                        const isExpanded = expandedStudentId === student.id;
                        
                        return (
                        <div key={student.id} className={`bg-gray-50 rounded-lg border transition-all ${isExpanded ? 'border-blue-300 shadow-md bg-white' : 'border-gray-100 hover:border-blue-200'}`}>
                            {/* Main Row */}
                            <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(student.id)}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 text-lg">
                                        {student.name[0]}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-bold text-gray-800">{student.name}</h3>
                                            {student.ministryId && (() => {
                                                const ministry = ministries.find(m => m.id === student.ministryId);
                                                return ministry ? (
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${ministry.color}`}>
                                                        {ministry.name}
                                                    </span>
                                                ) : null;
                                            })()}
                                            <div className="text-xs font-bold text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">
                                                {progress.done}/{progress.total}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">PW: {student.password || '1234'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Progress Bar (Mini) */}
                                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-green-500 transition-all duration-500" 
                                            style={{ width: `${progress.percent}%` }}
                                        ></div>
                                    </div>
                                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="px-4 pb-4 animate-in slide-in-from-top-1">
                                    <hr className="border-gray-100 mb-4" />
                                    
                                    {/* Task List */}
                                    <div className="mb-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">오늘의 업무 현황</h4>
                                        {progress.total === 0 ? (
                                            <p className="text-sm text-gray-400 italic">부여된 역할/업무가 없습니다.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {tasks.filter(t => student.roleIds?.includes(t.roleId)).map(task => { // Need context tasks
                                                    let statusColor = "bg-gray-100 text-gray-400"; // Pending self or not started
                                                    let statusText = "미완료";
                                                    
                                                    if (task.status === 'verified' || (task.type === 'self' && task.status === 'completed')) {
                                                        statusColor = "bg-green-100 text-green-700";
                                                        statusText = "완료됨";
                                                    } else if (task.status === 'waiting_approval') {
                                                        statusColor = "bg-yellow-100 text-yellow-700";
                                                        statusText = "승인 대기";
                                                    }

                                                    return (
                                                        <div key={task.id} className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-700 truncate mr-2">{task.text}</span>
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap ${statusColor}`}>
                                                                {statusText}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Admin Actions */}
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-3 space-y-4">
                                        {/* Ministry Select */}
                                        <div>
                                            <label className="text-xs text-gray-500 font-bold mb-1 block">소속 부서</label>
                                            <select 
                                                className="w-full px-2 py-1.5 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={student.ministryId || ''}
                                                onChange={(e) => assignStudentRoles(student.id, e.target.value, [])}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <option value="">부서 없음</option>
                                                {ministries.map(m => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Roles Checkboxes */}
                                        {student.ministryId && (
                                            <div>
                                                <label className="text-xs text-gray-500 font-bold mb-2 block">역할 부여 (다중 선택 가능)</label>
                                                <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                                                    {roles.filter(r => r.ministryId === student.ministryId).map(role => (
                                                        <label key={role.id} className="flex items-center gap-2 text-sm bg-white p-2 rounded-lg border border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors">
                                                            <input 
                                                                type="checkbox"
                                                                className="rounded text-blue-500 border-gray-300 w-4 h-4"
                                                                checked={student.roleIds?.includes(role.id)}
                                                                onChange={(e) => {
                                                                    const checked = e.target.checked;
                                                                    let newRoles = [...(student.roleIds || [])];
                                                                    if(checked) newRoles.push(role.id);
                                                                    else newRoles = newRoles.filter(id => id !== role.id);
                                                                    assignStudentRoles(student.id, student.ministryId, newRoles);
                                                                }}
                                                            />
                                                            {role.name}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Password Change */}
                                        <div className="pt-3 border-t border-gray-200">
                                            <label className="text-xs text-gray-500 font-bold mb-2 block">비밀번호 변경</label>
                                            {editingPasswordId === student.id ? (
                                                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                    <input 
                                                        type="text" 
                                                        className="w-full max-w-[150px] px-2 py-1.5 border border-blue-300 rounded-lg text-sm outline-none"
                                                        placeholder="새 암호"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <button onClick={() => handlePasswordUpdate(student.id)} className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold">확인</button>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setEditingPasswordId(student.id); setNewPassword(''); }}
                                                    className="w-auto px-3 py-1.5 border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 rounded-lg text-sm flex items-center justify-center gap-1 font-bold transition-colors"
                                                >
                                                    <KeyRound className="w-3 h-3" />
                                                    새 비밀번호 설정
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Delete Button & Impersonate */}
                                    <div className="mt-3 flex items-center justify-between">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); impersonateUser(student.id); }}
                                            className="text-xs px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-100 font-bold transition-colors flex items-center gap-1"
                                        >
                                            <ExternalLink className="w-3 h-3" /> 이 학생으로 접속 (테스트)
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteStudent(student.id, student.name); }}
                                            className="text-xs text-red-400 hover:text-red-600 hover:underline flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3 h-3" /> 학생 삭제
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        )})}
                    </div>
                    </div>

                    {/* Pending Approvals Panel */}
                    <div className="bg-white rounded-xl shadow-sm p-6 h-fit sticky top-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="w-2 h-8 bg-yellow-500 rounded-full"></div>
                        검사 대기중인 업무
                    </h2>
                    
                    {pendingTasks.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>훌륭합니다! 밀린 검사가 없습니다.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                        {pendingTasks.map(task => {
                            const role = roles.find(r => r.id === task.roleId);
                            const ministry = ministries.find(m => m.id === role?.ministryId);
                            
                            return (
                            <div key={task.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-100 rounded-lg shadow-sm">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${ministry?.color || 'bg-gray-200'}`}>
                                            {ministry?.name || '부서 미정'}
                                        </span>
                                        <span className="text-xs text-gray-500 font-medium">
                                            - {role?.name} ({getStudentName(task.roleId)})
                                        </span>
                                    </div>
                                <p className="font-bold text-gray-800">{task.text}</p>
                                </div>
                                <button
                                onClick={() => verifyTask(task.id)}
                                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600 transition-colors shadow-sm gap-1 hover:shadow-md"
                                >
                                <CheckCircle2 className="w-4 h-4" />
                                참 잘했어요
                                </button>
                            </div>
                            );
                        })}
                        </div>
                    )}
                    </div>
                </div>
            )}

            {activeTab === 'curriculum' && (
                <CurriculumView 
                    stats={curriculumStats} 
                    timetables={timetables}
                    onRefresh={loadCurriculumStats} 
                />
            )}

            {activeTab === 'tools' && (
                <div className="space-y-6">
                    {!activeTool ? (
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {/* Education Ministry Tool */}
                            <button 
                                onClick={() => setActiveTool('timetable_editor')}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all flex flex-col items-center gap-4 group"
                            >
                                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                    <Calendar className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg text-gray-800">시간표 관리자</h3>
                                    <p className="text-gray-400 text-sm mt-1">교육부 권한</p>
                                </div>
                            </button>

                            {/* Placeholders for other tools */}
                            <button 
                                onClick={() => setActiveTool('wiki_manager')}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all flex flex-col items-center gap-4 group"
                            >
                                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                    <BookOpen className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg text-gray-800">물어보살 관리자</h3>
                                    <p className="text-gray-400 text-sm mt-1">지식 데이터베이스</p>
                                </div>
                            </button>

                             <button 
                                onClick={() => setActiveTool('job_management')}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all flex flex-col items-center gap-4 group"
                            >
                                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                    <Shield className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg text-gray-800">업무 및 부서 관리</h3>
                                    <p className="text-gray-400 text-sm mt-1">부서/역할/할 일 설정</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => setActiveTool('score_shop')}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-amber-200 transition-all flex flex-col items-center gap-4 group"
                            >
                                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                                    <Star className="w-8 h-8 text-amber-500 group-hover:text-white transition-colors" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg text-gray-800">점수 관리</h3>
                                    <p className="text-gray-400 text-sm mt-1">사용처 · 전체 현황</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => setActiveTool('life_note')}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-sky-200 transition-all flex flex-col items-center gap-4 group"
                            >
                                <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center group-hover:bg-sky-600 transition-colors">
                                    <BookOpen className="w-8 h-8 text-sky-600 group-hover:text-white transition-colors" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg text-gray-800">과제 점검 (인생노트)</h3>
                                    <p className="text-gray-400 text-sm mt-1">통합 관리 · 교육부 권한</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => setActiveTool('fine_records')}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-yellow-200 transition-all flex flex-col items-center gap-4 group"
                            >
                                <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center group-hover:bg-yellow-600 transition-colors">
                                    <BookOpen className="w-8 h-8 text-yellow-600 group-hover:text-white transition-colors" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg text-gray-800">벌금 기록지</h3>
                                    <p className="text-gray-400 text-sm mt-1">기획재정부 권한</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => setActiveTool('class_budget')}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all flex flex-col items-center gap-4 group"
                            >
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                                    <BookOpen className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg text-gray-800">학급 예산 설정</h3>
                                    <p className="text-gray-400 text-sm mt-1">기획재정부 총 예산</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => setActiveTool('board_game_manager')}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all flex flex-col items-center gap-4 group"
                            >
                                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                                    <Gamepad2 className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg text-gray-800">보드게임 대여장부</h3>
                                    <p className="text-gray-400 text-sm mt-1">문화체육부 관리</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => setActiveTool('petition_board')}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-red-200 transition-all flex flex-col items-center gap-4 group"
                            >
                                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center group-hover:bg-red-600 transition-colors">
                                    <Scale className="w-8 h-8 text-red-600 group-hover:text-white transition-colors" />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg text-gray-800">국무회의 관리</h3>
                                    <p className="text-gray-400 text-sm mt-1">청원/설문 관리 권한</p>
                                </div>
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-in fade-in zoom-in-95 duration-200">
                             <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                                 <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                     {activeTool === 'timetable_editor' && <><Calendar className="w-6 h-6 text-indigo-600"/> 시간표 관리자</>}
                                     {activeTool === 'wiki_manager' && <><BookOpen className="w-6 h-6 text-indigo-600"/> 물어보살 관리자</>}
                                     {activeTool === 'job_management' && <><Shield className="w-6 h-6 text-indigo-600"/> 업무 관리 (조직도 구성)</>}
                                 {activeTool === 'life_note' && <><BookOpen className="w-6 h-6 text-sky-600"/> 과제 / 수행평가 / 인생노트 점검</>}
                                 {activeTool === 'fine_records' && <><BookOpen className="w-6 h-6 text-yellow-600"/> 벌금 기록지</>}
                                 {activeTool === 'class_budget' && <><BookOpen className="w-6 h-6 text-emerald-600"/> 학급 예산 설정</>}
                                 {activeTool === 'petition_board' && <><Scale className="w-6 h-6 text-red-600"/> 국무회의 관리 (청원 · 설문)</>}
                                 {activeTool === 'board_game_manager' && <><Gamepad2 className="w-6 h-6 text-purple-600"/> 보드게임 대여 관리</>}
                                </h3>
                                <button 
                                    onClick={() => setActiveTool(null)}
                                    className="text-gray-400 hover:text-gray-600 font-bold text-sm"
                                >
                                    ✕ 닫기
                                </button>
                             </div>

                             {activeTool === 'timetable_editor' && (
                                 <AdminTimetableManager onSave={saveTimetable} />
                             )}
                             {activeTool === 'wiki_manager' && (
                                 <WikiManager onClose={() => setActiveTool(null)} />
                             )}
                             {activeTool === 'job_management' && (
                                 <JobManagement />
                             )}
                             {activeTool === 'life_note' && (
                                 <div>
                                     <div className="flex gap-2 mb-6 border-b border-gray-100 pb-2">
                                         <button 
                                            onClick={() => setAssignmentTab('life_note')}
                                            className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${assignmentTab === 'life_note' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'}`}
                                         >
                                            일일 인생노트 점검
                                         </button>
                                         <button 
                                            onClick={() => setAssignmentTab('assignment')}
                                            className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors ${assignmentTab === 'assignment' ? 'bg-sky-100 text-sky-700' : 'text-gray-500 hover:bg-gray-50'}`}
                                         >
                                            과제/수행평가 점검
                                         </button>
                                     </div>
                                     {assignmentTab === 'life_note' ? <LifeNoteManager /> : <AssignmentManager />}
                                 </div>
                             )}
                             {activeTool === 'petition_board' && (
                                 <StateCouncil />
                             )}
                             {activeTool === 'score_shop' && (
                                 <ScoreShopAdmin
                                     scoreShop={scoreShop}
                                     scoreTransactions={scoreTransactions}
                                     users={users.filter(u => u.type === 'student')}
                                     addScoreShopItem={addScoreShopItem}
                                     updateScoreShopItem={updateScoreShopItem}
                                     deleteScoreShopItem={deleteScoreShopItem}
                                     getUserScoreSummary={getUserScoreSummary}
                                     ScoreManagerComponent={ScoreManager}
                                 />
                             )}
                             {activeTool === 'fine_records' && (
                                 <FineRecordManager />
                             )}
                             {activeTool === 'class_budget' && (
                                 <ClassBudgetAdmin />
                             )}
                             {activeTool === 'board_game_manager' && (
                                 <BoardGameManager />
                             )}
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'judicial' && (
                <JudicialSystem />
            )}
            {activeTab === 'messages' && (
                <div className="space-y-8">
                    <AdminMessageComposer
                        students={students}
                        onSend={addStudentNotice}
                        sentNotices={studentNotices}
                        onDeleteNotice={deleteStudentNotice}
                    />
                    <MessagesInbox messages={teacherMessages} onDelete={deleteTeacherMessage} />
                </div>
            )}
          </div>
        </div>
        {showAdminManual && <AdminManual onClose={() => setShowAdminManual(false)} />}
    </div>
  );
};

// Internal Component for Admin Timetable Management
const AdminTimetableManager = ({ onSave }) => {
    const { fetchTimetable, currentTimetable } = useAppContext();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [editPeriods, setEditPeriods] = useState(Array(6).fill(''));

    // Fetch on date change
    useEffect(() => {
        const dateStr = getLocalDateString(selectedDate);
        fetchTimetable(dateStr);
    }, [selectedDate]);

    // Sync state
    useEffect(() => {
        setEditPeriods(currentTimetable?.periods || Array(6).fill(''));
    }, [currentTimetable]);

    const handleSave = async (periods) => {
        const dateStr = getLocalDateString(selectedDate);
        await onSave(dateStr, periods);
        alert('시간표가 저장되었습니다.');
    };

    const handleDateChange = (days) => {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + days);
      setSelectedDate(newDate);
    }

    return (
        <div className="max-w-xl mx-auto">
             <div className="flex items-center justify-center gap-4 mb-6 bg-gray-50 p-3 rounded-xl">
                 <button onClick={() => handleDateChange(-1)} className="p-2 hover:bg-white rounded-lg shadow-sm transition-all"><ChevronDown className="w-5 h-5 text-gray-600 rotate-90" /></button>
                 <span className="text-lg font-bold text-gray-700 min-w-[140px] text-center">
                     {selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                 </span>
                 <button onClick={() => handleDateChange(1)} className="p-2 hover:bg-white rounded-lg shadow-sm transition-all"><ChevronUp className="w-5 h-5 text-gray-600 rotate-90" /></button>
             </div>

             <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <TimetableEditor 
                    initialPeriods={editPeriods}
                    onSave={handleSave}
                    onCancel={() => {}} // No cancel action in standalone mode, simply don't save
                />
             </div>
        </div>
    );
}

const CurriculumView = ({ stats, timetables, onRefresh }) => {
    const { saveTimetable } = useAppContext();
    const subjects = Object.keys(CURRICULUM_DATA.subjects);
    const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
    const [historyModalData, setHistoryModalData] = useState(null); // { unitName, history: [] }

    const subjectData = CURRICULUM_DATA.subjects[selectedSubject];
    
    // Flatten units
    const units = selectedSubject === '사회' 
        ? subjectData.units.flatMap(major => major.sub_units)
        : subjectData.units;

    const totalUnits = units.length;
    const startedUnits = units.filter(u => stats[`${selectedSubject}_${u.name}`]?.count > 0).length;
    const progressPercent = Math.round((startedUnits / totalUnits) * 100);

    const handleUnitClick = (unitName) => {
        const key = `${selectedSubject}_${unitName}`;
        const stat = stats[key];
        if (stat?.history?.length > 0) {
            setHistoryModalData({
                unitName,
                history: stat.history
            });
        }
    };

    const handleDeleteHistory = async (date, periodIndex) => {
        if(!window.confirm('정말 이 수업 기록을 삭제하시겠습니까?\n(시간표에서 해당 내용이 지워집니다.)')) return;

        try {
            // Find full timetable for date
            const targetEntry = timetables.find(t => t.id === date);
            if (!targetEntry) return;

            // Create new periods array
            const newPeriods = [...targetEntry.periods];
            newPeriods[periodIndex] = ''; // Clear the slot

            // Save
            await saveTimetable(date, newPeriods);
            
            // Close modal if empty or just refresh
            alert('삭제되었습니다.');
            setHistoryModalData(null); // Close modal to force refresh consistency
            onRefresh();
        } catch (e) {
            console.error(e);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm p-8 min-h-[600px] relative">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-indigo-500" />
                    학급 진도 현황표
                </h2>
                <div className="text-sm font-bold text-gray-500">
                    전체 진도율: <span className="text-indigo-600 text-lg">{progressPercent}%</span> ({startedUnits}/{totalUnits})
                </div>
            </div>

            {/* Subject Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-100 pb-1">
                {subjects.map(subject => (
                    <button
                        key={subject}
                        onClick={() => setSelectedSubject(subject)}
                        className={`px-6 py-3 rounded-t-xl font-bold transition-all relative top-0.5 ${selectedSubject === subject 
                            ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500' 
                            : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {subject}
                    </button>
                ))}
            </div>

            {/* Units Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {units.map((unit, idx) => {
                    const key = `${selectedSubject}_${unit.name}`;
                    const stat = stats[key];
                    const isStarted = stat?.count > 0;

                    return (
                        <div 
                            key={idx} 
                            onClick={() => handleUnitClick(unit.name)}
                            className={`p-4 rounded-xl border transition-all relative group ${isStarted ? 'border-indigo-200 bg-indigo-50 hover:shadow-md cursor-pointer' : 'border-gray-100 bg-gray-50'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded-md ${isStarted ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                                    {unit.unit || (selectedSubject === '사회' ? '소단원' : '단원')}
                                </span>
                                {isStarted && (
                                    <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> 수업 완료
                                    </span>
                                )}
                            </div>
                            <h3 className={`font-bold text-lg mb-1 leading-tight ${isStarted ? 'text-gray-800' : 'text-gray-400'}`}>
                                {unit.name}
                            </h3>
                            <p className="text-xs text-gray-500 mb-3 line-clamp-2 h-8">
                                {unit.sessions}
                            </p>
                            
                            {isStarted ? (
                                <div className="pt-3 border-t border-indigo-100 flex justify-between items-center text-xs">
                                    <span className="text-gray-600">마지막 수업: <b>{stat.lastDate}</b></span>
                                    <span className="text-indigo-500 font-bold">{stat.count}회 기록</span>
                                </div>
                            ) : (
                                <div className="pt-3 border-t border-gray-100 text-xs text-gray-400">
                                    아직 수업 기록이 없습니다.
                                </div>
                            )}
                            
                            {isStarted && <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 rounded-xl transition-colors pointer-events-none" />}
                        </div>
                    );
                })}
            </div>

            {/* History Modal */}
            {historyModalData && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" onClick={() => setHistoryModalData(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">
                                📖 수업 기록 상세
                                <span className="block text-sm font-medium text-gray-500 mt-1">{selectedSubject} - {historyModalData.unitName}</span>
                            </h3>
                            <button onClick={() => setHistoryModalData(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                            {historyModalData.history.map((record, idx) => (
                                <div key={idx} className="flex items-start justify-between gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                                {record.date}
                                            </span>
                                            <span className="text-xs font-bold text-gray-400">
                                                {record.periodIndex + 1}교시
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 font-medium">
                                            {record.text}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteHistory(record.date, record.periodIndex)}
                                        className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="기록 삭제"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 text-right">
                             <button onClick={() => setHistoryModalData(null)} className="px-5 py-2.5 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-900">
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// =====================
// ADMIN MESSAGE COMPOSER
// =====================
const AdminMessageComposer = ({ students, onSend, sentNotices, onDeleteNotice }) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [content, setContent] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const toggleStudent = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };
    const toggleAll = () => {
        setSelectedIds(selectedIds.length === students.length ? [] : students.map(s => s.id));
    };

    const handleSend = async () => {
        if (!content.trim() || selectedIds.length === 0) return;
        setSending(true);
        await onSend({ content: content.trim(), recipientIds: selectedIds });
        setContent('');
        setSelectedIds([]);
        setSending(false);
        setSent(true);
        setTimeout(() => setSent(false), 3000);
    };

    const myNotices = sentNotices; // show all sent by admin

    return (
        <div className="space-y-6">
            {/* Compose Panel */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <BellRing className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">선생님 메시지 보내기</h2>
                        <p className="text-sm text-gray-500">학생 알림장에 즉시 전달됩니다.</p>
                    </div>
                </div>

                {/* Student selector */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-bold text-gray-600">받는 학생 선택</label>
                        <button onClick={toggleAll} className="text-xs text-purple-600 font-bold hover:underline">
                            {selectedIds.length === students.length ? '전체 해제' : '전체 선택'}
                        </button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1">
                        {students.map(s => (
                            <label key={s.id}
                                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border cursor-pointer text-xs font-bold transition-all select-none ${selectedIds.includes(s.id) ? 'bg-purple-100 border-purple-400 text-purple-800' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-purple-200'}`}
                            >
                                <input type="checkbox" className="sr-only" checked={selectedIds.includes(s.id)} onChange={() => toggleStudent(s.id)} />
                                {s.name}
                            </label>
                        ))}
                    </div>
                    {selectedIds.length > 0 && (
                        <p className="text-xs text-purple-600 font-bold mt-1.5">
                            {selectedIds.length}명 선택됨
                        </p>
                    )}
                </div>

                {/* Message textarea */}
                <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-400 resize-none text-sm"
                    rows={3}
                    placeholder="학생들에게 전달할 메시지를 입력하세요..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                />

                <div className="flex items-center justify-between mt-3">
                    {sent && <span className="text-green-600 text-sm font-bold">✅ 전송 완료!</span>}
                    <div className="ml-auto">
                        <button
                            onClick={handleSend}
                            disabled={sending || !content.trim() || selectedIds.length === 0}
                            className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            <BellRing className="w-4 h-4" />
                            {sending ? '전송 중...' : '메시지 전송'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Sent History - always visible */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-700 flex items-center gap-2">
                        <BellRing className="w-4 h-4 text-purple-400" /> 전송 내역
                        {myNotices.length > 0 && <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">{myNotices.length}건</span>}
                    </h3>
                </div>
                {myNotices.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <BellRing className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p className="text-sm font-bold">전송된 메시지가 없습니다.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {myNotices.map(notice => {
                            const recipientNames = notice.recipientIds?.map(id => students.find(s => s.id === id)?.name).filter(Boolean);
                            const readCount = notice.readBy?.length || 0;
                            const totalCount = notice.recipientIds?.length || 0;
                            return (
                                <div key={notice.id} className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                                    <p className="text-sm font-bold text-gray-800 whitespace-pre-wrap mb-3">{notice.content}</p>
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {recipientNames?.map((name, i) => {
                                            const rid = notice.recipientIds?.[notice.recipientIds?.findIndex((id) => students.find(s => s.id === id)?.name === name)];
                                            const isRead = notice.readBy?.includes(rid);
                                            return (
                                                <span key={name + i} className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isRead ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                    {isRead ? '✓ ' : ''}{name}
                                                </span>
                                            );
                                        })}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-400">{new Date(notice.timestamp).toLocaleString('ko-KR')}</span>
                                            <span className="text-xs font-bold text-purple-600">{readCount}/{totalCount}명 확인</span>
                                        </div>
                                        <button
                                            onClick={() => { if (window.confirm(`"${notice.content.slice(0, 20)}..." 메시지를 취소(삭제)하시겠습니까?\n아직 확인하지 않은 학생 알림장에서도 사라집니다.`)) onDeleteNotice(notice.id); }}
                                            className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-red-100 hover:border-red-300"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> 전송 취소
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

// =====================
// MESSAGES INBOX COMPONENT
// =====================
const MessagesInbox = ({ messages, onDelete }) => {

    const [isExporting, setIsExporting] = useState(false);
    const [exportedUrl, setExportedUrl] = useState(null);
    const tokenClientRef = useRef(null);
    const gapiReadyRef = useRef(false);

    const initGapi = useCallback(() => new Promise((resolve) => {
        if (gapiReadyRef.current) return resolve();
        window.gapi.load('client', async () => {
            await window.gapi.client.init({ discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'] });
            gapiReadyRef.current = true;
            resolve();
        });
    }), []);

    const exportToSheets = useCallback(async () => {
        if (!messages.length) { alert('전달된 메시지가 없습니다.'); return; }
        setIsExporting(true);
        try {
            await initGapi();
            const getToken = () => new Promise((resolve, reject) => {
                if (!tokenClientRef.current) {
                    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
                        client_id: GOOGLE_CLIENT_ID, scope: GOOGLE_SHEETS_SCOPE,
                        callback: (resp) => { if (resp.error) reject(resp); else resolve(resp); },
                    });
                }
                tokenClientRef.current.requestAccessToken({ prompt: '' });
            });
            await getToken();

            const header = ['번호', '날짜', '작성자', '내용'];
            const rows = messages.map((m, i) => [i + 1, m.date || '', m.authorName || '', m.content || '']);

            const configRef = doc(db, 'settings', 'messagesSheetConfig');
            const configSnap = await getDoc(configRef);
            let spreadsheetId = configSnap.exists() ? configSnap.data().spreadsheetId : null;
            let spreadsheetUrl;

            if (spreadsheetId) {
                try {
                    const meta = await window.gapi.client.sheets.spreadsheets.get({ spreadsheetId });
                    spreadsheetUrl = meta.result.spreadsheetUrl;
                    await window.gapi.client.sheets.spreadsheets.values.clear({ spreadsheetId, range: '학생 전달 메시지' });
                } catch { spreadsheetId = null; }
            }

            if (!spreadsheetId) {
                const resp = await window.gapi.client.sheets.spreadsheets.create({
                    properties: { title: '📢 학생 전달 메시지함' },
                    sheets: [{ properties: { title: '학생 전달 메시지' } }],
                });
                spreadsheetId = resp.result.spreadsheetId;
                spreadsheetUrl = resp.result.spreadsheetUrl;
                const sheetId = resp.result.sheets[0].properties.sheetId;
                await setDoc(configRef, { spreadsheetId, spreadsheetUrl });
                await window.gapi.client.sheets.spreadsheets.batchUpdate({ spreadsheetId, resource: { requests: [
                    { repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 1 }, cell: { userEnteredFormat: { textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }, backgroundColor: { red: 0.95, green: 0.6, blue: 0.07 }, horizontalAlignment: 'CENTER' } }, fields: 'userEnteredFormat(textFormat,backgroundColor,horizontalAlignment)' } },
                    { repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: rows.length + 1 }, cell: { userEnteredFormat: { wrapStrategy: 'WRAP' } }, fields: 'userEnteredFormat(wrapStrategy)' } },
                    { autoResizeDimensions: { dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 3 } } },
                    { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 3, endIndex: 4 }, properties: { pixelSize: 400 }, fields: 'pixelSize' } },
                ]}});
            }

            await window.gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId, range: '학생 전달 메시지!A1', valueInputOption: 'RAW',
                resource: { values: [header, ...rows] },
            });
            setExportedUrl(spreadsheetUrl);
        } catch (err) {
            console.error(err);
            alert(`내보내기 실패: ${err.message || JSON.stringify(err)}`);
        } finally { setIsExporting(false); }
    }, [messages, initGapi]);

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <BellRing className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">학생 전달 메시지함</h2>
                        <p className="text-sm text-gray-500">학생들이 선생님께 꼭 전달하고 싶은 내용을 모아서 보여줍니다.</p>
                    </div>
                </div>
                <button onClick={exportToSheets} disabled={isExporting}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm">
                    {isExporting ? <><Loader2 className="w-4 h-4 animate-spin" /> 내보내는 중...</> : <><Sheet className="w-4 h-4" /> 구글 시트</>}
                </button>
            </div>

            {exportedUrl && (
                <div className="flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Sheet className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span className="text-emerald-800 font-bold text-sm">구글 시트가 업데이트되었습니다!</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href={exportedUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow">
                            <ExternalLink className="w-4 h-4" /> 시트 열기
                        </a>
                        <button onClick={() => setExportedUrl(null)} className="p-2 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                </div>
            )}

            {messages.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-dashed border-gray-200 text-center text-gray-400">
                    <BellRing className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-bold">전달된 메시지가 없습니다.</p>
                    <p className="text-sm mt-1">학생들이 메시지를 보내면 여기에 표시됩니다.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {messages.map((msg) => (
                        <div key={msg.id} className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 hover:border-amber-300 transition-all">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center text-xs font-bold text-amber-700">
                                            {msg.authorName?.[0] || '?'}
                                        </div>
                                        <span className="font-bold text-gray-800">{msg.authorName}</span>
                                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{msg.date}</span>
                                        <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>
                                <button onClick={() => { if (window.confirm('이 메시지를 삭제하시겠습니까?')) onDelete(msg.id); }}
                                    className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
// 관리자 전용: 점수 사용처 관리 + 전체 학생 점수 현황
const ScoreShopAdmin = ({ scoreShop, scoreTransactions, users, addScoreShopItem, updateScoreShopItem, deleteScoreShopItem, getUserScoreSummary, ScoreManagerComponent }) => {
    const [tab, setTab] = useState('shop'); // 'shop' | 'scores'
    const [editingItem, setEditingItem] = useState(null); // null | { id?, name, cost, description }
    const [form, setForm] = useState({ name: '', cost: '', description: '' });
    const [saving, setSaving] = useState(false);

    const openNew = () => { setEditingItem({ isNew: true }); setForm({ name: '', cost: '', description: '' }); };
    const openEdit = (item) => { setEditingItem(item); setForm({ name: item.name, cost: String(item.cost), description: item.description || '' }); };

    const handleSave = async () => {
        const cost = parseInt(form.cost, 10);
        if (!form.name.trim() || isNaN(cost) || cost <= 0) { alert('사용처 이름과 점수(양수)를 입력해주세요.'); return; }
        setSaving(true);
        try {
            if (editingItem.isNew) {
                await addScoreShopItem({ name: form.name.trim(), cost, description: form.description.trim() });
            } else {
                await updateScoreShopItem(editingItem.id, { name: form.name.trim(), cost, description: form.description.trim() });
            }
            setEditingItem(null);
        } finally { setSaving(false); }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`"${item.name}" 사용처를 삭제하시겠습니까?`)) return;
        await deleteScoreShopItem(item.id);
    };

    const getCreditGradeLabel = (grade) => grade > 0 ? `등급 ${grade}` : '등급 없음';
    const getCreditColor = (grade) => {
        if (grade >= 10) return 'bg-yellow-100 text-yellow-700';
        if (grade >= 7)  return 'bg-emerald-100 text-emerald-700';
        if (grade >= 4)  return 'bg-blue-100 text-blue-700';
        if (grade >= 1)  return 'bg-gray-100 text-gray-600';
        return 'bg-gray-50 text-gray-400';
    };

    return (
        <div className="space-y-6">
            {/* 탭 */}
            <div className="flex gap-2 border-b border-gray-100 pb-1">
                {[['shop', '차 사용처 관리'], ['scores', '학생 점수 현황'], ['grant', '점수 부여 관리']].map(([id, label]) => (
                    <button key={id} onClick={() => setTab(id)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${tab === id ? 'bg-amber-100 text-amber-700' : 'text-gray-400 hover:text-gray-600'}`}
                    >{label}</button>
                ))}
            </div>

            {/* 사용처 관리 탭 */}
            {tab === 'shop' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">점수 사용처 목록</h3>
                        <button onClick={openNew} className="flex items-center gap-1 bg-amber-500 text-white px-3 py-2 rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors">
                            <Plus className="w-4 h-4" /> 사용처 추가
                        </button>
                    </div>

                    {scoreShop.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p>등록된 사용처가 없습니다.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {scoreShop.map(item => (
                                <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                    <div className="flex-1">
                                        <span className="font-bold text-gray-800">{item.name}</span>
                                        {item.description && <span className="text-sm text-gray-500 ml-2">{item.description}</span>}
                                    </div>
                                    <span className="font-bold text-amber-600">{item.cost}점</span>
                                    <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(item)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 추가/수정 폼 */}
                    {editingItem && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
                            <h4 className="font-bold text-amber-800">{editingItem.isNew ? '새 사용처 추가' : '사용처 수정'}</h4>
                            <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                                placeholder="사용처 이름 (ex: 자유시간 5분)"
                                className="w-full px-3 py-2 rounded-xl border border-amber-200 outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                            <input type="number" value={form.cost} onChange={e => setForm(f => ({...f, cost: e.target.value}))}
                                placeholder="필요 점수"
                                className="w-full px-3 py-2 rounded-xl border border-amber-200 outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                            <input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                                placeholder="설명 (선택)"
                                className="w-full px-3 py-2 rounded-xl border border-amber-200 outline-none focus:ring-2 focus:ring-amber-400 text-sm" />
                            <div className="flex gap-2">
                                <button onClick={() => setEditingItem(null)} className="flex-1 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-sm">취소</button>
                                <button onClick={handleSave} disabled={saving} className="flex-1 py-2 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 disabled:opacity-50">
                                    {saving ? '저장 중...' : '저장'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 학생 점수 현황 탭 */}
            {tab === 'scores' && (
                <div>
                    <h3 className="font-bold text-gray-700 mb-4">전체 학생 점수 현황</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-separate border-spacing-y-1">
                            <thead>
                                <tr className="text-xs text-gray-400 font-bold uppercase">
                                    <th className="text-left px-4 py-2">학생</th>
                                    <th className="text-right px-4 py-2">현재 점수</th>
                                    <th className="text-right px-4 py-2">누적 점수</th>
                                    <th className="text-center px-4 py-2">신용등급</th>
                                    <th className="text-right px-4 py-2">거래 횟수</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(student => {
                                    const { currentScore, accumulatedScore, creditGrade } = getUserScoreSummary(student.id);
                                    const txnCount = scoreTransactions.filter(t => t.userId === student.id).length;
                                    return (
                                        <tr key={student.id} className="bg-white rounded-xl hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-bold text-gray-800 rounded-l-xl">{student.name}</td>
                                            <td className={`px-4 py-3 text-right font-bold ${currentScore < 0 ? 'text-red-500' : 'text-indigo-600'}`}>{currentScore}점</td>
                                            <td className="px-4 py-3 text-right font-bold text-emerald-600">{accumulatedScore}점</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${getCreditColor(creditGrade)}`}>
                                                    {getCreditGradeLabel(creditGrade)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-400 rounded-r-xl">{txnCount}건</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 점수 부여 관리 탭 */}
            {tab === 'grant' && (
                <ScoreManagerComponent />
            )}
        </div>
    );
};

export default AdminDashboard;
