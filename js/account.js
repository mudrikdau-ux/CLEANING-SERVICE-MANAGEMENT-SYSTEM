// ========== STORAGE KEYS ==========
const STORAGE_KEYS = {
    PROFILE: 'csms_profile',
    LOCATIONS: 'csms_locations',
    PAYMENT_METHODS: 'csms_payment_methods',
    NOTIFICATIONS: 'csms_notifications',
    PREFERENCES: 'csms_preferences'
};

// ========== INITIAL DATA ==========
let currentUser = {
    firstName: 'Aly',
    lastName: 'Hassan',
    email: 'aly@csms.co.tz',
    phone: '+255 777 123 456',
    bio: 'Professional cleaning service enthusiast'
};

// ========== DOM ELEMENTS ==========
document.addEventListener('DOMContentLoaded', () => {
    // Initialize data
    initializeData();
    
    // Load all saved data
    loadProfileData();
    loadLocations();
    loadPaymentMethods();
    loadNotifications();
    loadPreferences();
    
    // Setup event listeners
    setupEventListeners();
    setupMenuClickHandlers();
    setupPasswordStrength();
});

// ========== INITIALIZE DATA ==========
function initializeData() {
    // Initialize profile if not exists
    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(currentUser));
    }
    
    // Initialize locations if not exists
    if (!localStorage.getItem(STORAGE_KEYS.LOCATIONS)) {
        const defaultLocations = [
            { id: 1, name: 'Home - Stone Town, Unguja', icon: 'bi-house-door-fill' },
            { id: 2, name: 'Office - Vikokotoni Business Hub', icon: 'bi-briefcase-fill' }
        ];
        localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(defaultLocations));
    }
    
    // Initialize payment methods if not exists
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS)) {
        const defaultPayments = [
            { id: 1, type: 'Mobile Money', details: 'Airtel Money - +255 777 123 456', icon: 'bi-phone' },
            { id: 2, type: 'Visa Card', details: '**** **** **** 1234', icon: 'bi-credit-card' }
        ];
        localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(defaultPayments));
    }
    
    // Initialize notifications
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
        const defaultNotifications = {
            email: true,
            sms: false,
            promotions: true
        };
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(defaultNotifications));
    }
    
    // Initialize preferences
    if (!localStorage.getItem(STORAGE_KEYS.PREFERENCES)) {
        const defaultPreferences = {
            language: 'en',
            timezone: 'UTC+3',
            autoConfirm: false
        };
        localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(defaultPreferences));
    }
}

// ========== PROFILE FUNCTIONS ==========
function loadProfileData() {
    const profile = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE));
    if (profile) {
        document.getElementById('firstName').value = profile.firstName || '';
        document.getElementById('lastName').value = profile.lastName || '';
        document.getElementById('email').value = profile.email || '';
        document.getElementById('phone').value = profile.phone || '';
        document.getElementById('bio').value = profile.bio || '';
        
        // Update sidebar display
        const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
        document.getElementById('userDisplayName').textContent = fullName || 'User';
        document.getElementById('userDisplayEmail').textContent = profile.email || 'user@example.com';
        
        // Update avatar initial
        const initial = profile.firstName ? profile.firstName.charAt(0).toUpperCase() : 'U';
        document.querySelector('.user-avatar i').style.display = 'none';
        if (!document.querySelector('.user-avatar .initial')) {
            const initialSpan = document.createElement('span');
            initialSpan.className = 'initial';
            initialSpan.style.fontSize = '2rem';
            initialSpan.style.fontWeight = 'bold';
            document.querySelector('.user-avatar').appendChild(initialSpan);
        }
        document.querySelector('.user-avatar .initial').textContent = initial;
    }
}

function saveProfile(event) {
    event.preventDefault();
    
    const profile = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        bio: document.getElementById('bio').value,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    loadProfileData(); // Refresh display
    showNotification('Profile updated successfully!', 'success');
}

// ========== PASSWORD FUNCTIONS ==========
function setupPasswordStrength() {
    const newPassword = document.getElementById('newPassword');
    if (newPassword) {
        newPassword.addEventListener('input', checkPasswordStrength);
    }
}

