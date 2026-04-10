import re

with open("login.html", "r", encoding="utf8") as f:
    text = f.read()

old_left_match = re.search(r"<!-- Left Panel: Branding \(Hero\) -->[\s\S]*?(?=<!-- Right Panel: Forms -->)", text)
if old_left_match:
    old_left = old_left_match.group(0)
    new_left = """<!-- Left Panel: Branding & Visual -->
        <div class="hero-panel w-full md:w-1/2 min-h-[40vh] md:min-h-screen relative flex flex-col items-center justify-center bg-[#0a0d14] border-r border-white/5 overflow-hidden">
            <!-- Warm Glow Behind Panda -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#FACC15]/15 rounded-full blur-[100px] pointer-events-none z-0"></div>
            
            <!-- Logo (Absolute Top-Left) -->
            <div class="absolute top-8 left-8 md:top-10 md:left-10 z-20 flex items-center space-x-3">
                <img src="/images/logo.png" alt="Logo" class="h-8 md:h-10 brightness-0 invert opacity-90 drop-shadow-lg">
                <span class="text-xl md:text-2xl font-bold tracking-tight text-white drop-shadow-md">Littiwale</span>
            </div>

            <!-- Centered Panda & Tagline -->
            <div class="relative z-10 w-full max-w-[360px] flex flex-col items-center p-4">
                <div class="relative w-full aspect-square flex items-center justify-center">
                    <img src="/images/login_hero.png" alt="Panda Hero" class="w-full h-full object-contain hero-img-login drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
                    <img src="/images/signup_hero.png" alt="Panda Signup" class="w-full h-full object-contain hero-img-signup absolute inset-0 pointer-events-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
                </div>
                <p class="text-sm text-gray-400 font-medium tracking-wide mt-8 drop-shadow-md text-center">
                    Experience the authentic soul of Bihar.
                </p>
            </div>
        </div>

        """
    text = text.replace(old_left, new_left)

old_right = '<div class="form-panel w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-primary">'
new_right = '<div class="form-panel w-full md:w-1/2 min-h-[60vh] md:min-h-screen flex items-center justify-center p-6 md:p-12 relative bg-gradient-to-br from-[#03060E] to-[#010204] overflow-hidden">'
text = text.replace(old_right, new_right)
text = text.replace('<!-- Right Panel: Forms -->\n        <!-- Right Panel: Forms -->', '<!-- Right Panel: Forms -->')

with open("login.html", "w", encoding="utf8") as f:
    f.write(text)
print("Updated successfully")
