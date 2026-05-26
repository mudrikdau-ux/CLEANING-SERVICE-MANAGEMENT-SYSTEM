// ===== FORGOT PASSWORD FUNCTIONALITY =====

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
    if (!type) {
        type = 'info';
    }
    
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
        button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>' +
            '<span class="btn-text">' + (text || 'Loading...') + '</span>';
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
    
    // Reset classes
    strengthBar.classList.remove('weak', 'medium', 'strong');
    strengthText.classList.remove('weak', 'medium', 'strong');
    
    // Add appropriate classes
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
let resetOtpSecondsRemaining = 30;
const RESET_OTP_COOLDOWN = 30;

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

// ===== SIMULATE SENDING RESET OTP =====
function simulateSendResetOTP(email) {
    return new Promise(function(resolve, reject) {
        console.log('Sending password reset OTP to:', email);
        
        setTimeout(function() {
            try {
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                
                // Store reset-specific OTP
                localStorage.setItem('resetOTP', otp);
                localStorage.setItem('resetOtpEmail', email);
                localStorage.setItem('resetOtpExpiry', Date.now() + (5 * 60 * 1000));
                
                console.log('Reset OTP generated:', otp);
                
                startResetOTPTimer();
                
                resolve({ 
                    success: true, 
                    message: 'Reset code sent successfully',
                    otp: otp
                });
            } catch (error) {
                console.error('Error generating reset OTP:', error);
                reject(new Error('Failed to send reset code'));
            }
        }, 1500);
    });
}

// ===== SIMULATE VERIFYING RESET OTP =====
function simulateVerifyResetOTP(enteredOTP) {
    return new Promise(function(resolve) {
        console.log('Verifying reset OTP:', enteredOTP);
        
        setTimeout(function() {
            const storedOTP = localStorage.getItem('resetOTP');
            const otpExpiry = localStorage.getItem('resetOtpExpiry');
            
            if (otpExpiry && Date.now() > parseInt(otpExpiry)) {
                resolve({ success: false, error: 'otp_expired' });
                return;
            }
            
            if (enteredOTP === storedOTP) {
                // Don't clear OTP yet - we still need to reset password
                console.log('Reset OTP verified successfully');
                resolve({ success: true });
            } else {
                resolve({ success: false, error: 'invalid_otp' });
            }
        }, 800);
    });
}

// ===== UPDATE USER PASSWORD =====
function updateUserPassword(email, newPassword) {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    const userIndex = users.findIndex(function(u) {
        return u.email.toLowerCase() === email.toLowerCase();
    });
    
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        console.log('Password updated for:', email);
        return true;
    }
    
    return false;
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
    
    // ===== STEP 1: EMAIL FORM =====
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
            
            // Check if email exists in registered users
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const userExists = users.find(function(u) {
                return u.email.toLowerCase() === email.toLowerCase();
            });
            
            if (!userExists) {
                showFieldError('resetEmail', 'emailError', 'No account found with this email address');
                showNotification('No account found. Please check your email or register.', 'danger');
                return;
            }
            
            // Send OTP
            const sendCodeBtn = document.getElementById('sendCodeBtn');
            setButtonLoading(sendCodeBtn, true, 'Sending code...');
            
            try {
                const result = await simulateSendResetOTP(email);
                
                if (result.success) {
                    setButtonLoading(sendCodeBtn, false);
                    
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
                    
                    showNotification('Reset code sent to ' + email + ' (Test code: ' + result.otp + ')', 'success');
                    console.log('========================================');
                    console.log('PASSWORD RESET CODE: ' + result.otp);
                    console.log('========================================');
                } else {
                    throw new Error('Failed to send code');
                }
            } catch (error) {
                console.error('Send code error:', error);
                setButtonLoading(sendCodeBtn, false);
                showNotification('Failed to send reset code. Please try again.', 'danger');
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
            
            const result = await simulateVerifyResetOTP(otp);
            
            if (!result.success) {
                setButtonLoading(verifyCodeBtn, false);
                
                if (result.error === 'otp_expired') {
                    showFieldError('resetOTP', 'otpError', 'Code has expired. Please request a new one');
                    showNotification('Verification code expired. Please request a new code.', 'warning');
                } else {
                    showFieldError('resetOTP', 'otpError', 'Invalid code. Please check and try again');
                    showNotification('Invalid verification code. Please try again.', 'danger');
                }
                return;
            }
            
            // OTP verified
            setButtonLoading(verifyCodeBtn, false);
            stopResetOTPTimer();
            
            // Switch to reset step
            switchStep('stepVerify', 'stepReset');
            
            showNotification('Identity verified. Create your new password.', 'success');
        });
    }
    
    // ===== RESEND OTP BUTTON =====
    const resendBtn = document.getElementById('resetOtpResendBtn');
    if (resendBtn) {
        resendBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const email = localStorage.getItem('resetOtpEmail');
            if (!email) {
                showNotification('Please go back and enter your email again.', 'warning');
                return;
            }
            
            // Show loading
            this.classList.add('resending');
            this.disabled = true;
            const originalHTML = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resending...';
            
            try {
                const result = await simulateSendResetOTP(email);
                
                if (result.success) {
                    // Clear OTP input
                    const otpInput = document.getElementById('resetOTP');
                    if (otpInput) {
                        otpInput.value = '';
                        otpInput.focus();
                    }
                    
                    clearFieldError('resetOTP', 'otpError');
                    showNotification('New code sent to ' + email + ' (Test code: ' + result.otp + ')', 'success');
                    console.log('========================================');
                    console.log('NEW PASSWORD RESET CODE: ' + result.otp);
                    console.log('========================================');
                } else {
                    throw new Error('Failed to resend code');
                }
            } catch (error) {
                console.error('Resend error:', error);
                showNotification('Failed to resend code. Please try again.', 'danger');
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
            
            // Update password
            const resetPasswordBtn = document.getElementById('resetPasswordBtn');
            setButtonLoading(resetPasswordBtn, true, 'Resetting password...');
            
            // Small delay for UX
            await new Promise(function(resolve) { setTimeout(resolve, 1000); });
            
            const email = localStorage.getItem('resetOtpEmail');
            
            if (!email) {
                setButtonLoading(resetPasswordBtn, false);
                showNotification('Session expired. Please start over.', 'danger');
                setTimeout(function() {
                    window.location.href = 'forgetpassword.html';
                }, 2000);
                return;
            }
            
            const success = updateUserPassword(email, newPassword);
            
            if (success) {
                // Clear all reset data
                localStorage.removeItem('resetOTP');
                localStorage.removeItem('resetOtpEmail');
                localStorage.removeItem('resetOtpExpiry');
                stopResetOTPTimer();
                
                setButtonLoading(resetPasswordBtn, false);
                
                // Show success modal
                showSuccessModal();
                
                console.log('========================================');
                console.log('Password reset successful for:', email);
                console.log('New password:', newPassword);
                console.log('========================================');
            } else {
                setButtonLoading(resetPasswordBtn, false);
                showNotification('Failed to reset password. Please try again.', 'danger');
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
    
    // ===== LOG TEST ACCOUNTS =====
    console.log('========================================');
    console.log('CleanSpark - Forgot Password Page');
    console.log('Test accounts available for password reset:');
    console.log('----------------------------------------');
    console.log('demo@cleanspark.com');
    console.log('test@test.com');
    console.log('admin@cleanspark.com');
    console.log('========================================');
});