import { 
    loginWithGoogle, 
    onAuthChange, 
    signupWithEmail, 
    loginWithMultiIdentifier, 
    isUsernameAvailable,
    updateProfile,
    normalizePhone,
    normalizeUsername,
    createAnonymousGuest
} from './api/auth';
import { auth, isFirebaseConfigured } from './firebase/config';
import { signInAnonymously, signOut } from 'firebase/auth';
import { clearCart } from './store/cart';

const CONFIG_ERROR_MESSAGE = 'Firebase configuration is missing. Copy .env.example to .env and restart the dev server.';

// Selectors
const toggleLogin = document.querySelector('#toggle-to-login');
const toggleSignup = document.querySelector('#toggle-to-signup');
const loginSide = document.querySelector('#login-form-side');
const signupSide = document.querySelector('#signup-form-side');
const completionSide = document.querySelector('#completion-form-side');
const googleBtn = document.querySelector('#google-login-btn');
const googleSignupBtn = document.querySelector('#google-signup-btn');
const guestBtn = document.querySelector('#guest-btn');
const loader = document.querySelector('#auth-loader');
const tabLogin = document.querySelector('#tab-login');
const tabSignup = document.querySelector('#tab-signup');

// Forms & Inputs
const loginForm = document.querySelector('#login-form');
const signupForm = document.querySelector('#signup-form');
const completionForm = document.querySelector('#completion-form');

// Error Displays
const loginError = document.querySelector('#login-error');
const signupError = document.querySelector('#signup-error');
const completionError = document.querySelector('#completion-error');
const lockoutTimer = document.querySelector('#lockout-timer');
const loginSubmitBtn = document.querySelector('#login-submit-btn');

const displayLoginMode = () => {
    loginSide.classList.add('form-show');
    loginSide.classList.remove('form-hide');
    signupSide.classList.add('form-hide');
    signupSide.classList.remove('form-show');
    completionSide.classList.add('form-hide');
    completionSide.classList.remove('form-show');
    toggleLogin?.classList.add('mode-toggle-active');
    toggleSignup?.classList.remove('mode-toggle-active');
    tabLogin?.classList.add('active');
    tabLogin?.classList.remove('tab-inactive');
    tabSignup?.classList.add('tab-inactive');
    tabSignup?.classList.remove('active');
};

const showConfigError = () => {
    loader.classList.add('hidden');
    loginError.textContent = CONFIG_ERROR_MESSAGE;
    signupError.textContent = CONFIG_ERROR_MESSAGE;
    completionError.textContent = CONFIG_ERROR_MESSAGE;
    displayLoginMode();
};

const PHONE_REGEX = /^[6-9]\d{9}$/;

/**
 * Persist Lockout State
 */
const checkLockout = () => {
    const lockoutUntil = localStorage.getItem('littiwale_lockout_until');
    if (lockoutUntil) {
        const remaining = parseInt(lockoutUntil) - Date.now();
        if (remaining > 0) {
            startLockout(remaining);
            return true;
        } else {
            localStorage.removeItem('littiwale_lockout_until');
        }
    }
    return false;
};

const startLockout = (durationMs) => {
    loginSubmitBtn.disabled = true;
    lockoutTimer.classList.remove('hidden');
    
    let secondsLeft = Math.ceil(durationMs / 1000);
    const interval = setInterval(() => {
        secondsLeft--;
        lockoutTimer.textContent = `(${secondsLeft}s)`;
        if (secondsLeft <= 0) {
            clearInterval(interval);
            loginSubmitBtn.disabled = false;
            lockoutTimer.classList.add('hidden');
            localStorage.removeItem('littiwale_lockout_until');
        }
    }, 1000);
};

const incrementFailedAttempts = () => {
    let attempts = parseInt(localStorage.getItem('littiwale_failed_attempts') || '0');
    attempts++;
    localStorage.setItem('littiwale_failed_attempts', attempts);
    
    if (attempts >= 5) {
        const lockoutUntil = Date.now() + 30000;
        localStorage.setItem('littiwale_lockout_until', lockoutUntil);
        localStorage.setItem('littiwale_failed_attempts', '0');
        startLockout(30000);
        return true;
    }
    return false;
};

