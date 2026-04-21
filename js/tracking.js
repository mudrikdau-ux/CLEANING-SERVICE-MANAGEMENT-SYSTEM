// ============================================================================
// CSMS TRACKING DASHBOARD - CLEAN & MODULAR JAVASCRIPT
// ============================================================================

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

// Session storage for submitted reviews
const submittedReviews = {};

// ----------------------------- DOM ELEMENTS -----------------------------

const DOM = {
    sidebar: document.getElementById('mainSidebar'),
    overlay: document.getElementById('mobileOverlay'),
    hamburger: document.getElementById('hamburgerToggle'),
    sidebarClose: document.getElementById('sidebarCloseBtn'),
    dynamicPanel: document.getElementById('dynamicPanel'),
    notificationIcon: document.getElementById('notificationIcon'),
    messageIcon: document.getElementById('messageIcon'),
    menuItems: document.querySelectorAll('.menu li')
};

// ----------------------------- UTILITY FUNCTIONS -----------------------------

/**
 * Escapes HTML special characters to prevent XSS
 */
function escapeHtml(str) {
    if (!str) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
    return str.replace(/[&<>]/g, m => map[m]);
}

/**
 * Validates email format
 */
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Displays a toast notification
 */
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    // Configure based on type
    const config = {
        info:    { icon: 'bi-info-circle-fill', color: '#0d6efd' },
        success: { icon: 'bi-check-circle-fill', color: '#198754' },
        danger:  { icon: 'bi-exclamation-triangle-fill', color: '#dc3545' },
        warning: { icon: 'bi-exclamation-triangle-fill', color: '#ffc107' }
    };
    const { icon, color } = config[type] || config.info;

    // Create and show notification
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
        DOM.sidebar.classList.remove('mobile-open');
        DOM.overlay.classList.remove('active');
    }
}

function openSidebar() {
    if (window.innerWidth <= 992) {
        DOM.sidebar.classList.add('mobile-open');
        DOM.overlay.classList.add('active');
    }
}

// ----------------------------- UI COMPONENT RENDERERS -----------------------------

/**
 * Renders star rating display
 */
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

/**
 * Renders rating breakdown bars for staff modal
 */
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

/**
 * Returns appropriate Bootstrap icon for service type
 */
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

/**
 * Returns badge styling classes based on booking status
 */
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

// ----------------------------- MODAL HANDLERS -----------------------------

/**
 * Opens the Staff Details Modal
 */
