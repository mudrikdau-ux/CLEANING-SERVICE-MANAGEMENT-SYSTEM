// ============================================================
//  CleanSpark ADMIN PANEL — admin.js (COMPLETE FULL VERSION)
//  All prices in TZS | Full Backend Integration
// ============================================================

// ========== GLOBAL VARIABLES ==========
let generatedOTP = null;
let otpExpiry = null;
let pendingServiceImage = null;
let pendingStaffImage = null;
let pendingEditServiceImage = null;
let pendingEditStaffImage = null;
let modalImageBase64 = null;
let currentImageTarget = null;
let selectedAssignStaffId = null;
let currentAssignServiceId = null;
let currentAssignBookingId = null;
let currentMessageId = null;
let currentContractorId = null;
let currentInvoiceData = null;
let currentContractorFilter = 'all';
let currentApplicationFilter = 'all';
let currentApplicationId = null;
let currentBookingId = null;
let currentStaffIssueId = null;
let currentUserId = null;
let currentReportId = null;
let bookingChart = null;
let revenueChart = null;
let logoutTimer = null;
let notificationCheckInterval = null;
let isAdminLoggedIn = false;
let paymentPollingInterval = null;
let isRefreshing = false;
let allSupervisors = [];

const MAX_INCLUDED = 6;

// ========== UTILITIES ==========
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, function(ch) {
        var replacements = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return replacements[ch];
    });
}

function formatTZS(amount) {
    if (!amount && amount !== 0) return 'TZS 0';
    return 'TZS ' + Number(amount).toLocaleString('en-TZ');
}

function showNotification(message, type) {
    type = type || 'info';
    var container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(container);
    }

    var icons = {
        success: { icon: 'bi-check-circle-fill', color: '#16a34a' },
        error: { icon: 'bi-exclamation-triangle-fill', color: '#dc2626' },
        info: { icon: 'bi-info-circle-fill', color: '#1a56db' },
        warning: { icon: 'bi-exclamation-circle-fill', color: '#d97706' }
    };
    var cfg = icons[type] || icons.info;

    var toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.borderLeftColor = cfg.color;
    toast.innerHTML = '<div class="d-flex align-items-center gap-2"><i class="bi ' + cfg.icon + '" style="color:' + cfg.color + '; font-size:16px; flex-shrink:0;"></i><span class="flex-grow-1">' + escapeHtml(message) + '</span><button style="background:none;border:none;cursor:pointer;opacity:.5;font-size:14px;padding:0;margin-left:6px;" onclick="this.closest(\'.toast-notification\').remove()">✕</button></div>';
    container.appendChild(toast);
    setTimeout(function() { if (toast.parentNode) toast.remove(); }, 4000);
}

function togglePassword(inputId, btn) {
    var input = document.getElementById(inputId);
    if (!input) return;
    var icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'bi bi-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'bi bi-eye';
    }
}

function formatDate(dateString) {
    if (!dateString) return '—';
    var date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
}

function formatDateTime(dateString) {
    if (!dateString) return '—';
    var date = new Date(dateString);
    return date.toLocaleString('en-GB');
}

// ========== OTP FUNCTIONS ==========
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendOTP(email) {
    generatedOTP = generateOTP();
    otpExpiry = Date.now() + 5 * 60 * 1000;
    console.log('[DEMO] OTP for ' + email + ': ' + generatedOTP);
    showNotification('OTP sent to ' + email + ' (Demo: ' + generatedOTP + ')', 'success');
    return true;
}

// ========== DEBUG TOKEN FUNCTION ==========
function debugToken() {
    const token = localStorage.getItem('cleanspark_token') || sessionStorage.getItem('cleanspark_token');
    console.log('Token exists:', !!token);
    if (token) {
        try {
            const parts = token.split('.');
            const payload = JSON.parse(atob(parts[1]));
            console.log('Token payload:', payload);
            console.log('Role in token:', payload.role);
            console.log('Token expiry:', new Date(payload.exp * 1000).toLocaleString());
            return payload;
        } catch (e) {
            console.error('Error decoding token:', e);
            return null;
        }
    }
    return null;
}

// ========== LOGIN FUNCTIONS ==========
async function verifyCredentials() {
    var emailInput = document.getElementById('adminEmail');
    var passwordInput = document.getElementById('adminPassword');
    
    if (!emailInput || !passwordInput) {
        showNotification('Login form not loaded properly', 'error');
        return;
    }
    
    var email = emailInput.value.trim();
    var password = passwordInput.value;

    if (!email || !password) {
        showNotification('Please enter both email and password', 'error');
        return;
    }

    try {
        showNotification('Verifying credentials...', 'info');
        const result = await API.auth.adminLogin(email, password);
        
        if (result.message) {
            showNotification(result.message, 'success');
            var step1 = document.querySelector('.step-1');
            var step2 = document.querySelector('.step-2');
            if (step1) step1.classList.remove('active');
            if (step2) step2.classList.add('active');
            setTimeout(function() {
                var otp1 = document.getElementById('otp1');
                if (otp1) otp1.focus();
            }, 100);
        }
    } catch (error) {
        showNotification(error.message || 'Invalid email or password!', 'error');
        var card = document.querySelector('.login-card');
        if (card) {
            card.style.animation = 'shake 0.5s';
            setTimeout(function() { card.style.animation = ''; }, 500);
        }
    }
}

async function verifyOTP() {
    var enteredOTP = '';
    for (var i = 1; i <= 6; i++) {
        var otpField = document.getElementById('otp' + i);
        enteredOTP += otpField ? otpField.value : '';
    }

    if (enteredOTP.length !== 6) {
        showNotification('Please enter the full 6-digit OTP', 'error');
        return;
    }

    var email = document.getElementById('adminEmail').value.trim();

    try {
        showNotification('Verifying OTP...', 'info');
        const result = await API.auth.adminVerifyOTP(email, enteredOTP);
        
        if (result.token) {
            localStorage.setItem('cleanspark_token', result.token);
            sessionStorage.setItem('cleanspark_token', result.token);
            sessionStorage.setItem('adminLoggedIn', 'true');
            isAdminLoggedIn = true;
            
            debugToken();
            
            var loginSection = document.getElementById('loginSection');
            var dashboard = document.getElementById('dashboard');
            if (loginSection) loginSection.style.display = 'none';
            if (dashboard) {
                dashboard.style.display = 'flex';
                dashboard.style.flexDirection = 'column';
            }
            if (result.admin && result.admin.first_name) {
                document.getElementById('adminName').textContent = result.admin.first_name + ' ' + (result.admin.last_name || '');
            }
            initDashboard();
            showNotification('Login successful! Welcome, Administrator.', 'success');
        }
    } catch (error) {
        showNotification(error.message || 'Invalid OTP. Please try again.', 'error');
    }
}

async function resendOTP() {
    var email = document.getElementById('adminEmail').value.trim();
    try {
        await API.auth.resendAdminOTP(email);
        showNotification('New OTP sent to your email', 'success');
        for (var i = 1; i <= 6; i++) {
            var otpField = document.getElementById('otp' + i);
            if (otpField) otpField.value = '';
        }
        var otp1 = document.getElementById('otp1');
        if (otp1) otp1.focus();
    } catch (error) {
        showNotification(error.message || 'Failed to resend OTP', 'error');
    }
}

function backToLogin() {
    var step2 = document.querySelector('.step-2');
    var step1 = document.querySelector('.step-1');
    if (step2) step2.classList.remove('active');
    if (step1) step1.classList.add('active');
    var passwordInput = document.getElementById('adminPassword');
    if (passwordInput) passwordInput.value = '';
    for (var i = 1; i <= 6; i++) {
        var otpField = document.getElementById('otp' + i);
        if (otpField) otpField.value = '';
    }
}

function moveToNext(current, nextId) {
    if (current.value.length === 1) {
        var next = document.getElementById(nextId);
        if (next) next.focus();
    }
}

function validateOTP() {
    var otp6 = document.getElementById('otp6');
    if (otp6 && otp6.value.length === 1) verifyOTP();
}

function showDemoCredentials() {
    showNotification('Email: admin@CleanSpark.co.tz | Password: Admin@2024', 'info');
}

// ========== ENHANCED LOGOUT FLOW ==========
function initiateLogout() {
    var overlay = document.getElementById('logoutOverlay');
    if (overlay) overlay.style.display = 'flex';
}

function cancelLogout() {
    var overlay = document.getElementById('logoutOverlay');
    if (overlay) overlay.style.display = 'none';
}

async function confirmLogout() {
    var overlay = document.getElementById('logoutOverlay');
    if (overlay) overlay.style.display = 'none';
    var loadingOverlay = document.getElementById('logoutLoading');
    if (loadingOverlay) loadingOverlay.style.display = 'flex';
    
    var progressBar = document.getElementById('logoutProgressBar');
    var progress = 0;
    
    var progressInterval = setInterval(function() {
        progress += Math.random() * 30;
        if (progress > 100) progress = 100;
        if (progressBar) progressBar.style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(progressInterval);
            performLogout();
        }
    }, 300);
}

async function performLogout() {
    try {
        await API.auth.adminLogout();
    } catch (error) {
        console.error('Logout API error:', error);
    }
    
    localStorage.removeItem('cleanspark_token');
    sessionStorage.removeItem('cleanspark_token');
    sessionStorage.removeItem('adminLoggedIn');
    isAdminLoggedIn = false;
    
    if (paymentPollingInterval) {
        clearInterval(paymentPollingInterval);
        paymentPollingInterval = null;
    }
    
    setTimeout(function() {
        var loadingOverlay = document.getElementById('logoutLoading');
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        
        var dashboard = document.getElementById('dashboard');
        if (dashboard) dashboard.style.display = 'none';
        
        var loginSection = document.getElementById('loginSection');
        if (loginSection) loginSection.style.display = 'flex';
        
        var emailInput = document.getElementById('adminEmail');
        var passwordInput = document.getElementById('adminPassword');
        if (emailInput) emailInput.value = '';
        if (passwordInput) passwordInput.value = '';
        
        var step2 = document.querySelector('.step-2');
        var step1 = document.querySelector('.step-1');
        if (step2) step2.classList.remove('active');
        if (step1) step1.classList.add('active');
        
        for (var i = 1; i <= 6; i++) {
            var otpField = document.getElementById('otp' + i);
            if (otpField) otpField.value = '';
        }
        
        showNotification('Logged out successfully! See you soon.', 'info');
    }, 500);
}

// ========== NAVIGATION ==========
function showSection(sectionId) {
    var sections = document.querySelectorAll('.admin-section');
    for (var i = 0; i < sections.length; i++) {
        sections[i].classList.remove('active');
    }
    var target = document.getElementById(sectionId + 'Section');
    if (target) target.classList.add('active');

    var menuItems = document.querySelectorAll('.sidebar-menu li');
    for (var i = 0; i < menuItems.length; i++) {
        menuItems[i].classList.remove('active');
        if (menuItems[i].getAttribute('data-section') === sectionId) {
            menuItems[i].classList.add('active');
        }
    }

    if (sectionId === 'assignment') {
        loadAssignmentSection();
    }
    if (sectionId === 'applications') {
        loadApplications();
    }
    if (sectionId === 'staffInfo') {
        loadStaffIssues();
    }
    if (sectionId === 'messages') {
        loadAllMessages();
    }
    if (sectionId === 'bookings') {
        loadBookings();
    }
    if (sectionId === 'contractors') {
        loadContractors();
    }
    if (sectionId === 'services') {
        loadServices();
    }
    if (sectionId === 'staff') {
        loadStaff();
        loadSupervisorsForDropdown();
    }
    if (sectionId === 'invoice') {
        loadInvoices();
        populateInvoiceContractors();
    }
    if (sectionId === 'reports') {
        loadReportsHistory();
    }
    if (sectionId === 'supervisor') {
        renderSupervisorDashboard();
    }
}

function setupMenuClickHandlers() {
    var menuItems = document.querySelectorAll('.sidebar-menu li');
    for (var i = 0; i < menuItems.length; i++) {
        var item = menuItems[i];
        item.addEventListener('click', function() {
            var section = this.getAttribute('data-section');
            if (section === 'logout') {
                initiateLogout();
            } else if (section) {
                showSection(section);
            }
        });
    }
}

// ========== SUPERVISOR ASSIGNMENT FUNCTIONS ==========

/**
 * Load supervisors for dropdown in staff management
 */
async function loadSupervisorsForDropdown() {
    try {
        const data = await API.adminStaff.getAll();
        const supervisors = data.staff ? data.staff.filter(s => s.staff_type === 'general_supervisor') : [];
        allSupervisors = supervisors;
        
        // Add dropdown for new staff
        const select = document.getElementById('supervisorSelect');
        if (select) {
            select.innerHTML = '<option value="">-- Select General Supervisor --</option>' +
                supervisors.map(s => `<option value="${s.id}">${escapeHtml(s.full_name)}</option>`).join('');
        }
        
        // Also update edit modal dropdown
        const editSelect = document.getElementById('editSupervisorSelect');
        if (editSelect) {
            editSelect.innerHTML = '<option value="">-- Select General Supervisor --</option>' +
                supervisors.map(s => `<option value="${s.id}">${escapeHtml(s.full_name)}</option>`).join('');
        }
    } catch (error) {
        console.error('Load supervisors for dropdown error:', error);
    }
}

// ========== STAFF FUNCTIONS (WITH SUPERVISOR ASSIGNMENT) ==========
async function loadStaff() {
    try {
        const result = await API.adminStaff.getAll();
        var staff = result.staff || [];
        var html = '';
        if (staff.length === 0) {
            html = '<tr><td colspan="7" class="text-center text-muted py-4">No staff members added yet</td></tr>';
        } else {
            for (var i = 0; i < staff.length; i++) {
                var member = staff[i];
                var initials = (member.first_name ? member.first_name.charAt(0) : '') + (member.last_name ? member.last_name.charAt(0) : '');
                initials = initials.toUpperCase() || '?';
                var avatarHtml = member.photo ? '<img src="' + escapeHtml(member.photo) + '" alt="' + escapeHtml(member.full_name) + '" class="staff-avatar">' : '<div class="staff-initials">' + escapeHtml(initials) + '</div>';
                
                // Staff type label with badge
                var staffTypeLabel = member.staff_type === 'supervisor' ? 'Supervisor' : (member.staff_type === 'general_supervisor' ? 'General Supervisor' : 'Normal');
                var staffTypeClass = member.staff_type === 'supervisor' ? 'staff-type-supervisor' : (member.staff_type === 'general_supervisor' ? 'staff-type-general_supervisor' : 'staff-type-normal');
                
                // SUPERVISOR COLUMN - Display supervisor name or status
                var supervisorDisplay = '';
                if (member.staff_type === 'normal') {
                    if (member.general_supervisor_id) {
                        // Find supervisor in the allSupervisors array
                        var supervisorFound = allSupervisors.find(function(s) { 
                            return s.id === member.general_supervisor_id; 
                        });
                        if (supervisorFound) {
                            supervisorDisplay = '<span class="supervisor-assigned">' + escapeHtml(supervisorFound.full_name) + '</span>';
                        } else {
                            supervisorDisplay = '<span class="supervisor-assigned">Assigned</span>';
                        }
                    } else {
                        supervisorDisplay = '<span class="supervisor-warning">⚠️ Not Assigned</span>';
                    }
                } else {
                    // For supervisors and general supervisors, show their role
                    supervisorDisplay = '<span class="text-muted" style="font-size:12px;">—</span>';
                }
                
                // ACTIONS COLUMN - Only Edit and Delete buttons
                var actionsHtml = `
                    <button class="action-btn action-btn-edit" onclick="openEditStaffModal(${member.id})" title="Edit">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="action-btn action-btn-delete" onclick="deleteStaff(${member.id})" title="Remove">
                        <i class="bi bi-trash3-fill"></i>
                    </button>
                `;
                
                html += '<tr>' +
                    '<td class="align-middle">' + avatarHtml + '</td>' +
                    '<td class="align-middle"><strong>' + escapeHtml(member.full_name) + '</strong></td>' +
                    '<td class="align-middle">' + escapeHtml(member.email) + '</td>' +
                    '<td class="align-middle"><span class="staff-type-badge ' + staffTypeClass + '">' + staffTypeLabel + '</span></td>' +
                    '<td class="align-middle">' + escapeHtml(member.phone || '—') + '</td>' +
                    '<td class="align-middle">' + supervisorDisplay + '</td>' +  <!-- SUPERVISOR COLUMN -->
                    '<td class="align-middle text-center">' + actionsHtml + '</td>' +  <!-- ACTIONS COLUMN -->
                '</tr>';
            }
        }
        var staffList = document.getElementById('staffList');
        if (staffList) staffList.innerHTML = html;
        loadSupervisorsForDropdown();
    } catch (error) {
        console.error('Load staff error:', error);
        showNotification('Failed to load staff', 'error');
    }
}

