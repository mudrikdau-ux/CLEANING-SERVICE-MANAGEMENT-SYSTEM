// ===== SIDEBAR =====
function openSidebar() {
    document.getElementById('sidebar').style.width = '280px';
    document.getElementById('sidebarOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    document.getElementById('sidebar').style.width = '0';
    document.getElementById('sidebarOverlay').classList.remove('active');
    document.body.style.overflow = '';
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
    setTimeout(() => { window.location.href = 'index.html'; }, 1000);
}

function updateUIBasedOnLogin() {
    const loginBtn = document.getElementById('headerLoginBtn');
    if (!loginBtn) return;

    if (isLoggedIn()) {
        loginBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> <span class="btn-text">Logout</span>';
        loginBtn.href = '#';
        loginBtn.onclick = (e) => { e.preventDefault(); logout(); };
    } else {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span class="btn-text">Login</span>';
        loginBtn.href = 'login.html';
        loginBtn.onclick = null;
    }
}

// ===== BOOKING FLOW =====
function savePendingBooking(serviceData) {
    if (serviceData) localStorage.setItem('pendingBooking', JSON.stringify(serviceData));
}

function handleBookClick(serviceId, serviceName, servicePrice) {
    const serviceData = { id: serviceId, name: serviceName, price: servicePrice };

    if (isLoggedIn()) {
        localStorage.setItem('selectedService', JSON.stringify(serviceData));
        showNotification('Redirecting to booking...', 'info');
        setTimeout(() => { window.location.href = 'booking.html'; }, 600);
    } else {
        savePendingBooking(serviceData);
        showNotification('Please login to continue with booking', 'info');
        setTimeout(() => { window.location.href = 'login.html'; }, 1000);
    }
}

// ===== SERVICE DETAILS DATA =====
const SERVICE_DETAILS = {
    home: {
        title: 'Home Cleaning', price: 'TZS 50,000',
        description: 'Complete home cleaning service for your residence. Our professional cleaners ensure every corner of your home is spotless.',
        features: ['Kitchen deep cleaning', 'Bathroom sanitization', 'Living area dusting', 'Bedroom cleaning', 'Floor mopping & vacuuming', 'Eco-friendly products used'],
        duration: '2–3 hours', image: 'image/home.jpg'
    },
    office: {
        title: 'Office Cleaning', price: 'TZS 75,000',
        description: 'Professional office cleaning to maintain a hygienic and productive work environment.',
        features: ['Workstation cleaning', 'Conference room sanitization', 'Kitchen/break room cleaning', 'Waste removal', 'Floor maintenance', 'After-hours service available'],
        duration: '3–4 hours', image: 'image/office.jpg'
    },
    carpet: {
        title: 'Carpet Cleaning', price: 'TZS 60,000',
        description: 'Deep carpet cleaning with eco-friendly solutions. Remove tough stains and allergens effectively.',
        features: ['Deep steam cleaning', 'Stain removal treatment', 'Deodorizing', 'Quick-dry technology', 'Pet stain specialist', 'Eco-friendly solutions'],
        duration: '1–2 hours per room', image: 'image/capet.avif'
    },
    window: {
        title: 'Window Cleaning', price: 'TZS 40,000',
        description: 'Professional window cleaning for streak-free shine on all types of windows.',
        features: ['Interior window cleaning', 'Exterior window cleaning', 'Frame and sill wiping', 'Streak-free guarantee', 'Safety equipment used', 'Screens cleaned'],
        duration: '1–2 hours', image: 'image/window.jpg'
    },
    vehicle: {
        title: 'Vehicle Cleaning', price: 'TZS 45,000',
        description: 'Complete interior and exterior vehicle cleaning for a showroom-ready finish.',
        features: ['Exterior wash and wax', 'Interior vacuuming', 'Dashboard cleaning', 'Window cleaning', 'Tire shine', 'Air freshener included'],
        duration: '1–2 hours', image: 'image/vehicle.jpg'
    },
    pool: {
        title: 'Pool Cleaning', price: 'TZS 80,000',
        description: 'Professional pool cleaning and maintenance to keep your pool crystal clear.',
        features: ['Surface skimming', 'Wall and floor brushing', 'Filter cleaning', 'Chemical balancing', 'Water testing', 'Equipment check'],
        duration: '2–3 hours', image: 'image/pool.jpeg'
    },
    mattress: {
        title: 'Mattress Cleaning', price: 'TZS 55,000',
        description: 'Deep mattress cleaning to remove dust mites, allergens, and stains for better sleep.',
        features: ['Deep vacuuming', 'Stain treatment', 'UV sanitization', 'Deodorizing', 'Allergen removal', 'Quick drying'],
        duration: '1 hour per mattress', image: 'image/matres.jpg'
    },
    upholstery: {
        title: 'Upholstery Cleaning', price: 'TZS 65,000',
        description: 'Professional cleaning for sofas, chairs, and all types of furniture.',
        features: ['Deep fabric cleaning', 'Stain removal', 'Deodorizing', 'Fabric protection', 'Quick drying', 'Eco-friendly solutions'],
        duration: '2–3 hours', image: 'image/upholstrey (2).jpg'
    },
    construction: {
        title: 'Post-Construction Cleaning', price: 'TZS 90,000',
        description: 'Complete cleaning after construction or renovation work — from dust to final polish.',
        features: ['Dust removal', 'Debris cleanup', 'Surface wiping', 'Floor cleaning', 'Window cleaning', 'Final touch-up'],
        duration: '4–6 hours', image: 'image/post.jpeg'
    },
    hotel: {
        title: 'Hotel & Airbnb Cleaning', price: 'TZS 100,000',
        description: 'Fast and professional cleaning services for hotels and short-stay apartments to maintain high guest standards.',
        features: ['Room turnover cleaning', 'Linen change', 'Bathroom deep clean', 'Kitchen cleaning', 'Restocking amenities', 'Same-day service available'],
        duration: '2–4 hours', image: 'image/hotel.jpg'
    },
    laundry: {
        title: 'Laundry & Ironing', price: 'TZS 54,000',
        description: 'Professional laundry washing, drying, and ironing to save you time and effort.',
        features: ['Wash and dry', 'Ironing service', 'Fold and pack', 'Stain treatment', 'Delicate fabric care', 'Free pickup & delivery'],
        duration: '24-hour turnaround', image: 'image/iron.jpg'
    },
    pest: {
        title: 'Pest Control & Fumigation', price: 'TZS 54,000',
        description: 'Effective elimination of pests and prevention of infestations for a clean, healthy environment.',
        features: ['Comprehensive inspection', 'Safe treatment application', 'Preventive measures', 'Child & pet safe', 'Follow-up visit included', '6-month guarantee'],
        duration: '1–2 hours', image: 'image/pest.jpg'
    },
    event: {
        title: 'Event Setup & Cleanup', price: 'TZS 90,000',
        description: 'Full event support — arrangement of chairs, tables, and decorations, plus complete cleanup after.',
        features: ['Furniture arrangement', 'Decoration setup', 'Post-event cleanup', 'Waste disposal', 'Floor cleaning', 'Fast turnaround'],
        duration: '3–6 hours', image: 'image/event.jpg'
    },
    ac: {
        title: 'Refrigerator & AC Cleaning', price: 'TZS 45,000',
        description: 'Thorough cleaning and maintenance of refrigerators and air conditioning units for optimal performance.',
        features: ['AC filter cleaning', 'Coil cleaning', 'Drain line check', 'Fridge interior clean', 'Performance check', 'Energy efficiency optimization'],
        duration: '1–2 hours', image: 'image/ac.avif'
    },
    industrial: {
        title: 'Industrial Cleaning', price: 'TZS 100,000',
        description: 'Heavy-duty cleaning for factories, warehouses, and large commercial spaces including machinery areas.',
        features: ['Floor degreasing', 'Machinery area cleaning', 'High-pressure washing', 'Waste disposal', 'Safety-compliant methods', 'Large space specialists'],
        duration: '4–8 hours', image: 'image/industry.avif'
    },
    watertank: {
        title: 'Water Tank Cleaning', price: 'TZS 70,000',
        description: 'Professional water tank cleaning and sanitization to ensure a safe and clean water supply.',
        features: ['Complete draining', 'Sludge removal', 'Pressure washing', 'Disinfection', 'Full inspection', 'Water quality testing'],
        duration: '2–3 hours', image: 'image/tank.jpeg'
    },
    curtain: {
        title: 'Curtain Cleaning', price: 'TZS 40,000',
        description: 'Professional curtain cleaning, washing, and ironing service for all curtain types.',
        features: ['Gentle machine washing', 'Stain removal', 'Steam ironing', 'Rehanging service', 'Fabric protection', 'All curtain types accepted'],
        duration: '2–3 hours', image: 'image/curtel.jpeg'
    },
    garden: {
        title: 'Garden Cleaning', price: 'TZS 55,000',
        description: 'Professional garden cleaning and maintenance — from mowing to full garden tidying.',
        features: ['Lawn mowing', 'Weed removal', 'Leaf blowing', 'Hedge trimming', 'Waste disposal', 'Garden furniture cleaning'],
        duration: '2–4 hours', image: 'image/gaden.jpg'
    }
};

// ===== MODAL =====
let modalOpen = false;

function showServiceModal(serviceId) {
    if (modalOpen) return;
    modalOpen = true;

    // Clean up any existing modals
    const existing = document.getElementById('serviceModal');
    if (existing) existing.remove();
    document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());

    const details = SERVICE_DETAILS[serviceId] || {
        title: serviceId.charAt(0).toUpperCase() + serviceId.slice(1) + ' Service',
        price: 'TZS 50,000',
        description: 'Professional cleaning service tailored to your needs.',
        features: ['Professional service', 'Quality guaranteed', 'Eco-friendly products'],
        duration: '2 hours',
        image: 'images/service1.jpg'
    };

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
                            <img src="${details.image}" alt="${details.title}" class="modal-service-img" onerror="this.src='images/service1.jpg'">
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

    const instance = new bootstrap.Modal(modal, { backdrop: true, keyboard: true });
    instance.show();

    modal.querySelector('#modalBookBtn').addEventListener('click', function () {
        instance.hide();
        setTimeout(() => handleBookClick(serviceId, details.title, details.price), 400);
    });

    modal.addEventListener('hidden.bs.modal', function () {
        modal.remove();
        document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        modalOpen = false;
    });
}