function checkPasswordStrength() {
    const password = document.getElementById('newPassword').value;
    const strengthDiv = document.getElementById('passwordStrength');
    
    if (!password) {
        strengthDiv.innerHTML = '';
        return;
    }
    
    let strength = 0;
    let message = '';
    let className = '';
    
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    
    switch(strength) {
        case 0:
        case 1:
            message = 'Weak password';
            className = 'strength-weak';
            break;
        case 2:
        case 3:
            message = 'Medium password';
            className = 'strength-medium';
            break;
        case 4:
        case 5:
            message = 'Strong password';
            className = 'strength-strong';
            break;
    }
    
    strengthDiv.innerHTML = `<i class="bi bi-shield-lock"></i> ${message}`;
    strengthDiv.className = `password-strength ${className}`;
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
    
    // In a real app, you would verify current password with backend
    showNotification('Password changed successfully!', 'success');
    
    // Clear form
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('passwordStrength').innerHTML = '';
}

// ========== LOCATION FUNCTIONS ==========
function loadLocations() {
    const locations = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCATIONS)) || [];
    const locationsContainer = document.getElementById('locationsList');
    
    if (locations.length === 0) {
        locationsContainer.innerHTML = '<div class="text-center text-muted py-4">No saved locations yet. Add your first location above!</div>';
        return;
    }
    
    let html = '';
    locations.forEach(location => {
        html += `
            <div class="location-item" data-id="${location.id}">
                <div class="location-info">
                    <i class="bi ${location.icon || 'bi-geo-alt-fill'}"></i>
                    <span>${escapeHtml(location.name)}</span>
                </div>
                <div class="location-actions">
                    <button onclick="deleteLocation(${location.id})" class="btn btn-sm btn-outline-danger">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    });
    
    locationsContainer.innerHTML = html;
}

function addLocation() {
    const locationInput = document.getElementById('newLocation');
    const locationName = locationInput.value.trim();
    
    if (!locationName) {
        showNotification('Please enter a location name', 'error');
        return;
    }
    
    const locations = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCATIONS)) || [];
    const newLocation = {
        id: Date.now(),
        name: locationName,
        icon: 'bi-geo-alt-fill'
    };
    
    locations.push(newLocation);
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
    
    locationInput.value = '';
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
function loadPaymentMethods() {
    const payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS)) || [];
    const paymentsContainer = document.getElementById('paymentMethodsList');
    
    if (payments.length === 0) {
        paymentsContainer.innerHTML = '<div class="text-center text-muted py-4">No payment methods added yet.</div>';
        return;
    }
    
    let html = '';
    payments.forEach(payment => {
        html += `
            <div class="payment-item" data-id="${payment.id}">
                <div class="payment-info">
                    <div class="payment-icon">
                        <i class="bi ${payment.icon}"></i>
                    </div>
                    <div class="payment-details">
                        <h6>${escapeHtml(payment.type)}</h6>
                        <p>${escapeHtml(payment.details)}</p>
                    </div>
                </div>
                <div class="payment-actions">
                    <button onclick="deletePaymentMethod(${payment.id})" class="btn btn-sm btn-outline-danger">
                        <i class="bi bi-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;
    });
    
    paymentsContainer.innerHTML = html;
}

function addPaymentMethod() {
    const paymentType = prompt('Enter payment method type (e.g., Visa, Mobile Money, Bank Transfer):');
    if (!paymentType) return;
    
    const paymentDetails = prompt('Enter payment details:');
    if (!paymentDetails) return;
    
    const payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS)) || [];
    const newPayment = {
        id: Date.now(),
        type: paymentType,
        details: paymentDetails,
        icon: getPaymentIcon(paymentType)
    };
    
    payments.push(newPayment);
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(payments));
    loadPaymentMethods();
    showNotification('Payment method added successfully!', 'success');
}

function deletePaymentMethod(id) {
    let payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS)) || [];
    payments = payments.filter(payment => payment.id !== id);
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(payments));
    loadPaymentMethods();
    showNotification('Payment method removed successfully!', 'success');
}

