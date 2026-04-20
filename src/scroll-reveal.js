/**
 * 🎭 SCROLL-REVEAL ANIMATIONS
 * Inspired by animation reference - smooth entrance animations using IntersectionObserver
 */

export const initScrollReveal = () => {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target); // Only animate once
            }
        });
    }, { threshold: 0.12 });

    // Watch for elements with reveal class or specific card types
    document.querySelectorAll('.reveal, .hof-card, .catering-card, .trust-item, #bestseller-section, #catering').forEach(el => {
        revealObserver.observe(el);
    });
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
} else {
    initScrollReveal();
}
