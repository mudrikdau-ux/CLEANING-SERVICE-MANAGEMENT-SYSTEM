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

// ===== SERVICE MODAL FUNCTION - COMPLETELY FIXED =====
let modalInitialized = false;

function showServiceModal(service) {
    // Prevent multiple modal triggers
    if (modalInitialized) {
        return;
    }
    modalInitialized = true;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('serviceModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Remove any existing backdrop
    const existingBackdrop = document.querySelector('.modal-backdrop');
    if (existingBackdrop) {
        existingBackdrop.remove();
    }
    
    // Service details based on service type
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
    
    // Create modal element
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
    
    // Initialize and show modal
    const modalInstance = new bootstrap.Modal(modal, {
        backdrop: 'static',
        keyboard: false
    });
    
    modalInstance.show();
    
    // Handle book now button
    const bookBtn = modal.querySelector('.book-service');
    if (bookBtn) {
        bookBtn.addEventListener('click', function() {
            modalInstance.hide();
            setTimeout(() => {
                showNotification('Booking ' + details.title + '. Please login to continue.', 'info');
                window.location.href = 'login.html';
            }, 500);
        });
    }
    
    // Clean up modal when hidden
    modal.addEventListener('hidden.bs.modal', function() {
        modal.remove();
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        modalInitialized = false; // Reset the flag
    });
}

// ===== REMOVE ONCLICK ATTRIBUTES AND USE EVENT LISTENERS INSTEAD =====
document.addEventListener('DOMContentLoaded', function() {
    // Remove all onclick attributes from info buttons to prevent double triggering
    const infoButtons = document.querySelectorAll('.info-btn');
    infoButtons.forEach(button => {
        // Remove the onclick attribute
        button.removeAttribute('onclick');
        
        // Add click event listener
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Determine service type from card
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
});

// ===== LOGIN FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function() {
    // Login form handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const emailInput = document.getElementById('emailLogin');
        const otpSection = document.getElementById('otpSection');
        const loginBtn = document.getElementById('loginBtn');
        
        let isOtpSent = false;
        
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!isOtpSent) {
                // First click - send OTP
                const email = emailInput.value;
                if (email) {
                    // Show OTP section
                    otpSection.style.display = 'block';
                    loginBtn.innerHTML = '<i class="fas fa-check"></i> Verify OTP';
                    isOtpSent = true;
                    
                    // Simulate OTP sent message
                    showNotification('OTP sent to ' + email, 'success');
                } else {
                    showNotification('Please enter email', 'danger');
                }
            } else {
                // Second click - verify OTP
                const otp = document.getElementById('otpInput').value;
                if (otp && otp.length === 6) {
                    showNotification('Login successful!', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                } else {
                    showNotification('Please enter valid 6-digit OTP', 'danger');
                }
            }
        });
    }
    
    // ===== REGISTER FORM HANDLING =====
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const terms = document.getElementById('terms').checked;
            
            // Validation
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
            
            // Simulate registration
            showNotification('Registration successful! Please login.', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
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
    
    // ===== BOOK NOW BUTTONS =====
    const bookButtons = document.querySelectorAll('.btn-success');
    bookButtons.forEach(button => {
        if (button.textContent.includes('Book') || button.innerHTML.includes('fa-calendar-check')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                // Find the service title
                const card = this.closest('.service-card');
                if (card) {
                    const title = card.querySelector('.title').textContent;
                    showNotification('Booking ' + title + '. Please login to continue.', 'info');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                } else {
                    window.location.href = 'booking.html';
                }
            });
        }
    });
    
    // ===== ADD MORE SERVICES BUTTONS =====
    const addMoreButtons = document.querySelectorAll('.btn-primary');
    addMoreButtons.forEach(button => {
        if (button.textContent.includes('Add More') || button.innerHTML.includes('fa-plus')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                showNotification('Select additional services from our catalog', 'info');
                window.location.href = 'service.html';
            });
        }
    });
    
    // ===== LOCATION SELECTOR =====
    const locationSelect = document.querySelector('.search-container select');
    if (locationSelect) {
        locationSelect.addEventListener('change', function() {
            showNotification('Showing services in ' + this.value, 'info');
        });
    }
});

// ===== GOOGLE LOGIN BUTTONS =====
document.addEventListener('click', function(e) {
    if (e.target.textContent && e.target.textContent.includes('Google')) {
        e.preventDefault();
        showNotification('Google login functionality would be implemented here', 'info');
    }
});

// ===== CAROUSEL AUTO-SLIDE CONFIGURATION =====
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.getElementById('carouselAds');
    if (carousel) {
        // Bootstrap carousel initialization with custom interval
        new bootstrap.Carousel(carousel, {
            interval: 5000,
            wrap: true,
            pause: 'hover'
        });
    }
});

// ===== ADDITIONAL UTILITY FUNCTIONS =====

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
    // Remove existing notification if any
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

// ===== PAGE SPECIFIC FUNCTIONS =====

// Booking page functions
function calculateTotal(services, location) {
    let total = 0;
    services.forEach(service => {
        total += service.price;
    });
    return total;
}

// Service details page
function loadServiceDetails(serviceId) {
    const services = {
        home: { name: 'Home Cleaning', price: 50000, description: 'Complete home cleaning service' },
        office: { name: 'Office Cleaning', price: 75000, description: 'Professional office cleaning' },
        carpet: { name: 'Carpet Cleaning', price: 60000, description: 'Deep carpet cleaning' }
    };
    return services[serviceId] || null;
}

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Footer newsletter subscription
document.addEventListener('DOMContentLoaded', function() {
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
});