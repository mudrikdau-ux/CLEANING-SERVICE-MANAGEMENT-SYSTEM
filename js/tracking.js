// ============================================================================
// CleanSpark TRACKING DASHBOARD - ENHANCED & PROFESSIONAL JAVASCRIPT
// ============================================================================

// ----------------------------- AUTHENTICATION CHECK -----------------------------

(function checkAuth() {
    let isLoggedIn = sessionStorage.getItem('cleanspark_loggedIn') === 'true';
    
    if (!isLoggedIn) {
        const user = sessionStorage.getItem('cleanspark_user');
        if (user) {
            try {
                JSON.parse(user);
                sessionStorage.setItem('cleanspark_loggedIn', 'true');
                isLoggedIn = true;
            } catch(e) {
                console.error('Invalid user session data');
            }
        }
    }
    
    if (!isLoggedIn) {
        const demoUser = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+255 777 123 456'
        };
        sessionStorage.setItem('cleanspark_loggedIn', 'true');
        sessionStorage.setItem('cleanspark_user', JSON.stringify(demoUser));
        isLoggedIn = true;
        console.log('Demo auto-login activated - Remove this in production!');
    }
    
    const overlay = document.getElementById('loginRequiredOverlay');
    const dashboard = document.getElementById('dashboardWrapper');
    
    if (isLoggedIn) {
        if (overlay) overlay.style.display = 'none';
        if (dashboard) dashboard.style.display = 'flex';
        
        const user = sessionStorage.getItem('cleanspark_user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                updateUserProfile(userData);
            } catch(e) {
                console.error('Error parsing user data:', e);
            }
        }
    } else {
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

function simulateLogin(name, email) {
    const userData = { name, email };
    sessionStorage.setItem('cleanspark_loggedIn', 'true');
    sessionStorage.setItem('cleanspark_user', JSON.stringify(userData));
    
    const overlay = document.getElementById('loginRequiredOverlay');
    const dashboard = document.getElementById('dashboardWrapper');
    if (overlay) overlay.style.display = 'none';
    if (dashboard) dashboard.style.display = 'flex';
    
    updateUserProfile(userData);
    showNotification('Welcome back, ' + name + '!', 'success');
    
    if (document.getElementById('dynamicPanel').children.length === 0) {
        initDashboard();
    }
}

function logoutUser() {
    sessionStorage.removeItem('cleanspark_loggedIn');
    sessionStorage.removeItem('cleanspark_user');
    sessionStorage.removeItem('cleanspark_payment_methods');
    sessionStorage.removeItem('cleanspark_terms_agreed');
    userPaymentMethods = [];
    
    const overlay = document.getElementById('loginRequiredOverlay');
    const dashboard = document.getElementById('dashboardWrapper');
    if (overlay) overlay.style.display = 'flex';
    if (dashboard) dashboard.style.display = 'none';
    
    const dynamicPanel = document.getElementById('dynamicPanel');
    if (dynamicPanel) dynamicPanel.innerHTML = '';
}

// ----------------------------- CONFIGURATION & DATA -----------------------------

const bookings = [
    { id: 101, status: "upcoming",  service: "Premium Home Deep Cleaning",         date: "2026-04-05", price: "TZS 212,000", address: "Stone Town, Unguja",       staffId: 1 },
    { id: 102, status: "upcoming",  service: "AC Maintenance & Filter Replacement", date: "2026-04-12", price: "TZS 285,000", address: "Mbweni Residence",          staffId: 2 },
    { id: 103, status: "delivered", service: "Office Carpet Steam Cleaning",        date: "2026-03-18", price: "TZS 499,000", address: "Vikokotoni Business Hub",    staffId: 3 },
    { id: 104, status: "delivered", service: "Kitchen Sanitization Service",        date: "2026-03-02", price: "TZS 178,000", address: "Shangani District",          staffId: 4 },
    { id: 105, status: "cancelled", service: "Balcony Pressure Washing",            date: "2026-02-28", price: "TZS 130,000", address: "Kiwengwa Beach Area",        staffId: 1 },
    { id: 106, status: "unpaid",    service: "Full Villa Cleaning (4 Rooms)",       date: "2026-03-22", price: "TZS 808,000", address: "Fumba Town",                 staffId: 5 },
    { id: 107, status: "unpaid",    service: "Upholstery & Mattress Deep Clean",    date: "2026-03-20", price: "TZS 233,000", address: "Michenzani",                 staffId: 2 }
];

const staffMembers = {
    1: { id: 1, name: "Amina Khalid", initials: "AK", role: "Senior Cleaning Technician", phone: "+255 712 345 678", experience: "5 Years", specialization: "Residential Deep Cleaning", rating: 4.8, totalReviews: 134, ratingBreakdown: { 5: 98, 4: 24, 3: 8, 2: 3, 1: 1 } },
    2: { id: 2, name: "Hassan Omar", initials: "HO", role: "HVAC & AC Specialist", phone: "+255 765 987 432", experience: "7 Years", specialization: "AC Maintenance & Upholstery", rating: 4.6, totalReviews: 89, ratingBreakdown: { 5: 61, 4: 18, 3: 6, 2: 3, 1: 1 } },
    3: { id: 3, name: "Fatuma Juma", initials: "FJ", role: "Commercial Cleaning Expert", phone: "+255 744 123 900", experience: "4 Years", specialization: "Office & Carpet Steam Cleaning", rating: 4.9, totalReviews: 217, ratingBreakdown: { 5: 198, 4: 14, 3: 3, 2: 1, 1: 1 } },
    4: { id: 4, name: "Salim Rashid", initials: "SR", role: "Sanitation Specialist", phone: "+255 753 654 321", experience: "3 Years", specialization: "Kitchen & Bathroom Sanitization", rating: 4.5, totalReviews: 62, ratingBreakdown: { 5: 40, 4: 14, 3: 5, 2: 2, 1: 1 } },
    5: { id: 5, name: "Zuwena Ali", initials: "ZA", role: "Villa & Estate Cleaner", phone: "+255 778 222 111", experience: "6 Years", specialization: "Villa & Large Property Cleaning", rating: 4.7, totalReviews: 155, ratingBreakdown: { 5: 120, 4: 25, 3: 7, 2: 2, 1: 1 } }
};

const paymentHistory = [
    { id: 'PAY-001', service: 'Office Carpet Steam Cleaning', amount: 'TZS 499,000', date: '2026-03-18', method: 'Visa •••• 4242', status: 'completed', transactionId: 'TXN-20260318-A1B2C3', reference: 'CSMS-103', paymentDate: '2026-03-18 14:32:00', payerName: 'John Doe', payerEmail: 'john.doe@example.com' },
    { id: 'PAY-002', service: 'Kitchen Sanitization Service', amount: 'TZS 178,000', date: '2026-03-02', method: 'M-Pesa', status: 'completed', transactionId: 'TXN-20260302-D4E5F6', reference: 'CSMS-104', paymentDate: '2026-03-02 10:15:00', payerName: 'John Doe', payerEmail: 'john.doe@example.com' },
    { id: 'PAY-003', service: 'AC Maintenance', amount: 'TZS 285,000', date: '2026-02-15', method: 'Mastercard •••• 8888', status: 'completed', transactionId: 'TXN-20260215-G7H8I9', reference: 'CSMS-108', paymentDate: '2026-02-15 09:00:00', payerName: 'John Doe', payerEmail: 'john.doe@example.com' }
];

const notifications = [
    { id: 1, icon: 'bi-calendar-check', bgColor: '#e8f0fe', iconColor: '#4361ee', title: 'Booking Confirmed', message: 'Your Home Deep Cleaning is scheduled for Apr 5.', time: '2 hours ago' },
    { id: 2, icon: 'bi-star-half', bgColor: '#fff3cd', iconColor: '#f59e0b', title: 'Rate Your Service', message: 'How was your Kitchen Sanitization? Leave a review.', time: '1 day ago' },
    { id: 3, icon: 'bi-credit-card', bgColor: '#f8d7da', iconColor: '#dc3545', title: 'Payment Overdue', message: 'Full Villa Cleaning payment is past due. Pay now to avoid late fees.', time: '3 days ago' },
    { id: 4, icon: 'bi-gift', bgColor: '#d1e7dd', iconColor: '#198754', title: 'Special Offer!', message: 'Get 20% off your next booking with code CLEAN20.', time: '5 days ago' }
];

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

let userPaymentMethods = JSON.parse(sessionStorage.getItem('cleanspark_payment_methods') || '[]');

const submittedReviews = {};

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
        notes: 'Service includes eco-friendly cleaning products. Equipment provided by CleanSpark.'
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

// ----------------------------- SHARE FUNCTIONALITY -----------------------------

function openShareModal(quoteData) {
    const shareUrl = `https://cleanspark.co.tz/quotes/${quoteData.id}`;
    const shareText = `Check out this quote from CleanSpark: ${quoteData.service} - ${quoteData.total}`;
    
    const bodyHtml = `
        <div class="share-preview-card">
            <div class="share-quote-id">Quote #${escapeHtml(quoteData.id)}</div>
            <div class="share-quote-service">${escapeHtml(quoteData.service)}</div>
            <div class="share-quote-total">${quoteData.total}</div>
        </div>
        
        <h6 class="fw-bold mb-3 text-center">Share via</h6>
        <div class="share-options-grid">
            <button class="share-option-btn share-whatsapp" data-share="whatsapp">
                <div class="share-icon-circle"><i class="fab fa-whatsapp"></i></div>
                <span>WhatsApp</span>
            </button>
            <button class="share-option-btn share-facebook" data-share="facebook">
                <div class="share-icon-circle"><i class="fab fa-facebook-f"></i></div>
                <span>Facebook</span>
            </button>
            <button class="share-option-btn share-twitter" data-share="twitter">
                <div class="share-icon-circle"><i class="fab fa-twitter"></i></div>
                <span>Twitter</span>
            </button>
            <button class="share-option-btn share-email" data-share="email">
                <div class="share-icon-circle"><i class="fas fa-envelope"></i></div>
                <span>Email</span>
            </button>
            <button class="share-option-btn share-sms" data-share="sms">
                <div class="share-icon-circle"><i class="fas fa-sms"></i></div>
                <span>SMS</span>
            </button>
            <button class="share-option-btn share-linkedin" data-share="linkedin">
                <div class="share-icon-circle"><i class="fab fa-linkedin-in"></i></div>
                <span>LinkedIn</span>
            </button>
            <button class="share-option-btn share-telegram" data-share="telegram">
                <div class="share-icon-circle"><i class="fab fa-telegram-plane"></i></div>
                <span>Telegram</span>
            </button>
            <button class="share-option-btn share-copy" data-share="copy">
                <div class="share-icon-circle"><i class="fas fa-link"></i></div>
                <span>Copy Link</span>
            </button>
        </div>
        
        <div class="share-link-section">
            <input type="text" class="share-link-input" value="${escapeHtml(shareUrl)}" readonly id="shareLinkInput">
            <button class="share-link-copy-btn" id="copyLinkBtn">
                <i class="bi bi-clipboard me-1"></i> Copy
            </button>
        </div>
    `;
    
    const labelEl = document.getElementById('shareModalLabel');
    if (labelEl) labelEl.innerHTML = `<i class="bi bi-share-fill me-2"></i>Share Quote #${quoteData.id}`;
    
    const bodyEl = document.getElementById('shareModalBody');
    if (bodyEl) bodyEl.innerHTML = bodyHtml;
    
    const shareModal = new bootstrap.Modal(document.getElementById('shareModal'));
    shareModal.show();
    
    // Share button handlers
    document.querySelectorAll('.share-option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const platform = this.dataset.share;
            handleShare(platform, quoteData, shareUrl, shareText);
        });
    });
    
    // Copy link button
    document.getElementById('copyLinkBtn')?.addEventListener('click', function() {
        const linkInput = document.getElementById('shareLinkInput');
        if (linkInput) {
            linkInput.select();
            document.execCommand('copy');
            showNotification('Link copied to clipboard!', 'success');
        }
    });
}

