// ========== CONTACT PAGE JAVASCRIPT ==========
// All JavaScript for contact page functionality

// Contact Form Handler Class
class ContactFormHandler {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.init();
    }
    
    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            this.addInputValidation();
        }
        this.initScrollAnimation();
        this.initFaqToggle();
        this.initPhoneValidation();
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        // Validate form
        if (!this.validateForm()) {
            return;
        }
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            serviceType: document.getElementById('serviceType').value,
            subject: document.getElementById('subject').value.trim(),
            message: document.getElementById('message').value.trim(),
            newsletter: document.getElementById('newsletter').checked,
            timestamp: new Date().toISOString()
        };
        
        // Show loading state
        this.setLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            // Save to localStorage
            this.saveToLocalStorage(formData);
            
            // Send email simulation
            this.sendEmailSimulation(formData);
            
            // Show success message
            this.showSuccessMessage();
            
            // Reset form
            this.form.reset();
            
            // Hide loading state
            this.setLoading(false);
            
            // Track form submission
            this.trackSubmission(formData);
        }, 1500);
    }
    
    validateForm() {
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();
        
        if (!name) {
            this.showFieldError('name', 'Please enter your name');
            return false;
        }
        
        if (!email) {
            this.showFieldError('email', 'Please enter your email');
            return false;
        }
        
        if (!this.validateEmail(email)) {
            this.showFieldError('email', 'Please enter a valid email address');
            return false;
        }
        
        if (!subject) {
            this.showFieldError('subject', 'Please enter a subject');
            return false;
        }
        
        if (!message) {
            this.showFieldError('message', 'Please enter your message');
            return false;
        }
        
        if (message.length < 10) {
            this.showFieldError('message', 'Please enter at least 10 characters');
            return false;
        }
        
        return true;
    }
    
    validateEmail(email) {
        const re = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        return re.test(email);
    }
    
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.style.borderColor = '#dc3545';
            field.focus();
            
            // Remove error after 3 seconds
            setTimeout(() => {
                field.style.borderColor = '';
            }, 3000);
        }
        this.showNotification(message, 'error');
    }
    
    addInputValidation() {
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.style.borderColor = '';
            });
        });
    }
    
    initPhoneValidation() {
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 12) value = value.slice(0, 12);
                e.target.value = value;
            });
        }
    }
    
    saveToLocalStorage(formData) {
        let messages = JSON.parse(localStorage.getItem('contact_messages')) || [];
        messages.push(formData);
        
        // Keep only last 50 messages
        if (messages.length > 50) {
            messages = messages.slice(-50);
        }
        
        localStorage.setItem('contact_messages', JSON.stringify(messages));
        
        // Also save to session storage for this session
        sessionStorage.setItem('last_contact', JSON.stringify(formData));
    }
    
    sendEmailSimulation(formData) {
        // Simulate email sending
        console.log('Email would be sent to admin:', {
            to: 'info@csms.co.tz',
            from: formData.email,
            subject: `New Contact Form: ${formData.subject}`,
            message: `
                Name: ${formData.name}
                Email: ${formData.email}
                Phone: ${formData.phone || 'Not provided'}
                Service: ${formData.serviceType || 'Not specified'}
                Message: ${formData.message}
                Newsletter: ${formData.newsletter ? 'Yes' : 'No'}
            `
        });
    }
    
    showSuccessMessage() {
        this.showNotification('Message sent successfully! We\'ll get back to you within 24 hours.', 'success');
        console.log('Contact form submitted successfully');
    }
    
    setLoading(isLoading) {
        if (this.submitBtn) {
            if (isLoading) {
                this.submitBtn.disabled = true;
                this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            } else {
                this.submitBtn.disabled = false;
                this.submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
            }
        }
    }
    
    trackSubmission(formData) {
        // Track form submission for analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submission', {
                'event_category': 'Contact',
                'event_label': formData.serviceType || 'General'
            });
        }
        
        // Store submission count
        let submissionCount = localStorage.getItem('form_submissions') || 0;
        submissionCount = parseInt(submissionCount) + 1;
        localStorage.setItem('form_submissions', submissionCount.toString());
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification-toast');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'notification-toast';
        
        let icon = 'fa-info-circle';
        let borderColor = '#0d6efd';
        
        if (type === 'success') {
            icon = 'fa-check-circle';
            borderColor = '#198754';
        } else if (type === 'error') {
            icon = 'fa-exclamation-triangle';
            borderColor = '#dc3545';
        }
        
        notification.style.borderLeftColor = borderColor;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${icon}" style="color: ${borderColor}; font-size: 1.2rem;"></i>
                <span>${this.escapeHtml(message)}</span>
                <button class="notification-close" onclick="this.closest('.notification-toast').remove()">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification && notification.remove) {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
    
    initScrollAnimation() {
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
    
    initFaqToggle() {
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('expanded');
            });
        });
    }
}

