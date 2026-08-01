// ============================================================================
// CleanSpark TRACKING DASHBOARD - COMPLETE BACKEND INTEGRATION
// ============================================================================

// Global variable to track auth status
let isAuthChecking = false;
let authCheckComplete = false;
let retryCount = 0;
const MAX_RETRIES = 3;

// ----------------------------- AUTHENTICATION CHECK -----------------------------

async function checkAuthAndLoad() {
    if (isAuthChecking) {
        console.log('Auth check already in progress, skipping...');
        return false;
    }
    
    isAuthChecking = true;
    
    console.log('=== AUTH DEBUG START ===');
    console.log('localStorage cleanspark_token:', localStorage.getItem('cleanspark_token'));
    console.log('sessionStorage cleanspark_token:', sessionStorage.getItem('cleanspark_token'));
    console.log('localStorage isLoggedIn:', localStorage.getItem('isLoggedIn'));
    
    if (typeof API === 'undefined') {
        console.log('API not ready yet, waiting...');
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            isAuthChecking = false;
            setTimeout(() => checkAuthAndLoad(), 500);
            return false;
        } else {
            console.error('API failed to load after retries');
            showLoginOverlay();
            isAuthChecking = false;
            return false;
        }
    }
    
    let token = API.getAuthToken ? API.getAuthToken() : null;
    
    if (!token || token === 'null' || token === 'undefined') {
        token = localStorage.getItem('cleanspark_token');
    }
    
    if (!token || token === 'null' || token === 'undefined') {
        token = sessionStorage.getItem('cleanspark_token');
    }
    
    if (token === 'null' || token === 'undefined') {
        token = null;
    }
    
    const isLoggedInFlag = localStorage.getItem('isLoggedIn') === 'true';
    const hasValidToken = token && token.length > 20;
    
    if (!hasValidToken && !isLoggedInFlag) {
        console.log('No valid auth found, showing login overlay');
        showLoginOverlay();
        isAuthChecking = false;
        return false;
    }
    
    if (hasValidToken && API.setAuthToken) {
        API.setAuthToken(token, true);
    }
    
    if (hasValidToken) {
        try {
            console.log('Verifying token with profile API...');
            
            const profilePromise = API.auth.getProfile();
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Profile fetch timeout')), 10000);
            });
            
            const profile = await Promise.race([profilePromise, timeoutPromise]);
            
            if (profile && profile.profile) {
                console.log('Authentication SUCCESSFUL!');
                updateUserProfile(profile.profile);
                hideLoginOverlay();
                
                localStorage.setItem('isLoggedIn', 'true');
                
                if (token) {
                    localStorage.setItem('cleanspark_token', token);
                    sessionStorage.setItem('cleanspark_token', token);
                }
                
                retryCount = 0;
                initDashboard();
                authCheckComplete = true;
                isAuthChecking = false;
                return true;
            } else {
                throw new Error('Invalid profile response');
            }
        } catch (error) {
            console.error('Auth error:', error.message);
            clearAllAuthData();
            showLoginOverlay();
            isAuthChecking = false;
            return false;
        }
    } else {
        clearAllAuthData();
        showLoginOverlay();
        isAuthChecking = false;
        return false;
    }
}

function clearAllAuthData() {
    localStorage.removeItem('cleanspark_token');
    sessionStorage.removeItem('cleanspark_token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    if (API && API.clearAuthToken) API.clearAuthToken();
}

function showLoginOverlay() {
    const overlay = document.getElementById('loginRequiredOverlay');
    const dashboard = document.getElementById('dashboardWrapper');
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.style.zIndex = '9999';
    }
    if (dashboard) dashboard.style.display = 'none';
}

function hideLoginOverlay() {
    const overlay = document.getElementById('loginRequiredOverlay');
    const dashboard = document.getElementById('dashboardWrapper');
    if (overlay) overlay.style.display = 'none';
    if (dashboard) dashboard.style.display = 'flex';
}

function updateUserProfile(userData) {
    const avatarEl = document.getElementById('userAvatar');
    const nameEl = document.getElementById('userName');
    const emailEl = document.getElementById('userEmail');
    
    const name = userData.first_name && userData.last_name 
        ? `${userData.first_name} ${userData.last_name}`
        : userData.full_name || userData.name || 'Customer';
    
    const email = userData.email || '';
    
    if (nameEl) nameEl.textContent = name;
    if (emailEl) emailEl.innerHTML = `<i class="bi bi-envelope"></i> ${escapeHtml(email)}`;
    
    if (avatarEl) {
        const profilePhoto = userData.profile_photo || userData.photo || userData.avatar;
        
        if (profilePhoto && profilePhoto !== 'null' && profilePhoto !== 'undefined') {
            let photoUrl = profilePhoto;
            if (!photoUrl.startsWith('http') && !photoUrl.startsWith('data:')) {
                const cleanPath = profilePhoto.startsWith('/') ? profilePhoto.substring(1) : profilePhoto;
                photoUrl = `${API.BASE_URL.replace('/api', '')}/${cleanPath}`;
            }
            
            avatarEl.innerHTML = `<img src="${photoUrl}" alt="${escapeHtml(name)}" onerror="this.parentElement.innerHTML='${getInitials(name)}'; this.parentElement.style.display='flex'; this.parentElement.style.alignItems='center'; this.parentElement.style.justifyContent='center';">`;
            avatarEl.style.display = 'flex';
            avatarEl.style.alignItems = 'center';
            avatarEl.style.justifyContent = 'center';
        } else {
            avatarEl.innerHTML = getInitials(name);
            avatarEl.style.display = 'flex';
            avatarEl.style.alignItems = 'center';
            avatarEl.style.justifyContent = 'center';
        }
    }
}

function getInitials(name) {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

async function logoutUser() {
    try {
        const token = localStorage.getItem('cleanspark_token') || sessionStorage.getItem('cleanspark_token');
        if (token && token !== 'null' && API.auth && API.auth.logout) {
            await API.auth.logout();
        }
    } catch (error) {
        console.error('Logout API error:', error);
    }
    
    clearAllAuthData();
    showLoginOverlay();
    
    const dynamicPanel = document.getElementById('dynamicPanel');
    if (dynamicPanel) dynamicPanel.innerHTML = '';
    
    showNotification('Logged out successfully', 'success');
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

function redirectToLogin() {
    window.location.href = 'login.html';
}

// ----------------------------- UTILITIES -----------------------------

function escapeHtml(str) {
    if (!str) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, m => map[m]);
}

function formatPrice(price) {
    if (!price) return 'TZS 0';
    const num = typeof price === 'number' ? price : parseFloat(price);
    return `TZS ${num.toLocaleString()}`;
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB');
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
        document.getElementById('mainSidebar')?.classList.remove('mobile-open');
        document.getElementById('mobileOverlay')?.classList.remove('active');
    }
}

