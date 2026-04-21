// ============================================================
//  CSMS ADMIN PANEL — admin.js
//  All prices in TZS | Full updated version
//  Features: Services Assignment, Manual What's Included
// ============================================================

// ========== CREDENTIALS ==========
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

// Assignment state
let selectedAssignStaffId = null;
let currentAssignServiceId = null;

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
    setTimeout(() => toast && toast.remove && toast.remove(), 4000);
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

// ========== DASHBOARD INIT ==========
function initDashboard() {
    loadDashboardStats();
    loadServices();
    loadBookings();
    loadStaff();
    loadMessages();
    initCharts();
    loadRecentBookings();
    loadSettings();
    setupMenuClickHandlers();
    initIncludedManualEntry('includedManualEntry', 'addIncludedItemBtn', []);
}

// ========== STATS ==========
function loadDashboardStats() {
    const services = JSON.parse(localStorage.getItem('adminServices')) || [];
    const staff    = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    const bookings = JSON.parse(localStorage.getItem('customerBookings')) || [];
    const messages = JSON.parse(localStorage.getItem('contact_messages')) || [];

    document.getElementById('dashboardStats').innerHTML = `
        <div class="stat-card">
            <div class="stat-icon"><i class="bi bi-grid-3x3-gap-fill"></i></div>
            <div class="stat-value">${services.length}</div>
            <div class="stat-label">Total Services</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon"><i class="bi bi-people-fill"></i></div>
            <div class="stat-value">${staff.length}</div>
            <div class="stat-label">Staff Members</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon"><i class="bi bi-calendar-check-fill"></i></div>
            <div class="stat-value">${bookings.length}</div>
            <div class="stat-label">Total Bookings</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon"><i class="bi bi-envelope-fill"></i></div>
            <div class="stat-value">${messages.length}</div>
            <div class="stat-label">Messages</div>
        </div>
    `;
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

// ========== WHAT'S INCLUDED — MANUAL ENTRY ==========

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

    const idx = container.querySelectorAll('.included-manual-row').length + 1;

    row.innerHTML = `
        <i class="bi bi-check2-circle item-num-icon"></i>
        <input type="text" class="form-control included-text-input" placeholder="e.g. Window Cleaning (item ${idx})" maxlength="60" value="${escapeHtml(value)}">
        <button type="button" class="included-remove-btn" onclick="removeIncludedField(this, '${containerId}', '${btnId}')" title="Remove">
            <i class="bi bi-x-lg"></i>
        </button>
    `;
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

// ========== IMAGE UPLOAD MODAL ==========
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

    const modal = new bootstrap.Modal(document.getElementById('imageUploadModal'));
    modal.show();
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
        const container = document.getElementById('imagePreviewContainer');
        container.style.display = 'flex';
        container.style.alignItems = 'center';

    } else if (currentImageTarget === 'staff') {
        pendingStaffImage = modalImageBase64;
        document.getElementById('staffImageTrigger').classList.add('has-image');
        document.getElementById('staffImageLabel').textContent = '✓ Photo Selected';
        document.getElementById('staffImagePreview').src = pendingStaffImage;
        const container = document.getElementById('staffImagePreviewContainer');
        container.style.display = 'flex';
        container.style.alignItems = 'center';

    } else if (currentImageTarget === 'editService') {
        pendingEditServiceImage = modalImageBase64;
        document.getElementById('editServiceImageTrigger').classList.add('has-image');
        document.getElementById('editImageUploadLabel').textContent = '✓ Image Changed';
        document.getElementById('editImagePreview').src = pendingEditServiceImage;
        const container = document.getElementById('editImagePreviewContainer');
        container.style.display = 'flex';
        container.style.alignItems = 'center';

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
    const btn = document.getElementById('serviceImageTrigger');
    if (btn) btn.classList.remove('has-image');
    document.getElementById('imageUploadLabel').textContent = 'Upload Image';
    const container = document.getElementById('imagePreviewContainer');
    if (container) container.style.display = 'none';
    document.getElementById('imagePreview').src = '';
}

function clearStaffImage() {
    pendingStaffImage = null;
    const btn = document.getElementById('staffImageTrigger');
    if (btn) btn.classList.remove('has-image');
    document.getElementById('staffImageLabel').textContent = 'Upload Photo';
    const container = document.getElementById('staffImagePreviewContainer');
    if (container) container.style.display = 'none';
    document.getElementById('staffImagePreview').src = '';
}

