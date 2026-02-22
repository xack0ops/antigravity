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
  const [roles, setRoles] = useState(INITIAL_DATA.roles);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTimetable, setCurrentTimetable] = useState({ periods: Array(6).fill('') });
  const [loading, setLoading] = useState(true);

  // 1. Initial Data Seeding & Real-time Listeners
  useEffect(() => {
    // Listen to Users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      if (snapshot.empty) {
        // If DB is empty, upload initial data automatically
        console.log("Database empty. Seeding initial data...");
        seedDatabase();
      } else {
        const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort specifically to keep admin at bottom or consistent order if needed
        setUsers(usersList.sort((a,b) => a.name.localeCompare(b.name)));
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
        
        // Auto-sync: Check if any hardcoded WIKI_DATA is missing in DB (e.g. new manuals)
        if (wikiList.length > 0) {
             const existingIds = new Set(wikiList.map(item => item.id));
             const missingItems = WIKI_DATA.filter(item => !existingIds.has(item.id));
             
             if (missingItems.length > 0) {
                 console.log(`Found ${missingItems.length} missing wiki items. Syncing...`);
                 seedWiki(missingItems);
             }
        } else {
            // Totally empty, seed all
            seedWiki(WIKI_DATA);
        }
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

    // Daily task reset: reset all tasks to 'pending' at the start of each new day
    const checkAndResetTasks = async () => {
        const today = getLocalDateString(new Date());
        const resetRef = doc(db, 'settings', 'dailyReset');
        const resetSnap = await getDoc(resetRef);
        if (!resetSnap.exists() || resetSnap.data().lastResetDate !== today) {
            console.log('Daily task reset for:', today);
            const tasksSnap = await getDocs(collection(db, 'tasks'));
            const batch = writeBatch(db);
            tasksSnap.docs.forEach(taskDoc => {
                batch.update(taskDoc.ref, { status: 'pending' });
            });
            batch.set(resetRef, { lastResetDate: today });
            await batch.commit();
            console.log('Daily task reset complete.');
        }
    };
    checkAndResetTasks();

    return () => {
      unsubUsers();
      unsubTasks();
      unsubWiki();
      unsubIncidents();
      unsubMessages();
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

    await batch.commit();
    console.log("Seeding complete!");
  };

  const seedWiki = async (itemsToSeed) => {
      const batch = writeBatch(db);
      itemsToSeed.forEach(item => {
          const ref = doc(db, 'wiki', item.id);
          batch.set(ref, item);
      });
      await batch.commit();
      console.log("Wiki seeding/sync complete");
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
    if (storedUserId && users.length > 0) {
        const foundUser = users.find(u => u.id === storedUserId);
        if (foundUser) setCurrentUser(foundUser);
    }
  }, [users]);

  const login = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
        setCurrentUser(user);
        localStorage.setItem('currentUserId', userId);
    }
  };

  const logout = () => {
      setCurrentUser(null);
      localStorage.removeItem('currentUserId');
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

  const assignRole = async (userId, newRoleId) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { roleId: newRoleId });
  };

  const updatePassword = async (userId, newPassword) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { password: newPassword });
  };

  const addUser = async (name) => {
    await addDoc(collection(db, 'users'), {
      name,
      type: 'student',
      password: '1234', // Default password
      roleId: null
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
      users, roles, tasks, wikiEntries, incidents, teacherMessages,
      currentUser,
      loading,
      login, logout,
      toggleTask, verifyTask, assignRole, updatePassword,
      addUser, deleteUser,
      addWikiEntry, updateWikiEntry, deleteWikiEntry,
      addIncident, updateIncident, deleteIncident,
      addTeacherMessage, deleteTeacherMessage,
      currentTimetable, fetchTimetable, saveTimetable, fetchAllTimetables, subscribeToTimetable
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
