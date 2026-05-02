// staff.js

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
  supervisorLocation: "Zanzibar University"
};

// Additional supervisor accounts for demo
const supervisorAccounts = [
  { id: 2, email: "zssf.supervisor@CleanSpark.com", password: "1234", name: "Ali Hassan", role: "Site Supervisor", phone: "+255 777 111 222", joinDate: "2024-02-01", isSupervisor: true, supervisorLocation: "ZSSF" },
  { id: 3, email: "mall.supervisor@CleanSpark.com", password: "1234", name: "Fatma Omar", role: "Site Supervisor", phone: "+255 777 333 444", joinDate: "2024-02-15", isSupervisor: true, supervisorLocation: "Michenzani Mall" },
  { id: 4, email: "uni.supervisor@CleanSpark.com", password: "1234", name: "Said Juma", role: "Site Supervisor", phone: "+255 777 555 666", joinDate: "2024-01-20", isSupervisor: true, supervisorLocation: "Zanzibar University" }
];

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
    price: 230000,
    description: "Complete deep cleaning of a 3-bedroom house including kitchen, bathrooms, and living areas.",
    requirements: "Bring heavy-duty cleaning equipment and eco-friendly products"
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
    price: 525000,
    description: "Steam cleaning of 500 sqm office carpet area across 3 floors.",
    requirements: "Professional steam cleaner machine required"
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
    price: 187500,
    description: "Complete kitchen sanitization including appliances, countertops, and storage areas.",
    requirements: "Food-grade sanitizers only"
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
    price: 300000,
    completedDate: "2026-03-20",
    description: "Maintenance and filter replacement for 4 AC units.",
    requirements: "Bring replacement filters and cleaning solution"
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
    price: 850000,
    completedDate: "2026-03-18",
    description: "Complete villa cleaning including 5 bedrooms, pool area, and garden maintenance.",
    requirements: "Team of 4 cleaners recommended"
  }
];

// ========== STAFF DATABASE FOR ATTENDANCE ==========
const staffMembers = [
  { id: 1, name: "Mudrik Dau", role: "Senior Cleaning Specialist", isSupervisor: true, location: "Zanzibar University", basePayPerDay: 10000 },
  { id: 2, name: "Ali Hassan", role: "Site Supervisor", isSupervisor: true, location: "ZSSF", basePayPerDay: 10000 },
  { id: 3, name: "Fatma Omar", role: "Site Supervisor", isSupervisor: true, location: "Michenzani Mall", basePayPerDay: 10000 },
  { id: 4, name: "Said Juma", role: "Site Supervisor", isSupervisor: true, location: "Zanzibar University", basePayPerDay: 10000 },
  { id: 5, name: "John Mwinyi", role: "Cleaning Technician", isSupervisor: false, location: "Zanzibar University", basePayPerDay: 10000 },
  { id: 6, name: "Aisha Abdallah", role: "Cleaning Technician", isSupervisor: false, location: "Zanzibar University", basePayPerDay: 10000 },
  { id: 7, name: "James Mrema", role: "Cleaning Technician", isSupervisor: false, location: "ZSSF", basePayPerDay: 10000 },
  { id: 8, name: "Sophia Mohamed", role: "Cleaning Technician", isSupervisor: false, location: "Michenzani Mall", basePayPerDay: 10000 },
  { id: 9, name: "Hamza Rashid", role: "Cleaning Assistant", isSupervisor: false, location: "Zanzibar University", basePayPerDay: 10000 },
  { id: 10, name: "Zainabu Salim", role: "Cleaning Assistant", isSupervisor: false, location: "Michenzani Mall", basePayPerDay: 10000 }
];

// ========== SUPERVISOR DATA STORAGE ==========
let attendanceRecords = [];
let weeklyReports = [];
let chatMessages = [];
let deletedMessagesForMe = []; // Track messages deleted for current user
let currentEditingMessageId = null;
let currentActionMessageId = null;

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

// ========== SUPERVISOR FUNCTIONS ==========
function toggleSupervisorMenu() {
  const supervisorNavBtn = document.getElementById('supervisorNavBtn');
  if (currentStaff && currentStaff.isSupervisor) {
    supervisorNavBtn.style.display = 'flex';
  } else {
    supervisorNavBtn.style.display = 'none';
    const activeView = document.querySelector('.content-view.active');
    if (activeView && activeView.id === 'supervisorView') {
      document.querySelector('[data-view="jobs"]').click();
    }
  }
}

