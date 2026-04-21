// ============================================================
//  CSMS ADMIN PANEL — admin.js
//  All prices in TZS | Full updated version
// ============================================================

// ========== CREDENTIALS ==========
const ADMIN_CREDENTIALS = {
    email: "admin@csms.co.tz",
    password: "Admin@2024"
};

let generatedOTP = null;
let otpExpiry = null;
let pendingServiceImage = null;  // for Add Service form
let pendingStaffImage = null;    // for Add Staff form
let pendingEditServiceImage = null; // for Edit Service modal
let pendingEditStaffImage = null;   // for Edit Staff modal
let modalImageBase64 = null;     // temp while modal open
let currentImageTarget = null;   // which target the upload modal is for

// ========== WHAT'S INCLUDED OPTIONS ==========
const INCLUDED_OPTIONS = [
    { id: 'workstation',   icon: 'bi-pc-display',           label: 'Workstation Cleaning' },
    { id: 'conference',    icon: 'bi-people',               label: 'Conference Room Sanitization' },
    { id: 'kitchen',       icon: 'bi-cup-hot',              label: 'Kitchen/Break Room Cleaning' },
    { id: 'restroom',      icon: 'bi-water',                label: 'Restroom Deep Clean' },
    { id: 'windows',       icon: 'bi-border-all',           label: 'Window & Glass Cleaning' },
    { id: 'floors',        icon: 'bi-grid-1x2',             label: 'Floor Mopping & Vacuuming' },
    { id: 'dusting',       icon: 'bi-wind',                 label: 'Furniture Dusting' },
    { id: 'trash',         icon: 'bi-trash',                label: 'Trash Removal' },
    { id: 'disinfection',  icon: 'bi-shield-check',         label: 'Surface Disinfection' },
    { id: 'carpet',        icon: 'bi-square',               label: 'Carpet Shampooing' },
];
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
    renderIncludedChecklist('includedChecklist', 'includedCountBadge', []);
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

// ========== INCLUDED CHECKLIST ==========
function renderIncludedChecklist(containerId, badgeId, selectedIds) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    INCLUDED_OPTIONS.forEach(opt => {
        const isSelected = selectedIds.includes(opt.id);
        const div = document.createElement('div');
        div.className = 'included-item' + (isSelected ? ' selected' : '');
        div.dataset.id = opt.id;
        div.innerHTML = `
            <i class="bi ${opt.icon} item-icon"></i>
            <i class="bi bi-check2 check-icon"></i>
            <span>${escapeHtml(opt.label)}</span>`;
        div.addEventListener('click', () => toggleIncludedItem(div, containerId, badgeId));
        container.appendChild(div);
    });

    updateIncludedBadge(containerId, badgeId);
    enforceIncludedLimit(containerId);
}

function toggleIncludedItem(div, containerId, badgeId) {
    const container = document.getElementById(containerId);
    const selected = container.querySelectorAll('.included-item.selected');

    if (div.classList.contains('selected')) {
        div.classList.remove('selected');
    } else {
        if (selected.length >= MAX_INCLUDED) {
            showNotification(`You can select a maximum of ${MAX_INCLUDED} items`, 'warning');
            return;
        }
        div.classList.add('selected');
    }

    updateIncludedBadge(containerId, badgeId);
    enforceIncludedLimit(containerId);
}

function updateIncludedBadge(containerId, badgeId) {
    const container = document.getElementById(containerId);
    const badge = document.getElementById(badgeId);
    if (!container || !badge) return;
    const count = container.querySelectorAll('.included-item.selected').length;
    badge.textContent = `${count} / ${MAX_INCLUDED} selected`;
    badge.style.color = count >= MAX_INCLUDED ? '#d97706' : 'var(--text-muted)';
}

function enforceIncludedLimit(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const items = container.querySelectorAll('.included-item');
    const selectedCount = container.querySelectorAll('.included-item.selected').length;

    items.forEach(item => {
        if (!item.classList.contains('selected') && selectedCount >= MAX_INCLUDED) {
            item.classList.add('disabled-item');
        } else {
            item.classList.remove('disabled-item');
        }
    });
}

