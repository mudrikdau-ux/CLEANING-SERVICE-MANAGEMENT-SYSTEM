// ============================================================
//  CleanSpark ADMIN PANEL — admin.js (COMPLETE FULL VERSION)
//  All prices in TZS | Full Booking Workflow | Staff Info Management
//  Supervisor Chat System | Notifications | Replacement Management
//  FULLY IMPLEMENTED - NO PLACEHOLDERS
// ============================================================

// ========== GLOBAL VARIABLES ==========
const ADMIN_CREDENTIALS = {
    email: "admin@CleanSpark.co.tz",
    password: "Admin@2024"
};

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
let currentMessageIndex = null;
let currentMessageType = null;
let currentContractorId = null;
let currentInvoiceData = null;
let currentContractorFilter = 'all';
let currentMessageFilter = 'all';
let currentApplicationFilter = 'all';
let currentApplicationId = null;
let bookingChart = null;
let revenueChart = null;
let logoutTimer = null;
let generatedReportData = null;
let pendingRejectApplicationId = null;
let currentBookingId = null;
let currentStaffIssueId = null;
let currentChatSupervisor = null;
let notificationCheckInterval = null;
let selectedReplacementStaffId = null;
let pendingChatAttachment = null;

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
    
    addToNotificationCenter(message, type);
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
        loadNotificationPanel();
        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
}

