// ============================================================================
// CSMS TRACKING DASHBOARD - ENHANCED & PROFESSIONAL JAVASCRIPT
// ============================================================================

// ----------------------------- AUTHENTICATION CHECK -----------------------------

(function checkAuth() {
    // Check if user is already logged in via sessionStorage
    let isLoggedIn = sessionStorage.getItem('csms_loggedIn') === 'true';
    
    // If not logged in, check if there's user data (auto-login for demo/testing)
    if (!isLoggedIn) {
        const user = sessionStorage.getItem('csms_user');
        if (user) {
            try {
                JSON.parse(user); // Validate JSON
                sessionStorage.setItem('csms_loggedIn', 'true');
                isLoggedIn = true;
            } catch(e) {
                console.error('Invalid user session data');
            }
        }
    }
    
    // Auto-login for demo purposes - REMOVE THIS IN PRODUCTION
    // This simulates a logged-in user for testing
    if (!isLoggedIn) {
        const demoUser = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+255 777 123 456'
        };
        sessionStorage.setItem('csms_loggedIn', 'true');
        sessionStorage.setItem('csms_user', JSON.stringify(demoUser));
        isLoggedIn = true;
        console.log('Demo auto-login activated - Remove this in production!');
    }
    
    const overlay = document.getElementById('loginRequiredOverlay');
    const dashboard = document.getElementById('dashboardWrapper');
    
    if (isLoggedIn) {
        // User is logged in - show dashboard
        if (overlay) overlay.style.display = 'none';
        if (dashboard) dashboard.style.display = 'flex';
        
        // Update user profile in sidebar
        const user = sessionStorage.getItem('csms_user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                updateUserProfile(userData);
            } catch(e) {
                console.error('Error parsing user data:', e);
            }
        }
    } else {
        // User is not logged in - show login required overlay
        if (overlay) overlay.style.display = 'flex';
        if (dashboard) dashboard.style.display = 'none';
    }
})();

function updateUserProfile(userData) {
    const avatarEl = document.getElementById('userAvatar');
    const nameEl = document.getElementById('userName');
    const emailEl = document.getElementById('userEmail');
    
    if (userData.name && nameEl) nameEl.textContent = userData.name;
    if (userData.email && emailEl) emailEl.innerHTML = `<i class="bi bi-envelope"></i> ${escapeHtml(userData.email)}`;
    if (userData.name && avatarEl) {
        const initials = userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        avatarEl.textContent = initials;
    }
}

/**
 * Simulate login - Call this function when user logs in
 * Example: simulateLogin('John Doe', 'john@example.com');
 */
function simulateLogin(name, email) {
    const userData = { name, email };
    sessionStorage.setItem('csms_loggedIn', 'true');
    sessionStorage.setItem('csms_user', JSON.stringify(userData));
    
    const overlay = document.getElementById('loginRequiredOverlay');
    const dashboard = document.getElementById('dashboardWrapper');
    if (overlay) overlay.style.display = 'none';
    if (dashboard) dashboard.style.display = 'flex';
    
    updateUserProfile(userData);
    showNotification('Welcome back, ' + name + '!', 'success');
    
    // Re-initialize the dashboard
    if (document.getElementById('dynamicPanel').children.length === 0) {
        initDashboard();
    }
}

/**
 * Logout function
 */
function logoutUser() {
    sessionStorage.removeItem('csms_loggedIn');
    sessionStorage.removeItem('csms_user');
    sessionStorage.removeItem('csms_payment_methods');
    userPaymentMethods = [];
    
    const overlay = document.getElementById('loginRequiredOverlay');
    const dashboard = document.getElementById('dashboardWrapper');
    if (overlay) overlay.style.display = 'flex';
    if (dashboard) dashboard.style.display = 'none';
    
    // Clear dynamic panel
    const dynamicPanel = document.getElementById('dynamicPanel');
    if (dynamicPanel) dynamicPanel.innerHTML = '';
}

// ----------------------------- CONFIGURATION & DATA -----------------------------

// Bookings Database
const bookings = [
    { id: 101, status: "upcoming",  service: "Premium Home Deep Cleaning",         date: "2026-04-05", price: "TZS 212,000", address: "Stone Town, Unguja",       staffId: 1 },
    { id: 102, status: "upcoming",  service: "AC Maintenance & Filter Replacement", date: "2026-04-12", price: "TZS 285,000", address: "Mbweni Residence",          staffId: 2 },
    { id: 103, status: "delivered", service: "Office Carpet Steam Cleaning",        date: "2026-03-18", price: "TZS 499,000", address: "Vikokotoni Business Hub",    staffId: 3 },
    { id: 104, status: "delivered", service: "Kitchen Sanitization Service",        date: "2026-03-02", price: "TZS 178,000", address: "Shangani District",          staffId: 4 },
    { id: 105, status: "cancelled", service: "Balcony Pressure Washing",            date: "2026-02-28", price: "TZS 130,000", address: "Kiwengwa Beach Area",        staffId: 1 },
    { id: 106, status: "unpaid",    service: "Full Villa Cleaning (4 Rooms)",       date: "2026-03-22", price: "TZS 808,000", address: "Fumba Town",                 staffId: 5 },
    { id: 107, status: "unpaid",    service: "Upholstery & Mattress Deep Clean",    date: "2026-03-20", price: "TZS 233,000", address: "Michenzani",                 staffId: 2 }
];

// Staff Database
const staffMembers = {
    1: { id: 1, name: "Amina Khalid", initials: "AK", role: "Senior Cleaning Technician", phone: "+255 712 345 678", experience: "5 Years", specialization: "Residential Deep Cleaning", rating: 4.8, totalReviews: 134, ratingBreakdown: { 5: 98, 4: 24, 3: 8, 2: 3, 1: 1 } },
    2: { id: 2, name: "Hassan Omar", initials: "HO", role: "HVAC & AC Specialist", phone: "+255 765 987 432", experience: "7 Years", specialization: "AC Maintenance & Upholstery", rating: 4.6, totalReviews: 89, ratingBreakdown: { 5: 61, 4: 18, 3: 6, 2: 3, 1: 1 } },
    3: { id: 3, name: "Fatuma Juma", initials: "FJ", role: "Commercial Cleaning Expert", phone: "+255 744 123 900", experience: "4 Years", specialization: "Office & Carpet Steam Cleaning", rating: 4.9, totalReviews: 217, ratingBreakdown: { 5: 198, 4: 14, 3: 3, 2: 1, 1: 1 } },
    4: { id: 4, name: "Salim Rashid", initials: "SR", role: "Sanitation Specialist", phone: "+255 753 654 321", experience: "3 Years", specialization: "Kitchen & Bathroom Sanitization", rating: 4.5, totalReviews: 62, ratingBreakdown: { 5: 40, 4: 14, 3: 5, 2: 2, 1: 1 } },
    5: { id: 5, name: "Zuwena Ali", initials: "ZA", role: "Villa & Estate Cleaner", phone: "+255 778 222 111", experience: "6 Years", specialization: "Villa & Large Property Cleaning", rating: 4.7, totalReviews: 155, ratingBreakdown: { 5: 120, 4: 25, 3: 7, 2: 2, 1: 1 } }
};

// Payment History Database
const paymentHistory = [
    { id: 'PAY-001', service: 'Office Carpet Steam Cleaning', amount: 'TZS 499,000', date: '2026-03-18', method: 'Visa •••• 4242' },
    { id: 'PAY-002', service: 'Kitchen Sanitization Service', amount: 'TZS 178,000', date: '2026-03-02', method: 'M-Pesa' },
    { id: 'PAY-003', service: 'AC Maintenance', amount: 'TZS 285,000', date: '2026-02-15', method: 'Mastercard •••• 8888' }
];

// Notifications Database
const notifications = [
    { id: 1, icon: 'bi-calendar-check', bgColor: '#e8f0fe', iconColor: '#4361ee', title: 'Booking Confirmed', message: 'Your Home Deep Cleaning is scheduled for Apr 5.', time: '2 hours ago' },
    { id: 2, icon: 'bi-star-half', bgColor: '#fff3cd', iconColor: '#f59e0b', title: 'Rate Your Service', message: 'How was your Kitchen Sanitization? Leave a review.', time: '1 day ago' },
    { id: 3, icon: 'bi-credit-card', bgColor: '#f8d7da', iconColor: '#dc3545', title: 'Payment Overdue', message: 'Full Villa Cleaning payment is past due. Pay now to avoid late fees.', time: '3 days ago' },
    { id: 4, icon: 'bi-gift', bgColor: '#d1e7dd', iconColor: '#198754', title: 'Special Offer!', message: 'Get 20% off your next booking with code CLEAN20.', time: '5 days ago' }
];

// Available payment methods for adding
const availablePaymentMethods = {
    mobileMoney: [
        { id: 'mix-by-yas', name: 'Mix by Yas', icon: 'fas fa-mobile-alt', color: '#1a73e8', bgColor: '#e8f0fe' },
        { id: 'mpesa', name: 'M-Pesa', icon: 'fas fa-mobile-alt', color: '#4CAF50', bgColor: '#e8f5e9' },
        { id: 'airtel-money', name: 'Airtel Money', icon: 'fas fa-sim-card', color: '#E53935', bgColor: '#ffebee' },
        { id: 'halopesa', name: 'HaloPesa', icon: 'fas fa-wallet', color: '#FF9800', bgColor: '#fff3e0' },
        { id: 'azam-pay', name: 'Azam Pay', icon: 'fas fa-credit-card', color: '#9C27B0', bgColor: '#f3e5f5' },
        { id: 'tigo-pesa', name: 'Tigo Pesa', icon: 'fas fa-mobile-alt', color: '#1565C0', bgColor: '#e3f2fd' }
    ],
    cardPayments: [
        { id: 'visa', name: 'Visa Card', icon: 'fab fa-cc-visa', color: '#1a1f71', bgColor: '#e8eaf6' },
        { id: 'mastercard', name: 'Mastercard', icon: 'fab fa-cc-mastercard', color: '#eb001b', bgColor: '#ffebee' },
        { id: 'american-express', name: 'American Express', icon: 'fab fa-cc-amex', color: '#2e77bc', bgColor: '#e3f2fd' }
    ]
};

