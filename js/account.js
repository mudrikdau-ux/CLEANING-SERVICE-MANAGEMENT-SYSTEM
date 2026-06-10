/**
 * CleanSpark Account Page - FULLY INTEGRATED with Backend API
 * ALL Features: Profile (with picture), Password, Locations, Payment Methods,
 * Service History, Notifications, Preferences, Logout, Delete Account
 */

// ===== AUTH HELPERS =====
function isLoggedIn() {
    return !!API.getAuthToken() && localStorage.getItem('isLoggedIn') === 'true';
}

function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// ===== SIDEBAR FUNCTIONS =====
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

    document.addEventListener('click', function(event) {
        const sidebar = document.getElementById('sidebar');
        const hamburger = document.querySelector('.hamburger');
        if (sidebar && hamburger && !sidebar.contains(event.target) && !hamburger.contains(event.target) && sidebar.style.width === '280px') {
            closeSidebar();
        }
    });
}

// ===== ACCESS CONTROL =====
async function enforceAccessControl() {
    const overlay = document.getElementById('accessControlOverlay');
    const mainContent = document.getElementById('mainContent');

    if (!isLoggedIn()) {
        if (overlay) overlay.style.display = 'flex';
        if (mainContent) mainContent.style.visibility = 'hidden';
        document.body.style.overflow = 'hidden';
        return false;
    }

    if (overlay) overlay.style.display = 'none';
    if (mainContent) mainContent.style.visibility = 'visible';
    document.body.style.overflow = 'auto';
    return true;
}