function getPaymentIcon(type) {
    type = type.toLowerCase();
    if (type.includes('mobile') || type.includes('m-pesa') || type.includes('airtel')) return 'bi-phone';
    if (type.includes('visa') || type.includes('mastercard')) return 'bi-credit-card';
    if (type.includes('bank')) return 'bi-bank2';
    return 'bi-wallet2';
}

// ========== NOTIFICATION FUNCTIONS ==========
function loadNotifications() {
    const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS));
    if (notifications) {
        document.getElementById('emailNotifications').checked = notifications.email || false;
        document.getElementById('smsNotifications').checked = notifications.sms || false;
        document.getElementById('promoNotifications').checked = notifications.promotions || false;
    }
}

function saveNotifications() {
    const notifications = {
        email: document.getElementById('emailNotifications').checked,
        sms: document.getElementById('smsNotifications').checked,
        promotions: document.getElementById('promoNotifications').checked
    };
    
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    showNotification('Notification preferences saved!', 'success');
}

// ========== PREFERENCES FUNCTIONS ==========
function loadPreferences() {
    const preferences = JSON.parse(localStorage.getItem(STORAGE_KEYS.PREFERENCES));
    if (preferences) {
        document.getElementById('languageSelect').value = preferences.language || 'en';
        document.getElementById('timezoneSelect').value = preferences.timezone || 'UTC+3';
        document.getElementById('autoBookConfirm').checked = preferences.autoConfirm || false;
    }
}

function savePreferences() {
    const preferences = {
        language: document.getElementById('languageSelect').value,
        timezone: document.getElementById('timezoneSelect').value,
        autoConfirm: document.getElementById('autoBookConfirm').checked
    };
    
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
    showNotification('Preferences saved successfully!', 'success');
}

// ========== UI FUNCTIONS ==========
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.account-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(`${sectionId}Section`);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Update active menu item
    document.querySelectorAll('.account-menu li').forEach(menuItem => {
        menuItem.classList.remove('active');
        if (menuItem.getAttribute('data-section') === sectionId) {
            menuItem.classList.add('active');
        }
    });
}

function showNotification(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    
    let icon = 'bi-info-circle-fill';
    let borderColor = '#0d6efd';
    
    if (type === 'success') {
        icon = 'bi-check-circle-fill';
        borderColor = '#198754';
    } else if (type === 'error') {
        icon = 'bi-exclamation-triangle-fill';
        borderColor = '#dc3545';
    }
    
    toast.style.borderLeftColor = borderColor;
    toast.innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <i class="bi ${icon}" style="color: ${borderColor}"></i>
            <span class="flex-grow-1">${escapeHtml(message)}</span>
            <button class="btn-close btn-sm" onclick="this.closest('.toast-notification').remove()"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        if (toast && toast.remove) toast.remove();
    }, 3000);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        showNotification('Logged out successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', saveProfile);
    }
    
    // Password form
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', changePassword);
    }
    
    // Add location button
    const addLocationBtn = document.getElementById('addLocationBtn');
    if (addLocationBtn) {
        addLocationBtn.addEventListener('click', addLocation);
    }
    
    // Add payment button
    const addPaymentBtn = document.getElementById('addPaymentBtn');
    if (addPaymentBtn) {
        addPaymentBtn.addEventListener('click', addPaymentMethod);
    }
    
    // Save notifications button
    const saveNotificationsBtn = document.getElementById('saveNotificationsBtn');
    if (saveNotificationsBtn) {
        saveNotificationsBtn.addEventListener('click', saveNotifications);
    }
    
    // Save preferences button
    const savePreferencesBtn = document.getElementById('savePreferencesBtn');
    if (savePreferencesBtn) {
        savePreferencesBtn.addEventListener('click', savePreferences);
    }
    
    // Enter key for location input
    const locationInput = document.getElementById('newLocation');
    if (locationInput) {
        locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addLocation();
            }
        });
    }
}

function setupMenuClickHandlers() {
    const menuItems = document.querySelectorAll('.account-menu li');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            if (section === 'logout') {
                logout();
            } else {
                showSection(section);
            }
        });
    });
}