function handleShare(platform, quoteData, shareUrl, shareText) {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    
    switch(platform) {
        case 'whatsapp':
            window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, '_blank');
            break;
        case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
            break;
        case 'twitter':
            window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
            break;
        case 'email':
            window.location.href = `mailto:?subject=Quote%20%23${quoteData.id}%20-%20CleanSpark&body=${encodedText}%0A%0AView%20Quote:%20${encodedUrl}`;
            break;
        case 'sms':
            window.location.href = `sms:?body=${encodedText}%20${encodedUrl}`;
            break;
        case 'linkedin':
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank');
            break;
        case 'telegram':
            window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, '_blank');
            break;
        case 'copy':
            navigator.clipboard.writeText(shareUrl).then(() => {
                showNotification('Link copied to clipboard!', 'success');
            });
            break;
    }
}

// ----------------------------- APPROVE QUOTE FUNCTIONALITY -----------------------------

function openApproveQuoteModal(quoteData) {
    const bodyHtml = `
        <div class="text-center">
            <div class="approve-success-icon">
                <i class="bi bi-check-circle-fill"></i>
            </div>
            <h5 class="fw-bold">Approve Quote #${escapeHtml(quoteData.id)}</h5>
            <p class="text-muted">Please review the quote details before approving.</p>
        </div>
        
        <div class="approve-summary-card">
            <div class="approve-summary-row">
                <span>Service</span>
                <span>${escapeHtml(quoteData.service)}</span>
            </div>
            <div class="approve-summary-row">
                <span>Quote Date</span>
                <span>${escapeHtml(quoteData.date)}</span>
            </div>
            <div class="approve-summary-row">
                <span>Valid Until</span>
                <span>${escapeHtml(quoteData.validUntil)}</span>
            </div>
            <div class="approve-summary-row">
                <span>Number of Items</span>
                <span>${quoteData.items.length} service items</span>
            </div>
            <div class="approve-summary-row" style="font-weight: 700; font-size: 1.1rem;">
                <span>Total Amount</span>
                <span style="color: #059669;">${quoteData.total}</span>
            </div>
        </div>
        
        <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="agreeApproveTerms">
            <label class="form-check-label" for="agreeApproveTerms" style="font-size: 0.85rem;">
                I have reviewed and agree to the terms and conditions of this quote. I understand that approving this quote will create a binding service agreement with CleanSpark.
            </label>
        </div>
        
        <button class="btn-approve-confirm" id="confirmApproveBtn" disabled>
            <i class="bi bi-check-circle-fill me-2"></i> Confirm Approval
        </button>
    `;
    
    const labelEl = document.getElementById('approveQuoteModalLabel');
    if (labelEl) labelEl.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>Approve Quote #${quoteData.id}`;
    
    const bodyEl = document.getElementById('approveQuoteModalBody');
    if (bodyEl) bodyEl.innerHTML = bodyHtml;
    
    const approveModal = new bootstrap.Modal(document.getElementById('approveQuoteModal'));
    approveModal.show();
    
    const checkbox = document.getElementById('agreeApproveTerms');
    const confirmBtn = document.getElementById('confirmApproveBtn');
    
    if (checkbox && confirmBtn) {
        checkbox.addEventListener('change', function() {
            confirmBtn.disabled = !this.checked;
        });
        
        confirmBtn.addEventListener('click', function() {
            quoteData.status = 'approved';
            approveModal.hide();
            
            // Show success overlay
            const overlay = document.createElement('div');
            overlay.className = 'payment-success-overlay';
            overlay.innerHTML = `
                <div class="payment-success-card">
                    <div class="success-checkmark">
                        <i class="bi bi-check-lg"></i>
                    </div>
                    <h4 class="fw-bold mb-2">Quote Approved!</h4>
                    <p class="text-muted mb-3">Quote #${escapeHtml(quoteData.id)} has been approved successfully.</p>
                    <div class="bg-light rounded-3 p-3 mb-3 text-start">
                        <small class="text-muted">Service: ${escapeHtml(quoteData.service)}</small><br>
                        <small class="text-muted">Total: ${quoteData.total}</small><br>
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
            
            showNotification(`Quote #${quoteData.id} approved successfully!`, 'success');
            setTimeout(() => renderPanel('quotes'), 800);
        });
    }
}