// User's added payment methods
let userPaymentMethods = JSON.parse(sessionStorage.getItem('csms_payment_methods') || '[]');

// Session storage for submitted reviews
const submittedReviews = {};

// Quotes data
const quotesData = [
    { 
        id: 'QTE-2026-001', 
        service: 'Office Deep Cleaning', 
        date: '2026-04-10', 
        validUntil: '2026-04-10',
        status: 'pending',
        items: [
            { description: 'Full office floor cleaning (500 sqm)', quantity: 1, rate: 'TZS 250,000', amount: 'TZS 250,000' },
            { description: 'Window cleaning (interior & exterior)', quantity: 12, rate: 'TZS 8,000', amount: 'TZS 96,000' },
            { description: 'Carpet vacuuming and spot treatment', quantity: 1, rate: 'TZS 60,000', amount: 'TZS 60,000' },
            { description: 'Restroom sanitization', quantity: 3, rate: 'TZS 15,000', amount: 'TZS 45,000' }
        ],
        total: 'TZS 449,000',
        notes: 'Service includes eco-friendly cleaning products. Equipment provided by CSMS.'
    },
    { 
        id: 'QTE-2026-002', 
        service: 'Carpet Sanitizing', 
        date: '2026-04-05', 
        validUntil: '2026-04-05',
        status: 'approved',
        items: [
            { description: 'Deep steam cleaning (3 rooms)', quantity: 3, rate: 'TZS 50,000', amount: 'TZS 150,000' },
            { description: 'Stain removal treatment', quantity: 1, rate: 'TZS 40,000', amount: 'TZS 40,000' },
            { description: 'Deodorizing and sanitizing', quantity: 1, rate: 'TZS 40,000', amount: 'TZS 40,000' }
        ],
        total: 'TZS 230,000',
        notes: 'Quick-dry technology used. Rooms ready in 2-4 hours.'
    }
];

// ----------------------------- DOM ELEMENTS -----------------------------

const DOM = {
    sidebar: document.getElementById('mainSidebar'),
    overlay: document.getElementById('mobileOverlay'),
    hamburger: document.getElementById('hamburgerToggle'),
    sidebarClose: document.getElementById('sidebarCloseBtn'),
    dynamicPanel: document.getElementById('dynamicPanel'),
    notificationIcon: document.getElementById('notificationIcon'),
    notificationBadge: document.getElementById('notificationBadge'),
    menuItems: document.querySelectorAll('.menu li')
};

// ----------------------------- UTILITY FUNCTIONS -----------------------------

function escapeHtml(str) {
    if (!str) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, m => map[m]);
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    const config = {
        info:    { icon: 'bi-info-circle-fill', color: '#0d6efd' },
        success: { icon: 'bi-check-circle-fill', color: '#198754' },
        danger:  { icon: 'bi-exclamation-triangle-fill', color: '#dc3545' },
        warning: { icon: 'bi-exclamation-triangle-fill', color: '#ffc107' }
    };
    const { icon, color } = config[type] || config.info;

    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.style.borderLeftColor = color;
    toast.innerHTML = `
        <div class="notification-content">
            <i class="bi ${icon}" style="color: ${color};"></i>
            <span>${escapeHtml(message)}</span>
            <button class="notification-close" onclick="this.closest('.notification-toast').remove()">&times;</button>
        </div>
    `;

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ----------------------------- SIDEBAR CONTROLS -----------------------------

function closeSidebar() {
    if (window.innerWidth <= 992) {
        DOM.sidebar?.classList.remove('mobile-open');
        DOM.overlay?.classList.remove('active');
    }
}

function openSidebar() {
    if (window.innerWidth <= 992) {
        DOM.sidebar?.classList.add('mobile-open');
        DOM.overlay?.classList.add('active');
    }
}

// ----------------------------- GLOBAL MODAL HELPER -----------------------------

function openGlobalModal(title, bodyHtml, footerHtml = '') {
    const titleEl = document.getElementById('globalModalTitle');
    const bodyEl = document.getElementById('globalModalBody');
    const footerEl = document.getElementById('globalModalFooter');
    
    if (titleEl) titleEl.innerHTML = title;
    if (bodyEl) bodyEl.innerHTML = bodyHtml;
    if (footerEl) footerEl.innerHTML = footerHtml;
    
    const modalEl = document.getElementById('globalActionModal');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
        return modal;
    }
    return null;
}

// ----------------------------- UI COMPONENT RENDERERS -----------------------------

function renderStarDisplay(rating, maxStars = 5) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

    return [
        ...Array(fullStars).fill('<i class="bi bi-star-fill"></i>'),
        ...(hasHalfStar ? ['<i class="bi bi-star-half"></i>'] : []),
        ...Array(emptyStars).fill('<i class="bi bi-star empty"></i>')
    ].join('');
}

function renderRatingBars(staff) {
    return [5, 4, 3, 2, 1].map(star => {
        const count = staff.ratingBreakdown[star] || 0;
        const percent = staff.totalReviews ? Math.round((count / staff.totalReviews) * 100) : 0;
        return `
            <div class="rating-bar-row">
                <span class="rating-bar-label">${star}</span>
                <div class="rating-bar-track">
                    <div class="rating-bar-fill" style="width: ${percent}%"></div>
                </div>
                <span class="rating-bar-count">${count}</span>
            </div>
        `;
    }).join('');
}

function getServiceIcon(serviceName) {
    const iconMap = [
        { pattern: /clean/i, icon: 'bi-droplet' },
        { pattern: /ac/i, icon: 'bi-snow2' },
        { pattern: /carpet/i, icon: 'bi-grid-3x3-gap-fill' },
        { pattern: /kitchen/i, icon: 'bi-egg-fried' },
        { pattern: /villa/i, icon: 'bi-house-heart' },
        { pattern: /upholstery/i, icon: 'bi-couch' }
    ];
    const match = iconMap.find(item => item.pattern.test(serviceName));
    return match ? match.icon : 'bi-brightness-alt-high';
}

function getStatusBadge(status) {
    const badges = {
        upcoming:  'badge-upcoming',
        delivered: 'badge-delivered',
        cancelled: 'badge-cancelled',
        unpaid:    'badge-unpaid'
    };
    return {
        className: badges[status] || '',
        text: status.charAt(0).toUpperCase() + status.slice(1)
    };
}

// ----------------------------- PAYMENT METHOD FORM -----------------------------

function showAddPaymentMethodForm(totalAmount) {
    const title = `<i class="bi bi-plus-circle me-2"></i>Add Payment Details`;
    
    const mobileMoneyHtml = availablePaymentMethods.mobileMoney.map(m => `
        <div class="add-method-card" data-method-id="${m.id}" data-method-name="${m.name}" data-method-type="mobile">
            <div class="add-method-card-icon" style="background: ${m.bgColor}; color: ${m.color};">
                <i class="${m.icon}"></i>
            </div>
            <div class="add-method-card-info">
                <h6>${m.name}</h6>
                <p>Pay securely with ${m.name}</p>
            </div>
            <i class="bi bi-chevron-right ms-auto text-muted"></i>
        </div>
    `).join('');

    const cardPaymentsHtml = availablePaymentMethods.cardPayments.map(m => `
        <div class="add-method-card" data-method-id="${m.id}" data-method-name="${m.name}" data-method-type="card">
            <div class="add-method-card-icon" style="background: ${m.bgColor}; color: ${m.color};">
                <i class="${m.icon}"></i>
            </div>
            <div class="add-method-card-info">
                <h6>${m.name}</h6>
                <p>Add your ${m.name} for payments</p>
            </div>
            <i class="bi bi-chevron-right ms-auto text-muted"></i>
        </div>
    `).join('');

    const bodyHtml = `
        <div style="margin-bottom: 24px;">
            <div style="font-size: 1.4rem; font-weight: 800; color: var(--dark-color);">${totalAmount}</div>
            <div style="font-size: 0.85rem; color: var(--gray-color);">Select a payment method to add</div>
        </div>
        
        <div class="add-method-section-title">
            <i class="fas fa-mobile-alt text-primary"></i> Mobile Money
        </div>
        <div class="mb-4" id="mobileMoneyList">
            ${mobileMoneyHtml}
        </div>
        
        <div class="add-method-section-title">
            <i class="fas fa-credit-card text-primary"></i> Card Payments
        </div>
        <div class="mb-3" id="cardPaymentsList">
            ${cardPaymentsHtml}
        </div>
        
        <div id="paymentDetailForm" style="display:none; margin-top: 20px;"></div>
        
        ${userPaymentMethods.length > 0 ? `
        <div class="add-method-section-title mt-4">
            <i class="bi bi-check-circle text-success"></i> Your Saved Methods
        </div>
        <div class="mb-3">
            ${userPaymentMethods.map(m => `
                <div class="add-method-card" style="border-color: #bbf7d0; background: #f0fdf4;">
                    <div class="add-method-card-icon" style="background: ${m.bgColor || '#e8f5e9'}; color: ${m.color || '#4CAF50'};">
                        <i class="${m.icon || 'fas fa-mobile-alt'}"></i>
                    </div>
                    <div class="add-method-card-info">
                        <h6>${m.name}</h6>
                        <p style="color: #15803d;">${m.detail || 'Ready to use'}</p>
                    </div>
                    <i class="bi bi-check-circle-fill text-success"></i>
                </div>
            `).join('')}
        </div>
        ` : ''}
    `;

    const footerHtml = `
        <button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
    `;

    const modal = openGlobalModal(title, bodyHtml, footerHtml);
    const modalEl = document.getElementById('globalActionModal');
    let selectedMethod = null;

    if (modalEl) {
        modalEl.querySelectorAll('.add-method-card').forEach(card => {
            // Avoid attaching to saved methods
            if (card.style.borderColor === 'rgb(187, 247, 208)') return;
            
            card.addEventListener('click', function() {
                const methodId = this.dataset.methodId;
                const methodName = this.dataset.methodName;
                const methodType = this.dataset.methodType;
                
                // Highlight selected
                modalEl.querySelectorAll('.add-method-card').forEach(c => c.style.borderColor = '#e2e8f0');
                this.style.borderColor = 'var(--primary-color)';
                this.style.background = '#eff1fe';
                
                selectedMethod = { id: methodId, name: methodName, type: methodType };
                renderPaymentForm(methodType, methodName, totalAmount);
            });
        });
    }
}

