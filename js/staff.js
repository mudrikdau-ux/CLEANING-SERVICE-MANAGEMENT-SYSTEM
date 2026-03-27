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
        price: 230000  // TZS
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
        price: 525000  // TZS
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
        price: 187500  // TZS
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
        price: 300000,  // TZS
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
        price: 850000,  // TZS
        completedDate: "2026-03-18"
    }
];

// ========== GLOBAL VARIABLES ==========
let currentStaff = null;
let completedJobsCount = 0;

// ========== CASH PAYMENT MODULE VARIABLES ==========
let paymentValidations = [];

// ========== DOM ELEMENTS ==========
document.addEventListener('DOMContentLoaded', () => {
    // Initialize event listeners
    setupNavButtons();
    setupEnterKeyLogin();
    
    // Check if already logged in
    if (sessionStorage.getItem('staffLoggedIn') === 'true') {
        const savedName = sessionStorage.getItem('staffName');
        if (savedName) {
            currentStaff = staffAccount;
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
            loadStaffData();
            loadJobs();
            loadJobHistory();
            loadStats();
            loadProfile();
            initPaymentModule();
        }
    }
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
        
        // Initialize payment module
        initPaymentModule();
        
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
                        <span>TZS ${formatNumber(job.price)}</span>
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
                        <span>TZS ${formatNumber(job.price)}</span>
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
    const totalEarnings = completedJobs.reduce((sum, job) => sum + job.price, 0);
    
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
            <div class="stat-value">TZS ${formatNumber(totalEarnings)}</div>
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
            showNotification(`Job completed successfully! You can now process payment.`, 'success');
        } else if (newStatus === 'in-progress') {
            showNotification(`Job started! Good luck!`, 'success');
        }
        
        // Refresh all views
        loadJobs();
        loadJobHistory();
        loadStats();
        
        // Refresh payment module
        loadCompletedJobsForPayment();
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
            Price: TZS ${formatNumber(job.price)}
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
    const views = ['jobs', 'history', 'stats', 'profile', 'payment'];
    
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
                
                // Refresh payment module data if payment view is opened
                if (view === 'payment') {
                    loadCompletedJobsForPayment();
                    loadRecentPayments();
                }
            }
        });
    });
}

// ========== CASH PAYMENT MODULE FUNCTIONS ==========

// Load payment validations from localStorage
function loadPaymentValidations() {
    const stored = localStorage.getItem('csms_payments');
    if (stored) {
        paymentValidations = JSON.parse(stored);
    } else {
        // Initialize with sample data (prices in TZS)
        paymentValidations = [
            {
                id: 1,
                jobId: 104,
                jobService: "AC Maintenance & Filter",
                customerName: "Omar Juma",
                amount: 300000,
                cashReceived: 300000,
                change: 0,
                paymentDate: "2026-03-20",
                paymentTime: "15:30",
                status: "completed",
                receiptNumber: "RCP-20260320-001"
            },
            {
                id: 2,
                jobId: 105,
                jobService: "Full Villa Cleaning",
                customerName: "Salma Khamis",
                amount: 850000,
                cashReceived: 850000,
                change: 0,
                paymentDate: "2026-03-18",
                paymentTime: "12:15",
                status: "completed",
                receiptNumber: "RCP-20260318-002"
            }
        ];
        savePaymentValidations();
    }
    updatePaymentStats();
    loadRecentPayments();
}

// Save payment validations to localStorage
function savePaymentValidations() {
    localStorage.setItem('csms_payments', JSON.stringify(paymentValidations));
}

// Update payment stats
function updatePaymentStats() {
    const totalPayments = paymentValidations.length;
    const totalAmount = paymentValidations.reduce((sum, p) => sum + p.amount, 0);
    const today = new Date().toISOString().split('T')[0];
    const todayPayments = paymentValidations.filter(p => p.paymentDate === today).length;
    const todayAmount = paymentValidations
        .filter(p => p.paymentDate === today)
        .reduce((sum, p) => sum + p.amount, 0);
    
    const statsHTML = `
        <div class="payment-stat-card">
            <div class="payment-stat-icon">
                <i class="bi bi-receipt"></i>
            </div>
            <div class="payment-stat-value">${totalPayments}</div>
            <div class="payment-stat-label">Total Validated Payments</div>
        </div>
        <div class="payment-stat-card">
            <div class="payment-stat-icon">
                <i class="bi bi-cash-stack"></i>
            </div>
            <div class="payment-stat-value">TZS ${formatNumber(totalAmount)}</div>
            <div class="payment-stat-label">Total Revenue</div>
        </div>
        <div class="payment-stat-card">
            <div class="payment-stat-icon">
                <i class="bi bi-calendar-today"></i>
            </div>
            <div class="payment-stat-value">${todayPayments}</div>
            <div class="payment-stat-label">Today's Payments</div>
        </div>
        <div class="payment-stat-card">
            <div class="payment-stat-icon">
                <i class="bi bi-graph-up"></i>
            </div>
            <div class="payment-stat-value">TZS ${formatNumber(todayAmount)}</div>
            <div class="payment-stat-label">Today's Revenue</div>
        </div>
    `;
    
    const statsContainer = document.getElementById('paymentStatsGrid');
    if (statsContainer) {
        statsContainer.innerHTML = statsHTML;
    }
}

