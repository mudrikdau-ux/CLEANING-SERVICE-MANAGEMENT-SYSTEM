// ===== CLEANSPARK SERVICES PAGE - FULLY FUNCTIONAL =====

// Global variables
let currentModalInstance = null;

// ===== SIDEBAR FUNCTIONS =====
function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.style.width = '280px';
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.style.width = '0';
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== LOADING OVERLAY =====
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('active');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.remove('active');
}

// ===== AUTH HELPERS =====
function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    showNotification('Logged out successfully', 'success');
    setTimeout(() => { 
        window.location.href = 'index.html'; 
    }, 1000);
}

function updateUIBasedOnLogin() {
    const loginBtn = document.getElementById('headerLoginBtn');
    if (!loginBtn) return;

    if (isLoggedIn()) {
        loginBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> <span class="btn-text">Logout</span>';
        loginBtn.href = 'javascript:void(0);';
        loginBtn.onclick = function(e) {
            e.preventDefault();
            logout();
        };
    } else {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span class="btn-text">Login</span>';
        loginBtn.href = 'login.html';
        loginBtn.onclick = null;
    }
}

// ===== BOOKING FLOW =====
function savePendingBooking(serviceData) {
    if (serviceData) {
        localStorage.setItem('pendingBooking', JSON.stringify(serviceData));
    }
}

function handleBookClick(serviceId, serviceName, servicePrice) {
    console.log('Book clicked:', serviceId, serviceName, servicePrice);
    
    const serviceData = { 
        id: serviceId, 
        name: serviceName, 
        price: servicePrice 
    };

    if (isLoggedIn()) {
        localStorage.setItem('selectedService', JSON.stringify(serviceData));
        showNotification('Redirecting to booking...', 'info');
        setTimeout(() => { 
            window.location.href = 'booking.html'; 
        }, 600);
    } else {
        savePendingBooking(serviceData);
        showNotification('Please login to continue with booking', 'info');
        setTimeout(() => { 
            window.location.href = 'login.html'; 
        }, 1000);
    }
}