function loadStaffForLocation(location) {
  const staffAtLocation = staffMembers.filter(staff => staff.location === location);
  const selectedLocationDisplay = document.getElementById('selectedLocationDisplay');
  const reportLocationField = document.getElementById('reportLocation');
  
  if (selectedLocationDisplay) selectedLocationDisplay.textContent = location;
  if (reportLocationField) reportLocationField.value = location;
  
  const today = new Date().toISOString().split('T')[0];
  
  let html = `
    <table class="attendance-table">
      <thead>
        <tr><th>Staff Name</th><th>Role</th><th>Present Today (10,000 TZS)</th></tr>
      </thead>
      <tbody>
  `;
  
  staffAtLocation.forEach(staff => {
    const attendance = attendanceRecords.find(rec => rec.staffId === staff.id && rec.date === today);
    const isPresent = attendance ? attendance.present : true;
    const supervisorMark = staff.isSupervisor ? '<span class="supervisor-badge ms-2">Supervisor</span>' : '';
    
    html += `
      <tr>
        <td>${escapeHtml(staff.name)}${supervisorMark}</td>
        <td>${escapeHtml(staff.role)}</td>
        <td>
          <input type="checkbox" class="attendance-checkbox" data-staff-id="${staff.id}" ${isPresent ? 'checked' : ''}>
        </td>
      </tr>
    `;
  });
  
  html += `</tbody></table>`;
  
  const attendanceContainer = document.getElementById('attendanceTableContainer');
  if (attendanceContainer) {
    attendanceContainer.innerHTML = html;
    
    document.querySelectorAll('.attendance-checkbox').forEach(cb => {
      cb.addEventListener('change', function() {
        const staffId = parseInt(this.dataset.staffId);
        updateAttendance(staffId, this.checked);
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
      attendanceRecords.push({
        staffId: staffId,
        staffName: staff.name,
        location: staff.location,
        date: today,
        present: isPresent
      });
    }
  }
  
  saveAttendanceRecords();
  showNotification(`Attendance updated for ${staffMembers.find(s => s.id === staffId)?.name}`, 'success');
}

function saveAttendanceAndUpdatePayroll() {
  const selectedLocation = document.getElementById('locationSelect').value;
  if (!selectedLocation) {
    showNotification('Please select a location first', 'error');
    return;
  }
  
  const today = new Date().toISOString().split('T')[0];
  const staffAtLocation = staffMembers.filter(staff => staff.location === selectedLocation);
  let totalPayroll = 0;
  
  staffAtLocation.forEach(staff => {
    const attendance = attendanceRecords.find(rec => rec.staffId === staff.id && rec.date === today);
    if (attendance && attendance.present) {
      totalPayroll += staff.basePayPerDay;
    }
  });
  
  showNotification(`Attendance saved! Total payroll for ${selectedLocation} today: TZS ${formatNumber(totalPayroll)}`, 'success');
  console.log(`Payroll for ${selectedLocation} on ${today}: TZS ${totalPayroll}`);
}

// Report Generation Functions
let currentGeneratedReport = null;

function generateWeeklyReport() {
  const location = document.getElementById('reportLocation').value;
  const weekEnding = document.getElementById('reportWeekEnding').value;
  const progress = document.getElementById('reportProgress').value;
  const performance = document.getElementById('reportPerformance').value;
  const equipment = document.getElementById('reportEquipment').value;
  const requests = document.getElementById('reportRequests').value;
  
  if (!location) {
    showNotification('Please select a location first', 'error');
    return;
  }
  
  if (!weekEnding) {
    showNotification('Please select the week ending date', 'error');
    return;
  }
  
  const report = {
    id: Date.now(),
    location: location,
    weekEnding: weekEnding,
    progress: progress || 'No progress report provided.',
    performance: performance || 'No performance report provided.',
    equipment: equipment || 'No equipment report provided.',
    requests: requests || 'No additional requests.',
    generatedBy: currentStaff.name,
    generatedDate: new Date().toISOString(),
    reportNumber: `WR-${new Date().getFullYear()}${(new Date().getMonth()+1).toString().padStart(2,'0')}${Math.floor(Math.random()*1000)}`
  };
  
  currentGeneratedReport = report;
  
  // Professional report preview
  const previewContent = `
    <div class="professional-report">
      <div class="report-header-section">
        <div class="report-title-main">WEEKLY SUPERVISOR REPORT</div>
        <div class="report-subtitle">CleanSpark Cleaning Services</div>
      </div>
      
      <div class="report-meta-grid">
        <div class="meta-item">
          <span class="meta-label">Report Number</span>
          <span class="meta-value">${report.reportNumber}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Location</span>
          <span class="meta-value">${escapeHtml(report.location)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Week Ending</span>
          <span class="meta-value">${report.weekEnding}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Generated By</span>
          <span class="meta-value">${escapeHtml(report.generatedBy)}</span>
        </div>
      </div>
      
      <div class="report-section-block">
        <div class="section-title">
          <i class="bi bi-clipboard-check"></i> Work Progress & Observations
        </div>
        <div class="section-content">${escapeHtml(report.progress)}</div>
      </div>
      
      <div class="report-section-block">
        <div class="section-title">
          <i class="bi bi-people-fill"></i> Worker Performance
        </div>
        <div class="section-content">${escapeHtml(report.performance)}</div>
      </div>
      
      <div class="report-section-block">
        <div class="section-title">
          <i class="bi bi-tools"></i> Equipment Status
        </div>
        <div class="section-content">${escapeHtml(report.equipment)}</div>
      </div>
      
      <div class="report-section-block">
        <div class="section-title">
          <i class="bi bi-chat-square-text"></i> Additional Requests / Comments
        </div>
        <div class="section-content">${escapeHtml(report.requests)}</div>
      </div>
      
      <div class="report-footer-section">
        <div class="signature-block">
          <div class="signature-line"></div>
          <div class="signature-name">${escapeHtml(report.generatedBy)}</div>
          <div class="signature-role">Site Supervisor</div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #718096;">
          <div>Generated: ${new Date(report.generatedDate).toLocaleString()}</div>
          <div>CleanSpark Cleaning Services © ${new Date().getFullYear()}</div>
        </div>
      </div>
    </div>
  `;
  
  const previewContainer = document.getElementById('reportPreviewContent');
  if (previewContainer) previewContainer.innerHTML = previewContent;
  
  const reportModal = document.getElementById('reportPreviewModal');
  if (reportModal) reportModal.style.display = 'flex';
  
  document.getElementById('downloadReportBtn').disabled = false;
  document.getElementById('sendReportToAdminBtn').disabled = false;
  document.getElementById('attachReportToChatBtn').disabled = false;
  
  showNotification('Report generated successfully!', 'success');
}

function downloadReport() {
  if (!currentGeneratedReport) {
    showNotification('No report to download.', 'error');
    return;
  }
  
  const report = currentGeneratedReport;
  
  // Create professional HTML content for PDF
  const reportHTML = `
    <div class="professional-report">
      <div class="report-header-section" style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #667eea;">
        <div class="report-title-main" style="font-size: 24px; font-weight: 800; color: #1a202c; margin-bottom: 8px;">WEEKLY SUPERVISOR REPORT</div>
        <div class="report-subtitle" style="font-size: 14px; color: #667eea; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">CleanSpark Cleaning Services</div>
      </div>
      
      <div class="report-meta-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 24px 0; padding: 20px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div><span style="font-weight: 700; color: #667eea;">Report Number:</span> ${report.reportNumber}</div>
        <div><span style="font-weight: 700; color: #667eea;">Location:</span> ${escapeHtml(report.location)}</div>
        <div><span style="font-weight: 700; color: #667eea;">Week Ending:</span> ${report.weekEnding}</div>
        <div><span style="font-weight: 700; color: #667eea;">Generated By:</span> ${escapeHtml(report.generatedBy)}</div>
      </div>
      
      <div style="margin-bottom: 24px; padding: 20px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
        <h4 style="color: #667eea; font-size: 16px; margin-bottom: 12px;">Work Progress & Observations</h4>
        <p style="line-height: 1.8;">${escapeHtml(report.progress)}</p>
      </div>
      
      <div style="margin-bottom: 24px; padding: 20px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
        <h4 style="color: #667eea; font-size: 16px; margin-bottom: 12px;">Worker Performance</h4>
        <p style="line-height: 1.8;">${escapeHtml(report.performance)}</p>
      </div>
      
      <div style="margin-bottom: 24px; padding: 20px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
        <h4 style="color: #667eea; font-size: 16px; margin-bottom: 12px;">Equipment Status</h4>
        <p style="line-height: 1.8;">${escapeHtml(report.equipment)}</p>
      </div>
      
      <div style="margin-bottom: 24px; padding: 20px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
        <h4 style="color: #667eea; font-size: 16px; margin-bottom: 12px;">Additional Requests / Comments</h4>
        <p style="line-height: 1.8;">${escapeHtml(report.requests)}</p>
      </div>
      
      <div style="margin-top: 32px; padding-top: 20px; border-top: 2px solid #e2e8f0; display: flex; justify-content: space-between;">
        <div style="text-align: center;">
          <div style="border-bottom: 1px solid #4a5568; width: 200px; margin: 8px auto;"></div>
          <div style="font-weight: 600;">${escapeHtml(report.generatedBy)}</div>
          <div style="font-size: 12px; color: #718096;">Site Supervisor</div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #718096;">
          <div>Generated: ${new Date(report.generatedDate).toLocaleString()}</div>
          <div>CleanSpark © ${new Date().getFullYear()}</div>
        </div>
      </div>
    </div>
  `;
  
  // Open in new window and trigger print to PDF
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
    <head>
      <title>CleanSpark Weekly Report - ${report.reportNumber}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Inter', 'Segoe UI', sans-serif;
          max-width: 800px;
          margin: 40px auto;
          padding: 20px;
          color: #1a202c;
        }
        @media print {
          body { margin: 0; padding: 20px; }
          @page { size: A4; margin: 2cm; }
        }
      </style>
    </head>
    <body>
      ${reportHTML}
      <div style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()" style="padding: 12px 30px; background: #667eea; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; margin-right: 10px;">
          🖨️ Print / Save as PDF
        </button>
        <button onclick="window.close()" style="padding: 12px 30px; background: #e2e8f0; color: #4a5568; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer;">
          Close
        </button>
      </div>
      <script>
        window.onload = function() {
          // Auto-trigger print dialog for PDF saving
          setTimeout(function() {
            window.print();
          }, 500);
        }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
  
  weeklyReports.push(report);
  saveReports();
  
  showNotification('Report opened for printing! Use Save as PDF option.', 'success');
  closeReportModal();
}

function sendReportToAdmin() {
  if (!currentGeneratedReport) {
    showNotification('No report to send.', 'error');
    return;
  }
  
  const report = currentGeneratedReport;
  const messageContent = `📋 **WEEKLY REPORT SUBMITTED**\n\nLocation: ${report.location}\nWeek Ending: ${report.weekEnding}\nReport #: ${report.reportNumber}\nGenerated by: ${report.generatedBy}\n\nProgress Summary: ${report.progress.substring(0, 100)}${report.progress.length > 100 ? '...' : ''}\n\nRequests: ${report.requests.substring(0, 100)}${report.requests.length > 100 ? '...' : ''}`;
  
  sendMessageToChat(messageContent, true);
  
  report.sentToAdmin = true;
  report.sentDate = new Date().toISOString();
  weeklyReports.push(report);
  saveReports();
  
  showNotification('Report sent to Admin successfully!', 'success');
  closeReportModal();
}

function closeReportModal() {
  const reportModal = document.getElementById('reportPreviewModal');
  if (reportModal) reportModal.style.display = 'none';
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
    const chatInput = document.getElementById('chatMessageInput');
    if (chatInput) chatInput.value = '';
  }
  
  if (isReport) {
    showNotification('Report attached and sent!', 'success');
    setTimeout(() => {
      const adminResponse = {
        id: Date.now() + 1,
        sender: "Admin",
        senderEmail: "admin@cleanspark.com",
        message: "Thank you for submitting the weekly report. I will review it shortly.",
        timestamp: new Date().toISOString(),
        type: "received",
        edited: false
      };
      chatMessages.unshift(adminResponse);
      saveChatMessages();
      displayChatMessages();
      showNotification('New message from Admin', 'info');
    }, 2000);
  }
}

function attachLastReportToChat() {
  if (!currentGeneratedReport) {
    showNotification('No report generated yet.', 'error');
    return;
  }
  
  const report = currentGeneratedReport;
  const messageWithReport = `📋 **WEEKLY REPORT - ${report.location}**\nReport #: ${report.reportNumber}\nWeek Ending: ${report.weekEnding}\n\nWork Progress: ${report.progress.substring(0, 80)}...\n\nRequests: ${report.requests}`;
  
  sendMessageToChat(messageWithReport, true);
}

function displayChatMessages() {
  const container = document.getElementById('chatMessagesContainer');
  if (!container) return;
  
  // Filter out messages deleted for current user
  const visibleMessages = chatMessages.filter(msg => !deletedMessagesForMe.includes(msg.id));
  
  if (visibleMessages.length === 0) {
    container.innerHTML = '<div class="chat-placeholder">No messages yet. Send a message to the Admin.</div>';
    return;
  }
  
  let html = '';
  visibleMessages.slice().reverse().forEach(msg => {
    const date = new Date(msg.timestamp);
    const formattedTime = date.toLocaleString();
    const messageClass = msg.type === 'sent' ? 'sent' : 'received';
    const senderName = msg.type === 'sent' ? 'You' : msg.sender;
    const isReportMsg = msg.isReport || false;
    
    html += `
      <div class="chat-message-wrapper ${messageClass}" data-message-id="${msg.id}">
        ${msg.type === 'sent' ? `
        <div class="message-actions">
          <button class="message-action-btn" onclick="copyMessage(${msg.id})" title="Copy">
            <i class="bi bi-clipboard"></i> Copy
          </button>
          ${!isReportMsg ? `
          <button class="message-action-btn" onclick="editMessage(${msg.id})" title="Edit">
            <i class="bi bi-pencil"></i> Edit
          </button>
          ` : ''}
          <button class="message-action-btn" onclick="deleteMessageForMe(${msg.id})" title="Delete for me">
            <i class="bi bi-eye-slash"></i> Hide
          </button>
          <button class="message-action-btn" onclick="deleteMessageForAll(${msg.id})" title="Delete for everyone">
            <i class="bi bi-trash"></i> Delete
          </button>
        </div>
        ` : `
        <div class="message-actions">
          <button class="message-action-btn" onclick="copyMessage(${msg.id})" title="Copy">
            <i class="bi bi-clipboard"></i> Copy
          </button>
        </div>
        `}
        <div class="chat-message ${messageClass}">
          <div style="font-weight: 600; margin-bottom: 4px; font-size: 13px;">
            ${escapeHtml(senderName)}${isReportMsg ? ' 📋' : ''}
          </div>
          <div class="message-text">${escapeHtml(msg.message)}</div>
          <div class="message-meta">
            ${msg.edited ? '<span class="edited-badge">(edited)</span>' : ''}
            <span>${formattedTime}</span>
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  container.scrollTop = container.scrollHeight;
}

function copyMessage(messageId) {
  const message = chatMessages.find(msg => msg.id === messageId);
  if (!message) return;
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(message.message).then(() => {
      showNotification('Message copied to clipboard!', 'success');
    }).catch(() => {
      fallbackCopy(message.message);
    });
  } else {
    fallbackCopy(message.message);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showNotification('Message copied to clipboard!', 'success');
  } catch (err) {
    showNotification('Failed to copy message', 'error');
  }
  document.body.removeChild(textarea);
}

function editMessage(messageId) {
  const message = chatMessages.find(msg => msg.id === messageId);
  if (!message) return;
  
  if (message.isReport) {
    showNotification('Report messages cannot be edited', 'warning');
    return;
  }
  
  currentEditingMessageId = messageId;
  
  const editInput = document.getElementById('editMessageInput');
  const editModal = document.getElementById('editMessageModal');
  
  if (editInput) editInput.value = message.message;
  if (editModal) editModal.style.display = 'flex';
}

function saveEditedMessage() {
  const editInput = document.getElementById('editMessageInput');
  const editModal = document.getElementById('editMessageModal');
  
  if (!editInput || !currentEditingMessageId) return;
  
  const newText = editInput.value.trim();
  if (!newText) {
    showNotification('Message cannot be empty', 'error');
    return;
  }
  
  const messageIndex = chatMessages.findIndex(msg => msg.id === currentEditingMessageId);
  if (messageIndex !== -1) {
    chatMessages[messageIndex].message = newText;
    chatMessages[messageIndex].edited = true;
    chatMessages[messageIndex].timestamp = new Date().toISOString();
    saveChatMessages();
    displayChatMessages();
    showNotification('Message updated!', 'success');
  }
  
  currentEditingMessageId = null;
  if (editModal) editModal.style.display = 'none';
  if (editInput) editInput.value = '';
}

function cancelEditMessage() {
  currentEditingMessageId = null;
  const editModal = document.getElementById('editMessageModal');
  const editInput = document.getElementById('editMessageInput');
  
  if (editModal) editModal.style.display = 'none';
  if (editInput) editInput.value = '';
}

function deleteMessageForMe(messageId) {
  if (!deletedMessagesForMe.includes(messageId)) {
    deletedMessagesForMe.push(messageId);
    saveDeletedForMe();
    displayChatMessages();
    showNotification('Message hidden from your view', 'success');
  }
}

function deleteMessageForAll(messageId) {
  const messageIndex = chatMessages.findIndex(msg => msg.id === messageId);
  if (messageIndex !== -1) {
    chatMessages.splice(messageIndex, 1);
    saveChatMessages();
    displayChatMessages();
    showNotification('Message deleted for everyone', 'success');
  }
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
  const thisWeekPayments = paymentValidations.filter(p => {
    const paymentDate = new Date(p.paymentDate);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return paymentDate >= weekAgo;
  });
  const thisWeekAmount = thisWeekPayments.reduce((sum, p) => sum + p.amount, 0);
  
  let contentHtml = '';
  
  switch(statType) {
    case 'totalPayments':
      if (icon) icon.className = 'bi bi-receipt';
      if (title) title.textContent = 'Total Validated Payments';
      
      contentHtml = `
        <div class="detail-group">
          <div class="detail-group-header">
            <i class="bi bi-receipt"></i>
            <h4>Payment Statistics</h4>
          </div>
          <div class="detail-item">
            <span class="detail-label"><i class="bi bi-receipt-cutoff"></i> Total Payments</span>
            <span class="detail-value" style="font-size: 24px; font-weight: 700; color: #667eea;">${totalPayments}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label"><i class="bi bi-calendar-week"></i> This Week</span>
            <span class="detail-value">${thisWeekPayments.length} payments</span>
          </div>
          <div class="detail-item">
            <span class="detail-label"><i class="bi bi-calendar-day"></i> Today</span>
            <span class="detail-value">${todayPayments.length} payments</span>
          </div>
          <div class="detail-item">
            <span class="detail-label"><i class="bi bi-check-circle"></i> Average Per Day</span>
            <span class="detail-value">${(totalPayments / Math.max(1, Math.ceil((new Date() - new Date('2026-03-01')) / (1000 * 60 * 60 * 24)))).toFixed(1)}</span>
          </div>
        </div>
        
        <div class="detail-group">
          <div class="detail-group-header">
            <i class="bi bi-list-check"></i>
            <h4>Recent Validated Payments</h4>
          </div>
          <ul class="people-list">
            ${paymentValidations.slice(-5).reverse().map(p => `
              <li class="people-list-item">
                <div class="people-avatar">${p.customerName.charAt(0)}</div>
                <div class="people-info">
                  <div class="people-name">${escapeHtml(p.customerName)}</div>
                  <div class="people-detail">${escapeHtml(p.jobService)}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 700; color: #28a745;">TZS ${formatNumber(p.amount)}</div>
                  <div style="font-size: 11px; color: #a0aec0;">${p.paymentDate}</div>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
      break;
      
    case 'totalRevenue':
      if (icon) icon.className = 'bi bi-cash-stack';
      if (title) title.textContent = 'Total Revenue Details';
      
      contentHtml = `
        <div class="detail-group">
          <div class="detail-group-header">
            <i class="bi bi-cash"></i>
            <h4>Revenue Overview</h4>
          </div>
          <div class="detail-item">
            <span class="detail-label"><i class="bi bi-cash-stack"></i> Total Revenue</span>
            <span class="detail-value" style="font-size: 24px; font-weight: 700; color: #28a745;">TZS ${formatNumber(totalAmount)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label"><i class="bi bi-calendar-week"></i> This Week</span>
            <span class="detail-value">TZS ${formatNumber(thisWeekAmount)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label"><i class="bi bi-calendar-day"></i> Today</span>
            <span class="detail-value">TZS ${formatNumber(todayAmount)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label"><i class="bi bi-calculator"></i> Average Per Transaction</span>
            <span class="detail-value">TZS ${formatNumber(totalPayments > 0 ? Math.round(totalAmount / totalPayments) : 0)}</span>
          </div>
        </div>
        
        <div class="detail-group">
          <div class="detail-group-header">
            <i class="bi bi-graph-up"></i>
            <h4>Revenue by Service</h4>
          </div>
          ${getRevenueByService().map(item => `
            <div class="detail-item">
              <span class="detail-label">${escapeHtml(item.service)}</span>
              <span class="detail-value">TZS ${formatNumber(item.amount)} (${item.count}x)</span>
            </div>
          `).join('') || '<p style="color: #718096; text-align: center;">No revenue data available</p>'}
        </div>
      `;
      break;
      
    case 'todayPayments':
      if (icon) icon.className = 'bi bi-calendar-today';
      if (title) title.textContent = 'Today\'s Payments';
      
      contentHtml = `
        <div class="detail-group">
          <div class="detail-group-header">
            <i class="bi bi-calendar-day"></i>
            <h4>Today's Summary (${today})</h4>
          </div>
          <div class="detail-item">
            <span class="detail-label"><i class="bi bi-receipt"></i> Payments Today</span>
            <span class="detail-value" style="font-size: 24px; font-weight: 700; color: #667eea;">${todayPayments.length}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label"><i class="bi bi-cash"></i> Amount Collected</span>
            <span class="detail-value" style="font-size: 20px; font-weight: 700; color: #28a745;">TZS ${formatNumber(todayAmount)}</span>
          </div>
        </div>
        
        ${todayPayments.length > 0 ? `
        <div class="detail-group">
          <div class="detail-group-header">
            <i class="bi bi-people"></i>
            <h4>Today's Customers</h4>
          </div>
          <ul class="people-list">
            ${todayPayments.map(p => `
              <li class="people-list-item">
                <div class="people-avatar">${p.customerName.charAt(0)}</div>
                <div class="people-info">
                  <div class="people-name">${escapeHtml(p.customerName)}</div>
                  <div class="people-detail">${escapeHtml(p.jobService)}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 700; color: #28a745;">TZS ${formatNumber(p.amount)}</div>
                  <div style="font-size: 11px; color: #a0aec0;">${p.paymentTime}</div>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
        ` : '<p style="color: #718096; text-align: center; padding: 20px;">No payments recorded today</p>'}
      `;
      break;
      
    case 'todayRevenue':
      if (icon) icon.className = 'bi bi-graph-up';
      if (title) title.textContent = 'Today\'s Revenue';
      
      contentHtml = `
        <div class="detail-group">
          <div class="detail-group-header">
            <i class="bi bi-cash-stack"></i>
            <h4>Today's Revenue (${today})</h4>
          </div>
          <div class="detail-item">
            <span class="detail-label"><i class="bi bi-cash"></i> Total Revenue Today</span>
            <span class="detail-value" style="font-size: 24px; font-weight: 700; color: #28a745;">TZS ${formatNumber(todayAmount)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label"><i class="bi bi-receipt"></i> Number of Transactions</span>
            <span class="detail-value">${todayPayments.length}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label"><i class="bi bi-calculator"></i> Average Transaction</span>
            <span class="detail-value">TZS ${formatNumber(todayPayments.length > 0 ? Math.round(todayAmount / todayPayments.length) : 0)}</span>
          </div>
        </div>
        
        ${todayPayments.length > 0 ? `
        <div class="detail-group">
          <div class="detail-group-header">
            <i class="bi bi-list-check"></i>
            <h4>Transaction Details</h4>
          </div>
          ${todayPayments.map(p => `
            <div class="detail-item">
              <span class="detail-label"><i class="bi bi-person"></i> ${escapeHtml(p.customerName)}</span>
              <span class="detail-value">TZS ${formatNumber(p.amount)}</span>
            </div>
          `).join('')}
        </div>
        ` : '<p style="color: #718096; text-align: center; padding: 20px;">No revenue recorded today</p>'}
      `;
      break;
  }
  
  content.innerHTML = contentHtml;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closePaymentStatsDetailModal() {
  const modal = document.getElementById('paymentStatsDetailModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

function getRevenueByService() {
  const serviceMap = {};
  paymentValidations.forEach(p => {
    if (!serviceMap[p.jobService]) {
      serviceMap[p.jobService] = { service: p.jobService, amount: 0, count: 0 };
    }
    serviceMap[p.jobService].amount += p.amount;
    serviceMap[p.jobService].count++;
  });
  return Object.values(serviceMap);
}

// ========== GLOBAL VARIABLES ==========
let currentStaff = null;
let completedJobsCount = 0;
let selectedJobForPayment = null;
let paymentValidations = [];

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded - initializing event listeners');
  
  loadSupervisorData();
  setupEventListeners();
  setupNavButtons();
  
  // Check if already logged in
  if (sessionStorage.getItem('staffLoggedIn') === 'true') {
    const savedEmail = sessionStorage.getItem('staffEmail');
    if (savedEmail) {
      if (savedEmail === staffAccount.email) {
        currentStaff = staffAccount;
      } else {
        const found = supervisorAccounts.find(acc => acc.email === savedEmail);
        if (found) currentStaff = found;
      }
      
      if (currentStaff) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        loadStaffData();
        loadJobs();
        loadJobHistory();
        loadStats();
        loadProfile();
        initPaymentModule();
        toggleSupervisorMenu();
        
        if (currentStaff.isSupervisor && currentStaff.supervisorLocation) {
          const locationSelect = document.getElementById('locationSelect');
          if (locationSelect) {
            locationSelect.value = currentStaff.supervisorLocation;
          }
        }
      }
    }
  }
});

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
  
  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', showLogoutConfirmation);
  }
  
  // Logout modal buttons
  const cancelLogoutBtn = document.getElementById('cancelLogoutBtn');
  if (cancelLogoutBtn) {
    cancelLogoutBtn.addEventListener('click', hideLogoutConfirmation);
  }
  
  const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
  if (confirmLogoutBtn) {
    confirmLogoutBtn.addEventListener('click', performLogout);
  }
  
  // Job detail modal close buttons
  const closeJobDetailModal = document.getElementById('closeJobDetailModal');
  if (closeJobDetailModal) {
    closeJobDetailModal.addEventListener('click', closeJobDetailModalFn);
  }
  
  const closeJobDetailFooter = document.getElementById('closeJobDetailFooter');
  if (closeJobDetailFooter) {
    closeJobDetailFooter.addEventListener('click', closeJobDetailModalFn);
  }
  
  // Stats detail modal close buttons
  const closeStatsDetailModal = document.getElementById('closeStatsDetailModal');
  if (closeStatsDetailModal) {
    closeStatsDetailModal.addEventListener('click', closeStatsDetailModalFn);
  }
  
  const closeStatsDetailFooter = document.getElementById('closeStatsDetailFooter');
  if (closeStatsDetailFooter) {
    closeStatsDetailFooter.addEventListener('click', closeStatsDetailModalFn);
  }
  
  // Payment stats detail modal close buttons
  const closePaymentStatsDetailModalBtn = document.getElementById('closePaymentStatsDetailModal');
  if (closePaymentStatsDetailModalBtn) {
    closePaymentStatsDetailModalBtn.addEventListener('click', closePaymentStatsDetailModal);
  }
  
  const closePaymentStatsDetailFooter = document.getElementById('closePaymentStatsDetailFooter');
  if (closePaymentStatsDetailFooter) {
    closePaymentStatsDetailFooter.addEventListener('click', closePaymentStatsDetailModal);
  }
  
  // Close modals on overlay click
  const jobDetailModal = document.getElementById('jobDetailModal');
  if (jobDetailModal) {
    jobDetailModal.addEventListener('click', function(e) {
      if (e.target === this) closeJobDetailModalFn();
    });
  }
  
  const statsDetailModal = document.getElementById('statsDetailModal');
  if (statsDetailModal) {
    statsDetailModal.addEventListener('click', function(e) {
      if (e.target === this) closeStatsDetailModalFn();
    });
  }
  
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
  
  // Payment validation
  const validateBtn = document.getElementById('validatePaymentBtn');
  if (validateBtn) {
    validateBtn.addEventListener('click', validateCashPayment);
  }
  
  // Receipt modal
  const closeModalBtn = document.getElementById('closeReceiptModalBtn');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeReceiptModal);
  }
  
  const closeReceiptBtn = document.getElementById('closeReceiptBtn');
  if (closeReceiptBtn) {
    closeReceiptBtn.addEventListener('click', closeReceiptModal);
  }
  
  const printReceiptBtn = document.getElementById('printReceiptBtn');
  if (printReceiptBtn) {
    printReceiptBtn.addEventListener('click', printReceipt);
  }
  
  // Supervisor event listeners
  const loadLocationBtn = document.getElementById('loadLocationDataBtn');
  if (loadLocationBtn) {
    loadLocationBtn.addEventListener('click', () => {
      const location = document.getElementById('locationSelect').value;
      if (location) {
        loadStaffForLocation(location);
      } else {
        showNotification('Please select a location first', 'error');
      }
    });
  }
  
  const saveAttendanceBtn = document.getElementById('saveAttendanceBtn');
  if (saveAttendanceBtn) {
    saveAttendanceBtn.addEventListener('click', saveAttendanceAndUpdatePayroll);
  }
  
  const generateReportBtn = document.getElementById('generateReportBtn');
  if (generateReportBtn) {
    generateReportBtn.addEventListener('click', generateWeeklyReport);
  }
  
  const downloadReportBtn = document.getElementById('downloadReportBtn');
  if (downloadReportBtn) {
    downloadReportBtn.addEventListener('click', downloadReport);
  }
  
  const sendReportToAdminBtn = document.getElementById('sendReportToAdminBtn');
  if (sendReportToAdminBtn) {
    sendReportToAdminBtn.addEventListener('click', sendReportToAdmin);
  }
  
  const closeReportModalBtn = document.getElementById('closeReportModalBtn');
  if (closeReportModalBtn) {
    closeReportModalBtn.addEventListener('click', closeReportModal);
  }
  
  const closeReportPreviewBtn = document.getElementById('closeReportPreviewBtn');
  if (closeReportPreviewBtn) {
    closeReportPreviewBtn.addEventListener('click', closeReportModal);
  }
  
  const confirmDownloadBtn = document.getElementById('confirmDownloadReportBtn');
  if (confirmDownloadBtn) {
    confirmDownloadBtn.addEventListener('click', downloadReport);
  }
  
  const sendChatMsgBtn = document.getElementById('sendChatMessageBtn');
  if (sendChatMsgBtn) {
    sendChatMsgBtn.addEventListener('click', () => {
      const message = document.getElementById('chatMessageInput').value;
      sendMessageToChat(message, false);
    });
  }
  
  const attachReportBtn = document.getElementById('attachReportToChatBtn');
  if (attachReportBtn) {
    attachReportBtn.addEventListener('click', attachLastReportToChat);
  }
  
  // Edit message modal
  const saveEditBtn = document.getElementById('saveEditMessage');
  if (saveEditBtn) {
    saveEditBtn.addEventListener('click', saveEditedMessage);
  }
  
  const cancelEditBtn = document.getElementById('cancelEditMessage');
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', cancelEditMessage);
  }
  
  const closeEditModal = document.getElementById('closeEditMessageModal');
  if (closeEditModal) {
    closeEditModal.addEventListener('click', cancelEditMessage);
  }
  
  // Chat enter key
  const chatInput = document.getElementById('chatMessageInput');
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessageToChat(chatInput.value, false);
      }
    });
  }
  
  // Login enter key
  const inputs = document.querySelectorAll('#loginSection input');
  inputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        loginStaff();
      }
    });
  });
  
  // Escape key to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeJobDetailModalFn();
      closeStatsDetailModalFn();
      closePaymentStatsDetailModal();
      closeReceiptModal();
      closeReportModal();
      hideLogoutConfirmation();
      cancelEditMessage();
    }
  });
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
  if (loadingOverlay) {
    loadingOverlay.style.display = 'flex';
  }
  
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
  
  if (!emailInput || !passwordInput) {
    console.error('Email or password input not found');
    return;
  }
  
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  if (!email || !password) {
    showNotification('Please enter both email and password', 'error');
    return;
  }
  
  if (email === staffAccount.email && password === staffAccount.password) {
    currentStaff = staffAccount;
  } else {
    const foundSupervisor = supervisorAccounts.find(acc => acc.email === email && acc.password === password);
    if (foundSupervisor) {
      currentStaff = foundSupervisor;
    }
  }
  
  if (currentStaff) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    
    loadStaffData();
    loadJobs();
    loadJobHistory();
    loadStats();
    loadProfile();
    initPaymentModule();
    toggleSupervisorMenu();
    
    if (currentStaff.isSupervisor && currentStaff.supervisorLocation) {
      const locationSelect = document.getElementById('locationSelect');
      if (locationSelect) {
        locationSelect.value = currentStaff.supervisorLocation;
      }
    }
    
    showNotification(`Welcome back, ${currentStaff.name}!`, 'success');
    
    sessionStorage.setItem('staffLoggedIn', 'true');
    sessionStorage.setItem('staffName', currentStaff.name);
    sessionStorage.setItem('staffEmail', currentStaff.email);
  } else {
    showNotification('Invalid email or password!', 'error');
    const loginCard = document.querySelector('.login-card');
    if (loginCard) {
      loginCard.style.animation = 'shake 0.5s';
      setTimeout(() => {
        loginCard.style.animation = '';
      }, 500);
    }
  }
}

