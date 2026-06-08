// staff.js - Complete Staff Page System

// ========== STAFF ACCOUNT DATA ==========
const staffAccount = {
  id: 1,
  email: "mudrikdau@gmail.com",
  password: "1234",
  name: "Mudrik Dau",
  role: "Senior Cleaning Specialist",
  phone: "+255 777 123 456",
  joinDate: "2024-01-15",
  avatar: "MD",
  isSupervisor: true,
  isGeneralSupervisor: true,
  supervisorLocation: "Zanzibar University",
  assignedWorkers: [5, 6, 9]
};

// Additional supervisor accounts for demo
const supervisorAccounts = [
  { id: 2, email: "zssf.supervisor@CleanSpark.com", password: "1234", name: "Ali Hassan", role: "Site Supervisor", phone: "+255 777 111 222", joinDate: "2024-02-01", isSupervisor: true, isGeneralSupervisor: false, supervisorLocation: "ZSSF", assignedWorkers: [7] },
  { id: 3, email: "mall.supervisor@CleanSpark.com", password: "1234", name: "Fatma Omar", role: "Site Supervisor", phone: "+255 777 333 444", joinDate: "2024-02-15", isSupervisor: true, isGeneralSupervisor: true, supervisorLocation: "Michenzani Mall", assignedWorkers: [8, 10] },
  { id: 4, email: "uni.supervisor@CleanSpark.com", password: "1234", name: "Said Juma", role: "Site Supervisor", phone: "+255 777 555 666", joinDate: "2024-01-20", isSupervisor: true, isGeneralSupervisor: false, supervisorLocation: "Zanzibar University", assignedWorkers: [] }
];

// Staff worker accounts (non-supervisor)
const workerAccounts = [
  { id: 5, email: "john@CleanSpark.com", password: "1234", name: "John Mwinyi", role: "Cleaning Technician", phone: "+255 777 111 333", joinDate: "2024-03-01", isSupervisor: false, isGeneralSupervisor: false, supervisorLocation: "Zanzibar University", generalSupervisorId: 1 },
  { id: 6, email: "aisha@CleanSpark.com", password: "1234", name: "Aisha Abdallah", role: "Cleaning Technician", phone: "+255 777 222 444", joinDate: "2024-03-15", isSupervisor: false, isGeneralSupervisor: false, supervisorLocation: "Zanzibar University", generalSupervisorId: 1 },
  { id: 8, email: "sophia@CleanSpark.com", password: "1234", name: "Sophia Mohamed", role: "Cleaning Technician", phone: "+255 777 444 555", joinDate: "2024-04-01", isSupervisor: false, isGeneralSupervisor: false, supervisorLocation: "Michenzani Mall", generalSupervisorId: 3 },
  { id: 9, email: "hamza@CleanSpark.com", password: "1234", name: "Hamza Rashid", role: "Cleaning Assistant", phone: "+255 777 555 666", joinDate: "2024-04-15", isSupervisor: false, isGeneralSupervisor: false, supervisorLocation: "Zanzibar University", generalSupervisorId: 1 }
];

// All accounts combined for login lookup
const allAccounts = [staffAccount, ...supervisorAccounts, ...workerAccounts];

// ========== JOBS DATABASE ==========
let jobs = [
  { 
    id: 101, 
    service: "Premium Home Deep Cleaning", 
    location: "Stone Town, Unguja", 
    status: "pending",
    client: "Aly Hassan",
    assignedWorkerId: 5,
    generalSupervisorId: 1,
    scheduledDate: "2026-04-05",
    timeSlot: "09:00 - 12:00",
    duration: "3 hours",
    price: 230000,
    supervisorPhone: "+255 777 123 456",
    description: "Complete deep cleaning of a 3-bedroom house including kitchen, bathrooms, and living areas.",
    requirements: "Bring heavy-duty cleaning equipment and eco-friendly products"
  },
  { 
    id: 102, 
    service: "Office Carpet Steam Cleaning", 
    location: "Vikokotoni Business Hub", 
    status: "pending",
    client: "Zainab Mwinyi",
    assignedWorkerId: 6,
    generalSupervisorId: 1,
    scheduledDate: "2026-04-06",
    timeSlot: "14:00 - 17:00",
    duration: "3 hours",
    price: 525000,
    supervisorPhone: "+255 777 123 456",
    description: "Steam cleaning of 500 sqm office carpet area across 3 floors.",
    requirements: "Professional steam cleaner machine required"
  },
  { 
    id: 103, 
    service: "Kitchen Sanitization", 
    location: "Shangani District", 
    status: "in-progress",
    client: "Fatma Said",
    assignedWorkerId: 5,
    generalSupervisorId: 1,
    scheduledDate: "2026-03-25",
    timeSlot: "10:00 - 12:00",
    duration: "2 hours",
    price: 187500,
    supervisorPhone: "+255 777 123 456",
    description: "Complete kitchen sanitization including appliances, countertops, and storage areas.",
    requirements: "Food-grade sanitizers only"
  },
  { 
    id: 104, 
    service: "AC Maintenance & Filter", 
    location: "Mbweni Residence", 
    status: "completed",
    client: "Omar Juma",
    assignedWorkerId: 8,
    generalSupervisorId: 3,
    scheduledDate: "2026-03-20",
    timeSlot: "13:00 - 15:00",
    duration: "2 hours",
    price: 300000,
    completedDate: "2026-03-20",
    supervisorPhone: "+255 777 333 444",
    description: "Maintenance and filter replacement for 4 AC units.",
    requirements: "Bring replacement filters and cleaning solution"
  },
  { 
    id: 105, 
    service: "Full Villa Cleaning", 
    location: "Fumba Town", 
    status: "completed",
    client: "Salma Khamis",
    assignedWorkerId: 9,
    generalSupervisorId: 1,
    scheduledDate: "2026-03-18",
    timeSlot: "08:00 - 12:00",
    duration: "4 hours",
    price: 850000,
    completedDate: "2026-03-18",
    supervisorPhone: "+255 777 123 456",
    description: "Complete villa cleaning including 5 bedrooms, pool area, and garden maintenance.",
    requirements: "Team of 4 cleaners recommended"
  }
];

// ========== STAFF DATABASE FOR ATTENDANCE ==========
const staffMembers = [
  { id: 1, name: "Mudrik Dau", role: "Senior Cleaning Specialist", isSupervisor: true, isGeneralSupervisor: true, location: "Zanzibar University", basePayPerDay: 10000 },
  { id: 2, name: "Ali Hassan", role: "Site Supervisor", isSupervisor: true, isGeneralSupervisor: false, location: "ZSSF", basePayPerDay: 10000 },
  { id: 3, name: "Fatma Omar", role: "Site Supervisor", isSupervisor: true, isGeneralSupervisor: true, location: "Michenzani Mall", basePayPerDay: 10000 },
  { id: 4, name: "Said Juma", role: "Site Supervisor", isSupervisor: true, isGeneralSupervisor: false, location: "Zanzibar University", basePayPerDay: 10000 },
  { id: 5, name: "John Mwinyi", role: "Cleaning Technician", isSupervisor: false, isGeneralSupervisor: false, location: "Zanzibar University", basePayPerDay: 10000 },
  { id: 6, name: "Aisha Abdallah", role: "Cleaning Technician", isSupervisor: false, isGeneralSupervisor: false, location: "Zanzibar University", basePayPerDay: 10000 },
  { id: 7, name: "James Mrema", role: "Cleaning Technician", isSupervisor: false, isGeneralSupervisor: false, location: "ZSSF", basePayPerDay: 10000 },
  { id: 8, name: "Sophia Mohamed", role: "Cleaning Technician", isSupervisor: false, isGeneralSupervisor: false, location: "Michenzani Mall", basePayPerDay: 10000 },
  { id: 9, name: "Hamza Rashid", role: "Cleaning Assistant", isSupervisor: false, isGeneralSupervisor: false, location: "Zanzibar University", basePayPerDay: 10000 },
  { id: 10, name: "Zainabu Salim", role: "Cleaning Assistant", isSupervisor: false, isGeneralSupervisor: false, location: "Michenzani Mall", basePayPerDay: 10000 }
];

// ========== SUPERVISOR DATA STORAGE ==========
let attendanceRecords = [];
let weeklyReports = [];
let chatMessages = [];
let deletedMessagesForMe = [];
let currentEditingMessageId = null;
let currentActionMessageId = null;
let currentGeneratedReport = null;

// ========== GS DATA STORAGE ==========
let gsPaymentValidations = [];
let gsSelectedJobForPayment = null;
let gsChatMessages = [];
let gsDeletedMessagesForMe = [];
let gsCurrentEditingMessageId = null;
let gsWeeklyReports = [];
let gsCurrentGeneratedReport = null;

// ========== SETTINGS STORAGE ==========
function getSettings() {
  const stored = localStorage.getItem('CleanSpark_settings');
  if (stored) return JSON.parse(stored);
  return {
    notifications: true,
    darkMode: localStorage.getItem('theme') === 'dark',
    notificationSound: false,
    availabilityStatus: 'available',
    language: 'en'
  };
}

function saveSettings(settings) {
  localStorage.setItem('CleanSpark_settings', JSON.stringify(settings));
}

// Load supervisor data from localStorage
function loadSupervisorData() {
  const storedAttendance = localStorage.getItem('CleanSpark_attendance');
  if (storedAttendance) {
    attendanceRecords = JSON.parse(storedAttendance);
  } else {
    const today = new Date().toISOString().split('T')[0];
    attendanceRecords = staffMembers.map(staff => ({
      staffId: staff.id,
      staffName: staff.name,
      location: staff.location,
      date: today,
      present: true
    }));
    saveAttendanceRecords();
  }
  
  const storedReports = localStorage.getItem('CleanSpark_reports');
  if (storedReports) {
    weeklyReports = JSON.parse(storedReports);
  }
  
  const storedChat = localStorage.getItem('CleanSpark_chat');
  if (storedChat) {
    chatMessages = JSON.parse(storedChat);
  } else {
    chatMessages = [
      { id: 1, sender: "Admin", message: "Welcome to the communication portal. Reports sent here will be reviewed.", timestamp: new Date().toISOString(), type: "received", edited: false }
    ];
    saveChatMessages();
  }

  const storedDeletedForMe = localStorage.getItem('CleanSpark_deletedForMe');
  if (storedDeletedForMe) {
    deletedMessagesForMe = JSON.parse(storedDeletedForMe);
  }
}

function saveAttendanceRecords() {
  localStorage.setItem('CleanSpark_attendance', JSON.stringify(attendanceRecords));
}

function saveReports() {
  localStorage.setItem('CleanSpark_reports', JSON.stringify(weeklyReports));
}

function saveChatMessages() {
  localStorage.setItem('CleanSpark_chat', JSON.stringify(chatMessages));
}

function saveDeletedForMe() {
  localStorage.setItem('CleanSpark_deletedForMe', JSON.stringify(deletedMessagesForMe));
}

// ========== GLOBAL VARIABLES ==========
let currentStaff = null;
let completedJobsCount = 0;
let selectedJobForPayment = null;
let paymentValidations = [];

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded - initializing Staff Page');
  
  loadSupervisorData();
  setupEventListeners();
  setupSidebarNav();
  setupMobileMenu();
  updateCurrentDate();
  initThemeToggle();
  
  // Check if already logged in
  if (sessionStorage.getItem('staffLoggedIn') === 'true') {
    const savedEmail = sessionStorage.getItem('staffEmail');
    if (savedEmail) {
      const found = allAccounts.find(acc => acc.email === savedEmail);
      if (found) {
        currentStaff = found;
        showDashboard();
      }
    }
  }
});

function updateCurrentDate() {
  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}

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