// ===== SERVICE DETAILS DATA =====
const SERVICE_DETAILS = {
    home_cleaning: {
        title: 'Home Cleaning', 
        price: 'TZS 50,000',
        description: 'Complete home cleaning service for your residence. Our professional cleaners ensure every corner of your home is spotless.',
        features: ['Kitchen deep cleaning', 'Bathroom sanitization', 'Living area dusting', 'Bedroom cleaning', 'Floor mopping & vacuuming', 'Eco-friendly products used'],
        duration: '2–3 hours', 
        image: 'image/home.jpeg'
    },
    office_cleaning: {
        title: 'Office Cleaning', 
        price: 'TZS 75,000',
        description: 'Professional office cleaning to maintain a hygienic and productive work environment.',
        features: ['Workstation cleaning', 'Conference room sanitization', 'Kitchen/break room cleaning', 'Waste removal', 'Floor maintenance', 'After-hours service available'],
        duration: '3–4 hours', 
        image: 'image/office.jpg'
    },
    deep_cleaning: {
        title: 'Deep Cleaning', 
        price: 'TZS 75,000',
        description: 'Intensive deep cleaning for every corner. Perfect for spring cleaning or special occasions.',
        features: ['Complete home deep clean', 'Behind appliances cleaning', 'Inside cabinets & drawers', 'Baseboards & trim', 'Light fixtures & fans', 'Detailed dusting everywhere'],
        duration: '4–6 hours', 
        image: 'image/deepcleaning.jpg'
    },
    apartment_cleaning: {
        title: 'Apartment Cleaning', 
        price: 'TZS 45,000',
        description: 'Specialized cleaning for apartments and condos. Fast, efficient, and thorough service.',
        features: ['Full apartment cleaning', 'Kitchen & bathroom focus', 'Living area cleaning', 'Bedroom cleaning', 'Floor care', 'Quick turnaround'],
        duration: '2–3 hours', 
        image: 'image/apartment.jpg'
    },
    move_cleaning: {
        title: 'Move-In/Out Cleaning', 
        price: 'TZS 70,000',
        description: 'Complete cleaning for moving in or out. Ensure your deposit return or fresh start.',
        features: ['Deep clean all rooms', 'Inside cabinets & closets', 'Appliance cleaning', 'Floor deep cleaning', 'Wall spot cleaning', 'Ready for inspection'],
        duration: '3–5 hours', 
        image: 'image/move.jpg'
    },
    construction_cleaning: {
        title: 'Post Construction Cleaning', 
        price: 'TZS 90,000',
        description: 'Complete cleaning after construction or renovation. Dust removal and debris cleanup.',
        features: ['Dust removal from all surfaces', 'Debris cleanup', 'Window & frame cleaning', 'Floor deep cleaning', 'HVAC vent cleaning', 'Final polish'],
        duration: '4–6 hours', 
        image: 'image/post.jpeg'
    },
    carpet_cleaning: {
        title: 'Carpet Cleaning', 
        price: 'TZS 60,000',
        description: 'Deep carpet cleaning with eco-friendly solutions. Remove tough stains and allergens effectively.',
        features: ['Deep steam cleaning', 'Stain removal treatment', 'Deodorizing', 'Quick-dry technology', 'Pet stain specialist', 'Eco-friendly solutions'],
        duration: '1–2 hours per room', 
        image: 'image/s.avif'
    },
    window_cleaning: {
        title: 'Window Cleaning', 
        price: 'TZS 40,000',
        description: 'Professional window cleaning for streak-free shine on all types of windows.',
        features: ['Interior window cleaning', 'Exterior window cleaning', 'Frame and sill wiping', 'Streak-free guarantee', 'Safety equipment used', 'Screens cleaned'],
        duration: '1–2 hours', 
        image: 'image/window.jpg'
    },
    vehicle_cleaning: {
        title: 'Vehicle Cleaning', 
        price: 'TZS 45,000',
        description: 'Complete interior and exterior vehicle cleaning for a showroom-ready finish.',
        features: ['Exterior wash and wax', 'Interior vacuuming', 'Dashboard cleaning', 'Window cleaning', 'Tire shine', 'Air freshener included'],
        duration: '1–2 hours', 
        image: 'image/vehicle.jpg'
    },
    pool_cleaning: {
        title: 'Pool Cleaning', 
        price: 'TZS 80,000',
        description: 'Professional pool cleaning and maintenance to keep your pool crystal clear.',
        features: ['Surface skimming', 'Wall and floor brushing', 'Filter cleaning', 'Chemical balancing', 'Water testing', 'Equipment check'],
        duration: '2–3 hours', 
        image: 'image/pool.jpeg'
    },
    mattress_cleaning: {
        title: 'Mattress Cleaning', 
        price: 'TZS 55,000',
        description: 'Deep mattress cleaning to remove dust mites, allergens, and stains for better sleep.',
        features: ['Deep vacuuming', 'Stain treatment', 'UV sanitization', 'Deodorizing', 'Allergen removal', 'Quick drying'],
        duration: '1 hour per mattress', 
        image: 'image/matres.jpg'
    },
    upholstery_cleaning: {
        title: 'Upholstery Cleaning', 
        price: 'TZS 65,000',
        description: 'Professional cleaning for sofas, chairs, and all types of furniture.',
        features: ['Deep fabric cleaning', 'Stain removal', 'Deodorizing', 'Fabric protection', 'Quick drying', 'Eco-friendly solutions'],
        duration: '2–3 hours', 
        image: 'image/upholstrey (2).jpg'
    },
    hotel_cleaning: {
        title: 'Hotel & Airbnb Cleaning', 
        price: 'TZS 100,000',
        description: 'Fast and professional cleaning services for hotels and short-stay apartments to maintain high guest standards.',
        features: ['Room turnover cleaning', 'Linen change', 'Bathroom deep clean', 'Kitchen cleaning', 'Restocking amenities', 'Same-day service available'],
        duration: '2–4 hours', 
        image: 'image/hotel.jpg'
    },
    laundry_service: {
        title: 'Laundry & Ironing', 
        price: 'TZS 54,000',
        description: 'Professional laundry washing, drying, and ironing to save you time and effort.',
        features: ['Wash and dry', 'Ironing service', 'Fold and pack', 'Stain treatment', 'Delicate fabric care', 'Free pickup & delivery'],
        duration: '24-hour turnaround', 
        image: 'image/iron.jpg'
    },
    pest_control: {
        title: 'Pest Control', 
        price: 'TZS 54,000',
        description: 'Effective elimination of pests and prevention of infestations for a clean, healthy environment.',
        features: ['Comprehensive inspection', 'Safe treatment application', 'Preventive measures', 'Child & pet safe', 'Follow-up visit included', '6-month guarantee'],
        duration: '1–2 hours', 
        image: 'image/pest.jpg'
    },
    event_cleaning: {
        title: 'Event Setup & Cleanup', 
        price: 'TZS 90,000',
        description: 'Full event support — arrangement of chairs, tables, and decorations, plus complete cleanup after.',
        features: ['Furniture arrangement', 'Decoration setup', 'Post-event cleanup', 'Waste disposal', 'Floor cleaning', 'Fast turnaround'],
        duration: '3–6 hours', 
        image: 'image/event.jpg'
    },
    ac_cleaning: {
        title: 'AC & Refrigerator Cleaning', 
        price: 'TZS 45,000',
        description: 'Thorough cleaning and maintenance of refrigerators and air conditioning units for optimal performance.',
        features: ['AC filter cleaning', 'Coil cleaning', 'Drain line check', 'Fridge interior clean', 'Performance check', 'Energy efficiency optimization'],
        duration: '1–2 hours', 
        image: 'image/ac.avif'
    },
    industrial_cleaning: {
        title: 'Industrial Cleaning', 
        price: 'TZS 120,000',
        description: 'Heavy-duty cleaning for factories, warehouses, and large commercial spaces including machinery areas.',
        features: ['Floor degreasing', 'Machinery area cleaning', 'High-pressure washing', 'Waste disposal', 'Safety-compliant methods', 'Large space specialists'],
        duration: '4–8 hours', 
        image: 'image/industry.avif'
    },
    water_tank_cleaning: {
        title: 'Water Tank Cleaning', 
        price: 'TZS 70,000',
        description: 'Professional water tank cleaning and sanitization to ensure a safe and clean water supply.',
        features: ['Complete draining', 'Sludge removal', 'Pressure washing', 'Disinfection', 'Full inspection', 'Water quality testing'],
        duration: '2–3 hours', 
        image: 'image/tank.jpeg'
    },
    curtain_cleaning: {
        title: 'Curtain Cleaning', 
        price: 'TZS 40,000',
        description: 'Professional curtain cleaning, washing, and ironing service for all curtain types.',
        features: ['Gentle machine washing', 'Stain removal', 'Steam ironing', 'Rehanging service', 'Fabric protection', 'All curtain types accepted'],
        duration: '2–3 hours', 
        image: 'image/curtel.jpeg'
    },
    garden_cleaning: {
        title: 'Garden Cleaning', 
        price: 'TZS 55,000',
        description: 'Professional garden cleaning and maintenance — from mowing to full garden tidying.',
        features: ['Lawn mowing', 'Weed removal', 'Leaf blowing', 'Hedge trimming', 'Waste disposal', 'Garden furniture cleaning'],
        duration: '2–4 hours', 
        image: 'image/gaden.jpg'
    }
};