function clearEditServiceImage() {
    pendingEditServiceImage = null;
    const btn = document.getElementById('editServiceImageTrigger');
    if (btn) btn.classList.remove('has-image');
    document.getElementById('editImageUploadLabel').textContent = 'Change Image';
    const container = document.getElementById('editImagePreviewContainer');
    if (container) container.style.display = 'none';
    document.getElementById('editImagePreview').src = '';
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

            const locClass = {
                Unguja: 'location-unguja',
                Pemba: 'location-pemba',
                Both: 'location-both'
            }[service.location] || 'location-both';

            const locIcon = { Unguja: '🏝', Pemba: '🌿', Both: '🗺' }[service.location] || '📍';

            html += `
                <tr>
                    <td>${imgHtml}</td>
                    <td>
                        <strong>${escapeHtml(service.name)}</strong>
                        ${service.description ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${escapeHtml(service.description.substring(0, 60))}${service.description.length > 60 ? '…' : ''}</div>` : ''}
                        ${service.included && service.included.length > 0 ? `<div class="included-tags mt-1">${service.included.slice(0,3).map(it => `<span class="included-tag">${escapeHtml(it)}</span>`).join('')}${service.included.length > 3 ? `<span class="included-tag">+${service.included.length - 3} more</span>` : ''}</div>` : ''}
                    </td>
                    <td><strong style="color:var(--primary)">${formatTZS(service.price)}</strong></td>
                    <td>${escapeHtml(service.duration)}</td>
                    <td>
                        <span class="location-badge ${locClass}">${locIcon} ${escapeHtml(service.location)}</span>
                    </td>
                    <td style="text-align:center; white-space:nowrap;">
                        <button class="action-btn action-btn-edit" onclick="openEditServiceModal(${index})" title="Edit Service">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button class="action-btn action-btn-delete" onclick="deleteService(${index})" title="Delete Service">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
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

    // Remove assignments for this service
    let assignments = JSON.parse(localStorage.getItem('serviceAssignments')) || {};
    delete assignments[serviceId];
    localStorage.setItem('serviceAssignments', JSON.stringify(assignments));

    loadServices();
    loadDashboardStats();
    showNotification('Service deleted.', 'success');
}

// ========== EDIT SERVICE MODAL ==========
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

    // Reset image controls
    const editBtn = document.getElementById('editServiceImageTrigger');
    editBtn.classList.remove('has-image');
    document.getElementById('editImageUploadLabel').textContent = 'Change Image';
    document.getElementById('editImagePreviewContainer').style.display = 'none';
    document.getElementById('editImagePreview').src = '';

    if (service.image) {
        document.getElementById('editImagePreview').src = service.image;
        document.getElementById('editImagePreviewContainer').style.display = 'flex';
        document.getElementById('editImagePreviewContainer').style.alignItems = 'center';
        editBtn.classList.add('has-image');
        document.getElementById('editImageUploadLabel').textContent = '✓ Image Set';
        pendingEditServiceImage = service.image;
    }

    // Populate manual included items
    initIncludedManualEntry('editIncludedManualEntry', 'editAddIncludedItemBtn', service.included || []);

    new bootstrap.Modal(document.getElementById('editServiceModal')).show();
}