function openStaffModal(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const staff = staffMembers[booking.staffId];
    if (!staff) return;

    const hasRated = !!submittedReviews[bookingId];
    const isDelivered = booking.status === 'delivered';

    // Build action button area
    let actionHtml = '';
    if (!isDelivered) {
        actionHtml = `
            <div class="staff-modal-actions">
                <span style="font-size:0.82rem;color:#94a3b8;">
                    <i class="bi bi-info-circle me-1"></i>Rating available for completed services only
                </span>
            </div>
        `;
    } else if (hasRated) {
        actionHtml = `
            <div class="staff-modal-actions">
                <span class="rated-label">
                    <i class="bi bi-patch-check-fill"></i> You have already rated this service
                </span>
            </div>
        `;
    } else {
        actionHtml = `
            <div class="staff-modal-actions">
                <button class="btn-rate-service" id="openRatingModalBtn" data-booking-id="${bookingId}">
                    <i class="bi bi-star-half"></i> Rate This Service
                </button>
            </div>
        `;
    }

    // Build modal body - Phone info moved to white card area
    const modalBody = document.getElementById('staffModalBody');
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
                <div class="staff-info-row">
                    <div class="staff-info-icon icon-blue"><i class="bi bi-telephone-fill"></i></div>
                    <div><span class="staff-info-label">Phone</span><span class="staff-info-value">${escapeHtml(staff.phone)}</span></div>
                </div>
                <div class="staff-info-row">
                    <div class="staff-info-icon icon-green"><i class="bi bi-briefcase-fill"></i></div>
                    <div><span class="staff-info-label">Experience</span><span class="staff-info-value">${escapeHtml(staff.experience)}</span></div>
                </div>
                <div class="staff-info-row">
                    <div class="staff-info-icon icon-purple"><i class="bi bi-award-fill"></i></div>
                    <div><span class="staff-info-label">Specialization</span><span class="staff-info-value">${escapeHtml(staff.specialization)}</span></div>
                </div>
                <div class="staff-info-row">
                    <div class="staff-info-icon icon-orange"><i class="bi bi-calendar3"></i></div>
                    <div><span class="staff-info-label">Service Date</span><span class="staff-info-value">${escapeHtml(booking.date)}</span></div>
                </div>
            </div>
            <div class="staff-rating-section">
                <div class="staff-rating-title"><i class="bi bi-bar-chart-fill text-warning"></i> Staff Rating & Reviews</div>
                <div class="d-flex gap-4 align-items-center mb-14" style="margin-bottom:14px;">
                    <div>
                        <div class="rating-big-score">${staff.rating.toFixed(1)}</div>
                        <div class="rating-stars-display">${renderStarDisplay(staff.rating)}</div>
                        <div class="rating-total-reviews">${staff.totalReviews} reviews</div>
                    </div>
                    <div style="flex:1;">${renderRatingBars(staff)}</div>
                </div>
            </div>
        </div>
        ${actionHtml}
    `;

    // Set modal title
    document.getElementById('staffModalLabel').innerHTML = `
        <i class="bi bi-person-badge me-2"></i>${escapeHtml(booking.service)}
    `;

    // Show modal
    const staffModalEl = document.getElementById('staffModal');
    const staffModal = new bootstrap.Modal(staffModalEl);
    staffModal.show();

    // Wire up rate button if present
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

/**
 * Opens the Rating Modal
 */
function openRatingModal(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Rating questions
    const questions = [
        { key: 'q1', icon: 'bi-check2-circle', label: 'Was the service completed to your satisfaction?' },
        { key: 'q2', icon: 'bi-clock-history',  label: 'Was the staff punctual and professional?' },
        { key: 'q3', icon: 'bi-house-heart',    label: 'How clean and tidy was the result?' }
    ];

    // Build questions HTML
    const questionsHtml = questions.map((q, idx) => `
        <div class="rating-question-block">
            <div class="rating-question-label">
                <i class="bi ${q.icon} text-primary"></i> Q${idx + 1}. ${q.label}
            </div>
            <div class="star-group" data-question="${q.key}">
                ${[1, 2, 3, 4, 5].map(val => `<i class="bi bi-star" data-val="${val}"></i>`).join('')}
            </div>
        </div>
    `).join('');

    // Set modal content
    document.getElementById('ratingModalLabel').innerHTML = `<i class="bi bi-star-half me-2"></i>Rate Your Service`;
    document.getElementById('ratingModalBody').innerHTML = `
        <div style="margin-bottom:6px;">
            <div style="font-size:0.82rem;color:#64748b;margin-bottom:18px;">
                <i class="bi bi-info-circle me-1"></i>
                Rating for: <strong>${escapeHtml(booking.service)}</strong> · 
                <span style="color:#94a3b8;">${escapeHtml(booking.date)}</span>
            </div>
            ${questionsHtml}
            <div class="rating-question-block">
                <div class="rating-comment-label">
                    <i class="bi bi-chat-left-text text-primary"></i> Your Review (optional)
                </div>
                <textarea class="rating-comment-textarea" id="reviewComment" rows="3" 
                    placeholder="Share your experience — what went well? Any suggestions?"></textarea>
            </div>
            <button class="btn-submit-rating" id="submitRatingBtn" data-booking-id="${bookingId}">
                <i class="bi bi-send-fill me-2"></i> Submit Rating
            </button>
        </div>
    `;

    // Show modal
    const ratingModalEl = document.getElementById('ratingModal');
    const ratingModal = new bootstrap.Modal(ratingModalEl);
    ratingModal.show();

    // Star rating interaction state
    const ratings = {};

    // Initialize star interactions
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
            // Hover effect
            star.addEventListener('mouseenter', function() {
                const val = parseInt(this.dataset.val);
                stars.forEach((s, idx) => {
                    s.classList.remove('bi-star', 'bi-star-fill', 'hovered', 'selected');
                    if (idx < val) {
                        s.classList.add('bi-star-fill', 'hovered');
                    } else {
                        s.classList.add('bi-star');
                    }
                });
            });

            // Mouse leave - restore selected value
            star.addEventListener('mouseleave', function() {
                updateStars(ratings[questionKey]);
            });

            // Click - set value
            star.addEventListener('click', function() {
                const val = parseInt(this.dataset.val);
                ratings[questionKey] = val;
                updateStars(val);
            });
        });
    });

    // Submit handler
    document.getElementById('submitRatingBtn').addEventListener('click', function() {
        const missing = ['q1', 'q2', 'q3'].filter(k => !ratings[k] || ratings[k] === 0);

        if (missing.length > 0) {
            showNotification('Please answer all 3 rating questions before submitting.', 'warning');
            return;
        }

        const comment = document.getElementById('reviewComment').value.trim();
        const avgRating = (ratings.q1 + ratings.q2 + ratings.q3) / 3;

        // Store review
        submittedReviews[bookingId] = {
            bookingId,
            ratings,
            comment,
            avgRating: avgRating.toFixed(1),
            submittedAt: new Date().toLocaleString()
        };

        // Update staff stats (simulate backend update)
        const staff = staffMembers[booking.staffId];
        if (staff) {
            const newTotal = staff.totalReviews + 1;
            const newRating = ((staff.rating * staff.totalReviews) + avgRating) / newTotal;
            staff.rating = Math.round(newRating * 10) / 10;
            staff.totalReviews = newTotal;
            const starKey = Math.round(avgRating);
            if (staff.ratingBreakdown[starKey] !== undefined) {
                staff.ratingBreakdown[starKey]++;
            }
        }

        ratingModal.hide();
        showNotification(`Thank you! Your ${avgRating.toFixed(1)}-star rating has been submitted.`, 'success');
    });
}

// ----------------------------- BOOKINGS RENDERING -----------------------------

/**
 * Renders the booking list based on selected filter type
 */
function loadBookings(type) {
    const bookingListEl = document.getElementById('bookingList');
    if (!bookingListEl) return;

    const filteredBookings = bookings.filter(b => b.status === type);

    // Empty state
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
        document.querySelector('.explore-services-btn')?.addEventListener('click', () => {
            showNotification('📅 Booking service dialog would open here', 'success');
        });
        return;
    }

    // Render booking cards
    let html = '<div class="booking-grid">';
    filteredBookings.forEach(booking => {
        const { className: badgeClass, text: badgeText } = getStatusBadge(booking.status);
        const iconName = getServiceIcon(booking.service);
        const hasRated = !!submittedReviews[booking.id];

        const ratedBadge = (booking.status === 'delivered' && hasRated)
            ? `<span class="ms-2" style="font-size:0.72rem;color:#15803d;font-weight:600;">
                <i class="bi bi-patch-check-fill"></i> Rated
               </span>`
            : '';

        html += `
            <div class="booking-card" data-booking-id="${booking.id}" title="Click to view staff details">
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
                            <button class="btn btn-sm btn-danger ms-2 rounded-pill pay-now-btn" data-id="${booking.id}">
                                <i class="bi bi-credit-card"></i> Pay Now
                            </button>
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

    // Attach event listeners
    document.querySelectorAll('.pay-now-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            showNotification(`Processing payment for booking #${btn.dataset.id}.`, 'success');
        });
    });

    document.querySelectorAll('.booking-card[data-booking-id]').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.pay-now-btn')) return;
            openStaffModal(parseInt(this.dataset.bookingId));
        });
    });
}