// Load completed jobs into dropdown
function loadCompletedJobsForPayment() {
    const completedJobs = jobs.filter(job => job.status === 'completed');
    const jobSelect = document.getElementById('jobSelect');
    
    if (!jobSelect) return;
    
    // Filter out jobs that already have payment validation
    const pendingJobs = completedJobs.filter(job => {
        return !paymentValidations.some(p => p.jobId === job.id);
    });
    
    if (pendingJobs.length === 0) {
        jobSelect.innerHTML = '<option value="">-- No pending payments --</option>';
        return;
    }
    
    let options = '<option value="">-- Select a completed job --</option>';
    pendingJobs.forEach(job => {
        options += `<option value="${job.id}" data-service="${escapeHtml(job.service)}" data-client="${escapeHtml(job.client)}" data-price="${job.price}">
            ${job.service} - ${job.client} (TZS ${formatNumber(job.price)})
        </option>`;
    });
    
    jobSelect.innerHTML = options;
    
    // Add event listener for job selection
    jobSelect.onchange = function() {
        const selectedOption = this.options[this.selectedIndex];
        if (this.value) {
            const clientName = selectedOption.getAttribute('data-client');
            const price = selectedOption.getAttribute('data-price');
            
            document.getElementById('customerName').value = clientName;
            document.getElementById('serviceAmount').value = `TZS ${formatNumber(parseInt(price))}`;
            document.getElementById('cashReceived').value = '';
            document.getElementById('paymentNote').value = '';
            
            // Store selected job data
            window.selectedJobForPayment = {
                id: parseInt(this.value),
                service: selectedOption.getAttribute('data-service'),
                client: clientName,
                price: parseInt(price)
            };
        } else {
            document.getElementById('customerName').value = '';
            document.getElementById('serviceAmount').value = '';
            window.selectedJobForPayment = null;
        }
    };
}

// Validate cash payment
function validateCashPayment() {
    const jobSelect = document.getElementById('jobSelect');
    const cashReceived = parseFloat(document.getElementById('cashReceived').value);
    const paymentNote = document.getElementById('paymentNote').value;
    
    if (!jobSelect.value) {
        showNotification('Please select a job first', 'error');
        return;
    }
    
    if (!window.selectedJobForPayment) {
        showNotification('Invalid job selection', 'error');
        return;
    }
    
    if (isNaN(cashReceived) || cashReceived <= 0) {
        showNotification('Please enter a valid cash amount', 'error');
        return;
    }
    
    const serviceAmount = window.selectedJobForPayment.price;
    
    if (cashReceived < serviceAmount) {
        showNotification(`Insufficient payment! Service amount is TZS ${formatNumber(serviceAmount)}, received TZS ${formatNumber(cashReceived)}. Please collect the remaining TZS ${formatNumber(serviceAmount - cashReceived)}`, 'error');
        return;
    }
    
    const change = cashReceived - serviceAmount;
    
    // Create payment record
    const paymentRecord = {
        id: paymentValidations.length + 1,
        jobId: window.selectedJobForPayment.id,
        jobService: window.selectedJobForPayment.service,
        customerName: window.selectedJobForPayment.client,
        amount: serviceAmount,
        cashReceived: cashReceived,
        change: change,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentTime: new Date().toLocaleTimeString(),
        status: "completed",
        receiptNumber: generateReceiptNumber(),
        note: paymentNote
    };
    
    paymentValidations.push(paymentRecord);
    savePaymentValidations();
    
    // Generate and show receipt
    generateReceipt(paymentRecord);
    
    // Refresh payment stats and recent payments
    updatePaymentStats();
    loadRecentPayments();
    loadCompletedJobsForPayment();
    
    // Clear form
    document.getElementById('cashReceived').value = '';
    document.getElementById('paymentNote').value = '';
    document.getElementById('jobSelect').value = '';
    document.getElementById('customerName').value = '';
    document.getElementById('serviceAmount').value = '';
    window.selectedJobForPayment = null;
    
    showNotification(`Payment validated successfully! Receipt #${paymentRecord.receiptNumber}`, 'success');
}