// ===== SEARCH =====
function performSearch() {
    const input = document.querySelector('.search-input');
    const term = input ? input.value.trim() : '';
    if (!term) return;

    // Simple client-side filter
    const cards = document.querySelectorAll('.service-card');
    let found = 0;
    cards.forEach(card => {
        const col = card.closest('[class^="col"]') || card.parentElement;
        const title = card.querySelector('.title')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.description')?.textContent.toLowerCase() || '';
        if (title.includes(term.toLowerCase()) || desc.includes(term.toLowerCase())) {
            col.style.display = '';
            found++;
        } else {
            col.style.display = 'none';
        }
    });

    if (found === 0) {
        showNotification('No services found for "' + term + '"', 'warning');
        // Reset after 2s
        setTimeout(() => {
            cards.forEach(card => {
                const col = card.closest('[class^="col"]') || card.parentElement;
                col.style.display = '';
            });
            if (input) input.value = '';
        }, 2000);
    } else {
        showNotification(`Found ${found} service(s) matching "${term}"`, 'info');
    }
}

// ===== NOTIFICATION =====
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.alert');
    if (existing) existing.remove();

    const n = document.createElement('div');
    n.className = `alert alert-${type} alert-dismissible fade show`;
    n.role = 'alert';
    n.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
    document.body.appendChild(n);

    setTimeout(() => { if (n.parentNode) n.remove(); }, 5000);
}