// ----------------------------- PANEL RENDERERS -----------------------------

/**
 * Panel content generators for each menu item
 */
const panelRenderers = {
    bookings: () => `
        <div class="section-header">
            <h1 class="page-title"><i class="bi bi-journal-bookmark-fill text-primary me-2"></i>My Bookings</h1>
        </div>
        <div class="tabs" id="filterTabs">
            <button class="tab active" data-type="upcoming"><i class="bi bi-calendar-week"></i> Upcoming</button>
            <button class="tab" data-type="delivered"><i class="bi bi-truck"></i> Delivered</button>
            <button class="tab" data-type="cancelled"><i class="bi bi-x-circle"></i> Cancelled</button>
            <button class="tab" data-type="unpaid"><i class="bi bi-exclamation-triangle"></i> Unpaid</button>
        </div>
        <div id="bookingList" class="booking-box"></div>
    `,

    quotes: () => `
        <div class="section-header">
            <h1 class="page-title"><i class="bi bi-file-text-fill text-primary me-2"></i>My Quotes</h1>
        </div>
        <div class="booking-grid">
            <div class="booking-card" style="cursor:default;">
                <div class="d-flex justify-content-between align-items-center">
                    <div><i class="bi bi-file-pdf-fill text-danger fs-3 me-2"></i> <strong>Office Deep Cleaning</strong></div>
                    <span class="badge bg-warning text-dark">Pending</span>
                </div>
                <p class="mt-2">Estimated: TZS 449,000 · Valid until 2026-04-10</p>
                <button class="btn btn-sm btn-outline-primary rounded-pill accept-quote-btn">Accept Quote</button>
            </div>
            <div class="booking-card" style="cursor:default;">
                <div class="d-flex justify-content-between align-items-center">
                    <div><i class="bi bi-file-pdf-fill text-danger fs-3 me-2"></i> <strong>Carpet Sanitizing</strong></div>
                    <span class="badge bg-success">Approved</span>
                </div>
                <p class="mt-2">Estimated: TZS 230,000 · Valid until 2026-04-05</p>
                <button class="btn btn-sm btn-outline-success rounded-pill proceed-quote-btn">Proceed</button>
            </div>
        </div>
    `,

    payments: () => `
        <div class="section-header">
            <h1 class="page-title"><i class="bi bi-credit-card-2-front text-primary me-2"></i>Outstanding Payments</h1>
        </div>
        <div class="booking-grid">
            <div class="booking-card" style="cursor:default;">
                <div class="d-flex justify-content-between align-items-center">
                    <span><strong>Total Outstanding</strong></span>
                    <span class="fs-4 fw-bold text-danger">TZS 1,041,000</span>
                </div>
                <hr>
                <div class="mb-2"><i class="bi bi-house-door me-2"></i> Full Villa Cleaning · TZS 808,000 (Due: Mar 30, 2026)</div>
                <div class="mb-3"><i class="bi bi-couch me-2"></i> Upholstery Cleaning · TZS 233,000 (Due: Mar 28, 2026)</div>
                <button class="btn btn-primary rounded-pill px-4 pay-all-btn"><i class="bi bi-credit-card"></i> Pay All Now</button>
            </div>
        </div>
    `,

    support: () => `
        <div class="section-header">
            <h1 class="page-title"><i class="bi bi-headset text-primary me-2"></i>Support Center</h1>
        </div>
        <div class="booking-grid">
            <div class="booking-card" style="cursor:default;">
                <h5 class="fw-bold mb-3"><i class="bi bi-chat-dots me-2"></i>Live Chat Support</h5>
                <p class="text-muted">Available Monday - Friday, 8AM - 6PM (EAT)</p>
                <button class="btn btn-primary rounded-pill px-4 start-chat-btn"><i class="bi bi-chat"></i> Start Live Chat</button>
            </div>
            <div class="booking-card" style="cursor:default;">
                <h5 class="fw-bold mb-3"><i class="bi bi-telephone me-2"></i>Call Us</h5>
                <p class="mb-1"><strong>Hotline:</strong> +255 800 111 222</p>
                <p><strong>Emergency:</strong> +255 777 123 456</p>
            </div>
            <div class="booking-card" style="cursor:default;">
                <h5 class="fw-bold mb-3"><i class="bi bi-envelope me-2"></i>Email Support</h5>
                <p class="mb-1">General: support@csms.co.tz</p>
                <p>Billing: billing@csms.co.tz</p>
            </div>
        </div>
    `,

    settings: () => `
        <div class="section-header">
            <h1 class="page-title"><i class="bi bi-sliders2 text-primary me-2"></i>Settings</h1>
        </div>
        <div class="settings-card">
            <h5 class="fw-bold mb-4">Notification Preferences</h5>
            <div class="form-check form-switch mb-3">
                <input class="form-check-input" type="checkbox" id="emailNotif" checked>
                <label class="form-check-label fw-medium" for="emailNotif">Email Notifications</label>
                <p class="small text-muted mb-0">Receive booking confirmations and updates via email</p>
            </div>
            <div class="form-check form-switch mb-3">
                <input class="form-check-input" type="checkbox" id="smsNotif">
                <label class="form-check-label fw-medium" for="smsNotif">SMS Alerts</label>
                <p class="small text-muted mb-0">Get instant SMS notifications for booking status</p>
            </div>
            <div class="form-check form-switch mb-4">
                <input class="form-check-input" type="checkbox" id="pushNotif" checked>
                <label class="form-check-label fw-medium" for="pushNotif">Push Notifications</label>
                <p class="small text-muted mb-0">Receive browser notifications for updates</p>
            </div>
            <hr>
            <h5 class="fw-bold mb-3">Language & Region</h5>
            <select class="form-select mb-4" style="max-width: 300px;">
                <option>English (UK)</option>
                <option>Swahili</option>
                <option>Arabic</option>
            </select>
            <button class="btn btn-primary rounded-pill px-4 save-settings-btn">Save Settings</button>
        </div>
    `,

    feedback: () => `
        <div class="section-header">
            <h1 class="page-title"><i class="bi bi-chat-dots text-primary me-2"></i>Feedback</h1>
        </div>
        <div class="settings-card">
            <p class="text-muted mb-4">We value your feedback! Help us improve our services.</p>
            <div class="mb-3">
                <label class="form-label fw-medium">Rating</label>
                <div class="d-flex gap-2">
                    ${[1,2,3,4,5].map(n => `<i class="bi bi-star fs-3 text-warning star-rating" data-rating="${n}"></i>`).join('')}
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label fw-medium">Your Comments</label>
                <textarea class="form-control" rows="4" placeholder="Share your experience with CSMS..."></textarea>
            </div>
            <button class="btn btn-primary rounded-pill px-4 submit-feedback-btn">Submit Feedback</button>
        </div>
    `,

    terms: () => `
        <div class="section-header">
            <h1 class="page-title"><i class="bi bi-file-earmark-text text-primary me-2"></i>Terms & Conditions</h1>
        </div>
        <div class="settings-card">
            <h5 class="fw-bold mb-3">Service Agreement</h5>
            <p class="text-muted">By using CSMS services, you agree to our service policies, cancellation terms, and privacy policy. Last updated: March 2026.</p>
            <hr>
            <h6 class="fw-bold">Key Terms:</h6>
            <ul class="mt-2">
                <li><strong>Cancellation Policy:</strong> Free cancellation up to 24 hours before service.</li>
                <li><strong>Quality Guarantee:</strong> 100% satisfaction guaranteed.</li>
                <li><strong>Payment Terms:</strong> Payments are due upon completion.</li>
                <li><strong>Privacy:</strong> Your data is protected.</li>
                <li><strong>Liability:</strong> CSMS is fully insured.</li>
            </ul>
            <button class="btn btn-outline-primary rounded-pill px-4 mt-3 agree-terms-btn">I Agree to Terms</button>
        </div>
    `,

    delete: () => `
        <div class="section-header">
            <h1 class="page-title text-danger"><i class="bi bi-trash3 text-danger me-2"></i>Delete Account</h1>
        </div>
        <div class="settings-card border border-danger">
            <div class="text-center p-4">
                <i class="bi bi-exclamation-triangle-fill text-danger" style="font-size: 48px;"></i>
                <h5 class="fw-bold text-danger mt-3">Warning: This action is permanent!</h5>
                <p class="text-muted mt-3">Deleting your account will remove all your data.</p>
                <div class="form-check mb-3">
                    <input class="form-check-input" type="checkbox" id="confirmDelete">
                    <label class="form-check-label" for="confirmDelete">I understand this action is irreversible</label>
                </div>
                <button class="btn btn-danger rounded-pill px-4 confirm-delete-btn" disabled>Request Account Deletion</button>
            </div>
        </div>
    `,

    logout: () => `
        <div class="empty-state">
            <i class="bi bi-box-arrow-right" style="font-size: 64px;"></i>
            <h4 class="mt-3">Logged Out</h4>
            <p class="text-muted">You have been successfully logged out.</p>
            <button class="btn btn-primary rounded-pill px-4 login-redirect-btn">Login Again</button>
        </div>
    `
};