function logoutStaff() {
  showLogoutConfirmation();
}

function showForgotPassword() {
  showNotification('Please contact your administrator to reset your password.', 'info');
}

function showDemoCredentials() {
  showNotification('Demo Credentials:\nStaff: mudrikdau@gmail.com / 1234\nSupervisor (ZSSF): zssf.supervisor@CleanSpark.com / 1234\nSupervisor (Mall): mall.supervisor@CleanSpark.com / 1234\nSupervisor (Uni): uni.supervisor@CleanSpark.com / 1234', 'info');
}

// ========== CHANGE PASSWORD FEATURE ==========
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
  if (staffNameEl && currentStaff) {
    staffNameEl.textContent = currentStaff.name;
  }
}

function loadJobs() {
  const pendingJobs = jobs.filter(job => job.status === 'pending' || job.status === 'in-progress');
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
        <div class="job-actions" onclick="event.stopPropagation()">
          ${job.status === 'pending' ? 
            `<button class="btn-action btn-start" onclick="updateJobStatus(${job.id}, 'in-progress')">
              <i class="bi bi-play-fill"></i> Start Job
            </button>` : 
            `<button class="btn-action btn-complete" onclick="updateJobStatus(${job.id}, 'completed')">
              <i class="bi bi-check-circle-fill"></i> Mark Complete
            </button>`
          }
          <button class="btn-action btn-view" onclick="showJobDetailModal(${job.id})">
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
            <i class="bi bi-calendar-check"></i>
            <span>Completed: ${job.completedDate}</span>
          </div>
          <div class="job-detail-item">
            <i class="bi bi-cash-stack"></i>
            <span>TZS ${formatNumber(job.price)}</span>
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
  const completedJobs = jobs.filter(job => job.status === 'completed');
  const pendingJobs = jobs.filter(job => job.status === 'pending');
  const inProgressJobs = jobs.filter(job => job.status === 'in-progress');
  
  const totalJobs = jobs.length;
  const totalCompleted = completedJobs.length;
  const totalEarnings = completedJobs.reduce((sum, job) => sum + job.price, 0);
  const completionRate = totalJobs > 0 ? ((totalCompleted / totalJobs) * 100).toFixed(0) : 0;
  
  const container = document.getElementById('statsContainer');
  if (!container) return;
  
  const statCardsData = [
    {
      icon: 'bi-briefcase-fill',
      value: totalJobs,
      label: 'Total Jobs Assigned',
      id: 'totalJobs'
    },
    {
      icon: 'bi-check-circle-fill',
      value: totalCompleted,
      label: 'Jobs Completed',
      id: 'completedJobs'
    },
    {
      icon: 'bi-play-fill',
      value: inProgressJobs.length,
      label: 'In Progress',
      id: 'inProgressJobs'
    },
    {
      icon: 'bi-hourglass-split',
      value: pendingJobs.length,
      label: 'Pending Jobs',
      id: 'pendingJobs'
    },
    {
      icon: 'bi-cash-stack',
      value: `TZS ${formatNumber(totalEarnings)}`,
      label: 'Total Earnings',
      id: 'totalEarnings'
    },
    {
      icon: 'bi-graph-up',
      value: `${completionRate}%`,
      label: 'Completion Rate',
      id: 'completionRate'
    }
  ];
  
  let html = '';
  statCardsData.forEach(stat => {
    html += `
      <div class="stat-card clickable-indicator" onclick="showStatsDetail('${stat.id}')">
        <div class="stat-icon">
          <i class="bi ${stat.icon}"></i>
        </div>
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
      <div class="profile-avatar">
        <i class="bi bi-person-fill"></i>
      </div>
      <h3>${currentStaff.name}</h3>
      <p>${currentStaff.role}${currentStaff.isSupervisor ? ' (Supervisor)' : ''}</p>
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
      ${currentStaff.isSupervisor ? `
      <div class="info-row">
        <span class="info-label"><i class="bi bi-building"></i> Assigned Location</span>
        <span class="info-value">${currentStaff.supervisorLocation || 'Not assigned'}</span>
      </div>
      ` : ''}
      <div class="info-row">
        <span class="info-label"><i class="bi bi-trophy"></i> Rating</span>
        <span class="info-value">⭐ 4.8 (24 reviews)</span>
      </div>
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
  if (changePwdBtn) {
    changePwdBtn.addEventListener('click', changeStaffPassword);
  }
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
      case 'completed':
        icon.className = 'bi bi-check-circle-fill';
        break;
      case 'in-progress':
        icon.className = 'bi bi-play-circle-fill';
        break;
      default:
        icon.className = 'bi bi-brush-fill';
    }
  }
  
  if (title) {
    title.textContent = job.service;
  }
  
  const statusClass = job.status === 'pending' ? 'pending' : 
                      job.status === 'in-progress' ? 'in-progress' : 'completed';
  const statusIcon = job.status === 'pending' ? 'bi-clock' : 
                     job.status === 'in-progress' ? 'bi-play-circle' : 'bi-check-circle';
  
  content.innerHTML = `
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
        <span class="detail-value">
          <span class="status-badge-large ${statusClass}">${job.status.toUpperCase()}</span>
        </span>
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
      <div class="detail-item">
        <span class="detail-label"><i class="bi bi-hourglass"></i> Duration</span>
        <span class="detail-value">${job.duration}</span>
      </div>
      ${job.completedDate ? `
      <div class="detail-item">
        <span class="detail-label"><i class="bi bi-calendar-check"></i> Completed Date</span>
        <span class="detail-value">${job.completedDate}</span>
      </div>
      ` : ''}
    </div>
    
    <div class="detail-group">
      <div class="detail-group-header">
        <i class="bi bi-cash-stack"></i>
        <h4>Payment Information</h4>
      </div>
      <div class="detail-item">
        <span class="detail-label"><i class="bi bi-cash"></i> Service Price</span>
        <span class="detail-value" style="color: #28a745; font-size: 18px; font-weight: 700;">TZS ${formatNumber(job.price)}</span>
      </div>
    </div>
    
    ${job.description ? `
    <div class="detail-group">
      <div class="detail-group-header">
        <i class="bi bi-file-text"></i>
        <h4>Description</h4>
      </div>
      <p style="color: #4a5568; line-height: 1.6; padding: 12px; background: #f8fafc; border-radius: 12px;">
        ${escapeHtml(job.description)}
      </p>
    </div>
    ` : ''}
    
    ${job.requirements ? `
    <div class="detail-group">
      <div class="detail-group-header">
        <i class="bi bi-list-check"></i>
        <h4>Requirements</h4>
      </div>
      <p style="color: #4a5568; line-height: 1.6; padding: 12px; background: #fff8f0; border-radius: 12px;">
        ${escapeHtml(job.requirements)}
      </p>
    </div>
    ` : ''}
  `;
  
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
  
  const completedJobs = jobs.filter(job => job.status === 'completed');
  const pendingJobs = jobs.filter(job => job.status === 'pending');
  const inProgressJobs = jobs.filter(job => job.status === 'in-progress');
  const totalJobs = jobs.length;
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
          <div class="stats-breakdown-item">
            <div class="stats-breakdown-icon"><i class="bi bi-briefcase"></i></div>
            <div class="stats-breakdown-info">
              <div class="stats-breakdown-label">Total Jobs Assigned</div>
              <div class="stats-breakdown-value">${totalJobs}</div>
            </div>
          </div>
          <div class="stats-breakdown-item">
            <div class="stats-breakdown-icon"><i class="bi bi-check-circle"></i></div>
            <div class="stats-breakdown-info">
              <div class="stats-breakdown-label">Completed Jobs</div>
              <div class="stats-breakdown-value">${totalCompleted}</div>
            </div>
          </div>
          <div class="stats-breakdown-item">
            <div class="stats-breakdown-icon"><i class="bi bi-play-circle"></i></div>
            <div class="stats-breakdown-info">
              <div class="stats-breakdown-label">In Progress</div>
              <div class="stats-breakdown-value">${inProgressJobs.length}</div>
            </div>
          </div>
          <div class="stats-breakdown-item">
            <div class="stats-breakdown-icon"><i class="bi bi-clock"></i></div>
            <div class="stats-breakdown-info">
              <div class="stats-breakdown-label">Pending</div>
              <div class="stats-breakdown-value">${pendingJobs.length}</div>
            </div>
          </div>
        </div>
      `;
      break;
      
    case 'completedJobs':
      if (icon) icon.className = 'bi bi-check-circle-fill';
      if (title) title.textContent = 'Completed Jobs Details';
      contentHtml = `
        <div class="stats-detail-section">
          <h4>Completed Jobs (${totalCompleted})</h4>
          ${completedJobs.map(job => `
            <div class="stats-breakdown-item">
              <div class="stats-breakdown-icon"><i class="bi bi-check-circle"></i></div>
              <div class="stats-breakdown-info">
                <div class="stats-breakdown-label">${escapeHtml(job.service)}</div>
                <div class="stats-breakdown-value">TZS ${formatNumber(job.price)}</div>
                <small style="color: #718096;">Completed: ${job.completedDate}</small>
              </div>
            </div>
          `).join('') || '<p style="color: #718096; text-align: center;">No completed jobs yet.</p>'}
        </div>
      `;
      break;
      
    case 'inProgressJobs':
      if (icon) icon.className = 'bi bi-play-fill';
      if (title) title.textContent = 'In Progress Jobs';
      contentHtml = `
        <div class="stats-detail-section">
          <h4>Jobs In Progress (${inProgressJobs.length})</h4>
          ${inProgressJobs.map(job => `
            <div class="stats-breakdown-item">
              <div class="stats-breakdown-icon"><i class="bi bi-play-circle"></i></div>
              <div class="stats-breakdown-info">
                <div class="stats-breakdown-label">${escapeHtml(job.service)}</div>
                <div class="stats-breakdown-value">TZS ${formatNumber(job.price)}</div>
                <small style="color: #718096;">Scheduled: ${job.scheduledDate}</small>
              </div>
            </div>
          `).join('') || '<p style="color: #718096; text-align: center;">No jobs in progress.</p>'}
        </div>
      `;
      break;
      
    case 'pendingJobs':
      if (icon) icon.className = 'bi bi-hourglass-split';
      if (title) title.textContent = 'Pending Jobs';
      contentHtml = `
        <div class="stats-detail-section">
          <h4>Pending Jobs (${pendingJobs.length})</h4>
          ${pendingJobs.map(job => `
            <div class="stats-breakdown-item">
              <div class="stats-breakdown-icon"><i class="bi bi-clock"></i></div>
              <div class="stats-breakdown-info">
                <div class="stats-breakdown-label">${escapeHtml(job.service)}</div>
                <div class="stats-breakdown-value">TZS ${formatNumber(job.price)}</div>
                <small style="color: #718096;">Scheduled: ${job.scheduledDate}</small>
              </div>
            </div>
          `).join('') || '<p style="color: #718096; text-align: center;">No pending jobs.</p>'}
        </div>
      `;
      break;
      
    case 'totalEarnings':
      if (icon) icon.className = 'bi bi-cash-stack';
      if (title) title.textContent = 'Earnings Breakdown';
      contentHtml = `
        <div class="stats-detail-section">
          <h4>Total Earnings: TZS ${formatNumber(totalEarnings)}</h4>
          ${completedJobs.map(job => `
            <div class="stats-breakdown-item">
              <div class="stats-breakdown-icon"><i class="bi bi-cash"></i></div>
              <div class="stats-breakdown-info">
                <div class="stats-breakdown-label">${escapeHtml(job.service)}</div>
                <div class="stats-breakdown-value">TZS ${formatNumber(job.price)}</div>
                <small style="color: #718096;">Completed: ${job.completedDate}</small>
              </div>
            </div>
          `).join('') || '<p style="color: #718096; text-align: center;">No earnings yet.</p>'}
        </div>
      `;
      break;
      
    case 'completionRate':
      if (icon) icon.className = 'bi bi-graph-up';
      if (title) title.textContent = 'Completion Rate';
      contentHtml = `
        <div class="stats-detail-section">
          <h4>Performance Metrics</h4>
          <div style="text-align: center; margin: 24px 0;">
            <div style="font-size: 64px; font-weight: 800; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
              ${completionRate}%
            </div>
            <p style="color: #718096;">Completion Rate</p>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-bg">
              <div class="progress-bar-fill ${completionRate >= 80 ? 'green' : completionRate >= 50 ? 'blue' : 'orange'}" style="width: ${completionRate}%;"></div>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 13px;">
            <span style="color: #718096;">0%</span>
            <span style="color: #718096;">50%</span>
            <span style="color: #718096;">100%</span>
          </div>
        </div>
      `;
      break;
  }
  
  content.innerHTML = contentHtml;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeStatsDetailModalFn() {
  const modal = document.getElementById('statsDetailModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

// ========== JOB MANAGEMENT ==========
function updateJobStatus(jobId, newStatus) {
  const jobIndex = jobs.findIndex(j => j.id === jobId);
  if (jobIndex !== -1) {
    jobs[jobIndex].status = newStatus;
    
    if (newStatus === 'completed') {
      jobs[jobIndex].completedDate = new Date().toISOString().split('T')[0];
      showNotification(`Job completed successfully! You can now process payment.`, 'success');
    } else if (newStatus === 'in-progress') {
      showNotification(`Job started! Good luck!`, 'success');
    }
    
    loadJobs();
    loadJobHistory();
    loadStats();
    loadCompletedJobsForPayment();
  }
}

function viewJobDetails(jobId) {
  showJobDetailModal(jobId);
}

// ========== NAVIGATION ==========
function setupNavButtons() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const views = ['jobs', 'history', 'stats', 'profile', 'payment', 'supervisor'];
  
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      views.forEach(v => {
        const viewElement = document.getElementById(`${v}View`);
        if (viewElement) {
          viewElement.classList.remove('active');
        }
      });
      
      const activeView = document.getElementById(`${view}View`);
      if (activeView) {
        activeView.classList.add('active');
        
        if (view === 'payment') {
          loadCompletedJobsForPayment();
          loadRecentPayments();
          updatePaymentStats();
        } else if (view === 'supervisor') {
          displayChatMessages();
          const today = new Date();
          const daysUntilFriday = (5 - today.getDay() + 7) % 7;
          const friday = new Date(today);
          friday.setDate(today.getDate() + daysUntilFriday);
          const weekEndingInput = document.getElementById('reportWeekEnding');
          if (weekEndingInput) {
            weekEndingInput.value = friday.toISOString().split('T')[0];
          }
        }
      }
    });
  });
}

