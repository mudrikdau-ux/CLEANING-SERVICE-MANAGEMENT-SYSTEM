// staff.js - Complete Staff Page System with Full API Integration

// ========== GLOBAL VARIABLES ==========
let currentStaff = null;
let currentGeneratedReport = null;
let gsCurrentGeneratedReport = null;
let currentEditingMessageId = null;
let gsCurrentEditingMessageId = null;
let selectedJobForPayment = null;
let gsSelectedJobForPayment = null;

// ========== UTILITY FUNCTIONS ==========
function showNotification(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    let icon = 'bi-info-circle-fill', borderColor = '#0d6efd';
    if (type === 'success') { icon = 'bi-check-circle-fill'; borderColor = '#198754'; }
    else if (type === 'error') { icon = 'bi-exclamation-triangle-fill'; borderColor = '#dc3545'; }
    else if (type === 'warning') { icon = 'bi-exclamation-triangle-fill'; borderColor = '#ffc107'; }
    toast.style.borderLeftColor = borderColor;
    toast.innerHTML = `<div class="d-flex align-items-center gap-2"><i class="bi ${icon}" style="color:${borderColor};font-size:16px;"></i><span class="flex-grow-1" style="font-size:13px;">${escapeHtml(message)}</span><button class="btn-close btn-sm" onclick="this.closest('.toast-notification').remove()"></button></div>`;
    toastContainer.appendChild(toast);
    setTimeout(() => { if (toast && toast.remove) toast.remove(); }, 4000);
}

function escapeHtml(str) { if (!str) return ''; return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;'); }
function formatNumber(num) { if (num === undefined || num === null) return '0'; return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
function formatDate(dateStr) { if (!dateStr) return 'N/A'; return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }

function getStatusLabel(status) {
    const labels = { 'pending': 'Pending', 'confirmed': 'Confirmed', 'in_progress': 'In Progress', 'completed': 'Completed', 'cancelled': 'Cancelled' };
    return labels[status] || status;
}

// ========== SETTINGS ==========
function getSettings() {
    const stored = localStorage.getItem('staff_settings');
    return stored ? JSON.parse(stored) : { notifications: true, darkMode: localStorage.getItem('theme') === 'dark', notificationSound: false, availabilityStatus: 'available', language: 'en' };
}
function saveSettings(settings) { localStorage.setItem('staff_settings', JSON.stringify(settings)); }
function initThemeToggle() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    const settings = getSettings();
    settings.darkMode = currentTheme === 'dark';
    saveSettings(settings);
}
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    const settings = getSettings();
    settings.darkMode = newTheme === 'dark';
    saveSettings(settings);
}
function toggleThemeFromSettings(enableDark) {
    const newTheme = enableDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    const settings = getSettings();
    settings.darkMode = enableDark;
    saveSettings(settings);
    showNotification(`Theme switched to ${newTheme} mode`, 'success');
}
function updateSetting(key, value) {
    const settings = getSettings();
    settings[key] = value;
    saveSettings(settings);
    if (key === 'notifications') showNotification(value ? 'Notifications enabled' : 'Notifications disabled', 'info');
    else if (key === 'notificationSound') showNotification(value ? 'Notification sound enabled' : 'Notification sound disabled', 'info');
    else if (key === 'availabilityStatus') showNotification(`Status updated to: ${value}`, 'success');
    else if (key === 'language') showNotification(`Language set to: ${value === 'en' ? 'English' : 'Kiswahili'}`, 'success');
}

// ========== LOGIN / AUTH ==========
async function loginStaff() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (!email || !password) { showNotification('Please enter both email and password', 'error'); return; }
    
    try {
        const response = await API.auth.staffLogin(email, password);
        if (response && response.token) {
            currentStaff = response.staff;
            showDashboard();
        }
    } catch (error) {
        showNotification('Invalid email or password!', 'error');
        const loginCard = document.querySelector('.login-card');
        if (loginCard) { loginCard.style.animation = 'shake 0.5s'; setTimeout(() => { loginCard.style.animation = ''; }, 500); }
    }
}

async function performLogout() {
    const modal = document.getElementById('logoutConfirmModal');
    if (modal) modal.style.display = 'none';
    const loadingOverlay = document.getElementById('logoutLoadingOverlay');
    if (loadingOverlay) loadingOverlay.style.display = 'flex';
    
    try {
        await API.auth.staffLogout();
    } catch (e) { console.error('Logout error:', e); }
    
    setTimeout(() => {
        sessionStorage.clear();
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
        document.getElementById('loginSection').style.display = 'flex';
        showNotification('Logged out successfully!', 'success');
    }, 1000);
}

function showForgotPassword() { showNotification('Please contact your administrator to reset your password.', 'info'); }
function showDemoCredentials() { showNotification('Use staff credentials from your database', 'info'); }

// ========== DASHBOARD INIT ==========
function showDashboard() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    
    updateCurrentDate();
    loadStaffData();
    loadJobs();
    loadJobHistory();
    loadStats();
    loadProfile();
    loadSettings();
    toggleSupervisorMenu();
    toggleGeneralSupervisorMenu();
    
    showNotification(`Welcome, ${currentStaff.first_name || currentStaff.name}!`, 'success');
    sessionStorage.setItem('staffLoggedIn', 'true');
    sessionStorage.setItem('staffName', currentStaff.first_name + ' ' + (currentStaff.last_name || ''));
    sessionStorage.setItem('staffEmail', currentStaff.email);
}

function updateCurrentDate() {
    const dateEl = document.getElementById('currentDate');
    if (dateEl) { const now = new Date(); dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }); }
}

function loadStaffData() {
    const sidebarUserName = document.getElementById('sidebarUserName');
    if (sidebarUserName && currentStaff) sidebarUserName.textContent = currentStaff.first_name + ' ' + (currentStaff.last_name || '');
    const sidebarUserRole = document.getElementById('sidebarUserRole');
    if (sidebarUserRole && currentStaff) {
        let role = currentStaff.staff_type || 'Staff';
        if (role === 'supervisor') role = 'Supervisor';
        else if (role === 'general_supervisor') role = 'General Supervisor';
        else role = 'Staff';
        sidebarUserRole.textContent = role;
    }
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    if (sidebarAvatar && currentStaff) {
        const name = currentStaff.first_name || 'S';
        sidebarAvatar.textContent = name.charAt(0).toUpperCase();
    }
    const topBarUserName = document.getElementById('topBarUserName');
    if (topBarUserName && currentStaff) topBarUserName.textContent = currentStaff.first_name + ' ' + (currentStaff.last_name || '');
}

