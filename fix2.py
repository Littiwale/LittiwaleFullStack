import re

with open("login.html", "r", encoding="utf8") as f:
    html = f.read()

body_start = html.find('<body class="bg-primary text-white font-sans min-h-screen">') + len('<body class="bg-primary text-white font-sans min-h-screen">')
body_end = html.find('<script type="module" src="./src/login.js"></script>')

new_layout = """
    <!-- Background Canvas -->
    <div class="fixed inset-0 bg-[#06080d] z-0">
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px]"></div>
    </div>

    <!-- Main Wrapper -->
    <div id="auth-wrapper" class="relative z-10 flex flex-col min-h-screen w-full px-6 py-8 md:px-12 md:py-10">
        
        <!-- Header Section -->
        <div class="flex justify-between items-start w-full relative z-20">
            <!-- Logo Top Left -->
            <div class="flex items-center space-x-3">
                <img src="/images/logo.png" alt="Logo" class="h-6 md:h-8 brightness-0 invert opacity-90">
                <span class="text-lg md:text-xl font-bold tracking-tight text-white">Littiwale</span>
            </div>
            
            <!-- Center Top Text -->
            <div class="absolute left-1/2 -translate-x-1/2 top-0 text-center hidden md:block">
                <p class="text-[11px] text-gray-400/70 font-semibold tracking-widest uppercase pb-1 border-b border-white/5">
                    Experience the authentic soul of Bihar
                </p>
            </div>
        </div>

        <!-- Center Content Grid -->
        <div class="flex-1 w-full flex items-center justify-center mt-8 md:mt-0">
            <div class="flex flex-col md:flex-row items-stretch justify-center gap-8 lg:gap-16 w-full max-w-5xl">
                
                <!-- Left: Panda Hero Container -->
                <div class="hero-panel hidden md:flex relative w-full md:w-[380px] lg:w-[420px] glass-card rounded-[32px] p-8 flex-col items-center justify-center border border-white/5 overflow-hidden shadow-2xl">
                    <div class="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none"></div>
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-accent/20 rounded-full blur-[80px] z-0 pointer-events-none"></div>
                    
                    <div class="relative z-10 w-full aspect-[4/5] flex items-center justify-center">
                        <img src="/images/login_hero.png" alt="Panda Hero" class="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] hero-img-login transition-all duration-700">
                        <img src="/images/signup_hero.png" alt="Panda Signup" class="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] hero-img-signup absolute inset-0 opacity-0 scale-105 pointer-events-none transition-all duration-700">
                    </div>
                </div>

                <!-- Right: Forms -->
                <div class="form-panel w-full max-w-[400px] glass-card rounded-[24px] p-8 relative flex flex-col text-left shadow-2xl border border-white/5 bg-[#0a0d14]/80 backdrop-blur-xl">
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
                                <span id="lockout-timer" class="hidden text-[10px] ml-2 opacity-70"></span>
                            </button>
                        </form>

                        <div class="relative py-6">
                            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-800"></div></div>
                            <div class="relative flex justify-center text-[10px]"><span class="bg-[#0e121a] px-4 font-semibold text-gray-500">or continue with</span></div>
                        </div>

                        <!-- Compact Minimal Social -->
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

                    <!-- SIGNUP FORM -->
                    <div id="signup-form-side" class="form-container form-hide">
                        <h3 class="text-2xl font-bold mb-6 text-white">Create an account</h3>

                        <form id="signup-form" class="space-y-4">
                            <div class="grid grid-cols-2 gap-3">
                                <div class="space-y-1.5">
                                    <label class="text-xs font-semibold text-gray-400">Name</label>
                                    <input type="text" id="signup-name" placeholder="Name" required 
                                        class="w-full h-11 bg-gray-900 border border-gray-800 rounded-xl px-4 text-sm text-white placeholder-gray-500 focus:border-accent outline-none transition">
                                </div>
                                <div class="space-y-1.5">
                                    <label class="text-xs font-semibold text-gray-400">Username</label>
                                    <input type="text" id="signup-username" placeholder="Username" required 
                                        class="w-full h-11 bg-gray-900 border border-gray-800 rounded-xl px-4 text-sm text-white placeholder-gray-500 focus:border-accent outline-none transition">
                                </div>
                            </div>

                            <div class="space-y-1.5">
                                <label class="text-xs font-semibold text-gray-400">Email</label>
                                <input type="email" id="signup-email" placeholder="demo@example.com" required 
                                    class="w-full h-11 bg-gray-900 border border-gray-800 rounded-xl px-4 text-sm text-white placeholder-gray-500 focus:border-accent outline-none transition">
                            </div>
                            
                            <div class="space-y-1.5">
                                <label class="text-xs font-semibold text-gray-400">Phone</label>
                                <input type="tel" id="signup-phone" placeholder="10-digit phone" required 
                                    class="w-full h-11 bg-gray-900 border border-gray-800 rounded-xl px-4 text-sm text-white placeholder-gray-500 focus:border-accent outline-none transition">
                            </div>

                            <div class="space-y-1.5">
                                <label class="text-xs font-semibold text-gray-400">Password</label>
                                <input type="password" id="signup-password" placeholder="••••••••••••" required 
                                    class="w-full h-11 bg-gray-900 border border-gray-800 rounded-xl px-4 text-sm text-white placeholder-gray-500 focus:border-accent outline-none transition">
                            </div>

                            <div id="signup-error" class="error-msg text-center font-semibold mb-1"></div>
                            
                            <button type="submit" class="w-full h-11 btn-primary text-black font-bold rounded-xl transition-transform hover:scale-[1.02]">
                                Create Account
                            </button>
                        </form>
                        <p class="text-center mt-6 text-sm text-gray-400 font-medium">
                            Already have account? <button type="button" id="toggle-to-login" class="text-accent font-bold hover:text-yellow-600 transition">Log in</button>
                        </p>
                    </div>

                    <!-- COMPLETE PROFILE FORM -->
                    <div id="completion-form-side" class="form-container form-hide">
                        <h3 class="text-3xl font-black mb-8 text-accent">Almost There</h3>
                        <form id="completion-form" class="space-y-4">
                            <div class="space-y-1.5">
                                <label class="text-xs font-semibold text-gray-400">Choose Username</label>
                                <input type="text" id="complete-username" placeholder="Username" required 
                                    class="w-full h-11 bg-gray-900 border border-gray-800 rounded-xl px-4 text-sm text-white placeholder-gray-500 focus:border-accent outline-none transition">
                            </div>
                            <div class="space-y-1.5">
                                <label class="text-xs font-semibold text-gray-400">Mobile Number</label>
                                <input type="tel" id="complete-phone" placeholder="10-digit Phone" required 
                                    class="w-full h-11 bg-gray-900 border border-gray-800 rounded-xl px-4 text-sm text-white placeholder-gray-500 focus:border-accent outline-none transition">
                            </div>
                            <div id="completion-error" class="error-msg text-center font-semibold"></div>
                            <button type="submit" class="w-full h-11 btn-primary hover:scale-[1.02] text-black font-bold rounded-xl transition-transform mt-2">
                                Complete Setup
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
"""

final = html[:body_start] + new_layout + html[body_end:]
with open("login.html", "w", encoding="utf8") as f:
    f.write(final)
