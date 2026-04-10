import re

with open("login.html", "r", encoding="utf8") as f:
    html = f.read()

body_start = html.find('<body class="bg-primary text-white font-sans min-h-screen">') + len('<body class="bg-primary text-white font-sans min-h-screen">')
body_end = html.find('<script type="module" src="./src/login.js"></script>')

new_layout = """
    <!-- Split Layout Wrapper -->
    <div id="auth-wrapper" class="min-h-screen flex w-full bg-[#03060E] relative overflow-hidden">
        
        <!-- Background Glow -->
        <div class="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none"></div>

        <!-- 1. LEFT SECTION (Panda + Logo) -->
        <div class="w-1/2 relative flex items-center justify-center border-r border-white/5 bg-[#05070A]">
            <!-- Logo (Absolute Top-6) -->
            <div class="absolute top-8 left-8 z-30 flex items-center space-x-3">
                <img src="/images/logo.png" alt="Logo" class="h-8 brightness-0 invert opacity-90">
                <span class="text-xl font-bold tracking-tight text-white">Littiwale</span>
            </div>

            <!-- Panda Visual -->
            <div class="relative z-10 w-full max-w-[320px] flex flex-col items-center">
                <div class="glass-card p-6 rounded-[32px] border border-white/5 bg-white/5 backdrop-blur-md shadow-2xl">
                    <div class="relative w-full aspect-square flex items-center justify-center">
                        <img src="/images/login_hero.png" alt="Panda Hero" class="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] hero-img-login transition-all duration-700">
                        <img src="/images/signup_hero.png" alt="Panda Signup" class="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] hero-img-signup absolute inset-0 opacity-0 scale-105 pointer-events-none transition-all duration-700">
                    </div>
                </div>
                <!-- Optional Tagline -->
                <p class="text-[12px] text-gray-500 font-semibold tracking-widest uppercase mt-8 opacity-60">
                    Experience the authentic soul of Bihar
                </p>
            </div>
        </div>

        <!-- 2. RIGHT SECTION (Forms) -->
        <div class="w-1/2 flex items-center justify-center bg-[#03060E] relative p-12">
            <!-- Form Card -->
            <div class="w-full max-w-[400px] glass-card rounded-[24px] p-10 relative flex flex-col text-left shadow-2xl border border-white/5 bg-[#0a0d14]/80 backdrop-blur-xl">
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

                    <div class="flex items-center justify-center space-x-3">
                        <button id="google-login-btn" class="flex-1 flex flex-row items-center justify-center space-x-2 h-[42px] bg-transparent border border-gray-800 rounded-xl hover:bg-white/5 transition">
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="h-4" alt="Google">
                            <span class="text-[13px] font-semibold text-gray-300">Sign in with Google</span>
                        </button>
                        <button id="guest-btn" class="px-4 h-[42px] flex items-center justify-center bg-transparent border border-gray-800 rounded-xl hover:bg-white/5 transition">
                            <span class="text-[13px] font-semibold text-gray-400">Guest</span>
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
