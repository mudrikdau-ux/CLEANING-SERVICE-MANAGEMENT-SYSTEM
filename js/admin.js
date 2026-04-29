// ============================================================
//  CSMS ADMIN PANEL — admin.js (COMPLETE - FINAL)
//  All prices in TZS | Contractors, Invoice, Messages, Reports
//  Enhanced Logout Flow | Professional Report Generation
// ============================================================

// ========== MISSING ASSIGNMENT FUNCTIONS ==========

function renderAssignedServicesTab() {
    const services = JSON.parse(localStorage.getItem('adminServices')) || [];
    const staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    const assignments = getAssignmentData();
    const assignedServices = services.filter(s => assignments[s.id]);
    let html = '';

    if (assignedServices.length === 0) {
        html = `<tr><td colspan="5" class="text-center"><div class="empty-state"><i class="bi bi-inbox"></i><p>No services have been assigned yet</p></div></td></tr>`;
    } else {
        assignedServices.forEach(service => {
            const assignedStaffId = assignments[service.id];
            const assignedMember = staff.find(s => String(s.id) === String(assignedStaffId));
            const imgHtml = service.image
                ? `<img src="${service.image}" alt="${escapeHtml(service.name)}" class="service-thumb">`
                : `<div class="no-image-thumb"><i class="bi bi-image"></i></div>`;

            html += `
                <tr>
                    <td>${imgHtml}</td>
                    <td>
                        <strong>${escapeHtml(service.name)}</strong>
                        <div style="font-size:11px;color:var(--text-muted);">${escapeHtml(service.duration)}</div>
                    </td>
                    <td><strong style="color:var(--primary)">${formatTZS(service.price)}</strong></td>
                    <td>
                        ${assignedMember ? `
                            <div class="assigned-to-chip">
                                ${getStaffAvatarHtml(assignedMember)}
                                <span>${escapeHtml(assignedMember.name)}</span>
                            </div>
                        ` : `<span style="color:var(--text-muted);">Unknown</span>`}
                    </td>
                    <td style="text-align:center;">
                        <button class="action-btn action-btn-edit" onclick="openAssignServiceModal(${service.id})" title="Reassign"><i class="bi bi-arrow-repeat"></i></button>
                        <button class="action-btn action-btn-delete" onclick="unassignService(${service.id})" title="Remove"><i class="bi bi-trash3-fill"></i></button>
                    </td>
                </tr>`;
        });
    }

    document.getElementById('assignedServicesList').innerHTML = html;
}

function renderUnassignedServicesTab() {
    const services = JSON.parse(localStorage.getItem('adminServices')) || [];
    const assignments = getAssignmentData();
    const unassignedServices = services.filter(s => !assignments[s.id]);
    let html = '';

    if (unassignedServices.length === 0) {
        html = `<tr><td colspan="5" class="text-center"><div class="empty-state"><i class="bi bi-check-circle"></i><p>All services have been assigned to staff</p></div></td></tr>`;
    } else {
        unassignedServices.forEach(service => {
            const imgHtml = service.image
                ? `<img src="${service.image}" alt="${escapeHtml(service.name)}" class="service-thumb">`
                : `<div class="no-image-thumb"><i class="bi bi-image"></i></div>`;

            const locIcon = { Unguja: '🏝', Pemba: '🌿', Both: '🗺' }[service.location] || '📍';
            const locClass = { Unguja: 'location-unguja', Pemba: 'location-pemba', Both: 'location-both' }[service.location] || 'location-both';

            html += `
                <tr>
                    <td>${imgHtml}</td>
                    <td>
                        <strong>${escapeHtml(service.name)}</strong>
                        ${service.description ? `<div style="font-size:11px;color:var(--text-muted);">${escapeHtml(service.description.substring(0, 50))}${service.description.length > 50 ? '…' : ''}</div>` : ''}
                    </td>
                    <td><strong style="color:var(--primary)">${formatTZS(service.price)}</strong></td>
                    <td><span class="location-badge ${locClass}">${locIcon} ${escapeHtml(service.location)}</span></td>
                    <td style="text-align:center;">
                        <button class="btn-assign-now" onclick="openAssignServiceModal(${service.id})" title="Assign to staff">
                            <i class="bi bi-person-plus-fill me-1"></i>Assign
                        </button>
                    </td>
                </tr>`;
        });
    }

    document.getElementById('unassignedServicesList').innerHTML = html;
}

function openAssignServiceModal(serviceId) {
    currentAssignServiceId = serviceId;
    selectedAssignStaffId = null;

    const services = JSON.parse(localStorage.getItem('adminServices')) || [];
    const staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    const assignments = getAssignmentData();
    const service = services.find(s => s.id == serviceId);
    if (!service) return;

    const imgHtml = service.image
        ? `<img src="${service.image}" alt="${escapeHtml(service.name)}" style="width:56px;height:44px;object-fit:cover;border-radius:8px;border:1.5px solid var(--border);margin-right:12px;">`
        : `<div style="width:56px;height:44px;background:#f7fafc;border-radius:8px;border:1.5px dashed #cbd5e1;display:inline-flex;align-items:center;justify-content:center;margin-right:12px;"><i class="bi bi-image" style="color:#a0aec0;font-size:18px;"></i></div>`;

    document.getElementById('assignServiceInfo').innerHTML = `
        <div style="display:flex;align-items:center;padding:14px 16px;background:#f7fafc;border-radius:var(--radius-sm);border:1.5px solid var(--border);">
            ${imgHtml}
            <div>
                <strong style="font-size:15px;">${escapeHtml(service.name)}</strong>
                <div style="font-size:12px;color:var(--text-muted);">${formatTZS(service.price)} · ${escapeHtml(service.duration)} · ${escapeHtml(service.location)}</div>
            </div>
        </div>`;

    const sortedStaff = [...staff].sort((a, b) => {
        const ca = countAssignedServicesForStaff(a.id);
        const cb = countAssignedServicesForStaff(b.id);
        return ca - cb;
    });

    const currentAssignedStaffId = assignments[serviceId];

    let pickerHtml = '';
    if (sortedStaff.length === 0) {
        pickerHtml = '<div class="empty-state"><i class="bi bi-people"></i><p>No staff members available</p></div>';
    } else {
        sortedStaff.forEach(member => {
            const count = countAssignedServicesForStaff(member.id);
            const initials = member.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
            const avatarHtml = member.photo
                ? `<img src="${member.photo}" alt="${escapeHtml(member.name)}" class="assign-picker-avatar">`
                : `<div class="assign-picker-initials">${escapeHtml(initials)}</div>`;
            const isCurrent = String(member.id) === String(currentAssignedStaffId);
            const isSupervisor = member.staffType === 'supervisor';
            const isContractor = member.staffType === 'contractor';

            let typeTag = '';
            if (isSupervisor) typeTag = '<span class="staff-type-indicator staff-type-supervisor" style="position:static;margin-top:2px;">Supervisor</span>';
            else if (isContractor) typeTag = '<span class="staff-type-indicator staff-type-contractor" style="position:static;margin-top:2px;">Contractor</span>';

            pickerHtml += `
                <div class="assign-staff-pick-item ${isCurrent ? 'current' : ''}" data-staffid="${member.id}" onclick="selectAssignStaff(this, ${member.id})">
                    ${avatarHtml}
                    <div class="assign-pick-info">
                        <strong>${escapeHtml(member.name)}</strong>
                        <span>${escapeHtml(member.email)}${typeTag}</span>
                    </div>
                    <div class="assign-pick-count">
                        <span class="services-count-badge">${count}</span>
                        <small>services</small>
                    </div>
                    ${isCurrent ? '<span class="current-tag">Current</span>' : ''}
                </div>`;
        });
    }

    document.getElementById('assignStaffPickerList').innerHTML = pickerHtml;
    document.getElementById('confirmAssignBtn').disabled = true;

    new bootstrap.Modal(document.getElementById('assignServiceModal')).show();
}

function selectAssignStaff(el, staffId) {
    document.querySelectorAll('.assign-staff-pick-item').forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');
    selectedAssignStaffId = staffId;
    document.getElementById('confirmAssignBtn').disabled = false;
}

function confirmAssignService() {
    if (!selectedAssignStaffId || !currentAssignServiceId) return;

    const assignments = getAssignmentData();
    assignments[currentAssignServiceId] = selectedAssignStaffId;
    saveAssignmentData(assignments);

    const staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    const member = staff.find(s => String(s.id) === String(selectedAssignStaffId));
    const services = JSON.parse(localStorage.getItem('adminServices')) || [];
    const service = services.find(s => s.id == currentAssignServiceId);

    bootstrap.Modal.getInstance(document.getElementById('assignServiceModal')).hide();
    showNotification(`"${service?.name}" assigned to ${member?.name || 'staff'}!`, 'success');

    const activeTab = document.querySelector('.assign-tab-btn.active');
    if (activeTab) switchAssignTab(activeTab.dataset.tab, activeTab);
}

function unassignService(serviceId) {
    const services = JSON.parse(localStorage.getItem('adminServices')) || [];
    const service = services.find(s => s.id == serviceId);
    if (!confirm(`Remove assignment for "${service?.name}"?`)) return;

    const assignments = getAssignmentData();
    delete assignments[serviceId];
    saveAssignmentData(assignments);
    showNotification('Assignment removed.', 'success');

    const activeTab = document.querySelector('.assign-tab-btn.active');
    if (activeTab) switchAssignTab(activeTab.dataset.tab, activeTab);
}

function unassignAllFromStaff(staffId) {
    const staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    const member = staff.find(s => String(s.id) === String(staffId));
    if (!confirm(`Remove all service assignments from "${member?.name}"?`)) return;

    const assignments = getAssignmentData();
    Object.keys(assignments).forEach(svcId => {
        if (String(assignments[svcId]) === String(staffId)) delete assignments[svcId];
    });
    saveAssignmentData(assignments);
    showNotification(`All assignments removed from ${member?.name || 'staff'}.`, 'success');

    const activeTab = document.querySelector('.assign-tab-btn.active');
    if (activeTab) switchAssignTab(activeTab.dataset.tab, activeTab);
}

