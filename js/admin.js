// ========== ADMIN CREDENTIALS ==========
const ADMIN_CREDENTIALS = {
    email: "admin@csms.co.tz",
    password: "Admin@2024"
};

let generatedOTP = null;
let otpExpiry = null;

// ========== OTP GENERATION ==========
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendOTP(email) {
    generatedOTP = generateOTP();
    otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
    
    // Simulate sending OTP via email
    console.log(`OTP for ${email}: ${generatedOTP}`);
    
    showNotification(`OTP sent to ${email} (Demo: ${generatedOTP})`, 'success');
    return true;
}

// ========== LOGIN FUNCTIONS ==========
function verifyCredentials() {
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;
    
    if (!email || !password) {
        showNotification('Please enter both email and password', 'error');
        return;
    }
    
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        // Send OTP
        if (sendOTP(email)) {
            // Switch to OTP step
            document.querySelector('.step-1').classList.remove('active');
            document.querySelector('.step-2').classList.add('active');
            showNotification('OTP sent to your email', 'success');
        }
    } else {
        showNotification('Invalid email or password!', 'error');
        // Shake animation
        const loginCard = document.querySelector('.login-card');
        loginCard.style.animation = 'shake 0.5s';
        setTimeout(() => {
            loginCard.style.animation = '';
        }, 500);
    }
}

function verifyOTP() {
    const otp1 = document.getElementById('otp1').value;
    const otp2 = document.getElementById('otp2').value;
    const otp3 = document.getElementById('otp3').value;
    const otp4 = document.getElementById('otp4').value;
    const otp5 = document.getElementById('otp5').value;
    const otp6 = document.getElementById('otp6').value;
    
    const enteredOTP = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;
    
    if (!enteredOTP || enteredOTP.length !== 6) {
        showNotification('Please enter the 6-digit OTP', 'error');
        return;
    }
    
    if (Date.now() > otpExpiry) {
        showNotification('OTP has expired. Please request a new one.', 'error');
        return;
    }
    
    if (enteredOTP === generatedOTP) {
        // Login successful
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        
        // Initialize dashboard
        initDashboard();
        
        showNotification('Login successful! Welcome to Admin Panel', 'success');
        
        // Store session
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminEmail', ADMIN_CREDENTIALS.email);
    } else {
        showNotification('Invalid OTP. Please try again.', 'error');
    }
}

function resendOTP() {
    const email = ADMIN_CREDENTIALS.email;
    if (sendOTP(email)) {
        showNotification('New OTP sent successfully!', 'success');
        // Clear OTP inputs
        for (let i = 1; i <= 6; i++) {
            document.getElementById(`otp${i}`).value = '';
        }
        document.getElementById('otp1').focus();
    }
}

function backToLogin() {
    document.querySelector('.step-2').classList.remove('active');
    document.querySelector('.step-1').classList.add('active');
    document.getElementById('adminPassword').value = '';
    // Clear OTP inputs
    for (let i = 1; i <= 6; i++) {
        document.getElementById(`otp${i}`).value = '';
    }
}

function moveToNext(current, nextId) {
    if (current.value.length === 1) {
        const next = document.getElementById(nextId);
        if (next) next.focus();
    }
}

function validateOTP() {
    const otp6 = document.getElementById('otp6');
    if (otp6.value.length === 1) {
        verifyOTP();
    }
}

function showDemoCredentials() {
    showNotification('Demo Credentials: Email: admin@csms.co.tz | Password: Admin@2024', 'info');
}

// ========== DASHBOARD INITIALIZATION ==========
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
}

function loadDashboardStats() {
    const services = JSON.parse(localStorage.getItem('adminServices')) || [];
    const staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    const bookings = JSON.parse(localStorage.getItem('customerBookings')) || [];
    const messages = JSON.parse(localStorage.getItem('contact_messages')) || [];
    
    const statsHtml = `
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
            <div class="stat-label">New Messages</div>
        </div>
    `;
    
    document.getElementById('dashboardStats').innerHTML = statsHtml;
}