/**
 * Main panel renderer - switches based on menu type
 */
function renderPanel(menuType) {
    const renderer = panelRenderers[menuType];
    if (!renderer) {
        DOM.dynamicPanel.innerHTML = `<div class="empty-state"><i class="bi bi-grid"></i><h4>CSMS Dashboard</h4><p>Select an option from the menu</p></div>`;
        return;
    }

    DOM.dynamicPanel.innerHTML = renderer();
    closeSidebar();

    // Post-render actions for specific panels
    const postRenderActions = {
        bookings: () => {
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
        },
        quotes: () => {
            document.querySelectorAll('.accept-quote-btn, .proceed-quote-btn').forEach(btn => {
                btn.addEventListener('click', () => showNotification('Quote accepted!', 'success'));
            });
        },
        payments: () => {
            document.querySelector('.pay-all-btn')?.addEventListener('click', () => {
                showNotification('Redirecting to payment gateway', 'success');
            });
        },
        support: () => {
            document.querySelector('.start-chat-btn')?.addEventListener('click', () => {
                showNotification('Connecting to support agent...', 'info');
            });
        },
        settings: () => {
            document.querySelector('.save-settings-btn')?.addEventListener('click', () => {
                showNotification('Settings saved successfully!', 'success');
            });
        },
        feedback: () => {
            const stars = document.querySelectorAll('.star-rating');
            let selectedRating = 0;
            stars.forEach(star => {
                star.addEventListener('click', function() {
                    const rating = parseInt(this.dataset.rating);
                    selectedRating = rating;
                    stars.forEach((s, idx) => {
                        s.classList.toggle('bi-star-fill', idx < rating);
                        s.classList.toggle('bi-star', idx >= rating);
                    });
                });
            });
            document.querySelector('.submit-feedback-btn')?.addEventListener('click', () => {
                selectedRating > 0 
                    ? showNotification(`Thank you for your ${selectedRating}-star feedback!`, 'success')
                    : showNotification('Please select a rating', 'warning');
            });
        },
        terms: () => {
            document.querySelector('.agree-terms-btn')?.addEventListener('click', () => {
                showNotification('Thank you for agreeing to our terms!', 'success');
            });
        },
        delete: () => {
            const checkbox = document.getElementById('confirmDelete');
            const deleteBtn = document.querySelector('.confirm-delete-btn');
            if (checkbox && deleteBtn) {
                checkbox.addEventListener('change', () => deleteBtn.disabled = !checkbox.checked);
                deleteBtn.addEventListener('click', () => showNotification('Account deletion request submitted.', 'warning'));
            }
        },
        logout: () => {
            showNotification('You have been logged out successfully.', 'success');
            document.querySelector('.login-redirect-btn')?.addEventListener('click', () => {
                showNotification('Redirecting...', 'info');
                setTimeout(() => renderPanel('bookings'), 1000);
            });
        }
    };

    if (postRenderActions[menuType]) {
        postRenderActions[menuType]();
    }
    if (menuType !== 'bookings' && menuType !== 'logout') {
        showNotification(`${menuType.charAt(0).toUpperCase() + menuType.slice(1)} section loaded`, 'success');
    }
}