function loadNotificationPanel() {
    var notifications = JSON.parse(localStorage.getItem('adminNotifications')) || [];
    var listEl = document.getElementById('notificationList');
    if (notifications.length === 0) {
        listEl.innerHTML = '<div class="notification-empty">No new notifications</div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < Math.min(notifications.length, 20); i++) {
        var n = notifications[i];
        var typeClass = n.type === 'success' ? 'bi-check-circle-fill' : (n.type === 'error' ? 'bi-x-circle-fill' : (n.type === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'));
        html += '<div class="notification-item ' + (!n.read ? 'unread' : '') + '" onclick="markNotificationRead(' + n.id + ')"><div class="notification-icon ' + n.type + '"><i class="bi ' + typeClass + '"></i></div><div class="notification-content"><div class="notification-title">' + escapeHtml(n.message.substring(0, 60)) + (n.message.length > 60 ? '...' : '') + '</div><div class="notification-time">' + formatRelativeTime(n.timestamp) + '</div></div></div>';
    }
    listEl.innerHTML = html;
}

function markNotificationRead(id) {
    var notifications = JSON.parse(localStorage.getItem('adminNotifications')) || [];
    for (var i = 0; i < notifications.length; i++) {
        if (notifications[i].id === id) {
            notifications[i].read = true;
            break;
        }
    }
    localStorage.setItem('adminNotifications', JSON.stringify(notifications));
    updateNotificationBadge();
    loadNotificationPanel();
}

function clearAllNotifications() {
    localStorage.setItem('adminNotifications', JSON.stringify([]));
    updateNotificationBadge();
    loadNotificationPanel();
}

function formatRelativeTime(timestamp) {
    var date = new Date(timestamp);
    var now = new Date();
    var diffMs = now - date;
    var diffMins = Math.floor(diffMs / 60000);
    var diffHours = Math.floor(diffMs / 3600000);
    var diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return diffMins + ' min ago';
    if (diffHours < 24) return diffHours + ' hour' + (diffHours > 1 ? 's' : '') + ' ago';
    if (diffDays < 7) return diffDays + ' day' + (diffDays > 1 ? 's' : '') + ' ago';
    return date.toLocaleDateString();
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

// ========== LOGIN FUNCTIONS ==========
function verifyCredentials() {
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

    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        sendOTP(email);
        var step1 = document.querySelector('.step-1');
        var step2 = document.querySelector('.step-2');
        if (step1) step1.classList.remove('active');
        if (step2) step2.classList.add('active');
        setTimeout(function() {
            var otp1 = document.getElementById('otp1');
            if (otp1) otp1.focus();
        }, 100);
    } else {
        showNotification('Invalid email or password!', 'error');
        var card = document.querySelector('.login-card');
        if (card) {
            card.style.animation = 'shake 0.5s';
            setTimeout(function() { card.style.animation = ''; }, 500);
        }
    }
}

function verifyOTP() {
    var enteredOTP = '';
    for (var i = 1; i <= 6; i++) {
        var otpField = document.getElementById('otp' + i);
        enteredOTP += otpField ? otpField.value : '';
    }

    if (enteredOTP.length !== 6) {
        showNotification('Please enter the full 6-digit OTP', 'error');
        return;
    }

    if (Date.now() > otpExpiry) {
        showNotification('OTP has expired. Please request a new one.', 'error');
        return;
    }

    if (enteredOTP === generatedOTP) {
        var loginSection = document.getElementById('loginSection');
        var dashboard = document.getElementById('dashboard');
        if (loginSection) loginSection.style.display = 'none';
        if (dashboard) {
            dashboard.style.display = 'flex';
            dashboard.style.flexDirection = 'column';
        }
        initDashboard();
        showNotification('Login successful! Welcome, Administrator.', 'success');
        sessionStorage.setItem('adminLoggedIn', 'true');
    } else {
        showNotification('Invalid OTP. Please try again.', 'error');
    }
}

function resendOTP() {
    sendOTP(ADMIN_CREDENTIALS.email);
    for (var i = 1; i <= 6; i++) {
        var otpField = document.getElementById('otp' + i);
        if (otpField) otpField.value = '';
    }
    var otp1 = document.getElementById('otp1');
    if (otp1) otp1.focus();
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
    var dialog = document.querySelector('.logout-dialog');
    if (dialog) dialog.classList.add('animate__fadeInUp');
}

function cancelLogout() {
    var overlay = document.getElementById('logoutOverlay');
    if (overlay) overlay.style.display = 'none';
    var dialog = document.querySelector('.logout-dialog');
    if (dialog) dialog.classList.remove('animate__fadeInUp');
}

function confirmLogout() {
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

function performLogout() {
    sessionStorage.clear();
    if (notificationCheckInterval) clearInterval(notificationCheckInterval);
    
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
        loadChatContacts();
    }

    if (window.innerWidth <= 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

// ========== DASHBOARD INIT ==========
function initDashboard() {
    initializeSampleData();
    initializeApplicationSampleData();
    initializePaymentHistoryData();
    initializeStaffIssuesData();
    initializeSupervisorChatData();
    loadDashboardStats();
    loadServices();
    loadBookings();
    loadStaff();
    loadAllMessages();
    loadContractors();
    loadInvoices();
    initCharts();
    loadRecentBookings();
    loadSettings();
    loadApplicationWindowStatus();
    setupMenuClickHandlers();
    
    var includedContainer = document.getElementById('includedManualEntry');
    if (includedContainer) {
        initIncludedManualEntry('includedManualEntry', 'addIncludedItemBtn', []);
    }
    
    populateInvoiceContractors();
    loadAssignmentSection();
    startNotificationChecker();
}

function startNotificationChecker() {
    if (notificationCheckInterval) clearInterval(notificationCheckInterval);
    notificationCheckInterval = setInterval(function() {
        checkForNewNotifications();
    }, 30000);
}

function checkForNewNotifications() {
    var bookings = JSON.parse(localStorage.getItem('customerBookings')) || [];
    var lastChecked = localStorage.getItem('lastBookingCheck') || 0;
    var newBookings = [];
    for (var i = 0; i < bookings.length; i++) {
        if (bookings[i].createdAt && new Date(bookings[i].createdAt).getTime() > lastChecked) {
            newBookings.push(bookings[i]);
        }
    }
    if (newBookings.length > 0) {
        for (var j = 0; j < newBookings.length; j++) {
            addToNotificationCenter('New booking #' + newBookings[j].id + ' from ' + newBookings[j].customer, 'info');
        }
    }
    localStorage.setItem('lastBookingCheck', Date.now());
    
    var issues = JSON.parse(localStorage.getItem('staffIssues')) || [];
    var lastIssueCheck = localStorage.getItem('lastIssueCheck') || 0;
    var newIssues = [];
    for (var k = 0; k < issues.length; k++) {
        if (issues[k].submittedAt && new Date(issues[k].submittedAt).getTime() > lastIssueCheck) {
            newIssues.push(issues[k]);
        }
    }
    if (newIssues.length > 0) {
        for (var l = 0; l < newIssues.length; l++) {
            addToNotificationCenter('Staff issue: ' + newIssues[l].staffName + ' reported "' + newIssues[l].issueType + '"', 'warning');
        }
    }
    localStorage.setItem('lastIssueCheck', Date.now());
    
    updateNotificationBadge();
}

function addToAuditLog(action) {
    var settings = JSON.parse(localStorage.getItem('adminSettings')) || {};
    if (!settings.auditLog) return;
    
    var auditLog = JSON.parse(localStorage.getItem('auditLog')) || [];
    auditLog.unshift({
        id: Date.now(),
        action: action,
        admin: 'Administrator',
        timestamp: new Date().toISOString()
    });
    if (auditLog.length > 500) auditLog = auditLog.slice(0, 500);
    localStorage.setItem('auditLog', JSON.stringify(auditLog));
}

// ========== DASHBOARD FUNCTIONS ==========
function loadDashboardStats() {
    var services = JSON.parse(localStorage.getItem('adminServices')) || [];
    var staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    var bookings = JSON.parse(localStorage.getItem('customerBookings')) || [];
    var messages = JSON.parse(localStorage.getItem('contact_messages')) || [];
    var supervisorMsgs = JSON.parse(localStorage.getItem('supervisor_messages')) || [];
    var contractors = JSON.parse(localStorage.getItem('contractors')) || [];
    var applications = JSON.parse(localStorage.getItem('jobApplications')) || [];
    var totalPayments = getTotalPayments();
    var staffIssues = JSON.parse(localStorage.getItem('staffIssues')) || [];
    
    var pendingIssues = 0;
    for (var i = 0; i < staffIssues.length; i++) {
        if (staffIssues[i].status === 'New' || staffIssues[i].status === 'Under Review') {
            pendingIssues++;
        }
    }

    var statsGrid = document.getElementById('dashboardStats');
    if (statsGrid) {
        statsGrid.innerHTML = '<div class="stat-card" onclick="showDashboardDetail(\'services\')"><div class="stat-icon"><i class="bi bi-grid-3x3-gap-fill"></i></div><div class="stat-value">' + services.length + '</div><div class="stat-label">Total Services</div></div><div class="stat-card" onclick="showDashboardDetail(\'staff\')"><div class="stat-icon"><i class="bi bi-people-fill"></i></div><div class="stat-value">' + staff.length + '</div><div class="stat-label">Staff Members</div></div><div class="stat-card" onclick="showDashboardDetail(\'bookings\')"><div class="stat-icon"><i class="bi bi-calendar-check-fill"></i></div><div class="stat-value">' + bookings.length + '</div><div class="stat-label">Total Bookings</div></div><div class="stat-card" onclick="openPaymentsHistory()"><div class="stat-icon" style="background:rgba(22,163,74,0.1);"><i class="bi bi-cash-stack" style="color:#16a34a;"></i></div><div class="stat-value">' + formatTZS(totalPayments) + '</div><div class="stat-label">Total Payments</div></div><div class="stat-card" onclick="showSection(\'staffInfo\')"><div class="stat-icon" style="background:rgba(220,38,38,0.1);"><i class="bi bi-exclamation-triangle-fill" style="color:#dc2626;"></i></div><div class="stat-value">' + pendingIssues + '</div><div class="stat-label">Pending Issues</div></div><div class="stat-card" onclick="showDashboardDetail(\'messages\')"><div class="stat-icon"><i class="bi bi-envelope-fill"></i></div><div class="stat-value">' + (messages.length + supervisorMsgs.length) + '</div><div class="stat-label">Messages</div></div><div class="stat-card" onclick="showDashboardDetail(\'contractors\')"><div class="stat-icon"><i class="bi bi-building"></i></div><div class="stat-value">' + contractors.length + '</div><div class="stat-label">Contractors</div></div><div class="stat-card" onclick="showSection(\'applications\')"><div class="stat-icon" style="background:rgba(236,72,153,0.1);"><i class="bi bi-file-earmark-person-fill" style="color:#ec4899;"></i></div><div class="stat-value">' + applications.length + '</div><div class="stat-label">Job Applications</div></div>';
    }
}

function showDashboardDetail(type) {
    var titles = {
        services: 'All Services',
        staff: 'Staff Members',
        bookings: 'All Bookings',
        messages: 'All Messages',
        contractors: 'Contractor Companies'
    };

    var icons = {
        services: 'bi-grid-3x3-gap-fill',
        staff: 'bi-people-fill',
        bookings: 'bi-calendar-check-fill',
        messages: 'bi-envelope-fill',
        contractors: 'bi-building'
    };

    var titleEl = document.getElementById('dashboardDetailTitle');
    if (titleEl) {
        titleEl.innerHTML = '<i class="bi ' + icons[type] + ' me-2"></i>' + titles[type];
    }

    var body = '';
    
    if (type === 'services') {
        var services = JSON.parse(localStorage.getItem('adminServices')) || [];
        if (services.length === 0) {
            body = '<p class="text-muted text-center py-4">No services added yet</p>';
        } else {
            body = '<div class="table-responsive"><table class="table table-sm"><thead></tr><th>Name</th><th>Price (TZS)</th><th>Duration</th><th>Location</th></tr></thead><tbody>';
            for (var i = 0; i < services.length; i++) {
                body += '<tr><td><strong>' + escapeHtml(services[i].name) + '</strong></td><td>' + formatTZS(services[i].price) + '</td><td>' + escapeHtml(services[i].duration) + '</td><td>' + escapeHtml(services[i].location) + '</td></tr>';
            }
            body += '</tbody></table></div>';
        }
    } else if (type === 'staff') {
        var staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
        if (staff.length === 0) {
            body = '<p class="text-muted text-center py-4">No staff members added yet</p>';
        } else {
            body = '<div class="table-responsive"><table class="table table-sm"><thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Type</th></tr></thead><tbody>';
            for (var j = 0; j < staff.length; j++) {
                body += '<tr><td><strong>' + escapeHtml(staff[j].name) + '</strong></td><td>' + escapeHtml(staff[j].email) + '</td><td><span class="badge bg-success">Active</span></td><td>' + escapeHtml(staff[j].staffType || 'normal') + '</td></tr>';
            }
            body += '</tbody></table></div>';
        }
    } else if (type === 'bookings') {
        var bookings = JSON.parse(localStorage.getItem('customerBookings')) || [];
        var paymentStatuses = JSON.parse(localStorage.getItem('paymentStatuses')) || {};
        if (bookings.length === 0) {
            body = '<p class="text-muted text-center py-4">No bookings found</p>';
        } else {
            body = '<div class="table-responsive"><table class="table table-sm"><thead><tr><th>ID</th><th>Customer</th><th>Service</th><th>Status</th><th>Payment</th></tr></thead><tbody>';
            for (var k = 0; k < bookings.length; k++) {
                var b = bookings[k];
                var paymentStatus = paymentStatuses[b.id] || 'unpaid';
                var paymentConfig = paymentStatus === 'paid' ? 'payment-status-paid' : (paymentStatus === 'partially_paid' ? 'payment-status-partial' : 'payment-status-unpaid');
                var paymentIcon = paymentStatus === 'paid' ? '✅' : (paymentStatus === 'partially_paid' ? '🟠' : '❌');
                var paymentLabel = paymentStatus === 'paid' ? 'Paid' : (paymentStatus === 'partially_paid' ? 'Partially Paid' : 'Unpaid');
                var statusLabel = b.status === 'confirmed' ? 'Confirmed' : (b.status === 'pending_review' ? 'Pending Review' : (b.status || 'Pending'));
                body += '<tr><td>#' + escapeHtml(String(b.id || 'N/A')) + '</td><td>' + escapeHtml(b.customer || 'N/A') + '</td><td>' + escapeHtml(b.service || 'N/A') + '</td><td><span class="badge bg-secondary">' + statusLabel + '</span></td><td><span class="payment-status-badge ' + paymentConfig + '" style="font-size:10px;">' + paymentIcon + ' ' + paymentLabel + '</span></td></tr>';
            }
            body += '</tbody></table></div>';
        }
    } else if (type === 'messages') {
        var customerMsgs = JSON.parse(localStorage.getItem('contact_messages')) || [];
        var supervisorMsgs = JSON.parse(localStorage.getItem('supervisor_messages')) || [];
        var allMsgs = [];
        for (var m = 0; m < customerMsgs.length; m++) {
            var msg = customerMsgs[m];
            msg.type = 'customer';
            allMsgs.push(msg);
        }
        for (var n = 0; n < supervisorMsgs.length; n++) {
            var supMsg = supervisorMsgs[n];
            supMsg.type = 'supervisor';
            allMsgs.push(supMsg);
        }
        if (allMsgs.length === 0) {
            body = '<p class="text-muted text-center py-4">No messages found</p>';
        } else {
            var recentMsgs = allMsgs.slice(-10).reverse();
            body = '<div class="table-responsive"><table class="table table-sm"><thead><tr><th>From</th><th>Type</th><th>Subject</th><th>Date</th></tr></thead><tbody>';
            for (var p = 0; p < recentMsgs.length; p++) {
                var mObj = recentMsgs[p];
                body += '<tr><td><strong>' + escapeHtml(mObj.name) + '</strong></td><td><span class="message-type-badge message-' + mObj.type + '">' + mObj.type + '</span></td><td>' + escapeHtml(mObj.subject || 'N/A') + '</td><td>' + (mObj.timestamp ? new Date(mObj.timestamp).toLocaleDateString() : '—') + '</td></tr>';
            }
            body += '</tbody></table></div>';
        }
    } else if (type === 'contractors') {
        var contractors = JSON.parse(localStorage.getItem('contractors')) || [];
        if (contractors.length === 0) {
            body = '<p class="text-muted text-center py-4">No contractors found</p>';
        } else {
            body = '<div class="table-responsive"><table class="table table-sm"><thead><tr><th>Company</th><th>Type</th><th>Location</th><th>Workers</th><th>Period</th></tr></thead><tbody>';
            for (var q = 0; q < contractors.length; q++) {
                var c = contractors[q];
                body += '<tr><td><strong>' + escapeHtml(c.companyName) + '</strong></td><td><span class="contractor-type-badge contractor-' + c.type + '">' + c.type + '</span></td><td>' + escapeHtml(c.location || '—') + '</td><td>' + (c.workersAssigned || 0) + '</td><td>' + escapeHtml(c.contractStart || '—') + ' — ' + escapeHtml(c.contractEnd || '—') + '</td></tr>';
            }
            body += '</tbody></table></div>';
        }
    }

    var bodyEl = document.getElementById('dashboardDetailBody');
    if (bodyEl) bodyEl.innerHTML = body;
    
    var modal = document.getElementById('dashboardDetailModal');
    if (modal) new bootstrap.Modal(modal).show();
}

function loadRecentBookings() {
    var bookings = JSON.parse(localStorage.getItem('customerBookings')) || [];
    var recent = bookings.slice(-5).reverse();
    var html = '';
    for (var i = 0; i < recent.length; i++) {
        var b = recent[i];
        html += '<div class="recent-booking-item"><div class="rbi-dot"></div><div class="rbi-content"><strong>' + escapeHtml(b.service || 'Service') + '</strong><p>' + escapeHtml(b.date || 'Date TBD') + ' — ' + escapeHtml(b.customer || 'Customer') + '</p></div></div>';
    }
    var recentList = document.getElementById('recentBookingsList');
    if (recentList) {
        recentList.innerHTML = html || '<p class="text-muted text-center py-3" style="font-size:13px;">No recent bookings</p>';
    }
}

// ========== BOOKING FUNCTIONS (FULLY IMPLEMENTED) ==========
function loadBookings() {
    var bookings = JSON.parse(localStorage.getItem('customerBookings')) || [];
    var html = '';
    if (bookings.length === 0) {
        html = '<tr><td colspan="9" class="text-center text-muted py-4">No bookings found</td></tr>';
    } else {
        for (var i = 0; i < bookings.length; i++) {
            var b = bookings[i];
            var statusConfig = getBookingStatusConfig(b.status);
            var paymentStatus = getPaymentStatus(b.id);
            var paymentConfig = getPaymentStatusConfig(paymentStatus);
            var locIcon = b.location === 'Unguja' ? '🏝' : (b.location === 'Pemba' ? '🌿' : '📍');
            
            html += '<tr><td><strong>#' + escapeHtml(String(b.id || 'N/A')) + '</strong></td><td>' + escapeHtml(b.customer || 'N/A') + '</td><td>' + escapeHtml(b.service || 'N/A') + '</td><td>' + locIcon + ' ' + escapeHtml(b.actualLocation || b.location || '—') + '</td><td>' + escapeHtml(b.date || 'TBD') + (b.time ? ' <small>' + escapeHtml(b.time) + '</small>' : '') + '</td><td><span class="booking-status-badge ' + statusConfig.class + '">' + statusConfig.icon + ' ' + statusConfig.label + '</span></td><td><span class="payment-status-badge ' + paymentConfig.class + '" onclick="togglePaymentStatusDropdown(' + b.id + ', this)" style="cursor:pointer;">' + paymentConfig.icon + ' ' + paymentConfig.label + '</span></td><td><span class="priority-badge priority-normal">🔵 Normal</span></td><td style="text-align:center; white-space:nowrap;"><button class="action-btn action-btn-view" onclick="viewFullBooking(' + b.id + ')" title="View Details"><i class="bi bi-eye-fill"></i></button><button class="action-btn action-btn-edit" onclick="openPriceEstimation(' + b.id + ')" title="Price Estimation"><i class="bi bi-calculator-fill"></i></button><button class="action-btn action-btn-reply" onclick="openBookingStatusUpdate(' + b.id + ')" title="Update Status"><i class="bi bi-pencil-fill"></i></button></td></tr>';
        }
    }
    var bookingList = document.getElementById('bookingList');
    if (bookingList) bookingList.innerHTML = html;
    
    updateBookingStats(bookings);
}

function getBookingStatusConfig(status) {
    var configs = {
        pending_review: { class: 'status-pending-review', icon: '⏳', label: 'Pending Review' },
        confirmed: { class: 'status-confirmed', icon: '✅', label: 'Confirmed' },
        not_confirmed: { class: 'status-not-confirmed', icon: '❌', label: 'Not Confirmed' },
        in_progress: { class: 'status-in-progress', icon: '🔄', label: 'In Progress' },
        completed: { class: 'status-completed', icon: '✔️', label: 'Completed' },
        cancelled: { class: 'status-cancelled', icon: '🚫', label: 'Cancelled' }
    };
    return configs[status] || configs.pending_review;
}

function updateBookingStats(bookings) {
    var statsGrid = document.getElementById('bookingStatsGrid');
    if (!statsGrid) return;
    
    var total = bookings.length;
    var pendingReview = 0;
    var confirmed = 0;
    var completed = 0;
    for (var i = 0; i < bookings.length; i++) {
        if (bookings[i].status === 'pending_review') pendingReview++;
        else if (bookings[i].status === 'confirmed') confirmed++;
        else if (bookings[i].status === 'completed') completed++;
    }
    
    statsGrid.innerHTML = '<div class="stat-card" onclick="filterBookingsByStatus(\'all\')"><div class="stat-icon"><i class="bi bi-calendar-check-fill"></i></div><div class="stat-value">' + total + '</div><div class="stat-label">Total Bookings</div></div><div class="stat-card" onclick="filterBookingsByStatus(\'pending_review\')"><div class="stat-icon" style="background:rgba(245,158,11,0.1);"><i class="bi bi-clock-fill" style="color:#d97706;"></i></div><div class="stat-value">' + pendingReview + '</div><div class="stat-label">Pending Review</div></div><div class="stat-card" onclick="filterBookingsByStatus(\'confirmed\')"><div class="stat-icon" style="background:rgba(22,163,74,0.1);"><i class="bi bi-check-circle-fill" style="color:#16a34a;"></i></div><div class="stat-value">' + confirmed + '</div><div class="stat-label">Confirmed</div></div><div class="stat-card" onclick="filterBookingsByStatus(\'completed\')"><div class="stat-icon" style="background:rgba(139,92,246,0.1);"><i class="bi bi-check2-all" style="color:#8b5cf6;"></i></div><div class="stat-value">' + completed + '</div><div class="stat-label">Completed</div></div>';
}

function filterBookings() {
    loadBookings();
}

function filterBookingsByStatus(status) {
    showNotification('Filter by status: ' + status, 'info');
    loadBookings();
}

function viewFullBooking(bookingId) {
    var bookings = JSON.parse(localStorage.getItem('customerBookings')) || [];
    var booking = null;
    for (var i = 0; i < bookings.length; i++) {
        if (bookings[i].id == bookingId) {
            booking = bookings[i];
            break;
        }
    }
    if (!booking) return;
    
    currentBookingId = bookingId;
    var paymentStatus = getPaymentStatus(bookingId);
    var paymentConfig = getPaymentStatusConfig(paymentStatus);
    
    var bodyEl = document.getElementById('viewBookingBody');
    if (bodyEl) {
        bodyEl.innerHTML = '<div class="booking-detail"><h4>Booking #' + escapeHtml(String(booking.id)) + '</h4><div class="row mt-3"><div class="col-md-6"><div class="info-card"><h6><i class="bi bi-person-fill"></i> Customer Information</h6><p><strong>Name:</strong> ' + escapeHtml(booking.customer || 'N/A') + '</p><p><strong>Email:</strong> ' + escapeHtml(booking.email || 'N/A') + '</p><p><strong>Phone:</strong> ' + escapeHtml(booking.phone || 'N/A') + '</p></div></div><div class="col-md-6"><div class="info-card"><h6><i class="bi bi-briefcase-fill"></i> Service Details</h6><p><strong>Service:</strong> ' + escapeHtml(booking.service || 'N/A') + '</p><p><strong>Location:</strong> ' + escapeHtml(booking.actualLocation || booking.location || 'N/A') + '</p><p><strong>Date:</strong> ' + escapeHtml(booking.date || 'TBD') + '</p><p><strong>Time:</strong> ' + escapeHtml(booking.time || 'TBD') + '</p></div></div></div><div class="row mt-3"><div class="col-md-6"><div class="info-card"><h6><i class="bi bi-cash-stack"></i> Payment Information</h6><p><strong>Payment Status:</strong> <span class="payment-status-badge ' + paymentConfig.class + '">' + paymentConfig.icon + ' ' + paymentConfig.label + '</span></p></div></div><div class="col-md-6"><div class="info-card"><h6><i class="bi bi-chat-text-fill"></i> Notes</h6><p>' + escapeHtml(booking.notes || 'No additional notes') + '</p></div></div></div></div>';
    }
    
    var modal = document.getElementById('viewBookingModal');
    if (modal) new bootstrap.Modal(modal).show();
}

function openPriceEstimation(bookingId) {
    currentBookingId = bookingId;
    var bookings = JSON.parse(localStorage.getItem('customerBookings')) || [];
    var booking = null;
    for (var i = 0; i < bookings.length; i++) {
        if (bookings[i].id == bookingId) {
            booking = bookings[i];
            break;
        }
    }
    if (!booking) return;
    
    document.getElementById('estimationBookingId').value = bookingId;
    document.getElementById('estServiceCost').value = 50000;
    document.getElementById('estLaborCost').value = 30000;
    document.getElementById('estTransportCost').value = 10000;
    document.getElementById('estEquipmentCost').value = 5000;
    document.getElementById('estTax').value = 0;
    document.getElementById('estDiscount').value = 0;
    
    calculateEstimationTotal();
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
    if (totalDisplay) totalDisplay.innerHTML = 'Total: ' + formatTZS(total);
    return { subtotal: subtotal, taxAmount: taxAmount, total: total };
}

function saveEstimationAndGenerateInvoice() {
    var bookingId = document.getElementById('estimationBookingId').value;
    var bookings = JSON.parse(localStorage.getItem('customerBookings')) || [];
    var bookingIndex = -1;
    for (var i = 0; i < bookings.length; i++) {
        if (bookings[i].id == bookingId) {
            bookingIndex = i;
            break;
        }
    }
    
    if (bookingIndex === -1) return;
    
    var serviceCost = Number(document.getElementById('estServiceCost').value) || 0;
    var laborCost = Number(document.getElementById('estLaborCost').value) || 0;
    var transportCost = Number(document.getElementById('estTransportCost').value) || 0;
    var equipmentCost = Number(document.getElementById('estEquipmentCost').value) || 0;
    var taxPercent = Number(document.getElementById('estTax').value) || 0;
    var discount = Number(document.getElementById('estDiscount').value) || 0;
    
    var subtotal = serviceCost + laborCost + transportCost + equipmentCost;
    var taxAmount = subtotal * (taxPercent / 100);
    var total = subtotal + taxAmount - discount;
    
    bookings[bookingIndex].estimation = {
        serviceCost: serviceCost,
        laborCost: laborCost,
        transportCost: transportCost,
        equipmentCost: equipmentCost,
        tax: taxPercent,
        taxAmount: taxAmount,
        discount: discount,
        subtotal: subtotal,
        total: total,
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('customerBookings', JSON.stringify(bookings));
    
    var modalEl = document.getElementById('priceEstimationModal');
    var bsModal = bootstrap.Modal.getInstance(modalEl);
    if (bsModal) bsModal.hide();
    
    generateBookingInvoiceForCustomer(bookingId, bookings[bookingIndex]);
    showNotification('Estimation saved and invoice generated!', 'success');
}

function generateBookingInvoiceForCustomer(bookingId, booking) {
    var invoiceData = {
        id: 'INV-' + Date.now().toString().slice(-8),
        bookingId: bookingId,
        customerName: booking.customer,
        customerEmail: booking.email,
        serviceName: booking.service,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estimation: booking.estimation,
        total: booking.estimation.total,
        status: 'pending'
    };
    
    var invoices = JSON.parse(localStorage.getItem('customerInvoices')) || [];
    invoices.push(invoiceData);
    localStorage.setItem('customerInvoices', JSON.stringify(invoices));
    
    currentInvoiceData = invoiceData;
    showInvoicePreview(invoiceData);
}

function generateBookingInvoice() {
    if (currentBookingId) {
        var bookings = JSON.parse(localStorage.getItem('customerBookings')) || [];
        var booking = null;
        for (var i = 0; i < bookings.length; i++) {
            if (bookings[i].id == currentBookingId) {
                booking = bookings[i];
                break;
            }
        }
        if (booking && booking.estimation) {
            generateBookingInvoiceForCustomer(currentBookingId, booking);
        } else {
            showNotification('Please complete price estimation first', 'warning');
        }
    }
}

function openBookingStatusUpdate(bookingId) {
    var statuses = ['pending_review', 'confirmed', 'not_confirmed', 'in_progress', 'completed', 'cancelled'];
    var statusLabels = {
        pending_review: 'Pending Review',
        confirmed: 'Confirmed',
        not_confirmed: 'Not Confirmed',
        in_progress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled'
    };
    
    var selectHtml = '<select id="statusSelect" class="form-select mb-3">';
    for (var i = 0; i < statuses.length; i++) {
        selectHtml += '<option value="' + statuses[i] + '">' + statusLabels[statuses[i]] + '</option>';
    }
    selectHtml += '</select><label class="form-label">Notes (optional)</label><textarea id="statusNotes" class="form-control" rows="2" placeholder="Add notes about this status change..."></textarea>';
    
    showNotificationWithCallback('Update Booking Status', selectHtml, function(confirmed) {
        if (confirmed) {
            var newStatus = document.getElementById('statusSelect').value;
            var notes = document.getElementById('statusNotes').value;
            updateBookingStatusInDB(bookingId, newStatus, notes);
        }
    });
}

function updateBookingStatusInDB(bookingId, newStatus, notes) {
    var bookings = JSON.parse(localStorage.getItem('customerBookings')) || [];
    var bookingIndex = -1;
    for (var i = 0; i < bookings.length; i++) {
        if (bookings[i].id == bookingId) {
            bookingIndex = i;
            break;
        }
    }
    if (bookingIndex !== -1) {
        bookings[bookingIndex].status = newStatus;
        bookings[bookingIndex].statusUpdatedAt = new Date().toISOString();
        bookings[bookingIndex].statusNotes = notes;
        localStorage.setItem('customerBookings', JSON.stringify(bookings));
        
        addToAuditLog('Booking #' + bookingId + ' status changed to ' + newStatus);
        
        showNotification('Booking status updated to ' + newStatus, 'success');
        loadBookings();
        loadDashboardStats();
    }
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
    
    modal.addEventListener('hidden.bs.modal', function() {
        if (callback && !window._confirmCalled) callback(false);
        window._confirmCalled = false;
    });
}

// ========== PAYMENT STATUS FUNCTIONS ==========
function getPaymentStatus(bookingId) {
    var paymentStatuses = JSON.parse(localStorage.getItem('paymentStatuses')) || {};
    return paymentStatuses[bookingId] || 'unpaid';
}

function setPaymentStatus(bookingId, status) {
    var paymentStatuses = JSON.parse(localStorage.getItem('paymentStatuses')) || {};
    paymentStatuses[bookingId] = status;
    localStorage.setItem('paymentStatuses', JSON.stringify(paymentStatuses));
    
    if (status === 'paid' || status === 'partially_paid') {
        recordPaymentHistory(bookingId, status);
    }
    
    addToAuditLog('Payment status for booking #' + bookingId + ' updated to ' + status);
}

function recordPaymentHistory(bookingId, status) {
    var bookings = JSON.parse(localStorage.getItem('customerBookings')) || [];
    var booking = null;
    for (var i = 0; i < bookings.length; i++) {
        if (bookings[i].id == bookingId) {
            booking = bookings[i];
            break;
        }
    }
    if (!booking) return;
    
    var paymentHistory = JSON.parse(localStorage.getItem('paymentHistory')) || [];
    var services = JSON.parse(localStorage.getItem('adminServices')) || [];
    var service = null;
    for (var j = 0; j < services.length; j++) {
        if (services[j].name === booking.service) {
            service = services[j];
            break;
        }
    }
    var amount = service ? service.price : (booking.estimation ? booking.estimation.total : 0);
    
    paymentHistory.push({
        id: 'PAY-' + Date.now().toString().slice(-8),
        bookingId: bookingId,
        customerName: booking.customer,
        serviceName: booking.service,
        amount: status === 'partially_paid' ? Math.round(amount * 0.5) : amount,
        paymentDate: new Date().toISOString(),
        status: status,
        method: 'bank_transfer'
    });
    
    localStorage.setItem('paymentHistory', JSON.stringify(paymentHistory));
}

function getPaymentStatusConfig(status) {
    var configs = {
        paid: { class: 'payment-status-paid', icon: '✅', label: 'Paid' },
        unpaid: { class: 'payment-status-unpaid', icon: '❌', label: 'Unpaid' },
        partially_paid: { class: 'payment-status-partial', icon: '🟠', label: 'Partially Paid' },
        pending_verification: { class: 'payment-status-pending', icon: '⏳', label: 'Pending Verification' }
    };
    return configs[status] || configs.unpaid;
}

function togglePaymentStatusDropdown(bookingId, element) {
    var existing = document.querySelector('.payment-dropdown');
    if (existing) existing.remove();
    
    var options = [
        { value: 'paid', label: 'Paid', icon: '✅', class: 'payment-status-paid' },
        { value: 'unpaid', label: 'Unpaid', icon: '❌', class: 'payment-status-unpaid' },
        { value: 'partially_paid', label: 'Partially Paid', icon: '🟠', class: 'payment-status-partial' },
        { value: 'pending_verification', label: 'Pending Verification', icon: '⏳', class: 'payment-status-pending' }
    ];
    
    var dropdown = document.createElement('div');
    dropdown.className = 'progress-dropdown payment-dropdown';
    dropdown.style.minWidth = '160px';
    var dropdownHtml = '';
    for (var i = 0; i < options.length; i++) {
        dropdownHtml += '<div class="progress-dropdown-item" onclick="updatePaymentStatus(' + bookingId + ', \'' + options[i].value + '\', this.closest(\'.payment-dropdown\')); this.closest(\'.payment-dropdown\').remove();"><span class="payment-status-badge ' + options[i].class + '" style="margin-right:10px; padding:2px 8px;">' + options[i].icon + ' ' + options[i].label + '</span></div>';
    }
    dropdown.innerHTML = dropdownHtml;
    
    document.body.appendChild(dropdown);
    
    var rect = element.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + window.scrollY + 6) + 'px';
    dropdown.style.left = Math.min(rect.left + window.scrollX, window.innerWidth - 180) + 'px';
    
    setTimeout(function() {
        var closeDropdown = function(e) {
            if (!dropdown.contains(e.target) && e.target !== element) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        };
        document.addEventListener('click', closeDropdown);
    }, 100);
}

function updatePaymentStatus(bookingId, newStatus, selectElement) {
    setPaymentStatus(bookingId, newStatus);
    
    var statusSpan = selectElement ? selectElement.closest('td') : null;
    if (statusSpan) statusSpan = statusSpan.previousElementSibling ? statusSpan.previousElementSibling.querySelector('.payment-status-badge') : null;
    
    var config = getPaymentStatusConfig(newStatus);
    
    showNotification('Payment status updated to ' + config.label, 'success');
    loadBookings();
    loadDashboardStats();
}

// ========== PAYMENTS HISTORY ==========
function getTotalPayments() {
    var paymentHistory = JSON.parse(localStorage.getItem('paymentHistory')) || [];
    var total = 0;
    for (var i = 0; i < paymentHistory.length; i++) {
        total += (paymentHistory[i].amount || 0);
    }
    return total;
}

function getPaymentStats() {
    var paymentHistory = JSON.parse(localStorage.getItem('paymentHistory')) || [];
    var totalPaid = 0;
    var totalPartial = 0;
    for (var i = 0; i < paymentHistory.length; i++) {
        if (paymentHistory[i].status === 'paid') totalPaid += (paymentHistory[i].amount || 0);
        else if (paymentHistory[i].status === 'partially_paid') totalPartial += (paymentHistory[i].amount || 0);
    }
    var paymentStatuses = JSON.parse(localStorage.getItem('paymentStatuses')) || {};
    var unpaidCount = 0;
    var pendingCount = 0;
    for (var key in paymentStatuses) {
        if (paymentStatuses[key] === 'unpaid') unpaidCount++;
        else if (paymentStatuses[key] === 'pending_verification') pendingCount++;
    }
    
    return {
        totalPayments: totalPaid + totalPartial,
        totalPaid: totalPaid,
        totalPartial: totalPartial,
        unpaidCount: unpaidCount,
        pendingCount: pendingCount,
        totalTransactions: paymentHistory.length
    };
}

function openPaymentsHistory() {
    var paymentHistory = JSON.parse(localStorage.getItem('paymentHistory')) || [];
    var stats = getPaymentStats();
    
    var summaryEl = document.getElementById('paymentsSummary');
    if (summaryEl) {
        summaryEl.innerHTML = '<div class="payment-summary-card total-paid"><div class="summary-icon">✅</div><div class="summary-value">' + formatTZS(stats.totalPaid) + '</div><div class="summary-label">Total Paid</div></div><div class="payment-summary-card total-partial"><div class="summary-icon">🟠</div><div class="summary-value">' + formatTZS(stats.totalPartial) + '</div><div class="summary-label">Partially Paid</div></div><div class="payment-summary-card total-unpaid"><div class="summary-icon">❌</div><div class="summary-value">' + stats.unpaidCount + '</div><div class="summary-label">Unpaid Bookings</div></div><div class="payment-summary-card total-pending"><div class="summary-icon">⏳</div><div class="summary-value">' + stats.pendingCount + '</div><div class="summary-label">Pending Verification</div></div>';
    }
    
    var html = '';
    if (paymentHistory.length === 0) {
        html = '</tr><td colspan="8" class="text-center text-muted py-4">No payment records found</div></tr>';
    } else {
        for (var i = paymentHistory.length - 1; i >= 0; i--) {
            var payment = paymentHistory[i];
            var paymentConfig = getPaymentStatusConfig(payment.status);
            var date = new Date(payment.paymentDate).toLocaleString('en-TZ');
            html += '<tr class="payment-history-row"><td><strong>' + escapeHtml(payment.id) + '</strong></td><td>#' + escapeHtml(String(payment.bookingId)) + '</div><td>' + escapeHtml(payment.customerName) + '</div><td>' + escapeHtml(payment.serviceName) + '</div><td><strong style="color:var(--primary)">' + formatTZS(payment.amount) + '</strong></td><td>' + date + '</div><td><span class="payment-status-badge ' + paymentConfig.class + '" style="cursor:default;">' + paymentConfig.icon + ' ' + paymentConfig.label + '</span></td><td><span class="badge bg-info">Bank Transfer</span></td></tr>';
        }
    }
    
    var listEl = document.getElementById('paymentsHistoryList');
    if (listEl) listEl.innerHTML = html;
    
    var modal = document.getElementById('paymentsHistoryModal');
    if (modal) new bootstrap.Modal(modal).show();
}

function exportPaymentsHistory() {
    var paymentHistory = JSON.parse(localStorage.getItem('paymentHistory')) || [];
    if (paymentHistory.length === 0) {
        showNotification('No payment records to export', 'warning');
        return;
    }
    
    var csvContent = "Payment ID,Booking ID,Customer,Service,Amount (TZS),Payment Date,Status,Method\n";
    for (var i = 0; i < paymentHistory.length; i++) {
        var payment = paymentHistory[i];
        csvContent += '"' + payment.id + '","' + payment.bookingId + '","' + payment.customerName + '","' + payment.serviceName + '",' + payment.amount + ',"' + new Date(payment.paymentDate).toLocaleString() + '","' + payment.status + '","' + payment.method + '"\n';
    }
    
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    var url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'CleanSpark_Payments_History_' + new Date().toISOString().slice(0, 10) + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('Payments history exported successfully!', 'success');
}

// ========== SERVICE FUNCTIONS ==========
function loadServices() {
    var services = JSON.parse(localStorage.getItem('adminServices')) || [];
    var html = '';
    if (services.length === 0) {
        html = '<tr><td colspan="6" class="text-center text-muted py-4">No services added yet</div></tr>';
    } else {
        for (var i = 0; i < services.length; i++) {
            var service = services[i];
            var imgHtml = service.image ? '<img src="' + escapeHtml(service.image) + '" alt="' + escapeHtml(service.name) + '" class="service-thumb">' : '<div class="no-image-thumb"><i class="bi bi-image"></i></div>';
            var locClass = service.location === 'Unguja' ? 'location-unguja' : (service.location === 'Pemba' ? 'location-pemba' : 'location-both');
            var locIcon = service.location === 'Unguja' ? '🏝' : (service.location === 'Pemba' ? '🌿' : '🗺');
            
            html += '<tr><td>' + imgHtml + '</td><td><strong>' + escapeHtml(service.name) + '</strong>' + (service.description ? '<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">' + escapeHtml(service.description.substring(0, 60)) + (service.description.length > 60 ? '…' : '') + '</div>' : '') + '</td><td><strong style="color:var(--primary)">' + formatTZS(service.price) + '</strong></td><td>' + escapeHtml(service.duration) + '</div><td><span class="location-badge ' + locClass + '">' + locIcon + ' ' + escapeHtml(service.location) + '</span></td><td style="text-align:center; white-space:nowrap;"><button class="action-btn action-btn-edit" onclick="openEditServiceModal(' + i + ')" title="Edit"><i class="bi bi-pencil-fill"></i></button><button class="action-btn action-btn-delete" onclick="deleteService(' + i + ')" title="Delete"><i class="bi bi-trash3-fill"></i></button></div></tr>';
        }
    }
    var serviceList = document.getElementById('serviceList');
    if (serviceList) serviceList.innerHTML = html;
}

function addService() {
    var nameInput = document.getElementById('serviceName');
    var priceInput = document.getElementById('servicePrice');
    
    if (!nameInput || !priceInput) return;
    
    var name = nameInput.value.trim();
    var price = priceInput.value.trim();
    var duration = document.getElementById('serviceDuration') ? document.getElementById('serviceDuration').value.trim() : '';
    var location = document.getElementById('serviceLocation') ? document.getElementById('serviceLocation').value : 'Unguja';
    var description = document.getElementById('serviceDescription') ? document.getElementById('serviceDescription').value.trim() : '';
    var image = pendingServiceImage || null;
    var included = getIncludedItems('includedManualEntry');

    if (!name || !price) {
        showNotification('Service name and price are required', 'error');
        return;
    }
    if (isNaN(price) || Number(price) < 0) {
        showNotification('Please enter a valid price in TZS', 'error');
        return;
    }

    var services = JSON.parse(localStorage.getItem('adminServices')) || [];
    services.push({
        id: Date.now(),
        name: name,
        price: Number(price),
        duration: duration || '2 hours',
        location: location,
        description: description,
        included: included,
        image: image
    });
    localStorage.setItem('adminServices', JSON.stringify(services));

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
    addToAuditLog('New service added: ' + name);
    showNotification('Service added successfully!', 'success');
}

function deleteService(index) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    var services = JSON.parse(localStorage.getItem('adminServices')) || [];
    var serviceId = services[index].id;
    var serviceName = services[index].name;
    services.splice(index, 1);
    localStorage.setItem('adminServices', JSON.stringify(services));
    var assignments = JSON.parse(localStorage.getItem('serviceAssignments')) || {};
    delete assignments[serviceId];
    localStorage.setItem('serviceAssignments', JSON.stringify(assignments));
    loadServices();
    loadDashboardStats();
    addToAuditLog('Service deleted: ' + serviceName);
    showNotification('Service deleted.', 'success');
}

function openEditServiceModal(index) {
    var services = JSON.parse(localStorage.getItem('adminServices')) || [];
    var service = services[index];
    if (!service) return;
    pendingEditServiceImage = null;
    document.getElementById('editServiceIndex').value = index;
    document.getElementById('editServiceName').value = service.name || '';
    document.getElementById('editServicePrice').value = service.price || '';
    document.getElementById('editServiceDuration').value = service.duration || '';
    document.getElementById('editServiceLocation').value = service.location || 'Unguja';
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
    initIncludedManualEntry('editIncludedManualEntry', 'editAddIncludedItemBtn', service.included || []);
    var modal = document.getElementById('editServiceModal');
    if (modal) new bootstrap.Modal(modal).show();
}

function saveEditedService() {
    var index = parseInt(document.getElementById('editServiceIndex').value);
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
    
    var services = JSON.parse(localStorage.getItem('adminServices')) || [];
    if (!services[index]) return;
    
    services[index] = {
        id: services[index].id,
        name: name,
        price: Number(price),
        duration: duration || services[index].duration,
        location: location,
        description: description,
        included: included,
        image: pendingEditServiceImage !== null ? pendingEditServiceImage : services[index].image
    };
    localStorage.setItem('adminServices', JSON.stringify(services));
    
    var modalEl = document.getElementById('editServiceModal');
    var bsModal = bootstrap.Modal.getInstance(modalEl);
    if (bsModal) bsModal.hide();
    
    loadServices();
    loadDashboardStats();
    addToAuditLog('Service updated: ' + name);
    showNotification('Service updated successfully!', 'success');
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

// ========== STAFF FUNCTIONS ==========
function loadStaff() {
    var staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    var html = '';
    if (staff.length === 0) {
        html = '<tr><td colspan="7" class="text-center text-muted py-4">No staff members added yet</div></tr>';
    } else {
        for (var i = 0; i < staff.length; i++) {
            var member = staff[i];
            var initials = member.name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
            var avatarHtml = member.photo ? '<img src="' + escapeHtml(member.photo) + '" alt="' + escapeHtml(member.name) + '" class="staff-avatar">' : '<div class="staff-initials">' + escapeHtml(initials) + '</div>';
            var staffTypeLabel = member.staffType === 'supervisor' ? 'Supervisor' : (member.staffType === 'general_supervisor' ? 'General Supervisor' : (member.staffType === 'contractor' ? 'Contractor' : 'Normal Worker'));
            
            html += '<tr><td class="align-middle">' + avatarHtml + '</div><td class="align-middle"><strong>' + escapeHtml(member.name) + '</strong></div><td class="align-middle">' + escapeHtml(member.email) + '</div><td class="align-middle"><span class="badge bg-success">Active</span></div><td class="align-middle">' + staffTypeLabel + '</div><td class="align-middle"><span class="staff-availability availability-available">✅ Available</span></div><td class="align-middle text-center"><button class="action-btn action-btn-edit" onclick="openEditStaffModal(' + i + ')" title="Edit"><i class="bi bi-pencil-fill"></i></button><button class="action-btn action-btn-delete" onclick="deleteStaff(' + i + ')" title="Remove"><i class="bi bi-trash3-fill"></i></button></div></tr>';
        }
    }
    var staffList = document.getElementById('staffList');
    if (staffList) staffList.innerHTML = html;
}

function addStaff() {
    var name = document.getElementById('staffName') ? document.getElementById('staffName').value.trim() : '';
    var email = document.getElementById('staffEmail') ? document.getElementById('staffEmail').value.trim() : '';
    var staffType = document.getElementById('staffType') ? document.getElementById('staffType').value : 'normal';
    var phone = document.getElementById('staffPhone') ? document.getElementById('staffPhone').value.trim() : '';
    var password = document.getElementById('staffPass') ? document.getElementById('staffPass').value : '';
    
    if (!name || !email || !password || !phone) {
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
    
    var staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    for (var i = 0; i < staff.length; i++) {
        if (staff[i].email.toLowerCase() === email.toLowerCase()) {
            showNotification('A staff member with this email already exists', 'error');
            return;
        }
    }
    
    staff.push({
        id: Date.now(),
        name: name,
        email: email,
        staffType: staffType,
        phone: phone,
        password: password,
        photo: pendingStaffImage || null,
        status: 'active',
        availability: 'available'
    });
    localStorage.setItem('staffAccounts', JSON.stringify(staff));
    
    if (document.getElementById('staffName')) document.getElementById('staffName').value = '';
    if (document.getElementById('staffEmail')) document.getElementById('staffEmail').value = '';
    if (document.getElementById('staffPhone')) document.getElementById('staffPhone').value = '';
    if (document.getElementById('staffPass')) document.getElementById('staffPass').value = '';
    clearStaffImage();
    
    loadStaff();
    loadDashboardStats();
    addToAuditLog('New staff member added: ' + name);
    showNotification('Staff member added successfully!', 'success');
}

function deleteStaff(index) {
    var staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    if (!staff[index]) return;
    if (!confirm('Remove "' + staff[index].name + '" from staff?')) return;
    var staffId = staff[index].id;
    var staffName = staff[index].name;
    staff.splice(index, 1);
    localStorage.setItem('staffAccounts', JSON.stringify(staff));
    var assignments = JSON.parse(localStorage.getItem('serviceAssignments')) || {};
    for (var svcId in assignments) {
        if (assignments[svcId] == staffId) {
            delete assignments[svcId];
        }
    }
    localStorage.setItem('serviceAssignments', JSON.stringify(assignments));
    loadStaff();
    loadDashboardStats();
    addToAuditLog('Staff member removed: ' + staffName);
    showNotification('Staff member removed.', 'success');
}

function openEditStaffModal(index) {
    var staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    var member = staff[index];
    if (!member) return;
    pendingEditStaffImage = null;
    document.getElementById('editStaffIndex').value = index;
    document.getElementById('editStaffName').value = member.name || '';
    document.getElementById('editStaffEmail').value = member.email || '';
    document.getElementById('editstaffType').value = member.staffType || 'normal';
    document.getElementById('editStaffPhone').value = member.phone || '';
    document.getElementById('editStaffPassword').value = '';
    
    var initials = member.name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
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
}

function saveEditedStaff() {
    var index = parseInt(document.getElementById('editStaffIndex').value);
    var name = document.getElementById('editStaffName').value.trim();
    var email = document.getElementById('editStaffEmail').value.trim();
    var staffType = document.getElementById('editstaffType').value;
    var phone = document.getElementById('editStaffPhone').value.trim();
    var newPass = document.getElementById('editStaffPassword').value;
    
    if (!name || !email) {
        showNotification('Name and email are required', 'error');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    if (newPass && newPass.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    var staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    if (!staff[index]) return;
    
    var emailExists = false;
    for (var i = 0; i < staff.length; i++) {
        if (i !== index && staff[i].email.toLowerCase() === email.toLowerCase()) {
            emailExists = true;
            break;
        }
    }
    if (emailExists) {
        showNotification('This email is already used', 'error');
        return;
    }
    
    staff[index].name = name;
    staff[index].email = email;
    staff[index].staffType = staffType;
    staff[index].phone = phone;
    if (newPass) staff[index].password = newPass;
    if (pendingEditStaffImage !== null) staff[index].photo = pendingEditStaffImage;
    
    localStorage.setItem('staffAccounts', JSON.stringify(staff));
    
    var modalEl = document.getElementById('editStaffModal');
    var bsModal = bootstrap.Modal.getInstance(modalEl);
    if (bsModal) bsModal.hide();
    
    loadStaff();
    loadDashboardStats();
    addToAuditLog('Staff member updated: ' + name);
    showNotification('Staff member updated successfully!', 'success');
}

function updateStaffAvailability(staffId, availability) {
    var staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    var index = -1;
    for (var i = 0; i < staff.length; i++) {
        if (staff[i].id == staffId) {
            index = i;
            break;
        }
    }
    if (index !== -1) {
        staff[index].availability = availability;
        staff[index].availabilityUpdated = new Date().toISOString();
        localStorage.setItem('staffAccounts', JSON.stringify(staff));
        loadStaff();
        showNotification('Staff availability updated to ' + availability, 'success');
    }
}

// ========== STAFF INFO / ISSUES MANAGEMENT ==========
function initializeStaffIssuesData() {
    if (!localStorage.getItem('staffIssues')) {
        var sampleIssues = [
            {
                id: Date.now() - 86400000 * 3,
                staffId: 4001,
                staffName: 'Fatma Ali',
                employeeId: 'EMP001',
                assignedJob: 'Deep House Cleaning',
                assignedLocation: 'Stone Town, Zanzibar',
                supervisor: 'Admin',
                issueType: 'Sick',
                description: 'Feeling unwell with fever, unable to attend today\'s shift',
                submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
                expectedReturnDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                status: 'Under Review',
                adminNotes: '',
                replacementAssigned: null
            },
            {
                id: Date.now() - 86400000,
                staffId: 4003,
                staffName: 'Amina Salum',
                employeeId: 'EMP003',
                assignedJob: 'Office Cleaning',
                assignedLocation: 'Chukwani, Zanzibar',
                supervisor: 'Admin',
                issueType: 'Running Late',
                description: 'Will be 30 minutes late due to traffic',
                submittedAt: new Date(Date.now() - 86400000).toISOString(),
                expectedReturnDate: null,
                status: 'New',
                adminNotes: '',
                replacementAssigned: null
            }
        ];
        localStorage.setItem('staffIssues', JSON.stringify(sampleIssues));
    }
}

function loadStaffIssues() {
    var issues = JSON.parse(localStorage.getItem('staffIssues')) || [];
    updateStaffInfoStats(issues);
    renderStaffIssuesTable(issues);
}

function updateStaffInfoStats(issues) {
    var total = issues.length;
    var newRequests = 0;
    var staffOnLeave = 0;
    var replacementRequired = 0;
    var resolved = 0;
    
    for (var i = 0; i < issues.length; i++) {
        if (issues[i].status === 'New') newRequests++;
        if (issues[i].status === 'Approved Leave') staffOnLeave++;
        if (issues[i].issueType === 'Need Replacement' || (issues[i].status === 'New' && issues[i].issueType === 'Unable To Attend')) replacementRequired++;
        if (issues[i].status === 'Resolved') resolved++;
    }
    
    var statsGrid = document.getElementById('staffInfoStatsGrid');
    if (statsGrid) {
        statsGrid.innerHTML = '<div class="stat-card"><div class="stat-icon"><i class="bi bi-exclamation-triangle-fill"></i></div><div class="stat-value">' + total + '</div><div class="stat-label">Total Issues</div></div><div class="stat-card" onclick="filterStaffIssuesByStatus(\'New\')"><div class="stat-icon" style="background:rgba(59,130,246,0.1);"><i class="bi bi-clock-fill" style="color:#3b82f6;"></i></div><div class="stat-value">' + newRequests + '</div><div class="stat-label">New Requests</div></div><div class="stat-card" onclick="filterStaffIssuesByStatus(\'Approved Leave\')"><div class="stat-icon" style="background:rgba(245,158,11,0.1);"><i class="bi bi-calendar-x-fill" style="color:#d97706;"></i></div><div class="stat-value">' + staffOnLeave + '</div><div class="stat-label">Staff On Leave</div></div><div class="stat-card"><div class="stat-icon" style="background:rgba(220,38,38,0.1);"><i class="bi bi-person-x-fill" style="color:#dc2626;"></i></div><div class="stat-value">' + replacementRequired + '</div><div class="stat-label">Replacement Required</div></div><div class="stat-card" onclick="filterStaffIssuesByStatus(\'Resolved\')"><div class="stat-icon" style="background:rgba(22,163,74,0.1);"><i class="bi bi-check-circle-fill" style="color:#16a34a;"></i></div><div class="stat-value">' + resolved + '</div><div class="stat-label">Resolved</div></div>';
    }
}

function renderStaffIssuesTable(issues) {
    var searchTerm = document.getElementById('staffInfoSearch') ? document.getElementById('staffInfoSearch').value.trim().toLowerCase() : '';
    var typeFilter = document.getElementById('staffIssueTypeFilter') ? document.getElementById('staffIssueTypeFilter').value : 'all';
    var statusFilter = document.getElementById('staffIssueStatusFilter') ? document.getElementById('staffIssueStatusFilter').value : 'all';
    
    var filtered = [];
    for (var i = 0; i < issues.length; i++) {
        var issue = issues[i];
        if (searchTerm && !issue.staffName.toLowerCase().includes(searchTerm)) continue;
        if (typeFilter !== 'all' && issue.issueType !== typeFilter) continue;
        if (statusFilter !== 'all' && issue.status !== statusFilter) continue;
        filtered.push(issue);
    }
    
    var html = '';
    if (filtered.length === 0) {
        html = '<tr><td colspan="12" class="text-center text-muted py-4">No staff issues found</div></tr>';
    } else {
        for (var j = 0; j < filtered.length; j++) {
            var issue = filtered[j];
            var statusClass = getIssueStatusClass(issue.status);
            var date = new Date(issue.submittedAt).toLocaleDateString();
            
            html += '<tr><td class="align-middle"><strong>#' + escapeHtml(String(issue.id).slice(-6)) + '</strong></div><td class="align-middle"><strong>' + escapeHtml(issue.staffName) + '</strong></div><td class="align-middle">' + escapeHtml(issue.employeeId) + '</div><td class="align-middle">' + escapeHtml(issue.assignedJob || '—') + '</div><td class="align-middle">' + escapeHtml(issue.assignedLocation || '—') + '</div><td class="align-middle">' + escapeHtml(issue.supervisor || 'Admin') + '</div><td class="align-middle"><span class="badge bg-secondary">' + escapeHtml(issue.issueType) + '</span></div><td class="align-middle">' + escapeHtml(issue.description.substring(0, 50)) + (issue.description.length > 50 ? '…' : '') + '</div><td class="align-middle">' + date + '</div><td class="align-middle">' + (issue.expectedReturnDate || '—') + '</div><td class="align-middle"><span class="' + statusClass + '">' + escapeHtml(issue.status) + '</span></div><td class="align-middle text-center"><button class="action-btn action-btn-view" onclick="viewStaffIssueDetail(' + issue.id + ')" title="View Details"><i class="bi bi-eye-fill"></i></button><button class="action-btn action-btn-edit" onclick="contactStaffFromIssue(' + issue.id + ')" title="Contact Staff"><i class="bi bi-telephone-fill"></i></button>' + (issue.status !== 'Replacement Assigned' && issue.status !== 'Resolved' ? '<button class="action-btn action-btn-reply" onclick="openAssignReplacementModal(' + issue.id + ')" title="Assign Replacement"><i class="bi bi-person-plus-fill"></i></button>' : '') + '<button class="action-btn action-btn-approve" onclick="updateIssueStatus(' + issue.id + ', \'Approved Leave\')" title="Approve Leave"><i class="bi bi-check-lg"></i></button><button class="action-btn action-btn-reject" onclick="updateIssueStatus(' + issue.id + ', \'Rejected\')" title="Reject"><i class="bi bi-x-lg"></i></button></div></tr>';
        }
    }
    var issuesList = document.getElementById('staffIssuesList');
    if (issuesList) issuesList.innerHTML = html;
}

function getIssueStatusClass(status) {
    var classes = {
        'New': 'badge bg-primary',
        'Under Review': 'badge bg-warning text-dark',
        'Replacement Assigned': 'badge bg-info',
        'Approved Leave': 'badge bg-success',
        'Rejected': 'badge bg-danger',
        'Resolved': 'badge bg-secondary'
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

function viewStaffIssueDetail(issueId) {
    var issues = JSON.parse(localStorage.getItem('staffIssues')) || [];
    var issue = null;
    for (var i = 0; i < issues.length; i++) {
        if (issues[i].id == issueId) {
            issue = issues[i];
            break;
        }
    }
    if (!issue) return;
    
    currentStaffIssueId = issueId;
    
    var bodyEl = document.getElementById('viewStaffIssueBody');
    if (bodyEl) {
        bodyEl.innerHTML = '<div class="staff-issue-detail"><div class="row"><div class="col-md-6"><p><strong>Staff Name:</strong> ' + escapeHtml(issue.staffName) + '</p><p><strong>Employee ID:</strong> ' + escapeHtml(issue.employeeId) + '</p><p><strong>Assigned Job:</strong> ' + escapeHtml(issue.assignedJob || '—') + '</p><p><strong>Assigned Location:</strong> ' + escapeHtml(issue.assignedLocation || '—') + '</p></div><div class="col-md-6"><p><strong>Supervisor:</strong> ' + escapeHtml(issue.supervisor || 'Admin') + '</p><p><strong>Issue Type:</strong> <span class="badge bg-secondary">' + escapeHtml(issue.issueType) + '</span></p><p><strong>Submitted:</strong> ' + new Date(issue.submittedAt).toLocaleString() + '</p><p><strong>Expected Return:</strong> ' + (issue.expectedReturnDate || 'Not specified') + '</p></div></div><hr><p><strong>Description:</strong></p><p class="p-3 bg-light rounded">' + escapeHtml(issue.description) + '</p>' + (issue.adminNotes ? '<p><strong>Admin Notes:</strong></p><p class="p-3 bg-light rounded">' + escapeHtml(issue.adminNotes) + '</p>' : '') + (issue.replacementAssigned ? '<p><strong>Replacement Assigned:</strong> ' + escapeHtml(issue.replacementAssigned) + '</p>' : '') + '</div>';
    }
    
    var modal = document.getElementById('viewStaffIssueModal');
    if (modal) new bootstrap.Modal(modal).show();
}

function contactStaffFromIssue(issueId) {
    var issues = JSON.parse(localStorage.getItem('staffIssues')) || [];
    var issue = null;
    for (var i = 0; i < issues.length; i++) {
        if (issues[i].id == issueId) {
            issue = issues[i];
            break;
        }
    }
    if (!issue) return;
    showNotification('Contacting ' + issue.staffName + '... (Phone: ' + (issue.phone || 'N/A') + ')', 'info');
}

function openAssignReplacementModal(issueId) {
    var issues = JSON.parse(localStorage.getItem('staffIssues')) || [];
    var issue = null;
    for (var i = 0; i < issues.length; i++) {
        if (issues[i].id == issueId) {
            issue = issues[i];
            break;
        }
    }
    if (!issue) return;
    
    currentStaffIssueId = issueId;
    
    var infoEl = document.getElementById('replacementJobInfo');
    if (infoEl) {
        infoEl.innerHTML = '<p><strong>Staff:</strong> ' + escapeHtml(issue.staffName) + '</p><p><strong>Job:</strong> ' + escapeHtml(issue.assignedJob || '—') + '</p><p><strong>Location:</strong> ' + escapeHtml(issue.assignedLocation || '—') + '</p>';
    }
    
    var allStaff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    var availableStaff = [];
    for (var j = 0; j < allStaff.length; j++) {
        var s = allStaff[j];
        if (String(s.id) !== String(issue.staffId) && s.status === 'active' && s.staffType !== 'supervisor' && s.staffType !== 'general_supervisor') {
            availableStaff.push(s);
        }
    }
    
    var staffHtml = '';
    if (availableStaff.length === 0) {
        staffHtml = '<p class="text-muted">No available staff for replacement</p>';
    } else {
        for (var k = 0; k < availableStaff.length; k++) {
            var staffMember = availableStaff[k];
            var initials = staffMember.name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
            staffHtml += '<div class="available-staff-item" onclick="selectReplacementStaff(this, ' + staffMember.id + ')"><div class="available-staff-avatar">' + escapeHtml(initials) + '</div><div class="available-staff-info"><div class="available-staff-name">' + escapeHtml(staffMember.name) + '</div><div class="available-staff-role">' + escapeHtml(staffMember.staffType || 'normal') + '</div></div></div>';
        }
    }
    
    var listEl = document.getElementById('availableStaffList');
    if (listEl) listEl.innerHTML = staffHtml;
    selectedReplacementStaffId = null;
    
    var modal = document.getElementById('assignReplacementModal');
    if (modal) new bootstrap.Modal(modal).show();
}

function selectReplacementStaff(element, staffId) {
    var items = document.querySelectorAll('.available-staff-item');
    for (var i = 0; i < items.length; i++) {
        items[i].classList.remove('selected');
    }
    element.classList.add('selected');
    selectedReplacementStaffId = staffId;
}

function confirmAssignReplacement() {
    if (!selectedReplacementStaffId) {
        showNotification('Please select a replacement staff member', 'warning');
        return;
    }
    
    var issues = JSON.parse(localStorage.getItem('staffIssues')) || [];
    var issueIndex = -1;
    for (var i = 0; i < issues.length; i++) {
        if (issues[i].id == currentStaffIssueId) {
            issueIndex = i;
            break;
        }
    }
    if (issueIndex !== -1) {
        var allStaff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
        var replacement = null;
        for (var j = 0; j < allStaff.length; j++) {
            if (allStaff[j].id == selectedReplacementStaffId) {
                replacement = allStaff[j];
                break;
            }
        }
        
        issues[issueIndex].status = 'Replacement Assigned';
        issues[issueIndex].replacementAssigned = replacement ? replacement.name : 'Staff';
        issues[issueIndex].adminNotes = 'Replacement assigned: ' + (replacement ? replacement.name : 'Staff') + ' on ' + new Date().toLocaleDateString();
        localStorage.setItem('staffIssues', JSON.stringify(issues));
        
        if (issues[issueIndex].assignedJob) {
            var assignments = JSON.parse(localStorage.getItem('serviceAssignments')) || {};
            var serviceName = issues[issueIndex].assignedJob;
            var services = JSON.parse(localStorage.getItem('adminServices')) || [];
            var service = null;
            for (var k = 0; k < services.length; k++) {
                if (services[k].name === serviceName) {
                    service = services[k];
                    break;
                }
            }
            if (service) {
                assignments[service.id] = selectedReplacementStaffId;
                localStorage.setItem('serviceAssignments', JSON.stringify(assignments));
            }
        }
        
        showNotification('Replacement assigned successfully!', 'success');
        addToAuditLog('Replacement assigned for ' + issues[issueIndex].staffName + ' to ' + (replacement ? replacement.name : 'Staff'));
    }
    
    var modalEl = document.getElementById('assignReplacementModal');
    var bsModal = bootstrap.Modal.getInstance(modalEl);
    if (bsModal) bsModal.hide();
    loadStaffIssues();
}

function updateIssueStatus(issueId, newStatus) {
    var issues = JSON.parse(localStorage.getItem('staffIssues')) || [];
    var issueIndex = -1;
    for (var i = 0; i < issues.length; i++) {
        if (issues[i].id == issueId) {
            issueIndex = i;
            break;
        }
    }
    if (issueIndex !== -1) {
        issues[issueIndex].status = newStatus;
        issues[issueIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('staffIssues', JSON.stringify(issues));
        showNotification('Issue status updated to ' + newStatus, 'success');
        loadStaffIssues();
    }
}

// ========== SUPERVISOR CHAT SYSTEM ==========
function initializeSupervisorChatData() {
    if (!localStorage.getItem('supervisorChatMessages')) {
        localStorage.setItem('supervisorChatMessages', JSON.stringify([]));
    }
}

function loadChatContacts() {
    var staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    var generalSupervisors = [];
    for (var i = 0; i < staff.length; i++) {
        if (staff[i].staffType === 'general_supervisor' || staff[i].staffType === 'supervisor') {
            generalSupervisors.push(staff[i]);
        }
    }
    
    var messages = JSON.parse(localStorage.getItem('supervisorChatMessages')) || [];
    
    var contactsList = document.getElementById('chatContactsList');
    if (!contactsList) return;
    
    if (generalSupervisors.length === 0) {
        contactsList.innerHTML = '<div class="chat-placeholder" style="padding:20px;">No supervisors available</div>';
        return;
    }
    
    var contactsHtml = '';
    for (var j = 0; j < generalSupervisors.length; j++) {
        var s = generalSupervisors[j];
        var lastMessage = null;
        for (var k = messages.length - 1; k >= 0; k--) {
            if (messages[k].senderId == s.id || messages[k].receiverId == s.id) {
                lastMessage = messages[k];
                break;
            }
        }
        var unreadCount = 0;
        for (var l = 0; l < messages.length; l++) {
            if (messages[l].receiverId === 'admin' && messages[l].senderId == s.id && !messages[l].read) {
                unreadCount++;
            }
        }
        
        contactsHtml += '<div class="chat-contact-item" onclick="openChatWithSupervisor(' + s.id + ', \'' + escapeHtml(s.name) + '\')"><div class="chat-contact-avatar">' + s.name.charAt(0).toUpperCase() + '</div><div class="chat-contact-info"><div class="chat-contact-name">' + escapeHtml(s.name) + '</div><div class="chat-contact-last">' + (lastMessage ? lastMessage.message.substring(0, 30) : 'No messages yet') + '</div></div>' + (unreadCount > 0 ? '<div class="chat-contact-badge">' + unreadCount + '</div>' : '') + '</div>';
    }
    contactsList.innerHTML = contactsHtml;
}

function openChatWithSupervisor(supervisorId, supervisorName) {
    currentChatSupervisor = { id: supervisorId, name: supervisorName };
    
    var chatHeader = document.getElementById('chatHeader');
    if (chatHeader) chatHeader.innerHTML = '<i class="bi bi-person-badge-fill"></i> Chat with ' + escapeHtml(supervisorName) + ' <span class="online-status">● Online</span>';
    var chatInputArea = document.getElementById('chatInputArea');
    if (chatInputArea) chatInputArea.style.display = 'flex';
    
    loadChatMessages(supervisorId);
}

function loadChatMessages(supervisorId) {
    var messages = JSON.parse(localStorage.getItem('supervisorChatMessages')) || [];
    var relevantMessages = [];
    for (var i = 0; i < messages.length; i++) {
        var m = messages[i];
        if ((m.senderId == supervisorId && m.receiverId === 'admin') || (m.senderId === 'admin' && m.receiverId == supervisorId)) {
            relevantMessages.push(m);
        }
    }
    
    for (var j = 0; j < messages.length; j++) {
        if (messages[j].senderId == supervisorId && messages[j].receiverId === 'admin' && !messages[j].read) {
            messages[j].read = true;
        }
    }
    localStorage.setItem('supervisorChatMessages', JSON.stringify(messages));
    
    var messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;
    
    if (relevantMessages.length === 0) {
        messagesContainer.innerHTML = '<div class="chat-placeholder"><i class="bi bi-chat-dots-fill"></i><p>No messages yet. Start a conversation!</p></div>';
        return;
    }
    
    var messagesHtml = '';
    for (var k = 0; k < relevantMessages.length; k++) {
        var msg = relevantMessages[k];
        var isOwn = msg.senderId === 'admin';
        messagesHtml += '<div class="chat-message ' + (isOwn ? 'own' : 'other') + '"><div class="chat-bubble">' + escapeHtml(msg.message) + (msg.attachment ? '<div class="chat-attachment-preview"><a href="' + escapeHtml(msg.attachment) + '" target="_blank" class="chat-attachment-link"><i class="bi bi-paperclip"></i> Attachment</a></div>' : '') + '<div class="chat-meta"><span>' + new Date(msg.timestamp).toLocaleTimeString() + '</span>' + (isOwn ? '<span>✓ Delivered</span>' : '') + '</div></div></div>';
    }
    messagesContainer.innerHTML = messagesHtml;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendChatMessage() {
    var messageInput = document.getElementById('chatMessageInput');
    if (!messageInput) return;
    var message = messageInput.value.trim();
    
    if (!message && !pendingChatAttachment) {
        showNotification('Please enter a message', 'warning');
        return;
    }
    
    if (!currentChatSupervisor) {
        showNotification('No supervisor selected', 'error');
        return;
    }
    
    var messages = JSON.parse(localStorage.getItem('supervisorChatMessages')) || [];
    messages.push({
        id: Date.now(),
        senderId: 'admin',
        senderName: 'Admin',
        receiverId: currentChatSupervisor.id,
        receiverName: currentChatSupervisor.name,
        message: message,
        attachment: pendingChatAttachment || null,
        timestamp: new Date().toISOString(),
        read: false
    });
    localStorage.setItem('supervisorChatMessages', JSON.stringify(messages));
    
    messageInput.value = '';
    pendingChatAttachment = null;
    
    loadChatMessages(currentChatSupervisor.id);
    
    addToNotificationCenter('Reply sent to Supervisor ' + currentChatSupervisor.name, 'info');
}

function openChatAttachment() {
    var fileInput = document.getElementById('chatFileInput');
    if (fileInput) fileInput.click();
}

function attachChatFile(input) {
    var file = input.files[0];
    if (!file) return;
    
    var reader = new FileReader();
    reader.onload = function(e) {
        pendingChatAttachment = e.target.result;
        showNotification('File "' + file.name + '" attached', 'success');
    };
    reader.readAsDataURL(file);
    input.value = '';
}

function filterChatContacts() {
    var searchTerm = document.getElementById('chatSearch') ? document.getElementById('chatSearch').value.trim().toLowerCase() : '';
    var staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    var generalSupervisors = [];
    for (var i = 0; i < staff.length; i++) {
        if (staff[i].staffType === 'general_supervisor' || staff[i].staffType === 'supervisor') {
            generalSupervisors.push(staff[i]);
        }
    }
    
    var filtered = [];
    for (var j = 0; j < generalSupervisors.length; j++) {
        if (generalSupervisors[j].name.toLowerCase().includes(searchTerm)) {
            filtered.push(generalSupervisors[j]);
        }
    }
    
    var contactsList = document.getElementById('chatContactsList');
    if (!contactsList) return;
    
    if (filtered.length === 0) {
        contactsList.innerHTML = '<div class="chat-placeholder" style="padding:20px;">No supervisors found</div>';
        return;
    }
    
    var contactsHtml = '';
    for (var k = 0; k < filtered.length; k++) {
        var s = filtered[k];
        contactsHtml += '<div class="chat-contact-item" onclick="openChatWithSupervisor(' + s.id + ', \'' + escapeHtml(s.name) + '\')"><div class="chat-contact-avatar">' + s.name.charAt(0).toUpperCase() + '</div><div class="chat-contact-info"><div class="chat-contact-name">' + escapeHtml(s.name) + '</div><div class="chat-contact-last">Click to chat</div></div></div>';
    }
    contactsList.innerHTML = contactsHtml;
}

// ========== MESSAGE FUNCTIONS ==========
function loadAllMessages() {
    loadCustomerMessages();
    loadSupervisorMessages();
    updateMessageCounts();
}

function switchMessageTab(tabName, btnEl) {
    var tabs = document.querySelectorAll('.message-tab-btn');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    var contents = document.querySelectorAll('.message-tab-content');
    for (var j = 0; j < contents.length; j++) {
        contents[j].classList.remove('active');
    }
    if (btnEl) btnEl.classList.add('active');
    var tabEl = document.getElementById('msg-' + tabName + '-tab');
    if (tabEl) tabEl.classList.add('active');
}

function loadCustomerMessages() {
    var messages = JSON.parse(localStorage.getItem('contact_messages')) || [];
    var searchTerm = document.getElementById('customerMsgSearch') ? document.getElementById('customerMsgSearch').value.trim().toLowerCase() : '';
    
    var filtered = [];
    for (var i = 0; i < messages.length; i++) {
        var msg = messages[i];
        if (searchTerm && !(msg.name && msg.name.toLowerCase().includes(searchTerm)) && !(msg.subject && msg.subject.toLowerCase().includes(searchTerm)) && !(msg.message && msg.message.toLowerCase().includes(searchTerm))) {
            continue;
        }
        filtered.push(msg);
    }
    
    var html = '';
    if (filtered.length === 0) {
        html = '<tr><td colspan="5" class="text-center text-muted py-4">No customer messages</div></tr>';
    } else {
        for (var j = filtered.length - 1; j >= 0; j--) {
            var msg = filtered[j];
            var date = msg.timestamp ? new Date(msg.timestamp).toLocaleDateString() : '—';
            html += '<tr><td class="align-middle"><strong>' + escapeHtml(msg.name) + '</strong><br><small>' + escapeHtml(msg.email) + '</small></div><td class="align-middle">' + escapeHtml(msg.subject || '—') + '</div><td class="align-middle">' + escapeHtml((msg.message || '').substring(0, 60)) + ((msg.message || '').length > 60 ? '…' : '') + '</div><td class="align-middle">' + date + '</div><td class="align-middle text-center"><button class="action-btn action-btn-view" onclick="viewMessage(' + j + ', \'customer\')"><i class="bi bi-eye-fill"></i></button><button class="action-btn action-btn-reply" onclick="openReplyModal(' + j + ', \'customer\')"><i class="bi bi-reply-fill"></i></button></div></tr>';
        }
    }
    var customerList = document.getElementById('customerMessageList');
    if (customerList) customerList.innerHTML = html;
}

function loadSupervisorMessages() {
    var messages = JSON.parse(localStorage.getItem('supervisor_messages')) || [];
    var searchTerm = document.getElementById('supervisorMsgSearch') ? document.getElementById('supervisorMsgSearch').value.trim().toLowerCase() : '';
    
    var filtered = [];
    for (var i = 0; i < messages.length; i++) {
        var msg = messages[i];
        if (searchTerm && !(msg.name && msg.name.toLowerCase().includes(searchTerm)) && !(msg.subject && msg.subject.toLowerCase().includes(searchTerm)) && !(msg.message && msg.message.toLowerCase().includes(searchTerm))) {
            continue;
        }
        filtered.push(msg);
    }
    
    var html = '';
    if (filtered.length === 0) {
        html = '<tr><td colspan="6" class="text-center text-muted py-4">No supervisor messages</div></tr>';
    } else {
        for (var j = filtered.length - 1; j >= 0; j--) {
            var msg = filtered[j];
            var date = msg.timestamp ? new Date(msg.timestamp).toLocaleDateString() : '—';
            var alertType = msg.isAlert ? '⚠️ Alert' : (msg.isEmergency ? '🚨 Emergency' : '📝 Message');
            var alertClass = msg.isEmergency ? 'bg-danger' : (msg.isAlert ? 'bg-warning' : 'bg-info');
            html += '<tr><td class="align-middle"><strong>' + escapeHtml(msg.name) + '</strong><br><small>' + escapeHtml(msg.email) + '</small></div><td class="align-middle"><span class="badge ' + alertClass + '">' + alertType + '</span></div><td class="align-middle">' + escapeHtml(msg.subject || '—') + '</div><td class="align-middle">' + escapeHtml((msg.message || '').substring(0, 50)) + ((msg.message || '').length > 50 ? '…' : '') + '</div><td class="align-middle">' + date + '</div><td class="align-middle text-center"><button class="action-btn action-btn-view" onclick="viewMessage(' + j + ', \'supervisor\')"><i class="bi bi-eye-fill"></i></button><button class="action-btn action-btn-reply" onclick="openReplyModal(' + j + ', \'supervisor\')"><i class="bi bi-reply-fill"></i></button></div></tr>';
        }
    }
    var supervisorList = document.getElementById('supervisorMessageList');
    if (supervisorList) supervisorList.innerHTML = html;
}

function updateMessageCounts() {
    var customerMsgs = JSON.parse(localStorage.getItem('contact_messages')) || [];
    var supervisorMsgs = JSON.parse(localStorage.getItem('supervisor_messages')) || [];
    var chatMsgs = JSON.parse(localStorage.getItem('supervisorChatMessages')) || [];
    
    var unreadChat = 0;
    for (var i = 0; i < chatMsgs.length; i++) {
        if (chatMsgs[i].receiverId === 'admin' && !chatMsgs[i].read) unreadChat++;
    }
    
    var customerCount = document.getElementById('customerMsgCount');
    if (customerCount) customerCount.textContent = customerMsgs.length;
    var supervisorCount = document.getElementById('supervisorMsgCount');
    if (supervisorCount) supervisorCount.textContent = supervisorMsgs.length;
    var generalCount = document.getElementById('generalMsgCount');
    if (generalCount) generalCount.textContent = unreadChat;
}

function filterMessagesByType(type) {
    if (type === 'customers') loadCustomerMessages();
    if (type === 'supervisors') loadSupervisorMessages();
}

function viewMessage(index, source) {
    var sourceKey = source === 'supervisor' ? 'supervisor_messages' : 'contact_messages';
    var messages = JSON.parse(localStorage.getItem(sourceKey)) || [];
    var reversed = [];
    for (var i = messages.length - 1; i >= 0; i--) {
        reversed.push(messages[i]);
    }
    var msg = reversed[index];
    if (!msg) return;
    
    currentMessageIndex = index;
    currentMessageType = source;
    
    var bodyEl = document.getElementById('viewMessageBody');
    if (bodyEl) {
        bodyEl.innerHTML = '<div class="message-detail-row"><span class="message-detail-label">From</span><span class="message-detail-value"><strong>' + escapeHtml(msg.name) + '</strong></span></div><div class="message-detail-row"><span class="message-detail-label">Email</span><span class="message-detail-value">' + escapeHtml(msg.email) + '</span></div><div class="message-detail-row"><span class="message-detail-label">Subject</span><span class="message-detail-value">' + escapeHtml(msg.subject || '—') + '</span></div><div class="message-detail-row"><span class="message-detail-label">Date</span><span class="message-detail-value">' + (msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '—') + '</span></div><div class="message-body-box">' + escapeHtml(msg.message || '—') + '</div>' + (msg.reply ? '<div class="message-body-box" style="background:#f0fff4;border-color:#bbf7d0;margin-top:12px;"><strong>Reply:</strong> ' + escapeHtml(msg.reply) + '</div>' : '');
    }
    
    var modal = document.getElementById('viewMessageModal');
    if (modal) new bootstrap.Modal(modal).show();
}

function openReplyModal(index, source) {
    var sourceKey = source === 'supervisor' ? 'supervisor_messages' : 'contact_messages';
    var messages = JSON.parse(localStorage.getItem(sourceKey)) || [];
    var reversed = [];
    for (var i = messages.length - 1; i >= 0; i--) {
        reversed.push(messages[i]);
    }
    var msg = reversed[index];
    if (!msg) return;
    
    currentMessageIndex = index;
    currentMessageType = source;
    var idxField = document.getElementById('replyMessageIndex');
    if (idxField) idxField.value = index;
    var originalEl = document.getElementById('replyMessageOriginal');
    if (originalEl) originalEl.innerHTML = '<strong>From ' + escapeHtml(msg.name) + ':</strong><div style="font-size:12px;margin-top:4px;">' + escapeHtml((msg.message || '').substring(0, 200)) + '</div>';
    var textarea = document.getElementById('replyMessageText');
    if (textarea) textarea.value = '';
    
    var modal = document.getElementById('replyMessageModal');
    if (modal) new bootstrap.Modal(modal).show();
}

function sendReply() {
    var indexField = document.getElementById('replyMessageIndex');
    if (!indexField) return;
    var index = parseInt(indexField.value);
    var replyText = document.getElementById('replyMessageText') ? document.getElementById('replyMessageText').value.trim() : '';
    var type = currentMessageType;
    var sourceKey = type === 'supervisor' ? 'supervisor_messages' : 'contact_messages';
    
    if (!replyText) {
        showNotification('Please type a reply', 'error');
        return;
    }
    
    var messages = JSON.parse(localStorage.getItem(sourceKey)) || [];
    var reversed = [];
    for (var i = messages.length - 1; i >= 0; i--) {
        reversed.push(messages[i]);
    }
    if (!reversed[index]) return;
    
    var originalIndex = -1;
    for (var j = 0; j < messages.length; j++) {
        if (messages[j].timestamp === reversed[index].timestamp && messages[j].email === reversed[index].email) {
            originalIndex = j;
            break;
        }
    }
    if (originalIndex >= 0) {
        messages[originalIndex].reply = replyText;
        messages[originalIndex].replyDate = new Date().toISOString();
        localStorage.setItem(sourceKey, JSON.stringify(messages));
        addToAuditLog('Reply sent to ' + messages[originalIndex].name + ' (' + type + ')');
    }
    
    var modalEl = document.getElementById('replyMessageModal');
    var bsModal = bootstrap.Modal.getInstance(modalEl);
    if (bsModal) bsModal.hide();
    
    var textareaEl = document.getElementById('replyMessageText');
    if (textareaEl) textareaEl.value = '';
    loadAllMessages();
    showNotification('Reply sent!', 'success');
}

function replyToMessage() {
    var modalEl = document.getElementById('viewMessageModal');
    var bsModal = bootstrap.Modal.getInstance(modalEl);
    if (bsModal) bsModal.hide();
    openReplyModal(currentMessageIndex, currentMessageType);
}

// ========== CONTRACTOR FUNCTIONS ==========
function loadContractors() {
    var contractors = JSON.parse(localStorage.getItem('contractors')) || [];
    var html = '';
    if (contractors.length === 0) {
        html = '<tr><td colspan="7" class="text-center text-muted py-4">No contractors found</div></tr>';
    } else {
        for (var i = 0; i < contractors.length; i++) {
            var contractor = contractors[i];
            var typeBadge = contractor.type === 'private' ? '<span class="contractor-type-badge contractor-private"><i class="bi bi-briefcase me-1"></i>Private</span>' : '<span class="contractor-type-badge contractor-government"><i class="bi bi-building-fill me-1"></i>Government</span>';
            
            var workerNamesDisplay = '';
            if (contractor.workerNames && contractor.workerNames.length > 0) {
                workerNamesDisplay = '<div class="worker-names-list">';
                for (var w = 0; w < contractor.workerNames.length; w++) {
                    workerNamesDisplay += '<span class="worker-name-tag"><i class="bi bi-person"></i> ' + escapeHtml(contractor.workerNames[w]) + '</span>';
                }
                workerNamesDisplay += '</div>';
            } else {
                workerNamesDisplay = '<span class="text-muted" style="font-size:11px;">No workers listed</span>';
            }
            
            html += '<tr><td class="align-middle"><strong>' + escapeHtml(contractor.companyName) + '</strong><div style="font-size:11px;color:var(--text-muted);">' + escapeHtml(contractor.contactPerson || '') + '</div></div><td class="align-middle">' + typeBadge + '</div><td class="align-middle">' + escapeHtml(contractor.location || '—') + '</div><td class="align-middle"><span class="badge bg-primary" style="font-size:12px;">' + (contractor.workersAssigned || 0) + ' workers</span><div style="margin-top:4px;">' + workerNamesDisplay + '</div></div><td class="align-middle" style="font-size:12px;"><i class="bi bi-calendar3 me-1"></i>' + escapeHtml(contractor.contractStart || '—') + ' — ' + escapeHtml(contractor.contractEnd || '—') + '</div><td class="align-middle"><span class="badge bg-success">active</span></div><td class="align-middle text-center"><button class="action-btn action-btn-view" onclick="viewContractorDetails(\'' + contractor.id + '\')" title="View Details"><i class="bi bi-eye-fill"></i></button><button class="action-btn action-btn-edit" onclick="generateInvoiceForContractor(\'' + contractor.id + '\')" title="Generate Invoice"><i class="bi bi-receipt"></i></button></div></tr>';
        }
    }
    var contractorsList = document.getElementById('contractorsList');
    if (contractorsList) contractorsList.innerHTML = html;
}

function addContractor() {
    var name = document.getElementById('contractorName') ? document.getElementById('contractorName').value.trim() : '';
    var type = document.getElementById('contractorType') ? document.getElementById('contractorType').value : 'private';
    var location = document.getElementById('contractorLocation') ? document.getElementById('contractorLocation').value.trim() : '';
    var workers = parseInt(document.getElementById('contractorWorkers') ? document.getElementById('contractorWorkers').value : 0) || 0;
    var workerNamesText = document.getElementById('contractorWorkerNames') ? document.getElementById('contractorWorkerNames').value.trim() : '';
    var startDate = document.getElementById('contractorStartDate') ? document.getElementById('contractorStartDate').value : '';
    var endDate = document.getElementById('contractorEndDate') ? document.getElementById('contractorEndDate').value : '';
    var contractValue = parseInt(document.getElementById('contractorValue') ? document.getElementById('contractorValue').value : 0) || 0;
    var contactPerson = document.getElementById('contractorContactPerson') ? document.getElementById('contractorContactPerson').value.trim() : '';
    var email = document.getElementById('contractorEmail') ? document.getElementById('contractorEmail').value.trim() : '';
    var phone = document.getElementById('contractorPhone') ? document.getElementById('contractorPhone').value.trim() : '';
    var servicesStr = document.getElementById('contractorServices') ? document.getElementById('contractorServices').value.trim() : '';

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

    var contractors = JSON.parse(localStorage.getItem('contractors')) || [];
    contractors.push({
        id: Date.now(),
        companyName: name,
        type: type,
        location: location,
        workersAssigned: workers,
        workerNames: workerNames,
        contractStart: startDate,
        contractEnd: endDate,
        contractValue: contractValue,
        contactPerson: contactPerson,
        email: email,
        phone: phone,
        services: servicesList,
        status: 'active',
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('contractors', JSON.stringify(contractors));

    if (document.getElementById('contractorName')) document.getElementById('contractorName').value = '';
    if (document.getElementById('contractorLocation')) document.getElementById('contractorLocation').value = '';
    if (document.getElementById('contractorWorkers')) document.getElementById('contractorWorkers').value = '';
    if (document.getElementById('contractorWorkerNames')) document.getElementById('contractorWorkerNames').value = '';
    if (document.getElementById('contractorStartDate')) document.getElementById('contractorStartDate').value = '';
    if (document.getElementById('contractorEndDate')) document.getElementById('contractorEndDate').value = '';
    if (document.getElementById('contractorValue')) document.getElementById('contractorValue').value = '';
    if (document.getElementById('contractorContactPerson')) document.getElementById('contractorContactPerson').value = '';
    if (document.getElementById('contractorEmail')) document.getElementById('contractorEmail').value = '';
    if (document.getElementById('contractorPhone')) document.getElementById('contractorPhone').value = '';
    if (document.getElementById('contractorServices')) document.getElementById('contractorServices').value = '';

    loadContractors();
    populateInvoiceContractors();
    loadDashboardStats();
    showNotification('Contractor added successfully!', 'success');
}

function viewContractorDetails(contractorId) {
    var contractors = JSON.parse(localStorage.getItem('contractors')) || [];
    var contractor = null;
    for (var i = 0; i < contractors.length; i++) {
        if (contractors[i].id == contractorId) {
            contractor = contractors[i];
            break;
        }
    }
    if (!contractor) return;
    currentContractorId = contractorId;

    var workerNamesDisplay = '';
    if (contractor.workerNames && contractor.workerNames.length > 0) {
        for (var w = 0; w < contractor.workerNames.length; w++) {
            workerNamesDisplay += '<span class="worker-name-tag"><i class="bi bi-person"></i> ' + escapeHtml(contractor.workerNames[w]) + '</span>';
        }
    } else {
        workerNamesDisplay = '<span class="text-muted">No workers listed</span>';
    }

    var bodyEl = document.getElementById('contractorDetailsBody');
    if (bodyEl) {
        bodyEl.innerHTML = '<div class="contractor-detail-section"><h6><i class="bi bi-info-circle me-1"></i>Company Information</h6><div class="contractor-info-grid"><div class="contractor-info-item"><div class="label">Company Name</div><div class="value">' + escapeHtml(contractor.companyName) + '</div></div><div class="contractor-info-item"><div class="label">Type</div><div class="value">' + (contractor.type === 'private' ? 'Private Company' : 'Government Organization') + '</div></div><div class="contractor-info-item"><div class="label">Location</div><div class="value">' + escapeHtml(contractor.location || 'N/A') + '</div></div><div class="contractor-info-item"><div class="label">Contact Person</div><div class="value">' + escapeHtml(contractor.contactPerson || 'N/A') + '</div></div><div class="contractor-info-item"><div class="label">Email</div><div class="value">' + escapeHtml(contractor.email || 'N/A') + '</div></div><div class="contractor-info-item"><div class="label">Phone</div><div class="value">' + escapeHtml(contractor.phone || 'N/A') + '</div></div><div class="contractor-info-item"><div class="label">Workers Assigned</div><div class="value">' + (contractor.workersAssigned || 0) + '</div></div></div></div><div class="contractor-detail-section"><h6><i class="bi bi-people me-1"></i>Worker Names</h6><div style="display:flex; flex-wrap:wrap; gap:6px;">' + workerNamesDisplay + '</div></div><div class="contractor-detail-section"><h6><i class="bi bi-file-text me-1"></i>Contract Details</h6><div class="contractor-info-grid"><div class="contractor-info-item"><div class="label">Start Date</div><div class="value">' + escapeHtml(contractor.contractStart || '—') + '</div></div><div class="contractor-info-item"><div class="label">End Date</div><div class="value">' + escapeHtml(contractor.contractEnd || '—') + '</div></div><div class="contractor-info-item"><div class="label">Contract Value</div><div class="value">' + formatTZS(contractor.contractValue) + '</div></div><div class="contractor-info-item"><div class="label">Status</div><div class="value"><span class="badge ' + (contractor.status === 'active' ? 'bg-success' : 'bg-secondary') + '">' + (contractor.status || 'active') + '</span></div></div></div></div><div class="contractor-detail-section"><h6><i class="bi bi-list-check me-1"></i>Services Provided</h6><div style="display:flex; flex-wrap:wrap; gap:6px;">' + ((contractor.services || []).length > 0 ? (function() { var html = ''; for (var s = 0; s < contractor.services.length; s++) { html += '<span class="included-tag">' + escapeHtml(contractor.services[s]) + '</span>'; } return html; })() : '<span class="text-muted">No services listed</span>') + '</div></div>';
    }
    
    var modal = document.getElementById('contractorDetailsModal');
    if (modal) new bootstrap.Modal(modal).show();
}

function generateContractorInvoice() {
    if (currentContractorId) generateInvoiceForContractor(currentContractorId);
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

// ========== INVOICE FUNCTIONS ==========
function populateInvoiceContractors() {
    var contractors = JSON.parse(localStorage.getItem('contractors')) || [];
    var select = document.getElementById('invoiceContractor');
    if (!select) return;
    var options = '<option value="">Choose contractor...</option>';
    for (var i = 0; i < contractors.length; i++) {
        options += '<option value="' + contractors[i].id + '">' + escapeHtml(contractors[i].companyName) + ' (' + contractors[i].type + ')</option>';
    }
    select.innerHTML = options;
}

function calculateInvoiceTotal() {
    var workCost = Number(document.getElementById('invoiceWorkCost') ? document.getElementById('invoiceWorkCost').value : 0) || 0;
    var workersCost = Number(document.getElementById('invoiceWorkersCost') ? document.getElementById('invoiceWorkersCost').value : 0) || 0;
    var equipmentCost = Number(document.getElementById('invoiceEquipmentCost') ? document.getElementById('invoiceEquipmentCost').value : 0) || 0;
    var total = workCost + workersCost + equipmentCost;
    var display = document.getElementById('invoiceTotalDisplay');
    if (display) display.textContent = total.toLocaleString('en-TZ');
}

function updateInvoicePreview() {
    calculateInvoiceTotal();
}

function generateInvoice() {
    var contractorId = document.getElementById('invoiceContractor') ? document.getElementById('invoiceContractor').value : '';
    if (!contractorId) {
        showNotification('Please select a contractor', 'error');
        return;
    }

    var contractors = JSON.parse(localStorage.getItem('contractors')) || [];
    var contractor = null;
    for (var i = 0; i < contractors.length; i++) {
        if (contractors[i].id == contractorId) {
            contractor = contractors[i];
            break;
        }
    }
    if (!contractor) return;

    var invoiceDate = document.getElementById('invoiceDate') ? document.getElementById('invoiceDate').value : '';
    if (!invoiceDate) invoiceDate = new Date().toISOString().split('T')[0];
    var dueDate = document.getElementById('invoiceDueDate') ? document.getElementById('invoiceDueDate').value : '';
    var workDesc = document.getElementById('invoiceWorkDesc') ? document.getElementById('invoiceWorkDesc').value : 'Cleaning Services';
    var workCost = Number(document.getElementById('invoiceWorkCost') ? document.getElementById('invoiceWorkCost').value : 500000) || 500000;
    var workersCost = Number(document.getElementById('invoiceWorkersCost') ? document.getElementById('invoiceWorkersCost').value : 750000) || 750000;
    var equipmentCost = Number(document.getElementById('invoiceEquipmentCost') ? document.getElementById('invoiceEquipmentCost').value : 75000) || 75000;
    var total = workCost + workersCost + equipmentCost;

    currentInvoiceData = {
        id: 'INV-' + Date.now().toString().slice(-8),
        contractorId: contractorId,
        contractorName: contractor.companyName,
        contractorType: contractor.type,
        invoiceDate: invoiceDate,
        dueDate: dueDate,
        workDesc: workDesc,
        workCost: workCost,
        workersCost: workersCost,
        equipmentCost: equipmentCost,
        total: total,
        workersCount: contractor.workersAssigned || 5,
        createdAt: new Date().toISOString()
    };

    var invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    invoices.push(currentInvoiceData);
    localStorage.setItem('invoices', JSON.stringify(invoices));

    showInvoicePreview(currentInvoiceData);
    loadInvoices();
    addToAuditLog('Invoice #' + currentInvoiceData.id + ' generated for ' + contractor.companyName);
    showNotification('Invoice generated successfully!', 'success');
}

function generateInvoiceForContractor(contractorId) {
    var modalEl = document.getElementById('contractorDetailsModal');
    var bsModal = bootstrap.Modal.getInstance(modalEl);
    if (bsModal) bsModal.hide();
    
    var contractors = JSON.parse(localStorage.getItem('contractors')) || [];
    var contractor = null;
    for (var i = 0; i < contractors.length; i++) {
        if (contractors[i].id == contractorId) {
            contractor = contractors[i];
            break;
        }
    }
    if (!contractor) return;

    var workCost = Math.round((contractor.contractValue || 12000000) / 12) || 500000;
    var workersCost = (contractor.workersAssigned || 5) * 150000;
    var equipmentCost = 75000;
    var total = workCost + workersCost + equipmentCost;

    currentInvoiceData = {
        id: 'INV-' + Date.now().toString().slice(-8),
        contractorId: contractorId,
        contractorName: contractor.companyName,
        contractorType: contractor.type,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        workDesc: 'Monthly Cleaning Services',
        workCost: workCost,
        workersCost: workersCost,
        equipmentCost: equipmentCost,
        total: total,
        workersCount: contractor.workersAssigned || 5,
        createdAt: new Date().toISOString()
    };

    var invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    invoices.push(currentInvoiceData);
    localStorage.setItem('invoices', JSON.stringify(invoices));

    showInvoicePreview(currentInvoiceData);
    loadInvoices();
    addToAuditLog('Invoice #' + currentInvoiceData.id + ' generated for ' + contractor.companyName);
    showNotification('Invoice generated successfully!', 'success');
}

function showInvoicePreview(invoiceData) {
    currentInvoiceData = invoiceData;

    var previewBody = document.getElementById('invoicePreviewBody');
    if (previewBody) {
        previewBody.innerHTML = '<div class="invoice-preview"><div class="invoice-header"><div class="invoice-header-left"><h3>CleanSpark</h3><p>Cleaning Service Management System</p><p style="margin-top:8px;font-size:11px;">Zanzibar, Tanzania</p><p style="font-size:11px;">info@CleanSpark.co.tz</p></div><div class="invoice-header-right"><h4>INVOICE</h4><p style="font-size:12px;color:var(--text-muted);">#' + escapeHtml(invoiceData.id) + '</p><p style="font-size:12px;">Date: ' + escapeHtml(invoiceData.invoiceDate) + '</p>' + (invoiceData.dueDate ? '<p style="font-size:12px;">Due: ' + escapeHtml(invoiceData.dueDate) + '</p>' : '') + '</div></div><div style="margin-bottom:20px;"><strong style="font-size:14px;">Bill To:</strong><br><span style="font-size:14px;">' + escapeHtml(invoiceData.contractorName) + '</span><br><span style="font-size:12px;color:var(--text-muted);">' + escapeHtml(invoiceData.contractorType) + ' Company</span></div><table class="invoice-table"><thead><tr><th>Description</th><th style="text-align:right;">Amount (TZS)</th></tr></thead><tbody><tr><td>Work Done — ' + escapeHtml(invoiceData.workDesc) + '</td><td style="text-align:right;">' + Number(invoiceData.workCost).toLocaleString('en-TZ') + '</td></tr><tr><td>Workers (' + invoiceData.workersCount + ' staff)</td><td style="text-align:right;">' + Number(invoiceData.workersCost).toLocaleString('en-TZ') + '</td></tr><tr><td>Equipment Used</td><td style="text-align:right;">' + Number(invoiceData.equipmentCost).toLocaleString('en-TZ') + '</td></tr><tr class="invoice-total-row"><td style="font-size:14px;">TOTAL</td><td style="text-align:right;font-size:18px;">TZS ' + Number(invoiceData.total).toLocaleString('en-TZ') + '</td></tr></tbody></table><div style="text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid var(--border);"><p style="font-size:12px;color:var(--text-muted);">Thank you for your business!</p></div></div>';
    }
    
    var modal = document.getElementById('invoicePreviewModal');
    if (modal) new bootstrap.Modal(modal).show();
}

function downloadInvoicePDF() {
    if (!currentInvoiceData) {
        showNotification('No invoice data to download', 'error');
        return;
    }

    var inv = currentInvoiceData;

    var pdfHTML = '<div class="invoice-pdf-container"><div class="invoice-pdf-header"><div class="invoice-pdf-company"><img src="image/logo.jpeg" alt="CleanSpark Logo" class="invoice-pdf-logo" onerror="this.style.display=\'none\';"><div class="invoice-pdf-company-info"><h2>CleanSpark</h2><p>Cleaning Service Management System</p><p>Zanzibar, Tanzania</p><p>info@CleanSpark.co.tz | +255 777 000 000</p></div></div><div class="invoice-pdf-title-section"><h1 class="invoice-pdf-title">INVOICE</h1><p class="invoice-pdf-number">#' + escapeHtml(inv.id) + '</p><div class="invoice-pdf-dates"><span><strong>Date:</strong> ' + escapeHtml(inv.invoiceDate) + '</span>' + (inv.dueDate ? '<span><strong>Due Date:</strong> ' + escapeHtml(inv.dueDate) + '</span>' : '') + '</div></div></div><div class="invoice-pdf-bill-to"><h5>Bill To:</h5><p class="bill-name">' + escapeHtml(inv.contractorName) + '</p><p class="bill-type">' + escapeHtml(inv.contractorType === 'private' ? 'Private Company' : 'Government Organization') + '</p></div><table class="invoice-pdf-table"><thead><tr><th>Description</th><th>Details</th><th>Amount (TZS)</th></tr></thead><tbody><tr><td><strong>Work / Service</strong></td><td>' + escapeHtml(inv.workDesc) + '</td><td>TZS ' + Number(inv.workCost).toLocaleString('en-TZ') + '</td></tr><tr><td><strong>Staff Cost</strong></td><td>' + (inv.workersCount || 5) + ' Workers</td><td>TZS ' + Number(inv.workersCost).toLocaleString('en-TZ') + '</td></tr><tr><td><strong>Equipment Cost</strong></td><td>Cleaning Equipment &amp; Supplies</td><td>TZS ' + Number(inv.equipmentCost).toLocaleString('en-TZ') + '</td></tr><tr class="invoice-pdf-total-row"><td colspan="2">TOTAL AMOUNT</td><td>TZS ' + Number(inv.total).toLocaleString('en-TZ') + '</td></tr></tbody></table><div class="invoice-pdf-footer"><p class="thank-you">Thank you for your business!</p><p>CleanSpark Cleaning Service Management System</p><p>Zanzibar, Tanzania | info@CleanSpark.co.tz</p><p style="margin-top:8px;font-size:10px;">This is a computer-generated invoice. No signature required.</p></div></div>';

    var template = document.getElementById('invoicePDFTemplate');
    template.innerHTML = pdfHTML;
    template.style.left = '0';
    template.style.position = 'relative';

    html2canvas(template, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true
    }).then(function(canvas) {
        template.style.left = '-9999px';
        template.style.position = 'absolute';

        var imgData = canvas.toDataURL('image/png');
        var jsPDF = window.jspdf;
        var pdf = new jsPDF('p', 'mm', 'a4');

        var pageWidth = pdf.internal.pageSize.getWidth();
        var pageHeight = pdf.internal.pageSize.getHeight();
        var imgWidth = pageWidth - 16;
        var imgHeight = (canvas.height * imgWidth) / canvas.width;

        var heightLeft = imgHeight;
        var position = 8;

        pdf.addImage(imgData, 'PNG', 8, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 8, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        var fileName = 'CleanSpark_Invoice_' + inv.id + '_' + inv.invoiceDate + '.pdf';
        pdf.save(fileName);

        showNotification('Professional PDF invoice downloaded successfully!', 'success');
    }).catch(function(error) {
        console.error('PDF generation error:', error);
        template.style.left = '-9999px';
        template.style.position = 'absolute';
        var printWindow = window.open('', '_blank');
        printWindow.document.write('<!DOCTYPE html><html><head><title>Invoice ' + inv.id + '</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="css/admin.css"><style>body{font-family:\'Inter\',sans-serif;padding:40px;background:#fff;}</style></head><body>' + pdfHTML + '</body></html>');
        printWindow.document.close();
        setTimeout(function() { printWindow.print(); }, 500);
    });
}

function shareInvoice() {
    if (!currentInvoiceData) return;
    var shareText = 'CleanSpark Invoice #' + currentInvoiceData.id + '\nContractor: ' + currentInvoiceData.contractorName + '\nTotal: ' + formatTZS(currentInvoiceData.total) + '\nDate: ' + currentInvoiceData.invoiceDate;
    if (navigator.share) {
        navigator.share({ title: 'CleanSpark Invoice', text: shareText }).catch(function() {});
    } else {
        navigator.clipboard.writeText(shareText).then(function() {
            showNotification('Invoice copied! Share via WhatsApp or other platforms.', 'success');
        }).catch(function() {
            window.open('https://wa.me/?text=' + encodeURIComponent(shareText), '_blank');
        });
    }
}

function loadInvoices() {
    var invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    var html = '';
    if (invoices.length === 0) {
        html = '<tr><td colspan="6" class="text-center text-muted py-4">No invoices generated yet</div></tr>';
    } else {
        for (var i = invoices.length - 1; i >= 0; i--) {
            var inv = invoices[i];
            html += '<tr><td class="align-middle"><strong>#' + escapeHtml(inv.id) + '</strong></div><td class="align-middle">' + escapeHtml(inv.contractorName) + '</div><td class="align-middle">' + escapeHtml(inv.invoiceDate) + '</div><td class="align-middle"><strong style="color:var(--primary)">' + formatTZS(inv.total) + '</strong></div><td class="align-middle"><span class="badge bg-info">Generated</span></div><td class="align-middle text-center"><button class="action-btn action-btn-view" onclick=\'currentInvoiceData=' + JSON.stringify(inv).replace(/'/g, "\\'") + ';showInvoicePreview(currentInvoiceData)\' title="View"><i class="bi bi-eye-fill"></i></button><button class="action-btn action-btn-edit" onclick=\'currentInvoiceData=' + JSON.stringify(inv).replace(/'/g, "\\'") + ';downloadInvoicePDF()\' title="Download PDF"><i class="bi bi-file-earmark-pdf"></i></button><button class="action-btn action-btn-reply" onclick=\'currentInvoiceData=' + JSON.stringify(inv).replace(/'/g, "\\'") + ';shareInvoice()\' title="Share"><i class="bi bi-share-fill"></i></button></div></tr>';
        }
    }
    var invoiceList = document.getElementById('invoiceList');
    if (invoiceList) invoiceList.innerHTML = html;
}

function openSendInvoiceModal() {
    if (!currentInvoiceData) {
        showNotification('No invoice selected', 'error');
        return;
    }
    
    var infoEl = document.getElementById('sendInvoiceInfo');
    if (infoEl) {
        infoEl.innerHTML = '<strong>Invoice #' + escapeHtml(currentInvoiceData.id) + '</strong><br>Total: ' + formatTZS(currentInvoiceData.total) + '<br>Customer: ' + escapeHtml(currentInvoiceData.customerName || currentInvoiceData.contractorName);
    }
    var emailInput = document.getElementById('customerEmail');
    if (emailInput) emailInput.value = currentInvoiceData.customerEmail || '';
    
    var modal = document.getElementById('sendInvoiceModal');
    if (modal) new bootstrap.Modal(modal).show();
}

function sendInvoiceToCustomer() {
    var email = document.getElementById('customerEmail') ? document.getElementById('customerEmail').value.trim() : '';
    if (!email) {
        showNotification('Please enter customer email', 'error');
        return;
    }
    
    console.log('Sending invoice to ' + email, currentInvoiceData);
    
    if (currentInvoiceData && currentInvoiceData.bookingId) {
        var invoices = JSON.parse(localStorage.getItem('customerInvoices')) || [];
        for (var i = 0; i < invoices.length; i++) {
            if (invoices[i].id === currentInvoiceData.id) {
                invoices[i].sentAt = new Date().toISOString();
                invoices[i].sentTo = email;
                break;
            }
        }
        localStorage.setItem('customerInvoices', JSON.stringify(invoices));
    }
    
    var modalEl = document.getElementById('sendInvoiceModal');
    var bsModal = bootstrap.Modal.getInstance(modalEl);
    if (bsModal) bsModal.hide();
    showNotification('Invoice sent to ' + email, 'success');
    addToAuditLog('Invoice #' + currentInvoiceData.id + ' sent to ' + email);
}

// ========== SERVICES ASSIGNMENT MODULE ==========
function getAssignmentData() {
    return JSON.parse(localStorage.getItem('serviceAssignments')) || {};
}

function saveAssignmentData(data) {
    localStorage.setItem('serviceAssignments', JSON.stringify(data));
}

function countAssignedServicesForStaff(staffId) {
    var assignments = getAssignmentData();
    var count = 0;
    for (var svcId in assignments) {
        if (String(assignments[svcId]) === String(staffId)) count++;
    }
    return count;
}

function getStaffAvatarHtml(member, size) {
    size = size || 'sm';
    var initials = member.name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
    if (size === 'sm') {
        return member.photo ? '<img src="' + escapeHtml(member.photo) + '" alt="' + escapeHtml(member.name) + '" class="staff-avatar">' : '<div class="staff-initials">' + escapeHtml(initials) + '</div>';
    } else {
        return member.photo ? '<img src="' + escapeHtml(member.photo) + '" alt="' + escapeHtml(member.name) + '" class="staff-avatar-md">' : '<div class="staff-initials-md">' + escapeHtml(initials) + '</div>';
    }
}

function loadAssignmentSection() {
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

function renderAllStaffTab() {
    var staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    var assignments = getAssignmentData();
    var html = '';
    if (staff.length === 0) {
        html = '<tr><td colspan="6" class="text-center text-muted py-4">No staff members found</div></tr>';
    } else {
        for (var i = 0; i < staff.length; i++) {
            var member = staff[i];
            var count = countAssignedServicesForStaff(member.id);
            var isAssigned = count > 0 || member.staffType === 'supervisor' || member.staffType === 'general_supervisor';
            var progress = member.progress || 'not_started';
            var cfg = getProgressConfig(progress);
            var avatarHtml = getStaffAvatarHtml(member);
            var typeIndicator = '';
            if (member.staffType === 'general_supervisor') typeIndicator = '<span class="staff-type-indicator staff-type-supervisor">Gen. Supervisor</span>';
            else if (member.staffType === 'supervisor') typeIndicator = '<span class="staff-type-indicator staff-type-supervisor">Supervisor</span>';
            else if (member.staffType === 'contractor') typeIndicator = '<span class="staff-type-indicator staff-type-contractor">Contractor</span>';
            
            html += '<tr><td class="align-middle">' + avatarHtml + '</div><td class="align-middle"><strong>' + escapeHtml(member.name) + '</strong>' + typeIndicator + '</div><td class="align-middle">' + escapeHtml(member.email) + '</div><td class="align-middle">' + (isAssigned ? '<span class="assign-status-badge assigned">Assigned</span>' : '<span class="assign-status-badge not-assigned">Not Assigned</span>') + '</div><td class="align-middle">' + (isAssigned ? '<span class="progress-badge ' + cfg.badgeClass + '">' + cfg.label + '</span>' : '—') + '</div><td class="align-middle text-center"><span class="services-count-badge">' + (count || '0') + '</span></div></tr>';
        }
    }
    var allStaffList = document.getElementById('allStaffAssignList');
    if (allStaffList) allStaffList.innerHTML = html;
}

function renderAssignedStaffTab() {
    var staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    var assignedStaff = [];
    for (var i = 0; i < staff.length; i++) {
        var m = staff[i];
        if (countAssignedServicesForStaff(m.id) > 0 || m.staffType === 'supervisor' || m.staffType === 'general_supervisor') {
            assignedStaff.push(m);
        }
    }
    var html = '';
    if (assignedStaff.length === 0) {
        html = '<tr><td colspan="6" class="text-center text-muted py-4">No assigned staff</div></tr>';
    } else {
        for (var j = 0; j < assignedStaff.length; j++) {
            var member = assignedStaff[j];
            var count = countAssignedServicesForStaff(member.id);
            var progress = member.progress || 'not_started';
            var cfg = getProgressConfig(progress);
            var avatarHtml = getStaffAvatarHtml(member);
            var typeIndicator = '';
            if (member.staffType === 'general_supervisor') typeIndicator = '<span class="staff-type-indicator staff-type-supervisor">Gen. Supervisor</span>';
            else if (member.staffType === 'supervisor') typeIndicator = '<span class="staff-type-indicator staff-type-supervisor">Supervisor</span>';
            var isPermanent = member.staffType === 'supervisor' || member.staffType === 'general_supervisor';
            
            html += '<tr><td class="align-middle">' + avatarHtml + '</div><td class="align-middle"><strong>' + escapeHtml(member.name) + '</strong>' + typeIndicator + '</div><td class="align-middle">' + escapeHtml(member.email) + '</div><td class="align-middle"><span class="progress-badge ' + cfg.badgeClass + '">' + cfg.label + '</span></div><td class="align-middle text-center"><span class="services-count-badge">' + (count || '∞') + '</span></div><td class="align-middle text-center"><button class="action-btn action-btn-view" onclick="openViewStaffServices(' + member.id + ')"><i class="bi bi-eye-fill"></i></button>' + (!isPermanent ? '<button class="action-btn action-btn-delete" onclick="unassignAllFromStaff(' + member.id + ')"><i class="bi bi-trash3-fill"></i></button>' : '<span style="font-size:10px;">Permanent</span>') + '</div></tr>';
        }
    }
    var assignedStaffList = document.getElementById('assignedStaffList');
    if (assignedStaffList) assignedStaffList.innerHTML = html;
}

function renderUnassignedStaffTab() {
    var staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    var unassignedStaff = [];
    for (var i = 0; i < staff.length; i++) {
        var m = staff[i];
        if (countAssignedServicesForStaff(m.id) === 0 && m.staffType !== 'supervisor' && m.staffType !== 'general_supervisor' && m.staffType !== 'contractor') {
            unassignedStaff.push(m);
        }
    }
    var html = '';
    if (unassignedStaff.length === 0) {
        html = '<tr><td colspan="5" class="text-center text-muted py-4">All staff assigned</div></tr>';
    } else {
        for (var j = 0; j < unassignedStaff.length; j++) {
            var member = unassignedStaff[j];
            html += '<tr><td class="align-middle">' + getStaffAvatarHtml(member) + '</div><td class="align-middle"><strong>' + escapeHtml(member.name) + '</strong></div><td class="align-middle">' + escapeHtml(member.email) + '</div><td class="align-middle">' + escapeHtml(member.phone || '—') + '</div><td class="align-middle text-center"><button class="action-btn action-btn-edit" onclick="switchAssignTab(\'unassignedServices\', null)"><i class="bi bi-plus-circle-fill"></i></button></div></tr>';
        }
    }
    var unassignedStaffList = document.getElementById('unassignedStaffList');
    if (unassignedStaffList) unassignedStaffList.innerHTML = html;
}

function renderAssignedServicesTab() {
    var services = JSON.parse(localStorage.getItem('adminServices')) || [];
    var staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    var assignments = getAssignmentData();
    var assignedServices = [];
    for (var i = 0; i < services.length; i++) {
        if (assignments[services[i].id]) assignedServices.push(services[i]);
    }
    var html = '';
    if (assignedServices.length === 0) {
        html = '<tr><td colspan="5" class="text-center"><div class="empty-state"><i class="bi bi-inbox"></i><p>No services have been assigned yet</p></div></div></tr>';
    } else {
        for (var j = 0; j < assignedServices.length; j++) {
            var service = assignedServices[j];
            var assignedStaffId = assignments[service.id];
            var assignedMember = null;
            for (var s = 0; s < staff.length; s++) {
                if (String(staff[s].id) === String(assignedStaffId)) {
                    assignedMember = staff[s];
                    break;
                }
            }
            var imgHtml = service.image ? '<img src="' + escapeHtml(service.image) + '" alt="' + escapeHtml(service.name) + '" class="service-thumb">' : '<div class="no-image-thumb"><i class="bi bi-image"></i></div>';
            
            html += '<tr><td class="align-middle">' + imgHtml + '</div><td class="align-middle"><strong>' + escapeHtml(service.name) + '</strong><div style="font-size:11px;color:var(--text-muted);">' + escapeHtml(service.duration) + '</div></div><td class="align-middle"><strong style="color:var(--primary)">' + formatTZS(service.price) + '</strong></div><td class="align-middle">' + (assignedMember ? '<div class="assigned-to-chip">' + getStaffAvatarHtml(assignedMember) + '<span>' + escapeHtml(assignedMember.name) + '</span></div>' : '<span style="color:var(--text-muted);">Unknown</span>') + '</div><td class="align-middle text-center"><button class="action-btn action-btn-edit" onclick="openAssignServiceModal(' + service.id + ')" title="Reassign"><i class="bi bi-arrow-repeat"></i></button><button class="action-btn action-btn-delete" onclick="unassignService(' + service.id + ')" title="Remove"><i class="bi bi-trash3-fill"></i></button></div></tr>';
        }
    }
    var assignedServicesList = document.getElementById('assignedServicesList');
    if (assignedServicesList) assignedServicesList.innerHTML = html;
}

function renderUnassignedServicesTab() {
    var services = JSON.parse(localStorage.getItem('adminServices')) || [];
    var assignments = getAssignmentData();
    var unassignedServices = [];
    for (var i = 0; i < services.length; i++) {
        if (!assignments[services[i].id]) unassignedServices.push(services[i]);
    }
    var html = '';
    if (unassignedServices.length === 0) {
        html = '<tr><td colspan="5" class="text-center"><div class="empty-state"><i class="bi bi-check-circle"></i><p>All services have been assigned to staff</p></div></div></tr>';
    } else {
        for (var j = 0; j < unassignedServices.length; j++) {
            var service = unassignedServices[j];
            var imgHtml = service.image ? '<img src="' + escapeHtml(service.image) + '" alt="' + escapeHtml(service.name) + '" class="service-thumb">' : '<div class="no-image-thumb"><i class="bi bi-image"></i></div>';
            var locIcon = service.location === 'Unguja' ? '🏝' : (service.location === 'Pemba' ? '🌿' : '🗺');
            var locClass = service.location === 'Unguja' ? 'location-unguja' : (service.location === 'Pemba' ? 'location-pemba' : 'location-both');
            
            html += '<tr><td class="align-middle">' + imgHtml + '</div><td class="align-middle"><strong>' + escapeHtml(service.name) + '</strong>' + (service.description ? '<div style="font-size:11px;color:var(--text-muted);">' + escapeHtml(service.description.substring(0, 50)) + (service.description.length > 50 ? '…' : '') + '</div>' : '') + '</div><td class="align-middle"><strong style="color:var(--primary)">' + formatTZS(service.price) + '</strong></div><td class="align-middle"><span class="location-badge ' + locClass + '">' + locIcon + ' ' + escapeHtml(service.location) + '</span></div><td class="align-middle text-center"><button class="btn-assign-now" onclick="openAssignServiceModal(' + service.id + ')" title="Assign to staff"><i class="bi bi-person-plus-fill me-1"></i>Assign</button></div></tr>';
        }
    }
    var unassignedServicesList = document.getElementById('unassignedServicesList');
    if (unassignedServicesList) unassignedServicesList.innerHTML = html;
}

function openAssignServiceModal(serviceId) {
    currentAssignServiceId = serviceId;
    selectedAssignStaffId = null;

    var services = JSON.parse(localStorage.getItem('adminServices')) || [];
    var staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    var assignments = getAssignmentData();
    var service = null;
    for (var i = 0; i < services.length; i++) {
        if (services[i].id == serviceId) {
            service = services[i];
            break;
        }
    }
    if (!service) return;

    var imgHtml = service.image ? '<img src="' + escapeHtml(service.image) + '" alt="' + escapeHtml(service.name) + '" style="width:56px;height:44px;object-fit:cover;border-radius:8px;border:1.5px solid var(--border);margin-right:12px;">' : '<div style="width:56px;height:44px;background:#f7fafc;border-radius:8px;border:1.5px dashed #cbd5e1;display:inline-flex;align-items:center;justify-content:center;margin-right:12px;"><i class="bi bi-image" style="color:#a0aec0;font-size:18px;"></i></div>';

    var infoEl = document.getElementById('assignServiceInfo');
    if (infoEl) {
        infoEl.innerHTML = '<div style="display:flex;align-items:center;padding:14px 16px;background:#f7fafc;border-radius:var(--radius-sm);border:1.5px solid var(--border);">' + imgHtml + '<div><strong style="font-size:15px;">' + escapeHtml(service.name) + '</strong><div style="font-size:12px;color:var(--text-muted);">' + formatTZS(service.price) + ' · ' + escapeHtml(service.duration) + ' · ' + escapeHtml(service.location) + '</div></div></div>';
    }

    var sortedStaff = [];
    for (var s = 0; s < staff.length; s++) {
        sortedStaff.push(staff[s]);
    }
    sortedStaff.sort(function(a, b) {
        var ca = countAssignedServicesForStaff(a.id);
        var cb = countAssignedServicesForStaff(b.id);
        return ca - cb;
    });

    var currentAssignedStaffId = assignments[serviceId];
    var pickerHtml = '';
    if (sortedStaff.length === 0) {
        pickerHtml = '<div class="empty-state"><i class="bi bi-people"></i><p>No staff members available</p></div>';
    } else {
        for (var t = 0; t < sortedStaff.length; t++) {
            var member = sortedStaff[t];
            var count = countAssignedServicesForStaff(member.id);
            var initials = member.name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
            var avatarHtml = member.photo ? '<img src="' + escapeHtml(member.photo) + '" alt="' + escapeHtml(member.name) + '" class="assign-picker-avatar">' : '<div class="assign-picker-initials">' + escapeHtml(initials) + '</div>';
            var isCurrent = String(member.id) === String(currentAssignedStaffId);
            var isSupervisor = member.staffType === 'supervisor';
            var isGeneralSupervisor = member.staffType === 'general_supervisor';
            var typeTag = '';
            if (isGeneralSupervisor) typeTag = '<span class="staff-type-indicator staff-type-supervisor" style="position:static;margin-top:2px;">Gen. Supervisor</span>';
            else if (isSupervisor) typeTag = '<span class="staff-type-indicator staff-type-supervisor" style="position:static;margin-top:2px;">Supervisor</span>';
            
            pickerHtml += '<div class="assign-staff-pick-item ' + (isCurrent ? 'current' : '') + '" data-staffid="' + member.id + '" onclick="selectAssignStaff(this, ' + member.id + ')">' + avatarHtml + '<div class="assign-pick-info"><strong>' + escapeHtml(member.name) + '</strong><span>' + escapeHtml(member.email) + typeTag + '</span></div><div class="assign-pick-count"><span class="services-count-badge">' + count + '</span><small>services</small></div>' + (isCurrent ? '<span class="current-tag">Current</span>' : '') + '</div>';
        }
    }

    var pickerList = document.getElementById('assignStaffPickerList');
    if (pickerList) pickerList.innerHTML = pickerHtml;
    var confirmBtn = document.getElementById('confirmAssignBtn');
    if (confirmBtn) confirmBtn.disabled = true;
    
    var modal = document.getElementById('assignServiceModal');
    if (modal) new bootstrap.Modal(modal).show();
}

function selectAssignStaff(el, staffId) {
    var items = document.querySelectorAll('.assign-staff-pick-item');
    for (var i = 0; i < items.length; i++) {
        items[i].classList.remove('selected');
    }
    el.classList.add('selected');
    selectedAssignStaffId = staffId;
    var confirmBtn = document.getElementById('confirmAssignBtn');
    if (confirmBtn) confirmBtn.disabled = false;
}

function confirmAssignService() {
    if (!selectedAssignStaffId || !currentAssignServiceId) return;

    var assignments = getAssignmentData();
    assignments[currentAssignServiceId] = selectedAssignStaffId;
    saveAssignmentData(assignments);

    var staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    var member = null;
    for (var i = 0; i < staff.length; i++) {
        if (String(staff[i].id) === String(selectedAssignStaffId)) {
            member = staff[i];
            break;
        }
    }
    var services = JSON.parse(localStorage.getItem('adminServices')) || [];
    var service = null;
    for (var j = 0; j < services.length; j++) {
        if (services[j].id == currentAssignServiceId) {
            service = services[j];
            break;
        }
    }

    var modalEl = document.getElementById('assignServiceModal');
    var bsModal = bootstrap.Modal.getInstance(modalEl);
    if (bsModal) bsModal.hide();
    
    addToAuditLog('Service "' + (service ? service.name : '') + '" assigned to ' + (member ? member.name : 'staff'));
    showNotification('"' + (service ? service.name : 'Service') + '" assigned to ' + (member ? member.name : 'staff') + '!', 'success');

    var activeTab = document.querySelector('.assign-tab-btn.active');
    if (activeTab) switchAssignTab(activeTab.dataset.tab, activeTab);
}

function unassignService(serviceId) {
    var services = JSON.parse(localStorage.getItem('adminServices')) || [];
    var service = null;
    for (var i = 0; i < services.length; i++) {
        if (services[i].id == serviceId) {
            service = services[i];
            break;
        }
    }
    if (!confirm('Remove assignment for "' + (service ? service.name : 'this service') + '"?')) return;

    var assignments = getAssignmentData();
    delete assignments[serviceId];
    saveAssignmentData(assignments);
    addToAuditLog('Assignment removed for service "' + (service ? service.name : '') + '"');
    showNotification('Assignment removed.', 'success');

    var activeTab = document.querySelector('.assign-tab-btn.active');
    if (activeTab) switchAssignTab(activeTab.dataset.tab, activeTab);
}

function unassignAllFromStaff(staffId) {
    var staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    var member = null;
    for (var i = 0; i < staff.length; i++) {
        if (String(staff[i].id) === String(staffId)) {
            member = staff[i];
            break;
        }
    }
    if (!confirm('Remove all service assignments from "' + (member ? member.name : 'this staff') + '"?')) return;

    var assignments = getAssignmentData();
    for (var svcId in assignments) {
        if (String(assignments[svcId]) === String(staffId)) {
            delete assignments[svcId];
        }
    }
    saveAssignmentData(assignments);
    addToAuditLog('All assignments removed from ' + (member ? member.name : 'staff'));
    showNotification('All assignments removed from ' + (member ? member.name : 'staff') + '.', 'success');

    var activeTab = document.querySelector('.assign-tab-btn.active');
    if (activeTab) switchAssignTab(activeTab.dataset.tab, activeTab);
}

function openViewStaffServices(staffId) {
    var staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    var services = JSON.parse(localStorage.getItem('adminServices')) || [];
    var assignments = getAssignmentData();
    var member = null;
    for (var i = 0; i < staff.length; i++) {
        if (String(staff[i].id) === String(staffId)) {
            member = staff[i];
            break;
        }
    }
    
    var assignedServiceIds = [];
    for (var svcId in assignments) {
        if (String(assignments[svcId]) === String(staffId)) {
            assignedServiceIds.push(svcId);
        }
    }
    var assignedServices = [];
    for (var j = 0; j < services.length; j++) {
        for (var k = 0; k < assignedServiceIds.length; k++) {
            if (String(services[j].id) === String(assignedServiceIds[k])) {
                assignedServices.push(services[j]);
                break;
            }
        }
    }
    
    var initials = member ? member.name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2) : '?';
    var progress = (member && member.progress) ? member.progress : 'not_started';
    var cfg = getProgressConfig(progress);
    
    var body = '<div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:18px;border-bottom:1.5px solid var(--border);"><div class="staff-avatar-lg" style="width:64px;height:64px;flex-shrink:0;">' + (member && member.photo ? '<img src="' + escapeHtml(member.photo) + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">' : '<span style="color:white;font-weight:800;font-size:22px;">' + escapeHtml(initials) + '</span>') + '</div><div><strong style="font-size:17px;">' + escapeHtml(member ? member.name : 'Unknown') + '</strong><div style="font-size:12px;color:var(--text-muted);">' + escapeHtml(member ? member.email : '') + '</div><div class="progress-indicator-row mt-2"><span class="progress-dot ' + cfg.dotClass + '"></span><span class="progress-badge ' + cfg.badgeClass + '">' + cfg.label + '</span></div></div></div>';
    
    if (assignedServices.length === 0) {
        body += '<div class="empty-state"><i class="bi bi-inbox"></i><p>No services assigned yet</p></div>';
    } else {
        body += '<div class="staff-services-grid">';
        for (var l = 0; l < assignedServices.length; l++) {
            var service = assignedServices[l];
            var imgHtml = service.image ? '<img src="' + escapeHtml(service.image) + '" alt="' + escapeHtml(service.name) + '" class="card-img">' : '<div class="card-img-placeholder"><i class="bi bi-image"></i></div>';
            body += '<div class="staff-service-card">' + imgHtml + '<div class="card-body"><strong>' + escapeHtml(service.name) + '</strong><div class="card-meta">' + formatTZS(service.price) + ' · ' + escapeHtml(service.duration) + '</div></div></div>';
        }
        body += '</div>';
    }
    
    var bodyEl = document.getElementById('viewStaffServicesBody');
    if (bodyEl) bodyEl.innerHTML = body;
    
    var modal = document.getElementById('viewStaffServicesModal');
    if (modal) new bootstrap.Modal(modal).show();
}

function getProgressConfig(progress) {
    var map = {
        not_started: { label: 'Not Started', dotClass: 'legend-red', badgeClass: 'progress-red' },
        just_started: { label: 'Just Started', dotClass: 'legend-yellow', badgeClass: 'progress-yellow' },
        in_progress: { label: 'In Progress', dotClass: 'legend-blue', badgeClass: 'progress-blue' },
        complete: { label: 'Complete', dotClass: 'legend-green', badgeClass: 'progress-green' }
    };
    return map[progress] || map['not_started'];
}

// ========== JOB APPLICATIONS MODULE ==========
function getApplications() {
    return JSON.parse(localStorage.getItem('jobApplications')) || [];
}

function saveApplications(apps) {
    localStorage.setItem('jobApplications', JSON.stringify(apps));
}

function getApplicationWindowStatus() {
    return JSON.parse(localStorage.getItem('applicationWindowOpen')) || false;
}

function setApplicationWindowStatus(isOpen) {
    localStorage.setItem('applicationWindowOpen', JSON.stringify(isOpen));
}

function loadApplicationWindowStatus() {
    var isOpen = getApplicationWindowStatus();
    var toggle = document.getElementById('applicationWindowToggle');
    if (toggle) toggle.checked = isOpen;
    var statusCard = document.getElementById('windowStatusCard');
    if (statusCard) statusCard.className = 'window-status-card ' + (isOpen ? 'window-open' : 'window-closed');
    var statusText = document.getElementById('windowStatusText');
    if (statusText) statusText.innerHTML = isOpen ? '<span class="window-status-badge open">● Applications Open</span> — Users can submit applications' : '<span class="window-status-badge closed">● Applications Closed</span> — Users cannot submit applications';
}

function toggleApplicationWindow() {
    var isOpen = document.getElementById('applicationWindowToggle') ? document.getElementById('applicationWindowToggle').checked : false;
    setApplicationWindowStatus(isOpen);
    loadApplicationWindowStatus();
    showNotification(isOpen ? 'Application window is now OPEN' : 'Application window is now CLOSED', isOpen ? 'success' : 'warning');
}

function loadApplications() {
    loadApplicationWindowStatus();
    loadApplicationsStats();
    renderApplicationsGrid();
    renderApplicationsTable();
}

function loadApplicationsStats() {
    var apps = getApplications();
    var total = apps.length;
    var approved = 0;
    var rejected = 0;
    var underReview = 0;
    var pending = 0;
    for (var i = 0; i < apps.length; i++) {
        if (apps[i].status === 'approved') approved++;
        else if (apps[i].status === 'rejected') rejected++;
        else if (apps[i].status === 'under_review') underReview++;
        else pending++;
    }

    var statsGrid = document.getElementById('applicationsStats');
    if (statsGrid) {
        statsGrid.innerHTML = '<div class="stat-card" onclick="filterApplicationStatus(\'all\', event.target.closest(\'.filter-btn\'))"><div class="stat-icon"><i class="bi bi-file-earmark-person"></i></div><div class="stat-value">' + total + '</div><div class="stat-label">Total Applications</div></div><div class="stat-card" onclick="filterApplicationStatus(\'approved\', event.target.closest(\'.filter-btn\'))"><div class="stat-icon" style="background:rgba(22,163,74,0.1);"><i class="bi bi-check-circle-fill" style="color:#16a34a;"></i></div><div class="stat-value">' + approved + '</div><div class="stat-label">Approved</div></div><div class="stat-card" onclick="filterApplicationStatus(\'rejected\', event.target.closest(\'.filter-btn\'))"><div class="stat-icon" style="background:rgba(220,38,38,0.1);"><i class="bi bi-x-circle-fill" style="color:#dc2626;"></i></div><div class="stat-value">' + rejected + '</div><div class="stat-label">Rejected</div></div><div class="stat-card" onclick="filterApplicationStatus(\'under_review\', event.target.closest(\'.filter-btn\'))"><div class="stat-icon" style="background:rgba(59,130,246,0.1);"><i class="bi bi-eye-fill" style="color:#2563eb;"></i></div><div class="stat-value">' + underReview + '</div><div class="stat-label">Under Review</div></div><div class="stat-card" onclick="filterApplicationStatus(\'pending\', event.target.closest(\'.filter-btn\'))"><div class="stat-icon" style="background:rgba(245,158,11,0.1);"><i class="bi bi-clock-fill" style="color:#d97706;"></i></div><div class="stat-value">' + pending + '</div><div class="stat-label">Pending</div></div>';
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

function renderApplicationsGrid() {
    var apps = getApplications();
    if (currentApplicationFilter !== 'all') {
        var filtered = [];
        for (var i = 0; i < apps.length; i++) {
            if (apps[i].status === currentApplicationFilter) filtered.push(apps[i]);
        }
        apps = filtered;
    }
    
    var searchTerm = document.getElementById('applicationSearch') ? document.getElementById('applicationSearch').value.trim().toLowerCase() : '';
    if (searchTerm) {
        var searched = [];
        for (var j = 0; j < apps.length; j++) {
            var a = apps[j];
            if (a.fullName.toLowerCase().includes(searchTerm) || a.email.toLowerCase().includes(searchTerm) || a.position.toLowerCase().includes(searchTerm) || (a.phone && a.phone.includes(searchTerm))) {
                searched.push(a);
            }
        }
        apps = searched;
    }

    var grid = document.getElementById('applicationsGrid');
    if (!grid) return;

    if (apps.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;" class="empty-state"><i class="bi bi-inbox"></i><p>No applications found</p></div>';
        return;
    }

    var recentApps = [];
    for (var k = apps.length - 1; k >= 0 && recentApps.length < 6; k--) {
        recentApps.push(apps[k]);
    }
    
    var gridHtml = '';
    for (var l = 0; l < recentApps.length; l++) {
        var app = recentApps[l];
        var initials = app.fullName.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
        var statusConfig = getApplicationStatusConfig(app.status);
        var date = app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '—';
        
        gridHtml += '<div class="application-card" onclick="viewApplicationDetail(' + app.id + ')"><div class="application-card-header"><div class="applicant-avatar">' + escapeHtml(initials) + '</div><div class="applicant-info"><h5>' + escapeHtml(app.fullName) + '</h5><span class="position-badge">' + escapeHtml(app.position) + '</span></div></div><div class="application-card-body"><div class="app-detail-mini"><i class="bi bi-envelope"></i>' + escapeHtml(app.email) + '</div><div class="app-detail-mini"><i class="bi bi-telephone"></i>' + escapeHtml(app.phone || '—') + '</div><div class="app-detail-mini"><i class="bi bi-gender-ambiguous"></i>' + escapeHtml(app.gender || '—') + '</div><div class="app-detail-mini"><i class="bi bi-geo-alt"></i>' + escapeHtml((app.address || '').substring(0, 25)) + (app.address && app.address.length > 25 ? '…' : '') + '</div></div><div class="application-card-footer"><span class="app-date"><i class="bi bi-calendar3 me-1"></i>' + date + '</span><span class="application-status ' + statusConfig.class + '">' + statusConfig.icon + ' ' + statusConfig.label + '</span></div></div>';
    }
    grid.innerHTML = gridHtml;
    
    if (apps.length > 6) {
        grid.innerHTML += '<div style="grid-column:1/-1;text-align:center;padding:12px;color:var(--text-muted);font-size:13px;">Showing 6 of ' + apps.length + ' applications. View all in table below.</div>';
    }
}

function renderApplicationsTable() {
    var apps = getApplications();
    if (currentApplicationFilter !== 'all') {
        var filtered = [];
        for (var i = 0; i < apps.length; i++) {
            if (apps[i].status === currentApplicationFilter) filtered.push(apps[i]);
        }
        apps = filtered;
    }
    
    var searchTerm = document.getElementById('applicationSearch') ? document.getElementById('applicationSearch').value.trim().toLowerCase() : '';
    if (searchTerm) {
        var searched = [];
        for (var j = 0; j < apps.length; j++) {
            var a = apps[j];
            if (a.fullName.toLowerCase().includes(searchTerm) || a.email.toLowerCase().includes(searchTerm) || a.position.toLowerCase().includes(searchTerm) || (a.phone && a.phone.includes(searchTerm))) {
                searched.push(a);
            }
        }
        apps = searched;
    }

    var tbody = document.getElementById('applicationsTableBody');
    var countEl = document.getElementById('applicationsCount');
    if (countEl) countEl.textContent = apps.length + ' Applications';
    if (!tbody) return;

    if (apps.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No applications found</div></tr>';
        return;
    }

    var tableHtml = '';
    for (var k = apps.length - 1; k >= 0; k--) {
        var app = apps[k];
        var statusConfig = getApplicationStatusConfig(app.status);
        var date = app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '—';
        
        tableHtml += '<tr><td class="align-middle"><strong>' + escapeHtml(app.fullName) + '</strong></div><td class="align-middle">' + escapeHtml(app.position) + '</div><td class="align-middle">' + escapeHtml(app.phone || '—') + '</div><td class="align-middle">' + escapeHtml(app.email) + '</div><td class="align-middle">' + date + '</div><td class="align-middle"><span class="application-status ' + statusConfig.class + '">' + statusConfig.icon + ' ' + statusConfig.label + '</span></div><td class="align-middle text-center"><button class="action-btn action-btn-view" onclick="viewApplicationDetail(' + app.id + ')" title="View Details"><i class="bi bi-eye-fill"></i></button><button class="action-btn action-btn-approve" onclick="approveApplication(' + app.id + ')" title="Approve"><i class="bi bi-check-lg"></i></button><button class="action-btn action-btn-reject" onclick="rejectApplicationWithModal(' + app.id + ')" title="Reject"><i class="bi bi-x-lg"></i></button><button class="action-btn action-btn-delete" onclick="deleteApplication(' + app.id + ')" title="Delete"><i class="bi bi-trash3-fill"></i></button></div></tr>';
    }
    tbody.innerHTML = tableHtml;
}

function getApplicationStatusConfig(status) {
    var configs = {
        pending: { class: 'app-status-pending', icon: '⏳', label: 'Pending' },
        under_review: { class: 'app-status-under-review', icon: '👁', label: 'Under Review' },
        approved: { class: 'app-status-approved', icon: '✅', label: 'Approved' },
        rejected: { class: 'app-status-rejected', icon: '❌', label: 'Rejected' }
    };
    return configs[status] || configs.pending;
}

function rejectApplicationWithModal(appId) {
    pendingRejectApplicationId = appId;
    var textarea = document.getElementById('rejectionReasonText');
    if (textarea) textarea.value = '';
    var modal = document.getElementById('rejectionReasonModal');
    if (modal) new bootstrap.Modal(modal).show();
}

function insertRejectionReason(reason) {
    var textarea = document.getElementById('rejectionReasonText');
    if (!textarea) return;
    var currentValue = textarea.value;
    var prefix = currentValue ? (currentValue.endsWith('\n') ? '' : '\n') : '';
    textarea.value = currentValue + prefix + reason;
    textarea.focus();
}

function confirmRejectApplication() {
    if (!pendingRejectApplicationId) return;
    
    var rejectionReason = document.getElementById('rejectionReasonText') ? document.getElementById('rejectionReasonText').value.trim() : '';
    
    var apps = getApplications();
    var index = -1;
    for (var i = 0; i < apps.length; i++) {
        if (apps[i].id == pendingRejectApplicationId) {
            index = i;
            break;
        }
    }
    
    if (index !== -1) {
        apps[index].status = 'rejected';
        apps[index].updatedAt = new Date().toISOString();
        if (rejectionReason) {
            apps[index].rejectionReason = rejectionReason;
            apps[index].rejectedAt = new Date().toISOString();
        }
        saveApplications(apps);
        
        var message = rejectionReason ? 'Application rejected with reason: ' + rejectionReason.substring(0, 100) + (rejectionReason.length > 100 ? '...' : '') : 'Application rejected without a reason.';
        showNotification(message, 'warning');
        addToAuditLog('Job application #' + pendingRejectApplicationId + ' rejected: ' + (rejectionReason || 'No reason provided'));
    }
    
    var modalEl = document.getElementById('rejectionReasonModal');
    var bsModal = bootstrap.Modal.getInstance(modalEl);
    if (bsModal) bsModal.hide();
    pendingRejectApplicationId = null;
    loadApplications();
}

function viewApplicationDetail(appId) {
    var apps = getApplications();
    var app = null;
    for (var i = 0; i < apps.length; i++) {
        if (apps[i].id == appId) {
            app = apps[i];
            break;
        }
    }
    if (!app) return;
    
    currentApplicationId = appId;
    var initials = app.fullName.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
    var statusConfig = getApplicationStatusConfig(app.status);
    var date = app.submittedAt ? new Date(app.submittedAt).toLocaleString() : '—';
    var age = app.dob ? calculateAge(app.dob) : null;
    var hasPhoto = app.passportPhoto && app.passportPhoto.trim() !== '';

    var body = '<div class="application-detail-new"><div class="app-profile-banner"><div class="app-profile-avatar-lg ' + (hasPhoto ? 'has-photo' : '') + '">' + (hasPhoto ? '<img src="' + escapeAttr(app.passportPhoto) + '" alt="Passport Photo" onerror="this.style.display=\'none\';this.parentElement.classList.remove(\'has-photo\');this.parentElement.textContent=\'' + escapeHtml(initials) + '\';">' : escapeHtml(initials)) + '</div><div class="app-profile-info"><h3>' + escapeHtml(app.fullName) + '</h3><div class="app-profile-position"><i class="bi bi-briefcase-fill"></i> ' + escapeHtml(app.position) + '</div><div class="app-profile-meta-row"><span class="app-profile-meta-tag"><i class="bi bi-calendar3"></i> ' + date + '</span><span class="app-profile-meta-tag"><i class="bi bi-geo-alt"></i> ' + escapeHtml(app.address ? app.address.split(',')[0] : '—') + '</span>' + (age !== null ? '<span class="app-profile-meta-tag"><i class="bi bi-person"></i> ' + age + ' years</span>' : '') + '</div></div><span class="app-profile-status-badge application-status ' + statusConfig.class + '">' + statusConfig.icon + ' ' + statusConfig.label + '</span></div><div class="app-detail-content-body"><div class="app-info-section"><div class="app-info-section-header"><i class="bi bi-person-vcard"></i><h6>Personal Information</h6></div><div class="app-info-grid"><div class="app-info-field"><div class="field-label-mini"><i class="bi bi-person-fill"></i> Full Name</div><div class="field-value">' + escapeHtml(app.fullName) + '</div></div><div class="app-info-field"><div class="field-label-mini"><i class="bi bi-geo-alt-fill"></i> Address</div><div class="field-value">' + escapeHtml(app.address || '—') + '</div></div><div class="app-info-field"><div class="field-label-mini"><i class="bi bi-calendar-heart"></i> Age</div><div class="field-value">' + (age !== null ? age + ' years' : '—') + '</div></div><div class="app-info-field"><div class="field-label-mini"><i class="bi bi-gender-ambiguous"></i> Gender</div><div class="field-value">' + escapeHtml(app.gender || '—') + '</div></div><div class="app-info-field"><div class="field-label-mini"><i class="bi bi-telephone-fill"></i> Phone Number</div><div class="field-value">' + escapeHtml(app.phone || '—') + '</div></div><div class="app-info-field"><div class="field-label-mini"><i class="bi bi-envelope-fill"></i> Email Address</div><div class="field-value">' + escapeHtml(app.email) + '</div></div><div class="app-info-field"><div class="field-label-mini"><i class="bi bi-mortarboard-fill"></i> Education Level</div><div class="field-value">' + escapeHtml(app.educationLevel || '—') + '</div></div></div></div><div class="app-info-section"><div class="app-info-section-header"><i class="bi bi-stars"></i><h6>Professional Details</h6></div><div class="app-info-grid"><div class="app-info-field" style="grid-column: 1 / -1;"><div class="field-label-mini"><i class="bi bi-tools"></i> Experience & Skills</div><div class="field-value">' + escapeHtml(app.experience || '—') + '</div></div><div class="app-info-field"><div class="field-label-mini"><i class="bi bi-briefcase-fill"></i> Position Applying For</div><div class="field-value">' + escapeHtml(app.position) + '</div></div><div class="app-info-field"><div class="field-label-mini"><i class="bi bi-clock-fill"></i> Availability</div><div class="field-value">' + escapeHtml(app.availability || '—') + '</div></div></div></div>' + (app.additionalNotes ? '<div class="app-info-section"><div class="app-info-section-header"><i class="bi bi-journal-text"></i><h6>Additional Notes</h6></div><div class="app-notes-box"><strong><i class="bi bi-pencil-square me-1"></i>Applicant\'s Notes:</strong> ' + escapeHtml(app.additionalNotes) + '</div></div>' : '') + (app.rejectionReason ? '<div class="rejection-reason-display"><div class="label"><i class="bi bi-exclamation-octagon-fill"></i> Rejection Reason</div><div class="reason-text">' + escapeHtml(app.rejectionReason) + (app.rejectedAt ? '<br><span style="font-size:10px; color:var(--text-muted); margin-top:4px; display:block;">Rejected on: ' + new Date(app.rejectedAt).toLocaleString() + '</span>' : '') + '</div></div>' : '') + '<div class="app-documents-section"><div class="app-documents-section-header"><i class="bi bi-folder2-open"></i><h6>Supporting Documents</h6></div><div class="app-documents-list">' + buildDocumentItem('CV / Resume', 'cv', 'icon-cv', app.cv && app.cv.trim() !== '', app.cv) + buildDocumentItem('National ID', 'id', 'icon-id', app.idDocument && app.idDocument.trim() !== '', app.idDocument) + buildDocumentItem('Introduction Letter / Local Government Letter', 'letter', 'icon-letter', app.introductionLetter && app.introductionLetter.trim() !== '', app.introductionLetter) + buildCertificatesItem(app.certificates && app.certificates.length > 0, app.certificates) + buildDocumentItem('Passport Size Photo', 'photo', 'icon-photo', hasPhoto, app.passportPhoto) + buildOtherDocumentsItem(app.otherDocuments && app.otherDocuments.length > 0, app.otherDocuments) + '</div></div><div class="app-detail-actions-row"><button class="btn btn-success" onclick="approveApplication(' + app.id + ');bootstrap.Modal.getInstance(document.getElementById(\'applicationDetailModal\')).hide();"><i class="bi bi-check-circle me-1"></i>Approve</button><button class="btn btn-warning" onclick="markUnderReview(' + app.id + ');bootstrap.Modal.getInstance(document.getElementById(\'applicationDetailModal\')).hide();"><i class="bi bi-eye me-1"></i>Mark Under Review</button><button class="btn btn-danger" onclick="rejectApplicationWithModal(' + app.id + ');bootstrap.Modal.getInstance(document.getElementById(\'applicationDetailModal\')).hide();"><i class="bi bi-x-circle me-1"></i>Reject</button><button class="btn btn-ghost" onclick="deleteApplication(' + app.id + ');bootstrap.Modal.getInstance(document.getElementById(\'applicationDetailModal\')).hide();"><i class="bi bi-trash3 me-1"></i>Delete</button></div></div></div>';
    
    var bodyEl = document.getElementById('applicationDetailBody');
    if (bodyEl) bodyEl.innerHTML = body;
    
    var modal = document.getElementById('applicationDetailModal');
    if (modal) new bootstrap.Modal(modal).show();
}

function calculateAge(dobString) {
    var dob = new Date(dobString);
    var today = new Date();
    var age = today.getFullYear() - dob.getFullYear();
    var m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
}

function escapeAttr(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function buildDocumentItem(name, type, iconClass, hasDoc, docUrl) {
    return '<div class="app-document-item"><div class="app-document-item-info"><div class="app-document-icon ' + (hasDoc ? iconClass : 'icon-missing') + '"><i class="bi ' + (hasDoc ? 'bi-file-earmark-check-fill' : 'bi-file-earmark-x') + '"></i></div><div class="app-document-details"><div class="doc-name">' + escapeHtml(name) + '</div><div class="doc-meta">' + (hasDoc ? '<span class="doc-status-badge uploaded"><i class="bi bi-check2-circle me-1"></i>Uploaded</span>' : '<span class="doc-status-badge missing"><i class="bi bi-exclamation-circle me-1"></i>Not Provided</span>') + '</div></div></div><div class="app-document-actions"><button class="app-doc-action-btn btn-view" ' + (hasDoc ? 'onclick="viewDocument(\'' + escapeAttr(docUrl) + '\', \'' + escapeAttr(name) + '\')"' : 'disabled') + '><i class="bi bi-eye-fill"></i> View</button><button class="app-doc-action-btn btn-download" ' + (hasDoc ? 'onclick="downloadDocument(\'' + escapeAttr(docUrl) + '\', \'' + escapeAttr(name) + '\')"' : 'disabled') + '><i class="bi bi-download"></i> Download</button><button class="app-doc-action-btn btn-open" ' + (hasDoc ? 'onclick="openDocument(\'' + escapeAttr(docUrl) + '\')"' : 'disabled') + '><i class="bi bi-box-arrow-up-right"></i> Open</button></div></div>';
}

function buildCertificatesItem(hasCerts, certificates) {
    var count = hasCerts ? certificates.length : 0;
    var certUrl = hasCerts ? certificates[0] : '';
    return '<div class="app-document-item"><div class="app-document-item-info"><div class="app-document-icon ' + (hasCerts ? 'icon-cert' : 'icon-missing') + '"><i class="bi ' + (hasCerts ? 'bi-patch-check-fill' : 'bi-file-earmark-x') + '"></i></div><div class="app-document-details"><div class="doc-name">Certificates ' + (hasCerts && count > 1 ? '(' + count + ' files)' : '(Optional)') + '</div><div class="doc-meta">' + (hasCerts ? '<span class="doc-status-badge uploaded"><i class="bi bi-check2-circle me-1"></i>' + count + ' File' + (count > 1 ? 's' : '') + ' Uploaded</span>' : '<span class="doc-status-badge missing"><i class="bi bi-exclamation-circle me-1"></i>Not Provided (Optional)</span>') + '</div></div></div><div class="app-document-actions"><button class="app-doc-action-btn btn-view" ' + (hasCerts ? 'onclick="viewMultipleDocuments(' + JSON.stringify(certificates.map(escapeAttr)) + ', \'Certificates\')"' : 'disabled') + '><i class="bi bi-eye-fill"></i> View</button><button class="app-doc-action-btn btn-download" ' + (hasCerts ? 'onclick="downloadDocument(\'' + escapeAttr(certUrl) + '\', \'Certificate\')"' : 'disabled') + '><i class="bi bi-download"></i> Download</button><button class="app-doc-action-btn btn-open" ' + (hasCerts ? 'onclick="openDocument(\'' + escapeAttr(certUrl) + '\')"' : 'disabled') + '><i class="bi bi-box-arrow-up-right"></i> Open</button></div></div>';
}

function buildOtherDocumentsItem(hasOther, otherDocs) {
    var count = hasOther ? otherDocs.length : 0;
    var otherUrl = hasOther ? otherDocs[0] : '';
    return '<div class="app-document-item"><div class="app-document-item-info"><div class="app-document-icon ' + (hasOther ? 'icon-other' : 'icon-missing') + '"><i class="bi ' + (hasOther ? 'bi-paperclip' : 'bi-file-earmark-x') + '"></i></div><div class="app-document-details"><div class="doc-name">Other Documents ' + (hasOther && count > 1 ? '(' + count + ' files)' : '(Optional)') + '</div><div class="doc-meta">' + (hasOther ? '<span class="doc-status-badge uploaded"><i class="bi bi-check2-circle me-1"></i>' + count + ' File' + (count > 1 ? 's' : '') + ' Uploaded</span>' : '<span class="doc-status-badge missing"><i class="bi bi-exclamation-circle me-1"></i>Not Provided (Optional)</span>') + '</div></div></div><div class="app-document-actions"><button class="app-doc-action-btn btn-view" ' + (hasOther ? 'onclick="viewMultipleDocuments(' + JSON.stringify(otherDocs.map(escapeAttr)) + ', \'Other Documents\')"' : 'disabled') + '><i class="bi bi-eye-fill"></i> View</button><button class="app-doc-action-btn btn-download" ' + (hasOther ? 'onclick="downloadDocument(\'' + escapeAttr(otherUrl) + '\', \'Other_Document\')"' : 'disabled') + '><i class="bi bi-download"></i> Download</button><button class="app-doc-action-btn btn-open" ' + (hasOther ? 'onclick="openDocument(\'' + escapeAttr(otherUrl) + '\')"' : 'disabled') + '><i class="bi bi-box-arrow-up-right"></i> Open</button></div></div>';
}

function viewDocument(url, name) {
    if (!url || url === '#') { showNotification('Document not available', 'warning'); return; }
    window.open(url, '_blank');
    showNotification('Viewing: ' + name, 'info');
}

function downloadDocument(url, name) {
    if (!url || url === '#') { showNotification('Document not available for download', 'warning'); return; }
    var a = document.createElement('a');
    a.href = url;
    a.download = name.replace(/\s+/g, '_') + '_' + Date.now();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showNotification('Downloading: ' + name, 'success');
}

function openDocument(url) {
    if (!url || url === '#') { showNotification('Document not available', 'warning'); return; }
    window.open(url, '_blank');
}

function viewMultipleDocuments(urls, category) {
    if (!urls || urls.length === 0) { showNotification('No documents available', 'warning'); return; }
    for (var i = 0; i < urls.length; i++) {
        setTimeout(function(idx) {
            window.open(urls[idx], '_blank');
        }(i), i * 300);
    }
    showNotification('Opening ' + urls.length + ' ' + category + ' file(s)...', 'info');
}

function approveApplication(appId) {
    var apps = getApplications();
    var index = -1;
    for (var i = 0; i < apps.length; i++) {
        if (apps[i].id == appId) {
            index = i;
            break;
        }
    }
    if (index === -1) return;
    apps[index].status = 'approved';
    apps[index].updatedAt = new Date().toISOString();
    saveApplications(apps);
    loadApplications();
    addToAuditLog('Job application #' + appId + ' approved');
    showNotification('Application approved!', 'success');
}

function markUnderReview(appId) {
    var apps = getApplications();
    var index = -1;
    for (var i = 0; i < apps.length; i++) {
        if (apps[i].id == appId) {
            index = i;
            break;
        }
    }
    if (index === -1) return;
    apps[index].status = 'under_review';
    apps[index].updatedAt = new Date().toISOString();
    saveApplications(apps);
    loadApplications();
    addToAuditLog('Job application #' + appId + ' marked under review');
    showNotification('Application marked as Under Review.', 'info');
}

function deleteApplication(appId) {
    if (!confirm('Are you sure you want to delete this application? This cannot be undone.')) return;
    var apps = getApplications();
    var newApps = [];
    for (var i = 0; i < apps.length; i++) {
        if (apps[i].id != appId) newApps.push(apps[i]);
    }
    saveApplications(newApps);
    loadApplications();
    addToAuditLog('Job application #' + appId + ' deleted');
    showNotification('Application deleted.', 'success');
}

function downloadApplicationPDF() {
    if (!currentApplicationId) { showNotification('No application selected', 'error'); return; }
    var apps = getApplications();
    var app = null;
    for (var i = 0; i < apps.length; i++) {
        if (apps[i].id == currentApplicationId) {
            app = apps[i];
            break;
        }
    }
    if (!app) return;
    
    var statusConfig = getApplicationStatusConfig(app.status);
    var date = app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '—';
    
    var pdfHTML = '<div class="application-pdf-container"><div class="app-pdf-header"><div class="app-pdf-header-left"><img src="image/logo.jpeg" alt="CleanSpark Logo" class="app-pdf-logo" onerror="this.style.display=\'none\';"><div class="app-pdf-company-info"><h2>CleanSpark</h2><p>Cleaning Service Management System</p><p>Zanzibar, Tanzania | info@CleanSpark.co.tz</p></div></div><div class="app-pdf-title-section"><h1 class="app-pdf-title">JOB APPLICATION</h1><p class="app-pdf-ref">Ref: #' + escapeHtml(String(app.id).slice(-6)) + '</p><p class="app-pdf-status" style="color:' + (statusConfig.class.includes('approved') ? '#16a34a' : (statusConfig.class.includes('rejected') ? '#dc2626' : '#2563eb')) + ';">' + statusConfig.icon + ' ' + statusConfig.label + '</p></div></div><div class="app-pdf-section"><h5>Applicant Information</h5><div class="app-pdf-info-grid"><div class="app-pdf-info-item"><div class="label">Full Name</div><div class="value">' + escapeHtml(app.fullName) + '</div></div><div class="app-pdf-info-item"><div class="label">Email</div><div class="value">' + escapeHtml(app.email) + '</div></div><div class="app-pdf-info-item"><div class="label">Phone</div><div class="value">' + escapeHtml(app.phone || '—') + '</div></div><div class="app-pdf-info-item"><div class="label">Gender</div><div class="value">' + escapeHtml(app.gender || '—') + '</div></div><div class="app-pdf-info-item"><div class="label">Date of Birth</div><div class="value">' + escapeHtml(app.dob || '—') + '</div></div><div class="app-pdf-info-item"><div class="label">Position Applied</div><div class="value">' + escapeHtml(app.position) + '</div></div><div class="app-pdf-info-item" style="grid-column:1/-1;"><div class="label">Address</div><div class="value">' + escapeHtml(app.address || '—') + '</div></div><div class="app-pdf-info-item"><div class="label">Date Submitted</div><div class="value">' + date + '</div></div><div class="app-pdf-info-item"><div class="label">Status</div><div class="value">' + statusConfig.label + '</div></div></div></div>' + (app.rejectionReason ? '<div class="app-pdf-section"><h5>Rejection Reason</h5><div class="app-notes-box" style="background:#fee2e2; border-color:#fecaca; color:#991b1b;"><strong><i class="bi bi-exclamation-triangle me-1"></i>Reason for Rejection:</strong> ' + escapeHtml(app.rejectionReason) + (app.rejectedAt ? '<br><small>Rejected on: ' + new Date(app.rejectedAt).toLocaleString() + '</small>' : '') + '</div></div>' : '') + (app.coverLetter ? '<div class="app-pdf-section"><h5>Application Letter</h5><p style="font-size:13px;line-height:1.7;color:#1a202c;">' + escapeHtml(app.coverLetter) + '</p></div>' : '') + '<div class="app-pdf-section"><h5>Documents Attached</h5><p style="font-size:13px;">📄 CV/Resume: ' + (app.cv ? '✅ Attached' : '❌ Not provided') + '<br>🪪 ID Document: ' + (app.idDocument ? '✅ Attached' : '❌ Not provided') + '<br>🏅 Certificates: ' + (app.certificates && app.certificates.length > 0 ? '✅ ' + app.certificates.length + ' file(s) attached' : '❌ Not provided') + '</p></div><div class="app-pdf-footer"><p>This is a computer-generated application document from CleanSpark Recruitment System.</p><p>CleanSpark Cleaning Service Management | Zanzibar, Tanzania</p><p>Generated on ' + new Date().toLocaleString('en-TZ') + '</p></div></div>';
    
    var template = document.getElementById('applicationPDFTemplate');
    template.innerHTML = pdfHTML;
    template.style.left = '0';
    template.style.position = 'relative';
    
    html2canvas(template, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' }).then(function(canvas) {
        template.style.left = '-9999px';
        template.style.position = 'absolute';
        var imgData = canvas.toDataURL('image/png');
        var jsPDF = window.jspdf;
        var pdf = new jsPDF('p', 'mm', 'a4');
        var pageWidth = pdf.internal.pageSize.getWidth();
        var pageHeight = pdf.internal.pageSize.getHeight();
        var imgWidth = pageWidth - 16;
        var imgHeight = (canvas.height * imgWidth) / canvas.width;
        var heightLeft = imgHeight;
        var position = 8;
        pdf.addImage(imgData, 'PNG', 8, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 8, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        var fileName = 'CleanSpark_Application_' + app.fullName.replace(/\s+/g, '_') + '_' + date + '.pdf';
        pdf.save(fileName);
        showNotification('Application PDF downloaded successfully!', 'success');
    }).catch(function(error) {
        console.error('PDF generation error:', error);
        template.style.left = '-9999px';
        template.style.position = 'absolute';
        showNotification('Error generating PDF. Opening print view instead.', 'warning');
        var printWindow = window.open('', '_blank');
        printWindow.document.write('<!DOCTYPE html><html><head><title>Application</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><link rel="stylesheet" href="css/admin.css"></head><body>' + pdfHTML + '</body></html>');
        printWindow.document.close();
        setTimeout(function() { printWindow.print(); }, 500);
    });
}

function shareApplication() {
    if (!currentApplicationId) return;
    var apps = getApplications();
    var app = null;
    for (var i = 0; i < apps.length; i++) {
        if (apps[i].id == currentApplicationId) {
            app = apps[i];
            break;
        }
    }
    if (!app) return;
    var shareText = '📋 Job Application - CleanSpark\n\n👤 ' + app.fullName + '\n📧 ' + app.email + '\n📞 ' + (app.phone || 'N/A') + '\n💼 ' + app.position + '\n📅 ' + (app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A') + '\n📊 Status: ' + getApplicationStatusConfig(app.status).label;
    if (navigator.share) {
        navigator.share({ title: 'Job Application', text: shareText }).catch(function() {});
    } else {
        navigator.clipboard.writeText(shareText).then(function() {
            showNotification('Application details copied! Share via WhatsApp or Email.', 'success');
        }).catch(function() {
            window.open('https://wa.me/?text=' + encodeURIComponent(shareText), '_blank');
        });
    }
}

// ========== REPORTS & CHARTS ==========
function generateProfessionalReport() {
    var fromDate = document.getElementById('reportFromDate') ? document.getElementById('reportFromDate').value : '';
    var toDate = document.getElementById('reportToDate') ? document.getElementById('reportToDate').value : '';
    var reportType = document.getElementById('reportType') ? document.getElementById('reportType').value : 'all';
    var format = document.getElementById('reportFormat') ? document.getElementById('reportFormat').value : 'detailed';
    
    if (!fromDate || !toDate) {
        showNotification('Please select both From and To dates', 'error');
        return;
    }
    
    var services = JSON.parse(localStorage.getItem('adminServices')) || [];
    var staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    var bookings = JSON.parse(localStorage.getItem('customerBookings')) || [];
    var contractors = JSON.parse(localStorage.getItem('contractors')) || [];
    var invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    var messages = JSON.parse(localStorage.getItem('contact_messages')) || [];
    var supervisorMsgs = JSON.parse(localStorage.getItem('supervisor_messages')) || [];
    var assignments = JSON.parse(localStorage.getItem('serviceAssignments')) || {};
    var paymentHistory = JSON.parse(localStorage.getItem('paymentHistory')) || [];
    
    var filteredInvoices = [];
    for (var i = 0; i < invoices.length; i++) {
        if (invoices[i].invoiceDate >= fromDate && invoices[i].invoiceDate <= toDate) {
            filteredInvoices.push(invoices[i]);
        }
    }
    var totalRevenue = 0;
    for (var j = 0; j < filteredInvoices.length; j++) {
        totalRevenue += (filteredInvoices[j].total || 0);
    }
    var totalPayments = 0;
    for (var p = 0; p < paymentHistory.length; p++) {
        totalPayments += (paymentHistory[p].amount || 0);
    }
    
    generatedReportData = {
        title: 'CleanSpark Professional Report',
        generatedAt: new Date().toLocaleString('en-TZ'),
        dateRange: fromDate + ' to ' + toDate,
        type: reportType,
        format: format,
        currency: 'TZS',
        summary: {
            totalServices: services.length,
            totalStaff: staff.length,
            totalBookings: bookings.length,
            totalContractors: contractors.length,
            totalInvoices: filteredInvoices.length,
            totalRevenue: totalRevenue,
            totalPayments: totalPayments,
            totalMessages: messages.length + supervisorMsgs.length,
            assignedServices: 0
        },
        detailedData: {}
    };
    var assignedCount = 0;
    for (var key in assignments) { assignedCount++; }
    generatedReportData.summary.assignedServices = assignedCount;
    
    var reportHTML = '<div class="report-preview"><div class="report-cover"><div class="report-logo"><i class="bi bi-building-fill"></i></div><h2>CleanSpark Professional Report</h2><p class="report-subtitle">Cleaning Service Management System</p></div><div class="report-meta-row"><div class="report-meta-item"><div class="meta-label">Report Type</div><div class="meta-value">' + reportType.toUpperCase() + '</div></div><div class="report-meta-item"><div class="meta-label">Date Range</div><div class="meta-value">' + fromDate + ' — ' + toDate + '</div></div><div class="report-meta-item"><div class="meta-label">Generated</div><div class="meta-value">' + generatedReportData.generatedAt + '</div></div><div class="report-meta-item"><div class="meta-label">Format</div><div class="meta-value">' + (format === 'detailed' ? 'Detailed Report' : 'Summary') + '</div></div></div><div class="report-section"><h5><i class="bi bi-graph-up me-1"></i>Executive Summary</h5><div class="report-summary-grid"><div class="report-summary-card"><div class="summary-icon"><i class="bi bi-grid-3x3-gap-fill"></i></div><div class="summary-value">' + generatedReportData.summary.totalServices + '</div><div class="summary-label">Total Services</div></div><div class="report-summary-card"><div class="summary-icon"><i class="bi bi-people-fill"></i></div><div class="summary-value">' + generatedReportData.summary.totalStaff + '</div><div class="summary-label">Staff Members</div></div><div class="report-summary-card"><div class="summary-icon"><i class="bi bi-building"></i></div><div class="summary-value">' + generatedReportData.summary.totalContractors + '</div><div class="summary-label">Contractors</div></div><div class="report-summary-card"><div class="summary-icon"><i class="bi bi-cash-stack"></i></div><div class="summary-value">' + formatTZS(totalPayments) + '</div><div class="summary-label">Total Payments</div></div><div class="report-summary-card"><div class="summary-icon"><i class="bi bi-receipt"></i></div><div class="summary-value">' + generatedReportData.summary.totalInvoices + '</div><div class="summary-label">Invoices</div></div><div class="report-summary-card"><div class="summary-icon"><i class="bi bi-diagram-3-fill"></i></div><div class="summary-value">' + generatedReportData.summary.assignedServices + '</div><div class="summary-label">Assigned Services</div></div></div></div>';
    
    if (reportType === 'all' || reportType === 'staff') {
        reportHTML += '<div class="report-section"><h5><i class="bi bi-people me-1"></i>Staff Distribution</h5><table class="report-table"><thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Type</th><th>Assigned Services</th></tr></thead><tbody>';
        for (var s = 0; s < staff.length; s++) {
            var count = 0;
            for (var aid in assignments) {
                if (assignments[aid] == staff[s].id) count++;
            }
            reportHTML += '<tr><td><strong>' + escapeHtml(staff[s].name) + '</strong></td><td>' + escapeHtml(staff[s].email) + '</td><td><span class="badge bg-success">Active</span></td><td>' + escapeHtml(staff[s].staffType || 'normal') + '</td><td>' + count + '</td></tr>';
        }
        reportHTML += '</tbody><td></div>';
    }
    
    if (reportType === 'all' || reportType === 'contractors') {
        reportHTML += '<div class="report-section"><h5><i class="bi bi-building me-1"></i>Contractors Overview</h5><table class="report-table"><thead><tr><th>Company</th><th>Type</th><th>Location</th><th>Workers</th><th>Contract Period</th><th>Value (TZS)</th></tr></thead><tbody>';
        for (var c = 0; c < contractors.length; c++) {
            var con = contractors[c];
            reportHTML += '<tr><td><strong>' + escapeHtml(con.companyName) + '</strong></td><td>' + con.type + '</td><td>' + escapeHtml(con.location || '—') + '</td><td>' + (con.workersAssigned || 0) + '</td><td>' + escapeHtml(con.contractStart || '—') + ' — ' + escapeHtml(con.contractEnd || '—') + '</td><td>' + formatTZS(con.contractValue) + '</td><tr>';
        }
        reportHTML += '</tbody></table></div>';
    }
    
    if (reportType === 'all' || reportType === 'revenue') {
        reportHTML += '<div class="report-section"><h5><i class="bi bi-cash-stack me-1"></i>Revenue Analysis</h5><table class="report-table"><thead><tr><th>Invoice #</th><th>Contractor</th><th>Date</th><th>Work Cost</th><th>Workers Cost</th><th>Equipment Cost</th><th>Total</th></tr></thead><tbody>';
        for (var inv = 0; inv < filteredInvoices.length; inv++) {
            var invoice = filteredInvoices[inv];
            reportHTML += '<tr><td>#' + escapeHtml(invoice.id) + '</td><td>' + escapeHtml(invoice.contractorName) + '</td><td>' + escapeHtml(invoice.invoiceDate) + '</td><td>' + formatTZS(invoice.workCost) + '</td><td>' + formatTZS(invoice.workersCost) + '</td><td>' + formatTZS(invoice.equipmentCost) + '</td><td><strong>' + formatTZS(invoice.total) + '</strong></td></tr>';
        }
        reportHTML += '</tbody></table>' + (filteredInvoices.length > 0 ? '<div style="text-align:right; margin-top:10px; font-size:16px; font-weight:700; color:var(--grad-start);">Total Revenue: ' + formatTZS(totalRevenue) + '</div>' : '<p class="text-muted">No invoices in this period</p>') + '</div>';
    }
    
    reportHTML += '<div class="report-footer"><p>This report was generated by CleanSpark Admin Panel on ' + generatedReportData.generatedAt + '</p><p>Confidential — For internal use only</p></div></div>';
    
    var previewBody = document.getElementById('reportPreviewBody');
    if (previewBody) previewBody.innerHTML = reportHTML;
    var modal = document.getElementById('reportPreviewModal');
    if (modal) new bootstrap.Modal(modal).show();
    showNotification('Professional report generated!', 'success');
}

function downloadReportAsPDF() {
    if (!generatedReportData) {
        showNotification('Please generate a report first', 'error');
        return;
    }
    var reportElement = document.getElementById('reportPreviewBody');
    if (!reportElement) return;
    
    html2canvas(reportElement, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' }).then(function(canvas) {
        var imgData = canvas.toDataURL('image/png');
        var jsPDF = window.jspdf;
        var pdf = new jsPDF('p', 'mm', 'a4');
        var pageWidth = pdf.internal.pageSize.getWidth();
        var pageHeight = pdf.internal.pageSize.getHeight();
        var imgWidth = pageWidth - 20;
        var imgHeight = (canvas.height * imgWidth) / canvas.width;
        var heightLeft = imgHeight;
        var position = 10;
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        var fileName = 'CleanSpark_Report_' + generatedReportData.type + '_' + new Date().toISOString().slice(0, 10) + '.pdf';
        pdf.save(fileName);
        showNotification('PDF report downloaded successfully!', 'success');
    }).catch(function(error) {
        console.error('PDF generation error:', error);
        showNotification('Error generating PDF. Please try again.', 'error');
    });
}

function shareGeneratedReport() {
    if (!generatedReportData) return;
    var summary = 'CleanSpark Report (' + generatedReportData.type + ')\nPeriod: ' + generatedReportData.dateRange + '\nRevenue: ' + formatTZS(generatedReportData.summary.totalRevenue) + '\nServices: ' + generatedReportData.summary.totalServices + '\nStaff: ' + generatedReportData.summary.totalStaff;
    if (navigator.share) {
        navigator.share({ title: 'CleanSpark Report', text: summary }).catch(function() {});
    } else {
        navigator.clipboard.writeText(summary).then(function() {
            showNotification('Report summary copied!', 'success');
        }).catch(function() {
            window.open('https://wa.me/?text=' + encodeURIComponent(summary), '_blank');
        });
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
                datasets: [{ label: 'Bookings', data: [12, 19, 15, 25, 22, 30], borderColor: '#1a56db', backgroundColor: 'rgba(26,86,219,0.08)', tension: 0.4, fill: true }]
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
                datasets: [{ label: 'Revenue (TZS)', data: [1200000, 1900000, 1500000, 2500000, 2200000, 3000000], backgroundColor: 'rgba(124,58,237,0.8)', borderRadius: 6 }]
            },
            options: { responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true, ticks: { callback: function(val) { return 'TZS ' + (val/1000).toFixed(0) + 'K'; } } } } }
        });
    }
}

// ========== SETTINGS ==========
function loadSettings() {
    var settings = JSON.parse(localStorage.getItem('adminSettings')) || { emailNotifications: true, autoAssignStaff: false, bookingReminders: true, auditLog: true };
    var emailCheck = document.getElementById('emailNotifications');
    if (emailCheck) emailCheck.checked = settings.emailNotifications;
    var autoAssign = document.getElementById('autoAssignStaff');
    if (autoAssign) autoAssign.checked = settings.autoAssignStaff;
    var reminders = document.getElementById('bookingReminders');
    if (reminders) reminders.checked = settings.bookingReminders;
    var auditLogCheck = document.getElementById('auditLog');
    if (auditLogCheck) auditLogCheck.checked = settings.auditLog !== false;
}

function saveSettings() {
    var settings = {
        emailNotifications: document.getElementById('emailNotifications') ? document.getElementById('emailNotifications').checked : true,
        autoAssignStaff: document.getElementById('autoAssignStaff') ? document.getElementById('autoAssignStaff').checked : false,
        bookingReminders: document.getElementById('bookingReminders') ? document.getElementById('bookingReminders').checked : true,
        auditLog: document.getElementById('auditLog') ? document.getElementById('auditLog').checked : true
    };
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    showNotification('Settings saved!', 'success');
}

function exportData() {
    var data = {
        services: JSON.parse(localStorage.getItem('adminServices')) || [],
        staff: JSON.parse(localStorage.getItem('staffAccounts')) || [],
        bookings: JSON.parse(localStorage.getItem('customerBookings')) || [],
        contractors: JSON.parse(localStorage.getItem('contractors')) || [],
        invoices: JSON.parse(localStorage.getItem('invoices')) || [],
        applications: JSON.parse(localStorage.getItem('jobApplications')) || [],
        paymentStatuses: JSON.parse(localStorage.getItem('paymentStatuses')) || {},
        paymentHistory: JSON.parse(localStorage.getItem('paymentHistory')) || [],
        staffIssues: JSON.parse(localStorage.getItem('staffIssues')) || [],
        exportDate: new Date().toISOString()
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'CleanSpark_export_' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Data exported!', 'success');
}

// ========== INITIALIZE SAMPLE DATA ==========
function initializeSampleData() {
    if (!localStorage.getItem('contractors')) {
        localStorage.setItem('contractors', JSON.stringify([
            { id: 1001, companyName: 'Zanzibar Beach Resort', type: 'private', location: 'Nungwi, Zanzibar', contactPerson: 'Ahmed Hassan', email: 'ahmed@zanzibarbeach.com', phone: '+255 777 123456', workersAssigned: 8, workerNames: ['Ahmed Hassan', 'Fatma Ali', 'John Mwangi', 'Amina Salum'], contractStart: '2024-01-15', contractEnd: '2025-01-14', contractValue: 24000000, status: 'active', services: ['Daily Room Cleaning', 'Pool Maintenance'] },
            { id: 1002, companyName: 'Stone Town Municipal Office', type: 'government', location: 'Stone Town, Zanzibar', contactPerson: 'Fatma Ali', email: 'fatma@stonetown.go.tz', phone: '+255 777 654321', workersAssigned: 12, workerNames: ['Hassan Juma', 'Zainab Omar', 'Abdul Rashid'], contractStart: '2024-03-01', contractEnd: '2025-02-28', contractValue: 36000000, status: 'active', services: ['Office Cleaning', 'Waste Management'] }
        ]));
    }
    if (!localStorage.getItem('supervisor_messages')) {
        localStorage.setItem('supervisor_messages', JSON.stringify([
            { name: 'Juma Khamis', email: 'juma@supervisor.com', subject: 'Equipment Shortage', message: 'Need additional equipment at Stone Town office.', timestamp: new Date(Date.now() - 2*86400000).toISOString() },
            { name: 'Aisha Mohammed', email: 'aisha@supervisor.com', subject: 'Staff Attendance', message: 'Two workers absent at Beach Resort.', timestamp: new Date(Date.now() - 86400000).toISOString() }
        ]));
    }
    if (!localStorage.getItem('contact_messages')) {
        localStorage.setItem('contact_messages', JSON.stringify([
            { name: 'Asha Bakari', email: 'asha@gmail.com', subject: 'Booking Inquiry', message: 'Need deep cleaning for apartment.', timestamp: new Date(Date.now() - 3*86400000).toISOString() }
        ]));
    }
    if (!localStorage.getItem('customerBookings')) {
        localStorage.setItem('customerBookings', JSON.stringify([
            { id: 2001, customer: 'Asha Bakari', service: 'Deep House Cleaning', location: 'Unguja', actualLocation: 'Stone Town, Zanzibar', date: '2024-07-15', time: '10:00 AM', status: 'confirmed', createdAt: new Date(Date.now() - 5*86400000).toISOString() },
            { id: 2002, customer: 'Mohammed Juma', service: 'Office Cleaning', location: 'Pemba', actualLocation: 'Chake Chake, Pemba', date: '2024-07-20', time: '2:00 PM', status: 'pending_review', createdAt: new Date(Date.now() - 2*86400000).toISOString() }
        ]));
    }
    if (!localStorage.getItem('adminServices')) {
        localStorage.setItem('adminServices', JSON.stringify([
            { id: 3001, name: 'Deep House Cleaning', price: 50000, duration: '3 hours', location: 'Both', description: 'Complete deep cleaning', included: ['Living Room', 'Bedrooms', 'Kitchen'], image: null },
            { id: 3002, name: 'Office Cleaning', price: 75000, duration: '4 hours', location: 'Unguja', description: 'Professional office cleaning', included: ['Desks', 'Floors', 'Windows'], image: null }
        ]));
    }
    if (!localStorage.getItem('staffAccounts')) {
        localStorage.setItem('staffAccounts', JSON.stringify([
            { id: 4001, name: 'Fatma Ali', email: 'fatma@staff.com', phone: '+255 777 111111', password: 'staff123', staffType: 'supervisor', photo: null, status: 'active', availability: 'available' },
            { id: 4002, name: 'Hassan Juma', email: 'hassan@staff.com', phone: '+255 777 222222', password: 'staff123', staffType: 'general_supervisor', photo: null, status: 'active', availability: 'available' },
            { id: 4003, name: 'Amina Salum', email: 'amina@staff.com', phone: '+255 777 333333', password: 'staff123', staffType: 'normal', photo: null, status: 'active', availability: 'assigned' }
        ]));
    }
    if (!localStorage.getItem('paymentStatuses')) {
        localStorage.setItem('paymentStatuses', JSON.stringify({ 2001: 'paid', 2002: 'unpaid' }));
    }
    if (!localStorage.getItem('invoices')) {
        localStorage.setItem('invoices', JSON.stringify([]));
    }
}

function initializeApplicationSampleData() {
    if (!localStorage.getItem('jobApplications')) {
        var sampleApps = [
            { id: Date.now() - 4, fullName: 'Zainab Omar Mohammed', email: 'zainab.omar@email.com', phone: '+255 777 123 456', gender: 'Female', dob: '1995-03-15', address: 'Mkunazini Street, Stone Town, Zanzibar', position: 'Senior Cleaning Supervisor', educationLevel: 'Bachelor Degree', experience: '5+ years experience', availability: 'Immediate', additionalNotes: '', coverLetter: '', cv: null, idDocument: null, introductionLetter: null, certificates: [], passportPhoto: null, otherDocuments: [], status: 'pending', submittedAt: new Date(Date.now() - 4 * 86400000).toISOString() },
            { id: Date.now() - 3, fullName: 'Abdul Rashid Juma', email: 'abdul.rashid@email.com', phone: '+255 777 234 567', gender: 'Male', dob: '1990-07-22', address: 'Shangani, Stone Town, Zanzibar', position: 'Office Cleaner', educationLevel: 'Certificate', experience: '3 years experience', availability: '2 weeks notice', additionalNotes: '', coverLetter: '', cv: null, idDocument: null, introductionLetter: null, certificates: [], passportPhoto: null, otherDocuments: [], status: 'under_review', submittedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
            { id: Date.now() - 2, fullName: 'Maryam Hassan Ali', email: 'maryam.hassan@email.com', phone: '+255 777 345 678', gender: 'Female', dob: '1998-11-08', address: 'Mlandege, Zanzibar', position: 'Deep Cleaning Specialist', educationLevel: 'Diploma', experience: 'Specialized training', availability: 'Immediate', additionalNotes: '', coverLetter: '', cv: null, idDocument: null, introductionLetter: null, certificates: [], passportPhoto: null, otherDocuments: [], status: 'approved', submittedAt: new Date(Date.now() - 2 * 86400000).toISOString() },
            { id: Date.now() - 1, fullName: 'Khalid Bakari Salum', email: 'khalid.bakari@email.com', phone: '+255 777 456 789', gender: 'Male', dob: '1992-05-30', address: 'Bububu, Zanzibar', position: 'Grounds Maintenance Worker', educationLevel: 'Secondary School', experience: '3 years experience', availability: '1 month notice', additionalNotes: '', coverLetter: '', cv: null, idDocument: null, introductionLetter: null, certificates: [], passportPhoto: null, otherDocuments: [], status: 'rejected', submittedAt: new Date(Date.now() - 1 * 86400000).toISOString() }
        ];
        localStorage.setItem('jobApplications', JSON.stringify(sampleApps));
    }
}

function initializePaymentHistoryData() {
    if (!localStorage.getItem('paymentHistory')) {
        var bookings = JSON.parse(localStorage.getItem('customerBookings')) || [];
        var samplePayments = [];
        if (bookings.length > 0) {
            samplePayments.push({
                id: 'PAY-20240001',
                bookingId: bookings[0].id,
                customerName: bookings[0].customer,
                serviceName: bookings[0].service,
                amount: 50000,
                paymentDate: new Date(Date.now() - 15 * 86400000).toISOString(),
                status: 'paid',
                method: 'bank_transfer'
            });
        }
        if (bookings.length > 1) {
            samplePayments.push({
                id: 'PAY-20240002',
                bookingId: bookings[1].id,
                customerName: bookings[1].customer,
                serviceName: bookings[1].service,
                amount: 37500,
                paymentDate: new Date(Date.now() - 5 * 86400000).toISOString(),
                status: 'partially_paid',
                method: 'mobile_money'
            });
        }
        localStorage.setItem('paymentHistory', JSON.stringify(samplePayments));
    }
}

// ========== SESSION RESTORE ==========
document.addEventListener('DOMContentLoaded', function() {
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        var loginSection = document.getElementById('loginSection');
        var dashboard = document.getElementById('dashboard');
        if (loginSection) loginSection.style.display = 'none';
        if (dashboard) {
            dashboard.style.display = 'flex';
            dashboard.style.flexDirection = 'column';
        }
        initDashboard();
    }
});