function openViewStaffServices(staffId) {
    const staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    const services = JSON.parse(localStorage.getItem('adminServices')) || [];
    const assignments = getAssignmentData();
    const member = staff.find(s => String(s.id) === String(staffId));

    const assignedServiceIds = Object.keys(assignments).filter(svcId => String(assignments[svcId]) === String(staffId));
    const assignedServices = services.filter(s => assignedServiceIds.includes(String(s.id)));

    const initials = member ? member.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
    const progress = getStaffProgress(staffId);
    const cfg = getProgressConfig(progress);

    let body = `
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:18px;border-bottom:1.5px solid var(--border);">
            <div class="staff-avatar-lg" style="width:64px;height:64px;flex-shrink:0;">
                ${member?.photo ? `<img src="${member.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : `<span style="color:white;font-weight:800;font-size:22px;">${initials}</span>`}
            </div>
            <div>
                <strong style="font-size:17px;">${escapeHtml(member?.name || 'Unknown')}</strong>
                <div style="font-size:12px;color:var(--text-muted);">${escapeHtml(member?.email || '')}</div>
                <div class="progress-indicator-row mt-2">
                    <span class="progress-dot ${cfg.dotClass}"></span>
                    <span class="progress-badge ${cfg.badgeClass}">${cfg.label}</span>
                </div>
            </div>
        </div>`;

    if (assignedServices.length === 0) {
        body += `<div class="empty-state"><i class="bi bi-inbox"></i><p>No services assigned yet</p></div>`;
    } else {
        body += `<div class="staff-services-grid">`;
        assignedServices.forEach(service => {
            const imgHtml = service.image
                ? `<img src="${service.image}" alt="${escapeHtml(service.name)}" class="card-img">`
                : `<div class="card-img-placeholder"><i class="bi bi-image"></i></div>`;

            body += `
                <div class="staff-service-card">
                    ${imgHtml}
                    <div class="card-body">
                        <strong>${escapeHtml(service.name)}</strong>
                        <div class="card-meta">${formatTZS(service.price)} · ${escapeHtml(service.duration)}</div>
                    </div>
                </div>`;
        });
        body += `</div>`;
    }

    document.getElementById('viewStaffServicesBody').innerHTML = body;
    new bootstrap.Modal(document.getElementById('viewStaffServicesModal')).show();
}

function openProgressChangeMenu(staffId, btn) {
    const existing = document.querySelector('.progress-dropdown');
    if (existing) existing.remove();

    const options = [
        { key: 'not_started', label: 'Not Started', dotClass: 'legend-red' },
        { key: 'just_started', label: 'Just Started', dotClass: 'legend-yellow' },
        { key: 'in_progress',  label: 'In Progress',  dotClass: 'legend-blue' },
        { key: 'complete',     label: 'Complete',      dotClass: 'legend-green' }
    ];

    const dropdown = document.createElement('div');
    dropdown.className = 'progress-dropdown';
    dropdown.innerHTML = options.map(opt => `
        <div class="progress-dropdown-item" onclick="changeStaffProgress(${staffId}, '${opt.key}', this.closest('.progress-dropdown'))">
            <span class="progress-dot ${opt.dotClass}" style="margin-right:10px;"></span>
            ${escapeHtml(opt.label)}
        </div>`).join('');

    document.body.appendChild(dropdown);

    const rect = btn.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + window.scrollY + 6) + 'px';
    dropdown.style.left = Math.min(rect.left + window.scrollX, window.innerWidth - 220) + 'px';

    setTimeout(() => {
        const closeDropdown = (e) => {
            if (!dropdown.contains(e.target) && e.target !== btn) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        };
        document.addEventListener('click', closeDropdown);
    }, 100);
}

function changeStaffProgress(staffId, progress, dropdownEl) {
    setStaffProgress(staffId, progress);
    if (dropdownEl) dropdownEl.remove();
    const cfg = getProgressConfig(progress);
    showNotification(`Progress updated to "${cfg.label}"`, 'success');
    const activeTab = document.querySelector('.assign-tab-btn.active');
    if (activeTab) switchAssignTab(activeTab.dataset.tab, activeTab);
}

// ========== CREDENTIALS & STATE ==========
const ADMIN_CREDENTIALS = {
    email: "admin@csms.co.tz",
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
let bookingChart = null;
let revenueChart = null;
let logoutTimer = null;
let generatedReportData = null;

const MAX_INCLUDED = 6;

// ========== UTILITIES ==========
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

function formatTZS(amount) {
    if (!amount && amount !== 0) return '—';
    return 'TZS ' + Number(amount).toLocaleString('en-TZ');
}

function showNotification(message, type = 'info') {
    const container = document.querySelector('.toast-container');
    if (!container) return;

    const icons = {
        success: { icon: 'bi-check-circle-fill', color: '#16a34a' },
        error:   { icon: 'bi-exclamation-triangle-fill', color: '#dc2626' },
        info:    { icon: 'bi-info-circle-fill', color: '#1a56db' },
        warning: { icon: 'bi-exclamation-circle-fill', color: '#d97706' }
    };
    const cfg = icons[type] || icons.info;

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.borderLeftColor = cfg.color;
    toast.innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <i class="bi ${cfg.icon}" style="color:${cfg.color}; font-size:16px; flex-shrink:0;"></i>
            <span class="flex-grow-1">${escapeHtml(message)}</span>
            <button style="background:none;border:none;cursor:pointer;opacity:.5;font-size:14px;padding:0;margin-left:6px;"
                    onclick="this.closest('.toast-notification').remove()">✕</button>
        </div>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'bi bi-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'bi bi-eye';
    }
}

// ========== OTP ==========
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendOTP(email) {
    generatedOTP = generateOTP();
    otpExpiry = Date.now() + 5 * 60 * 1000;
    console.log(`[DEMO] OTP for ${email}: ${generatedOTP}`);
    showNotification(`OTP sent to ${email} (Demo: ${generatedOTP})`, 'success');
    return true;
}

// ========== LOGIN ==========
function verifyCredentials() {
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;

    if (!email || !password) {
        showNotification('Please enter both email and password', 'error');
        return;
    }

    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        sendOTP(email);
        document.querySelector('.step-1').classList.remove('active');
        document.querySelector('.step-2').classList.add('active');
        setTimeout(() => document.getElementById('otp1').focus(), 100);
    } else {
        showNotification('Invalid email or password!', 'error');
        const card = document.querySelector('.login-card');
        card.style.animation = 'shake 0.5s';
        setTimeout(() => { card.style.animation = ''; }, 500);
    }
}

function verifyOTP() {
    let enteredOTP = '';
    for (let i = 1; i <= 6; i++) {
        enteredOTP += document.getElementById(`otp${i}`).value;
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
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
        document.getElementById('dashboard').style.flexDirection = 'column';
        initDashboard();
        showNotification('Login successful! Welcome, Administrator.', 'success');
        sessionStorage.setItem('adminLoggedIn', 'true');
    } else {
        showNotification('Invalid OTP. Please try again.', 'error');
    }
}

function resendOTP() {
    sendOTP(ADMIN_CREDENTIALS.email);
    for (let i = 1; i <= 6; i++) document.getElementById(`otp${i}`).value = '';
    document.getElementById('otp1').focus();
}

function backToLogin() {
    document.querySelector('.step-2').classList.remove('active');
    document.querySelector('.step-1').classList.add('active');
    document.getElementById('adminPassword').value = '';
    for (let i = 1; i <= 6; i++) document.getElementById(`otp${i}`).value = '';
}

function moveToNext(current, nextId) {
    if (current.value.length === 1) {
        const next = document.getElementById(nextId);
        if (next) next.focus();
    }
}

function validateOTP() {
    const otp6 = document.getElementById('otp6');
    if (otp6.value.length === 1) verifyOTP();
}

function showDemoCredentials() {
    showNotification('Email: admin@csms.co.tz | Password: Admin@2024', 'info');
}

// ========== ENHANCED LOGOUT FLOW ==========
function initiateLogout() {
    document.getElementById('logoutOverlay').style.display = 'flex';
    document.querySelector('.logout-dialog').classList.add('animate__fadeInUp');
}

function cancelLogout() {
    document.getElementById('logoutOverlay').style.display = 'none';
    document.querySelector('.logout-dialog').classList.remove('animate__fadeInUp');
}

function confirmLogout() {
    // Hide the confirmation dialog
    document.getElementById('logoutOverlay').style.display = 'none';
    
    // Show loading screen
    document.getElementById('logoutLoading').style.display = 'flex';
    
    // Animate progress bar
    const progressBar = document.getElementById('logoutProgressBar');
    let progress = 0;
    
    const progressInterval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 100) progress = 100;
        progressBar.style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(progressInterval);
            performLogout();
        }
    }, 300);
}

function performLogout() {
    // Clear session
    sessionStorage.clear();
    
    // Brief delay for animation
    setTimeout(() => {
        document.getElementById('logoutLoading').style.display = 'none';
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('loginSection').style.display = 'flex';
        
        // Reset login form
        document.getElementById('adminEmail').value = '';
        document.getElementById('adminPassword').value = '';
        document.querySelector('.step-2').classList.remove('active');
        document.querySelector('.step-1').classList.add('active');
        for (let i = 1; i <= 6; i++) document.getElementById(`otp${i}`).value = '';
        
        showNotification('Logged out successfully! See you soon.', 'info');
    }, 500);
}

// Override the sidebar logout to use enhanced flow
function logoutAdmin() {
    initiateLogout();
}

// ========== NAVIGATION ==========
function showSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`${sectionId}Section`);
    if (target) target.classList.add('active');

    document.querySelectorAll('.sidebar-menu li').forEach(li => {
        li.classList.remove('active');
        if (li.getAttribute('data-section') === sectionId) li.classList.add('active');
    });

    if (sectionId === 'assignment') {
        loadAssignmentSection();
    }

    if (window.innerWidth <= 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function setupMenuClickHandlers() {
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            if (section === 'logout') initiateLogout();
            else if (section) showSection(section);
        });
    });
}

// ========== DASHBOARD INIT ==========
function initDashboard() {
    initializeSampleData();
    loadDashboardStats();
    loadServices();
    loadBookings();
    loadStaff();
    loadMessages();
    loadContractors();
    loadInvoices();
    initCharts();
    loadRecentBookings();
    loadSettings();
    setupMenuClickHandlers();
    initIncludedManualEntry('includedManualEntry', 'addIncludedItemBtn', []);
    populateInvoiceContractors();
    loadAssignmentSection();
}

// ========== DASHBOARD STATS (CLICKABLE) ==========
function loadDashboardStats() {
    const services = JSON.parse(localStorage.getItem('adminServices')) || [];
    const staff    = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    const bookings = JSON.parse(localStorage.getItem('customerBookings')) || [];
    const messages = JSON.parse(localStorage.getItem('contact_messages')) || [];
    const supervisorMsgs = JSON.parse(localStorage.getItem('supervisor_messages')) || [];
    const contractors = JSON.parse(localStorage.getItem('contractors')) || [];

    document.getElementById('dashboardStats').innerHTML = `
        <div class="stat-card" onclick="showDashboardDetail('services')">
            <div class="stat-icon"><i class="bi bi-grid-3x3-gap-fill"></i></div>
            <div class="stat-value">${services.length}</div>
            <div class="stat-label">Total Services</div>
        </div>
        <div class="stat-card" onclick="showDashboardDetail('staff')">
            <div class="stat-icon"><i class="bi bi-people-fill"></i></div>
            <div class="stat-value">${staff.length}</div>
            <div class="stat-label">Staff Members</div>
        </div>
        <div class="stat-card" onclick="showDashboardDetail('bookings')">
            <div class="stat-icon"><i class="bi bi-calendar-check-fill"></i></div>
            <div class="stat-value">${bookings.length}</div>
            <div class="stat-label">Total Bookings</div>
        </div>
        <div class="stat-card" onclick="showDashboardDetail('messages')">
            <div class="stat-icon"><i class="bi bi-envelope-fill"></i></div>
            <div class="stat-value">${messages.length + supervisorMsgs.length}</div>
            <div class="stat-label">Messages</div>
        </div>
        <div class="stat-card" onclick="showDashboardDetail('contractors')">
            <div class="stat-icon"><i class="bi bi-building"></i></div>
            <div class="stat-value">${contractors.length}</div>
            <div class="stat-label">Contractors</div>
        </div>
    `;
}

function showDashboardDetail(type) {
    const titles = {
        services: 'All Services',
        staff: 'Staff Members',
        bookings: 'All Bookings',
        messages: 'All Messages',
        contractors: 'Contractor Companies'
    };

    const icons = {
        services: 'bi-grid-3x3-gap-fill',
        staff: 'bi-people-fill',
        bookings: 'bi-calendar-check-fill',
        messages: 'bi-envelope-fill',
        contractors: 'bi-building'
    };

    document.getElementById('dashboardDetailTitle').innerHTML = 
        `<i class="bi ${icons[type]} me-2"></i>${titles[type]}`;

    let body = '';
    
    switch(type) {
        case 'services':
            const services = JSON.parse(localStorage.getItem('adminServices')) || [];
            body = services.length === 0 ? 
                '<p class="text-muted text-center py-4">No services added yet</p>' :
                `<div class="table-responsive"><table class="table table-sm">
                    <thead><tr><th>Name</th><th>Price (TZS)</th><th>Duration</th><th>Location</th></tr></thead>
                    <tbody>${services.map(s => `
                        <tr>
                            <td><strong>${escapeHtml(s.name)}</strong></td>
                            <td>${formatTZS(s.price)}</td>
                            <td>${escapeHtml(s.duration)}</td>
                            <td>${escapeHtml(s.location)}</td>
                        </tr>`).join('')}</tbody>
                </table></div>`;
            break;

        case 'staff':
            const staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
            body = staff.length === 0 ?
                '<p class="text-muted text-center py-4">No staff members added yet</p>' :
                `<div class="table-responsive"><table class="table table-sm">
                    <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Type</th></tr></thead>
                    <tbody>${staff.map(s => `
                        <tr>
                            <td><strong>${escapeHtml(s.name)}</strong></td>
                            <td>${escapeHtml(s.email)}</td>
                            <td><span class="badge bg-success">Active</span></td>
                            <td>${escapeHtml(s.staffType || 'normal')}</td>
                        </tr>`).join('')}</tbody>
                </table></div>`;
            break;

        case 'bookings':
            const bookings = JSON.parse(localStorage.getItem('customerBookings')) || [];
            body = bookings.length === 0 ?
                '<p class="text-muted text-center py-4">No bookings found</p>' :
                `<div class="table-responsive"><table class="table table-sm">
                    <thead><tr><th>ID</th><th>Customer</th><th>Service</th><th>Status</th></tr></thead>
                    <tbody>${bookings.map(b => `
                        <tr>
                            <td>#${escapeHtml(String(b.id || 'N/A'))}</td>
                            <td>${escapeHtml(b.customer || 'N/A')}</td>
                            <td>${escapeHtml(b.service || 'N/A')}</td>
                            <td><span class="badge bg-${b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'secondary'}">${b.status || 'pending'}</span></td>
                        </tr>`).join('')}</tbody>
                </table></div>`;
            break;

        case 'messages':
            const msgs = [
                ...(JSON.parse(localStorage.getItem('contact_messages')) || []).map(m => ({...m, type: 'customer'})),
                ...(JSON.parse(localStorage.getItem('supervisor_messages')) || []).map(m => ({...m, type: 'supervisor'}))
            ];
            body = msgs.length === 0 ?
                '<p class="text-muted text-center py-4">No messages found</p>' :
                `<div class="table-responsive"><table class="table table-sm">
                    <thead><tr><th>From</th><th>Type</th><th>Subject</th><th>Date</th></tr></thead>
                    <tbody>${msgs.slice(-10).reverse().map(m => `
                        <tr>
                            <td><strong>${escapeHtml(m.name)}</strong></td>
                            <td><span class="message-type-badge message-${m.type}">${m.type}</span></td>
                            <td>${escapeHtml(m.subject || 'N/A')}</td>
                            <td>${m.timestamp ? new Date(m.timestamp).toLocaleDateString() : '—'}</td>
                        </tr>`).join('')}</tbody>
                </table></div>`;
            break;

        case 'contractors':
            const contractors = JSON.parse(localStorage.getItem('contractors')) || [];
            body = contractors.length === 0 ?
                '<p class="text-muted text-center py-4">No contractors found</p>' :
                `<div class="table-responsive"><table class="table table-sm">
                    <thead><tr><th>Company</th><th>Type</th><th>Location</th><th>Workers</th><th>Period</th></tr></thead>
                    <tbody>${contractors.map(c => `
                        <tr>
                            <td><strong>${escapeHtml(c.companyName)}</strong></td>
                            <td><span class="contractor-type-badge contractor-${c.type}">${c.type}</span></td>
                            <td>${escapeHtml(c.location || '—')}</td>
                            <td>${c.workersAssigned || 0}</td>
                            <td>${escapeHtml(c.contractStart || '—')} — ${escapeHtml(c.contractEnd || '—')}</td>
                        </tr>`).join('')}</tbody>
                </table></div>`;
            break;
    }

    document.getElementById('dashboardDetailBody').innerHTML = body;
    new bootstrap.Modal(document.getElementById('dashboardDetailModal')).show();
}

function loadRecentBookings() {
    const bookings = JSON.parse(localStorage.getItem('customerBookings')) || [];
    const recent = bookings.slice(-5).reverse();
    let html = '';
    recent.forEach(b => {
        html += `
            <div class="recent-booking-item">
                <div class="rbi-dot"></div>
                <div class="rbi-content">
                    <strong>${escapeHtml(b.service || 'Service')}</strong>
                    <p>${escapeHtml(b.date || 'Date TBD')} — ${escapeHtml(b.customer || 'Customer')}</p>
                </div>
            </div>`;
    });
    document.getElementById('recentBookingsList').innerHTML =
        html || '<p class="text-muted text-center py-3" style="font-size:13px;">No recent bookings</p>';
}

// ========== WHAT'S INCLUDED ==========
function initIncludedManualEntry(containerId, btnId, existingItems) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (existingItems && existingItems.length > 0) {
        existingItems.forEach(item => _appendIncludedField(containerId, btnId, item));
    }
    updateAddIncludedBtnVisibility(containerId, btnId);
}

function addIncludedField(containerId, btnId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const count = container.querySelectorAll('.included-manual-row').length;
    if (count >= MAX_INCLUDED) {
        showNotification(`Maximum of ${MAX_INCLUDED} items allowed.`, 'warning');
        return;
    }
    _appendIncludedField(containerId, btnId, '');
    updateAddIncludedBtnVisibility(containerId, btnId);
}

function _appendIncludedField(containerId, btnId, value) {
    const container = document.getElementById(containerId);
    const row = document.createElement('div');
    row.className = 'included-manual-row';
    row.innerHTML = `
        <i class="bi bi-check2-circle item-num-icon"></i>
        <input type="text" class="form-control included-text-input" placeholder="e.g. Window Cleaning" maxlength="60" value="${escapeHtml(value)}">
        <button type="button" class="included-remove-btn" onclick="removeIncludedField(this, '${containerId}', '${btnId}')" title="Remove">
            <i class="bi bi-x-lg"></i>
        </button>`;
    container.appendChild(row);
}

function removeIncludedField(btn, containerId, btnId) {
    const row = btn.closest('.included-manual-row');
    if (row) row.remove();
    updateAddIncludedBtnVisibility(containerId, btnId);
}

function updateAddIncludedBtnVisibility(containerId, btnId) {
    const container = document.getElementById(containerId);
    const btn = document.getElementById(btnId);
    if (!container || !btn) return;
    const count = container.querySelectorAll('.included-manual-row').length;
    btn.style.display = count >= MAX_INCLUDED ? 'none' : 'inline-flex';
}

function getIncludedItems(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    const inputs = container.querySelectorAll('.included-text-input');
    const items = [];
    inputs.forEach(input => {
        const val = input.value.trim();
        if (val) items.push(val);
    });
    return items;
}

// ========== IMAGE UPLOAD ==========
function openImageUploadModal(target) {
    currentImageTarget = target;
    modalImageBase64 = null;
    const confirmBtn = document.getElementById('confirmUploadBtn');
    const modalPreview = document.getElementById('modalImagePreview');
    const zoneContent = document.getElementById('uploadZoneContent');
    const errorDiv = document.getElementById('uploadError');
    const fileInput = document.getElementById('modalImageInput');
    confirmBtn.disabled = true;
    modalPreview.style.display = 'none';
    zoneContent.style.display = 'block';
    errorDiv.style.display = 'none';
    fileInput.value = '';
    const titles = {
        service: 'Upload Service Image',
        staff: 'Upload Staff Photo',
        editService: 'Change Service Image',
        editStaff: 'Change Staff Photo'
    };
    document.getElementById('imageModalTitle').textContent = titles[target] || 'Upload Image';
    new bootstrap.Modal(document.getElementById('imageUploadModal')).show();
}

function handleModalImageSelect(event) {
    const file = event.target.files[0];
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
    const file = event.dataTransfer.files[0];
    if (file) processImageFile(file);
}

function processImageFile(file) {
    const errorDiv = document.getElementById('uploadError');
    errorDiv.style.display = 'none';
    if (!file.type.startsWith('image/')) {
        errorDiv.textContent = 'Please select a valid image file (PNG, JPG, WEBP).';
        errorDiv.style.display = 'block';
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        errorDiv.textContent = 'Image size must be less than 2MB.';
        errorDiv.style.display = 'block';
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        modalImageBase64 = e.target.result;
        const preview = document.getElementById('modalImagePreview');
        const zoneContent = document.getElementById('uploadZoneContent');
        preview.src = modalImageBase64;
        preview.style.display = 'block';
        zoneContent.style.display = 'none';
        document.getElementById('confirmUploadBtn').disabled = false;
    };
    reader.readAsDataURL(file);
}

function confirmImageUpload() {
    if (!modalImageBase64) return;
    if (currentImageTarget === 'service') {
        pendingServiceImage = modalImageBase64;
        document.getElementById('serviceImageTrigger').classList.add('has-image');
        document.getElementById('imageUploadLabel').textContent = '✓ Image Selected';
        document.getElementById('imagePreview').src = pendingServiceImage;
        document.getElementById('imagePreviewContainer').style.display = 'flex';
    } else if (currentImageTarget === 'staff') {
        pendingStaffImage = modalImageBase64;
        document.getElementById('staffImageTrigger').classList.add('has-image');
        document.getElementById('staffImageLabel').textContent = '✓ Photo Selected';
        document.getElementById('staffImagePreview').src = pendingStaffImage;
        document.getElementById('staffImagePreviewContainer').style.display = 'flex';
    } else if (currentImageTarget === 'editService') {
        pendingEditServiceImage = modalImageBase64;
        document.getElementById('editServiceImageTrigger').classList.add('has-image');
        document.getElementById('editImageUploadLabel').textContent = '✓ Image Changed';
        document.getElementById('editImagePreview').src = pendingEditServiceImage;
        document.getElementById('editImagePreviewContainer').style.display = 'flex';
    } else if (currentImageTarget === 'editStaff') {
        pendingEditStaffImage = modalImageBase64;
        const photoEl = document.getElementById('editStaffPhotoPreview');
        const initialsEl = document.getElementById('editStaffInitials');
        if (photoEl && initialsEl) {
            photoEl.src = modalImageBase64;
            photoEl.style.display = 'block';
            initialsEl.style.display = 'none';
        }
    }
    bootstrap.Modal.getInstance(document.getElementById('imageUploadModal')).hide();
    showNotification('Image selected successfully!', 'success');
}

function clearServiceImage() {
    pendingServiceImage = null;
    document.getElementById('serviceImageTrigger')?.classList.remove('has-image');
    document.getElementById('imageUploadLabel').textContent = 'Upload Image';
    document.getElementById('imagePreviewContainer').style.display = 'none';
    document.getElementById('imagePreview').src = '';
}

function clearStaffImage() {
    pendingStaffImage = null;
    document.getElementById('staffImageTrigger')?.classList.remove('has-image');
    document.getElementById('staffImageLabel').textContent = 'Upload Photo';
    document.getElementById('staffImagePreviewContainer').style.display = 'none';
    document.getElementById('staffImagePreview').src = '';
}

function clearEditServiceImage() {
    pendingEditServiceImage = null;
    document.getElementById('editServiceImageTrigger')?.classList.remove('has-image');
    document.getElementById('editImageUploadLabel').textContent = 'Change Image';
    document.getElementById('editImagePreviewContainer').style.display = 'none';
    document.getElementById('editImagePreview').src = '';
}

// ========== CONTRACTORS ==========
function addContractor() {
    const name          = document.getElementById('contractorName').value.trim();
    const type          = document.getElementById('contractorType').value;
    const location      = document.getElementById('contractorLocation').value.trim();
    const workers       = parseInt(document.getElementById('contractorWorkers').value) || 0;
    const startDate     = document.getElementById('contractorStartDate').value;
    const endDate       = document.getElementById('contractorEndDate').value;
    const contractValue = parseInt(document.getElementById('contractorValue').value) || 0;
    const contactPerson = document.getElementById('contractorContactPerson').value.trim();
    const email         = document.getElementById('contractorEmail').value.trim();
    const phone         = document.getElementById('contractorPhone').value.trim();
    const servicesStr   = document.getElementById('contractorServices').value.trim();

    if (!name || !location) {
        showNotification('Contractor name and location are required', 'error');
        return;
    }

    const servicesList = servicesStr ? servicesStr.split(',').map(s => s.trim()).filter(s => s) : [];

    const contractors = JSON.parse(localStorage.getItem('contractors')) || [];
    
    const newContractor = {
        id: Date.now(),
        companyName: name,
        type,
        location,
        workersAssigned: workers,
        contractStart: startDate,
        contractEnd: endDate,
        contractValue,
        contactPerson,
        email,
        phone,
        services: servicesList,
        status: 'active',
        createdAt: new Date().toISOString()
    };

    contractors.push(newContractor);
    localStorage.setItem('contractors', JSON.stringify(contractors));

    // Clear form
    document.getElementById('contractorName').value = '';
    document.getElementById('contractorType').value = 'private';
    document.getElementById('contractorLocation').value = '';
    document.getElementById('contractorWorkers').value = '';
    document.getElementById('contractorStartDate').value = '';
    document.getElementById('contractorEndDate').value = '';
    document.getElementById('contractorValue').value = '';
    document.getElementById('contractorContactPerson').value = '';
    document.getElementById('contractorEmail').value = '';
    document.getElementById('contractorPhone').value = '';
    document.getElementById('contractorServices').value = '';

    loadContractors();
    populateInvoiceContractors();
    loadDashboardStats();
    showNotification(`Contractor "${name}" added successfully!`, 'success');
}

function loadContractors() {
    const contractors = JSON.parse(localStorage.getItem('contractors')) || [];
    renderContractorsTable(contractors);
}

function renderContractorsTable(contractors) {
    let html = '';
    const filtered = currentContractorFilter === 'all' 
        ? contractors 
        : contractors.filter(c => c.type === currentContractorFilter);

    if (filtered.length === 0) {
        html = `<tr><td colspan="7" class="text-center text-muted py-4" style="font-size:13px;">No contractors found</td></tr>`;
    } else {
        filtered.forEach(contractor => {
            const typeBadge = contractor.type === 'private'
                ? '<span class="contractor-type-badge contractor-private"><i class="bi bi-briefcase me-1"></i>Private</span>'
                : '<span class="contractor-type-badge contractor-government"><i class="bi bi-building-fill me-1"></i>Government</span>';

            html += `
                <tr>
                    <td>
                        <strong>${escapeHtml(contractor.companyName)}</strong>
                        <div style="font-size:11px;color:var(--text-muted);">${escapeHtml(contractor.contactPerson || '')}</div>
                    </td>
                    <td>${typeBadge}</td>
                    <td>${escapeHtml(contractor.location || '—')}</td>
                    <td><span class="badge bg-primary" style="font-size:12px;">${contractor.workersAssigned || 0} workers</span></td>
                    <td style="font-size:12px;">
                        <i class="bi bi-calendar3 me-1"></i>${escapeHtml(contractor.contractStart || '—')} 
                        — ${escapeHtml(contractor.contractEnd || '—')}
                    </td>
                    <td><span class="badge ${contractor.status === 'active' ? 'bg-success' : 'bg-secondary'}">${contractor.status || 'active'}</span></td>
                    <td style="text-align:center;">
                        <button class="action-btn action-btn-view" onclick="viewContractorDetails('${contractor.id}')" title="View Details"><i class="bi bi-eye-fill"></i></button>
                        <button class="action-btn action-btn-edit" onclick="generateInvoiceForContractor('${contractor.id}')" title="Generate Invoice"><i class="bi bi-receipt"></i></button>
                    </td>
                </tr>`;
        });
    }

    document.getElementById('contractorsList').innerHTML = html;
}

function filterContractors(type, btnEl) {
    currentContractorFilter = type;
    document.querySelectorAll('#contractorsSection .filter-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    loadContractors();
}

function viewContractorDetails(contractorId) {
    const contractors = JSON.parse(localStorage.getItem('contractors')) || [];
    const contractor = contractors.find(c => c.id == contractorId);
    if (!contractor) return;
    currentContractorId = contractorId;

    document.getElementById('contractorDetailsBody').innerHTML = `
        <div class="contractor-detail-section">
            <h6><i class="bi bi-info-circle me-1"></i>Company Information</h6>
            <div class="contractor-info-grid">
                <div class="contractor-info-item">
                    <div class="label">Company Name</div>
                    <div class="value">${escapeHtml(contractor.companyName)}</div>
                </div>
                <div class="contractor-info-item">
                    <div class="label">Type</div>
                    <div class="value">${contractor.type === 'private' ? 'Private Company' : 'Government Organization'}</div>
                </div>
                <div class="contractor-info-item">
                    <div class="label">Location</div>
                    <div class="value">${escapeHtml(contractor.location || 'N/A')}</div>
                </div>
                <div class="contractor-info-item">
                    <div class="label">Contact Person</div>
                    <div class="value">${escapeHtml(contractor.contactPerson || 'N/A')}</div>
                </div>
                <div class="contractor-info-item">
                    <div class="label">Email</div>
                    <div class="value">${escapeHtml(contractor.email || 'N/A')}</div>
                </div>
                <div class="contractor-info-item">
                    <div class="label">Phone</div>
                    <div class="value">${escapeHtml(contractor.phone || 'N/A')}</div>
                </div>
                <div class="contractor-info-item">
                    <div class="label">Workers Assigned</div>
                    <div class="value">${contractor.workersAssigned || 0}</div>
                </div>
            </div>
        </div>
        <div class="contractor-detail-section">
            <h6><i class="bi bi-file-text me-1"></i>Contract Details</h6>
            <div class="contractor-info-grid">
                <div class="contractor-info-item">
                    <div class="label">Start Date</div>
                    <div class="value">${escapeHtml(contractor.contractStart || '—')}</div>
                </div>
                <div class="contractor-info-item">
                    <div class="label">End Date</div>
                    <div class="value">${escapeHtml(contractor.contractEnd || '—')}</div>
                </div>
                <div class="contractor-info-item">
                    <div class="label">Contract Value</div>
                    <div class="value">${formatTZS(contractor.contractValue)}</div>
                </div>
                <div class="contractor-info-item">
                    <div class="label">Status</div>
                    <div class="value"><span class="badge ${contractor.status === 'active' ? 'bg-success' : 'bg-secondary'}">${contractor.status}</span></div>
                </div>
            </div>
        </div>
        <div class="contractor-detail-section">
            <h6><i class="bi bi-list-check me-1"></i>Services Provided</h6>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
                ${(contractor.services || []).length > 0 
                    ? contractor.services.map(s => `<span class="included-tag">${escapeHtml(s)}</span>`).join('')
                    : '<span class="text-muted" style="font-size:12px;">No services listed</span>'}
            </div>
        </div>
    `;

    new bootstrap.Modal(document.getElementById('contractorDetailsModal')).show();
}

function generateInvoiceForContractor(contractorId) {
    bootstrap.Modal.getInstance(document.getElementById('contractorDetailsModal'))?.hide();
    
    const contractors = JSON.parse(localStorage.getItem('contractors')) || [];
    const contractor = contractors.find(c => c.id == contractorId);
    if (!contractor) return;

    const workCost = Math.round((contractor.contractValue || 12000000) / 12) || 500000;
    const workersCost = (contractor.workersAssigned || 5) * 150000;
    const equipmentCost = 75000;
    const total = workCost + workersCost + equipmentCost;

    currentInvoiceData = {
        id: 'INV-' + Date.now().toString().slice(-8),
        contractorId: contractorId,
        contractorName: contractor.companyName,
        contractorType: contractor.type,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        workDesc: 'Monthly Cleaning Services',
        workCost,
        workersCost,
        equipmentCost,
        total,
        workersCount: contractor.workersAssigned || 5,
        createdAt: new Date().toISOString()
    };

    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    invoices.push(currentInvoiceData);
    localStorage.setItem('invoices', JSON.stringify(invoices));

    showInvoicePreview(currentInvoiceData);
    loadInvoices();
    showNotification('Invoice generated successfully!', 'success');
}

// ========== INVOICE ==========
function populateInvoiceContractors() {
    const contractors = JSON.parse(localStorage.getItem('contractors')) || [];
    const select = document.getElementById('invoiceContractor');
    if (!select) return;
    select.innerHTML = '<option value="">Choose contractor...</option>' +
        contractors.map(c => `<option value="${c.id}">${escapeHtml(c.companyName)} (${c.type})</option>`).join('');
}

function calculateInvoiceTotal() {
    const workCost = Number(document.getElementById('invoiceWorkCost').value) || 0;
    const workersCost = Number(document.getElementById('invoiceWorkersCost').value) || 0;
    const equipmentCost = Number(document.getElementById('invoiceEquipmentCost').value) || 0;
    const total = workCost + workersCost + equipmentCost;
    document.getElementById('invoiceTotalDisplay').textContent = total.toLocaleString('en-TZ');
}

function updateInvoicePreview() {
    calculateInvoiceTotal();
}

function generateInvoice() {
    const contractorId = document.getElementById('invoiceContractor').value;
    if (!contractorId) {
        showNotification('Please select a contractor', 'error');
        return;
    }

    const contractors = JSON.parse(localStorage.getItem('contractors')) || [];
    const contractor = contractors.find(c => c.id == contractorId);
    if (!contractor) return;

    const invoiceDate = document.getElementById('invoiceDate').value || new Date().toISOString().split('T')[0];
    const dueDate = document.getElementById('invoiceDueDate').value || '';
    const workDesc = document.getElementById('invoiceWorkDesc').value || 'Cleaning Services';
    const workCost = Number(document.getElementById('invoiceWorkCost').value) || 500000;
    const workersCost = Number(document.getElementById('invoiceWorkersCost').value) || 750000;
    const equipmentCost = Number(document.getElementById('invoiceEquipmentCost').value) || 75000;
    const total = workCost + workersCost + equipmentCost;

    currentInvoiceData = {
        id: 'INV-' + Date.now().toString().slice(-8),
        contractorId,
        contractorName: contractor.companyName,
        contractorType: contractor.type,
        invoiceDate,
        dueDate,
        workDesc,
        workCost,
        workersCost,
        equipmentCost,
        total,
        workersCount: contractor.workersAssigned || 5,
        createdAt: new Date().toISOString()
    };

    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    invoices.push(currentInvoiceData);
    localStorage.setItem('invoices', JSON.stringify(invoices));

    showInvoicePreview(currentInvoiceData);
    loadInvoices();
    showNotification('Invoice generated successfully!', 'success');
}

function showInvoicePreview(invoiceData) {
    currentInvoiceData = invoiceData;

    document.getElementById('invoicePreviewBody').innerHTML = `
        <div class="invoice-preview">
            <div class="invoice-header">
                <div class="invoice-header-left">
                    <h3>CSMS</h3>
                    <p>Cleaning Service Management System</p>
                    <p style="margin-top:8px;font-size:11px;">Zanzibar, Tanzania</p>
                    <p style="font-size:11px;">info@csms.co.tz</p>
                </div>
                <div class="invoice-header-right">
                    <h4>INVOICE</h4>
                    <p style="font-size:12px;color:var(--text-muted);">#${escapeHtml(invoiceData.id)}</p>
                    <p style="font-size:12px;">Date: ${escapeHtml(invoiceData.invoiceDate)}</p>
                    ${invoiceData.dueDate ? `<p style="font-size:12px;">Due: ${escapeHtml(invoiceData.dueDate)}</p>` : ''}
                </div>
            </div>
            <div style="margin-bottom:20px;">
                <strong style="font-size:14px;">Bill To:</strong><br>
                <span style="font-size:14px;">${escapeHtml(invoiceData.contractorName)}</span><br>
                <span style="font-size:12px;color:var(--text-muted);">${escapeHtml(invoiceData.contractorType)} Company</span>
            </div>
            <table class="invoice-table">
                <thead><tr><th>Description</th><th style="text-align:right;">Amount (TZS)</th></tr></thead>
                <tbody>
                    <tr><td>Work Done — ${escapeHtml(invoiceData.workDesc)}</td><td style="text-align:right;">${Number(invoiceData.workCost).toLocaleString('en-TZ')}</td></tr>
                    <tr><td>Workers (${invoiceData.workersCount} staff)</td><td style="text-align:right;">${Number(invoiceData.workersCost).toLocaleString('en-TZ')}</td></tr>
                    <tr><td>Equipment Used</td><td style="text-align:right;">${Number(invoiceData.equipmentCost).toLocaleString('en-TZ')}</td></tr>
                    <tr class="invoice-total-row"><td style="font-size:14px;">TOTAL</td><td style="text-align:right;font-size:18px;">TZS ${Number(invoiceData.total).toLocaleString('en-TZ')}</td></tr>
                </tbody>
            </table>
            <div style="text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid var(--border);">
                <p style="font-size:12px;color:var(--text-muted);">Thank you for your business!</p>
            </div>
        </div>
    `;

    new bootstrap.Modal(document.getElementById('invoicePreviewModal')).show();
}

function downloadInvoice() {
    if (!currentInvoiceData) return;
    const invoiceHTML = document.getElementById('invoicePreviewBody').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html><html><head><title>Invoice ${currentInvoiceData.id}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>body{font-family:'Inter',sans-serif;padding:40px;max-width:800px;margin:auto;}@media print{body{padding:20px;}}</style>
        </head><body>${invoiceHTML}</body></html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
}

function shareInvoice() {
    if (!currentInvoiceData) return;
    const shareText = `CSMS Invoice #${currentInvoiceData.id}\nContractor: ${currentInvoiceData.contractorName}\nTotal: TZS ${Number(currentInvoiceData.total).toLocaleString('en-TZ')}\nDate: ${currentInvoiceData.invoiceDate}`;
    if (navigator.share) {
        navigator.share({ title: 'CSMS Invoice', text: shareText }).catch(() => {});
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            showNotification('Invoice copied! Share via WhatsApp or other platforms.', 'success');
        }).catch(() => {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        });
    }
}