// ----------------------------- PAYMENT DETAILS MODAL -----------------------------

function openPaymentDetailsModal(payment) {
    const bodyHtml = `
        <div class="text-center mb-4">
            <span class="payment-status-badge payment-status-${payment.status}">${payment.status.toUpperCase()}</span>
            <h4 class="fw-bold mt-3">${payment.amount}</h4>
            <p class="text-muted">${escapeHtml(payment.service)}</p>
        </div>
        
        <div class="payment-detail-section">
            <h6 class="fw-bold mb-3"><i class="bi bi-info-circle me-2"></i>Payment Information</h6>
            <div class="payment-detail-row">
                <span class="payment-detail-label">Payment ID</span>
                <span class="payment-detail-value">${escapeHtml(payment.id)}</span>
            </div>
            <div class="payment-detail-row">
                <span class="payment-detail-label">Transaction ID</span>
                <span class="payment-detail-value">${escapeHtml(payment.transactionId)}</span>
            </div>
            <div class="payment-detail-row">
                <span class="payment-detail-label">Reference</span>
                <span class="payment-detail-value">${escapeHtml(payment.reference)}</span>
            </div>
            <div class="payment-detail-row">
                <span class="payment-detail-label">Payment Method</span>
                <span class="payment-detail-value">${escapeHtml(payment.method)}</span>
            </div>
            <div class="payment-detail-row">
                <span class="payment-detail-label">Payment Date</span>
                <span class="payment-detail-value">${escapeHtml(payment.paymentDate)}</span>
            </div>
            <div class="payment-detail-row">
                <span class="payment-detail-label">Amount</span>
                <span class="payment-detail-value" style="color: #059669; font-size: 1.1rem;">${payment.amount}</span>
            </div>
        </div>
        
        <div class="payment-detail-section">
            <h6 class="fw-bold mb-3"><i class="bi bi-person me-2"></i>Payer Information</h6>
            <div class="payment-detail-row">
                <span class="payment-detail-label">Name</span>
                <span class="payment-detail-value">${escapeHtml(payment.payerName)}</span>
            </div>
            <div class="payment-detail-row">
                <span class="payment-detail-label">Email</span>
                <span class="payment-detail-value">${escapeHtml(payment.payerEmail)}</span>
            </div>
        </div>
        
        <button class="btn btn-outline-primary rounded-pill w-100" id="downloadReceiptBtn">
            <i class="bi bi-download me-2"></i> Download Receipt
        </button>
    `;
    
    const labelEl = document.getElementById('paymentDetailsModalLabel');
    if (labelEl) labelEl.innerHTML = `<i class="bi bi-receipt me-2"></i>Payment Receipt`;
    
    const bodyEl = document.getElementById('paymentDetailsModalBody');
    if (bodyEl) bodyEl.innerHTML = bodyHtml;
    
    const detailsModal = new bootstrap.Modal(document.getElementById('paymentDetailsModal'));
    detailsModal.show();
    
    document.getElementById('downloadReceiptBtn')?.addEventListener('click', function() {
        const receiptContent = `
            <div style="font-family: 'Inter', sans-serif; padding: 30px;">
                <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #4361ee; padding-bottom: 20px;">
                    <h2 style="color: #4361ee; font-weight: 800;">CleanSpark</h2>
                    <p style="color: #6c757d;">Cleaning Service Management System</p>
                    <p style="color: #6c757d;">Stone Town, Zanzibar | info@cleanspark.co.tz</p>
                </div>
                <h3 style="text-align: center; margin-bottom: 20px;">Payment Receipt</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr><td style="padding: 8px; color: #6c757d; font-weight: 500;">Receipt No:</td><td style="padding: 8px; font-weight: 600;">${payment.id}</td></tr>
                    <tr style="background: #f8fafc;"><td style="padding: 8px; color: #6c757d; font-weight: 500;">Transaction ID:</td><td style="padding: 8px; font-weight: 600;">${payment.transactionId}</td></tr>
                    <tr><td style="padding: 8px; color: #6c757d; font-weight: 500;">Date:</td><td style="padding: 8px; font-weight: 600;">${payment.paymentDate}</td></tr>
                    <tr style="background: #f8fafc;"><td style="padding: 8px; color: #6c757d; font-weight: 500;">Service:</td><td style="padding: 8px; font-weight: 600;">${payment.service}</td></tr>
                    <tr><td style="padding: 8px; color: #6c757d; font-weight: 500;">Method:</td><td style="padding: 8px; font-weight: 600;">${payment.method}</td></tr>
                    <tr style="background: #f8fafc; font-size: 1.2rem;"><td style="padding: 8px; color: #6c757d; font-weight: 700;">Amount:</td><td style="padding: 8px; font-weight: 800; color: #059669;">${payment.amount}</td></tr>
                </table>
                <p style="text-align: center; color: #6c757d; margin-top: 20px;">Thank you for choosing CleanSpark!</p>
                <p style="text-align: center; color: #6c757d; font-size: 0.8rem;">&copy; 2026 CleanSpark - Cleaning Service Management System</p>
            </div>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Receipt ${payment.id} - CleanSpark</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 20px; }
                        @media print { body { padding: 10px; } }
                    </style>
                </head>
                <body>${receiptContent}</body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
        showNotification('Receipt sent to printer!', 'success');
    });
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
            if (card.style.borderColor === 'rgb(187, 247, 208)') return;
            
            card.addEventListener('click', function() {
                const methodId = this.dataset.methodId;
                const methodName = this.dataset.methodName;
                const methodType = this.dataset.methodType;
                
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
        
        document.getElementById('cardNumber')?.addEventListener('input', function(e) {
            let val = this.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formatted = val.match(/.{1,4}/g)?.join(' ') || '';
            this.value = formatted;
        });
        
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
    sessionStorage.setItem('cleanspark_payment_methods', JSON.stringify(userPaymentMethods));
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
                <small class="text-muted">Transaction ID: CleanSpark-${Date.now().toString(36).toUpperCase()}</small><br>
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
    
    setTimeout(() => {
        bookings.forEach(b => { 
            if (b.status === 'unpaid') { 
                b.status = 'delivered'; 
            } 
        });
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
                    <h3>CleanSpark</h3>
                    <p>Cleaning Service Management System</p>
                    <p>Stone Town, Zanzibar</p>
                    <p>info@cleanspark.co.tz | +255 777 123 456</p>
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
                <p class="mt-3 text-center text-muted">Thank you for choosing CleanSpark - Zanzibar's Premier Cleaning Service</p>
            </div>
        </div>
    `;

    const quoteModal = new bootstrap.Modal(document.getElementById('quotePdfModal'));
    quoteModal.show();

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

    // Download functionality with professional layout
    document.getElementById('downloadQuoteBtn')?.addEventListener('click', function() {
        const printContent = `
            <div style="font-family: 'Inter', 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; background: white;">
                <!-- Logo Header -->
                <div style="text-align: center; margin-bottom: 30px; padding-bottom: 25px; border-bottom: 3px solid #4361ee;">
                    <div style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; margin-bottom: 15px;">
                        <span style="font-size: 2rem; font-weight: 800; color: white; letter-spacing: 2px;">✨ CleanSpark</span>
                    </div>
                    <p style="color: #6c757d; margin: 5px 0; font-size: 0.9rem;">Cleaning Service Management System</p>
                    <p style="color: #6c757d; font-size: 0.8rem;">Stone Town, Zanzibar | info@cleanspark.co.tz | +255 777 123 456</p>
                </div>
                
                <!-- Quote Title -->
                <div style="text-align: center; margin: 25px 0;">
                    <h2 style="color: #1e1e2f; font-weight: 800; margin: 0;">PROFESSIONAL QUOTE</h2>
                    <p style="color: #4361ee; font-weight: 600; font-size: 1.1rem; margin-top: 5px;">Quote #${escapeHtml(quoteData.id)}</p>
                </div>
                
                <!-- Status & Info -->
                <div style="display: flex; justify-content: space-between; margin-bottom: 25px; flex-wrap: wrap; gap: 15px;">
                    <div style="flex: 1; min-width: 200px; background: #f8fafc; border-radius: 12px; padding: 20px;">
                        <h4 style="color: #4361ee; font-weight: 700; margin: 0 0 12px 0; font-size: 1rem;">Client Information</h4>
                        <p style="margin: 5px 0; font-size: 0.9rem;"><strong>Name:</strong> John Doe</p>
                        <p style="margin: 5px 0; font-size: 0.9rem;"><strong>Email:</strong> john.doe@example.com</p>
                        <p style="margin: 5px 0; font-size: 0.9rem;"><strong>Service:</strong> ${escapeHtml(quoteData.service)}</p>
                    </div>
                    <div style="flex: 1; min-width: 200px; background: #f8fafc; border-radius: 12px; padding: 20px;">
                        <h4 style="color: #4361ee; font-weight: 700; margin: 0 0 12px 0; font-size: 1rem;">Quote Details</h4>
                        <p style="margin: 5px 0; font-size: 0.9rem;"><strong>Date Issued:</strong> ${escapeHtml(quoteData.date)}</p>
                        <p style="margin: 5px 0; font-size: 0.9rem;"><strong>Valid Until:</strong> ${escapeHtml(quoteData.validUntil)}</p>
                        <p style="margin: 5px 0; font-size: 0.9rem;"><strong>Status:</strong> ${quoteData.status.toUpperCase()}</p>
                    </div>
                </div>
                
                <!-- Items Table -->
                <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
                    <thead>
                        <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                            <th style="padding: 12px 16px; text-align: left; font-size: 0.85rem; font-weight: 600;">Description</th>
                            <th style="padding: 12px 16px; text-align: center; font-size: 0.85rem; font-weight: 600;">Qty</th>
                            <th style="padding: 12px 16px; text-align: right; font-size: 0.85rem; font-weight: 600;">Rate</th>
                            <th style="padding: 12px 16px; text-align: right; font-size: 0.85rem; font-weight: 600;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${quoteData.items.map((item, index) => `
                            <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'}; border-bottom: 1px solid #eef2f8;">
                                <td style="padding: 10px 16px; font-size: 0.9rem;">${escapeHtml(item.description)}</td>
                                <td style="padding: 10px 16px; text-align: center; font-size: 0.9rem;">${item.quantity}</td>
                                <td style="padding: 10px 16px; text-align: right; font-size: 0.9rem;">${item.rate}</td>
                                <td style="padding: 10px 16px; text-align: right; font-weight: 600; font-size: 0.9rem;">${item.amount}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <!-- Total -->
                <div style="text-align: right; margin: 20px 0; padding: 15px 20px; background: #f0f4ff; border-radius: 10px;">
                    <span style="font-size: 1.3rem; font-weight: 800; color: #4361ee;">Total: ${quoteData.total}</span>
                </div>
                
                <!-- Notes & Terms -->
                <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 0.85rem; color: #6c757d;"><strong>Notes:</strong> ${escapeHtml(quoteData.notes)}</p>
                    <p style="font-size: 0.85rem; color: #6c757d;"><strong>Terms:</strong> This quote is valid until the date specified above. Payment is due upon service completion.</p>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
                    <p style="color: #6c757d; font-size: 0.9rem;">Thank you for choosing CleanSpark - Zanzibar's Premier Cleaning Service</p>
                    <p style="color: #94a3b8; font-size: 0.75rem;">&copy; 2026 CleanSpark. All rights reserved. | www.cleanspark.co.tz</p>
                </div>
            </div>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Quote #${quoteData.id} - CleanSpark</title>
                    <style>
                        @media print {
                            body { margin: 0; padding: 20px; }
                            @page { margin: 10mm; }
                        }
                        body { margin: 0; padding: 20px; font-family: 'Inter', 'Segoe UI', sans-serif; }
                    </style>
                </head>
                <body>${printContent}</body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
        showNotification('Quote sent to printer!', 'success');
    });

    // Share functionality
    document.getElementById('shareQuoteBtn')?.addEventListener('click', function() {
        quoteModal.hide();
        openShareModal(quoteData);
    });

    // Approve functionality
    document.getElementById('approveQuoteBtn')?.addEventListener('click', function() {
        quoteModal.hide();
        openApproveQuoteModal(quoteData);
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
                <div class="staff-info-row"><div class="staff-info-icon icon-blue"><i class="bi bi-telephone-fill"></i></div><div><span class="staff-info-label">Phone</span><span class="staff-info-value"><a href="tel:${staff.phone.replace(/\s+/g, '')}" style="color: var(--dark-color); text-decoration: none;">${escapeHtml(staff.phone)}</a></span></div></div>
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
                    <small class="text-muted-custom"><i class="bi bi-chat-left-text"></i> Reference: CleanSpark-${booking.id}</small>
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

    terms: () => {
        const hasAgreed = sessionStorage.getItem('cleanspark_terms_agreed') === 'true';
        return `
            <div class="section-header"><h1 class="page-title"><i class="bi bi-file-earmark-text text-primary me-2"></i>Terms & Conditions</h1></div>
            <div class="settings-card text-center p-5">
                ${hasAgreed ? '<i class="bi bi-check2-circle text-success" style="font-size: 4rem;"></i>' : '<i class="bi bi-file-earmark-text text-primary" style="font-size: 4rem;"></i>'}
                <h4 class="fw-bold mt-3">${hasAgreed ? 'Terms & Conditions Accepted' : 'Review Our Service Agreement'}</h4>
                <p class="text-muted">${hasAgreed ? 'You have already agreed to our Terms & Conditions. You can review them anytime below.' : 'Please take a moment to read our updated Terms & Conditions and Privacy Policy.'}</p>
                <button class="btn btn-primary rounded-pill px-5 py-2 mt-3" id="openTermsModalBtn">
                    <i class="bi bi-file-earmark-text me-2"></i> ${hasAgreed ? 'View Terms & Conditions' : 'Read Terms & Conditions'}
                </button>
                ${hasAgreed ? '<p class="text-success mt-2" style="font-size: 0.8rem;"><i class="bi bi-check-circle-fill me-1"></i> Agreed on ' + (sessionStorage.getItem('cleanspark_terms_agreed_date') || 'N/A') + '</p>' : ''}
            </div>
        `;
    },

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
        DOM.dynamicPanel.innerHTML = `<div class="empty-state"><i class="bi bi-grid"></i><h4>CleanSpark Dashboard</h4><p>Select an option from the menu</p></div>`;
        return;
    }

    DOM.dynamicPanel.innerHTML = renderer();
    closeSidebar();

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
                        <div class="payment-card" style="cursor: pointer;" data-payment-id="${p.id}">
                            <div class="d-flex justify-content-between align-items-start">
                                <div><h6 class="fw-bold mb-1">${escapeHtml(p.service)}</h6><span class="text-muted small">${p.date} · ${p.method}</span></div>
                                <div class="d-flex align-items-center gap-2">
                                    <span class="fw-bold text-success">${p.amount}</span>
                                    <i class="bi bi-chevron-right text-muted"></i>
                                </div>
                            </div>
                        </div>
                    `).join('');
                    
                    // Add click handlers for payment history
                    historyList.querySelectorAll('.payment-card').forEach(card => {
                        card.addEventListener('click', function() {
                            const paymentId = this.dataset.paymentId;
                            const payment = paymentHistory.find(p => p.id === paymentId);
                            if (payment) openPaymentDetailsModal(payment);
                        });
                    });
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
                                <p class="mb-1"><strong>General Line:</strong> <a href="tel:+255777123456" style="color: var(--dark-color);">+255 777 123 456</a></p>
                                <p class="mb-1"><strong>Emergency (24/7):</strong> <a href="tel:+255800111222" style="color: var(--dark-color);">+255 800 111 222</a></p>
                                <p class="mb-1"><strong>WhatsApp:</strong> <a href="https://wa.me/255712345678" target="_blank" style="color: var(--dark-color);">+255 712 345 678</a></p>
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
                                <p class="mb-1"><strong>General:</strong> <a href="mailto:info@cleanspark.co.tz" style="color: var(--dark-color);">info@cleanspark.co.tz</a></p>
                                <p class="mb-1"><strong>Billing:</strong> <a href="mailto:billing@cleanspark.co.tz" style="color: var(--dark-color);">billing@cleanspark.co.tz</a></p>
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
                    const hasAgreed = sessionStorage.getItem('cleanspark_terms_agreed') === 'true';
                    const bodyHtml = `
                        <div class="terms-scroll">
                            <h5 class="terms-section-title">1. Introduction</h5>
                            <p>Welcome to CleanSpark. By accessing or using our cleaning services, you agree to be bound by these Terms and Conditions. Please read them carefully before engaging our services. These terms constitute a legally binding agreement between you ("the Client") and CleanSpark ("the Company," "we," "us," or "our"), registered in Stone Town, Zanzibar.</p>
                            
                            <h5 class="terms-section-title">2. Services Provided</h5>
                            <p>CleanSpark provides professional residential and commercial cleaning services including but not limited to: deep cleaning, carpet cleaning, office cleaning, sanitization services, AC maintenance, upholstery cleaning, and specialized cleaning solutions. All services are performed by trained and vetted professionals in accordance with industry standards.</p>
                            
                            <h5 class="terms-section-title">3. Booking and Scheduling</h5>
                            <p>Clients may book services through our website, mobile application, or by contacting our customer support team. Bookings are confirmed upon receipt of a confirmation notification. We reserve the right to reschedule services due to unforeseen circumstances, and will provide reasonable notice when possible.</p>
                            
                            <h5 class="terms-section-title">4. Cancellation & Rescheduling</h5>
                            <p>Free cancellation is available up to 24 hours before the scheduled service time. Cancellations made less than 24 hours in advance may incur a cancellation fee of 25% of the service cost. Rescheduling is subject to availability and must be requested at least 12 hours before the scheduled service.</p>
                            
                            <h5 class="terms-section-title">5. Pricing and Payment</h5>
                            <p>All prices are quoted in Tanzanian Shillings (TZS) and are inclusive of applicable taxes unless otherwise stated. Payment is due upon completion of services unless alternative arrangements have been made. We accept mobile money payments (M-Pesa, Airtel Money, Tigo Pesa, HaloPesa, Mix by Yas, Azam Pay), Visa, Mastercard, and American Express.</p>
                            
                            <h5 class="terms-section-title">6. Quality Guarantee</h5>
                            <p>CleanSpark is committed to delivering exceptional service. We offer a 100% satisfaction guarantee. If you are not satisfied with the quality of our service, you must report the issue within 12 hours of service completion. We will re-clean the affected areas at no additional cost.</p>
                            
                            <h5 class="terms-section-title">7. Client Responsibilities</h5>
                            <p>Clients are responsible for providing access to the premises at the scheduled time, securing pets, and removing any valuable or fragile items from areas to be cleaned. CleanSpark is not liable for damage to items that were not properly secured by the client.</p>
                            
                            <h5 class="terms-section-title">8. Insurance and Liability</h5>
                            <p>CleanSpark maintains comprehensive liability insurance. In the unlikely event of damage to property caused by our staff during service delivery, clients must report such incidents within 24 hours. Our liability is limited to the cost of the service provided or the repair/replacement value of the damaged item, whichever is lower.</p>
                            
                            <h5 class="terms-section-title">9. Privacy and Data Protection</h5>
                            <p>We collect and process personal information in accordance with applicable data protection laws. Client information is used solely for service delivery, billing, and communication purposes. We do not share personal information with third parties without consent, except as required by law.</p>
                            
                            <h5 class="terms-section-title">10. Staff Conduct</h5>
                            <p>All CleanSpark staff undergo thorough background checks and training. Our team members are professional, courteous, and respectful. Any concerns regarding staff conduct should be reported immediately to our customer support team.</p>
                            
                            <h5 class="terms-section-title">11. Amendments</h5>
                            <p>CleanSpark reserves the right to modify these Terms and Conditions at any time. Clients will be notified of material changes via email or through our platform. Continued use of our services after changes constitute acceptance of the updated terms.</p>
                            
                            <h5 class="terms-section-title">12. Governing Law</h5>
                            <p>These Terms and Conditions are governed by the laws of the United Republic of Tanzania. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Tanzania.</p>
                            
                            <h5 class="terms-section-title">13. Contact Information</h5>
                            <p>For questions or concerns regarding these Terms and Conditions, please contact us at:<br>
                            Email: info@cleanspark.co.tz<br>
                            Phone: +255 777 123 456<br>
                            Address: Stone Town, Zanzibar</p>
                            
                            <p class="mt-4"><strong>Last Updated:</strong> March 15, 2026</p>
                        </div>
                        ${!hasAgreed ? `
                        <div class="form-check mt-3">
                            <input class="form-check-input" type="checkbox" id="agreeTermsCheck">
                            <label class="form-check-label fw-medium" for="agreeTermsCheck">I have read and agree to the Terms & Conditions.</label>
                        </div>
                        ` : ''}
                    `;
                    const footerHtml = !hasAgreed 
                        ? `<button class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                           <button class="btn btn-primary rounded-pill px-4" id="confirmAgreeBtn" disabled>I Agree</button>`
                        : `<button class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Close</button>`;
                    
                    const modal = openGlobalModal('<i class="bi bi-file-earmark-text me-2"></i>Terms & Conditions', bodyHtml, footerHtml);
                    
                    if (!hasAgreed) {
                        const checkbox = document.getElementById('agreeTermsCheck');
                        const agreeBtn = document.getElementById('confirmAgreeBtn');
                        if (checkbox && agreeBtn) {
                            checkbox.addEventListener('change', () => { agreeBtn.disabled = !checkbox.checked; });
                            agreeBtn.addEventListener('click', () => {
                                if (modal) modal.hide();
                                sessionStorage.setItem('cleanspark_terms_agreed', 'true');
                                sessionStorage.setItem('cleanspark_terms_agreed_date', new Date().toLocaleDateString());
                                showNotification('✅ Thank you! You have agreed to the Terms & Conditions.', 'success');
                                setTimeout(() => renderPanel('terms'), 500);
                            });
                        }
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
                const userData = JSON.parse(sessionStorage.getItem('cleanspark_user') || '{"name":"John Doe","email":"john.doe@example.com"}');
                const logoutNameEl = document.getElementById('logoutUserName');
                const logoutEmailEl = document.getElementById('logoutUserEmail');
                if (logoutNameEl) logoutNameEl.textContent = userData.name;
                if (logoutEmailEl) logoutEmailEl.textContent = userData.email;
                
                document.getElementById('openLogoutModalBtn')?.addEventListener('click', () => {
                    const modal = openGlobalModal(
                        '<i class="bi bi-box-arrow-right me-2"></i>Confirm Logout',
                        `<div class="text-center">
                            <i class="bi bi-box-arrow-right text-warning" style="font-size: 3rem;"></i>
                            <h5 class="fw-bold mt-3">Sign Out of CleanSpark?</h5>
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

    renderPanel('bookings');
    const bookingsMenuItem = document.querySelector('.menu li[data-menu="bookings"]');
    if (bookingsMenuItem && DOM.menuItems) {
        DOM.menuItems.forEach(li => li.classList.remove('active'));
        bookingsMenuItem.classList.add('active');
    }
}

// ----------------------------- INITIALIZATION -----------------------------

function init() {
    const isLoggedIn = sessionStorage.getItem('cleanspark_loggedIn') === 'true';
    
    if (isLoggedIn) {
        initDashboard();
    }
    
    const overlay = document.getElementById('loginRequiredOverlay');
    if (overlay && !isLoggedIn) {
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
window.openQuoteViewer = openQuoteViewer;
window.openShareModal = openShareModal;
window.openApproveQuoteModal = openApproveQuoteModal;
window.openPaymentDetailsModal = openPaymentDetailsModal;

document.addEventListener('DOMContentLoaded', init);