async function addStaff() {
    var firstName = document.getElementById('staffFirstName') ? document.getElementById('staffFirstName').value.trim() : '';
    var lastName = document.getElementById('staffLastName') ? document.getElementById('staffLastName').value.trim() : '';
    var email = document.getElementById('staffEmail') ? document.getElementById('staffEmail').value.trim() : '';
    var staffType = document.getElementById('staffType') ? document.getElementById('staffType').value : 'normal';
    var phone = document.getElementById('staffPhone') ? document.getElementById('staffPhone').value.trim() : '';
    var password = document.getElementById('staffPass') ? document.getElementById('staffPass').value : '';
    var supervisorSelect = document.getElementById('supervisorSelect');
    var supervisorId = supervisorSelect ? supervisorSelect.value : '';
    
    if (!firstName || !lastName || !email || !password) {
        showNotification('Please fill in all required staff details', 'error');
        return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Validate supervisor assignment for normal staff
    if (staffType === 'normal' && !supervisorId) {
        showNotification('Every Normal Staff must have a General Supervisor assigned!', 'error');
        return;
    }

    var formData = new FormData();
    formData.append('full_name', firstName + ' ' + lastName);
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('email', email);
    formData.append('staff_type', staffType);
    formData.append('phone', phone);
    formData.append('password', password);
    formData.append('general_supervisor_id', supervisorId || null);
    if (pendingStaffImage) {
        var blob = dataURLtoBlob(pendingStaffImage);
        formData.append('photo', blob, 'staff_photo.jpg');
    }

    try {
        await API.adminStaff.add(formData);
        showNotification('Staff member added successfully!', 'success');
        
        if (document.getElementById('staffFirstName')) document.getElementById('staffFirstName').value = '';
        if (document.getElementById('staffLastName')) document.getElementById('staffLastName').value = '';
        if (document.getElementById('staffEmail')) document.getElementById('staffEmail').value = '';
        if (document.getElementById('staffPhone')) document.getElementById('staffPhone').value = '';
        if (document.getElementById('staffPass')) document.getElementById('staffPass').value = '';
        if (supervisorSelect) supervisorSelect.value = '';
        clearStaffImage();
        
        loadStaff();
        loadDashboardStats();
        loadSupervisorsForDropdown();
    } catch (error) {
        showNotification(error.message || 'Failed to add staff member', 'error');
    }
}

async function deleteStaff(staffId) {
    if (!confirm('Remove this staff member?')) return;
    try {
        await API.adminStaff.delete(staffId);
        loadStaff();
        loadDashboardStats();
        showNotification('Staff member removed.', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to delete staff', 'error');
    }
}

async function openEditStaffModal(staffId) {
    try {
        const result = await API.adminStaff.getById(staffId);
        var member = result.staff;
        if (!member) return;
        
        pendingEditStaffImage = null;
        document.getElementById('editStaffId').value = staffId;
        document.getElementById('editStaffFirstName').value = member.first_name || '';
        document.getElementById('editStaffLastName').value = member.last_name || '';
        document.getElementById('editStaffEmail').value = member.email || '';
        document.getElementById('editStaffType').value = member.staff_type || 'normal';
        document.getElementById('editStaffPhone').value = member.phone || '';
        document.getElementById('editStaffPassword').value = '';
        
        // SAFE: Set supervisor value with null check
        var editSupervisorSelect = document.getElementById('editSupervisorSelect');
        if (editSupervisorSelect) {
            // Make sure dropdown is populated first
            await loadSupervisorsForDropdown();
            editSupervisorSelect.value = member.general_supervisor_id || '';
        }
        
        var initials = (member.first_name ? member.first_name.charAt(0) : '') + (member.last_name ? member.last_name.charAt(0) : '');
        initials = initials.toUpperCase() || '?';
        var photoEl = document.getElementById('editStaffPhotoPreview');
        var initialsEl = document.getElementById('editStaffInitials');
        if (member.photo) {
            if (photoEl) {
                photoEl.src = member.photo;
                photoEl.style.display = 'block';
            }
            if (initialsEl) initialsEl.style.display = 'none';
            pendingEditStaffImage = member.photo;
        } else {
            if (photoEl) {
                photoEl.style.display = 'none';
                photoEl.src = '';
            }
            if (initialsEl) {
                initialsEl.textContent = initials;
                initialsEl.style.display = 'flex';
            }
        }
        
        var modal = document.getElementById('editStaffModal');
        if (modal) new bootstrap.Modal(modal).show();
    } catch (error) {
        showNotification(error.message || 'Failed to load staff', 'error');
    }
}

async function saveEditedStaff() {
    var staffId = parseInt(document.getElementById('editStaffId').value);
    var firstName = document.getElementById('editStaffFirstName').value.trim();
    var lastName = document.getElementById('editStaffLastName').value.trim();
    var email = document.getElementById('editStaffEmail').value.trim();
    var staffType = document.getElementById('editStaffType').value;
    var phone = document.getElementById('editStaffPhone').value.trim();
    var newPass = document.getElementById('editStaffPassword').value;
    
    // SAFE: Get supervisor value with null check
    var editSupervisorSelect = document.getElementById('editSupervisorSelect');
    var supervisorId = editSupervisorSelect ? editSupervisorSelect.value : '';
    
    if (!firstName || !lastName || !email) {
        showNotification('Name and email are required', 'error');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Validate supervisor assignment for normal staff
    if (staffType === 'normal' && !supervisorId) {
        showNotification('Every Normal Staff must have a General Supervisor assigned!', 'error');
        return;
    }

    var formData = new FormData();
    formData.append('full_name', firstName + ' ' + lastName);
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('email', email);
    formData.append('staff_type', staffType);
    formData.append('phone', phone);
    formData.append('general_supervisor_id', supervisorId || null);
    if (newPass) formData.append('password', newPass);
    if (pendingEditStaffImage && pendingEditStaffImage.startsWith('data:image')) {
        var blob = dataURLtoBlob(pendingEditStaffImage);
        formData.append('photo', blob, 'staff_photo.jpg');
    }

    try {
        await API.adminStaff.update(staffId, formData);
        var modalEl = document.getElementById('editStaffModal');
        var bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
        loadStaff();
        loadDashboardStats();
        loadSupervisorsForDropdown();
        showNotification('Staff member updated successfully!', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to update staff', 'error');
    }
}

// ========== SUPERVISOR DASHBOARD FUNCTIONS ==========

/**
 * Render Supervisor Dashboard
 */
async function renderSupervisorDashboard() {
    const panel = document.getElementById('supervisorDashboard');
    if (!panel) return;

    try {
        // Load stats
        const statsResponse = await API.generalSupervisor.getDashboardStats();
        const stats = statsResponse.stats || {};
        const statsContainer = document.getElementById('supervisorStats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${stats.total_staff || 0}</div>
                        <div class="stat-label">Total Staff</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.assigned_jobs || 0}</div>
                        <div class="stat-label">Assigned Jobs</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.started_jobs || 0}</div>
                        <div class="stat-label">In Progress</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.pending_verification || 0}</div>
                        <div class="stat-label">Pending Verification</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.completed_jobs || 0}</div>
                        <div class="stat-label">Completed</div>
                    </div>
                </div>
            `;
        }

        // Load staff list
        const staffResponse = await API.generalSupervisor.getSupervisedStaff();
        const staff = staffResponse.staff || [];
        const staffListContainer = document.getElementById('supervisorStaffList');
        if (staffListContainer) {
            if (staff.length === 0) {
                staffListContainer.innerHTML = '<p class="text-muted text-center py-4">No staff members found</p>';
            } else {
                staffListContainer.innerHTML = staff.map(s => `
                    <div class="staff-item">
                        <div class="staff-avatar">
                            ${s.first_name?.charAt(0) || 'S'}${s.last_name?.charAt(0) || ''}
                        </div>
                        <div class="staff-info">
                            <div class="staff-name">${escapeHtml(s.full_name || s.first_name + ' ' + s.last_name)}</div>
                            <div class="staff-details">${escapeHtml(s.phone || 'No phone')} · ${s.active_jobs || 0} active jobs</div>
                        </div>
                        <div class="staff-status ${s.active_jobs > 0 ? 'active' : 'available'}">
                            ${s.active_jobs > 0 ? 'Busy' : 'Available'}
                        </div>
                    </div>
                `).join('');
            }
        }

        // Load jobs
        const jobsResponse = await API.generalSupervisor.getSupervisedJobs({});
        const jobs = jobsResponse.jobs || [];
        const jobsListContainer = document.getElementById('supervisorJobsList');
        if (jobsListContainer) {
            if (jobs.length === 0) {
                jobsListContainer.innerHTML = '<p class="text-muted text-center py-4">No jobs to monitor</p>';
            } else {
                jobsListContainer.innerHTML = jobs.map(j => `
                    <div class="job-item" data-assignment-id="${j.assignment_id}">
                        <div class="job-header">
                            <span class="job-id">#${j.booking_id}</span>
                            <span class="job-status status-${j.status}">${j.status.toUpperCase()}</span>
                        </div>
                        <div class="job-details">
                            <div class="job-customer">${escapeHtml(j.customer_name || 'Customer')}</div>
                            <div class="job-service">${escapeHtml(j.service_name || 'Cleaning Service')}</div>
                            <div class="job-staff">Staff: ${escapeHtml(j.staff_name || 'Unassigned')}</div>
                            <div class="job-date">${formatDate(j.service_date)} at ${escapeHtml(j.service_time || 'TBD')}</div>
                        </div>
                        <div class="job-actions">
                            ${j.status === 'assigned' && !j.customer_confirmed_start ? `
                                <button class="btn-confirm-start" onclick="confirmCustomerStart(${j.assignment_id})">
                                    <i class="fas fa-check"></i> Confirm Start
                                </button>
                            ` : ''}
                            ${j.status === 'assigned' && j.customer_confirmed_start ? `
                                <button class="btn-start-job" onclick="startJob(${j.assignment_id})">
                                    <i class="fas fa-play"></i> Start Job
                                </button>
                            ` : ''}
                            ${j.status === 'started' && !j.customer_confirmed_complete ? `
                                <button class="btn-confirm-complete" onclick="confirmCustomerComplete(${j.assignment_id})">
                                    <i class="fas fa-check"></i> Confirm Completion
                                </button>
                            ` : ''}
                            ${j.status === 'started' && j.customer_confirmed_complete ? `
                                <button class="btn-complete-job" onclick="completeJob(${j.assignment_id})">
                                    <i class="fas fa-check-circle"></i> Complete Job
                                </button>
                            ` : ''}
                            <button class="btn-view-logs" onclick="viewJobLogs(${j.assignment_id})">
                                <i class="fas fa-history"></i> Logs
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Load notifications
        const notifResponse = await API.generalSupervisor.getNotifications({ unread_only: false });
        const notifications = notifResponse.notifications || [];
        const notifContainer = document.getElementById('supervisorNotifications');
        if (notifContainer) {
            if (notifications.length === 0) {
                notifContainer.innerHTML = '<p class="text-muted text-center py-4">No notifications</p>';
            } else {
                notifContainer.innerHTML = notifications.map(n => `
                    <div class="notification-item ${n.is_read ? 'read' : 'unread'}" onclick="markNotificationRead(${n.id})">
                        <div class="notification-icon">
                            <i class="fas ${n.type === 'new_job' ? 'fa-briefcase' : n.type === 'staff_start_request' ? 'fa-play' : 'fa-check'}"></i>
                        </div>
                        <div class="notification-content">
                            <div class="notification-message">${escapeHtml(n.message)}</div>
                            <div class="notification-time">${formatDateTime(n.created_at)}</div>
                        </div>
                        ${!n.is_read ? '<span class="notification-badge">New</span>' : ''}
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Render supervisor dashboard error:', error);
        showNotification('Failed to load supervisor dashboard', 'error');
    }
}

/**
 * Confirm customer start
 */
async function confirmCustomerStart(assignmentId) {
    if (!confirm('Have you confirmed with the customer that the staff has arrived and started the service?')) {
        return;
    }

    try {
        await API.generalSupervisor.confirmCustomerStart(assignmentId, true, 'Customer confirmed start via phone');
        showNotification('Customer start confirmed! You can now mark the job as started.', 'success');
        renderSupervisorDashboard();
    } catch (error) {
        showNotification(error.message || 'Failed to confirm customer start', 'error');
    }
}

/**
 * Start job (Supervisor)
 */
async function startJob(assignmentId) {
    if (!confirm('Are you sure you want to mark this job as started?')) {
        return;
    }

    try {
        await API.generalSupervisor.markJobStarted(assignmentId);
        showNotification('Job marked as started successfully!', 'success');
        renderSupervisorDashboard();
    } catch (error) {
        showNotification(error.message || 'Failed to start job', 'error');
    }
}

/**
 * Confirm customer completion
 */
async function confirmCustomerComplete(assignmentId) {
    if (!confirm('Have you confirmed with the customer that the job has been completed successfully?')) {
        return;
    }

    try {
        await API.generalSupervisor.confirmCustomerCompletion(assignmentId, true, 'Customer confirmed completion via phone');
        showNotification('Customer completion confirmed! You can now mark the job as completed.', 'success');
        renderSupervisorDashboard();
    } catch (error) {
        showNotification(error.message || 'Failed to confirm customer completion', 'error');
    }
}

/**
 * Complete job (Supervisor)
 */
async function completeJob(assignmentId) {
    if (!confirm('Are you sure you want to mark this job as completed?')) {
        return;
    }

    try {
        await API.generalSupervisor.markJobCompleted(assignmentId);
        showNotification('Job marked as completed successfully!', 'success');
        renderSupervisorDashboard();
    } catch (error) {
        showNotification(error.message || 'Failed to complete job', 'error');
    }
}

/**
 * View job activity logs
 */
async function viewJobLogs(assignmentId) {
    try {
        const response = await API.generalSupervisor.getJobLogs(assignmentId);
        const logs = response.logs || [];

        let html = '<div class="logs-container">';
        if (logs.length === 0) {
            html += '<p class="text-muted text-center">No logs available for this job</p>';
        } else {
            logs.forEach(log => {
                html += `
                    <div class="log-item">
                        <div class="log-time">${formatDateTime(log.created_at)}</div>
                        <div class="log-action">${escapeHtml(log.action)}</div>
                        <div class="log-user">${escapeHtml(log.performed_by_name || 'System')}</div>
                        ${log.notes ? `<div class="log-notes">${escapeHtml(log.notes)}</div>` : ''}
                    </div>
                `;
            });
        }
        html += '</div>';

        openGlobalModal('Job Activity Log', html);
    } catch (error) {
        showNotification(error.message || 'Failed to load logs', 'error');
    }
}

/**
 * Mark notification as read
 */
async function markNotificationRead(notificationId) {
    try {
        await API.generalSupervisor.markNotificationRead(notificationId);
        renderSupervisorDashboard();
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
    }
}

/**
 * Open global modal for dynamic content
 */
function openGlobalModal(title, contentHtml) {
    const modalId = 'globalModal';
    let modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content modal-styled">
                    <div class="modal-header">
                        <h5 class="modal-title"></h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-ghost" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    modal.querySelector('.modal-title').textContent = title;
    modal.querySelector('.modal-body').innerHTML = contentHtml;
    
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    return bsModal;
}

// ========== DASHBOARD INIT ==========
async function initDashboard() {
    const token = API.getAuthToken();
    if (!token) {
        showNotification('Session expired. Please login again.', 'error');
        window.location.href = '/login.html';
        return;
    }
    
    const payload = debugToken();
    if (!payload || payload.role !== 'admin') {
        showNotification('Invalid admin session. Please login again.', 'error');
        API.clearAuthToken();
        window.location.href = '/login.html';
        return;
    }
    
    loadDashboardStats();
    loadServices();
    loadBookings();
    loadStaff();
    loadSupervisorsForDropdown();
    loadAllMessages();
    loadContractors();
    loadInvoices();
    initCharts();
    loadRecentBookings();
    loadSettings();
    loadApplicationWindowStatus();
    loadStaffIssues();
    loadReportsHistory();
    setupMenuClickHandlers();
    populateInvoiceContractors();
    loadAssignmentSection();
    
    // ✅ START PAYMENT STATUS POLLING
    startPaymentStatusPolling();
    
    var includedContainer = document.getElementById('includedManualEntry');
    if (includedContainer) {
        initIncludedManualEntry('includedManualEntry', 'addIncludedItemBtn', []);
    }
    
    if (notificationCheckInterval) clearInterval(notificationCheckInterval);
    notificationCheckInterval = setInterval(function() {
        checkForNewNotifications();
    }, 30000);
}

function checkForNewNotifications() {
    updateNotificationBadge();
}

// ========== DASHBOARD FUNCTIONS ==========
async function loadDashboardStats() {
    try {
        const result = await API.adminStats.getDashboard();
        if (result.success && result.stats) {
            const stats = result.stats;
            const summary = stats.summary || {};
            
            var statsGrid = document.getElementById('dashboardStats');
            if (statsGrid) {
                statsGrid.innerHTML = '<div class="stat-card" onclick="showSection(\'services\')"><div class="stat-icon"><i class="bi bi-grid-3x3-gap-fill"></i></div><div class="stat-value">' + (summary.total_services || 0) + '</div><div class="stat-label">Total Services</div></div>' +
                    '<div class="stat-card" onclick="showSection(\'staff\')"><div class="stat-icon"><i class="bi bi-people-fill"></i></div><div class="stat-value">' + (summary.total_staff || 0) + '</div><div class="stat-label">Staff Members</div></div>' +
                    '<div class="stat-card" onclick="showSection(\'bookings\')"><div class="stat-icon"><i class="bi bi-calendar-check-fill"></i></div><div class="stat-value">' + (summary.total_bookings || 0) + '</div><div class="stat-label">Total Bookings</div></div>' +
                    '<div class="stat-card" onclick="showSection(\'bookings\')"><div class="stat-icon" style="background:rgba(22,163,74,0.1);"><i class="bi bi-cash-stack" style="color:#16a34a;"></i></div><div class="stat-value">' + formatTZS(summary.total_revenue || 0) + '</div><div class="stat-label">Total Revenue</div></div>' +
                    '<div class="stat-card" onclick="showSection(\'staffInfo\')"><div class="stat-icon" style="background:rgba(220,38,38,0.1);"><i class="bi bi-exclamation-triangle-fill" style="color:#dc2626;"></i></div><div class="stat-value">' + (stats.bookings ? stats.bookings.pending : 0) + '</div><div class="stat-label">Pending Bookings</div></div>' +
                    '<div class="stat-card" onclick="showSection(\'messages\')"><div class="stat-icon"><i class="bi bi-envelope-fill"></i></div><div class="stat-value">' + (summary.unread_inquiries || 0) + '</div><div class="stat-label">Unread Messages</div></div>' +
                    '<div class="stat-card" onclick="showSection(\'contractors\')"><div class="stat-icon"><i class="bi bi-building"></i></div><div class="stat-value">' + (summary.total_contractors || 0) + '</div><div class="stat-label">Contractors</div></div>' +
                    '<div class="stat-card" onclick="showSection(\'applications\')"><div class="stat-icon" style="background:rgba(236,72,153,0.1);"><i class="bi bi-file-earmark-person-fill" style="color:#ec4899;"></i></div><div class="stat-value">' + (summary.pending_applications || 0) + '</div><div class="stat-label">Pending Apps</div></div>';
            }
        }
    } catch (error) {
        console.error('Load dashboard stats error:', error);
        showNotification('Failed to load dashboard statistics', 'error');
    }
}

async function loadRecentBookings() {
    try {
        const result = await API.adminStats.getRecentBookings(5);
        if (result.success && result.bookings) {
            var html = '';
            for (var i = 0; i < result.bookings.length; i++) {
                var b = result.bookings[i];
                var customerName = (b.first_name || '') + ' ' + (b.last_name || '');
                html += '<div class="recent-booking-item"><div class="rbi-dot"></div><div class="rbi-content"><strong>' + escapeHtml(b.service_name || 'Service') + '</strong><p>' + formatDate(b.service_date) + ' — ' + escapeHtml(customerName.trim() || 'Customer') + '</p></div></div>';
            }
            var recentList = document.getElementById('recentBookingsList');
            if (recentList) {
                recentList.innerHTML = html || '<p class="text-muted text-center py-3" style="font-size:13px;">No recent bookings</p>';
            }
        }
    } catch (error) {
        console.error('Load recent bookings error:', error);
    }
}

// ========== BOOKING FUNCTIONS ==========

function getBookingStatusConfig(status) {
    var configs = {
        pending: { class: 'status-pending-review', icon: '⏳', label: 'Pending' },
        confirmed: { class: 'status-confirmed', icon: '✅', label: 'Confirmed' },
        in_progress: { class: 'status-in-progress', icon: '🔄', label: 'In Progress' },
        completed: { class: 'status-completed', icon: '✔️', label: 'Completed' },
        cancelled: { class: 'status-cancelled', icon: '🚫', label: 'Cancelled' }
    };
    return configs[status] || configs.pending;
}

function getPaymentStatusConfig(status) {
    var configs = {
        paid: { class: 'payment-status-paid', icon: '✅', label: 'Paid' },
        unpaid: { class: 'payment-status-unpaid', icon: '❌', label: 'Unpaid' }
    };
    return configs[status] || configs.unpaid;
}

function updateBookingStats(bookings) {
    var statsGrid = document.getElementById('bookingStatsGrid');
    if (!statsGrid) return;
    
    var total = bookings.length;
    var pending = 0;
    var confirmed = 0;
    var inProgress = 0;
    var completed = 0;
    var cancelled = 0;
    var estimated = 0;
    var invoiced = 0;
    
    for (var i = 0; i < bookings.length; i++) {
        var b = bookings[i];
        if (b.status === 'pending') pending++;
        else if (b.status === 'confirmed') confirmed++;
        else if (b.status === 'in_progress') inProgress++;
        else if (b.status === 'completed') completed++;
        else if (b.status === 'cancelled') cancelled++;
        
        if (b.estimation && b.estimation.status === 'estimated') estimated++;
        if (b.estimation && b.estimation.status === 'invoiced') invoiced++;
    }
    
    statsGrid.innerHTML = 
        '<div class="stat-card" onclick="filterBookingsByStatus(\'all\')">' +
            '<div class="stat-icon"><i class="bi bi-calendar-check-fill"></i></div>' +
            '<div class="stat-value">' + total + '</div>' +
            '<div class="stat-label">Total Bookings</div>' +
        '</div>' +
        '<div class="stat-card" onclick="filterBookingsByStatus(\'pending\')">' +
            '<div class="stat-icon" style="background:rgba(245,158,11,0.1);"><i class="bi bi-clock-fill" style="color:#d97706;"></i></div>' +
            '<div class="stat-value">' + pending + '</div>' +
            '<div class="stat-label">Pending</div>' +
        '</div>' +
        '<div class="stat-card" onclick="filterBookingsByStatus(\'confirmed\')">' +
            '<div class="stat-icon" style="background:rgba(22,163,74,0.1);"><i class="bi bi-check-circle-fill" style="color:#16a34a;"></i></div>' +
            '<div class="stat-value">' + confirmed + '</div>' +
            '<div class="stat-label">Confirmed</div>' +
        '</div>' +
        '<div class="stat-card" onclick="filterBookingsByStatus(\'in_progress\')">' +
            '<div class="stat-icon" style="background:rgba(59,130,246,0.1);"><i class="bi bi-arrow-repeat" style="color:#3b82f6;"></i></div>' +
            '<div class="stat-value">' + inProgress + '</div>' +
            '<div class="stat-label">In Progress</div>' +
        '</div>' +
        '<div class="stat-card" onclick="filterBookingsByStatus(\'completed\')">' +
            '<div class="stat-icon" style="background:rgba(139,92,246,0.1);"><i class="bi bi-check2-all" style="color:#8b5cf6;"></i></div>' +
            '<div class="stat-value">' + completed + '</div>' +
            '<div class="stat-label">Completed</div>' +
        '</div>' +
        '<div class="stat-card" onclick="filterBookingsByStatus(\'cancelled\')">' +
            '<div class="stat-icon" style="background:rgba(220,38,38,0.1);"><i class="bi bi-x-circle-fill" style="color:#dc2626;"></i></div>' +
            '<div class="stat-value">' + cancelled + '</div>' +
            '<div class="stat-label">Cancelled</div>' +
        '</div>' +
        '<div class="stat-card">' +
            '<div class="stat-icon" style="background:rgba(22,163,74,0.1);"><i class="bi bi-calculator-fill" style="color:#16a34a;"></i></div>' +
            '<div class="stat-value">' + estimated + '</div>' +
            '<div class="stat-label">Estimated</div>' +
        '</div>' +
        '<div class="stat-card">' +
            '<div class="stat-icon" style="background:rgba(59,130,246,0.1);"><i class="bi bi-receipt" style="color:#3b82f6;"></i></div>' +
            '<div class="stat-value">' + invoiced + '</div>' +
            '<div class="stat-label">Invoiced</div>' +
        '</div>';
}

// ========== LOAD BOOKINGS - MAIN FUNCTION ==========
async function loadBookings() {
    if (isRefreshing) {
        console.log('⏳ Refresh already in progress, skipping...');
        return;
    }
    
    isRefreshing = true;
    
    try {
        var bookingListEl = document.getElementById('bookingList');
        if (!bookingListEl) {
            isRefreshing = false;
            return;
        }
        
        bookingListEl.innerHTML = '<tr><td colspan="10" class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div><p class="mt-2 text-muted">Loading bookings...</p></td></tr>';
        
        var filters = {};
        var searchTerm = document.getElementById('bookingSearch') ? document.getElementById('bookingSearch').value.trim() : '';
        var statusFilter = document.getElementById('bookingStatusFilter') ? document.getElementById('bookingStatusFilter').value : 'all';
        var paymentFilter = document.getElementById('paymentStatusFilter') ? document.getElementById('paymentStatusFilter').value : 'all';
        var dateFilter = document.getElementById('bookingDateFilter') ? document.getElementById('bookingDateFilter').value : '';
        
        if (statusFilter !== 'all') filters.status = statusFilter;
        if (paymentFilter !== 'all') filters.payment_status = paymentFilter;
        if (dateFilter) filters.date_from = dateFilter;
        
        const result = await API.bookings.getAll(filters);
        var bookings = result.bookings || [];
        
        if (searchTerm) {
            bookings = bookings.filter(function(b) {
                var customerName = (b.customer ? b.customer.name : '');
                return customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (b.service && b.service.name && b.service.name.toLowerCase().includes(searchTerm.toLowerCase()));
            });
        }
        
        updateBookingStats(bookings);
        
        var html = '';
        if (bookings.length === 0) {
            html = '<tr><td colspan="10" class="text-center text-muted py-4">No bookings found</td></tr>';
        } else {
            for (var i = 0; i < bookings.length; i++) {
                var b = bookings[i];
                var customerName = b.customer ? (b.customer.name || b.customer.first_name + ' ' + (b.customer.last_name || '')) : 'N/A';
                var serviceName = b.service ? b.service.name : 'N/A';
                
                var address = b.location ? (b.location.address || b.location.city || 'N/A') : 'N/A';
                if (address === 'N/A' && b.property) {
                    address = b.property.address || b.property.city || 'N/A';
                }
                
                var staffName = b.assigned_staff ? b.assigned_staff.name : '—';
                
                var statusConfig = getBookingStatusConfig(b.status);
                var paymentConfig = getPaymentStatusConfig(b.payment ? b.payment.payment_status : 'unpaid');
                
                var displayPrice = b.payment ? (b.payment.display_price || b.payment.total_price || 0) : 0;
                var estimationStatus = b.estimation ? b.estimation.status : 'pending';
                var estimationBadge = '';
                if (estimationStatus === 'estimated') {
                    estimationBadge = '<span class="badge bg-success" style="font-size:10px;">Estimated</span>';
                } else if (estimationStatus === 'invoiced') {
                    estimationBadge = '<span class="badge bg-primary" style="font-size:10px;">Invoiced</span>';
                } else {
                    estimationBadge = '<span class="badge bg-secondary" style="font-size:10px;">Pending</span>';
                }
                
                var hasInvoice = b.invoice && b.invoice.pdf_url;
                var invoiceBtn = hasInvoice ? 
                    '<button class="action-btn action-btn-download" onclick="downloadCustomerInvoice(' + b.invoice.id + ')" title="Download Invoice"><i class="bi bi-file-earmark-pdf"></i></button>' : 
                    '';
                
                // Check if staff has supervisor
                var supervisorInfo = b.assigned_staff && b.assigned_staff.supervisor_name ? 
                    '<br><small style="color:#7f8c8d;">Supervisor: ' + escapeHtml(b.assigned_staff.supervisor_name) + '</small>' : '';
                
                html += '<tr data-booking-id="' + b.id + '">' +
                    '<td class="align-middle"><strong>#' + escapeHtml(String(b.id)) + '</strong><br><small>' + estimationBadge + '</small></td>' +
                    '<td class="align-middle">' + escapeHtml(customerName) + '</td>' +
                    '<td class="align-middle">' + escapeHtml(serviceName) + '</td>' +
                    '<td class="align-middle">' + escapeHtml(address) + '</td>' +
                    '<td class="align-middle">' + formatDate(b.schedule ? b.schedule.date : null) + (b.schedule && b.schedule.time ? ' <small>' + escapeHtml(b.schedule.time) + '</small>' : '') + '</td>' +
                    '<td class="align-middle"><span class="booking-status-badge ' + statusConfig.class + '">' + statusConfig.icon + ' ' + statusConfig.label + '</span></td>' +
                    '<td class="align-middle"><span class="payment-status-badge ' + paymentConfig.class + '" data-payment-status="' + (b.payment ? b.payment.payment_status : 'unpaid') + '">' + paymentConfig.icon + ' ' + paymentConfig.label + '</span></td>' +
                    '<td class="align-middle"><strong style="color:var(--primary);font-size:14px;">' + formatTZS(displayPrice) + '</strong></td>' +
                    '<td class="align-middle">' + escapeHtml(staffName) + supervisorInfo + '</td>' +
                    '<td class="align-middle text-center">' +
                        '<button class="action-btn action-btn-view" onclick="viewFullBooking(' + b.id + ')" title="View Details"><i class="bi bi-eye-fill"></i></button>' +
                        '<button class="action-btn action-btn-edit" onclick="openPriceEstimation(' + b.id + ')" title="Price Estimation"><i class="bi bi-calculator-fill"></i></button>' +
                        '<button class="action-btn action-btn-reply" onclick="openBookingStatusUpdate(' + b.id + ')" title="Update Status"><i class="bi bi-pencil-fill"></i></button>' +
                        invoiceBtn +
                    '</td>' +
                '</tr>';
            }
        }
        bookingListEl.innerHTML = html;
        
    } catch (error) {
        console.error('Load bookings error:', error);
        var bookingListEl = document.getElementById('bookingList');
        if (bookingListEl) {
            bookingListEl.innerHTML = '<tr><td colspan="10" class="text-center text-danger py-4">Failed to load bookings: ' + escapeHtml(error.message) + '</td></tr>';
        }
        showNotification('Failed to load bookings: ' + error.message, 'error');
    } finally {
        isRefreshing = false;
    }
}

function filterBookings() {
    loadBookings();
}

function filterBookingsByStatus(status) {
    var statusSelect = document.getElementById('bookingStatusFilter');
    if (statusSelect) statusSelect.value = status;
    loadBookings();
}

async function viewFullBooking(bookingId) {
    try {
        const result = await API.bookings.getById(bookingId);
        var booking = result.booking;
        if (!booking) return;
        
        currentBookingId = bookingId;
        var paymentStatus = booking.payment ? booking.payment.payment_status : 'unpaid';
        var paymentConfig = getPaymentStatusConfig(paymentStatus);
        var customerName = booking.customer ? (booking.customer.name || (booking.customer.first_name + ' ' + (booking.customer.last_name || ''))) : 'N/A';
        
        var displayPrice = booking.payment ? (booking.payment.display_price || booking.payment.total_price || 0) : 0;
        var estimation = booking.estimation || {};
        var invoice = booking.invoice || null;
        
        var estimationHtml = '';
        if (estimation.status && estimation.status !== 'pending') {
            estimationHtml = `
                <div class="col-md-6">
                    <div class="info-card">
                        <h6><i class="bi bi-calculator-fill"></i> Estimation Details</h6>
                        <p><strong>Service Cost:</strong> ${formatTZS(estimation.estimated_service_cost || 0)}</p>
                        <p><strong>Labor Cost:</strong> ${formatTZS(estimation.labor_cost || 0)}</p>
                        <p><strong>Transport Cost:</strong> ${formatTZS(estimation.transport_cost || 0)}</p>
                        <p><strong>Equipment Cost:</strong> ${formatTZS(estimation.equipment_cost || 0)}</p>
                        <p><strong>Tax Rate:</strong> ${(estimation.tax_rate || 0)}%</p>
                        <p><strong>Tax Amount:</strong> ${formatTZS(estimation.tax_amount || 0)}</p>
                        <p><strong>Discount:</strong> ${formatTZS(estimation.discount || 0)}</p>
                        <p><strong>Final Total:</strong> <strong style="color:var(--primary);font-size:18px;">${formatTZS(estimation.final_total || 0)}</strong></p>
                        <p><strong>Status:</strong> <span class="badge bg-success">${estimation.status || 'Pending'}</span></p>
                    </div>
                </div>
            `;
        } else {
            estimationHtml = `
                <div class="col-md-6">
                    <div class="info-card">
                        <h6><i class="bi bi-calculator-fill"></i> Estimation Details</h6>
                        <p class="text-muted">No estimation yet. Click "Price Estimation" to add one.</p>
                    </div>
                </div>
            `;
        }
        
        var invoiceHtml = '';
        if (invoice) {
            invoiceHtml = `
                <div class="row mt-3">
                    <div class="col-12">
                        <div class="info-card">
                            <h6><i class="bi bi-receipt"></i> Invoice</h6>
                            <p><strong>Invoice #:</strong> ${escapeHtml(invoice.invoice_number || 'N/A')}</p>
                            <p><strong>Total:</strong> ${formatTZS(invoice.total_amount || 0)}</p>
                            <p><strong>Status:</strong> <span class="badge bg-info">${(invoice.status || 'N/A')}</span></p>
                            <button class="btn btn-sm btn-primary" onclick="downloadCustomerInvoice(${invoice.id})"><i class="bi bi-file-earmark-pdf me-1"></i>Download Invoice</button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        var bodyEl = document.getElementById('viewBookingBody');
        if (bodyEl) {
            bodyEl.innerHTML = `
                <div class="booking-detail">
                    <h4>Booking #${escapeHtml(String(booking.id))}</h4>
                    <div class="row mt-3">
                        <div class="col-md-6">
                            <div class="info-card">
                                <h6><i class="bi bi-person-fill"></i> Customer Information</h6>
                                <p><strong>Name:</strong> ${escapeHtml(customerName)}</p>
                                <p><strong>Email:</strong> ${escapeHtml(booking.customer ? booking.customer.email : 'N/A')}</p>
                                <p><strong>Phone:</strong> ${escapeHtml(booking.customer ? booking.customer.phone : 'N/A')}</p>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="info-card">
                                <h6><i class="bi bi-briefcase-fill"></i> Service Details</h6>
                                <p><strong>Service:</strong> ${escapeHtml(booking.service ? booking.service.name : 'N/A')}</p>
                                <p><strong>Location:</strong> ${escapeHtml(booking.location ? (booking.location.address || booking.location.city || 'N/A') : 'N/A')}</p>
                                <p><strong>Date:</strong> ${formatDate(booking.schedule ? booking.schedule.date : null)}</p>
                                <p><strong>Time:</strong> ${escapeHtml(booking.schedule ? booking.schedule.time : 'N/A')}</p>
                            </div>
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-md-6">
                            <div class="info-card">
                                <h6><i class="bi bi-cash-stack"></i> Payment Information</h6>
                                <p><strong>Base Price:</strong> ${formatTZS(booking.payment ? booking.payment.base_price : 0)}</p>
                                <p><strong>Extras:</strong> ${formatTZS(booking.payment ? booking.payment.extras : 0)}</p>
                                <p><strong>Discount:</strong> ${formatTZS(booking.payment ? booking.payment.discount : 0)}</p>
                                <p><strong>Total Price:</strong> ${formatTZS(displayPrice)}</p>
                                <p><strong>Payment Status:</strong> <span class="payment-status-badge ${paymentConfig.class}">${paymentConfig.icon} ${paymentConfig.label}</span></p>
                            </div>
                        </div>
                        ${estimationHtml}
                    </div>
                    ${invoiceHtml}
                </div>
            `;
        }
        
        var modal = document.getElementById('viewBookingModal');
        if (modal) new bootstrap.Modal(modal).show();
    } catch (error) {
        showNotification(error.message || 'Failed to load booking', 'error');
    }
}

function openPriceEstimation(bookingId) {
    currentBookingId = bookingId;
    document.getElementById('estimationBookingId').value = bookingId;
    document.getElementById('estServiceCost').value = '';
    document.getElementById('estLaborCost').value = '';
    document.getElementById('estTransportCost').value = '';
    document.getElementById('estEquipmentCost').value = '';
    document.getElementById('estTax').value = '';
    document.getElementById('estDiscount').value = '';
    
    API.bookings.getById(bookingId).then(function(result) {
        var booking = result.booking;
        if (booking && booking.estimation && booking.estimation.status !== 'pending') {
            var est = booking.estimation;
            document.getElementById('estServiceCost').value = est.estimated_service_cost || 0;
            document.getElementById('estLaborCost').value = est.labor_cost || 0;
            document.getElementById('estTransportCost').value = est.transport_cost || 0;
            document.getElementById('estEquipmentCost').value = est.equipment_cost || 0;
            document.getElementById('estTax').value = est.tax_rate || 0;
            document.getElementById('estDiscount').value = est.discount || 0;
        }
        calculateEstimationTotal();
    }).catch(console.error);
    
    var modal = document.getElementById('priceEstimationModal');
    if (modal) new bootstrap.Modal(modal).show();
}

function calculateEstimationTotal() {
    var serviceCost = Number(document.getElementById('estServiceCost').value) || 0;
    var laborCost = Number(document.getElementById('estLaborCost').value) || 0;
    var transportCost = Number(document.getElementById('estTransportCost').value) || 0;
    var equipmentCost = Number(document.getElementById('estEquipmentCost').value) || 0;
    var taxPercent = Number(document.getElementById('estTax').value) || 0;
    var discount = Number(document.getElementById('estDiscount').value) || 0;
    
    var subtotal = serviceCost + laborCost + transportCost + equipmentCost;
    var taxAmount = subtotal * (taxPercent / 100);
    var total = subtotal + taxAmount - discount;
    
    var totalDisplay = document.getElementById('estimationTotalDisplay');
    if (totalDisplay) {
        totalDisplay.innerHTML = '<strong>Total: ' + formatTZS(total) + '</strong>' +
            '<br><small style="color:var(--text-muted);font-size:11px;">Subtotal: ' + formatTZS(subtotal) + 
            ' | Tax: ' + formatTZS(taxAmount) + 
            ' | Discount: ' + formatTZS(discount) + '</small>';
    }
    return { subtotal: subtotal, taxAmount: taxAmount, total: total };
}

async function saveEstimationAndGenerateInvoice() {
    var bookingId = document.getElementById('estimationBookingId').value;
    var serviceCost = Number(document.getElementById('estServiceCost').value) || 0;
    var laborCost = Number(document.getElementById('estLaborCost').value) || 0;
    var transportCost = Number(document.getElementById('estTransportCost').value) || 0;
    var equipmentCost = Number(document.getElementById('estEquipmentCost').value) || 0;
    var taxPercent = Number(document.getElementById('estTax').value) || 0;
    var discount = Number(document.getElementById('estDiscount').value) || 0;
    
    if (serviceCost <= 0 && laborCost <= 0 && transportCost <= 0 && equipmentCost <= 0) {
        showNotification('Please enter at least one cost value', 'error');
        return;
    }
    
    try {
        showNotification('Saving estimation...', 'info');
        const result = await API.bookings.updateEstimation(bookingId, {
            service_cost: serviceCost,
            labor_cost: laborCost,
            transport_cost: transportCost,
            equipment_cost: equipmentCost,
            tax_rate: taxPercent,
            discount: discount
        });
        
        var modalEl = document.getElementById('priceEstimationModal');
        var bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
        
        if (result.invoice && result.invoice.email_sent) {
            showNotification('✅ Estimation saved! Invoice has been generated and sent to customer.', 'success');
        } else if (result.invoice) {
            showNotification('✅ Estimation saved! Invoice generated but email could not be sent.', 'warning');
        } else {
            showNotification('✅ Estimation saved successfully!', 'success');
        }
        
        loadBookings();
        loadDashboardStats();
    } catch (error) {
        showNotification(error.message || 'Failed to save estimation', 'error');
    }
}

function downloadCustomerInvoice(invoiceId) {
    const token = API.getAuthToken();
    if (!token) {
        showNotification('Please login again', 'error');
        window.location.href = '/login.html';
        return;
    }
    
    showNotification('Preparing download...', 'info');
    
    const url = API.bookings.downloadInvoice(invoiceId);
    
    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                showNotification('Session expired. Please login again.', 'error');
                window.location.href = '/login.html';
                return Promise.reject(new Error('Authentication failed'));
            }
            return response.json().then(err => {
                throw new Error(err.message || 'Download failed');
            });
        }
        return response.blob();
    })
    .then(blob => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `invoice_${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        showNotification('Invoice downloaded successfully!', 'success');
    })
    .catch(error => {
        console.error('Download error:', error);
        showNotification(error.message || 'Failed to download invoice', 'error');
    });
}

function openBookingStatusUpdate(bookingId) {
    var statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    var statusLabels = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        in_progress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled'
    };
    
    var selectHtml = '<select id="statusSelect" class="form-select mb-3">';
    for (var i = 0; i < statuses.length; i++) {
        selectHtml += '<option value="' + statuses[i] + '">' + statusLabels[statuses[i]] + '</option>';
    }
    selectHtml += '</select>';
    
    showNotificationWithCallback('Update Booking Status', selectHtml, async function(confirmed) {
        if (confirmed) {
            var newStatus = document.getElementById('statusSelect').value;
            try {
                await API.bookings.updateStatus(bookingId, newStatus);
                showNotification('Booking status updated to ' + statusLabels[newStatus], 'success');
                loadBookings();
                loadDashboardStats();
            } catch (error) {
                showNotification(error.message || 'Failed to update status', 'error');
            }
        }
    });
}

function showNotificationWithCallback(title, contentHtml, callback) {
    var modalId = 'dynamicConfirmModal';
    var modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = '<div class="modal-dialog modal-dialog-centered"><div class="modal-content modal-styled"><div class="modal-header"><h5 class="modal-title"></h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button></div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-ghost" data-bs-dismiss="modal">Cancel</button><button type="button" class="btn btn-primary" id="confirmActionBtn">Confirm</button></div></div></div>';
        document.body.appendChild(modal);
    }
    
    modal.querySelector('.modal-title').innerHTML = title;
    modal.querySelector('.modal-body').innerHTML = contentHtml;
    
    var confirmBtn = modal.querySelector('#confirmActionBtn');
    var newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    var bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    newConfirmBtn.addEventListener('click', function() {
        bsModal.hide();
        if (callback) callback(true);
    });
    
    modal.addEventListener('hidden.bs.modal', function() { if (callback) callback(false); });
}

// ================================================================
// PAYMENT STATUS AUTO-REFRESH - REAL-TIME UPDATES
// ================================================================

function startPaymentStatusPolling() {
    if (paymentPollingInterval) {
        clearInterval(paymentPollingInterval);
        paymentPollingInterval = null;
    }
    
    // Check every 5 seconds
    paymentPollingInterval = setInterval(function() {
        var bookingsSection = document.getElementById('bookingsSection');
        if (bookingsSection && bookingsSection.classList.contains('active')) {
            var unpaidBadges = document.querySelectorAll('.payment-status-unpaid');
            if (unpaidBadges.length > 0) {
                console.log('🔄 Checking for payment updates...');
                loadBookings();
            }
        }
    }, 5000);
    
    console.log('✅ Real-time payment monitoring started (every 5 seconds)');
}

// ========== FORCE REFRESH BOOKINGS ==========
function forceRefreshBookings() {
    var btn = document.querySelector('.refresh-bookings-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Refreshing...';
    }
    
    loadBookings();
    
    setTimeout(function() {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i> Refresh';
            showNotification('Bookings refreshed!', 'success');
        }
    }, 1500);
}

// ================================================================
// ULTIMATE PAYMENT STATUS FIX - FORCE REFRESH EVERY 3 SECONDS
// ================================================================

async function checkPaymentStatus() {
    try {
        const bookingsSection = document.getElementById('bookingsSection');
        if (!bookingsSection || !bookingsSection.classList.contains('active')) {
            return;
        }
        
        const rows = document.querySelectorAll('#bookingList tr');
        let hasUnpaid = false;
        const unpaidIds = [];
        
        for (const row of rows) {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 7) {
                const paymentCell = cells[6];
                if (paymentCell && paymentCell.textContent.includes('Unpaid')) {
                    const idCell = cells[0];
                    const match = idCell ? idCell.textContent.match(/#(\d+)/) : null;
                    if (match) {
                        unpaidIds.push(parseInt(match[1]));
                        hasUnpaid = true;
                    }
                }
            }
        }
        
        if (!hasUnpaid || unpaidIds.length === 0) {
            return;
        }
        
        let updated = false;
        for (const id of unpaidIds) {
            try {
                const result = await API.bookings.getById(id);
                if (result && result.booking) {
                    const booking = result.booking;
                    const paymentStatus = booking.payment ? booking.payment.payment_status : 'unpaid';
                    
                    if (paymentStatus === 'paid') {
                        for (const row of rows) {
                            const idCell = row.querySelector('td:first-child');
                            if (idCell && idCell.textContent.includes(`#${id}`)) {
                                const cells = row.querySelectorAll('td');
                                if (cells.length >= 7) {
                                    const paymentConfig = getPaymentStatusConfig('paid');
                                    cells[6].innerHTML = `<span class="payment-status-badge ${paymentConfig.class}">${paymentConfig.icon} ${paymentConfig.label}</span>`;
                                    
                                    if (booking.status === 'completed') {
                                        const statusConfig = getBookingStatusConfig('completed');
                                        cells[5].innerHTML = `<span class="booking-status-badge ${statusConfig.class}">${statusConfig.icon} ${statusConfig.label}</span>`;
                                    }
                                    
                                    updated = true;
                                    showNotification(`💳 Booking #${id} has been paid!`, 'success');
                                    console.log(`✅ Booking #${id} payment status updated to PAID`);
                                }
                                break;
                            }
                        }
                    }
                }
            } catch (err) {
                // Silent fail
            }
        }
        
        if (updated) {
            const result = await API.bookings.getAll();
            if (result && result.bookings) {
                updateBookingStats(result.bookings);
            }
        }
        
    } catch (error) {
        console.error('Payment check error:', error);
    }
}