// ========== MOBILE MENU ==========
function setupMobileMenu() {
  const menuToggle = document.getElementById('mobileMenuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const closeBtn = document.getElementById('sidebarCloseBtn');
  
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.add('open');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }
  
  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeSidebar);
  }
  
  document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        closeSidebar();
      }
    });
  });
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ========== SETUP EVENT LISTENERS ==========
function setupEventListeners() {
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      loginStaff();
    });
  }
  
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loginStaff();
    });
  }
  
  const forgotLink = document.getElementById('forgotPasswordLink');
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      showForgotPassword();
    });
  }
  
  const demoLink = document.getElementById('demoCredentialsLink');
  if (demoLink) {
    demoLink.addEventListener('click', (e) => {
      e.preventDefault();
      showDemoCredentials();
    });
  }
  
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  
  const themeToggleMobile = document.getElementById('themeToggleMobile');
  if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);
  
  const sidebarThemeToggle = document.querySelector('.sidebar-theme-toggle');
  if (sidebarThemeToggle) sidebarThemeToggle.addEventListener('click', toggleTheme);
  
  const logoutBtn = document.getElementById('sidebarLogoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', showLogoutConfirmation);
  
  const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
  if (cancelLogoutBtn) cancelLogoutBtn.addEventListener('click', hideLogoutConfirmation);
  
  const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
  if (confirmLogoutBtn) confirmLogoutBtn.addEventListener('click', performLogout);
  
  const closeJobDetailModal = document.getElementById('closeJobDetailModal');
  if (closeJobDetailModal) closeJobDetailModal.addEventListener('click', closeJobDetailModalFn);
  
  const closeJobDetailFooter = document.getElementById('closeJobDetailFooter');
  if (closeJobDetailFooter) closeJobDetailFooter.addEventListener('click', closeJobDetailModalFn);
  
  const jobDetailModal = document.getElementById('jobDetailModal');
  if (jobDetailModal) {
    jobDetailModal.addEventListener('click', function(e) {
      if (e.target === this) closeJobDetailModalFn();
    });
  }
  
  const closeStatsDetailModal = document.getElementById('closeStatsDetailModal');
  if (closeStatsDetailModal) closeStatsDetailModal.addEventListener('click', closeStatsDetailModalFn);
  
  const closeStatsDetailFooter = document.getElementById('closeStatsDetailFooter');
  if (closeStatsDetailFooter) closeStatsDetailFooter.addEventListener('click', closeStatsDetailModalFn);
  
  const statsDetailModal = document.getElementById('statsDetailModal');
  if (statsDetailModal) {
    statsDetailModal.addEventListener('click', function(e) {
      if (e.target === this) closeStatsDetailModalFn();
    });
  }
  
  const closePaymentStatsDetailModalBtn = document.getElementById('closePaymentStatsDetailModal');
  if (closePaymentStatsDetailModalBtn) closePaymentStatsDetailModalBtn.addEventListener('click', closePaymentStatsDetailModal);
  
  const closePaymentStatsDetailFooter = document.getElementById('closePaymentStatsDetailFooter');
  if (closePaymentStatsDetailFooter) closePaymentStatsDetailFooter.addEventListener('click', closePaymentStatsDetailModal);
  
  const paymentStatsDetailModal = document.getElementById('paymentStatsDetailModal');
  if (paymentStatsDetailModal) {
    paymentStatsDetailModal.addEventListener('click', function(e) {
      if (e.target === this) closePaymentStatsDetailModal();
    });
  }
  
  const logoutConfirmModal = document.getElementById('logoutConfirmModal');
  if (logoutConfirmModal) {
    logoutConfirmModal.addEventListener('click', function(e) {
      if (e.target === this) hideLogoutConfirmation();
    });
  }
  
  const closeActionModal = document.getElementById('closeActionModal');
  if (closeActionModal) closeActionModal.addEventListener('click', closeActionModalFn);
  
  const cancelActionBtn = document.getElementById('cancelActionBtn');
  if (cancelActionBtn) cancelActionBtn.addEventListener('click', closeActionModalFn);
  
  const submitActionBtn = document.getElementById('submitActionBtn');
  if (submitActionBtn) submitActionBtn.addEventListener('click', submitActionReport);
  
  const actionModal = document.getElementById('actionModal');
  if (actionModal) {
    actionModal.addEventListener('click', function(e) {
      if (e.target === this) closeActionModalFn();
    });
  }
  
  const closeModalBtn = document.getElementById('closeReceiptModalBtn');
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeReceiptModal);
  
  const closeReceiptBtn = document.getElementById('closeReceiptBtn');
  if (closeReceiptBtn) closeReceiptBtn.addEventListener('click', closeReceiptModal);
  
  const printReceiptBtn = document.getElementById('printReceiptBtn');
  if (printReceiptBtn) printReceiptBtn.addEventListener('click', printReceipt);
  
  const receiptModal = document.getElementById('receiptModal');
  if (receiptModal) {
    receiptModal.addEventListener('click', function(e) {
      if (e.target === this) closeReceiptModal();
    });
  }
  
  const loadLocationBtn = document.getElementById('loadLocationDataBtn');
  if (loadLocationBtn) {
    loadLocationBtn.addEventListener('click', () => {
      const location = document.getElementById('locationSelect').value;
      if (location) loadStaffForLocation(location);
      else showNotification('Please select a location first', 'error');
    });
  }
  
  const saveAttendanceBtn = document.getElementById('saveAttendanceBtn');
  if (saveAttendanceBtn) saveAttendanceBtn.addEventListener('click', saveAttendanceAndUpdatePayroll);
  
  const generateReportBtn = document.getElementById('generateReportBtn');
  if (generateReportBtn) generateReportBtn.addEventListener('click', generateWeeklyReport);
  
  const downloadReportBtn = document.getElementById('downloadReportBtn');
  if (downloadReportBtn) downloadReportBtn.addEventListener('click', downloadReport);
  
  const sendReportToAdminBtn = document.getElementById('sendReportToAdminBtn');
  if (sendReportToAdminBtn) sendReportToAdminBtn.addEventListener('click', sendReportToAdmin);
  
  const closeReportModalBtn = document.getElementById('closeReportModalBtn');
  if (closeReportModalBtn) closeReportModalBtn.addEventListener('click', closeReportModal);
  
  const closeReportPreviewBtn = document.getElementById('closeReportPreviewBtn');
  if (closeReportPreviewBtn) closeReportPreviewBtn.addEventListener('click', closeReportModal);
  
  const confirmDownloadBtn = document.getElementById('confirmDownloadReportBtn');
  if (confirmDownloadBtn) confirmDownloadBtn.addEventListener('click', downloadReport);
  
  const reportPreviewModal = document.getElementById('reportPreviewModal');
  if (reportPreviewModal) {
    reportPreviewModal.addEventListener('click', function(e) {
      if (e.target === this) closeReportModal();
    });
  }
  
  const sendChatMsgBtn = document.getElementById('sendChatMessageBtn');
  if (sendChatMsgBtn) {
    sendChatMsgBtn.addEventListener('click', () => {
      const message = document.getElementById('chatMessageInput').value;
      sendMessageToChat(message, false);
    });
  }
  
  const attachReportBtn = document.getElementById('attachReportToChatBtn');
  if (attachReportBtn) attachReportBtn.addEventListener('click', attachLastReportToChat);
  
  const saveEditBtn = document.getElementById('saveEditMessage');
  if (saveEditBtn) saveEditBtn.addEventListener('click', saveEditedMessage);
  
  const cancelEditBtn = document.getElementById('cancelEditMessage');
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', cancelEditMessage);
  
  const closeEditModal = document.getElementById('closeEditMessageModal');
  if (closeEditModal) closeEditModal.addEventListener('click', cancelEditMessage);
  
  const chatInput = document.getElementById('chatMessageInput');
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessageToChat(chatInput.value, false);
      }
    });
  }
  
  const inputs = document.querySelectorAll('#loginSection input');
  inputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        loginStaff();
      }
    });
  });
  
  const gsStatusFilter = document.getElementById('gsStatusFilter');
  if (gsStatusFilter) gsStatusFilter.addEventListener('change', filterGSJobs);
  
  const gsWorkerFilter = document.getElementById('gsWorkerFilter');
  if (gsWorkerFilter) gsWorkerFilter.addEventListener('change', filterGSJobs);
  
  const gsJobSelect = document.getElementById('gsJobSelect');
  if (gsJobSelect) {
    gsJobSelect.addEventListener('change', function() {
      const jobId = this.value;
      const gsMarkStartedBtn = document.getElementById('gsMarkStartedBtn');
      const gsMarkCompletedBtn = document.getElementById('gsMarkCompletedBtn');
      
      if (jobId && gsMarkStartedBtn && gsMarkCompletedBtn) {
        const job = jobs.find(j => j.id === parseInt(jobId));
        if (job) {
          gsMarkStartedBtn.disabled = job.status !== 'pending';
          gsMarkCompletedBtn.disabled = job.status !== 'in-progress';
        }
      } else {
        if (gsMarkStartedBtn) gsMarkStartedBtn.disabled = true;
        if (gsMarkCompletedBtn) gsMarkCompletedBtn.disabled = true;
      }
    });
  }
  
  const gsMarkStartedBtn = document.getElementById('gsMarkStartedBtn');
  if (gsMarkStartedBtn) {
    gsMarkStartedBtn.addEventListener('click', () => {
      const jobId = document.getElementById('gsJobSelect').value;
      if (jobId) updateJobStatusGS(parseInt(jobId), 'in-progress');
    });
  }
  
  const gsMarkCompletedBtn = document.getElementById('gsMarkCompletedBtn');
  if (gsMarkCompletedBtn) {
    gsMarkCompletedBtn.addEventListener('click', () => {
      const jobId = document.getElementById('gsJobSelect').value;
      if (jobId) updateJobStatusGS(parseInt(jobId), 'completed');
    });
  }
  
  const gsValidatePaymentBtn = document.getElementById('gsValidatePaymentBtn');
  if (gsValidatePaymentBtn) gsValidatePaymentBtn.addEventListener('click', validateGSCashPayment);
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeJobDetailModalFn();
      closeStatsDetailModalFn();
      closePaymentStatsDetailModal();
      closeReceiptModal();
      closeReportModal();
      hideLogoutConfirmation();
      cancelEditMessage();
      closeActionModalFn();
    }
  });
  
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeSidebar();
    }
  });
}

// ========== SHOW DASHBOARD ==========
function showDashboard() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('dashboard').style.display = 'flex';
  
  loadStaffData();
  loadJobs();
  loadJobHistory();
  loadStats();
  loadProfile();
  loadSettings();
  toggleSupervisorMenu();
  toggleGeneralSupervisorMenu();
  
  if (currentStaff.isSupervisor && currentStaff.supervisorLocation) {
    const locationSelect = document.getElementById('locationSelect');
    if (locationSelect) locationSelect.value = currentStaff.supervisorLocation;
  }
  
  showNotification(`Welcome back, ${currentStaff.name}!`, 'success');
  
  sessionStorage.setItem('staffLoggedIn', 'true');
  sessionStorage.setItem('staffName', currentStaff.name);
  sessionStorage.setItem('staffEmail', currentStaff.email);
}