function saveEditedService() {
    const index       = parseInt(document.getElementById('editServiceIndex').value);
    const name        = document.getElementById('editServiceName').value.trim();
    const price       = document.getElementById('editServicePrice').value.trim();
    const duration    = document.getElementById('editServiceDuration').value.trim();
    const location    = document.getElementById('editServiceLocation').value;
    const description = document.getElementById('editServiceDescription').value.trim();
    const included    = getIncludedItems('editIncludedManualEntry');

    if (!name || !price) {
        showNotification('Service name and price are required', 'error');
        return;
    }

    if (isNaN(price) || Number(price) < 0) {
        showNotification('Please enter a valid price in TZS', 'error');
        return;
    }

    let services = JSON.parse(localStorage.getItem('adminServices')) || [];
    if (!services[index]) return;

    services[index] = {
        ...services[index],
        name,
        price: Number(price),
        duration: duration || services[index].duration,
        location,
        description,
        included,
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
                pending:   ['bg-warning text-dark', 'Pending'],
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
                        <button class="action-btn action-btn-edit" onclick="updateBookingStatus(${b.id})" title="Update Status">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
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
    const name     = document.getElementById('staffName').value.trim();
    const email    = document.getElementById('staffEmail').value.trim();
    const phone    = document.getElementById('staffPhone').value.trim();
    const password = document.getElementById('staffPass').value;
    const photo    = pendingStaffImage || null;

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

    staff.push({ id: Date.now(), name, email, phone, password, photo, status: 'active' });
    localStorage.setItem('staffAccounts', JSON.stringify(staff));

    document.getElementById('staffName').value = '';
    document.getElementById('staffEmail').value = '';
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

            html += `
                <tr>
                    <td>${avatarHtml}</td>
                    <td><strong>${escapeHtml(member.name)}</strong></td>
                    <td>${escapeHtml(member.email)}</td>
                    <td>${escapeHtml(member.phone || '—')}</td>
                    <td><span class="badge bg-success">Active</span></td>
                    <td style="text-align:center; white-space:nowrap;">
                        <button class="action-btn action-btn-edit" onclick="openEditStaffModal(${index})" title="Edit Staff">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button class="action-btn action-btn-delete" onclick="deleteStaff(${index})" title="Remove Staff">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
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

    // Remove assignments for this staff
    let assignments = JSON.parse(localStorage.getItem('serviceAssignments')) || {};
    Object.keys(assignments).forEach(svcId => {
        if (assignments[svcId] == staffId) delete assignments[svcId];
    });
    localStorage.setItem('serviceAssignments', JSON.stringify(assignments));

    loadStaff();
    loadDashboardStats();
    showNotification('Staff member removed.', 'success');
}

// ========== EDIT STAFF MODAL ==========
function openEditStaffModal(index) {
    const staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    const member = staff[index];
    if (!member) return;

    pendingEditStaffImage = null;

    document.getElementById('editStaffIndex').value = index;
    document.getElementById('editStaffName').value = member.name || '';
    document.getElementById('editStaffEmail').value = member.email || '';
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
    const index    = parseInt(document.getElementById('editStaffIndex').value);
    const name     = document.getElementById('editStaffName').value.trim();
    const email    = document.getElementById('editStaffEmail').value.trim();
    const phone    = document.getElementById('editStaffPhone').value.trim();
    const newPass  = document.getElementById('editStaffPassword').value;

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

    let staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    if (!staff[index]) return;

    const emailExists = staff.some((s, i) => i !== index && s.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
        showNotification('This email is already used by another staff member', 'error');
        return;
    }

    staff[index].name  = name;
    staff[index].email = email;
    staff[index].phone = phone;
    if (newPass) staff[index].password = newPass;
    staff[index].photo = pendingEditStaffImage !== null ? pendingEditStaffImage : staff[index].photo;

    localStorage.setItem('staffAccounts', JSON.stringify(staff));
    bootstrap.Modal.getInstance(document.getElementById('editStaffModal')).hide();
    loadStaff();
    loadDashboardStats();
    showNotification(`Staff member "${name}" updated successfully!`, 'success');
}

// ============================================================
//  SERVICES ASSIGNMENT MODULE
// ============================================================

// Progress states: not_started(red), just_started(yellow), in_progress(blue), complete(green)
// Progress is determined by % of completed bookings for assigned services (demo: random/stored)

function getAssignmentData() {
    return JSON.parse(localStorage.getItem('serviceAssignments')) || {};
    // Format: { serviceId: staffId }
}

function saveAssignmentData(data) {
    localStorage.setItem('serviceAssignments', JSON.stringify(data));
}

function getStaffProgress(staffId) {
    // Returns: not_started | just_started | in_progress | complete
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
        not_started: { label: 'Not Started',          dotClass: 'legend-red',    badgeClass: 'progress-red',    icon: 'bi-circle' },
        just_started: { label: 'Just Started',         dotClass: 'legend-yellow', badgeClass: 'progress-yellow', icon: 'bi-circle-half' },
        in_progress:  { label: 'In Progress',          dotClass: 'legend-blue',   badgeClass: 'progress-blue',   icon: 'bi-arrow-repeat' },
        complete:     { label: 'Complete',              dotClass: 'legend-green',  badgeClass: 'progress-green',  icon: 'bi-check-circle-fill' }
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
    switchAssignTab('allStaff', document.querySelector('.assign-tab-btn[data-tab="allStaff"]'));
}

function switchAssignTab(tabName, btnEl) {
    // Deactivate all tabs
    document.querySelectorAll('.assign-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.assign-tab-content').forEach(c => c.classList.remove('active'));

    // Activate selected
    if (btnEl) btnEl.classList.add('active');
    const tabEl = document.getElementById(`tab-${tabName}`);
    if (tabEl) tabEl.classList.add('active');

    // Load content
    switch (tabName) {
        case 'allStaff':         renderAllStaffTab();         break;
        case 'assignedStaff':    renderAssignedStaffTab();    break;
        case 'unassignedStaff':  renderUnassignedStaffTab();  break;
        case 'assignedServices': renderAssignedServicesTab(); break;
        case 'unassignedServices': renderUnassignedServicesTab(); break;
    }
}

function renderAllStaffTab() {
    const staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    const assignments = getAssignmentData();
    let html = '';

    if (staff.length === 0) {
        html = `<tr><td colspan="6" class="text-center text-muted py-4" style="font-size:13px;">No staff members found</td></tr>`;
    } else {
        staff.forEach(member => {
            const count = countAssignedServicesForStaff(member.id);
            const isAssigned = count > 0;
            const progress = getStaffProgress(member.id);
            const cfg = getProgressConfig(progress);
            const avatarHtml = getStaffAvatarHtml(member);

            html += `
                <tr>
                    <td>${avatarHtml}</td>
                    <td><strong>${escapeHtml(member.name)}</strong></td>
                    <td style="color:var(--text-muted);font-size:13px;">${escapeHtml(member.email)}</td>
                    <td>
                        ${isAssigned
                            ? `<span class="assign-status-badge assigned"><i class="bi bi-check-circle-fill me-1"></i>Assigned</span>`
                            : `<span class="assign-status-badge not-assigned"><i class="bi bi-dash-circle me-1"></i>Not Assigned</span>`
                        }
                    </td>
                    <td>
                        ${isAssigned ? `
                            <div class="progress-indicator-row">
                                <span class="progress-dot ${cfg.dotClass}"></span>
                                <span class="progress-badge ${cfg.badgeClass}">${cfg.label}</span>
                                <button class="btn-progress-change" onclick="openProgressChangeMenu(${member.id}, this)" title="Change progress">
                                    <i class="bi bi-chevron-down"></i>
                                </button>
                            </div>
                        ` : `<span style="color:var(--text-muted);font-size:12px;">—</span>`}
                    </td>
                    <td style="text-align:center;">
                        ${isAssigned
                            ? `<span class="services-count-badge">${count} service${count !== 1 ? 's' : ''}</span>`
                            : `<span style="color:var(--text-muted);font-size:12px;">0</span>`
                        }
                    </td>
                </tr>`;
        });
    }

    document.getElementById('allStaffAssignList').innerHTML = html;
}

function renderAssignedStaffTab() {
    const staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    const assignments = getAssignmentData();
    const assignedStaff = staff.filter(m => countAssignedServicesForStaff(m.id) > 0);
    let html = '';

    if (assignedStaff.length === 0) {
        html = `<tr><td colspan="6" class="text-center text-muted py-4" style="font-size:13px;">No staff members have been assigned services yet</td></tr>`;
    } else {
        assignedStaff.forEach(member => {
            const count = countAssignedServicesForStaff(member.id);
            const progress = getStaffProgress(member.id);
            const cfg = getProgressConfig(progress);
            const avatarHtml = getStaffAvatarHtml(member);

            html += `
                <tr>
                    <td>${avatarHtml}</td>
                    <td><strong>${escapeHtml(member.name)}</strong></td>
                    <td style="color:var(--text-muted);font-size:13px;">${escapeHtml(member.email)}</td>
                    <td>
                        <div class="progress-indicator-row">
                            <span class="progress-dot ${cfg.dotClass}"></span>
                            <span class="progress-badge ${cfg.badgeClass}">${cfg.label}</span>
                            <button class="btn-progress-change" onclick="openProgressChangeMenu(${member.id}, this)" title="Change progress">
                                <i class="bi bi-chevron-down"></i>
                            </button>
                        </div>
                    </td>
                    <td style="text-align:center;">
                        <span class="services-count-badge">${count}</span>
                    </td>
                    <td style="text-align:center;">
                        <button class="action-btn action-btn-view" onclick="openViewStaffServices(${member.id})" title="View assigned services">
                            <i class="bi bi-eye-fill"></i>
                        </button>
                        <button class="action-btn action-btn-delete" onclick="unassignAllFromStaff(${member.id})" title="Remove all assignments">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
                    </td>
                </tr>`;
        });
    }

    document.getElementById('assignedStaffList').innerHTML = html;
}

function renderUnassignedStaffTab() {
    const staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    const unassignedStaff = staff.filter(m => countAssignedServicesForStaff(m.id) === 0);
    let html = '';

    if (unassignedStaff.length === 0) {
        html = `<tr><td colspan="5" class="text-center text-muted py-4" style="font-size:13px;">All staff members have been assigned services</td></tr>`;
    } else {
        unassignedStaff.forEach(member => {
            const avatarHtml = getStaffAvatarHtml(member);

            html += `
                <tr>
                    <td>${avatarHtml}</td>
                    <td><strong>${escapeHtml(member.name)}</strong></td>
                    <td style="color:var(--text-muted);font-size:13px;">${escapeHtml(member.email)}</td>
                    <td>${escapeHtml(member.phone || '—')}</td>
                    <td style="text-align:center;">
                        <button class="action-btn action-btn-edit" onclick="switchAssignTab('unassignedServices', document.querySelector('.assign-tab-btn[data-tab=unassignedServices]'))" title="Go assign a service">
                            <i class="bi bi-plus-circle-fill"></i>
                        </button>
                    </td>
                </tr>`;
        });
    }

    document.getElementById('unassignedStaffList').innerHTML = html;
}

function renderAssignedServicesTab() {
    const services = JSON.parse(localStorage.getItem('adminServices')) || [];
    const staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    const assignments = getAssignmentData();

    const assignedServices = services.filter(s => assignments[s.id]);
    let html = '';

    if (assignedServices.length === 0) {
        html = `<tr><td colspan="5" class="text-center text-muted py-4" style="font-size:13px;">No services have been assigned yet</td></tr>`;
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
                        <button class="action-btn action-btn-edit" onclick="openAssignServiceModal(${service.id})" title="Reassign">
                            <i class="bi bi-arrow-repeat"></i>
                        </button>
                        <button class="action-btn action-btn-delete" onclick="unassignService(${service.id})" title="Remove assignment">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
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
        html = `<tr><td colspan="5" class="text-center text-muted py-4" style="font-size:13px;">All services have been assigned to staff</td></tr>`;
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

// ========== ASSIGN SERVICE MODAL ==========
function openAssignServiceModal(serviceId) {
    currentAssignServiceId = serviceId;
    selectedAssignStaffId = null;

    const services = JSON.parse(localStorage.getItem('adminServices')) || [];
    const staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    const assignments = getAssignmentData();
    const service = services.find(s => s.id == serviceId);

    if (!service) return;

    // Show service info
    const imgHtml = service.image
        ? `<img src="${service.image}" alt="${escapeHtml(service.name)}" style="width:50px;height:40px;object-fit:cover;border-radius:8px;border:1px solid var(--border);margin-right:12px;">`
        : `<div style="width:50px;height:40px;background:#f7fafc;border-radius:8px;border:1px dashed #cbd5e1;display:inline-flex;align-items:center;justify-content:center;margin-right:12px;"><i class="bi bi-image" style="color:#a0aec0;"></i></div>`;

    document.getElementById('assignServiceInfo').innerHTML = `
        <div style="display:flex;align-items:center;padding:12px 14px;background:#f7fafc;border-radius:var(--radius-sm);border:1px solid var(--border);">
            ${imgHtml}
            <div>
                <strong style="font-size:14px;">${escapeHtml(service.name)}</strong>
                <div style="font-size:12px;color:var(--text-muted);">${formatTZS(service.price)} · ${escapeHtml(service.duration)}</div>
            </div>
        </div>`;

    // Sort staff: unassigned first, then by count asc
    const sortedStaff = [...staff].sort((a, b) => {
        const ca = countAssignedServicesForStaff(a.id);
        const cb = countAssignedServicesForStaff(b.id);
        return ca - cb;
    });

    const currentAssignedStaffId = assignments[serviceId];

    let pickerHtml = '';
    if (sortedStaff.length === 0) {
        pickerHtml = '<p class="text-muted text-center py-3" style="font-size:13px;">No staff members available</p>';
    } else {
        sortedStaff.forEach(member => {
            const count = countAssignedServicesForStaff(member.id);
            const initials = member.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
            const avatarHtml = member.photo
                ? `<img src="${member.photo}" alt="${escapeHtml(member.name)}" class="assign-picker-avatar">`
                : `<div class="assign-picker-initials">${escapeHtml(initials)}</div>`;

            const isCurrent = String(member.id) === String(currentAssignedStaffId);

            pickerHtml += `
                <div class="assign-staff-pick-item ${isCurrent ? 'current' : ''}" data-staffid="${member.id}" onclick="selectAssignStaff(this, ${member.id})">
                    ${avatarHtml}
                    <div class="assign-pick-info">
                        <strong>${escapeHtml(member.name)}</strong>
                        <span>${escapeHtml(member.email)}</span>
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

    // Refresh current active tab
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
    const avatarHtml = member?.photo
        ? `<img src="${member.photo}" alt="${escapeHtml(member?.name)}" class="staff-avatar-lg">`
        : `<div class="staff-initials-lg">${escapeHtml(initials)}</div>`;

    const progress = getStaffProgress(staffId);
    const cfg = getProgressConfig(progress);

    let body = `
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border);">
            <div class="staff-avatar-lg" style="width:60px;height:60px;">${member?.photo ? `<img src="${member.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : `<span style="color:white;font-weight:800;font-size:20px;">${initials}</span>`}</div>
            <div>
                <strong style="font-size:16px;">${escapeHtml(member?.name || 'Unknown')}</strong>
                <div style="font-size:12px;color:var(--text-muted);">${escapeHtml(member?.email || '')}</div>
                <div class="progress-indicator-row mt-1">
                    <span class="progress-dot ${cfg.dotClass}"></span>
                    <span class="progress-badge ${cfg.badgeClass}">${cfg.label}</span>
                </div>
            </div>
        </div>`;

    if (assignedServices.length === 0) {
        body += `<p class="text-muted text-center py-3" style="font-size:13px;">No services assigned</p>`;
    } else {
        body += `<div class="staff-services-grid">`;
        assignedServices.forEach(service => {
            const imgHtml = service.image
                ? `<img src="${service.image}" alt="${escapeHtml(service.name)}" style="width:100%;height:80px;object-fit:cover;border-radius:8px 8px 0 0;">`
                : `<div style="width:100%;height:80px;background:#f7fafc;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;"><i class="bi bi-image" style="font-size:24px;color:#a0aec0;"></i></div>`;

            body += `
                <div class="staff-service-card">
                    ${imgHtml}
                    <div style="padding:10px;">
                        <strong style="font-size:13px;">${escapeHtml(service.name)}</strong>
                        <div style="font-size:11px;color:var(--text-muted);">${formatTZS(service.price)} · ${escapeHtml(service.duration)}</div>
                    </div>
                </div>`;
        });
        body += `</div>`;
    }

    document.getElementById('viewStaffServicesBody').innerHTML = body;
    new bootstrap.Modal(document.getElementById('viewStaffServicesModal')).show();
}

// ========== PROGRESS DROPDOWN ==========
function openProgressChangeMenu(staffId, btn) {
    // Remove any existing dropdown
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
            <span class="progress-dot ${opt.dotClass}" style="margin-right:8px;"></span>
            ${escapeHtml(opt.label)}
        </div>`).join('');

    document.body.appendChild(dropdown);

    const rect = btn.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + window.scrollY + 4) + 'px';
    dropdown.style.left = (rect.left + window.scrollX) + 'px';

    setTimeout(() => {
        document.addEventListener('click', function closeDropdown(e) {
            if (!dropdown.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        });
    }, 0);
}