function startAggressivePolling() {
    if (window._paymentPollInterval) {
        clearInterval(window._paymentPollInterval);
    }
    
    window._paymentPollInterval = setInterval(() => {
        checkPaymentStatus();
    }, 3000);
    
    console.log('✅ Aggressive payment polling started (every 3 seconds)');
}

// ========== SERVICE FUNCTIONS ==========

function mapLocationToEnum(location) {
    const locationMap = {
        'Unguja': 'Unguja Island',
        'Unguja Island': 'Unguja Island',
        'Pemba': 'Pemba Island',
        'Pemba Island': 'Pemba Island',
        'Both': 'Both Islands',
        'Both Islands': 'Both Islands'
    };
    return locationMap[location] || location;
}

async function loadServices() {
    try {
        const result = await API.services.getAll();
        var services = result.services || [];
        var html = '';
        if (services.length === 0) {
            html = '<tr><td colspan="6" class="text-center text-muted py-4">No services added yet</td></tr>';
        } else {
            for (var i = 0; i < services.length; i++) {
                var service = services[i];
                var imgHtml = service.image ? '<img src="' + escapeHtml(service.image) + '" alt="' + escapeHtml(service.name) + '" class="service-thumb">' : '<div class="no-image-thumb"><i class="bi bi-image"></i></div>';
                var displayLocation = service.location || 'Unknown';
                var locIcon = displayLocation === 'Unguja Island' ? '🏝' : (displayLocation === 'Pemba Island' ? '🌿' : '🗺');
                var locClass = displayLocation === 'Unguja Island' ? 'location-unguja' : (displayLocation === 'Pemba Island' ? 'location-pemba' : 'location-both');
                
                html += '<tr><td class="align-middle">' + imgHtml + '</td><td class="align-middle"><strong>' + escapeHtml(service.name) + '</strong>' + (service.description ? '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + escapeHtml(service.description.substring(0, 60)) + (service.description.length > 60 ? '…' : '') + '</div>' : '') + '</td><td class="align-middle"><strong style="color:var(--primary)">' + formatTZS(service.price) + '</strong></td><td class="align-middle">' + escapeHtml(service.duration || '—') + '</td><td class="align-middle"><span class="location-badge ' + locClass + '">' + locIcon + ' ' + escapeHtml(displayLocation) + '</span></td><td class="align-middle text-center"><button class="action-btn action-btn-edit" onclick="openEditServiceModal(' + service.id + ')" title="Edit"><i class="bi bi-pencil-fill"></i></button><button class="action-btn action-btn-delete" onclick="deleteService(' + service.id + ')" title="Delete"><i class="bi bi-trash3-fill"></i></button></td></tr>';
            }
        }
        var serviceList = document.getElementById('serviceList');
        if (serviceList) serviceList.innerHTML = html;
    } catch (error) {
        console.error('Load services error:', error);
        showNotification('Failed to load services', 'error');
    }
}

async function addService() {
    var nameInput = document.getElementById('serviceName');
    var priceInput = document.getElementById('servicePrice');
    
    if (!nameInput || !priceInput) return;
    
    var name = nameInput.value.trim();
    var price = priceInput.value.trim();
    var duration = document.getElementById('serviceDuration') ? document.getElementById('serviceDuration').value.trim() : '';
    var location = document.getElementById('serviceLocation') ? document.getElementById('serviceLocation').value : 'Unguja Island';
    var description = document.getElementById('serviceDescription') ? document.getElementById('serviceDescription').value.trim() : '';
    var included = getIncludedItems('includedManualEntry');

    if (!name || !price) {
        showNotification('Service name and price are required', 'error');
        return;
    }
    if (isNaN(price) || Number(price) < 0) {
        showNotification('Please enter a valid price in TZS', 'error');
        return;
    }

    var mappedLocation = mapLocationToEnum(location);

    var formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('duration', duration || '2 hours');
    formData.append('location', mappedLocation);
    formData.append('description', description);
    formData.append('includes', JSON.stringify(included));
    if (pendingServiceImage) {
        var blob = dataURLtoBlob(pendingServiceImage);
        formData.append('image', blob, 'service_image.jpg');
    }

    try {
        showNotification('Adding service...', 'info');
        await API.services.add(formData);
        showNotification('Service added successfully!', 'success');
        
        if (nameInput) nameInput.value = '';
        if (priceInput) priceInput.value = '';
        if (document.getElementById('serviceDuration')) document.getElementById('serviceDuration').value = '';
        if (document.getElementById('serviceDescription')) document.getElementById('serviceDescription').value = '';
        clearServiceImage();
        if (document.getElementById('includedManualEntry')) {
            initIncludedManualEntry('includedManualEntry', 'addIncludedItemBtn', []);
        }
        
        loadServices();
        loadDashboardStats();
    } catch (error) {
        console.error('Add service error:', error);
        showNotification(error.message || 'Failed to add service', 'error');
    }
}

async function deleteService(serviceId) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
        await API.services.delete(serviceId);
        loadServices();
        loadDashboardStats();
        showNotification('Service deleted.', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to delete service', 'error');
    }
}

