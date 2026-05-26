/**
 * CleanSpark Forgot Password Page - Backend Integrated
 * Fully integrated with the backend API endpoints:
 * - POST /api/auth/forgot-password - sends reset OTP
 * - POST /api/auth/verify-reset-otp - verifies OTP
 * - POST /api/auth/reset-password - resets password
 * - POST /api/auth/resend-reset-otp - resends OTP
 */

// ===== SIDEBAR FUNCTIONS =====
function openSidebar() {
    var sidebar = document.getElementById("sidebar");
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
    var sidebar = document.getElementById("sidebar");
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
        if (!sidebar.contains(event.target) && !hamburger.contains(event.target) && 
            sidebar.style.width !== '0px' && sidebar.style.width !== '0' && sidebar.style.width !== '') {
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
    type = type || 'info';
    
    const existingNotification = document.querySelector('.alert');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'alert alert-' + type + ' alert-dismissible fade show';
    notification.role = 'alert';
    notification.innerHTML = message +
        '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
    
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
    const errorElements = document.querySelectorAll('.invalid-feedback');
    const formControls = document.querySelectorAll('.form-control');
    
    errorElements.forEach(function(el) {
        el.textContent = '';
        el.classList.remove('show');
    });
    
    formControls.forEach(function(el) {
        el.classList.remove('is-invalid', 'is-valid');
    });
}

// Set button loading state
function setButtonLoading(button, isLoading, text) {
    if (!button) return;
    
    if (isLoading) {
        button.disabled = true;
        button.classList.add('btn-loading');
        if (!button.getAttribute('data-original-html')) {
            button.setAttribute('data-original-html', button.innerHTML);
        }
        button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>' + (text || 'Loading...');
    } else {
        button.disabled = false;
        button.classList.remove('btn-loading');
        const originalHtml = button.getAttribute('data-original-html');
        if (originalHtml) {
            button.innerHTML = originalHtml;
            button.removeAttribute('data-original-html');
        }
    }
}

// Check password strength
function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { level: 'weak', text: 'Weak', class: 'weak' };
    if (strength <= 3) return { level: 'medium', text: 'Medium', class: 'medium' };
    return { level: 'strong', text: 'Strong', class: 'strong' };
}

// Update password strength indicator
function updatePasswordStrength(password) {
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    const strengthContainer = document.getElementById('passwordStrength');
    
    if (!strengthBar || !strengthText || !strengthContainer) return;
    
    if (!password) {
        strengthContainer.classList.remove('show');
        return;
    }
    
    strengthContainer.classList.add('show');
    const result = checkPasswordStrength(password);
    
    strengthBar.classList.remove('weak', 'medium', 'strong');
    strengthText.classList.remove('weak', 'medium', 'strong');
    
    strengthBar.classList.add(result.class);
    strengthText.classList.add(result.class);
    strengthText.textContent = result.text;
}

// Launch celebration
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

// ===== OTP TIMER =====
let resetOtpTimerInterval = null;
let resetOtpSecondsRemaining = 60; // 60 seconds cooldown
const RESET_OTP_COOLDOWN = 60;

function startResetOTPTimer() {
    stopResetOTPTimer();
    
    resetOtpSecondsRemaining = RESET_OTP_COOLDOWN;
    const timerElement = document.getElementById('resetOtpTimer');
    const resendBtn = document.getElementById('resetOtpResendBtn');
    
    if (!timerElement || !resendBtn) return;
    
    resendBtn.disabled = true;
    resendBtn.classList.remove('resending');
    timerElement.classList.remove('warning', 'expired');
    
    function updateTimerDisplay() {
        const minutes = Math.floor(resetOtpSecondsRemaining / 60);
        const seconds = resetOtpSecondsRemaining % 60;
        timerElement.textContent = 'Resend in ' + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        
        if (resetOtpSecondsRemaining <= 10 && resetOtpSecondsRemaining > 0) {
            timerElement.classList.add('warning');
        }
        
        if (resetOtpSecondsRemaining <= 0) {
            stopResetOTPTimer();
            timerElement.textContent = "Didn't receive code?";
            timerElement.classList.remove('warning');
            timerElement.classList.add('expired');
            resendBtn.disabled = false;
        }
        
        resetOtpSecondsRemaining--;
    }
    
    updateTimerDisplay();
    resetOtpTimerInterval = setInterval(updateTimerDisplay, 1000);
}