function changeStaffProgress(staffId, progress, dropdownEl) {
    setStaffProgress(staffId, progress);
    if (dropdownEl) dropdownEl.remove();

    const cfg = getProgressConfig(progress);
    showNotification(`Progress updated to "${cfg.label}"`, 'success');

    // Re-render current tab
    const activeTab = document.querySelector('.assign-tab-btn.active');
    if (activeTab) switchAssignTab(activeTab.dataset.tab, activeTab);
}

// ========== MESSAGES ==========
function loadMessages() {
    const messages = JSON.parse(localStorage.getItem('contact_messages')) || [];
    let html = '';

    if (messages.length === 0) {
        html = `<tr><td colspan="5" class="text-center text-muted py-4" style="font-size:13px;">No messages yet</td></tr>`;
    } else {
        [...messages].reverse().forEach((msg, index) => {
            const date = msg.timestamp ? new Date(msg.timestamp).toLocaleDateString('en-TZ', {
                day: '2-digit', month: 'short', year: 'numeric'
            }) : '—';

            const preview = (msg.message || '').substring(0, 80);

            html += `
                <tr>
                    <td>
                        <strong>${escapeHtml(msg.name || '—')}</strong>
                        <div style="font-size:11px;color:var(--text-muted);">${escapeHtml(msg.email || '')}</div>
                    </td>
                    <td>${escapeHtml(msg.subject || 'General Inquiry')}</td>
                    <td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        ${escapeHtml(preview)}${msg.message && msg.message.length > 80 ? '…' : ''}
                    </td>
                    <td style="white-space:nowrap;">${date}</td>
                    <td style="text-align:center;">
                        <button class="action-btn action-btn-view" onclick="viewMessage(${index})" title="View Message">
                            <i class="bi bi-eye-fill"></i>
                        </button>
                    </td>
                </tr>`;
        });
    }

    document.getElementById('messageList').innerHTML = html;
}