function loadRecentBookings() {
    const bookings = JSON.parse(localStorage.getItem('customerBookings')) || [];
    const recent = bookings.slice(-5).reverse();
    
    let html = '';
    recent.forEach(booking => {
        html += `
            <div class="recent-booking-item" style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                <strong>${booking.service || 'Service'}</strong>
                <p class="mb-0 text-muted small">${booking.date || 'Date TBD'} - ${booking.customer || 'Customer'}</p>
            </div>
        `;
    });
    
    if (recent.length === 0) {
        html = '<p class="text-muted text-center">No recent bookings</p>';
    }
    
    document.getElementById('recentBookingsList').innerHTML = html;
}

// ========== SERVICES MANAGEMENT ==========
function addService() {
    const name = document.getElementById('serviceName').value.trim();
    const price = document.getElementById('servicePrice').value;
    const duration = document.getElementById('serviceDuration').value.trim();
    
    if (!name || !price) {
        showNotification('Please enter service name and price', 'error');
        return;
    }
    
    let services = JSON.parse(localStorage.getItem('adminServices')) || [];
    services.push({ id: Date.now(), name, price: `$${price}`, duration: duration || '2 hours' });
    localStorage.setItem('adminServices', JSON.stringify(services));
    
    document.getElementById('serviceName').value = '';
    document.getElementById('servicePrice').value = '';
    document.getElementById('serviceDuration').value = '';
    
    loadServices();
    loadDashboardStats();
    showNotification('Service added successfully!', 'success');
}

