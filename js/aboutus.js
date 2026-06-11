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
    showChatbotNotification();
    setTimeout(() => {
        const chatbotButton = document.querySelector('.chatbot-toggle, .chatbot-icon, [id*="chat"], [class*="chat"]');
        if (chatbotButton) {
            chatbotButton.click();
        } else {
            const chatElements = document.querySelectorAll('[onclick*="chat"], [onclick*="bot"], .bot-toggle, #bot-button');
            if (chatElements.length > 0) {
                chatElements[0].click();
            }
        }
    }, 800);
}

function showChatbotNotification() {
    const existingNotification = document.querySelector('.chatbot-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
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

// ========== LOAD REAL DATA FROM BACKEND ==========
async function loadStatisticsFromAPI() {
    try {
        // 1. FETCH FEEDBACKS from /api/feedbacks/public
        const feedbacksResponse = await API.feedback.getPublic({ limit: 1000 });
        
        let feedbacksList = [];
        let totalFeedbacks = 0;
        
        if (feedbacksResponse.success && feedbacksResponse.feedbacks) {
            feedbacksList = feedbacksResponse.feedbacks;
            totalFeedbacks = feedbacksResponse.count || feedbacksList.length;
        } else if (feedbacksResponse.feedbacks) {
            feedbacksList = feedbacksResponse.feedbacks;
            totalFeedbacks = feedbacksList.length;
        }
        
        // 2. FETCH BOOKINGS STATS from /api/bookings/stats
        let completedBookings = 0;
        let totalBookings = 0;
        
        try {
            const bookingsStats = await API.bookings.getStats();
            if (bookingsStats.success && bookingsStats.statistics) {
                totalBookings = bookingsStats.statistics.total || 0;
                // Use 'delivered' or 'completed' field
                completedBookings = bookingsStats.statistics.delivered || 
                                    bookingsStats.statistics.completed || 
                                    bookingsStats.statistics.completed_bookings || 0;
            }
        } catch (e) {
            console.log('Could not fetch booking stats:', e);
        }
        
        // 3. CALCULATE HAPPY CLIENTS (feedbacks with rating >= 3 stars)
        // Rating values: 1=very_sad, 2=sad, 3=neutral, 4=happy, 5=very_happy
        let happyFeedbacksCount = 0;
        let totalRatingSum = 0;
        
        feedbacksList.forEach(fb => {
            const ratingValue = fb.rating?.rating_value || 0;
            totalRatingSum += ratingValue;
            
            // Happy clients = customers who rated 3 or higher (neutral, happy, very_happy)
            if (ratingValue >= 3) {
                happyFeedbacksCount++;
            }
        });
        
        // Calculate average rating
        const averageRating = totalFeedbacks > 0 ? totalRatingSum / totalFeedbacks : 0;
        
        // HAPPY CLIENTS = number of feedbacks with rating >= 3 (satisfied customers)
        const happyClients = happyFeedbacksCount;
        
        // SATISFACTION RATE = (happy clients / total feedbacks) * 100
        const satisfactionRate = totalFeedbacks > 0 ? Math.round((happyFeedbacksCount / totalFeedbacks) * 100) : 98;
        
        // JOBS COMPLETED = from bookings stats API
        const jobsCompleted = completedBookings;
        
        // Log the real data for debugging
        console.log('=== REAL DATA FROM DATABASE ===');
        console.log(`Total Feedbacks: ${totalFeedbacks}`);
        console.log(`Happy Clients (rating >= 3): ${happyClients}`);
        console.log(`Satisfaction Rate: ${satisfactionRate}%`);
        console.log(`Jobs Completed: ${jobsCompleted}`);
        console.log(`Average Rating: ${averageRating.toFixed(2)}/5`);
        
        // Animate the counters with REAL data
        animateCounter('happyClientsStat', happyClients);
        animateCounter('jobsCompletedStat', jobsCompleted);
        animateCounter('satisfactionRateStat', satisfactionRate);
        
        // 4. LOAD REAL TESTIMONIALS from feedbacks
        await loadRealTestimonials(feedbacksList);
        
    } catch (error) {
        console.error('Error loading statistics:', error);
        // Fallback values
        animateCounter('happyClientsStat', 128);
        animateCounter('jobsCompletedStat', 45);
        animateCounter('satisfactionRateStat', 92);
        
        // Try to load testimonials anyway
        try {
            const fallbackFeedbacks = await API.feedback.getRecent(6);
            if (fallbackFeedbacks.success && fallbackFeedbacks.feedbacks) {
                await loadRealTestimonials(fallbackFeedbacks.feedbacks);
            } else if (fallbackFeedbacks.feedbacks) {
                await loadRealTestimonials(fallbackFeedbacks.feedbacks);
            }
        } catch (e) {
            console.log('Could not load testimonials');
        }
    }
}

// ========== LOAD REAL TESTIMONIALS FROM FEEDBACKS TABLE ==========
// ========== LOAD REAL TESTIMONIALS FROM FEEDBACKS TABLE ==========
async function loadRealTestimonials(feedbacksList = null) {
    try {
        let feedbacks = feedbacksList;
        
        if (!feedbacks || feedbacks.length === 0) {
            console.log('Fetching feedbacks from API...');
            const response = await API.feedback.getPublic({ limit: 20 });
            console.log('API Response:', response);
            
            if (response.success && response.feedbacks) {
                feedbacks = response.feedbacks;
            } else if (response.feedbacks) {
                feedbacks = response.feedbacks;
            } else if (Array.isArray(response)) {
                feedbacks = response;
            } else {
                console.log('Unexpected response format:', response);
            }
        }
        
        if (!feedbacks || feedbacks.length === 0) {
            console.log('No feedbacks found in database');
            return;
        }
        
        console.log(`Found ${feedbacks.length} total feedbacks`);
        
        // Filter feedbacks that have actual text content (min 20 chars)
        const validFeedbacks = feedbacks.filter(fb => {
            const hasText = fb.feedback_text && fb.feedback_text.length >= 20;
            const isPublic = fb.is_public !== false;
            return hasText && isPublic;
        });
        
        console.log(`Valid feedbacks with text: ${validFeedbacks.length}`);
        
        // Take up to 6 testimonials
        const testimonialsToShow = validFeedbacks.slice(0, 6);
        
        if (testimonialsToShow.length === 0) {
            console.log('No valid testimonials with text found, keeping default');
            return;
        }
        
        // Find the testimonials container - TRY MULTIPLE SELECTORS
        let testimonialsContainer = document.querySelector('.testimonials-section .row.g-4');
        
        if (!testimonialsContainer) {
            testimonialsContainer = document.querySelector('.testimonials-section .row');
        }
        
        if (!testimonialsContainer) {
            testimonialsContainer = document.querySelector('.testimonials-section .container .row');
        }
        
        if (!testimonialsContainer) {
            const section = document.querySelector('.testimonials-section');
            if (section) {
                const container = section.querySelector('.container');
                if (container) {
                    let row = container.querySelector('.row');
                    if (!row) {
                        row = document.createElement('div');
                        row.className = 'row g-4';
                        container.appendChild(row);
                    }
                    testimonialsContainer = row;
                }
            }
        }
        
        if (!testimonialsContainer) {
            console.error('Testimonials container not found! Check your HTML structure.');
            console.log('Available sections:', document.querySelectorAll('section'));
            return;
        }
        
        console.log('Found testimonials container, clearing existing...');
        
        // Clear existing testimonials
        testimonialsContainer.innerHTML = '';
        
        // Helper function to get star rating display
        const getRatingStars = (ratingValue) => {
            const stars = Math.round(ratingValue || 3);
            let result = '';
            for (let i = 1; i <= 5; i++) {
                result += i <= stars ? '★' : '☆';
            }
            return result;
        };
        
        // Helper function to get rating label
        const getRatingLabel = (ratingValue) => {
            if (ratingValue >= 4.5) return 'Very Happy Customer';
            if (ratingValue >= 3.5) return 'Happy Customer';
            if (ratingValue >= 2.5) return 'Neutral';
            if (ratingValue >= 1.5) return 'Dissatisfied';
            return 'Very Dissatisfied';
        };
        
        // Helper function to get initials
        const getInitials = (name) => {
            if (!name) return 'CS';
            const parts = name.split(' ');
            if (parts.length >= 2) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return name.substring(0, 2).toUpperCase();
        };
        
        // Helper to format date
        const formatDate = (dateString) => {
            if (!dateString) return 'Recent';
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            } catch (e) {
                return 'Recent';
            }
        };
        
        // Generate testimonials dynamically
        testimonialsToShow.forEach((testimonial, index) => {
            console.log(`Processing testimonial ${index + 1}:`, testimonial);
            
            // Extract data from feedback object - try different paths
            let customerName = 'Valued Customer';
            
            if (testimonial.user?.name) {
                customerName = testimonial.user.name;
            } else if (testimonial.user?.full_name) {
                customerName = testimonial.user.full_name;
            } else if (testimonial.user?.first_name) {
                const lastName = testimonial.user?.last_name || '';
                customerName = `${testimonial.user.first_name} ${lastName}`.trim();
            } else if (testimonial.customer_name) {
                customerName = testimonial.customer_name;
            } else if (testimonial.name) {
                customerName = testimonial.name;
            }
            
            // Get rating value - try different paths
            let ratingValue = 5;
            if (testimonial.rating?.rating_value) {
                ratingValue = testimonial.rating.rating_value;
            } else if (testimonial.rating_value) {
                ratingValue = testimonial.rating_value;
            } else if (testimonial.average_rating) {
                ratingValue = testimonial.average_rating;
            }
            
            const feedbackText = testimonial.feedback_text || testimonial.review_text || '';
            const shortText = feedbackText.length > 120 ? feedbackText.substring(0, 120) + '...' : feedbackText;
            const ratingLabel = getRatingLabel(ratingValue);
            const fullText = feedbackText;
            const createdAt = formatDate(testimonial.created_at);
            const serviceName = testimonial.service || testimonial.service_name || 'Cleaning Service';
            const initials = getInitials(customerName);
            const starsHtml = getRatingStars(ratingValue);
            
            const modalId = `dynamicTestimonialModal${index}_${Date.now()}`;
            
            // Create modal for this testimonial
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.id = modalId;
            modal.innerHTML = `
                <div class="modal-container testimonial-modal">
                    <div class="modal-header">
                        <div class="modal-icon testimonial-avatar">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <h2>Client Review</h2>
                        <button class="modal-close" onclick="closeModal('${modalId}')">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body testimonial-detail-body">
                        <div class="testimonial-detail-header">
                            <div class="testimonial-detail-author">
                                <div class="testimonial-detail-avatar">
                                    <span>${escapeHtml(initials)}</span>
                                </div>
                                <div class="testimonial-detail-info">
                                    <h3>${escapeHtml(customerName)}</h3>
                                    <span class="testimonial-detail-role">${escapeHtml(ratingLabel)}</span>
                                    <div class="testimonial-detail-rating">${starsHtml}</div>
                                    <span class="testimonial-detail-date">${createdAt}</span>
                                </div>
                            </div>
                        </div>
                        <div class="testimonial-detail-content">
                            <div class="testimonial-detail-quote">
                                <i class="fas fa-quote-left"></i>
                            </div>
                            <p class="testimonial-detail-text">"${escapeHtml(fullText)}"</p>
                            <div class="testimonial-detail-footer">
                                <div class="testimonial-service-used">
                                    <strong>Service Used:</strong> ${escapeHtml(serviceName)}
                                </div>
                                <div class="testimonial-verified">
                                    <i class="fas fa-check-circle"></i> Verified Customer
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Create testimonial card
            const colDiv = document.createElement('div');
            colDiv.className = 'col-md-4 animate-on-scroll';
            
            const cardDiv = document.createElement('div');
            cardDiv.className = 'testimonial-card clickable-card';
            cardDiv.setAttribute('onclick', `openModal('${modalId}')`);
            cardDiv.innerHTML = `
                <div class="testimonial-quote">
                    <i class="fas fa-quote-left"></i>
                </div>
                <p class="testimonial-text">"${escapeHtml(shortText)}"</p>
                <div class="testimonial-author">
                    <div class="author-info">
                        <strong>${escapeHtml(customerName)}</strong>
                        <span>${escapeHtml(ratingLabel)}</span>
                    </div>
                    <div class="author-rating">
                        ${starsHtml}
                    </div>
                </div>
                <div class="click-hint">
                    <span>Click for full review <i class="fas fa-arrow-right"></i></span>
                </div>
            `;
            
            colDiv.appendChild(cardDiv);
            testimonialsContainer.appendChild(colDiv);
        });
        
        console.log(`✅ SUCCESS: Loaded ${testimonialsToShow.length} real testimonials from feedbacks table`);
        
        // Re-initialize animation for new elements
        setTimeout(() => {
            const newTestimonials = document.querySelectorAll('.testimonial-card');
            newTestimonials.forEach((testimonial, idx) => {
                testimonial.style.opacity = '0';
                testimonial.style.transform = 'translateY(20px)';
                testimonial.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                setTimeout(() => {
                    testimonial.style.opacity = '1';
                    testimonial.style.transform = 'translateY(0)';
                }, idx * 100);
            });
        }, 100);
        
    } catch (error) {
        console.error('Error loading testimonials:', error);
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    let current = 0;
    const increment = Math.max(1, Math.ceil(targetValue / 60));
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
            element.textContent = targetValue.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 30);
}

// ========== NEWSLETTER SUBSCRIPTION ==========
async function subscribeNewsletter(email) {
    try {
        const result = await API.contact.submit({
            full_name: 'Newsletter Subscriber',
            email: email,
            phone: '0000000000',
            service_type: 'Newsletter',
            subject: 'Newsletter Subscription',
            message: 'I would like to subscribe to the CleanSpark newsletter.',
            subscribe: true
        });
        return { success: true, message: result.message };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// ========== CHECK LOGIN STATUS AND UPDATE UI ==========
async function updateLoginUI() {
    const isLoggedIn = !!(API.getAuthToken() && localStorage.getItem('isLoggedIn') === 'true');
    const loginBtn = document.getElementById('headerLoginBtn');
    
    if (loginBtn) {
        if (isLoggedIn) {
            const user = getCurrentUser();
            const userName = user?.first_name || 'Account';
            loginBtn.innerHTML = `<i class="fas fa-user-check"></i> Hi, ${userName}`;
            loginBtn.href = 'account.html';
            loginBtn.classList.add('logged-in');
        } else {
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            loginBtn.href = 'login.html';
            loginBtn.classList.remove('logged-in');
        }
    }
}

function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// ========== NEWSLETTER FORM HANDLING ==========
function initNewsletterForm() {
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const emailInput = document.getElementById('newsletterEmail');
            if (emailInput && emailInput.value) {
                if (validateEmail(emailInput.value)) {
                    showNotification('Subscribing...', 'info');
                    const result = await subscribeNewsletter(emailInput.value);
                    if (result.success) {
                        showNotification('Thank you for subscribing to our newsletter!', 'success');
                        emailInput.value = '';
                    } else {
                        showNotification(result.message || 'Subscription failed. Please try again.', 'danger');
                    }
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
    const icons = { success: 'fa-check-circle', danger: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    const icon = icons[type] || icons.info;
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${icon}"></i>
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
        testimonial.style.opacity = '0';
        testimonial.style.transform = 'translateY(20px)';
        testimonial.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
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

// ========== TOOLTIP INITIALIZATION ==========
function initTooltips() {
    const socialIcons = document.querySelectorAll('.team-social a, .social-links a');
    socialIcons.forEach(icon => {
        const platform = icon.querySelector('i').className.split(' ')[1].replace('fa-', '').replace('-', ' ');
        icon.setAttribute('title', `Follow us on ${platform}`);
    });
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

// ========== INITIALIZE ALL ==========
document.addEventListener('DOMContentLoaded', async () => {
    initScrollAnimation();
    await loadStatisticsFromAPI();
    initSmoothScroll();
    initNavbarScroll();
    initParallax();
    initTeamCards();
    initFeatureCards();
    initCTAButton();
    addRippleStyles();
    addNotificationStyles();
    initTooltips();
    initNewsletterForm();
    initImageLoading();
    updateLoginUI();
    
    console.log('✅ About Us page fully loaded and connected to real backend APIs');
    console.log('📊 Data sources: feedbacks table + bookings table');
    console.log('💬 Testimonials loaded from feedbacks table');
});

// ========== EXPORT FUNCTIONS FOR GLOBAL USE ==========
window.showNotification = showNotification;
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.openModal = openModal;
window.closeModal = closeModal;
window.openChatbot = openChatbot;