/**
 * CleanSpark Register Page - Fully Integrated with Backend API
 * Handles user registration with OTP verification and Google Sign-In
 */

// ===== GOOGLE CLIENT CONFIGURATION =====
const GOOGLE_CLIENT_ID = '91975372653-8u9lcjinnjj7r0qvga02adot9jpn0ehg.apps.googleusercontent.com';

// Store registration data temporarily for OTP verification
let pendingRegistrationData = null;
let otpTimerInterval = null;
let otpSecondsRemaining = 60;

// ===== SIDEBAR FUNCTIONS =====
function openSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
        if (window.innerWidth <= 300) {
            sidebar.style.width = "100%";
        } else {
            sidebar.style.width = "280px";
        }
        document.body.style.overflow = "hidden";
    }
}

function closeSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
        sidebar.style.width = "0";
        document.body.style.overflow = "auto";
    }
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

// ===== UTILITY FUNCTIONS =====

// Validate email format
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

// Show notification
function showNotification(message, type) {
    const existingNotification = document.querySelector('.alert');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.role = 'alert';
    notification.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
    
    if (window.innerWidth <= 576) {
        notification.style.cssText = 'position: fixed; top: 10px; left: 10px; right: 10px; z-index: 9999;';
    } else {
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px; max-width: 90vw;';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Show loading spinner
function showLoading(show) {
    let spinner = document.getElementById('loading-spinner');
    if (!spinner && show) {
        spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
        spinner.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; background: rgba(0,0,0,0.5); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;';
        document.body.appendChild(spinner);
    }
    if (spinner) {
        spinner.style.display = show ? 'flex' : 'none';
    }
}

// Set button loading state
function setButtonLoading(button, isLoading, text) {
    if (!button) return;
    
    if (isLoading) {
        button.disabled = true;
        if (!button.getAttribute('data-original-html')) {
            button.setAttribute('data-original-html', button.innerHTML);
        }
        button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${text || 'Loading...'}`;
    } else {
        button.disabled = false;
        const originalHtml = button.getAttribute('data-original-html');
        if (originalHtml) {
            button.innerHTML = originalHtml;
            button.removeAttribute('data-original-html');
        }
    }
}

// Show field error
function showFieldError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    
    if (field && error) {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
        error.textContent = message;
        error.classList.add('show');
    }
}

// Clear field error
function clearFieldError(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    
    if (field && error) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        error.textContent = '';
        error.classList.remove('show');
    }
}

// Clear all errors
function clearAllErrors() {
    const errorIds = ['firstNameError', 'lastNameError', 'emailError', 'phoneError', 'passwordError', 'confirmPasswordError', 'addressError', 'genderError', 'termsError'];
    const fieldIds = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword', 'address', 'gender', 'terms'];
    
    errorIds.forEach(id => {
        const error = document.getElementById(id);
        if (error) {
            error.textContent = '';
            error.classList.remove('show');
        }
    });
    
    fieldIds.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            field.classList.remove('is-invalid', 'is-valid');
        }
    });
}

// Launch celebration animation
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

// ===== PASSWORD STRENGTH & MATCH =====
function checkPasswordStrength(password) {
    let strength = 0;
    let strengthText = '';
    let strengthColor = '';
    
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    
    if (password.length === 0) {
        strengthText = '';
    } else if (strength <= 2) {
        strengthText = 'Weak';
        strengthColor = '#dc3545';
    } else if (strength <= 4) {
        strengthText = 'Medium';
        strengthColor = '#fd7e14';
    } else {
        strengthText = 'Strong';
        strengthColor = '#28a745';
    }
    
    return { text: strengthText, color: strengthColor };
}

function updatePasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthDiv = document.getElementById('passwordStrength');
    
    if (!strengthDiv) return;
    
    const result = checkPasswordStrength(password);
    
    if (result.text) {
        strengthDiv.textContent = `Password strength: ${result.text}`;
        strengthDiv.style.color = result.color;
        strengthDiv.style.display = 'block';
    } else {
        strengthDiv.style.display = 'none';
    }
}

function checkPasswordMatch() {
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;
    const matchDiv = document.getElementById('passwordMatch');
    
    if (!matchDiv) return;
    
    if (confirm.length > 0) {
        if (password === confirm) {
            matchDiv.textContent = '✓ Passwords match';
            matchDiv.style.color = '#28a745';
            matchDiv.style.display = 'block';
            clearFieldError('confirmPassword', 'confirmPasswordError');
        } else {
            matchDiv.textContent = '✗ Passwords do not match';
            matchDiv.style.color = '#dc3545';
            matchDiv.style.display = 'block';
        }
    } else {
        matchDiv.style.display = 'none';
    }
}

function setupPasswordToggles() {
    // Password toggle
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');
    
    if (passwordInput && passwordToggle) {
        passwordToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            const icon = this.querySelector('i');
            if (type === 'text') {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
    
    // Confirm password toggle
    const confirmInput = document.getElementById('confirmPassword');
    const confirmToggle = document.getElementById('confirmPasswordToggle');
    
    if (confirmInput && confirmToggle) {
        confirmToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const type = confirmInput.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmInput.setAttribute('type', type);
            const icon = this.querySelector('i');
            if (type === 'text') {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
}

// ===== OTP TIMER FUNCTIONS =====
function startOTPTimer() {
    stopOTPTimer();
    
    otpSecondsRemaining = 60;
    const timerElement = document.getElementById('otpTimer');
    const resendBtn = document.getElementById('resendOtpBtn');
    
    if (!timerElement || !resendBtn) return;
    
    resendBtn.disabled = true;
    timerElement.classList.remove('warning', 'expired');
    
    function updateTimerDisplay() {
        const minutes = Math.floor(otpSecondsRemaining / 60);
        const seconds = otpSecondsRemaining % 60;
        timerElement.textContent = `Resend in ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        if (otpSecondsRemaining <= 10 && otpSecondsRemaining > 0) {
            timerElement.classList.add('warning');
        }
        
        if (otpSecondsRemaining <= 0) {
            stopOTPTimer();
            timerElement.textContent = "Didn't receive code?";
            timerElement.classList.remove('warning');
            timerElement.classList.add('expired');
            resendBtn.disabled = false;
        }
        
        otpSecondsRemaining--;
    }
    
    updateTimerDisplay();
    otpTimerInterval = setInterval(updateTimerDisplay, 1000);
}

function stopOTPTimer() {
    if (otpTimerInterval) {
        clearInterval(otpTimerInterval);
        otpTimerInterval = null;
    }
}

// ===== API CALLS =====

// Register user
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
async function loginToGetOTP(email, password) {
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

// ===== REGISTRATION FLOW =====

async function processRegistration(formData) {
    const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.password,
        address: formData.address,
        gender: formData.gender
    };
    
    console.log('Registering user:', userData.email);
    
    const result = await registerUser(userData);
    
    if (result.success) {
        pendingRegistrationData = {
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            gender: formData.gender,
            phone: formData.phone || ''
        };
        
        const loginResult = await loginToGetOTP(formData.email, formData.password);
        
        if (loginResult.success) {
            const otpModalElement = document.getElementById('otpModal');
            if (otpModalElement) {
                const otpModal = new bootstrap.Modal(otpModalElement);
                document.getElementById('verificationEmail').textContent = formData.email;
                otpModal.show();
                startOTPTimer();
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
        } else {
            showNotification(result.error || 'Registration failed. Please try again.', 'danger');
        }
        return false;
    }
}

async function handleOTPVerification() {
    const otp = document.getElementById('otpCode').value.trim();
    const otpError = document.getElementById('otpCodeError');
    
    if (!otp || otp.length !== 6) {
        if (otpError) {
            otpError.textContent = 'Please enter a valid 6-digit verification code';
            otpError.classList.add('show');
            document.getElementById('otpCode').classList.add('is-invalid');
        }
        return;
    }
    
    if (!pendingRegistrationData || !pendingRegistrationData.email) {
        showNotification('Session expired. Please try registering again.', 'danger');
        const modal = bootstrap.Modal.getInstance(document.getElementById('otpModal'));
        if (modal) modal.hide();
        window.location.href = 'register.html';
        return;
    }
    
    const verifyBtn = document.getElementById('verifyOtpBtn');
    setButtonLoading(verifyBtn, true, 'Verifying...');
    
    const result = await verifyOTP(pendingRegistrationData.email, otp);
    
    setButtonLoading(verifyBtn, false);
    
    if (result.success && result.data.token) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('otpModal'));
        if (modal) modal.hide();
        
        launchCelebration();
        
        // Store user data
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify({
            id: result.data.user?.id || null,
            email: pendingRegistrationData.email,
            first_name: pendingRegistrationData.firstName,
            last_name: pendingRegistrationData.lastName,
            full_name: `${pendingRegistrationData.firstName} ${pendingRegistrationData.lastName}`,
            address: pendingRegistrationData.address,
            gender: pendingRegistrationData.gender,
            phone: pendingRegistrationData.phone,
            role: result.data.user?.role || 'user'
        }));
        
        // Check for pending booking
        const pendingBooking = getPendingBooking();
        showNotification('Registration successful! Welcome to CleanSpark!', 'success');
        
        setTimeout(() => {
            window.location.href = pendingBooking ? 'booking.html' : 'index.html';
        }, 1500);
        
        pendingRegistrationData = null;
        document.getElementById('otpCode').value = '';
    } else {
        if (otpError) {
            otpError.textContent = result.error || 'Invalid verification code. Please try again.';
            otpError.classList.add('show');
            document.getElementById('otpCode').classList.add('is-invalid');
        }
        showNotification(result.error || 'Invalid verification code. Please try again.', 'danger');
    }
}

