// ========== CONTACT PAGE - FULLY INTEGRATED WITH BACKEND ==========

let currentModalInstance = null;
let flatpickrInstance = null;

// ===== SIDEBAR FUNCTIONS =====
function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) { sidebar.style.width = '280px'; document.body.style.overflow = 'hidden'; }
}
function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) { sidebar.style.width = '0'; document.body.style.overflow = 'auto'; }
}

document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.querySelector('.hamburger');
    if (sidebar && hamburger && !sidebar.contains(event.target) && !hamburger.contains(event.target) && sidebar.style.width === '280px') { closeSidebar(); }
});

// ===== AUTH HELPERS =====
function isLoggedIn() { return !!API.getAuthToken() && localStorage.getItem('isLoggedIn') === 'true'; }
function getCurrentUser() { const user = localStorage.getItem('currentUser'); return user ? JSON.parse(user) : null; }

async function logout() {
    try { await API.auth.logout(); } catch(e) { console.error(e); }
    finally { API.clearAuthToken(); localStorage.removeItem('isLoggedIn'); localStorage.removeItem('currentUser'); sessionStorage.removeItem('adminLoggedIn'); sessionStorage.removeItem('staffLoggedIn'); showNotification('Logged out successfully', 'success'); setTimeout(() => window.location.href = 'index.html', 1000); }
}

function updateUIBasedOnLogin() {
    const loginBtn = document.getElementById('headerLoginBtn');
    if (!loginBtn) return;
    if (isLoggedIn()) {
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

// ===== SUBMIT CONTACT INQUIRY TO BACKEND =====
async function submitContactInquiry(formData) {
    console.log('Submitting contact inquiry:', formData);
    try {
        const response = await API.contact.submit({
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone || '0000000000',
            service_type: formData.service_type || 'General Inquiry',
            subject: formData.subject,
            message: formData.message,
            subscribe: formData.subscribe ? 1 : 0
        });
        console.log('Contact API response:', response);
        return { success: true, data: response };
    } catch (error) {
        console.error('Contact form submission error:', error);
        console.error('Error details:', error.message);
        return { success: false, error: error.message };
    }
}

// ===== NEWSLETTER SUBSCRIPTION =====
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
        console.error('Newsletter error:', error);
        return { success: false, message: error.message };
    }
}

// ===== FORM VALIDATION =====
function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function validatePhone(phone) { if (!phone) return true; return /^[\+][0-9]{10,15}$|^[0][0-9]{9,14}$/.test(phone); }

function validateContactForm() {
    let isValid = true;
    const fullName = document.getElementById('full_name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const subject = document.getElementById('subject')?.value.trim();
    const message = document.getElementById('message')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();

    if (!fullName) { showFieldError('full_name', 'Please enter your full name'); isValid = false; }
    else { clearFieldError('full_name'); }

    if (!email) { showFieldError('email', 'Please enter your email address'); isValid = false; }
    else if (!validateEmail(email)) { showFieldError('email', 'Please enter a valid email address'); isValid = false; }
    else { clearFieldError('email'); }

    if (phone && !validatePhone(phone)) { showFieldError('phone', 'Please enter a valid phone number'); isValid = false; }
    else { clearFieldError('phone'); }

    if (!subject) { showFieldError('subject', 'Please enter a subject'); isValid = false; }
    else { clearFieldError('subject'); }

    if (!message) { showFieldError('message', 'Please enter your message'); isValid = false; }
    else if (message.length < 10) { showFieldError('message', 'Message must be at least 10 characters'); isValid = false; }
    else { clearFieldError('message'); }

    return isValid;
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.add('is-invalid');
        let errorDiv = field.nextElementSibling;
        if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
        setTimeout(() => {
            field.classList.remove('is-invalid');
            if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
                errorDiv.style.display = 'none';
            }
        }, 3000);
    }
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.classList.remove('is-invalid');
        const errorDiv = field.nextElementSibling;
        if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
        }
    }
}

