// ========== STORAGE KEYS ==========
const STORAGE_KEYS = {
    PROFILE: 'csms_profile',
    LOCATIONS: 'csms_locations',
    PAYMENT_METHODS: 'csms_payment_methods',
    NOTIFICATIONS: 'csms_notifications',
    PREFERENCES: 'csms_preferences',
    SERVICE_HISTORY: 'csms_service_history',
    IS_LOGGED_IN: 'csms_is_logged_in'
};

// ========== INITIAL DATA ==========
let currentUser = {
    firstName: 'Aly',
    lastName: 'Hassan',
    email: 'aly@csms.co.tz',
    phone: '+255 777 123 456'
};

// ========== ACCESS CONTROL ==========
/**
 * Checks whether the current user is authenticated.
 * 
 * For demo/prototype purposes this reads a flag from localStorage.
 * In a real application replace this with a server-side session/token check.
 *
 * To simulate a logged-in user in the browser console run:
 *   localStorage.setItem('csms_is_logged_in', 'true')
 * To simulate a logged-out user:
 *   localStorage.removeItem('csms_is_logged_in')
 */
function isUserLoggedIn() {
    return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
}

function enforceAccessControl() {
    const overlay = document.getElementById('accessControlOverlay');
    const mainContent = document.getElementById('mainContent');
    const footer = document.querySelector('.footer');

    if (!isUserLoggedIn()) {
        // Show the access-denied overlay
        if (overlay) {
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
        // Visually hide (but keep in DOM) main content so the page doesn't flash
        if (mainContent) mainContent.style.visibility = 'hidden';
        if (footer) footer.style.visibility = 'hidden';
        return false; // not authorised
    }

    // User is logged in — make sure overlay is hidden
    if (overlay) overlay.style.display = 'none';
    if (mainContent) mainContent.style.visibility = 'visible';
    if (footer) footer.style.visibility = 'visible';
    document.body.style.overflow = 'auto';
    return true;
}

// ========== DOM READY ==========
document.addEventListener('DOMContentLoaded', () => {
    // ---- DEMO CONVENIENCE ----
    // For this prototype we auto-set the login flag so the page works out-of-the-box.
    // Remove or replace this line when you integrate real authentication.
    if (localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === null) {
        localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    }
    // --------------------------

    // Enforce access before rendering anything
    if (!enforceAccessControl()) {
        return; // Stop further initialisation for unauthenticated users
    }

    // Initialize data
    initializeData();

    // Load all saved data
    loadProfileData();
    loadLocations();
    loadPaymentMethods();
    loadServiceHistory();
    loadNotifications();
    loadPreferences();

    // Setup event listeners
    setupEventListeners();
    setupMenuClickHandlers();
    setupPasswordStrength();
    setupSidebarFunctions();

    // Initialize profile picture
    initProfilePicture();

    // Setup modals
    setupPaymentModal();
    setupLogoutModal();
    setupDeleteAccountModal();
});

// ========== SIDEBAR FUNCTIONS ==========
function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.style.width = '280px';
        document.body.style.overflow = 'hidden';
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.style.width = '0';
        document.body.style.overflow = 'auto';
    }
}

function setupSidebarFunctions() {
    window.openSidebar = openSidebar;
    window.closeSidebar = closeSidebar;

    document.addEventListener('click', function (event) {
        const sidebar = document.getElementById('sidebar');
        const hamburger = document.querySelector('.hamburger');
        if (sidebar && hamburger) {
            const isClickInside = sidebar.contains(event.target);
            const isClickOnHamburger = hamburger.contains(event.target);
            if (!isClickInside && !isClickOnHamburger && sidebar.style.width === '280px') {
                closeSidebar();
            }
        }
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth > 992) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar && sidebar.style.width === '280px') {
                closeSidebar();
            }
        }
    });
}

