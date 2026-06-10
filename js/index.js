/**
 * CleanSpark Index Page - Fully Integrated with Backend API
 * Handles dynamic service loading, authentication, and booking flow
 * Features: Location filter (Unguja/Pemba/Both), Search, No prices shown
 */

// Store all services globally for filtering
let allServices = [];
let currentLocationFilter = 'all';
let currentSearchTerm = '';

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

// Close sidebar on overlay click
if (document.getElementById('sidebarOverlay')) {
    document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);
}

// ===== AUTH HELPERS =====
function isLoggedIn() {
    return !!API.getAuthToken() && localStorage.getItem('isLoggedIn') === 'true';
}

function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

async function logout() {
    try {
        await API.auth.logout();
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        API.clearAuthToken();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('staffLoggedIn');
        showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

function updateUIBasedOnLogin() {
    const loginBtn = document.getElementById('headerLoginBtn');
    if (!loginBtn) return;

    if (isLoggedIn()) {
        const user = getCurrentUser();
        const userName = user?.first_name || 'Account';
        loginBtn.innerHTML = `<i class="fas fa-user-check"></i> <span class="btn-text">Hi, ${userName}</span>`;
        loginBtn.href = 'account.html';
        loginBtn.onclick = null;
        loginBtn.classList.add('logged-in');
    } else {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span class="btn-text">Login</span>';
        loginBtn.href = 'login.html';
        loginBtn.onclick = null;
        loginBtn.classList.remove('logged-in');
    }
}

// ===== BOOKING FLOW =====
function savePendingBooking(serviceData) {
    if (serviceData) {
        localStorage.setItem('pendingBooking', JSON.stringify(serviceData));
    }
}

function handleBookClick(serviceId, serviceName) {
    const serviceData = { 
        id: serviceId, 
        name: serviceName
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

// ===== FILTER AND DISPLAY SERVICES =====
function filterAndDisplayServices() {
    let filteredServices = [...allServices];
    
    // Apply location filter
    if (currentLocationFilter !== 'all') {
        filteredServices = filteredServices.filter(service => 
            service.location === currentLocationFilter
        );
    }
    
    // Apply search filter
    if (currentSearchTerm) {
        const searchLower = currentSearchTerm.toLowerCase();
        filteredServices = filteredServices.filter(service => 
            service.name.toLowerCase().includes(searchLower) ||
            (service.description && service.description.toLowerCase().includes(searchLower))
        );
    }
    
    // Display filtered services (only first 3 on homepage)
    const displayServices = filteredServices.slice(0, 3);
    renderServices(displayServices, filteredServices.length);
    
    // Show notification if no results
    if (displayServices.length === 0) {
        const container = document.getElementById('servicesContainer');
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i> No services found matching your criteria.
                        <br><small>Try changing your location filter or search term.</small>
                    </div>
                </div>
            `;
        }
    }
}

// ===== LOAD SERVICES FROM BACKEND API =====
async function loadServicesFromAPI() {
    const container = document.getElementById('servicesContainer');
    if (!container) return;

    try {
        showLoading(true);
        const response = await API.services.getAll();
        showLoading(false);

        if (response.services && response.services.length > 0) {
            allServices = response.services;
            filterAndDisplayServices();
        } else {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i> No services available at the moment.
                    </div>
                </div>
            `;
        }
    } catch (error) {
        showLoading(false);
        console.error('Error loading services:', error);
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i> Failed to load services. Please refresh the page.
                </div>
            </div>
        `;
    }
}

function renderServices(services, totalCount = null) {
    const container = document.getElementById('servicesContainer');
    if (!container) return;

    if (services.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> No services available at the moment.
                </div>
            </div>
        `;
        return;
    }
    
    const icons = ['🏠', '🏢', '🧺', '🚽', '🪟', '✨', '🧼', '🔧', '💧'];
    
    let resultCountHtml = '';
    if (totalCount !== null && totalCount > 3) {
        resultCountHtml = `<div class="col-12 text-center mb-3">
            <small class="text-muted">Showing ${services.length} of ${totalCount} services</small>
        </div>`;
    }
    
    container.innerHTML = resultCountHtml + services.map((service, index) => `
        <div class="col-lg-4 col-md-6">
            <div class="service-card" data-service-id="${service.id}" data-service-name="${escapeHtml(service.name)}">
                <div class="card-img-wrap">
                    ${service.image ? 
                        `<img src="${service.image}" alt="${escapeHtml(service.name)}" onerror="this.src='image/s4.jpeg'">` : 
                        `<div class="no-image"><i class="fas fa-broom fa-3x"></i></div>`
                    }
                </div>
                <div class="card-body-inner">
                    <div class="title">${icons[index % icons.length]} ${escapeHtml(service.name)}</div>
                    <div class="description">${escapeHtml(service.description || 'Professional cleaning service tailored to your needs.')}</div>
                    <div class="service-location-badge">
                        <i class="fas fa-map-marker-alt"></i> ${escapeHtml(service.location || 'Zanzibar')}
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-success book-service-btn" 
                            data-service-id="${service.id}" 
                            data-service-name="${escapeHtml(service.name)}">
                            <i class="fas fa-calendar-check"></i> Book Now
                        </button>
                        <button class="info-btn" data-service-id="${service.id}" aria-label="More info">
                            <i class="fas fa-info-circle"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Attach event listeners to new buttons
    attachServiceEventListeners();
}

function attachServiceEventListeners() {
    // Book buttons
    document.querySelectorAll('.book-service-btn').forEach(btn => {
        btn.removeEventListener('click', handleBookButtonClick);
        btn.addEventListener('click', handleBookButtonClick);
    });

    // Info buttons (icon only)
    document.querySelectorAll('.info-btn').forEach(btn => {
        btn.removeEventListener('click', handleInfoButtonClick);
        btn.addEventListener('click', handleInfoButtonClick);
    });

    // Service cards
    document.querySelectorAll('.service-card').forEach(card => {
        card.removeEventListener('click', handleCardClick);
        card.addEventListener('click', handleCardClick);
    });
}

function handleBookButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const serviceId = this.dataset.serviceId;
    const serviceName = this.dataset.serviceName;
    handleBookClick(serviceId, serviceName);
}

async function handleInfoButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const serviceId = this.dataset.serviceId;
    await showServiceModal(serviceId);
}

function handleCardClick(e) {
    if (e.target.closest('.btn') || e.target.closest('.info-btn')) return;
    const serviceId = this.dataset.serviceId;
    if (serviceId) showServiceModal(serviceId);
}

// ===== SERVICE MODAL - NO PRICE, DURATION, OR LOCATION =====
let currentModal = null;

async function showServiceModal(serviceId) {
    // Close any existing modal
    if (currentModal) {
        currentModal.hide();
        currentModal = null;
    }

    try {
        showLoading(true);
        const response = await API.services.getById(serviceId);
        showLoading(false);

        if (!response.service) {
            showNotification('Service details not found', 'danger');
            return;
        }

        const service = response.service;
        const includes = service.includes || ['Professional service', 'Quality guaranteed', 'Eco-friendly products'];
        
        const modalBody = document.getElementById('serviceModalBody');
        if (modalBody) {
            modalBody.innerHTML = `
                <div class="text-center mb-3">
                    ${service.image ? 
                        `<img src="${service.image}" alt="${escapeHtml(service.name)}" class="img-fluid rounded-3" style="max-height: 200px; width: auto; margin: 0 auto;">` :
                        `<div class="no-image-big text-center p-4 bg-light rounded-3"><i class="fas fa-broom fa-4x text-muted"></i></div>`
                    }
                </div>
                <div class="service-detail-title text-center" style="font-size:1.5rem; font-weight:700; margin-bottom: 15px;">
                    ${escapeHtml(service.name)}
                </div>
                <p style="color:#6c757d; text-align: center; margin-bottom: 20px;">
                    ${escapeHtml(service.description || 'Professional cleaning service tailored to your needs.')}
                </p>
                <div class="mt-3">
                    <p style="font-weight:600; margin-bottom: 10px;">
                        <i class="fas fa-check-circle text-success"></i> What's Included:
                    </p>
                    <ul class="list-unstyled row g-2">
                        ${includes.map(item => `
                            <li class="col-12"><i class="fas fa-check text-success me-2"></i> ${escapeHtml(item)}</li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        const modalElement = document.getElementById('serviceModal');
        if (modalElement) {
            currentModal = new bootstrap.Modal(modalElement);
            currentModal.show();

            const bookBtn = document.getElementById('modalBookBtn');
            if (bookBtn) {
                bookBtn.onclick = () => {
                    currentModal.hide();
                    setTimeout(() => handleBookClick(service.id, service.name), 400);
                };
            }
        }
    } catch (error) {
        showLoading(false);
        console.error('Error loading service details:', error);
        showNotification('Failed to load service details', 'danger');
    }
}

// ===== FEATURE MODAL =====
const FEATURE_DETAILS = {
    ontime: {
        icon: 'fa-stopwatch',
        title: 'On-Time Service',
        subtitle: 'Punctual and reliable professionals',
        color: '#4361ee',
        description: 'We understand that your time is valuable. Our commitment to punctuality is one of the cornerstones of our service promise.',
        details: [
            'Guaranteed arrival within the scheduled time window',
            'Real-time tracking of cleaner on the way',
            'Flexible scheduling with instant confirmation',
            'Automatic reminders 24 hours before appointment',
            'Late arrival compensation guarantee'
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
            '100% non-toxic and biodegradable formulas',
            'Safe for children and pets after drying',
            'Locally sourced sustainable ingredients',
            'Certified by Zanzibar Environmental Council',
            'Recyclable packaging and refill programs'
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
            'Comprehensive liability insurance coverage',
            'Background-checked and verified cleaners',
            'Bonded employees for theft protection',
            'Continuous training and performance reviews',
            'Satisfaction guaranteed or free re-clean'
        ],
        highlight: 'TZS 10M liability coverage per incident'
    },
    support: {
        icon: 'fa-headset',
        title: '24/7 Support',
        subtitle: 'Dedicated customer care',
        color: '#27ae60',
        description: 'Our customer support team is available around the clock to assist you with any questions, concerns, or special requests.',
        details: [
            '24/7 phone and email support',
            'Live chat assistance',
            'Dedicated account manager for businesses',
            'Emergency service coordination',
            'Feedback and complaint resolution'
        ],
        highlight: 'Average response time under 2 minutes'
    }
};

function showFeatureModal(featureKey) {
    const details = FEATURE_DETAILS[featureKey];
    if (!details) return;

    const modalTitle = document.getElementById('featureModalTitle');
    const modalBody = document.getElementById('featureModalBody');
    
    if (modalTitle) {
        modalTitle.innerHTML = `
            <span class="feature-detail-icon">
                <i class="fas ${details.icon}" style="color: ${details.color}"></i>
            </span>
            <div>
                ${details.title}
                <small class="d-block text-muted" style="font-size: 0.9rem;">${details.subtitle}</small>
            </div>
        `;
    }

    if (modalBody) {
        modalBody.innerHTML = `
            <p style="font-size: 1.1rem; color: #444; margin-bottom: 1.5rem;">${details.description}</p>
            
            <div class="alert" style="background: #f0f7ff; border-left: 4px solid ${details.color}; border-radius: 10px; padding: 1rem;">
                <i class="fas fa-star" style="color: ${details.color};"></i> <strong>${details.highlight}</strong>
            </div>

            <ul class="feature-detail-list" style="list-style: none; padding: 0;">
                ${details.details.map(d => `
                    <li style="display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #eee;">
                        <i class="fas fa-check-circle" style="color: ${details.color}; width: 24px;"></i>
                        <span>${d}</span>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    const modalElement = document.getElementById('featureModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

// ===== OPEN CHATBOT =====
function openChatbot() {
    if (typeof window.toggleChat === 'function') {
        window.toggleChat();
    } else {
        showNotification('Chat support loading...', 'info');
        setTimeout(() => {
            if (typeof window.toggleChat === 'function') {
                window.toggleChat();
            }
        }, 500);
    }
}

// ===== SEARCH FUNCTIONALITY =====
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    currentSearchTerm = searchInput ? searchInput.value.trim() : '';
    filterAndDisplayServices();
    
    if (currentSearchTerm) {
        showNotification(`Searching for "${currentSearchTerm}"...`, 'info');
    } else {
        showNotification('Showing all services', 'info');
    }
}

function resetFilters() {
    const searchInput = document.getElementById('searchInput');
    const locationSelect = document.getElementById('locationSelect');
    
    if (searchInput) searchInput.value = '';
    if (locationSelect) locationSelect.value = 'all';
    
    currentSearchTerm = '';
    currentLocationFilter = 'all';
    filterAndDisplayServices();
    showNotification('Filters reset. Showing all services.', 'info');
}

// ===== NEWSLETTER SUBSCRIPTION =====
async function subscribeNewsletter(email) {
    try {
        const result = await API.contact.submit({
            full_name: 'Newsletter Subscriber',
            email: email,
            phone: '0000000000',
            service_type: 'Newsletter',
            subject: 'Newsletter Subscription',
            message: 'I would like to subscribe to the CleanSpark newsletter.',
            subscribe: true
        });
        return { success: true, message: result.message };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// ===== NOTIFICATION =====
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.alert');
    if (existing) existing.remove();

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
        if (notification.parentNode) notification.remove();
    }, 5000);
}

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

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Index page initializing...');
    
    // Update UI based on login status
    updateUIBasedOnLogin();
    
    // Load services from backend API
    await loadServicesFromAPI();
    
    // Setup search
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    if (searchBtn) searchBtn.addEventListener('click', performSearch);
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }
    
    // Setup location filter
    const locationSelect = document.getElementById('locationSelect');
    if (locationSelect) {
        locationSelect.addEventListener('change', function() {
            currentLocationFilter = this.value;
            filterAndDisplayServices();
            showNotification(`Filtering services for ${this.options[this.selectedIndex].text}`, 'info');
        });
    }
    
    // Setup newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const emailInput = document.getElementById('newsletterEmail');
            if (emailInput && emailInput.value) {
                if (validateEmail(emailInput.value)) {
                    showLoading(true);
                    const result = await subscribeNewsletter(emailInput.value);
                    showLoading(false);
                    if (result.success) {
                        showNotification('Thank you for subscribing to our newsletter!', 'success');
                        emailInput.value = '';
                    } else {
                        showNotification(result.message || 'Subscription failed. Please try again.', 'danger');
                    }
                } else {
                    showNotification('Please enter a valid email address', 'danger');
                }
            }
        });
    }
    
    // Setup feature click handlers
    const features = document.querySelectorAll('.feature-item');
    features.forEach(feature => {
        const featureType = feature.dataset.feature;
        if (featureType) {
            feature.addEventListener('click', () => showFeatureModal(featureType));
            feature.style.cursor = 'pointer';
        }
    });
    
    // Setup 24/7 support feature
    const supportFeature = document.querySelector('[data-feature="support"]');
    if (supportFeature) {
        supportFeature.addEventListener('click', (e) => {
            e.preventDefault();
            openChatbot();
        });
    }
    
    // Initialize carousel
    const carousel = document.getElementById('carouselAds');
    if (carousel && typeof bootstrap !== 'undefined') {
        new bootstrap.Carousel(carousel, { interval: 5000, wrap: true, pause: 'hover' });
    }
    
    console.log('Index page initialized successfully');
    console.log(`Total services loaded: ${allServices.length}`);
});

// Export functions for global use
window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;
window.openChatbot = openChatbot;
window.resetFilters = resetFilters;