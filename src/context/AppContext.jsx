import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_DATA } from '../data/mockData';
import { WIKI_DATA } from '../data/wikiData';
import { db } from '../firebase';
import { getLocalDateString } from '../utils/dateUtils';
import { 
  addDoc,
  deleteDoc,
  setDoc,
  getDoc,
  getDocs,
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  writeBatch, 
  query, 
  orderBy 
} from 'firebase/firestore';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [wikiEntries, setWikiEntries] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [teacherMessages, setTeacherMessages] = useState([]);
  const [roles, setRoles] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [scoreTransactions, setScoreTransactions] = useState([]);
  const [scoreShop, setScoreShop] = useState([]);
  const [fineRecords, setFineRecords] = useState([]);
  const [classBudget, setClassBudget] = useState(0);
  const [budgetTransactions, setBudgetTransactions] = useState([]);
  const [marketPosts, setMarketPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [originalAdminId, setOriginalAdminId] = useState(null);
  const [currentTimetable, setCurrentTimetable] = useState({ periods: Array(6).fill('') });
  const [loading, setLoading] = useState(true);

  // 1. Initial Data Seeding & Real-time Listeners
  useEffect(() => {
    // Listen to Users
    const unsubUsers = onSnapshot(collection(db, 'users'), async (snapshot) => {
      if (snapshot.empty) {
        // 안전 장치: settings/initialized 플래그가 있으면 절대 시드하지 않음
        // (네트워크 오류나 타이밍 문제로 빈 snapshot이 와도 실데이터를 지우지 않기 위함)
        const initRef = doc(db, 'settings', 'initialized');
        const initSnap = await getDoc(initRef);
        if (initSnap.exists()) {
          console.warn("Users collection appears empty but DB is already initialized. Skipping seed.");
          return;
        }
        console.log("Database empty and not initialized. Seeding initial data...");
        seedDatabase();
      } else {
        const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort specifically to keep admin at bottom or consistent order if needed
        setUsers(usersList.sort((a,b) => a.name.localeCompare(b.name)));
      }
    });

    // Listen to Ministries
    const unsubMinistries = onSnapshot(collection(db, 'ministries'), (snapshot) => {
      if (snapshot.empty) {
        seedMinistries();
      } else {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMinistries(list.sort((a,b) => a.id.localeCompare(b.id)));
      }
    });

    // Listen to Roles
    const unsubRoles = onSnapshot(collection(db, 'roles'), (snapshot) => {
      if (snapshot.empty) {
        seedRoles();
      } else {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRoles(list.sort((a,b) => a.id.localeCompare(b.id)));
      }
    });

    // Listen to Tasks
    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const tasksList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(tasksList);
      setLoading(false);

      // Auto-sync tasks if "action" field is missing in DB but exists in Code (e.g. Judicial Update)
      if (tasksList.length > 0) {
          const tasksWithAction = INITIAL_DATA.tasks.filter(t => t.action);
          const needsUpdate = tasksWithAction.some(localTask => {
              const dbTask = tasksList.find(t => t.id === localTask.id);
              return dbTask && !dbTask.action;
          });

          if (needsUpdate) {
              console.log("Syncing tasks with new actions...");
              syncTasks(INITIAL_DATA.tasks);
          }
      }
    });

    // Listen to Wiki
    const unsubWiki = onSnapshot(collection(db, 'wiki'), (snapshot) => {
        const wikiList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWikiEntries(wikiList);
    });

    // Listen to Incidents (Judicial System)
    const unsubIncidents = onSnapshot(query(collection(db, 'incidents'), orderBy('date', 'desc')), (snapshot) => {
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setIncidents(list);
    });

    // Listen to Teacher Messages
    const unsubMessages = onSnapshot(
        query(collection(db, 'teacher_messages'), orderBy('timestamp', 'desc')),
        (snapshot) => {
            setTeacherMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        }
    );

    // Listen to Score Transactions
    const unsubScoreTransactions = onSnapshot(
        query(collection(db, 'score_transactions'), orderBy('timestamp', 'desc')),
        (snapshot) => {
            setScoreTransactions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        }
    );

    // Listen to Score Shop
    const unsubScoreShop = onSnapshot(collection(db, 'score_shop'), (snapshot) => {
        setScoreShop(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Listen to Fine Records
    const unsubFineRecords = onSnapshot(
        query(collection(db, 'fine_records'), orderBy('timestamp', 'desc')),
        (snapshot) => {
            setFineRecords(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        }
    );

    // Listen to Class Budget
    const unsubClassBudget = onSnapshot(doc(db, 'settings', 'class_budget'), (docSnap) => {
        if (docSnap.exists()) {
            setClassBudget(docSnap.data().amount || 0);
        } else {
            setClassBudget(0);
        }
    });

    // Listen to Budget Transactions
    const unsubBudgetTransactions = onSnapshot(
        query(collection(db, 'budget_transactions'), orderBy('timestamp', 'desc')),
        (snapshot) => {
            setBudgetTransactions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        }
    );

    // Listen to Flea Market Posts
    const unsubMarketPosts = onSnapshot(
        query(collection(db, 'market_posts'), orderBy('timestamp', 'desc')),
        (snapshot) => {
            setMarketPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        }
    );

    // Daily and Weekly task reset
    const checkAndResetTasks = async () => {
        const now = new Date();
        // 8시간(8 * 60 * 60 * 1000 ms)을 빼서 오전 8시를 자정처럼 처리
        // 예: 25일 오전 7시 59분 -> 24일 오후 11시 59분으로 계산되어 24일로 취급됨. 
        // 25일 오전 8시 00분 -> 25일 오전 0시 00분으로 계산되어 25일로 취급됨.
        const resetBoundaryDate = new Date(now.getTime() - (8 * 60 * 60 * 1000));
        
        const todayStr = getLocalDateString(resetBoundaryDate);
        const isMonday = resetBoundaryDate.getDay() === 1; // 0 is Sunday, 1 is Monday

        const resetRef = doc(db, 'settings', 'taskResets');
        const resetSnap = await getDoc(resetRef);
        
        let lastDailyReset = null;
        let lastWeeklyReset = null;

        if (resetSnap.exists()) {
            lastDailyReset = resetSnap.data().lastDailyReset;
            lastWeeklyReset = resetSnap.data().lastWeeklyReset;
        }

        const needsDailyReset = lastDailyReset !== todayStr;
        
        // Date difference to prevent resetting multiple times on same Monday
        let needsWeeklyReset = false;
        if (isMonday) {
            if (!lastWeeklyReset) {
                 needsWeeklyReset = true;
            } else {
                 const diffTime = Math.abs(resetBoundaryDate - new Date(lastWeeklyReset));
                 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                 // If it's Monday and the last weekly reset was more than 3 days ago, it's a new week
                 if (diffDays > 3) needsWeeklyReset = true;
            }
        }

        if (needsDailyReset || needsWeeklyReset) {
            console.log(`Task reset triggered. Daily: ${needsDailyReset}, Weekly: ${needsWeeklyReset}`);
            const tasksSnap = await getDocs(collection(db, 'tasks'));
            const batch = writeBatch(db);
            
            tasksSnap.docs.forEach(taskDoc => {
                const taskData = taskDoc.data();
                const freqType = taskData.frequency?.type || 'daily'; // Default to daily if undefined
                
                let shouldResetThisTask = false;

                if (needsDailyReset && (freqType === 'daily' || freqType === 'specific_days')) {
                    shouldResetThisTask = true;
                }
                if (needsWeeklyReset && freqType === 'weekly') {
                    shouldResetThisTask = true;
                }

                if (shouldResetThisTask) {
                    batch.update(taskDoc.ref, { status: 'pending' });
                }
            });

            // Save reset timestamps
            const newResetData = {
                lastDailyReset: needsDailyReset ? todayStr : lastDailyReset,
                lastWeeklyReset: needsWeeklyReset ? todayStr : lastWeeklyReset
            };
            
            batch.set(resetRef, newResetData, { merge: true });
            await batch.commit();
            console.log('Task reset complete.', newResetData);
        }
    };
    checkAndResetTasks();

    return () => {
      unsubUsers();
      unsubMinistries();
      unsubRoles();
      unsubTasks();
      unsubWiki();
      unsubIncidents();
      unsubMessages();
      unsubScoreTransactions();
      unsubScoreShop();
      unsubFineRecords();
      unsubClassBudget();
      unsubBudgetTransactions();
      unsubMarketPosts();
    };
  }, []);

  // Helper to seed database
  const seedDatabase = async () => {
    const batch = writeBatch(db);
    
    // Seed Users
    INITIAL_DATA.users.forEach(user => {
      const ref = doc(db, 'users', user.id);
      batch.set(ref, { ...user, password: user.password || '1234' });
    });

    // Seed Tasks
    INITIAL_DATA.tasks.forEach(task => {
        const ref = doc(db, 'tasks', task.id);
        batch.set(ref, { ...task, status: 'pending' });
    });

    // Seed Wiki
    WIKI_DATA.forEach(item => {
        const ref = doc(db, 'wiki', item.id);
        batch.set(ref, item);
    });

    await batch.commit();

    // 초기화 플래그 저장 — 이후 실수로 재시드 방지
    await setDoc(doc(db, 'settings', 'initialized'), {
      seededAt: new Date().toISOString(),
      version: 1,
    });
    console.log("Seeding complete! Initialized flag saved.");
  };

  const seedMinistries = async () => {
    const batch = writeBatch(db);
    INITIAL_DATA.ministries.forEach(ministry => {
      const ref = doc(db, 'ministries', ministry.id);
      batch.set(ref, ministry);
    });
    await batch.commit();
  };

  const seedRoles = async () => {
    const batch = writeBatch(db);
    INITIAL_DATA.roles.forEach(role => {
      const ref = doc(db, 'roles', role.id);
      // Ensure duties is at least an empty array
      batch.set(ref, { ...role, duties: role.duties || [] });
    });
    await batch.commit();
  };

  const syncRoles = async (rolesToSync) => {
    const batch = writeBatch(db);
    rolesToSync.forEach(role => {
      const ref = doc(db, 'roles', role.id);
      // merge:true로 status 등 다른 필드는 유지하고 duties/description만 덮어씌움
      batch.set(ref, { duties: role.duties || [], description: role.description || '', name: role.name }, { merge: true });
    });
    await batch.commit();
    console.log('Role duties/descriptions synced.');
  };

  const syncTasks = async (tasksToSync) => {
      const batch = writeBatch(db);
      tasksToSync.forEach(task => {
          const ref = doc(db, 'tasks', task.id);
          // Use merge:true to preserve status but update logic fields like action
          batch.set(ref, task, { merge: true });
      });
      await batch.commit();
      console.log("Tasks synced with codebase.");
  };

  // Restore session on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('currentUserId');
    const storedAdminId = localStorage.getItem('originalAdminId');
    
    if (users.length > 0) {
        if (storedUserId) {
            const foundUser = users.find(u => u.id === storedUserId);
            if (foundUser) setCurrentUser(foundUser);
        }
        if (storedAdminId) {
            setOriginalAdminId(storedAdminId);
        }
    }
  }, [users]);

  const login = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
        setCurrentUser(user);
        localStorage.setItem('currentUserId', userId);
    }
  };

  const impersonateUser = (studentId) => {
      const student = users.find(u => u.id === studentId);
      if (student && currentUser && currentUser.type === 'admin') {
          setOriginalAdminId(currentUser.id);
          localStorage.setItem('originalAdminId', currentUser.id);
          
          setCurrentUser(student);
          localStorage.setItem('currentUserId', studentId);
      }
  };

  const stopImpersonating = () => {
      if (originalAdminId) {
          const admin = users.find(u => u.id === originalAdminId);
          if (admin) {
              setCurrentUser(admin);
              localStorage.setItem('currentUserId', admin.id);
          }
          setOriginalAdminId(null);
          localStorage.removeItem('originalAdminId');
      }
  };

  const logout = () => {
      setCurrentUser(null);
      setOriginalAdminId(null);
      localStorage.removeItem('currentUserId');
      localStorage.removeItem('originalAdminId');
  };

  // Task Actions (Write to Firestore)
  const toggleTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let newStatus = task.status;
    
    if (task.type === 'self') {
      newStatus = task.status === 'completed' ? 'pending' : 'completed';
    } else {
      // Admin check type
      if (task.status === 'pending') newStatus = 'waiting_approval';
      else if (task.status === 'waiting_approval') newStatus = 'pending'; // Cancel
    }

    // Update Firestore
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, { status: newStatus });
  };

  const verifyTask = async (taskId) => {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, { status: 'verified' });
  };

  const assignStudentRoles = async (userId, ministryId, roleIds) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { ministryId, roleIds });
  };

  const updatePassword = async (userId, newPassword) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { password: newPassword });
  };
  const addMinistry = async (data) => {
    await addDoc(collection(db, 'ministries'), data);
  };
  const updateMinistry = async (id, data) => {
    await updateDoc(doc(db, 'ministries', id), data);
  };
  const deleteMinistry = async (id) => {
    await deleteDoc(doc(db, 'ministries', id));
  };

  const addRole = async (data) => {
    await addDoc(collection(db, 'roles'), data);
  };
  const updateRole = async (id, data) => {
    await updateDoc(doc(db, 'roles', id), data);
  };
  const deleteRole = async (id) => {
    await deleteDoc(doc(db, 'roles', id));
  };

  const adminAddTask = async (task) => {
    await addDoc(collection(db, 'tasks'), {
        ...task,
        status: 'pending',
        frequency: task.frequency || { type: 'daily', days: [] }
    });
  };
  const updateTask = async (id, data) => {
    await updateDoc(doc(db, 'tasks', id), data);
  };
  const deleteTask = async (id) => {
    await deleteDoc(doc(db, 'tasks', id));
  };

  const addUser = async (name) => {
    await addDoc(collection(db, 'users'), {
      name,
      type: 'student',
      password: '1234', // Default password
      ministryId: null,
      roleIds: []
    });
  };

  const deleteUser = async (userId) => {
    await deleteDoc(doc(db, 'users', userId));
  };

  // Wiki Actions
  const addWikiEntry = async (entry) => {
      // entry: { title, category, content, keywords, relatedDept }
      await addDoc(collection(db, 'wiki'), entry);
  };

  const updateWikiEntry = async (id, entry) => {
      const ref = doc(db, 'wiki', id);
      await updateDoc(ref, entry);
  };

  const deleteWikiEntry = async (id) => {
      await deleteDoc(doc(db, 'wiki', id));
  };

  // Judicial System Actions
  const addIncident = async (incident) => {
      await addDoc(collection(db, 'incidents'), {
          ...incident,
          type: incident.type || 'record',
          status: incident.status || 'pending',
          studentIds: incident.studentIds || [],
          studentNames: incident.studentNames || [],
          category: incident.category || 'other',
          isAnonymous: incident.isAnonymous || false,
          verdict: incident.verdict || null,
          resolution: incident.resolution || '',
          timestamp: new Date().toISOString(),
          updatedAt: new Date().toISOString()
      });
  };

  const updateIncident = async (id, data) => {
      const ref = doc(db, 'incidents', id);
      await updateDoc(ref, {
          ...data,
          updatedAt: new Date().toISOString()
      });
  };

  const deleteIncident = async (id) => {
      await deleteDoc(doc(db, 'incidents', id));
  };

  // Teacher Messages Actions
  const addTeacherMessage = async ({ content, authorId, authorName }) => {
      await addDoc(collection(db, 'teacher_messages'), {
          content,
          authorId,
          authorName,
          date: getLocalDateString(new Date()),
          timestamp: new Date().toISOString(),
      });
  };

  const deleteTeacherMessage = async (id) => {
      await deleteDoc(doc(db, 'teacher_messages', id));
  };

  // Score System Actions
  // isSpend: true = 점수 사용(현재점수만 감소), false = 부여/차감(현재+누적 모두 반영)
  const addScoreTransaction = async ({ userId, amount, reason, isSpend, grantedBy, grantedByName }) => {
      await addDoc(collection(db, 'score_transactions'), {
          userId,
          amount,       // positive = 부여, negative = 차감
          reason,
          isSpend: isSpend || false,
          grantedBy,
          grantedByName,
          timestamp: new Date().toISOString(),
      });
  };

  const deleteScoreTransaction = async (id) => {
      await deleteDoc(doc(db, 'score_transactions', id));
  };

  // Score Shop CRUD
  const addScoreShopItem = async (data) => {
      await addDoc(collection(db, 'score_shop'), data);
  };
  const updateScoreShopItem = async (id, data) => {
      await updateDoc(doc(db, 'score_shop', id), data);
  };
  const deleteScoreShopItem = async (id) => {
      await deleteDoc(doc(db, 'score_shop', id));
  };

  // Fine Records Actions
  const addFineRecord = async (data) => {
      await addDoc(collection(db, 'fine_records'), {
          ...data,
          status: 'unpaid', // unpaid, paid
          timestamp: new Date().toISOString()
      });
  };
  const updateFineRecordStatus = async (id, status) => {
      await updateDoc(doc(db, 'fine_records', id), { status });
  };

  // Class Budget Actions
  const updateClassBudget = async (amount) => {
      await setDoc(doc(db, 'settings', 'class_budget'), {
          amount,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser?.id
      });
  };

  const addBudgetTransaction = async (data) => {
      await addDoc(collection(db, 'budget_transactions'), {
          ...data,
          timestamp: new Date().toISOString()
      });
  };

  const deleteBudgetTransaction = async (id) => {
      await deleteDoc(doc(db, 'budget_transactions', id));
  };

  // Flea Market Actions
  const addMarketPost = async (data) => {
      await addDoc(collection(db, 'market_posts'), {
          ...data,
          status: 'active', // 'active', 'completed'
          participants: [], // For '번개' type
          timestamp: new Date().toISOString()
      });
  };

  const updateMarketPostStatus = async (id, status) => {
      await updateDoc(doc(db, 'market_posts', id), { status });
  };

  const deleteMarketPost = async (id) => {
      await deleteDoc(doc(db, 'market_posts', id));
  };

  const joinMarketPost = async (postId, user) => {
      const postRef = doc(db, 'market_posts', postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
          const post = postSnap.data();
          const currentParticipants = post.participants || [];
          if (!currentParticipants.some(p => p.id === user.id)) {
             await updateDoc(postRef, {
                 participants: [...currentParticipants, { id: user.id, name: user.name }]
             });
          }
      }
  };

  const leaveMarketPost = async (postId, userId) => {
      const postRef = doc(db, 'market_posts', postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
          const post = postSnap.data();
          const currentParticipants = post.participants || [];
          await updateDoc(postRef, {
              participants: currentParticipants.filter(p => p.id !== userId)
          });
      }
  };

  // Helper: compute score summary for a user
  const getUserScoreSummary = (userId) => {
      const userTxns = scoreTransactions.filter(t => t.userId === userId);
      // 현재 점수: 모든 거래 합
      const currentScore = userTxns.reduce((sum, t) => sum + (t.amount || 0), 0);
      // 누적 점수: isSpend=false 거래만 합산
      const accumulatedScore = userTxns
          .filter(t => !t.isSpend)
          .reduce((sum, t) => sum + (t.amount || 0), 0);
      const creditGrade = Math.max(0, Math.floor(accumulatedScore / 10));
      return { currentScore, accumulatedScore, creditGrade };
  };

  // Enhanced Real-time Timetable Listener
  const subscribeToTimetable = (dateStr, callback) => {
    const docRef = doc(db, 'timetables', dateStr);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Update local state if it matches the current context needed? 
        // Or just let the component handle the state update via callback?
        // Let's do both: update global state if currently selected, but primarily callback.
        callback(data);
      } else {
        callback({ periods: Array(6).fill('') });
      }
    });
  };

  const fetchTimetable = async (dateStr) => {
    // dateStr format: YYYY-MM-DD
    const docRef = doc(db, 'timetables', dateStr);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        setCurrentTimetable(docSnap.data());
    } else {
        setCurrentTimetable({ periods: Array(6).fill('') });
    }
  };

  const saveTimetable = async (dateStr, periods) => {
    const docRef = doc(db, 'timetables', dateStr);
    await setDoc(docRef, {
        periods,
        lastUpdatedBy: currentUser.id,
        updatedAt: new Date().toISOString()
    });
    // Optimistic update
    setCurrentTimetable({ periods });
  };

  const fetchAllTimetables = async () => {
    const q = query(collection(db, 'timetables'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  return (
    <AppContext.Provider value={{
      users, roles, ministries, tasks, wikiEntries, incidents, teacherMessages,
      scoreTransactions, scoreShop, fineRecords, classBudget, budgetTransactions, marketPosts,
      currentUser, originalAdminId,
      loading,
      login, logout, impersonateUser, stopImpersonating,
      toggleTask, verifyTask, assignStudentRoles, updatePassword,
      addMinistry, updateMinistry, deleteMinistry,
      addRole, updateRole, deleteRole,
      adminAddTask, updateTask, deleteTask,
      addUser, deleteUser,
      addWikiEntry, updateWikiEntry, deleteWikiEntry,
      addIncident, updateIncident, deleteIncident,
      addTeacherMessage, deleteTeacherMessage,
      addScoreTransaction, deleteScoreTransaction,
      addScoreShopItem, updateScoreShopItem, deleteScoreShopItem,
      addFineRecord, updateFineRecordStatus,
      updateClassBudget, addBudgetTransaction, deleteBudgetTransaction,
      addMarketPost, updateMarketPostStatus, deleteMarketPost, joinMarketPost, leaveMarketPost,
      getUserScoreSummary,
      syncRoles,
      currentTimetable, fetchTimetable, saveTimetable, fetchAllTimetables, subscribeToTimetable
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