async function openEditServiceModal(serviceId) {
    try {
        const result = await API.services.getById(serviceId);
        var service = result.service;
        if (!service) return;
        
        pendingEditServiceImage = null;
        document.getElementById('editServiceId').value = serviceId;
        document.getElementById('editServiceName').value = service.name || '';
        document.getElementById('editServicePrice').value = service.price || '';
        document.getElementById('editServiceDuration').value = service.duration || '';
        var displayLocation = service.location || 'Unguja Island';
        if (displayLocation === 'Unguja Island') displayLocation = 'Unguja';
        else if (displayLocation === 'Pemba Island') displayLocation = 'Pemba';
        else if (displayLocation === 'Both Islands') displayLocation = 'Both';
        document.getElementById('editServiceLocation').value = displayLocation;
        document.getElementById('editServiceDescription').value = service.description || '';
        
        var editBtn = document.getElementById('editServiceImageTrigger');
        if (editBtn) editBtn.classList.remove('has-image');
        var editLabel = document.getElementById('editImageUploadLabel');
        if (editLabel) editLabel.textContent = 'Change Image';
        var previewContainer = document.getElementById('editImagePreviewContainer');
        if (previewContainer) previewContainer.style.display = 'none';
        var previewImg = document.getElementById('editImagePreview');
        if (previewImg) previewImg.src = '';
        
        if (service.image) {
            if (previewImg) previewImg.src = service.image;
            if (previewContainer) previewContainer.style.display = 'flex';
            if (editBtn) editBtn.classList.add('has-image');
            if (editLabel) editLabel.textContent = '✓ Image Set';
            pendingEditServiceImage = service.image;
        }
        initIncludedManualEntry('editIncludedManualEntry', 'editAddIncludedItemBtn', service.includes || []);
        var modal = document.getElementById('editServiceModal');
        if (modal) new bootstrap.Modal(modal).show();
    } catch (error) {
        showNotification(error.message || 'Failed to load service', 'error');
    }
}

async function saveEditedService() {
    var serviceId = parseInt(document.getElementById('editServiceId').value);
    var name = document.getElementById('editServiceName').value.trim();
    var price = document.getElementById('editServicePrice').value.trim();
    var duration = document.getElementById('editServiceDuration').value.trim();
    var location = document.getElementById('editServiceLocation').value;
    var description = document.getElementById('editServiceDescription').value.trim();
    var included = getIncludedItems('editIncludedManualEntry');
    
    if (!name || !price) {
        showNotification('Service name and price are required', 'error');
        return;
    }

    var mappedLocation = mapLocationToEnum(location);

    var formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('duration', duration);
    formData.append('location', mappedLocation);
    formData.append('description', description);
    formData.append('includes', JSON.stringify(included));
    if (pendingEditServiceImage && pendingEditServiceImage.startsWith('data:image')) {
        var blob = dataURLtoBlob(pendingEditServiceImage);
        formData.append('image', blob, 'service_image.jpg');
    }

    try {
        await API.services.update(serviceId, formData);
        var modalEl = document.getElementById('editServiceModal');
        var bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
        loadServices();
        loadDashboardStats();
        showNotification('Service updated successfully!', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to update service', 'error');
    }
}

function clearServiceImage() {
    pendingServiceImage = null;
    var trigger = document.getElementById('serviceImageTrigger');
    if (trigger) trigger.classList.remove('has-image');
    var label = document.getElementById('imageUploadLabel');
    if (label) label.textContent = 'Upload Image';
    var container = document.getElementById('imagePreviewContainer');
    if (container) container.style.display = 'none';
    var preview = document.getElementById('imagePreview');
    if (preview) preview.src = '';
}

function clearStaffImage() {
    pendingStaffImage = null;
    var trigger = document.getElementById('staffImageTrigger');
    if (trigger) trigger.classList.remove('has-image');
    var label = document.getElementById('staffImageLabel');
    if (label) label.textContent = 'Upload Photo';
    var container = document.getElementById('staffImagePreviewContainer');
    if (container) container.style.display = 'none';
    var preview = document.getElementById('staffImagePreview');
    if (preview) preview.src = '';
}

function clearEditServiceImage() {
    pendingEditServiceImage = null;
    var trigger = document.getElementById('editServiceImageTrigger');
    if (trigger) trigger.classList.remove('has-image');
    var label = document.getElementById('editImageUploadLabel');
    if (label) label.textContent = 'Change Image';
    var container = document.getElementById('editImagePreviewContainer');
    if (container) container.style.display = 'none';
    var preview = document.getElementById('editImagePreview');
    if (preview) preview.src = '';
}

function dataURLtoBlob(dataURL) {
    var arr = dataURL.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

// ========== WHAT'S INCLUDED FUNCTIONS ==========
function initIncludedManualEntry(containerId, btnId, existingItems) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (existingItems && existingItems.length > 0) {
        for (var i = 0; i < existingItems.length; i++) {
            _appendIncludedField(containerId, btnId, existingItems[i]);
        }
    }
    updateAddIncludedBtnVisibility(containerId, btnId);
}

function addIncludedField(containerId, btnId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var count = container.querySelectorAll('.included-manual-row').length;
    if (count >= MAX_INCLUDED) {
        showNotification('Maximum of ' + MAX_INCLUDED + ' items allowed.', 'warning');
        return;
    }
    _appendIncludedField(containerId, btnId, '');
    updateAddIncludedBtnVisibility(containerId, btnId);
}

function _appendIncludedField(containerId, btnId, value) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var row = document.createElement('div');
    row.className = 'included-manual-row';
    row.innerHTML = '<i class="bi bi-check2-circle item-num-icon"></i><input type="text" class="form-control included-text-input" placeholder="e.g. Window Cleaning" maxlength="60" value="' + escapeHtml(value) + '"><button type="button" class="included-remove-btn" onclick="removeIncludedField(this, \'' + containerId + '\', \'' + btnId + '\')" title="Remove"><i class="bi bi-x-lg"></i></button>';
    container.appendChild(row);
}

function removeIncludedField(btn, containerId, btnId) {
    var row = btn.closest('.included-manual-row');
    if (row) row.remove();
    updateAddIncludedBtnVisibility(containerId, btnId);
}

function updateAddIncludedBtnVisibility(containerId, btnId) {
    var container = document.getElementById(containerId);
    var btn = document.getElementById(btnId);
    if (!container || !btn) return;
    var count = container.querySelectorAll('.included-manual-row').length;
    btn.style.display = count >= MAX_INCLUDED ? 'none' : 'inline-flex';
}

function getIncludedItems(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return [];
    var inputs = container.querySelectorAll('.included-text-input');
    var items = [];
    for (var i = 0; i < inputs.length; i++) {
        var val = inputs[i].value.trim();
        if (val) items.push(val);
    }
    return items;
}

// ========== IMAGE UPLOAD FUNCTIONS ==========
function openImageUploadModal(target) {
    currentImageTarget = target;
    modalImageBase64 = null;
    var confirmBtn = document.getElementById('confirmUploadBtn');
    var modalPreview = document.getElementById('modalImagePreview');
    var zoneContent = document.getElementById('uploadZoneContent');
    var errorDiv = document.getElementById('uploadError');
    var fileInput = document.getElementById('modalImageInput');
    if (confirmBtn) confirmBtn.disabled = true;
    if (modalPreview) modalPreview.style.display = 'none';
    if (zoneContent) zoneContent.style.display = 'block';
    if (errorDiv) errorDiv.style.display = 'none';
    if (fileInput) fileInput.value = '';
    
    var titles = {
        service: 'Upload Service Image',
        staff: 'Upload Staff Photo',
        editService: 'Change Service Image',
        editStaff: 'Change Staff Photo'
    };
    var titleEl = document.getElementById('imageModalTitle');
    if (titleEl) titleEl.textContent = titles[target] || 'Upload Image';
    
    var modal = document.getElementById('imageUploadModal');
    if (modal) new bootstrap.Modal(modal).show();
}

function handleModalImageSelect(event) {
    var file = event.target.files[0];
    if (!file) return;
    processImageFile(file);
}

function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    var file = event.dataTransfer.files[0];
    if (file) processImageFile(file);
}