function viewMessage(index) {
    const messages = JSON.parse(localStorage.getItem('contact_messages')) || [];
    const msg = [...messages].reverse()[index];
    if (!msg) return;

    const date = msg.timestamp ? new Date(msg.timestamp).toLocaleString('en-TZ') : '—';

    document.getElementById('viewMessageBody').innerHTML = `
        <div class="message-detail-row">
            <span class="message-detail-label">From</span>
            <span class="message-detail-value"><strong>${escapeHtml(msg.name || '—')}</strong></span>
        </div>
        <div class="message-detail-row">
            <span class="message-detail-label">Email</span>
            <span class="message-detail-value"><a href="mailto:${escapeHtml(msg.email)}">${escapeHtml(msg.email || '—')}</a></span>
        </div>
        <div class="message-detail-row">
            <span class="message-detail-label">Subject</span>
            <span class="message-detail-value">${escapeHtml(msg.subject || 'General Inquiry')}</span>
        </div>
        <div class="message-detail-row">
            <span class="message-detail-label">Date</span>
            <span class="message-detail-value">${date}</span>
        </div>
        <div class="message-detail-row" style="flex-direction:column;">
            <span class="message-detail-label mb-2">Message</span>
            <div class="message-body-box">${escapeHtml(msg.message || '—')}</div>
        </div>`;

    new bootstrap.Modal(document.getElementById('viewMessageModal')).show();
}

