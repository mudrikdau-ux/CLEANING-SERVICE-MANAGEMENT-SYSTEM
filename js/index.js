// ===== SIDEBAR FUNCTIONS =====
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
    }
};

// ===== MODAL =====
let modalOpen = false;

function showServiceModal(serviceId) {
    if (modalOpen) return;
    modalOpen = true;

    const existing = document.getElementById('serviceModal');
    if (existing) existing.remove();
    document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());

    const details = SERVICE_DETAILS[serviceId] || {
        title: 'Professional Cleaning',
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
                <div class="modal-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <h5 class="modal-title" id="serviceModalLabel"><i class="fas fa-info-circle"></i> Service Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row g-3">
                        <div class="col-md-5">
                            <img src="${details.image}" alt="${details.title}" class="img-fluid rounded-3" style="width:100%; height:180px; object-fit:cover;" onerror="this.src='image/s4.jpeg'">
                        </div>
                        <div class="col-md-7">
                            <div class="service-detail-title" style="font-size:1.4rem; font-weight:700;">${details.title}</div>
                            <div class="service-detail-price" style="font-size:1.2rem; color:#4361ee; font-weight:600; margin:8px 0;">${details.price}</div>
                            <p style="color:#6c757d;">${details.description}</p>
                            <div class="duration-box" style="background:#f8f9fa; padding:8px 12px; border-radius:8px;">
                                <i class="far fa-clock"></i> <strong>Duration:</strong> ${details.duration}
                            </div>
                        </div>
                    </div>
                    <div class="mt-4">
                        <p style="font-weight:600;"><i class="fas fa-check-circle text-success"></i> What's Included:</p>
                        <ul class="list-unstyled row g-2">
                            ${details.features.map(f => `<li class="col-6"><i class="fas fa-check text-success me-2"></i> ${f}</li>`).join('')}
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
        modalOpen = false;
    });
}

// ===== FEATURE DETAILS DATA & MODAL =====
const FEATURE_DETAILS = {
    ontime: {
        icon: 'fa-stopwatch',
        title: 'On-Time Service',
        subtitle: 'Punctual and reliable professionals',
        color: '#4361ee',
        description: 'We understand that your time is valuable. Our commitment to punctuality is one of the cornerstones of our service promise.',
        details: [
            { icon: 'fa-check-circle', text: 'Guaranteed arrival within the scheduled time window' },
            { icon: 'fa-clock', text: 'Real-time tracking of cleaner on the way' },
            { icon: 'fa-calendar-check', text: 'Flexible scheduling with instant confirmation' },
            { icon: 'fa-bell', text: 'Automatic reminders 24 hours before appointment' },
            { icon: 'fa-redo', text: 'Late arrival compensation guarantee' }
        ],
        highlight: '98% on-time arrival rate across Zanzibar'
    },
    eco: {
        icon: 'fa-leaf',
        title: 'Eco-Friendly Products',
        subtitle: 'Safe, non-toxic cleaning solutions',
        color: '#4bb543',
        description: 'We care about your family and the environment. All our cleaning products are carefully selected to be effective yet completely safe.',
        details: [
            { icon: 'fa-check-circle', text: '100% non-toxic and biodegradable formulas' },
            { icon: 'fa-baby', text: 'Safe for children and pets after drying' },
            { icon: 'fa-globe-africa', text: 'Locally sourced sustainable ingredients' },
            { icon: 'fa-certificate', text: 'Certified by Zanzibar Environmental Council' },
            { icon: 'fa-recycle', text: 'Recyclable packaging and refill programs' }
        ],
        highlight: 'Award-winning green cleaning initiative 2026'
    },
    insured: {
        icon: 'fa-shield-alt',
        title: 'Insured & Bonded',
        subtitle: 'Fully vetted and insured staff',
        color: '#f8961e',
        description: 'Peace of mind comes standard with every booking. Our comprehensive insurance and rigorous vetting process ensures you are fully protected.',
        details: [
            { icon: 'fa-check-circle', text: 'Comprehensive liability insurance coverage' },
            { icon: 'fa-id-card', text: 'Background-checked and verified cleaners' },
            { icon: 'fa-user-shield', text: 'Bonded employees for theft protection' },
            { icon: 'fa-star', text: 'Continuous training and performance reviews' },
            { icon: 'fa-handshake', text: 'Satisfaction guaranteed or free re-clean' }
        ],
        highlight: 'TZS 10M liability coverage per incident'
    }
};

