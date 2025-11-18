/**
 * Scroll Animations
 * Triggers fade-in animations when elements enter the viewport
 */

document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer options
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add animation class
                entry.target.classList.add('is-visible');
                // Optional: stop observing after animation
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select all animatable elements
    const animatables = document.querySelectorAll(
        '.section-header, .tech-grid, .card, .why-choose, .why-card, .cta-final'
    );

    animatables.forEach(el => {
        observer.observe(el);
    });
});