function openSidebar() {
    if (window.innerWidth <= 992) {
        document.getElementById('mainSidebar')?.classList.add('mobile-open');
        document.getElementById('mobileOverlay')?.classList.add('active');
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

// ----------------------------- STAFF DETAILS MODAL -----------------------------

async function openStaffModal(bookingId) {
    try {
        const response = await API.bookings.getById(bookingId);
        if (!response || !response.booking) {
            showNotification('Could not load booking details', 'danger');
            return;
        }
        
        const b = response.booking;
        const staff = b.assigned_staff;
        
        const modalBody = document.getElementById('staffModalBody');
        if (!modalBody) return;
        
        const staffInfo = staff ? `
            <div class="staff-profile-banner">
                <div class="staff-avatar-wrap">
                    <div class="staff-avatar-placeholder">${staff.first_name?.charAt(0) || 'S'}${staff.last_name?.charAt(0) || ''}</div>
                    <span class="staff-online-dot"></span>
                </div>
                <div class="staff-name">${escapeHtml(staff.full_name || 'Staff Member')}</div>
                <div class="staff-role">${escapeHtml(staff.staff_type || 'Cleaning Professional')}</div>
            </div>
            <div class="staff-details-body">
                <div class="staff-info-card">
                    <div class="staff-info-row">
                        <div class="staff-info-icon icon-blue"><i class="bi bi-telephone-fill"></i></div>
                        <div><span class="staff-info-label">Phone</span><span class="staff-info-value">${escapeHtml(staff.phone || 'N/A')}</span></div>
                    </div>
                    <div class="staff-info-row">
                        <div class="staff-info-icon icon-green"><i class="bi bi-envelope-fill"></i></div>
                        <div><span class="staff-info-label">Email</span><span class="staff-info-value">${escapeHtml(staff.email || 'N/A')}</span></div>
                    </div>
                    <div class="staff-info-row">
                        <div class="staff-info-icon icon-orange"><i class="bi bi-calendar3"></i></div>
                        <div><span class="staff-info-label">Service Date</span><span class="staff-info-value">${formatDate(b.schedule?.date)} at ${b.schedule?.time || 'TBD'}</span></div>
                    </div>
                </div>
            </div>
        ` : `
            <div class="staff-profile-banner">
                <div class="staff-avatar-wrap">
                    <div class="staff-avatar-placeholder">CS</div>
                </div>
                <div class="staff-name">Staff Assignment Pending</div>
                <div class="staff-role">A staff member will be assigned soon</div>
            </div>
            <div class="staff-details-body">
                <div class="staff-info-card">
                    <div class="staff-info-row">
                        <div class="staff-info-icon icon-orange"><i class="bi bi-calendar3"></i></div>
                        <div><span class="staff-info-label">Service Date</span><span class="staff-info-value">${formatDate(b.schedule?.date)} at ${b.schedule?.time || 'TBD'}</span></div>
                    </div>
                </div>
            </div>
        `;
        
        const isCompleted = b.status === 'completed';
        
        let actionHtml = '';
        if (isCompleted) {
            actionHtml = `<div class="staff-modal-actions"><button class="btn-rate-service" id="openRatingModalBtn" data-booking-id="${bookingId}"><i class="bi bi-star-half"></i> Rate This Service</button></div>`;
        }
        
        modalBody.innerHTML = staffInfo + actionHtml;
        
        const labelEl = document.getElementById('staffModalLabel');
        if (labelEl) labelEl.innerHTML = `<i class="bi bi-person-badge me-2"></i>${escapeHtml(b.service?.name || 'Service Details')}`;
        
        const staffModal = new bootstrap.Modal(document.getElementById('staffModal'));
        staffModal.show();
        
        const rateBtn = document.getElementById('openRatingModalBtn');
        if (rateBtn) {
            rateBtn.addEventListener('click', () => {
                staffModal.hide();
                openRatingModal(bookingId);
            });
        }
        
    } catch (error) {
        console.error('Open staff modal error:', error);
        showNotification('Could not load booking details', 'danger');
    }
}

// ----------------------------- RATING MODAL -----------------------------

let currentRatingBookingId = null;

async function openRatingModal(bookingId) {
    currentRatingBookingId = bookingId;
    
    try {
        const questionsHtml = `
            <div class="rating-question-block">
                <div class="rating-question-label"><i class="bi bi-check2-circle text-primary"></i> Q1. How satisfied were you with the service?</div>
                <div class="star-group" data-question="satisfaction">
                    ${[1, 2, 3, 4, 5].map(val => `<i class="bi bi-star" data-val="${val}"></i>`).join('')}
                </div>
            </div>
            <div class="rating-question-block">
                <div class="rating-question-label"><i class="bi bi-clock-history text-primary"></i> Q2. Was the staff punctual and professional?</div>
                <div class="star-group" data-question="punctuality">
                    ${[1, 2, 3, 4, 5].map(val => `<i class="bi bi-star" data-val="${val}"></i>`).join('')}
                </div>
            </div>
            <div class="rating-question-block">
                <div class="rating-question-label"><i class="bi bi-house-heart text-primary"></i> Q3. How clean and tidy was the result?</div>
                <div class="star-group" data-question="cleanliness">
                    ${[1, 2, 3, 4, 5].map(val => `<i class="bi bi-star" data-val="${val}"></i>`).join('')}
                </div>
            </div>
            <div class="rating-question-block">
                <div class="rating-comment-label"><i class="bi bi-chat-left-text text-primary"></i> Your Review (optional)</div>
                <textarea class="rating-comment-textarea" id="reviewComment" rows="3" placeholder="Share your experience — what went well? Any suggestions?"></textarea>
            </div>
            <button class="btn-submit-rating" id="submitRatingBtn">
                <i class="bi bi-send-fill me-2"></i> Submit Rating
            </button>
        `;
        
        const labelEl = document.getElementById('ratingModalLabel');
        if (labelEl) labelEl.innerHTML = `<i class="bi bi-star-half me-2"></i>Rate Your Service`;
        
        const bodyEl = document.getElementById('ratingModalBody');
        if (bodyEl) bodyEl.innerHTML = questionsHtml;
        
        const ratingModal = new bootstrap.Modal(document.getElementById('ratingModal'));
        ratingModal.show();
        
        const ratings = { satisfaction: 0, punctuality: 0, cleanliness: 0 };
        
        document.querySelectorAll('.star-group').forEach(group => {
            const questionKey = group.dataset.question;
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
                        s.classList.remove('bi-star', 'bi-star-fill', 'hovered');
                        if (idx < val) {
                            s.classList.add('bi-star-fill', 'hovered');
                        } else {
                            s.classList.add('bi-star');
                        }
                    });
                });
                star.addEventListener('mouseleave', () => updateStars(ratings[questionKey]));
                star.addEventListener('click', function() {
                    const val = parseInt(this.dataset.val);
                    ratings[questionKey] = val;
                    updateStars(val);
                });
            });
        });
        
        document.getElementById('submitRatingBtn')?.addEventListener('click', async () => {
            if (!ratings.satisfaction || !ratings.punctuality || !ratings.cleanliness) {
                showNotification('Please answer all 3 rating questions', 'warning');
                return;
            }
            
            const reviewText = document.getElementById('reviewComment')?.value.trim() || '';
            
            try {
                await API.ratings.submit({
                    booking_id: bookingId,
                    satisfaction_rating: ratings.satisfaction,
                    punctuality_rating: ratings.punctuality,
                    cleanliness_rating: ratings.cleanliness,
                    review_text: reviewText,
                    is_public: 1
                });
                
                ratingModal.hide();
                showNotification('Thank you for your feedback!', 'success');
                
                const activeTab = document.querySelector('.tab.active')?.dataset.type;
                if (activeTab) loadBookings(activeTab);
            } catch (error) {
                console.error('Submit rating error:', error);
                showNotification(error.message || 'Failed to submit rating', 'danger');
            }
        });
        
    } catch (error) {
        console.error('Open rating modal error:', error);
        showNotification('Could not load rating details', 'danger');
    }
}

// ==================== FIXED: BOOKINGS LOAD FUNCTION ====================