// ===== MODAL FUNCTIONS =====
let modalOpen = false;

function showServiceModal(serviceId) {
    if (modalOpen) return;
    modalOpen = true;

    // Clean up any existing modals
    const existing = document.getElementById('serviceModal');
    if (existing) {
        if (currentModalInstance) {
            currentModalInstance.hide();
        }
        existing.remove();
    }
    document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());

    // Get service details
    const details = SERVICE_DETAILS[serviceId];
    if (!details) {
        console.error('Service details not found for:', serviceId);
        modalOpen = false;
        return;
    }

    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'serviceModal';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-labelledby', 'serviceModalLabel');
    modal.setAttribute('aria-hidden', 'true');

    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="serviceModalLabel"><i class="fas fa-info-circle"></i> Service Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row g-3">
                        <div class="col-md-5">
                            <img src="${details.image}" alt="${details.title}" class="modal-service-img" onerror="this.src='image/logo.jpeg'">
                        </div>
                        <div class="col-md-7">
                            <div class="service-detail-title">${details.title}</div>
                            <div class="service-detail-price">${details.price}</div>
                            <p class="service-detail-description">${details.description}</p>
                            <div class="duration-box">
                                <i class="far fa-clock"></i> <strong>Duration:</strong> ${details.duration}
                            </div>
                        </div>
                    </div>
                    <div class="mt-4">
                        <p class="service-features-title"><i class="fas fa-check-circle text-success"></i> What's Included:</p>
                        <ul class="service-features">
                            ${details.features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"><i class="fas fa-times"></i> Close</button>
                    <button type="button" class="btn btn-success" id="modalBookBtn"><i class="fas fa-calendar-check"></i> Book Now</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Initialize modal with Bootstrap
    currentModalInstance = new bootstrap.Modal(modal, { backdrop: true, keyboard: true });
    currentModalInstance.show();

    // Handle book button click
    const bookBtn = modal.querySelector('#modalBookBtn');
    if (bookBtn) {
        bookBtn.addEventListener('click', function() {
            currentModalInstance.hide();
            setTimeout(() => {
                handleBookClick(serviceId, details.title, details.price);
            }, 400);
        });
    }

    // Clean up on modal hide
    modal.addEventListener('hidden.bs.modal', function() {
        modal.remove();
        document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        modalOpen = false;
        currentModalInstance = null;
    });
}