function setButtonLoading(button, isLoading, text) {
    if (!button) return;
    if (isLoading) {
        button.disabled = true;
        button.setAttribute('data-original-html', button.innerHTML);
        button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span>${text || 'Sending...'}`;
    } else {
        button.disabled = false;
        const original = button.getAttribute('data-original-html');
        if (original) button.innerHTML = original;
        else button.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
    }
}

// ===== FORM SUBMIT HANDLER =====
async function handleContactSubmit(e) {
    e.preventDefault();
    console.log('Form submitted, validating...');
    
    if (!validateContactForm()) {
        console.log('Form validation failed');
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    setButtonLoading(submitBtn, true, 'Sending...');
    
    const formData = {
        full_name: document.getElementById('full_name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        service_type: document.getElementById('service_type').value,
        subject: document.getElementById('subject').value.trim(),
        message: document.getElementById('message').value.trim(),
        subscribe: document.getElementById('subscribe').checked
    };
    
    console.log('Form data prepared:', formData);
    
    try {
        const result = await submitContactInquiry(formData);
        console.log('Submit result:', result);
        
        if (result.success) {
            document.getElementById('contactForm').reset();
            showNotification('Message sent successfully! We\'ll get back to you within 24 hours.', 'success');
        } else {
            showNotification(result.error || 'Failed to send message. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Submit error:', error);
        showNotification('An error occurred. Please try again later.', 'error');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// ===== NEWSLETTER SUBMIT =====
async function handleNewsletterSubmit(e) {
    e.preventDefault();
    const emailInput = document.getElementById('newsletterEmail');
    const email = emailInput?.value.trim();
    if (!email) { showNotification('Please enter your email address', 'error'); return; }
    if (!validateEmail(email)) { showNotification('Please enter a valid email address', 'error'); return; }
    
    showNotification('Subscribing...', 'info');
    const result = await subscribeNewsletter(email);
    if (result.success) { showNotification('Thank you for subscribing to our newsletter!', 'success'); emailInput.value = ''; }
    else { showNotification(result.message || 'Subscription failed. Please try again.', 'error'); }
}

// ===== FAQ MODAL FUNCTIONS =====
function openFaqModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
function closeFaqModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) { modal.classList.remove('active'); document.body.style.overflow = 'auto'; }
}
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const activeFaqModal = document.querySelector('.faq-modal-overlay.active');
        if (activeFaqModal) { activeFaqModal.classList.remove('active'); document.body.style.overflow = 'auto'; }
        closeWorkingHoursCard(); closeQuickContact();
    }
});

// ===== WORKING HOURS CARD =====
function showWorkingHoursCard() {
    const overlay = document.getElementById('workingHoursOverlay');
    const card = document.getElementById('workingHoursCard');
    if (overlay && card) { overlay.classList.add('active'); card.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
function closeWorkingHoursCard() {
    const overlay = document.getElementById('workingHoursOverlay');
    const card = document.getElementById('workingHoursCard');
    if (overlay && card) { overlay.classList.remove('active'); card.classList.remove('active'); document.body.style.overflow = 'auto'; }
}

// ===== QUICK CONTACT =====
function showQuickContact() {
    const existing = document.getElementById('quickContactModal');
    if (existing) existing.remove();
    const modalHtml = `<div class="quick-contact-modal" id="quickContactModal"><div class="modal-overlay" onclick="closeQuickContact()"></div><div class="modal-content-custom"><div class="modal-header-custom"><h4><i class="fas fa-comment-dots"></i> Quick Chat</h4><button class="modal-close" onclick="closeQuickContact()">&times;</button></div><div class="modal-body-custom"><p>Choose your preferred contact method:</p><div class="contact-options"><button class="contact-option" onclick="window.location.href='tel:+0621662883'"><i class="fas fa-phone-alt"></i><span>Call Us</span></button><button class="contact-option" onclick="window.open('https://wa.me/0621662883', '_blank')"><i class="fab fa-whatsapp"></i><span>WhatsApp</span></button><button class="contact-option" onclick="window.location.href='mailto:info@cleanspark.co.tz'"><i class="fas fa-envelope"></i><span>Email</span></button></div><div class="quick-message mt-3"><textarea id="quickMessage" rows="3" placeholder="Type your message here..." class="form-control"></textarea><button class="btn btn-primary mt-2 w-100" onclick="sendQuickMessage()">Send Message</button></div></div></div></div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}
function closeQuickContact() { const modal = document.getElementById('quickContactModal'); if (modal) modal.remove(); }
function sendQuickMessage() {
    const message = document.getElementById('quickMessage')?.value;
    if (message && message.trim()) { window.location.href = `mailto:info@cleanspark.co.tz?subject=Quick Message from CleanSpark Website&body=${encodeURIComponent(message.trim())}`; closeQuickContact(); }
    else { showNotification('Please enter a message first', 'error'); }
}

// ===== SCROLL ANIMATION =====
function initScrollAnimation() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('animated'); observer.unobserve(entry.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    elements.forEach(el => observer.observe(el));
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-triangle', warning: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const colors = { success: '#198754', error: '#dc3545', warning: '#ffc107', info: '#4361ee' };
    notification.style.borderLeftColor = colors[type] || colors.info;
    notification.innerHTML = `<div class="notification-content"><i class="fas ${icons[type] || icons.info}" style="color:${colors[type] || colors.info}"></i><span>${escapeHtml(message)}</span><button class="notification-close" onclick="this.closest('.notification-toast').remove()">&times;</button></div>`;
    document.body.appendChild(notification);
    setTimeout(() => { if (notification.parentNode) notification.remove(); }, 5000);
}
function escapeHtml(str) { if (!str) return ''; return str.replace(/[&<>]/g, function(m) { if (m === '&') return '&amp;'; if (m === '<') return '&lt;'; if (m === '>') return '&gt;'; return m; }); }
function showLoading(show) { let s = document.getElementById('loading-spinner'); if (!s && show) { s = document.createElement('div'); s.id = 'loading-spinner'; s.innerHTML = '<div class="spinner-border text-primary"></div>'; s.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;background:rgba(0,0,0,0.5);width:100%;height:100%;display:flex;align-items:center;justify-content:center;'; document.body.appendChild(s); } if (s) s.style.display = show ? 'flex' : 'none'; }

// ===== ADD STYLES =====
const style = document.createElement('style');
style.textContent = `
    .notification-toast { position: fixed; bottom: 20px; right: 20px; z-index: 9999; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 280px; max-width: 350px; border-left: 4px solid; animation: slideInRight 0.3s ease; }
    .notification-content { display: flex; align-items: center; gap: 12px; padding: 12px 16px; }
    .notification-content i { font-size: 1.2rem; }
    .notification-content span { flex: 1; font-size: 0.9rem; }
    .notification-close { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #999; }
    @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .faq-modal-overlay, .working-hours-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; display: none; align-items: center; justify-content: center; }
    .faq-modal-overlay.active, .working-hours-overlay.active { display: flex; }
    .faq-modal-container, .working-hours-card { background: var(--bg-white); border-radius: 16px; max-width: 600px; width: 90%; max-height: 85vh; overflow-y: auto; }
    .working-hours-card { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10001; display: none; max-width: 500px; }
    .working-hours-card.active { display: block; }
    .quick-contact-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10002; display: flex; align-items: center; justify-content: center; }
    .contact-options { display: flex; gap: 15px; justify-content: center; margin: 20px 0; }
    .contact-option { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 15px 20px; border: 2px solid var(--border); border-radius: 12px; background: var(--bg-white); cursor: pointer; transition: all 0.3s; }
    .contact-option:hover { border-color: #4361ee; background: rgba(67,97,238,0.05); }
    .contact-option i { font-size: 24px; color: #4361ee; }
    .invalid-feedback { display: none; font-size: 0.8rem; color: #dc3545; margin-top: 4px; }
    .is-invalid { border-color: #dc3545 !important; }
`;
document.head.appendChild(style);

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Contact page initializing...');
    console.log('API object available:', typeof API !== 'undefined');
    console.log('API.contact available:', API && typeof API.contact !== 'undefined');
    
    updateUIBasedOnLogin();
    initScrollAnimation();
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        console.log('Contact form found, attaching event listener');
        contactForm.addEventListener('submit', handleContactSubmit);
    } else {
        console.error('Contact form not found!');
    }
    
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
    
    const inputs = ['full_name', 'email', 'phone', 'subject', 'message'];
    inputs.forEach(id => { 
        const el = document.getElementById(id); 
        if (el) { 
            el.addEventListener('input', () => { el.classList.remove('is-invalid'); }); 
        } 
    });
    
    console.log('Contact page initialized successfully');
});

// Export functions for global use
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.openFaqModal = openFaqModal;
window.closeFaqModal = closeFaqModal;
window.showWorkingHoursCard = showWorkingHoursCard;
window.closeWorkingHoursCard = closeWorkingHoursCard;
window.showQuickContact = showQuickContact;
window.closeQuickContact = closeQuickContact;
window.sendQuickMessage = sendQuickMessage;
window.showNotification = showNotification;