async function loadBookings(type) {
    const bookingListEl = document.getElementById('bookingList');
    if (!bookingListEl) return;
    
    bookingListEl.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-2">Loading bookings...</p></div>';
    
    try {
        const response = await API.bookings.getMyBookings();
        allBookings = response.bookings || [];
        
        let filteredBookings = allBookings;
        if (type === 'upcoming') {
            filteredBookings = allBookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
        } else if (type === 'delivered') {
            filteredBookings = allBookings.filter(b => b.status === 'completed');
        } else if (type === 'cancelled') {
            filteredBookings = allBookings.filter(b => b.status === 'cancelled');
        }
        
        if (filteredBookings.length === 0) {
            bookingListEl.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <h5 class="fw-semibold">No ${type} bookings found</h5>
                    <p class="text-muted">You're all caught up — nothing here for now.</p>
                    <button class="btn btn-outline-primary mt-3 rounded-pill px-4 explore-services-btn" onclick="window.location.href='service.html'">
                        <i class="bi bi-plus-circle"></i> Book New Service
                    </button>
                </div>
            `;
            return;
        }
        
        let html = '<div class="booking-grid">';
        for (const booking of filteredBookings) {
            const status = booking.status;
            let badgeClass = 'badge-upcoming';
            let badgeText = 'Upcoming';
            
            if (status === 'completed') {
                badgeClass = 'badge-delivered';
                badgeText = 'Delivered';
            } else if (status === 'cancelled') {
                badgeClass = 'badge-cancelled';
                badgeText = 'Cancelled';
            }
            
            const serviceName = booking.service?.name || 'Cleaning Service';
            const serviceDate = booking.schedule?.date || 'Date TBD';
            
            // ✅ FIX 1: Get correct address
            let address = 'Address not provided';
            if (booking.location?.address) {
                address = booking.location.address;
            } else if (booking.property?.address) {
                address = booking.property.address;
            } else if (booking.address) {
                address = booking.address;
            } else if (booking.location?.city) {
                address = booking.location.city;
            } else if (booking.city) {
                address = booking.city;
            }
            
            // ✅ FIX 2: Get correct price - USE THE FLAT FIELDS
            let price = 0;
            
            // Check all possible price locations - PRIORITIZE final_price from admin estimation
            if (booking.final_price && parseFloat(booking.final_price) > 0) {
                price = booking.final_price;
            } else if (booking.total_price && parseFloat(booking.total_price) > 0) {
                price = booking.total_price;
            } else if (booking.payment?.display_price && parseFloat(booking.payment.display_price) > 0) {
                price = booking.payment.display_price;
            } else if (booking.payment?.total_price && parseFloat(booking.payment.total_price) > 0) {
                price = booking.payment.total_price;
            } else if (booking.base_price && parseFloat(booking.base_price) > 0) {
                price = booking.base_price;
            } else if (booking.service?.price && parseFloat(booking.service.price) > 0) {
                price = booking.service.price;
            } else if (booking.estimation?.final_total && parseFloat(booking.estimation.final_total) > 0) {
                price = booking.estimation.final_total;
            }
            
            // Debug log to see what's happening
            console.log(`Booking #${booking.id} - Price: ${price}, final_price: ${booking.final_price}, total_price: ${booking.total_price}`);
            
            const formattedPrice = formatPrice(price);
            
            const isPaid = booking.payment?.payment_status === 'paid';
            const estimationStatus = booking.estimation?.status || 'pending';
            
            let statusBadge = '';
            if (estimationStatus === 'invoiced' && !isPaid) {
                statusBadge = `<span class="badge bg-warning ms-2">Invoice Ready</span>`;
            } else if (isPaid) {
                statusBadge = `<span class="badge bg-success ms-2">Paid ✅</span>`;
            } else if (estimationStatus === 'estimated') {
                statusBadge = `<span class="badge bg-info ms-2">Estimating</span>`;
            }
            
            html += `
                <div class="booking-card clickable" data-booking-id="${booking.id}" title="Click to view details">
                    <div class="d-flex flex-wrap justify-content-between align-items-start">
                        <div class="d-flex gap-3">
                            <div class="service-icon"><i class="bi bi-brightness-alt-high fs-4"></i></div>
                            <div>
                                <h5 class="fw-bold mb-2">${escapeHtml(serviceName)}</h5>
                                <div class="d-flex flex-wrap gap-3 mt-1">
                                    <span><i class="bi bi-calendar3 me-1 text-secondary"></i> ${formatDate(serviceDate)}</span>
                                    <span><i class="bi bi-pin-map-fill me-1 text-secondary"></i> ${escapeHtml(address)}</span>
                                    <span><i class="bi bi-cash-stack me-1 text-secondary"></i> ${formattedPrice}</span>
                                </div>
                            </div>
                        </div>
                        <div class="mt-2 mt-sm-0 d-flex align-items-center flex-wrap gap-1">
                            <span class="booking-badge ${badgeClass}">${badgeText.toUpperCase()}</span>
                            ${statusBadge}
                        </div>
                    </div>
                    <hr>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted-custom"><i class="bi bi-chat-left-text"></i> Reference: CS-${booking.id}</small>
                        ${status === 'completed' ? `<span style="font-size:0.78rem;color:var(--primary-color);font-weight:600;"><i class="bi bi-star me-1"></i>Tap to rate</span>` : ''}
                    </div>
                    <span class="click-hint"><i class="bi bi-eye"></i> View details</span>
                </div>
            `;
        }
        html += '</div>';
        bookingListEl.innerHTML = html;
        
        bookingListEl.querySelectorAll('.booking-card.clickable').forEach(card => {
            card.addEventListener('click', function(e) {
                const bookingId = parseInt(this.dataset.bookingId);
                openStaffModal(bookingId);
            });
        });
        
    } catch (error) {
        console.error('Load bookings error:', error);
        bookingListEl.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-exclamation-triangle"></i>
                <h5 class="fw-semibold">Error Loading Bookings</h5>
                <p class="text-muted">${escapeHtml(error.message)}</p>
                <button class="btn btn-outline-primary mt-3" onclick="loadBookings('${type}')">Try Again</button>
            </div>
        `;
    }
}

// ==================== COMPLETE PAYMENT FLOW ====================

// Store payment state
let paymentState = {
    amount: 0,
    bookingId: null,
    invoiceId: null,
    payAll: false,
    selectedMethod: null,
    accountNumber: '',
    pin: ''
};

async function loadOutstandingPayments() {
    const outstandingList = document.getElementById('outstandingList');
    if (!outstandingList) return;
    
    outstandingList.innerHTML = '<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div> Loading...</div>';
    
    try {
        const balance = await API.payments.getOutstandingBalance();
        
        if (!balance.balance || balance.balance.outstanding_balance === 0) {
            outstandingList.innerHTML = `<div class="empty-state" style="padding: 30px 20px;"><i class="bi bi-emoji-smile fs-1 text-success"></i><h5 class="mt-2">No Outstanding Payments!</h5></div>`;
            return;
        }
        
        const totalDue = balance.balance.outstanding_balance;
        const unpaidBookings = balance.unpaid_bookings || [];
        
        let html = `<div class="payment-card"><div class="d-flex justify-content-between align-items-center"><span class="fw-bold fs-5">Total Due</span><span class="fs-4 fw-bold text-danger">${formatPrice(totalDue)}</span></div><hr>`;
        
        unpaidBookings.forEach(b => {
            html += `<div class="mb-2"><i class="bi bi-clock-history me-2 text-warning"></i> Booking #${b.id} - ${formatPrice(b.total_price)}</div>`;
        });
        
        html += `
            <div class="d-flex gap-2 mt-3">
                <button class="btn btn-danger rounded-pill px-4" id="payAllBtn">
                    <i class="bi bi-credit-card me-2"></i> Pay All (${formatPrice(totalDue)})
                </button>
            </div>
        </div>`;
        
        outstandingList.innerHTML = html;
        
        document.getElementById('payAllBtn')?.addEventListener('click', () => {
            showPaymentMethods(formatPrice(totalDue), null, true);
        });
        
    } catch (error) {
        console.error('Load outstanding payments error:', error);
        outstandingList.innerHTML = `<div class="empty-state"><i class="bi bi-exclamation-triangle"></i><p>Error loading payment info</p></div>`;
    }
}

async function loadPaymentHistory() {
    const historyList = document.getElementById('paymentHistoryList');
    if (!historyList) return;
    
    historyList.innerHTML = '<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div> Loading...</div>';
    
    try {
        const response = await API.payments.getHistory();
        const payments = response.payments || [];
        
        if (payments.length === 0) {
            historyList.innerHTML = `<div class="empty-state"><i class="bi bi-clock-history"></i><p>No payment history yet</p></div>`;
            return;
        }
        
        historyList.innerHTML = payments.map(p => `
            <div class="payment-card" style="cursor: pointer;" data-payment-id="${p.id}">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="fw-bold mb-1">${escapeHtml(p.service_name || 'Payment')}</h6>
                        <span class="text-muted small">${formatDate(p.payment_date)} · ${p.payment_method}</span>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <span class="fw-bold text-success">${formatPrice(p.amount)}</span>
                        <i class="bi bi-chevron-right text-muted"></i>
                    </div>
                </div>
            </div>
        `).join('');
        
        historyList.querySelectorAll('.payment-card').forEach(card => {
            card.addEventListener('click', async function() {
                const paymentId = this.dataset.paymentId;
                try {
                    const receipt = await API.payments.getReceipt(paymentId);
                    if (receipt && receipt.receipt) {
                        openPaymentDetailsModal(receipt.receipt);
                    }
                } catch (error) {
                    showNotification('Could not load receipt', 'danger');
                }
            });
        });
        
    } catch (error) {
        console.error('Load payment history error:', error);
        historyList.innerHTML = `<div class="empty-state"><i class="bi bi-exclamation-triangle"></i><p>Error loading history</p></div>`;
    }
}

