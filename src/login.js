import { 
    loginWithGoogle, 
    onAuthChange, 
    signupWithEmail, 
    loginWithMultiIdentifier, 
    isUsernameAvailable,
    updateProfile,
    normalizePhone,
    normalizeUsername
} from './api/auth';

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
 */
onAuthChange(async (user) => {
    if (user) {
        // Only show loader if we have a user and need to check profile / redirect
        loader.classList.remove('hidden');
        const profile = user.profile;
        if (!profile || !profile.username || !profile.phone) {
            loader.classList.add('hidden');
            showForm('completion');
        } else {
            const role = profile.role || 'customer';
            if (role === 'admin' || role === 'manager') {
                window.location.href = '/admin/index.html';
            } else if (role === 'rider') {
                window.location.href = '/rider/index.html';
            } else {
                window.location.href = '/customer/index.html';
            }
        }
    } else {
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

    const identifier = document.querySelector('#login-identifier').value;
    const password = document.querySelector('#login-password').value;

    loader.classList.remove('hidden');
    loginError.textContent = '';

    try {
        await loginWithMultiIdentifier(identifier, password);
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
        await signupWithEmail({ email, password, name, username, phone });
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

        const currentUser = onAuthChange(u => u); // This is not ideal but showing intent
        // We'll get current user from Auth directly or wait for onAuthChange state
        const user = auth.currentUser; 
        if (!user) throw new Error('Session expired');

        const userData = await updateProfile(user.uid, { username, phone });
        const role = userData?.role || 'customer';
        
        if (role === 'admin' || role === 'manager') {
            window.location.href = '/admin/index.html';
        } else if (role === 'rider') {
            window.location.href = '/rider/index.html';
        } else {
            window.location.href = '/customer/index.html';
        }
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
const handleGoogleLogin = async () => {
    try {
        loader.classList.remove('hidden');
        await loginWithGoogle();
    } catch (error) {
        console.error('Google login failed:', error);
        loader.classList.add('hidden');
    }
};

googleBtn?.addEventListener('click', handleGoogleLogin);
googleSignupBtn?.addEventListener('click', handleGoogleLogin);

guestBtn?.addEventListener('click', () => {
    localStorage.setItem('littiwale_guest', 'true');
    window.location.href = '/customer/index.html';
});

// Initial Lockout Check
checkLockout();

import { auth } from './firebase/config';
