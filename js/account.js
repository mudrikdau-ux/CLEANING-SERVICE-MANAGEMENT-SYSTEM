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
    phone: '+255 777 123 456'
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
    setupSidebarFunctions();
    
    // Initialize profile picture
    initProfilePicture();
});

// ========== SIDEBAR FUNCTIONS ==========
function openSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
        sidebar.style.width = "280px";
        document.body.style.overflow = "hidden";
    }
}

function closeSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
        sidebar.style.width = "0";
        document.body.style.overflow = "auto";
    }
}

function setupSidebarFunctions() {
    // Make functions globally available
    window.openSidebar = openSidebar;
    window.closeSidebar = closeSidebar;
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
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
    
    // Close sidebar on window resize if open
    window.addEventListener('resize', function() {
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
    
    // Load saved profile picture
    const savedImage = localStorage.getItem('csms_profile_picture');
    if (savedImage && profileImage && profileIcon) {
        profileImage.src = savedImage;
        profileImage.style.display = 'block';
        profileIcon.style.display = 'none';
        if (removeBtn) removeBtn.style.display = 'inline-block';
        updateSidebarAvatar(savedImage);
    }
    
    // Handle file upload
    if (uploadInput) {
        uploadInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file type
                if (!file.type.match('image.*')) {
                    showNotification('Please select an image file (JPG, PNG)', 'error');
                    return;
                }
                
                // Validate file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    showNotification('Image size should be less than 2MB', 'error');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(event) {
                    const imageData = event.target.result;
                    if (profileImage) {
                        profileImage.src = imageData;
                        profileImage.style.display = 'block';
                    }
                    if (profileIcon) profileIcon.style.display = 'none';
                    if (removeBtn) removeBtn.style.display = 'inline-block';
                    
                    // Save to localStorage
                    localStorage.setItem('csms_profile_picture', imageData);
                    
                    // Update sidebar avatar
                    updateSidebarAvatar(imageData);
                    
                    showNotification('Profile picture updated successfully!', 'success');
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Handle remove picture
    if (removeBtn) {
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (profileImage) {
                profileImage.src = '';
                profileImage.style.display = 'none';
            }
            if (profileIcon) profileIcon.style.display = 'flex';
            removeBtn.style.display = 'none';
            
            // Remove from localStorage
            localStorage.removeItem('csms_profile_picture');
            
            // Reset sidebar avatar
            resetSidebarAvatar();
            
            showNotification('Profile picture removed successfully!', 'success');
        });
    }
    
    // Click on profile picture to trigger upload
    if (profilePicture) {
        profilePicture.addEventListener('click', function() {
            if (uploadInput) {
                uploadInput.click();
            }
        });
    }
}

function updateSidebarAvatar(imageData) {
    const sidebarAvatar = document.querySelector('.user-avatar');
    if (sidebarAvatar) {
        sidebarAvatar.innerHTML = '';
        const img = document.createElement('img');
        img.src = imageData;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '50%';
        sidebarAvatar.appendChild(img);
    }
}

function resetSidebarAvatar() {
    const sidebarAvatar = document.querySelector('.user-avatar');
    if (sidebarAvatar) {
        const profile = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE));
        const initial = profile?.firstName ? profile.firstName.charAt(0).toUpperCase() : 'U';
        sidebarAvatar.innerHTML = '';
        const initialSpan = document.createElement('span');
        initialSpan.className = 'initial';
        initialSpan.textContent = initial;
        sidebarAvatar.appendChild(initialSpan);
    }
}