// ========== CASH PAYMENT MODULE FUNCTIONS ==========
function loadPaymentValidations() {
  const stored = localStorage.getItem('CleanSpark_payments');
  if (stored) {
    paymentValidations = JSON.parse(stored);
  } else {
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

function savePaymentValidations() {
  localStorage.setItem('CleanSpark_payments', JSON.stringify(paymentValidations));
}

function updatePaymentStats() {
  const totalPayments = paymentValidations.length;
  const totalAmount = paymentValidations.reduce((sum, p) => sum + p.amount, 0);
  const today = new Date().toISOString().split('T')[0];
  const todayPayments = paymentValidations.filter(p => p.paymentDate === today).length;
  const todayAmount = paymentValidations.filter(p => p.paymentDate === today).reduce((sum, p) => sum + p.amount, 0);
  
  const statsHTML = `
    <div class="payment-stat-card clickable-indicator" onclick="showPaymentStatsDetail('totalPayments')">
      <div class="payment-stat-icon"><i class="bi bi-receipt"></i></div>
      <div class="payment-stat-value">${totalPayments}</div>
      <div class="payment-stat-label">Total Validated Payments</div>
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
    </div>
  `;
  
  const statsContainer = document.getElementById('paymentStatsGrid');
  if (statsContainer) statsContainer.innerHTML = statsHTML;
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
    options += `<option value="${job.id}" data-service="${escapeHtml(job.service)}" data-client="${escapeHtml(job.client)}" data-price="${job.price}">
      ${job.service} - ${job.client} (TZS ${formatNumber(job.price)})
    </option>`;
  });
  
  jobSelect.innerHTML = options;
  
  jobSelect.onchange = function() {
    const selectedOption = this.options[this.selectedIndex];
    if (this.value) {
      const clientName = selectedOption.getAttribute('data-client');
      const price = selectedOption.getAttribute('data-price');
      
      document.getElementById('customerName').value = clientName;
      document.getElementById('serviceAmount').value = `TZS ${formatNumber(parseInt(price))}`;
      document.getElementById('cashReceived').value = '';
      document.getElementById('paymentNote').value = '';
      
      selectedJobForPayment = {
        id: parseInt(this.value),
        service: selectedOption.getAttribute('data-service'),
        client: clientName,
        price: parseInt(price)
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
  
  if (!jobSelect || !jobSelect.value) {
    showNotification('Please select a job first', 'error');
    return;
  }
  
  if (!selectedJobForPayment) {
    showNotification('Invalid job selection', 'error');
    return;
  }
  
  const cashReceived = parseFloat(cashReceivedInput.value);
  
  if (isNaN(cashReceived) || cashReceived <= 0) {
    showNotification('Please enter a valid cash amount', 'error');
    return;
  }
  
  const serviceAmount = selectedJobForPayment.price;
  
  if (cashReceived < serviceAmount) {
    showNotification(`Insufficient payment! Need TZS ${formatNumber(serviceAmount - cashReceived)} more.`, 'error');
    return;
  }
  
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
    receiptNumber: generateReceiptNumber(),
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

function generateReceiptNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `RCP-${year}${month}${day}-${random}`;
}

function generateReceipt(payment) {
  const receiptContent = `
    <div style="text-align: center;">
      <h4>PAYMENT RECEIPT</h4>
      <p style="color: #718096;">Thank you for choosing CleanSpark Cleaning Services</p>
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
        <span class="receipt-label">Customer:</span>
        <span class="receipt-value">${escapeHtml(payment.customerName)}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Service:</span>
        <span class="receipt-value">${escapeHtml(payment.jobService)}</span>
      </div>
      <div class="receipt-row">
        <span class="receipt-label">Amount:</span>
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
      <div style="margin-top: 16px; padding: 12px; background: #f8fafc; border-radius: 8px;">
        <span style="font-weight: 600; color: #4a5568;">Note:</span> ${escapeHtml(payment.note)}
      </div>
      ` : ''}
    </div>
  `;
  
  document.getElementById('receiptContent').innerHTML = receiptContent;
  document.getElementById('receiptModal').style.display = 'flex';
  window.currentReceipt = payment;
}

function loadRecentPayments() {
  const container = document.getElementById('recentPaymentsContainer');
  if (!container) return;
  
  const recentPayments = [...paymentValidations].reverse().slice(0, 10);
  
  if (recentPayments.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding: 40px;"><i class="bi bi-receipt"></i><h4>No Payments Yet</h4><p>Validated payments will appear here</p></div>`;
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

function closeReceiptModal() {
  const receiptModal = document.getElementById('receiptModal');
  if (receiptModal) receiptModal.style.display = 'none';
}

function printReceipt() {
  const receiptContent = document.getElementById('receiptContent')?.innerHTML;
  if (!receiptContent) return;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
    <head>
      <title>CleanSpark Payment Receipt</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Inter', sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
        .receipt-details { margin: 20px 0; }
        .receipt-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #e2e8f0; }
        .receipt-label { font-weight: 600; color: #4a5568; }
        .receipt-value { color: #1a202c; font-weight: 500; }
        .receipt-total { margin-top: 20px; padding-top: 12px; border-top: 2px solid #1a202c; font-size: 18px; font-weight: 800; color: #28a745; text-align: right; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      ${receiptContent}
      <div style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; margin: 0 10px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">Print</button>
        <button onclick="window.close()" style="padding: 10px 20px; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer;">Close</button>
      </div>
    </body>
    </html>
  `);
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