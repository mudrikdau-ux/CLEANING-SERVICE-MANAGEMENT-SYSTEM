// ========== STAFF ACCOUNT DATA ==========
const staffAccount = {
    id: 1,
    email: "mudrikdau@gmail.com",
    password: "1234",
    name: "Mudrik Dau",
    role: "Senior Cleaning Specialist",
    phone: "+255 777 123 456",
    joinDate: "2024-01-15",
    avatar: "MD"
};

// ========== JOBS DATABASE ==========
let jobs = [
    { 
        id: 101, 
        service: "Premium Home Deep Cleaning", 
        location: "Stone Town, Unguja", 
        status: "pending",
        client: "Aly Hassan",
        scheduledDate: "2026-04-05",
        timeSlot: "09:00 - 12:00",
        duration: "3 hours",
        price: "$89"
    },
    { 
        id: 102, 
        service: "Office Carpet Steam Cleaning", 
        location: "Vikokotoni Business Hub", 
        status: "pending",
        client: "Zainab Mwinyi",
        scheduledDate: "2026-04-06",
        timeSlot: "14:00 - 17:00",
        duration: "3 hours",
        price: "$210"
    },
    { 
        id: 103, 
        service: "Kitchen Sanitization", 
        location: "Shangani District", 
        status: "in-progress",
        client: "Fatma Said",
        scheduledDate: "2026-03-25",
        timeSlot: "10:00 - 12:00",
        duration: "2 hours",
        price: "$75"
    },
    { 
        id: 104, 
        service: "AC Maintenance & Filter", 
        location: "Mbweni Residence", 
        status: "completed",
        client: "Omar Juma",
        scheduledDate: "2026-03-20",
        timeSlot: "13:00 - 15:00",
        duration: "2 hours",
        price: "$120",
        completedDate: "2026-03-20"
    },
    { 
        id: 105, 
        service: "Full Villa Cleaning", 
        location: "Fumba Town", 
        status: "completed",
        client: "Salma Khamis",
        scheduledDate: "2026-03-18",
        timeSlot: "08:00 - 12:00",
        duration: "4 hours",
        price: "$340",
        completedDate: "2026-03-18"
    }
];

// ========== GLOBAL VARIABLES ==========
let currentStaff = null;
let completedJobsCount = 0;

// ========== DOM ELEMENTS ==========
document.addEventListener('DOMContentLoaded', () => {
    // Initialize event listeners
    setupNavButtons();
    setupEnterKeyLogin();
});

// ========== LOGIN FUNCTIONS ==========
function loginStaff() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showNotification('Please enter both email and password', 'error');
        return;
    }
    
    if (email === staffAccount.email && password === staffAccount.password) {
        currentStaff = staffAccount;
        
        // Hide login, show dashboard
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        
        // Load all dashboard data
        loadStaffData();
        loadJobs();
        loadJobHistory();
        loadStats();
        loadProfile();
        
        showNotification(`Welcome back, ${currentStaff.name}!`, 'success');
        
        // Store login state
        sessionStorage.setItem('staffLoggedIn', 'true');
        sessionStorage.setItem('staffName', currentStaff.name);
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

function setupEnterKeyLogin() {
    const inputs = document.querySelectorAll('#loginSection input');
    inputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loginStaff();
            }
        });
    });
}

function logoutStaff() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.clear();
        showNotification('Logged out successfully!', 'success');
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
}

function showForgotPassword() {
    showNotification('Please contact your administrator to reset your password.', 'info');
}

function showDemoCredentials() {
    showNotification('Demo Credentials: Email: mudrikdau@gmail.com | Password: 1234', 'info');
}

// ========== LOAD FUNCTIONS ==========
function loadStaffData() {
    document.getElementById('staffName').textContent = currentStaff.name;
}