// ========== PROFILE PICTURE FUNCTIONS ==========
function initProfilePicture() {
    const uploadInput = document.getElementById('profilePictureUpload');
    const profilePicture = document.getElementById('profilePicture');
    const profileImage = document.getElementById('profileImage');
    const removeBtn = document.getElementById('removeProfilePicture');

    if (!profilePicture) return;

    const profileIcon = profilePicture.querySelector('i');

    const savedImage = localStorage.getItem('csms_profile_picture');
    if (savedImage && profileImage && profileIcon) {
        profileImage.src = savedImage;
        profileImage.style.display = 'block';
        profileIcon.style.display = 'none';
        if (removeBtn) removeBtn.style.display = 'inline-block';
        updateSidebarAvatar(savedImage);
        updateLogoutAvatar(savedImage);
        updateDeleteAvatar(savedImage);
    }

    if (uploadInput) {
        uploadInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                if (!file.type.match('image.*')) {
                    showNotification('Please select an image file (JPG, PNG)', 'error');
                    return;
                }
                if (file.size > 2 * 1024 * 1024) {
                    showNotification('Image size should be less than 2MB', 'error');
                    return;
                }
                const reader = new FileReader();
                reader.onload = function (event) {
                    const imageData = event.target.result;
                    if (profileImage) {
                        profileImage.src = imageData;
                        profileImage.style.display = 'block';
                    }
                    if (profileIcon) profileIcon.style.display = 'none';
                    if (removeBtn) removeBtn.style.display = 'inline-block';
                    localStorage.setItem('csms_profile_picture', imageData);
                    updateSidebarAvatar(imageData);
                    updateLogoutAvatar(imageData);
                    updateDeleteAvatar(imageData);
                    showNotification('Profile picture updated successfully!', 'success');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (removeBtn) {
        removeBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (profileImage) {
                profileImage.src = '';
                profileImage.style.display = 'none';
            }
            if (profileIcon) profileIcon.style.display = 'flex';
            removeBtn.style.display = 'none';
            localStorage.removeItem('csms_profile_picture');
            resetSidebarAvatar();
            resetLogoutAvatar();
            resetDeleteAvatar();
            showNotification('Profile picture removed successfully!', 'success');
        });
    }

    if (profilePicture) {
        profilePicture.addEventListener('click', function () {
            if (uploadInput) uploadInput.click();
        });
    }
}

function updateSidebarAvatar(imageData) {
    const sidebarAvatar = document.querySelector('.user-avatar');
    if (sidebarAvatar) {
        sidebarAvatar.innerHTML = '';
        const img = document.createElement('img');
        img.src = imageData;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;';
        sidebarAvatar.appendChild(img);
    }
}

function resetSidebarAvatar() {
    const sidebarAvatar = document.querySelector('.user-avatar');
    if (sidebarAvatar) {
        const profile = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE));
        const initial = profile?.firstName ? profile.firstName.charAt(0).toUpperCase() : 'U';
        sidebarAvatar.innerHTML = '';
        const span = document.createElement('span');
        span.className = 'initial';
        span.textContent = initial;
        sidebarAvatar.appendChild(span);
    }
}

function updateLogoutAvatar(imageData) {
    const logoutAvatar = document.getElementById('logoutAvatar');
    if (logoutAvatar) {
        logoutAvatar.innerHTML = '';
        const img = document.createElement('img');
        img.src = imageData;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;';
        logoutAvatar.appendChild(img);
    }
}

function resetLogoutAvatar() {
    const logoutAvatar = document.getElementById('logoutAvatar');
    if (logoutAvatar) {
        const profile = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE));
        const initial = profile?.firstName ? profile.firstName.charAt(0).toUpperCase() : 'U';
        logoutAvatar.innerHTML = '';
        const span = document.createElement('span');
        span.className = 'initial-large';
        span.textContent = initial;
        logoutAvatar.appendChild(span);
    }
}

function updateDeleteAvatar(imageData) {
    const deleteAvatar = document.getElementById('deleteAvatar');
    if (deleteAvatar) {
        deleteAvatar.innerHTML = '';
        const img = document.createElement('img');
        img.src = imageData;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;';
        deleteAvatar.appendChild(img);
    }
}