function processImageFile(file) {
    var errorDiv = document.getElementById('uploadError');
    if (errorDiv) errorDiv.style.display = 'none';
    if (!file.type.startsWith('image/')) {
        if (errorDiv) {
            errorDiv.textContent = 'Please select a valid image file (PNG, JPG, WEBP).';
            errorDiv.style.display = 'block';
        }
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        if (errorDiv) {
            errorDiv.textContent = 'Image size must be less than 2MB.';
            errorDiv.style.display = 'block';
        }
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        modalImageBase64 = e.target.result;
        var preview = document.getElementById('modalImagePreview');
        var zoneContent = document.getElementById('uploadZoneContent');
        if (preview) {
            preview.src = modalImageBase64;
            preview.style.display = 'block';
        }
        if (zoneContent) zoneContent.style.display = 'none';
        var confirmBtn = document.getElementById('confirmUploadBtn');
        if (confirmBtn) confirmBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

function confirmImageUpload() {
    if (!modalImageBase64) return;
    if (currentImageTarget === 'service') {
        pendingServiceImage = modalImageBase64;
        var trigger = document.getElementById('serviceImageTrigger');
        if (trigger) trigger.classList.add('has-image');
        var label = document.getElementById('imageUploadLabel');
        if (label) label.textContent = '✓ Image Selected';
        var preview = document.getElementById('imagePreview');
        if (preview) preview.src = pendingServiceImage;
        var container = document.getElementById('imagePreviewContainer');
        if (container) container.style.display = 'flex';
    } else if (currentImageTarget === 'staff') {
        pendingStaffImage = modalImageBase64;
        var staffTrigger = document.getElementById('staffImageTrigger');
        if (staffTrigger) staffTrigger.classList.add('has-image');
        var staffLabel = document.getElementById('staffImageLabel');
        if (staffLabel) staffLabel.textContent = '✓ Photo Selected';
        var staffPreview = document.getElementById('staffImagePreview');
        if (staffPreview) staffPreview.src = pendingStaffImage;
        var staffContainer = document.getElementById('staffImagePreviewContainer');
        if (staffContainer) staffContainer.style.display = 'flex';
    } else if (currentImageTarget === 'editService') {
        pendingEditServiceImage = modalImageBase64;
        var editTrigger = document.getElementById('editServiceImageTrigger');
        if (editTrigger) editTrigger.classList.add('has-image');
        var editLabel = document.getElementById('editImageUploadLabel');
        if (editLabel) editLabel.textContent = '✓ Image Changed';
        var editPreview = document.getElementById('editImagePreview');
        if (editPreview) editPreview.src = pendingEditServiceImage;
        var editContainer = document.getElementById('editImagePreviewContainer');
        if (editContainer) editContainer.style.display = 'flex';
    } else if (currentImageTarget === 'editStaff') {
        pendingEditStaffImage = modalImageBase64;
        var photoEl = document.getElementById('editStaffPhotoPreview');
        var initialsEl = document.getElementById('editStaffInitials');
        if (photoEl && initialsEl) {
            photoEl.src = modalImageBase64;
            photoEl.style.display = 'block';
            initialsEl.style.display = 'none';
        }
    }
    var modalEl = document.getElementById('imageUploadModal');
    var bsModal = bootstrap.Modal.getInstance(modalEl);
    if (bsModal) bsModal.hide();
    showNotification('Image selected successfully!', 'success');
}

// ========== CONTRACTOR FUNCTIONS ==========
async function loadContractors() {
    try {
        var filters = {};
        if (currentContractorFilter !== 'all') filters.contractor_type = currentContractorFilter;
        const result = await API.contractors.getAll(filters);
        var contractors = result.contractors || [];
        var html = '';
        if (contractors.length === 0) {
            html = '<tr><td colspan="7" class="text-center text-muted py-4">No contractors found</td></tr>';
        } else {
            for (var i = 0; i < contractors.length; i++) {
                var contractor = contractors[i];
                var typeBadge = contractor.contractor_type === 'private' ? 
                    '<span class="contractor-type-badge contractor-private"><i class="bi bi-briefcase me-1"></i>Private</span>' : 
                    '<span class="contractor-type-badge contractor-government"><i class="bi bi-building-fill me-1"></i>Government</span>';
                
                var statusClass = contractor.status === 'active' ? 'bg-success' : 
                                 (contractor.status === 'expired' ? 'bg-danger' : 
                                 (contractor.status === 'terminated' ? 'bg-dark' : 'bg-secondary'));
                
                var workerNamesDisplay = '';
                if (contractor.workers && contractor.workers.names && contractor.workers.names.length > 0) {
                    workerNamesDisplay = '<div class="worker-names-list">';
                    for (var w = 0; w < Math.min(contractor.workers.names.length, 3); w++) {
                        workerNamesDisplay += '<span class="worker-name-tag"><i class="bi bi-person"></i> ' + escapeHtml(contractor.workers.names[w]) + '</span>';
                    }
                    if (contractor.workers.names.length > 3) {
                        workerNamesDisplay += '<span class="worker-name-tag">+' + (contractor.workers.names.length - 3) + ' more</span>';
                    }
                    workerNamesDisplay += '</div>';
                } else {
                    workerNamesDisplay = '<span class="text-muted" style="font-size:11px;">No workers listed</span>';
                }
                
                html += '<tr>' +
                    '<td class="align-middle"><strong>' + escapeHtml(contractor.company_name) + '</strong><div style="font-size:11px;color:var(--text-muted);">' + escapeHtml(contractor.contact.person || '') + '</div></td>' +
                    '<td class="align-middle">' + typeBadge + '</td>' +
                    '<td class="align-middle">' + escapeHtml(contractor.location || '—') + '</td>' +
                    '<td class="align-middle"><span class="badge bg-primary" style="font-size:12px;">' + (contractor.workers.count || 0) + ' workers</span><div style="margin-top:4px;">' + workerNamesDisplay + '</div></td>' +
                    '<td class="align-middle" style="font-size:12px;"><i class="bi bi-calendar3 me-1"></i>' + formatDate(contractor.contract_period.start) + ' — ' + formatDate(contractor.contract_period.end) + '</td>' +
                    '<td class="align-middle"><span class="badge ' + statusClass + '">' + (contractor.status || 'active') + '</span></td>' +
                    '<td class="align-middle text-center">' +
                        '<button class="action-btn action-btn-view" onclick="viewContractorDetails(' + contractor.id + ')" title="View Details"><i class="bi bi-eye-fill"></i></button>' +
                        '<button class="action-btn action-btn-edit" onclick="openEditContractorModal(' + contractor.id + ')" title="Edit Contractor"><i class="bi bi-pencil-fill"></i></button>' +
                        '<button class="action-btn action-btn-reply" onclick="generateInvoiceForContractorById(' + contractor.id + ')" title="Generate Invoice"><i class="bi bi-receipt"></i></button>' +
                    '</td>' +
                '</tr>';
            }
        }
        var contractorsList = document.getElementById('contractorsList');
        if (contractorsList) contractorsList.innerHTML = html;
    } catch (error) {
        console.error('Load contractors error:', error);
        showNotification('Failed to load contractors', 'error');
    }
}

async function viewContractorDetails(contractorId) {
    currentContractorId = contractorId;
    try {
        const result = await API.contractors.getById(contractorId);
        var contractor = result.contractor;
        if (!contractor) return;

        var bodyEl = document.getElementById('contractorDetailsBody');
        if (bodyEl) {
            bodyEl.innerHTML = '<div class="contractor-detail-section"><h6><i class="bi bi-info-circle me-1"></i>Company Information</h6><div class="contractor-info-grid"><div class="contractor-info-item"><div class="label">Company Name</div><div class="value">' + escapeHtml(contractor.company_name) + '</div></div><div class="contractor-info-item"><div class="label">Type</div><div class="value">' + (contractor.contractor_type === 'private' ? 'Private Company' : 'Government Organization') + '</div></div><div class="contractor-info-item"><div class="label">Location</div><div class="value">' + escapeHtml(contractor.location || 'N/A') + '</div></div><div class="contractor-info-item"><div class="label">Contact Person</div><div class="value">' + escapeHtml(contractor.contact_person || 'N/A') + '</div></div><div class="contractor-info-item"><div class="label">Email</div><div class="value">' + escapeHtml(contractor.contact_email || 'N/A') + '</div></div><div class="contractor-info-item"><div class="label">Phone</div><div class="value">' + escapeHtml(contractor.contact_phone || 'N/A') + '</div></div><div class="contractor-info-item"><div class="label">Workers Count</div><div class="value">' + (contractor.workers_count || 0) + '</div></div></div></div><div class="contractor-detail-section"><h6><i class="bi bi-file-text me-1"></i>Contract Details</h6><div class="contractor-info-grid"><div class="contractor-info-item"><div class="label">Start Date</div><div class="value">' + formatDate(contractor.contract_start_date) + '</div></div><div class="contractor-info-item"><div class="label">End Date</div><div class="value">' + formatDate(contractor.contract_end_date) + '</div></div><div class="contractor-info-item"><div class="label">Contract Value</div><div class="value">' + formatTZS(contractor.contract_value) + '</div></div><div class="contractor-info-item"><div class="label">Status</div><div class="value"><span class="badge bg-success">' + contractor.status + '</span></div></div></div></div>';
        }
        
        var modal = document.getElementById('contractorDetailsModal');
        if (modal) new bootstrap.Modal(modal).show();
    } catch (error) {
        showNotification(error.message || 'Failed to load contractor', 'error');
    }
}

async function generateInvoiceForContractor() {
    if (currentContractorId) await generateInvoiceForContractorById(currentContractorId);
}

async function generateInvoiceForContractorById(contractorId) {
    var modalEl = document.getElementById('contractorDetailsModal');
    var bsModal = bootstrap.Modal.getInstance(modalEl);
    if (bsModal) bsModal.hide();
    
    showSection('invoice');
    var select = document.getElementById('invoiceContractor');
    if (select) select.value = contractorId;
}

function filterContractors(type, btnEl) {
    currentContractorFilter = type;
    var btns = document.querySelectorAll('#contractorsSection .filter-btn');
    for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
    }
    if (btnEl) btnEl.classList.add('active');
    loadContractors();
}

// ========== CONTRACTOR EDIT FUNCTIONS ==========

async function openEditContractorModal(contractorId) {
    try {
        const result = await API.contractors.getById(contractorId);
        var contractor = result.contractor;
        if (!contractor) return;

        document.getElementById('editContractorId').value = contractorId;
        document.getElementById('editContractorName').value = contractor.company_name || '';
        document.getElementById('editContractorType').value = contractor.contractor_type || 'private';
        document.getElementById('editContractorLocation').value = contractor.location || '';
        document.getElementById('editContractorWorkers').value = contractor.workers_count || 0;
        
        var workerNames = contractor.workers_names || [];
        if (typeof workerNames === 'string') {
            workerNames = workerNames.split(', ').filter(function(w) { return w.trim(); });
        }
        document.getElementById('editContractorWorkerNames').value = workerNames.join('\n');
        
        document.getElementById('editContractorStartDate').value = contractor.contract_start_date || '';
        document.getElementById('editContractorEndDate').value = contractor.contract_end_date || '';
        document.getElementById('editContractorValue').value = contractor.contract_value || 0;
        document.getElementById('editContractorContactPerson').value = contractor.contact_person || '';
        document.getElementById('editContractorEmail').value = contractor.contact_email || '';
        document.getElementById('editContractorPhone').value = contractor.contact_phone || '';
        
        var services = contractor.services || [];
        if (typeof services === 'string') {
            services = services.split(', ').filter(function(s) { return s.trim(); });
        }
        document.getElementById('editContractorServices').value = services.join(', ');
        document.getElementById('editContractorStatus').value = contractor.status || 'active';

        var modal = document.getElementById('editContractorModal');
        if (modal) new bootstrap.Modal(modal).show();
    } catch (error) {
        showNotification(error.message || 'Failed to load contractor details', 'error');
    }
}

async function saveEditedContractor() {
    var contractorId = parseInt(document.getElementById('editContractorId').value);
    var name = document.getElementById('editContractorName').value.trim();
    var type = document.getElementById('editContractorType').value;
    var location = document.getElementById('editContractorLocation').value.trim();
    var workers = parseInt(document.getElementById('editContractorWorkers').value) || 0;
    var workerNamesText = document.getElementById('editContractorWorkerNames').value.trim();
    var startDate = document.getElementById('editContractorStartDate').value;
    var endDate = document.getElementById('editContractorEndDate').value;
    var contractValue = parseFloat(document.getElementById('editContractorValue').value) || 0;
    var contactPerson = document.getElementById('editContractorContactPerson').value.trim();
    var email = document.getElementById('editContractorEmail').value.trim();
    var phone = document.getElementById('editContractorPhone').value.trim();
    var servicesStr = document.getElementById('editContractorServices').value.trim();
    var status = document.getElementById('editContractorStatus').value;

    if (!name || !location) {
        showNotification('Contractor name and location are required', 'error');
        return;
    }

    var workerNames = [];
    if (workerNamesText) {
        var lines = workerNamesText.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var w = lines[i].trim();
            if (w) workerNames.push(w);
        }
    }

    var servicesList = [];
    if (servicesStr) {
        var parts = servicesStr.split(',');
        for (var j = 0; j < parts.length; j++) {
            var s = parts[j].trim();
            if (s) servicesList.push(s);
        }
    }

    var contractorData = {
        company_name: name,
        contractor_type: type,
        location: location,
        workers_count: workers,
        workers_names: workerNames,
        contract_start_date: startDate,
        contract_end_date: endDate,
        contract_value: contractValue,
        contact_person: contactPerson,
        contact_email: email,
        contact_phone: phone,
        services_provided: servicesList,
        status: status
    };

    try {
        await API.contractors.update(contractorId, contractorData);
        var modalEl = document.getElementById('editContractorModal');
        var bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
        loadContractors();
        showNotification('Contractor updated successfully!', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to update contractor', 'error');
    }
}

// ========== INVOICE FUNCTIONS ==========
async function populateInvoiceContractors() {
    try {
        const result = await API.contractors.getAll();
        var contractors = result.contractors || [];
        var select = document.getElementById('invoiceContractor');
        if (!select) return;
        var options = '<option value="">Choose contractor...</option>';
        for (var i = 0; i < contractors.length; i++) {
            options += '<option value="' + contractors[i].id + '">' + escapeHtml(contractors[i].company_name) + ' (' + contractors[i].contractor_type + ')</option>';
        }
        select.innerHTML = options;
    } catch (error) {
        console.error('Populate contractors error:', error);
    }
}

function calculateInvoiceTotal() {
    var workCost = Number(document.getElementById('invoiceWorkCost') ? document.getElementById('invoiceWorkCost').value : 0) || 0;
    var laborCost = Number(document.getElementById('invoiceLaborCost') ? document.getElementById('invoiceLaborCost').value : 0) || 0;
    var equipmentCost = Number(document.getElementById('invoiceEquipmentCost') ? document.getElementById('invoiceEquipmentCost').value : 0) || 0;
    var total = workCost + laborCost + equipmentCost;
    var display = document.getElementById('invoiceTotalDisplay');
    if (display) display.textContent = total.toLocaleString('en-TZ');
}

function updateInvoicePreview() {
    calculateInvoiceTotal();
}

async function generateInvoice() {
    var contractorId = document.getElementById('invoiceContractor') ? document.getElementById('invoiceContractor').value : '';
    if (!contractorId) {
        showNotification('Please select a contractor', 'error');
        return;
    }

    var invoiceDate = document.getElementById('invoiceDate') ? document.getElementById('invoiceDate').value : new Date().toISOString().split('T')[0];
    var dueDate = document.getElementById('invoiceDueDate') ? document.getElementById('invoiceDueDate').value : '';
    var workDesc = document.getElementById('invoiceWorkDesc') ? document.getElementById('invoiceWorkDesc').value : 'Cleaning Services';
    var workCost = Number(document.getElementById('invoiceWorkCost') ? document.getElementById('invoiceWorkCost').value : 0) || 0;
    var laborCost = Number(document.getElementById('invoiceLaborCost') ? document.getElementById('invoiceLaborCost').value : 0) || 0;
    var equipmentCost = Number(document.getElementById('invoiceEquipmentCost') ? document.getElementById('invoiceEquipmentCost').value : 0) || 0;
    var notes = document.getElementById('invoiceNotes') ? document.getElementById('invoiceNotes').value : '';

    try {
        const result = await API.invoices.generate({
            contractor_id: contractorId,
            invoice_date: invoiceDate,
            due_date: dueDate,
            work_description: workDesc,
            work_cost: workCost,
            equipment_cost: equipmentCost,
            notes: notes
        });
        
        showNotification('Invoice generated successfully!', 'success');
        loadInvoices();
    } catch (error) {
        showNotification(error.message || 'Failed to generate invoice', 'error');
    }
}

async function loadInvoices() {
    try {
        const result = await API.invoices.getAll();
        var invoices = result.invoices || [];
        var html = '';
        if (invoices.length === 0) {
            html = '<tr><td colspan="6" class="text-center text-muted py-4">No invoices generated yet</td></tr>';
        } else {
            for (var i = 0; i < invoices.length; i++) {
                var inv = invoices[i];
                var statusConfig = getInvoiceStatusConfig(inv.status);
                html += '<tr><td class="align-middle"><strong>#' + escapeHtml(inv.invoice_number) + '</strong></td><td class="align-middle">' + escapeHtml(inv.contractor ? inv.contractor.company_name : 'N/A') + '</td><td class="align-middle">' + formatDate(inv.invoice_date) + '</td><td class="align-middle"><strong style="color:var(--primary)">' + formatTZS(inv.total_amount) + '</strong></td><td class="align-middle"><span class="badge ' + statusConfig.class + '">' + inv.status + '</span></td><td class="align-middle text-center"><button class="action-btn action-btn-view" onclick="viewInvoice(' + inv.id + ')" title="View"><i class="bi bi-eye-fill"></i></button><button class="action-btn action-btn-download" onclick="downloadInvoice(' + inv.id + ')" title="Download PDF"><i class="bi bi-file-earmark-pdf"></i></button></td></tr>';
            }
        }
        var invoiceList = document.getElementById('invoiceList');
        if (invoiceList) invoiceList.innerHTML = html;
    } catch (error) {
        console.error('Load invoices error:', error);
        showNotification('Failed to load invoices', 'error');
    }
}

function getInvoiceStatusConfig(status) {
    var configs = {
        draft: { class: 'bg-secondary' },
        generated: { class: 'bg-info' },
        sent: { class: 'bg-warning' },
        paid: { class: 'bg-success' },
        overdue: { class: 'bg-danger' },
        cancelled: { class: 'bg-dark' }
    };
    return configs[status] || { class: 'bg-secondary' };
}

async function viewInvoice(invoiceId) {
    try {
        const result = await API.invoices.getById(invoiceId);
        var invoice = result.invoice;
        if (!invoice) return;
        
        currentInvoiceData = invoice;
        var bodyEl = document.getElementById('invoicePreviewBody');
        if (bodyEl) {
            bodyEl.innerHTML = '<div class="invoice-preview"><div class="invoice-header"><div class="invoice-header-left"><h3>CleanSpark</h3><p>Cleaning Service Management System</p><p>Zanzibar, Tanzania</p></div><div class="invoice-header-right"><h4>INVOICE</h4><p>#' + escapeHtml(invoice.invoice_number) + '</p><p>Date: ' + formatDate(invoice.invoice_date) + '</p>' + (invoice.due_date ? '<p>Due: ' + formatDate(invoice.due_date) + '</p>' : '') + '</div></div><div class="invoice-bill-to"><strong>Bill To:</strong><br>' + escapeHtml(invoice.contractor ? invoice.contractor.company_name : 'N/A') + '<br>' + escapeHtml(invoice.contractor ? invoice.contractor.location : '') + '</div><table class="invoice-table"><thead><tr><th>Description</th><th style="text-align:right;">Amount (TZS)</th></tr></thead><tbody><tr><td>' + escapeHtml(invoice.work_description || 'Cleaning Services') + '</td><td style="text-align:right;">' + formatTZS(invoice.work_cost) + '</td></tr>' +
                (invoice.equipment_cost > 0 ? '<tr><td>Equipment Cost</td><td style="text-align:right;">' + formatTZS(invoice.equipment_cost) + '</td></tr>' : '') +
                '<tr class="invoice-total-row"><td>TOTAL</td><td style="text-align:right;font-size:18px;">' + formatTZS(invoice.total_amount) + '</td></tr></tbody></table></div>';
        }
        
        var modal = document.getElementById('invoicePreviewModal');
        if (modal) new bootstrap.Modal(modal).show();
    } catch (error) {
        showNotification(error.message || 'Failed to load invoice', 'error');
    }
}

function downloadInvoice(invoiceId) {
    const token = API.getAuthToken();
    if (!token) {
        showNotification('Please login again', 'error');
        window.location.href = '/login.html';
        return;
    }
    
    showNotification('Preparing download...', 'info');
    
    const url = API.invoices.downloadPDF(invoiceId);
    
    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                showNotification('Session expired. Please login again.', 'error');
                window.location.href = '/login.html';
                return Promise.reject(new Error('Authentication failed'));
            }
            return response.json().then(err => {
                throw new Error(err.message || 'Download failed');
            });
        }
        return response.blob();
    })
    .then(blob => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `invoice_${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        showNotification('Invoice downloaded successfully!', 'success');
    })
    .catch(error => {
        console.error('Download error:', error);
        showNotification(error.message || 'Failed to download invoice', 'error');
    });
}

function downloadInvoicePDF() {
    if (currentInvoiceData) {
        downloadInvoice(currentInvoiceData.id);
    } else {
        showNotification('No invoice selected', 'error');
    }
}

function openSendInvoiceModal() {
    if (!currentInvoiceData) {
        showNotification('No invoice selected', 'error');
        return;
    }
    var infoEl = document.getElementById('sendInvoiceInfo');
    if (infoEl) {
        infoEl.innerHTML = '<strong>Invoice #' + escapeHtml(currentInvoiceData.invoice_number) + '</strong><br>Total: ' + formatTZS(currentInvoiceData.total_amount);
    }
    var modal = document.getElementById('sendInvoiceModal');
    if (modal) new bootstrap.Modal(modal).show();
}

function sendInvoiceToCustomer() {
    var email = document.getElementById('customerEmail') ? document.getElementById('customerEmail').value.trim() : '';
    if (!email) {
        showNotification('Please enter customer email', 'error');
        return;
    }
    var modalEl = document.getElementById('sendInvoiceModal');
    var bsModal = bootstrap.Modal.getInstance(modalEl);
    if (bsModal) bsModal.hide();
    showNotification('Invoice link would be sent to ' + email, 'success');
}

// ========== MESSAGE FUNCTIONS ==========
async function loadAllMessages() {
    try {
        var filters = {};
        var searchTerm = document.getElementById('messageSearch') ? document.getElementById('messageSearch').value.trim() : '';
        var statusFilter = document.getElementById('messageStatusFilter') ? document.getElementById('messageStatusFilter').value : 'all';
        
        if (statusFilter !== 'all') filters.status = statusFilter;
        const result = await API.contact.getAll(filters);
        var messages = result.inquiries || [];
        
        if (searchTerm) {
            messages = messages.filter(function(m) {
                return m.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    m.subject.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }
        
        var html = '';
        if (messages.length === 0) {
            html = '<tr><td colspan="6" class="text-center text-muted py-4">No messages found</td></tr>';
        } else {
            for (var i = 0; i < messages.length; i++) {
                var msg = messages[i];
                var statusClass = msg.status === 'unread' ? 'bg-warning' : (msg.status === 'replied' ? 'bg-success' : 'bg-secondary');
                var sourceBadge = '';
                if (msg.source === 'supervisor') {
                    sourceBadge = '<span class="badge bg-info me-1">Supervisor</span>';
                } else if (msg.source === 'report') {
                    sourceBadge = '<span class="badge bg-primary me-1">Report</span>';
                } else {
                    sourceBadge = '<span class="badge bg-secondary me-1">Customer</span>';
                }
                
                html += '<tr><td class="align-middle"><strong>' + escapeHtml(msg.from) + '</strong><br><small>' + escapeHtml(msg.email) + '</small></td><td class="align-middle">' + sourceBadge + ' ' + escapeHtml(msg.subject) + '</td><td class="align-middle">' + escapeHtml(msg.preview || msg.message) + '</td><td class="align-middle">' + formatDate(msg.date) + '</td><td class="align-middle"><span class="badge ' + statusClass + '">' + (msg.status || 'unread') + '</span></td><td class="align-middle text-center"><button class="action-btn action-btn-view" onclick="viewMessage(' + msg.id + ')" title="View"><i class="bi bi-eye-fill"></i></button><button class="action-btn action-btn-reply" onclick="openReplyModal(' + msg.id + ')" title="Reply"><i class="bi bi-reply-fill"></i></button></td></tr>';
            }
        }
        var messageList = document.getElementById('messageList');
        if (messageList) messageList.innerHTML = html;
    } catch (error) {
        console.error('Load messages error:', error);
        showNotification('Failed to load messages', 'error');
    }
}

async function viewMessage(messageId) {
    currentMessageId = messageId;
    try {
        const result = await API.contact.getById(messageId);
        var msg = result.inquiry;
        if (!msg) return;
        
        var bodyEl = document.getElementById('viewMessageBody');
        if (bodyEl) {
            bodyEl.innerHTML = '<div class="message-detail-row"><span class="message-detail-label">From</span><span class="message-detail-value"><strong>' + escapeHtml(msg.from) + '</strong></span></div>' +
                '<div class="message-detail-row"><span class="message-detail-label">Type</span><span class="message-detail-value">' + (msg.type || 'Customer') + '</span></div>' +
                '<div class="message-detail-row"><span class="message-detail-label">Email</span><span class="message-detail-value">' + escapeHtml(msg.email) + '</span></div>' +
                '<div class="message-detail-row"><span class="message-detail-label">Subject</span><span class="message-detail-value">' + escapeHtml(msg.subject) + '</span></div>' +
                '<div class="message-detail-row"><span class="message-detail-label">Date</span><span class="message-detail-value">' + formatDateTime(msg.date) + '</span></div>' +
                '<div class="message-body-box">' + escapeHtml(msg.message) + '</div>' +
                (msg.reply ? '<div class="message-body-box" style="background:#f0fff4;border-color:#bbf7d0;margin-top:12px;"><strong>Your Reply:</strong> ' + escapeHtml(msg.reply.message) + '</div>' : '');
        }
        
        var modal = document.getElementById('viewMessageModal');
        if (modal) new bootstrap.Modal(modal).show();
    } catch (error) {
        showNotification(error.message || 'Failed to load message', 'error');
    }
}

function openReplyModal(messageId) {
    currentMessageId = messageId;
    var originalEl = document.getElementById('replyMessageOriginal');
    if (originalEl) originalEl.innerHTML = '<p>Loading message details...</p>';
    var textarea = document.getElementById('replyMessageText');
    if (textarea) textarea.value = '';
    var modal = document.getElementById('replyMessageModal');
    if (modal) new bootstrap.Modal(modal).show();
    
    API.contact.getById(messageId).then(function(result) {
        var msg = result.inquiry;
        if (originalEl) {
            originalEl.innerHTML = '<strong>From ' + escapeHtml(msg.from) + ':</strong><div style="font-size:12px;margin-top:4px;">' + escapeHtml(msg.message.substring(0, 200)) + '</div>';
        }
    }).catch(console.error);
}

async function sendReply() {
    var replyText = document.getElementById('replyMessageText') ? document.getElementById('replyMessageText').value.trim() : '';
    if (!replyText) {
        showNotification('Please type a reply', 'error');
        return;
    }
    
    try {
        await API.contact.reply(currentMessageId, replyText);
        var modalEl = document.getElementById('replyMessageModal');
        var bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
        loadAllMessages();
        showNotification('Reply sent successfully!', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to send reply', 'error');
    }
}

function replyToMessage() {
    var modalEl = document.getElementById('viewMessageModal');
    var bsModal = bootstrap.Modal.getInstance(modalEl);
    if (bsModal) bsModal.hide();
    openReplyModal(currentMessageId);
}

// ========== JOB APPLICATIONS ==========
async function loadApplicationWindowStatus() {
    try {
        const result = await API.jobApplications.getSettings();
        var isOpen = result.settings.is_open;
        var toggle = document.getElementById('applicationWindowToggle');
        if (toggle) toggle.checked = isOpen;
        var statusCard = document.getElementById('windowStatusCard');
        if (statusCard) statusCard.className = 'window-status-card ' + (isOpen ? 'window-open' : 'window-closed');
        var statusText = document.getElementById('windowStatusText');
        if (statusText) statusText.innerHTML = isOpen ? '<span class="window-status-badge open">● Applications Open</span> — Users can submit applications' : '<span class="window-status-badge closed">● Applications Closed</span> — Users cannot submit applications';
    } catch (error) {
        console.error('Load window status error:', error);
    }
}

async function toggleApplicationWindow() {
    var isOpen = document.getElementById('applicationWindowToggle') ? document.getElementById('applicationWindowToggle').checked : false;
    try {
        await API.jobApplications.updateSettings({ is_open: isOpen });
        loadApplicationWindowStatus();
        showNotification(isOpen ? 'Application window is now OPEN' : 'Application window is now CLOSED', isOpen ? 'success' : 'warning');
    } catch (error) {
        showNotification(error.message || 'Failed to update settings', 'error');
    }
}

async function loadApplications() {
    loadApplicationWindowStatus();
    await loadApplicationsStats();
    await renderApplicationsGrid();
    await renderApplicationsTable();
}

async function loadApplicationsStats() {
    try {
        const result = await API.jobApplications.getStats();
        var stats = result.stats || {};
        
        var statsGrid = document.getElementById('applicationsStats');
        if (statsGrid) {
            statsGrid.innerHTML = '<div class="stat-card" onclick="filterApplicationStatus(\'all\')"><div class="stat-icon"><i class="bi bi-file-earmark-person"></i></div><div class="stat-value">' + (stats.total || 0) + '</div><div class="stat-label">Total Applications</div></div>' +
                '<div class="stat-card" onclick="filterApplicationStatus(\'hired\')"><div class="stat-icon" style="background:rgba(22,163,74,0.1);"><i class="bi bi-check-circle-fill" style="color:#16a34a;"></i></div><div class="stat-value">' + (stats.approved || 0) + '</div><div class="stat-label">Approved</div></div>' +
                '<div class="stat-card" onclick="filterApplicationStatus(\'rejected\')"><div class="stat-icon" style="background:rgba(220,38,38,0.1);"><i class="bi bi-x-circle-fill" style="color:#dc2626;"></i></div><div class="stat-value">' + (stats.rejected || 0) + '</div><div class="stat-label">Rejected</div></div>' +
                '<div class="stat-card" onclick="filterApplicationStatus(\'reviewed\')"><div class="stat-icon" style="background:rgba(59,130,246,0.1);"><i class="bi bi-eye-fill" style="color:#2563eb;"></i></div><div class="stat-value">' + (stats.under_review || 0) + '</div><div class="stat-label">Under Review</div></div>' +
                '<div class="stat-card" onclick="filterApplicationStatus(\'pending\')"><div class="stat-icon" style="background:rgba(245,158,11,0.1);"><i class="bi bi-clock-fill" style="color:#d97706;"></i></div><div class="stat-value">' + (stats.pending || 0) + '</div><div class="stat-label">Pending</div></div>';
        }
    } catch (error) {
        console.error('Load app stats error:', error);
    }
}

function filterApplicationStatus(status, btnEl) {
    currentApplicationFilter = status;
    var btns = document.querySelectorAll('#applicationsSection .filter-btn');
    for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
    }
    if (btnEl) btnEl.classList.add('active');
    renderApplicationsGrid();
    renderApplicationsTable();
}

function filterApplications() {
    renderApplicationsGrid();
    renderApplicationsTable();
}

async function renderApplicationsGrid() {
    try {
        var filters = {};
        if (currentApplicationFilter !== 'all') filters.status = currentApplicationFilter;
        var searchTerm = document.getElementById('applicationSearch') ? document.getElementById('applicationSearch').value.trim().toLowerCase() : '';
        
        const result = await API.jobApplications.getAll(filters);
        var apps = result.applications || [];
        
        if (searchTerm) {
            apps = apps.filter(function(a) {
                return a.full_name.toLowerCase().includes(searchTerm) ||
                    a.email.toLowerCase().includes(searchTerm) ||
                    a.position.toLowerCase().includes(searchTerm);
            });
        }
        
        var grid = document.getElementById('applicationsGrid');
        if (!grid) return;
        
        if (apps.length === 0) {
            grid.innerHTML = '<div style="grid-column:1/-1;" class="empty-state"><i class="bi bi-inbox"></i><p>No applications found</p></div>';
            return;
        }
        
        var recentApps = apps.slice(0, 6);
        var gridHtml = '';
        for (var i = 0; i < recentApps.length; i++) {
            var app = recentApps[i];
            var initials = (app.full_name || '').split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
            var statusConfig = getAppStatusConfig(app.status);
            var date = formatDate(app.date);
            
            gridHtml += '<div class="application-card" onclick="viewApplicationDetail(' + app.id + ')"><div class="application-card-header"><div class="applicant-avatar">' + escapeHtml(initials) + '</div><div class="applicant-info"><h5>' + escapeHtml(app.full_name) + '</h5><span class="position-badge">' + escapeHtml(app.position) + '</span></div></div><div class="application-card-body"><div class="app-detail-mini"><i class="bi bi-envelope"></i>' + escapeHtml(app.email) + '</div><div class="app-detail-mini"><i class="bi bi-telephone"></i>' + escapeHtml(app.phone || '—') + '</div></div><div class="application-card-footer"><span class="app-date"><i class="bi bi-calendar3 me-1"></i>' + date + '</span><span class="application-status ' + statusConfig.class + '">' + statusConfig.icon + ' ' + statusConfig.label + '</span></div></div>';
        }
        grid.innerHTML = gridHtml;
    } catch (error) {
        console.error('Render apps grid error:', error);
    }
}

async function renderApplicationsTable() {
    try {
        var filters = {};
        if (currentApplicationFilter !== 'all') filters.status = currentApplicationFilter;
        var searchTerm = document.getElementById('applicationSearch') ? document.getElementById('applicationSearch').value.trim().toLowerCase() : '';
        
        const result = await API.jobApplications.getAll(filters);
        var apps = result.applications || [];
        
        if (searchTerm) {
            apps = apps.filter(function(a) {
                return a.full_name.toLowerCase().includes(searchTerm) ||
                    a.email.toLowerCase().includes(searchTerm) ||
                    a.position.toLowerCase().includes(searchTerm);
            });
        }
        
        var tbody = document.getElementById('applicationsTableBody');
        var countEl = document.getElementById('applicationsCount');
        if (countEl) countEl.textContent = apps.length + ' Applications';
        if (!tbody) return;
        
        if (apps.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">No applications found</td></tr>';
            return;
        }
        
        var tableHtml = '';
        for (var i = apps.length - 1; i >= 0; i--) {
            var app = apps[i];
            var statusConfig = getAppStatusConfig(app.status);
            var date = formatDate(app.date);
            
            tableHtml += '<tr><td class="align-middle"><strong>' + escapeHtml(app.reference_number) + '</strong></td><td class="align-middle">' + escapeHtml(app.full_name) + '</td><td class="align-middle">' + escapeHtml(app.position) + '</td><td class="align-middle">' + escapeHtml(app.phone || '—') + '</td><td class="align-middle">' + escapeHtml(app.email) + '</td><td class="align-middle">' + date + '</td><td class="align-middle"><span class="application-status ' + statusConfig.class + '">' + statusConfig.icon + ' ' + statusConfig.label + '</span></td><td class="align-middle text-center"><button class="action-btn action-btn-view" onclick="viewApplicationDetail(' + app.id + ')" title="View Details"><i class="bi bi-eye-fill"></i></button><button class="action-btn action-btn-edit" onclick="openReviewApplicationModal(' + app.id + ')" title="Review"><i class="bi bi-pencil-fill"></i></button></td></tr>';
        }
        tbody.innerHTML = tableHtml;
    } catch (error) {
        console.error('Render apps table error:', error);
    }
}

function getAppStatusConfig(status) {
    var configs = {
        pending: { class: 'app-status-pending', icon: '⏳', label: 'Pending' },
        reviewed: { class: 'app-status-under-review', icon: '👁', label: 'Under Review' },
        shortlisted: { class: 'app-status-under-review', icon: '⭐', label: 'Shortlisted' },
        hired: { class: 'app-status-approved', icon: '✅', label: 'Hired' },
        rejected: { class: 'app-status-rejected', icon: '❌', label: 'Rejected' }
    };
    return configs[status] || configs.pending;
}

async function viewApplicationDetail(appId) {
    currentApplicationId = appId;
    try {
        const result = await API.jobApplications.getById(appId);
        var app = result.application;
        if (!app) return;
        
        var statusConfig = getAppStatusConfig(app.status);
        var date = formatDate(app.date);
        
        var bodyEl = document.getElementById('applicationDetailBody');
        if (bodyEl) {
            bodyEl.innerHTML = '<div class="app-profile-banner"><div class="app-profile-avatar-lg">' + (app.personal_info.full_name.charAt(0) || 'A') + '</div><div class="app-profile-info"><h3>' + escapeHtml(app.personal_info.full_name) + '</h3><div class="app-profile-position"><i class="bi bi-briefcase-fill"></i> ' + escapeHtml(app.professional_info.position_applying) + '</div><div class="app-profile-meta-row"><span class="app-profile-meta-tag"><i class="bi bi-calendar3"></i> ' + date + '</span><span class="app-profile-meta-tag"><i class="bi bi-geo-alt"></i> ' + escapeHtml(app.personal_info.address.substring(0, 30)) + '</span></div></div><span class="app-profile-status-badge application-status ' + statusConfig.class + '">' + statusConfig.icon + ' ' + statusConfig.label + '</span></div>' +
                '<div class="app-detail-content-body"><div class="app-info-section"><div class="app-info-section-header"><i class="bi bi-person-vcard"></i><h6>Personal Information</h6></div><div class="app-info-grid"><div class="app-info-field"><div class="field-label-mini">Full Name</div><div class="field-value">' + escapeHtml(app.personal_info.full_name) + '</div></div><div class="app-info-field"><div class="field-label-mini">Email</div><div class="field-value">' + escapeHtml(app.personal_info.email) + '</div></div><div class="app-info-field"><div class="field-label-mini">Phone</div><div class="field-value">' + escapeHtml(app.personal_info.phone || '—') + '</div></div><div class="app-info-field"><div class="field-label-mini">Gender</div><div class="field-value">' + escapeHtml(app.personal_info.gender || '—') + '</div></div><div class="app-info-field"><div class="field-label-mini">Age</div><div class="field-value">' + (app.personal_info.age || '—') + '</div></div><div class="app-info-field"><div class="field-label-mini">Address</div><div class="field-value">' + escapeHtml(app.personal_info.address || '—') + '</div></div></div></div>' +
                '<div class="app-info-section"><div class="app-info-section-header"><i class="bi bi-stars"></i><h6>Professional Details</h6></div><div class="app-info-grid"><div class="app-info-field"><div class="field-label-mini">Education</div><div class="field-value">' + escapeHtml(app.professional_info.education_level || '—') + '</div></div><div class="app-info-field"><div class="field-label-mini">Experience</div><div class="field-value">' + (app.professional_info.experience_years || 0) + ' years</div></div><div class="app-info-field"><div class="field-label-mini">Skills</div><div class="field-value">' + escapeHtml(app.professional_info.skills || '—') + '</div></div><div class="app-info-field"><div class="field-label-mini">Availability</div><div class="field-value">' + escapeHtml(app.professional_info.availability || '—') + '</div></div></div></div>' +
                (app.professional_info.additional_notes ? '<div class="app-info-section"><div class="app-info-section-header"><i class="bi bi-journal-text"></i><h6>Additional Notes</h6></div><div class="app-notes-box">' + escapeHtml(app.professional_info.additional_notes) + '</div></div>' : '') +
                (app.review ? '<div class="app-info-section"><div class="app-info-section-header"><i class="bi bi-clipboard-check"></i><h6>Review Notes</h6></div><div class="app-notes-box">' + escapeHtml(app.review.notes) + '<br><small>Reviewed by: ' + escapeHtml(app.review.by) + ' on ' + formatDate(app.review.at) + '</small></div></div>' : '');
        }
        
        var modal = document.getElementById('applicationDetailModal');
        if (modal) new bootstrap.Modal(modal).show();
    } catch (error) {
        showNotification(error.message || 'Failed to load application', 'error');
    }
}

function openReviewApplicationModal(appId) {
    currentApplicationId = appId;
    document.getElementById('reviewApplicationId').value = appId;
    document.getElementById('reviewStatus').value = 'reviewed';
    document.getElementById('reviewNotes').value = '';
    var modal = document.getElementById('reviewApplicationModal');
    if (modal) new bootstrap.Modal(modal).show();
}

function reviewApplicationFromModal() {
    openReviewApplicationModal(currentApplicationId);
    var modalEl = document.getElementById('applicationDetailModal');
    var bsModal = bootstrap.Modal.getInstance(modalEl);
    if (bsModal) bsModal.hide();
}

async function confirmReviewApplication() {
    var appId = document.getElementById('reviewApplicationId').value;
    var status = document.getElementById('reviewStatus').value;
    var notes = document.getElementById('reviewNotes').value;
    
    try {
        await API.jobApplications.review(appId, status, notes);
        var modalEl = document.getElementById('reviewApplicationModal');
        var bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
        loadApplications();
        showNotification('Application reviewed successfully!', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to review application', 'error');
    }
}

// ========== STAFF ISSUES FUNCTIONS ==========
async function loadStaffIssues() {
    try {
        var filters = {};
        var searchTerm = document.getElementById('staffInfoSearch') ? document.getElementById('staffInfoSearch').value.trim().toLowerCase() : '';
        var statusFilter = document.getElementById('staffIssueStatusFilter') ? document.getElementById('staffIssueStatusFilter').value : 'all';
        
        if (statusFilter !== 'all') filters.status = statusFilter;
        const result = await API.staffIssues.getAll(filters);
        var issues = result.issues || [];
        
        if (searchTerm) {
            issues = issues.filter(function(i) {
                return i.staff.name.toLowerCase().includes(searchTerm);
            });
        }
        
        updateStaffInfoStats(issues);
        renderStaffIssuesTable(issues);
    } catch (error) {
        console.error('Load staff issues error:', error);
        showNotification('Failed to load staff issues', 'error');
    }
}

function updateStaffInfoStats(issues) {
    var total = issues.length;
    var pending = 0;
    var reviewed = 0;
    var resolved = 0;
    var rejected = 0;
    
    for (var i = 0; i < issues.length; i++) {
        if (issues[i].status === 'pending') pending++;
        else if (issues[i].status === 'reviewed') reviewed++;
        else if (issues[i].status === 'resolved') resolved++;
        else if (issues[i].status === 'rejected') rejected++;
    }
    
    var statsGrid = document.getElementById('staffInfoStatsGrid');
    if (statsGrid) {
        statsGrid.innerHTML = '<div class="stat-card"><div class="stat-icon"><i class="bi bi-exclamation-triangle-fill"></i></div><div class="stat-value">' + total + '</div><div class="stat-label">Total Issues</div></div>' +
            '<div class="stat-card" onclick="filterStaffIssuesByStatus(\'pending\')"><div class="stat-icon" style="background:rgba(59,130,246,0.1);"><i class="bi bi-clock-fill" style="color:#3b82f6;"></i></div><div class="stat-value">' + pending + '</div><div class="stat-label">Pending</div></div>' +
            '<div class="stat-card" onclick="filterStaffIssuesByStatus(\'reviewed\')"><div class="stat-icon" style="background:rgba(245,158,11,0.1);"><i class="bi bi-eye-fill" style="color:#d97706;"></i></div><div class="stat-value">' + reviewed + '</div><div class="stat-label">Under Review</div></div>' +
            '<div class="stat-card" onclick="filterStaffIssuesByStatus(\'resolved\')"><div class="stat-icon" style="background:rgba(22,163,74,0.1);"><i class="bi bi-check-circle-fill" style="color:#16a34a;"></i></div><div class="stat-value">' + resolved + '</div><div class="stat-label">Resolved</div></div>' +
            '<div class="stat-card" onclick="filterStaffIssuesByStatus(\'rejected\')"><div class="stat-icon" style="background:rgba(220,38,38,0.1);"><i class="bi bi-x-circle-fill" style="color:#dc2626;"></i></div><div class="stat-value">' + rejected + '</div><div class="stat-label">Rejected</div></div>';
    }
}

function renderStaffIssuesTable(issues) {
    var html = '';
    if (issues.length === 0) {
        html = '<tr><td colspan="8" class="text-center text-muted py-4">No staff issues found</td></tr>';
    } else {
        for (var i = 0; i < issues.length; i++) {
            var issue = issues[i];
            var statusClass = getIssueStatusClass(issue.status);
            var date = formatDate(issue.created_at);
            
            html += '<tr><td class="align-middle"><strong>#' + escapeHtml(String(issue.id)) + '</strong></td><td class="align-middle"><strong>' + escapeHtml(issue.staff.name) + '</strong></td><td class="align-middle"><span class="badge bg-secondary">' + escapeHtml(issue.issue_type) + '</span></td><td class="align-middle">' + escapeHtml(issue.issue_title) + '</td><td class="align-middle">' + escapeHtml(issue.issue_description.substring(0, 50)) + (issue.issue_description.length > 50 ? '…' : '') + '</td><td class="align-middle">' + formatDate(issue.expected_return_date) + '</td><td class="align-middle"><span class="' + statusClass + '">' + escapeHtml(issue.status_label) + '</span></td><td class="align-middle text-center"><button class="action-btn action-btn-view" onclick="viewStaffIssueDetail(' + issue.id + ')" title="View Details"><i class="bi bi-eye-fill"></i></button><button class="action-btn action-btn-edit" onclick="openUpdateIssueStatusModal(' + issue.id + ')" title="Update Status"><i class="bi bi-pencil-fill"></i></button></td></tr>';
        }
    }
    var issuesList = document.getElementById('staffIssuesList');
    if (issuesList) issuesList.innerHTML = html;
}

function getIssueStatusClass(status) {
    var classes = {
        pending: 'badge bg-warning text-dark',
        reviewed: 'badge bg-info',
        resolved: 'badge bg-success',
        rejected: 'badge bg-danger'
    };
    return classes[status] || 'badge bg-secondary';
}

function filterStaffIssues() {
    loadStaffIssues();
}

function filterStaffIssuesByStatus(status) {
    var statusSelect = document.getElementById('staffIssueStatusFilter');
    if (statusSelect) statusSelect.value = status;
    loadStaffIssues();
}

async function viewStaffIssueDetail(issueId) {
    currentStaffIssueId = issueId;
    try {
        const result = await API.staffIssues.getById(issueId);
        var issue = result.issue;
        if (!issue) return;
        
        var bodyEl = document.getElementById('viewStaffIssueBody');
        if (bodyEl) {
            bodyEl.innerHTML = '<div class="row"><div class="col-md-6"><p><strong>Staff Name:</strong> ' + escapeHtml(issue.staff.full_name) + '</p><p><strong>Issue Type:</strong> <span class="badge bg-secondary">' + escapeHtml(issue.issue_type_label) + '</span></p><p><strong>Title:</strong> ' + escapeHtml(issue.issue_title) + '</p></div><div class="col-md-6"><p><strong>Submitted:</strong> ' + formatDateTime(issue.created_at) + '</p><p><strong>Expected Return:</strong> ' + formatDate(issue.expected_return_date) + '</p><p><strong>Status:</strong> <span class="badge bg-info">' + escapeHtml(issue.status_label) + '</span></p></div></div><hr><p><strong>Description:</strong></p><div class="p-3 bg-light rounded">' + escapeHtml(issue.issue_description) + '</div>' +
                (issue.admin_response ? '<p class="mt-3"><strong>Admin Response:</strong></p><div class="p-3 bg-light rounded">' + escapeHtml(issue.admin_response) + '</div>' : '');
        }
        
        var modal = document.getElementById('viewStaffIssueModal');
        if (modal) new bootstrap.Modal(modal).show();
    } catch (error) {
        showNotification(error.message || 'Failed to load issue', 'error');
    }
}

function openUpdateIssueStatusModal(issueId) {
    currentStaffIssueId = issueId;
    document.getElementById('updateIssueId').value = issueId;
    document.getElementById('updateIssueStatus').value = 'reviewed';
    document.getElementById('updateIssueResponse').value = '';
    var modal = document.getElementById('updateIssueStatusModal');
    if (modal) new bootstrap.Modal(modal).show();
}

async function confirmUpdateIssueStatus() {
    var issueId = document.getElementById('updateIssueId').value;
    var status = document.getElementById('updateIssueStatus').value;
    var response = document.getElementById('updateIssueResponse').value;
    
    try {
        await API.staffIssues.updateStatus(issueId, status, response || null);
        var modalEl = document.getElementById('updateIssueStatusModal');
        var bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
        loadStaffIssues();
        showNotification('Issue status updated successfully!', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to update status', 'error');
    }
}

// ========== ASSIGNMENT FUNCTIONS ==========
async function loadAssignmentSection() {
    var activeTab = document.querySelector('.assign-tab-btn.active');
    if (activeTab) {
        switchAssignTab(activeTab.dataset.tab, activeTab);
    } else {
        var defaultTab = document.querySelector('.assign-tab-btn[data-tab="allStaff"]');
        if (defaultTab) switchAssignTab('allStaff', defaultTab);
    }
}

function switchAssignTab(tabName, btnEl) {
    var btns = document.querySelectorAll('.assign-tab-btn');
    for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
    }
    var contents = document.querySelectorAll('.assign-tab-content');
    for (var j = 0; j < contents.length; j++) {
        contents[j].classList.remove('active');
    }
    if (btnEl) btnEl.classList.add('active');
    var tabEl = document.getElementById('tab-' + tabName);
    if (tabEl) tabEl.classList.add('active');
    
    if (tabName === 'allStaff') renderAllStaffTab();
    else if (tabName === 'assignedStaff') renderAssignedStaffTab();
    else if (tabName === 'unassignedStaff') renderUnassignedStaffTab();
    else if (tabName === 'assignedServices') renderAssignedServicesTab();
    else if (tabName === 'unassignedServices') renderUnassignedServicesTab();
}

// ========== RENDER ALL STAFF TAB ==========
async function renderAllStaffTab() {
    try {
        const result = await API.assignments.getAllStaffWithStatus();
        var staff = result.staff || [];
        var html = '';
        if (staff.length === 0) {
            html = '<tr><td colspan="6" class="text-center text-muted py-4">No staff members found</td></tr>';
        } else {
            for (var i = 0; i < staff.length; i++) {
                var member = staff[i];
                
                var avatarHtml = member.photo ? 
                    '<img src="' + escapeHtml(member.photo) + '" alt="' + escapeHtml(member.full_name) + '" class="staff-avatar" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-color);">' : 
                    '<div class="staff-initials" style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px;">' + (member.full_name.charAt(0) || '?') + '</div>';
                
                var statusColor = '';
                var statusText = member.status || 'Not Assigned';
                if (statusText === 'Assigned') {
                    statusColor = 'background: #22c55e; color: white; padding: 4px 12px; border-radius: 20px; font-weight: 600;';
                } else if (statusText === 'Not Assigned') {
                    statusColor = 'background: #ef4444; color: white; padding: 4px 12px; border-radius: 20px; font-weight: 600;';
                } else if (statusText === 'In Progress') {
                    statusColor = 'background: #3b82f6; color: white; padding: 4px 12px; border-radius: 20px; font-weight: 600;';
                } else {
                    statusColor = 'background: #ef4444; color: white; padding: 4px 12px; border-radius: 20px; font-weight: 600;';
                }
                
                var typeColor = '';
                var typeLabel = member.staff_type_label || 'Staff';
                if (member.staff_type === 'supervisor') {
                    typeColor = 'color: #1f2937; background: #e5e7eb; padding: 2px 8px; border-radius: 12px; font-size: 10px;';
                } else if (member.staff_type === 'general_supervisor') {
                    typeColor = 'color: #7c3aed; background: #ede9fe; padding: 2px 8px; border-radius: 12px; font-size: 10px;';
                } else {
                    typeColor = 'color: #db2777; background: #fce7f3; padding: 2px 8px; border-radius: 12px; font-size: 10px;';
                }
                
                html += '<tr>' +
                    '<td class="align-middle">' + avatarHtml + '</td>' +
                    '<td class="align-middle"><strong>' + escapeHtml(member.full_name) + '</strong><br><small style="' + typeColor + '">' + escapeHtml(typeLabel) + '</small></td>' +
                    '<td class="align-middle">' + escapeHtml(member.email) + '</td>' +
                    '<td class="align-middle"><span style="' + statusColor + '">' + escapeHtml(statusText) + '</span></td>' +
                    '<td class="align-middle"><strong>' + escapeHtml(member.supervisor_name || 'N/A') + '</strong></td>' +
                    '<td class="align-middle text-center"><span class="services-count-badge" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 4px 12px; border-radius: 20px;">' + (member.total_assignments || 0) + '</span></td>' +
                '</tr>';
            }
        }
        var allStaffList = document.getElementById('allStaffAssignList');
        if (allStaffList) allStaffList.innerHTML = html;
    } catch (error) {
        console.error('Render all staff error:', error);
        showNotification('Failed to load staff data', 'error');
    }
}
async function renderAssignedStaffTab() {
    try {
        const result = await API.assignments.getAssignedStaff();
        var staff = result.staff || [];
        var html = '';
        if (staff.length === 0) {
            html = '<tr><td colspan="6" class="text-center text-muted py-4">No assigned staff found</td></tr>';
        } else {
            for (var i = 0; i < staff.length; i++) {
                var member = staff[i];
                
                var avatarHtml = member.photo ? 
                    '<img src="' + escapeHtml(member.photo) + '" alt="' + escapeHtml(member.full_name) + '" class="staff-avatar" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-color);">' : 
                    '<div class="staff-initials" style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px;">' + (member.full_name.charAt(0) || '?') + '</div>';
                
                // Show supervisor name or "Not Assigned"
                var supervisorDisplay = member.supervisor_name ? 
                    escapeHtml(member.supervisor_name) : 
                    '<span style="color: #ef4444; font-style: italic; font-size: 12px;">Not Assigned</span>';
                
                html += '<tr>' +
                    '<td class="align-middle">' + avatarHtml + '</td>' +
                    '<td class="align-middle"><strong>' + escapeHtml(member.full_name) + '</strong><br><small style="color: #6b7280; font-size: 11px;">' + escapeHtml(member.role || 'Staff') + '</small></td>' +
                    '<td class="align-middle">' + escapeHtml(member.email) + '</td>' +
                    '<td class="align-middle">' + supervisorDisplay + '</td>' +
                    '<td class="align-middle text-center"><span class="services-count-badge" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 4px 12px; border-radius: 20px;">' + (member.total_services || 0) + '</span></td>' +
                    '<td class="align-middle text-center"><button class="action-btn action-btn-view" onclick="openViewStaffServices(' + member.id + ')" title="View Details"><i class="bi bi-eye-fill"></i></button></td>' +
                '</tr>';
            }
        }
        var assignedStaffList = document.getElementById('assignedStaffList');
        if (assignedStaffList) assignedStaffList.innerHTML = html;
    } catch (error) {
        console.error('Render assigned staff error:', error);
        showNotification('Failed to load assigned staff data', 'error');
    }
}

// ========== RENDER UNASSIGNED STAFF TAB ==========
async function renderUnassignedStaffTab() {
    try {
        const result = await API.assignments.getUnassignedStaff();
        var staff = result.staff || [];
        var html = '';
        if (staff.length === 0) {
            html = '<tr><td colspan="5" class="text-center text-muted py-4">All staff have been assigned</td></tr>';
        } else {
            for (var i = 0; i < staff.length; i++) {
                var member = staff[i];
                
                var avatarHtml = member.photo ? 
                    '<img src="' + escapeHtml(member.photo) + '" alt="' + escapeHtml(member.full_name) + '" class="staff-avatar" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-color);">' : 
                    '<div class="staff-initials" style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px;">' + (member.full_name.charAt(0) || '?') + '</div>';
                
                html += '<tr>' +
                    '<td class="align-middle">' + avatarHtml + '</td>' +
                    '<td class="align-middle"><strong>' + escapeHtml(member.full_name) + '</strong></td>' +
                    '<td class="align-middle">' + escapeHtml(member.email) + '</td>' +
                    '<td class="align-middle">' + escapeHtml(member.phone || '—') + '</td>' +
                    '<td class="align-middle text-center"><button class="action-btn action-btn-edit" onclick="switchAssignTab(\'unassignedServices\', null)" title="Assign Service"><i class="bi bi-plus-circle-fill"></i></button></td>' +
                '</tr>';
            }
        }
        var unassignedStaffList = document.getElementById('unassignedStaffList');
        if (unassignedStaffList) unassignedStaffList.innerHTML = html;
    } catch (error) {
        console.error('Render unassigned staff error:', error);
        showNotification('Failed to load unassigned staff data', 'error');
    }
}

// ========== RENDER ASSIGNED SERVICES TAB ==========
async function renderAssignedServicesTab() {
    try {
        const result = await API.assignments.getAssignedServices();
        var services = result.services || [];
        var html = '';
        if (services.length === 0) {
            html = '<tr><td colspan="5" class="text-center"><div class="empty-state"><i class="bi bi-inbox"></i><p>No services have been assigned yet</p></div></td></tr>';
        } else {
            for (var i = 0; i < services.length; i++) {
                var service = services[i];
                var imgHtml = service.image ? 
                    '<img src="' + escapeHtml(service.image) + '" alt="' + escapeHtml(service.name) + '" class="service-thumb" style="width: 46px; height: 38px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color);">' : 
                    '<div class="no-image-thumb" style="width: 46px; height: 38px; background: var(--bg-section-alt); border-radius: 8px; border: 1px dashed var(--border-dashed); display: flex; align-items: center; justify-content: center; color: var(--text-light); font-size: 16px;"><i class="bi bi-image"></i></div>';
                
                var staffHtml = '';
                if (service.staff_list && service.staff_list.length > 0) {
                    staffHtml = '<div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">';
                    service.staff_list.forEach(function(staff) {
                        var staffAvatar = staff.photo ? 
                            '<img src="' + escapeHtml(staff.photo) + '" alt="' + escapeHtml(staff.name) + '" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 2px solid #e2e8f0;">' : 
                            '<div style="width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700;">' + (staff.name.charAt(0) || '?') + '</div>';
                        staffHtml += '<div title="' + escapeHtml(staff.name) + ' (' + escapeHtml(staff.staff_type || 'Staff') + ')" style="display: flex; align-items: center; gap: 4px;">' + staffAvatar + '</div>';
                    });
                    staffHtml += '</div>';
                } else {
                    staffHtml = '<span class="text-muted" style="font-size: 12px;">' + escapeHtml(service.assigned_to || 'No staff assigned') + '</span>';
                }
                
                html += '<tr>' +
                    '<td class="align-middle">' + imgHtml + '</td>' +
                    '<td class="align-middle"><strong>' + escapeHtml(service.name) + '</strong></td>' +
                    '<td class="align-middle"><strong style="color:var(--primary)">' + formatTZS(service.price) + '</strong></td>' +
                    '<td class="align-middle">' + staffHtml + '</td>' +
                    '<td class="align-middle text-center">' +
                        '<button class="action-btn action-btn-edit" onclick="openAssignServiceModal(' + service.id + ')" title="Reassign"><i class="bi bi-arrow-repeat"></i></button>' +
                        '<button class="action-btn action-btn-delete" onclick="unassignService(' + service.id + ')" title="Remove"><i class="bi bi-trash3-fill"></i></button>' +
                    '</td>' +
                '</tr>';
            }
        }
        var assignedServicesList = document.getElementById('assignedServicesList');
        if (assignedServicesList) assignedServicesList.innerHTML = html;
    } catch (error) {
        console.error('Render assigned services error:', error);
        showNotification('Failed to load assigned services data', 'error');
    }
}

// ========== RENDER UNASSIGNED SERVICES TAB ==========
async function renderUnassignedServicesTab() {
    try {
        const result = await API.assignments.getPaidUnassigned();
        var services = result.services || [];
        var html = '';
        
        if (services.length === 0) {
            html = '<tr><td colspan="5" class="text-center"><div class="empty-state"><i class="bi bi-check-circle"></i><p>All paid bookings have been assigned to staff</p></div></td></tr>';
        } else {
            for (var i = 0; i < services.length; i++) {
                var service = services[i];
                var imgHtml = service.image ? 
                    '<img src="' + escapeHtml(service.image) + '" alt="' + escapeHtml(service.name) + '" class="service-thumb" style="width: 46px; height: 38px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color);">' : 
                    '<div class="no-image-thumb" style="width: 46px; height: 38px; background: var(--bg-section-alt); border-radius: 8px; border: 1px dashed var(--border-dashed); display: flex; align-items: center; justify-content: center; color: var(--text-light); font-size: 16px;"><i class="bi bi-image"></i></div>';
                var locIcon = service.location === 'Unguja Island' ? '🏝' : (service.location === 'Pemba Island' ? '🌿' : '🗺');
                var locClass = service.location === 'Unguja Island' ? 'location-unguja' : (service.location === 'Pemba Island' ? 'location-pemba' : 'location-both');
                
                html += '<tr><td class="align-middle">' + imgHtml + '</td>' +
                    '<td class="align-middle"><strong>' + escapeHtml(service.name) + '</strong>' + (service.description ? '<div style="font-size:11px;color:var(--text-muted);">' + escapeHtml(service.description.substring(0, 50)) + (service.description.length > 50 ? '…' : '') + '</div>' : '') + '</td>' +
                    '<td class="align-middle"><strong style="color:var(--primary)">' + formatTZS(service.price) + '</strong></td>' +
                    '<td class="align-middle"><span class="location-badge ' + locClass + '" style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">' + locIcon + ' ' + escapeHtml(service.location) + '</span></td>' +
                    '<td class="align-middle"><div style="font-size:11px;color:var(--text-muted);">Customer: ' + escapeHtml(service.customer_name || 'N/A') + '<br>Date: ' + formatDate(service.service_date) + ' at ' + escapeHtml(service.service_time || '') + '</div></td>' +
                    '<td class="align-middle text-center"><button class="btn-assign-now" onclick="openAssignServiceModal(' + service.id + ', ' + service.booking_id + ')" title="Assign to staff" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; font-family: Inter, sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.25s; box-shadow: 0 4px 12px rgba(102,126,234,0.3);"><i class="bi bi-person-plus-fill me-1"></i>Assign</button></td>' +
                '</tr>';
            }
        }
        
        var unassignedServicesList = document.getElementById('unassignedServicesList');
        if (unassignedServicesList) unassignedServicesList.innerHTML = html;
    } catch (error) {
        console.error('Render unassigned services error:', error);
        showNotification('Failed to load unassigned services', 'error');
    }
}

// ========== SETTINGS ==========
async function loadSettings() {
    try {
        const result = await API.adminSettings.getAll();
        var settings = result.settings || {};
        var emailCheck = document.getElementById('emailNotifications');
        if (emailCheck) emailCheck.checked = settings.email_notifications ? settings.email_notifications.value : true;
        var autoAssign = document.getElementById('autoAssignStaff');
        if (autoAssign) autoAssign.checked = settings.auto_assign_staff ? settings.auto_assign_staff.value : false;
    } catch (error) {
        console.error('Load settings error:', error);
    }
}

async function saveSettings() {
    var emailNotifications = document.getElementById('emailNotifications') ? document.getElementById('emailNotifications').checked : true;
    var autoAssignStaff = document.getElementById('autoAssignStaff') ? document.getElementById('autoAssignStaff').checked : false;
    
    try {
        await API.adminSettings.toggle('email_notifications', emailNotifications);
        await API.adminSettings.toggle('auto_assign_staff', autoAssignStaff);
        showNotification('Settings saved!', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to save settings', 'error');
    }
}

// ========== REPORT FUNCTIONS ==========
async function loadReportsHistory() {
    try {
        const result = await API.reports.getHistory();
        var reportsList = result.reports || [];
        var html = '';
        if (reportsList.length === 0) {
            html = '<tr><td colspan="5" class="text-center text-muted py-4">No reports generated yet</td></tr>';
        } else {
            for (var i = 0; i < reportsList.length; i++) {
                var r = reportsList[i];
                html += '<tr><td class="align-middle"><strong>#' + escapeHtml(r.id) + '</strong></td><td class="align-middle">' + escapeHtml(r.report_type) + '</td><td class="align-middle">' + formatDate(r.date_range.from) + ' — ' + formatDate(r.date_range.to) + '</td><td class="align-middle">' + formatDate(r.created_at) + '</td><td class="align-middle text-center">' +
                    '<button class="action-btn action-btn-download" onclick="downloadReport(' + r.id + ')" title="Download PDF"><i class="bi bi-file-earmark-pdf"></i></button>' +
                    '<button class="action-btn action-btn-reply" onclick="shareReportViaEmail(' + r.id + ')" title="Share via Email"><i class="bi bi-share-fill"></i></button>' +
                    '</td></tr>';
            }
        }
        var reportHistoryList = document.getElementById('reportHistoryList');
        if (reportHistoryList) reportHistoryList.innerHTML = html;
    } catch (error) {
        console.error('Load reports history error:', error);
    }
}

async function generateReport() {
    var fromDate = document.getElementById('reportFromDate') ? document.getElementById('reportFromDate').value : '';
    var toDate = document.getElementById('reportToDate') ? document.getElementById('reportToDate').value : '';
    var reportType = document.getElementById('reportType') ? document.getElementById('reportType').value : 'comprehensive';
    var format = document.getElementById('reportFormat') ? document.getElementById('reportFormat').value : 'detailed';
    
    if (!fromDate || !toDate) {
        showNotification('Please select both From and To dates', 'error');
        return;
    }
    
    try {
        showNotification('Generating report...', 'info');
        const result = await API.reports.generate({
            date_from: fromDate,
            date_to: toDate,
            report_type: reportType,
            format: format
        });
        
        showNotification('Report generated successfully!', 'success');
        loadReportsHistory();
        
        if (result.report && result.report.download_url) {
            showNotification('Report ready. Use the download button to save it.', 'success');
        }
    } catch (error) {
        showNotification(error.message || 'Failed to generate report', 'error');
    }
}

function downloadReport(reportId) {
    const token = API.getAuthToken();
    if (!token) {
        showNotification('Please login again', 'error');
        window.location.href = '/login.html';
        return;
    }
    
    showNotification('Preparing download...', 'info');
    const url = API.reports.download(reportId);
    
    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                showNotification('Session expired. Please login again.', 'error');
                window.location.href = '/login.html';
                return Promise.reject(new Error('Authentication failed'));
            }
            return response.json().then(err => {
                throw new Error(err.message || 'Download failed');
            });
        }
        return response.blob();
    })
    .then(blob => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `report_${reportId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        showNotification('Report downloaded successfully!', 'success');
    })
    .catch(error => {
        console.error('Download error:', error);
        showNotification(error.message || 'Failed to download report', 'error');
    });
}

