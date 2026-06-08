// ========================================
// CleanSpark API Client
// ========================================

const API = (function() {
    // Base URL - change this to your server URL in production
    const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : '/api';
    
    // Helper function to get auth token
    function getAuthToken() {
        return localStorage.getItem('cleanspark_token') || sessionStorage.getItem('cleanspark_token');
    }
    
    // Helper function to set auth token
    function setAuthToken(token, remember = false) {
        if (remember) {
            localStorage.setItem('cleanspark_token', token);
        } else {
            sessionStorage.setItem('cleanspark_token', token);
        }
    }
    
    // Helper function to clear auth token
    function clearAuthToken() {
        localStorage.removeItem('cleanspark_token');
        sessionStorage.removeItem('cleanspark_token');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
    }
    
    // Helper function to get headers
    function getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (includeAuth) {
            const token = getAuthToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return headers;
    }
    
    // Helper function for API requests
    async function request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...getHeaders(options.includeAuth !== false),
                ...options.headers,
            },
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                // Handle token expiration
                if (response.status === 401) {
                    clearAuthToken();
                    if (window.location.pathname !== '/login.html') {
                        window.location.href = '/login.html';
                    }
                }
                throw new Error(data.message || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }
    
    // Helper for form data requests (file uploads)
    async function requestFormData(endpoint, formData, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        const token = getAuthToken();
        
        const config = {
            method: options.method || 'POST',
            body: formData,
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 401) {
                    clearAuthToken();
                    window.location.href = '/login.html';
                }
                throw new Error(data.message || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }
    
    // ========================================
    // AUTH ENDPOINTS
    // ========================================
    
    const auth = {
        // User Registration
        register: (userData) => request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        }),
        
        // Google Login
        googleLogin: (token) => request('/auth/google-login', {
            method: 'POST',
            body: JSON.stringify({ token }),
        }),
        
        // User Login - Step 1 (Send OTP)
        login: (email, password) => request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
        
        // User Verify OTP - Step 2
        verifyOTP: (email, otp) => request('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ email, otp }),
        }).then(data => {
            if (data.token) {
                setAuthToken(data.token, true);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUser', JSON.stringify(data.user));
            }
            return data;
        }),
        
        // Forgot Password - Send Reset OTP
        forgotPassword: (email) => request('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),
        
        // Verify Reset OTP
        verifyResetOTP: (email, otp) => request('/auth/verify-reset-otp', {
            method: 'POST',
            body: JSON.stringify({ email, otp }),
        }),
        
        // Reset Password
        resetPassword: (resetToken, newPassword, confirmPassword) => request('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ resetToken, new_password: newPassword, confirm_password: confirmPassword }),
        }),
        
        // Resend Reset OTP
        resendResetOTP: (email) => request('/auth/resend-reset-otp', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),
        
        // Admin Login - Step 1
        adminLogin: (email, password) => request('/auth/admin/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
        
        // Admin Verify OTP - Step 2
        adminVerifyOTP: (email, otp) => request('/auth/admin/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ email, otp }),
        }).then(data => {
            if (data.token) {
                setAuthToken(data.token, true);
                sessionStorage.setItem('adminLoggedIn', 'true');
            }
            return data;
        }),
        
        // Resend Admin OTP
        resendAdminOTP: (email) => request('/auth/admin/resend-otp', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),
        
        // Staff Login (No OTP)
        staffLogin: (email, password) => request('/auth/staff/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }).then(data => {
            if (data.token) {
                setAuthToken(data.token, true);
                sessionStorage.setItem('staffLoggedIn', 'true');
                sessionStorage.setItem('staffEmail', email);
                if (data.staff) {
                    sessionStorage.setItem('staffName', data.staff.full_name);
                }
            }
            return data;
        }),
        
        // Logout
        logout: () => request('/auth/logout', {
            method: 'POST',
        }).finally(() => clearAuthToken()),
        
        // Admin Logout
        adminLogout: () => request('/auth/admin/logout', {
            method: 'POST',
        }).finally(() => {
            clearAuthToken();
            sessionStorage.removeItem('adminLoggedIn');
        }),
        
        // Staff Logout
        staffLogout: () => request('/auth/staff/logout', {
            method: 'POST',
        }).finally(() => {
            clearAuthToken();
            sessionStorage.removeItem('staffLoggedIn');
        }),
        
        // Get Profile
        getProfile: () => request('/auth/profile'),
        
        // Update Profile
        updateProfile: (profileData) => request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        }),
        
        // Change Password
        changePassword: (currentPassword, newPassword, confirmPassword) => request('/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            }),
        }),
        
        // Delete Account
        deleteAccount: (password, confirmDelete) => request('/auth/delete-account', {
            method: 'DELETE',
            body: JSON.stringify({ password, confirm_delete: confirmDelete }),
        }),
        
        // Get Notification Preferences
        getNotificationPreferences: () => request('/auth/notifications/preferences'),
        
        // Toggle Email Notifications
        toggleEmailNotifications: (enabled) => request('/auth/notifications/toggle', {
            method: 'PUT',
            body: JSON.stringify({ email_notifications: enabled }),
        }),
        
        // Get Notification History
        getNotificationHistory: (limit = 20) => request(`/auth/notifications/history?limit=${limit}`),
        
        // Check if logged in
        isLoggedIn: () => !!getAuthToken(),
    };
    
    // ========================================
    // SERVICES ENDPOINTS
    // ========================================
    
    const services = {
        // Get all services
        getAll: () => request('/services'),
        
        // Get single service
        getById: (id) => request(`/services/${id}`),
        
        // Add service (admin only)
        add: (formData) => requestFormData('/services', formData),
        
        // Update service (admin only)
        update: (id, formData) => requestFormData(`/services/${id}`, formData, { method: 'PUT' }),
        
        // Delete service (admin only)
        delete: (id) => request(`/services/${id}`, { method: 'DELETE' }),
    };
    
    // ========================================
    // BOOKINGS ENDPOINTS
    // ========================================
    
    const bookings = {
        // Create booking
        create: (bookingData) => request('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData),
        }),
        
        // Get my bookings (customer)
        getMyBookings: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/bookings/my-bookings${params ? `?${params}` : ''}`);
        },
        
        // Get my invoices (customer)
        getMyInvoices: () => request('/bookings/my-invoices'),
        
        // Download customer invoice
        downloadInvoice: (invoiceId) => `${BASE_URL}/bookings/invoices/${invoiceId}/download`,
        
        // Get all bookings (admin only)
        getAll: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/bookings${params ? `?${params}` : ''}`);
        },
        
        // Get single booking details (admin)
        getById: (id) => request(`/bookings/${id}`),
        
        // Update booking status (admin)
        updateStatus: (id, status) => request(`/bookings/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        }),
        
        // Update payment status (admin)
        updatePaymentStatus: (id, paymentStatus) => request(`/bookings/${id}/payment-status`, {
            method: 'PUT',
            body: JSON.stringify({ payment_status: paymentStatus }),
        }),
        
        // Assign staff to booking (admin)
        assignStaff: (id, staffId) => request(`/bookings/${id}/assign-staff`, {
            method: 'POST',
            body: JSON.stringify({ staff_id: staffId }),
        }),
        
        // Remove staff from booking (admin)
        removeStaff: (id) => request(`/bookings/${id}/assign-staff`, { method: 'DELETE' }),
        
        // Update booking estimation (admin)
        updateEstimation: (id, estimationData) => request(`/bookings/${id}/estimation`, {
            method: 'POST',
            body: JSON.stringify(estimationData),
        }),
        
        // Generate and send invoice (admin)
        generateInvoice: (id, dueDate, notes) => request(`/bookings/${id}/generate-invoice`, {
            method: 'POST',
            body: JSON.stringify({ due_date: dueDate, notes }),
        }),
        
        // Get booking stats (admin)
        getStats: () => request('/bookings/stats'),
        
        // Get receipt (customer)
        getReceipt: (id) => request(`/bookings/${id}/receipt`),
        
        // Cancel my booking (customer)
        cancel: (id) => request(`/bookings/${id}/cancel`, { method: 'PUT' }),
        
        // Get staff assignments (staff)
        getStaffAssignments: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/bookings/staff/my-assignments${params ? `?${params}` : ''}`);
        },
    };
    
    // ========================================
    // STAFF JOBS ENDPOINTS
    // ========================================
    
    const staffJobs = {
        // Get assigned jobs
        getAssignedJobs: (status = null) => {
            const url = status ? `/staff/jobs?status=${status}` : '/staff/jobs';
            return request(url);
        },
        
        // Get single job details
        getJobDetails: (jobId) => request(`/staff/jobs/${jobId}`),
        
        // Update job status
        updateJobStatus: (jobId, status) => request(`/staff/jobs/${jobId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        }),
        
        // Get job history
        getJobHistory: (limit = 50, offset = 0) => request(`/staff/jobs/history?limit=${limit}&offset=${offset}`),
        
        // Get performance stats
        getPerformanceStats: () => request('/staff/performance'),
        
        // Get staff profile
        getProfile: () => request('/staff/profile'),
        
        // Change staff password
        changePassword: (currentPassword, newPassword, confirmPassword) => request('/staff/change-password', {
            method: 'PUT',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            }),
        }),
    };
    
    // ========================================
    // SUPERVISOR ENDPOINTS
    // ========================================
    
    const supervisor = {
        // Get profile
        getProfile: () => request('/supervisor/profile'),
        
        // Change password
        changePassword: (currentPassword, newPassword, confirmPassword) => request('/supervisor/change-password', {
            method: 'PUT',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            }),
        }),
        
        // Get contractors list
        getContractors: () => request('/supervisor/contractors'),
        
        // Get contractor staff
        getContractorStaff: (contractorId) => request(`/supervisor/contractors/${contractorId}/staff`),
        
        // Save attendance
        saveAttendance: (contractorId, attendanceDate, staffAttendance) => request('/supervisor/attendance', {
            method: 'POST',
            body: JSON.stringify({
                contractor_id: contractorId,
                attendance_date: attendanceDate,
                staff_attendance: staffAttendance,
            }),
        }),
        
        // Get attendance
        getAttendance: (contractorId, date) => request(`/supervisor/attendance/${contractorId}/${date}`),
        
        // Get payroll summary
        getPayrollSummary: (weekEndingDate) => request(`/supervisor/payroll/${weekEndingDate}`),
        
        // Generate weekly report
        generateWeeklyReport: (reportData) => request('/supervisor/reports', {
            method: 'POST',
            body: JSON.stringify(reportData),
        }),
        
        // Get my reports
        getMyReports: () => request('/supervisor/reports'),
        
        // Download weekly report
        downloadReport: (reportId) => `${BASE_URL}/supervisor/reports/${reportId}/download`,
        
        // Submit report to admin
        submitReportToAdmin: (reportId) => request(`/supervisor/reports/${reportId}/submit`, { method: 'POST' }),
        
        // Get chat messages
        getChatMessages: () => request('/supervisor/chat/messages'),
        
        // Get unread message count
        getUnreadCount: () => request('/supervisor/chat/unread'),
        
        // Send chat message
        sendMessage: (message, reportId = null, attachmentFile = null) => {
            if (attachmentFile) {
                const formData = new FormData();
                formData.append('message', message);
                if (reportId) formData.append('report_id', reportId);
                formData.append('attachment', attachmentFile);
                return requestFormData('/supervisor/chat/send', formData);
            }
            return request('/supervisor/chat/send', {
                method: 'POST',
                body: JSON.stringify({ message, report_id: reportId }),
            });
        },
    };
    
    // ========================================
    // GENERAL SUPERVISOR ENDPOINTS
    // ========================================
    
    const generalSupervisor = {
        // Get profile
        getProfile: () => request('/general-supervisor/profile'),
        
        // Change password
        changePassword: (currentPassword, newPassword, confirmPassword) => request('/general-supervisor/change-password', {
            method: 'PUT',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            }),
        }),
        
        // My Team
        getMyTeam: () => request('/general-supervisor/team'),
        getAllTeamJobs: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/general-supervisor/team/jobs${params ? `?${params}` : ''}`);
        },
        getTeamJobs: (staffId, filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/general-supervisor/team/${staffId}/jobs${params ? `?${params}` : ''}`);
        },
        updateTeamJobStatus: (jobId, status) => request(`/general-supervisor/team/jobs/${jobId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        }),
        
        // Cash Payment Validation
        getCashPaymentList: () => request('/general-supervisor/payments/cash/list'),
        validateCashPayment: (bookingId, amountReceived, paymentNote) => request('/general-supervisor/payments/cash/validate', {
            method: 'POST',
            body: JSON.stringify({ booking_id: bookingId, amount_received: amountReceived, payment_note: paymentNote }),
        }),
        getCashPaymentStats: () => request('/general-supervisor/payments/cash/stats'),
        getCashPaymentHistory: (limit = 50) => request(`/general-supervisor/payments/cash/history?limit=${limit}`),
        
        // Weekly Reports
        generateWeeklyReport: (reportData) => request('/general-supervisor/reports', {
            method: 'POST',
            body: JSON.stringify(reportData),
        }),
        getMyReports: () => request('/general-supervisor/reports'),
        downloadReport: (reportId) => `${BASE_URL}/general-supervisor/reports/${reportId}/download`,
        submitReportToAdmin: (reportId) => request(`/general-supervisor/reports/${reportId}/submit`, { method: 'POST' }),
        
        // Chat
        getChatMessages: () => request('/general-supervisor/chat/messages'),
        getUnreadCount: () => request('/general-supervisor/chat/unread'),
        sendMessage: (message, reportId = null, attachmentFile = null) => {
            if (attachmentFile) {
                const formData = new FormData();
                formData.append('message', message);
                if (reportId) formData.append('report_id', reportId);
                formData.append('attachment', attachmentFile);
                return requestFormData('/general-supervisor/chat/send', formData);
            }
            return request('/general-supervisor/chat/send', {
                method: 'POST',
                body: JSON.stringify({ message, report_id: reportId }),
            });
        },
    };
    
    // ========================================
    // CONTRACTORS ENDPOINTS (Admin)
    // ========================================
    
    const contractors = {
        // Add contractor
        add: (contractorData) => request('/contractors', {
            method: 'POST',
            body: JSON.stringify(contractorData),
        }),
        
        // Get all contractors
        getAll: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/contractors${params ? `?${params}` : ''}`);
        },
        
        // Get single contractor
        getById: (id) => request(`/contractors/${id}`),
        
        // Update contractor
        update: (id, contractorData) => request(`/contractors/${id}`, {
            method: 'PUT',
            body: JSON.stringify(contractorData),
        }),
        
        // Delete contractor
        delete: (id) => request(`/contractors/${id}`, { method: 'DELETE' }),
        
        // Update status
        updateStatus: (id, status) => request(`/contractors/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),
        
        // Search contractors
        search: (query) => request(`/contractors/search?q=${encodeURIComponent(query)}`),
        
        // Get contractor invoices
        getInvoices: (id) => request(`/contractors/${id}/invoices`),
    };
    
    // ========================================
    // INVOICES ENDPOINTS (Admin)
    // ========================================
    
    const invoices = {
        // Generate invoice
        generate: (invoiceData) => request('/invoices', {
            method: 'POST',
            body: JSON.stringify(invoiceData),
        }),
        
        // Get all invoices
        getAll: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/invoices${params ? `?${params}` : ''}`);
        },
        
        // Get single invoice
        getById: (id) => request(`/invoices/${id}`),
        
        // Delete invoice
        delete: (id) => request(`/invoices/${id}`, { method: 'DELETE' }),
        
        // Update invoice status
        updateStatus: (id, status) => request(`/invoices/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),
        
        // Download invoice PDF
        downloadPDF: (id) => `${BASE_URL}/invoices/${id}/download`,
        
        // View invoice PDF
        viewPDF: (id) => `${BASE_URL}/invoices/${id}/view`,
    };
    
    // ========================================
    // ADMIN STAFF ENDPOINTS
    // ========================================
    
    const adminStaff = {
        // Add staff
        add: (formData) => requestFormData('/admin-staff', formData),
        
        // Get all staff
        getAll: () => request('/admin-staff'),
        
        // Get single staff
        getById: (id) => request(`/admin-staff/${id}`),
        
        // Update staff
        update: (id, formData) => requestFormData(`/admin-staff/${id}`, formData, { method: 'PUT' }),
        
        // Delete staff
        delete: (id) => request(`/admin-staff/${id}`, { method: 'DELETE' }),
    };
    
    // ========================================
    // ADMIN STATS ENDPOINTS
    // ========================================
    
    const adminStats = {
        // Get dashboard stats
        getDashboard: () => request('/admin/stats/dashboard'),
        
        // Get recent bookings
        getRecentBookings: (limit = 10) => request(`/admin/stats/recent-bookings?limit=${limit}`),
        
        // Get chart data
        getChartData: (period = 'monthly') => request(`/admin/stats/charts?period=${period}`),
        
        // Get quick stats
        getQuickStats: () => request('/admin/stats/quick'),
    };
    
    // ========================================
    // ADMIN SETTINGS ENDPOINTS
    // ========================================
    
    const adminSettings = {
        // Get all settings
        getAll: () => request('/admin-settings'),
        
        // Toggle setting
        toggle: (key, value) => request('/admin-settings/toggle', {
            method: 'PUT',
            body: JSON.stringify({ key, value }),
        }),
    };
    
    // ========================================
    // ASSIGNMENT ENDPOINTS (Admin)
    // ========================================
    
    const assignments = {
        // Assign staff to service
        assign: (staffId, serviceId) => request('/assignments/assign', {
            method: 'POST',
            body: JSON.stringify({ staff_id: staffId, service_id: serviceId }),
        }),
        
        // Remove assignment
        remove: (assignmentId) => request(`/assignments/${assignmentId}`, { method: 'DELETE' }),
        
        // Update assignment status
        updateStatus: (assignmentId, status) => request(`/assignments/${assignmentId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        }),
        
        // Get all assignments
        getAll: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/assignments${params ? `?${params}` : ''}`);
        },
        
        // Get unassigned services
        getUnassignedServices: () => request('/assignments/services/unassigned'),
        
        // Get assigned services
        getAssignedServices: () => request('/assignments/services/assigned'),
        
        // Get all services with status
        getAllServicesWithStatus: () => request('/assignments/services/all'),
        
        // Get unassigned staff
        getUnassignedStaff: () => request('/assignments/staff/unassigned'),
        
        // Get assigned staff
        getAssignedStaff: () => request('/assignments/staff/assigned'),
        
        // Get all staff with status
        getAllStaffWithStatus: () => request('/assignments/staff/all'),
        
        // Get staff sorted by assignments
        getStaffSortedByAssignments: () => request('/assignments/staff/sorted'),
        
        // Get staff service details
        getStaffServices: (staffId) => request(`/assignments/staff/${staffId}/details`),
        
        // Get service assignment details
        getServiceAssignments: (serviceId) => request(`/assignments/services/${serviceId}/details`),
    };
    
    // ========================================
    // CONTACT ENDPOINTS
    // ========================================
    
    const contact = {
        // Submit inquiry (public)
        submit: (inquiryData) => request('/contact', {
            method: 'POST',
            body: JSON.stringify(inquiryData),
        }),
        
        // Get all inquiries (admin)
        getAll: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/contact${params ? `?${params}` : ''}`);
        },
        
        // Get single inquiry (admin)
        getById: (id) => request(`/contact/${id}`),
        
        // Reply to inquiry (admin)
        reply: (id, replyMessage) => request(`/contact/${id}/reply`, {
            method: 'POST',
            body: JSON.stringify({ reply_message: replyMessage }),
        }),
        
        // Update status (admin)
        updateStatus: (id, status) => request(`/contact/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),
        
        // Delete inquiry (admin)
        delete: (id) => request(`/contact/${id}`, { method: 'DELETE' }),
    };
    
    // ========================================
    // FEEDBACK ENDPOINTS
    // ========================================
    
    const feedback = {
        // Submit feedback (authenticated)
        submit: (feedbackData) => request('/feedbacks', {
            method: 'POST',
            body: JSON.stringify(feedbackData),
        }),
        
        // Get public feedbacks (public)
        getPublic: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/feedbacks/public${params ? `?${params}` : ''}`);
        },
        
        // Get recent feedbacks (public)
        getRecent: (limit = 10) => request(`/feedbacks/recent?limit=${limit}`),
        
        // Get my feedbacks (authenticated)
        getMy: () => request('/feedbacks/my'),
        
        // Update my feedback (authenticated)
        update: (id, feedbackData) => request(`/feedbacks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(feedbackData),
        }),
        
        // Delete my feedback (authenticated)
        delete: (id) => request(`/feedbacks/${id}`, { method: 'DELETE' }),
    };
    
    // ========================================
    // PAYMENTS ENDPOINTS
    // ========================================
    
    const payments = {
        // Get outstanding balance
        getOutstandingBalance: () => request('/payments/balance'),
        
        // Make payment
        makePayment: (paymentData) => request('/payments/pay', {
            method: 'POST',
            body: JSON.stringify(paymentData),
        }),
        
        // Pay all outstanding
        payAll: (paymentMethod, transactionId = null, reference = null, notes = null) => request('/payments/pay-all', {
            method: 'POST',
            body: JSON.stringify({
                payment_method: paymentMethod,
                transaction_id: transactionId,
                reference,
                notes,
            }),
        }),
        
        // Get payment history
        getHistory: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/payments/history${params ? `?${params}` : ''}`);
        },
        
        // Get payment receipt
        getReceipt: (paymentId) => request(`/payments/${paymentId}/receipt`),
        
        // Download payment receipt
        downloadReceipt: (paymentId) => `${BASE_URL}/payments/${paymentId}/download`,
    };
    
    // ========================================
    // PROFILE ENDPOINTS (Account)
    // ========================================
    
    const profile = {
        // Get profile
        get: () => request('/profile'),
        
        // Update profile
        update: (profileData) => request('/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        }),
        
        // Update profile photo
        updatePhoto: (photoFile) => {
            const formData = new FormData();
            formData.append('photo', photoFile);
            return requestFormData('/profile/photo', formData, { method: 'POST' });
        },
        
        // Change password
        changePassword: (currentPassword, newPassword, confirmPassword) => request('/profile/password', {
            method: 'PUT',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            }),
        }),
        
        // Get saved locations
        getLocations: () => request('/profile/locations'),
        
        // Add location
        addLocation: (locationData) => request('/profile/locations', {
            method: 'POST',
            body: JSON.stringify(locationData),
        }),
        
        // Delete location
        deleteLocation: (locationId) => request(`/profile/locations/${locationId}`, { method: 'DELETE' }),
        
        // Get saved payment methods
        getPaymentMethods: () => request('/profile/payment-methods'),
        
        // Add payment method
        addPaymentMethod: (methodData) => request('/profile/payment-methods', {
            method: 'POST',
            body: JSON.stringify(methodData),
        }),
        
        // Delete payment method
        deletePaymentMethod: (methodId) => request(`/profile/payment-methods/${methodId}`, { method: 'DELETE' }),
        
        // Get service history
        getServiceHistory: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/profile/service-history${params ? `?${params}` : ''}`);
        },
        
        // Delete service history entry
        deleteHistoryEntry: (historyId) => request(`/profile/service-history/${historyId}`, { method: 'DELETE' }),
        
        // Clear all history
        clearAllHistory: () => request('/profile/service-history', { method: 'DELETE' }),
        
        // Get notification settings
        getNotificationSettings: () => request('/profile/notifications/settings'),
        
        // Toggle web notifications
        toggleWebNotifications: (enabled) => request('/profile/notifications/toggle', {
            method: 'PUT',
            body: JSON.stringify({ enabled }),
        }),
        
        // Get web notification history
        getNotificationHistory: (limit = 50) => request(`/profile/notifications?limit=${limit}`),
        
        // Mark notification read
        markNotificationRead: (notificationId) => request(`/profile/notifications/${notificationId}/read`, {
            method: 'PUT',
        }),
        
        // Clear all notifications
        clearAllNotifications: () => request('/profile/notifications', { method: 'DELETE' }),
    };
    
    // ========================================
    // JOB APPLICATION ENDPOINTS
    // ========================================
    
    const jobApplications = {
        // Get application settings (public)
        getSettings: () => request('/jobs/settings'),
        
        // Track application by reference (public)
        trackByReference: (reference) => request(`/jobs/track/${reference}`),
        
        // Submit application (authenticated)
        submit: (formData) => requestFormData('/jobs/apply', formData),
        
        // Get my applications (authenticated)
        getMy: () => request('/jobs/my-applications'),
        
        // Track my application (authenticated)
        trackMy: (reference) => request(`/jobs/my-track/${reference}`),
        
        // Get application stats (admin)
        getStats: () => request('/jobs/stats'),
        
        // Update settings (admin)
        updateSettings: (settings) => request('/jobs/settings', {
            method: 'PUT',
            body: JSON.stringify(settings),
        }),
        
        // Get all applications (admin)
        getAll: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/jobs${params ? `?${params}` : ''}`);
        },
        
        // Get single application (admin)
        getById: (id) => request(`/jobs/${id}`),
        
        // Review application (admin)
        review: (id, status, reviewNotes = null) => request(`/jobs/${id}/review`, {
            method: 'PUT',
            body: JSON.stringify({ status, review_notes: reviewNotes }),
        }),
        
        // Delete application (admin)
        delete: (id) => request(`/jobs/${id}`, { method: 'DELETE' }),
        
        // Download application PDF (admin)
        downloadPDF: (id) => `${BASE_URL}/jobs/${id}/download`,
        
        // View application PDF (admin)
        viewPDF: (id) => `${BASE_URL}/jobs/${id}/view`,
    };
    
    // ========================================
    // RATINGS ENDPOINTS
    // ========================================
    
    const ratings = {
        // Get top rated staff (public)
        getTopStaff: (limit = 10) => request(`/ratings/top-staff?limit=${limit}`),
        
        // Get staff ratings (public)
        getStaffRatings: (staffId, limit = 20) => request(`/ratings/staff/${staffId}?limit=${limit}`),
        
        // Get ratable bookings (customer)
        getRatableBookings: () => request('/ratings/my/ratable'),
        
        // Submit rating (customer)
        submit: (ratingData) => request('/ratings/submit', {
            method: 'POST',
            body: JSON.stringify(ratingData),
        }),
        
        // Get my ratings (customer)
        getMy: () => request('/ratings/my'),
        
        // Get my ratings as staff (staff)
        getStaffMyRatings: (limit = 20, minRating = null) => {
            let url = `/ratings/staff/my?limit=${limit}`;
            if (minRating) url += `&min_rating=${minRating}`;
            return request(url);
        },
        
        // Get staff rating summary (staff)
        getStaffSummary: () => request('/ratings/staff/summary'),
        
        // Get all ratings (admin)
        getAll: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/ratings/admin/all${params ? `?${params}` : ''}`);
        },
        
        // Update rating status (admin)
        updateStatus: (id, status) => request(`/ratings/admin/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        }),
        
        // Delete rating (admin)
        delete: (id) => request(`/ratings/admin/${id}`, { method: 'DELETE' }),
    };
    
    // ========================================
    // STAFF ISSUES ENDPOINTS
    // ========================================
    
    const staffIssues = {
        // Submit issue (staff)
        submit: (issueData) => request('/staff-issues', {
            method: 'POST',
            body: JSON.stringify(issueData),
        }),
        
        // Get my issues (staff)
        getMy: (status = null, limit = 50) => {
            let url = `/staff-issues/my?limit=${limit}`;
            if (status) url += `&status=${status}`;
            return request(url);
        },
        
        // Get single issue (staff)
        getById: (id) => request(`/staff-issues/${id}`),
        
        // Get all issues (admin)
        getAll: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/staff-issues/admin/all${params ? `?${params}` : ''}`);
        },
        
        // Get issue stats (admin)
        getStats: () => request('/staff-issues/admin/stats'),
        
        // Update issue status (admin)
        updateStatus: (id, status, adminResponse = null) => request(`/staff-issues/admin/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, admin_response: adminResponse }),
        }),
        
        // Delete issue (admin)
        delete: (id) => request(`/staff-issues/admin/${id}`, { method: 'DELETE' }),
    };
    
    // ========================================
    // REPORTS ENDPOINTS (Admin)
    // ========================================
    
    const reports = {
        // Generate report
        generate: (reportData) => request('/reports/generate', {
            method: 'POST',
            body: JSON.stringify(reportData),
        }),
        
        // Get report history
        getHistory: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/reports/history${params ? `?${params}` : ''}`);
        },
        
        // Download report
        download: (reportId) => `${BASE_URL}/reports/download/${reportId}`,
        
        // Get booking analytics
        getBookingAnalytics: (dateFrom, dateTo) => request(`/reports/bookings?date_from=${dateFrom}&date_to=${dateTo}`),
        
        // Get revenue analytics
        getRevenueAnalytics: (dateFrom, dateTo) => request(`/reports/revenue?date_from=${dateFrom}&date_to=${dateTo}`),
        
        // Get staff analytics
        getStaffAnalytics: (dateFrom, dateTo) => request(`/reports/staff-performance?date_from=${dateFrom}&date_to=${dateTo}`),
        
        // Get dashboard summary
        getDashboardSummary: () => request('/reports/dashboard'),
    };
    
    // ========================================
    // ADMIN CHAT ENDPOINTS
    // ========================================
    
    const adminChats = {
        // Get supervisor chat list
        getSupervisorChats: () => request('/admin/chats/supervisors'),
        
        // Get chat with supervisor
        getChat: (supervisorId) => request(`/admin/chats/supervisor/${supervisorId}`),
        
        // Reply to supervisor
        reply: (supervisorId, message) => request(`/admin/chats/supervisor/${supervisorId}/reply`, {
            method: 'POST',
            body: JSON.stringify({ message }),
        }),
    };
    
    // ========================================
    // HEALTH CHECK
    // ========================================
    
    const health = () => request('/health');
    
    // ========================================
    // EXPORT API
    // ========================================
    
    return {
        BASE_URL,
        getAuthToken,
        setAuthToken,
        clearAuthToken,
        
        auth,
        services,
        bookings,
        staffJobs,
        supervisor,
        generalSupervisor,
        contractors,
        invoices,
        adminStaff,
        adminStats,
        adminSettings,
        assignments,
        contact,
        feedback,
        payments,
        profile,
        jobApplications,
        ratings,
        staffIssues,
        reports,
        adminChats,
        health,
    };
})();

// Make API available globally
window.API = API;