function resetDeleteAvatar() {
    const deleteAvatar = document.getElementById('deleteAvatar');
    if (deleteAvatar) {
        const profile = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE));
        const initial = profile?.firstName ? profile.firstName.charAt(0).toUpperCase() : 'U';
        deleteAvatar.innerHTML = '';
        const span = document.createElement('span');
        span.className = 'initial-large';
        span.textContent = initial;
        deleteAvatar.appendChild(span);
    }
}

// ========== INITIALIZE DATA ==========
function initializeData() {
    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(currentUser));
    }

    if (!localStorage.getItem(STORAGE_KEYS.LOCATIONS)) {
        const defaultLocations = [
            { id: 1, name: 'Home - Stone Town, Unguja', icon: 'fa-home' },
            { id: 2, name: 'Office - Vikokotoni Business Hub', icon: 'fa-briefcase' }
        ];
        localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(defaultLocations));
    }

    if (!localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS)) {
        const defaultPayments = [
            {
                id: 1,
                type: 'Mobile Money',
                accountNumber: '+255 777 123 456',
                accountHolder: 'Aly Hassan',
                notes: 'M-Pesa',
                icon: 'fa-mobile-alt'
            },
            {
                id: 2,
                type: 'Credit Card',
                accountNumber: '**** **** **** 1234',
                accountHolder: 'Aly Hassan',
                notes: 'Visa Card',
                icon: 'fa-credit-card'
            }
        ];
        localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(defaultPayments));
    }

    if (!localStorage.getItem(STORAGE_KEYS.SERVICE_HISTORY)) {
        const defaultHistory = [
            {
                id: 1,
                serviceType: 'Deep House Cleaning',
                serviceIcon: 'fa-home',
                status: 'completed',
                date: '2024-12-15',
                time: '10:00 AM',
                duration: '4 hours',
                staff: 'Mohammed Ali',
                location: 'Stone Town, Unguja',
                price: '120,000 TZS',
                rating: 5
            },
            {
                id: 2,
                serviceType: 'Office Cleaning',
                serviceIcon: 'fa-building',
                status: 'completed',
                date: '2024-12-10',
                time: '08:00 AM',
                duration: '3 hours',
                staff: 'Fatima Hassan',
                location: 'Vikokotoni Business Hub',
                price: '200,000 TZS',
                rating: 4
            },
            {
                id: 3,
                serviceType: 'Carpet Cleaning',
                serviceIcon: 'fa-rug',
                status: 'in-progress',
                date: '2024-12-20',
                time: '02:00 PM',
                duration: '2 hours',
                staff: 'Juma Khamis',
                location: 'Home - Stone Town',
                price: '80,000 TZS',
                rating: null
            }
        ];
        localStorage.setItem(STORAGE_KEYS.SERVICE_HISTORY, JSON.stringify(defaultHistory));
    }

    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify({ email: true, web: false }));
    }

    if (!localStorage.getItem(STORAGE_KEYS.PREFERENCES)) {
        localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify({
            language: 'en',
            timezone: 'UTC+3',
            autoConfirm: false
        }));
    }
}

// ========== PROFILE FUNCTIONS ==========
function loadProfileData() {
    const profile = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE));
    if (profile) {
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
        setVal('firstName', profile.firstName);
        setVal('lastName', profile.lastName);
        setVal('email', profile.email);
        setVal('phone', profile.phone);

        const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
        const displayName = document.getElementById('userDisplayName');
        const displayEmail = document.getElementById('userDisplayEmail');
        if (displayName) displayName.textContent = fullName || 'User';
        if (displayEmail) displayEmail.textContent = profile.email || 'user@example.com';

        const savedImage = localStorage.getItem('csms_profile_picture');
        if (!savedImage) {
            const initial = profile.firstName ? profile.firstName.charAt(0).toUpperCase() : 'U';
            const avatarDiv = document.querySelector('.user-avatar');
            if (avatarDiv) {
                avatarDiv.innerHTML = '';
                const span = document.createElement('span');
                span.className = 'initial';
                span.textContent = initial;
                avatarDiv.appendChild(span);
            }
        }

        updateLogoutModalInfo(profile);
        updateDeleteModalInfo(profile);
    }
}

