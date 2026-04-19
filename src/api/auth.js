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
    updateDoc,
    collection, 
    query, 
    where, 
    getDocs, 
    limit,
    serverTimestamp,
    writeBatch
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/config';

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });
provider.addScope('profile');
provider.addScope('email');

const assertFirebaseConfigured = () => {
    if (!isFirebaseConfigured) {
        throw new Error('Firebase is not configured. Copy .env.example to .env and add your VITE_FIREBASE_* values.');
    }
};

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
    assertFirebaseConfigured();

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
    assertFirebaseConfigured();

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
    assertFirebaseConfigured();

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
    assertFirebaseConfigured();

    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        await syncUserProfile(user);
        return user;
    } catch (error) {
        console.error('Login failed:', error);

        if (error.code === 'auth/unauthorized-domain' || error.code === 'auth/operation-not-allowed') {
            throw new Error('Google Sign-In is not enabled for this Firebase project or local domain. Check Firebase Auth provider settings and authorized domains.');
        }

        if (error.code === 'auth/popup-closed-by-user') {
            throw new Error('Google sign-in popup was closed before completion. Please try again.');
        }

        if (error.code === 'auth/web-storage-unsupported' || error.code === 'auth/cors-unsupported') {
            throw new Error('Your browser blocked the login flow. Try a different browser or allow third-party cookies.');
        }

        throw new Error(error.message || 'Google sign-in failed. Please try again.');
    }
};

/**
 * Signs out the current user
 */
export const logoutUser = async () => {
    assertFirebaseConfigured();

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
    assertFirebaseConfigured();

    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
        // New user — create complete document
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email.toLowerCase(),
            name: user.displayName || "User",
            phone: "",
            username: user.email.split('@')[0],
            role: "customer",
            createdAt: serverTimestamp()
        });
    } else {
        // Existing user — NEVER overwrite, just check role safety
        const data = docSnap.data();
        if (!data.role) {
            await updateDoc(userRef, { role: "customer" });
        }
    }
};

export const createAnonymousGuest = async (user) => {
    assertFirebaseConfigured();

    if (!user?.uid) throw new Error('Anonymous user is required');
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);
    const data = {
        uid: user.uid,
        name: 'Guest',
        role: 'customer',
        isAnonymous: true
    };

    if (!docSnap.exists()) {
        data.createdAt = serverTimestamp();
    }

    await setDoc(userRef, data, { merge: true });
    return user;
};

/**
 * Update Profile (Post-Google signup)
 */
export const updateProfile = async (uid, data) => {
    assertFirebaseConfigured();

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
    return await getUserProfile(uid);
};

/**
 * Fetches the user's role and data from Firestore
 */
export const getUserProfile = async (uid) => {
    assertFirebaseConfigured();

    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
};

export const getUserRole = (user) => String(user?.profile?.role || '').toLowerCase();
export const isAdmin = (user) => getUserRole(user) === 'admin';
export const isManager = (user) => getUserRole(user) === 'manager';
export const isAdminOrManager = (user) => ['admin', 'manager'].includes(getUserRole(user));
export const isRider = (user) => getUserRole(user) === 'rider';
export const isCustomer = (user) => getUserRole(user) === 'customer' || user?.isAnonymous || Boolean(user?.profile?.isAnonymous);

/**
 * Global auth state listener — with error-safe profile fetch.
 *
 * The callback receives (user, isLoading):
 *   isLoading = false always (Firebase resolves synchronously from cache)
 *   user = Firebase user object (with .profile attached) or null
 *
 * IMPORTANT: getPersistence is NOT called here. browserLocalPersistence
 * is the Firebase default. Calling setPersistence inside onAuthChange
 * breaks auth state resolution.
 */
export const onAuthChange = (callback) => {
    if (!isFirebaseConfigured) {
        console.warn('[Auth] Firebase is not configured. Falling back to unauthenticated state.');
        callback(null, false);
        return () => {};
    }

    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const profile = await getUserProfile(user.uid);
                user.profile = profile;
            } catch (err) {
                console.warn('[Auth] Could not fetch Firestore profile:', err);
                user.profile = null;
            }
            callback(user, false);
        } else {
            callback(null, false);
        }
    });
};