function renderPaymentForm(type, methodName, totalAmount) {
    const formDiv = document.getElementById('paymentDetailForm');
    if (!formDiv) return;
    
    formDiv.style.display = 'block';
    
    if (type === 'mobile') {
        formDiv.innerHTML = `
            <hr>
            <h6 class="fw-bold mb-3"><i class="fas fa-mobile-alt me-2"></i>${methodName} Details</h6>
            <div class="payment-form-group">
                <label><i class="bi bi-telephone"></i> Phone Number</label>
                <input type="tel" id="mobilePhoneNumber" placeholder="+255 7XX XXX XXX" value="+255 " autocomplete="off">
            </div>
            <div class="payment-form-group">
                <label><i class="bi bi-person"></i> Account Name</label>
                <input type="text" id="mobileAccountName" placeholder="Full Name on Account" autocomplete="off">
            </div>
            <button class="btn btn-primary rounded-pill px-4 mt-2 w-100" id="saveMobileMethodBtn">
                <i class="bi bi-check-circle me-2"></i> Add ${methodName}
            </button>
        `;
        
        document.getElementById('saveMobileMethodBtn')?.addEventListener('click', () => {
            const phone = document.getElementById('mobilePhoneNumber')?.value.trim();
            const name = document.getElementById('mobileAccountName')?.value.trim();
            
            if (!phone || phone.length < 10) {
                showNotification('Please enter a valid phone number.', 'warning');
                return;
            }
            if (!name) {
                showNotification('Please enter the account name.', 'warning');
                return;
            }
            
            saveNewPaymentMethod({
                id: methodName.toLowerCase().replace(/\s+/g, '-'),
                name: methodName,
                type: 'mobile',
                icon: 'fas fa-mobile-alt',
                detail: phone,
                color: '#4CAF50',
                bgColor: '#e8f5e9'
            });
            
            bootstrap.Modal.getInstance(document.getElementById('globalActionModal')).hide();
            showNotification(`${methodName} added successfully!`, 'success');
            setTimeout(loadOutstandingPayments, 300);
        });
    } else {
        formDiv.innerHTML = `
            <hr>
            <h6 class="fw-bold mb-3"><i class="fas fa-credit-card me-2"></i>${methodName} Details</h6>
            <div class="payment-form-group">
                <label><i class="bi bi-credit-card"></i> Card Number</label>
                <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" autocomplete="off">
            </div>
            <div class="card-details-grid">
                <div class="payment-form-group">
                    <label><i class="bi bi-calendar"></i> Expiry Date</label>
                    <input type="text" id="cardExpiry" placeholder="MM/YY" maxlength="5" autocomplete="off">
                </div>
                <div class="payment-form-group">
                    <label><i class="bi bi-lock"></i> CVV</label>
                    <input type="password" id="cardCvv" placeholder="123" maxlength="4" autocomplete="off">
                </div>
            </div>
            <div class="payment-form-group">
                <label><i class="bi bi-person"></i> Cardholder Name</label>
                <input type="text" id="cardHolderName" placeholder="Name on Card" autocomplete="off">
            </div>
            <button class="btn btn-primary rounded-pill px-4 mt-2 w-100" id="saveCardMethodBtn">
                <i class="bi bi-check-circle me-2"></i> Add ${methodName}
            </button>
        `;
        
        // Card number formatting
        document.getElementById('cardNumber')?.addEventListener('input', function(e) {
            let val = this.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formatted = val.match(/.{1,4}/g)?.join(' ') || '';
            this.value = formatted;
        });
        
        // Expiry formatting
        document.getElementById('cardExpiry')?.addEventListener('input', function(e) {
            let val = this.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            if (val.length >= 2) val = val.substring(0,2) + '/' + val.substring(2);
            this.value = val.substring(0,5);
        });
        
        document.getElementById('saveCardMethodBtn')?.addEventListener('click', () => {
            const number = document.getElementById('cardNumber')?.value.trim();
            const expiry = document.getElementById('cardExpiry')?.value.trim();
            const cvv = document.getElementById('cardCvv')?.value.trim();
            const name = document.getElementById('cardHolderName')?.value.trim();
            
            if (!number || number.replace(/\s/g, '').length < 15) {
                showNotification('Please enter a valid card number.', 'warning');
                return;
            }
            if (!expiry || !expiry.includes('/')) {
                showNotification('Please enter a valid expiry date (MM/YY).', 'warning');
                return;
            }
            if (!cvv || cvv.length < 3) {
                showNotification('Please enter a valid CVV.', 'warning');
                return;
            }
            if (!name) {
                showNotification('Please enter the cardholder name.', 'warning');
                return;
            }
            
            saveNewPaymentMethod({
                id: methodName.toLowerCase().replace(/\s+/g, '-'),
                name: methodName,
                type: 'card',
                icon: 'fab fa-cc-' + (methodName.toLowerCase().includes('visa') ? 'visa' : 'mastercard'),
                detail: '•••• ' + number.slice(-4),
                color: '#1a1f71',
                bgColor: '#e8eaf6'
            });
            
            bootstrap.Modal.getInstance(document.getElementById('globalActionModal')).hide();
            showNotification(`${methodName} added successfully!`, 'success');
            setTimeout(loadOutstandingPayments, 300);
        });
    }
}

function saveNewPaymentMethod(methodData) {
    userPaymentMethods.push({
        id: methodData.id,
        name: methodData.name,
        type: methodData.type,
        icon: methodData.icon,
        detail: methodData.detail,
        color: methodData.color,
        bgColor: methodData.bgColor,
        addedAt: new Date().toISOString()
    });
    sessionStorage.setItem('csms_payment_methods', JSON.stringify(userPaymentMethods));
}

// ----------------------------- SHOW PAYMENT METHODS -----------------------------

function showPaymentMethods(totalAmount) {
    const title = `<i class="bi bi-credit-card me-2"></i>Pay Outstanding Balance`;
    
    let methodsHtml = '';
    
    if (userPaymentMethods.length > 0) {
        methodsHtml += `
            <div class="add-method-section-title">
                <i class="bi bi-star-fill text-warning"></i> Your Payment Methods
            </div>
        `;
        userPaymentMethods.forEach(m => {
            methodsHtml += `
                <div class="payment-method-option" data-method="${m.id}" data-method-name="${m.name}">
                    <div class="payment-method-icon" style="background: ${m.bgColor}; color: ${m.color};">
                        <i class="${m.icon}"></i>
                    </div>
                    <div>
                        <strong>${m.name}</strong><br>
                        <span style="font-size:0.8rem;color:#6c757d;">${m.detail || 'Saved payment method'}</span>
                    </div>
                </div>
            `;
        });
    }
    
    methodsHtml += `
        <div class="add-method-section-title mt-3">
            <i class="bi bi-credit-card text-primary"></i> Default Payment Methods
        </div>
        <div class="payment-method-option" data-method="visa" data-method-name="Visa Card">
            <div class="payment-method-icon"><i class="fab fa-cc-visa"></i></div>
            <div><strong>Visa</strong><br><span style="font-size:0.8rem;color:#6c757d;">•••• 4242</span></div>
        </div>
        <div class="payment-method-option" data-method="mastercard" data-method-name="Mastercard">
            <div class="payment-method-icon"><i class="fab fa-cc-mastercard"></i></div>
            <div><strong>Mastercard</strong><br><span style="font-size:0.8rem;color:#6c757d;">•••• 8888</span></div>
        </div>
        <div class="payment-method-option" data-method="mpesa" data-method-name="M-Pesa">
            <div class="payment-method-icon"><i class="fas fa-mobile-alt"></i></div>
            <div><strong>M-Pesa</strong><br><span style="font-size:0.8rem;color:#6c757d;">+255 7xx xxx xxx</span></div>
        </div>
    `;

    const bodyHtml = `
        <div style="margin-bottom: 20px;">
            <div style="font-size: 1.8rem; font-weight: 800; color: var(--dark-color);">${totalAmount}</div>
            <div style="font-size: 0.85rem; color: var(--gray-color);">Select a payment method below</div>
        </div>
        <div id="paymentMethodsList">
            ${methodsHtml}
        </div>
        <p id="paymentMethodError" class="text-danger mt-2" style="font-size:0.85rem;display:none;">Please select a payment method.</p>
    `;
    
    const footerHtml = `
        <button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-outline-primary rounded-pill px-3" id="addPaymentMethodBtn">
            <i class="bi bi-plus-circle me-1"></i> Add
        </button>
        <button type="button" class="btn btn-primary rounded-pill px-4" id="proceedPaymentBtn">Proceed</button>
    `;

    const modal = openGlobalModal(title, bodyHtml, footerHtml);
    const modalEl = document.getElementById('globalActionModal');
    let selectedMethod = null;
    let selectedMethodName = null;

    if (modalEl) {
        modalEl.querySelectorAll('.payment-method-option').forEach(option => {
            option.addEventListener('click', function() {
                modalEl.querySelectorAll('.payment-method-option').forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
                selectedMethod = this.dataset.method;
                selectedMethodName = this.dataset.methodName || this.dataset.method;
                const errorEl = document.getElementById('paymentMethodError');
                if (errorEl) errorEl.style.display = 'none';
            });
        });

        const proceedBtn = document.getElementById('proceedPaymentBtn');
        if (proceedBtn) {
            proceedBtn.addEventListener('click', () => {
                if (!selectedMethod) {
                    const errorEl = document.getElementById('paymentMethodError');
                    if (errorEl) errorEl.style.display = 'block';
                    return;
                }
                if (modal) modal.hide();
                showPaymentCardUI(totalAmount, selectedMethodName || selectedMethod);
            });
        }

        const addBtn = document.getElementById('addPaymentMethodBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                if (modal) modal.hide();
                showAddPaymentMethodForm(totalAmount);
            });
        }
    }
}

