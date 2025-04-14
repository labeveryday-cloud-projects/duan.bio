// Minimal JavaScript for personal website

document.addEventListener('DOMContentLoaded', () => {
    // Add viewport height fix for mobile browsers
    const setDocHeight = () => {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };

    // Set the height initially and on resize
    setDocHeight();
    window.addEventListener('resize', () => {
        setDocHeight();
    });

    // Add smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Simple hover effects for social icons - with touch support
    const socialIcons = document.querySelectorAll('.social-icons a');
    
    // Add hover effects with proper touch handling
    socialIcons.forEach(icon => {
        // For mouse devices
        icon.addEventListener('mouseenter', () => {
            resetAllIcons();
            icon.style.transform = 'translateY(-5px)';
        });
        
        icon.addEventListener('mouseleave', () => {
            icon.style.transform = 'translateY(0)';
        });
        
        // For touch devices
        icon.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent default touch behavior
            resetAllIcons();
            icon.style.transform = 'translateY(-5px)';
        });
    });
    
    // Reset all icons to normal state
    function resetAllIcons() {
        socialIcons.forEach(i => {
            i.style.transform = 'translateY(0)';
        });
    }
    
    // Reset on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.social-icons')) {
            resetAllIcons();
        }
    });
    
    // Reset on scroll
    window.addEventListener('scroll', () => {
        resetAllIcons();
    });
    
    // Analytics tracking (basic implementation)
    const trackPageView = () => {
        // This would be replaced with actual analytics code
        console.log('Page view tracked');
    };

    // Track page view on load
    trackPageView();
});