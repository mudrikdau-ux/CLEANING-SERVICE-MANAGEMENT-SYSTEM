// ========== SIDEBAR FUNCTIONS ==========
function openSidebar() {
    document.getElementById("sidebar").style.width = "280px";
    document.body.style.overflow = "hidden";
}

function closeSidebar() {
    document.getElementById("sidebar").style.width = "0";
    document.body.style.overflow = "auto";
}

// Close sidebar when clicking outside
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.querySelector('.hamburger');
    
    if (sidebar && hamburger) {
        if (!sidebar.contains(event.target) && !hamburger.contains(event.target) && sidebar.style.width === '280px') {
            closeSidebar();
        }
    }
});

// ========== MODAL FUNCTIONS ==========
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Add click event to close when clicking overlay
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modalId);
            }
        });
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
});

// ========== CHATBOT INTEGRATION ==========
function openChatbot() {
    // Show notification that chatbot is opening
    showChatbotNotification();
    
    // Try to open chatbot if it exists
    setTimeout(() => {
        const chatbotButton = document.querySelector('.chatbot-toggle, .chatbot-icon, [id*="chat"], [class*="chat"]');
        if (chatbotButton) {
            chatbotButton.click();
        } else {
            // If chatbot elements not found, try common selectors
            const chatElements = document.querySelectorAll('[onclick*="chat"], [onclick*="bot"], .bot-toggle, #bot-button');
            if (chatElements.length > 0) {
                chatElements[0].click();
            }
        }
    }, 800);
}

function showChatbotNotification() {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.chatbot-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'chatbot-notification';
    notification.innerHTML = `
        <i class="fas fa-robot"></i>
        <span>Opening 24/7 Support Chat...</span>
        <button class="chatbot-notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

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
    const navbar = document.querySelector('.top-bar');
    if (navbar) {
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
}

// ========== PARALLAX EFFECT ==========
function initParallax() {
    const heroSection = document.querySelector('.about-hero-section');
    if (heroSection) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            heroSection.style.backgroundPositionY = scrolled * 0.3 + 'px';
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

// ========== TESTIMONIAL ANIMATION ==========
function initTestimonialAnimation() {
    const testimonials = document.querySelectorAll('.testimonial-card');
    testimonials.forEach((testimonial, index) => {
        setTimeout(() => {
            testimonial.style.opacity = '1';
            testimonial.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// ========== CTA BUTTON RIPPLE EFFECT ==========
function initCTAButton() {
    const ctaButtons = document.querySelectorAll('.cta-buttons .btn');
    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
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
        
        .btn-outline-light .ripple {
            background: rgba(0, 0, 0, 0.1);
        }
    `;
    document.head.appendChild(style);
}

// ========== TOOLTIP INITIALIZATION ==========
function initTooltips() {
    const socialIcons = document.querySelectorAll('.team-social a, .social-links a');
    socialIcons.forEach(icon => {
        const platform = icon.querySelector('i').className.split(' ')[1].replace('fa-', '').replace('-', ' ');
        icon.setAttribute('title', `Follow us on ${platform}`);
    });
}

// ========== NEWSLETTER FORM HANDLING ==========
function initNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                if (validateEmail(emailInput.value)) {
                    showNotification('Thank you for subscribing to our newsletter!', 'success');
                    emailInput.value = '';
                } else {
                    showNotification('Please enter a valid email address', 'danger');
                }
            }
        });
    }
}

// ========== EMAIL VALIDATION ==========
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ========== NOTIFICATION SYSTEM ==========
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification-toast');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification && notification.remove) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// ========== ADD NOTIFICATION STYLES ==========
function addNotificationStyles() {
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        .notification-toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            min-width: 280px;
            max-width: 350px;
            border-left: 4px solid #4bb543;
            animation: slideInRightNotif 0.3s ease-out;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 15px 20px;
        }
        
        .notification-content i {
            font-size: 1.2rem;
        }
        
        .notification-content i.fa-check-circle {
            color: #4bb543;
        }
        
        .notification-content i.fa-exclamation-triangle {
            color: #dc3545;
        }
        
        .notification-content i.fa-info-circle {
            color: #667eea;
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
        
        @keyframes slideInRightNotif {
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
}

// ========== WELCOME MESSAGE ==========
function showWelcomeMessage() {
    const hasVisited = localStorage.getItem('hasVisitedAbout');
    if (!hasVisited) {
        setTimeout(() => {
            showNotification('Welcome to CleanSpark! Discover why we are Zanzibar\'s trusted cleaning service.', 'info');
            localStorage.setItem('hasVisitedAbout', 'true');
        }, 1500);
    }
}

// ========== IMAGE LOADING ANIMATION ==========
function initImageLoading() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.5s';
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
        }
    });
}

// ========== CHECK LOGIN STATUS AND UPDATE UI ==========
function updateLoginUI() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loginBtn = document.querySelector('.top-bar .btn-primary');
    
    if (loginBtn) {
        if (isLoggedIn) {
            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            loginBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
            loginBtn.href = '#';
            loginBtn.onclick = function(e) {
                e.preventDefault();
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('currentUser');
                showNotification('Logged out successfully', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            };
        } else {
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            loginBtn.href = 'login.html';
            loginBtn.onclick = null;
        }
    }
}

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
    initTestimonialAnimation();
    initCTAButton();
    addRippleStyles();
    addNotificationStyles();
    initTooltips();
    initNewsletterForm();
    initImageLoading();
    showWelcomeMessage();
    updateLoginUI();
    
    console.log('About Us page fully loaded and initialized with interactive modals');
});

// ========== EXPORT FUNCTIONS FOR GLOBAL USE ==========
window.showNotification = showNotification;
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.openModal = openModal;
window.closeModal = closeModal;
window.openChatbot = openChatbot;
window.initStatisticsCounter = initStatisticsCounter;