function updateLogoutModalInfo(profile) {
    const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    const el = (id) => document.getElementById(id);
    if (el('logoutUserName')) el('logoutUserName').textContent = fullName || 'User';
    if (el('logoutUserEmail')) el('logoutUserEmail').textContent = profile.email || 'user@example.com';
    if (!localStorage.getItem('csms_profile_picture')) resetLogoutAvatar();
}

function updateDeleteModalInfo(profile) {
    const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
    const el = (id) => document.getElementById(id);
    if (el('deleteUserName')) el('deleteUserName').textContent = fullName || 'User';
    if (el('deleteUserEmail')) el('deleteUserEmail').textContent = profile.email || 'user@example.com';
    if (!localStorage.getItem('csms_profile_picture')) resetDeleteAvatar();
    else updateDeleteAvatar(localStorage.getItem('csms_profile_picture'));
}

function saveProfile(event) {
    event.preventDefault();

    const profile = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        updatedAt: new Date().toISOString()
    };

    if (!profile.firstName || !profile.lastName) {
        showNotification('Please fill in your first and last name', 'error');
        return;
    }
    if (!profile.email) {
        showNotification('Please enter your email address', 'error');
        return;
    }

    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    loadProfileData();
    if (!localStorage.getItem('csms_profile_picture')) resetSidebarAvatar();
    updateLogoutModalInfo(profile);
    updateDeleteModalInfo(profile);
    showNotification('Profile updated successfully!', 'success');
}

// ========== PASSWORD FUNCTIONS ==========
function setupPasswordStrength() {
    const newPassword = document.getElementById('newPassword');
    if (newPassword) newPassword.addEventListener('input', checkPasswordStrength);
}

function checkPasswordStrength() {
    const password = document.getElementById('newPassword').value;
    const strengthDiv = document.getElementById('passwordStrength');
    if (!password) { if (strengthDiv) strengthDiv.innerHTML = ''; return; }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;

    let message = '', className = '';
    if (strength <= 1) { message = 'Weak password'; className = 'strength-weak'; }
    else if (strength <= 3) { message = 'Medium password'; className = 'strength-medium'; }
    else { message = 'Strong password'; className = 'strength-strong'; }

    if (strengthDiv) {
        strengthDiv.innerHTML = `<i class="fas fa-shield-alt"></i> ${message}`;
        strengthDiv.className = `password-strength ${className}`;
    }
}

function changePassword(event) {
    event.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match!', 'error');
        return;
    }
    if (newPassword.length < 8) {
        showNotification('Password must be at least 8 characters long', 'error');
        return;
    }

    showNotification('Password changed successfully!', 'success');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    const strengthDiv = document.getElementById('passwordStrength');
    if (strengthDiv) strengthDiv.innerHTML = '';
}

