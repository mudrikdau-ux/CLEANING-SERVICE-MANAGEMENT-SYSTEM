/**
 * CleanSpark Login Page - Fully Integrated with Backend API
 * Handles user login with OTP verification and Google Sign-In
 */

// ===== GOOGLE CLIENT CONFIGURATION =====
const GOOGLE_CLIENT_ID = '91975372653-8u9lcjinnjj7r0qvga02adot9jpn0ehg.apps.googleusercontent.com';

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
        spinner.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999;';
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
    const errorIds = ['emailError', 'passwordError', 'otpError'];
    const fieldIds = ['emailLogin', 'passwordLogin', 'otpInput'];
    
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

// ===== OTP TIMER FUNCTIONS =====
let otpTimerInterval = null;
let otpSecondsRemaining = 30;

function startOTPTimer() {
    stopOTPTimer();
    
    otpSecondsRemaining = 30;
    const timerElement = document.getElementById('otpTimer');
    const resendBtn = document.getElementById('otpResendBtn');
    
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
            timerElement.textContent = "Didn't receive OTP?";
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

function resetOTPTimer() {
    stopOTPTimer();
    startOTPTimer();
}

// ===== PASSWORD TOGGLE =====
function setupPasswordToggle() {
    const passwordInput = document.getElementById('passwordLogin');
    const toggleBtn = document.getElementById('passwordToggle');
    
    if (passwordInput && toggleBtn) {
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            const icon = this.querySelector('i');
            if (type === 'text') {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
                this.setAttribute('aria-label', 'Hide password');
            } else {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
                this.setAttribute('aria-label', 'Show password');
            }
        });
    }
}

// ===== GOOGLE LOGIN =====
function initializeGoogleLogin() {
    if (typeof google === 'undefined') {
        setTimeout(initializeGoogleLogin, 500);
        return;
    }
    
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleLoginResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
    });
    
    google.accounts.id.renderButton(
        document.getElementById('googleButton'),
        { 
            theme: 'outline', 
            size: 'large', 
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left'
        }
    );
}

async function handleGoogleLoginResponse(response) {
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
            showNotification(`Welcome ${result.user.first_name}! Login successful.`, 'success');
            
            const pendingBooking = getPendingBooking();
            setTimeout(() => {
                window.location.href = pendingBooking ? 'booking.html' : 'index.html';
            }, 1500);
        } else {
            throw new Error(result.message || 'Google login failed');
        }
    } catch (error) {
        showLoading(false);
        console.error('Google login error:', error);
        showNotification(error.message || 'Google login failed. Please try again.', 'danger');
    }
}

// ===== RESEND OTP =====
let currentResendEmail = '';

async function resendOTP(email) {
    const resendBtn = document.getElementById('otpResendBtn');
    
    if (!resendBtn || resendBtn.disabled) return;
    
    resendBtn.disabled = true;
    const originalHTML = resendBtn.innerHTML;
    resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resending...';
    
    try {
        const result = await API.auth.resendResetOTP(email);
        
        if (result.success || result.message) {
            const otpInput = document.getElementById('otpInput');
            if (otpInput) {
                otpInput.value = '';
                otpInput.classList.remove('is-invalid');
                otpInput.focus();
            }
            clearFieldError('otpInput', 'otpError');
            resetOTPTimer();
            showNotification(result.message || 'New OTP sent to your email', 'success');
        } else {
            throw new Error('Failed to resend OTP');
        }
    } catch (error) {
        console.error('Resend OTP Error:', error);
        showNotification(error.message || 'Failed to resend OTP. Please try again.', 'danger');
        resendBtn.disabled = false;
    } finally {
        resendBtn.innerHTML = originalHTML;
    }
}

// ===== MAIN LOGIN FLOW =====
let loginStep = 'credentials';
let currentEmail = '';

async function handleCredentialsSubmit(email, password) {
    const loginBtn = document.getElementById('loginBtn');
    
    if (!email) {
        showFieldError('emailLogin', 'emailError', 'Please enter your email address');
        return false;
    }
    if (!validateEmail(email)) {
        showFieldError('emailLogin', 'emailError', 'Please enter a valid email address');
        return false;
    }
    if (!password) {
        showFieldError('passwordLogin', 'passwordError', 'Please enter your password');
        return false;
    }
    if (password.length < 6) {
        showFieldError('passwordLogin', 'passwordError', 'Password must be at least 6 characters');
        return false;
    }
    
    setButtonLoading(loginBtn, true, 'Verifying credentials...');
    
    try {
        const response = await API.auth.login(email, password);
        
        setButtonLoading(loginBtn, false);
        
        if (response.message) {
            currentEmail = response.email || email;
            localStorage.setItem('otpEmail', currentEmail);
            
            // Show OTP section with animation
            const otpSection = document.getElementById('otpSection');
            if (otpSection) {
                otpSection.style.display = 'block';
                setTimeout(() => {
                    otpSection.classList.add('show-section');
                }, 10);
            }
            
            // Update button text
            const loginBtnText = document.getElementById('loginBtnText');
            if (loginBtnText) loginBtnText.textContent = 'Verify OTP';
            const btnIcon = loginBtn.querySelector('i');
            if (btnIcon) btnIcon.className = 'fas fa-check';
            
            loginStep = 'otp';
            
            setTimeout(() => {
                const otpInput = document.getElementById('otpInput');
                if (otpInput) otpInput.focus();
            }, 500);
            
            const otpInfoText = document.getElementById('otpInfoText');
            if (otpInfoText) otpInfoText.textContent = `A 6-digit OTP has been sent to ${currentEmail}`;
            
            startOTPTimer();
            showNotification(response.message, 'success');
            return true;
        }
    } catch (error) {
        setButtonLoading(loginBtn, false);
        console.error('Login error:', error);
        
        const errorMessage = error.message || 'Login failed. Please try again.';
        
        if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('account')) {
            showFieldError('emailLogin', 'emailError', errorMessage);
        } else if (errorMessage.toLowerCase().includes('password')) {
            showFieldError('passwordLogin', 'passwordError', errorMessage);
        } else {
            showNotification(errorMessage, 'danger');
        }
        
        return false;
    }
}