// ----------------------------- PAYMENT CARD UI -----------------------------

function showPaymentCardUI(amount, methodName) {
    const cardNumber = methodName.toLowerCase().includes('visa') ? '4532 •••• •••• 7891' :
                       methodName.toLowerCase().includes('master') ? '5412 •••• •••• 3456' :
                       '4••• •••• •••• ••••';
    
    const brandIcon = methodName.toLowerCase().includes('visa') ? 'fab fa-cc-visa' :
                      methodName.toLowerCase().includes('master') ? 'fab fa-cc-mastercard' :
                      'fas fa-credit-card';

    const labelEl = document.getElementById('paymentCardModalLabel');
    if (labelEl) labelEl.innerHTML = `<i class="bi bi-shield-lock-fill me-2"></i>Secure Payment`;
    
    const bodyEl = document.getElementById('paymentCardModalBody');
    if (!bodyEl) return;
    
    bodyEl.innerHTML = `
        <div class="payment-card-ui">
            <div class="payment-card-chip"></div>
            <div class="payment-card-number-display">${cardNumber}</div>
            <div class="payment-card-details-row">
                <div>
                    <div class="payment-card-detail-label">Card Holder</div>
                    <div class="payment-card-detail-value">JOHN DOE</div>
                </div>
                <div>
                    <div class="payment-card-detail-label">Expires</div>
                    <div class="payment-card-detail-value">12/28</div>
                </div>
            </div>
            <div class="payment-card-brand">
                <i class="${brandIcon}"></i>
            </div>
        </div>
        <div class="pin-entry-section">
            <div class="pin-entry-label">
                <i class="bi bi-lock-fill text-success"></i> Enter Your PIN to Confirm Payment
            </div>
            <div style="text-align: center; margin-bottom: 16px; font-weight: 700; font-size: 1.2rem; color: var(--dark-color);">
                ${amount}
            </div>
            <div class="pin-input-group" id="pinInputGroup">
                <input type="password" maxlength="1" inputmode="numeric" pattern="[0-9]" class="pin-digit" data-index="0">
                <input type="password" maxlength="1" inputmode="numeric" pattern="[0-9]" class="pin-digit" data-index="1">
                <input type="password" maxlength="1" inputmode="numeric" pattern="[0-9]" class="pin-digit" data-index="2">
                <input type="password" maxlength="1" inputmode="numeric" pattern="[0-9]" class="pin-digit" data-index="3">
            </div>
            <button class="btn-confirm-payment" id="confirmPinPaymentBtn" disabled>
                <i class="bi bi-shield-check"></i> Confirm Payment
            </button>
            <div class="secure-badge">
                <i class="bi bi-shield-lock-fill text-success"></i>
                <span>Secured by SSL Encryption • Your data is safe</span>
            </div>
        </div>
    `;

    const paymentModal = new bootstrap.Modal(document.getElementById('paymentCardModal'));
    paymentModal.show();

    const pinInputs = document.querySelectorAll('.pin-digit');
    const confirmBtn = document.getElementById('confirmPinPaymentBtn');
    
    pinInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            this.classList.add('filled');
            if (this.value && index < pinInputs.length - 1) {
                pinInputs[index + 1].focus();
            }
            checkPinComplete();
        });
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !this.value && index > 0) {
                pinInputs[index - 1].classList.remove('filled');
                pinInputs[index - 1].focus();
            }
        });
        
        input.addEventListener('focus', function() {
            this.select();
        });
    });

    function checkPinComplete() {
        const isComplete = Array.from(pinInputs).every(input => input.value.length === 1);
        if (confirmBtn) confirmBtn.disabled = !isComplete;
    }

    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            const pin = Array.from(pinInputs).map(i => i.value).join('');
            if (pin.length === 4) {
                paymentModal.hide();
                showPaymentSuccess(amount, methodName);
            }
        });
    }
}

function showPaymentSuccess(amount, methodName) {
    const overlay = document.createElement('div');
    overlay.className = 'payment-success-overlay';
    overlay.innerHTML = `
        <div class="payment-success-card">
            <div class="success-checkmark">
                <i class="bi bi-check-lg"></i>
            </div>
            <h4 class="fw-bold mb-2">Payment Successful!</h4>
            <p class="text-muted mb-3">${amount} paid via ${methodName}</p>
            <div class="bg-light rounded-3 p-3 mb-3 text-start">
                <small class="text-muted">Transaction ID: CSMS-${Date.now().toString(36).toUpperCase()}</small><br>
                <small class="text-muted">Date: ${new Date().toLocaleString()}</small>
            </div>
            <button class="btn btn-primary rounded-pill px-4" onclick="this.closest('.payment-success-overlay').remove()">
                <i class="bi bi-check-circle me-2"></i> Done
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) overlay.remove();
    });
    
    // Update bookings status for unpaid bookings
    setTimeout(() => {
        bookings.forEach(b => { 
            if (b.status === 'unpaid') { 
                b.status = 'delivered'; 
            } 
        });
        // Refresh payments panel if visible
        if (document.getElementById('outstandingList')) {
            loadOutstandingPayments();
        }
    }, 500);
}

// ----------------------------- QUOTE PDF VIEWER -----------------------------

function openQuoteViewer(quoteData) {
    const statusBadge = quoteData.status === 'approved' 
        ? '<span class="badge bg-success">Approved</span>' 
        : '<span class="badge bg-warning text-dark">Pending</span>';

    const labelEl = document.getElementById('quotePdfModalLabel');
    if (labelEl) labelEl.innerHTML = `<i class="bi bi-file-pdf-fill me-2"></i>Quote #${quoteData.id}`;
    
    const itemsHtml = quoteData.items.map(item => `
        <tr>
            <td>${escapeHtml(item.description)}</td>
            <td>${item.quantity}</td>
            <td>${item.rate}</td>
            <td class="text-end fw-semibold">${item.amount}</td>
        </tr>
    `).join('');

    const bodyEl = document.getElementById('quotePdfModalBody');
    if (!bodyEl) return;

    bodyEl.innerHTML = `
        <div class="quote-document" id="quoteDocumentContent">
            <div class="quote-doc-header">
                <div class="quote-doc-company">
                    <h3>CSMS</h3>
                    <p>Cleaning Service Management System</p>
                    <p>Stone Town, Zanzibar</p>
                    <p>info@csms.co.tz | +255 777 123 456</p>
                </div>
                <div class="quote-doc-number">
                    <div class="doc-label">Quote Number</div>
                    <div class="doc-value">#${escapeHtml(quoteData.id)}</div>
                    <div style="margin-top: 8px;">${statusBadge}</div>
                </div>
            </div>
            
            <div class="quote-doc-section">
                <h5><i class="bi bi-person-circle me-2"></i>Client Information</h5>
                <p><strong>Name:</strong> John Doe</p>
                <p><strong>Email:</strong> john.doe@example.com</p>
                <p><strong>Service:</strong> ${escapeHtml(quoteData.service)}</p>
            </div>
            
            <div class="quote-doc-section">
                <h5><i class="bi bi-calendar3 me-2"></i>Quote Details</h5>
                <p><strong>Date Issued:</strong> ${escapeHtml(quoteData.date)}</p>
                <p><strong>Valid Until:</strong> ${escapeHtml(quoteData.validUntil)}</p>
            </div>
            
            <div class="quote-doc-section">
                <h5><i class="bi bi-list-check me-2"></i>Service Breakdown</h5>
                <table class="quote-doc-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Qty</th>
                            <th>Rate</th>
                            <th class="text-end">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                <div class="quote-doc-total">
                    Total: ${quoteData.total}
                </div>
            </div>
            
            <div class="quote-doc-footer">
                <p><strong>Notes:</strong> ${escapeHtml(quoteData.notes)}</p>
                <p class="mt-3"><strong>Terms:</strong> This quote is valid until the date specified above. Payment is due upon service completion. Cancellation within 24 hours may incur a 25% fee.</p>
                <p class="mt-3 text-center text-muted">Thank you for choosing CSMS - Zanzibar's Premier Cleaning Service</p>
            </div>
        </div>
    `;

    const quoteModal = new bootstrap.Modal(document.getElementById('quotePdfModal'));
    quoteModal.show();

    // Add action buttons
    const actionsDiv = document.createElement('div');
    actionsDiv.innerHTML = `
        <div class="quote-actions-bar">
            <button class="btn-quote-action btn-quote-download" id="downloadQuoteBtn">
                <i class="bi bi-download"></i> Download Quote
            </button>
            <button class="btn-quote-action btn-quote-share" id="shareQuoteBtn">
                <i class="bi bi-share"></i> Share Quote
            </button>
            ${quoteData.status === 'pending' ? `
            <button class="btn-quote-action btn-quote-approve" id="approveQuoteBtn">
                <i class="bi bi-check-circle"></i> Approve Quote
            </button>
            ` : ''}
        </div>
    `;
    bodyEl.appendChild(actionsDiv);

    // Download functionality
    document.getElementById('downloadQuoteBtn')?.addEventListener('click', function() {
        const quoteContent = document.getElementById('quoteDocumentContent');
        if (!quoteContent) return;
        
        const content = quoteContent.innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Quote #${quoteData.id} - CSMS</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; }
                        @media print { body { padding: 20px; } }
                    </style>
                </head>
                <body>${content}</body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
        showNotification('Quote sent to printer!', 'success');
    });

    // Share functionality
    document.getElementById('shareQuoteBtn')?.addEventListener('click', function() {
        const shareBodyHtml = `
            <div class="text-center">
                <p class="mb-3">Share Quote #${escapeHtml(quoteData.id)}</p>
                <div class="share-options">
                    <button class="share-option whatsapp" title="Share via WhatsApp" onclick="window.open('https://wa.me/?text=Quote%20%23${quoteData.id}%20from%20CSMS')">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="share-option email" title="Share via Email" onclick="window.location.href='mailto:?subject=Quote%20%23${quoteData.id}%20-%20CSMS&body=Please%20find%20attached%20quote%20%23${quoteData.id}%20for%20${encodeURIComponent(quoteData.service)}'">
                        <i class="fas fa-envelope"></i>
                    </button>
                    <button class="share-option sms" title="Share via SMS">
                        <i class="fas fa-sms"></i>
                    </button>
                    <button class="share-option copy" title="Copy Link" id="copyQuoteLinkBtn">
                        <i class="fas fa-link"></i>
                    </button>
                </div>
            </div>
        `;
        const shareModal = openGlobalModal(
            '<i class="bi bi-share-fill me-2"></i>Share Quote',
            shareBodyHtml,
            '<button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Close</button>'
        );
        
        document.getElementById('copyQuoteLinkBtn')?.addEventListener('click', function() {
            navigator.clipboard.writeText(`https://csms.co.tz/quotes/${quoteData.id}`).then(() => {
                showNotification('Quote link copied to clipboard!', 'success');
                if (shareModal) shareModal.hide();
            });
        });
    });

    // Approve functionality
    document.getElementById('approveQuoteBtn')?.addEventListener('click', function() {
        quoteData.status = 'approved';
        quoteModal.hide();
        showNotification('Quote #' + quoteData.id + ' approved successfully!', 'success');
        setTimeout(() => renderPanel('quotes'), 500);
    });
}