function loadJobs() {
    const pendingJobs = jobs.filter(job => job.status === 'pending' || job.status === 'in-progress');
    const container = document.getElementById('jobsContainer');
    
    if (pendingJobs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-check-circle-fill"></i>
                <h4>No Active Jobs</h4>
                <p>You have no pending or in-progress jobs at the moment.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    pendingJobs.forEach(job => {
        const statusClass = job.status === 'pending' ? 'status-pending' : 'status-in-progress';
        const statusText = job.status === 'pending' ? 'Pending' : 'In Progress';
        
        html += `
            <div class="job-card" data-id="${job.id}">
                <div class="job-header">
                    <div class="job-icon">
                        <i class="bi bi-brush-fill"></i>
                    </div>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <h4 class="job-title">${escapeHtml(job.service)}</h4>
                <div class="job-details">
                    <div class="job-detail-item">
                        <i class="bi bi-geo-alt-fill"></i>
                        <span>${escapeHtml(job.location)}</span>
                    </div>
                    <div class="job-detail-item">
                        <i class="bi bi-person-fill"></i>
                        <span>Client: ${escapeHtml(job.client)}</span>
                    </div>
                    <div class="job-detail-item">
                        <i class="bi bi-calendar3"></i>
                        <span>${job.scheduledDate} | ${job.timeSlot}</span>
                    </div>
                    <div class="job-detail-item">
                        <i class="bi bi-clock"></i>
                        <span>Duration: ${job.duration}</span>
                    </div>
                    <div class="job-detail-item">
                        <i class="bi bi-cash-stack"></i>
                        <span>${job.price}</span>
                    </div>
                </div>
                <div class="job-actions">
                    ${job.status === 'pending' ? 
                        `<button onclick="updateJobStatus(${job.id}, 'in-progress')" class="btn-action btn-start">
                            <i class="bi bi-play-fill"></i> Start Job
                        </button>` : 
                        `<button onclick="updateJobStatus(${job.id}, 'completed')" class="btn-action btn-complete">
                            <i class="bi bi-check-circle-fill"></i> Mark Complete
                        </button>`
                    }
                    <button onclick="viewJobDetails(${job.id})" class="btn-action btn-view">
                        <i class="bi bi-eye"></i> Details
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function loadJobHistory() {
    const completedJobs = jobs.filter(job => job.status === 'completed');
    const container = document.getElementById('historyContainer');
    
    if (completedJobs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-clock-history"></i>
                <h4>No Job History</h4>
                <p>Your completed jobs will appear here.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    completedJobs.forEach(job => {
        html += `
            <div class="job-card">
                <div class="job-header">
                    <div class="job-icon">
                        <i class="bi bi-check-circle-fill" style="color: #1e7b48;"></i>
                    </div>
                    <span class="status-badge status-completed">Completed</span>
                </div>
                <h4 class="job-title">${escapeHtml(job.service)}</h4>
                <div class="job-details">
                    <div class="job-detail-item">
                        <i class="bi bi-geo-alt-fill"></i>
                        <span>${escapeHtml(job.location)}</span>
                    </div>
                    <div class="job-detail-item">
                        <i class="bi bi-calendar-check"></i>
                        <span>Completed: ${job.completedDate}</span>
                    </div>
                    <div class="job-detail-item">
                        <i class="bi bi-cash-stack"></i>
                        <span>${job.price}</span>
                    </div>
                </div>
                <button onclick="viewJobDetails(${job.id})" class="btn-action btn-view" style="width: 100%;">
                    <i class="bi bi-eye"></i> View Details
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function loadStats() {
    const completedJobs = jobs.filter(job => job.status === 'completed');
    const pendingJobs = jobs.filter(job => job.status === 'pending');
    const inProgressJobs = jobs.filter(job => job.status === 'in-progress');
    
    const totalJobs = jobs.length;
    const totalCompleted = completedJobs.length;
    const totalEarnings = completedJobs.reduce((sum, job) => {
        const price = parseFloat(job.price.replace('$', ''));
        return sum + price;
    }, 0);
    
    const completionRate = totalJobs > 0 ? ((totalCompleted / totalJobs) * 100).toFixed(0) : 0;
    
    const container = document.getElementById('statsContainer');
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">
                <i class="bi bi-briefcase-fill"></i>
            </div>
            <div class="stat-value">${totalJobs}</div>
            <div class="stat-label">Total Jobs Assigned</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">
                <i class="bi bi-check-circle-fill"></i>
            </div>
            <div class="stat-value">${totalCompleted}</div>
            <div class="stat-label">Jobs Completed</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">
                <i class="bi bi-play-fill"></i>
            </div>
            <div class="stat-value">${inProgressJobs.length}</div>
            <div class="stat-label">In Progress</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">
                <i class="bi bi-hourglass-split"></i>
            </div>
            <div class="stat-value">${pendingJobs.length}</div>
            <div class="stat-label">Pending Jobs</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">
                <i class="bi bi-cash-stack"></i>
            </div>
            <div class="stat-value">$${totalEarnings}</div>
            <div class="stat-label">Total Earnings</div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">
                <i class="bi bi-graph-up"></i>
            </div>
            <div class="stat-value">${completionRate}%</div>
            <div class="stat-label">Completion Rate</div>
        </div>
    `;
}

function loadProfile() {
    const container = document.getElementById('profileContainer');
    container.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar">
                <i class="bi bi-person-fill"></i>
            </div>
            <h3>${currentStaff.name}</h3>
            <p>${currentStaff.role}</p>
        </div>
        <div class="profile-info">
            <div class="info-row">
                <span class="info-label"><i class="bi bi-envelope"></i> Email</span>
                <span class="info-value">${currentStaff.email}</span>
            </div>
            <div class="info-row">
                <span class="info-label"><i class="bi bi-phone"></i> Phone</span>
                <span class="info-value">${currentStaff.phone}</span>
            </div>
            <div class="info-row">
                <span class="info-label"><i class="bi bi-calendar-plus"></i> Joined</span>
                <span class="info-value">${currentStaff.joinDate}</span>
            </div>
            <div class="info-row">
                <span class="info-label"><i class="bi bi-trophy"></i> Rating</span>
                <span class="info-value">⭐ 4.8 (24 reviews)</span>
            </div>
        </div>
        <div class="text-center mt-4">
            <button class="btn-action btn-start" onclick="editProfile()">
                <i class="bi bi-pencil"></i> Edit Profile
            </button>
        </div>
    `;
}

// ========== JOB MANAGEMENT ==========
function updateJobStatus(jobId, newStatus) {
    const jobIndex = jobs.findIndex(j => j.id === jobId);
    if (jobIndex !== -1) {
        const oldStatus = jobs[jobIndex].status;
        jobs[jobIndex].status = newStatus;
        
        if (newStatus === 'completed') {
            jobs[jobIndex].completedDate = new Date().toISOString().split('T')[0];
            showNotification(`Job completed successfully!`, 'success');
        } else if (newStatus === 'in-progress') {
            showNotification(`Job started! Good luck!`, 'success');
        }
        
        // Refresh all views
        loadJobs();
        loadJobHistory();
        loadStats();
    }
}

function viewJobDetails(jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
        const details = `
            Job: ${job.service}
            Client: ${job.client}
            Location: ${job.location}
            Date: ${job.scheduledDate}
            Time: ${job.timeSlot}
            Duration: ${job.duration}
            Price: ${job.price}
            Status: ${job.status.toUpperCase()}
            ${job.completedDate ? `Completed: ${job.completedDate}` : ''}
        `;
        alert(details);
        showNotification(`Viewing details for ${job.service}`, 'info');
    }
}

function editProfile() {
    showNotification('Profile editing feature coming soon!', 'info');
}

// ========== NAVIGATION ==========
function setupNavButtons() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const views = ['jobs', 'history', 'stats', 'profile'];
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            
            // Update active button
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show corresponding view
            views.forEach(v => {
                const viewElement = document.getElementById(`${v}View`);
                if (viewElement) {
                    viewElement.classList.remove('active');
                }
            });
            
            const activeView = document.getElementById(`${view}View`);
            if (activeView) {
                activeView.classList.add('active');
            }
        });
    });
}

// ========== HELPER FUNCTIONS ==========
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
    } else if (type === 'warning') {
        icon = 'bi-exclamation-triangle-fill';
        borderColor = '#ffc107';
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

// Add shake animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);