// ========== INITIALIZE DATA ==========
function initializeData() {
    // Initialize profile if not exists
    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(currentUser));
    }
    
    // Initialize locations if not exists
    if (!localStorage.getItem(STORAGE_KEYS.LOCATIONS)) {
        const defaultLocations = [
            { id: 1, name: 'Home - Stone Town, Unguja', icon: 'fa-home' },
            { id: 2, name: 'Office - Vikokotoni Business Hub', icon: 'fa-briefcase' }
        ];
        localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(defaultLocations));
    }
    
    // Initialize payment methods if not exists
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS)) {
        const defaultPayments = [
            { id: 1, type: 'Mobile Money', details: 'M-Pesa - +255 777 123 456', icon: 'fa-mobile-alt' },
            { id: 2, type: 'Visa Card', details: '**** **** **** 1234', icon: 'fa-credit-card' }
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
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        
        if (firstNameInput) firstNameInput.value = profile.firstName || '';
        if (lastNameInput) lastNameInput.value = profile.lastName || '';
        if (emailInput) emailInput.value = profile.email || '';
        if (phoneInput) phoneInput.value = profile.phone || '';
        
        // Update sidebar display
        const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
        const displayName = document.getElementById('userDisplayName');
        const displayEmail = document.getElementById('userDisplayEmail');
        
        if (displayName) displayName.textContent = fullName || 'User';
        if (displayEmail) displayEmail.textContent = profile.email || 'user@example.com';
        
        // Update avatar initial if no profile picture
        const savedImage = localStorage.getItem('csms_profile_picture');
        if (!savedImage) {
            const initial = profile.firstName ? profile.firstName.charAt(0).toUpperCase() : 'U';
            const avatarDiv = document.querySelector('.user-avatar');
            if (avatarDiv) {
                avatarDiv.innerHTML = '';
                const initialSpan = document.createElement('span');
                initialSpan.className = 'initial';
                initialSpan.textContent = initial;
                avatarDiv.appendChild(initialSpan);
            }
        }
    }
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
    
    // Basic validation
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
    
    // If no profile picture, update avatar with initial
    const savedImage = localStorage.getItem('csms_profile_picture');
    if (!savedImage) {
        resetSidebarAvatar();
    }
    
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
        if (strengthDiv) strengthDiv.innerHTML = '';
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
    const locationsContainer = document.getElementById('locationsList');
    
    if (!locationsContainer) return;
    
    if (locations.length === 0) {
        locationsContainer.innerHTML = '<div class="text-center text-muted py-4">No saved locations yet. Add your first location above!</div>';
        return;
    }
    
    let html = '';
    locations.forEach(location => {
        html += `
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
        `;
    });
    
    locationsContainer.innerHTML = html;
}

function addLocation() {
    const locationInput = document.getElementById('newLocation');
    const locationName = locationInput ? locationInput.value.trim() : '';
    
    if (!locationName) {
        showNotification('Please enter a location name', 'error');
        return;
    }
    
    const locations = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCATIONS)) || [];
    const newLocation = {
        id: Date.now(),
        name: locationName,
        icon: 'fa-map-marker-alt'
    };
    
    locations.push(newLocation);
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
function loadPaymentMethods() {
    const payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS)) || [];
    const paymentsContainer = document.getElementById('paymentMethodsList');
    
    if (!paymentsContainer) return;
    
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
                        <i class="fas ${payment.icon || 'fa-wallet'}"></i>
                    </div>
                    <div class="payment-details">
                        <h6>${escapeHtml(payment.type)}</h6>
                        <p>${escapeHtml(payment.details)}</p>
                    </div>
                </div>
                <div class="payment-actions">
                    <button onclick="deletePaymentMethod(${payment.id})" class="btn btn-sm btn-outline-danger">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;
    });
    
    paymentsContainer.innerHTML = html;
}

function addPaymentMethod() {
    const paymentType = prompt('Enter payment method type (e.g., Visa, Mobile Money, Bank Transfer):');
    if (!paymentType || !paymentType.trim()) return;
    
    const paymentDetails = prompt('Enter payment details:');
    if (!paymentDetails || !paymentDetails.trim()) return;
    
    const payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS)) || [];
    const newPayment = {
        id: Date.now(),
        type: paymentType.trim(),
        details: paymentDetails.trim(),
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
    if (type.includes('mobile') || type.includes('m-pesa') || type.includes('airtel') || type.includes('phone')) return 'fa-mobile-alt';
    if (type.includes('visa') || type.includes('mastercard') || type.includes('card')) return 'fa-credit-card';
    if (type.includes('bank')) return 'fa-university';
    if (type.includes('paypal')) return 'fa-paypal';
    return 'fa-wallet';
}

// ========== NOTIFICATION FUNCTIONS ==========
function loadNotifications() {
    const notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS));
    if (notifications) {
        const emailCheckbox = document.getElementById('emailNotifications');
        const smsCheckbox = document.getElementById('smsNotifications');
        const promoCheckbox = document.getElementById('promoNotifications');
        
        if (emailCheckbox) emailCheckbox.checked = notifications.email || false;
        if (smsCheckbox) smsCheckbox.checked = notifications.sms || false;
        if (promoCheckbox) promoCheckbox.checked = notifications.promotions || false;
    }
}