function stopResetOTPTimer() {
    if (resetOtpTimerInterval) {
        clearInterval(resetOtpTimerInterval);
        resetOtpTimerInterval = null;
    }
}

// ===== VARIABLES =====
let currentResetEmail = '';
let currentResetToken = '';

// ===== SWITCH STEP =====
function switchStep(fromStep, toStep) {
    const fromElement = document.getElementById(fromStep);
    const toElement = document.getElementById(toStep);
    
    if (!fromElement || !toElement) return;
    
    fromElement.style.display = 'none';
    toElement.style.display = 'block';
    
    // Scroll to top of form
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
        formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ===== SHOW SUCCESS MODAL =====
function showSuccessModal() {
    const modalElement = document.getElementById('successModal');
    if (!modalElement) return;
    
    const modal = new bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false
    });
    
    modal.show();
    
    launchCelebration();
}

// ===== SETUP PASSWORD TOGGLES =====
function setupPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.reset-password-toggle');
    
    toggleButtons.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            
            if (passwordInput) {
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
            }
        });
        
        btn.addEventListener('mousedown', function(e) {
            e.preventDefault();
        });
    });
}

// ===== DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== STEP 1: EMAIL FORM (Forgot Password) =====
    const emailForm = document.getElementById('emailForm');
    const resetEmailInput = document.getElementById('resetEmail');
    
    if (emailForm && resetEmailInput) {
        // Real-time validation clearing
        resetEmailInput.addEventListener('input', function() {
            if (this.value.trim()) {
                clearFieldError('resetEmail', 'emailError');
            }
        });
        
        emailForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearAllErrors();
            
            const email = resetEmailInput.value.trim();
            let hasError = false;
            
            // Validate email
            if (!email) {
                showFieldError('resetEmail', 'emailError', 'Please enter your email address');
                hasError = true;
            } else if (!validateEmail(email)) {
                showFieldError('resetEmail', 'emailError', 'Please enter a valid email address');
                hasError = true;
            }
            
            if (hasError) return;
            
            // Send reset OTP to backend
            const sendCodeBtn = document.getElementById('sendCodeBtn');
            setButtonLoading(sendCodeBtn, true, 'Sending code...');
            
            try {
                // Call backend forgot-password endpoint
                const response = await API.auth.forgotPassword(email);
                
                setButtonLoading(sendCodeBtn, false);
                
                if (response.success !== false) {
                    // Store email for later use
                    currentResetEmail = email;
                    
                    // Update display email
                    const verifyEmailDisplay = document.getElementById('verifyEmailDisplay');
                    if (verifyEmailDisplay) {
                        verifyEmailDisplay.textContent = email;
                    }
                    
                    // Switch to verify step
                    switchStep('stepEmail', 'stepVerify');
                    
                    // Focus on OTP input
                    setTimeout(function() {
                        const otpInput = document.getElementById('resetOTP');
                        if (otpInput) otpInput.focus();
                    }, 500);
                    
                    // Start OTP timer
                    startResetOTPTimer();
                    
                    showNotification(response.message || 'Reset code sent to your email', 'success');
                } else {
                    showNotification(response.message || 'Failed to send reset code', 'danger');
                }
            } catch (error) {
                console.error('Send reset code error:', error);
                setButtonLoading(sendCodeBtn, false);
                showNotification(error.message || 'Failed to send reset code. Please try again.', 'danger');
            }
        });
    }
    
    // ===== STEP 2: VERIFY OTP FORM =====
    const verifyForm = document.getElementById('verifyForm');
    const resetOTPInput = document.getElementById('resetOTP');
    
    if (verifyForm && resetOTPInput) {
        // Real-time validation clearing
        resetOTPInput.addEventListener('input', function() {
            if (this.value.trim()) {
                clearFieldError('resetOTP', 'otpError');
            }
        });
        
        verifyForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearAllErrors();
            
            const otp = resetOTPInput.value.trim();
            
            if (!otp) {
                showFieldError('resetOTP', 'otpError', 'Please enter the verification code');
                return;
            }
            
            if (otp.length !== 6) {
                showFieldError('resetOTP', 'otpError', 'Verification code must be exactly 6 digits');
                return;
            }
            
            if (!/^\d{6}$/.test(otp)) {
                showFieldError('resetOTP', 'otpError', 'Verification code must contain only numbers');
                return;
            }
            
            const verifyCodeBtn = document.getElementById('verifyCodeBtn');
            setButtonLoading(verifyCodeBtn, true, 'Verifying...');
            
            try {
                // Call backend verify-reset-otp endpoint
                const response = await API.auth.verifyResetOTP(currentResetEmail, otp);
                
                setButtonLoading(verifyCodeBtn, false);
                
                if (response.success && response.resetToken) {
                    // Store reset token for password reset
                    currentResetToken = response.resetToken;
                    
                    // Stop OTP timer
                    stopResetOTPTimer();
                    
                    // Switch to reset step
                    switchStep('stepVerify', 'stepReset');
                    
                    showNotification('Identity verified. Create your new password.', 'success');
                } else {
                    showFieldError('resetOTP', 'otpError', response.message || 'Invalid or expired code');
                    showNotification(response.message || 'Invalid verification code. Please try again.', 'danger');
                }
            } catch (error) {
                console.error('Verify OTP error:', error);
                setButtonLoading(verifyCodeBtn, false);
                
                const errorMessage = error.message || 'Verification failed';
                
                if (errorMessage.toLowerCase().includes('expired')) {
                    showFieldError('resetOTP', 'otpError', 'Code has expired. Please request a new one');
                    showNotification('Verification code expired. Please request a new code.', 'warning');
                } else {
                    showFieldError('resetOTP', 'otpError', errorMessage);
                    showNotification(errorMessage, 'danger');
                }
            }
        });
    }
    
    // ===== RESEND OTP BUTTON =====
    const resendBtn = document.getElementById('resetOtpResendBtn');
    if (resendBtn) {
        resendBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            if (!currentResetEmail) {
                showNotification('Please go back and enter your email again.', 'warning');
                return;
            }
            
            // Show loading state
            this.classList.add('resending');
            this.disabled = true;
            const originalHTML = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resending...';
            
            try {
                // Call backend resend-reset-otp endpoint
                const response = await API.auth.resendResetOTP(currentResetEmail);
                
                if (response.success !== false) {
                    // Clear OTP input
                    const otpInput = document.getElementById('resetOTP');
                    if (otpInput) {
                        otpInput.value = '';
                        otpInput.focus();
                    }
                    
                    clearFieldError('resetOTP', 'otpError');
                    
                    // Reset timer
                    stopResetOTPTimer();
                    startResetOTPTimer();
                    
                    showNotification(response.message || 'New code sent to your email', 'success');
                } else {
                    throw new Error(response.message || 'Failed to resend code');
                }
            } catch (error) {
                console.error('Resend error:', error);
                showNotification(error.message || 'Failed to resend code. Please try again.', 'danger');
                this.disabled = false;
            } finally {
                this.classList.remove('resending');
                this.innerHTML = originalHTML;
            }
        });
    }
    
    // ===== BACK TO EMAIL STEP =====
    const backToEmailBtn = document.getElementById('backToEmailStep');
    if (backToEmailBtn) {
        backToEmailBtn.addEventListener('click', function(e) {
            e.preventDefault();
            stopResetOTPTimer();
            currentResetToken = '';
            switchStep('stepVerify', 'stepEmail');
        });
    }
    
    // ===== STEP 3: RESET PASSWORD FORM =====
    const resetForm = document.getElementById('resetForm');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmNewPasswordInput = document.getElementById('confirmNewPassword');
    
    if (resetForm && newPasswordInput && confirmNewPasswordInput) {
        // Real-time password strength
        newPasswordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value);
            if (this.value.trim()) {
                clearFieldError('newPassword', 'newPasswordError');
            }
        });
        
        confirmNewPasswordInput.addEventListener('input', function() {
            if (this.value.trim()) {
                clearFieldError('confirmNewPassword', 'confirmNewPasswordError');
            }
        });
        
        resetForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearAllErrors();
            
            const newPassword = newPasswordInput.value.trim();
            const confirmPassword = confirmNewPasswordInput.value.trim();
            let hasError = false;
            
            // Validate new password
            if (!newPassword) {
                showFieldError('newPassword', 'newPasswordError', 'Please enter a new password');
                hasError = true;
            } else if (newPassword.length < 6) {
                showFieldError('newPassword', 'newPasswordError', 'Password must be at least 6 characters');
                hasError = true;
            } else if (newPassword.length > 50) {
                showFieldError('newPassword', 'newPasswordError', 'Password must be less than 50 characters');
                hasError = true;
            }
            
            // Validate confirm password
            if (!confirmPassword) {
                showFieldError('confirmNewPassword', 'confirmNewPasswordError', 'Please confirm your new password');
                hasError = true;
            } else if (confirmPassword !== newPassword) {
                showFieldError('confirmNewPassword', 'confirmNewPasswordError', 'Passwords do not match');
                hasError = true;
            }
            
            if (hasError) return;
            
            // Check if we have a reset token
            if (!currentResetToken) {
                showNotification('Session expired. Please start over.', 'danger');
                setTimeout(function() {
                    window.location.href = 'forgetpassword.html';
                }, 2000);
                return;
            }
            
            // Reset password via backend
            const resetPasswordBtn = document.getElementById('resetPasswordBtn');
            setButtonLoading(resetPasswordBtn, true, 'Resetting password...');
            
            try {
                // Call backend reset-password endpoint
                const response = await API.auth.resetPassword(currentResetToken, newPassword, confirmPassword);
                
                setButtonLoading(resetPasswordBtn, false);
                
                if (response.success) {
                    // Clear all reset data
                    currentResetEmail = '';
                    currentResetToken = '';
                    stopResetOTPTimer();
                    
                    // Show success modal
                    showSuccessModal();
                    
                    console.log('Password reset successful');
                } else {
                    showNotification(response.message || 'Failed to reset password. Please try again.', 'danger');
                }
            } catch (error) {
                console.error('Reset password error:', error);
                setButtonLoading(resetPasswordBtn, false);
                showNotification(error.message || 'Failed to reset password. Please try again.', 'danger');
            }
        });
    }
    
    // ===== SETUP PASSWORD TOGGLES =====
    setupPasswordToggles();
    
    // ===== NEWSLETTER FORM =====
    const newsletterForm = document.querySelector('.newsletter-form');
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
    
    // ===== RESIZE HANDLER FOR SIDEBAR =====
    window.addEventListener('resize', function() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.style.width === '280px' && window.innerWidth <= 300) {
            sidebar.style.width = '100%';
        }
    });
    
    // ===== LOG BACKEND INFO =====
    console.log('========================================');
    console.log('CleanSpark - Forgot Password Page');
    console.log('Backend API Integration:');
    console.log('----------------------------------------');
    console.log('POST /api/auth/forgot-password');
    console.log('POST /api/auth/verify-reset-otp');
    console.log('POST /api/auth/reset-password');
    console.log('POST /api/auth/resend-reset-otp');
    console.log('========================================');
});