function loadInvoices() {
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    let html = '';
    if (invoices.length === 0) {
        html = `<tr><td colspan="6" class="text-center text-muted py-4" style="font-size:13px;">No invoices generated yet</td></tr>`;
    } else {
        [...invoices].reverse().forEach(inv => {
            html += `
                <tr>
                    <td><strong>#${escapeHtml(inv.id)}</strong></td>
                    <td>${escapeHtml(inv.contractorName)}</td>
                    <td>${escapeHtml(inv.invoiceDate)}</td>
                    <td><strong style="color:var(--primary)">${formatTZS(inv.total)}</strong></td>
                    <td><span class="badge bg-info">Generated</span></td>
                    <td style="text-align:center;">
                        <button class="action-btn action-btn-view" onclick='showInvoicePreview(${JSON.stringify(inv).replace(/'/g, "&#39;")})' title="View"><i class="bi bi-eye-fill"></i></button>
                        <button class="action-btn action-btn-edit" onclick='currentInvoiceData=${JSON.stringify(inv).replace(/'/g, "&#39;")};downloadInvoice()' title="Download"><i class="bi bi-download"></i></button>
                        <button class="action-btn action-btn-reply" onclick='currentInvoiceData=${JSON.stringify(inv).replace(/'/g, "&#39;")};shareInvoice()' title="Share"><i class="bi bi-share-fill"></i></button>
                    </td>
                </tr>`;
        });
    }
    const invoiceList = document.getElementById('invoiceList');
    if (invoiceList) invoiceList.innerHTML = html;
}