// ========== LOCATION FUNCTIONS ==========
function loadLocations() {
    const locations = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCATIONS)) || [];
    const container = document.getElementById('locationsList');
    if (!container) return;

    if (locations.length === 0) {
        container.innerHTML = '<div class="text-center text-muted py-4">No saved locations yet. Add your first location above!</div>';
        return;
    }

    container.innerHTML = locations.map(location => `
        <div class="location-item" data-id="${location.id}">
            <div class="location-info">
                <i class="fas ${location.icon || 'fa-map-marker-alt'}"></i>
                <span>${escapeHtml(location.name)}</span>
            </div>
            <div class="location-actions">
                <button onclick="deleteLocation(${location.id})" class="btn btn-sm btn-outline-danger">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function addLocation() {
    const locationInput = document.getElementById('newLocation');
    const locationName = locationInput ? locationInput.value.trim() : '';

    if (!locationName) {
        showNotification('Please enter a location name', 'error');
        return;
    }

    const locations = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCATIONS)) || [];
    locations.push({ id: Date.now(), name: locationName, icon: 'fa-map-marker-alt' });
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
    if (locationInput) locationInput.value = '';
    loadLocations();
    showNotification('Location added successfully!', 'success');
}

function deleteLocation(id) {
    let locations = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCATIONS)) || [];
    locations = locations.filter(loc => loc.id !== id);
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
    loadLocations();
    showNotification('Location deleted successfully!', 'success');
}

// ========== PAYMENT METHODS FUNCTIONS ==========
function setupPaymentModal() {
    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    const savePaymentBtn = document.getElementById('savePaymentBtn');
    if (savePaymentBtn) {
        savePaymentBtn.addEventListener('click', function () {
            savePaymentMethod();
            paymentModal.hide();
        });
    }
    window.paymentModal = paymentModal;
}

function loadPaymentMethods() {
    const payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS)) || [];
    const container = document.getElementById('paymentMethodsList');
    if (!container) return;

    if (payments.length === 0) {
        container.innerHTML = '<div class="text-center text-muted py-4">No payment methods added yet.</div>';
        return;
    }

    container.innerHTML = payments.map(payment => `
        <div class="payment-item" data-id="${payment.id}">
            <div class="payment-info">
                <div class="payment-icon"><i class="fas ${payment.icon || 'fa-wallet'}"></i></div>
                <div class="payment-details">
                    <h6>${escapeHtml(payment.type)}</h6>
                    <p><strong>Account:</strong> ${escapeHtml(payment.accountNumber || payment.details || 'N/A')}</p>
                    <p><strong>Holder:</strong> ${escapeHtml(payment.accountHolder || 'N/A')}</p>
                    ${payment.notes ? `<p class="text-muted small">${escapeHtml(payment.notes)}</p>` : ''}
                </div>
            </div>
            <div class="payment-actions">
                <button onclick="deletePaymentMethod(${payment.id})" class="btn btn-sm btn-outline-danger">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `).join('');
}

function addPaymentMethod() {
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) paymentForm.reset();
    if (window.paymentModal) window.paymentModal.show();
}

function savePaymentMethod() {
    const paymentType = document.getElementById('paymentType').value;
    const accountNumber = document.getElementById('paymentAccountNumber').value.trim();
    const accountHolder = document.getElementById('paymentAccountHolder').value.trim();
    const notes = document.getElementById('paymentNotes').value.trim();

    if (!paymentType) { showNotification('Please select a payment type', 'error'); return; }
    if (!accountNumber) { showNotification('Please enter account or phone number', 'error'); return; }
    if (!accountHolder) { showNotification('Please enter account holder name', 'error'); return; }

    const payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS)) || [];
    payments.push({
        id: Date.now(),
        type: paymentType,
        accountNumber,
        accountHolder,
        notes,
        icon: getPaymentIcon(paymentType)
    });
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(payments));
    loadPaymentMethods();
    showNotification('Payment method added successfully!', 'success');
}

function deletePaymentMethod(id) {
    if (confirm('Are you sure you want to remove this payment method?')) {
        let payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS)) || [];
        payments = payments.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(payments));
        loadPaymentMethods();
        showNotification('Payment method removed successfully!', 'success');
    }
}

function getPaymentIcon(type) {
    type = type.toLowerCase();
    if (type.includes('mobile') || type.includes('m-pesa') || type.includes('airtel')) return 'fa-mobile-alt';
    if (type.includes('credit') || type.includes('debit')) return 'fa-credit-card';
    if (type.includes('bank')) return 'fa-university';
    if (type.includes('paypal')) return 'fa-paypal';
    return 'fa-wallet';
}

// ========== SERVICE HISTORY FUNCTIONS ==========
function loadServiceHistory() {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICE_HISTORY)) || [];
    const container = document.getElementById('historyList');
    if (!container) return;

    if (history.length === 0) {
        container.innerHTML = `
            <div class="history-empty">
                <i class="fas fa-history"></i>
                <h5>No Service History</h5>
                <p>Your completed and ongoing services will appear here</p>
            </div>`;
        return;
    }

    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = history.map(item => {
        const starsHtml = item.rating ? generateStars(item.rating) : '<span class="text-muted">Not rated</span>';
        return `
            <div class="history-item" data-id="${item.id}">
                <div class="history-item-header">
                    <div class="history-service-type">
                        <div class="history-service-icon">
                            <i class="fas ${item.serviceIcon || 'fa-broom'}"></i>
                        </div>
                        <div class="history-service-info">
                            <h6>${escapeHtml(item.serviceType)}</h6>
                            <span>Staff: ${escapeHtml(item.staff || 'N/A')}</span>
                        </div>
                    </div>
                    <span class="history-status status-${item.status}">${getStatusText(item.status)}</span>
                </div>
                <div class="history-item-body">
                    <div class="history-detail">
                        <span class="history-detail-label">Date</span>
                        <span class="history-detail-value">${formatDate(item.date)}</span>
                    </div>
                    <div class="history-detail">
                        <span class="history-detail-label">Time</span>
                        <span class="history-detail-value">${item.time || 'N/A'}</span>
                    </div>
                    <div class="history-detail">
                        <span class="history-detail-label">Duration</span>
                        <span class="history-detail-value">${item.duration || 'N/A'}</span>
                    </div>
                    <div class="history-detail">
                        <span class="history-detail-label">Location</span>
                        <span class="history-detail-value">${escapeHtml(item.location || 'N/A')}</span>
                    </div>
                    <div class="history-detail">
                        <span class="history-detail-label">Price</span>
                        <span class="history-detail-value">${escapeHtml(item.price || 'N/A')}</span>
                    </div>
                    <div class="history-detail">
                        <span class="history-detail-label">Rating</span>
                        <span class="history-detail-value">${starsHtml}</span>
                    </div>
                </div>
                <div class="history-item-footer">
                    <div class="history-date">
                        <i class="far fa-calendar-alt"></i> ${formatDate(item.date)}
                    </div>
                    <button onclick="deleteHistoryItem(${item.id})" class="btn btn-sm btn-outline-danger">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>`;
    }).join('');
}

function getStatusText(status) {
    const map = { completed: 'Completed', pending: 'Pending', cancelled: 'Cancelled', 'in-progress': 'In Progress' };
    return map[status] || 'Unknown';
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating
            ? '<i class="fas fa-star text-warning"></i>'
            : '<i class="far fa-star text-muted"></i>';
    }
    return stars;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function deleteHistoryItem(id) {
    if (confirm('Are you sure you want to delete this service history record?')) {
        let history = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICE_HISTORY)) || [];
        history = history.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEYS.SERVICE_HISTORY, JSON.stringify(history));
        loadServiceHistory();
        showNotification('History record deleted successfully!', 'success');
    }
}

function clearAllHistory() {
    if (confirm('Are you sure you want to clear all your service history? This action cannot be undone.')) {
        localStorage.setItem(STORAGE_KEYS.SERVICE_HISTORY, JSON.stringify([]));
        loadServiceHistory();
        showNotification('All service history cleared successfully!', 'success');
    }
}

// ========== NOTIFICATION FUNCTIONS ==========
function loadNotifications() {
    const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS));
    if (notifications) {
        const emailCb = document.getElementById('emailNotifications');
        const webCb = document.getElementById('webNotifications');
        if (emailCb) emailCb.checked = notifications.email || false;
        if (webCb) webCb.checked = notifications.web || false;
    }
}

function saveNotifications() {
    const notifications = {
        email: document.getElementById('emailNotifications')?.checked || false,
        web: document.getElementById('webNotifications')?.checked || false
    };
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    showNotification('Notification preferences saved!', 'success');
}

// ========== PREFERENCES FUNCTIONS ==========
function loadPreferences() {
    const prefs = JSON.parse(localStorage.getItem(STORAGE_KEYS.PREFERENCES));
    if (prefs) {
        const ls = document.getElementById('languageSelect');
        const ts = document.getElementById('timezoneSelect');
        const ac = document.getElementById('autoBookConfirm');
        if (ls) ls.value = prefs.language || 'en';
        if (ts) ts.value = prefs.timezone || 'UTC+3';
        if (ac) ac.checked = prefs.autoConfirm || false;
    }
}

function savePreferences() {
    const prefs = {
        language: document.getElementById('languageSelect')?.value || 'en',
        timezone: document.getElementById('timezoneSelect')?.value || 'UTC+3',
        autoConfirm: document.getElementById('autoBookConfirm')?.checked || false
    };
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
    showNotification('Preferences saved successfully!', 'success');
}

// ========== LOGOUT FUNCTIONS ==========
function setupLogoutModal() {
    const logoutModal = new bootstrap.Modal(document.getElementById('logoutModal'));
    const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', function () {
            performLogout();
            logoutModal.hide();
        });
    }
    window.logoutModal = logoutModal;

    const profile = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE));
    if (profile) updateLogoutModalInfo(profile);
}

function showLogoutModal() {
    const profile = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE));
    if (profile) updateLogoutModalInfo(profile);
    if (window.logoutModal) window.logoutModal.show();
}

function performLogout() {
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'false');
    showNotification('Logged out successfully!', 'success');
    setTimeout(() => { window.location.href = 'login.html'; }, 1000);
}

// ========== DELETE ACCOUNT FUNCTIONS ==========
function setupDeleteAccountModal() {
    const modalEl = document.getElementById('deleteAccountModal');
    if (!modalEl) return;

    const deleteModal = new bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: false });
    window.deleteAccountModal = deleteModal;

    // Reset modal to step 1 whenever it's opened
    modalEl.addEventListener('show.bs.modal', function () {
        showDeleteStep(1);
        const input = document.getElementById('deleteConfirmInput');
        if (input) input.value = '';
        const feedback = document.getElementById('deleteInputFeedback');
        if (feedback) { feedback.textContent = ''; feedback.className = 'delete-input-feedback'; }
        const confirmBtn = document.getElementById('confirmDeleteAccountBtn');
        if (confirmBtn) confirmBtn.disabled = true;
    });

    // Step navigation
    const proceedBtn = document.getElementById('proceedToStep2Btn');
    if (proceedBtn) {
        proceedBtn.addEventListener('click', function () {
            showDeleteStep(2);
            setTimeout(() => { document.getElementById('deleteConfirmInput')?.focus(); }, 300);
        });
    }

    const backBtn = document.getElementById('backToStep1Btn');
    if (backBtn) {
        backBtn.addEventListener('click', function () {
            showDeleteStep(1);
        });
    }

    // Confirm input validation
    const confirmInput = document.getElementById('deleteConfirmInput');
    if (confirmInput) {
        confirmInput.addEventListener('input', function () {
            validateDeleteInput(this.value);
        });
    }

    // Final delete button
    const confirmDeleteBtn = document.getElementById('confirmDeleteAccountBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function () {
            if (document.getElementById('deleteConfirmInput')?.value.toUpperCase() === 'DELETE') {
                performAccountDeletion();
            }
        });
    }
}

function showDeleteStep(step) {
    [1, 2, 3].forEach(n => {
        const el = document.getElementById(`deleteStep${n}`);
        if (el) el.style.display = n === step ? 'block' : 'none';
    });
}

function validateDeleteInput(value) {
    const input = document.getElementById('deleteConfirmInput');
    const feedback = document.getElementById('deleteInputFeedback');
    const confirmBtn = document.getElementById('confirmDeleteAccountBtn');

    if (!input || !feedback || !confirmBtn) return;

    const isValid = value.toUpperCase() === 'DELETE';

    if (value === '') {
        input.className = 'form-control confirm-input';
        feedback.textContent = '';
        feedback.className = 'delete-input-feedback';
        confirmBtn.disabled = true;
    } else if (isValid) {
        input.className = 'form-control confirm-input valid';
        feedback.textContent = '✓ Confirmed — you may now delete your account';
        feedback.className = 'delete-input-feedback valid';
        confirmBtn.disabled = false;
    } else {
        input.className = 'form-control confirm-input';
        feedback.textContent = 'Please type exactly: DELETE';
        feedback.className = 'delete-input-feedback invalid';
        confirmBtn.disabled = true;
    }
}

function showDeleteAccountModal() {
    const profile = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE));
    if (profile) updateDeleteModalInfo(profile);
    if (window.deleteAccountModal) window.deleteAccountModal.show();
}

function performAccountDeletion() {
    // Transition to step 3 (progress)
    showDeleteStep(3);

    const progressFill = document.getElementById('deleteProgressFill');
    const progressText = document.getElementById('deleteProgressText');

    const steps = [
        { pct: 20, text: 'Removing profile data...' },
        { pct: 40, text: 'Deleting saved locations...' },
        { pct: 60, text: 'Removing payment methods...' },
        { pct: 80, text: 'Clearing service history...' },
        { pct: 100, text: 'Finalising account deletion...' }
    ];

    let i = 0;
    const interval = setInterval(() => {
        if (i < steps.length) {
            if (progressFill) progressFill.style.width = steps[i].pct + '%';
            if (progressText) progressText.textContent = steps[i].text;
            i++;
        } else {
            clearInterval(interval);

            // Wipe all user data from localStorage
            Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
            localStorage.removeItem('csms_profile_picture');

            // Close modal then redirect
            if (window.deleteAccountModal) window.deleteAccountModal.hide();

            showNotification('Your account has been permanently deleted.', 'success');
            setTimeout(() => { window.location.href = 'index.html'; }, 1500);
        }
    }, 500);
}

// ========== UI FUNCTIONS ==========
function showSection(sectionId) {
    document.querySelectorAll('.account-section').forEach(s => s.classList.remove('active'));
    const selected = document.getElementById(`${sectionId}Section`);
    if (selected) selected.classList.add('active');

    document.querySelectorAll('.account-menu li').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionId) item.classList.add('active');
    });

    if (window.innerWidth <= 992) closeSidebar();
}

function showNotification(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast-notification';

    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-triangle', warning: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const colors = { success: '#198754', error: '#dc3545', warning: '#ffc107', info: '#4361ee' };

    const icon = icons[type] || icons.info;
    const color = colors[type] || colors.info;

    toast.style.borderLeftColor = color;
    toast.innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <i class="fas ${icon}" style="color:${color}"></i>
            <span class="flex-grow-1">${escapeHtml(message)}</span>
            <button class="btn-close btn-sm" onclick="this.closest('.toast-notification').remove()"></button>
        </div>`;

    toastContainer.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3000);
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
    const listeners = [
        ['profileForm', 'submit', saveProfile],
        ['passwordForm', 'submit', changePassword],
        ['addLocationBtn', 'click', addLocation],
        ['addPaymentBtn', 'click', addPaymentMethod],
        ['saveNotificationsBtn', 'click', saveNotifications],
        ['savePreferencesBtn', 'click', savePreferences],
        ['clearAllHistoryBtn', 'click', clearAllHistory]
    ];

    listeners.forEach(([id, event, fn]) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener(event, fn);
    });

    const locationInput = document.getElementById('newLocation');
    if (locationInput) {
        locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); addLocation(); }
        });
    }
}

function setupMenuClickHandlers() {
    document.querySelectorAll('.account-menu li').forEach(item => {
        item.addEventListener('click', function (e) {
            e.stopPropagation();
            const section = this.getAttribute('data-section');
            if (section === 'logout') {
                showLogoutModal();
            } else if (section === 'deleteAccount') {
                showDeleteAccountModal();
            } else if (section) {
                showSection(section);
            }
        });
    });
}

// ========== GLOBAL EXPORTS ==========
window.deleteLocation = deleteLocation;
window.deletePaymentMethod = deletePaymentMethod;
window.deleteHistoryItem = deleteHistoryItem;
window.showNotification = showNotification;
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.showSection = showSection;
window.showLogoutModal = showLogoutModal;
window.showDeleteAccountModal = showDeleteAccountModal;