function loadServices() {
    let services = JSON.parse(localStorage.getItem('adminServices')) || [];
    let html = '';
    
    services.forEach((service, index) => {
        html += `
            <tr>
                <td>${escapeHtml(service.name)}</td>
                <td>${service.price}</td>
                <td>${service.duration}</td>
                <td>
                    <button onclick="deleteService(${index})" class="btn btn-sm btn-danger">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    document.getElementById('serviceList').innerHTML = html;
}

function deleteService(index) {
    let services = JSON.parse(localStorage.getItem('adminServices')) || [];
    services.splice(index, 1);
    localStorage.setItem('adminServices', JSON.stringify(services));
    loadServices();
    loadDashboardStats();
    showNotification('Service deleted successfully!', 'success');
}

// ========== BOOKINGS MANAGEMENT ==========
function loadBookings() {
    let bookings = JSON.parse(localStorage.getItem('customerBookings')) || [];
    let html = '';
    
    bookings.forEach(booking => {
        const statusColors = {
            pending: 'warning',
            confirmed: 'success',
            completed: 'info',
            cancelled: 'danger'
        };
        const statusColor = statusColors[booking.status] || 'secondary';
        
        html += `
            <tr>
                <td>#${booking.id || 'N/A'}</td>
                <td>${escapeHtml(booking.customer || 'N/A')}</td>
                <td>${escapeHtml(booking.service || 'N/A')}</td>
                <td>${booking.date || 'TBD'}</td>
                <td><span class="badge bg-${statusColor}">${booking.status || 'pending'}</span></td>
                <td>
                    <button onclick="updateBookingStatus(${booking.id})" class="btn btn-sm btn-primary">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    document.getElementById('bookingList').innerHTML = html;
}

function updateBookingStatus(id) {
    showNotification('Booking status update feature coming soon', 'info');
}

// ========== STAFF MANAGEMENT ==========
function addStaff() {
    const name = document.getElementById('staffName').value.trim();
    const email = document.getElementById('staffEmail').value.trim();
    const password = document.getElementById('staffPass').value;
    
    if (!name || !email || !password) {
        showNotification('Please fill all staff details', 'error');
        return;
    }
    
    let staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    staff.push({ id: Date.now(), name, email, password, status: 'active' });
    localStorage.setItem('staffAccounts', JSON.stringify(staff));
    
    document.getElementById('staffName').value = '';
    document.getElementById('staffEmail').value = '';
    document.getElementById('staffPass').value = '';
    
    loadStaff();
    loadDashboardStats();
    showNotification('Staff member added successfully!', 'success');
}

function loadStaff() {
    let staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    let html = '';
    
    staff.forEach((member, index) => {
        html += `
            <tr>
                <td>${escapeHtml(member.name)}</td>
                <td>${escapeHtml(member.email)}</td>
                <td><span class="badge bg-success">Active</span></td>
                <td>
                    <button onclick="deleteStaff(${index})" class="btn btn-sm btn-danger">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    document.getElementById('staffList').innerHTML = html;
}

function deleteStaff(index) {
    let staff = JSON.parse(localStorage.getItem('staffAccounts')) || [];
    staff.splice(index, 1);
    localStorage.setItem('staffAccounts', JSON.stringify(staff));
    loadStaff();
    loadDashboardStats();
    showNotification('Staff member removed successfully!', 'success');
}

// ========== MESSAGES MANAGEMENT ==========
function loadMessages() {
    let messages = JSON.parse(localStorage.getItem('contact_messages')) || [];
    let html = '';
    
    messages.reverse().forEach((msg, index) => {
        html += `
            <tr>
                <td>${escapeHtml(msg.name)}<br><small class="text-muted">${escapeHtml(msg.email)}</small></td>
                <td>${escapeHtml(msg.subject || 'General Inquiry')}</td>
                <td>${escapeHtml(msg.message.substring(0, 100))}${msg.message.length > 100 ? '...' : ''}</td>
                <td>${new Date(msg.timestamp).toLocaleDateString()}</td>
                <td>
                    <button onclick="viewMessage(${index})" class="btn btn-sm btn-info">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    document.getElementById('messageList').innerHTML = html;
}

function viewMessage(index) {
    let messages = JSON.parse(localStorage.getItem('contact_messages')) || [];
    const msg = messages.reverse()[index];
    alert(`From: ${msg.name}\nEmail: ${msg.email}\n\nMessage:\n${msg.message}`);
}

// ========== CHARTS ==========
let bookingChart, revenueChart;

function initCharts() {
    const ctx1 = document.getElementById('bookingChart')?.getContext('2d');
    const ctx2 = document.getElementById('revenueChart')?.getContext('2d');
    
    if (ctx1) {
        bookingChart = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Bookings',
                    data: [12, 19, 15, 25, 22, 30],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }]
            },
            options: { responsive: true, maintainAspectRatio: true }
        });
    }
    
    if (ctx2) {
        revenueChart = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue ($)',
                    data: [1200, 1900, 1500, 2500, 2200, 3000],
                    backgroundColor: '#764ba2'
                }]
            },
            options: { responsive: true, maintainAspectRatio: true }
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
    const settings = {
        emailNotifications: document.getElementById('emailNotifications').checked,
        autoAssignStaff: document.getElementById('autoAssignStaff').checked,
        bookingReminders: document.getElementById('bookingReminders').checked
    };
    
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    showNotification('Settings saved successfully!', 'success');
}

// ========== UTILITY FUNCTIONS ==========
function showSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(`${sectionId}Section`).classList.add('active');
    
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === sectionId) {
            item.classList.add('active');
        }
    });
}

function setupMenuClickHandlers() {
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            if (section === 'logout') {
                logoutAdmin();
            } else if (section) {
                showSection(section);
            }
        });
    });
}

function logoutAdmin() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.clear();
        showNotification('Logged out successfully!', 'success');
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
}

function exportData() {
    const data = {
        services: JSON.parse(localStorage.getItem('adminServices')) || [],
        staff: JSON.parse(localStorage.getItem('staffAccounts')) || [],
        bookings: JSON.parse(localStorage.getItem('customerBookings')) || [],
        messages: JSON.parse(localStorage.getItem('contact_messages')) || [],
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `csms_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!', 'success');
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
            <i class="bi ${icon}" style="color: ${borderColor}; font-size: 18px;"></i>
            <span class="flex-grow-1">${escapeHtml(message)}</span>
            <button class="btn-close btn-sm" onclick="this.closest('.toast-notification').remove()"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        if (toast && toast.remove) toast.remove();
    }, 3000);
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

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);