// ========== SERVICES ==========
function addService() {
    const name        = document.getElementById('serviceName').value.trim();
    const price       = document.getElementById('servicePrice').value.trim();
    const duration    = document.getElementById('serviceDuration').value.trim();
    const location    = document.getElementById('serviceLocation').value;
    const description = document.getElementById('serviceDescription').value.trim();
    const image       = pendingServiceImage || null;
    const included    = getIncludedItems('includedManualEntry');

    if (!name || !price) {
        showNotification('Service name and price are required', 'error');
        return;
    }
    if (isNaN(price) || Number(price) < 0) {
        showNotification('Please enter a valid price in TZS', 'error');
        return;
    }

    let services = JSON.parse(localStorage.getItem('adminServices')) || [];
    services.push({
        id: Date.now(),
        name,
        price: Number(price),
        duration: duration || '2 hours',
        location,
        description,
        included,
        image
    });
    localStorage.setItem('adminServices', JSON.stringify(services));

    document.getElementById('serviceName').value = '';
    document.getElementById('servicePrice').value = '';
    document.getElementById('serviceDuration').value = '';
    document.getElementById('serviceLocation').value = 'Unguja';
    document.getElementById('serviceDescription').value = '';
    clearServiceImage();
    initIncludedManualEntry('includedManualEntry', 'addIncludedItemBtn', []);

    loadServices();
    loadDashboardStats();
    showNotification('Service added successfully!', 'success');
}

