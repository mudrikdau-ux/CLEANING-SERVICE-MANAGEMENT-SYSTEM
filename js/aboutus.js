// ========== ANIMATION ON SCROLL ==========
function initScrollAnimation() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

// ========== STATISTICS COUNTER ==========
function initStatisticsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const target = parseInt(element.getAttribute('data-target'));
                let current = 0;
                const increment = target / 50;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        element.textContent = target;
                        clearInterval(timer);
                    } else {
                        element.textContent = Math.floor(current);
                    }
                }, 30);
                observer.unobserve(element);
            }
        });
    }, {
        threshold: 0.5
    });
    
    statNumbers.forEach(number => {
        observer.observe(number);
    });
}

// ========== SMOOTH SCROLL ==========
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ========== NAVBAR SCROLL EFFECT ==========
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
            navbar.style.background = 'rgba(255,255,255,0.98)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
            navbar.style.background = 'white';
            navbar.style.backdropFilter = 'none';
        }
    });
}

// ========== PARALLAX EFFECT ==========
function initParallax() {
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            heroSection.style.backgroundPositionY = scrolled * 0.5 + 'px';
        });
    }
}

// ========== TEAM CARD HOVER EFFECT ==========
function initTeamCards() {
    const teamCards = document.querySelectorAll('.team-card');
    teamCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
}

// ========== FEATURE CARD HOVER ==========
function initFeatureCards() {
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
}

// ========== TESTIMONIAL RANDOM ROTATION ==========
function initTestimonialRotation() {
    // Optional: Add testimonial carousel effect if desired
    // For now, just adding a subtle animation on load
    const testimonials = document.querySelectorAll('.testimonial-card');
    testimonials.forEach((testimonial, index) => {
        setTimeout(() => {
            testimonial.style.opacity = '1';
            testimonial.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// ========== FORM VALIDATION FOR CTA ==========
function initCTAButton() {
    const ctaButtons = document.querySelectorAll('.cta-buttons .btn');
    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Add ripple effect
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            button.appendChild(ripple);
            
            const x = e.clientX - e.target.offsetLeft;
            const y = e.clientY - e.target.offsetTop;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// ========== ADD RIPPLE CSS DYNAMICALLY ==========
function addRippleStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .btn {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .btn-light .ripple {
            background: rgba(0, 0, 0, 0.1);
        }
    `;
    document.head.appendChild(style);
}

// ========== TOOLTIP INITIALIZATION ==========
function initTooltips() {
    // Add tooltips for social icons
    const socialIcons = document.querySelectorAll('.team-social a, .footer-social a');
    socialIcons.forEach(icon => {
        icon.setAttribute('title', `Follow us on ${icon.querySelector('i').className.split(' ')[1].replace('bi-', '')}`);
    });
}

// ========== WELCOME MESSAGE ==========
function showWelcomeMessage() {
    // Check if it's the user's first visit
    const hasVisited = localStorage.getItem('hasVisitedAbout');
    if (!hasVisited) {
        setTimeout(() => {
            showNotification('Welcome to CSMS! Discover why we are Zanzibar\'s trusted cleaning service.', 'info');
            localStorage.setItem('hasVisitedAbout', 'true');
        }, 1500);
    }
}

// ========== NOTIFICATION SYSTEM ==========
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="bi bi-${type === 'success' ? 'check-circle-fill' : type === 'error' ? 'exclamation-triangle-fill' : 'info-circle-fill'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    // Add styles for notification
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification && notification.remove) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification-toast {
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        min-width: 280px;
        max-width: 350px;
        border-left: 4px solid #0d6efd;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 15px 20px;
    }
    
    .notification-content i {
        font-size: 1.2rem;
        color: #0d6efd;
    }
    
    .notification-content span {
        flex: 1;
        font-size: 0.9rem;
        color: #1a202c;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: #999;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification-close:hover {
        color: #333;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// ========== INITIALIZE ALL ==========
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    initScrollAnimation();
    initStatisticsCounter();
    initSmoothScroll();
    initNavbarScroll();
    initParallax();
    initTeamCards();
    initFeatureCards();
    initTestimonialRotation();
    initCTAButton();
    addRippleStyles();
    initTooltips();
    showWelcomeMessage();
    
    // Add loading animation for images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', () => {
            img.style.opacity = '1';
        });
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.5s';
    });
    
    // Log initialization
    console.log('About Us page fully loaded and initialized');
});

// ========== EXPORT FUNCTIONS FOR GLOBAL USE ==========
window.showNotification = showNotification;
window.initStatisticsCounter = initStatisticsCounter;