async function handleResendOTP() {
    const resendBtn = document.getElementById('resendOtpBtn');
    
    if (!pendingRegistrationData || !pendingRegistrationData.email || !pendingRegistrationData.password) {
        showNotification('Session expired. Please try registering again.', 'danger');
        const modal = bootstrap.Modal.getInstance(document.getElementById('otpModal'));
        if (modal) modal.hide();
        return;
    }
    
    resendBtn.disabled = true;
    const originalHTML = resendBtn.innerHTML;
    resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    const result = await resendOTP(pendingRegistrationData.email, pendingRegistrationData.password);
    
    resendBtn.innerHTML = originalHTML;
    
    if (result.success) {
        showNotification('New verification code sent to your email!', 'success');
        startOTPTimer();
        const otpInput = document.getElementById('otpCode');
        if (otpInput) {
            otpInput.value = '';
            otpInput.classList.remove('is-invalid');
        }
        const otpError = document.getElementById('otpCodeError');
        if (otpError) {
            otpError.textContent = '';
            otpError.classList.remove('show');
        }
    } else {
        showNotification(result.error || 'Failed to resend code. Please try again.', 'danger');
        resendBtn.disabled = false;
    }
}

// ===== GOOGLE REGISTER HANDLER =====
function initializeGoogleRegister() {
    if (typeof google === 'undefined') {
        setTimeout(initializeGoogleRegister, 500);
        return;
    }
    
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleRegisterResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
    });
    
    google.accounts.id.renderButton(
        document.getElementById('googleRegisterButton'),
        { 
            theme: 'outline', 
            size: 'large', 
            width: '100%',
            text: 'signup_with',
            shape: 'rectangular',
            logo_alignment: 'left'
        }
    );
}