async function shareReportViaEmail(reportId) {
    const email = prompt('Enter the email address to share this report with:');
    if (!email) return;
    
    const message = prompt('Optional: Add a message to include with the report:');
    
    try {
        showNotification('Sharing report...', 'info');
        const result = await API.reports.shareViaEmail(reportId, email, message || '');
        if (result.success) {
            showNotification(result.message || 'Report shared successfully!', 'success');
        }
    } catch (error) {
        showNotification(error.message || 'Failed to share report', 'error');
    }
}

function openReportGenerator() {
    showSection('reports');
}

function initCharts() {
    var ctx1 = document.getElementById('bookingChart') ? document.getElementById('bookingChart').getContext('2d') : null;
    var ctx2 = document.getElementById('revenueChart') ? document.getElementById('revenueChart').getContext('2d') : null;
    
    if (ctx1 && typeof Chart !== 'undefined') {
        if (bookingChart) bookingChart.destroy();
        bookingChart = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{ label: 'Bookings', data: [0, 0, 0, 0, 0, 0], borderColor: '#1a56db', backgroundColor: 'rgba(26,86,219,0.08)', tension: 0.4, fill: true }]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }
        });
    }
    if (ctx2 && typeof Chart !== 'undefined') {
        if (revenueChart) revenueChart.destroy();
        revenueChart = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{ label: 'Revenue (TZS)', data: [0, 0, 0, 0, 0, 0], backgroundColor: 'rgba(124,58,237,0.8)', borderRadius: 6 }]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true, ticks: { callback: function(val) { return 'TZS ' + (val/1000).toFixed(0) + 'K'; } } } } }
        });
    }
}