// ===== SEARCH FUNCTIONALITY =====
function performSearch() {
    const input = document.getElementById('searchInput');
    const term = input ? input.value.trim().toLowerCase() : '';
    
    const cards = document.querySelectorAll('.service-card');
    let found = 0;
    
    cards.forEach(card => {
        const col = card.closest('.col-lg-4, .col-md-6');
        const title = card.querySelector('.title')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.description')?.textContent.toLowerCase() || '';
        
        if (term === '' || title.includes(term) || desc.includes(term)) {
            if (col) col.style.display = '';
            found++;
        } else {
            if (col) col.style.display = 'none';
        }
    });

    if (term !== '') {
        if (found === 0) {
            showNotification('No services found for "' + term + '"', 'warning');
        } else {
            showNotification(`Found ${found} service(s) matching "${term}"`, 'success');
        }
    }
}

function resetSearch() {
    const input = document.getElementById('searchInput');
    if (input && input.value === '') {
        const cards = document.querySelectorAll('.service-card');
        cards.forEach(card => {
            const col = card.closest('.col-lg-4, .col-md-6');
            if (col) col.style.display = '';
        });
    }
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.alert-notification');
    if (existing) existing.remove();

    const n = document.createElement('div');
    n.className = `alert alert-${type} alert-dismissible fade show alert-notification`;
    n.role = 'alert';
    n.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 9999;
        min-width: 280px;
        max-width: 400px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease;
    `;
    n.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(n);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (n.parentNode) {
            n.classList.remove('show');
            setTimeout(() => {
                if (n.parentNode) n.remove();
            }, 300);
        }
    }, 5000);
}

// Add animation style
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    .alert-notification {
        animation: slideInRight 0.3s ease !important;
    }
`;
document.head.appendChild(notificationStyle);

// ===== UTILITY FUNCTIONS =====
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Services page initialized');
    
    // Update UI based on login status
    updateUIBasedOnLogin();
    
    // Initialize sidebar button
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', openSidebar);
    }
    
    // Close sidebar when clicking overlay
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }
    
    // Initialize Book buttons
    const bookButtons = document.querySelectorAll('.book-service-btn');
    bookButtons.forEach(btn => {
        btn.removeEventListener('click', handleBookButtonClick);
        btn.addEventListener('click', handleBookButtonClick);
    });
    
    // Initialize Info buttons
    const infoButtons = document.querySelectorAll('.info-btn');
    infoButtons.forEach(btn => {
        btn.removeEventListener('click', handleInfoButtonClick);
        btn.addEventListener('click', handleInfoButtonClick);
    });
    
    // Initialize Card clicks (excluding button clicks)
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.removeEventListener('click', handleCardClick);
        card.addEventListener('click', handleCardClick);
    });
    
    // Initialize Search
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn) {
        searchBtn.removeEventListener('click', performSearch);
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.removeEventListener('keypress', handleSearchKeypress);
        searchInput.removeEventListener('input', resetSearch);
        searchInput.addEventListener('keypress', handleSearchKeypress);
        searchInput.addEventListener('input', resetSearch);
    }
    
    // Initialize Location select
    const locationSelect = document.querySelector('.location-select');
    if (locationSelect) {
        locationSelect.removeEventListener('change', handleLocationChange);
        locationSelect.addEventListener('change', handleLocationChange);
    }
    
    // Initialize Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.removeEventListener('submit', handleNewsletterSubmit);
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
    
    // Initialize Tooltips
    if (typeof bootstrap !== 'undefined') {
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
            new bootstrap.Tooltip(el);
        });
    }
});

// Event handler functions
function handleBookButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const btn = e.currentTarget;
    handleBookClick(
        btn.dataset.serviceId,
        btn.dataset.serviceName,
        btn.dataset.servicePrice
    );
}

function handleInfoButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const btn = e.currentTarget;
    const serviceId = btn.dataset.service;
    if (serviceId) showServiceModal(serviceId);
}

function handleCardClick(e) {
    if (e.target.closest('.btn') || e.target.closest('.info-btn')) return;
    const card = e.currentTarget;
    const serviceId = card.dataset.serviceId;
    if (serviceId) showServiceModal(serviceId);
}

function handleSearchKeypress(e) {
    if (e.key === 'Enter') {
        performSearch();
    }
}

function handleLocationChange(e) {
    showNotification('Showing services in ' + e.target.value, 'info');
}

function handleNewsletterSubmit(e) {
    e.preventDefault();
    const emailInput = this.querySelector('input[type="email"]');
    if (emailInput && emailInput.value) {
        if (validateEmail(emailInput.value)) {
            let subscribers = JSON.parse(localStorage.getItem('cleanspark_newsletter_subscribers') || '[]');
            if (!subscribers.includes(emailInput.value)) {
                subscribers.push(emailInput.value);
                localStorage.setItem('cleanspark_newsletter_subscribers', JSON.stringify(subscribers));
            }
            showNotification('Thank you for subscribing to CleanSpark newsletter!', 'success');
            emailInput.value = '';
        } else {
            showNotification('Please enter a valid email address', 'error');
        }
    }
}