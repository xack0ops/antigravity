import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Scale, Gavel, User, Calendar, MapPin, FileText, Plus, Trash2, Search, AlertCircle, CheckCircle, XCircle, Inbox, Send, Eye, EyeOff, BarChart3, HeartHandshake, ChevronDown, ChevronUp, Users, PenLine, X, Sheet, Loader2, ExternalLink } from 'lucide-react';
import { getLocalDateString } from '../../utils/dateUtils';
import { GOOGLE_CLIENT_ID, GOOGLE_SHEETS_SCOPE, SPREADSHEET_TITLE } from '../../googleConfig';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// ========================
// GOOGLE SHEETS EXPORT HOOK
// ========================
const CATEGORY_LABELS = { dispute: '다툼/싸움', rule: '규칙 위반', language: '언어 폭력', property: '분실/파손', other: '기타' };
const STATUS_LABELS = { pending: '접수', investigating: '조사중', verdict: '판결', resolved: '해결', rejected: '반려' };

function useGoogleSheetsExport() {
    const [isExporting, setIsExporting] = useState(false);
    const [exportedUrl, setExportedUrl] = useState(null);
    const tokenClientRef = useRef(null);
    const gapiReadyRef = useRef(false);

    const initGapi = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (gapiReadyRef.current) { resolve(); return; }
            window.gapi.load('client', async () => {
                try {
                    await window.gapi.client.init({
                        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                    });
                    gapiReadyRef.current = true;
                    resolve();
                } catch (e) { reject(e); }
            });
        });
    }, []);

    const exportToSheets = useCallback(async (incidents, users) => {
        if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com') {
            alert('구글 클라이언트 ID를 설정해주세요.\nsrc/googleConfig.js 파일을 열고 GOOGLE_CLIENT_ID에 발급받은 ID를 입력하세요.');
            return;
        }
        setIsExporting(true);
        try {
            await initGapi();

            // Build rows
            const header = ['번호', '날짜', '피해자', '가해자', '관련자', '분류', '장소', '사건 내용', '상태', '판결 내용', '판결 결과', '판결자', '합의 내용', '기록자'];
            const rows = incidents.map((inc, i) => [
                i + 1,
                inc.date || '',
                (inc.victimNames || []).join(', '),
                (inc.perpetratorNames || []).join(', '),
                (inc.relatedNames || []).join(', '),
                CATEGORY_LABELS[inc.category] || inc.category || '',
                inc.place || '',
                inc.content || '',
                STATUS_LABELS[inc.status] || inc.status || '',
                inc.verdict?.content || '',
                inc.verdict?.outcome || '',
                inc.verdict?.judgeName || '',
                inc.resolution || '',
                inc.isAnonymous ? '익명' : (inc.recorderName || ''),
            ]);

            const getToken = () => new Promise((resolve, reject) => {
                if (!tokenClientRef.current) {
                    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
                        client_id: GOOGLE_CLIENT_ID,
                        scope: GOOGLE_SHEETS_SCOPE,
                        callback: (resp) => {
                            if (resp.error) reject(resp);
                            else resolve(resp);
                        },
                    });
                }
                tokenClientRef.current.requestAccessToken({ prompt: '' });
            });

            await getToken();

            // --- GET OR CREATE spreadsheet ---
            const configRef = doc(db, 'settings', 'sheetsConfig');
            const configSnap = await getDoc(configRef);
            let spreadsheetId = configSnap.exists() ? configSnap.data().spreadsheetId : null;
            let spreadsheetUrl;
            let sheetId = 0;

            if (spreadsheetId) {
                // Try to access existing sheet
                try {
                    const meta = await window.gapi.client.sheets.spreadsheets.get({ spreadsheetId });
                    spreadsheetUrl = meta.result.spreadsheetUrl;
                    sheetId = meta.result.sheets[0].properties.sheetId;

                    // Clear existing content
                    await window.gapi.client.sheets.spreadsheets.values.clear({
                        spreadsheetId,
                        range: '사건 기록부',
                    });
                } catch {
                    // Sheet deleted or inaccessible — create new one
                    spreadsheetId = null;
                }
            }

            if (!spreadsheetId) {
                // Create new spreadsheet and save ID
                const createResp = await window.gapi.client.sheets.spreadsheets.create({
                    properties: { title: SPREADSHEET_TITLE },
                    sheets: [{ properties: { title: '사건 기록부' } }],
                });
                spreadsheetId = createResp.result.spreadsheetId;
                spreadsheetUrl = createResp.result.spreadsheetUrl;
                sheetId = createResp.result.sheets[0].properties.sheetId;
                // Save to Firestore for future reuse
                await setDoc(configRef, { spreadsheetId, spreadsheetUrl });
            }

            // Write data
            await window.gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId,
                range: '사건 기록부!A1',
                valueInputOption: 'RAW',
                resource: { values: [header, ...rows] },
            });

            // Format: Bold white header, wrap all cells, wide content column
            await window.gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                resource: {
                    requests: [
                        // Header: dark bg + WHITE bold text
                        {
                            repeatCell: {
                                range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
                                cell: {
                                    userEnteredFormat: {
                                        textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                                        backgroundColor: { red: 0.18, green: 0.18, blue: 0.22 },
                                        verticalAlignment: 'MIDDLE',
                                        horizontalAlignment: 'CENTER',
                                    }
                                },
                                fields: 'userEnteredFormat(textFormat,backgroundColor,verticalAlignment,horizontalAlignment)',
                            },
                        },
                        // All cells: WRAP text
                        {
                            repeatCell: {
                                range: { sheetId, startRowIndex: 0, endRowIndex: rows.length + 1 },
                                cell: { userEnteredFormat: { wrapStrategy: 'WRAP' } },
                                fields: 'userEnteredFormat(wrapStrategy)',
                            },
                        },
                        // Auto-resize all columns
                        { autoResizeDimensions: { dimensions: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: header.length } } },
                        // Set max width for '사건 내용' column (index 7) to 350px
                        {
                            updateDimensionProperties: {
                                range: { sheetId, dimension: 'COLUMNS', startIndex: 7, endIndex: 8 },
                                properties: { pixelSize: 350 },
                                fields: 'pixelSize',
                            },
                        },
                        // Set max width for '판결 내용' column (index 9) to 250px
                        {
                            updateDimensionProperties: {
                                range: { sheetId, dimension: 'COLUMNS', startIndex: 9, endIndex: 10 },
                                properties: { pixelSize: 250 },
                                fields: 'pixelSize',
                            },
                        },
                    ],
                },
            });

            setExportedUrl(spreadsheetUrl);
        } catch (err) {
            console.error('Google Sheets export error:', err);
            if (err.error === 'access_denied') {
                alert('Google 계정 권한이 거부되었습니다.');
            } else if (err.status === 401) {
                alert('인증이 만료되었습니다. 다시 시도해주세요.');
                tokenClientRef.current = null;
            } else {
                alert(`내보내기 실패: ${err.message || JSON.stringify(err)}`);
            }
        } finally {
            setIsExporting(false);
        }
    }, [initGapi]);

    return { exportToSheets, isExporting, exportedUrl, setExportedUrl };
}