// ----------------------------- MODAL HANDLERS -----------------------------

function openStaffModal(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const staff = staffMembers[booking.staffId];
    if (!staff) return;

    const hasRated = !!submittedReviews[bookingId];
    const isDelivered = booking.status === 'delivered';

    let actionHtml = '';
    if (!isDelivered) {
        actionHtml = `<div class="staff-modal-actions"><span style="font-size:0.82rem;color:#94a3b8;"><i class="bi bi-info-circle me-1"></i>Rating available for completed services only</span></div>`;
    } else if (hasRated) {
        actionHtml = `<div class="staff-modal-actions"><span class="rated-label"><i class="bi bi-patch-check-fill"></i> You have already rated this service</span></div>`;
    } else {
        actionHtml = `<div class="staff-modal-actions"><button class="btn-rate-service" id="openRatingModalBtn" data-booking-id="${bookingId}"><i class="bi bi-star-half"></i> Rate This Service</button></div>`;
    }

    const modalBody = document.getElementById('staffModalBody');
    if (!modalBody) return;

    modalBody.innerHTML = `
        <div class="staff-profile-banner">
            <div class="staff-avatar-wrap">
                <div class="staff-avatar-placeholder">${escapeHtml(staff.initials)}</div>
                <span class="staff-online-dot"></span>
            </div>
            <div class="staff-name">${escapeHtml(staff.name)}</div>
            <div class="staff-role">${escapeHtml(staff.role)}</div>
        </div>
        <div class="staff-details-body">
            <div class="staff-info-card">
                <div class="staff-info-row"><div class="staff-info-icon icon-blue"><i class="bi bi-telephone-fill"></i></div><div><span class="staff-info-label">Phone</span><span class="staff-info-value">${escapeHtml(staff.phone)}</span></div></div>
                <div class="staff-info-row"><div class="staff-info-icon icon-green"><i class="bi bi-briefcase-fill"></i></div><div><span class="staff-info-label">Experience</span><span class="staff-info-value">${escapeHtml(staff.experience)}</span></div></div>
                <div class="staff-info-row"><div class="staff-info-icon icon-purple"><i class="bi bi-award-fill"></i></div><div><span class="staff-info-label">Specialization</span><span class="staff-info-value">${escapeHtml(staff.specialization)}</span></div></div>
                <div class="staff-info-row"><div class="staff-info-icon icon-orange"><i class="bi bi-calendar3"></i></div><div><span class="staff-info-label">Service Date</span><span class="staff-info-value">${escapeHtml(booking.date)}</span></div></div>
            </div>
            <div class="staff-rating-section">
                <div class="staff-rating-title"><i class="bi bi-bar-chart-fill text-warning"></i> Staff Rating & Reviews</div>
                <div class="d-flex gap-4 align-items-center mb-14" style="margin-bottom:14px;">
                    <div><div class="rating-big-score">${staff.rating.toFixed(1)}</div><div class="rating-stars-display">${renderStarDisplay(staff.rating)}</div><div class="rating-total-reviews">${staff.totalReviews} reviews</div></div>
                    <div style="flex:1;">${renderRatingBars(staff)}</div>
                </div>
            </div>
        </div>
        ${actionHtml}
    `;

    const labelEl = document.getElementById('staffModalLabel');
    if (labelEl) labelEl.innerHTML = `<i class="bi bi-person-badge me-2"></i>${escapeHtml(booking.service)}`;

    const staffModalEl = document.getElementById('staffModal');
    if (!staffModalEl) return;
    
    const staffModal = new bootstrap.Modal(staffModalEl);
    staffModal.show();

    const rateBtn = document.getElementById('openRatingModalBtn');
    if (rateBtn) {
        rateBtn.addEventListener('click', () => {
            staffModal.hide();
            staffModalEl.addEventListener('hidden.bs.modal', function onHide() {
                staffModalEl.removeEventListener('hidden.bs.modal', onHide);
                openRatingModal(bookingId);
            });
        });
    }
}

function openRatingModal(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const questions = [
        { key: 'q1', icon: 'bi-check2-circle', label: 'Was the service completed to your satisfaction?' },
        { key: 'q2', icon: 'bi-clock-history',  label: 'Was the staff punctual and professional?' },
        { key: 'q3', icon: 'bi-house-heart',    label: 'How clean and tidy was the result?' }
    ];

    const questionsHtml = questions.map((q, idx) => `
        <div class="rating-question-block">
            <div class="rating-question-label"><i class="bi ${q.icon} text-primary"></i> Q${idx + 1}. ${q.label}</div>
            <div class="star-group" data-question="${q.key}">
                ${[1, 2, 3, 4, 5].map(val => `<i class="bi bi-star" data-val="${val}"></i>`).join('')}
            </div>
        </div>
    `).join('');

    const labelEl = document.getElementById('ratingModalLabel');
    if (labelEl) labelEl.innerHTML = `<i class="bi bi-star-half me-2"></i>Rate Your Service`;
    
    const bodyEl = document.getElementById('ratingModalBody');
    if (!bodyEl) return;
    
    bodyEl.innerHTML = `
        <div style="margin-bottom:6px;">
            <div style="font-size:0.82rem;color:#64748b;margin-bottom:18px;">
                <i class="bi bi-info-circle me-1"></i>
                Rating for: <strong>${escapeHtml(booking.service)}</strong> · 
                <span style="color:#94a3b8;">${escapeHtml(booking.date)}</span>
            </div>
            ${questionsHtml}
            <div class="rating-question-block">
                <div class="rating-comment-label"><i class="bi bi-chat-left-text text-primary"></i> Your Review (optional)</div>
                <textarea class="rating-comment-textarea" id="reviewComment" rows="3" placeholder="Share your experience — what went well? Any suggestions?"></textarea>
            </div>
            <button class="btn-submit-rating" id="submitRatingBtn" data-booking-id="${bookingId}">
                <i class="bi bi-send-fill me-2"></i> Submit Rating
            </button>
        </div>
    `;

    const ratingModalEl = document.getElementById('ratingModal');
    if (!ratingModalEl) return;
    
    const ratingModal = new bootstrap.Modal(ratingModalEl);
    ratingModal.show();

    const ratings = {};

    ratingModalEl.querySelectorAll('.star-group').forEach(group => {
        const questionKey = group.dataset.question;
        ratings[questionKey] = 0;
        const stars = group.querySelectorAll('i');

        const updateStars = (selectedValue) => {
            stars.forEach((star, idx) => {
                star.classList.remove('bi-star', 'bi-star-fill', 'hovered', 'selected');
                if (idx < selectedValue) {
                    star.classList.add('bi-star-fill', 'selected');
                } else {
                    star.classList.add('bi-star');
                }
            });
        };

        stars.forEach(star => {
            star.addEventListener('mouseenter', function() {
                const val = parseInt(this.dataset.val);
                stars.forEach((s, idx) => {
                    s.classList.remove('bi-star', 'bi-star-fill', 'hovered', 'selected');
                    if (idx < val) { s.classList.add('bi-star-fill', 'hovered'); } else { s.classList.add('bi-star'); }
                });
            });
            star.addEventListener('mouseleave', function() { updateStars(ratings[questionKey]); });
            star.addEventListener('click', function() {
                const val = parseInt(this.dataset.val);
                ratings[questionKey] = val;
                updateStars(val);
            });
        });
    });

    const submitBtn = document.getElementById('submitRatingBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            const missing = ['q1', 'q2', 'q3'].filter(k => !ratings[k] || ratings[k] === 0);
            if (missing.length > 0) {
                showNotification('Please answer all 3 rating questions before submitting.', 'warning');
                return;
            }
            const comment = document.getElementById('reviewComment')?.value.trim() || '';
            const avgRating = (ratings.q1 + ratings.q2 + ratings.q3) / 3;
            submittedReviews[bookingId] = { bookingId, ratings, comment, avgRating: avgRating.toFixed(1), submittedAt: new Date().toLocaleString() };
            const staff = staffMembers[booking.staffId];
            if (staff) {
                const newTotal = staff.totalReviews + 1;
                const newRating = ((staff.rating * staff.totalReviews) + avgRating) / newTotal;
                staff.rating = Math.round(newRating * 10) / 10;
                staff.totalReviews = newTotal;
                const starKey = Math.round(avgRating);
                if (staff.ratingBreakdown[starKey] !== undefined) { staff.ratingBreakdown[starKey]++; }
            }
            ratingModal.hide();
            showNotification(`Thank you! Your ${avgRating.toFixed(1)}-star rating has been submitted.`, 'success');
        });
    }
}