// ========== LOGOUT FUNCTIONS ==========
function showLogoutConfirmation() {
  const modal = document.getElementById('logoutConfirmModal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function hideLogoutConfirmation() {
  const modal = document.getElementById('logoutConfirmModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

function performLogout() {
  hideLogoutConfirmation();
  
  const loadingOverlay = document.getElementById('logoutLoadingOverlay');
  if (loadingOverlay) loadingOverlay.style.display = 'flex';
  
  setTimeout(() => {
    sessionStorage.clear();
    
    if (loadingOverlay) loadingOverlay.style.display = 'none';
    document.getElementById('dashboard').style.display = 'none';
    
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    
    const loginSection = document.getElementById('loginSection');
    loginSection.style.display = 'flex';
    loginSection.style.animation = 'none';
    loginSection.offsetHeight;
    loginSection.style.animation = 'fadeIn 0.5s ease-out';
    
    showNotification('Logged out successfully!', 'success');
  }, 1500);
}

// ========== LOGIN FUNCTIONS ==========
function loginStaff() {
  console.log('Login attempt...');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  
  if (!emailInput || !passwordInput) return;
  
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  if (!email || !password) {
    showNotification('Please enter both email and password', 'error');
    return;
  }
  
  const found = allAccounts.find(acc => acc.email === email && acc.password === password);
  
  if (found) {
    currentStaff = found;
    showDashboard();
  } else {
    showNotification('Invalid email or password!', 'error');
    const loginCard = document.querySelector('.login-card');
    if (loginCard) {
      loginCard.style.animation = 'shake 0.5s';
      setTimeout(() => { loginCard.style.animation = ''; }, 500);
    }
  }
}

function showForgotPassword() {
  showNotification('Please contact your administrator to reset your password.', 'info');
}

function showDemoCredentials() {
  showNotification('Demo Credentials:\nStaff/GS: mudrikdau@gmail.com / 1234\nGS (Mall): mall.supervisor@CleanSpark.com / 1234\nWorker: john@CleanSpark.com / 1234\nWorker: aisha@CleanSpark.com / 1234', 'info');
}

// ========== CHANGE PASSWORD ==========
function changeStaffPassword() {
  const oldPass = document.getElementById('oldPassword')?.value;
  const newPass = document.getElementById('newPassword')?.value;
  const confirmPass = document.getElementById('confirmPassword')?.value;
  
  if (!oldPass || !newPass || !confirmPass) {
    showNotification('All fields are required', 'error');
    return;
  }
  
  if (oldPass !== currentStaff.password) {
    showNotification('Current password is incorrect', 'error');
    return;
  }
  
  if (newPass.length < 4) {
    showNotification('Password must be at least 4 characters', 'error');
    return;
  }
  
  if (newPass !== confirmPass) {
    showNotification('New passwords do not match', 'error');
    return;
  }
  
  currentStaff.password = newPass;
  showNotification('Password changed successfully!', 'success');
  
  document.getElementById('oldPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
}

// ========== LOAD FUNCTIONS ==========
function loadStaffData() {
  const staffNameEl = document.getElementById('staffName');
  if (staffNameEl && currentStaff) staffNameEl.textContent = currentStaff.name;
  
  const sidebarUserName = document.getElementById('sidebarUserName');
  if (sidebarUserName && currentStaff) sidebarUserName.textContent = currentStaff.name;
  
  const sidebarUserRole = document.getElementById('sidebarUserRole');
  if (sidebarUserRole && currentStaff) {
    let role = currentStaff.role;
    if (currentStaff.isGeneralSupervisor) role += ' (GS)';
    else if (currentStaff.isSupervisor) role += ' (Supervisor)';
    sidebarUserRole.textContent = role;
  }
  
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  if (sidebarAvatar && currentStaff) {
    const nameParts = currentStaff.name.split(' ');
    sidebarAvatar.textContent = nameParts.map(p => p[0]).join('').substring(0, 2).toUpperCase();
  }
  
  const topBarUserName = document.getElementById('topBarUserName');
  if (topBarUserName && currentStaff) topBarUserName.textContent = currentStaff.name;
}

function loadJobs() {
  let staffJobs;
  
  if (currentStaff.isGeneralSupervisor) {
    staffJobs = jobs.filter(job => job.generalSupervisorId === currentStaff.id);
  } else {
    staffJobs = jobs.filter(job => job.assignedWorkerId === currentStaff.id);
  }
  
  const pendingJobs = staffJobs.filter(job => job.status === 'pending' || job.status === 'in-progress');
  const container = document.getElementById('jobsContainer');
  
  if (!container) return;
  
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
    const supervisor = staffMembers.find(s => s.id === job.generalSupervisorId);
    const supervisorPhone = job.supervisorPhone || (supervisor ? getSupervisorPhone(supervisor.id) : '+255 777 000 000');
    
    html += `
      <div class="job-card clickable-indicator" data-id="${job.id}" onclick="showJobDetailModal(${job.id})">
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
            <span>Date: ${job.scheduledDate}</span>
          </div>
          <div class="job-detail-item">
            <i class="bi bi-clock"></i>
            <span>Time: ${job.timeSlot}</span>
          </div>
          <div class="job-detail-item">
            <i class="bi bi-telephone-fill"></i>
            <a href="tel:${supervisorPhone}">${supervisorPhone}</a>
            <span style="font-size: 11px; color: var(--text-muted);">(Supervisor)</span>
          </div>
        </div>
        <div class="job-actions" onclick="event.stopPropagation()">
          <button class="btn-action btn-action-report" onclick="openActionModal(${job.id})">
            <i class="bi bi-exclamation-triangle-fill"></i> Action
          </button>
          <button class="btn-action btn-view" onclick="showJobDetailModal(${job.id})">
            <i class="bi bi-eye"></i> Details
          </button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function getSupervisorPhone(supervisorId) {
  const supervisor = staffMembers.find(s => s.id === supervisorId);
  if (supervisor) {
    const account = allAccounts.find(a => a.id === supervisorId);
    if (account) return account.phone;
  }
  return '+255 777 000 000';
}

function loadJobHistory() {
  let staffJobs;
  if (currentStaff.isGeneralSupervisor) {
    staffJobs = jobs.filter(job => job.generalSupervisorId === currentStaff.id);
  } else {
    staffJobs = jobs.filter(job => job.assignedWorkerId === currentStaff.id);
  }
  
  const completedJobs = staffJobs.filter(job => job.status === 'completed');
  const container = document.getElementById('historyContainer');
  
  if (!container) return;
  
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
      <div class="job-card clickable-indicator" data-id="${job.id}" onclick="showJobDetailModal(${job.id})">
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
            <i class="bi bi-person-fill"></i>
            <span>Client: ${escapeHtml(job.client)}</span>
          </div>
          <div class="job-detail-item">
            <i class="bi bi-calendar-check"></i>
            <span>Completed: ${job.completedDate}</span>
          </div>
        </div>
        <div class="job-actions" onclick="event.stopPropagation()">
          <button class="btn-action btn-view" style="width: 100%;" onclick="showJobDetailModal(${job.id})">
            <i class="bi bi-eye"></i> View Full Details
          </button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function loadStats() {
  let staffJobs;
  if (currentStaff.isGeneralSupervisor) {
    staffJobs = jobs.filter(job => job.generalSupervisorId === currentStaff.id);
  } else {
    staffJobs = jobs.filter(job => job.assignedWorkerId === currentStaff.id);
  }
  
  const completedJobs = staffJobs.filter(job => job.status === 'completed');
  const pendingJobs = staffJobs.filter(job => job.status === 'pending');
  const inProgressJobs = staffJobs.filter(job => job.status === 'in-progress');
  
  const totalJobs = staffJobs.length;
  const totalCompleted = completedJobs.length;
  const totalEarnings = completedJobs.reduce((sum, job) => sum + job.price, 0);
  const completionRate = totalJobs > 0 ? ((totalCompleted / totalJobs) * 100).toFixed(0) : 0;
  
  const container = document.getElementById('statsContainer');
  if (!container) return;
  
  const statCardsData = [
    { icon: 'bi-briefcase-fill', value: totalJobs, label: 'Total Jobs', id: 'totalJobs' },
    { icon: 'bi-check-circle-fill', value: totalCompleted, label: 'Completed', id: 'completedJobs' },
    { icon: 'bi-play-fill', value: inProgressJobs.length, label: 'In Progress', id: 'inProgressJobs' },
    { icon: 'bi-hourglass-split', value: pendingJobs.length, label: 'Pending', id: 'pendingJobs' },
    { icon: 'bi-cash-stack', value: `TZS ${formatNumber(totalEarnings)}`, label: 'Earnings', id: 'totalEarnings' },
    { icon: 'bi-graph-up', value: `${completionRate}%`, label: 'Completion Rate', id: 'completionRate' }
  ];
  
  let html = '';
  statCardsData.forEach(stat => {
    html += `
      <div class="stat-card clickable-indicator" onclick="showStatsDetail('${stat.id}')">
        <div class="stat-icon"><i class="bi ${stat.icon}"></i></div>
        <div class="stat-value">${stat.value}</div>
        <div class="stat-label">${stat.label}</div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function loadProfile() {
  const container = document.getElementById('profileContainer');
  if (!container || !currentStaff) return;
  
  container.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar"><i class="bi bi-person-fill"></i></div>
      <h3>${escapeHtml(currentStaff.name)}</h3>
      <p>${escapeHtml(currentStaff.role)}${currentStaff.isGeneralSupervisor ? ' (General Supervisor)' : currentStaff.isSupervisor ? ' (Supervisor)' : ''}</p>
    </div>
    <div class="profile-info">
      <div class="info-row">
        <span class="info-label"><i class="bi bi-envelope"></i> Email</span>
        <span class="info-value">${escapeHtml(currentStaff.email)}</span>
      </div>
      <div class="info-row">
        <span class="info-label"><i class="bi bi-phone"></i> Phone</span>
        <span class="info-value">${escapeHtml(currentStaff.phone)}</span>
      </div>
      <div class="info-row">
        <span class="info-label"><i class="bi bi-calendar-plus"></i> Joined</span>
        <span class="info-value">${escapeHtml(currentStaff.joinDate)}</span>
      </div>
      ${currentStaff.supervisorLocation ? `
      <div class="info-row">
        <span class="info-label"><i class="bi bi-building"></i> Location</span>
        <span class="info-value">${escapeHtml(currentStaff.supervisorLocation)}</span>
      </div>
      ` : ''}
    </div>
    
    <div class="password-change-section">
      <h4><i class="bi bi-shield-lock-fill"></i> Change Password</h4>
      <p class="password-hint">Update your password regularly for security.</p>
      <div class="row g-3">
        <div class="col-md-12">
          <label class="form-label">Current Password</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-lock"></i></span>
            <input type="password" id="oldPassword" class="form-control" placeholder="Enter current password">
          </div>
        </div>
        <div class="col-md-12">
          <label class="form-label">New Password</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-key"></i></span>
            <input type="password" id="newPassword" class="form-control" placeholder="Enter new password">
          </div>
        </div>
        <div class="col-md-12">
          <label class="form-label">Confirm New Password</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-key-fill"></i></span>
            <input type="password" id="confirmPassword" class="form-control" placeholder="Confirm new password">
          </div>
        </div>
        <div class="col-12 mt-3">
          <button type="button" id="changePasswordBtn" class="btn-change-pwd w-100">
            <i class="bi bi-check-circle"></i> Update Password
          </button>
        </div>
      </div>
    </div>
  `;
  
  const changePwdBtn = document.getElementById('changePasswordBtn');
  if (changePwdBtn) changePwdBtn.addEventListener('click', changeStaffPassword);
}

function loadSettings() {
  const container = document.getElementById('settingsContainer');
  if (!container) return;
  
  const settings = getSettings();
  
  container.innerHTML = `
    <div class="settings-card">
      <h3><i class="bi bi-bell-fill"></i> Notifications</h3>
      <div class="settings-item">
        <div>
          <div class="settings-item-label">
            <i class="bi bi-bell"></i> Allow Notifications
          </div>
          <div class="settings-item-desc">Receive job updates and alerts</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="settingsNotifications" ${settings.notifications ? 'checked' : ''} onchange="updateSetting('notifications', this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="settings-item">
        <div>
          <div class="settings-item-label">
            <i class="bi bi-volume-up"></i> Notification Sound
          </div>
          <div class="settings-item-desc">Play sound for new notifications</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="settingsNotificationSound" ${settings.notificationSound ? 'checked' : ''} onchange="updateSetting('notificationSound', this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
    
    <div class="settings-card">
      <h3><i class="bi bi-palette-fill"></i> Appearance</h3>
      <div class="settings-item">
        <div>
          <div class="settings-item-label">
            <i class="bi bi-moon-stars"></i> Dark Mode
          </div>
          <div class="settings-item-desc">Switch between light and dark theme</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="settingsDarkMode" ${settings.darkMode ? 'checked' : ''} onchange="toggleThemeFromSettings(this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>
    
    <div class="settings-card">
      <h3><i class="bi bi-person-check-fill"></i> Availability</h3>
      <div class="settings-item">
        <div>
          <div class="settings-item-label">
            <i class="bi bi-circle-fill ${settings.availabilityStatus === 'available' ? 'text-success' : settings.availabilityStatus === 'busy' ? 'text-danger' : 'text-warning'}"></i> Status
          </div>
          <div class="settings-item-desc">Set your current availability</div>
        </div>
        <select class="form-control" style="width: 140px;" id="settingsAvailability" onchange="updateSetting('availabilityStatus', this.value)">
          <option value="available" ${settings.availabilityStatus === 'available' ? 'selected' : ''}>Available</option>
          <option value="busy" ${settings.availabilityStatus === 'busy' ? 'selected' : ''}>Busy</option>
          <option value="away" ${settings.availabilityStatus === 'away' ? 'selected' : ''}>Away</option>
        </select>
      </div>
    </div>
    
    <div class="settings-card">
      <h3><i class="bi bi-globe"></i> Language</h3>
      <div class="settings-item">
        <div>
          <div class="settings-item-label">
            <i class="bi bi-translate"></i> Display Language
          </div>
          <div class="settings-item-desc">Choose your preferred language</div>
        </div>
        <select class="form-control" style="width: 140px;" id="settingsLanguage" onchange="updateSetting('language', this.value)">
          <option value="en" ${settings.language === 'en' ? 'selected' : ''}>English</option>
          <option value="sw" ${settings.language === 'sw' ? 'selected' : ''}>Kiswahili</option>
        </select>
      </div>
    </div>
  `;
}

function updateSetting(key, value) {
  const settings = getSettings();
  settings[key] = value;
  saveSettings(settings);
  
  if (key === 'notifications') {
    showNotification(value ? 'Notifications enabled' : 'Notifications disabled', 'info');
  } else if (key === 'notificationSound') {
    showNotification(value ? 'Notification sound enabled' : 'Notification sound disabled', 'info');
  } else if (key === 'availabilityStatus') {
    showNotification(`Status updated to: ${value}`, 'success');
  } else if (key === 'language') {
    showNotification(`Language set to: ${value === 'en' ? 'English' : 'Kiswahili'}`, 'success');
  }
  
  if (key === 'availabilityStatus') loadSettings();
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

// ========== ACTION MODAL ==========
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

function closeActionModalFn() {
  const modal = document.getElementById('actionModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

function submitActionReport() {
  const jobId = document.getElementById('actionModal').getAttribute('data-job-id');
  const actionType = document.getElementById('actionType').value;
  const description = document.getElementById('actionDescription').value;
  const returnDate = document.getElementById('actionReturnDate').value;
  
  if (!actionType) {
    showNotification('Please select an issue type', 'error');
    return;
  }
  
  if (!description.trim()) {
    showNotification('Please provide a description', 'error');
    return;
  }
  
  const job = jobs.find(j => j.id === parseInt(jobId));
  const actionReport = {
    id: Date.now(),
    staffId: currentStaff.id,
    staffName: currentStaff.name,
    jobId: parseInt(jobId),
    jobService: job ? job.service : 'Unknown',
    actionType: actionType,
    description: description,
    returnDate: returnDate || 'Not specified',
    timestamp: new Date().toISOString(),
    status: 'submitted'
  };
  
  const actionReports = JSON.parse(localStorage.getItem('CleanSpark_actionReports') || '[]');
  actionReports.push(actionReport);
  localStorage.setItem('CleanSpark_actionReports', JSON.stringify(actionReports));
  
  closeActionModalFn();
  showNotification('Action report submitted successfully! Your supervisor will be notified.', 'success');
  
  console.log('Action Report:', actionReport);
}

// ========== JOB DETAIL MODAL ==========
function showJobDetailModal(jobId) {
  const job = jobs.find(j => j.id === jobId);
  if (!job) return;
  
  const modal = document.getElementById('jobDetailModal');
  const icon = document.getElementById('jobDetailIcon');
  const title = document.getElementById('jobDetailTitle');
  const content = document.getElementById('jobDetailContent');
  
  if (!modal || !content) return;
  
  if (icon) {
    switch(job.status) {
      case 'completed': icon.className = 'bi bi-check-circle-fill'; break;
      case 'in-progress': icon.className = 'bi bi-play-circle-fill'; break;
      default: icon.className = 'bi bi-brush-fill';
    }
  }
  
  if (title) title.textContent = job.service;
  
  const statusClass = job.status === 'pending' ? 'pending' : job.status === 'in-progress' ? 'in-progress' : 'completed';
  const statusIcon = job.status === 'pending' ? 'bi-clock' : job.status === 'in-progress' ? 'bi-play-circle' : 'bi-check-circle';
  const supervisorPhone = job.supervisorPhone || getSupervisorPhone(job.generalSupervisorId);
  
  let html = `
    <div class="detail-group">
      <div class="detail-group-header">
        <i class="bi bi-info-circle-fill"></i>
        <h4>Job Overview</h4>
      </div>
      <div class="detail-item">
        <span class="detail-label"><i class="bi bi-tag"></i> Job ID</span>
        <span class="detail-value">#${job.id}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label"><i class="bi bi-brush"></i> Service</span>
        <span class="detail-value">${escapeHtml(job.service)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label"><i class="${statusIcon}"></i> Status</span>
        <span class="detail-value"><span class="status-badge-large ${statusClass}">${job.status.toUpperCase()}</span></span>
      </div>
    </div>
    
    <div class="detail-group">
      <div class="detail-group-header">
        <i class="bi bi-person-fill"></i>
        <h4>Client Information</h4>
      </div>
      <div class="detail-item">
        <span class="detail-label"><i class="bi bi-person"></i> Name</span>
        <span class="detail-value">${escapeHtml(job.client)}</span>
      </div>
    </div>
    
    <div class="detail-group">
      <div class="detail-group-header">
        <i class="bi bi-geo-alt-fill"></i>
        <h4>Location & Schedule</h4>
      </div>
      <div class="detail-item">
        <span class="detail-label"><i class="bi bi-geo-alt"></i> Location</span>
        <span class="detail-value">${escapeHtml(job.location)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label"><i class="bi bi-calendar3"></i> Scheduled Date</span>
        <span class="detail-value">${job.scheduledDate}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label"><i class="bi bi-clock"></i> Time Slot</span>
        <span class="detail-value">${job.timeSlot}</span>
      </div>
      ${job.completedDate ? `
      <div class="detail-item">
        <span class="detail-label"><i class="bi bi-calendar-check"></i> Completed Date</span>
        <span class="detail-value">${job.completedDate}</span>
      </div>
      ` : ''}
      <div class="detail-item">
        <span class="detail-label"><i class="bi bi-telephone"></i> Supervisor Phone</span>
        <span class="detail-value"><a href="tel:${supervisorPhone}" style="color: #667eea; font-weight: 600;">${supervisorPhone}</a></span>
      </div>
    </div>
  `;
  
  if (currentStaff.isGeneralSupervisor || currentStaff.isSupervisor) {
    html += `
    <div class="detail-group">
      <div class="detail-group-header">
        <i class="bi bi-cash-stack"></i>
        <h4>Financial Information</h4>
      </div>
      <div class="detail-item">
        <span class="detail-label"><i class="bi bi-cash"></i> Service Price</span>
        <span class="detail-value" style="color: #28a745; font-size: 16px; font-weight: 700;">TZS ${formatNumber(job.price)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label"><i class="bi bi-hourglass-split"></i> Duration</span>
        <span class="detail-value">${job.duration}</span>
      </div>
    </div>
    `;
  }
  
  if (job.description) {
    html += `
    <div class="detail-group">
      <div class="detail-group-header">
        <i class="bi bi-file-text"></i>
        <h4>Description</h4>
      </div>
      <p style="color: var(--text-secondary); line-height: 1.6; padding: 12px; background: var(--bg-section-alt); border-radius: 10px;">${escapeHtml(job.description)}</p>
    </div>
    `;
  }
  
  if (job.requirements) {
    html += `
    <div class="detail-group">
      <div class="detail-group-header">
        <i class="bi bi-list-check"></i>
        <h4>Requirements</h4>
      </div>
      <p style="color: var(--text-secondary); line-height: 1.6; padding: 12px; background: #fff8f0; border-radius: 10px;">${escapeHtml(job.requirements)}</p>
    </div>
    `;
  }
  
  content.innerHTML = html;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeJobDetailModalFn() {
  const modal = document.getElementById('jobDetailModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

// ========== STATS DETAIL MODAL ==========
function showStatsDetail(statId) {
  const modal = document.getElementById('statsDetailModal');
  const icon = document.getElementById('statsDetailIcon');
  const title = document.getElementById('statsDetailTitle');
  const content = document.getElementById('statsDetailContent');
  
  if (!modal || !content) return;
  
  let staffJobs;
  if (currentStaff.isGeneralSupervisor) {
    staffJobs = jobs.filter(job => job.generalSupervisorId === currentStaff.id);
  } else {
    staffJobs = jobs.filter(job => job.assignedWorkerId === currentStaff.id);
  }
  
  const completedJobs = staffJobs.filter(job => job.status === 'completed');
  const pendingJobs = staffJobs.filter(job => job.status === 'pending');
  const inProgressJobs = staffJobs.filter(job => job.status === 'in-progress');
  const totalJobs = staffJobs.length;
  const totalCompleted = completedJobs.length;
  const totalEarnings = completedJobs.reduce((sum, job) => sum + job.price, 0);
  const completionRate = totalJobs > 0 ? ((totalCompleted / totalJobs) * 100).toFixed(0) : 0;
  
  let contentHtml = '';
  
  switch(statId) {
    case 'totalJobs':
      if (icon) icon.className = 'bi bi-briefcase-fill';
      if (title) title.textContent = 'Total Jobs Breakdown';
      contentHtml = `
        <div class="stats-detail-section">
          <h4>Jobs Overview</h4>
          <div class="stats-breakdown-item"><div class="stats-breakdown-icon"><i class="bi bi-briefcase"></i></div><div class="stats-breakdown-info"><div class="stats-breakdown-label">Total Jobs</div><div class="stats-breakdown-value">${totalJobs}</div></div></div>
          <div class="stats-breakdown-item"><div class="stats-breakdown-icon"><i class="bi bi-check-circle"></i></div><div class="stats-breakdown-info"><div class="stats-breakdown-label">Completed</div><div class="stats-breakdown-value">${totalCompleted}</div></div></div>
          <div class="stats-breakdown-item"><div class="stats-breakdown-icon"><i class="bi bi-play-circle"></i></div><div class="stats-breakdown-info"><div class="stats-breakdown-label">In Progress</div><div class="stats-breakdown-value">${inProgressJobs.length}</div></div></div>
          <div class="stats-breakdown-item"><div class="stats-breakdown-icon"><i class="bi bi-clock"></i></div><div class="stats-breakdown-info"><div class="stats-breakdown-label">Pending</div><div class="stats-breakdown-value">${pendingJobs.length}</div></div></div>
        </div>`;
      break;
      
    case 'completedJobs':
      if (icon) icon.className = 'bi bi-check-circle-fill';
      if (title) title.textContent = 'Completed Jobs';
      contentHtml = `
        <div class="stats-detail-section"><h4>Completed (${totalCompleted})</h4>
        ${completedJobs.map(job => `<div class="stats-breakdown-item"><div class="stats-breakdown-icon"><i class="bi bi-check-circle"></i></div><div class="stats-breakdown-info"><div class="stats-breakdown-label">${escapeHtml(job.service)}</div><div class="stats-breakdown-value">TZS ${formatNumber(job.price)}</div><small style="color: #718096;">Completed: ${job.completedDate}</small></div></div>`).join('') || '<p style="color: #718096; text-align: center;">No completed jobs yet.</p>'}
        </div>`;
      break;
      
    case 'inProgressJobs':
      if (icon) icon.className = 'bi bi-play-fill';
      if (title) title.textContent = 'In Progress Jobs';
      contentHtml = `
        <div class="stats-detail-section"><h4>In Progress (${inProgressJobs.length})</h4>
        ${inProgressJobs.map(job => `<div class="stats-breakdown-item"><div class="stats-breakdown-icon"><i class="bi bi-play-circle"></i></div><div class="stats-breakdown-info"><div class="stats-breakdown-label">${escapeHtml(job.service)}</div><div class="stats-breakdown-value">TZS ${formatNumber(job.price)}</div><small style="color: #718096;">Scheduled: ${job.scheduledDate}</small></div></div>`).join('') || '<p style="color: #718096; text-align: center;">No jobs in progress.</p>'}
        </div>`;
      break;
      
    case 'pendingJobs':
      if (icon) icon.className = 'bi bi-hourglass-split';
      if (title) title.textContent = 'Pending Jobs';
      contentHtml = `
        <div class="stats-detail-section"><h4>Pending (${pendingJobs.length})</h4>
        ${pendingJobs.map(job => `<div class="stats-breakdown-item"><div class="stats-breakdown-icon"><i class="bi bi-clock"></i></div><div class="stats-breakdown-info"><div class="stats-breakdown-label">${escapeHtml(job.service)}</div><div class="stats-breakdown-value">TZS ${formatNumber(job.price)}</div><small style="color: #718096;">Scheduled: ${job.scheduledDate}</small></div></div>`).join('') || '<p style="color: #718096; text-align: center;">No pending jobs.</p>'}
        </div>`;
      break;
      
    case 'totalEarnings':
      if (icon) icon.className = 'bi bi-cash-stack';
      if (title) title.textContent = 'Earnings Breakdown';
      contentHtml = `
        <div class="stats-detail-section"><h4>Total: TZS ${formatNumber(totalEarnings)}</h4>
        ${completedJobs.map(job => `<div class="stats-breakdown-item"><div class="stats-breakdown-icon"><i class="bi bi-cash"></i></div><div class="stats-breakdown-info"><div class="stats-breakdown-label">${escapeHtml(job.service)}</div><div class="stats-breakdown-value">TZS ${formatNumber(job.price)}</div></div></div>`).join('') || '<p style="color: #718096; text-align: center;">No earnings yet.</p>'}
        </div>`;
      break;
      
    case 'completionRate':
      if (icon) icon.className = 'bi bi-graph-up';
      if (title) title.textContent = 'Completion Rate';
      contentHtml = `
        <div class="stats-detail-section"><h4>Performance Metrics</h4>
        <div style="text-align: center; margin: 20px 0;"><div style="font-size: 56px; font-weight: 800; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${completionRate}%</div><p style="color: #718096;">Completion Rate</p></div>
        <div class="progress-bar-container"><div class="progress-bar-bg"><div class="progress-bar-fill ${completionRate >= 80 ? 'green' : completionRate >= 50 ? 'blue' : 'orange'}" style="width: ${completionRate}%;"></div></div></div></div>`;
      break;
  }
  
  content.innerHTML = contentHtml;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeStatsDetailModalFn() {
  const modal = document.getElementById('statsDetailModal');
  if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
}

// ========== PAYMENT STATS DETAIL MODAL ==========
function showPaymentStatsDetail(statType) {
  const modal = document.getElementById('paymentStatsDetailModal');
  const icon = document.getElementById('paymentStatsDetailIcon');
  const title = document.getElementById('paymentStatsDetailTitle');
  const content = document.getElementById('paymentStatsDetailContent');
  if (!modal || !content) return;
  
  const totalPayments = paymentValidations.length;
  const totalAmount = paymentValidations.reduce((sum, p) => sum + p.amount, 0);
  const today = new Date().toISOString().split('T')[0];
  const todayPayments = paymentValidations.filter(p => p.paymentDate === today);
  const todayAmount = todayPayments.reduce((sum, p) => sum + p.amount, 0);
  
  let contentHtml = '';
  
  switch(statType) {
    case 'totalPayments':
      if (icon) icon.className = 'bi bi-receipt';
      if (title) title.textContent = 'Total Validated Payments';
      contentHtml = `
        <div class="detail-group"><div class="detail-group-header"><i class="bi bi-receipt"></i><h4>Payment Statistics</h4></div>
        <div class="detail-item"><span class="detail-label"><i class="bi bi-receipt-cutoff"></i> Total</span><span class="detail-value" style="font-size: 22px; font-weight: 700; color: #667eea;">${totalPayments}</span></div>
        </div>
        <div class="detail-group"><div class="detail-group-header"><i class="bi bi-list-check"></i><h4>Recent Payments</h4></div>
        <ul class="people-list">${paymentValidations.slice(-5).reverse().map(p => `<li class="people-list-item"><div class="people-avatar">${p.customerName.charAt(0)}</div><div class="people-info"><div class="people-name">${escapeHtml(p.customerName)}</div><div class="people-detail">${escapeHtml(p.jobService)}</div></div><div style="text-align: right;"><div style="font-weight: 700; color: #28a745;">TZS ${formatNumber(p.amount)}</div><div style="font-size: 11px; color: #a0aec0;">${p.paymentDate}</div></div></li>`).join('')}</ul></div>`;
      break;
      
    case 'totalRevenue':
      if (icon) icon.className = 'bi bi-cash-stack';
      if (title) title.textContent = 'Total Revenue';
      contentHtml = `
        <div class="detail-group"><div class="detail-group-header"><i class="bi bi-cash"></i><h4>Revenue</h4></div>
        <div class="detail-item"><span class="detail-label">Total Revenue</span><span class="detail-value" style="font-size: 22px; font-weight: 700; color: #28a745;">TZS ${formatNumber(totalAmount)}</span></div>
        <div class="detail-item"><span class="detail-label">Today</span><span class="detail-value">TZS ${formatNumber(todayAmount)}</span></div>
        </div>`;
      break;
      
    case 'todayPayments':
      if (icon) icon.className = 'bi bi-calendar-today';
      if (title) title.textContent = "Today's Payments";
      contentHtml = `
        <div class="detail-group"><div class="detail-group-header"><i class="bi bi-calendar-day"></i><h4>Today (${today})</h4></div>
        <div class="detail-item"><span class="detail-label">Payments</span><span class="detail-value" style="font-size: 22px; color: #667eea;">${todayPayments.length}</span></div>
        <div class="detail-item"><span class="detail-label">Amount</span><span class="detail-value" style="color: #28a745;">TZS ${formatNumber(todayAmount)}</span></div>
        </div>`;
      break;
      
    case 'todayRevenue':
      if (icon) icon.className = 'bi bi-graph-up';
      if (title) title.textContent = "Today's Revenue";
      contentHtml = `
        <div class="detail-group"><div class="detail-group-header"><i class="bi bi-cash-stack"></i><h4>Revenue Today</h4></div>
        <div class="detail-item"><span class="detail-label">Total</span><span class="detail-value" style="font-size: 22px; font-weight: 700; color: #28a745;">TZS ${formatNumber(todayAmount)}</span></div>
        </div>`;
      break;
  }
  
  content.innerHTML = contentHtml;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closePaymentStatsDetailModal() {
  const modal = document.getElementById('paymentStatsDetailModal');
  if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
}

// ========== NAVIGATION ==========
function setupSidebarNav() {
  const navButtons = document.querySelectorAll('.sidebar-nav-btn');
  const views = ['jobs', 'history', 'stats', 'profile', 'settings', 'payment', 'supervisor', 'generalSupervisor'];
  const viewTitles = {
    jobs: 'Assigned Jobs',
    history: 'Job History',
    stats: 'My Stats',
    profile: 'My Profile',
    settings: 'Settings',
    payment: 'Cash Payment',
    supervisor: 'Supervisor Panel',
    generalSupervisor: 'General Supervisor'
  };
  
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      views.forEach(v => {
        const viewElement = document.getElementById(`${v}View`);
        if (viewElement) viewElement.classList.remove('active');
      });
      
      const activeView = document.getElementById(`${view}View`);
      if (activeView) {
        activeView.classList.add('active');
        
        const topBarTitle = document.getElementById('topBarTitle');
        if (topBarTitle) topBarTitle.textContent = viewTitles[view] || view;
        
        if (view === 'payment') {
          loadCompletedJobsForPayment();
          loadRecentPayments();
          updatePaymentStats();
        } else if (view === 'supervisor') {
          displayChatMessages();
          const today = new Date();
          const daysUntilFriday = (5 - today.getDay() + 7) % 7;
          const friday = new Date(today);
          friday.setDate(today.getDate() + (daysUntilFriday || 7));
          const weekEndingInput = document.getElementById('reportWeekEnding');
          if (weekEndingInput) weekEndingInput.value = friday.toISOString().split('T')[0];
        } else if (view === 'generalSupervisor') {
          loadGeneralSupervisorData();
        } else if (view === 'settings') {
          loadSettings();
        } else if (view === 'jobs') {
          loadJobs();
        } else if (view === 'history') {
          loadJobHistory();
        } else if (view === 'stats') {
          loadStats();
        } else if (view === 'profile') {
          loadProfile();
        }
      }
    });
  });
}

// ========== SUPERVISOR MENU TOGGLES ==========
function toggleSupervisorMenu() {
  const supervisorBtn = document.getElementById('supervisorSidebarBtn');
  if (currentStaff && currentStaff.isSupervisor) {
    if (supervisorBtn) supervisorBtn.style.display = 'flex';
  } else {
    if (supervisorBtn) supervisorBtn.style.display = 'none';
  }
}

function toggleGeneralSupervisorMenu() {
  const gsBtn = document.getElementById('generalSupervisorSidebarBtn');
  if (currentStaff && currentStaff.isGeneralSupervisor) {
    if (gsBtn) gsBtn.style.display = 'flex';
  } else {
    if (gsBtn) gsBtn.style.display = 'none';
  }
}

// ========== GENERAL SUPERVISOR FUNCTIONS ==========
function loadGeneralSupervisorData() {
  if (!currentStaff || !currentStaff.isGeneralSupervisor) return;
  
  loadGSTeam();
  loadGSJobs();
  loadGSJobSelect();
  loadGSPaymentModule();
  loadGSCommunication();
  loadGSReportHistory();
  updateGSStats();
}

function loadGSTeam() {
  const container = document.getElementById('gsTeamContainer');
  if (!container) return;
  
  const assignedWorkerIds = currentStaff.assignedWorkers || [];
  const workers = staffMembers.filter(s => assignedWorkerIds.includes(s.id) && !s.isSupervisor);
  
  if (workers.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No workers assigned to you yet.</p>';
    return;
  }
  
  let html = '';
  workers.forEach(worker => {
    const workerJobs = jobs.filter(j => j.assignedWorkerId === worker.id);
    const completedCount = workerJobs.filter(j => j.status === 'completed').length;
    
    html += `
      <div class="gs-team-member">
        <div class="gs-team-avatar">${worker.name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase()}</div>
        <div class="gs-team-info">
          <div class="gs-team-name">${escapeHtml(worker.name)}</div>
          <div class="gs-team-role">${escapeHtml(worker.role)}</div>
          <div class="gs-team-stats">
            <span><i class="bi bi-briefcase"></i> ${workerJobs.length} jobs</span>
            <span><i class="bi bi-check-circle"></i> ${completedCount} completed</span>
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  
  const workerFilter = document.getElementById('gsWorkerFilter');
  if (workerFilter) {
    let options = '<option value="all">All Workers</option>';
    workers.forEach(w => {
      options += `<option value="${w.id}">${escapeHtml(w.name)}</option>`;
    });
    workerFilter.innerHTML = options;
  }
}

function loadGSJobs() {
  const container = document.getElementById('gsJobsContainer');
  if (!container) return;
  
  const statusFilter = document.getElementById('gsStatusFilter')?.value || 'all';
  const workerFilter = document.getElementById('gsWorkerFilter')?.value || 'all';
  
  let gsJobs = jobs.filter(j => j.generalSupervisorId === currentStaff.id);
  
  if (statusFilter !== 'all') {
    gsJobs = gsJobs.filter(j => j.status === statusFilter);
  }
  if (workerFilter !== 'all') {
    gsJobs = gsJobs.filter(j => j.assignedWorkerId === parseInt(workerFilter));
  }
  
  if (gsJobs.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No jobs found matching filters.</p>';
    return;
  }
  
  let html = '';
  gsJobs.forEach(job => {
    const worker = staffMembers.find(s => s.id === job.assignedWorkerId);
    const workerName = worker ? worker.name : 'Unassigned';
    const statusClass = job.status === 'pending' ? 'status-pending' : job.status === 'in-progress' ? 'status-in-progress' : 'status-completed';
    
    html += `
      <div class="gs-job-item">
        <div class="gs-job-info">
          <div class="gs-job-service">${escapeHtml(job.service)}</div>
          <div class="gs-job-meta">
            <span><i class="bi bi-person"></i> ${escapeHtml(workerName)}</span> · 
            <span><i class="bi bi-geo-alt"></i> ${escapeHtml(job.location)}</span> · 
            <span><i class="bi bi-calendar"></i> ${job.scheduledDate}</span>
          </div>
        </div>
        <div>
          <span class="status-badge ${statusClass}">${job.status.replace('-', ' ').toUpperCase()}</span>
          ${currentStaff.isGeneralSupervisor ? `<span style="margin-left: 8px; font-weight: 600; color: #28a745;">TZS ${formatNumber(job.price)}</span>` : ''}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function loadGSJobSelect() {
  const select = document.getElementById('gsJobSelect');
  if (!select) return;
  
  const gsJobs = jobs.filter(j => j.generalSupervisorId === currentStaff.id && j.status !== 'completed');
  
  let options = '<option value="">-- Select Job to Update --</option>';
  gsJobs.forEach(job => {
    const worker = staffMembers.find(s => s.id === job.assignedWorkerId);
    options += `<option value="${job.id}">#${job.id} - ${escapeHtml(job.service)} (${job.status}) - ${worker ? worker.name : 'Unassigned'}</option>`;
  });
  
  select.innerHTML = options;
  
  const gsMarkStartedBtn = document.getElementById('gsMarkStartedBtn');
  const gsMarkCompletedBtn = document.getElementById('gsMarkCompletedBtn');
  if (gsMarkStartedBtn) gsMarkStartedBtn.disabled = true;
  if (gsMarkCompletedBtn) gsMarkCompletedBtn.disabled = true;
}

function filterGSJobs() {
  loadGSJobs();
}

function updateJobStatusGS(jobId, newStatus) {
  const jobIndex = jobs.findIndex(j => j.id === jobId);
  if (jobIndex !== -1) {
    jobs[jobIndex].status = newStatus;
    
    if (newStatus === 'completed') {
      jobs[jobIndex].completedDate = new Date().toISOString().split('T')[0];
      showNotification('Job marked as completed!', 'success');
    } else if (newStatus === 'in-progress') {
      showNotification('Job marked as started!', 'success');
    }
    
    loadGSJobs();
    loadGSJobSelect();
    loadJobs();
    loadJobHistory();
    loadStats();
    
    const gsMarkStartedBtn = document.getElementById('gsMarkStartedBtn');
    const gsMarkCompletedBtn = document.getElementById('gsMarkCompletedBtn');
    const gsJobSelect = document.getElementById('gsJobSelect');
    if (gsMarkStartedBtn) gsMarkStartedBtn.disabled = true;
    if (gsMarkCompletedBtn) gsMarkCompletedBtn.disabled = true;
    if (gsJobSelect) gsJobSelect.value = '';
  }
}

// ========== GS PAYMENT MODULE ==========
function loadGSPaymentModule() {
  loadGSPaymentValidations();
  loadGSCompletedJobsForPayment();
}

function loadGSPaymentValidations() {
  const stored = localStorage.getItem('CleanSpark_payments');
  gsPaymentValidations = stored ? JSON.parse(stored) : [
    { id: 1, jobId: 104, jobService: "AC Maintenance & Filter", customerName: "Omar Juma", amount: 300000, cashReceived: 300000, change: 0, paymentDate: "2026-03-20", paymentTime: "15:30", status: "completed", receiptNumber: "RCP-20260320-001" },
    { id: 2, jobId: 105, jobService: "Full Villa Cleaning", customerName: "Salma Khamis", amount: 850000, cashReceived: 850000, change: 0, paymentDate: "2026-03-18", paymentTime: "12:15", status: "completed", receiptNumber: "RCP-20260318-002" }
  ];
  saveGSPaymentValidations();
}

function saveGSPaymentValidations() {
  localStorage.setItem('CleanSpark_payments', JSON.stringify(gsPaymentValidations));
}

function updateGSStats() {
  const totalPayments = gsPaymentValidations.length;
  const totalAmount = gsPaymentValidations.reduce((sum, p) => sum + p.amount, 0);
  const today = new Date().toISOString().split('T')[0];
  const todayPayments = gsPaymentValidations.filter(p => p.paymentDate === today).length;
  const todayAmount = gsPaymentValidations.filter(p => p.paymentDate === today).reduce((sum, p) => sum + p.amount, 0);
  
  const statsGrid = document.getElementById('gsPaymentStatsGrid');
  if (statsGrid) {
    statsGrid.innerHTML = `
      <div class="payment-stat-card clickable-indicator" onclick="showPaymentStatsDetail('totalPayments')">
        <div class="payment-stat-icon"><i class="bi bi-receipt"></i></div>
        <div class="payment-stat-value">${totalPayments}</div>
        <div class="payment-stat-label">Total Payments</div>
      </div>
      <div class="payment-stat-card clickable-indicator" onclick="showPaymentStatsDetail('totalRevenue')">
        <div class="payment-stat-icon"><i class="bi bi-cash-stack"></i></div>
        <div class="payment-stat-value">TZS ${formatNumber(totalAmount)}</div>
        <div class="payment-stat-label">Total Revenue</div>
      </div>
      <div class="payment-stat-card clickable-indicator" onclick="showPaymentStatsDetail('todayPayments')">
        <div class="payment-stat-icon"><i class="bi bi-calendar-today"></i></div>
        <div class="payment-stat-value">${todayPayments}</div>
        <div class="payment-stat-label">Today's Payments</div>
      </div>
      <div class="payment-stat-card clickable-indicator" onclick="showPaymentStatsDetail('todayRevenue')">
        <div class="payment-stat-icon"><i class="bi bi-graph-up"></i></div>
        <div class="payment-stat-value">TZS ${formatNumber(todayAmount)}</div>
        <div class="payment-stat-label">Today's Revenue</div>
      </div>`;
  }
}

function loadGSCompletedJobsForPayment() {
  const gsJobs = jobs.filter(job => job.generalSupervisorId === currentStaff.id && job.status === 'completed');
  const jobSelect = document.getElementById('gsJobSelectPayment');
  if (!jobSelect) return;
  
  const pendingJobs = gsJobs.filter(job => !gsPaymentValidations.some(p => p.jobId === job.id));
  
  if (pendingJobs.length === 0) {
    jobSelect.innerHTML = '<option value="">-- No pending payments --</option>';
    return;
  }
  
  let options = '<option value="">-- Select a completed job --</option>';
  pendingJobs.forEach(job => {
    options += `<option value="${job.id}" data-service="${escapeHtml(job.service)}" data-client="${escapeHtml(job.client)}" data-price="${job.price}">${job.service} - ${job.client} (TZS ${formatNumber(job.price)})</option>`;
  });
  
  jobSelect.innerHTML = options;
  
  jobSelect.onchange = function() {
    const selectedOption = this.options[this.selectedIndex];
    if (this.value) {
      document.getElementById('gsCustomerName').value = selectedOption.getAttribute('data-client');
      document.getElementById('gsServiceAmount').value = `TZS ${formatNumber(parseInt(selectedOption.getAttribute('data-price')))}`;
      document.getElementById('gsCashReceived').value = '';
      document.getElementById('gsPaymentNote').value = '';
      gsSelectedJobForPayment = {
        id: parseInt(this.value),
        service: selectedOption.getAttribute('data-service'),
        client: selectedOption.getAttribute('data-client'),
        price: parseInt(selectedOption.getAttribute('data-price'))
      };
    } else {
      document.getElementById('gsCustomerName').value = '';
      document.getElementById('gsServiceAmount').value = '';
      gsSelectedJobForPayment = null;
    }
  };
}

function validateGSCashPayment() {
  const jobSelect = document.getElementById('gsJobSelectPayment');
  const cashReceivedInput = document.getElementById('gsCashReceived');
  const paymentNote = document.getElementById('gsPaymentNote').value;
  
  if (!jobSelect || !jobSelect.value) { showNotification('Please select a job', 'error'); return; }
  if (!gsSelectedJobForPayment) { showNotification('Invalid job selection', 'error'); return; }
  
  const cashReceived = parseFloat(cashReceivedInput.value);
  if (isNaN(cashReceived) || cashReceived <= 0) { showNotification('Please enter a valid amount', 'error'); return; }
  
  const serviceAmount = gsSelectedJobForPayment.price;
  if (cashReceived < serviceAmount) { showNotification(`Insufficient payment! Need TZS ${formatNumber(serviceAmount - cashReceived)} more.`, 'error'); return; }
  
  const change = cashReceived - serviceAmount;
  
  const paymentRecord = {
    id: gsPaymentValidations.length + 1,
    jobId: gsSelectedJobForPayment.id,
    jobService: gsSelectedJobForPayment.service,
    customerName: gsSelectedJobForPayment.client,
    amount: serviceAmount,
    cashReceived: cashReceived,
    change: change,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentTime: new Date().toLocaleTimeString(),
    status: "completed",
    receiptNumber: `RCP-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}${String(new Date().getDate()).padStart(2,'0')}-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`,
    note: paymentNote
  };
  
  gsPaymentValidations.push(paymentRecord);
  saveGSPaymentValidations();
  generateReceipt(paymentRecord);
  updateGSStats();
  loadGSRecentPayments();
  loadGSCompletedJobsForPayment();
  
  cashReceivedInput.value = '';
  document.getElementById('gsPaymentNote').value = '';
  jobSelect.value = '';
  document.getElementById('gsCustomerName').value = '';
  document.getElementById('gsServiceAmount').value = '';
  gsSelectedJobForPayment = null;
  
  showNotification(`Payment validated! Receipt #${paymentRecord.receiptNumber}`, 'success');
}

function loadGSRecentPayments() {
  const container = document.getElementById('gsRecentPaymentsContainer');
  if (!container) return;
  
  const recentPayments = [...gsPaymentValidations].reverse().slice(0, 10);
  
  if (recentPayments.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding:20px;"><i class="bi bi-receipt"></i><h4>No Payments Yet</h4></div>`;
    return;
  }
  
  container.innerHTML = recentPayments.map(payment => `
    <div class="payment-item">
      <div class="payment-info">
        <div class="payment-job">${escapeHtml(payment.jobService)}</div>
        <div class="payment-details"><span><i class="bi bi-person"></i> ${escapeHtml(payment.customerName)}</span><span><i class="bi bi-receipt"></i> ${payment.receiptNumber}</span></div>
        <span class="payment-status">Validated</span>
      </div>
      <div class="payment-amount"><div class="amount-value">TZS ${formatNumber(payment.amount)}</div><div class="payment-date">${payment.paymentDate}</div></div>
    </div>`).join('');
}

// ========== GS COMMUNICATION WITH ADMIN ==========
function loadGSCommunication() {
  loadGSChatMessages();
  displayGSChatMessages();
  
  const sendBtn = document.getElementById('gsSendChatMessageBtn');
  if (sendBtn) {
    sendBtn.onclick = () => {
      const message = document.getElementById('gsChatMessageInput').value;
      sendGSChatMessage(message);
    };
  }
  
  const chatInput = document.getElementById('gsChatMessageInput');
  if (chatInput) {
    chatInput.onkeypress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendGSChatMessage(chatInput.value);
      }
    };
  }
}

function loadGSChatMessages() {
  const stored = localStorage.getItem('CleanSpark_gs_chat');
  if (stored) {
    gsChatMessages = JSON.parse(stored);
  } else {
    gsChatMessages = [
      { id: 1, sender: "Admin", message: "Welcome General Supervisor! This is your direct communication channel with Admin. Use this for reports, issues, and updates.", timestamp: new Date().toISOString(), type: "received", edited: false, read: true }
    ];
    saveGSChatMessages();
  }
  
  const storedDeleted = localStorage.getItem('CleanSpark_gs_deletedForMe');
  if (storedDeleted) {
    gsDeletedMessagesForMe = JSON.parse(storedDeleted);
  }
}

function saveGSChatMessages() {
  localStorage.setItem('CleanSpark_gs_chat', JSON.stringify(gsChatMessages));
}

function saveGSDeletedForMe() {
  localStorage.setItem('CleanSpark_gs_deletedForMe', JSON.stringify(gsDeletedMessagesForMe));
}

function sendGSChatMessage(message) {
  if (!message || !message.trim()) return;
  
  const newMessage = {
    id: Date.now(),
    sender: currentStaff.name,
    senderEmail: currentStaff.email,
    message: message.trim(),
    timestamp: new Date().toISOString(),
    type: "sent",
    edited: false,
    read: false
  };
  
  gsChatMessages.unshift(newMessage);
  saveGSChatMessages();
  displayGSChatMessages();
  
  document.getElementById('gsChatMessageInput').value = '';
  showNotification('Message sent to Admin!', 'success');
}

function displayGSChatMessages() {
  const container = document.getElementById('gsChatMessagesContainer');
  if (!container) return;
  
  const visibleMessages = gsChatMessages.filter(msg => !gsDeletedMessagesForMe.includes(msg.id));
  
  if (visibleMessages.length === 0) {
    container.innerHTML = '<div class="chat-placeholder">No messages yet. Start a conversation with Admin.</div>';
    return;
  }
  
  let html = '';
  visibleMessages.slice().reverse().forEach(msg => {
    const date = new Date(msg.timestamp);
    const messageClass = msg.type === 'sent' ? 'sent' : 'received';
    const senderName = msg.type === 'sent' ? 'You' : msg.sender;
    
    html += `
      <div class="chat-message-wrapper ${messageClass}" data-message-id="${msg.id}">
        <div class="chat-message ${messageClass}">
          <div style="font-weight: 600; margin-bottom: 4px; font-size: 12px;">${escapeHtml(senderName)}</div>
          <div class="message-text">${escapeHtml(msg.message)}</div>
          <div class="message-meta">
            ${msg.edited ? '<span class="edited-badge">(edited)</span>' : ''}
            <span>${date.toLocaleString()}</span>
          </div>
        </div>
        <div style="display: flex; gap: 4px; margin-top: 2px; padding: 0 4px;">
          <button onclick="copyGSMessage(${msg.id})" style="background:none;border:none;cursor:pointer;font-size:11px;color:var(--text-muted);" title="Copy"><i class="bi bi-clipboard"></i></button>
          ${msg.type === 'sent' ? `<button onclick="editGSMessage(${msg.id})" style="background:none;border:none;cursor:pointer;font-size:11px;color:var(--text-muted);" title="Edit"><i class="bi bi-pencil"></i></button>` : ''}
          <button onclick="deleteGSMessageForMe(${msg.id})" style="background:none;border:none;cursor:pointer;font-size:11px;color:var(--text-muted);" title="Hide"><i class="bi bi-eye-slash"></i></button>
          ${msg.type === 'sent' ? `<button onclick="deleteGSMessageForAll(${msg.id})" style="background:none;border:none;cursor:pointer;font-size:11px;color:#dc3545;" title="Delete"><i class="bi bi-trash"></i></button>` : ''}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function copyGSMessage(messageId) {
  const message = gsChatMessages.find(msg => msg.id === messageId);
  if (!message) return;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(message.message).then(() => showNotification('Copied!', 'success'));
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = message.message;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showNotification('Copied!', 'success');
  }
}

function editGSMessage(messageId) {
  const message = gsChatMessages.find(msg => msg.id === messageId);
  if (!message) return;
  
  gsCurrentEditingMessageId = messageId;
  document.getElementById('editMessageInput').value = message.message;
  document.getElementById('editMessageModal').style.display = 'flex';
  
  const saveBtn = document.getElementById('saveEditMessage');
  const originalClick = saveBtn.onclick;
  saveBtn.onclick = () => {
    const newText = document.getElementById('editMessageInput').value.trim();
    if (!newText) { showNotification('Message cannot be empty', 'error'); return; }
    
    const msgIndex = gsChatMessages.findIndex(msg => msg.id === gsCurrentEditingMessageId);
    if (msgIndex !== -1) {
      gsChatMessages[msgIndex].message = newText;
      gsChatMessages[msgIndex].edited = true;
      gsChatMessages[msgIndex].timestamp = new Date().toISOString();
      saveGSChatMessages();
      displayGSChatMessages();
      showNotification('Message updated!', 'success');
    }
    
    gsCurrentEditingMessageId = null;
    document.getElementById('editMessageModal').style.display = 'none';
    document.getElementById('editMessageInput').value = '';
    saveBtn.onclick = originalClick;
  };
}

function deleteGSMessageForMe(messageId) {
  if (!gsDeletedMessagesForMe.includes(messageId)) {
    gsDeletedMessagesForMe.push(messageId);
    saveGSDeletedForMe();
    displayGSChatMessages();
    showNotification('Message hidden', 'success');
  }
}

function deleteGSMessageForAll(messageId) {
  const msgIndex = gsChatMessages.findIndex(msg => msg.id === messageId);
  if (msgIndex !== -1) {
    gsChatMessages.splice(msgIndex, 1);
    saveGSChatMessages();
    displayGSChatMessages();
    showNotification('Message deleted', 'success');
  }
}

// ========== GS WEEKLY REPORTS SYSTEM ==========
function loadGSReportHistory() {
  const stored = localStorage.getItem('CleanSpark_gs_reports');
  if (stored) {
    gsWeeklyReports = JSON.parse(stored);
  } else {
    gsWeeklyReports = [];
  }
  displayGSReportHistory();
  
  const generateBtn = document.getElementById('gsGenerateReportBtn');
  if (generateBtn) {
    generateBtn.onclick = generateGSWeeklyReport;
  }
  
  const downloadBtn = document.getElementById('gsDownloadReportBtn');
  if (downloadBtn) {
    downloadBtn.onclick = downloadGSReport;
  }
  
  const submitBtn = document.getElementById('gsSubmitReportBtn');
  if (submitBtn) {
    submitBtn.onclick = submitGSReportToAdmin;
  }
  
  const today = new Date();
  const daysUntilFriday = (5 - today.getDay() + 7) % 7;
  const friday = new Date(today);
  friday.setDate(today.getDate() + (daysUntilFriday || 7));
  const weekEndingInput = document.getElementById('gsReportWeekEnding');
  if (weekEndingInput) weekEndingInput.value = friday.toISOString().split('T')[0];
}

function generateGSWeeklyReport() {
  const weekEnding = document.getElementById('gsReportWeekEnding').value;
  const sites = document.getElementById('gsReportSites').value;
  const workers = document.getElementById('gsReportWorkers').value;
  const completedJobs = document.getElementById('gsReportCompletedJobs').value;
  const pendingJobs = document.getElementById('gsReportPendingJobs').value;
  const attendance = document.getElementById('gsReportAttendance').value;
  const issues = document.getElementById('gsReportIssues').value;
  const recommendations = document.getElementById('gsReportRecommendations').value;
  
  if (!weekEnding) { showNotification('Please select the week ending date', 'error'); return; }
  if (!sites) { showNotification('Please enter sites supervised', 'error'); return; }
  if (!workers) { showNotification('Please enter workers supervised', 'error'); return; }
  
  const report = {
    id: Date.now(),
    reportNumber: `GSR-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}${Math.floor(Math.random()*1000)}`,
    weekEnding: weekEnding,
    sitesSupervised: sites,
    workersSupervised: workers,
    completedJobs: parseInt(completedJobs) || 0,
    pendingJobs: parseInt(pendingJobs) || 0,
    attendanceSummary: attendance || 'No attendance summary provided.',
    issuesEncountered: issues || 'No issues reported.',
    recommendations: recommendations || 'No recommendations provided.',
    generatedBy: currentStaff.name,
    generatedByEmail: currentStaff.email,
    generatedDate: new Date().toISOString(),
    submittedToAdmin: false,
    submittedDate: null
  };
  
  gsCurrentGeneratedReport = report;
  
  const previewContent = `
    <div class="professional-report">
      <div class="report-header-section">
        <div class="report-title-main">GENERAL SUPERVISOR WEEKLY REPORT</div>
        <div class="report-subtitle">CleanSpark Cleaning Services</div>
      </div>
      <div class="report-meta-grid">
        <div class="meta-item"><span class="meta-label">Report Number</span><span class="meta-value">${report.reportNumber}</span></div>
        <div class="meta-item"><span class="meta-label">Week Ending</span><span class="meta-value">${report.weekEnding}</span></div>
        <div class="meta-item"><span class="meta-label">Generated By</span><span class="meta-value">${escapeHtml(report.generatedBy)}</span></div>
        <div class="meta-item"><span class="meta-label">Date</span><span class="meta-value">${new Date(report.generatedDate).toLocaleDateString()}</span></div>
      </div>
      <div class="report-section-block"><div class="section-title"><i class="bi bi-building"></i> Sites Supervised</div><div class="section-content">${escapeHtml(report.sitesSupervised)}</div></div>
      <div class="report-section-block"><div class="section-title"><i class="bi bi-people-fill"></i> Workers Supervised</div><div class="section-content">${escapeHtml(report.workersSupervised)}</div></div>
      <div class="report-stats-row"><div class="stat-box"><div class="stat-number">${report.completedJobs}</div><div class="stat-label">Completed Jobs</div></div><div class="stat-box"><div class="stat-number">${report.pendingJobs}</div><div class="stat-label">Pending Jobs</div></div></div>
      <div class="report-section-block"><div class="section-title"><i class="bi bi-calendar-check"></i> Attendance Summary</div><div class="section-content">${escapeHtml(report.attendanceSummary)}</div></div>
      <div class="report-section-block"><div class="section-title"><i class="bi bi-exclamation-triangle-fill"></i> Issues Encountered</div><div class="section-content">${escapeHtml(report.issuesEncountered)}</div></div>
      <div class="report-section-block"><div class="section-title"><i class="bi bi-lightbulb-fill"></i> Recommendations</div><div class="section-content">${escapeHtml(report.recommendations)}</div></div>
    </div>`;
  
  document.getElementById('reportPreviewContent').innerHTML = previewContent;
  document.getElementById('reportPreviewModal').style.display = 'flex';
  
  const downloadBtn = document.getElementById('gsDownloadReportBtn');
  const submitBtn = document.getElementById('gsSubmitReportBtn');
  if (downloadBtn) downloadBtn.disabled = false;
  if (submitBtn) submitBtn.disabled = false;
  
  showNotification('Report generated! You can now download or submit it.', 'success');
}

function downloadGSReport() {
  if (!gsCurrentGeneratedReport) { showNotification('No report to download.', 'error'); return; }
  
  const report = gsCurrentGeneratedReport;
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>CleanSpark General Supervisor Report - ${report.reportNumber}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1a202c; background: white; }
          @media print { body { margin: 0; padding: 20px; } @page { size: A4; margin: 2cm; } }
          .report-header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #667eea; }
          .report-title { font-size: 24px; font-weight: 800; color: #1a202c; margin-bottom: 8px; }
          .report-subtitle { color: #667eea; font-size: 14px; }
          .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 20px 0; padding: 16px; background: #f7fafc; border-radius: 12px; }
          .meta-item { display: flex; justify-content: space-between; font-size: 13px; }
          .meta-label { font-weight: 600; color: #4a5568; }
          .meta-value { color: #1a202c; }
          .section { margin: 24px 0; }
          .section-title { font-size: 18px; font-weight: 700; color: #1a202c; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
          .section-content { color: #4a5568; line-height: 1.6; padding: 12px; background: #f7fafc; border-radius: 8px; }
          .stats-row { display: flex; gap: 20px; margin: 20px 0; }
          .stat-box { flex: 1; text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea10, #764ba210); border-radius: 12px; }
          .stat-number { font-size: 32px; font-weight: 800; color: #667eea; }
          .stat-label { font-size: 13px; color: #4a5568; margin-top: 4px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #a0aec0; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="report-header">
          <div class="report-title">GENERAL SUPERVISOR WEEKLY REPORT</div>
          <div class="report-subtitle">CleanSpark Cleaning Services</div>
        </div>
        
        <div class="meta-grid">
          <div class="meta-item"><span class="meta-label">Report Number:</span><span class="meta-value">${report.reportNumber}</span></div>
          <div class="meta-item"><span class="meta-label">Week Ending:</span><span class="meta-value">${report.weekEnding}</span></div>
          <div class="meta-item"><span class="meta-label">Generated By:</span><span class="meta-value">${escapeHtml(report.generatedBy)}</span></div>
          <div class="meta-item"><span class="meta-label">Date:</span><span class="meta-value">${new Date(report.generatedDate).toLocaleDateString()}</span></div>
        </div>
        
        <div class="section">
          <div class="section-title"><span>🏢</span> Sites Supervised</div>
          <div class="section-content">${escapeHtml(report.sitesSupervised)}</div>
        </div>
        
        <div class="section">
          <div class="section-title"><span>👥</span> Workers Supervised</div>
          <div class="section-content">${escapeHtml(report.workersSupervised)}</div>
        </div>
        
        <div class="stats-row">
          <div class="stat-box"><div class="stat-number">${report.completedJobs}</div><div class="stat-label">Completed Jobs</div></div>
          <div class="stat-box"><div class="stat-number">${report.pendingJobs}</div><div class="stat-label">Pending Jobs</div></div>
        </div>
        
        <div class="section">
          <div class="section-title"><span>📅</span> Attendance Summary</div>
          <div class="section-content">${escapeHtml(report.attendanceSummary)}</div>
        </div>
        
        <div class="section">
          <div class="section-title"><span>⚠️</span> Issues Encountered</div>
          <div class="section-content">${escapeHtml(report.issuesEncountered)}</div>
        </div>
        
        <div class="section">
          <div class="section-title"><span>💡</span> Recommendations</div>
          <div class="section-content">${escapeHtml(report.recommendations)}</div>
        </div>
        
        <div class="footer">
          <p>This report is generated automatically by CleanSpark Management System</p>
          <p>© ${new Date().getFullYear()} CleanSpark Cleaning Services</p>
        </div>
        
        <div class="no-print" style="text-align:center; margin-top:30px;">
          <button onclick="window.print()" style="padding:12px 30px;background:#667eea;color:white;border:none;border-radius:10px;cursor:pointer;">Print / Save as PDF</button>
        </div>
        <script>setTimeout(function(){ window.print(); }, 500);</script>
      </body>
    </html>
  `);
  printWindow.document.close();
  
  showNotification('Report opened for printing/saving as PDF!', 'success');
  closeReportModal();
}

function submitGSReportToAdmin() {
  if (!gsCurrentGeneratedReport) { showNotification('No report to submit.', 'error'); return; }
  
  gsCurrentGeneratedReport.submittedToAdmin = true;
  gsCurrentGeneratedReport.submittedDate = new Date().toISOString();
  
  gsWeeklyReports.unshift(gsCurrentGeneratedReport);
  saveGSReports();
  displayGSReportHistory();
  
  const reportSummary = `📋 **WEEKLY REPORT SUBMITTED**\nReport #: ${gsCurrentGeneratedReport.reportNumber}\nWeek Ending: ${gsCurrentGeneratedReport.weekEnding}\nSites: ${gsCurrentGeneratedReport.sitesSupervised}\nCompleted Jobs: ${gsCurrentGeneratedReport.completedJobs}\nPending Jobs: ${gsCurrentGeneratedReport.pendingJobs}\n\nIssues: ${gsCurrentGeneratedReport.issuesEncountered.substring(0, 100)}...\nRecommendations: ${gsCurrentGeneratedReport.recommendations.substring(0, 100)}...`;
  
  sendGSChatMessage(reportSummary);
  
  showNotification(`Report #${gsCurrentGeneratedReport.reportNumber} submitted to Admin!`, 'success');
  closeReportModal();
  
  document.getElementById('gsReportSites').value = '';
  document.getElementById('gsReportWorkers').value = '';
  document.getElementById('gsReportCompletedJobs').value = '';
  document.getElementById('gsReportPendingJobs').value = '';
  document.getElementById('gsReportAttendance').value = '';
  document.getElementById('gsReportIssues').value = '';
  document.getElementById('gsReportRecommendations').value = '';
  
  const downloadBtn = document.getElementById('gsDownloadReportBtn');
  const submitBtn = document.getElementById('gsSubmitReportBtn');
  if (downloadBtn) downloadBtn.disabled = true;
  if (submitBtn) submitBtn.disabled = true;
  
  gsCurrentGeneratedReport = null;
}

function saveGSReports() {
  localStorage.setItem('CleanSpark_gs_reports', JSON.stringify(gsWeeklyReports));
}

function displayGSReportHistory() {
  const container = document.getElementById('gsReportHistoryContainer');
  if (!container) return;
  
  if (gsWeeklyReports.length === 0) {
    container.innerHTML = '<div class="empty-state" style="padding:20px;"><i class="bi bi-file-text"></i><h4>No Reports Yet</h4><p>Generate and submit your first weekly report.</p></div>';
    return;
  }
  
  let html = '';
  gsWeeklyReports.forEach(report => {
    const submittedBadge = report.submittedToAdmin ? '<span class="status-badge status-completed" style="font-size:10px;">Submitted</span>' : '<span class="status-badge status-pending" style="font-size:10px;">Draft</span>';
    
    html += `
      <div class="report-history-item">
        <div class="report-history-info">
          <div class="report-history-title">${escapeHtml(report.reportNumber)} - Week Ending ${report.weekEnding}</div>
          <div class="report-history-meta">
            <span><i class="bi bi-building"></i> ${escapeHtml(report.sitesSupervised.substring(0, 30))}${report.sitesSupervised.length > 30 ? '...' : ''}</span>
            <span><i class="bi bi-check-circle"></i> ${report.completedJobs} completed</span>
            <span>${submittedBadge}</span>
          </div>
        </div>
        <div class="report-history-actions">
          <button class="btn-report-download" onclick="downloadGSReportById(${report.id})" title="Download PDF"><i class="bi bi-download"></i></button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function downloadGSReportById(reportId) {
  const report = gsWeeklyReports.find(r => r.id === reportId);
  if (!report) return;
  
  gsCurrentGeneratedReport = report;
  downloadGSReport();
}

// ========== SUPERVISOR FUNCTIONS (Site Supervisor) ==========
function loadStaffForLocation(location) {
  const staffAtLocation = staffMembers.filter(staff => staff.location === location);
  const selectedLocationDisplay = document.getElementById('selectedLocationDisplay');
  const reportLocationField = document.getElementById('reportLocation');
  
  if (selectedLocationDisplay) selectedLocationDisplay.textContent = location;
  if (reportLocationField) reportLocationField.value = location;
  
  const today = new Date().toISOString().split('T')[0];
  
  let html = `
    <table class="attendance-table">
      <thead><tr><th>Staff Name</th><th>Role</th><th>Present Today (10,000 TZS)</th></tr></thead>
      <tbody>`;
  
  staffAtLocation.forEach(staff => {
    const attendance = attendanceRecords.find(rec => rec.staffId === staff.id && rec.date === today);
    const isPresent = attendance ? attendance.present : true;
    const supervisorMark = staff.isSupervisor ? '<span class="supervisor-badge ms-2">Supervisor</span>' : '';
    
    html += `<tr>
      <td>${escapeHtml(staff.name)}${supervisorMark}</td>
      <td>${escapeHtml(staff.role)}</td>
      <td><input type="checkbox" class="attendance-checkbox" data-staff-id="${staff.id}" ${isPresent ? 'checked' : ''}></td>
    </tr>`;
  });
  
  html += `</tbody></table>`;
  
  const attendanceContainer = document.getElementById('attendanceTableContainer');
  if (attendanceContainer) {
    attendanceContainer.innerHTML = html;
    document.querySelectorAll('.attendance-checkbox').forEach(cb => {
      cb.addEventListener('change', function() {
        updateAttendance(parseInt(this.dataset.staffId), this.checked);
      });
    });
  }
  
  const attendanceCard = document.getElementById('attendanceCard');
  if (attendanceCard) attendanceCard.style.display = 'block';
}

function updateAttendance(staffId, isPresent) {
  const today = new Date().toISOString().split('T')[0];
  const existingIndex = attendanceRecords.findIndex(rec => rec.staffId === staffId && rec.date === today);
  
  if (existingIndex !== -1) {
    attendanceRecords[existingIndex].present = isPresent;
  } else {
    const staff = staffMembers.find(s => s.id === staffId);
    if (staff) {
      attendanceRecords.push({ staffId, staffName: staff.name, location: staff.location, date: today, present: isPresent });
    }
  }
  saveAttendanceRecords();
}

function saveAttendanceAndUpdatePayroll() {
  const selectedLocation = document.getElementById('locationSelect').value;
  if (!selectedLocation) { showNotification('Please select a location first', 'error'); return; }
  
  const today = new Date().toISOString().split('T')[0];
  const staffAtLocation = staffMembers.filter(staff => staff.location === selectedLocation);
  let totalPayroll = 0;
  
  staffAtLocation.forEach(staff => {
    const attendance = attendanceRecords.find(rec => rec.staffId === staff.id && rec.date === today);
    if (attendance && attendance.present) totalPayroll += staff.basePayPerDay;
  });
  
  showNotification(`Attendance saved! Total payroll for ${selectedLocation} today: TZS ${formatNumber(totalPayroll)}`, 'success');
}

function generateWeeklyReport() {
  const location = document.getElementById('reportLocation').value;
  const weekEnding = document.getElementById('reportWeekEnding').value;
  const progress = document.getElementById('reportProgress').value;
  const performance = document.getElementById('reportPerformance').value;
  const equipment = document.getElementById('reportEquipment').value;
  const requests = document.getElementById('reportRequests').value;
  
  if (!location) { showNotification('Please select a location first', 'error'); return; }
  if (!weekEnding) { showNotification('Please select the week ending date', 'error'); return; }
  
  const report = {
    id: Date.now(), location, weekEnding,
    progress: progress || 'No progress report provided.',
    performance: performance || 'No performance report provided.',
    equipment: equipment || 'No equipment report provided.',
    requests: requests || 'No additional requests.',
    generatedBy: currentStaff.name,
    generatedDate: new Date().toISOString(),
    reportNumber: `WR-${new Date().getFullYear()}${(new Date().getMonth()+1).toString().padStart(2,'0')}${Math.floor(Math.random()*1000)}`
  };
  
  currentGeneratedReport = report;
  
  const previewContent = `
    <div class="professional-report">
      <div class="report-header-section"><div class="report-title-main">WEEKLY SUPERVISOR REPORT</div><div class="report-subtitle">CleanSpark Cleaning Services</div></div>
      <div class="report-meta-grid">
        <div class="meta-item"><span class="meta-label">Report Number</span><span class="meta-value">${report.reportNumber}</span></div>
        <div class="meta-item"><span class="meta-label">Location</span><span class="meta-value">${escapeHtml(report.location)}</span></div>
        <div class="meta-item"><span class="meta-label">Week Ending</span><span class="meta-value">${report.weekEnding}</span></div>
        <div class="meta-item"><span class="meta-label">Generated By</span><span class="meta-value">${escapeHtml(report.generatedBy)}</span></div>
      </div>
      <div class="report-section-block"><div class="section-title"><i class="bi bi-clipboard-check"></i> Work Progress</div><div class="section-content">${escapeHtml(report.progress)}</div></div>
      <div class="report-section-block"><div class="section-title"><i class="bi bi-people-fill"></i> Worker Performance</div><div class="section-content">${escapeHtml(report.performance)}</div></div>
      <div class="report-section-block"><div class="section-title"><i class="bi bi-tools"></i> Equipment Status</div><div class="section-content">${escapeHtml(report.equipment)}</div></div>
      <div class="report-section-block"><div class="section-title"><i class="bi bi-chat-square-text"></i> Requests</div><div class="section-content">${escapeHtml(report.requests)}</div></div>
    </div>`;
  
  document.getElementById('reportPreviewContent').innerHTML = previewContent;
  document.getElementById('reportPreviewModal').style.display = 'flex';
  document.getElementById('downloadReportBtn').disabled = false;
  document.getElementById('sendReportToAdminBtn').disabled = false;
  document.getElementById('attachReportToChatBtn').disabled = false;
  
  showNotification('Report generated!', 'success');
}

function downloadReport() {
  if (!currentGeneratedReport) { showNotification('No report to download.', 'error'); return; }
  
  const report = currentGeneratedReport;
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html><head><title>CleanSpark Weekly Report</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>body{font-family:'Inter',sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#1a202c;}@media print{body{margin:0;padding:20px;}@page{size:A4;margin:2cm;}}</style></head>
    <body>
      <div style="text-align:center;margin-bottom:30px;"><h1 style="font-size:24px;">WEEKLY SUPERVISOR REPORT</h1><p style="color:#667eea;">CleanSpark Cleaning Services</p></div>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;"><tr><td><strong>Report #:</strong> ${report.reportNumber}</td><td><strong>Location:</strong> ${escapeHtml(report.location)}</td></tr><tr><td><strong>Week Ending:</strong> ${report.weekEnding}</td><td><strong>By:</strong> ${escapeHtml(report.generatedBy)}</td></tr></table>
      <div style="margin:20px 0;"><h3>Work Progress</h3><p>${escapeHtml(report.progress)}</p></div>
      <div style="margin:20px 0;"><h3>Worker Performance</h3><p>${escapeHtml(report.performance)}</p></div>
      <div style="margin:20px 0;"><h3>Equipment Status</h3><p>${escapeHtml(report.equipment)}</p></div>
      <div style="margin:20px 0;"><h3>Requests</h3><p>${escapeHtml(report.requests)}</p></div>
      <div style="text-align:center;margin-top:30px;">
        <button onclick="window.print()" style="padding:12px 30px;background:#667eea;color:white;border:none;border-radius:10px;cursor:pointer;">Print / Save as PDF</button>
      </div>
      <script>setTimeout(function(){window.print();},500);</script>
    </body></html>`);
  printWindow.document.close();
  
  weeklyReports.push(report);
  saveReports();
  showNotification('Report opened for printing!', 'success');
  closeReportModal();
}

function sendReportToAdmin() {
  if (!currentGeneratedReport) { showNotification('No report to send.', 'error'); return; }
  
  const report = currentGeneratedReport;
  sendMessageToChat(`📋 **WEEKLY REPORT**\nLocation: ${report.location}\nWeek: ${report.weekEnding}\nReport #: ${report.reportNumber}\nBy: ${report.generatedBy}\n\nProgress: ${report.progress.substring(0, 100)}...\nRequests: ${report.requests}`, true);
  
  report.sentToAdmin = true;
  report.sentDate = new Date().toISOString();
  weeklyReports.push(report);
  saveReports();
  
  showNotification('Report sent to Admin!', 'success');
  closeReportModal();
}

function closeReportModal() {
  document.getElementById('reportPreviewModal').style.display = 'none';
}

// ========== CHAT FUNCTIONS ==========
function sendMessageToChat(message, isReport = false) {
  if (!message.trim() && !isReport) return;
  
  const newMessage = {
    id: Date.now(),
    sender: currentStaff.name,
    senderEmail: currentStaff.email,
    message: message,
    timestamp: new Date().toISOString(),
    type: "sent",
    isReport: isReport,
    edited: false
  };
  
  chatMessages.unshift(newMessage);
  saveChatMessages();
  displayChatMessages();
  
  if (!isReport) {
    showNotification('Message sent!', 'success');
    document.getElementById('chatMessageInput').value = '';
  }
}

function attachLastReportToChat() {
  if (!currentGeneratedReport) { showNotification('No report generated yet.', 'error'); return; }
  const report = currentGeneratedReport;
  sendMessageToChat(`📋 **WEEKLY REPORT - ${report.location}**\nReport #: ${report.reportNumber}\nWeek: ${report.weekEnding}\n\nProgress: ${report.progress.substring(0, 80)}...\n\nRequests: ${report.requests}`, true);
}

function displayChatMessages() {
  const container = document.getElementById('chatMessagesContainer');
  if (!container) return;
  
  const visibleMessages = chatMessages.filter(msg => !deletedMessagesForMe.includes(msg.id));
  
  if (visibleMessages.length === 0) {
    container.innerHTML = '<div class="chat-placeholder">No messages yet.</div>';
    return;
  }
  
  let html = '';
  visibleMessages.slice().reverse().forEach(msg => {
    const date = new Date(msg.timestamp);
    const messageClass = msg.type === 'sent' ? 'sent' : 'received';
    const senderName = msg.type === 'sent' ? 'You' : msg.sender;
    const isReportMsg = msg.isReport || false;
    
    html += `
      <div class="chat-message-wrapper ${messageClass}" data-message-id="${msg.id}">
        <div class="chat-message ${messageClass}">
          <div style="font-weight: 600; margin-bottom: 4px; font-size: 12px;">${escapeHtml(senderName)}${isReportMsg ? ' 📋' : ''}</div>
          <div class="message-text">${escapeHtml(msg.message)}</div>
          <div class="message-meta">
            ${msg.edited ? '<span class="edited-badge">(edited)</span>' : ''}
            <span>${date.toLocaleString()}</span>
          </div>
        </div>
        <div style="display: flex; gap: 4px; margin-top: 2px; padding: 0 4px;">
          <button onclick="copyMessage(${msg.id})" style="background:none;border:none;cursor:pointer;font-size:11px;color:var(--text-muted);" title="Copy"><i class="bi bi-clipboard"></i></button>
          ${msg.type === 'sent' && !isReportMsg ? `<button onclick="editMessage(${msg.id})" style="background:none;border:none;cursor:pointer;font-size:11px;color:var(--text-muted);" title="Edit"><i class="bi bi-pencil"></i></button>` : ''}
          <button onclick="deleteMessageForMe(${msg.id})" style="background:none;border:none;cursor:pointer;font-size:11px;color:var(--text-muted);" title="Hide"><i class="bi bi-eye-slash"></i></button>
          ${msg.type === 'sent' ? `<button onclick="deleteMessageForAll(${msg.id})" style="background:none;border:none;cursor:pointer;font-size:11px;color:#dc3545;" title="Delete"><i class="bi bi-trash"></i></button>` : ''}
        </div>
      </div>`;
  });
  
  container.innerHTML = html;
}

function copyMessage(messageId) {
  const message = chatMessages.find(msg => msg.id === messageId);
  if (!message) return;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(message.message).then(() => showNotification('Copied!', 'success'));
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = message.message;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showNotification('Copied!', 'success');
  }
}

function editMessage(messageId) {
  const message = chatMessages.find(msg => msg.id === messageId);
  if (!message || message.isReport) { showNotification('Cannot edit report messages', 'warning'); return; }
  
  currentEditingMessageId = messageId;
  document.getElementById('editMessageInput').value = message.message;
  document.getElementById('editMessageModal').style.display = 'flex';
}

function saveEditedMessage() {
  const newText = document.getElementById('editMessageInput').value.trim();
  if (!newText || !currentEditingMessageId) { showNotification('Message cannot be empty', 'error'); return; }
  
  const msgIndex = chatMessages.findIndex(msg => msg.id === currentEditingMessageId);
  if (msgIndex !== -1) {
    chatMessages[msgIndex].message = newText;
    chatMessages[msgIndex].edited = true;
    chatMessages[msgIndex].timestamp = new Date().toISOString();
    saveChatMessages();
    displayChatMessages();
    showNotification('Message updated!', 'success');
  }
  
  cancelEditMessage();
}

function cancelEditMessage() {
  currentEditingMessageId = null;
  document.getElementById('editMessageModal').style.display = 'none';
  document.getElementById('editMessageInput').value = '';
}

function deleteMessageForMe(messageId) {
  if (!deletedMessagesForMe.includes(messageId)) {
    deletedMessagesForMe.push(messageId);
    saveDeletedForMe();
    displayChatMessages();
    showNotification('Message hidden', 'success');
  }
}

function deleteMessageForAll(messageId) {
  const msgIndex = chatMessages.findIndex(msg => msg.id === messageId);
  if (msgIndex !== -1) {
    chatMessages.splice(msgIndex, 1);
    saveChatMessages();
    displayChatMessages();
    showNotification('Message deleted', 'success');
  }
}

// ========== PAYMENT MODULE ==========
function loadPaymentValidations() {
  const stored = localStorage.getItem('CleanSpark_payments');
  paymentValidations = stored ? JSON.parse(stored) : [
    { id: 1, jobId: 104, jobService: "AC Maintenance & Filter", customerName: "Omar Juma", amount: 300000, cashReceived: 300000, change: 0, paymentDate: "2026-03-20", paymentTime: "15:30", status: "completed", receiptNumber: "RCP-20260320-001" },
    { id: 2, jobId: 105, jobService: "Full Villa Cleaning", customerName: "Salma Khamis", amount: 850000, cashReceived: 850000, change: 0, paymentDate: "2026-03-18", paymentTime: "12:15", status: "completed", receiptNumber: "RCP-20260318-002" }
  ];
  savePaymentValidations();
  updatePaymentStats();
  loadRecentPayments();
}

function savePaymentValidations() {
  localStorage.setItem('CleanSpark_payments', JSON.stringify(paymentValidations));
}

function updatePaymentStats() {
  const totalPayments = paymentValidations.length;
  const totalAmount = paymentValidations.reduce((sum, p) => sum + p.amount, 0);
  const today = new Date().toISOString().split('T')[0];
  const todayPayments = paymentValidations.filter(p => p.paymentDate === today).length;
  const todayAmount = paymentValidations.filter(p => p.paymentDate === today).reduce((sum, p) => sum + p.amount, 0);
  
  document.getElementById('paymentStatsGrid').innerHTML = `
    <div class="payment-stat-card clickable-indicator" onclick="showPaymentStatsDetail('totalPayments')"><div class="payment-stat-icon"><i class="bi bi-receipt"></i></div><div class="payment-stat-value">${totalPayments}</div><div class="payment-stat-label">Total Payments</div></div>
    <div class="payment-stat-card clickable-indicator" onclick="showPaymentStatsDetail('totalRevenue')"><div class="payment-stat-icon"><i class="bi bi-cash-stack"></i></div><div class="payment-stat-value">TZS ${formatNumber(totalAmount)}</div><div class="payment-stat-label">Total Revenue</div></div>
    <div class="payment-stat-card clickable-indicator" onclick="showPaymentStatsDetail('todayPayments')"><div class="payment-stat-icon"><i class="bi bi-calendar-today"></i></div><div class="payment-stat-value">${todayPayments}</div><div class="payment-stat-label">Today's Payments</div></div>
    <div class="payment-stat-card clickable-indicator" onclick="showPaymentStatsDetail('todayRevenue')"><div class="payment-stat-icon"><i class="bi bi-graph-up"></i></div><div class="payment-stat-value">TZS ${formatNumber(todayAmount)}</div><div class="payment-stat-label">Today's Revenue</div></div>`;
}

function loadCompletedJobsForPayment() {
  const completedJobs = jobs.filter(job => job.status === 'completed');
  const jobSelect = document.getElementById('jobSelect');
  if (!jobSelect) return;
  
  const pendingJobs = completedJobs.filter(job => !paymentValidations.some(p => p.jobId === job.id));
  
  if (pendingJobs.length === 0) {
    jobSelect.innerHTML = '<option value="">-- No pending payments --</option>';
    return;
  }
  
  let options = '<option value="">-- Select a completed job --</option>';
  pendingJobs.forEach(job => {
    options += `<option value="${job.id}" data-service="${escapeHtml(job.service)}" data-client="${escapeHtml(job.client)}" data-price="${job.price}">${job.service} - ${job.client} (TZS ${formatNumber(job.price)})</option>`;
  });
  
  jobSelect.innerHTML = options;
  
  jobSelect.onchange = function() {
    const selectedOption = this.options[this.selectedIndex];
    if (this.value) {
      document.getElementById('customerName').value = selectedOption.getAttribute('data-client');
      document.getElementById('serviceAmount').value = `TZS ${formatNumber(parseInt(selectedOption.getAttribute('data-price')))}`;
      document.getElementById('cashReceived').value = '';
      document.getElementById('paymentNote').value = '';
      selectedJobForPayment = {
        id: parseInt(this.value),
        service: selectedOption.getAttribute('data-service'),
        client: selectedOption.getAttribute('data-client'),
        price: parseInt(selectedOption.getAttribute('data-price'))
      };
    } else {
      document.getElementById('customerName').value = '';
      document.getElementById('serviceAmount').value = '';
      selectedJobForPayment = null;
    }
  };
}

function validateCashPayment() {
  const jobSelect = document.getElementById('jobSelect');
  const cashReceivedInput = document.getElementById('cashReceived');
  const paymentNote = document.getElementById('paymentNote').value;
  
  if (!jobSelect || !jobSelect.value) { showNotification('Please select a job', 'error'); return; }
  if (!selectedJobForPayment) { showNotification('Invalid job selection', 'error'); return; }
  
  const cashReceived = parseFloat(cashReceivedInput.value);
  if (isNaN(cashReceived) || cashReceived <= 0) { showNotification('Please enter a valid amount', 'error'); return; }
  
  const serviceAmount = selectedJobForPayment.price;
  if (cashReceived < serviceAmount) { showNotification(`Insufficient payment! Need TZS ${formatNumber(serviceAmount - cashReceived)} more.`, 'error'); return; }
  
  const change = cashReceived - serviceAmount;
  
  const paymentRecord = {
    id: paymentValidations.length + 1,
    jobId: selectedJobForPayment.id,
    jobService: selectedJobForPayment.service,
    customerName: selectedJobForPayment.client,
    amount: serviceAmount,
    cashReceived: cashReceived,
    change: change,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentTime: new Date().toLocaleTimeString(),
    status: "completed",
    receiptNumber: `RCP-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}${String(new Date().getDate()).padStart(2,'0')}-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`,
    note: paymentNote
  };
  
  paymentValidations.push(paymentRecord);
  savePaymentValidations();
  generateReceipt(paymentRecord);
  updatePaymentStats();
  loadRecentPayments();
  loadCompletedJobsForPayment();
  
  cashReceivedInput.value = '';
  document.getElementById('paymentNote').value = '';
  jobSelect.value = '';
  document.getElementById('customerName').value = '';
  document.getElementById('serviceAmount').value = '';
  selectedJobForPayment = null;
  
  showNotification(`Payment validated! Receipt #${paymentRecord.receiptNumber}`, 'success');
}

function generateReceipt(payment) {
  document.getElementById('receiptContent').innerHTML = `
    <div style="text-align:center;"><h4>PAYMENT RECEIPT</h4><p style="color:#718096;">Thank you for choosing CleanSpark</p></div>
    <div class="receipt-details">
      <div class="receipt-row"><span class="receipt-label">Receipt #:</span><span class="receipt-value">${payment.receiptNumber}</span></div>
      <div class="receipt-row"><span class="receipt-label">Date:</span><span class="receipt-value">${payment.paymentDate} | ${payment.paymentTime}</span></div>
      <div class="receipt-row"><span class="receipt-label">Customer:</span><span class="receipt-value">${escapeHtml(payment.customerName)}</span></div>
      <div class="receipt-row"><span class="receipt-label">Service:</span><span class="receipt-value">${escapeHtml(payment.jobService)}</span></div>
      <div class="receipt-row"><span class="receipt-label">Amount:</span><span class="receipt-value">TZS ${formatNumber(payment.amount)}</span></div>
      <div class="receipt-row"><span class="receipt-label">Received:</span><span class="receipt-value">TZS ${formatNumber(payment.cashReceived)}</span></div>
      ${payment.change > 0 ? `<div class="receipt-row"><span class="receipt-label">Change:</span><span class="receipt-value">TZS ${formatNumber(payment.change)}</span></div>` : ''}
      <div class="receipt-total"><strong>PAID IN FULL</strong></div>
    </div>`;
  document.getElementById('receiptModal').style.display = 'flex';
  window.currentReceipt = payment;
}

function loadRecentPayments() {
  const container = document.getElementById('recentPaymentsContainer');
  if (!container) return;
  
  const recentPayments = [...paymentValidations].reverse().slice(0, 10);
  
  if (recentPayments.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding:30px;"><i class="bi bi-receipt"></i><h4>No Payments Yet</h4></div>`;
    return;
  }
  
  container.innerHTML = recentPayments.map(payment => `
    <div class="payment-item">
      <div class="payment-info">
        <div class="payment-job">${escapeHtml(payment.jobService)}</div>
        <div class="payment-details"><span><i class="bi bi-person"></i> ${escapeHtml(payment.customerName)}</span><span><i class="bi bi-receipt"></i> ${payment.receiptNumber}</span></div>
        <span class="payment-status">Validated</span>
      </div>
      <div class="payment-amount"><div class="amount-value">TZS ${formatNumber(payment.amount)}</div><div class="payment-date">${payment.paymentDate}</div></div>
    </div>`).join('');
}

function closeReceiptModal() { document.getElementById('receiptModal').style.display = 'none'; }

function printReceipt() {
  const receiptContent = document.getElementById('receiptContent')?.innerHTML;
  if (!receiptContent) return;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`<html><head><title>Receipt</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet"><style>body{font-family:'Inter',sans-serif;padding:40px;max-width:600px;margin:0 auto;}.receipt-details{margin:20px 0;}.receipt-row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px dashed #e2e8f0;}.receipt-label{font-weight:600;color:#4a5568;}.receipt-value{color:#1a202c;font-weight:500;}.receipt-total{margin-top:20px;padding-top:12px;border-top:2px solid #1a202c;font-size:18px;font-weight:800;color:#28a745;text-align:right;}@media print{body{padding:0;}}</style></head><body>${receiptContent}<div style="text-align:center;margin-top:20px;"><button onclick="window.print()" style="padding:10px 20px;background:#667eea;color:white;border:none;border-radius:8px;cursor:pointer;">Print</button></div></body></html>`);
  printWindow.document.close();
}

function initPaymentModule() {
  loadPaymentValidations();
  loadCompletedJobsForPayment();
}

// ========== HELPER FUNCTIONS ==========
function showNotification(message, type = 'info') {
  const toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) return;
  
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  
  let icon = 'bi-info-circle-fill';
  let borderColor = '#0d6efd';
  
  if (type === 'success') { icon = 'bi-check-circle-fill'; borderColor = '#198754'; }
  else if (type === 'error') { icon = 'bi-exclamation-triangle-fill'; borderColor = '#dc3545'; }
  else if (type === 'warning') { icon = 'bi-exclamation-triangle-fill'; borderColor = '#ffc107'; }
  
  toast.style.borderLeftColor = borderColor;
  toast.innerHTML = `<div class="d-flex align-items-center gap-2"><i class="bi ${icon}" style="color:${borderColor};font-size:16px;"></i><span class="flex-grow-1" style="font-size:13px;">${escapeHtml(message)}</span><button class="btn-close btn-sm" onclick="this.closest('.toast-notification').remove()"></button></div>`;
  
  toastContainer.appendChild(toast);
  setTimeout(() => { if (toast && toast.remove) toast.remove(); }, 4000);
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