const CATEGORIES = [
    { id: 'dispute', label: '다툼/싸움', emoji: '🤼', color: 'red' },
    { id: 'rule', label: '규칙 위반', emoji: '📏', color: 'orange' },
    { id: 'language', label: '언어 폭력', emoji: '🗣️', color: 'pink' },
    { id: 'property', label: '분실/파손', emoji: '📦', color: 'yellow' },
    { id: 'other', label: '기타', emoji: '📋', color: 'gray' },
];

const STATUS_FLOW = [
    { id: 'pending', label: '접수', color: 'yellow', icon: '📥' },
    { id: 'investigating', label: '조사중', color: 'blue', icon: '🔍' },
    { id: 'verdict', label: '판결', color: 'purple', icon: '⚖️' },
    { id: 'resolved', label: '해결', color: 'green', icon: '✅' },
];

const OUTCOMES = ['경고', '봉사활동', '화해', '사과문 작성', '학부모 상담', '기타'];

const StatusBadge = ({ status }) => {
    const s = STATUS_FLOW.find(sf => sf.id === status) || STATUS_FLOW[0];
    const colors = {
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        blue: 'bg-blue-100 text-blue-700 border-blue-200',
        purple: 'bg-purple-100 text-purple-700 border-purple-200',
        green: 'bg-green-100 text-green-700 border-green-200',
    };
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${colors[s.color]}`}>
            {s.icon} {s.label}
        </span>
    );
};

const CategoryBadge = ({ category }) => {
    const c = CATEGORIES.find(cat => cat.id === category) || CATEGORIES[4];
    return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {c.emoji} {c.label}
        </span>
    );
};

const StatusPipeline = ({ currentStatus }) => (
    <div className="flex items-center gap-1 w-full">
        {STATUS_FLOW.map((step, i) => {
            const currentIdx = STATUS_FLOW.findIndex(s => s.id === currentStatus);
            const isActive = i <= currentIdx;
            const isCurrent = i === currentIdx;
            const colors = { yellow: 'bg-yellow-500', blue: 'bg-blue-500', purple: 'bg-purple-500', green: 'bg-green-500' };
            return (
                <React.Fragment key={step.id}>
                    <div className={`flex flex-col items-center gap-1 ${isCurrent ? 'scale-110' : ''} transition-transform`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isActive ? `${colors[step.color]} text-white shadow-md` : 'bg-gray-200 text-gray-400'}`}>
                            {step.icon}
                        </div>
                        <span className={`text-[10px] font-bold ${isActive ? 'text-gray-700' : 'text-gray-400'}`}>{step.label}</span>
                    </div>
                    {i < STATUS_FLOW.length - 1 && (
                        <div className={`flex-1 h-1 rounded-full ${i < currentIdx ? colors[STATUS_FLOW[i+1].color] : 'bg-gray-200'} transition-colors`} />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

// ========================
// MAIN COMPONENT
// ========================
const JudicialSystem = () => {
    const { users, incidents, addIncident, updateIncident, deleteIncident, currentUser, roles } = useAppContext();
    const { exportToSheets, isExporting, exportedUrl, setExportedUrl } = useGoogleSheetsExport();

    // Role & Authority
    const myRole = roles.find(r => r.id === currentUser?.roleId);
    const myMinistryId = myRole?.ministryId;
    const isAuthority = currentUser?.type === 'admin' || myMinistryId === 'm2' || myRole?.id === 'r_justice';

    // State
    const [activeTab, setActiveTab] = useState(isAuthority ? 'records' : 'myrecords');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isVerdictOpen, setIsVerdictOpen] = useState(false);
    const [verdictTarget, setVerdictTarget] = useState(null);
    const [isResolutionOpen, setIsResolutionOpen] = useState(false);
    const [resolutionTarget, setResolutionTarget] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedCard, setExpandedCard] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        victims: [],
        perpetrators: [],
        related: [],
        date: getLocalDateString(new Date()),
        place: '',
        content: '',
        category: 'other',
        isAnonymous: false,
    });

    // Verdict Form State
    const [verdictData, setVerdictData] = useState({ content: '', outcome: '경고' });

    // Resolution Form State
    const [resolutionText, setResolutionText] = useState('');

    const studentUsers = users.filter(u => u.type === 'student').sort((a, b) => a.name.localeCompare(b.name));

    // ========================
    // FILTERING
    // ========================
    const filteredIncidents = useMemo(() => {
        let list = [...incidents];

        // Privacy: students see only their own records/petitions
        if (!isAuthority) {
            list = list.filter(inc =>
                inc.recorderId === currentUser?.id ||
                inc.studentIds?.includes(currentUser?.id) ||
                // backward compat
                inc.studentId === currentUser?.id
            );
        }

        // Tab filter for authority
        if (isAuthority && activeTab === 'inbox') {
            list = list.filter(inc => inc.type === 'petition' && inc.status === 'pending');
        } else if (isAuthority && activeTab === 'records') {
            list = list.filter(inc => inc.status !== 'pending' || inc.type === 'record');
        }

        // Category filter
        if (filterCategory !== 'all') {
            list = list.filter(inc => inc.category === filterCategory);
        }
        // Status filter
        if (filterStatus !== 'all') {
            list = list.filter(inc => inc.status === filterStatus);
        }

        // Search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            list = list.filter(inc =>
                (inc.studentNames || [inc.studentName]).join(' ').toLowerCase().includes(term) ||
                inc.content?.toLowerCase().includes(term) ||
                inc.place?.toLowerCase().includes(term) ||
                inc.recorderName?.toLowerCase().includes(term)
            );
        }

        // Sort by date descending
        list.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        return list;
    }, [incidents, isAuthority, activeTab, filterCategory, filterStatus, searchTerm, currentUser]);

    // ========================
    // STATISTICS
    // ========================
    const stats = useMemo(() => {
        const total = incidents.length;
        const byCategory = CATEGORIES.map(c => ({
            ...c,
            count: incidents.filter(inc => inc.category === c.id).length
        }));
        const byStatus = STATUS_FLOW.map(s => ({
            ...s,
            count: incidents.filter(inc => inc.status === s.id).length
        }));
        const resolved = incidents.filter(inc => inc.status === 'resolved').length;
        const resolveRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

        // Top involved students
        const studentCounts = {};
        incidents.forEach(inc => {
            (inc.studentIds || [inc.studentId]).filter(Boolean).forEach(sid => {
                const name = users.find(u => u.id === sid)?.name || '?';
                studentCounts[name] = (studentCounts[name] || 0) + 1;
            });
        });
        const topStudents = Object.entries(studentCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        return { total, byCategory, byStatus, resolveRate, topStudents };
    }, [incidents, users]);

    // ========================
    // HANDLERS
    // ========================
    const handleSubmit = async (e) => {
        e.preventDefault();
        const allIds = [...formData.victims, ...formData.perpetrators, ...formData.related];
        if (allIds.length === 0 || !formData.content || !formData.place) {
            alert('관련 학생(피해자/가해자/관련자 중 최소 1명), 장소, 내용을 모두 입력해주세요.');
            return;
        }
        const getName = (id) => users.find(u => u.id === id)?.name || '?';
        const type = isAuthority ? 'record' : 'petition';
        const status = isAuthority ? 'investigating' : 'pending';

        // Build studentIds/studentNames as union for backward compat
        const studentIds = [...new Set(allIds)];
        const studentNames = studentIds.map(getName);

        await addIncident({
            studentIds,
            studentNames,
            victims: formData.victims,
            victimNames: formData.victims.map(getName),
            perpetrators: formData.perpetrators,
            perpetratorNames: formData.perpetrators.map(getName),
            related: formData.related,
            relatedNames: formData.related.map(getName),
            date: formData.date,
            place: formData.place,
            content: formData.content,
            category: formData.category,
            isAnonymous: formData.isAnonymous,
            recorderId: currentUser.id,
            recorderName: currentUser.name,
            type,
            status
        });
        alert(isAuthority ? '사건이 기록되었습니다.' : '신고가 접수되었습니다.');
        closeForm();
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setFormData({
            victims: [],
            perpetrators: [],
            related: [],
            date: getLocalDateString(new Date()),
            place: '',
            content: '',
            category: 'other',
            isAnonymous: false,
        });
    };

    const handleStatusChange = async (id, newStatus) => {
        await updateIncident(id, { status: newStatus });
    };

    const handleApprove = async (id) => {
        if (window.confirm('이 신고를 접수하시겠습니까?')) {
            await updateIncident(id, { type: 'record', status: 'investigating' });
        }
    };

    const handleReject = async (id) => {
        if (window.confirm('이 신고를 반려하시겠습니까?')) {
            await updateIncident(id, { status: 'rejected' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('이 기록을 영구 삭제하시겠습니까?')) {
            await deleteIncident(id);
        }
    };

    const openVerdict = (incident) => {
        setVerdictTarget(incident);
        setVerdictData({ content: incident.verdict?.content || '', outcome: incident.verdict?.outcome || '경고' });
        setIsVerdictOpen(true);
    };

    const submitVerdict = async () => {
        if (!verdictData.content) { alert('판결 내용을 입력해주세요.'); return; }
        await updateIncident(verdictTarget.id, {
            verdict: {
                content: verdictData.content,
                outcome: verdictData.outcome,
                judgeId: currentUser.id,
                judgeName: currentUser.name,
                date: getLocalDateString(new Date())
            },
            status: 'verdict'
        });
        setIsVerdictOpen(false);
        setVerdictTarget(null);
        alert('판결이 기록되었습니다.');
    };

    const openResolution = (incident) => {
        setResolutionTarget(incident);
        setResolutionText(incident.resolution || '');
        setIsResolutionOpen(true);
    };

    const submitResolution = async () => {
        if (!resolutionText) { alert('합의/해결 내용을 입력해주세요.'); return; }
        await updateIncident(resolutionTarget.id, {
            resolution: resolutionText,
            status: 'resolved'
        });
        setIsResolutionOpen(false);
        setResolutionTarget(null);
        alert('해결 완료로 기록되었습니다.');
    };

    const toggleRole = (role, studentId) => {
        setFormData(prev => {
            const current = prev[role];
            const updated = current.includes(studentId)
                ? current.filter(id => id !== studentId)
                : [...current, studentId];
            return { ...prev, [role]: updated };
        });
    };

    const getStudentRoleBadge = (student) => {
        if (formData.victims.includes(student.id)) return { label: '피해자', color: 'bg-red-500 text-white' };
        if (formData.perpetrators.includes(student.id)) return { label: '가해자', color: 'bg-orange-500 text-white' };
        if (formData.related.includes(student.id)) return { label: '관련자', color: 'bg-blue-500 text-white' };
        return null;
    };

    const pendingCount = incidents.filter(i => i.type === 'petition' && i.status === 'pending').length;

    // ========================
    // RENDER
    // ========================
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Google Sheets Export Success Banner */}
            {currentUser?.type === 'admin' && exportedUrl && (
                <div className="flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 shadow-sm animate-in fade-in duration-300">
                    <div className="flex items-center gap-3">
                        <Sheet className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                            <p className="font-bold text-emerald-800 text-sm">구글 시트 내보내기 완료! ✅</p>
                            <p className="text-xs text-emerald-600">아래 링크를 클릭해서 시트를 여세요</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <a
                            href={exportedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow"
                        >
                            <ExternalLink className="w-4 h-4" /> 시트 열기
                        </a>
                        <button onClick={() => setExportedUrl(null)} className="p-2 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="text-center space-y-3 py-8 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl text-white relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Scale className="w-32 h-32" />
                </div>
                <h1 className="text-3xl font-black flex items-center justify-center gap-3 relative z-10">
                    <Gavel className="w-8 h-8 text-yellow-500" />
                    솔로몬의 재판소
                </h1>
                <p className="text-slate-300 relative z-10 font-medium">
                    {isAuthority ? '학급 사법 관리 시스템' : '억울한 일이 있거나 신고할 때 이용하세요'}
                </p>
                {isAuthority && (
                    <div className="flex justify-center gap-6 mt-4 relative z-10">
                        <div className="text-center">
                            <p className="text-2xl font-black">{stats.total}</p>
                            <p className="text-xs text-slate-400">전체 사건</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-black text-yellow-400">{pendingCount}</p>
                            <p className="text-xs text-slate-400">접수 대기</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-black text-green-400">{stats.resolveRate}%</p>
                            <p className="text-xs text-slate-400">해결률</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                {isAuthority ? (
                    <>
                        <button onClick={() => setActiveTab('records')}
                            className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-sm ${activeTab === 'records' ? 'bg-slate-800 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <FileText className="w-4 h-4" /> 사건 기록부
                        </button>
                        <button onClick={() => setActiveTab('inbox')}
                            className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-sm ${activeTab === 'inbox' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <Inbox className="w-4 h-4" /> 접수함 {pendingCount > 0 && <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{pendingCount}</span>}
                        </button>
                        <button onClick={() => setActiveTab('stats')}
                            className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-sm ${activeTab === 'stats' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <BarChart3 className="w-4 h-4" /> 통계
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setActiveTab('myrecords')}
                            className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-sm ${activeTab === 'myrecords' ? 'bg-slate-800 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <FileText className="w-4 h-4" /> 나의 기록
                        </button>
                        <button onClick={() => { setActiveTab('submit'); setIsFormOpen(true); }}
                            className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-sm ${activeTab === 'submit' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <Send className="w-4 h-4" /> 사건 접수
                        </button>
                    </>
                )}
            </div>

            {/* ======================== */}
            {/* STATISTICS TAB */}
            {/* ======================== */}
            {activeTab === 'stats' && isAuthority && (
                <div className="space-y-6">
                    {/* Category Chart */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-emerald-600" /> 카테고리별 사건 수</h3>
                        <div className="space-y-3">
                            {stats.byCategory.map(c => {
                                const maxCount = Math.max(...stats.byCategory.map(x => x.count), 1);
                                return (
                                    <div key={c.id} className="flex items-center gap-3">
                                        <span className="w-24 text-sm font-medium text-gray-600 shrink-0">{c.emoji} {c.label}</span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-slate-600 to-slate-800 rounded-full transition-all duration-700"
                                                style={{ width: `${(c.count / maxCount) * 100}%` }}
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">{c.count}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Status Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {stats.byStatus.map(s => {
                            const bgColors = { yellow: 'bg-yellow-50 border-yellow-200', blue: 'bg-blue-50 border-blue-200', purple: 'bg-purple-50 border-purple-200', green: 'bg-green-50 border-green-200' };
                            const textColors = { yellow: 'text-yellow-700', blue: 'text-blue-700', purple: 'text-purple-700', green: 'text-green-700' };
                            return (
                                <div key={s.id} className={`rounded-2xl border p-4 text-center ${bgColors[s.color]}`}>
                                    <p className="text-2xl mb-1">{s.icon}</p>
                                    <p className={`text-2xl font-black ${textColors[s.color]}`}>{s.count}</p>
                                    <p className="text-xs font-bold text-gray-500">{s.label}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Resolve Rate */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-bold text-gray-800 mb-3">해결률</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full transition-all duration-700" style={{ width: `${stats.resolveRate}%` }} />
                            </div>
                            <span className="text-2xl font-black text-emerald-600">{stats.resolveRate}%</span>
                        </div>
                    </div>

                    {/* Top Students - admin only */}
                    {currentUser?.type === 'admin' && stats.topStudents.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-slate-600" /> 관련 빈도 상위 학생</h3>
                            <div className="space-y-2">
                                {stats.topStudents.map((s, i) => (
                                    <div key={s.name} className="flex items-center gap-3 py-2">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-400' : 'bg-gray-400'}`}>{i + 1}</span>
                                        <span className="flex-1 font-medium text-gray-700">{s.name}</span>
                                        <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{s.count}건</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ======================== */}
            {/* RECORDS / INBOX / MY RECORDS */}
            {/* ======================== */}
            {(activeTab === 'records' || activeTab === 'inbox' || activeTab === 'myrecords') && (
                <>
                    {/* Actions Bar */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="이름, 내용, 장소 검색..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                                className="px-4 py-3 rounded-xl border border-gray-200 font-medium text-sm outline-none">
                                <option value="all">모든 분류</option>
                                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                            </select>
                            {isAuthority && activeTab === 'records' && (
                                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                                    className="px-4 py-3 rounded-xl border border-gray-200 font-medium text-sm outline-none">
                                    <option value="all">모든 상태</option>
                                    {STATUS_FLOW.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
                                </select>
                            )}
                            {currentUser?.type === 'admin' && activeTab === 'records' && (
                                <button
                                    onClick={() => exportToSheets(incidents, users)}
                                    disabled={isExporting}
                                    title="사건 기록을 구글 시트로 내보내기"
                                    className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shrink-0">
                                    {isExporting
                                        ? <><Loader2 className="w-4 h-4 animate-spin" /> 내보내는 중...</>
                                        : <><Sheet className="w-4 h-4" /> 구글 시트</>}
                                </button>
                            )}
                            {(isAuthority || activeTab === 'submit') && (
                                <button
                                    onClick={() => setIsFormOpen(true)}
                                    className="bg-slate-800 text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-700 transition-all flex items-center gap-2 shadow-lg shrink-0">
                                    {isAuthority ? <Plus className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                                    {isAuthority ? '기록 추가' : '신고 접수'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Incident Cards */}
                    {filteredIncidents.length > 0 ? (
                        <div className="grid gap-4">
                            {filteredIncidents.map(incident => {
                                const isExpanded = expandedCard === incident.id;
                                const names = incident.studentNames || [incident.studentName];
                                const showReporter = isAuthority || !incident.isAnonymous;

                                return (
                                    <div key={incident.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                                        {/* Card Header */}
                                        <div className="p-5 cursor-pointer" onClick={() => setExpandedCard(isExpanded ? null : incident.id)}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                                    {/* Avatar Group */}
                                                    <div className="flex -space-x-2 shrink-0">
                                                        {names.slice(0, 3).map((name, i) => (
                                                            <div key={i} className="w-10 h-10 rounded-full bg-slate-600 text-white flex items-center justify-center text-sm font-bold border-2 border-white shadow-sm">
                                                                {name[0]}
                                                            </div>
                                                        ))}
                                                        {names.length > 3 && (
                                                            <div className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold border-2 border-white">
                                                                +{names.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                                            <h3 className="font-bold text-gray-800">
                                                                {(incident.studentNames || [incident.studentName]).filter(Boolean).join(', ')}
                                                            </h3>
                                                            <StatusBadge status={incident.status} />
                                                            <CategoryBadge category={incident.category} />
                                                        </div>
                                                        {/* Party Role Tags */}
                                                        {(incident.victimNames?.length > 0 || incident.perpetratorNames?.length > 0 || incident.relatedNames?.length > 0) && (
                                                            <div className="flex flex-wrap gap-1 mb-1">
                                                                {incident.victimNames?.map(n => <span key={n} className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">피해자 {n}</span>)}
                                                                {incident.perpetratorNames?.map(n => <span key={n} className="text-[10px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">가해자 {n}</span>)}
                                                                {incident.relatedNames?.map(n => <span key={n} className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">관련자 {n}</span>)}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {incident.date}</span>
                                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {incident.place}</span>
                                                            {showReporter ? (
                                                                <span className="flex items-center gap-1">
                                                                    <User className="w-3 h-3" /> {incident.recorderName}
                                                                </span>
                                                            ) : (
                                                                <span className="flex items-center gap-1 text-purple-500">
                                                                    <EyeOff className="w-3 h-3" /> 익명 신고
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 text-gray-400">
                                                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Detail */}
                                        {isExpanded && (
                                            <div className="border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                                                {/* Status Pipeline */}
                                                <div className="px-5 py-4 bg-gray-50">
                                                    <StatusPipeline currentStatus={incident.status} />
                                                </div>

                                                {/* Content */}
                                                <div className="p-5 space-y-4">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 mb-2">사건 내용</p>
                                                        <p className="text-gray-700 leading-relaxed bg-slate-50 p-4 rounded-xl font-medium whitespace-pre-wrap">{incident.content}</p>
                                                    </div>

                                                    {/* Verdict (if exists) */}
                                                    {incident.verdict && (
                                                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 space-y-2">
                                                            <p className="text-xs font-bold text-purple-600 flex items-center gap-1"><Gavel className="w-3 h-3" /> 판결</p>
                                                            <p className="text-gray-700 font-medium">{incident.verdict.content}</p>
                                                            <div className="flex items-center gap-3 text-xs text-purple-500">
                                                                <span className="bg-purple-100 px-2 py-0.5 rounded font-bold">결과: {incident.verdict.outcome}</span>
                                                                <span>판결자: {incident.verdict.judgeName}</span>
                                                                <span>{incident.verdict.date}</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Resolution (if exists) */}
                                                    {incident.resolution && (
                                                        <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-2">
                                                            <p className="text-xs font-bold text-green-600 flex items-center gap-1"><HeartHandshake className="w-3 h-3" /> 합의/해결 내용</p>
                                                            <p className="text-gray-700 font-medium">{incident.resolution}</p>
                                                        </div>
                                                    )}

                                                    {/* Anonymous Reporter (Authority only) */}
                                                    {isAuthority && incident.isAnonymous && (
                                                        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 flex items-center gap-2">
                                                            <Eye className="w-4 h-4 text-yellow-600" />
                                                            <span className="text-xs font-bold text-yellow-700">익명 신고자: {incident.recorderName} (관리자만 열람 가능)</span>
                                                        </div>
                                                    )}

                                                    {/* Action Buttons */}
                                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                                                        {/* Approve/Reject for pending petitions */}
                                                        {isAuthority && incident.type === 'petition' && incident.status === 'pending' && (
                                                            <>
                                                                <button onClick={() => handleApprove(incident.id)} className="px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl font-bold text-sm flex items-center gap-1 transition-colors">
                                                                    <CheckCircle className="w-4 h-4" /> 접수
                                                                </button>
                                                                <button onClick={() => handleReject(incident.id)} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm flex items-center gap-1 transition-colors">
                                                                    <XCircle className="w-4 h-4" /> 반려
                                                                </button>
                                                            </>
                                                        )}

                                                        {/* Status Change for Authority */}
                                                        {isAuthority && incident.status === 'investigating' && (
                                                            <button onClick={() => openVerdict(incident)} className="px-4 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-xl font-bold text-sm flex items-center gap-1 transition-colors">
                                                                <PenLine className="w-4 h-4" /> 판결문 작성
                                                            </button>
                                                        )}

                                                        {/* Resolution: Authority or involved student */}
                                                        {(isAuthority || incident.studentIds?.includes(currentUser?.id)) && incident.status !== 'resolved' && incident.status !== 'pending' && (
                                                            <button onClick={() => openResolution(incident)} className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl font-bold text-sm flex items-center gap-1 transition-colors">
                                                                <HeartHandshake className="w-4 h-4" /> {isAuthority ? '해결 완료' : '합의 완료'}
                                                            </button>
                                                        )}

                                                        {/* Delete */}
                                                        {isAuthority && (
                                                            <button onClick={() => handleDelete(incident.id)} className="px-4 py-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-xl font-bold text-sm flex items-center gap-1 transition-colors ml-auto">
                                                                <Trash2 className="w-4 h-4" /> 삭제
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-bold">
                                {activeTab === 'inbox' ? '접수된 신고가 없습니다.' : '기록된 사건이 없습니다.'}
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* ======================== */}
            {/* NEW INCIDENT FORM MODAL */}
            {/* ======================== */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
                        <div className="sticky top-0 bg-white p-6 pb-4 border-b border-gray-100 z-10">
                            <button onClick={closeForm} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                {isAuthority ? <Gavel className="w-5 h-5 text-slate-600" /> : <Send className="w-5 h-5 text-indigo-500" />}
                                {isAuthority ? '새로운 사건 기록' : '사건/갈등 신고 접수'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Role-Based Student Selection */}
                            {[
                                { role: 'victims',      label: '피해자', color: 'red',    borderActive: 'border-red-400 bg-red-50',    btnActive: 'bg-red-500 text-white', desc: '피해를 입은 학생' },
                                { role: 'perpetrators', label: '가해자', color: 'orange', borderActive: 'border-orange-400 bg-orange-50', btnActive: 'bg-orange-500 text-white', desc: '가해를 한 학생' },
                                { role: 'related',      label: '관련자', color: 'blue',   borderActive: 'border-blue-400 bg-blue-50',  btnActive: 'bg-blue-500 text-white',  desc: '사건에 관련된 학생(목격자 등)' },
                            ].map(({ role, label, borderActive, btnActive, desc }) => (
                                <div key={role}>
                                    <label className="block text-sm font-bold text-gray-600 mb-1">
                                        {label}
                                        <span className="ml-2 font-normal text-gray-400 text-xs">{desc}</span>
                                        {formData[role].length > 0 && <span className="ml-2 font-bold text-gray-700">{formData[role].length}명</span>}
                                    </label>
                                    <div className={`grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto border rounded-xl p-2 transition-colors ${formData[role].length > 0 ? borderActive : 'border-gray-200 bg-gray-50'}`}>
                                        {studentUsers.map(u => {
                                            const isSelected = formData[role].includes(u.id);
                                            const otherRole = ['victims','perpetrators','related'].filter(r=>r!==role).find(r=>formData[r].includes(u.id));
                                            return (
                                                <button
                                                    type="button"
                                                    key={u.id}
                                                    onClick={() => toggleRole(role, u.id)}
                                                    disabled={!!otherRole}
                                                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                        isSelected ? btnActive + ' shadow-sm' :
                                                        otherRole ? 'bg-gray-100 text-gray-300 cursor-not-allowed' :
                                                        'bg-white text-gray-700 border border-gray-200 hover:border-gray-400'
                                                    }`}
                                                    title={otherRole ? `이미 ${otherRole === 'victims' ? '피해자' : otherRole === 'perpetrators' ? '가해자' : '관련자'}로 지정됨` : ''}
                                                >
                                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                                        isSelected ? 'bg-white/30' : 'bg-gray-100'
                                                    }`}>
                                                        {isSelected ? '✓' : u.name[0]}
                                                    </div>
                                                    <span className="truncate">{u.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">사건 분류</label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(c => (
                                        <button
                                            type="button"
                                            key={c.id}
                                            onClick={() => setFormData({ ...formData, category: c.id })}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${formData.category === c.id ? 'bg-slate-800 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            {c.emoji} {c.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date & Place */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-2">날짜</label>
                                    <input type="date" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-slate-500 transition-all"
                                        value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-600 mb-2">장소</label>
                                    <input type="text" placeholder="예: 복도, 교실" className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-slate-500 transition-all"
                                        value={formData.place} onChange={e => setFormData({ ...formData, place: e.target.value })} required />
                                </div>
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">사건 내용</label>
                                <textarea
                                    placeholder={isAuthority ? "사건 내용을 정확히 기록해주세요." : "무슨 일이 있었는지 자세히 적어주세요.\n(언제, 어디서, 누가, 무엇을, 어떻게, 왜)"}
                                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-slate-500 h-32 resize-none transition-all"
                                    value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} required
                                />
                            </div>

                            {/* Anonymous Toggle */}
                            {!isAuthority && (
                                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                                    <div className="flex items-center gap-2">
                                        <EyeOff className="w-5 h-5 text-purple-500" />
                                        <div>
                                            <p className="font-bold text-sm text-gray-800">익명으로 신고하기</p>
                                            <p className="text-xs text-gray-500">선생님/관리자만 신고자를 확인할 수 있어요</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setFormData({ ...formData, isAnonymous: !formData.isAnonymous })}
                                        className={`w-12 h-7 rounded-full transition-all relative ${formData.isAnonymous ? 'bg-purple-500' : 'bg-gray-300'}`}>
                                        <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow-sm ${formData.isAnonymous ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button type="button" onClick={closeForm} className="py-3 rounded-xl font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">취소</button>
                                <button type="submit" className="py-3 rounded-xl font-bold text-white shadow-md bg-slate-800 hover:bg-slate-900 transition-all">
                                    {isAuthority ? '기록하기' : '접수하기'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ======================== */}
            {/* VERDICT MODAL */}
            {/* ======================== */}
            {isVerdictOpen && verdictTarget && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-black text-purple-800 mb-2 flex items-center gap-2">
                            <Gavel className="w-6 h-6" /> 판결문 작성
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                            대상: <strong>{(verdictTarget.studentNames || [verdictTarget.studentName]).join(', ')}</strong>
                        </p>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">판결 내용</label>
                                <textarea
                                    placeholder="조사 결과와 판결 이유를 적어주세요."
                                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-purple-500 h-32 resize-none"
                                    value={verdictData.content} onChange={e => setVerdictData({ ...verdictData, content: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">판결 결과</label>
                                <div className="flex flex-wrap gap-2">
                                    {OUTCOMES.map(o => (
                                        <button type="button" key={o} onClick={() => setVerdictData({ ...verdictData, outcome: o })}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${verdictData.outcome === o ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                            {o}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button onClick={() => { setIsVerdictOpen(false); setVerdictTarget(null); }} className="py-3 rounded-xl font-bold border border-gray-200 text-gray-500 hover:bg-gray-50">취소</button>
                                <button onClick={submitVerdict} className="py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md">판결 확정</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================== */}
            {/* RESOLUTION MODAL */}
            {/* ======================== */}
            {isResolutionOpen && resolutionTarget && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-black text-emerald-800 mb-2 flex items-center gap-2">
                            <HeartHandshake className="w-6 h-6" /> {isAuthority ? '해결 완료 처리' : '당사자 합의'}
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                            대상: <strong>{(resolutionTarget.studentNames || [resolutionTarget.studentName]).join(', ')}</strong>
                        </p>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-2">
                                    {isAuthority ? '해결/후속 조치 내용' : '합의 내용'}
                                </label>
                                <textarea
                                    placeholder={isAuthority ? "어떻게 해결되었는지 기록해주세요." : "서로 어떻게 합의했는지 적어주세요.\n(예: 서로 사과하고 화해했습니다)"}
                                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 h-32 resize-none"
                                    value={resolutionText} onChange={e => setResolutionText(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button onClick={() => { setIsResolutionOpen(false); setResolutionTarget(null); }} className="py-3 rounded-xl font-bold border border-gray-200 text-gray-500 hover:bg-gray-50">취소</button>
                                <button onClick={submitResolution} className="py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md">
                                    {isAuthority ? '해결 완료' : '합의 제출'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JudicialSystem;
