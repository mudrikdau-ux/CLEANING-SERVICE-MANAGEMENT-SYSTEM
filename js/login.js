//login.js

// ===== COMBINED LOGIN & AUTHENTICATION SCRIPT =====
// Includes all functionality from main.js and script.js

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
    return localStorage.getItem('isLoggedIn') === 'true';
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

// Handle login success
function handleLoginSuccess(email, userData = {}) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify({ 
        email: email,
        ...userData
    }));
    
    // Clear any remaining OTP data
    localStorage.removeItem('currentOTP');
    localStorage.removeItem('otpEmail');
    localStorage.removeItem('otpExpiry');
    
    // Launch celebration animation
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

// Handle logout
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Update UI based on login status
function updateUIBasedOnLogin() {
    const loginBtn = document.getElementById('headerLoginBtn');
    if (loginBtn) {
        if (isLoggedIn()) {
            const user = getCurrentUser();
            loginBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
            loginBtn.href = '#';
            loginBtn.onclick = function(e) {
                e.preventDefault();
                logout();
            };
        } else {
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            loginBtn.href = 'login.html';
            loginBtn.onclick = null;
        }
    }
}

// ===== BOOKING FLOW FUNCTIONS =====

// Handle book button click
function handleBookClick(serviceId, serviceName, servicePrice) {
    const serviceData = {
        id: serviceId,
        name: serviceName,
        price: servicePrice
    };
    
    if (isLoggedIn()) {
        showNotification('Redirecting to booking...', 'info');
        setTimeout(() => {
            window.location.href = 'booking.html';
        }, 500);
    } else {
        savePendingBooking(serviceData);
        showNotification('Please login to continue with booking', 'info');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// ===== SERVICE MODAL FUNCTION =====
let modalInitialized = false;

function showServiceModal(service) {
    if (modalInitialized) {
        return;
    }
    modalInitialized = true;
    
    const existingModal = document.getElementById('serviceModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const existingBackdrop = document.querySelector('.modal-backdrop');
    if (existingBackdrop) {
        existingBackdrop.remove();
    }
    
    const serviceDetails = {
        'home': {
            title: 'Home Cleaning',
            price: 'TZS 50,000',
            description: 'Complete home cleaning service for your residence. Our professional cleaners will ensure every corner of your home is spotless.',
            features: [
                'Kitchen deep cleaning',
                'Bathroom sanitization',
                'Living area dusting',
                'Bedroom cleaning',
                'Floor mopping and vacuuming',
                'Eco-friendly products used'
            ],
            duration: '2-3 hours',
            image: 'images/service1.jpg'
        },
        'office': {
            title: 'Office Cleaning',
            price: 'TZS 75,000',
            description: 'Professional office cleaning to maintain a hygienic and productive work environment.',
            features: [
                'Workstation cleaning',
                'Conference room sanitization',
                'Kitchen/break room cleaning',
                'Waste removal',
                'Floor maintenance',
                'After-hours service available'
            ],
            duration: '3-4 hours',
            image: 'images/service2.jpg'
        },
        'carpet': {
            title: 'Carpet Cleaning',
            price: 'TZS 60,000',
            description: 'Deep carpet cleaning with eco-friendly solutions. Remove tough stains and allergens.',
            features: [
                'Deep steam cleaning',
                'Stain removal treatment',
                'Deodorizing',
                'Quick-dry technology',
                'Pet stain specialist',
                'Eco-friendly solutions'
            ],
            duration: '1-2 hours per room',
            image: 'images/service3.jpg'
        },
        'window': {
            title: 'Window Cleaning',
            price: 'TZS 40,000',
            description: 'Professional window cleaning for streak-free shine.',
            features: [
                'Interior window cleaning',
                'Exterior window cleaning',
                'Frame and sill wiping',
                'Streak-free guarantee',
                'Safety equipment used',
                'Screens cleaned'
            ],
            duration: '1-2 hours',
            image: 'images/service4.jpg'
        },
        'vehicle': {
            title: 'Vehicle Cleaning',
            price: 'TZS 45,000',
            description: 'Complete interior and exterior vehicle cleaning.',
            features: [
                'Exterior wash and wax',
                'Interior vacuuming',
                'Dashboard cleaning',
                'Window cleaning',
                'Tire shine',
                'Air freshener included'
            ],
            duration: '1-2 hours',
            image: 'images/service5.jpg'
        },
        'pool': {
            title: 'Pool Cleaning',
            price: 'TZS 80,000',
            description: 'Professional pool cleaning and maintenance.',
            features: [
                'Surface skimming',
                'Wall and floor brushing',
                'Filter cleaning',
                'Chemical balancing',
                'Water testing',
                'Equipment check'
            ],
            duration: '2-3 hours',
            image: 'images/service6.jpg'
        },
        'mattress': {
            title: 'Mattress Cleaning',
            price: 'TZS 55,000',
            description: 'Deep mattress cleaning to remove dust mites and allergens.',
            features: [
                'Deep vacuuming',
                'Stain treatment',
                'UV sanitization',
                'Deodorizing',
                'Allergen removal',
                'Quick drying'
            ],
            duration: '1 hour per mattress',
            image: 'images/service7.jpg'
        },
        'upholstery': {
            title: 'Upholstery Cleaning',
            price: 'TZS 65,000',
            description: 'Professional cleaning for sofas, chairs, and furniture.',
            features: [
                'Deep fabric cleaning',
                'Stain removal',
                'Deodorizing',
                'Fabric protection',
                'Quick drying',
                'Eco-friendly solutions'
            ],
            duration: '2-3 hours',
            image: 'images/service8.jpg'
        },
        'construction': {
            title: 'Post-Construction Cleaning',
            price: 'TZS 90,000',
            description: 'Complete cleaning after construction or renovation.',
            features: [
                'Dust removal',
                'Debris cleanup',
                'Surface wiping',
                'Floor cleaning',
                'Window cleaning',
                'Final touch-up'
            ],
            duration: '4-6 hours',
            image: 'images/service9.jpg'
        },
        'pest': {
            title: 'Pest Control',
            price: 'TZS 50,000',
            description: 'Professional pest control services for your home.',
            features: [
                'Comprehensive inspection',
                'Safe treatment application',
                'Preventive measures',
                'Child and pet safe',
                'Follow-up visit included',
                '6-month guarantee'
            ],
            duration: '1-2 hours',
            image: 'images/pest-control.jpg'
        },
        'laundry': {
            title: 'Laundry Services',
            price: 'TZS 35,000',
            description: 'Professional laundry and dry cleaning services.',
            features: [
                'Wash and dry',
                'Ironing service',
                'Fold and pack',
                'Stain treatment',
                'Delicate fabric care',
                'Free pickup and delivery'
            ],
            duration: '24 hours turnaround',
            image: 'images/laundry.jpg'
        },
        'ac': {
            title: 'AC Cleaning',
            price: 'TZS 45,000',
            description: 'Professional air conditioner cleaning and maintenance.',
            features: [
                'Filter cleaning',
                'Coil cleaning',
                'Drain line check',
                'Sanitization',
                'Performance check',
                'Energy efficiency optimization'
            ],
            duration: '1-2 hours',
            image: 'images/ac-cleaning.jpg'
        },
        'watertank': {
            title: 'Water Tank Cleaning',
            price: 'TZS 70,000',
            description: 'Professional water tank cleaning and sanitization.',
            features: [
                'Complete draining',
                'Sludge removal',
                'Pressure washing',
                'Disinfection',
                'Inspection',
                'Water quality testing'
            ],
            duration: '2-3 hours',
            image: 'images/water-tank.jpg'
        },
        'curtain': {
            title: 'Curtain Cleaning',
            price: 'TZS 40,000',
            description: 'Professional curtain cleaning and care.',
            features: [
                'Gentle washing',
                'Stain removal',
                'Ironing',
                'Rehanging service',
                'Fabric protection',
                'All curtain types'
            ],
            duration: '2-3 hours',
            image: 'images/curtain.jpg'
        },
        'garden': {
            title: 'Garden Cleaning',
            price: 'TZS 55,000',
            description: 'Professional garden cleaning and maintenance.',
            features: [
                'Lawn mowing',
                'Weed removal',
                'Leaf blowing',
                'Trimming',
                'Waste disposal',
                'Garden furniture cleaning'
            ],
            duration: '2-4 hours',
            image: 'images/garden.jpg'
        },
        'exterior': {
            title: 'Exterior Cleaning',
            price: 'TZS 85,000',
            description: 'Pressure washing of walls, driveways, and outdoor spaces.',
            features: [
                'Pressure washing',
                'Driveway cleaning',
                'Wall cleaning',
                'Patio cleaning',
                'Mold removal',
                'Surface restoration'
            ],
            duration: '3-5 hours',
            image: 'images/exterior.jpg'
        }
    };
    
    const details = serviceDetails[service] || {
        title: service.charAt(0).toUpperCase() + service.slice(1) + ' Cleaning',
        price: 'TZS 50,000',
        description: 'Professional cleaning service for your needs.',
        features: ['Professional service', 'Quality guaranteed', 'Eco-friendly products'],
        duration: '2 hours',
        image: 'images/service-placeholder1.jpg'
    };
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'serviceModal';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-labelledby', 'serviceModalLabel');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('data-bs-backdrop', 'static');
    
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="serviceModalLabel"><i class="fas fa-info-circle"></i> Service Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <img src="${details.image}" alt="${details.title}" class="img-fluid rounded" onerror="this.src='images/logo.png'">
                        </div>
                        <div class="col-md-6">
                            <h4 class="service-detail-title">${details.title}</h4>
                            <div class="service-detail-price">${details.price}</div>
                            <p class="service-detail-description">${details.description}</p>
                            <div class="mt-3 p-3 bg-light rounded">
                                <strong><i class="far fa-clock"></i> Duration:</strong> ${details.duration}
                            </div>
                        </div>
                    </div>
                    <div class="row mt-4">
                        <div class="col-12">
                            <h6><i class="fas fa-check-circle text-success"></i> What's Included:</h6>
                            <ul class="service-features row">
                                ${details.features.map(feature => `<li class="col-md-6"><i class="fas fa-check text-success"></i> ${feature}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"><i class="fas fa-times"></i> Close</button>
                    <button type="button" class="btn btn-success book-service"><i class="fas fa-calendar-check"></i> Book Now</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const modalInstance = new bootstrap.Modal(modal, {
        backdrop: 'static',
        keyboard: false
    });
    
    modalInstance.show();
    
    const bookBtn = modal.querySelector('.book-service');
    if (bookBtn) {
        bookBtn.addEventListener('click', function() {
            modalInstance.hide();
            setTimeout(() => {
                handleBookClick(service, details.title, details.price);
            }, 500);
        });
    }
    
    modal.addEventListener('hidden.bs.modal', function() {
        modal.remove();
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        modalInitialized = false;
    });
}

// ===== UTILITY FUNCTIONS =====

// Format currency
function formatCurrency(amount) {
    return 'TZS ' + amount.toLocaleString();
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Show loading spinner
function showLoading(show = true) {
    let spinner = document.getElementById('loading-spinner');
    if (!spinner) {
        spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>';
        spinner.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999;';
        document.body.appendChild(spinner);
    }
    spinner.style.display = show ? 'block' : 'none';
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

// Save to localStorage
function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Get from localStorage
function getFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
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

// ===== GOOGLE LOGIN HANDLER =====
function handleGoogleLogin() {
    showNotification('Google login successful!', 'success');
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify({ 
        email: 'user@gmail.com',
        provider: 'google'
    }));
    
    launchCelebration();
    
    const pendingBooking = localStorage.getItem('pendingBooking');
    if (pendingBooking) {
        setTimeout(() => {
            window.location.href = 'booking.html';
        }, 1500);
    } else {
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

// ===== PASSWORD TOGGLE FUNCTIONALITY =====
function setupPasswordToggle() {
    const passwordInput = document.getElementById('passwordLogin');
    const toggleBtn = document.getElementById('passwordToggle');
    
    if (passwordInput && toggleBtn) {
        toggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle icon
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
        
        // Prevent form submission when clicking toggle button
        toggleBtn.addEventListener('mousedown', function(e) {
            e.preventDefault();
        });
    }
}

// ===== FORM VALIDATION FUNCTIONS =====
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

function clearAllErrors() {
    const errorElements = document.querySelectorAll('.invalid-feedback');
    const formControls = document.querySelectorAll('.form-control');
    
    errorElements.forEach(el => {
        el.textContent = '';
        el.classList.remove('show');
    });
    
    formControls.forEach(el => {
        el.classList.remove('is-invalid', 'is-valid');
    });
}

// ===== INITIALIZE DEFAULT TEST USERS =====
function initializeDefaultUsers() {
    const existingUsers = localStorage.getItem('registeredUsers');
    if (!existingUsers) {
        const defaultUsers = [
            {
                email: 'demo@cleanspark.com',
                password: 'demo123',
                firstName: 'Demo',
                lastName: 'User'
            },
            {
                email: 'test@test.com',
                password: 'test123',
                firstName: 'Test',
                lastName: 'Account'
            },
            {
                email: 'admin@cleanspark.com',
                password: 'admin123',
                firstName: 'Admin',
                lastName: 'Manager'
            }
        ];
        localStorage.setItem('registeredUsers', JSON.stringify(defaultUsers));
        console.log('Default test users created successfully');
    }
}

// ===== CREDENTIAL VALIDATION =====
function validateCredentials(email, password) {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    console.log('Validating credentials for:', email);
    
    // Find user by email (case-insensitive)
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
        console.log('User not found');
        return { valid: false, error: 'email_not_found' };
    }
    
    if (user.password !== password) {
        console.log('Password incorrect');
        return { valid: false, error: 'incorrect_password' };
    }
    
    console.log('Credentials valid');
    return { valid: true, user: user };
}

// ===== SET BUTTON LOADING STATE =====
function setButtonLoading(button, isLoading, text) {
    if (!button) return;
    
    if (isLoading) {
        button.disabled = true;
        button.classList.add('btn-loading');
        if (!button.getAttribute('data-original-html')) {
            button.setAttribute('data-original-html', button.innerHTML);
        }
        button.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span class="btn-text">${text || 'Loading...'}</span>
        `;
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

// ===== OTP TIMER FUNCTIONALITY =====
let otpTimerInterval = null;
let otpSecondsRemaining = 30;
const OTP_COOLDOWN_SECONDS = 30;

function startOTPTimer() {
    // Clear any existing timer
    stopOTPTimer();
    
    otpSecondsRemaining = OTP_COOLDOWN_SECONDS;
    const timerElement = document.getElementById('otpTimer');
    const resendBtn = document.getElementById('otpResendBtn');
    
    if (!timerElement || !resendBtn) return;
    
    // Disable resend button
    resendBtn.disabled = true;
    resendBtn.classList.remove('resending');
    
    // Remove warning/expired classes
    timerElement.classList.remove('warning', 'expired');
    
    function updateTimerDisplay() {
        const minutes = Math.floor(otpSecondsRemaining / 60);
        const seconds = otpSecondsRemaining % 60;
        timerElement.textContent = `Resend in ${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Add warning class when 10 seconds remaining
        if (otpSecondsRemaining <= 10 && otpSecondsRemaining > 0) {
            timerElement.classList.add('warning');
        }
        
        // Timer expired
        if (otpSecondsRemaining <= 0) {
            stopOTPTimer();
            timerElement.textContent = 'Didn\'t receive OTP?';
            timerElement.classList.remove('warning');
            timerElement.classList.add('expired');
            resendBtn.disabled = false;
        }
        
        otpSecondsRemaining--;
    }
    
    // Update immediately
    updateTimerDisplay();
    
    // Then update every second
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

// ===== SIMULATE SENDING OTP =====
function simulateSendOTP(email) {
    return new Promise((resolve, reject) => {
        console.log('Sending OTP to:', email);
        
        setTimeout(() => {
            try {
                // Generate a 6-digit OTP
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                
                // Store OTP and email in localStorage
                localStorage.setItem('currentOTP', otp);
                localStorage.setItem('otpEmail', email);
                localStorage.setItem('otpExpiry', Date.now() + (5 * 60 * 1000)); // 5 minutes expiry
                
                console.log('OTP generated successfully:', otp);
                console.log('OTP stored in localStorage:', localStorage.getItem('currentOTP'));
                
                // Reset the OTP timer
                resetOTPTimer();
                
                resolve({ 
                    success: true, 
                    message: 'OTP sent successfully',
                    otp: otp
                });
            } catch (error) {
                console.error('Error generating OTP:', error);
                reject(new Error('Failed to generate OTP'));
            }
        }, 1500);
    });
}

// ===== RESEND OTP =====
async function resendOTP(email) {
    const resendBtn = document.getElementById('otpResendBtn');
    
    if (!resendBtn || resendBtn.disabled) return;
    
    // Show loading state on resend button
    resendBtn.classList.add('resending');
    resendBtn.disabled = true;
    const originalHTML = resendBtn.innerHTML;
    resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resending...';
    
    try {
        const result = await simulateSendOTP(email);
        
        if (result.success) {
            // Clear OTP input
            const otpInput = document.getElementById('otpInput');
            if (otpInput) {
                otpInput.value = '';
                otpInput.focus();
            }
            
            // Clear any OTP errors
            clearFieldError('otpInput', 'otpError');
            
            // Show success notification
            showNotification('New OTP sent to ' + email + ' (Test OTP: ' + result.otp + ')', 'success');
            console.log('========================================');
            console.log('NEW TEST OTP: ' + result.otp);
            console.log('========================================');
        } else {
            throw new Error('Failed to resend OTP');
        }
    } catch (error) {
        console.error('Resend OTP Error:', error);
        showNotification('Failed to resend OTP. Please try again.', 'danger');
        
        // Re-enable resend button if there's an error
        resendBtn.disabled = false;
    } finally {
        // Restore button
        resendBtn.classList.remove('resending');
        resendBtn.innerHTML = originalHTML;
    }
}

// ===== SIMULATE VERIFYING OTP =====
function simulateVerifyOTP(enteredOTP) {
    return new Promise((resolve) => {
        console.log('Verifying OTP:', enteredOTP);
        
        setTimeout(() => {
            const storedOTP = localStorage.getItem('currentOTP');
            const otpExpiry = localStorage.getItem('otpExpiry');
            
            console.log('Stored OTP:', storedOTP);
            
            // Check if OTP has expired (5 minutes)
            if (otpExpiry && Date.now() > parseInt(otpExpiry)) {
                console.log('OTP expired');
                resolve({ success: false, error: 'otp_expired' });
                return;
            }
            
            if (enteredOTP === storedOTP) {
                // Clear OTP after successful verification
                localStorage.removeItem('currentOTP');
                localStorage.removeItem('otpEmail');
                localStorage.removeItem('otpExpiry');
                stopOTPTimer();
                console.log('OTP verified successfully');
                resolve({ success: true });
            } else {
                console.log('OTP mismatch');
                resolve({ success: false, error: 'invalid_otp' });
            }
        }, 800);
    });
}

// ===== SETUP RESEND OTP BUTTON =====
function setupResendOTP() {
    const resendBtn = document.getElementById('otpResendBtn');
    
    if (resendBtn) {
        resendBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const email = localStorage.getItem('otpEmail');
            if (email) {
                resendOTP(email);
            }
        });
    }
}

// ===== DOM CONTENT LOADED EVENT =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize default users for testing
    initializeDefaultUsers();
    
    // Update UI based on login status
    updateUIBasedOnLogin();
    
    // Check for pending booking on login page
    if (window.location.pathname.includes('login.html')) {
        const pendingBooking = localStorage.getItem('pendingBooking');
        if (pendingBooking) {
            showNotification('Please login to complete your booking', 'info');
        }
    }
    
    // Handle info buttons
    const infoButtons = document.querySelectorAll('.info-btn');
    infoButtons.forEach(button => {
        button.removeAttribute('onclick');
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const card = this.closest('.service-card');
            if (card) {
                const title = card.querySelector('.title').textContent.toLowerCase();
                let serviceType = 'home';
                
                if (title.includes('home')) serviceType = 'home';
                else if (title.includes('office')) serviceType = 'office';
                else if (title.includes('carpet')) serviceType = 'carpet';
                else if (title.includes('window')) serviceType = 'window';
                else if (title.includes('vehicle') || title.includes('car')) serviceType = 'vehicle';
                else if (title.includes('pool')) serviceType = 'pool';
                else if (title.includes('mattress')) serviceType = 'mattress';
                else if (title.includes('upholstery')) serviceType = 'upholstery';
                else if (title.includes('construction')) serviceType = 'construction';
                else if (title.includes('pest')) serviceType = 'pest';
                else if (title.includes('laundry')) serviceType = 'laundry';
                else if (title.includes('ac')) serviceType = 'ac';
                else if (title.includes('water')) serviceType = 'watertank';
                else if (title.includes('curtain')) serviceType = 'curtain';
                else if (title.includes('garden')) serviceType = 'garden';
                else if (title.includes('exterior')) serviceType = 'exterior';
                else serviceType = 'home';
                
                showServiceModal(serviceType);
            }
        });
    });
    
    // Handle book buttons
    const bookButtons = document.querySelectorAll('.book-service-btn');
    bookButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const serviceId = this.getAttribute('data-service-id');
            const serviceName = this.getAttribute('data-service-name');
            const servicePrice = this.getAttribute('data-service-price');
            
            handleBookClick(serviceId, serviceName, servicePrice);
        });
    });
    
    // Handle service cards click
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.btn')) {
                return;
            }
            
            const serviceId = this.getAttribute('data-service-id');
            if (serviceId) {
                showServiceModal(serviceId);
            }
        });
    });
    
    // ===== SETUP PASSWORD TOGGLE =====
    setupPasswordToggle();
    
    // ===== SETUP RESEND OTP =====
    setupResendOTP();
    
    // ===== LOGIN FORM HANDLING =====
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const emailInput = document.getElementById('emailLogin');
        const passwordInput = document.getElementById('passwordLogin');
        const otpSection = document.getElementById('otpSection');
        const otpInput = document.getElementById('otpInput');
        const loginBtn = document.getElementById('loginBtn');
        const loginBtnText = document.getElementById('loginBtnText');
        
        let loginStep = 'credentials'; // 'credentials' or 'otp'
        let currentEmail = '';
        
        // Real-time validation clearing
        if (emailInput) {
            emailInput.addEventListener('input', function() {
                if (this.value.trim()) {
                    clearFieldError('emailLogin', 'emailError');
                }
            });
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                if (this.value.trim()) {
                    clearFieldError('passwordLogin', 'passwordError');
                }
            });
        }
        
        if (otpInput) {
            otpInput.addEventListener('input', function() {
                if (this.value.trim()) {
                    clearFieldError('otpInput', 'otpError');
                }
            });
        }
        
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearAllErrors();
            
            if (loginStep === 'credentials') {
                // ===== STEP 1: Validate Email and Password =====
                const email = emailInput ? emailInput.value.trim() : '';
                const password = passwordInput ? passwordInput.value.trim() : '';
                let hasError = false;
                
                // Validate Email
                if (!email) {
                    showFieldError('emailLogin', 'emailError', 'Please enter your email address');
                    hasError = true;
                } else if (!validateEmail(email)) {
                    showFieldError('emailLogin', 'emailError', 'Please enter a valid email address');
                    hasError = true;
                }
                
                // Validate Password
                if (!password) {
                    showFieldError('passwordLogin', 'passwordError', 'Please enter your password');
                    hasError = true;
                } else if (password.length < 6) {
                    showFieldError('passwordLogin', 'passwordError', 'Password must be at least 6 characters');
                    hasError = true;
                }
                
                if (hasError) return;
                
                // Show loading state
                setButtonLoading(loginBtn, true, 'Verifying credentials...');
                
                // Small delay to show loading state
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Validate credentials
                const validationResult = validateCredentials(email, password);
                
                if (!validationResult.valid) {
                    setButtonLoading(loginBtn, false);
                    
                    if (validationResult.error === 'email_not_found') {
                        showFieldError('emailLogin', 'emailError', 'No account found with this email address');
                        showNotification('No account found. Please check your email or register.', 'danger');
                    } else if (validationResult.error === 'incorrect_password') {
                        showFieldError('passwordLogin', 'passwordError', 'Incorrect password. Please try again');
                        showNotification('Incorrect password. Please try again.', 'danger');
                    }
                    return;
                }
                
                // ===== Credentials valid - Now send OTP =====
                setButtonLoading(loginBtn, true, 'Sending OTP...');
                currentEmail = email;
                
                try {
                    const result = await simulateSendOTP(email);
                    
                    if (result.success) {
                        // Reset button for OTP step
                        setButtonLoading(loginBtn, false);
                        
                        // Show OTP section with animation
                        if (otpSection) {
                            otpSection.style.display = 'block';
                            setTimeout(() => {
                                otpSection.classList.add('show-section');
                            }, 50);
                        }
                        
                        // Update button text and icon
                        if (loginBtnText) {
                            loginBtnText.textContent = 'Verify OTP';
                        }
                        const btnIcon = loginBtn.querySelector('i');
                        if (btnIcon) {
                            btnIcon.className = 'fas fa-check';
                        }
                        
                        // Update step
                        loginStep = 'otp';
                        
                        // Focus on OTP input
                        setTimeout(() => {
                            if (otpInput) otpInput.focus();
                        }, 500);
                        
                        // Update OTP info text
                        const otpInfoText = document.getElementById('otpInfoText');
                        if (otpInfoText) {
                            otpInfoText.textContent = 'A 6-digit OTP has been sent to ' + email;
                        }
                        
                        // Show success notification with OTP for testing
                        showNotification('OTP sent to ' + email + ' (Test OTP: ' + result.otp + ')', 'success');
                        
                        console.log('========================================');
                        console.log('TEST OTP: ' + result.otp);
                        console.log('Use this OTP to complete login');
                        console.log('========================================');
                    } else {
                        throw new Error('Failed to send OTP');
                    }
                    
                } catch (error) {
                    console.error('OTP Error:', error);
                    setButtonLoading(loginBtn, false);
                    showNotification('Failed to send OTP. Please try again.', 'danger');
                }
                
            } else if (loginStep === 'otp') {
                // ===== STEP 2: Validate OTP =====
                const otp = otpInput ? otpInput.value.trim() : '';
                
                if (!otp) {
                    showFieldError('otpInput', 'otpError', 'Please enter the 6-digit OTP');
                    return;
                }
                
                if (otp.length !== 6) {
                    showFieldError('otpInput', 'otpError', 'OTP must be exactly 6 digits');
                    return;
                }
                
                if (!/^\d{6}$/.test(otp)) {
                    showFieldError('otpInput', 'otpError', 'OTP must contain only numbers');
                    return;
                }
                
                // Show loading state
                setButtonLoading(loginBtn, true, 'Verifying OTP...');
                
                // Verify OTP
                const otpResult = await simulateVerifyOTP(otp);
                
                if (!otpResult.success) {
                    setButtonLoading(loginBtn, false);
                    
                    if (otpResult.error === 'otp_expired') {
                        showFieldError('otpInput', 'otpError', 'OTP has expired. Please request a new one');
                        showNotification('OTP expired. Please request a new OTP.', 'warning');
                    } else {
                        showFieldError('otpInput', 'otpError', 'Invalid OTP. Please check and try again');
                        showNotification('Invalid OTP. Please try again.', 'danger');
                    }
                    return;
                }
                
                // OTP verified - Login successful
                setButtonLoading(loginBtn, false);
                stopOTPTimer();
                
                // Get user data
                const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                const user = users.find(u => u.email.toLowerCase() === currentEmail.toLowerCase());
                
                handleLoginSuccess(currentEmail, {
                    firstName: user ? user.firstName : '',
                    lastName: user ? user.lastName : ''
                });
            }
        });
    }
    
    // ===== REGISTER FORM HANDLING =====
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const terms = document.getElementById('terms').checked;
            
            if (!firstName || !lastName || !email || !password || !confirmPassword) {
                showNotification('Please fill in all fields', 'danger');
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
            
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            
            if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
                showNotification('This email is already registered. Please login.', 'warning');
                return;
            }
            
            users.push({
                email: email,
                password: password,
                firstName: firstName,
                lastName: lastName
            });
            
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify({ 
                email: email,
                firstName: firstName,
                lastName: lastName 
            }));
            
            showNotification('Registration successful!', 'success');
            
            launchCelebration();
            
            const pendingBooking = localStorage.getItem('pendingBooking');
            if (pendingBooking) {
                setTimeout(() => {
                    window.location.href = 'booking.html';
                }, 1500);
            } else {
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        });
    }
    
    // ===== SEARCH FUNCTIONALITY =====
    const searchInput = document.querySelector('.search-container input');
    const searchButton = document.querySelector('.search-container button');
    
    if (searchInput && searchButton) {
        function performSearch() {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                showNotification('Searching for: ' + searchTerm, 'info');
            }
        }
        
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // ===== LOCATION SELECTOR =====
    const locationSelect = document.querySelector('.search-container select');
    if (locationSelect) {
        locationSelect.addEventListener('change', function() {
            showNotification('Showing services in ' + this.value, 'info');
        });
    }
    
    // ===== CAROUSEL AUTO-SLIDE =====
    const carousel = document.getElementById('carouselAds');
    if (carousel) {
        new bootstrap.Carousel(carousel, {
            interval: 5000,
            wrap: true,
            pause: 'hover'
        });
    }
    
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
    
    // ===== TOOLTIPS =====
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // ===== LOG AVAILABLE TEST ACCOUNTS =====
    console.log('========================================');
    console.log('CleanSpark - Test Accounts Available:');
    console.log('----------------------------------------');
    console.log('Email: demo@cleanspark.com');
    console.log('Password: demo123');
    console.log('----------------------------------------');
    console.log('Email: test@test.com');
    console.log('Password: test123');
    console.log('----------------------------------------');
    console.log('Email: admin@cleanspark.com');
    console.log('Password: admin123');
    console.log('========================================');
});