// ========== QUICK CONTACT FUNCTION ==========
function showQuickContact() {
    // Remove existing modal if any
    const existingModal = document.getElementById('quickContactModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalHtml = `
        <div class="quick-contact-modal" id="quickContactModal">
            <div class="modal-overlay" onclick="closeQuickContact()"></div>
            <div class="modal-content-custom">
                <div class="modal-header-custom">
                    <h4><i class="fas fa-comment-dots"></i> Quick Chat</h4>
                    <button class="modal-close" onclick="closeQuickContact()">&times;</button>
                </div>
                <div class="modal-body-custom">
                    <p>Choose your preferred contact method:</p>
                    <div class="contact-options">
                        <button class="contact-option" onclick="window.location.href='tel:+255777123456'">
                            <i class="fas fa-phone-alt"></i>
                            <span>Call Us</span>
                        </button>
                        <button class="contact-option" onclick="window.open('https://wa.me/255777123456', '_blank')">
                            <i class="fab fa-whatsapp"></i>
                            <span>WhatsApp</span>
                        </button>
                        <button class="contact-option" onclick="window.location.href='mailto:info@csms.co.tz'">
                            <i class="fas fa-envelope"></i>
                            <span>Email</span>
                        </button>
                    </div>
                    <div class="quick-message mt-3">
                        <textarea id="quickMessage" rows="3" placeholder="Type your message here..." class="form-control"></textarea>
                        <button class="btn btn-primary mt-2 w-100" onclick="sendQuickMessage()">Send Message</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeQuickContact() {
    const modal = document.getElementById('quickContactModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s';
        setTimeout(() => modal.remove(), 300);
    }
}

function sendQuickMessage() {
    const message = document.getElementById('quickMessage')?.value;
    if (message && message.trim()) {
        window.location.href = `mailto:info@csms.co.tz?subject=Quick Message from CSMS Website&body=${encodeURIComponent(message.trim())}`;
        closeQuickContact();
        setTimeout(() => {
            const handler = new ContactFormHandler();
            handler.showNotification('Opening email client...', 'success');
        }, 100);
    } else {
        const handler = new ContactFormHandler();
        handler.showNotification('Please enter a message first', 'error');
    }
}

// ========== SIDEBAR FUNCTIONS ==========
function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.style.width = '280px';
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.style.width = '0';
    }
}

// ========== NAVBAR SCROLL EFFECT ==========
function initNavbarScroll() {
    const navbar = document.querySelector('.top-bar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
            } else {
                navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
            }
        });
    }
}

// ========== UPDATE UI BASED ON LOGIN ==========
function updateUIBasedOnLogin() {
    const loginBtn = document.getElementById('headerLoginBtn');
    if (loginBtn) {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            loginBtn.innerHTML = '<i class="fas fa-user"></i> Account';
            loginBtn.href = 'account.html';
        } else {
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            loginBtn.href = 'login.html';
        }
    }
}

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', () => {
    // Initialize form handler
    new ContactFormHandler();
    
    // Initialize navbar scroll effect
    initNavbarScroll();
    
    // Update UI based on login status
    updateUIBasedOnLogin();
    
    // Load saved data if any
    const lastContact = sessionStorage.getItem('last_contact');
    if (lastContact) {
        console.log('Previous contact form data found:', JSON.parse(lastContact));
    }
    
    // Add smooth scroll for anchor links
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
    
    // Log page view
    console.log('Contact page loaded and initialized');
});

// ========== EXPOSE FUNCTIONS GLOBALLY ==========
window.showQuickContact = showQuickContact;
window.closeQuickContact = closeQuickContact;
window.sendQuickMessage = sendQuickMessage;
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;