// ----------------------------- BOOKINGS RENDERING -----------------------------

function loadBookings(type) {
    const bookingListEl = document.getElementById('bookingList');
    if (!bookingListEl) return;

    const filteredBookings = bookings.filter(b => b.status === type);

    if (filteredBookings.length === 0) {
        bookingListEl.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-inbox"></i>
                <h5 class="fw-semibold">No ${type} jobs found</h5>
                <p class="text-muted">You're all caught up — nothing here for now.</p>
                <button class="btn btn-outline-primary mt-3 rounded-pill px-4 explore-services-btn">
                    <i class="bi bi-plus-circle"></i> Book New Service
                </button>
            </div>
        `;
        return;
    }

    let html = '<div class="booking-grid">';
    filteredBookings.forEach(booking => {
        const { className: badgeClass, text: badgeText } = getStatusBadge(booking.status);
        const iconName = getServiceIcon(booking.service);
        const hasRated = !!submittedReviews[booking.id];

        const ratedBadge = (booking.status === 'delivered' && hasRated)
            ? `<span class="ms-2" style="font-size:0.72rem;color:#15803d;font-weight:600;"><i class="bi bi-patch-check-fill"></i> Rated</span>`
            : '';

        html += `
            <div class="booking-card clickable" data-booking-id="${booking.id}" title="Click to view staff details">
                <div class="d-flex flex-wrap justify-content-between align-items-start">
                    <div class="d-flex gap-3">
                        <div class="service-icon"><i class="bi ${iconName} fs-4"></i></div>
                        <div>
                            <h5 class="fw-bold mb-2">${escapeHtml(booking.service)}</h5>
                            <div class="d-flex flex-wrap gap-3 mt-1">
                                <span><i class="bi bi-calendar3 me-1 text-secondary"></i> ${booking.date}</span>
                                <span><i class="bi bi-pin-map-fill me-1 text-secondary"></i> ${escapeHtml(booking.address)}</span>
                                <span><i class="bi bi-cash-stack me-1 text-secondary"></i> ${booking.price}</span>
                            </div>
                        </div>
                    </div>
                    <div class="mt-2 mt-sm-0 d-flex align-items-center flex-wrap gap-1">
                        <span class="booking-badge ${badgeClass}">${badgeText.toUpperCase()}</span>
                        ${ratedBadge}
                        ${booking.status === 'unpaid' ? `
                            <button class="btn btn-sm btn-danger ms-2 rounded-pill pay-now-btn">Pay Now</button>
                        ` : ''}
                    </div>
                </div>
                <hr>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted-custom"><i class="bi bi-chat-left-text"></i> Reference: CSMS-${booking.id}</small>
                    ${booking.status === 'delivered' && !hasRated ? `<span style="font-size:0.78rem;color:var(--primary-color);font-weight:600;"><i class="bi bi-star me-1"></i>Tap to rate</span>` : ''}
                </div>
                <span class="click-hint"><i class="bi bi-eye"></i> View staff details</span>
            </div>
        `;
    });
    html += '</div>';
    bookingListEl.innerHTML = html;

    bookingListEl.querySelectorAll('.pay-now-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const unpaidTotal = bookings.filter(b => b.status === 'unpaid').reduce((sum, b) => sum + parseInt(b.price.replace(/[^0-9]/g, '')), 0);
            showPaymentMethods('TZS ' + unpaidTotal.toLocaleString());
        });
    });

    bookingListEl.querySelectorAll('.booking-card.clickable').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.pay-now-btn')) return;
            openStaffModal(parseInt(this.dataset.bookingId));
        });
    });
}

// ----------------------------- LOAD OUTSTANDING PAYMENTS -----------------------------

function loadOutstandingPayments() {
    const outstandingList = document.getElementById('outstandingList');
    if (!outstandingList) return;

    const unpaidBookings = bookings.filter(b => b.status === 'unpaid');
    
    if (unpaidBookings.length === 0) {
        outstandingList.innerHTML = `<div class="empty-state" style="padding: 30px 20px;"><i class="bi bi-emoji-smile fs-1 text-success"></i><h5 class="mt-2">No Outstanding Payments!</h5></div>`;
        return;
    }

    const total = unpaidBookings.reduce((sum, b) => sum + parseInt(b.price.replace(/[^0-9]/g, '')), 0);
    let html = `<div class="payment-card"><div class="d-flex justify-content-between align-items-center"><span class="fw-bold fs-5">Total Due</span><span class="fs-4 fw-bold text-danger">TZS ${total.toLocaleString()}</span></div><hr>`;
    
    unpaidBookings.forEach(b => {
        html += `<div class="mb-2"><i class="bi bi-clock-history me-2 text-warning"></i> ${escapeHtml(b.service)} - ${b.price}</div>`;
    });
    
    html += `
        <div class="d-flex gap-2 mt-3">
            <button class="btn btn-outline-primary rounded-pill px-4 add-payment-method-btn">
                <i class="bi bi-plus-circle me-2"></i> Add
            </button>
            <button class="btn btn-danger rounded-pill px-4 pay-all-btn">
                <i class="bi bi-credit-card me-2"></i> Pay Now (TZS ${total.toLocaleString()})
            </button>
        </div>
    </div>`;
    
    outstandingList.innerHTML = html;

    outstandingList.querySelector('.pay-all-btn')?.addEventListener('click', () => {
        showPaymentMethods('TZS ' + total.toLocaleString());
    });

    outstandingList.querySelector('.add-payment-method-btn')?.addEventListener('click', () => {
        showAddPaymentMethodForm('TZS ' + total.toLocaleString());
    });
}

// ----------------------------- PANEL RENDERERS -----------------------------

const panelRenderers = {
    bookings: () => `
        <div class="section-header"><h1 class="page-title"><i class="bi bi-journal-bookmark-fill text-primary me-2"></i>My Bookings</h1></div>
        <div class="tabs" id="filterTabs">
            <button class="tab active" data-type="upcoming"><i class="bi bi-calendar-week"></i> Upcoming</button>
            <button class="tab" data-type="delivered"><i class="bi bi-truck"></i> Delivered</button>
            <button class="tab" data-type="cancelled"><i class="bi bi-x-circle"></i> Cancelled</button>
            <button class="tab" data-type="unpaid"><i class="bi bi-exclamation-triangle"></i> Unpaid</button>
        </div>
        <div id="bookingList" class="booking-box"></div>
    `,

    quotes: () => `
        <div class="section-header"><h1 class="page-title"><i class="bi bi-file-text-fill text-primary me-2"></i>My Quotes</h1></div>
        <div class="booking-grid" id="quotesList">
            ${quotesData.map(q => {
                const statusBadge = q.status === 'approved' 
                    ? '<span class="badge bg-success">Approved</span>' 
                    : '<span class="badge bg-warning text-dark">Pending</span>';
                return `
                    <div class="booking-card clickable quote-view-card" data-quote-id="${q.id}" style="cursor: pointer;">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="d-flex gap-3">
                                <div class="service-icon"><i class="bi bi-file-pdf-fill text-danger fs-4"></i></div>
                                <div>
                                    <h5 class="fw-bold mb-2">${escapeHtml(q.service)}</h5>
                                    <div class="d-flex gap-3 flex-wrap">
                                        <span><i class="bi bi-hash me-1 text-secondary"></i> ${q.id}</span>
                                        <span><i class="bi bi-calendar3 me-1 text-secondary"></i> Valid until ${q.validUntil}</span>
                                        <span><i class="bi bi-cash-stack me-1 text-secondary"></i> ${q.total}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                ${statusBadge}
                                <i class="bi bi-eye text-primary ms-2"></i>
                            </div>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted-custom"><i class="bi bi-file-text"></i> ${q.items.length} service items</small>
                            <span class="click-hint"><i class="bi bi-eye"></i> Click to view quote</span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `,

    payments: () => `
        <div class="section-header"><h1 class="page-title"><i class="bi bi-credit-card-2-front text-primary me-2"></i>Payments</h1></div>
        <h5 class="fw-bold mb-3 ms-2" style="color: var(--dark-color);"><i class="bi bi-exclamation-triangle text-danger me-2"></i>Outstanding Balances</h5>
        <div class="booking-grid" id="outstandingList"></div>
        <h5 class="fw-bold mb-3 mt-4 ms-2" style="color: var(--dark-color);"><i class="bi bi-clock-history text-success me-2"></i>Payment History</h5>
        <div class="booking-grid" id="paymentHistoryList"></div>
    `,

    support: () => `
        <div class="section-header"><h1 class="page-title"><i class="bi bi-headset text-primary me-2"></i>Support Center</h1></div>
        <p class="text-muted mb-3 ms-2">Select a support option below to view details.</p>
        <div class="booking-grid" id="supportCards"></div>
    `,

    settings: () => `
        <div class="section-header"><h1 class="page-title"><i class="bi bi-sliders2 text-primary me-2"></i>Settings</h1></div>
        <div class="settings-card">
            <h5 class="fw-bold mb-4">Notification Preferences</h5>
            <div class="form-check form-switch mb-3"><input class="form-check-input" type="checkbox" id="emailNotif" checked><label class="form-check-label fw-medium" for="emailNotif">Email Notifications</label></div>
            <div class="form-check form-switch mb-3"><input class="form-check-input" type="checkbox" id="smsNotif"><label class="form-check-label fw-medium" for="smsNotif">SMS Alerts</label></div>
            <div class="form-check form-switch mb-4"><input class="form-check-input" type="checkbox" id="pushNotif" checked><label class="form-check-label fw-medium" for="pushNotif">Push Notifications</label></div>
            <hr>
            <h5 class="fw-bold mb-3">Language & Region</h5>
            <select class="form-select mb-4" style="max-width: 300px;">
                <option>English (UK)</option>
                <option>Swahili</option>
            </select>
            <button class="btn btn-primary rounded-pill px-4 save-settings-btn">Save Settings</button>
        </div>
    `,

    feedback: () => `
        <div class="section-header"><h1 class="page-title"><i class="bi bi-chat-dots text-primary me-2"></i>Feedback</h1></div>
        <div class="settings-card p-4">
            <div class="text-center mb-4">
                <i class="bi bi-emoji-smile text-warning" style="font-size: 4rem;"></i>
                <h4 class="fw-bold mt-3">We'd Love to Hear From You!</h4>
                <p class="text-muted">Your feedback helps us serve you better and improve our services for all Zanzibar.</p>
            </div>
            <div class="feedback-form">
                <label class="fw-bold mb-3 d-block text-center">How was your overall experience?</label>
                <div class="rating-emoji-group" id="feedbackEmojiGroup">
                    <span class="emoji-option" data-value="1" title="Very Bad">😡</span>
                    <span class="emoji-option" data-value="2" title="Bad">😟</span>
                    <span class="emoji-option" data-value="3" title="Okay">😐</span>
                    <span class="emoji-option" data-value="4" title="Good">😊</span>
                    <span class="emoji-option" data-value="5" title="Excellent">🥰</span>
                </div>
                <label class="fw-bold mb-2 mt-4 d-block">Your Detailed Feedback</label>
                <textarea rows="5" placeholder="Tell us what you loved, what could be better, or any suggestions you have..." id="feedbackText"></textarea>
                <button class="btn btn-primary rounded-pill px-5 py-2 mt-3 d-block mx-auto submit-feedback-btn"><i class="bi bi-send-fill me-2"></i> Submit Feedback</button>
            </div>
        </div>
    `,

    terms: () => `
        <div class="section-header"><h1 class="page-title"><i class="bi bi-file-earmark-text text-primary me-2"></i>Terms & Conditions</h1></div>
        <div class="settings-card text-center p-5">
            <i class="bi bi-check2-circle text-success" style="font-size: 4rem;"></i>
            <h4 class="fw-bold mt-3">Review Our Service Agreement</h4>
            <p class="text-muted">Please take a moment to read our updated Terms & Conditions and Privacy Policy.</p>
            <button class="btn btn-primary rounded-pill px-5 py-2 mt-3" id="openTermsModalBtn">
                <i class="bi bi-file-earmark-text me-2"></i> Read Terms & Conditions
            </button>
        </div>
    `,

    delete: () => `
        <div class="section-header"><h1 class="page-title text-danger"><i class="bi bi-trash3 me-2"></i>Delete My Tracking</h1></div>
        <div class="settings-card text-center p-5 border-top border-danger border-3">
            <div class="mb-4">
                <div style="width: 80px; height: 80px; background: #fee9e6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
                    <i class="bi bi-exclamation-triangle-fill text-danger" style="font-size: 2.5rem;"></i>
                </div>
            </div>
            <h4 class="fw-bold text-danger">Warning: Permanent Action</h4>
            <p class="text-muted mt-3">Deleting your tracking data will permanently erase all your tracking information, booking history, and payment records. This action cannot be undone.</p>
            <button class="btn btn-outline-danger rounded-pill px-5 py-2 mt-3" id="openDeleteModalBtn">
                <i class="bi bi-trash3 me-2"></i> I Understand, Delete My Tracking
            </button>
        </div>
    `,

    logout: () => `
        <div class="section-header"><h1 class="page-title"><i class="bi bi-box-arrow-right text-muted me-2"></i>Logout</h1></div>
        <div class="settings-card text-center p-5">
            <i class="bi bi-person-check" style="font-size: 4rem; color: var(--gray-color);"></i>
            <h4 class="fw-bold mt-3">Ready to Leave?</h4>
            <p class="text-muted">You are currently logged in as <strong id="logoutUserName">John Doe</strong> (<span id="logoutUserEmail">john.doe@example.com</span>).</p>
            <p class="text-muted">Are you sure you want to sign out of your account?</p>
            <button class="btn btn-warning rounded-pill px-5 py-2 mt-3" id="openLogoutModalBtn">
                <i class="bi bi-box-arrow-right me-2"></i> Sign Out
            </button>
        </div>
    `
};

function renderPanel(menuType) {
    const renderer = panelRenderers[menuType];
    if (!renderer) {
        DOM.dynamicPanel.innerHTML = `<div class="empty-state"><i class="bi bi-grid"></i><h4>CSMS Dashboard</h4><p>Select an option from the menu</p></div>`;
        return;
    }

    DOM.dynamicPanel.innerHTML = renderer();
    closeSidebar();

    // Post-render actions
    setTimeout(() => {
        switch(menuType) {
            case 'bookings':
                const tabs = document.querySelectorAll('.tab');
                const activeType = document.querySelector('.tab.active')?.dataset.type || 'upcoming';
                loadBookings(activeType);
                tabs.forEach(tab => {
                    tab.addEventListener('click', function() {
                        tabs.forEach(t => t.classList.remove('active'));
                        this.classList.add('active');
                        loadBookings(this.dataset.type);
                    });
                });
                break;
                
            case 'quotes':
                document.querySelectorAll('.quote-view-card').forEach(card => {
                    card.addEventListener('click', function() {
                        const quoteId = this.dataset.quoteId;
                        const quote = quotesData.find(q => q.id === quoteId);
                        if (quote) openQuoteViewer(quote);
                    });
                });
                break;
                
            case 'payments':
                loadOutstandingPayments();
                const historyList = document.getElementById('paymentHistoryList');
                if (historyList) {
                    historyList.innerHTML = paymentHistory.map(p => `
                        <div class="payment-card">
                            <div class="d-flex justify-content-between align-items-start">
                                <div><h6 class="fw-bold mb-1">${escapeHtml(p.service)}</h6><span class="text-muted small">${p.date} · ${p.method}</span></div>
                                <span class="fw-bold text-success">${p.amount}</span>
                            </div>
                        </div>
                    `).join('');
                }
                break;
                
            case 'support':
                const supportCards = document.getElementById('supportCards');
                if (supportCards) {
                    supportCards.innerHTML = `
                        <div class="support-card" onclick="window.openChatbot ? window.openChatbot() : (window.csmsChatbot && window.csmsChatbot.toggleChatbot())">
                            <div class="d-flex align-items-center gap-3">
                                <div class="service-icon"><i class="bi bi-chat-dots fs-4"></i></div>
                                <div><h5 class="fw-bold mb-1">Live Chat Support</h5><p class="text-muted mb-0 small">Chat with our AI assistant 24/7</p></div>
                                <span class="ms-auto badge bg-primary">Online</span>
                            </div>
                        </div>
                        <div class="support-card" id="callUsCard">
                            <div class="d-flex align-items-center gap-3">
                                <div class="service-icon"><i class="bi bi-telephone fs-4"></i></div>
                                <div><h5 class="fw-bold mb-1">Call Us</h5><p class="text-muted mb-0 small">Speak to our support team</p></div>
                                <span class="ms-auto text-primary" style="font-size:0.8rem;">Click to view <i class="bi bi-chevron-down"></i></span>
                            </div>
                            <div class="mt-3 p-3 bg-light rounded-3" id="callUsDetails" style="display:none;">
                                <h6 class="fw-bold"><i class="bi bi-headset me-2"></i>Customer Support Hours</h6>
                                <p class="mb-1"><strong>General Line:</strong> +255 777 123 456</p>
                                <p class="mb-1"><strong>Emergency (24/7):</strong> +255 800 111 222</p>
                                <p class="mb-1"><strong>WhatsApp:</strong> +255 712 345 678</p>
                                <p class="mb-0 small text-muted">Available Mon-Sat: 8AM - 8PM (EAT)</p>
                            </div>
                        </div>
                        <div class="support-card" id="emailSupportCard">
                            <div class="d-flex align-items-center gap-3">
                                <div class="service-icon"><i class="bi bi-envelope fs-4"></i></div>
                                <div><h5 class="fw-bold mb-1">Email Support</h5><p class="text-muted mb-0 small">Send us an email</p></div>
                                <span class="ms-auto text-primary" style="font-size:0.8rem;">Click to view <i class="bi bi-chevron-down"></i></span>
                            </div>
                            <div class="mt-3 p-3 bg-light rounded-3" id="emailSupportDetails" style="display:none;">
                                <h6 class="fw-bold"><i class="bi bi-envelope-open me-2"></i>Email Contacts</h6>
                                <p class="mb-1"><strong>General:</strong> <a href="mailto:info@csms.co.tz">info@csms.co.tz</a></p>
                                <p class="mb-1"><strong>Billing:</strong> <a href="mailto:billing@csms.co.tz">billing@csms.co.tz</a></p>
                                <p class="mb-0 small text-muted">Response time: Within 2-4 hours</p>
                            </div>
                        </div>
                    `;
                    document.getElementById('callUsCard')?.addEventListener('click', function() {
                        const details = document.getElementById('callUsDetails');
                        if (details) details.style.display = details.style.display === 'none' ? 'block' : 'none';
                    });
                    document.getElementById('emailSupportCard')?.addEventListener('click', function() {
                        const details = document.getElementById('emailSupportDetails');
                        if (details) details.style.display = details.style.display === 'none' ? 'block' : 'none';
                    });
                }
                break;
                
            case 'settings':
                document.querySelector('.save-settings-btn')?.addEventListener('click', () => {
                    showNotification('Settings saved successfully!', 'success');
                });
                break;
                
            case 'feedback':
                let selectedRating = 0;
                document.querySelectorAll('.emoji-option').forEach(emoji => {
                    emoji.addEventListener('click', function() {
                        document.querySelectorAll('.emoji-option').forEach(e => e.classList.remove('selected'));
                        this.classList.add('selected');
                        selectedRating = parseInt(this.dataset.value);
                    });
                });
                document.querySelector('.submit-feedback-btn')?.addEventListener('click', () => {
                    const comment = document.getElementById('feedbackText')?.value.trim() || '';
                    if (selectedRating === 0) {
                        showNotification('Please select an emoji rating first!', 'warning');
                    } else if (!comment) {
                        showNotification('Please write a comment before submitting.', 'warning');
                    } else {
                        showNotification(`Thank you for your ${selectedRating}-star feedback!`, 'success');
                        document.querySelectorAll('.emoji-option').forEach(e => e.classList.remove('selected'));
                        const textarea = document.getElementById('feedbackText');
                        if (textarea) textarea.value = '';
                        selectedRating = 0;
                    }
                });
                break;
                
            case 'terms':
                document.getElementById('openTermsModalBtn')?.addEventListener('click', () => {
                    const bodyHtml = `
                        <div class="terms-scroll">
                            <h5 class="terms-section-title">1. Service Agreement</h5>
                            <p>By engaging CSMS, you agree to these terms designed for a transparent and professional relationship.</p>
                            <h5 class="terms-section-title">2. Cancellation & Rescheduling</h5>
                            <p>Free cancellation up to 24 hours before service. Late cancellations may incur a 25% fee.</p>
                            <h5 class="terms-section-title">3. Quality Guarantee</h5>
                            <p>100% satisfaction guaranteed. Report issues within 12 hours for free re-service.</p>
                            <h5 class="terms-section-title">4. Payment Terms</h5>
                            <p>Payment due upon completion. We accept mobile money, Visa, and Mastercard.</p>
                            <p class="mt-4"><strong>Last Updated:</strong> March 15, 2026</p>
                        </div>
                        <div class="form-check mt-3">
                            <input class="form-check-input" type="checkbox" id="agreeTermsCheck">
                            <label class="form-check-label fw-medium" for="agreeTermsCheck">I agree to the Terms & Conditions.</label>
                        </div>
                    `;
                    const modal = openGlobalModal('<i class="bi bi-file-earmark-text me-2"></i>Terms & Conditions', bodyHtml,
                        `<button class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Back</button>
                         <button class="btn btn-primary rounded-pill px-4" id="confirmAgreeBtn" disabled>I Agree</button>`);
                    const checkbox = document.getElementById('agreeTermsCheck');
                    const agreeBtn = document.getElementById('confirmAgreeBtn');
                    if (checkbox && agreeBtn) {
                        checkbox.addEventListener('change', () => { agreeBtn.disabled = !checkbox.checked; });
                        agreeBtn.addEventListener('click', () => {
                            if (modal) modal.hide();
                            showNotification('✅ Thank you! You have agreed to the Terms.', 'success');
                        });
                    }
                });
                break;
                
            case 'delete':
                document.getElementById('openDeleteModalBtn')?.addEventListener('click', () => {
                    const modal = openGlobalModal(
                        '<i class="bi bi-exclamation-triangle-fill text-danger me-2"></i>Confirm Deletion',
                        `<div class="text-center">
                            <i class="bi bi-shield-exclamation text-danger" style="font-size: 3rem;"></i>
                            <h5 class="fw-bold mt-3">Delete Your Tracking Data?</h5>
                            <p class="text-muted">This permanently deletes all tracking information.</p>
                            <div class="form-check text-start">
                                <input class="form-check-input" type="checkbox" id="confirmDeleteCheck">
                                <label class="form-check-label" for="confirmDeleteCheck">I understand and want to permanently delete my tracking data.</label>
                            </div>
                        </div>`,
                        `<button class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                         <button class="btn btn-danger rounded-pill px-4" id="finalDeleteBtn" disabled>Delete My Tracking</button>`
                    );
                    const checkbox = document.getElementById('confirmDeleteCheck');
                    const deleteBtn = document.getElementById('finalDeleteBtn');
                    if (checkbox && deleteBtn) {
                        checkbox.addEventListener('change', () => { deleteBtn.disabled = !checkbox.checked; });
                        deleteBtn.addEventListener('click', () => {
                            if (modal) modal.hide();
                            showNotification('Your tracking data has been deleted.', 'warning');
                        });
                    }
                });
                break;
                
            case 'logout':
                const userData = JSON.parse(sessionStorage.getItem('csms_user') || '{"name":"John Doe","email":"john.doe@example.com"}');
                const logoutNameEl = document.getElementById('logoutUserName');
                const logoutEmailEl = document.getElementById('logoutUserEmail');
                if (logoutNameEl) logoutNameEl.textContent = userData.name;
                if (logoutEmailEl) logoutEmailEl.textContent = userData.email;
                
                document.getElementById('openLogoutModalBtn')?.addEventListener('click', () => {
                    const modal = openGlobalModal(
                        '<i class="bi bi-box-arrow-right me-2"></i>Confirm Logout',
                        `<div class="text-center">
                            <i class="bi bi-box-arrow-right text-warning" style="font-size: 3rem;"></i>
                            <h5 class="fw-bold mt-3">Sign Out of CSMS?</h5>
                            <p class="text-muted">You are logged in as <strong>${userData.name}</strong>.</p>
                        </div>`,
                        `<button class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                         <button class="btn btn-warning rounded-pill px-4" id="confirmLogoutBtn">Sign Out</button>`
                    );
                    document.getElementById('confirmLogoutBtn')?.addEventListener('click', () => {
                        if (modal) modal.hide();
                        logoutUser();
                        showNotification('You have been logged out.', 'success');
                    });
                });
                break;
        }
    }, 100);
}

// ----------------------------- NOTIFICATIONS PANEL -----------------------------

function showNotificationsPanel() {
    let bodyHtml = notifications.map(n => `
        <div class="notification-item">
            <div class="notification-icon" style="background: ${n.bgColor}; color: ${n.iconColor};">
                <i class="bi ${n.icon}"></i>
            </div>
            <div class="notification-content">
                <h5>${escapeHtml(n.title)}</h5>
                <p>${escapeHtml(n.message)}</p>
                <span class="notification-time"><i class="bi bi-clock"></i> ${escapeHtml(n.time)}</span>
            </div>
        </div>
    `).join('');
    
    if (notifications.length === 0) bodyHtml = '<p class="text-center text-muted">No notifications yet.</p>';
    openGlobalModal('<i class="bi bi-bell me-2"></i>All Notifications', bodyHtml);
    
    const badge = document.getElementById('notificationBadge');
    if (badge) badge.style.display = 'none';
}

// ----------------------------- DASHBOARD INITIALIZATION -----------------------------

function initDashboard() {
    if (!DOM.menuItems || DOM.menuItems.length === 0) return;
    
    DOM.menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const menuType = this.dataset.menu;
            DOM.menuItems.forEach(li => li.classList.remove('active'));
            this.classList.add('active');
            renderPanel(menuType);
        });
    });

    DOM.hamburger?.addEventListener('click', e => { e.stopPropagation(); openSidebar(); });
    DOM.sidebarClose?.addEventListener('click', closeSidebar);
    DOM.overlay?.addEventListener('click', closeSidebar);
    window.addEventListener('resize', () => { if (window.innerWidth > 992) closeSidebar(); });

    DOM.notificationIcon?.addEventListener('click', showNotificationsPanel);

    const newsletterForm = document.querySelector('.footer .newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', e => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            if (emailInput?.value && validateEmail(emailInput.value)) {
                showNotification('Thank you for subscribing!', 'success');
                emailInput.value = '';
            } else {
                showNotification('Please enter a valid email address', 'danger');
            }
        });
    }

    // Load default panel
    renderPanel('bookings');
    const bookingsMenuItem = document.querySelector('.menu li[data-menu="bookings"]');
    if (bookingsMenuItem && DOM.menuItems) {
        DOM.menuItems.forEach(li => li.classList.remove('active'));
        bookingsMenuItem.classList.add('active');
    }
}

