import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { 
    doc, 
    getDoc, 
    setDoc, 
    collection, 
    query, 
    where, 
    getDocs, 
    limit,
    serverTimestamp,
    writeBatch
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const provider = new GoogleAuthProvider();

/**
 * Normalization Helpers
 */
export const normalizeUsername = (str) => str ? str.toLowerCase().trim() : '';
export const normalizePhone = (str) => {
    if (!str) return '';
    const cleaned = str.replace(/\D/g, '');
    return cleaned.slice(-10);
};

/**
 * Check if username is available (Atomic check via 'usernames' collection)
 */
export const isUsernameAvailable = async (username) => {
    const normalized = normalizeUsername(username);
    if (!normalized) return false;
    const userRef = doc(db, 'usernames', normalized);
    const snap = await getDoc(userRef);
    return !snap.exists();
};

/**
 * Signup with Email (Hardened Flow)
 */
export const signupWithEmail = async ({ email, password, name, username, phone }) => {
    const normUsername = normalizeUsername(username);
    const normPhone = normalizePhone(phone);

    // 1. Initial check (Optional but good for UX)
    const available = await isUsernameAvailable(normUsername);
    if (!available) throw new Error('Username already taken');

    try {
        // 2. Create Auth User
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;

        // 3. Atomic reservation and profile creation
        const batch = writeBatch(db);
        
        // Reserve username
        batch.set(doc(db, 'usernames', normUsername), { uid: user.uid });
        // Reserve phone (Optional but good for uniqueness enforcement)
        batch.set(doc(db, 'phones', normPhone), { uid: user.uid });
        
        // Create full profile
        batch.set(doc(db, 'users', user.uid), {
            uid: user.uid,
            name,
            username: normUsername,
            phone: normPhone,
            email: email.toLowerCase(),
            role: 'customer',
            createdAt: serverTimestamp()
        });

        await batch.commit();
        return user;
    } catch (error) {
        console.error('Signup failed:', error);
        throw error;
    }
};

/**
 * Login with Multi-Identifier (Sequential Lookup)
 */
export const loginWithMultiIdentifier = async (identifier, password) => {
    try {
        let email = identifier;

        // If not an email, lookup by username or phone
        if (!identifier.includes('@')) {
            const normId = identifier.trim().toLowerCase();
            
            // 1. Try Username lookup
            const userRef = doc(db, 'usernames', normId);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                const profile = await getUserProfile(userSnap.data().uid);
                email = profile.email;
            } else {
                // 2. Try Phone lookup
                const normPhone = normalizePhone(identifier);
                const phoneRef = doc(db, 'phones', normPhone);
                const phoneSnap = await getDoc(phoneRef);
                
                if (phoneSnap.exists()) {
                    const profile = await getUserProfile(phoneSnap.data().uid);
                    email = profile.email;
                } else {
                    throw new Error('Invalid credentials or account not found');
                }
            }
        }

        // 3. Firebase Auth Login
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error) {
        console.error('Login error:', error);
        throw new Error('Invalid credentials or account not found');
    }
};

/**
 * Initiates Google Sign-In via Popup
 */
export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        await syncUserProfile(user);
        return user;
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

/**
 * Signs out the current user
 */
export const logoutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Logout failed:', error);
        throw error;
    }
};

/**
 * Syncs user profile to Firestore 'users' collection (Safe Merge)
 */
const syncUserProfile = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        // Double check by email if the document ID isn't set yet (prevents duplicates)
        const usersCol = collection(db, 'users');
        const q = query(usersCol, where('email', '==', user.email.toLowerCase()), limit(1));
        const qSnap = await getDocs(q);

        if (qSnap.empty) {
            await setDoc(userRef, {
                uid: user.uid,
                name: user.displayName,
                email: user.email.toLowerCase(),
                role: 'customer',
                createdAt: serverTimestamp()
            });
        }
    } else {
        // Safe update for missing fields ONLY
        const existingData = userSnap.data();
        if (!existingData.name && user.displayName) {
            await setDoc(userRef, { name: user.displayName }, { merge: true });
        }
    }
};

/**
 * Update Profile (Post-Google signup)
 */
export const updateProfile = async (uid, data) => {
    const userRef = doc(db, 'users', uid);
    const normUsername = normalizeUsername(data.username);
    const normPhone = normalizePhone(data.phone);

    // Reserve username and phone
    const batch = writeBatch(db);
    batch.set(doc(db, 'usernames', normUsername), { uid });
    batch.set(doc(db, 'phones', normPhone), { uid });
    batch.set(userRef, {
        ...data,
        username: normUsername,
        phone: normPhone
    }, { merge: true });

    await batch.commit();
};

/**
 * Fetches the user's role and data from Firestore
 */
export const getUserProfile = async (uid) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
};

/**
 * Global auth state listener
 */
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            const profile = await getUserProfile(user.uid);
            if (profile?.role) localStorage.setItem('littiwale_role', profile.role);
            callback({ ...user, profile });
        } else {
            localStorage.removeItem('littiwale_role');
            callback(null);
        }
    });
};