// ----------------------------- INITIALIZATION -----------------------------

function init() {
    // Sidebar menu click handlers
    DOM.menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const menuType = this.dataset.menu;
            DOM.menuItems.forEach(li => li.classList.remove('active'));
            this.classList.add('active');
            renderPanel(menuType);
        });
    });

    // Hamburger menu
    DOM.hamburger?.addEventListener('click', e => {
        e.stopPropagation();
        openSidebar();
    });
    DOM.sidebarClose?.addEventListener('click', closeSidebar);
    DOM.overlay?.addEventListener('click', closeSidebar);
    window.addEventListener('resize', () => {
        if (window.innerWidth > 992) closeSidebar();
    });

    // Header icons
    DOM.notificationIcon?.addEventListener('click', () => showNotification('You have 3 new notifications', 'info'));
    DOM.messageIcon?.addEventListener('click', () => showNotification('No new messages', 'info'));

    // Footer newsletter
    const newsletterForm = document.querySelector('.footer .newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', e => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            if (emailInput?.value) {
                if (validateEmail(emailInput.value)) {
                    showNotification('Thank you for subscribing!', 'success');
                    emailInput.value = '';
                } else {
                    showNotification('Please enter a valid email address', 'danger');
                }
            }
        });
    }

    // Initial panel render
    renderPanel('bookings');
    const bookingsMenuItem = document.querySelector('.menu li[data-menu="bookings"]');
    if (bookingsMenuItem) {
        DOM.menuItems.forEach(li => li.classList.remove('active'));
        bookingsMenuItem.classList.add('active');
    }

    console.log('✅ CSMS Tracking Dashboard initialized');
}

// ----------------------------- GLOBAL EXPORTS -----------------------------

window.showNotification = showNotification;
window.closeSidebar = closeSidebar;
window.openSidebar = openSidebar;
window.openStaffModal = openStaffModal;
window.openRatingModal = openRatingModal;

// Start everything when DOM is ready
document.addEventListener('DOMContentLoaded', init);