function saveNotifications() {
    const emailCheckbox = document.getElementById('emailNotifications');
    const smsCheckbox = document.getElementById('smsNotifications');
    const promoCheckbox = document.getElementById('promoNotifications');
    
    const notifications = {
        email: emailCheckbox ? emailCheckbox.checked : false,
        sms: smsCheckbox ? smsCheckbox.checked : false,
        promotions: promoCheckbox ? promoCheckbox.checked : false
    };
    
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    showNotification('Notification preferences saved!', 'success');
}

// ========== PREFERENCES FUNCTIONS ==========
function loadPreferences() {
    const preferences = JSON.parse(localStorage.getItem(STORAGE_KEYS.PREFERENCES));
    if (preferences) {
        const languageSelect = document.getElementById('languageSelect');
        const timezoneSelect = document.getElementById('timezoneSelect');
        const autoBookConfirm = document.getElementById('autoBookConfirm');
        
        if (languageSelect) languageSelect.value = preferences.language || 'en';
        if (timezoneSelect) timezoneSelect.value = preferences.timezone || 'UTC+3';
        if (autoBookConfirm) autoBookConfirm.checked = preferences.autoConfirm || false;
    }
}

function savePreferences() {
    const languageSelect = document.getElementById('languageSelect');
    const timezoneSelect = document.getElementById('timezoneSelect');
    const autoBookConfirm = document.getElementById('autoBookConfirm');
    
    const preferences = {
        language: languageSelect ? languageSelect.value : 'en',
        timezone: timezoneSelect ? timezoneSelect.value : 'UTC+3',
        autoConfirm: autoBookConfirm ? autoBookConfirm.checked : false
    };
    
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
    showNotification('Preferences saved successfully!', 'success');
}

// ========== UI FUNCTIONS ==========
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.account-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(`${sectionId}Section`);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Update menu active state
    const menuItems = document.querySelectorAll('.account-menu li');
    menuItems.forEach(item => {
        item.classList.remove('active');
        const itemSection = item.getAttribute('data-section');
        if (itemSection === sectionId) {
            item.classList.add('active');
        }
    });
    
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 992) {
        closeSidebar();
    }
}

function showNotification(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    
    let icon = 'fa-info-circle';
    let borderColor = '#4361ee';
    
    if (type === 'success') {
        icon = 'fa-check-circle';
        borderColor = '#198754';
    } else if (type === 'error') {
        icon = 'fa-exclamation-triangle';
        borderColor = '#dc3545';
    } else if (type === 'warning') {
        icon = 'fa-exclamation-circle';
        borderColor = '#ffc107';
    }
    
    toast.style.borderLeftColor = borderColor;
    toast.innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <i class="fas ${icon}" style="color: ${borderColor}"></i>
            <span class="flex-grow-1">${escapeHtml(message)}</span>
            <button class="btn-close btn-sm" onclick="this.closest('.toast-notification').remove()"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toast && toast.parentNode) {
            toast.remove();
        }
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
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', saveProfile);
    }
    
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', changePassword);
    }
    
    const addLocationBtn = document.getElementById('addLocationBtn');
    if (addLocationBtn) {
        addLocationBtn.addEventListener('click', addLocation);
    }
    
    const addPaymentBtn = document.getElementById('addPaymentBtn');
    if (addPaymentBtn) {
        addPaymentBtn.addEventListener('click', addPaymentMethod);
    }
    
    const saveNotificationsBtn = document.getElementById('saveNotificationsBtn');
    if (saveNotificationsBtn) {
        saveNotificationsBtn.addEventListener('click', saveNotifications);
    }
    
    const savePreferencesBtn = document.getElementById('savePreferencesBtn');
    if (savePreferencesBtn) {
        savePreferencesBtn.addEventListener('click', savePreferences);
    }
    
    // Add location on Enter key
    const locationInput = document.getElementById('newLocation');
    if (locationInput) {
        locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addLocation();
            }
        });
    }
}

function setupMenuClickHandlers() {
    const menuItems = document.querySelectorAll('.account-menu li');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            const section = this.getAttribute('data-section');
            if (section === 'logout') {
                logout();
            } else if (section) {
                showSection(section);
            }
        });
    });
}

// Make functions globally available
window.deleteLocation = deleteLocation;
window.deletePaymentMethod = deletePaymentMethod;
window.showNotification = showNotification;
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.showSection = showSection;
window.logout = logout;