// ========== CHARTS ==========
let bookingChart, revenueChart;

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
                    pointBackgroundColor: '#1a56db',
                    pointRadius: 5,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: 'bottom' } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } },
                    x: { grid: { display: false } }
                }
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
                    borderRadius: 6,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: 'bottom' } },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.04)' },
                        ticks: {
                            callback: val => 'TZS ' + (val / 1000).toFixed(0) + 'K'
                        }
                    },
                    x: { grid: { display: false } }
                }
            }
        });
    }
}

// ========== SETTINGS ==========
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('adminSettings')) || {
        emailNotifications: true,
        autoAssignStaff: false,
        bookingReminders: true
    };
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
    showNotification('Settings saved successfully!', 'success');
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
            if (section === 'logout') logoutAdmin();
            else if (section) showSection(section);
        });
    });
}

function logoutAdmin() {
    if (!confirm('Are you sure you want to logout?')) return;
    sessionStorage.clear();
    showNotification('Logged out successfully!', 'success');
    setTimeout(() => location.reload(), 1000);
}

// ========== EXPORT ==========
function exportData() {
    const data = {
        services: (JSON.parse(localStorage.getItem('adminServices')) || []).map(s => ({
            ...s, image: s.image ? '[base64 image omitted]' : null
        })),
        staff: (JSON.parse(localStorage.getItem('staffAccounts')) || []).map(s => ({
            ...s, password: '[hidden]', photo: s.photo ? '[base64 omitted]' : null
        })),
        bookings: JSON.parse(localStorage.getItem('customerBookings')) || [],
        messages: JSON.parse(localStorage.getItem('contact_messages')) || [],
        assignments: JSON.parse(localStorage.getItem('serviceAssignments')) || {},
        exportDate: new Date().toISOString(),
        currency: 'TZS'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `csms_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('Data exported successfully!', 'success');
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