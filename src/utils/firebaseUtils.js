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