// ========== NOTIFICATION FUNCTIONS ==========
function updateNotificationBadge() {
    var notifications = JSON.parse(localStorage.getItem('adminNotifications')) || [];
    var unreadCount = notifications.filter(function(n) { return !n.read; }).length;
    var badge = document.getElementById('notificationBadge');
    if (badge) {
        if (unreadCount > 0) {
            badge.style.display = 'inline-block';
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        } else {
            badge.style.display = 'none';
        }
    }
}

function toggleNotificationPanel() {
    var panel = document.getElementById('notificationPanel');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
}

function clearAllNotifications() {
    localStorage.setItem('adminNotifications', JSON.stringify([]));
    updateNotificationBadge();
    toggleNotificationPanel();
}

function addToNotificationCenter(message, type) {
    var notifications = JSON.parse(localStorage.getItem('adminNotifications')) || [];
    notifications.unshift({
        id: Date.now(),
        message: message,
        type: type,
        timestamp: new Date().toISOString(),
        read: false
    });
    if (notifications.length > 50) notifications = notifications.slice(0, 50);
    localStorage.setItem('adminNotifications', JSON.stringify(notifications));
    updateNotificationBadge();
}

// ========== SESSION CHECK ==========
document.addEventListener('DOMContentLoaded', function() {
    const token = API.getAuthToken();
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    
    if (token && adminLoggedIn) {
        try {
            const parts = token.split('.');
            const payload = JSON.parse(atob(parts[1]));
            if (payload.role === 'admin') {
                var loginSection = document.getElementById('loginSection');
                var dashboard = document.getElementById('dashboard');
                if (loginSection) loginSection.style.display = 'none';
                if (dashboard) {
                    dashboard.style.display = 'flex';
                    dashboard.style.flexDirection = 'column';
                }
                if (payload.email) {
                    document.getElementById('adminName').textContent = payload.email.split('@')[0];
                }
                initDashboard();
                return;
            }
        } catch (e) {
            console.error('Token validation error:', e);
        }
    }
    
    var loginSection = document.getElementById('loginSection');
    var dashboard = document.getElementById('dashboard');
    if (loginSection) loginSection.style.display = 'flex';
    if (dashboard) dashboard.style.display = 'none';
});

