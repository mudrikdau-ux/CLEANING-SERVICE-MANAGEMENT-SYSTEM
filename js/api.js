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
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('staffLoggedIn');
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
    
    // Helper for form data requests
    async function requestFormData(endpoint, formData, options = {}) {
        const url = `${BASE_URL}${endpoint}`;
        const token = getAuthToken();
        
        const config = {
            method: options.method || 'POST',
            body: formData,
            headers: {}
        };
        
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        if (options.headers) {
            Object.keys(options.headers).forEach(key => {
                if (key.toLowerCase() !== 'content-type') {
                    config.headers[key] = options.headers[key];
                }
            });
        }
        
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
        register: (userData) => request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        }),
        
        googleLogin: (token) => request('/auth/google-login', {
            method: 'POST',
            body: JSON.stringify({ token }),
        }),
        
        login: (email, password) => request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
        
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
        
        forgotPassword: (email) => request('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),
        
        verifyResetOTP: (email, otp) => request('/auth/verify-reset-otp', {
            method: 'POST',
            body: JSON.stringify({ email, otp }),
        }),
        
        resetPassword: (resetToken, newPassword, confirmPassword) => request('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ resetToken, new_password: newPassword, confirm_password: confirmPassword }),
        }),
        
        resendResetOTP: (email) => request('/auth/resend-reset-otp', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),
        
        adminLogin: (email, password) => request('/auth/admin/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
        
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
        
        resendAdminOTP: (email) => request('/auth/admin/resend-otp', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),
        
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
        
        logout: () => request('/auth/logout', {
            method: 'POST',
        }).finally(() => clearAuthToken()),
        
        adminLogout: () => request('/auth/admin/logout', {
            method: 'POST',
        }).finally(() => clearAuthToken()),
        
        staffLogout: () => request('/auth/staff/logout', {
            method: 'POST',
        }).finally(() => clearAuthToken()),
        
        getProfile: () => request('/auth/profile'),
        
        updateProfile: (profileData) => request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        }),
        
        changePassword: (currentPassword, newPassword, confirmPassword) => request('/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            }),
        }),
        
        deleteAccount: (password, confirmDelete) => request('/auth/delete-account', {
            method: 'DELETE',
            body: JSON.stringify({ password, confirm_delete: confirmDelete }),
        }),
        
        getNotificationPreferences: () => request('/auth/notifications/preferences'),
        
        toggleEmailNotifications: (enabled) => request('/auth/notifications/toggle', {
            method: 'PUT',
            body: JSON.stringify({ email_notifications: enabled }),
        }),
        
        getNotificationHistory: (limit = 20) => request(`/auth/notifications/history?limit=${limit}`),
        
        isLoggedIn: () => {
            const token = getAuthToken();
            return token !== null && token !== undefined && token !== '';
        },
    };
    
    // ========================================
    // SERVICES ENDPOINTS
    // ========================================
    
    const services = {
        getAll: () => request('/services'),
        getById: (id) => request(`/services/${id}`),
        add: (formData) => requestFormData('/services', formData),
        update: (id, formData) => requestFormData(`/services/${id}`, formData, { method: 'PUT' }),
        delete: (id) => request(`/services/${id}`, { method: 'DELETE' }),
    };
    
    // ========================================
    // BOOKINGS ENDPOINTS
    // ========================================
    
    const bookings = {
        create: (bookingData) => request('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData),
        }),
        
        getMyBookings: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/bookings/my-bookings${params ? `?${params}` : ''}`);
        },
        
        getMyInvoices: () => request('/bookings/my-invoices'),
        
        downloadInvoice: (invoiceId) => {
            const token = getAuthToken();
            if (!token) {
                if (window.showNotification) {
                    window.showNotification('Please login first', 'error');
                }
                window.location.href = 'login.html';
                return Promise.reject(new Error('No token'));
            }
            
            const url = `${BASE_URL}/bookings/invoices/${invoiceId}/download`;
            
            return fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        clearAuthToken();
                        window.location.href = 'login.html';
                        return Promise.reject(new Error('Session expired'));
                    }
                    return response.json().then(err => {
                        throw new Error(err.message || 'Download failed');
                    });
                }
                return response.blob();
            })
            .then(blob => {
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = `invoice_${invoiceId}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(downloadUrl);
                return true;
            })
            .catch(error => {
                console.error('Download error:', error);
                if (window.showNotification) {
                    window.showNotification(error.message || 'Failed to download invoice', 'error');
                }
                throw error;
            });
        },
        
        getAll: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/bookings${params ? `?${params}` : ''}`);
        },
        
        getById: (id) => request(`/bookings/${id}`),
        
        updateStatus: (id, status) => request(`/bookings/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        }),
        
        updatePaymentStatus: (id, paymentStatus) => request(`/bookings/${id}/payment-status`, {
            method: 'PUT',
            body: JSON.stringify({ payment_status: paymentStatus }),
        }),
        
        assignStaff: (id, staffId) => request(`/bookings/${id}/assign-staff`, {
            method: 'POST',
            body: JSON.stringify({ staff_id: staffId }),
        }),
        
        removeStaff: (id) => request(`/bookings/${id}/assign-staff`, { method: 'DELETE' }),
        
        updateEstimation: (id, estimationData) => request(`/bookings/${id}/estimation`, {
            method: 'POST',
            body: JSON.stringify(estimationData),
        }),
        
        generateInvoice: (id, dueDate, notes) => request(`/bookings/${id}/generate-invoice`, {
            method: 'POST',
            body: JSON.stringify({ due_date: dueDate, notes }),
        }),
        
        getStats: () => request('/bookings/stats'),
        
        getReceipt: (id) => request(`/bookings/${id}/receipt`),
        
        cancel: (id) => request(`/bookings/${id}/cancel`, { method: 'PUT' }),
        
        getStaffAssignments: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/bookings/staff/my-assignments${params ? `?${params}` : ''}`);
        },
    };
    
    // ========================================
    // STAFF JOBS ENDPOINTS
    // ========================================
    
    const staffJobs = {
        getAssignedJobs: (status = null) => {
            const url = status ? `/staff/jobs?status=${status}` : '/staff/jobs';
            return request(url);
        },
        getJobDetails: (jobId) => request(`/staff/jobs/${jobId}`),
        updateJobStatus: (jobId, status) => request(`/staff/jobs/${jobId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        }),
        getJobHistory: (limit = 50, offset = 0) => request(`/staff/jobs/history?limit=${limit}&offset=${offset}`),
        getPerformanceStats: () => request('/staff/performance'),
        getProfile: () => request('/staff/profile'),
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
    // JOB VERIFICATION ENDPOINTS (STAFF)
    // ========================================
    
    const jobVerification = {
        // Staff requests to start a job
        requestStart: (bookingId) => request(`/staff/jobs/${bookingId}/request-start`, {
            method: 'POST'
        }),
        // Staff requests to complete a job
        requestComplete: (bookingId) => request(`/staff/jobs/${bookingId}/request-complete`, {
            method: 'POST'
        }),
        // Get verification status for a job
        getStatus: (bookingId) => request(`/staff/jobs/${bookingId}/verification`),
    };
    
    // ========================================
    // SUPERVISOR ENDPOINTS
    // ========================================
    
    const supervisor = {
        getProfile: () => request('/supervisor/profile'),
        changePassword: (currentPassword, newPassword, confirmPassword) => request('/supervisor/change-password', {
            method: 'PUT',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            }),
        }),
        getContractors: () => request('/supervisor/contractors'),
        getContractorStaff: (contractorId) => request(`/supervisor/contractors/${contractorId}/staff`),
        saveAttendance: (contractorId, attendanceDate, staffAttendance) => request('/supervisor/attendance', {
            method: 'POST',
            body: JSON.stringify({
                contractor_id: contractorId,
                attendance_date: attendanceDate,
                staff_attendance: staffAttendance,
            }),
        }),
        getAttendance: (contractorId, date) => request(`/supervisor/attendance/${contractorId}/${date}`),
        getPayrollSummary: (weekEndingDate) => request(`/supervisor/payroll/${weekEndingDate}`),
        generateWeeklyReport: (reportData) => request('/supervisor/reports', {
            method: 'POST',
            body: JSON.stringify(reportData),
        }),
        getMyReports: () => request('/supervisor/reports'),
        downloadReport: (reportId) => `${BASE_URL}/supervisor/reports/${reportId}/download`,
        submitReportToAdmin: (reportId) => request(`/supervisor/reports/${reportId}/submit`, { method: 'POST' }),
        getChatMessages: () => request('/supervisor/chat/messages'),
        getUnreadCount: () => request('/supervisor/chat/unread'),
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
        // Profile
        getProfile: () => request('/general-supervisor/profile'),
        changePassword: (currentPassword, newPassword, confirmPassword) => request('/general-supervisor/change-password', {
            method: 'PUT',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            }),
        }),
        
        // Dashboard
        getDashboardStats: () => request('/general-supervisor/dashboard/stats'),
        
        // Team Management
        getMyTeam: () => request('/general-supervisor/team'),
        getAllTeamJobs: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/general-supervisor/team/jobs${params ? `?${params}` : ''}`);
        },
        getTeamJobs: (staffId, filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/general-supervisor/team/${staffId}/jobs${params ? `?${params}` : ''}`);
        },
        getJobLogs: (assignmentId) => request(`/general-supervisor/jobs/${assignmentId}/logs`),
        
        // Verification Workflow
        confirmCustomerStart: (assignmentId, confirmed, notes = '') => 
            request(`/general-supervisor/jobs/${assignmentId}/confirm-start`, {
                method: 'PUT',
                body: JSON.stringify({ confirmed, notes })
            }),
        markJobStarted: (assignmentId, notes = '') => 
            request(`/general-supervisor/jobs/${assignmentId}/start`, {
                method: 'PUT',
                body: JSON.stringify({ notes })
            }),
        confirmCustomerCompletion: (assignmentId, confirmed, notes = '') => 
            request(`/general-supervisor/jobs/${assignmentId}/confirm-complete`, {
                method: 'PUT',
                body: JSON.stringify({ confirmed, notes })
            }),
        markJobCompleted: (assignmentId, notes = '') => 
            request(`/general-supervisor/jobs/${assignmentId}/complete`, {
                method: 'PUT',
                body: JSON.stringify({ notes })
            }),
        
        // Notifications
        getNotifications: (unreadOnly = false) => 
            request(`/general-supervisor/notifications${unreadOnly ? '?unread_only=true' : ''}`),
        markNotificationRead: (notificationId) => 
            request(`/general-supervisor/notifications/${notificationId}/read`, {
                method: 'PUT'
            }),
        
        // Cash Payment Validation
        getCashPaymentList: () => request('/general-supervisor/payments/cash/list'),
        validateCashPayment: (bookingId, amountReceived, paymentNote) => 
            request('/general-supervisor/payments/cash/validate', {
                method: 'POST',
                body: JSON.stringify({ 
                    booking_id: bookingId, 
                    amount_received: amountReceived, 
                    payment_note: paymentNote 
                }),
            }),
        getCashPaymentStats: () => request('/general-supervisor/payments/cash/stats'),
        getCashPaymentHistory: (limit = 50) => 
            request(`/general-supervisor/payments/cash/history?limit=${limit}`),
        
        // Weekly Reports
        generateWeeklyReport: (reportData) => request('/general-supervisor/reports', {
            method: 'POST',
            body: JSON.stringify(reportData),
        }),
        getMyReports: () => request('/general-supervisor/reports'),
        downloadReport: (reportId) => `${BASE_URL}/general-supervisor/reports/${reportId}/download`,
        submitReportToAdmin: (reportId) => 
            request(`/general-supervisor/reports/${reportId}/submit`, { method: 'POST' }),
        
        // Chat System
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
    // CONTRACTORS ENDPOINTS
    // ========================================
    
    const contractors = {
        add: (contractorData) => request('/contractors', {
            method: 'POST',
            body: JSON.stringify(contractorData),
        }),
        getAll: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/contractors${params ? `?${params}` : ''}`);
        },
        getById: (id) => request(`/contractors/${id}`),
        update: (id, contractorData) => request(`/contractors/${id}`, {
            method: 'PUT',
            body: JSON.stringify(contractorData),
        }),
        delete: (id) => request(`/contractors/${id}`, { method: 'DELETE' }),
        updateStatus: (id, status) => request(`/contractors/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),
        search: (query) => request(`/contractors/search?q=${encodeURIComponent(query)}`),
        getInvoices: (id) => request(`/contractors/${id}/invoices`),
    };
    
    // ========================================
    // INVOICES ENDPOINTS
    // ========================================
    
    const invoices = {
        generate: (invoiceData) => request('/invoices', {
            method: 'POST',
            body: JSON.stringify(invoiceData),
        }),
        getAll: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/invoices${params ? `?${params}` : ''}`);
        },
        getById: (id) => request(`/invoices/${id}`),
        delete: (id) => request(`/invoices/${id}`, { method: 'DELETE' }),
        updateStatus: (id, status) => request(`/invoices/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),
        downloadPDF: (id) => `${BASE_URL}/invoices/${id}/download`,
        viewPDF: (id) => `${BASE_URL}/invoices/${id}/view`,
    };
    
    // ========================================
    // ADMIN STAFF ENDPOINTS
    // ========================================
    
    const adminStaff = {
        add: (formData) => requestFormData('/admin-staff', formData, { method: 'POST' }),
        getAll: () => request('/admin-staff'),
        getById: (id) => request(`/admin-staff/${id}`),
        update: (id, formData) => requestFormData(`/admin-staff/${id}`, formData, { method: 'PUT' }),
        delete: (id) => request(`/admin-staff/${id}`, { method: 'DELETE' }),
    };
    
    // ========================================
    // ADMIN STATS ENDPOINTS
    // ========================================
    
    const adminStats = {
        getDashboard: () => request('/admin/stats/dashboard'),
        getRecentBookings: (limit = 10) => request(`/admin/stats/recent-bookings?limit=${limit}`),
        getChartData: (period = 'monthly') => request(`/admin/stats/charts?period=${period}`),
        getQuickStats: () => request('/admin/stats/quick'),
    };
    
    // ========================================
    // ADMIN SETTINGS ENDPOINTS
    // ========================================
    
    const adminSettings = {
        getAll: () => request('/admin-settings'),
        toggle: (key, value) => request('/admin-settings/toggle', {
            method: 'PUT',
            body: JSON.stringify({ key, value }),
        }),
    };
    
    // ========================================
    // ASSIGNMENT ENDPOINTS
    // ========================================
    
    const assignments = {
        assign: (staffId, serviceId) => request('/assignments/assign', {
            method: 'POST',
            body: JSON.stringify({ staff_id: staffId, service_id: serviceId }),
        }),
        remove: (assignmentId) => request(`/assignments/${assignmentId}`, { method: 'DELETE' }),
        updateStatus: (assignmentId, status) => request(`/assignments/${assignmentId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        }),
        getAll: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/assignments${params ? `?${params}` : ''}`);
        },
        getPaidUnassigned: () => request('/assignments/paid-unassigned'),
        getUnassignedServices: () => request('/assignments/services/unassigned'),
        getAssignedServices: () => request('/assignments/services/assigned'),
        getAllServicesWithStatus: () => request('/assignments/services/all'),
        getUnassignedStaff: () => request('/assignments/staff/unassigned'),
        getAssignedStaff: () => request('/assignments/staff/assigned'),
        getAllStaffWithStatus: () => request('/assignments/staff/all'),
        getStaffSortedByAssignments: () => request('/assignments/staff/sorted'),
        getStaffServices: (staffId) => request(`/assignments/staff/${staffId}/details`),
        getServiceAssignments: (serviceId) => request(`/assignments/services/${serviceId}/details`),
    };
    
    // ========================================
    // CONTACT ENDPOINTS
    // ========================================
    
    const contact = {
        submit: (inquiryData) => request('/contact', {
            method: 'POST',
            body: JSON.stringify(inquiryData),
        }),
        getAll: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/contact${params ? `?${params}` : ''}`);
        },
        getById: (id) => request(`/contact/${id}`),
        reply: (id, replyMessage) => request(`/contact/${id}/reply`, {
            method: 'POST',
            body: JSON.stringify({ reply_message: replyMessage }),
        }),
        updateStatus: (id, status) => request(`/contact/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }),
        delete: (id) => request(`/contact/${id}`, { method: 'DELETE' }),
    };
    
    // ========================================
    // FEEDBACK ENDPOINTS
    // ========================================
    
    const feedback = {
        submit: (feedbackData) => request('/feedbacks', {
            method: 'POST',
            body: JSON.stringify(feedbackData),
        }),
        getPublic: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/feedbacks/public${params ? `?${params}` : ''}`);
        },
        getRecent: (limit = 10) => request(`/feedbacks/recent?limit=${limit}`),
        getMy: () => request('/feedbacks/my'),
        update: (id, feedbackData) => request(`/feedbacks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(feedbackData),
        }),
        delete: (id) => request(`/feedbacks/${id}`, { method: 'DELETE' }),
    };
    
    // ========================================
    // PAYMENTS ENDPOINTS
    // ========================================
    
    const payments = {
        getOutstandingBalance: () => request('/payments/balance'),
        makePayment: (paymentData) => request('/payments/pay', {
            method: 'POST',
            body: JSON.stringify(paymentData),
        }),
        payAll: (paymentMethod, transactionId = null, reference = null, notes = null) => request('/payments/pay-all', {
            method: 'POST',
            body: JSON.stringify({
                payment_method: paymentMethod,
                transaction_id: transactionId,
                reference,
                notes,
            }),
        }),
        getHistory: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/payments/history${params ? `?${params}` : ''}`);
        },
        getReceipt: (paymentId) => request(`/payments/${paymentId}/receipt`),
        downloadReceipt: (paymentId) => `${BASE_URL}/payments/${paymentId}/download`,
    };
    
    // ========================================
    // PROFILE ENDPOINTS
    // ========================================
    
    const profile = {
        get: () => request('/profile'),
        update: (profileData) => request('/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        }),
        updatePhoto: (photoFile) => {
            const formData = new FormData();
            formData.append('photo', photoFile);
            return requestFormData('/profile/photo', formData, { method: 'POST' });
        },
        changePassword: (currentPassword, newPassword, confirmPassword) => request('/profile/password', {
            method: 'PUT',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            }),
        }),
        getLocations: () => request('/profile/locations'),
        addLocation: (locationData) => request('/profile/locations', {
            method: 'POST',
            body: JSON.stringify(locationData),
        }),
        deleteLocation: (locationId) => request(`/profile/locations/${locationId}`, { method: 'DELETE' }),
        getPaymentMethods: () => request('/profile/payment-methods'),
        addPaymentMethod: (methodData) => request('/profile/payment-methods', {
            method: 'POST',
            body: JSON.stringify(methodData),
        }),
        deletePaymentMethod: (methodId) => request(`/profile/payment-methods/${methodId}`, { method: 'DELETE' }),
        getServiceHistory: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/profile/service-history${params ? `?${params}` : ''}`);
        },
        deleteHistoryEntry: (historyId) => request(`/profile/service-history/${historyId}`, { method: 'DELETE' }),
        clearAllHistory: () => request('/profile/service-history', { method: 'DELETE' }),
        getNotificationSettings: () => request('/profile/notifications/settings'),
        toggleWebNotifications: (enabled) => request('/profile/notifications/toggle', {
            method: 'PUT',
            body: JSON.stringify({ enabled }),
        }),
        getNotificationHistory: (limit = 50) => request(`/profile/notifications?limit=${limit}`),
        markNotificationRead: (notificationId) => request(`/profile/notifications/${notificationId}/read`, {
            method: 'PUT',
        }),
        clearAllNotifications: () => request('/profile/notifications', { method: 'DELETE' }),
    };
    
    // ========================================
    // JOB APPLICATION ENDPOINTS
    // ========================================
    
    const jobApplications = {
        getSettings: () => request('/jobs/settings'),
        trackByReference: (reference) => request(`/jobs/track/${reference}`),
        submit: (formData) => requestFormData('/jobs/apply', formData),
        getMy: () => request('/jobs/my-applications'),
        trackMy: (reference) => request(`/jobs/my-track/${reference}`),
        getStats: () => request('/jobs/stats'),
        updateSettings: (settings) => request('/jobs/settings', {
            method: 'PUT',
            body: JSON.stringify(settings),
        }),
        getAll: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/jobs${params ? `?${params}` : ''}`);
        },
        getById: (id) => request(`/jobs/${id}`),
        review: (id, status, reviewNotes = null) => request(`/jobs/${id}/review`, {
            method: 'PUT',
            body: JSON.stringify({ status, review_notes: reviewNotes }),
        }),
        delete: (id) => request(`/jobs/${id}`, { method: 'DELETE' }),
        downloadPDF: (id) => `${BASE_URL}/jobs/${id}/download`,
        viewPDF: (id) => `${BASE_URL}/jobs/${id}/view`,
    };
    
    // ========================================
    // RATINGS ENDPOINTS
    // ========================================
    
    const ratings = {
        getTopStaff: (limit = 10) => request(`/ratings/top-staff?limit=${limit}`),
        getStaffRatings: (staffId, limit = 20) => request(`/ratings/staff/${staffId}?limit=${limit}`),
        getRatableBookings: () => request('/ratings/my/ratable'),
        submit: (ratingData) => request('/ratings/submit', {
            method: 'POST',
            body: JSON.stringify(ratingData),
        }),
        getMy: () => request('/ratings/my'),
        getStaffMyRatings: (limit = 20, minRating = null) => {
            let url = `/ratings/staff/my?limit=${limit}`;
            if (minRating) url += `&min_rating=${minRating}`;
            return request(url);
        },
        getStaffSummary: () => request('/ratings/staff/summary'),
        getAll: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/ratings/admin/all${params ? `?${params}` : ''}`);
        },
        updateStatus: (id, status) => request(`/ratings/admin/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        }),
        delete: (id) => request(`/ratings/admin/${id}`, { method: 'DELETE' }),
    };
    
    // ========================================
    // STAFF ISSUES ENDPOINTS
    // ========================================
    
    const staffIssues = {
        submit: (issueData) => request('/staff-issues', {
            method: 'POST',
            body: JSON.stringify(issueData),
        }),
        getMy: (status = null, limit = 50) => {
            let url = `/staff-issues/my?limit=${limit}`;
            if (status) url += `&status=${status}`;
            return request(url);
        },
        getById: (id) => request(`/staff-issues/${id}`),
        getAll: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/staff-issues/admin/all${params ? `?${params}` : ''}`);
        },
        getStats: () => request('/staff-issues/admin/stats'),
        updateStatus: (id, status, adminResponse = null) => request(`/staff-issues/admin/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, admin_response: adminResponse }),
        }),
        delete: (id) => request(`/staff-issues/admin/${id}`, { method: 'DELETE' }),
    };
    
    // ========================================
    // REAL-TIME PAYMENT STATUS CHECK
    // ========================================
    
    const paymentStatus = {
        startPolling: function(interval = 5000) {
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval);
            }
            
            this.pollingInterval = setInterval(() => {
                this.checkForUpdates();
            }, interval);
            
            console.log('✅ Payment status polling started (every ' + interval + 'ms)');
        },
        
        stopPolling: function() {
            if (this.pollingInterval) {
                clearInterval(this.pollingInterval);
                this.pollingInterval = null;
                console.log('⏹️ Payment status polling stopped');
            }
        },
        
        checkForUpdates: async function() {
            try {
                const token = this.getAuthToken();
                if (!token) return;
                
                const payload = this.debugToken ? this.debugToken() : null;
                if (!payload || payload.role !== 'admin') return;
                
                const bookingsSection = document.getElementById('bookingsSection');
                if (!bookingsSection || !bookingsSection.classList.contains('active')) return;
                
                const rows = document.querySelectorAll('#bookingList tr');
                if (rows.length === 0) return;
                
                let hasUnpaid = false;
                for (const row of rows) {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 7) {
                        const paymentCell = cells[6];
                        if (paymentCell && paymentCell.textContent.includes('Unpaid')) {
                            hasUnpaid = true;
                            break;
                        }
                    }
                }
                
                if (!hasUnpaid) return;
                
                console.log('🔄 Checking for payment updates...');
                if (window.loadBookings) {
                    await window.loadBookings();
                }
            } catch (error) {
                console.error('Payment status check error:', error);
            }
        },
        
        getAuthToken: function() {
            return localStorage.getItem('cleanspark_token') || sessionStorage.getItem('cleanspark_token');
        },
        
        debugToken: function() {
            const token = this.getAuthToken();
            if (!token) return null;
            try {
                const parts = token.split('.');
                return JSON.parse(atob(parts[1]));
            } catch (e) {
                return null;
            }
        },
        
        pollingInterval: null
    };
    
    window.paymentStatus = paymentStatus;
    
    // ========================================
    // REPORTS ENDPOINTS
    // ========================================
    
    const reports = {
        generate: (reportData) => request('/reports/generate', {
            method: 'POST',
            body: JSON.stringify(reportData),
        }),
        getHistory: (filters = {}) => {
            const params = new URLSearchParams(filters).toString();
            return request(`/reports/history${params ? `?${params}` : ''}`);
        },
        download: (reportId) => `${BASE_URL}/reports/download/${reportId}`,
        shareViaEmail: (reportId, email, message = '') => request(`/reports/share/${reportId}`, {
            method: 'POST',
            body: JSON.stringify({ email, message }),
        }),
        getBookingAnalytics: (dateFrom, dateTo) => request(`/reports/bookings?date_from=${dateFrom}&date_to=${dateTo}`),
        getRevenueAnalytics: (dateFrom, dateTo) => request(`/reports/revenue?date_from=${dateFrom}&date_to=${dateTo}`),
        getDashboardSummary: () => request('/reports/dashboard'),
    };
    
    // ========================================
    // ADMIN CHAT ENDPOINTS
    // ========================================
    
    const adminChats = {
        getSupervisorChats: () => request('/admin/chats/supervisors'),
        getChat: (supervisorId) => request(`/admin/chats/supervisor/${supervisorId}`),
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
        jobVerification,
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
        paymentStatus,
        reports,
        adminChats,
        health,
    };
})();

// Make API available globally
window.API = API;

// ========================================
// AUTO-START PAYMENT STATUS POLLING
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    const token = API.getAuthToken();
    if (token) {
        try {
            const parts = token.split('.');
            const payload = JSON.parse(atob(parts[1]));
            if (payload.role === 'admin') {
                API.paymentStatus.startPolling(3000);
                console.log('✅ Payment status polling auto-started');
            }
        } catch (e) {
            // Silent fail
        }
    }
});

window.checkPaymentStatus = function() {
    API.paymentStatus.checkForUpdates();
};

console.log('✅ API.js fully loaded with admin integration');