function showPaymentMethods(amount, specificBookingId = null, payAll = false, invoiceId = null) {
    paymentState.amount = amount;
    paymentState.bookingId = specificBookingId;
    paymentState.invoiceId = invoiceId;
    paymentState.payAll = payAll;
    paymentState.selectedMethod = null;
    paymentState.accountNumber = '';
    paymentState.pin = '';
    
    const title = `<i class="bi bi-credit-card me-2"></i>Pay ${amount}`;
    
    const bodyHtml = `
        <div style="margin-bottom: 20px;">
            <div style="font-size: 1.8rem; font-weight: 800; color: var(--dark-color);">${amount}</div>
            <div style="font-size: 0.85rem; color: var(--gray-color);">Select a payment method and complete the payment</div>
        </div>
        
        <!-- Step 1: Payment Method -->
        <div class="payment-step" id="paymentStep1">
            <div class="payment-step-label"><i class="bi bi-1-circle-fill text-primary"></i> Choose Payment Method</div>
            <div id="paymentMethodsList">
                <div class="payment-method-option" data-method="mobile_money">
                    <div class="payment-method-icon"><i class="fas fa-mobile-alt"></i></div>
                    <div><strong>Mobile Money</strong><br><span style="font-size:0.8rem;">M-Pesa, Airtel, Tigo, HaloPesa</span></div>
                </div>
                <div class="payment-method-option" data-method="card">
                    <div class="payment-method-icon"><i class="fas fa-credit-card"></i></div>
                    <div><strong>Card Payment</strong><br><span style="font-size:0.8rem;">Visa, Mastercard, Amex</span></div>
                </div>
                <div class="payment-method-option" data-method="bank_transfer">
                    <div class="payment-method-icon"><i class="fas fa-university"></i></div>
                    <div><strong>Bank Transfer</strong><br><span style="font-size:0.8rem;">Direct bank transfer</span></div>
                </div>
            </div>
            <p id="paymentMethodError" class="text-danger mt-2" style="font-size:0.85rem;display:none;">Please select a payment method.</p>
            <button class="btn btn-primary rounded-pill px-4 mt-3" id="paymentStep1Next" disabled>
                Next <i class="bi bi-chevron-right"></i>
            </button>
        </div>
        
        <!-- Step 2: Account Details -->
        <div class="payment-step" id="paymentStep2" style="display:none;">
            <div class="payment-step-label"><i class="bi bi-2-circle-fill text-primary"></i> Enter Payment Details</div>
            <div id="accountDetailsContainer">
                <!-- Dynamic content based on method -->
            </div>
            <div class="d-flex gap-2 mt-3">
                <button class="btn btn-outline-secondary rounded-pill px-4" id="paymentStep2Back">
                    <i class="bi bi-chevron-left"></i> Back
                </button>
                <button class="btn btn-primary rounded-pill px-4" id="paymentStep2Next">
                    Next <i class="bi bi-chevron-right"></i>
                </button>
            </div>
        </div>
        
        <!-- Step 3: PIN Confirmation -->
        <div class="payment-step" id="paymentStep3" style="display:none;">
            <div class="payment-step-label"><i class="bi bi-3-circle-fill text-primary"></i> Confirm Payment</div>
            <div class="payment-summary-box">
                <div class="d-flex justify-content-between">
                    <span>Amount:</span>
                    <span class="fw-bold">${amount}</span>
                </div>
                <div class="d-flex justify-content-between mt-1">
                    <span>Method:</span>
                    <span id="paymentMethodDisplay">-</span>
                </div>
                <div class="d-flex justify-content-between mt-1">
                    <span>Account:</span>
                    <span id="accountDisplay">-</span>
                </div>
            </div>
            <div class="pin-input-container">
                <label class="fw-bold mb-2">Enter your 4-digit PIN</label>
                <div class="pin-input-group">
                    <input type="password" maxlength="1" class="pin-input" data-index="0" autofocus>
                    <input type="password" maxlength="1" class="pin-input" data-index="1">
                    <input type="password" maxlength="1" class="pin-input" data-index="2">
                    <input type="password" maxlength="1" class="pin-input" data-index="3">
                </div>
                <div id="pinError" class="text-danger mt-2" style="font-size:0.85rem;display:none;">Please enter your 4-digit PIN</div>
            </div>
            <div class="d-flex gap-2 mt-3">
                <button class="btn btn-outline-secondary rounded-pill px-4" id="paymentStep3Back">
                    <i class="bi bi-chevron-left"></i> Back
                </button>
                <button class="btn btn-success rounded-pill px-4" id="paymentStep3Confirm">
                    <i class="bi bi-check-circle-fill me-2"></i> Confirm Payment
                </button>
            </div>
        </div>
    `;
    
    const footerHtml = `
        <button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
    `;
    
    const modal = openGlobalModal(title, bodyHtml, footerHtml);
    const modalEl = document.getElementById('globalActionModal');
    
    if (!modalEl) return;
    
    // STEP 1: Payment Method Selection
    const methodOptions = modalEl.querySelectorAll('.payment-method-option');
    const step1Next = document.getElementById('paymentStep1Next');
    const methodError = document.getElementById('paymentMethodError');
    
    methodOptions.forEach(option => {
        option.addEventListener('click', function() {
            methodOptions.forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            paymentState.selectedMethod = this.dataset.method;
            if (methodError) methodError.style.display = 'none';
            if (step1Next) step1Next.disabled = false;
        });
    });
    
    if (step1Next) {
        step1Next.addEventListener('click', function() {
            if (!paymentState.selectedMethod) {
                if (methodError) methodError.style.display = 'block';
                return;
            }
            showPaymentStep(2);
            populateAccountDetails(paymentState.selectedMethod);
        });
    }
    
    // STEP 2: Account Details
    const step2Back = document.getElementById('paymentStep2Back');
    const step2Next = document.getElementById('paymentStep2Next');
    
    if (step2Back) {
        step2Back.addEventListener('click', function() {
            showPaymentStep(1);
        });
    }
    
    if (step2Next) {
        step2Next.addEventListener('click', function() {
            const accountInput = document.getElementById('paymentAccountInput');
            if (accountInput && !accountInput.value.trim()) {
                showNotification('Please enter your account/phone number', 'warning');
                return;
            }
            paymentState.accountNumber = accountInput ? accountInput.value.trim() : '';
            showPaymentStep(3);
            updatePaymentSummary();
        });
    }
    
    // STEP 3: PIN Confirmation
    const step3Back = document.getElementById('paymentStep3Back');
    const step3Confirm = document.getElementById('paymentStep3Confirm');
    const pinInputs = modalEl.querySelectorAll('.pin-input');
    const pinError = document.getElementById('pinError');
    
    if (step3Back) {
        step3Back.addEventListener('click', function() {
            showPaymentStep(2);
        });
    }
    
    pinInputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            if (this.value.length === 1) {
                if (pinError) pinError.style.display = 'none';
                if (index < pinInputs.length - 1) {
                    pinInputs[index + 1].focus();
                }
            }
        });
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value.length === 0 && index > 0) {
                pinInputs[index - 1].focus();
            }
        });
        
        input.addEventListener('keypress', function(e) {
            if (!/^\d$/.test(e.key)) {
                e.preventDefault();
            }
        });
    });
    
    if (step3Confirm) {
        step3Confirm.addEventListener('click', async function() {
            let pin = '';
            pinInputs.forEach(input => pin += input.value);
            
            if (pin.length !== 4) {
                if (pinError) pinError.style.display = 'block';
                return;
            }
            
            paymentState.pin = pin;
            
            await processPayment(modal);
        });
    }
}

function showPaymentStep(step) {
    const modalEl = document.getElementById('globalActionModal');
    if (!modalEl) return;
    
    for (let i = 1; i <= 3; i++) {
        const stepEl = document.getElementById(`paymentStep${i}`);
        if (stepEl) {
            stepEl.style.display = i === step ? 'block' : 'none';
        }
    }
}

function populateAccountDetails(method) {
    const container = document.getElementById('accountDetailsContainer');
    if (!container) return;
    
    let html = '';
    switch(method) {
        case 'mobile_money':
            html = `
                <div class="mb-3">
                    <label class="fw-bold mb-2"><i class="fas fa-phone me-2"></i>Mobile Money Number</label>
                    <input type="tel" class="form-control form-control-lg" id="paymentAccountInput" placeholder="Enter your M-Pesa/Airtel/Tigo number" maxlength="15">
                    <small class="text-muted">Example: 0712345678</small>
                </div>
                <div class="payment-provider-logos">
                    <span>M-Pesa</span>
                    <span>Airtel Money</span>
                    <span>Tigo Pesa</span>
                    <span>HaloPesa</span>
                </div>
            `;
            break;
        case 'card':
            html = `
                <div class="mb-3">
                    <label class="fw-bold mb-2"><i class="fas fa-credit-card me-2"></i>Card Number</label>
                    <input type="text" class="form-control form-control-lg" id="paymentAccountInput" placeholder="1234 5678 9012 3456" maxlength="19">
                </div>
                <div class="row">
                    <div class="col-6 mb-3">
                        <label class="fw-bold mb-2">Expiry Date</label>
                        <input type="text" class="form-control" placeholder="MM/YY">
                    </div>
                    <div class="col-6 mb-3">
                        <label class="fw-bold mb-2">CVV</label>
                        <input type="password" class="form-control" placeholder="***" maxlength="3">
                    </div>
                </div>
                <div class="mb-3">
                    <label class="fw-bold mb-2">Cardholder Name</label>
                    <input type="text" class="form-control" placeholder="Name on card">
                </div>
            `;
            break;
        case 'bank_transfer':
            html = `
                <div class="mb-3">
                    <label class="fw-bold mb-2"><i class="fas fa-university me-2"></i>Bank Name</label>
                    <select class="form-control form-control-lg" id="paymentAccountInput">
                        <option value="">Select Bank</option>
                        <option value="CRDB">CRDB Bank</option>
                        <option value="NMB">NMB Bank</option>
                        <option value="NBC">NBC Bank</option>
                        <option value="Access Bank">Access Bank</option>
                        <option value="Standard Chartered">Standard Chartered</option>
                        <option value="Equity Bank">Equity Bank</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="fw-bold mb-2">Account Number</label>
                    <input type="text" class="form-control form-control-lg" placeholder="Enter your account number">
                </div>
                <div class="mb-3">
                    <label class="fw-bold mb-2">Account Holder Name</label>
                    <input type="text" class="form-control form-control-lg" placeholder="Full name on account">
                </div>
            `;
            break;
    }
    container.innerHTML = html;
}

function updatePaymentSummary() {
    const methodDisplay = document.getElementById('paymentMethodDisplay');
    const accountDisplay = document.getElementById('accountDisplay');
    
    if (methodDisplay) {
        const methodLabels = {
            'mobile_money': 'Mobile Money',
            'card': 'Card Payment',
            'bank_transfer': 'Bank Transfer'
        };
        methodDisplay.textContent = methodLabels[paymentState.selectedMethod] || paymentState.selectedMethod;
    }
    
    if (accountDisplay) {
        accountDisplay.textContent = paymentState.accountNumber || 'N/A';
    }
}

