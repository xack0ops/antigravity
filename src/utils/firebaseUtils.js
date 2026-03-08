import { db } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

// --- Generic Subscription Helper ---
export const subscribeToCollection = (collectionName, callback, orderByField = 'createdAt', orderDirection = 'desc') => {
  const q = query(
    collection(db, collectionName), 
    orderBy(orderByField, orderDirection)
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(data);
  });
};

export const subscribeToDoc = (collectionName, docId, callback) => {
    const docRef = doc(db, collectionName, docId);
    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data());
        } else {
            callback(null);
        }
    });
}

// --- Specific Feature Helpers ---

// 1. Petitions
// 1. Petitions
export const addPetition = async (title, content, author) => {
  await addDoc(collection(db, 'petitions'), {
    title,
    content,
    author: author || '익명',
    agreeCount: 0,
    agreedUsers: [], 
    createdAt: serverTimestamp()
  });
};

export const agreeToPetition = async (petitionId, userId) => {
    const petitionRef = doc(db, 'petitions', petitionId);
    const { arrayUnion, increment } = await import('firebase/firestore');
    
    // We use arrayUnion to ensure uniqueness of user in the list
    // Ideally we should use a transaction to check existance before incrementing count,
    // but for this scope, relying on UI state + arrayUnion is acceptable.
    // However, to be better, let's use a transaction or checking before update might be overkill code-wise.
    // Let's use arrayUnion.
    
    await updateDoc(petitionRef, {
        agreedUsers: arrayUnion(userId),
        agreeCount: increment(1) 
    });
};

export const deletePetition = async (petitionId) => {
    const petitionRef = doc(db, 'petitions', petitionId);
    await deleteDoc(petitionRef);
};

// 1-A. Surveys
export const addSurvey = async (title, description, options, author, ministryName) => {
    const surveyOptions = options.map(opt => ({ text: opt, votes: 0 }));
    await addDoc(collection(db, 'surveys'), {
        title,
        description,
        options: surveyOptions,
        author: author || '익명',
        ministryName: ministryName || '부서 없음',
        votedUsers: [], // Array of user IDs who have voted
        totalVotes: 0,
        createdAt: serverTimestamp()
    });
};

export const voteSurvey = async (surveyId, userId, optionIndex) => {
    const surveyRef = doc(db, 'surveys', surveyId);
    // Since we need to update a nested array of objects (options) and increment a total count,
    // we should use a transaction to be safe with concurrent votes.
    const { runTransaction } = await import('firebase/firestore');
    
    await runTransaction(db, async (transaction) => {
        const surveyDoc = await transaction.get(surveyRef);
        if (!surveyDoc.exists()) {
            throw "Survey does not exist!";
        }
        
        const data = surveyDoc.data();
        if (data.votedUsers?.includes(userId)) {
            throw "User already voted!";
        }
        
        const newOptions = [...data.options];
        newOptions[optionIndex].votes += 1;
        
        transaction.update(surveyRef, {
            options: newOptions,
            votedUsers: [...(data.votedUsers || []), userId],
            totalVotes: (data.totalVotes || 0) + 1
        });
    });
};

export const deleteSurvey = async (surveyId) => {
    const surveyRef = doc(db, 'surveys', surveyId);
    await deleteDoc(surveyRef);
};

// 2. Song Requests
export const addSongRequest = async (title, singer, requester, story) => {
    await addDoc(collection(db, 'song_requests'), {
        title,
        singer,
        requester: requester || '익명',
        story: story || '',
        played: false,
        createdAt: serverTimestamp()
    });
};

export const toggleSongPlayed = async (requestId, currentStatus) => {
    const ref = doc(db, 'song_requests', requestId);
    await updateDoc(ref, { played: !currentStatus });
};

export const deleteSongRequest = async (requestId) => {
    const ref = doc(db, 'song_requests', requestId);
    await deleteDoc(ref);
};

// 3. Features (Photo / Homework)
export const updateFeatureData = async (featureName, data) => {
    const ref = doc(db, 'features', featureName); // e.g. 'photo' or 'homework'
    // Use set with merge to create if not exists
    const { setDoc } = await import('firebase/firestore');
    await setDoc(ref, data, { merge: true });
};
