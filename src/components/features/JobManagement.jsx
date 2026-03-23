import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Edit2, Trash2, Building, Shield, ClipboardList, Info, ChevronDown, ChevronUp, BookOpen, Users, CheckCircle2 } from 'lucide-react';
const JobManagement = () => {
  const { 
    users, ministries, roles, tasks, jobApplications, jobAppConfig,
    toggleJobAppPeriod, assignStudentRoles, saveCurrentMinistriesToHistory, updateUserPastMinistries, clearJobApplications,
    addMinistry, updateMinistry, deleteMinistry, 
    addRole, updateRole, deleteRole, 
    adminAddTask, updateTask, deleteTask,
    syncRoles
  } = useAppContext();

  const [activeTab, setActiveTab] = useState('organization'); // 'organization' | 'assignment' | 'history'

  const [selectedMinistryId, setSelectedMinistryId] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState(null);

  // Editing states
  const [editingMinistry, setEditingMinistry] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [editingRoleName, setEditingRoleName] = useState('');
  const [editingRoleDesc, setEditingRoleDesc] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  // role id -> duties 로컬 편집 배열
  const [editingDuties, setEditingDuties] = useState([]);
  // 펼쳐진 역할 duties 목록
  const [expandedRoles, setExpandedRoles] = useState({});

  const [newMinistryName, setNewMinistryName] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskType, setNewTaskType] = useState('self'); // 'self' or 'admin'
  const [newTaskFreqType, setNewTaskFreqType] = useState('daily');
  const [newTaskFreqDays, setNewTaskFreqDays] = useState([]);
  const [newTaskAction, setNewTaskAction] = useState(''); // '' | 'open_petition' | 'open_judicial' | 'open_wiki'
  const [sortOption, setSortOption] = useState('name'); // 'name' | 'choice1' | 'choice2' | 'choice3'

  const DAYS_OF_WEEK = [
    { value: 1, label: '월' },
    { value: 2, label: '화' },
    { value: 3, label: '수' },
    { value: 4, label: '목' },
    { value: 5, label: '금' }
  ];

  const handleDayToggle = (dayValue, isNewTask = true) => {
      // For creating a new task
      if (isNewTask) {
          if (newTaskFreqDays.includes(dayValue)) {
              setNewTaskFreqDays(newTaskFreqDays.filter(d => d !== dayValue));
          } else {
              setNewTaskFreqDays([...newTaskFreqDays, dayValue]);
          }
      }
  };

  const colorOptions = [
    { label: '남색', value: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    { label: '파랑', value: 'bg-blue-100 text-blue-800 border-blue-200' },
    { label: '노랑', value: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { label: '초록', value: 'bg-green-100 text-green-800 border-green-200' },
    { label: '분홍', value: 'bg-pink-100 text-pink-800 border-pink-200' },
    { label: '청록', value: 'bg-teal-100 text-teal-800 border-teal-200' },
    { label: '회색', value: 'bg-gray-100 text-gray-800 border-gray-200' },
  ];

  const handleAddMinistry = async () => {
    if (!newMinistryName.trim()) return;
    await addMinistry({ 
      id: `m_${Date.now()}`, 
      name: newMinistryName.trim(), 
      color: colorOptions[0].value 
    });
    setNewMinistryName('');
  };

  const handleUpdateMinistry = async (id, name, color) => {
    await updateMinistry(id, { name, color });
    setEditingMinistry(null);
  };

  const handleDeleteMinistry = async (id, name) => {
    const minRoles = roles.filter(r => r.ministryId === id);
    if (minRoles.length > 0) {
      alert(`이 부서에 속한 역할이 ${minRoles.length}개 있습니다. 먼저 역할을 삭제하거나 이동해주세요.`);
      return;
    }
    if (window.confirm(`'${name}' 부서를 정말 삭제하시겠습니까?`)) {
      await deleteMinistry(id);
      if (selectedMinistryId === id) setSelectedMinistryId(null);
    }
  };

  const handleAddRole = async () => {
    if (!newRoleName.trim() || !selectedMinistryId) return;
    const newId = `r_${Date.now()}`;
    await addRole({
      id: newId,
      ministryId: selectedMinistryId,
      name: newRoleName.trim(),
      description: '설명을 입력해주세요.',
      duties: []
    });
    setNewRoleName('');
    // 새로 추가한 역할을 자동 선택
    setSelectedRoleId(newId);
  };

  const handleUpdateRole = async (id) => {
    if (!editingRoleName.trim()) {
      alert('역할 이름을 입력해주세요.');
      return;
    }
    await updateRole(id, { name: editingRoleName.trim(), description: editingRoleDesc, duties: editingDuties });
    setEditingRole(null);
  };

  const handleDeleteRole = async (id) => {
    const roleTasks = tasks.filter(t => t.roleId === id);
    if (roleTasks.length > 0) {
        if (!window.confirm(`이 역할에 할당된 할 일이 ${roleTasks.length}개 있습니다. 모두 함께 삭제하시겠습니까?`)) return;
        for (const t of roleTasks) {
            await deleteTask(t.id);
        }
    }
    await deleteRole(id);
    if (selectedRoleId === id) setSelectedRoleId(null);
  };

  const handleAddTask = async () => {
    if (!newTaskText.trim() || !selectedRoleId) return;
    if (newTaskFreqType === 'specific_days' && newTaskFreqDays.length === 0) {
        alert("특정 요일을 하나 이상 선택해주세요.");
        return;
    }
    
    const taskData = {
      id: `t_${Date.now()}`,
      roleId: selectedRoleId,
      text: newTaskText.trim(),
      type: newTaskType,
      frequency: {
          type: newTaskFreqType,
          days: newTaskFreqType === 'specific_days' ? newTaskFreqDays : []
      }
    };
    if (newTaskAction) taskData.action = newTaskAction;

    await adminAddTask(taskData);
    setNewTaskText('');
    setNewTaskFreqDays([]);
    setNewTaskAction('');
  };

  const selectedMinistry = ministries.find(m => m.id === selectedMinistryId);
  const ministryRoles = roles.filter(r => r.ministryId === selectedMinistryId);
  const roleTasks = tasks.filter(t => t.roleId === selectedRoleId);
  const students = users.filter(u => u.type === 'student');

  const [titleInput, setTitleInput] = useState('');
  useEffect(() => {
     if (jobAppConfig?.title) setTitleInput(jobAppConfig.title);
  }, [jobAppConfig?.title]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-100 p-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-indigo-500" />
                    업무 관리 (부서/역할 편성)
                </h2>
                <p className="text-gray-500 text-sm mt-1">학급의 부서를 만들고, 역할을 배정하며 각 역할의 데일리 임무를 설정합니다.</p>
              </div>
              <button
                onClick={async () => {
                  if (!window.confirm('모든 역할의 업무 매뉴얼을 초기 내용으로 복원하시겠습니까?\n(관리자가 수정한 내용이 덮어씌워집니다)')) return;
                  await syncRoles();
                  alert('✅ 기본 매뉴얼로 복원되었습니다!');
                }}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-white border border-gray-200 hover:border-indigo-300 text-gray-500 hover:text-indigo-600 rounded-xl transition-colors shadow-sm"
                title="코드에 저장된 기본 업무 매뉴얼로 되돌립니다"
              >
                <Info className="w-3.5 h-3.5" /> 기본 매뉴얼 복원
              </button>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-2 border-b border-gray-100 bg-white sticky top-0 z-10 overflow-x-auto no-scrollbar">
            <button 
                onClick={() => setActiveTab('organization')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'organization' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <Building className="w-4 h-4" /> 부서/역할 편성
                {activeTab === 'organization' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('assignment')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'assignment' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <ClipboardList className="w-4 h-4" /> 학생 부서 배정 (업무희망서)
                {activeTab === 'assignment' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === 'history' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
                <BookOpen className="w-4 h-4" /> 전체 부서 이력 관리
                {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></div>}
            </button>
        </div>

        {activeTab === 'organization' && (
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 min-h-[600px]">
            {/* Column 1: Ministries */}
            <div className="flex flex-col bg-white">
                <div className="p-4 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
                    <Building className="w-5 h-5 text-gray-500" />
                    <h3 className="font-bold text-gray-700">1. 부서 (Ministry)</h3>
                </div>
                <div className="p-4 flex-1 overflow-y-auto space-y-2">
                    {ministries.map(ministry => (
                        <div 
                            key={ministry.id} 
                            onClick={() => { setSelectedMinistryId(ministry.id); setSelectedRoleId(null); }}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                selectedMinistryId === ministry.id 
                                ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
                                : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                            }`}
                        >
                            {editingMinistry === ministry.id ? (
                                <div className="space-y-2" onClick={e => e.stopPropagation()}>
                                    <input 
                                        type="text" 
                                        defaultValue={ministry.name}
                                        id={`min-name-${ministry.id}`}
                                        className="w-full px-2 py-1 text-sm border rounded outline-none"
                                        autoFocus
                                    />
                                    <select 
                                        defaultValue={ministry.color}
                                        id={`min-color-${ministry.id}`}
                                        className="w-full px-2 py-1 text-sm border rounded outline-none"
                                    >
                                        {colorOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                    <div className="flex gap-1 justify-end">
                                        <button 
                                            onClick={() => handleUpdateMinistry(
                                                ministry.id, 
                                                document.getElementById(`min-name-${ministry.id}`).value,
                                                document.getElementById(`min-color-${ministry.id}`).value
                                            )}
                                            className="px-2 py-1 bg-green-500 text-white rounded text-xs font-bold"
                                        >저장</button>
                                        <button onClick={() => setEditingMinistry(null)} className="px-2 py-1 bg-gray-200 rounded text-xs">취소</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${ministry.color.split(' ')[0]}`}></div>
                                        <span className="font-bold text-gray-800">{ministry.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={(e) => { e.stopPropagation(); setEditingMinistry(ministry.id); }} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-md hover:bg-blue-50">
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteMinistry(ministry.id, ministry.name); }} className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {/* Add new ministry */}
                    <div className="flex gap-2 mt-4 items-center p-2 bg-gray-50 border border-gray-200 border-dashed rounded-lg">
                        <input 
                            type="text" 
                            value={newMinistryName}
                            onChange={(e) => setNewMinistryName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddMinistry()}
                            placeholder="새 부서 추가..."
                            className="flex-1 bg-transparent px-2 py-1 outline-none text-sm placeholder-gray-400 font-medium"
                        />
                        <button onClick={handleAddMinistry} className="p-1.5 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200 transition-colors">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Column 2: Roles */}
            <div className="flex flex-col bg-gray-50/30">
                <div className="p-4 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
                    <Shield className="w-5 h-5 text-gray-500" />
                    <h3 className="font-bold text-gray-700">2. 역할 (Role)</h3>
                </div>
                <div className="p-4 flex-1 overflow-y-auto">
                    {!selectedMinistryId ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                            <Building className="w-12 h-12 mb-3 opacity-20" />
                            <p className="text-sm">왼쪽에서 부서를 선택하면<br/>역할을 관리할 수 있습니다.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="bg-white p-3 rounded-lg border border-indigo-100 mb-4 flex items-center justify-between">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${selectedMinistry?.color || 'bg-gray-100'}`}>
                                    {selectedMinistry?.name}
                                </span>
                                <span className="text-xs text-gray-500 font-medium">소속 역할 목록</span>
                            </div>

                            {ministryRoles.map(role => (
                                <div 
                                    key={role.id}
                                    onClick={() => setSelectedRoleId(role.id)}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer bg-white ${
                                        selectedRoleId === role.id 
                                        ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500' 
                                        : 'border-gray-200 hover:border-indigo-300 shadow-sm'
                                    }`}
                                >
                                    {editingRole === role.id ? (
                                        <div className="space-y-2" onClick={e => e.stopPropagation()}>
                                            <input 
                                                type="text" 
                                                value={editingRoleName}
                                                onChange={e => setEditingRoleName(e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm font-bold border rounded outline-none"
                                                placeholder="역할 이름"
                                            />
                                            <textarea 
                                                value={editingRoleDesc}
                                                onChange={e => setEditingRoleDesc(e.target.value)}
                                                className="w-full px-2 py-1.5 text-xs text-gray-600 border rounded outline-none min-h-[60px]"
                                                placeholder="역할 설명"
                                            />
                                            {/* duties 편집 */}
                                            <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 space-y-1">
                                              <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">업무 항목</span>
                                                <button
                                                  onClick={() => setEditingDuties(prev => [...prev, ''])}
                                                  className="flex items-center gap-0.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-800"
                                                ><Plus style={{width:10,height:10}}/> 항목 추가</button>
                                              </div>
                                              {editingDuties.map((duty, idx) => (
                                                <div key={idx} className="flex gap-1 items-center">
                                                  <input
                                                    value={duty}
                                                    onChange={e => {
                                                      const next = [...editingDuties];
                                                      next[idx] = e.target.value;
                                                      setEditingDuties(next);
                                                    }}
                                                    className="flex-1 px-2 py-1 text-xs border rounded outline-none bg-white"
                                                    placeholder={`항목 ${idx + 1}`}
                                                  />
                                                  <button
                                                    onClick={() => setEditingDuties(editingDuties.filter((_, i) => i !== idx))}
                                                    className="text-red-400 hover:text-red-600 p-0.5"
                                                  ><Trash2 style={{width:12,height:12}}/></button>
                                                </div>
                                              ))}
                                              {editingDuties.length === 0 && (
                                                <p className="text-[10px] text-gray-400 text-center py-1">항목이 없습니다. 위 버튼으로 추가하세요.</p>
                                              )}
                                            </div>
                                            <div className="flex gap-1 justify-end pt-1">
                                                <button 
                                                    onClick={() => handleUpdateRole(role.id)}
                                                    className="px-3 py-1 bg-green-500 text-white rounded text-xs font-bold"
                                                >저장</button>
                                                <button onClick={() => setEditingRole(null)} className="px-3 py-1 bg-gray-200 rounded text-xs">취소</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-gray-800 text-lg">{role.name}</h4>
                                                <div className="flex items-center gap-1">
                                                    <button onClick={(e) => { e.stopPropagation(); setSelectedRoleId(role.id); setEditingRole(role.id); setEditingRoleName(role.name); setEditingRoleDesc(role.description || ''); setEditingDuties(role.duties || []); }} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-md hover:bg-blue-50">
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteRole(role.id); }} className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 leading-relaxed mb-2">{role.description}</p>
                                            <div className="flex items-center justify-between mb-1">
                                              <div className="text-[10px] font-bold text-indigo-500 bg-indigo-50 inline-block px-2 py-1 rounded">
                                                할 일 {tasks.filter(t => t.roleId === role.id).length}개
                                              </div>
                                              {(role.duties || []).length > 0 && (
                                                <button
                                                  onClick={e => { e.stopPropagation(); setExpandedRoles(prev => ({...prev, [role.id]: !prev[role.id]})); }}
                                                  className="flex items-center gap-0.5 text-[10px] font-bold text-gray-400 hover:text-indigo-600 transition-colors"
                                                >
                                                  <BookOpen style={{width:11,height:11}}/>
                                                  업무 {expandedRoles[role.id] ? '접기' : `${(role.duties||[]).length}개 보기`}
                                                  {expandedRoles[role.id] ? <ChevronUp style={{width:11,height:11}}/> : <ChevronDown style={{width:11,height:11}}/>}
                                                </button>
                                              )}
                                            </div>
                                            {expandedRoles[role.id] && (
                                              <div className="mt-1 border border-indigo-100 rounded-lg bg-indigo-50/50 p-2 space-y-1" onClick={e => e.stopPropagation()}>
                                                {(role.duties || []).map((duty, idx) => (
                                                  <div key={idx} className={`flex gap-1.5 items-start text-[11px] leading-snug ${
                                                    duty.startsWith('【체크】') ? 'text-emerald-700 font-bold' : 'text-gray-700'
                                                  }`}>
                                                    <span className="shrink-0 mt-0.5">{duty.startsWith('【체크】') ? '✅' : '•'}</span>
                                                    <span>{duty}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}

                            <div className="p-3 bg-white border border-gray-200 border-dashed rounded-xl flex flex-col gap-2 mt-4 shadow-sm hover:border-indigo-300 transition-colors">
                                <input 
                                    type="text" 
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    placeholder="새로운 역할 이름..."
                                    className="w-full px-2 py-1.5 text-sm bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-300 rounded outline-none font-medium"
                                />
                                <button 
                                    onClick={handleAddRole}
                                    className="w-full flex items-center justify-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-1.5 rounded text-sm font-bold transition-colors"
                                ><Plus className="w-4 h-4" /> 역할 추가</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Column 3: Tasks */}
            <div className="flex flex-col bg-white">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-gray-500" />
                        <h3 className="font-bold text-gray-700">3. 기본 할 일 (Tasks)</h3>
                    </div>
                </div>
                <div className="p-4 flex-1 overflow-y-auto">
                    {!selectedRoleId ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                            <Shield className="w-12 h-12 mb-3 opacity-20" />
                            <p className="text-sm">가운데 영역에서 역할을 선택하면<br/>해당 업무의 데일리 할 일을 관리할 수 있습니다.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3">
                                <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-bold text-indigo-900 leading-tight">팁: 할 일 유형의 차이</h4>
                                    <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                                        <b>스스로:</b> 학생이 직접 체크박스를 눌러 &apos;완료&apos; 처리할 수 있습니다.<br/>
                                        <b>선생님 검사:</b> 학생이 클릭하면 &apos;승인 대기&apos; 상태가 되며, 선생님이 [학생 관리] 탭에서 승인해야 완료됩니다.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {roleTasks.map(task => {
                                    const freq = task.frequency || { type: 'daily', days: [] };
                                    
                                    return (
                                    <div key={task.id} className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 transition-colors group">
                                        {editingTask === task.id ? (
                                            <div className="space-y-2">
                                                <input 
                                                    type="text" 
                                                    id={`task-text-${task.id}`}
                                                    defaultValue={task.text}
                                                    className="w-full px-2 py-1.5 text-sm border rounded outline-none"
                                                />
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex gap-2">
                                                        <select 
                                                            id={`task-freq-type-${task.id}`}
                                                            defaultValue={freq.type}
                                                            onChange={(e) => {
                                                                // Use a temporary state or just rely on DOM for simple toggle
                                                                const daySelector = document.getElementById(`task-freq-days-container-${task.id}`);
                                                                if (daySelector) {
                                                                    daySelector.style.display = e.target.value === 'specific_days' ? 'flex' : 'none';
                                                                }
                                                            }}
                                                            className="w-[120px] px-2 py-1.5 text-sm border rounded outline-none bg-white"
                                                        >
                                                            <option value="daily">매일 할 일</option>
                                                            <option value="specific_days">특정 요일</option>
                                                            <option value="weekly">주 1회</option>
                                                        </select>
                                                        <select 
                                                            id={`task-type-${task.id}`}
                                                            defaultValue={task.type}
                                                            className="flex-1 px-2 py-1.5 text-sm border rounded outline-none bg-white"
                                                        >
                                                            <option value="self">스스로 완료</option>
                                                            <option value="admin">선생님 검사</option>
                                                        </select>
                                                    </div>
                                                    {/* 실행 링크 */}
                                                    <select
                                                        id={`task-action-${task.id}`}
                                                        defaultValue={task.action || ''}
                                                        className="w-full px-2 py-1.5 text-sm border rounded outline-none bg-white"
                                                    >
                                                        <option value="">실행 링크 없음</option>
                                                        <option value="open_petition">🏛️ 국무회의 탭 열기</option>
                                                        <option value="open_judicial">⚖️ 재판소 탭 열기</option>
                                                        <option value="open_wiki">🔍 물어보살 탭 열기</option>
                                                    </select>

                                                    <div 
                                                        id={`task-freq-days-container-${task.id}`}
                                                        className="gap-1 justify-center p-2 bg-white rounded border border-gray-100"
                                                        style={{ display: freq.type === 'specific_days' ? 'flex' : 'none' }}
                                                    >
                                                        {DAYS_OF_WEEK.map(day => (
                                                            <button
                                                                key={day.value}
                                                                id={`task-freq-day-${task.id}-${day.value}`}
                                                                data-selected={freq.days.includes(day.value) ? 'true' : 'false'}
                                                                onClick={(e) => {
                                                                    const btn = e.currentTarget;
                                                                    const isSelected = btn.getAttribute('data-selected') === 'true';
                                                                    btn.setAttribute('data-selected', isSelected ? 'false' : 'true');
                                                                    btn.className = !isSelected
                                                                        ? 'w-8 h-8 rounded-full text-xs font-bold transition-colors bg-indigo-500 text-white shadow-sm'
                                                                        : 'w-8 h-8 rounded-full text-xs font-bold transition-colors bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600';
                                                                }}
                                                                className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                                                                    freq.days.includes(day.value)
                                                                    ? 'bg-indigo-500 text-white shadow-sm'
                                                                    : 'bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
                                                                }`}
                                                            >
                                                                {day.label}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div className="flex gap-2 justify-end mt-1">
                                                        <button 
                                                            onClick={() => {
                                                                const freqTypeVal = document.getElementById(`task-freq-type-${task.id}`).value;
                                                                let selectedDays = [];
                                                                if (freqTypeVal === 'specific_days') {
                                                                    DAYS_OF_WEEK.forEach(day => {
                                                                        const btn = document.getElementById(`task-freq-day-${task.id}-${day.value}`);
                                                                        if (btn && btn.getAttribute('data-selected') === 'true') {
                                                                            selectedDays.push(day.value);
                                                                        }
                                                                    });
                                                                    if (selectedDays.length === 0) {
                                                                        alert("특정 요일을 하나 이상 선택해주세요.");
                                                                        return;
                                                                    }
                                                                }
                                                                const actionVal = document.getElementById(`task-action-${task.id}`)?.value || '';
                                                                const updateData = {
                                                                    text: document.getElementById(`task-text-${task.id}`).value,
                                                                    type: document.getElementById(`task-type-${task.id}`).value,
                                                                    frequency: {
                                                                        type: freqTypeVal,
                                                                        days: selectedDays
                                                                    }
                                                                };
                                                                if (actionVal) updateData.action = actionVal;
                                                                else updateData.action = null;
                                                                updateTask(task.id, updateData);
                                                                setEditingTask(null);
                                                            }}
                                                            className="px-3 py-1.5 bg-green-500 text-white rounded text-xs font-bold shrink-0"
                                                        >저장</button>
                                                        <button onClick={() => setEditingTask(null)} className="px-3 py-1.5 bg-gray-200 rounded text-xs shrink-0">취소</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                        <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${task.type === 'admin' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                                            {task.type === 'admin' ? '선생님 검사' : '스스로'}
                                                        </span>
                                                        <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                                            freq.type === 'daily' ? 'border-blue-200 text-blue-600 bg-blue-50' :
                                                            freq.type === 'weekly' ? 'border-purple-200 text-purple-600 bg-purple-50' :
                                                            'border-green-200 text-green-600 bg-green-50'
                                                        }`}>
                                                            {freq.type === 'daily' ? '매일' : 
                                                             freq.type === 'weekly' ? '주 1회' : 
                                                             freq.days.map(d => DAYS_OF_WEEK.find(dw => dw.value === d)?.label).join(', ') + '요일'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-800 break-keep leading-snug">{task.text}</p>
                                                    {task.action && (
                                                        <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                                                            🔗 {task.action === 'open_petition' ? '국무회의' : task.action === 'open_judicial' ? '재판소' : task.action === 'open_wiki' ? '물어보살' : task.action}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setEditingTask(task.id)} className="p-1.5 text-gray-400 hover:text-blue-500 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => deleteTask(task.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )})}
                            </div>

                            <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl flex flex-col gap-2">
                                <h4 className="text-xs font-bold text-gray-500 mb-1">새 할 일 추가</h4>
                                <input 
                                    type="text" 
                                    value={newTaskText}
                                    onChange={(e) => setNewTaskText(e.target.value)}
                                    placeholder="무엇을 해야 할까요?"
                                    className="w-full px-2 py-1.5 text-sm border rounded outline-none"
                                />
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <select 
                                            value={newTaskFreqType}
                                            onChange={(e) => setNewTaskFreqType(e.target.value)}
                                            className="w-[120px] px-2 py-1.5 text-sm border rounded outline-none bg-white font-medium text-gray-700 shrink-0"
                                        >
                                            <option value="daily">매일 할 일</option>
                                            <option value="specific_days">특정 요일</option>
                                            <option value="weekly">주 1회</option>
                                        </select>
                                        <select 
                                            value={newTaskType}
                                            onChange={(e) => setNewTaskType(e.target.value)}
                                            className="flex-1 px-2 py-1.5 text-sm border rounded outline-none bg-white font-medium text-gray-700"
                                        >
                                            <option value="self">스스로 완료 가능</option>
                                            <option value="admin">선생님 확인(검사) 필요</option>
                                        </select>
                                    </div>
                                    
                                    {newTaskFreqType === 'specific_days' && (
                                        <div className="flex gap-1 justify-center mt-1 p-2 bg-white rounded border border-gray-100">
                                            {DAYS_OF_WEEK.map(day => (
                                                <button
                                                    key={day.value}
                                                    onClick={() => handleDayToggle(day.value, true)}
                                                    className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                                                        newTaskFreqDays.includes(day.value)
                                                        ? 'bg-indigo-500 text-white shadow-sm'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
                                                    }`}
                                                >
                                                    {day.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* 실행 링크 */}
                                    <select
                                        value={newTaskAction}
                                        onChange={(e) => setNewTaskAction(e.target.value)}
                                        className="w-full px-2 py-1.5 text-sm border rounded outline-none bg-white font-medium text-gray-700"
                                    >
                                        <option value="">실행 링크 없음</option>
                                        <option value="open_petition">🏛️ 국무회의 탭 열기</option>
                                        <option value="open_judicial">⚖️ 재판소 탭 열기</option>
                                        <option value="open_wiki">🔍 물어보살 탭 열기</option>
                                    </select>

                                    <button 
                                        onClick={handleAddTask}
                                        disabled={!newTaskText.trim() || !selectedRoleId}
                                        className="w-full mt-1 px-3 py-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded text-sm transition-colors"
                                        title={!newTaskText.trim() ? '할 일 내용을 입력해주세요' : !selectedRoleId ? '역할을 먼저 선택해주세요' : ''}
                                    >저장하기</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            </div>
        )}

        {activeTab === 'assignment' && (
            <div className="flex flex-col p-4 sm:p-6 min-h-[600px] bg-gray-50/30 overflow-hidden">
                {/* Period Control Panel */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-lg mb-1 flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-indigo-500" />
                            희망서 제출 기간 설정
                        </h3>
                        <p className="text-gray-500 text-sm break-keep">제출 기간을 열면 학생들의 업무 탭 상단에 희망서 제출 버튼이 표시됩니다.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:items-center bg-gray-50 p-3 rounded-xl border border-gray-100 w-full lg:w-auto">
                        <div className="flex flex-1 sm:flex-none gap-2 items-center">
                            <input 
                                type="text" 
                                value={titleInput} 
                                onChange={e => setTitleInput(e.target.value)}
                                placeholder="예: 4월 업무희망서"
                                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none font-medium min-w-[120px] w-full sm:w-[160px]"
                                disabled={jobAppConfig?.active}
                            />
                            <button 
                                onClick={() => toggleJobAppPeriod(!jobAppConfig?.active, titleInput || '이달의 직업 희망서')}
                                className={`px-4 py-2 rounded-lg font-bold text-sm text-white transition-all shadow-sm shrink-0 whitespace-nowrap ${jobAppConfig?.active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                            >
                                {jobAppConfig?.active ? '제출 마감하기' : '제출 시작하기'}
                            </button>
                        </div>
                        <button 
                            onClick={() => saveCurrentMinistriesToHistory()}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-bold text-sm transition-all shadow-sm shrink-0 whitespace-nowrap w-full sm:w-auto mt-1 sm:mt-0"
                            title="현재 모든 학생의 소속 부서를 '과거 부서 이력'에 저장합니다."
                        >
                            <BookOpen className="w-4 h-4" /> 기록 저장하기
                        </button>
                        <button 
                            onClick={async () => {
                                if (window.confirm("현재까지 제출된 데이터용 모든 업무희망서 내역을 초기화하시겠습니까?\n(테스트용 제출 내역을 모두 삭제합니다)")) {
                                    await clearJobApplications();
                                    alert("모든 제출 내역이 초기화되었습니다.");
                                }
                            }}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold text-sm transition-all border border-red-200 shadow-sm shrink-0 whitespace-nowrap w-full sm:w-auto mt-1 sm:mt-0"
                            title="모든 업무희망서 지원 내역을 삭제합니다."
                        >
                            <Trash2 className="w-4 h-4" /> 지원내역 초기화
                        </button>
                    </div>
                </div>

                {jobAppConfig?.active && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 flex items-center gap-2 font-bold text-sm shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-green-500" /> 
                        제출 기간이 열려 있습니다. 학생들이 지금 업무희망서를 제출할 수 있습니다!
                    </div>
                )}

                {/* Assignment Summary Dashboard */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-bold text-gray-700 mr-2 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-indigo-500" /> 부서 배정 현황:
                    </span>
                    {ministries.map(min => {
                        const count = students.filter(s => s.ministryId === min.id).length;
                        return (
                            <div key={min.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-sm font-bold bg-white shadow-sm ${min.color} border-opacity-30`}>
                                <span>{min.name}</span>
                                <span className={`bg-opacity-10 px-1.5 py-0.5 rounded text-xs ${min.color}`}>{count}명</span>
                            </div>
                        );
                    })}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-sm font-bold text-gray-500 bg-gray-50 border-gray-200 shadow-sm">
                        <span>미배정</span>
                        <span className="bg-white border border-gray-100 px-1.5 py-0.5 rounded text-xs">{students.filter(s => !s.ministryId).length}명</span>
                    </div>
                </div>

                {/* Student List */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h3 className="font-bold text-gray-700">학생 제출 내역 및 부서 배정 ({students.length}명)</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-500">정렬 기준:</span>
                            <select 
                                value={sortOption} 
                                onChange={(e) => setSortOption(e.target.value)}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white font-medium text-gray-700 outline-none hover:border-indigo-300 shadow-sm"
                            >
                                <option value="name">이름순</option>
                                <option value="choice1">1지망 같은 부서 모아보기</option>
                                <option value="choice2">2지망 같은 부서 모아보기</option>
                                <option value="choice3">3지망 같은 부서 모아보기</option>
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto pb-4">
                        <table className="w-full text-left min-w-[1000px]">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 text-sm font-bold text-gray-500 whitespace-nowrap w-[100px]">이름</th>
                                    <th className="p-4 text-sm font-bold text-gray-500 whitespace-nowrap w-[120px]">현재 부서</th>
                                    <th className="p-4 text-sm font-bold text-gray-500 whitespace-nowrap w-[180px]">과거 경험 부서</th>
                                    <th className={`p-4 text-sm font-bold whitespace-nowrap w-[100px] ${sortOption === 'choice1' ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-500'}`}>1지망</th>
                                    <th className={`p-4 text-sm font-bold whitespace-nowrap w-[100px] ${sortOption === 'choice2' ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-500'}`}>2지망</th>
                                    <th className={`p-4 text-sm font-bold whitespace-nowrap w-[100px] ${sortOption === 'choice3' ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-500'}`}>3지망</th>
                                    <th className="p-4 text-sm font-bold text-gray-500 whitespace-nowrap min-w-[200px]">지원 이유</th>
                                    <th className="p-4 text-sm font-bold text-gray-500 whitespace-nowrap w-[160px]">부서 즉시 배정</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[...students].sort((a, b) => {
                                    if (sortOption === 'name') return a.name.localeCompare(b.name);
                                    
                                    const appA = jobApplications.find(app => app.userId === a.id);
                                    const appB = jobApplications.find(app => app.userId === b.id);
                                    
                                    const getMinName = (app) => {
                                        const idx = sortOption === 'choice1' ? 0 : sortOption === 'choice2' ? 1 : 2;
                                        const cId = app?.choices?.[idx];
                                        if (!cId) return 'ZZZZ'; // 밑으로 보내기
                                        const min = ministries.find(m => m.id === cId);
                                        return min ? min.name : 'ZZZZ';
                                    };
                                    
                                    const nameA = getMinName(appA);
                                    const nameB = getMinName(appB);
                                    
                                    if (nameA === nameB) return a.name.localeCompare(b.name);
                                    return nameA.localeCompare(nameB);
                                }).map(student => {
                                    const app = jobApplications.find(a => a.userId === student.id);
                                    const currentMin = ministries.find(m => m.id === student.ministryId);
                                    const min1 = app ? ministries.find(m => m.id === app.choices[0]) : null;
                                    const min2 = app ? ministries.find(m => m.id === app.choices[1]) : null;
                                    const min3 = app ? ministries.find(m => m.id === app.choices[2]) : null;

                                    return (
                                        <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 font-bold text-gray-800 whitespace-nowrap">{student.name}</td>
                                            <td className="p-4 whitespace-nowrap">
                                                {currentMin ? (
                                                    <span className={`text-[11px] font-bold px-2 py-1 rounded-full border ${currentMin.color}`}>{currentMin.name}</span>
                                                ) : (
                                                    <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">미배정</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1 min-w-[140px]">
                                                    {student.pastMinistries && student.pastMinistries.length > 0 ? (
                                                        [...student.pastMinistries].slice(-2).map((h, idx) => {
                                                            const isObj = typeof h === 'object';
                                                            const pastId = isObj ? h.ministryId : h;
                                                            const date = isObj ? h.date : '';
                                                            const pastMin = ministries.find(m => m.id === pastId);
                                                            return pastMin ? (
                                                                <div key={idx} className="flex flex-col mb-1 last:mb-0">
                                                                    <span className="text-[10px] bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 truncate whitespace-nowrap inline-block w-fit" title={`${pastMin.name} ${date}`}>
                                                                        {pastMin.name}
                                                                    </span>
                                                                    {date && <span className="text-[8px] text-gray-400 ml-1 font-medium">{date}</span>}
                                                                </div>
                                                            ) : null;
                                                        })
                                                    ) : (
                                                        <span className="text-[10px] text-gray-300">-</span>
                                                    )}
                                                    {student.pastMinistries?.length > 2 && (
                                                        <span className="text-[9px] text-gray-400 font-medium">+{student.pastMinistries.length - 2}개 더보기 (이력관리 탭)</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 bg-indigo-50/30 whitespace-nowrap">
                                                {min1 ? <span className={`text-[11px] font-bold px-2 py-1 rounded-full border ${min1.color}`}>{min1.name}</span> : <span className="text-gray-300">-</span>}
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                {min2 ? <span className={`text-[11px] font-bold px-2 py-1 rounded-full border ${min2.color}`}>{min2.name}</span> : <span className="text-gray-300">-</span>}
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                {min3 ? <span className={`text-[11px] font-bold px-2 py-1 rounded-full border ${min3.color}`}>{min3.name}</span> : <span className="text-gray-300">-</span>}
                                            </td>
                                            <td className="p-4 text-xs text-gray-500 max-w-[200px] align-middle break-keep">
                                                {app?.reason ? (
                                                    <div className="rounded bg-gray-50 p-1.5 border border-gray-100 line-clamp-3 overflow-hidden" title={app.reason}>{app.reason}</div>
                                                ) : <span className="text-gray-300">-</span>}
                                            </td>
                                            <td className="p-4">
                                                <select 
                                                    value={student.ministryId || ''}
                                                    onChange={(e) => {
                                                        const newMinId = e.target.value;
                                                        if (newMinId) {
                                                            const alreadyHad = student.pastMinistries?.some(h => 
                                                                typeof h === 'string' ? h === newMinId : (h?.ministryId === newMinId)
                                                            );
                                                            if (alreadyHad) {
                                                                if (!window.confirm("이 학생은 이전에 해당 부서에서 활동한 적이 있습니다.\n정말 이 부서로 배정하시겠습니까?")) {
                                                                    e.target.value = student.ministryId || '';
                                                                    return;
                                                                }
                                                            }
                                                        }
                                                        const roles = newMinId === student.ministryId ? student.roleIds : [];
                                                        assignStudentRoles(student.id, newMinId || null, roles);
                                                    }}
                                                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer hover:border-indigo-300 outline-none font-bold text-gray-700 min-w-[140px]"
                                                >
                                                    <option value="">--부서 선택--</option>
                                                    {ministries.map(m => (
                                                        <option key={m.id} value={m.id}>{m.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'history' && (
            <div className="flex flex-col p-4 sm:p-6 min-h-[600px] bg-gray-50/30 overflow-hidden">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg mb-1 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-500" />
                            전체 부서 이력 관리
                        </h3>
                        <p className="text-gray-500 text-sm break-keep">모든 학생의 활동 이력을 한눈에 확인하고 편집할 수 있습니다.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-700">학생별 전체 이력 목록 ({students.length}명)</h3>
                        <div className="text-xs text-gray-400 font-medium">* 최근 저장된 순서로 표시됩니다.</div>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 text-sm font-bold text-gray-500 whitespace-nowrap w-[150px]">학생 이름</th>
                                    <th className="p-4 text-sm font-bold text-gray-500">전체 활동 이력 (날짜포함)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[...students].sort((a,b) => a.name.localeCompare(b.name)).map(student => (
                                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 font-bold text-gray-800 align-top whitespace-nowrap border-r border-gray-50">
                                            {student.name}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-2">
                                                {student.pastMinistries && student.pastMinistries.length > 0 ? (
                                                    [...student.pastMinistries].map((h, hIdx) => {
                                                        const isObj = typeof h === 'object';
                                                        const pastId = isObj ? h.ministryId : h;
                                                        const date = isObj ? h.date : '날짜미상';
                                                        const pastMin = ministries.find(m => m.id === pastId);
                                                        
                                                        return (
                                                            <div key={hIdx} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl group hover:border-indigo-300 transition-all shadow-sm">
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs font-bold text-gray-700">{pastMin?.name || '부서없음'}</span>
                                                                    <span className="text-[9px] text-gray-400 font-medium">{date}</span>
                                                                </div>
                                                                <button 
                                                                    onClick={async () => {
                                                                        if (window.confirm(`${student.name} 학생의 ${date} ${pastMin?.name} 기록을 정말 삭제하시겠습니까?`)) {
                                                                            const newPast = student.pastMinistries.filter((_, i) => i !== hIdx);
                                                                            await updateUserPastMinistries(student.id, newPast);
                                                                        }
                                                                    }}
                                                                    className="p-1 text-red-400 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                                    title="이력 삭제"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="text-sm text-gray-300 italic py-2 inline-block">저장된 경력이 없습니다.</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default JobManagement;