async function processPayment(modal) {
    try {
        showNotification('Processing payment...', 'info');
        
        const confirmBtn = document.getElementById('paymentStep3Confirm');
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Processing...';
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        let result;
        if (paymentState.payAll) {
            result = await API.payments.payAll(paymentState.selectedMethod);
        } else if (paymentState.bookingId) {
            const amountNum = parseFloat(paymentState.amount.replace(/[^0-9.-]/g, ''));
            result = await API.payments.makePayment({
                booking_id: paymentState.bookingId,
                amount: amountNum,
                payment_method: paymentState.selectedMethod,
                transaction_id: `TXN-${Date.now()}`,
                reference: paymentState.accountNumber || `REF-${Date.now()}`
            });
        }
        
        if (modal) modal.hide();
        
        if (result && result.booking_updated) {
            showNotification('✅ Payment successful! Booking status updated to PAID.', 'success');
            
            try {
                await API.contact.submit({
                    full_name: 'Payment Notification',
                    email: 'admin@cleanspark.co.tz',
                    phone: '0000000000',
                    service_type: 'Payment',
                    subject: `Payment Received - Booking #${paymentState.bookingId}`,
                    message: `Payment of ${paymentState.amount} has been received for booking #${paymentState.bookingId}. Status has been updated to PAID.`,
                    subscribe: false
                });
                console.log('✅ Admin notified about payment');
            } catch (err) {
                console.log('Admin notification failed:', err.message);
            }
            
            if (window.socket) {
                window.socket.emit('payment_updated', {
                    booking_id: paymentState.bookingId,
                    payment_status: 'paid',
                    amount: paymentState.amount
                });
            }
        } else {
            showNotification('✅ Payment successful!', 'success');
        }
        
        await loadOutstandingPayments();
        await loadPaymentHistory();
        await loadBookings('upcoming');
        await loadInvoices();
        
        paymentState = {
            amount: 0,
            bookingId: null,
            invoiceId: null,
            payAll: false,
            selectedMethod: null,
            accountNumber: '',
            pin: ''
        };
        
    } catch (error) {
        console.error('Payment error:', error);
        showNotification(error.message || 'Payment failed. Please try again.', 'danger');
        
        const confirmBtn = document.getElementById('paymentStep3Confirm');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> Confirm Payment';
        }
    }
}

function openPaymentDetailsModal(payment) {
    const bodyHtml = `
        <div class="text-center mb-4">
            <span class="payment-status-badge payment-status-completed">COMPLETED</span>
            <h4 class="fw-bold mt-3">${formatPrice(payment.amount)}</h4>
            <p class="text-muted">${escapeHtml(payment.service_name || 'Payment')}</p>
        </div>
        
        <div class="payment-detail-section">
            <h6 class="fw-bold mb-3"><i class="bi bi-info-circle me-2"></i>Payment Information</h6>
            <div class="payment-detail-row">
                <span class="payment-detail-label">Payment ID</span>
                <span class="payment-detail-value">${escapeHtml(payment.payment_number || payment.id)}</span>
            </div>
            <div class="payment-detail-row">
                <span class="payment-detail-label">Transaction ID</span>
                <span class="payment-detail-value">${escapeHtml(payment.transaction_id || 'N/A')}</span>
            </div>
            <div class="payment-detail-row">
                <span class="payment-detail-label">Payment Method</span>
                <span class="payment-detail-value">${escapeHtml(payment.payment_method || 'N/A')}</span>
            </div>
            <div class="payment-detail-row">
                <span class="payment-detail-label">Payment Date</span>
                <span class="payment-detail-value">${formatDate(payment.payment_date)}</span>
            </div>
            <div class="payment-detail-row">
                <span class="payment-detail-label">Amount</span>
                <span class="payment-detail-value" style="color: #059669; font-size: 1.1rem;">${formatPrice(payment.amount)}</span>
            </div>
        </div>
        
        <div class="payment-detail-section">
            <h6 class="fw-bold mb-3"><i class="bi bi-person me-2"></i>Payer Information</h6>
            <div class="payment-detail-row">
                <span class="payment-detail-label">Name</span>
                <span class="payment-detail-value">${escapeHtml(payment.payer_name || 'N/A')}</span>
            </div>
            <div class="payment-detail-row">
                <span class="payment-detail-label">Email</span>
                <span class="payment-detail-value">${escapeHtml(payment.payer_email || 'N/A')}</span>
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
    
    document.getElementById('downloadReceiptBtn')?.addEventListener('click', async () => {
        try {
            const url = API.payments.downloadReceipt(payment.id);
            window.open(url, '_blank');
            showNotification('Receipt download started', 'success');
        } catch (error) {
            showNotification('Could not download receipt', 'danger');
        }
    });
}

// ==================== FIXED: INVOICES LOAD FUNCTION ====================

async function loadInvoices() {
    const invoiceListEl = document.getElementById('invoiceList');
    if (!invoiceListEl) return;
    
    invoiceListEl.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div><p class="mt-2">Loading invoices...</p></div>';
    
    try {
        const response = await API.bookings.getMyInvoices();
        const invoices = response.invoices || [];
        
        if (invoices.length === 0) {
            invoiceListEl.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-receipt"></i>
                    <h5 class="fw-semibold">No Invoices Found</h5>
                    <p class="text-muted">You don't have any invoices yet.</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="booking-grid">';
        invoices.forEach(invoice => {
            let statusClass = 'invoice-status-pending';
            let statusText = 'Pending';
            let isPaid = false;
            if (invoice.status === 'paid') {
                statusClass = 'invoice-status-paid';
                statusText = 'Paid ✅';
                isPaid = true;
            } else if (invoice.status === 'unpaid') {
                statusClass = 'invoice-status-unpaid';
                statusText = 'Unpaid';
            }
            
            html += `
                <div class="invoice-card" data-invoice-id="${invoice.id}" data-booking-id="${invoice.booking_id}">
                    <div class="invoice-card-header">
                        <div>
                            <span class="invoice-number"><i class="bi bi-receipt me-1"></i> ${escapeHtml(invoice.invoice_number)}</span>
                        </div>
                        <span class="invoice-status ${statusClass}">${statusText}</span>
                    </div>
                    <div class="invoice-body">
                        <div class="invoice-info">
                            <p><i class="bi bi-briefcase"></i> ${escapeHtml(invoice.service_name || 'Cleaning Service')}</p>
                            <p><i class="bi bi-calendar3"></i> ${formatDate(invoice.invoice_date)}</p>
                            <p><i class="bi bi-clock-history"></i> Due: ${formatDate(invoice.due_date)}</p>
                        </div>
                        <div class="invoice-amount">
                            <span class="total">${formatPrice(invoice.total_amount)}</span>
                        </div>
                    </div>
                    <div class="invoice-footer">
                        <button class="btn-invoice-action btn-invoice-download" data-invoice-id="${invoice.id}" data-action="download">
                            <i class="bi bi-download"></i> Download
                        </button>
                        ${!isPaid ? `
                            <button class="btn-invoice-action btn-pay-invoice" data-invoice-id="${invoice.id}" data-booking-id="${invoice.booking_id}" data-amount="${invoice.total_amount}" style="color: #dc3545; font-weight: 600;">
                                <i class="bi bi-credit-card"></i> Pay Now
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        html += '</div>';
        invoiceListEl.innerHTML = html;
        
        // Download button handler
        invoiceListEl.querySelectorAll('.btn-invoice-download').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const invoiceId = btn.dataset.invoiceId;
                
                const token = localStorage.getItem('cleanspark_token') || sessionStorage.getItem('cleanspark_token');
                
                if (!token) {
                    showNotification('Please login first', 'error');
                    window.location.href = 'login.html';
                    return;
                }
                
                const url = API.BASE_URL + `/bookings/invoices/${invoiceId}/download`;
                
                try {
                    showNotification('Downloading invoice...', 'info');
                    
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (!response.ok) {
                        if (response.status === 401 || response.status === 403) {
                            showNotification('Session expired. Please login again.', 'error');
                            window.location.href = 'login.html';
                            return;
                        }
                        throw new Error('Download failed');
                    }
                    
                    const blob = await response.blob();
                    const downloadUrl = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = downloadUrl;
                    a.download = `invoice_${invoiceId}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(downloadUrl);
                    showNotification('Invoice downloaded successfully!', 'success');
                    
                } catch (error) {
                    console.error('Download error:', error);
                    showNotification(error.message || 'Failed to download invoice', 'error');
                }
            });
        });
        
        // ✅ FIX: Pay Now button in invoice menu - passes booking_id correctly
        invoiceListEl.querySelectorAll('.btn-pay-invoice').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const invoiceId = btn.dataset.invoiceId;
                const bookingId = btn.dataset.bookingId;
                const amount = btn.dataset.amount;
                const invoice = invoices.find(i => i.id == invoiceId);
                if (invoice) {
                    // ✅ FIX: Pass the actual booking_id from the invoice
                    const actualBookingId = invoice.booking_id || bookingId;
                    console.log('💰 Pay Invoice clicked:', { invoiceId, bookingId: actualBookingId, amount });
                    showPaymentMethodsWithInvoice(formatPrice(amount), actualBookingId, invoiceId);
                }
            });
        });
        
    } catch (error) {
        console.error('Load invoices error:', error);
        invoiceListEl.innerHTML = `<div class="empty-state"><i class="bi bi-exclamation-triangle"></i><p>Error loading invoices</p></div>`;
    }
}

// ==================== SHOW PAYMENT METHODS WITH INVOICE (FIXED) ====================