function loadServices() {
    const services = JSON.parse(localStorage.getItem('adminServices')) || [];
    let html = '';
    if (services.length === 0) {
        html = `<tr><td colspan="6" class="text-center text-muted py-4" style="font-size:13px;">No services added yet</td></tr>`;
    } else {
        services.forEach((service, index) => {
            const imgHtml = service.image
                ? `<img src="${service.image}" alt="${escapeHtml(service.name)}" class="service-thumb">`
                : `<div class="no-image-thumb"><i class="bi bi-image"></i></div>`;
            const locClass = { Unguja: 'location-unguja', Pemba: 'location-pemba', Both: 'location-both' }[service.location] || 'location-both';
            const locIcon = { Unguja: '🏝', Pemba: '🌿', Both: '🗺' }[service.location] || '📍';

            html += `
                <tr>
                    <td>${imgHtml}</td>
                    <td>
                        <strong>${escapeHtml(service.name)}</strong>
                        ${service.description ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${escapeHtml(service.description.substring(0, 60))}${service.description.length > 60 ? '…' : ''}</div>` : ''}
                    </td>
                    <td><strong style="color:var(--primary)">${formatTZS(service.price)}</strong></td>
                    <td>${escapeHtml(service.duration)}</td>
                    <td><span class="location-badge ${locClass}">${locIcon} ${escapeHtml(service.location)}</span></td>
                    <td style="text-align:center; white-space:nowrap;">
                        <button class="action-btn action-btn-edit" onclick="openEditServiceModal(${index})" title="Edit"><i class="bi bi-pencil-fill"></i></button>
                        <button class="action-btn action-btn-delete" onclick="deleteService(${index})" title="Delete"><i class="bi bi-trash3-fill"></i></button>
                    </td>
                </tr>`;
        });
    }
    document.getElementById('serviceList').innerHTML = html;
}

function deleteService(index) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    let services = JSON.parse(localStorage.getItem('adminServices')) || [];
    const serviceId = services[index].id;
    services.splice(index, 1);
    localStorage.setItem('adminServices', JSON.stringify(services));
    let assignments = JSON.parse(localStorage.getItem('serviceAssignments')) || {};
    delete assignments[serviceId];
    localStorage.setItem('serviceAssignments', JSON.stringify(assignments));
    loadServices();
    loadDashboardStats();
    showNotification('Service deleted.', 'success');
}

function openEditServiceModal(index) {
    const services = JSON.parse(localStorage.getItem('adminServices')) || [];
    const service = services[index];
    if (!service) return;
    pendingEditServiceImage = null;
    document.getElementById('editServiceIndex').value = index;
    document.getElementById('editServiceName').value = service.name || '';
    document.getElementById('editServicePrice').value = service.price || '';
    document.getElementById('editServiceDuration').value = service.duration || '';
    document.getElementById('editServiceLocation').value = service.location || 'Unguja';
    document.getElementById('editServiceDescription').value = service.description || '';
    const editBtn = document.getElementById('editServiceImageTrigger');
    editBtn.classList.remove('has-image');
    document.getElementById('editImageUploadLabel').textContent = 'Change Image';
    document.getElementById('editImagePreviewContainer').style.display = 'none';
    document.getElementById('editImagePreview').src = '';
    if (service.image) {
        document.getElementById('editImagePreview').src = service.image;
        document.getElementById('editImagePreviewContainer').style.display = 'flex';
        editBtn.classList.add('has-image');
        document.getElementById('editImageUploadLabel').textContent = '✓ Image Set';
        pendingEditServiceImage = service.image;
    }
    initIncludedManualEntry('editIncludedManualEntry', 'editAddIncludedItemBtn', service.included || []);
    new bootstrap.Modal(document.getElementById('editServiceModal')).show();
}

function saveEditedService() {
    const index = parseInt(document.getElementById('editServiceIndex').value);
    const name = document.getElementById('editServiceName').value.trim();
    const price = document.getElementById('editServicePrice').value.trim();
    const duration = document.getElementById('editServiceDuration').value.trim();
    const location = document.getElementById('editServiceLocation').value;
    const description = document.getElementById('editServiceDescription').value.trim();
    const included = getIncludedItems('editIncludedManualEntry');
    if (!name || !price) { showNotification('Service name and price are required', 'error'); return; }
    let services = JSON.parse(localStorage.getItem('adminServices')) || [];
    if (!services[index]) return;
    services[index] = {
        ...services[index],
        name, price: Number(price),
        duration: duration || services[index].duration,
        location, description, included,
        image: pendingEditServiceImage !== null ? pendingEditServiceImage : services[index].image
    };
    localStorage.setItem('adminServices', JSON.stringify(services));
    bootstrap.Modal.getInstance(document.getElementById('editServiceModal')).hide();
    loadServices();
    loadDashboardStats();
    showNotification('Service updated successfully!', 'success');
}

// ========== BOOKINGS ==========
function loadBookings() {
    const bookings = JSON.parse(localStorage.getItem('customerBookings')) || [];
    let html = '';
    if (bookings.length === 0) {
        html = `<tr><td colspan="7" class="text-center text-muted py-4" style="font-size:13px;">No bookings found</td></tr>`;
    } else {
        bookings.forEach(b => {
            const statusMap = {
                pending: ['bg-warning text-dark', 'Pending'],
                confirmed: ['bg-success', 'Confirmed'],
                completed: ['bg-info', 'Completed'],
                cancelled: ['bg-danger', 'Cancelled']
            };
            const [badgeClass, statusLabel] = statusMap[b.status] || ['bg-secondary', b.status || 'Pending'];
            const locIcon = { Unguja: '🏝', Pemba: '🌿', Both: '🗺' }[b.location] || '📍';
            html += `
                <tr>
                    <td><strong>#${escapeHtml(String(b.id || 'N/A'))}</strong></td>
                    <td>${escapeHtml(b.customer || 'N/A')}</td>
                    <td>${escapeHtml(b.service || 'N/A')}</td>
                    <td>${locIcon} ${escapeHtml(b.location || '—')}</td>
                    <td>${escapeHtml(b.date || 'TBD')}</td>
                    <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
                    <td style="text-align:center;">
                        <button class="action-btn action-btn-edit" onclick="updateBookingStatus(${b.id})" title="Update"><i class="bi bi-pencil-fill"></i></button>
                    </td>
                </tr>`;
        });
    }
    document.getElementById('bookingList').innerHTML = html;
}

function updateBookingStatus(id) {
    showNotification('Booking status update coming soon', 'info');
}

// ========== STAFF ==========
function addStaff() {
    const name = document.getElementById('staffName').value.trim();
    const email = document.getElementById('staffEmail').value.trim();
    const status = document.getElementById('staffType').value;
    const phone = document.getElementById('staffPhone').value.trim();
    const password = document.getElementById('staffPass').value;
    const photo = pendingStaffImage || null;
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
    let staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    if (staff.find(s => s.email.toLowerCase() === email.toLowerCase())) {
        showNotification('A staff member with this email already exists', 'error');
        return;
    }
    staff.push({ id: Date.now(), name, email, staffType: status, phone, password, photo, status: 'active' });
    localStorage.setItem('staffAccounts', JSON.stringify(staff));
    document.getElementById('staffName').value = '';
    document.getElementById('staffEmail').value = '';
    document.getElementById('staffType').value = 'normal';
    document.getElementById('staffPhone').value = '';
    document.getElementById('staffPass').value = '';
    clearStaffImage();
    loadStaff();
    loadDashboardStats();
    showNotification(`Staff member "${name}" added successfully!`, 'success');
}

function loadStaff() {
    const staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    let html = '';
    if (staff.length === 0) {
        html = `<tr><td colspan="6" class="text-center text-muted py-4" style="font-size:13px;">No staff members added yet</td></tr>`;
    } else {
        staff.forEach((member, index) => {
            const initials = member.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
            const avatarHtml = member.photo
                ? `<img src="${member.photo}" alt="${escapeHtml(member.name)}" class="staff-avatar">`
                : `<div class="staff-initials">${escapeHtml(initials)}</div>`;
            const statusConfig = {
                normal: { class: 'staff-normal', label: 'Normal Worker' },
                contractor: { class: 'staff-contractor', label: 'Contractor Worker' },
                supervisor: { class: 'staff-supervisor', label: 'Supervisor' }
            };
            const cfg = statusConfig[member.staffType] || statusConfig['normal'];
            html += `
                <tr>
                    <td>${avatarHtml}</td>
                    <td><strong>${escapeHtml(member.name)}</strong></td>
                    <td>${escapeHtml(member.email)}</td>
                    <td><span class="badge bg-success">Active</span></td>
                    <td><span class="staff-status-badge ${cfg.class}">${cfg.label}</span></td>
                    <td style="text-align:center; white-space:nowrap;">
                        <button class="action-btn action-btn-edit" onclick="openEditStaffModal(${index})" title="Edit"><i class="bi bi-pencil-fill"></i></button>
                        <button class="action-btn action-btn-delete" onclick="deleteStaff(${index})" title="Remove"><i class="bi bi-trash3-fill"></i></button>
                    </td>
                </tr>`;
        });
    }
    document.getElementById('staffList').innerHTML = html;
}

function deleteStaff(index) {
    const staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    if (!confirm(`Remove "${staff[index]?.name}" from staff?`)) return;
    const staffId = staff[index].id;
    staff.splice(index, 1);
    localStorage.setItem('staffAccounts', JSON.stringify(staff));
    let assignments = JSON.parse(localStorage.getItem('serviceAssignments')) || {};
    Object.keys(assignments).forEach(svcId => {
        if (assignments[svcId] == staffId) delete assignments[svcId];
    });
    localStorage.setItem('serviceAssignments', JSON.stringify(assignments));
    loadStaff();
    loadDashboardStats();
    showNotification('Staff member removed.', 'success');
}

function openEditStaffModal(index) {
    const staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    const member = staff[index];
    if (!member) return;
    pendingEditStaffImage = null;
    document.getElementById('editStaffIndex').value = index;
    document.getElementById('editStaffName').value = member.name || '';
    document.getElementById('editStaffEmail').value = member.email || '';
    document.getElementById('editstaffType').value = member.staffType || 'normal';
    document.getElementById('editStaffPhone').value = member.phone || '';
    document.getElementById('editStaffPassword').value = '';
    const initials = member.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const photoEl = document.getElementById('editStaffPhotoPreview');
    const initialsEl = document.getElementById('editStaffInitials');
    if (member.photo) {
        photoEl.src = member.photo;
        photoEl.style.display = 'block';
        initialsEl.style.display = 'none';
        pendingEditStaffImage = member.photo;
    } else {
        photoEl.style.display = 'none';
        photoEl.src = '';
        initialsEl.textContent = initials;
        initialsEl.style.display = 'flex';
    }
    new bootstrap.Modal(document.getElementById('editStaffModal')).show();
}

function saveEditedStaff() {
    const index = parseInt(document.getElementById('editStaffIndex').value);
    const name = document.getElementById('editStaffName').value.trim();
    const email = document.getElementById('editStaffEmail').value.trim();
    const status = document.getElementById('editstaffType').value;
    const phone = document.getElementById('editStaffPhone').value.trim();
    const newPass = document.getElementById('editStaffPassword').value;
    if (!name || !email) { showNotification('Name and email are required', 'error'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showNotification('Please enter a valid email address', 'error'); return; }
    if (newPass && newPass.length < 6) { showNotification('Password must be at least 6 characters', 'error'); return; }
    let staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    if (!staff[index]) return;
    const emailExists = staff.some((s, i) => i !== index && s.email.toLowerCase() === email.toLowerCase());
    if (emailExists) { showNotification('This email is already used', 'error'); return; }
    staff[index].name = name;
    staff[index].email = email;
    staff[index].staffType = status;
    staff[index].phone = phone;
    if (newPass) staff[index].password = newPass;
    staff[index].photo = pendingEditStaffImage !== null ? pendingEditStaffImage : staff[index].photo;
    localStorage.setItem('staffAccounts', JSON.stringify(staff));
    bootstrap.Modal.getInstance(document.getElementById('editStaffModal')).hide();
    loadStaff();
    loadDashboardStats();
    showNotification(`Staff member "${name}" updated successfully!`, 'success');
}

// ========== SERVICES ASSIGNMENT MODULE ==========
function getAssignmentData() {
    return JSON.parse(localStorage.getItem('serviceAssignments')) || {};
}

function saveAssignmentData(data) {
    localStorage.setItem('serviceAssignments', JSON.stringify(data));
}

function getStaffProgress(staffId) {
    const prog = JSON.parse(localStorage.getItem('staffProgress')) || {};
    return prog[staffId] || 'not_started';
}

function setStaffProgress(staffId, progress) {
    const prog = JSON.parse(localStorage.getItem('staffProgress')) || {};
    prog[staffId] = progress;
    localStorage.setItem('staffProgress', JSON.stringify(prog));
}

function getProgressConfig(progress) {
    const map = {
        not_started: { label: 'Not Started', dotClass: 'legend-red', badgeClass: 'progress-red' },
        just_started: { label: 'Just Started', dotClass: 'legend-yellow', badgeClass: 'progress-yellow' },
        in_progress: { label: 'In Progress', dotClass: 'legend-blue', badgeClass: 'progress-blue' },
        complete: { label: 'Complete', dotClass: 'legend-green', badgeClass: 'progress-green' }
    };
    return map[progress] || map['not_started'];
}

function countAssignedServicesForStaff(staffId) {
    const assignments = getAssignmentData();
    return Object.values(assignments).filter(sid => String(sid) === String(staffId)).length;
}

function getStaffAvatarHtml(member, size = 'sm') {
    const initials = member.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    if (size === 'sm') {
        return member.photo
            ? `<img src="${member.photo}" alt="${escapeHtml(member.name)}" class="staff-avatar">`
            : `<div class="staff-initials">${escapeHtml(initials)}</div>`;
    } else {
        return member.photo
            ? `<img src="${member.photo}" alt="${escapeHtml(member.name)}" class="staff-avatar-md">`
            : `<div class="staff-initials-md">${escapeHtml(initials)}</div>`;
    }
}

function loadAssignmentSection() {
    const activeTab = document.querySelector('.assign-tab-btn.active');
    if (activeTab) {
        switchAssignTab(activeTab.dataset.tab, activeTab);
    } else {
        switchAssignTab('allStaff', document.querySelector('.assign-tab-btn[data-tab="allStaff"]'));
    }
}

function switchAssignTab(tabName, btnEl) {
    document.querySelectorAll('.assign-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.assign-tab-content').forEach(c => c.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    const tabEl = document.getElementById(`tab-${tabName}`);
    if (tabEl) tabEl.classList.add('active');
    switch (tabName) {
        case 'allStaff': renderAllStaffTab(); break;
        case 'assignedStaff': renderAssignedStaffTab(); break;
        case 'unassignedStaff': renderUnassignedStaffTab(); break;
        case 'assignedServices': renderAssignedServicesTab(); break;
        case 'unassignedServices': renderUnassignedServicesTab(); break;
    }
}

// [Include all assignment render functions from previous version - renderAllStaffTab, renderAssignedStaffTab, etc.]
// For brevity, I'm including the key functions. The full assignment module is in the previous response.

function renderAllStaffTab() {
    const staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    const assignments = getAssignmentData();
    let html = '';
    if (staff.length === 0) {
        html = `<tr><td colspan="6" class="text-center text-muted py-4">No staff members found</td></tr>`;
    } else {
        staff.forEach(member => {
            const count = countAssignedServicesForStaff(member.id);
            const isAssigned = count > 0 || member.staffType === 'supervisor' || member.staffType === 'contractor';
            const progress = getStaffProgress(member.id);
            const cfg = getProgressConfig(progress);
            const avatarHtml = getStaffAvatarHtml(member);
            let typeIndicator = '';
            if (member.staffType === 'supervisor') typeIndicator = '<span class="staff-type-indicator staff-type-supervisor">Supervisor</span>';
            else if (member.staffType === 'contractor') typeIndicator = '<span class="staff-type-indicator staff-type-contractor">Contractor</span>';
            html += `
                <tr>
                    <td>${avatarHtml}</td>
                    <td><strong>${escapeHtml(member.name)}</strong>${typeIndicator}</td>
                    <td style="font-size:13px;">${escapeHtml(member.email)}</td>
                    <td>${isAssigned ? '<span class="assign-status-badge assigned">Assigned</span>' : '<span class="assign-status-badge not-assigned">Not Assigned</span>'}</td>
                    <td>${isAssigned ? `<span class="progress-badge ${cfg.badgeClass}">${cfg.label}</span>` : '—'}</td>
                    <td style="text-align:center;">${isAssigned ? `<span class="services-count-badge">${count || '∞'}</span>` : '0'}</td>
                </tr>`;
        });
    }
    document.getElementById('allStaffAssignList').innerHTML = html;
}

function renderAssignedStaffTab() {
    const staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    const assignedStaff = staff.filter(m => countAssignedServicesForStaff(m.id) > 0 || m.staffType === 'supervisor' || m.staffType === 'contractor');
    let html = '';
    if (assignedStaff.length === 0) {
        html = `<tr><td colspan="6" class="text-center text-muted py-4">No assigned staff</td></tr>`;
    } else {
        assignedStaff.forEach(member => {
            const count = countAssignedServicesForStaff(member.id);
            const progress = getStaffProgress(member.id);
            const cfg = getProgressConfig(progress);
            const avatarHtml = getStaffAvatarHtml(member);
            let typeIndicator = '';
            if (member.staffType === 'supervisor') typeIndicator = '<span class="staff-type-indicator staff-type-supervisor">Supervisor</span>';
            else if (member.staffType === 'contractor') typeIndicator = '<span class="staff-type-indicator staff-type-contractor">Contractor</span>';
            const isPermanent = member.staffType === 'supervisor' || member.staffType === 'contractor';
            html += `
                <tr>
                    <td>${avatarHtml}</td>
                    <td><strong>${escapeHtml(member.name)}</strong>${typeIndicator}</td>
                    <td>${escapeHtml(member.email)}</td>
                    <td><span class="progress-badge ${cfg.badgeClass}">${cfg.label}</span></td>
                    <td style="text-align:center;"><span class="services-count-badge">${count || '∞'}</span></td>
                    <td style="text-align:center;">
                        <button class="action-btn action-btn-view" onclick="openViewStaffServices(${member.id})"><i class="bi bi-eye-fill"></i></button>
                        ${!isPermanent ? `<button class="action-btn action-btn-delete" onclick="unassignAllFromStaff(${member.id})"><i class="bi bi-trash3-fill"></i></button>` : '<span style="font-size:10px;">Permanent</span>'}
                    </td>
                </tr>`;
        });
    }
    document.getElementById('assignedStaffList').innerHTML = html;
}

function renderUnassignedStaffTab() {
    const staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    const unassignedStaff = staff.filter(m => countAssignedServicesForStaff(m.id) === 0 && m.staffType !== 'supervisor' && m.staffType !== 'contractor');
    let html = '';
    if (unassignedStaff.length === 0) {
        html = `<tr><td colspan="5" class="text-center text-muted py-4">All staff assigned</td></tr>`;
    } else {
        unassignedStaff.forEach(member => {
            html += `
                <tr>
                    <td>${getStaffAvatarHtml(member)}</td>
                    <td><strong>${escapeHtml(member.name)}</strong></td>
                    <td>${escapeHtml(member.email)}</td>
                    <td>${escapeHtml(member.phone || '—')}</td>
                    <td style="text-align:center;"><button class="action-btn action-btn-edit" onclick="switchAssignTab('unassignedServices')"><i class="bi bi-plus-circle-fill"></i></button></td>
                </tr>`;
        });
    }
    document.getElementById('unassignedStaffList').innerHTML = html;
}

// Additional assignment functions (renderAssignedServicesTab, renderUnassignedServicesTab, openAssignServiceModal, etc.) 
// are included from the previous complete version. They remain unchanged.

// ========== PROFESSIONAL REPORT GENERATION ==========
function generateProfessionalReport() {
    const fromDate = document.getElementById('reportFromDate').value;
    const toDate = document.getElementById('reportToDate').value;
    const reportType = document.getElementById('reportType').value;
    const format = document.getElementById('reportFormat').value;

    if (!fromDate || !toDate) {
        showNotification('Please select both From and To dates', 'error');
        return;
    }

    const services = JSON.parse(localStorage.getItem('adminServices')) || [];
    const staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    const bookings = JSON.parse(localStorage.getItem('customerBookings')) || [];
    const contractors = JSON.parse(localStorage.getItem('contractors')) || [];
    const invoices = JSON.parse(localStorage.getItem('invoices')) || [];
    const messages = JSON.parse(localStorage.getItem('contact_messages')) || [];
    const supervisorMsgs = JSON.parse(localStorage.getItem('supervisor_messages')) || [];
    const assignments = JSON.parse(localStorage.getItem('serviceAssignments')) || {};

    // Filter invoices by date range
    const filteredInvoices = invoices.filter(inv => inv.invoiceDate >= fromDate && inv.invoiceDate <= toDate);
    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

    generatedReportData = {
        title: 'CSMS Professional Report',
        generatedAt: new Date().toLocaleString('en-TZ'),
        dateRange: `${fromDate} to ${toDate}`,
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
            totalMessages: messages.length + supervisorMsgs.length,
            assignedServices: Object.keys(assignments).length
        },
        detailedData: {}
    };

    // Build report HTML
    let reportHTML = `
        <div class="report-preview">
            <div class="report-cover">
                <div class="report-logo"><i class="bi bi-brush-fill"></i></div>
                <h2>CSMS Professional Report</h2>
                <p class="report-subtitle">Cleaning Service Management System</p>
            </div>
            
            <div class="report-meta-row">
                <div class="report-meta-item">
                    <div class="meta-label">Report Type</div>
                    <div class="meta-value">${reportType.toUpperCase()}</div>
                </div>
                <div class="report-meta-item">
                    <div class="meta-label">Date Range</div>
                    <div class="meta-value">${fromDate} — ${toDate}</div>
                </div>
                <div class="report-meta-item">
                    <div class="meta-label">Generated</div>
                    <div class="meta-value">${generatedReportData.generatedAt}</div>
                </div>
                <div class="report-meta-item">
                    <div class="meta-label">Format</div>
                    <div class="meta-value">${format === 'detailed' ? 'Detailed Report' : 'Summary'}</div>
                </div>
            </div>

            <div class="report-section">
                <h5><i class="bi bi-graph-up me-1"></i>Executive Summary</h5>
                <div class="report-summary-grid">
                    <div class="report-summary-card">
                        <div class="summary-icon"><i class="bi bi-grid-3x3-gap-fill"></i></div>
                        <div class="summary-value">${generatedReportData.summary.totalServices}</div>
                        <div class="summary-label">Total Services</div>
                    </div>
                    <div class="report-summary-card">
                        <div class="summary-icon"><i class="bi bi-people-fill"></i></div>
                        <div class="summary-value">${generatedReportData.summary.totalStaff}</div>
                        <div class="summary-label">Staff Members</div>
                    </div>
                    <div class="report-summary-card">
                        <div class="summary-icon"><i class="bi bi-building"></i></div>
                        <div class="summary-value">${generatedReportData.summary.totalContractors}</div>
                        <div class="summary-label">Contractors</div>
                    </div>
                    <div class="report-summary-card">
                        <div class="summary-icon"><i class="bi bi-cash-stack"></i></div>
                        <div class="summary-value">${formatTZS(totalRevenue)}</div>
                        <div class="summary-label">Total Revenue</div>
                    </div>
                    <div class="report-summary-card">
                        <div class="summary-icon"><i class="bi bi-receipt"></i></div>
                        <div class="summary-value">${generatedReportData.summary.totalInvoices}</div>
                        <div class="summary-label">Invoices</div>
                    </div>
                    <div class="report-summary-card">
                        <div class="summary-icon"><i class="bi bi-diagram-3-fill"></i></div>
                        <div class="summary-value">${generatedReportData.summary.assignedServices}</div>
                        <div class="summary-label">Assigned Services</div>
                    </div>
                </div>
            </div>`;

    // Staff Details Section
    if (reportType === 'all' || reportType === 'staff') {
        reportHTML += `
            <div class="report-section">
                <h5><i class="bi bi-people me-1"></i>Staff Distribution</h5>
                <table class="report-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Type</th><th>Assigned Services</th></tr></thead>
                    <tbody>${staff.map(s => {
                        const count = Object.values(assignments).filter(a => a == s.id).length;
                        return `<tr>
                            <td><strong>${escapeHtml(s.name)}</strong></td>
                            <td>${escapeHtml(s.email)}</td>
                            <td><span class="badge bg-success">Active</span></td>
                            <td>${escapeHtml(s.staffType || 'normal')}</td>
                            <td>${count}</td>
                        </tr>`;
                    }).join('')}</tbody>
                </table>
            </div>`;
    }

    // Contractors Section
    if (reportType === 'all' || reportType === 'contractors') {
        reportHTML += `
            <div class="report-section">
                <h5><i class="bi bi-building me-1"></i>Contractors Overview</h5>
                <table class="report-table">
                    <thead><tr><th>Company</th><th>Type</th><th>Location</th><th>Workers</th><th>Contract Period</th><th>Value (TZS)</th></tr></thead>
                    <tbody>${contractors.map(c => `
                        <tr>
                            <td><strong>${escapeHtml(c.companyName)}</strong></td>
                            <td>${c.type}</td>
                            <td>${escapeHtml(c.location || '—')}</td>
                            <td>${c.workersAssigned || 0}</td>
                            <td>${escapeHtml(c.contractStart || '—')} — ${escapeHtml(c.contractEnd || '—')}</td>
                            <td>${formatTZS(c.contractValue)}</td>
                        </tr>`).join('')}</tbody>
                </table>
            </div>`;
    }

    // Revenue Section
    if (reportType === 'all' || reportType === 'revenue') {
        reportHTML += `
            <div class="report-section">
                <h5><i class="bi bi-cash-stack me-1"></i>Revenue Analysis</h5>
                <table class="report-table">
                    <thead><tr><th>Invoice #</th><th>Contractor</th><th>Date</th><th>Work Cost</th><th>Workers Cost</th><th>Equipment Cost</th><th>Total</th></tr></thead>
                    <tbody>${filteredInvoices.map(inv => `
                        <tr>
                            <td>#${escapeHtml(inv.id)}</td>
                            <td>${escapeHtml(inv.contractorName)}</td>
                            <td>${escapeHtml(inv.invoiceDate)}</td>
                            <td>${formatTZS(inv.workCost)}</td>
                            <td>${formatTZS(inv.workersCost)}</td>
                            <td>${formatTZS(inv.equipmentCost)}</td>
                            <td><strong>${formatTZS(inv.total)}</strong></td>
                        </tr>`).join('')}</tbody>
                </table>
                ${filteredInvoices.length > 0 ? `<div style="text-align:right; margin-top:10px; font-size:16px; font-weight:700; color:var(--grad-start);">Total Revenue: ${formatTZS(totalRevenue)}</div>` : '<p class="text-muted">No invoices in this period</p>'}
            </div>`;
    }

    reportHTML += `
            <div class="report-footer">
                <p>This report was generated by CSMS Admin Panel on ${generatedReportData.generatedAt}</p>
                <p>Confidential — For internal use only</p>
            </div>
        </div>`;

    document.getElementById('reportPreviewBody').innerHTML = reportHTML;
    new bootstrap.Modal(document.getElementById('reportPreviewModal')).show();
    showNotification('Professional report generated!', 'success');
}

function downloadGeneratedReport() {
    if (!generatedReportData) return;
    const blob = new Blob([JSON.stringify(generatedReportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CSMS_Report_${generatedReportData.type}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Report downloaded!', 'success');
}

function shareGeneratedReport() {
    if (!generatedReportData) return;
    const summary = `CSMS Report (${generatedReportData.type})\nPeriod: ${generatedReportData.dateRange}\nRevenue: ${formatTZS(generatedReportData.summary.totalRevenue)}\nServices: ${generatedReportData.summary.totalServices}\nStaff: ${generatedReportData.summary.totalStaff}`;
    if (navigator.share) {
        navigator.share({ title: 'CSMS Report', text: summary }).catch(() => {});
    } else {
        navigator.clipboard.writeText(summary).then(() => {
            showNotification('Report summary copied!', 'success');
        }).catch(() => {
            window.open(`https://wa.me/?text=${encodeURIComponent(summary)}`, '_blank');
        });
    }
}

