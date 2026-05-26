// ===== COMBINED REGISTER & AUTHENTICATION SCRIPT =====
// Includes all functionality for registration page using API endpoints

// Store registration data temporarily
let pendingRegistrationData = null;

// ===== SIDEBAR FUNCTIONS =====
function openSidebar() {
    document.getElementById("sidebar").style.width = "280px";
    document.body.style.overflow = "hidden";
}

function closeSidebar() {
    document.getElementById("sidebar").style.width = "0";
    document.body.style.overflow = "auto";
}

// Close sidebar when clicking outside
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.querySelector('.hamburger');
    
    if (sidebar && hamburger) {
        if (!sidebar.contains(event.target) && !hamburger.contains(event.target) && sidebar.style.width === '280px') {
            closeSidebar();
        }
    }
});

// ===== AUTHENTICATION FUNCTIONS =====

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true' || !!API.getAuthToken();
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Save pending booking data
function savePendingBooking(serviceData) {
    if (serviceData) {
        localStorage.setItem('pendingBooking', JSON.stringify(serviceData));
    }
}

// Get and clear pending booking data
function getPendingBooking() {
    const data = localStorage.getItem('pendingBooking');
    localStorage.removeItem('pendingBooking');
    return data ? JSON.parse(data) : null;
}

// Handle login success after registration
function handleLoginSuccess(userData) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    const pendingBooking = getPendingBooking();
    if (pendingBooking) {
        showNotification('Registration successful! Redirecting to booking...', 'success');
        setTimeout(() => {
            window.location.href = 'booking.html';
        }, 1500);
    } else {
        showNotification('Registration successful! Welcome to CleanSpark!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

// Handle logout
function logout() {
    API.auth.logout().finally(() => {
        showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    });
}

// ===== UTILITY FUNCTIONS =====

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone number
function validatePhone(phone) {
    if (!phone) return true;
    const re = /^[\+][0-9]{10,15}$|^[0][0-9]{9,14}$/;
    return re.test(phone);
}

// Show loading spinner
function showLoading(show = true) {
    let spinner = document.getElementById('loading-spinner');
    if (!spinner && show) {
        spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
        spinner.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; background: rgba(0,0,0,0.5); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;';
        document.body.appendChild(spinner);
    } else if (spinner && !show) {
        spinner.remove();
    } else if (spinner) {
        spinner.style.display = show ? 'flex' : 'none';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.alert');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.role = 'alert';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// ===== CELEBRATION FUNCTION =====
function launchCelebration() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#4361ee', '#4cc9f0', '#f72585', '#f8961e', '#4bb543']
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#4361ee', '#4cc9f0', '#f72585', '#f8961e', '#4bb543']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

// ===== REGISTRATION API CALLS =====

// Register user with API
async function registerUser(userData) {
    try {
        showLoading(true);
        const response = await API.auth.register(userData);
        showLoading(false);
        return { success: true, data: response };
    } catch (error) {
        showLoading(false);
        console.error('Registration error:', error);
        return { success: false, error: error.message };
    }
}

// Login to get OTP
async function loginUser(email, password) {
    try {
        showLoading(true);
        const response = await API.auth.login(email, password);
        showLoading(false);
        return { success: true, data: response };
    } catch (error) {
        showLoading(false);
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

// Verify OTP
async function verifyOTP(email, otp) {
    try {
        showLoading(true);
        const response = await API.auth.verifyOTP(email, otp);
        showLoading(false);
        return { success: true, data: response };
    } catch (error) {
        showLoading(false);
        console.error('OTP verification error:', error);
        return { success: false, error: error.message };
    }
}

// Resend OTP
async function resendOTP(email, password) {
    try {
        showLoading(true);
        const response = await API.auth.login(email, password);
        showLoading(false);
        return { success: true, data: response };
    } catch (error) {
        showLoading(false);
        console.error('Resend OTP error:', error);
        return { success: false, error: error.message };
    }
}

// ===== FORM HANDLING =====

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    
    let strengthText = '';
    let strengthColor = '';
    
    if (password.length === 0) {
        strengthText = '';
    } else if (strength <= 2) {
        strengthText = 'Weak';
        strengthColor = '#f72585';
    } else if (strength <= 4) {
        strengthText = 'Medium';
        strengthColor = '#f8961e';
    } else {
        strengthText = 'Strong';
        strengthColor = '#4bb543';
    }
    
    return { text: strengthText, color: strengthColor };
}

// Show password strength indicator
function updatePasswordStrength(password) {
    let existingIndicator = document.getElementById('passwordStrength');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    const result = checkPasswordStrength(password);
    
    if (result.text) {
        const passwordInput = document.getElementById('password');
        const indicator = document.createElement('small');
        indicator.id = 'passwordStrength';
        indicator.textContent = `Password strength: ${result.text}`;
        indicator.style.color = result.color;
        indicator.style.display = 'block';
        indicator.style.marginTop = '5px';
        passwordInput.parentNode.appendChild(indicator);
    }
}

// Check password match
function checkPasswordMatch() {
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;
    
    let existingMatch = document.getElementById('passwordMatch');
    if (existingMatch) {
        existingMatch.remove();
    }
    
    if (confirm.length > 0) {
        const confirmInput = document.getElementById('confirmPassword');
        const matchIndicator = document.createElement('small');
        matchIndicator.id = 'passwordMatch';
        
        if (password === confirm) {
            matchIndicator.textContent = '✓ Passwords match';
            matchIndicator.style.color = '#4bb543';
        } else {
            matchIndicator.textContent = '✗ Passwords do not match';
            matchIndicator.style.color = '#f72585';
        }
        
        matchIndicator.style.display = 'block';
        matchIndicator.style.marginTop = '5px';
        confirmInput.parentNode.appendChild(matchIndicator);
    }
}

// Get form field values safely
function getFormFieldValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : '';
}

// ==================== FIXED: Process registration with confirm_password ====================
async function processRegistration(formData) {
    // BACKEND VALIDATE EXPECTS: first_name, last_name, email, password, confirm_password, address, gender
    const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.password,  // ✅ FIXED - add confirm_password
        address: formData.address,
        gender: formData.gender
    };
    
    console.log('Step 1: Registering user:', userData.email);
    console.log('Registration data sent:', Object.keys(userData));
    
    const result = await registerUser(userData);
    
    if (result.success) {
        // Store pending data for OTP verification
        pendingRegistrationData = {
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            gender: formData.gender,
            phone: formData.phone || ''
        };
        
        // Step 2: Auto-login to send OTP
        console.log('Step 2: Auto-login to send OTP for:', formData.email);
        const loginResult = await loginUser(formData.email, formData.password);
        
        if (loginResult.success) {
            // Show OTP modal
            const otpModalElement = document.getElementById('otpModal');
            if (otpModalElement) {
                const otpModal = new bootstrap.Modal(otpModalElement);
                document.getElementById('verificationEmail').textContent = formData.email;
                otpModal.show();
            }
            showNotification('Verification code sent to your email!', 'success');
            return true;
        } else {
            showNotification('User registered but failed to send verification code. Please try logging in.', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return false;
        }
    } else {
        if (result.error && result.error.toLowerCase().includes('already')) {
            showNotification('Email already registered. Please login instead.', 'danger');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else if (result.error && result.error.toLowerCase().includes('confirm')) {
            showNotification('Password confirmation validation failed. Please try again.', 'danger');
        } else {
            showNotification(result.error || 'Registration failed. Please try again.', 'danger');
        }
        return false;
    }
}

// Handle OTP verification
async function handleOTPVerification() {
    const otp = document.getElementById('otpCode').value.trim();
    
    if (!otp || otp.length !== 6) {
        showNotification('Please enter a valid 6-digit verification code', 'danger');
        return;
    }
    
    if (!pendingRegistrationData || !pendingRegistrationData.email) {
        showNotification('Session expired. Please try logging in again.', 'danger');
        window.location.href = 'login.html';
        return;
    }
    
    const result = await verifyOTP(pendingRegistrationData.email, otp);
    
    if (result.success && result.data.token) {
        // Close OTP modal
        const otpModalElement = document.getElementById('otpModal');
        if (otpModalElement) {
            const otpModal = bootstrap.Modal.getInstance(otpModalElement);
            if (otpModal) otpModal.hide();
        }
        
        launchCelebration();
        handleLoginSuccess({
            id: result.data.user?.id || null,
            email: pendingRegistrationData.email,
            first_name: pendingRegistrationData.firstName,
            last_name: pendingRegistrationData.lastName,
            full_name: `${pendingRegistrationData.firstName} ${pendingRegistrationData.lastName}`,
            address: pendingRegistrationData.address,
            gender: pendingRegistrationData.gender,
            phone: pendingRegistrationData.phone,
            role: result.data.user?.role || 'user'
        });
        
        // Clear pending data
        pendingRegistrationData = null;
        document.getElementById('otpCode').value = '';
    } else {
        showNotification(result.error || 'Invalid verification code. Please try again.', 'danger');
    }
}

// Handle resend OTP
async function handleResendOTP() {
    if (!pendingRegistrationData || !pendingRegistrationData.email || !pendingRegistrationData.password) {
        showNotification('Session expired. Please try registering again.', 'danger');
        const otpModal = bootstrap.Modal.getInstance(document.getElementById('otpModal'));
        if (otpModal) otpModal.hide();
        return;
    }
    
    showNotification('Resending verification code...', 'info');
    const result = await resendOTP(pendingRegistrationData.email, pendingRegistrationData.password);
    
    if (result.success) {
        showNotification('New verification code sent to your email!', 'success');
    } else {
        showNotification(result.error || 'Failed to resend code. Please try again.', 'danger');
    }
}

// ===== GOOGLE REGISTER HANDLER =====
function handleGoogleRegister() {
    showNotification('Google Sign-In coming soon. Please use email registration.', 'info');
}

// ===== DOM CONTENT LOADED EVENT =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Register page loaded');
    
    if (isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }
    
    const pendingBooking = localStorage.getItem('pendingBooking');
    if (pendingBooking) {
        showNotification('Complete registration to continue with your booking', 'info');
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        console.log('Register form found');
        
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                updatePasswordStrength(this.value);
                checkPasswordMatch();
            });
        }
        
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', checkPasswordMatch);
        }
        
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Form submitted');
            
            const firstName = getFormFieldValue('firstName');
            const lastName = getFormFieldValue('lastName');
            const email = getFormFieldValue('email');
            const phone = getFormFieldValue('phone');
            const password = document.getElementById('password')?.value || '';
            const confirmPassword = document.getElementById('confirmPassword')?.value || '';
            const address = getFormFieldValue('address');
            const gender = getFormFieldValue('gender');
            const terms = document.getElementById('terms')?.checked || false;
            
            console.log('Form values:', { firstName, lastName, email, phone, address, gender, termsChecked: terms });
            
            const missingFields = [];
            if (!firstName) missingFields.push('First Name');
            if (!lastName) missingFields.push('Last Name');
            if (!email) missingFields.push('Email');
            if (!password) missingFields.push('Password');
            if (!confirmPassword) missingFields.push('Confirm Password');
            if (!address) missingFields.push('Address');
            if (!gender) missingFields.push('Gender');
            
            if (missingFields.length > 0) {
                showNotification(`Please fill in: ${missingFields.join(', ')}`, 'danger');
                return;
            }
            
            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'danger');
                return;
            }
            
            if (password.length < 6) {
                showNotification('Password must be at least 6 characters', 'danger');
                return;
            }
            
            if (!terms) {
                showNotification('Please agree to Terms and Conditions', 'danger');
                return;
            }
            
            if (!validateEmail(email)) {
                showNotification('Please enter a valid email address', 'danger');
                return;
            }
            
            if (phone && !validatePhone(phone)) {
                showNotification('Please enter a valid phone number', 'danger');
                return;
            }
            
            if (!['Male', 'Female', 'Other'].includes(gender)) {
                showNotification('Please select a valid gender', 'danger');
                return;
            }
            
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
            
            const formData = { firstName, lastName, email, phone, password, address, gender };
            const success = await processRegistration(formData);
            
            if (!success) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
    
    // OTP MODAL HANDLERS
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const resendOtpBtn = document.getElementById('resendOtpBtn');
    const otpCodeInput = document.getElementById('otpCode');
    
    if (verifyOtpBtn) verifyOtpBtn.addEventListener('click', handleOTPVerification);
    if (resendOtpBtn) resendOtpBtn.addEventListener('click', handleResendOTP);
    if (otpCodeInput) {
        otpCodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleOTPVerification();
        });
    }
    
    const otpModal = document.getElementById('otpModal');
    if (otpModal) {
        otpModal.addEventListener('hidden.bs.modal', function() {
            if (otpCodeInput) otpCodeInput.value = '';
        });
    }
    
    // TERMS MODAL
    const termsModalElement = document.getElementById('termsModal');
    const openTermsLink = document.getElementById('openTermsModal');
    const agreeTermsBtn = document.getElementById('agreeTermsBtn');
    const termsCheckbox = document.getElementById('terms');
    
    if (termsModalElement && openTermsLink && agreeTermsBtn && termsCheckbox) {
        const termsModal = new bootstrap.Modal(termsModalElement);
        openTermsLink.addEventListener('click', function(e) {
            e.preventDefault();
            termsModal.show();
        });
        agreeTermsBtn.addEventListener('click', function() {
            termsCheckbox.checked = true;
            termsModal.hide();
            showNotification('You have agreed to the Terms and Conditions', 'success');
        });
    }
    
    // SOCIAL LOGIN
    const socialRegisterBtn = document.getElementById('googleRegisterBtn');
    if (socialRegisterBtn) {
        socialRegisterBtn.addEventListener('click', handleGoogleRegister);
    }
    
    // NEWSLETTER
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                if (validateEmail(emailInput.value)) {
                    showNotification('Thank you for subscribing!', 'success');
                    emailInput.value = '';
                } else {
                    showNotification('Please enter a valid email address', 'danger');
                }
            }
        });
    }
});