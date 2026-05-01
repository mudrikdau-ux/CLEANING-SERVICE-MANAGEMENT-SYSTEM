// ===== COMBINED REGISTER & AUTHENTICATION SCRIPT =====
// Includes all functionality for registration page

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

// ===== GOOGLE REGISTER HANDLER =====
function handleGoogleRegister() {
    showNotification('Google registration successful!', 'success');
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify({ 
        email: 'user@gmail.com',
        firstName: 'Google',
        lastName: 'User',
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

// ===== DOM CONTENT LOADED EVENT =====
document.addEventListener('DOMContentLoaded', function() {
    // Update UI based on login status
    updateUIBasedOnLogin();
    
    // Check for pending booking on register page
    const pendingBooking = localStorage.getItem('pendingBooking');
    if (pendingBooking) {
        showNotification('Complete registration to continue with your booking', 'info');
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
    
    // ===== REGISTER FORM HANDLING =====
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        // Password strength indicator
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                const password = this.value;
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
                
                let existingIndicator = document.getElementById('passwordStrength');
                if (existingIndicator) {
                    existingIndicator.remove();
                }
                
                if (strengthText) {
                    const indicator = document.createElement('small');
                    indicator.id = 'passwordStrength';
                    indicator.textContent = `Password strength: ${strengthText}`;
                    indicator.style.color = strengthColor;
                    indicator.style.display = 'block';
                    indicator.style.marginTop = '5px';
                    passwordInput.parentNode.appendChild(indicator);
                }
            });
        }
        
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', function() {
                const password = document.getElementById('password').value;
                const confirm = this.value;
                
                let existingMatch = document.getElementById('passwordMatch');
                if (existingMatch) {
                    existingMatch.remove();
                }
                
                if (confirm.length > 0) {
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
                    this.parentNode.appendChild(matchIndicator);
                }
            });
        }
        
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const address = document.getElementById('address').value.trim();
            const gender = document.getElementById('gender').value;
            const terms = document.getElementById('terms').checked;
            
            // Validation
            if (!firstName || !lastName || !email || !password || !confirmPassword || !address || !gender) {
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
            
            // Check if email already exists
            const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            if (existingUsers.some(user => user.email === email)) {
                showNotification('Email already registered. Please login instead.', 'danger');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }
            
            // Save user to registered users
            const newUser = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                address: address,
                gender: gender,
                registeredAt: new Date().toISOString()
            };
            existingUsers.push(newUser);
            localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
            
            // Auto login after registration
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify({ 
                email: email,
                firstName: firstName,
                lastName: lastName,
                address: address,
                gender: gender
            }));
            
            showNotification('Registration successful! Welcome to CleanSpark!', 'success');
            
            // Launch celebration animation
            launchCelebration();
            
            // Check for pending booking
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
    
    // ===== TERMS AND CONDITIONS MODAL LOGIC =====
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
        
        // Ensure checkbox is unchecked when modal is opened if not already checked
        termsModalElement.addEventListener('show.bs.modal', function () {
            // We don't auto-check here, user must click "I Agree"
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
    
    // ===== SOCIAL LOGIN BUTTON =====
    const socialRegisterBtn = document.querySelector('.social-login button');
    if (socialRegisterBtn) {
        socialRegisterBtn.addEventListener('click', function() {
            handleGoogleRegister();
        });
    }
    
    // ===== TOOLTIPS =====
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});