function generateReport() {
    const fromDate = document.getElementById('reportFromDate').value;
    const toDate = document.getElementById('reportToDate').value;
    const reportType = document.getElementById('reportType').value;
    if (!fromDate || !toDate) {
        showNotification('Please select both dates', 'error');
        return;
    }
    const data = { fromDate, toDate, type: reportType, currency: 'TZS', exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `csms_quick_export_${reportType}_${fromDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Quick export downloaded!', 'success');
}

function openReportGenerator() {
    showSection('reports');
}

// ========== MESSAGES ==========
function loadMessages() {
    const customerMessages = (JSON.parse(localStorage.getItem('contact_messages')) || []).map(m => ({...m, type: 'customer'}));
    const supervisorMessages = (JSON.parse(localStorage.getItem('supervisor_messages')) || []).map(m => ({...m, type: 'supervisor'}));
    let allMessages = [...customerMessages, ...supervisorMessages];
    if (currentMessageFilter === 'customer') allMessages = customerMessages;
    else if (currentMessageFilter === 'supervisor') allMessages = supervisorMessages;
    let html = '';
    if (allMessages.length === 0) {
        html = `<tr><td colspan="6" class="text-center text-muted py-4">No messages</td></tr>`;
    } else {
        [...allMessages].reverse().forEach((msg, i) => {
            const date = msg.timestamp ? new Date(msg.timestamp).toLocaleDateString() : '—';
            const preview = (msg.message || '').substring(0, 80);
            html += `
                <tr>
                    <td><strong>${escapeHtml(msg.name)}</strong><div style="font-size:11px;">${escapeHtml(msg.email)}</div></td>
                    <td><span class="message-type-badge message-${msg.type}">${msg.type}</span></td>
                    <td>${escapeHtml(msg.subject || '—')}</td>
                    <td>${escapeHtml(preview)}</td>
                    <td>${date}</td>
                    <td style="text-align:center;">
                        <button class="action-btn action-btn-view" onclick="viewMessage(${i}, '${msg.type}')"><i class="bi bi-eye-fill"></i></button>
                        <button class="action-btn action-btn-reply" onclick="openReplyModal(${i}, '${msg.type}')"><i class="bi bi-reply-fill"></i></button>
                    </td>
                </tr>`;
        });
    }
    document.getElementById('messageList').innerHTML = html;
}

function filterMessages(type, btnEl) {
    currentMessageFilter = type;
    document.querySelectorAll('#messagesSection .filter-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    loadMessages();
}

function viewMessage(index, type) {
    const sourceKey = type === 'supervisor' ? 'supervisor_messages' : 'contact_messages';
    const messages = JSON.parse(localStorage.getItem(sourceKey)) || [];
    const reversed = [...messages].reverse();
    const msg = reversed[index];
    if (!msg) return;
    currentMessageIndex = index;
    currentMessageType = type;
    document.getElementById('viewMessageBody').innerHTML = `
        <div class="message-detail-row"><span class="message-detail-label">From</span><span class="message-detail-value"><strong>${escapeHtml(msg.name)}</strong></span></div>
        <div class="message-detail-row"><span class="message-detail-label">Email</span><span class="message-detail-value">${escapeHtml(msg.email)}</span></div>
        <div class="message-detail-row"><span class="message-detail-label">Subject</span><span class="message-detail-value">${escapeHtml(msg.subject || '—')}</span></div>
        <div class="message-detail-row"><span class="message-detail-label">Date</span><span class="message-detail-value">${msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '—'}</span></div>
        <div class="message-body-box">${escapeHtml(msg.message || '—')}</div>
        ${msg.reply ? `<div class="message-body-box" style="background:#f0fff4;border-color:#bbf7d0;margin-top:12px;"><strong>Reply:</strong> ${escapeHtml(msg.reply)}</div>` : ''}`;
    new bootstrap.Modal(document.getElementById('viewMessageModal')).show();
}

function openReplyModal(index, type) {
    const sourceKey = type === 'supervisor' ? 'supervisor_messages' : 'contact_messages';
    const messages = JSON.parse(localStorage.getItem(sourceKey)) || [];
    const reversed = [...messages].reverse();
    const msg = reversed[index];
    if (!msg) return;
    currentMessageIndex = index;
    currentMessageType = type;
    document.getElementById('replyMessageIndex').value = index;
    document.getElementById('replyMessageOriginal').innerHTML = `<strong>From ${escapeHtml(msg.name)}:</strong><div style="font-size:12px;margin-top:4px;">${escapeHtml(msg.message?.substring(0, 200) || '—')}</div>`;
    document.getElementById('replyMessageText').value = '';
    new bootstrap.Modal(document.getElementById('replyMessageModal')).show();
}

function sendReply() {
    const index = parseInt(document.getElementById('replyMessageIndex').value);
    const replyText = document.getElementById('replyMessageText').value.trim();
    const type = currentMessageType;
    const sourceKey = type === 'supervisor' ? 'supervisor_messages' : 'contact_messages';
    if (!replyText) { showNotification('Please type a reply', 'error'); return; }
    let messages = JSON.parse(localStorage.getItem(sourceKey)) || [];
    const reversed = [...messages].reverse();
    if (!reversed[index]) return;
    const originalIndex = messages.findIndex(m => m.timestamp === reversed[index].timestamp && m.email === reversed[index].email);
    if (originalIndex >= 0) {
        messages[originalIndex].reply = replyText;
        messages[originalIndex].replyDate = new Date().toISOString();
        localStorage.setItem(sourceKey, JSON.stringify(messages));
    }
    bootstrap.Modal.getInstance(document.getElementById('replyMessageModal')).hide();
    document.getElementById('replyMessageText').value = '';
    loadMessages();
    showNotification('Reply sent!', 'success');
}

function replyToMessage() {
    bootstrap.Modal.getInstance(document.getElementById('viewMessageModal')).hide();
    openReplyModal(currentMessageIndex, currentMessageType);
}

// ========== CHARTS ==========
function initCharts() {
    const ctx1 = document.getElementById('bookingChart')?.getContext('2d');
    const ctx2 = document.getElementById('revenueChart')?.getContext('2d');
    if (ctx1) {
        if (bookingChart) bookingChart.destroy();
        bookingChart = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Bookings',
                    data: [12, 19, 15, 25, 22, 30],
                    borderColor: '#1a56db',
                    backgroundColor: 'rgba(26,86,219,0.08)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }
    if (ctx2) {
        if (revenueChart) revenueChart.destroy();
        revenueChart = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue (TZS)',
                    data: [1200000, 1900000, 1500000, 2500000, 2200000, 3000000],
                    backgroundColor: 'rgba(124,58,237,0.8)',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } },
                scales: { y: { beginAtZero: true, ticks: { callback: val => 'TZS ' + (val/1000).toFixed(0) + 'K' } } }
            }
        });
    }
}

// ========== SETTINGS ==========
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('adminSettings')) || { emailNotifications: true, autoAssignStaff: false, bookingReminders: true };
    document.getElementById('emailNotifications').checked = settings.emailNotifications;
    document.getElementById('autoAssignStaff').checked = settings.autoAssignStaff;
    document.getElementById('bookingReminders').checked = settings.bookingReminders;
}

function saveSettings() {
    localStorage.setItem('adminSettings', JSON.stringify({
        emailNotifications: document.getElementById('emailNotifications').checked,
        autoAssignStaff: document.getElementById('autoAssignStaff').checked,
        bookingReminders: document.getElementById('bookingReminders').checked
    }));
    showNotification('Settings saved!', 'success');
}

// ========== EXPORT ==========
function exportData() {
    const data = {
        services: JSON.parse(localStorage.getItem('adminServices')) || [],
        staff: JSON.parse(localStorage.getItem('staffAccounts')) || [],
        bookings: JSON.parse(localStorage.getItem('customerBookings')) || [],
        contractors: JSON.parse(localStorage.getItem('contractors')) || [],
        invoices: JSON.parse(localStorage.getItem('invoices')) || [],
        exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `csms_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Data exported!', 'success');
}

// ========== INITIALIZE SAMPLE DATA ==========
function initializeSampleData() {
    if (!localStorage.getItem('contractors')) {
        localStorage.setItem('contractors', JSON.stringify([
            { id: 1001, companyName: 'Zanzibar Beach Resort', type: 'private', location: 'Nungwi, Zanzibar', contactPerson: 'Ahmed Hassan', email: 'ahmed@zanzibarbeach.com', phone: '+255 777 123456', workersAssigned: 8, contractStart: '2024-01-15', contractEnd: '2025-01-14', contractValue: 24000000, status: 'active', services: ['Daily Room Cleaning', 'Pool Maintenance', 'Laundry Service'] },
            { id: 1002, companyName: 'Stone Town Municipal Office', type: 'government', location: 'Stone Town, Zanzibar', contactPerson: 'Fatma Ali', email: 'fatma@stonetown.go.tz', phone: '+255 777 654321', workersAssigned: 12, contractStart: '2024-03-01', contractEnd: '2025-02-28', contractValue: 36000000, status: 'active', services: ['Office Cleaning', 'Waste Management', 'Grounds Maintenance'] },
            { id: 1003, companyName: 'Nungwi Paradise Hotel', type: 'private', location: 'Nungwi Beach', contactPerson: 'John Mwangi', email: 'john@nungwiparadise.com', phone: '+255 777 987654', workersAssigned: 5, contractStart: '2024-06-01', contractEnd: '2024-12-31', contractValue: 15000000, status: 'active', services: ['Beach Cleaning', 'Room Service'] }
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
            { id: 2001, customer: 'Asha Bakari', service: 'Deep House Cleaning', location: 'Unguja', date: '2024-07-15', status: 'confirmed' },
            { id: 2002, customer: 'Mohammed Juma', service: 'Office Cleaning', location: 'Pemba', date: '2024-07-20', status: 'pending' }
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
            { id: 4001, name: 'Fatma Ali', email: 'fatma@staff.com', phone: '+255 777 111111', password: 'staff123', staffType: 'supervisor', photo: null, status: 'active' },
            { id: 4002, name: 'Hassan Juma', email: 'hassan@staff.com', phone: '+255 777 222222', password: 'staff123', staffType: 'contractor', photo: null, status: 'active' },
            { id: 4003, name: 'Amina Salum', email: 'amina@staff.com', phone: '+255 777 333333', password: 'staff123', staffType: 'normal', photo: null, status: 'active' }
        ]));
    }
}

// ========== SESSION RESTORE ==========
document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        document.getElementById('loginSection').style.display = 'none';
        const dash = document.getElementById('dashboard');
        dash.style.display = 'flex';
        dash.style.flexDirection = 'column';
        initDashboard();
    }
});