// ========== SESSION CHECK INTERVAL ==========
setInterval(function() {
    const token = API.getAuthToken();
    const adminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    
    if (!token || !adminLoggedIn) {
        var loginSection = document.getElementById('loginSection');
        var dashboard = document.getElementById('dashboard');
        if (loginSection) loginSection.style.display = 'flex';
        if (dashboard) dashboard.style.display = 'none';
    }
}, 60000);

// ========== PAYMENT STATUS POLLING ==========
console.log('🔥 Loading ultimate payment status fix...');

async function checkAllPaymentStatuses() {
    try {
        const bookingsSection = document.getElementById('bookingsSection');
        if (!bookingsSection || !bookingsSection.classList.contains('active')) return;
        
        const rows = document.querySelectorAll('#bookingList tr');
        if (rows.length === 0) return;
        
        const bookingIds = [];
        for (const row of rows) {
            const idCell = row.querySelector('td:first-child');
            if (idCell) {
                const match = idCell.textContent.match(/#(\d+)/);
                if (match) bookingIds.push(parseInt(match[1]));
            }
        }
        
        if (bookingIds.length === 0) return;
        
        let updated = 0;
        for (const id of bookingIds) {
            try {
                const result = await API.bookings.getById(id);
                if (result && result.booking) {
                    const booking = result.booking;
                    const paymentStatus = booking.payment ? booking.payment.payment_status : 'unpaid';
                    
                    for (const row of rows) {
                        const idCell = row.querySelector('td:first-child');
                        if (idCell && idCell.textContent.includes(`#${id}`)) {
                            const cells = row.querySelectorAll('td');
                            if (cells.length >= 7) {
                                const currentPaymentCell = cells[6];
                                const currentText = currentPaymentCell ? currentPaymentCell.textContent : '';
                                
                                if (paymentStatus === 'paid' && currentText.includes('Unpaid')) {
                                    const paymentConfig = getPaymentStatusConfig('paid');
                                    currentPaymentCell.innerHTML = `<span class="payment-status-badge ${paymentConfig.class}">${paymentConfig.icon} ${paymentConfig.label}</span>`;
                                    
                                    if (booking.status === 'completed') {
                                        const statusConfig = getBookingStatusConfig('completed');
                                        cells[5].innerHTML = `<span class="booking-status-badge ${statusConfig.class}">${statusConfig.icon} ${statusConfig.label}</span>`;
                                    }
                                    
                                    updated++;
                                    showNotification(`💳 Booking #${id} has been paid!`, 'success');
                                }
                            }
                            break;
                        }
                    }
                }
            } catch (err) {}
        }
        
        if (updated) {
            const result = await API.bookings.getAll();
            if (result && result.bookings) updateBookingStats(result.bookings);
        }
    } catch (error) {
        console.error('Payment check error:', error);
    }
}

function startUltimatePolling() {
    if (window._ultimatePollInterval) clearInterval(window._ultimatePollInterval);
    window._ultimatePollInterval = setInterval(checkAllPaymentStatuses, 2000);
    console.log('✅ Ultimate payment polling started (every 2 seconds)');
}

document.addEventListener('click', function(e) {
    const target = e.target.closest('[data-section="bookings"]');
    if (target) setTimeout(checkAllPaymentStatuses, 1000);
});

setTimeout(startUltimatePolling, 3000);

// ========== EXPOSE FUNCTIONS GLOBALLY ==========
window.verifyCredentials = verifyCredentials;
window.verifyOTP = verifyOTP;
window.resendOTP = resendOTP;
window.backToLogin = backToLogin;
window.moveToNext = moveToNext;
window.validateOTP = validateOTP;
window.showDemoCredentials = showDemoCredentials;
window.initiateLogout = initiateLogout;
window.cancelLogout = cancelLogout;
window.confirmLogout = confirmLogout;
window.showSection = showSection;
window.addService = addService;
window.deleteService = deleteService;
window.openEditServiceModal = openEditServiceModal;
window.saveEditedService = saveEditedService;
window.addIncludedField = addIncludedField;
window.removeIncludedField = removeIncludedField;
window.clearServiceImage = clearServiceImage;
window.openImageUploadModal = openImageUploadModal;
window.handleModalImageSelect = handleModalImageSelect;
window.handleDragOver = handleDragOver;
window.handleDrop = handleDrop;
window.confirmImageUpload = confirmImageUpload;
window.loadBookings = loadBookings;
window.filterBookings = filterBookings;
window.filterBookingsByStatus = filterBookingsByStatus;
window.viewFullBooking = viewFullBooking;
window.openPriceEstimation = openPriceEstimation;
window.calculateEstimationTotal = calculateEstimationTotal;
window.saveEstimationAndGenerateInvoice = saveEstimationAndGenerateInvoice;
window.downloadCustomerInvoice = downloadCustomerInvoice;
window.openBookingStatusUpdate = openBookingStatusUpdate;
window.showNotificationWithCallback = showNotificationWithCallback;
window.togglePassword = togglePassword;
window.loadStaff = loadStaff;
window.addStaff = addStaff;
window.deleteStaff = deleteStaff;
window.openEditStaffModal = openEditStaffModal;
window.saveEditedStaff = saveEditedStaff;
window.clearStaffImage = clearStaffImage;
window.clearEditServiceImage = clearEditServiceImage;
window.loadContractors = loadContractors;
window.viewContractorDetails = viewContractorDetails;
window.generateInvoiceForContractor = generateInvoiceForContractor;
window.generateInvoiceForContractorById = generateInvoiceForContractorById;
window.filterContractors = filterContractors;
window.openEditContractorModal = openEditContractorModal;
window.saveEditedContractor = saveEditedContractor;
window.generateInvoice = generateInvoice;
window.loadInvoices = loadInvoices;
window.viewInvoice = viewInvoice;
window.downloadInvoice = downloadInvoice;
window.downloadInvoicePDF = downloadInvoicePDF;
window.openSendInvoiceModal = openSendInvoiceModal;
window.sendInvoiceToCustomer = sendInvoiceToCustomer;
window.loadAllMessages = loadAllMessages;
window.viewMessage = viewMessage;
window.openReplyModal = openReplyModal;
window.sendReply = sendReply;
window.replyToMessage = replyToMessage;
window.loadApplications = loadApplications;
window.toggleApplicationWindow = toggleApplicationWindow;
window.filterApplicationStatus = filterApplicationStatus;
window.filterApplications = filterApplications;
window.viewApplicationDetail = viewApplicationDetail;
window.openReviewApplicationModal = openReviewApplicationModal;
window.reviewApplicationFromModal = reviewApplicationFromModal;
window.confirmReviewApplication = confirmReviewApplication;
window.loadStaffIssues = loadStaffIssues;
window.filterStaffIssues = filterStaffIssues;
window.filterStaffIssuesByStatus = filterStaffIssuesByStatus;
window.viewStaffIssueDetail = viewStaffIssueDetail;
window.openUpdateIssueStatusModal = openUpdateIssueStatusModal;
window.confirmUpdateIssueStatus = confirmUpdateIssueStatus;
window.loadAssignmentSection = loadAssignmentSection;
window.switchAssignTab = switchAssignTab;
window.loadSettings = loadSettings;
window.saveSettings = saveSettings;
window.generateReport = generateReport;
window.downloadReport = downloadReport;
window.shareReportViaEmail = shareReportViaEmail;
window.openReportGenerator = openReportGenerator;
window.initCharts = initCharts;
window.updateNotificationBadge = updateNotificationBadge;
window.toggleNotificationPanel = toggleNotificationPanel;
window.clearAllNotifications = clearAllNotifications;
window.addToNotificationCenter = addToNotificationCenter;
window.forceRefreshBookings = forceRefreshBookings;
window.loadSupervisorsForDropdown = loadSupervisorsForDropdown;

// Supervisor Dashboard Functions
window.renderSupervisorDashboard = renderSupervisorDashboard;
window.confirmCustomerStart = confirmCustomerStart;
window.startJob = startJob;
window.confirmCustomerComplete = confirmCustomerComplete;
window.completeJob = completeJob;
window.viewJobLogs = viewJobLogs;
window.markNotificationRead = markNotificationRead;
window.openGlobalModal = openGlobalModal;

console.log('✅ Admin panel loaded successfully with Supervisor Dashboard and Supervisor Assignment!');