// ----------------------------- INITIALIZATION -----------------------------

function init() {
    // Check if user is logged in
    const isLoggedIn = sessionStorage.getItem('csms_loggedIn') === 'true';
    
    if (isLoggedIn) {
        initDashboard();
    }
    
    // Add demo login buttons to overlay if present
    const overlay = document.getElementById('loginRequiredOverlay');
    if (overlay && !isLoggedIn) {
        // The overlay already has login/register links in HTML
        // We can add a quick demo login button
        const card = overlay.querySelector('.login-required-card');
        if (card) {
            const demoBtn = document.createElement('button');
            demoBtn.className = 'btn-login-required primary mt-3';
            demoBtn.style.cssText = 'width: 100%; justify-content: center; cursor: pointer;';
            demoBtn.innerHTML = '<i class="bi bi-person-check"></i> Demo Login (Auto)';
            demoBtn.addEventListener('click', () => {
                simulateLogin('John Doe', 'john.doe@example.com');
                initDashboard();
            });
            card.querySelector('.login-required-actions').appendChild(demoBtn);
        }
    }
}

// ----------------------------- GLOBAL EXPORTS -----------------------------
window.showNotification = showNotification;
window.closeSidebar = closeSidebar;
window.openSidebar = openSidebar;
window.openStaffModal = openStaffModal;
window.openRatingModal = openRatingModal;
window.openGlobalModal = openGlobalModal;
window.showPaymentMethods = showPaymentMethods;
window.simulateLogin = simulateLogin;
window.logoutUser = logoutUser;

document.addEventListener('DOMContentLoaded', init);