/**
 * Handle Auth State
 *
 * CRITICAL FIX: Firebase Auth always fires onAuthStateChanged once with null
 * during SDK initialization before resolving the persisted session.
 * We must NOT redirect on that initial null — we wait until isLoading=false.
 *
 * Strategy:
 *   - Show the full-screen loader on page load (hidden in HTML by default via class)
 *   - onAuthChange callback receives (user, isLoading)
 *   - Only act when isLoading === false (auth state is resolved)
 */

// Show loader immediately so there's no flash of the login form
loader.classList.remove('hidden');

onAuthChange(async (user, isLoading) => {
    // Still initializing — keep loader visible, do nothing else
    if (isLoading) return;

    if (!isFirebaseConfigured) {
        showConfigError();
        return;
    }

    if (user) {
        // Keep loader visible while we check profile and redirect
        loader.classList.remove('hidden');
        const profile = user.profile;

        if (user.isAnonymous || profile?.isAnonymous) {
            // Anonymous guest users are valid customers and go directly to the storefront.
            window.location.href = '/';
            return;
        }

        if (!profile || !profile.username || !profile.phone) {
            // Incomplete profile → completion form
            loader.classList.add('hidden');
            showForm('completion');
        } else {
            // Role-based redirect after login
            const role = profile.role || 'customer';
            let redirectUrl = '/';
            
            if (role === 'admin' || role === 'manager') {
                redirectUrl = '/admin/index.html';
            } else if (role === 'rider') {
                redirectUrl = '/rider/index.html';
            } else {
                // customer or unknown role → go to home
                redirectUrl = '/';
            }
            
            window.location.href = redirectUrl;
        }
    } else {
        // Auth resolved — no user, show login form
        loader.classList.add('hidden');
        showForm('login');
    }
});

/**
 * Navigation / Toggles
 */
const showForm = (mode) => {
    [loginSide, signupSide, completionSide].forEach(s => {
        s.classList.add('form-hide');
        s.classList.remove('form-show', 'hidden'); 
    });
    toggleLogin?.classList.remove('mode-toggle-active');
    toggleSignup?.classList.remove('mode-toggle-active');

    const wrapper = document.querySelector('#auth-wrapper');

    if (mode === 'login') {
        document.body.classList.remove('signup-mode');
        loginSide.classList.add('form-show');
        loginSide.classList.remove('form-hide');
        toggleLogin?.classList.add('mode-toggle-active');
        tabLogin?.classList.add('active');
        tabLogin?.classList.remove('tab-inactive');
        tabSignup?.classList.add('tab-inactive');
        tabSignup?.classList.remove('active');
    } else if (mode === 'signup') {
        document.body.classList.add('signup-mode');
        signupSide.classList.add('form-show');
        signupSide.classList.remove('form-hide');
        toggleSignup?.classList.add('mode-toggle-active');
        tabSignup?.classList.add('active');
        tabSignup?.classList.remove('tab-inactive');
        tabLogin?.classList.add('tab-inactive');
        tabLogin?.classList.remove('active');
    } else if (mode === 'completion') {
        document.body.classList.remove('signup-mode');
        completionSide.classList.add('form-show');
        completionSide.classList.remove('form-hide');
    }
};

toggleLogin?.addEventListener('click', () => showForm('login'));
toggleSignup?.addEventListener('click', () => showForm('signup'));
tabLogin?.addEventListener('click', () => showForm('login'));
tabSignup?.addEventListener('click', () => showForm('signup'));

/**
 * LOGIN FLOW
 */
loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (checkLockout()) return;

    if (!isFirebaseConfigured) {
        loginError.textContent = CONFIG_ERROR_MESSAGE;
        loader.classList.add('hidden');
        return;
    }

    const identifier = document.querySelector('#login-identifier').value;
    const password = document.querySelector('#login-password').value;

    loader.classList.remove('hidden');
    loginError.textContent = '';

    try {
        const wasAnonymous = auth.currentUser?.isAnonymous;
        await signOutGuestIfNeeded();
        await loginWithMultiIdentifier(identifier, password);
        if (wasAnonymous) clearCart();
        localStorage.setItem('littiwale_failed_attempts', '0');
    } catch (error) {
        console.error('Login failed:', error);
        loginError.textContent = 'Invalid credentials or account not found';
        incrementFailedAttempts();
        loader.classList.add('hidden');
    }
});

/**
 * SIGNUP FLOW
 */
signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!isFirebaseConfigured) {
        signupError.textContent = CONFIG_ERROR_MESSAGE;
        loader.classList.add('hidden');
        return;
    }

    const name = document.querySelector('#signup-name').value;
    const username = document.querySelector('#signup-username').value;
    const phone = document.querySelector('#signup-phone').value;
    const email = document.querySelector('#signup-email').value;
    const password = document.querySelector('#signup-password').value;

    // Validation
    if (!PHONE_REGEX.test(phone)) {
        signupError.textContent = 'Enter a valid 10-digit mobile number';
        return;
    }

    loader.classList.remove('hidden');
    signupError.textContent = '';

    try {
        const wasAnonymous = auth.currentUser?.isAnonymous;
        await signOutGuestIfNeeded();
        await signupWithEmail({ email, password, name, username, phone });
        if (wasAnonymous) clearCart();
    } catch (error) {
        console.error('Signup failed:', error);
        signupError.textContent = error.message.includes('auth/email-already') 
            ? 'Email already in use' 
            : error.message;
        loader.classList.add('hidden');
    }
});

/**
 * COMPLETION FLOW
 */
completionForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!isFirebaseConfigured) {
        completionError.textContent = CONFIG_ERROR_MESSAGE;
        loader.classList.add('hidden');
        return;
    }

    const username = document.querySelector('#complete-username').value;
    const phone = document.querySelector('#complete-phone').value;

    // Validation
    if (!PHONE_REGEX.test(phone)) {
        completionError.textContent = 'Enter a valid 10-digit mobile number';
        return;
    }

    loader.classList.remove('hidden');
    completionError.textContent = '';

    try {
        // Check if username is available
        const available = await isUsernameAvailable(username);
        if (!available) throw new Error('Username already taken');

        // auth.currentUser is safe here because onAuthChange has already resolved
        const user = auth.currentUser;
        if (!user) throw new Error('Session expired');

        await updateProfile(user.uid, { username, phone });
        
        // Fetch updated profile to get role for proper redirect
        // Get the role from current user profile or default to customer
        const profile = user.profile || {};
        const role = profile.role || 'customer';
        let redirectUrl = '/';
        
        if (role === 'admin' || role === 'manager') {
            redirectUrl = '/admin/index.html';
        } else if (role === 'rider') {
            redirectUrl = '/rider/index.html';
        } else {
            // customer or unknown role → go to home
            redirectUrl = '/';
        }
        
        window.location.href = redirectUrl;
    } catch (error) {
        console.error('Completion failed:', error);
        completionError.textContent = error.message;
        loader.classList.add('hidden');
    }
});

/**
 * GOOGLE & GUEST
 */
/**
 * GOOGLE & GUEST
 */
const showAuthError = (message) => {
    if (!loginSide.classList.contains('form-hide')) {
        loginError.textContent = message;
    } else {
        signupError.textContent = message;
    }
};

const signOutGuestIfNeeded = async () => {
    if (!isFirebaseConfigured || !auth) return;
    if (auth.currentUser?.isAnonymous) {
        try {
            await signOut(auth);
        } catch (err) {
            console.warn('Failed to clear anonymous guest session:', err);
        }
    }
};

const handleGoogleLogin = async () => {
    if (!isFirebaseConfigured) {
        showAuthError(CONFIG_ERROR_MESSAGE);
        return;
    }

    const wasAnonymous = auth.currentUser?.isAnonymous;
    await signOutGuestIfNeeded();
    try {
        loader.classList.remove('hidden');
        await loginWithGoogle();
        if (wasAnonymous) clearCart();
    } catch (error) {
        console.error('Google login failed:', error);
        const message = error?.message || 'Google sign-in failed. Please try again or use email login.';
        showAuthError(message);
        loader.classList.add('hidden');
    }
};

googleBtn?.addEventListener('click', handleGoogleLogin);
googleSignupBtn?.addEventListener('click', handleGoogleLogin);

guestBtn?.addEventListener('click', async () => {
    if (!isFirebaseConfigured) {
        loginError.textContent = CONFIG_ERROR_MESSAGE;
        loader.classList.add('hidden');
        return;
    }

    await signOutGuestIfNeeded();
    loader.classList.remove('hidden');
    loginError.textContent = '';
    try {
        const result = await signInAnonymously(auth);
        await createAnonymousGuest(result.user);
        window.location.href = '/';
    } catch (error) {
        console.error('Guest sign-in failed:', error);
        loginError.textContent = 'Unable to sign in as guest. Please try again.';
        loader.classList.add('hidden');
    }
});

// Initial Lockout Check
checkLockout();
