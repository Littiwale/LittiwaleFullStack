import re

with open("login.html", "r", encoding="utf8") as f:
    html = f.read()

body_start = html.find('<body class="bg-primary text-white font-sans min-h-screen">') + len('<body class="bg-primary text-white font-sans min-h-screen">')
body_end = html.find('<script type="module" src="./src/login.js"></script>')

new_layout = """
    <!-- Background Canvas -->
    <div class="fixed inset-0 bg-[#06080d] z-0 pointer-events-none">
        <div class="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]"></div>
    </div>

    <!-- 1. LOGO OVERLAY (Independent) -->
    <div class="absolute top-8 left-8 md:top-12 md:left-12 z-50 flex items-center space-x-3 pointer-events-none">
        <img src="/images/logo.png" alt="Logo" class="h-6 md:h-8 brightness-0 invert opacity-90">
        <span class="text-lg md:text-xl font-bold tracking-tight text-white">Littiwale</span>
    </div>

    <!-- 2. MAIN LAYOUT WRAPPER (Split Flow) -->
    <div id="auth-wrapper" class="relative z-10 flex flex-col md:flex-row min-h-screen w-full overflow-hidden">
        
        <!-- LEFT SECTION: PANDA VISUAL (50%) -->
        <div class="w-full md:w-1/2 min-h-[40vh] md:min-h-screen flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-white/5 bg-[#080b11]">
            <div class="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
                <img src="/images/login_panda.png" alt="Panda Hero" class="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)] hero-img-login transition-all duration-700">
                <img src="/images/signup_panda.png" alt="Panda Signup" class="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)] hero-img-signup absolute inset-0 opacity-0 scale-105 pointer-events-none transition-all duration-700">
            </div>
        </div>

        <!-- RIGHT SECTION: AUTH FORMS (50%) -->
        <div class="w-full md:w-1/2 min-h-[60vh] md:min-h-screen flex items-center justify-center p-6 md:p-12 bg-[#03060E]">
            <div class="w-full max-w-[400px] glass-card rounded-[24px] p-8 md:p-10 relative flex flex-col text-left shadow-2xl border border-white/5 bg-[#0a0d14]/80 backdrop-blur-xl">
                <div id="auth-loader" class="hidden absolute inset-0 bg-[#0a0d14]/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-[24px]">
                    <div class="h-10 w-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                    <p class="mt-4 text-xs font-bold text-accent uppercase tracking-widest">Processing...</p>
                </div>

                <!-- LOGIN FORM -->
                <div id="login-form-side" class="form-container form-show">
                    <h3 class="text-3xl font-black mb-8 text-white">Log in</h3>

                    <form id="login-form" class="space-y-4">
                        <div class="space-y-1.5">
                            <label class="text-xs font-semibold text-gray-400">Email</label>
                            <input type="text" id="login-identifier" placeholder="demo@example.com" required 
                                class="w-full h-11 bg-gray-900 border border-gray-800 rounded-xl px-4 text-sm text-white placeholder-gray-500 focus:border-accent outline-none transition">
                        </div>
                        <div class="space-y-1.5">
                            <label class="text-xs font-semibold text-gray-400">Password</label>
                            <input type="password" id="login-password" placeholder="••••••••••••" required 
                                class="w-full h-11 bg-gray-900 border border-gray-800 rounded-xl px-4 text-sm text-white placeholder-gray-500 focus:border-accent outline-none transition">
                        </div>
                        
                        <div id="login-error" class="error-msg text-center font-semibold"></div>
                        
                        <button type="submit" id="login-submit-btn" class="w-full h-11 btn-primary hover:scale-[1.02] text-black font-bold rounded-xl transition-transform flex items-center justify-center space-x-2 mt-2">
                            <span>Sign In</span>
                        </button>
                    </form>

                    <div class="relative py-6">
                        <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-800"></div></div>
                        <div class="relative flex justify-center text-[10px]"><span class="bg-[#0e121a] px-4 font-semibold text-gray-500">or continue with</span></div>
                    </div>

                    <div class="space-y-3 mt-2">
                        <button id="google-login-btn" class="w-full flex items-center justify-center space-x-2 h-11 bg-transparent border border-gray-800 rounded-xl hover:bg-white/5 transition group">
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="h-4" alt="Google">
                            <span class="text-sm font-semibold text-gray-300 group-hover:text-white">Sign in with Google</span>
                        </button>
                        <button id="guest-btn" class="w-full h-11 bg-transparent border border-gray-800 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition">
                            Continue as Guest
                        </button>
                    </div>
                    
                    <p class="text-center mt-6 text-sm text-gray-400 font-medium">
                        Don't have an account? <button type="button" id="toggle-to-signup" class="text-accent font-bold hover:text-yellow-600 transition">Register free</button>
                    </p>
                </div>

                <!-- SIGNUP FORM (SIMPLIFIED FOR PREVIEW) -->
                <div id="signup-form-side" class="form-container form-hide">
                    <h3 class="text-2xl font-bold mb-6 text-white">Create Account</h3>
                    <form id="signup-form" class="space-y-4">
                        <div class="grid grid-cols-2 gap-3">
                            <input type="text" id="signup-name" placeholder="Name" required class="w-full h-11 bg-gray-900 border border-gray-800 rounded-xl px-4 text-sm text-white">
                            <input type="text" id="signup-username" placeholder="Username" required class="w-full h-11 bg-gray-900 border border-gray-800 rounded-xl px-4 text-sm text-white">
                        </div>
                        <input type="email" id="signup-email" placeholder="Email" required class="w-full h-11 bg-gray-900 border border-gray-800 rounded-xl px-4 text-sm text-white">
                        <input type="tel" id="signup-phone" placeholder="Phone" required class="w-full h-11 bg-gray-900 border border-gray-800 rounded-xl px-4 text-sm text-white">
                        <input type="password" id="signup-password" placeholder="Password" required class="w-full h-11 bg-gray-900 border border-gray-800 rounded-xl px-4 text-sm text-white">
                        <div id="signup-error" class="error-msg text-center font-semibold"></div>
                        <button type="submit" class="w-full h-11 btn-primary text-black font-bold rounded-xl mt-2">Create Account</button>
                    </form>
                    <p class="text-center mt-6 text-sm text-gray-400 font-medium">
                        Already have account? <button type="button" id="toggle-to-login" class="text-accent font-bold hover:text-yellow-600 transition">Log in</button>
                    </p>
                </div>

                <!-- COMPLETION FORM -->
                <div id="completion-form-side" class="form-container form-hide">
                    <h3 class="text-2xl font-bold mb-6 text-accent">Almost There</h3>
                    <form id="completion-form" class="space-y-4">
                        <input type="text" id="complete-username" placeholder="Username" required class="w-full h-11 bg-gray-900 border border-gray-800 rounded-xl px-4 text-sm text-white">
                        <input type="tel" id="complete-phone" placeholder="Phone" required class="w-full h-11 bg-gray-900 border border-gray-800 rounded-xl px-4 text-sm text-white">
                        <div id="completion-error" class="error-msg text-center font-semibold"></div>
                        <button type="submit" class="w-full h-11 btn-primary text-black font-bold rounded-xl">Complete Setup</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
"""

final = html[:body_start] + new_layout + html[body_end:]
with open("login.html", "w", encoding="utf8") as f:
    f.write(final)
print("Updated successfully")