// ========== ASSIGNED JOBS (API: /staff/jobs) ==========
async function loadJobs() {
    try {
        const response = await API.staffJobs.getAssignedJobs();
        const jobs = response.jobs || [];
        const container = document.getElementById('jobsContainer');
        if (!container) return;
        
        if (jobs.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="bi bi-check-circle-fill"></i><h4>No Active Jobs</h4><p>You have no pending or in-progress jobs at the moment.</p></div>`;
            return;
        }
        
        let html = '';
        jobs.forEach(job => {
            const statusClass = job.status === 'pending' ? 'status-pending' : 'status-in-progress';
            const statusText = getStatusLabel(job.status);
            html += `<div class="job-card clickable-indicator" data-id="${job.id}" onclick="showJobDetailModal(${job.id})">
                <div class="job-header"><div class="job-icon"><i class="bi bi-brush-fill"></i></div><span class="status-badge ${statusClass}">${statusText}</span></div>
                <h4 class="job-title">${escapeHtml(job.service?.name || 'Cleaning Service')}</h4>
                <div class="job-details">
                    <div class="job-detail-item"><i class="bi bi-geo-alt-fill"></i><span>${escapeHtml(job.location?.address || job.location || 'N/A')}</span></div>
                    <div class="job-detail-item"><i class="bi bi-person-fill"></i><span>Client: ${escapeHtml(job.customer?.name || job.customer?.full_name || 'N/A')}</span></div>
                    <div class="job-detail-item"><i class="bi bi-calendar3"></i><span>Date: ${formatDate(job.schedule?.date || job.service_date)}</span></div>
                    <div class="job-detail-item"><i class="bi bi-clock"></i><span>Time: ${job.schedule?.time || job.service_time || 'N/A'}</span></div>
                </div>
                <div class="job-actions" onclick="event.stopPropagation()">
                    <button class="btn-action btn-action-report" onclick="openActionModal(${job.id})"><i class="bi bi-exclamation-triangle-fill"></i> Report Issue</button>
                    <button class="btn-action btn-view" onclick="showJobDetailModal(${job.id})"><i class="bi bi-eye"></i> Details</button>
                </div>
            </div>`;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Load jobs error:', error);
        document.getElementById('jobsContainer').innerHTML = `<div class="empty-state"><i class="bi bi-exclamation-triangle-fill"></i><h4>Error Loading Jobs</h4><p>${error.message}</p></div>`;
    }
}

// ========== JOB HISTORY (API: /staff/jobs/history) ==========
async function loadJobHistory() {
    try {
        const response = await API.staffJobs.getJobHistory(50, 0);
        const jobs = response.history || [];
        const container = document.getElementById('historyContainer');
        if (!container) return;
        
        if (jobs.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="bi bi-clock-history"></i><h4>No Job History</h4><p>Your completed jobs will appear here.</p></div>`;
            return;
        }
        
        let html = '';
        jobs.forEach(job => {
            html += `<div class="job-card clickable-indicator" data-id="${job.id}" onclick="showJobDetailModal(${job.id})">
                <div class="job-header"><div class="job-icon"><i class="bi bi-check-circle-fill" style="color: #1e7b48;"></i></div><span class="status-badge status-completed">Completed</span></div>
                <h4 class="job-title">${escapeHtml(job.service?.name || 'Cleaning Service')}</h4>
                <div class="job-details">
                    <div class="job-detail-item"><i class="bi bi-geo-alt-fill"></i><span>${escapeHtml(job.location?.address || job.location || 'N/A')}</span></div>
                    <div class="job-detail-item"><i class="bi bi-person-fill"></i><span>Client: ${escapeHtml(job.customer?.name || job.customer?.full_name || 'N/A')}</span></div>
                    <div class="job-detail-item"><i class="bi bi-calendar-check"></i><span>Completed: ${formatDate(job.completed_date || job.completedDate)}</span></div>
                </div>
                <div class="job-actions" onclick="event.stopPropagation()">
                    <button class="btn-action btn-view" style="width: 100%;" onclick="showJobDetailModal(${job.id})"><i class="bi bi-eye"></i> View Full Details</button>
                </div>
            </div>`;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Load history error:', error);
        document.getElementById('historyContainer').innerHTML = `<div class="empty-state"><i class="bi bi-exclamation-triangle-fill"></i><h4>Error Loading History</h4><p>${error.message}</p></div>`;
    }
}

// ========== STATS (API: /staff/performance) ==========
async function loadStats() {
    try {
        const response = await API.staffJobs.getPerformanceStats();
        const stats = response.stats || {};
        const container = document.getElementById('statsContainer');
        if (!container) return;
        
        const statCards = [
            { icon: 'bi-briefcase-fill', value: stats.total_jobs || 0, label: 'Total Jobs', id: 'totalJobs' },
            { icon: 'bi-check-circle-fill', value: stats.completed_jobs || 0, label: 'Completed', id: 'completedJobs' },
            { icon: 'bi-play-fill', value: stats.in_progress_jobs || 0, label: 'In Progress', id: 'inProgressJobs' },
            { icon: 'bi-hourglass-split', value: stats.pending_jobs || 0, label: 'Pending', id: 'pendingJobs' },
            { icon: 'bi-cash-stack', value: `TZS ${formatNumber(stats.total_earnings || 0)}`, label: 'Earnings', id: 'totalEarnings' },
            { icon: 'bi-graph-up', value: `${stats.completion_rate || 0}%`, label: 'Completion Rate', id: 'completionRate' }
        ];
        
        let html = '';
        statCards.forEach(stat => {
            html += `<div class="stat-card clickable-indicator" onclick="showStatsDetail('${stat.id}')">
                <div class="stat-icon"><i class="bi ${stat.icon}"></i></div>
                <div class="stat-value">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>`;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Load stats error:', error);
        document.getElementById('statsContainer').innerHTML = `<div class="empty-state"><i class="bi bi-exclamation-triangle-fill"></i><h4>Error Loading Stats</h4><p>${error.message}</p></div>`;
    }
}

// ========== PROFILE (API: /staff/profile) ==========
async function loadProfile() {
    try {
        const response = await API.staffJobs.getProfile();
        const profile = response.profile || currentStaff;
        const container = document.getElementById('profileContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="profile-header"><div class="profile-avatar"><i class="bi bi-person-fill"></i></div>
            <h3>${escapeHtml(profile.first_name || '')} ${escapeHtml(profile.last_name || '')}</h3>
            <p>${escapeHtml(profile.staff_type || 'Staff')}${profile.staff_type === 'general_supervisor' ? ' (General Supervisor)' : profile.staff_type === 'supervisor' ? ' (Supervisor)' : ''}</p></div>
            <div class="profile-info">
                <div class="info-row"><span class="info-label"><i class="bi bi-envelope"></i> Email</span><span class="info-value">${escapeHtml(profile.email)}</span></div>
                <div class="info-row"><span class="info-label"><i class="bi bi-phone"></i> Phone</span><span class="info-value">${escapeHtml(profile.phone || 'Not provided')}</span></div>
                <div class="info-row"><span class="info-label"><i class="bi bi-calendar-plus"></i> Joined</span><span class="info-value">${formatDate(profile.joined_date || profile.created_at)}</span></div>
            </div>
            <div class="password-change-section"><h4><i class="bi bi-shield-lock-fill"></i> Change Password</h4>
            <p class="password-hint">Update your password regularly for security.</p>
            <div class="row g-3">
                <div class="col-md-12"><label class="form-label">Current Password</label><div class="input-group"><span class="input-group-text"><i class="bi bi-lock"></i></span><input type="password" id="oldPassword" class="form-control" placeholder="Enter current password"></div></div>
                <div class="col-md-12"><label class="form-label">New Password</label><div class="input-group"><span class="input-group-text"><i class="bi bi-key"></i></span><input type="password" id="newPassword" class="form-control" placeholder="Enter new password"></div></div>
                <div class="col-md-12"><label class="form-label">Confirm New Password</label><div class="input-group"><span class="input-group-text"><i class="bi bi-key-fill"></i></span><input type="password" id="confirmPassword" class="form-control" placeholder="Confirm new password"></div></div>
                <div class="col-12 mt-3"><button type="button" id="changePasswordBtn" class="btn-change-pwd w-100"><i class="bi bi-check-circle"></i> Update Password</button></div>
            </div></div>`;
        
        document.getElementById('changePasswordBtn').addEventListener('click', changeStaffPassword);
    } catch (error) {
        console.error('Load profile error:', error);
    }
}

async function changeStaffPassword() {
    const oldPass = document.getElementById('oldPassword')?.value;
    const newPass = document.getElementById('newPassword')?.value;
    const confirmPass = document.getElementById('confirmPassword')?.value;
    if (!oldPass || !newPass || !confirmPass) { showNotification('All fields are required', 'error'); return; }
    if (newPass.length < 6) { showNotification('Password must be at least 6 characters', 'error'); return; }
    if (newPass !== confirmPass) { showNotification('New passwords do not match', 'error'); return; }
    
    try {
        await API.staffJobs.changePassword(oldPass, newPass, confirmPass);
        showNotification('Password changed successfully!', 'success');
        document.getElementById('oldPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    } catch (error) {
        showNotification(error.message || 'Failed to change password', 'error');
    }
}

// ========== SETTINGS VIEW ==========
function loadSettings() {
    const container = document.getElementById('settingsContainer');
    if (!container) return;
    const settings = getSettings();
    container.innerHTML = `
        <div class="settings-card"><h3><i class="bi bi-bell-fill"></i> Notifications</h3>
            <div class="settings-item"><div><div class="settings-item-label"><i class="bi bi-bell"></i> Allow Notifications</div><div class="settings-item-desc">Receive job updates and alerts</div></div><label class="toggle-switch"><input type="checkbox" id="settingsNotifications" ${settings.notifications ? 'checked' : ''} onchange="updateSetting('notifications', this.checked)"><span class="toggle-slider"></span></label></div>
            <div class="settings-item"><div><div class="settings-item-label"><i class="bi bi-volume-up"></i> Notification Sound</div><div class="settings-item-desc">Play sound for new notifications</div></div><label class="toggle-switch"><input type="checkbox" id="settingsNotificationSound" ${settings.notificationSound ? 'checked' : ''} onchange="updateSetting('notificationSound', this.checked)"><span class="toggle-slider"></span></label></div></div>
        <div class="settings-card"><h3><i class="bi bi-palette-fill"></i> Appearance</h3>
            <div class="settings-item"><div><div class="settings-item-label"><i class="bi bi-moon-stars"></i> Dark Mode</div><div class="settings-item-desc">Switch between light and dark theme</div></div><label class="toggle-switch"><input type="checkbox" id="settingsDarkMode" ${settings.darkMode ? 'checked' : ''} onchange="toggleThemeFromSettings(this.checked)"><span class="toggle-slider"></span></label></div></div>
        <div class="settings-card"><h3><i class="bi bi-person-check-fill"></i> Availability</h3>
            <div class="settings-item"><div><div class="settings-item-label"><i class="bi bi-circle-fill ${settings.availabilityStatus === 'available' ? 'text-success' : settings.availabilityStatus === 'busy' ? 'text-danger' : 'text-warning'}"></i> Status</div><div class="settings-item-desc">Set your current availability</div></div><select class="form-control" style="width: 140px;" id="settingsAvailability" onchange="updateSetting('availabilityStatus', this.value)"><option value="available" ${settings.availabilityStatus === 'available' ? 'selected' : ''}>Available</option><option value="busy" ${settings.availabilityStatus === 'busy' ? 'selected' : ''}>Busy</option><option value="away" ${settings.availabilityStatus === 'away' ? 'selected' : ''}>Away</option></select></div></div>
        <div class="settings-card"><h3><i class="bi bi-globe"></i> Language</h3>
            <div class="settings-item"><div><div class="settings-item-label"><i class="bi bi-translate"></i> Display Language</div><div class="settings-item-desc">Choose your preferred language</div></div><select class="form-control" style="width: 140px;" id="settingsLanguage" onchange="updateSetting('language', this.value)"><option value="en" ${settings.language === 'en' ? 'selected' : ''}>English</option><option value="sw" ${settings.language === 'sw' ? 'selected' : ''}>Kiswahili</option></select></div></div>`;
}

// ========== JOB DETAIL MODAL ==========
async function showJobDetailModal(jobId) {
    try {
        const response = await API.staffJobs.getJobDetails(jobId);
        const job = response.job;
        if (!job) return;
        
        const modal = document.getElementById('jobDetailModal');
        const icon = document.getElementById('jobDetailIcon');
        const title = document.getElementById('jobDetailTitle');
        const content = document.getElementById('jobDetailContent');
        if (!modal || !content) return;
        
        if (icon) icon.className = job.status === 'completed' ? 'bi bi-check-circle-fill' : job.status === 'in_progress' ? 'bi bi-play-circle-fill' : 'bi bi-brush-fill';
        if (title) title.textContent = job.service?.name || 'Job Details';
        
        const statusClass = job.status === 'pending' ? 'pending' : job.status === 'in_progress' ? 'in-progress' : 'completed';
        let html = `<div class="detail-group"><div class="detail-group-header"><i class="bi bi-info-circle-fill"></i><h4>Job Overview</h4></div>
            <div class="detail-item"><span class="detail-label"><i class="bi bi-tag"></i> Job ID</span><span class="detail-value">#${job.id}</span></div>
            <div class="detail-item"><span class="detail-label"><i class="bi bi-brush"></i> Service</span><span class="detail-value">${escapeHtml(job.service?.name || 'N/A')}</span></div>
            <div class="detail-item"><span class="detail-label"><i class="bi bi-geo-alt"></i> Status</span><span class="detail-value"><span class="status-badge-large ${statusClass}">${job.status.toUpperCase()}</span></span></div></div>
            <div class="detail-group"><div class="detail-group-header"><i class="bi bi-person-fill"></i><h4>Client Information</h4></div>
            <div class="detail-item"><span class="detail-label"><i class="bi bi-person"></i> Name</span><span class="detail-value">${escapeHtml(job.customer?.name || job.customer?.full_name || 'N/A')}</span></div>
            <div class="detail-item"><span class="detail-label"><i class="bi bi-telephone"></i> Phone</span><span class="detail-value">${escapeHtml(job.customer?.phone || 'N/A')}</span></div></div>
            <div class="detail-group"><div class="detail-group-header"><i class="bi bi-geo-alt-fill"></i><h4>Location & Schedule</h4></div>
            <div class="detail-item"><span class="detail-label"><i class="bi bi-geo-alt"></i> Location</span><span class="detail-value">${escapeHtml(job.location?.address || job.location || 'N/A')}</span></div>
            <div class="detail-item"><span class="detail-label"><i class="bi bi-calendar3"></i> Scheduled Date</span><span class="detail-value">${formatDate(job.schedule?.date || job.service_date)}</span></div>
            <div class="detail-item"><span class="detail-label"><i class="bi bi-clock"></i> Time Slot</span><span class="detail-value">${job.schedule?.time || job.service_time || 'N/A'}</span></div></div>`;
        
        if (job.booking_details?.instructions || job.instructions) {
            html += `<div class="detail-group"><div class="detail-group-header"><i class="bi bi-file-text"></i><h4>Instructions</h4></div>
            <p style="color: var(--text-secondary); line-height: 1.6; padding: 12px; background: var(--bg-section-alt); border-radius: 10px;">${escapeHtml(job.booking_details?.instructions || job.instructions)}</p></div>`;
        }
        
        content.innerHTML = html;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } catch (error) {
        showNotification('Failed to load job details', 'error');
    }
}
function closeJobDetailModalFn() { const modal = document.getElementById('jobDetailModal'); if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; } }

// ========== ACTION / ISSUE REPORT (API: /staff-issues) ==========
function openActionModal(jobId) {
    const modal = document.getElementById('actionModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.setAttribute('data-job-id', jobId);
        document.body.style.overflow = 'hidden';
        document.getElementById('actionType').value = '';
        document.getElementById('actionDescription').value = '';
        document.getElementById('actionReturnDate').value = '';
    }
}
function closeActionModalFn() { const modal = document.getElementById('actionModal'); if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; } }

async function submitActionReport() {
    const modal = document.getElementById('actionModal');
    const jobId = modal.getAttribute('data-job-id');
    const issueType = document.getElementById('actionType').value;
    const description = document.getElementById('actionDescription').value;
    const returnDate = document.getElementById('actionReturnDate').value;
    
    if (!issueType) { showNotification('Please select an issue type', 'error'); return; }
    if (!description.trim()) { showNotification('Please provide a description', 'error'); return; }
    
    try {
        await API.staffIssues.submit({
            booking_id: parseInt(jobId),
            issue_type: issueType,
            issue_title: `Issue reported: ${issueType}`,
            issue_description: description,
            expected_return_date: returnDate || new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]
        });
        closeActionModalFn();
        showNotification('Issue reported successfully! Admin will review.', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to submit report', 'error');
    }
}

// ========== STATS DETAIL MODAL ==========
function showStatsDetail(statId) {
    const modal = document.getElementById('statsDetailModal');
    const icon = document.getElementById('statsDetailIcon');
    const title = document.getElementById('statsDetailTitle');
    const content = document.getElementById('statsDetailContent');
    if (!modal || !content) return;
    
    if (icon) icon.className = 'bi bi-graph-up';
    if (title) title.textContent = 'Statistics Details';
    
    let contentHtml = `<div class="stats-detail-section"><h4>Performance Metrics</h4><p style="color: var(--text-muted);">Detailed statistics are available in your dashboard.</p></div>`;
    content.innerHTML = contentHtml;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
function closeStatsDetailModalFn() { const modal = document.getElementById('statsDetailModal'); if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; } }

// ========== SUPERVISOR MENU TOGGLES ==========
function toggleSupervisorMenu() {
    const supervisorBtn = document.getElementById('supervisorSidebarBtn');
    if (currentStaff && (currentStaff.staff_type === 'supervisor' || currentStaff.staff_type === 'general_supervisor')) {
        if (supervisorBtn) supervisorBtn.style.display = 'flex';
    } else {
        if (supervisorBtn) supervisorBtn.style.display = 'none';
    }
}
function toggleGeneralSupervisorMenu() {
    const gsBtn = document.getElementById('generalSupervisorSidebarBtn');
    if (currentStaff && currentStaff.staff_type === 'general_supervisor') {
        if (gsBtn) gsBtn.style.display = 'flex';
    } else {
        if (gsBtn) gsBtn.style.display = 'none';
    }
}

// ========== SUPERVISOR FUNCTIONS (API: /supervisor/*) ==========
async function loadSupervisorContractors() {
    try {
        const response = await API.supervisor.getContractors();
        const contractors = response.contractors || [];
        const select = document.getElementById('locationSelect');
        if (!select) return;
        
        let options = '<option value="">-- Choose Location --</option>';
        contractors.forEach(c => {
            options += `<option value="${c.id}">${escapeHtml(c.company_name)} - ${escapeHtml(c.location)}</option>`;
        });
        select.innerHTML = options;
    } catch (error) {
        console.error('Load contractors error:', error);
    }
}

async function loadStaffForLocation(contractorId) {
    try {
        const response = await API.supervisor.getContractorStaff(contractorId);
        const staff = response.staff || [];
        const selectedLocationDisplay = document.getElementById('selectedLocationDisplay');
        const reportLocationField = document.getElementById('reportLocation');
        
        if (selectedLocationDisplay) selectedLocationDisplay.textContent = `Contractor ID: ${contractorId}`;
        if (reportLocationField) reportLocationField.value = `Contractor ${contractorId}`;
        
        const today = new Date().toISOString().split('T')[0];
        
        let html = `<table class="attendance-table"><thead><tr><th>Staff Name</th><th>Role</th><th>Present Today (10,000 TZS)</th></tr></thead><tbody>`;
        staff.forEach(s => {
            html += `<tr><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.role || 'Staff')}</td><td><input type="checkbox" class="attendance-checkbox" data-staff-id="${s.id}" checked></td></tr>`;
        });
        html += `</tbody></table>`;
        
        const attendanceContainer = document.getElementById('attendanceTableContainer');
        if (attendanceContainer) {
            attendanceContainer.innerHTML = html;
            document.querySelectorAll('.attendance-checkbox').forEach(cb => {
                cb.addEventListener('change', function() {});
            });
        }
        
        const attendanceCard = document.getElementById('attendanceCard');
        if (attendanceCard) attendanceCard.style.display = 'block';
    } catch (error) {
        showNotification('Failed to load staff data', 'error');
    }
}

async function saveAttendanceAndUpdatePayroll() {
    const contractorId = document.getElementById('locationSelect').value;
    if (!contractorId) { showNotification('Please select a location first', 'error'); return; }
    
    const attendanceDate = new Date().toISOString().split('T')[0];
    const checkboxes = document.querySelectorAll('.attendance-checkbox');
    const staffAttendance = Array.from(checkboxes).map(cb => ({
        staff_id: parseInt(cb.dataset.staffId),
        is_present: cb.checked
    }));
    
    try {
        await API.supervisor.saveAttendance(contractorId, attendanceDate, staffAttendance);
        showNotification('Attendance saved successfully!', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to save attendance', 'error');
    }
}

async function generateWeeklyReport() {
    const contractorId = document.getElementById('locationSelect').value;
    const weekEnding = document.getElementById('reportWeekEnding').value;
    const progress = document.getElementById('reportProgress').value;
    const performance = document.getElementById('reportPerformance').value;
    const equipment = document.getElementById('reportEquipment').value;
    const requests = document.getElementById('reportRequests').value;
    
    if (!contractorId) { showNotification('Please select a location first', 'error'); return; }
    if (!weekEnding) { showNotification('Please select the week ending date', 'error'); return; }
    
    try {
        const response = await API.supervisor.generateWeeklyReport({
            contractor_id: parseInt(contractorId),
            week_ending_date: weekEnding,
            work_progress: progress || 'No progress report provided.',
            worker_performance: performance || 'No performance report provided.',
            equipment_status: equipment || 'No equipment report provided.',
            additional_requests: requests || 'No additional requests.'
        });
        
        if (response.report_id) {
            showNotification('Report generated successfully!', 'success');
            document.getElementById('downloadReportBtn').disabled = false;
            document.getElementById('sendReportToAdminBtn').disabled = false;
            document.getElementById('attachReportToChatBtn').disabled = false;
            currentGeneratedReport = { id: response.report_id, contractor_id: contractorId, week_ending_date: weekEnding };
        }
    } catch (error) {
        showNotification(error.message || 'Failed to generate report', 'error');
    }
}

// FIXED: Download report with authentication token using fetch/blob
async function downloadReport() {
    if (!currentGeneratedReport) { showNotification('No report to download', 'error'); return; }
    const token = API.getAuthToken();
    const url = API.supervisor.downloadReport(currentGeneratedReport.id);
    
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Download failed');
        }
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `weekly_report_${currentGeneratedReport.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        showNotification('Report downloaded successfully!', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to download report', 'error');
    }
}

async function sendReportToAdmin() {
    if (!currentGeneratedReport) { showNotification('No report to send', 'error'); return; }
    try {
        await API.supervisor.submitReportToAdmin(currentGeneratedReport.id);
        showNotification('Report sent to Admin!', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to send report', 'error');
    }
}

// ========== SUPERVISOR CHAT (API: /supervisor/chat/*) ==========
async function loadSupervisorChat() {
    try {
        const response = await API.supervisor.getChatMessages();
        const messages = response.messages || [];
        const container = document.getElementById('chatMessagesContainer');
        if (!container) return;
        
        if (messages.length === 0) {
            container.innerHTML = '<div class="chat-placeholder">No messages yet. Start a conversation with Admin.</div>';
            return;
        }
        
        let html = '';
        messages.slice().reverse().forEach(msg => {
            const date = new Date(msg.created_at);
            const messageClass = msg.sender_role === 'supervisor' || msg.sender_role === 'general_supervisor' ? 'sent' : 'received';
            const senderName = messageClass === 'sent' ? 'You' : 'Admin';
            html += `<div class="chat-message-wrapper ${messageClass}"><div class="chat-message ${messageClass}"><div style="font-weight: 600; margin-bottom: 4px; font-size: 12px;">${escapeHtml(senderName)}</div><div class="message-text">${escapeHtml(msg.message)}</div><div class="message-meta"><span>${date.toLocaleString()}</span></div></div></div>`;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Load chat error:', error);
    }
}

async function sendSupervisorMessage() {
    const message = document.getElementById('chatMessageInput').value;
    if (!message.trim()) { showNotification('Please enter a message', 'error'); return; }
    
    try {
        await API.supervisor.sendMessage(message);
        document.getElementById('chatMessageInput').value = '';
        await loadSupervisorChat();
        showNotification('Message sent!', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to send message', 'error');
    }
}

// ========== GENERAL SUPERVISOR FUNCTIONS (API: /general-supervisor/*) ==========
async function loadGeneralSupervisorData() {
    if (!currentStaff || currentStaff.staff_type !== 'general_supervisor') return;
    await loadGSTeam();
    await loadGSJobs();
    await loadGSJobSelect();
    await loadGSPaymentStats();
    await loadGSCompletedJobsForPayment();
    await loadGSRecentPayments();
    await loadGSChatMessages();
    await loadGSReportHistory();
}

async function loadGSTeam() {
    try {
        const response = await API.generalSupervisor.getMyTeam();
        const team = response.staff || [];
        const container = document.getElementById('gsTeamContainer');
        if (!container) return;
        
        if (team.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No workers assigned to you.</p>';
            return;
        }
        
        let html = '';
        team.forEach(member => {
            html += `<div class="gs-team-member"><div class="gs-team-avatar">${(member.first_name?.charAt(0) || 'S')}${(member.last_name?.charAt(0) || '')}</div>
                <div class="gs-team-info"><div class="gs-team-name">${escapeHtml(member.full_name || member.name)}</div>
                <div class="gs-team-role">${escapeHtml(member.staff_type || 'Staff')}</div>
                <div class="gs-team-stats"><span><i class="bi bi-briefcase"></i> ${member.stats?.total_jobs || 0} jobs</span>
                <span><i class="bi bi-check-circle"></i> ${member.stats?.completed_jobs || 0} completed</span></div></div></div>`;
        });
        container.innerHTML = html;
        
        const workerFilter = document.getElementById('gsWorkerFilter');
        if (workerFilter) {
            let options = '<option value="all">All Workers</option>';
            team.forEach(m => { options += `<option value="${m.id}">${escapeHtml(m.full_name || m.name)}</option>`; });
            workerFilter.innerHTML = options;
        }
    } catch (error) {
        console.error('Load team error:', error);
    }
}

async function loadGSJobs() {
    try {
        const statusFilter = document.getElementById('gsStatusFilter')?.value || 'all';
        const workerFilter = document.getElementById('gsWorkerFilter')?.value || 'all';
        const filters = {};
        if (statusFilter !== 'all') filters.status = statusFilter;
        if (workerFilter !== 'all') filters.staff_id = workerFilter;
        
        const response = await API.generalSupervisor.getAllTeamJobs(filters);
        const jobs = response.jobs || [];
        const container = document.getElementById('gsJobsContainer');
        if (!container) return;
        
        if (jobs.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No jobs found.</p>';
            return;
        }
        
        let html = '';
        jobs.forEach(job => {
            const statusClass = job.status === 'pending' ? 'status-pending' : job.status === 'in_progress' ? 'status-in-progress' : 'status-completed';
            html += `<div class="gs-job-item"><div class="gs-job-info"><div class="gs-job-service">${escapeHtml(job.service?.name || 'Service')}</div>
                <div class="gs-job-meta"><span><i class="bi bi-person"></i> ${escapeHtml(job.staff?.name || 'Unassigned')}</span> · 
                <span><i class="bi bi-geo-alt"></i> ${escapeHtml(job.location?.address || 'N/A')}</span> · 
                <span><i class="bi bi-calendar"></i> ${formatDate(job.schedule?.date)}</span></div></div>
                <div><span class="status-badge ${statusClass}">${getStatusLabel(job.status)}</span>
                <span style="margin-left: 8px; font-weight: 600; color: #28a745;">TZS ${formatNumber(job.payment?.total_price || 0)}</span></div></div>`;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Load GS jobs error:', error);
    }
}

async function loadGSJobSelect() {
    try {
        const response = await API.generalSupervisor.getAllTeamJobs({ status: 'pending,in-progress' });
        const jobs = response.jobs || [];
        const select = document.getElementById('gsJobSelect');
        if (!select) return;
        
        let options = '<option value="">-- Select Job to Update --</option>';
        jobs.forEach(job => {
            options += `<option value="${job.id}">#${job.id} - ${escapeHtml(job.service?.name)} (${job.status})</option>`;
        });
        select.innerHTML = options;
    } catch (error) {
        console.error('Load job select error:', error);
    }
}

async function updateJobStatusGS(jobId, newStatus) {
    try {
        await API.generalSupervisor.updateTeamJobStatus(jobId, newStatus);
        showNotification(`Job marked as ${newStatus === 'completed' ? 'completed' : 'started'}!`, 'success');
        await loadGSJobs();
        await loadGSJobSelect();
    } catch (error) {
        showNotification(error.message || 'Failed to update job status', 'error');
    }
}

async function loadGSPaymentStats() {
    try {
        const response = await API.generalSupervisor.getCashPaymentStats();
        const stats = response.stats || {};
        const grid = document.getElementById('gsPaymentStatsGrid');
        if (!grid) return;
        
        grid.innerHTML = `
            <div class="payment-stat-card clickable-indicator" onclick="showPaymentStatsDetail('totalPayments')">
                <div class="payment-stat-icon"><i class="bi bi-receipt"></i></div><div class="payment-stat-value">${stats.total_validated || 0}</div><div class="payment-stat-label">Total Payments</div></div>
            <div class="payment-stat-card clickable-indicator" onclick="showPaymentStatsDetail('totalRevenue')">
                <div class="payment-stat-icon"><i class="bi bi-cash-stack"></i></div><div class="payment-stat-value">TZS ${formatNumber(stats.total_received || 0)}</div><div class="payment-stat-label">Total Revenue</div></div>
            <div class="payment-stat-card clickable-indicator" onclick="showPaymentStatsDetail('todayPayments')">
                <div class="payment-stat-icon"><i class="bi bi-calendar-today"></i></div><div class="payment-stat-value">${stats.today_validated || 0}</div><div class="payment-stat-label">Today's Payments</div></div>
            <div class="payment-stat-card clickable-indicator" onclick="showPaymentStatsDetail('todayRevenue')">
                <div class="payment-stat-icon"><i class="bi bi-graph-up"></i></div><div class="payment-stat-value">TZS ${formatNumber(stats.today_received || 0)}</div><div class="payment-stat-label">Today's Revenue</div></div>`;
    } catch (error) {
        console.error('Load payment stats error:', error);
    }
}

async function loadGSCompletedJobsForPayment() {
    try {
        const response = await API.generalSupervisor.getCashPaymentList();
        const jobs = response.payments || [];
        const select = document.getElementById('gsJobSelectPayment');
        if (!select) return;
        
        if (jobs.length === 0) {
            select.innerHTML = '<option value="">-- No pending payments --</option>';
            return;
        }
        
        let options = '<option value="">-- Select a completed job --</option>';
        jobs.forEach(job => {
            options += `<option value="${job.id}" data-customer="${escapeHtml(job.customer?.name)}" data-amount="${job.total_price}">#${job.id} - ${job.customer?.name} (TZS ${formatNumber(job.total_price)})</option>`;
        });
        select.innerHTML = options;
        
        select.onchange = function() {
            const opt = this.options[this.selectedIndex];
            if (this.value) {
                document.getElementById('gsCustomerName').value = opt.getAttribute('data-customer') || '';
                document.getElementById('gsServiceAmount').value = `TZS ${formatNumber(parseInt(opt.getAttribute('data-amount')))}`;
                document.getElementById('gsCashReceived').value = '';
                document.getElementById('gsPaymentNote').value = '';
                gsSelectedJobForPayment = { id: parseInt(this.value), amount: parseInt(opt.getAttribute('data-amount')) };
            } else {
                document.getElementById('gsCustomerName').value = '';
                document.getElementById('gsServiceAmount').value = '';
                gsSelectedJobForPayment = null;
            }
        };
    } catch (error) {
        console.error('Load completed jobs error:', error);
    }
}

async function validateGSCashPayment() {
    if (!gsSelectedJobForPayment) { showNotification('Please select a job', 'error'); return; }
    const cashReceived = parseFloat(document.getElementById('gsCashReceived').value);
    if (isNaN(cashReceived) || cashReceived <= 0) { showNotification('Please enter a valid amount', 'error'); return; }
    if (cashReceived < gsSelectedJobForPayment.amount) { showNotification(`Insufficient payment! Need TZS ${formatNumber(gsSelectedJobForPayment.amount - cashReceived)} more.`, 'error'); return; }
    
    try {
        const response = await API.generalSupervisor.validateCashPayment(gsSelectedJobForPayment.id, cashReceived, document.getElementById('gsPaymentNote').value);
        showNotification(`Payment validated! Receipt #${response.receipt?.receipt_number || 'generated'}`, 'success');
        
        document.getElementById('gsCashReceived').value = '';
        document.getElementById('gsPaymentNote').value = '';
        document.getElementById('gsJobSelectPayment').value = '';
        document.getElementById('gsCustomerName').value = '';
        document.getElementById('gsServiceAmount').value = '';
        gsSelectedJobForPayment = null;
        
        await loadGSPaymentStats();
        await loadGSCompletedJobsForPayment();
        await loadGSRecentPayments();
    } catch (error) {
        showNotification(error.message || 'Failed to validate payment', 'error');
    }
}

async function loadGSRecentPayments() {
    try {
        const response = await API.generalSupervisor.getCashPaymentHistory(10);
        const payments = response.history || [];
        const container = document.getElementById('gsRecentPaymentsContainer');
        if (!container) return;
        
        if (payments.length === 0) {
            container.innerHTML = `<div class="empty-state" style="padding:20px;"><i class="bi bi-receipt"></i><h4>No Payments Yet</h4></div>`;
            return;
        }
        
        container.innerHTML = payments.map(p => `<div class="payment-item"><div class="payment-info"><div class="payment-job">${escapeHtml(p.service?.name || 'Service')}</div>
            <div class="payment-details"><span><i class="bi bi-person"></i> ${escapeHtml(p.customer?.name)}</span><span><i class="bi bi-receipt"></i> ${p.receipt_number}</span></div>
            <span class="payment-status">Validated</span></div><div class="payment-amount"><div class="amount-value">TZS ${formatNumber(p.amount_received)}</div><div class="payment-date">${formatDate(p.created_at)}</div></div></div>`).join('');
    } catch (error) {
        console.error('Load recent payments error:', error);
    }
}

// ========== GS CHAT (API: /general-supervisor/chat/*) ==========
async function loadGSChatMessages() {
    try {
        const response = await API.generalSupervisor.getChatMessages();
        const messages = response.messages || [];
        const container = document.getElementById('gsChatMessagesContainer');
        if (!container) return;
        
        if (messages.length === 0) {
            container.innerHTML = '<div class="chat-placeholder">No messages yet. Start a conversation with Admin.</div>';
            return;
        }
        
        let html = '';
        messages.slice().reverse().forEach(msg => {
            const date = new Date(msg.created_at);
            const messageClass = msg.sender_role === 'general_supervisor' ? 'sent' : 'received';
            const senderName = messageClass === 'sent' ? 'You' : 'Admin';
            html += `<div class="chat-message-wrapper ${messageClass}"><div class="chat-message ${messageClass}"><div style="font-weight: 600; margin-bottom: 4px; font-size: 12px;">${escapeHtml(senderName)}</div><div class="message-text">${escapeHtml(msg.message)}</div><div class="message-meta"><span>${date.toLocaleString()}</span></div></div></div>`;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Load GS chat error:', error);
    }
}

async function sendGSChatMessage() {
    const message = document.getElementById('gsChatMessageInput').value;
    if (!message.trim()) { showNotification('Please enter a message', 'error'); return; }
    
    try {
        await API.generalSupervisor.sendMessage(message);
        document.getElementById('gsChatMessageInput').value = '';
        await loadGSChatMessages();
        showNotification('Message sent to Admin!', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to send message', 'error');
    }
}

// ========== GS WEEKLY REPORTS (API: /general-supervisor/reports) ==========
async function loadGSReportHistory() {
    try {
        const response = await API.generalSupervisor.getMyReports();
        const reports = response.reports || [];
        const container = document.getElementById('gsReportHistoryContainer');
        if (!container) return;
        
        if (reports.length === 0) {
            container.innerHTML = '<div class="empty-state" style="padding:20px;"><i class="bi bi-file-text"></i><h4>No Reports Yet</h4></div>';
            return;
        }
        
        let html = '';
        reports.forEach(r => {
            const submittedBadge = r.submitted_to_admin ? '<span class="status-badge status-completed" style="font-size:10px;">Submitted</span>' : '<span class="status-badge status-pending" style="font-size:10px;">Draft</span>';
            html += `<div class="report-history-item"><div class="report-history-info"><div class="report-history-title">Report - Week Ending ${r.week_ending_date}</div>
                <div class="report-history-meta"><span><i class="bi bi-building"></i> ${escapeHtml(r.company_name || 'Site')}</span><span>${submittedBadge}</span></div></div>
                <div class="report-history-actions"><button class="btn-report-download" onclick="downloadGSReportById(${r.id})" title="Download PDF"><i class="bi bi-download"></i></button></div></div>`;
        });
        container.innerHTML = html;
    } catch (error) {
        console.error('Load report history error:', error);
    }
}

async function generateGSWeeklyReport() {
    const weekEnding = document.getElementById('gsReportWeekEnding').value;
    const sites = document.getElementById('gsReportSites').value;
    const workers = document.getElementById('gsReportWorkers').value;
    const completedJobs = document.getElementById('gsReportCompletedJobs').value;
    const pendingJobs = document.getElementById('gsReportPendingJobs').value;
    const attendance = document.getElementById('gsReportAttendance').value;
    const issues = document.getElementById('gsReportIssues').value;
    const recommendations = document.getElementById('gsReportRecommendations').value;
    
    if (!weekEnding) { showNotification('Please select week ending date', 'error'); return; }
    
    try {
        const response = await API.generalSupervisor.generateWeeklyReport({
            week_ending_date: weekEnding,
            work_progress: sites,
            worker_performance: workers,
            equipment_status: `Completed: ${completedJobs || 0}, Pending: ${pendingJobs || 0}`,
            additional_requests: `Attendance: ${attendance}\nIssues: ${issues}\nRecommendations: ${recommendations}`
        });
        
        if (response.report_id) {
            showNotification('Report generated!', 'success');
            document.getElementById('gsDownloadReportBtn').disabled = false;
            document.getElementById('gsSubmitReportBtn').disabled = false;
            gsCurrentGeneratedReport = { id: response.report_id };
            
            const previewModal = document.getElementById('reportPreviewModal');
            if (previewModal) {
                document.getElementById('reportPreviewContent').innerHTML = `<div class="professional-report"><h3>Report Generated</h3><p>Report #${response.report_id} has been created.</p></div>`;
                previewModal.style.display = 'flex';
            }
        }
    } catch (error) {
        showNotification(error.message || 'Failed to generate report', 'error');
    }
}

// FIXED: Download GS report with authentication token using fetch/blob
async function downloadGSReport() {
    if (!gsCurrentGeneratedReport) { showNotification('No report to download', 'error'); return; }
    const token = API.getAuthToken();
    const url = API.generalSupervisor.downloadReport(gsCurrentGeneratedReport.id);
    
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Download failed');
        }
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `gs_weekly_report_${gsCurrentGeneratedReport.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        showNotification('Report downloaded successfully!', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to download report', 'error');
    }
}

async function submitGSReportToAdmin() {
    if (!gsCurrentGeneratedReport) { showNotification('No report to submit', 'error'); return; }
    try {
        await API.generalSupervisor.submitReportToAdmin(gsCurrentGeneratedReport.id);
        showNotification('Report submitted to Admin!', 'success');
        await loadGSReportHistory();
        document.getElementById('gsDownloadReportBtn').disabled = true;
        document.getElementById('gsSubmitReportBtn').disabled = true;
    } catch (error) {
        showNotification(error.message || 'Failed to submit report', 'error');
    }
}

async function downloadGSReportById(reportId) {
    const token = API.getAuthToken();
    const url = API.generalSupervisor.downloadReport(reportId);
    
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Download failed');
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `gs_report_${reportId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        showNotification('Download started', 'success');
    } catch (error) {
        showNotification(error.message || 'Failed to download', 'error');
    }
}

function closeReportModal() { document.getElementById('reportPreviewModal').style.display = 'none'; }
function closeReceiptModal() { document.getElementById('receiptModal').style.display = 'none'; }
function printReceipt() { window.print(); }
function showPaymentStatsDetail(statType) { const modal = document.getElementById('paymentStatsDetailModal'); if (modal) modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
function closePaymentStatsDetailModal() { const modal = document.getElementById('paymentStatsDetailModal'); if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; } }
function filterGSJobs() { loadGSJobs(); }
function showLogoutConfirmation() { document.getElementById('logoutConfirmModal').style.display = 'flex'; document.body.style.overflow = 'hidden'; }
function hideLogoutConfirmation() { document.getElementById('logoutConfirmModal').style.display = 'none'; document.body.style.overflow = ''; }

// ========== NAVIGATION ==========
function setupSidebarNav() {
    const navButtons = document.querySelectorAll('.sidebar-nav-btn');
    const views = ['jobs', 'history', 'stats', 'profile', 'settings', 'supervisor', 'generalSupervisor'];
    const viewTitles = { jobs: 'Assigned Jobs', history: 'Job History', stats: 'My Stats', profile: 'My Profile', settings: 'Settings', supervisor: 'Supervisor Panel', generalSupervisor: 'General Supervisor' };
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            views.forEach(v => { const el = document.getElementById(`${v}View`); if (el) el.classList.remove('active'); });
            const activeView = document.getElementById(`${view}View`);
            if (activeView) {
                activeView.classList.add('active');
                const topBarTitle = document.getElementById('topBarTitle');
                if (topBarTitle) topBarTitle.textContent = viewTitles[view] || view;
                if (view === 'supervisor') { loadSupervisorContractors(); loadSupervisorChat(); }
                else if (view === 'generalSupervisor') { loadGeneralSupervisorData(); }
                else if (view === 'settings') loadSettings();
                else if (view === 'jobs') loadJobs();
                else if (view === 'history') loadJobHistory();
                else if (view === 'stats') loadStats();
                else if (view === 'profile') loadProfile();
            }
        });
    });
}

function setupMobileMenu() {
    const menuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const closeBtn = document.getElementById('sidebarCloseBtn');
    if (menuToggle) menuToggle.addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('active'); document.body.style.overflow = 'hidden'; });
    if (overlay) overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); document.body.style.overflow = ''; });
    if (closeBtn) closeBtn.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); document.body.style.overflow = ''; });
}
function closeSidebar() { const sidebar = document.getElementById('sidebar'); const overlay = document.getElementById('sidebarOverlay'); if (sidebar) sidebar.classList.remove('open'); if (overlay) overlay.classList.remove('active'); document.body.style.overflow = ''; }

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
    document.getElementById('loginForm')?.addEventListener('submit', (e) => { e.preventDefault(); loginStaff(); });
    document.getElementById('sidebarLogoutBtn')?.addEventListener('click', showLogoutConfirmation);
    document.getElementById('cancelLogoutBtn')?.addEventListener('click', hideLogoutConfirmation);
    document.getElementById('confirmLogoutBtn')?.addEventListener('click', performLogout);
    document.getElementById('forgotPasswordLink')?.addEventListener('click', (e) => { e.preventDefault(); showForgotPassword(); });
    document.getElementById('demoCredentialsLink')?.addEventListener('click', (e) => { e.preventDefault(); showDemoCredentials(); });
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    document.getElementById('themeToggleMobile')?.addEventListener('click', toggleTheme);
    document.querySelector('.sidebar-theme-toggle')?.addEventListener('click', toggleTheme);
    document.getElementById('closeJobDetailModal')?.addEventListener('click', closeJobDetailModalFn);
    document.getElementById('closeJobDetailFooter')?.addEventListener('click', closeJobDetailModalFn);
    document.getElementById('jobDetailModal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) closeJobDetailModalFn(); });
    document.getElementById('closeStatsDetailModal')?.addEventListener('click', closeStatsDetailModalFn);
    document.getElementById('closeStatsDetailFooter')?.addEventListener('click', closeStatsDetailModalFn);
    document.getElementById('statsDetailModal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) closeStatsDetailModalFn(); });
    document.getElementById('closeActionModal')?.addEventListener('click', closeActionModalFn);
    document.getElementById('cancelActionBtn')?.addEventListener('click', closeActionModalFn);
    document.getElementById('submitActionBtn')?.addEventListener('click', submitActionReport);
    document.getElementById('actionModal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) closeActionModalFn(); });
    document.getElementById('loadLocationDataBtn')?.addEventListener('click', () => { const location = document.getElementById('locationSelect').value; if (location) loadStaffForLocation(location); else showNotification('Please select a location', 'error'); });
    document.getElementById('saveAttendanceBtn')?.addEventListener('click', saveAttendanceAndUpdatePayroll);
    document.getElementById('generateReportBtn')?.addEventListener('click', generateWeeklyReport);
    document.getElementById('downloadReportBtn')?.addEventListener('click', downloadReport);
    document.getElementById('sendReportToAdminBtn')?.addEventListener('click', sendReportToAdmin);
    document.getElementById('sendChatMessageBtn')?.addEventListener('click', sendSupervisorMessage);
    document.getElementById('gsSendChatMessageBtn')?.addEventListener('click', sendGSChatMessage);
    document.getElementById('gsGenerateReportBtn')?.addEventListener('click', generateGSWeeklyReport);
    document.getElementById('gsDownloadReportBtn')?.addEventListener('click', downloadGSReport);
    document.getElementById('gsSubmitReportBtn')?.addEventListener('click', submitGSReportToAdmin);
    document.getElementById('gsValidatePaymentBtn')?.addEventListener('click', validateGSCashPayment);
    document.getElementById('gsMarkStartedBtn')?.addEventListener('click', () => { const jobId = document.getElementById('gsJobSelect').value; if (jobId) updateJobStatusGS(parseInt(jobId), 'in-progress'); });
    document.getElementById('gsMarkCompletedBtn')?.addEventListener('click', () => { const jobId = document.getElementById('gsJobSelect').value; if (jobId) updateJobStatusGS(parseInt(jobId), 'completed'); });
    document.getElementById('gsStatusFilter')?.addEventListener('change', filterGSJobs);
    document.getElementById('gsWorkerFilter')?.addEventListener('change', filterGSJobs);
    document.getElementById('closeReportModalBtn')?.addEventListener('click', closeReportModal);
    document.getElementById('closeReportPreviewBtn')?.addEventListener('click', closeReportModal);
    document.getElementById('confirmDownloadReportBtn')?.addEventListener('click', downloadGSReport);
    document.getElementById('closeReceiptModalBtn')?.addEventListener('click', closeReceiptModal);
    document.getElementById('closeReceiptBtn')?.addEventListener('click', closeReceiptModal);
    document.getElementById('printReceiptBtn')?.addEventListener('click', printReceipt);
    document.getElementById('closePaymentStatsDetailModal')?.addEventListener('click', closePaymentStatsDetailModal);
    document.getElementById('closePaymentStatsDetailFooter')?.addEventListener('click', closePaymentStatsDetailModal);
    document.getElementById('paymentStatsDetailModal')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) closePaymentStatsDetailModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeJobDetailModalFn(); closeStatsDetailModalFn(); closePaymentStatsDetailModal(); closeReceiptModal(); closeReportModal(); hideLogoutConfirmation(); closeActionModalFn(); } });
    window.addEventListener('resize', () => { if (window.innerWidth > 768) closeSidebar(); });
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('Staff page initializing...');
    setupEventListeners();
    setupSidebarNav();
    setupMobileMenu();
    updateCurrentDate();
    initThemeToggle();
    
    if (sessionStorage.getItem('staffLoggedIn') === 'true') {
        const token = API.getAuthToken();
        if (token) {
            API.auth.getProfile().then(profile => {
                if (profile && profile.profile) {
                    currentStaff = profile.profile;
                    showDashboard();
                }
            }).catch(() => { sessionStorage.clear(); });
        }
    }
});