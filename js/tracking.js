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
    
    // Update avatar with profile picture support
    if (avatarEl) {
        // Check for profile photo in various possible fields
        const profilePhoto = userData.profile_photo || userData.photo || userData.avatar;
        
        if (profilePhoto && profilePhoto !== 'null' && profilePhoto !== 'undefined') {
            // Construct full URL for the profile photo
            let photoUrl = profilePhoto;
            if (!photoUrl.startsWith('http') && !photoUrl.startsWith('data:')) {
                // Remove leading slash if present to avoid double slashes
                const cleanPath = profilePhoto.startsWith('/') ? profilePhoto.substring(1) : profilePhoto;
                photoUrl = `${API.BASE_URL.replace('/api', '')}/${cleanPath}`;
            }
            
            // Create image element for avatar
            avatarEl.innerHTML = `<img src="${photoUrl}" alt="${escapeHtml(name)}" onerror="this.parentElement.innerHTML='${getInitials(name)}'; this.parentElement.style.display='flex'; this.parentElement.style.alignItems='center'; this.parentElement.style.justifyContent='center';">`;
            avatarEl.style.display = 'flex';
            avatarEl.style.alignItems = 'center';
            avatarEl.style.justifyContent = 'center';
        } else {
            // Fallback to initials
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

// ----------------------------- BOOKINGS -----------------------------

let allBookings = [];

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
        } else if (type === 'unpaid') {
            filteredBookings = allBookings.filter(b => b.payment?.payment_status === 'unpaid');
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
            } else if (booking.payment?.payment_status === 'unpaid') {
                badgeClass = 'badge-unpaid';
                badgeText = 'Unpaid';
            }
            
            const serviceName = booking.service?.name || 'Cleaning Service';
            const serviceDate = booking.schedule?.date || 'Date TBD';
            const address = booking.location?.address || booking.property?.address || 'Address provided';
            const price = formatPrice(booking.payment?.total_price || 0);
            const isPaid = booking.payment?.payment_status === 'paid';
            
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
                                    <span><i class="bi bi-cash-stack me-1 text-secondary"></i> ${price}</span>
                                </div>
                            </div>
                        </div>
                        <div class="mt-2 mt-sm-0 d-flex align-items-center flex-wrap gap-1">
                            <span class="booking-badge ${badgeClass}">${badgeText.toUpperCase()}</span>
                            ${!isPaid && status !== 'cancelled' && status !== 'completed' ? `
                                <button class="btn btn-sm btn-danger ms-2 rounded-pill pay-now-btn" data-booking-id="${booking.id}">Pay Now</button>
                            ` : ''}
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
                if (e.target.closest('.pay-now-btn')) return;
                const bookingId = parseInt(this.dataset.bookingId);
                openStaffModal(bookingId);
            });
        });
        
        bookingListEl.querySelectorAll('.pay-now-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const bookingId = parseInt(btn.dataset.bookingId);
                const booking = allBookings.find(b => b.id === bookingId);
                if (booking) {
                    const amount = formatPrice(booking.payment?.total_price || 0);
                    showPaymentMethods(amount, bookingId);
                }
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

// ----------------------------- PAYMENTS -----------------------------

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

function showPaymentMethods(amount, specificBookingId = null, payAll = false) {
    const title = `<i class="bi bi-credit-card me-2"></i>Pay ${amount}`;
    
    const bodyHtml = `
        <div style="margin-bottom: 20px;">
            <div style="font-size: 1.8rem; font-weight: 800; color: var(--dark-color);">${amount}</div>
            <div style="font-size: 0.85rem; color: var(--gray-color);">Select a payment method below</div>
        </div>
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
    `;
    
    const footerHtml = `
        <button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-primary rounded-pill px-4" id="proceedPaymentBtn">Proceed</button>
    `;
    
    const modal = openGlobalModal(title, bodyHtml, footerHtml);
    const modalEl = document.getElementById('globalActionModal');
    let selectedMethod = null;
    
    if (modalEl) {
        modalEl.querySelectorAll('.payment-method-option').forEach(option => {
            option.addEventListener('click', function() {
                modalEl.querySelectorAll('.payment-method-option').forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
                selectedMethod = this.dataset.method;
                const errorEl = document.getElementById('paymentMethodError');
                if (errorEl) errorEl.style.display = 'none';
            });
        });
        
        const proceedBtn = document.getElementById('proceedPaymentBtn');
        if (proceedBtn) {
            proceedBtn.addEventListener('click', async () => {
                if (!selectedMethod) {
                    document.getElementById('paymentMethodError').style.display = 'block';
                    return;
                }
                if (modal) modal.hide();
                
                showNotification('Processing payment...', 'info');
                
                try {
                    if (payAll) {
                        await API.payments.payAll(selectedMethod);
                        showNotification('Payment successful! All outstanding balances paid.', 'success');
                    } else if (specificBookingId) {
                        const amountNum = parseFloat(amount.replace(/[^0-9.-]/g, ''));
                        await API.payments.makePayment({
                            booking_id: specificBookingId,
                            amount: amountNum,
                            payment_method: selectedMethod
                        });
                        showNotification('Payment successful!', 'success');
                    }
                    
                    await loadOutstandingPayments();
                    await loadPaymentHistory();
                    await loadBookings('unpaid');
                    
                } catch (error) {
                    console.error('Payment error:', error);
                    showNotification(error.message || 'Payment failed', 'danger');
                }
            });
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

// ----------------------------- INVOICES -----------------------------

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
            if (invoice.status === 'paid') {
                statusClass = 'invoice-status-paid';
                statusText = 'Paid';
            } else if (invoice.status === 'unpaid') {
                statusClass = 'invoice-status-unpaid';
                statusText = 'Unpaid';
            }
            
            html += `
                <div class="invoice-card" data-invoice-id="${invoice.id}">
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
                        ${invoice.status !== 'paid' ? `
                            <button class="btn-invoice-action" data-invoice-id="${invoice.id}" data-action="pay" style="color: #dc3545;">
                                <i class="bi bi-credit-card"></i> Pay Now
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        html += '</div>';
        invoiceListEl.innerHTML = html;
        
        invoiceListEl.querySelectorAll('.btn-invoice-download').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const invoiceId = btn.dataset.invoiceId;
                const url = API.bookings.downloadInvoice(invoiceId);
                window.open(url, '_blank');
                showNotification('Download started', 'success');
            });
        });
        
        invoiceListEl.querySelectorAll('[data-action="pay"]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const invoiceId = btn.dataset.invoiceId;
                const invoice = invoices.find(i => i.id == invoiceId);
                if (invoice) {
                    showPaymentMethods(formatPrice(invoice.total_amount), null, false);
                }
            });
        });
        
    } catch (error) {
        console.error('Load invoices error:', error);
        invoiceListEl.innerHTML = `<div class="empty-state"><i class="bi bi-exclamation-triangle"></i><p>Error loading invoices</p></div>`;
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
            <button class="tab" data-type="unpaid"><i class="bi bi-exclamation-triangle"></i> Unpaid</button>
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
window.logoutUser = logoutUser;
window.openChatbot = openChatbot;
window.renderPanel = renderPanel;
window.redirectToLogin = redirectToLogin;