function showPaymentMethodsWithInvoice(amount, bookingId, invoiceId) {
    // ✅ FIX: Ensure bookingId is properly handled - convert 'undefined' string to null
    let safeBookingId = bookingId;
    if (safeBookingId === 'undefined' || safeBookingId === 'null' || safeBookingId === undefined || safeBookingId === null) {
        safeBookingId = null;
    } else {
        safeBookingId = parseInt(safeBookingId);
        if (isNaN(safeBookingId)) {
            safeBookingId = null;
        }
    }
    
    paymentState.amount = amount;
    paymentState.bookingId = safeBookingId;
    paymentState.invoiceId = invoiceId;
    paymentState.payAll = false;
    paymentState.selectedMethod = null;
    paymentState.accountNumber = '';
    paymentState.pin = '';
    
    console.log('💰 Payment initiated with:', { amount, bookingId: safeBookingId, invoiceId });
    
    const title = `<i class="bi bi-credit-card me-2"></i>Pay Invoice ${amount}`;
    
    const bodyHtml = `
        <div style="margin-bottom: 20px;">
            <div style="font-size: 1.8rem; font-weight: 800; color: var(--dark-color);">${amount}</div>
            <div style="font-size: 0.85rem; color: var(--gray-color);">Select a payment method to pay this invoice</div>
        </div>
        
        <!-- Step 1: Payment Method -->
        <div class="payment-step" id="paymentStep1">
            <div class="payment-step-label"><i class="bi bi-1-circle-fill text-primary"></i> Choose Payment Method</div>
            <div id="paymentMethodsList">
                <div class="payment-method-option" data-method="mobile_money">
                    <div class="payment-method-icon"><i class="fas fa-mobile-alt"></i></div>
                    <div><strong>Mobile Money</strong><br><span style="font-size:0.8rem;">M-Pesa, Airtel, Tigo, HaloPesa</span></div>
                </div>
                <div class="payment-method-option" data-method="card">
                    <div class="payment-method-icon"><i class="fas fa-credit-card"></i></div>
                    <div><strong>Card Payment</strong><br><span style="font-size:0.8rem;">Visa, Mastercard, Amex</span></div>
                </div>
                <div class="payment-method-option" data-method="bank_transfer">
                    <div class="payment-method-icon"><i class="fas fa-university"></i></div>
                    <div><strong>Bank Transfer</strong><br><span style="font-size:0.8rem;">Direct bank transfer</span></div>
                </div>
            </div>
            <p id="paymentMethodError" class="text-danger mt-2" style="font-size:0.85rem;display:none;">Please select a payment method.</p>
            <button class="btn btn-primary rounded-pill px-4 mt-3" id="paymentStep1Next" disabled>
                Next <i class="bi bi-chevron-right"></i>
            </button>
        </div>
        
        <!-- Step 2: Account Details -->
        <div class="payment-step" id="paymentStep2" style="display:none;">
            <div class="payment-step-label"><i class="bi bi-2-circle-fill text-primary"></i> Enter Payment Details</div>
            <div id="accountDetailsContainer">
                <!-- Dynamic content based on method -->
            </div>
            <div class="d-flex gap-2 mt-3">
                <button class="btn btn-outline-secondary rounded-pill px-4" id="paymentStep2Back">
                    <i class="bi bi-chevron-left"></i> Back
                </button>
                <button class="btn btn-primary rounded-pill px-4" id="paymentStep2Next">
                    Next <i class="bi bi-chevron-right"></i>
                </button>
            </div>
        </div>
        
        <!-- Step 3: PIN Confirmation -->
        <div class="payment-step" id="paymentStep3" style="display:none;">
            <div class="payment-step-label"><i class="bi bi-3-circle-fill text-primary"></i> Confirm Payment</div>
            <div class="payment-summary-box">
                <div class="d-flex justify-content-between">
                    <span>Amount:</span>
                    <span class="fw-bold">${amount}</span>
                </div>
                <div class="d-flex justify-content-between mt-1">
                    <span>Method:</span>
                    <span id="paymentMethodDisplay">-</span>
                </div>
                <div class="d-flex justify-content-between mt-1">
                    <span>Account:</span>
                    <span id="accountDisplay">-</span>
                </div>
            </div>
            <div class="pin-input-container">
                <label class="fw-bold mb-2">Enter your 4-digit PIN</label>
                <div class="pin-input-group">
                    <input type="password" maxlength="1" class="pin-input" data-index="0" autofocus>
                    <input type="password" maxlength="1" class="pin-input" data-index="1">
                    <input type="password" maxlength="1" class="pin-input" data-index="2">
                    <input type="password" maxlength="1" class="pin-input" data-index="3">
                </div>
                <div id="pinError" class="text-danger mt-2" style="font-size:0.85rem;display:none;">Please enter your 4-digit PIN</div>
            </div>
            <div class="d-flex gap-2 mt-3">
                <button class="btn btn-outline-secondary rounded-pill px-4" id="paymentStep3Back">
                    <i class="bi bi-chevron-left"></i> Back
                </button>
                <button class="btn btn-success rounded-pill px-4" id="paymentStep3Confirm">
                    <i class="bi bi-check-circle-fill me-2"></i> Confirm Payment
                </button>
            </div>
        </div>
    `;
    
    const footerHtml = `
        <button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
    `;
    
    const modal = openGlobalModal(title, bodyHtml, footerHtml);
    const modalEl = document.getElementById('globalActionModal');
    
    if (!modalEl) return;
    
    // STEP 1: Payment Method Selection
    const methodOptions = modalEl.querySelectorAll('.payment-method-option');
    const step1Next = document.getElementById('paymentStep1Next');
    const methodError = document.getElementById('paymentMethodError');
    
    methodOptions.forEach(option => {
        option.addEventListener('click', function() {
            methodOptions.forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            paymentState.selectedMethod = this.dataset.method;
            if (methodError) methodError.style.display = 'none';
            if (step1Next) step1Next.disabled = false;
        });
    });
    
    if (step1Next) {
        step1Next.addEventListener('click', function() {
            if (!paymentState.selectedMethod) {
                if (methodError) methodError.style.display = 'block';
                return;
            }
            showPaymentStep(2);
            populateAccountDetails(paymentState.selectedMethod);
        });
    }
    
    // STEP 2: Account Details
    const step2Back = document.getElementById('paymentStep2Back');
    const step2Next = document.getElementById('paymentStep2Next');
    
    if (step2Back) {
        step2Back.addEventListener('click', function() {
            showPaymentStep(1);
        });
    }
    
    if (step2Next) {
        step2Next.addEventListener('click', function() {
            const accountInput = document.getElementById('paymentAccountInput');
            if (accountInput && !accountInput.value.trim()) {
                showNotification('Please enter your account/phone number', 'warning');
                return;
            }
            paymentState.accountNumber = accountInput ? accountInput.value.trim() : '';
            showPaymentStep(3);
            updatePaymentSummary();
        });
    }
    
    // STEP 3: PIN Confirmation
    const step3Back = document.getElementById('paymentStep3Back');
    const step3Confirm = document.getElementById('paymentStep3Confirm');
    const pinInputs = modalEl.querySelectorAll('.pin-input');
    const pinError = document.getElementById('pinError');
    
    if (step3Back) {
        step3Back.addEventListener('click', function() {
            showPaymentStep(2);
        });
    }
    
    pinInputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            if (this.value.length === 1) {
                if (pinError) pinError.style.display = 'none';
                if (index < pinInputs.length - 1) {
                    pinInputs[index + 1].focus();
                }
            }
        });
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value.length === 0 && index > 0) {
                pinInputs[index - 1].focus();
            }
        });
        
        input.addEventListener('keypress', function(e) {
            if (!/^\d$/.test(e.key)) {
                e.preventDefault();
            }
        });
    });
    
    if (step3Confirm) {
        step3Confirm.addEventListener('click', async function() {
            let pin = '';
            pinInputs.forEach(input => pin += input.value);
            
            if (pin.length !== 4) {
                if (pinError) pinError.style.display = 'block';
                return;
            }
            
            paymentState.pin = pin;
            
            await processInvoicePayment(modal);
        });
    }
}

// ==================== PROCESS INVOICE PAYMENT (FIXED) ====================