function showFeatureModal(featureKey) {
    const details = FEATURE_DETAILS[featureKey];
    if (!details) return;

    // Remove any existing feature modals
    const existing = document.getElementById('featureModal');
    if (existing) existing.remove();
    document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());

    const modal = document.createElement('div');
    modal.className = 'modal fade feature-modal';
    modal.id = 'featureModal';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-labelledby', 'featureModalLabel');
    modal.setAttribute('aria-hidden', 'true');

    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="featureModalLabel">
                        <span class="feature-detail-icon">
                            <i class="fas ${details.icon}"></i>
                        </span>
                        <div>
                            ${details.title}
                            <small class="d-block text-muted" style="font-size: 0.9rem; font-weight: 400; margin-top: 4px;">${details.subtitle}</small>
                        </div>
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p style="font-size: 1.1rem; color: #444; margin-bottom: 1.5rem;">${details.description}</p>
                    
                    <div class="alert" style="background: #f0f7ff; border-left: 4px solid ${details.color}; color: #333; border-radius: 10px; padding: 1rem;">
                        <i class="fas fa-star" style="color: ${details.color};"></i> <strong>${details.highlight}</strong>
                    </div>

                    <ul class="feature-detail-list">
                        ${details.details.map(d => `
                            <li>
                                <i class="fas ${d.icon}" style="color: ${details.color}; width: 24px;"></i>
                                <span>${d.text}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                    <a href="service.html" class="btn btn-success">
                        <i class="fas fa-broom"></i> Book a Service
                    </a>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const instance = new bootstrap.Modal(modal, { backdrop: true, keyboard: true });
    instance.show();

    modal.addEventListener('hidden.bs.modal', function () {
        modal.remove();
        document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
    });
}

// ===== CHATBOT TOGGLE (For 24/7 Support Feature) =====
function openChatbot() {
    // Attempt to find and trigger the existing chatbot button
    const chatBtn = document.querySelector('.chatbot-toggle, .bot-toggle, #chatbotBtn');
    if (chatBtn) {
        chatBtn.click();
        showNotification('Opening live chat support...', 'info');
    } else {
        // Fallback: try to show the chatbot container directly
        const chatContainer = document.querySelector('.chatbot-container, .bot-container, #chatbotContainer');
        if (chatContainer) {
            chatContainer.style.display = 'block';
            chatContainer.classList.add('active');
            showNotification('Live chat is now open', 'success');
        } else {
            // Ultimate fallback: redirect to contact
            showNotification('Chat support loading...', 'info');
            // If bot.js has a global init, this will work
            if (typeof window.toggleChat === 'function') {
                window.toggleChat();
            } else {
                // Wait for bot.js to potentially load
                setTimeout(() => {
                    const btn = document.querySelector('.chatbot-toggle, .bot-toggle, #chatbotBtn');
                    if (btn) {
                        btn.click();
                    } else if (typeof window.toggleChat === 'function') {
                        window.toggleChat();
                    }
                }, 300);
            }
        }
    }
}

// ===== SEARCH =====
function performSearch() {
    const input = document.querySelector('.search-input');
    const term = input ? input.value.trim() : '';
    if (!term) return;
    showNotification('Searching for: ' + term, 'info');
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
            handleBookClick(this.dataset.serviceId, this.dataset.serviceName, this.dataset.servicePrice);
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

    // Card click
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', function (e) {
            if (e.target.closest('.btn') || e.target.closest('.info-btn')) return;
            const serviceId = this.dataset.serviceId;
            if (serviceId) showServiceModal(serviceId);
        });
    });

    // ===== FEATURE CLICK HANDLERS =====
    // On-Time Service
    const featureOnTime = document.getElementById('featureOnTime');
    if (featureOnTime) {
        featureOnTime.addEventListener('click', function(e) {
            e.preventDefault();
            showFeatureModal('ontime');
        });
        featureOnTime.style.cursor = 'pointer';
    }

    // Eco-Friendly
    const featureEco = document.getElementById('featureEco');
    if (featureEco) {
        featureEco.addEventListener('click', function(e) {
            e.preventDefault();
            showFeatureModal('eco');
        });
        featureEco.style.cursor = 'pointer';
    }

    // Insured & Bonded
    const featureInsured = document.getElementById('featureInsured');
    if (featureInsured) {
        featureInsured.addEventListener('click', function(e) {
            e.preventDefault();
            showFeatureModal('insured');
        });
        featureInsured.style.cursor = 'pointer';
    }

    // 24/7 Support - Opens Chatbot
    const featureSupport = document.getElementById('featureSupport');
    if (featureSupport) {
        featureSupport.addEventListener('click', function(e) {
            e.preventDefault();
            openChatbot();
        });
        featureSupport.style.cursor = 'pointer';
    }

    // Search
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-input');
    if (searchBtn) searchBtn.addEventListener('click', performSearch);
    if (searchInput) searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });

    // Location select
    const locationSelect = document.querySelector('.location-select');
    if (locationSelect) locationSelect.addEventListener('change', function () { showNotification('Showing services in ' + this.value, 'info'); });

    // Newsletter
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                if (validateEmail(emailInput.value)) {
                    showNotification('Thank you for subscribing to our newsletter!', 'success');
                    emailInput.value = '';
                } else showNotification('Please enter a valid email address', 'danger');
            }
        });
    }

    // Carousel
    const carousel = document.getElementById('carouselAds');
    if (carousel && typeof bootstrap !== 'undefined') new bootstrap.Carousel(carousel, { interval: 5000, wrap: true, pause: 'hover' });
});