// ===== PROFILE PICTURE FUNCTIONS =====
function initProfilePicture() {
    const uploadInput = document.getElementById('profilePictureUpload');
    const profilePicture = document.getElementById('profilePicture');
    const profileImage = document.getElementById('profileImage');
    const removeBtn = document.getElementById('removeProfilePicture');

    if (!profilePicture) return;

    const profileIcon = profilePicture.querySelector('i');
    const savedImage = localStorage.getItem('cleanspark_profile_picture');

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
        uploadInput.addEventListener('change', function(e) {
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
                reader.onload = function(event) {
                    const imageData = event.target.result;
                    if (profileImage) {
                        profileImage.src = imageData;
                        profileImage.style.display = 'block';
                    }
                    if (profileIcon) profileIcon.style.display = 'none';
                    if (removeBtn) removeBtn.style.display = 'inline-block';
                    localStorage.setItem('cleanspark_profile_picture', imageData);
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
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (profileImage) {
                profileImage.src = '';
                profileImage.style.display = 'none';
            }
            if (profileIcon) profileIcon.style.display = 'flex';
            removeBtn.style.display = 'none';
            localStorage.removeItem('cleanspark_profile_picture');
            resetSidebarAvatar();
            resetLogoutAvatar();
            resetDeleteAvatar();
            showNotification('Profile picture removed successfully!', 'success');
        });
    }

    if (profilePicture) {
        profilePicture.addEventListener('click', function() {
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
        const firstName = document.getElementById('firstName')?.value || 'U';
        const initial = firstName.charAt(0).toUpperCase();
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
        const firstName = document.getElementById('firstName')?.value || 'U';
        const initial = firstName.charAt(0).toUpperCase();
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
        const firstName = document.getElementById('firstName')?.value || 'U';
        const initial = firstName.charAt(0).toUpperCase();
        deleteAvatar.innerHTML = '';
        const span = document.createElement('span');
        span.className = 'initial-large';
        span.textContent = initial;
        deleteAvatar.appendChild(span);
    }
}

// ===== PROFILE FUNCTIONS =====
async function loadProfileData() {
    try {
        showLoading(true);
        const response = await API.auth.getProfile();
        showLoading(false);

        if (response.success && response.profile) {
            const p = response.profile;
            
            document.getElementById('firstName').value = p.first_name || '';
            document.getElementById('lastName').value = p.last_name || '';
            document.getElementById('email').value = p.email || '';
            document.getElementById('phone').value = p.phone || '';
            document.getElementById('address').value = p.address || '';
            
            const genderSelect = document.getElementById('gender');
            if (genderSelect && p.gender) {
                genderSelect.value = p.gender;
            }
            
            const fullName = `${p.first_name || ''} ${p.last_name || ''}`.trim();
            const displayName = document.getElementById('userDisplayName');
            const displayEmail = document.getElementById('userDisplayEmail');
            
            if (displayName) displayName.textContent = fullName || 'User';
            if (displayEmail) displayEmail.textContent = p.email || '';
            
            const initial = p.first_name ? p.first_name.charAt(0).toUpperCase() : 'U';
            const avatarDiv = document.querySelector('.user-avatar');
            if (avatarDiv && !localStorage.getItem('cleanspark_profile_picture')) {
                avatarDiv.innerHTML = '';
                const span = document.createElement('span');
                span.className = 'initial';
                span.textContent = initial;
                avatarDiv.appendChild(span);
            }
            
            updateLogoutModalInfo(p);
            updateDeleteModalInfo(p);
            
            return p;
        }
    } catch (error) {
        showLoading(false);
        console.error('Error loading profile:', error);
        showNotification('Failed to load profile data', 'error');
        return null;
    }
}

async function saveProfile(event) {
    event.preventDefault();

    const profileData = {
        first_name: document.getElementById('firstName').value.trim(),
        last_name: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        gender: document.getElementById('gender').value
    };

    if (!profileData.first_name || !profileData.last_name) {
        showNotification('Please fill in your first and last name', 'error');
        return;
    }
    if (!profileData.email) {
        showNotification('Please enter your email address', 'error');
        return;
    }

    try {
        showLoading(true);
        const response = await API.auth.updateProfile(profileData);
        showLoading(false);

        if (response.success) {
            // Update localStorage currentUser
            const currentUser = getCurrentUser();
            if (currentUser) {
                currentUser.first_name = profileData.first_name;
                currentUser.last_name = profileData.last_name;
                currentUser.email = profileData.email;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            await loadProfileData();
            showNotification('Profile updated successfully!', 'success');
        } else {
            showNotification(response.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        showLoading(false);
        console.error('Error saving profile:', error);
        showNotification(error.message || 'Failed to update profile', 'error');
    }
}

function updateLogoutModalInfo(profile) {
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    const logoutUserName = document.getElementById('logoutUserName');
    const logoutUserEmail = document.getElementById('logoutUserEmail');
    
    if (logoutUserName) logoutUserName.textContent = fullName || 'User';
    if (logoutUserEmail) logoutUserEmail.textContent = profile.email || '';
}

function updateDeleteModalInfo(profile) {
    const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    const deleteUserName = document.getElementById('deleteUserName');
    const deleteUserEmail = document.getElementById('deleteUserEmail');
    
    if (deleteUserName) deleteUserName.textContent = fullName || 'User';
    if (deleteUserEmail) deleteUserEmail.textContent = profile.email || '';
}

// ===== PASSWORD FUNCTIONS =====
function setupPasswordStrength() {
    const newPassword = document.getElementById('newPassword');
    if (newPassword) newPassword.addEventListener('input', checkPasswordStrength);
}

function checkPasswordStrength() {
    const password = document.getElementById('newPassword').value;
    const strengthDiv = document.getElementById('passwordStrength');
    if (!password) {
        if (strengthDiv) strengthDiv.innerHTML = '';
        return;
    }

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;

    let message = '', className = '';
    if (strength <= 2) {
        message = 'Weak';
        className = 'strength-weak';
    } else if (strength <= 4) {
        message = 'Medium';
        className = 'strength-medium';
    } else {
        message = 'Strong';
        className = 'strength-strong';
    }

    if (strengthDiv) {
        strengthDiv.innerHTML = `<i class="fas fa-shield-alt"></i> ${message} password`;
        strengthDiv.className = `password-strength ${className}`;
    }
}

async function changePassword(event) {
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
    if (newPassword.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }

    try {
        showLoading(true);
        const response = await API.auth.changePassword(currentPassword, newPassword, confirmPassword);
        showLoading(false);

        if (response.success) {
            showNotification('Password changed successfully! Please login again.', 'success');
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            
            setTimeout(() => performLogout(), 2000);
        } else {
            showNotification(response.message || 'Failed to change password', 'error');
        }
    } catch (error) {
        showLoading(false);
        console.error('Error changing password:', error);
        showNotification(error.message || 'Failed to change password', 'error');
    }
}

// ===== SAVED LOCATIONS =====
async function loadLocations() {
    try {
        const response = await API.profile.getLocations();
        const container = document.getElementById('locationsList');
        if (!container) return;

        if (response.success && response.locations && response.locations.length > 0) {
            container.innerHTML = response.locations.map(loc => `
                <div class="location-item" data-id="${loc.id}">
                    <div class="location-info">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${escapeHtml(loc.location_name)}</span>
                    </div>
                    <div class="location-actions">
                        <button onclick="deleteLocation(${loc.id})" class="btn btn-sm btn-outline-danger">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="text-center text-muted py-4">No saved locations yet. Add your first location above!</div>';
        }
    } catch (error) {
        console.error('Error loading locations:', error);
        document.getElementById('locationsList').innerHTML = '<div class="alert alert-danger">Failed to load locations</div>';
    }
}

async function addLocation() {
    const input = document.getElementById('newLocation');
    const name = input ? input.value.trim() : '';
    
    if (!name) {
        showNotification('Please enter a location name', 'error');
        return;
    }

    try {
        showLoading(true);
        const response = await API.profile.addLocation({
            location_name: name,
            address: name,
            city: 'Zanzibar',
            is_default: false
        });
        showLoading(false);
        
        if (response.success) {
            input.value = '';
            await loadLocations();
            showNotification('Location added successfully!', 'success');
        } else {
            showNotification(response.message || 'Failed to add location', 'error');
        }
    } catch (error) {
        showLoading(false);
        console.error('Error adding location:', error);
        showNotification(error.message || 'Failed to add location', 'error');
    }
}

async function deleteLocation(id) {
    if (!confirm('Are you sure you want to delete this location?')) return;
    
    try {
        showLoading(true);
        const response = await API.profile.deleteLocation(id);
        showLoading(false);
        
        if (response.success) {
            await loadLocations();
            showNotification('Location deleted successfully!', 'success');
        } else {
            showNotification(response.message || 'Failed to delete location', 'error');
        }
    } catch (error) {
        showLoading(false);
        console.error('Error deleting location:', error);
        showNotification(error.message || 'Failed to delete location', 'error');
    }
}

// ===== PAYMENT METHODS =====
let paymentModal = null;

function setupPaymentModal() {
    const modalEl = document.getElementById('paymentModal');
    if (modalEl) paymentModal = new bootstrap.Modal(modalEl);
    
    const saveBtn = document.getElementById('savePaymentBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            savePaymentMethod();
            if (paymentModal) paymentModal.hide();
        });
    }
}

async function loadPaymentMethods() {
    try {
        const response = await API.profile.getPaymentMethods();
        const container = document.getElementById('paymentMethodsList');
        if (!container) return;

        if (response.success && response.payment_methods && response.payment_methods.length > 0) {
            container.innerHTML = response.payment_methods.map(pm => `
                <div class="payment-item" data-id="${pm.id}">
                    <div class="payment-info">
                        <div class="payment-icon"><i class="fas ${getPaymentIcon(pm.payment_type)}"></i></div>
                        <div class="payment-details">
                            <h6>${escapeHtml(formatPaymentType(pm.payment_type))}</h6>
                            <p><strong>Account:</strong> ${escapeHtml(pm.mobile_number || pm.card_last_four || pm.account_number || 'N/A')}</p>
                            <p><strong>Holder:</strong> ${escapeHtml(pm.account_holder || 'N/A')}</p>
                            <p><strong>Added:</strong> ${new Date(pm.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div class="payment-actions">
                        <button onclick="deletePaymentMethod(${pm.id})" class="btn btn-sm btn-outline-danger">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div class="text-center text-muted py-4">No payment methods added yet.</div>';
        }
    } catch (error) {
        console.error('Error loading payment methods:', error);
        document.getElementById('paymentMethodsList').innerHTML = '<div class="alert alert-danger">Failed to load payment methods</div>';
    }
}

function formatPaymentType(type) {
    const types = {
        'mobile_money': 'Mobile Money',
        'credit_card': 'Credit Card',
        'debit_card': 'Debit Card',
        'bank_transfer': 'Bank Transfer'
    };
    return types[type] || type;
}

function addPaymentMethod() {
    const form = document.getElementById('paymentForm');
    if (form) form.reset();
    if (paymentModal) paymentModal.show();
}

async function savePaymentMethod() {
    const paymentType = document.getElementById('paymentType').value;
    const accountNumber = document.getElementById('paymentAccountNumber').value.trim();
    const accountHolder = document.getElementById('paymentAccountHolder').value.trim();
    const notes = document.getElementById('paymentNotes').value.trim();

    if (!paymentType) {
        showNotification('Please select a payment type', 'error');
        return;
    }
    if (!accountNumber) {
        showNotification('Please enter account or phone number', 'error');
        return;
    }
    if (!accountHolder) {
        showNotification('Please enter account holder name', 'error');
        return;
    }

    try {
        showLoading(true);
        // Fix: Send account_holder field correctly
        const response = await API.profile.addPaymentMethod({
            payment_type: paymentType,
            mobile_number: accountNumber,
            account_holder: accountHolder,  // Make sure this matches backend expectation
            notes: notes
        });
        showLoading(false);
        
        if (response.success) {
            await loadPaymentMethods();
            showNotification('Payment method added successfully!', 'success');
            // Clear form
            document.getElementById('paymentForm').reset();
            if (paymentModal) paymentModal.hide();
        } else {
            showNotification(response.message || 'Failed to add payment method', 'error');
        }
    } catch (error) {
        showLoading(false);
        console.error('Error saving payment method:', error);
        showNotification(error.message || 'Failed to add payment method', 'error');
    }
}


async function deletePaymentMethod(id) {
    if (!confirm('Are you sure you want to remove this payment method?')) return;
    
    try {
        showLoading(true);
        const response = await API.profile.deletePaymentMethod(id);
        showLoading(false);
        
        if (response.success) {
            await loadPaymentMethods();
            showNotification('Payment method removed successfully!', 'success');
        } else {
            showNotification(response.message || 'Failed to remove payment method', 'error');
        }
    } catch (error) {
        showLoading(false);
        console.error('Error deleting payment method:', error);
        showNotification(error.message || 'Failed to remove payment method', 'error');
    }
}

function getPaymentIcon(type) {
    if (type.includes('mobile')) return 'fa-mobile-alt';
    if (type.includes('credit')) return 'fa-credit-card';
    if (type.includes('debit')) return 'fa-credit-card';
    if (type.includes('bank')) return 'fa-university';
    return 'fa-wallet';
}

// ===== SERVICE HISTORY =====
async function loadServiceHistory() {
    const container = document.getElementById('historyList');
    if (!container) return;

    try {
        showLoading(true);
        const response = await API.bookings.getMyBookings();
        showLoading(false);

        if (response.success && response.bookings && response.bookings.length > 0) {
            container.innerHTML = response.bookings.map(booking => `
                <div class="history-item">
                    <div class="history-item-header">
                        <div class="history-service-type">
                            <div class="history-service-icon">
                                <i class="fas ${getServiceIcon(booking.service?.name)}"></i>
                            </div>
                            <div class="history-service-info">
                                <h6>${escapeHtml(booking.service?.name || 'Cleaning Service')}</h6>
                                <span>Booking #${booking.id}</span>
                            </div>
                        </div>
                        <span class="history-status status-${booking.status}">${getStatusText(booking.status)}</span>
                    </div>
                    <div class="history-item-body">
                        <div class="history-detail">
                            <span class="history-detail-label">Date</span>
                            <span class="history-detail-value">${formatDate(booking.schedule?.date)}</span>
                        </div>
                        <div class="history-detail">
                            <span class="history-detail-label">Time</span>
                            <span class="history-detail-value">${booking.schedule?.time || 'N/A'}</span>
                        </div>
                        <div class="history-detail">
                            <span class="history-detail-label">Location</span>
                            <span class="history-detail-value">${escapeHtml(booking.location?.address || booking.booking_details?.address || 'N/A')}</span>
                        </div>
                        <div class="history-detail">
                            <span class="history-detail-label">Amount</span>
                            <span class="history-detail-value">TZS ${parseFloat(booking.payment?.total_price || 0).toLocaleString()}</span>
                        </div>
                        <div class="history-detail">
                            <span class="history-detail-label">Payment Status</span>
                            <span class="history-detail-value ${booking.payment?.payment_status === 'paid' ? 'text-success' : 'text-warning'}">
                                ${booking.payment?.payment_status_label || 'N/A'}
                            </span>
                        </div>
                        ${booking.assigned_staff ? `
                        <div class="history-detail">
                            <span class="history-detail-label">Staff</span>
                            <span class="history-detail-value">${escapeHtml(booking.assigned_staff.full_name || booking.assigned_staff.name)}</span>
                        </div>
                        ` : ''}
                    </div>
                    <div class="history-item-footer">
                        <div class="history-date">
                            <i class="far fa-calendar-alt"></i> ${formatDate(booking.created_at)}
                        </div>
                        <button onclick="viewBookingDetails(${booking.id})" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-eye"></i> Details
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = `
                <div class="history-empty text-center py-5">
                    <i class="fas fa-history fa-3x text-muted mb-3"></i>
                    <h5>No Service History</h5>
                    <p>Your bookings will appear here</p>
                    <a href="service.html" class="btn btn-primary mt-3">Book a Service</a>
                </div>`;
        }
    } catch (error) {
        showLoading(false);
        console.error('Error loading service history:', error);
        container.innerHTML = '<div class="alert alert-danger">Failed to load service history</div>';
    }
}

async function viewBookingDetails(bookingId) {
    try {
        showLoading(true);
        const response = await API.bookings.getReceipt(bookingId);
        showLoading(false);
        
        if (response.success && response.receipt) {
            const r = response.receipt;
            const modalBody = document.getElementById('bookingDetailsBody');
            if (modalBody) {
                // Safely handle includes array
                let includesHtml = '';
                if (r.service?.includes && Array.isArray(r.service.includes) && r.service.includes.length > 0) {
                    includesHtml = `
                        <div class="mt-3">
                            <p><strong>What's Included:</strong></p>
                            <ul class="mb-0">
                                ${r.service.includes.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                            </ul>
                        </div>
                    `;
                }
                
                modalBody.innerHTML = `
                    <div class="receipt-details">
                        <p><strong>Booking ID:</strong> #${r.id}</p>
                        <p><strong>Service:</strong> ${escapeHtml(r.service?.name || 'N/A')}</p>
                        <p><strong>Date:</strong> ${r.schedule?.date || 'N/A'}</p>
                        <p><strong>Time:</strong> ${r.schedule?.time || 'N/A'}</p>
                        <p><strong>Address:</strong> ${escapeHtml(r.booking_details?.address || 'N/A')}</p>
                        <p><strong>City:</strong> ${escapeHtml(r.booking_details?.city || 'N/A')}</p>
                        <p><strong>Total Amount:</strong> TZS ${parseFloat(r.pricing?.total_price || 0).toLocaleString()}</p>
                        <p><strong>Payment Method:</strong> ${r.pricing?.payment_method || 'N/A'}</p>
                        <p><strong>Payment Status:</strong> <span class="badge ${r.pricing?.payment_status === 'paid' ? 'bg-success' : 'bg-warning'}">${r.pricing?.payment_status_label || 'N/A'}</span></p>
                        <p><strong>Booking Status:</strong> <span class="badge bg-info">${r.status_label || 'N/A'}</span></p>
                        ${r.assigned_staff ? `<p><strong>Assigned Staff:</strong> ${escapeHtml(r.assigned_staff.full_name || r.assigned_staff.name)}</p>` : ''}
                        ${includesHtml}
                        ${r.special_instructions_cleaners ? `<p><strong>Special Instructions:</strong> ${escapeHtml(r.special_instructions_cleaners)}</p>` : ''}
                    </div>
                `;
            }
            const modal = new bootstrap.Modal(document.getElementById('bookingDetailsModal'));
            modal.show();
        } else {
            showNotification('Failed to load booking details', 'error');
        }
    } catch (error) {
        showLoading(false);
        console.error('Error loading booking details:', error);
        showNotification(error.message || 'Failed to load booking details', 'error');
    }
}

function getServiceIcon(serviceName) {
    if (!serviceName) return 'fa-broom';
    const name = serviceName.toLowerCase();
    if (name.includes('home')) return 'fa-home';
    if (name.includes('office')) return 'fa-building';
    if (name.includes('carpet')) return 'fa-rug';
    return 'fa-broom';
}

function getStatusText(status) {
    const map = {
        completed: 'Completed',
        pending: 'Pending',
        confirmed: 'Confirmed',
        in_progress: 'In Progress',
        cancelled: 'Cancelled'
    };
    return map[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ===== NOTIFICATIONS =====
async function loadNotifications() {
    try {
        const emailResponse = await API.auth.getNotificationPreferences();
        if (emailResponse.success && emailResponse.preferences) {
            const emailCb = document.getElementById('emailNotifications');
            if (emailCb) emailCb.checked = emailResponse.preferences.email_notifications;
        }
    } catch (error) {
        console.error('Error loading email notifications:', error);
    }
    
    try {
        const webResponse = await API.profile.getNotificationSettings();
        if (webResponse.success && webResponse.settings) {
            const webCb = document.getElementById('webNotifications');
            if (webCb) webCb.checked = webResponse.settings.web_notifications;
        }
    } catch (error) {
        console.error('Error loading web notifications:', error);
    }
}

async function saveNotifications() {
    const emailEnabled = document.getElementById('emailNotifications')?.checked || false;
    const webEnabled = document.getElementById('webNotifications')?.checked || false;
    
    try {
        showLoading(true);
        await API.auth.toggleEmailNotifications(emailEnabled);
        await API.profile.toggleWebNotifications(webEnabled);
        showLoading(false);
        showNotification('Notification preferences saved successfully!', 'success');
    } catch (error) {
        showLoading(false);
        console.error('Error saving notifications:', error);
        showNotification(error.message || 'Failed to save preferences', 'error');
    }
}

// ===== PREFERENCES =====
function loadPreferences() {
    const language = localStorage.getItem('pref_language') || 'en';
    const timezone = localStorage.getItem('pref_timezone') || 'UTC+3';
    const autoConfirm = localStorage.getItem('pref_autoConfirm') === 'true';
    
    const langSelect = document.getElementById('languageSelect');
    const tzSelect = document.getElementById('timezoneSelect');
    const autoCheckbox = document.getElementById('autoBookConfirm');
    
    if (langSelect) langSelect.value = language;
    if (tzSelect) tzSelect.value = timezone;
    if (autoCheckbox) autoCheckbox.checked = autoConfirm;
}

function savePreferences() {
    const language = document.getElementById('languageSelect')?.value || 'en';
    const timezone = document.getElementById('timezoneSelect')?.value || 'UTC+3';
    const autoConfirm = document.getElementById('autoBookConfirm')?.checked || false;
    
    localStorage.setItem('pref_language', language);
    localStorage.setItem('pref_timezone', timezone);
    localStorage.setItem('pref_autoConfirm', autoConfirm);
    
    showNotification('Preferences saved successfully!', 'success');
}

// ===== LOGOUT =====
let logoutModal = null;

function setupLogoutModal() {
    const modalEl = document.getElementById('logoutModal');
    if (modalEl) logoutModal = new bootstrap.Modal(modalEl);
    
    const confirmBtn = document.getElementById('confirmLogoutBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            performLogout();
            if (logoutModal) logoutModal.hide();
        });
    }
}

function showLogoutModal() {
    if (logoutModal) logoutModal.show();
}

async function performLogout() {
    try {
        showLoading(true);
        await API.auth.logout();
        showLoading(false);
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        API.clearAuthToken();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('pref_language');
        localStorage.removeItem('pref_timezone');
        localStorage.removeItem('pref_autoConfirm');
        localStorage.removeItem('cleanspark_profile_picture');
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('staffLoggedIn');
        
        showNotification('Logged out successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// ===== DELETE ACCOUNT =====
let deleteAccountModal = null;

function setupDeleteAccountModal() {
    const modalEl = document.getElementById('deleteAccountModal');
    if (!modalEl) return;

    deleteAccountModal = new bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: false });

    modalEl.addEventListener('show.bs.modal', function() {
        showDeleteStep(1);
        const input = document.getElementById('deleteConfirmInput');
        if (input) input.value = '';
        const feedback = document.getElementById('deleteInputFeedback');
        if (feedback) {
            feedback.textContent = '';
            feedback.className = 'delete-input-feedback';
        }
        const confirmBtn = document.getElementById('confirmDeleteAccountBtn');
        if (confirmBtn) confirmBtn.disabled = true;
    });

    const proceedBtn = document.getElementById('proceedToStep2Btn');
    if (proceedBtn) {
        proceedBtn.addEventListener('click', function() {
            showDeleteStep(2);
            setTimeout(() => document.getElementById('deleteConfirmInput')?.focus(), 300);
        });
    }

    const backBtn = document.getElementById('backToStep1Btn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            showDeleteStep(1);
        });
    }

    const confirmInput = document.getElementById('deleteConfirmInput');
    if (confirmInput) {
        confirmInput.addEventListener('input', function() {
            validateDeleteInput(this.value);
        });
    }

    const confirmDeleteBtn = document.getElementById('confirmDeleteAccountBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            if (document.getElementById('deleteConfirmInput')?.value.toUpperCase() === 'DELETE') {
                performAccountDeletion();
            }
        });
    }
}

function showDeleteStep(step) {
    for (let n = 1; n <= 3; n++) {
        const el = document.getElementById(`deleteStep${n}`);
        if (el) el.style.display = n === step ? 'block' : 'none';
    }
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
    if (deleteAccountModal) deleteAccountModal.show();
}

async function performAccountDeletion() {
    showDeleteStep(3);
    
    const progressFill = document.getElementById('deleteProgressFill');
    const progressText = document.getElementById('deleteProgressText');
    
    const steps = [
        { pct: 25, text: 'Verifying account...' },
        { pct: 50, text: 'Deleting profile...' },
        { pct: 75, text: 'Clearing history...' },
        { pct: 100, text: 'Finalising...' }
    ];
    
    let i = 0;
    const interval = setInterval(() => {
        if (i < steps.length) {
            if (progressFill) progressFill.style.width = steps[i].pct + '%';
            if (progressText) progressText.textContent = steps[i].text;
            i++;
        }
    }, 400);
    
    try {
        const password = prompt('Please enter your password to confirm deletion:');
        if (!password) {
            clearInterval(interval);
            showNotification('Account deletion cancelled', 'info');
            if (deleteAccountModal) deleteAccountModal.hide();
            return;
        }
        
        const response = await API.auth.deleteAccount(password, 'DELETE');
        
        clearInterval(interval);
        if (progressFill) progressFill.style.width = '100%';
        if (progressText) progressText.textContent = 'Account deleted successfully!';
        
        setTimeout(() => {
            if (deleteAccountModal) deleteAccountModal.hide();
            API.clearAuthToken();
            localStorage.clear();
            showNotification('Your account has been permanently deleted.', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }, 800);
        
    } catch (error) {
        clearInterval(interval);
        console.error('Error deleting account:', error);
        showNotification(error.message || 'Failed to delete account', 'error');
        showDeleteStep(1);
    }
}

// ===== UI FUNCTIONS =====
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
    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 4000);
}

function showLoading(show) {
    let spinner = document.getElementById('loading-spinner');
    if (!spinner && show) {
        spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
        spinner.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;background:rgba(0,0,0,0.5);width:100%;height:100%;display:flex;align-items:center;justify-content:center;';
        document.body.appendChild(spinner);
    }
    if (spinner) {
        spinner.style.display = show ? 'flex' : 'none';
    }
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) profileForm.addEventListener('submit', saveProfile);
    
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) passwordForm.addEventListener('submit', changePassword);
    
    const addLocationBtn = document.getElementById('addLocationBtn');
    if (addLocationBtn) addLocationBtn.addEventListener('click', addLocation);
    
    const addPaymentBtn = document.getElementById('addPaymentBtn');
    if (addPaymentBtn) addPaymentBtn.addEventListener('click', addPaymentMethod);
    
    const saveNotificationsBtn = document.getElementById('saveNotificationsBtn');
    if (saveNotificationsBtn) saveNotificationsBtn.addEventListener('click', saveNotifications);
    
    const savePreferencesBtn = document.getElementById('savePreferencesBtn');
    if (savePreferencesBtn) savePreferencesBtn.addEventListener('click', savePreferences);
    
    const newLocationInput = document.getElementById('newLocation');
    if (newLocationInput) {
        newLocationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addLocation();
            }
        });
    }
}

function setupMenuClickHandlers() {
    document.querySelectorAll('.account-menu li').forEach(item => {
        item.addEventListener('click', function(e) {
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

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Account page initializing...');
    
    setupSidebarFunctions();
    setupPasswordStrength();
    setupEventListeners();
    setupMenuClickHandlers();
    setupLogoutModal();
    setupDeleteAccountModal();
    setupPaymentModal();
    initProfilePicture();
    
    const isAuth = await enforceAccessControl();
    if (!isAuth) return;
    
    await loadProfileData();
    await loadLocations();
    await loadPaymentMethods();
    await loadServiceHistory();
    await loadNotifications();
    await loadPreferences();
    
    console.log('Account page initialized successfully');
});

// Global exports
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.showSection = showSection;
window.showLogoutModal = showLogoutModal;
window.showDeleteAccountModal = showDeleteAccountModal;
window.viewBookingDetails = viewBookingDetails;
window.deleteLocation = deleteLocation;
window.deletePaymentMethod = deletePaymentMethod;