// ===== UTILITY =====
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function () {
    updateUIBasedOnLogin();

    // Book buttons
    document.querySelectorAll('.book-service-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            handleBookClick(
                this.dataset.serviceId,
                this.dataset.serviceName,
                this.dataset.servicePrice
            );
        });
    });

    // Info buttons
    document.querySelectorAll('.info-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const serviceId = this.dataset.service;
            if (serviceId) showServiceModal(serviceId);
        });
    });

    // Card click (excluding button clicks)
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', function (e) {
            if (e.target.closest('.btn') || e.target.closest('.info-btn')) return;
            const serviceId = this.dataset.serviceId;
            if (serviceId) showServiceModal(serviceId);
        });
    });

    // Search
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-input');
    if (searchBtn) searchBtn.addEventListener('click', performSearch);
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
        // Reset on clear
        searchInput.addEventListener('input', function () {
            if (!this.value.trim()) {
                document.querySelectorAll('.service-card').forEach(card => {
                    const col = card.closest('[class^="col"]') || card.parentElement;
                    col.style.display = '';
                });
            }
        });
    }

    // Location select
    const locationSelect = document.querySelector('.location-select');
    if (locationSelect) {
        locationSelect.addEventListener('change', function () {
            showNotification('Showing services in ' + this.value, 'info');
        });
    }

    // Newsletter
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
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

    // Tooltips
    if (typeof bootstrap !== 'undefined') {
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
            new bootstrap.Tooltip(el);
        });
    }
});