function getSelectedIncluded(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    return Array.from(container.querySelectorAll('.included-item.selected')).map(el => el.dataset.id);
}

// ========== IMAGE UPLOAD MODAL ==========
// target: 'service' | 'staff' | 'editService' | 'editStaff'
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

    // Set modal title
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
        const btn = document.getElementById('serviceImageTrigger');
        btn.classList.add('has-image');
        document.getElementById('imageUploadLabel').textContent = '✓ Image Selected';
        document.getElementById('imagePreview').src = pendingServiceImage;
        const container = document.getElementById('imagePreviewContainer');
        container.style.display = 'flex';
        container.style.alignItems = 'center';

    } else if (currentImageTarget === 'staff') {
        pendingStaffImage = modalImageBase64;
        const btn = document.getElementById('staffImageTrigger');
        btn.classList.add('has-image');
        document.getElementById('staffImageLabel').textContent = '✓ Photo Selected';
        document.getElementById('staffImagePreview').src = pendingStaffImage;
        const container = document.getElementById('staffImagePreviewContainer');
        container.style.display = 'flex';
        container.style.alignItems = 'center';

    } else if (currentImageTarget === 'editService') {
        pendingEditServiceImage = modalImageBase64;
        const btn = document.getElementById('editServiceImageTrigger');
        btn.classList.add('has-image');
        document.getElementById('editImageUploadLabel').textContent = '✓ Image Changed';
        document.getElementById('editImagePreview').src = pendingEditServiceImage;
        const container = document.getElementById('editImagePreviewContainer');
        container.style.display = 'flex';
        container.style.alignItems = 'center';

    } else if (currentImageTarget === 'editStaff') {
        pendingEditStaffImage = modalImageBase64;
        // Update the big avatar preview in the edit staff modal
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
    const included    = getSelectedIncluded('includedChecklist');

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

    // Clear form
    document.getElementById('serviceName').value = '';
    document.getElementById('servicePrice').value = '';
    document.getElementById('serviceDuration').value = '';
    document.getElementById('serviceLocation').value = 'Unguja';
    document.getElementById('serviceDescription').value = '';
    clearServiceImage();
    renderIncludedChecklist('includedChecklist', 'includedCountBadge', []);

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
    services.splice(index, 1);
    localStorage.setItem('adminServices', JSON.stringify(services));
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

    // Show current image if exists
    if (service.image) {
        document.getElementById('editImagePreview').src = service.image;
        document.getElementById('editImagePreviewContainer').style.display = 'flex';
        document.getElementById('editImagePreviewContainer').style.alignItems = 'center';
        editBtn.classList.add('has-image');
        document.getElementById('editImageUploadLabel').textContent = '✓ Image Set';
        // Set as pending so it persists if unchanged
        pendingEditServiceImage = service.image;
    }

    // Render included checklist
    renderIncludedChecklist('editIncludedChecklist', 'editIncludedCountBadge', service.included || []);

    new bootstrap.Modal(document.getElementById('editServiceModal')).show();
}

function saveEditedService() {
    const index       = parseInt(document.getElementById('editServiceIndex').value);
    const name        = document.getElementById('editServiceName').value.trim();
    const price       = document.getElementById('editServicePrice').value.trim();
    const duration    = document.getElementById('editServiceDuration').value.trim();
    const location    = document.getElementById('editServiceLocation').value;
    const description = document.getElementById('editServiceDescription').value.trim();
    const included    = getSelectedIncluded('editIncludedChecklist');

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
    staff.splice(index, 1);
    localStorage.setItem('staffAccounts', JSON.stringify(staff));
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

    // Avatar preview
    const initials = member.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const photoEl = document.getElementById('editStaffPhotoPreview');
    const initialsEl = document.getElementById('editStaffInitials');

    if (member.photo) {
        photoEl.src = member.photo;
        photoEl.style.display = 'block';
        initialsEl.style.display = 'none';
        pendingEditStaffImage = member.photo; // keep existing by default
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

    // Check email uniqueness (excluding self)
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