import React, { useState } from 'react';
import { CURRICULUM_DATA } from '../data/mockData';
import { Save } from 'lucide-react';

const TimetableEditor = ({ initialPeriods, onSave, onCancel }) => {
    const [editPeriods, setEditPeriods] = useState(initialPeriods || Array(6).fill(''));

    return (
        <div className="grid gap-3">
            {editPeriods.map((subject, index) => (
                <TimetableRowEditor
                    key={index}
                    index={index}
                    value={subject}
                    onChange={(newValue) => {
                        const newPeriods = [...editPeriods];
                        newPeriods[index] = newValue;
                        setEditPeriods(newPeriods);
                    }}
                />
            ))}
            <div className="flex justify-end gap-2 mt-2">
                <button 
                  onClick={onCancel} 
                  className="px-3 py-2 text-sm text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button 
                  onClick={() => onSave(editPeriods)} 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Save className="w-4 h-4" /> 저장
                </button>
            </div>
        </div>
    );
};

// Helper Component for Editing Timetable Row (Internal to this file now)
const TimetableRowEditor = ({ index, value, onChange }) => {
    const subjects = Object.keys(CURRICULUM_DATA.subjects);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');

    const handleSubjectChange = (e) => {
        const subject = e.target.value;
        setSelectedSubject(subject);
        setSelectedUnit('');
        if (subject && subject !== 'custom') {
             // Logic kept simple as per original
        }
    };

    const handleUnitChange = (e) => {
        const unitName = e.target.value;
        setSelectedUnit(unitName);
        
        if (selectedSubject && unitName) {
            // Find session info
            let sessionInfo = '';
            const subjectData = CURRICULUM_DATA.subjects[selectedSubject];
            
            if (selectedSubject === '사회') {
                subjectData.units.forEach(major => {
                    const found = major.sub_units.find(u => u.name === unitName);
                    if (found) sessionInfo = found.sessions;
                });
            } else {
                const found = subjectData.units.find(u => u.name === unitName);
                if (found) sessionInfo = found.sessions;
            }

            // Auto-generate text
            onChange(`[${selectedSubject}] ${unitName} - ${sessionInfo}`);
        }
    };

    // Flatten units for dropdown
    const getUnitOptions = () => {
        if (!selectedSubject || selectedSubject === 'custom') return [];
        const subjectData = CURRICULUM_DATA.subjects[selectedSubject];
        
        if (selectedSubject === '사회') {
            return subjectData.units.flatMap(major => 
                major.sub_units.map(sub => ({
                    value: sub.name,
                    label: `${major.major_unit} > ${sub.name}`
                }))
            );
        } else {
            return subjectData.units.map(u => ({
                value: u.name,
                label: `${u.unit} ${u.name}`
            }));
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-gray-50 p-2 rounded-lg">
            <div className="w-12 text-center text-xs font-bold text-gray-400 bg-white py-2 rounded border border-gray-100 flex-shrink-0">{index + 1}교시</div>
            
            <div className="flex gap-2 w-full sm:w-auto">
                <select 
                    value={selectedSubject} 
                    onChange={handleSubjectChange}
                    className="px-2 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-indigo-500 w-[80px]"
                >
                    <option value="">과목</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    <option value="custom">직접입력</option>
                </select>

                {selectedSubject && selectedSubject !== 'custom' && (
                    <select 
                        value={selectedUnit}
                        onChange={handleUnitChange}
                        className="px-2 py-2 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-indigo-500 max-w-[150px] truncate"
                    >
                        <option value="">단원 선택</option>
                        {getUnitOptions().map((opt, i) => (
                            <option key={i} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                )}
            </div>

            <input 
                type="text" 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 w-full px-3 py-2 bg-white border border-indigo-100 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="배운 내용을 적어주세요"
            />
        </div>
    );
};

export default TimetableEditor;
