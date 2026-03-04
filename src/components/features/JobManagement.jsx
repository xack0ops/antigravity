import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Edit2, Trash2, Building, Shield, ClipboardList, Info, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

const JobManagement = () => {
  const { 
    ministries, roles, tasks, 
    addMinistry, updateMinistry, deleteMinistry, 
    addRole, updateRole, deleteRole, 
    adminAddTask, updateTask, deleteTask,
    syncRoles
  } = useAppContext();

  const [selectedMinistryId, setSelectedMinistryId] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState(null);

  // Editing states
  const [editingMinistry, setEditingMinistry] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
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
    await addRole({
      id: `r_${Date.now()}`,
      ministryId: selectedMinistryId,
      name: newRoleName.trim(),
      description: '설명을 입력해주세요.',
      duties: []
    });
    setNewRoleName('');
  };

  const handleUpdateRole = async (id, name, description) => {
    await updateRole(id, { name, description, duties: editingDuties });
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
                                                id={`role-name-${role.id}`}
                                                defaultValue={role.name}
                                                className="w-full px-2 py-1.5 text-sm font-bold border rounded outline-none"
                                            />
                                            <textarea 
                                                id={`role-desc-${role.id}`}
                                                defaultValue={role.description}
                                                className="w-full px-2 py-1.5 text-xs text-gray-600 border rounded outline-none min-h-[60px]"
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
                                                    onClick={() => handleUpdateRole(
                                                        role.id,
                                                        document.getElementById(`role-name-${role.id}`).value,
                                                        document.getElementById(`role-desc-${role.id}`).value
                                                    )}
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
                                                    <button onClick={(e) => { e.stopPropagation(); setEditingRole(role.id); setEditingDuties(role.duties || []); }} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-md hover:bg-blue-50">
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
                                        className="w-full mt-1 px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded text-sm transition-colors"
                                    >저장하기</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default JobManagement;