async function handleOTPSubmit(otp) {
    const loginBtn = document.getElementById('loginBtn');
    
    if (!otp) {
        showFieldError('otpInput', 'otpError', 'Please enter the 6-digit OTP');
        return false;
    }
    if (otp.length !== 6) {
        showFieldError('otpInput', 'otpError', 'OTP must be exactly 6 digits');
        return false;
    }
    if (!/^\d{6}$/.test(otp)) {
        showFieldError('otpInput', 'otpError', 'OTP must contain only numbers');
        return false;
    }
    
    setButtonLoading(loginBtn, true, 'Verifying OTP...');
    
    try {
        const response = await API.auth.verifyOTP(currentEmail, otp);
        
        setButtonLoading(loginBtn, false);
        
        if (response.token && response.user) {
            handleLoginSuccess(response);
            return true;
        } else {
            showFieldError('otpInput', 'otpError', 'Invalid OTP. Please try again.');
            showNotification('Invalid OTP. Please try again.', 'danger');
            return false;
        }
    } catch (error) {
        setButtonLoading(loginBtn, false);
        console.error('OTP verification error:', error);
        
        const errorMessage = error.message || 'OTP verification failed';
        
        if (errorMessage.toLowerCase().includes('expired')) {
            showFieldError('otpInput', 'otpError', 'OTP has expired. Please request a new one');
            showNotification('OTP expired. Please request a new OTP.', 'warning');
        } else {
            showFieldError('otpInput', 'otpError', errorMessage);
            showNotification(errorMessage, 'danger');
        }
        
        return false;
    }
}

function handleLoginSuccess(response) {
    const { token, user } = response;
    
    if (token) {
        API.setAuthToken(token, true);
    }
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    localStorage.removeItem('otpEmail');
    stopOTPTimer();
    
    launchCelebration();
    
    const pendingBooking = getPendingBooking();
    if (pendingBooking) {
        showNotification('Login successful! Redirecting to booking...', 'success');
        setTimeout(() => {
            window.location.href = 'booking.html';
        }, 1500);
    } else {
        showNotification('Login successful!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

// ===== DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Google Login
    initializeGoogleLogin();
    
    // Setup password toggle
    setupPasswordToggle();
    
    // Setup resend OTP button
    const resendBtn = document.getElementById('otpResendBtn');
    if (resendBtn) {
        resendBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const email = localStorage.getItem('otpEmail') || currentEmail;
            if (email) {
                resendOTP(email);
            }
        });
    }
    
    // Check for pending booking
    const pendingBooking = localStorage.getItem('pendingBooking');
    if (pendingBooking) {
        showNotification('Please login to complete your booking', 'info');
    }
    
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const emailInput = document.getElementById('emailLogin');
        const passwordInput = document.getElementById('passwordLogin');
        const otpInput = document.getElementById('otpInput');
        
        // Real-time validation clearing
        if (emailInput) {
            emailInput.addEventListener('input', function() {
                if (this.value.trim()) clearFieldError('emailLogin', 'emailError');
            });
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                if (this.value.trim()) clearFieldError('passwordLogin', 'passwordError');
            });
        }
        
        if (otpInput) {
            otpInput.addEventListener('input', function() {
                if (this.value.trim()) clearFieldError('otpInput', 'otpError');
            });
        }
        
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearAllErrors();
            
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value.trim() : '';
            const otp = otpInput ? otpInput.value.trim() : '';
            
            if (loginStep === 'credentials') {
                await handleCredentialsSubmit(email, password);
            } else if (loginStep === 'otp') {
                await handleOTPSubmit(otp);
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
    
    // Clean up OTP timer on page unload
    window.addEventListener('beforeunload', function() {
        stopOTPTimer();
    });
    
    console.log('========================================');
    console.log('CleanSpark Login - Backend Integrated');
    console.log('========================================');
    console.log('Login Flow:');
    console.log('1. POST /api/auth/login - sends OTP to email');
    console.log('2. POST /api/auth/verify-otp - verifies OTP and returns token');
    console.log('');
    console.log('Google Login Flow:');
    console.log('1. POST /api/auth/google-login - verifies token and returns JWT');
    console.log('========================================');
});

// Export functions for global use
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;