async function processInvoicePayment(modal) {
    try {
        showNotification('Processing payment...', 'info');
        
        const confirmBtn = document.getElementById('paymentStep3Confirm');
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Processing...';
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // ✅ FIX: Get booking_id from the invoice
        let bookingId = paymentState.bookingId;
        
        // If bookingId is undefined or null, try to get it from the invoice
        if (!bookingId || bookingId === 'undefined' || bookingId === 'null') {
            try {
                const invoiceResponse = await API.bookings.getMyInvoices();
                const invoices = invoiceResponse.invoices || [];
                const invoice = invoices.find(i => i.id == paymentState.invoiceId);
                if (invoice && invoice.booking_id) {
                    bookingId = parseInt(invoice.booking_id);
                    if (!isNaN(bookingId)) {
                        paymentState.bookingId = bookingId;
                        console.log('✅ Retrieved booking_id from invoice:', bookingId);
                    }
                }
            } catch (err) {
                console.error('Failed to get booking from invoice:', err);
            }
        }
        
        // If still no bookingId, try to get it from the booking list
        if (!bookingId || bookingId === 'undefined' || bookingId === 'null' || isNaN(bookingId)) {
            try {
                const bookingsResponse = await API.bookings.getMyBookings();
                const bookings = bookingsResponse.bookings || [];
                const booking = bookings.find(b => b.invoice && b.invoice.id == paymentState.invoiceId);
                if (booking) {
                    bookingId = parseInt(booking.id);
                    if (!isNaN(bookingId)) {
                        paymentState.bookingId = bookingId;
                        console.log('✅ Retrieved booking_id from bookings list:', bookingId);
                    }
                }
            } catch (err) {
                console.error('Failed to get booking from bookings list:', err);
            }
        }
        
        // If still no bookingId, use null (allow NULL in database)
        if (!bookingId || bookingId === 'undefined' || bookingId === 'null' || isNaN(bookingId)) {
            bookingId = null;
            console.log('⚠️ No valid booking_id found, using NULL');
        }
        
        // Update the invoice status to paid
        if (paymentState.invoiceId) {
            try {
                await API.invoices.updateStatus(paymentState.invoiceId, 'paid');
                console.log(`✅ Invoice #${paymentState.invoiceId} status updated to PAID`);
            } catch (err) {
                console.error('Failed to update invoice status:', err);
            }
        }
        
        // Process payment with the correct booking_id
        let result;
        if (bookingId) {
            const amountNum = parseFloat(paymentState.amount.replace(/[^0-9.-]/g, ''));
            result = await API.payments.makePayment({
                booking_id: bookingId,
                amount: amountNum,
                payment_method: paymentState.selectedMethod,
                transaction_id: `TXN-${Date.now()}`,
                reference: paymentState.accountNumber || `REF-${Date.now()}`
            });
        } else {
            // If no booking_id, create payment without booking_id
            const amountNum = parseFloat(paymentState.amount.replace(/[^0-9.-]/g, ''));
            result = await API.payments.makePayment({
                booking_id: null,
                amount: amountNum,
                payment_method: paymentState.selectedMethod,
                transaction_id: `TXN-${Date.now()}`,
                reference: paymentState.accountNumber || `REF-${Date.now()}`
            });
        }
        
        if (modal) modal.hide();
        
        if (result && result.booking_updated) {
            showNotification('✅ Payment successful! Invoice marked as PAID.', 'success');
        } else {
            showNotification('✅ Payment successful!', 'success');
        }
        
        // Refresh all data
        await loadOutstandingPayments();
        await loadPaymentHistory();
        await loadBookings('upcoming');
        await loadInvoices();
        
        // Reset payment state
        paymentState = {
            amount: 0,
            bookingId: null,
            invoiceId: null,
            payAll: false,
            selectedMethod: null,
            accountNumber: '',
            pin: ''
        };
        
    } catch (error) {
        console.error('Payment error:', error);
        showNotification(error.message || 'Payment failed. Please try again.', 'danger');
        
        const confirmBtn = document.getElementById('paymentStep3Confirm');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> Confirm Payment';
        }
    }
}

// ----------------------------- FEEDBACK -----------------------------

async function submitFeedback(rating, comment) {
    try {
        await API.feedback.submit({
            rating: rating,
            feedback_text: comment,
            is_public: 1
        });
        showNotification('Thank you for your feedback!', 'success');
        return true;
    } catch (error) {
        console.error('Submit feedback error:', error);
        showNotification(error.message || 'Failed to submit feedback', 'danger');
        return false;
    }
}

async function loadPublicFeedbacks() {
    try {
        const response = await API.feedback.getPublic({ limit: 5 });
        console.log('Public feedbacks:', response);
    } catch (error) {
        console.error('Load feedbacks error:', error);
    }
}

// ----------------------------- SUPPORT -----------------------------

function openChatbot() {
    if (window.CleanSparkChatbot && window.CleanSparkChatbot.toggleChatbot) {
        window.CleanSparkChatbot.toggleChatbot();
    } else {
        showNotification('Chatbot is loading...', 'info');
    }
}

// ----------------------------- PANEL RENDERERS -----------------------------

const panelRenderers = {
    bookings: () => `
        <div class="section-header"><h1 class="page-title"><i class="bi bi-journal-bookmark-fill text-primary me-2"></i>My Bookings</h1></div>
        <div class="tabs" id="filterTabs">
            <button class="tab active" data-type="upcoming"><i class="bi bi-calendar-week"></i> Upcoming</button>
            <button class="tab" data-type="delivered"><i class="bi bi-truck"></i> Delivered</button>
            <button class="tab" data-type="cancelled"><i class="bi bi-x-circle"></i> Cancelled</button>
        </div>
        <div id="bookingList" class="booking-box"></div>
    `,
    
    payments: () => `
        <div class="section-header"><h1 class="page-title"><i class="bi bi-credit-card-2-front text-primary me-2"></i>Payments</h1></div>
        <h5 class="fw-bold mb-3 ms-2"><i class="bi bi-exclamation-triangle text-danger me-2"></i>Outstanding Balances</h5>
        <div id="outstandingList"></div>
        <h5 class="fw-bold mb-3 mt-4 ms-2"><i class="bi bi-clock-history text-success me-2"></i>Payment History</h5>
        <div id="paymentHistoryList"></div>
    `,
    
    invoices: () => `
        <div class="section-header"><h1 class="page-title"><i class="bi bi-receipt text-primary me-2"></i>My Invoices</h1></div>
        <p class="text-muted mb-4 ms-2">View and manage all your invoices from CleanSpark services.</p>
        <div id="invoiceList" class="booking-box"></div>
    `,
    
    support: () => `
        <div class="section-header"><h1 class="page-title"><i class="bi bi-headset text-primary me-2"></i>Support Center</h1></div>
        <p class="text-muted mb-3 ms-2">Select a support option below to view details.</p>
        <div class="booking-grid" id="supportCards"></div>
    `,
    
    feedback: () => `
        <div class="section-header"><h1 class="page-title"><i class="bi bi-chat-dots text-primary me-2"></i>Feedback</h1></div>
        <div class="settings-card p-4">
            <div class="text-center mb-4">
                <i class="bi bi-emoji-smile text-warning" style="font-size: 4rem;"></i>
                <h4 class="fw-bold mt-3">We'd Love to Hear From You!</h4>
                <p class="text-muted">Your feedback helps us serve you better and improve our services.</p>
            </div>
            <div class="feedback-form">
                <label class="fw-bold mb-3 d-block text-center">How was your overall experience?</label>
                <div class="rating-emoji-group" id="feedbackEmojiGroup">
                    <span class="emoji-option" data-value="very_sad" title="Very Bad">😡</span>
                    <span class="emoji-option" data-value="sad" title="Bad">😟</span>
                    <span class="emoji-option" data-value="neutral" title="Okay">😐</span>
                    <span class="emoji-option" data-value="happy" title="Good">😊</span>
                    <span class="emoji-option" data-value="very_happy" title="Excellent">😍</span>
                </div>
                <label class="fw-bold mb-2 mt-4 d-block">Your Detailed Feedback</label>
                <textarea rows="5" placeholder="Tell us what you loved, what could be better, or any suggestions..." id="feedbackText"></textarea>
                <button class="btn btn-primary rounded-pill px-5 py-2 mt-3 d-block mx-auto" id="submitFeedbackBtn">
                    <i class="bi bi-send-fill me-2"></i> Submit Feedback
                </button>
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
                <p class="text-muted">${hasAgreed ? 'You have already agreed to our Terms & Conditions. You can review them anytime below.' : 'Please take a moment to read our updated Terms & Conditions.'}</p>
                <button class="btn btn-primary rounded-pill px-5 py-2 mt-3" id="openTermsModalBtn">
                    <i class="bi bi-file-earmark-text me-2"></i> ${hasAgreed ? 'View Terms & Conditions' : 'Read Terms & Conditions'}
                </button>
            </div>
        `;
    },
    
    logout: () => `
        <div class="section-header"><h1 class="page-title"><i class="bi bi-box-arrow-right text-muted me-2"></i>Logout</h1></div>
        <div class="settings-card text-center p-5">
            <i class="bi bi-person-check" style="font-size: 4rem; color: var(--gray-color);"></i>
            <h4 class="fw-bold mt-3">Ready to Leave?</h4>
            <p class="text-muted">Are you sure you want to sign out of your account?</p>
            <button class="btn btn-warning rounded-pill px-5 py-2 mt-3" id="openLogoutModalBtn">
                <i class="bi bi-box-arrow-right me-2"></i> Sign Out
            </button>
        </div>
    `
};

