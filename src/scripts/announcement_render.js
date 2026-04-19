export const renderAnnouncements = (rootElement, announcements) => {
    if (!announcements || announcements.length === 0) return;

    // Check if any announcement has an image to activate banner mode
    // Support both new 'image' field (static path) and old 'imageUrl' field (Firebase Storage URL)
    const hasImage = announcements.some(a => a.image || a.imageUrl);

    if (hasImage) {
        // Carousel Slider Mode
        rootElement.innerHTML = `
            <div class="announcement-carousel-wrapper">
                <div class="carousel-track" id="announcement-track">
                    ${announcements.map(a => {
                        const imageSrc = a.image || a.imageUrl || '';
                        return `
                        <div class="announcement-slide" style="background-image: url('${imageSrc}')">
                            <div class="announcement-content">
                                <h4 class="text-xs md:text-sm font-black text-white uppercase tracking-widest">${a.title}</h4>
                                <p class="text-[10px] md:text-xs text-gray-300">${a.description}</p>
                            </div>
                        </div>
                    `}).join('')}
                </div>
            </div>
        `;

        // Simple carousel slider logic
        const track = document.getElementById('announcement-track');
        let currentSlide = 0;
        const totalSlides = announcements.length;
        
        if (totalSlides > 1) {
            setInterval(() => {
                currentSlide = (currentSlide + 1) % totalSlides;
                track.style.transform = `translateX(-${currentSlide * 100}%)`;
            }, 5000);
        }
    } else {
        // Fallback Compact Bar Mode
        // Pick the latest announcement (they are sorted desc)
        const latest = announcements[0];
        rootElement.innerHTML = `
            <div class="announcement-banner">
                <span class="text-lg">📢</span>
                <div>
                    <span class="text-accent uppercase tracking-widest text-[10px] md:text-xs font-black mr-2">${latest.title}:</span>
                    <span class="text-gray-300 text-[10px] md:text-xs">${latest.description}</span>
                </div>
            </div>
        `;
    }
}