// Generate receipt number
function generateReceiptNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RCP-${year}${month}${day}-${random}`;
}

// Generate receipt
function generateReceipt(payment) {
    const receiptContent = `
        <div style="text-align: center;">
            <h4 style="margin-bottom: 10px;">PAYMENT RECEIPT</h4>
            <p style="color: #718096; margin-bottom: 20px;">Thank you for choosing CSMS Cleaning Services</p>
        </div>
        
        <div class="receipt-details">
            <div class="receipt-row">
                <span class="receipt-label">Receipt Number:</span>
                <span class="receipt-value">${payment.receiptNumber}</span>
            </div>
            <div class="receipt-row">
                <span class="receipt-label">Date & Time:</span>
                <span class="receipt-value">${payment.paymentDate} | ${payment.paymentTime}</span>
            </div>
            <div class="receipt-row">
                <span class="receipt-label">Customer Name:</span>
                <span class="receipt-value">${escapeHtml(payment.customerName)}</span>
            </div>
            <div class="receipt-row">
                <span class="receipt-label">Service:</span>
                <span class="receipt-value">${escapeHtml(payment.jobService)}</span>
            </div>
            <div class="receipt-row">
                <span class="receipt-label">Service Amount:</span>
                <span class="receipt-value">TZS ${formatNumber(payment.amount)}</span>
            </div>
            <div class="receipt-row">
                <span class="receipt-label">Cash Received:</span>
                <span class="receipt-value">TZS ${formatNumber(payment.cashReceived)}</span>
            </div>
            ${payment.change > 0 ? `
            <div class="receipt-row">
                <span class="receipt-label">Change:</span>
                <span class="receipt-value">TZS ${formatNumber(payment.change)}</span>
            </div>
            ` : ''}
            <div class="receipt-total">
                <strong>PAID IN FULL</strong>
            </div>
            ${payment.note ? `
            <div class="receipt-row" style="margin-top: 15px;">
                <span class="receipt-label">Note:</span>
                <span class="receipt-value">${escapeHtml(payment.note)}</span>
            </div>
            ` : ''}
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px dashed #e2e8f0;">
            <p style="font-size: 12px; color: #a0aec0; margin: 0;">
                This is a computer-generated receipt and does not require a signature.<br>
                For any inquiries, please contact CSMS Customer Support.
            </p>
        </div>
    `;
    
    document.getElementById('receiptContent').innerHTML = receiptContent;
    document.getElementById('receiptModal').style.display = 'flex';
    
    // Store current receipt for printing
    window.currentReceipt = payment;
}

// Load recent payments
function loadRecentPayments() {
    const container = document.getElementById('recentPaymentsContainer');
    if (!container) return;
    
    const recentPayments = [...paymentValidations].reverse().slice(0, 10);
    
    if (recentPayments.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 40px;">
                <i class="bi bi-receipt"></i>
                <h4>No Payments Yet</h4>
                <p>Validated payments will appear here</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    recentPayments.forEach(payment => {
        html += `
            <div class="payment-item">
                <div class="payment-info">
                    <div class="payment-job">${escapeHtml(payment.jobService)}</div>
                    <div class="payment-details">
                        <span><i class="bi bi-person"></i> ${escapeHtml(payment.customerName)}</span>
                        <span><i class="bi bi-receipt"></i> ${payment.receiptNumber}</span>
                    </div>
                    <span class="payment-status">Validated</span>
                </div>
                <div class="payment-amount">
                    <div class="amount-value">TZS ${formatNumber(payment.amount)}</div>
                    <div class="payment-date">${payment.paymentDate}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Close receipt modal
function closeReceiptModal() {
    document.getElementById('receiptModal').style.display = 'none';
}

// Print receipt
function printReceipt() {
    const receiptContent = document.getElementById('receiptContent').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>CSMS Payment Receipt</title>
            <style>
                body {
                    font-family: 'Inter', sans-serif;
                    padding: 40px;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .receipt-content {
                    border: 1px solid #e2e8f0;
                    padding: 30px;
                    border-radius: 12px;
                }
                @media print {
                    body {
                        padding: 0;
                    }
                    .no-print {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="receipt-content">
                ${receiptContent}
            </div>
            <div class="no-print" style="text-align: center; margin-top: 20px;">
                <button onclick="window.print()" style="padding: 10px 20px; margin: 0 10px;">Print</button>
                <button onclick="window.close()" style="padding: 10px 20px;">Close</button>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Initialize payment module
function initPaymentModule() {
    loadPaymentValidations();
    loadCompletedJobsForPayment();
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

function formatNumber(num) {
    if (num === undefined || num === null) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

// Export functions for global access
window.loginStaff = loginStaff;
window.logoutStaff = logoutStaff;
window.updateJobStatus = updateJobStatus;
window.viewJobDetails = viewJobDetails;
window.editProfile = editProfile;
window.showForgotPassword = showForgotPassword;
window.showDemoCredentials = showDemoCredentials;
window.validateCashPayment = validateCashPayment;
window.closeReceiptModal = closeReceiptModal;
window.printReceipt = printReceipt;
window.initPaymentModule = initPaymentModule;