async function renderPanel(menuType) {
    const renderer = panelRenderers[menuType];
    if (!renderer) {
        document.getElementById('dynamicPanel').innerHTML = `<div class="empty-state"><i class="bi bi-grid"></i><h4>CleanSpark Dashboard</h4><p>Select an option from the menu</p></div>`;
        return;
    }
    
    document.getElementById('dynamicPanel').innerHTML = renderer();
    closeSidebar();
    
    setTimeout(async () => {
        switch(menuType) {
            case 'bookings':
                const tabs = document.querySelectorAll('.tab');
                loadBookings('upcoming');
                tabs.forEach(tab => {
                    tab.addEventListener('click', function() {
                        tabs.forEach(t => t.classList.remove('active'));
                        this.classList.add('active');
                        loadBookings(this.dataset.type);
                    });
                });
                break;
                
            case 'payments':
                await loadOutstandingPayments();
                await loadPaymentHistory();
                break;
                
            case 'invoices':
                await loadInvoices();
                break;
                
            case 'support':
                const supportCards = document.getElementById('supportCards');
                if (supportCards) {
                    supportCards.innerHTML = `
                        <div class="support-card" onclick="openChatbot()">
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
                            </div>
                            <div class="mt-3 p-3 bg-light rounded-3" id="callUsDetails" style="display:none;">
                                <h6 class="fw-bold"><i class="bi bi-headset me-2"></i>Customer Support Hours</h6>
                                <p class="mb-1"><strong>General Line:</strong> <a href="tel:+255777123456">+255 777 123 456</a></p>
                                <p class="mb-1"><strong>Email:</strong> <a href="mailto:info@cleanspark.co.tz">info@cleanspark.co.tz</a></p>
                                <p class="mb-0 small text-muted">Available Mon-Sat: 8AM - 8PM (EAT)</p>
                            </div>
                        </div>
                    `;
                    document.getElementById('callUsCard')?.addEventListener('click', () => {
                        const details = document.getElementById('callUsDetails');
                        if (details) details.style.display = details.style.display === 'none' ? 'block' : 'none';
                    });
                }
                break;
                
            case 'feedback':
                let selectedRating = null;
                document.querySelectorAll('.emoji-option').forEach(emoji => {
                    emoji.addEventListener('click', function() {
                        document.querySelectorAll('.emoji-option').forEach(e => e.classList.remove('selected'));
                        this.classList.add('selected');
                        selectedRating = this.dataset.value;
                    });
                });
                
                document.getElementById('submitFeedbackBtn')?.addEventListener('click', async () => {
                    const comment = document.getElementById('feedbackText')?.value.trim() || '';
                    if (!selectedRating) {
                        showNotification('Please select an emoji rating first!', 'warning');
                        return;
                    }
                    if (!comment || comment.length < 10) {
                        showNotification('Please write a meaningful comment (min 10 characters)', 'warning');
                        return;
                    }
                    
                    const success = await submitFeedback(selectedRating, comment);
                    if (success) {
                        document.querySelectorAll('.emoji-option').forEach(e => e.classList.remove('selected'));
                        document.getElementById('feedbackText').value = '';
                        selectedRating = null;
                    }
                });
                break;
                
            case 'terms':
                document.getElementById('openTermsModalBtn')?.addEventListener('click', () => {
                    const bodyHtml = `
                        <div class="terms-scroll">
                            <h5 class="terms-section-title">1. Introduction</h5>
                            <p>Welcome to CleanSpark. By accessing or using our cleaning services, you agree to be bound by these Terms and Conditions.</p>
                            <h5 class="terms-section-title">2. Services Provided</h5>
                            <p>CleanSpark provides professional residential and commercial cleaning services including but not limited to: deep cleaning, carpet cleaning, office cleaning, sanitization services, and more.</p>
                            <h5 class="terms-section-title">3. Booking and Scheduling</h5>
                            <p>Clients may book services through our website or mobile application. Bookings are confirmed upon receipt of a confirmation notification.</p>
                            <h5 class="terms-section-title">4. Cancellation & Rescheduling</h5>
                            <p>Free cancellation is available up to 24 hours before the scheduled service time. Cancellations made less than 24 hours in advance may incur a 25% fee.</p>
                            <h5 class="terms-section-title">5. Pricing and Payment</h5>
                            <p>All prices are quoted in Tanzanian Shillings (TZS). Payment is due upon completion of services unless alternative arrangements have been made.</p>
                            <h5 class="terms-section-title">6. Privacy and Data Protection</h5>
                            <p>We collect and process personal information in accordance with applicable data protection laws.</p>
                            <p class="mt-4"><strong>Last Updated:</strong> June 2026</p>
                        </div>
                        <div class="form-check mt-3">
                            <input class="form-check-input" type="checkbox" id="agreeTermsCheck">
                            <label class="form-check-label fw-medium" for="agreeTermsCheck">I have read and agree to the Terms & Conditions.</label>
                        </div>
                    `;
                    const footerHtml = `<button class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                                       <button class="btn btn-primary rounded-pill px-4" id="confirmAgreeBtn" disabled>I Agree</button>`;
                    
                    const modal = openGlobalModal('<i class="bi bi-file-earmark-text me-2"></i>Terms & Conditions', bodyHtml, footerHtml);
                    
                    const checkbox = document.getElementById('agreeTermsCheck');
                    const agreeBtn = document.getElementById('confirmAgreeBtn');
                    if (checkbox && agreeBtn) {
                        checkbox.addEventListener('change', () => { agreeBtn.disabled = !checkbox.checked; });
                        agreeBtn.addEventListener('click', () => {
                            if (modal) modal.hide();
                            sessionStorage.setItem('cleanspark_terms_agreed', 'true');
                            sessionStorage.setItem('cleanspark_terms_agreed_date', new Date().toLocaleDateString());
                            showNotification('Thank you! You have agreed to the Terms & Conditions.', 'success');
                            setTimeout(() => renderPanel('terms'), 500);
                        });
                    }
                });
                break;
                
            case 'logout':
                document.getElementById('openLogoutModalBtn')?.addEventListener('click', () => {
                    const modal = openGlobalModal(
                        '<i class="bi bi-box-arrow-right me-2"></i>Confirm Logout',
                        `<div class="text-center">
                            <i class="bi bi-box-arrow-right text-warning" style="font-size: 3rem;"></i>
                            <h5 class="fw-bold mt-3">Sign Out of CleanSpark?</h5>
                            <p class="text-muted">Are you sure you want to sign out?</p>
                        </div>`,
                        `<button class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                         <button class="btn btn-warning rounded-pill px-4" id="confirmLogoutBtn">Sign Out</button>`
                    );
                    document.getElementById('confirmLogoutBtn')?.addEventListener('click', () => {
                        if (modal) modal.hide();
                        logoutUser();
                    });
                });
                break;
        }
    }, 100);
}

function showNotificationsPanel() {
    openGlobalModal('<i class="bi bi-bell me-2"></i>Notifications', '<p class="text-center text-muted">No new notifications</p>');
}

// ----------------------------- DASHBOARD INIT -----------------------------

function initDashboard() {
    const menuItems = document.querySelectorAll('.menu li');
    if (!menuItems.length) return;
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const menuType = this.dataset.menu;
            menuItems.forEach(li => li.classList.remove('active'));
            this.classList.add('active');
            renderPanel(menuType);
        });
    });
    
    const hamburger = document.getElementById('hamburgerToggle');
    const sidebarClose = document.getElementById('sidebarCloseBtn');
    const overlay = document.getElementById('mobileOverlay');
    
    hamburger?.addEventListener('click', (e) => { e.stopPropagation(); openSidebar(); });
    sidebarClose?.addEventListener('click', closeSidebar);
    overlay?.addEventListener('click', closeSidebar);
    window.addEventListener('resize', () => { if (window.innerWidth > 992) closeSidebar(); });
    
    const notificationIcon = document.getElementById('notificationIcon');
    notificationIcon?.addEventListener('click', showNotificationsPanel);
    
    const newsletterForm = document.querySelector('.footer .newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            if (emailInput?.value && validateEmail(emailInput.value)) {
                try {
                    await API.contact.submit({
                        full_name: 'Newsletter Subscriber',
                        email: emailInput.value,
                        phone: '0000000000',
                        service_type: 'Newsletter',
                        subject: 'Newsletter Subscription',
                        message: 'I would like to subscribe to the CleanSpark newsletter.',
                        subscribe: true
                    });
                    showNotification('Thank you for subscribing!', 'success');
                    emailInput.value = '';
                } catch (error) {
                    showNotification('Subscription failed', 'danger');
                }
            } else {
                showNotification('Please enter a valid email address', 'danger');
            }
        });
    }
    
    renderPanel('bookings');
    const bookingsMenuItem = document.querySelector('.menu li[data-menu="bookings"]');
    if (bookingsMenuItem) {
        menuItems.forEach(li => li.classList.remove('active'));
        bookingsMenuItem.classList.add('active');
    }
    
    loadPublicFeedbacks();
}

// ----------------------------- INITIALIZATION -----------------------------

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Tracking page loaded, checking authentication...');
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (typeof API === 'undefined') {
        console.error('API not loaded! Waiting...');
        await new Promise(resolve => setTimeout(resolve, 500));
        if (typeof API === 'undefined') {
            console.error('API still not loaded, redirecting to login');
            window.location.href = 'login.html';
            return;
        }
    }
    
    const isAuthenticated = await checkAuthAndLoad();
    
    if (!isAuthenticated) {
        console.log('Not authenticated, showing login overlay');
    } else {
        console.log('Authenticated, dashboard ready');
    }
});

if (document.readyState === 'loading') {
    // Waiting for DOMContentLoaded
} else {
    console.log('DOM already loaded, checking auth immediately...');
    setTimeout(async () => {
        if (typeof API !== 'undefined') {
            await checkAuthAndLoad();
        }
    }, 100);
}

// Expose global functions
window.showNotification = showNotification;
window.closeSidebar = closeSidebar;
window.openSidebar = openSidebar;
window.openGlobalModal = openGlobalModal;
window.showPaymentMethods = showPaymentMethods;
window.showPaymentMethodsWithInvoice = showPaymentMethodsWithInvoice;
window.logoutUser = logoutUser;
window.openChatbot = openChatbot;
window.renderPanel = renderPanel;
window.redirectToLogin = redirectToLogin;