async function handleGoogleRegisterResponse(response) {
    const googleToken = response.credential;
    
    showLoading(true);
    
    try {
        const result = await API.auth.googleLogin(googleToken);
        
        showLoading(false);
        
        if (result.token && result.user) {
            API.setAuthToken(result.token, true);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            
            launchCelebration();
            showNotification(`Welcome ${result.user.first_name}! Registration successful.`, 'success');
            
            const pendingBooking = getPendingBooking();
            setTimeout(() => {
                window.location.href = pendingBooking ? 'booking.html' : 'index.html';
            }, 1500);
        } else {
            throw new Error(result.message || 'Google registration failed');
        }
    } catch (error) {
        showLoading(false);
        console.error('Google registration error:', error);
        showNotification(error.message || 'Google registration failed. Please try again.', 'danger');
    }
}

// ===== FORM VALIDATION =====
function validateForm() {
    let isValid = true;
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const address = document.getElementById('address').value.trim();
    const gender = document.getElementById('gender').value;
    const terms = document.getElementById('terms').checked;
    
    // First Name validation
    if (!firstName) {
        showFieldError('firstName', 'firstNameError', 'First name is required');
        isValid = false;
    } else if (firstName.length < 2) {
        showFieldError('firstName', 'firstNameError', 'First name must be at least 2 characters');
        isValid = false;
    } else {
        clearFieldError('firstName', 'firstNameError');
    }
    
    // Last Name validation
    if (!lastName) {
        showFieldError('lastName', 'lastNameError', 'Last name is required');
        isValid = false;
    } else if (lastName.length < 2) {
        showFieldError('lastName', 'lastNameError', 'Last name must be at least 2 characters');
        isValid = false;
    } else {
        clearFieldError('lastName', 'lastNameError');
    }
    
    // Email validation
    if (!email) {
        showFieldError('email', 'emailError', 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showFieldError('email', 'emailError', 'Please enter a valid email address');
        isValid = false;
    } else {
        clearFieldError('email', 'emailError');
    }
    
    // Phone validation (optional)
    if (phone && !validatePhone(phone)) {
        showFieldError('phone', 'phoneError', 'Please enter a valid phone number');
        isValid = false;
    } else {
        clearFieldError('phone', 'phoneError');
    }
    
    // Password validation
    if (!password) {
        showFieldError('password', 'passwordError', 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        showFieldError('password', 'passwordError', 'Password must be at least 6 characters');
        isValid = false;
    } else {
        clearFieldError('password', 'passwordError');
    }
    
    // Confirm Password validation
    if (!confirmPassword) {
        showFieldError('confirmPassword', 'confirmPasswordError', 'Please confirm your password');
        isValid = false;
    } else if (password !== confirmPassword) {
        showFieldError('confirmPassword', 'confirmPasswordError', 'Passwords do not match');
        isValid = false;
    } else {
        clearFieldError('confirmPassword', 'confirmPasswordError');
    }
    
    // Address validation
    if (!address) {
        showFieldError('address', 'addressError', 'Address is required');
        isValid = false;
    } else {
        clearFieldError('address', 'addressError');
    }
    
    // Gender validation
    if (!gender) {
        showFieldError('gender', 'genderError', 'Please select your gender');
        isValid = false;
    } else {
        clearFieldError('gender', 'genderError');
    }
    
    // Terms validation
    if (!terms) {
        showFieldError('terms', 'termsError', 'You must agree to the Terms and Conditions');
        isValid = false;
    } else {
        clearFieldError('terms', 'termsError');
    }
    
    return isValid;
}

// ===== DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Register page loaded');
    
    // Check if already logged in
    if (API.getAuthToken() && localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'index.html';
        return;
    }
    
    // Initialize Google Register
    initializeGoogleRegister();
    
    // Setup password toggles
    setupPasswordToggles();
    
    // Setup password strength and match listeners
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            updatePasswordStrength();
            checkPasswordMatch();
        });
    }
    
    if (confirmInput) {
        confirmInput.addEventListener('input', checkPasswordMatch);
    }
    
    // Setup OTP modal handlers
    const verifyBtn = document.getElementById('verifyOtpBtn');
    const resendBtn = document.getElementById('resendOtpBtn');
    const otpCodeInput = document.getElementById('otpCode');
    
    if (verifyBtn) verifyBtn.addEventListener('click', handleOTPVerification);
    if (resendBtn) resendBtn.addEventListener('click', handleResendOTP);
    if (otpCodeInput) {
        otpCodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleOTPVerification();
        });
        otpCodeInput.addEventListener('input', function() {
            this.classList.remove('is-invalid');
            const error = document.getElementById('otpCodeError');
            if (error) {
                error.textContent = '';
                error.classList.remove('show');
            }
        });
    }
    
    // Reset timer when modal is hidden
    const otpModal = document.getElementById('otpModal');
    if (otpModal) {
        otpModal.addEventListener('hidden.bs.modal', function() {
            stopOTPTimer();
            if (otpCodeInput) otpCodeInput.value = '';
            pendingRegistrationData = null;
        });
    }
    
    // Terms modal handlers
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
            clearFieldError('terms', 'termsError');
            showNotification('You have agreed to the Terms and Conditions', 'success');
        });
    }
    
    // Form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearAllErrors();
            
            if (!validateForm()) return;
            
            const submitBtn = document.getElementById('registerBtn');
            setButtonLoading(submitBtn, true, 'Creating account...');
            
            const formData = {
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                password: document.getElementById('password').value,
                address: document.getElementById('address').value.trim(),
                gender: document.getElementById('gender').value
            };
            
            const success = await processRegistration(formData);
            
            if (!success) {
                setButtonLoading(submitBtn, false);
            }
        });
    }
    
    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                if (validateEmail(emailInput.value)) {
                    showNotification('Thank you for subscribing to our newsletter!', 'success');
                    emailInput.value = '';
                } else {
                    showNotification('Please enter a valid email address', 'danger');
                }
            }
        });
    }
    
    // Check for pending booking
    const pendingBooking = localStorage.getItem('pendingBooking');
    if (pendingBooking) {
        showNotification('Complete registration to continue with your booking', 'info');
    }
    
    console.log('========================================');
    console.log('CleanSpark Register - Backend Integrated');
    console.log('========================================');
    console.log('Registration Flow:');
    console.log('1. POST /api/auth/register - creates user account');
    console.log('2. POST /api/auth/login - sends OTP to email');
    console.log('3. POST /api/auth/verify-otp - verifies OTP and returns token');
    console.log('');
    console.log('Google Register Flow:');
    console.log('1. POST /api/auth/google-login - verifies token and creates/finds user');
    console.log('========================================');
});

// Export functions for global use
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;