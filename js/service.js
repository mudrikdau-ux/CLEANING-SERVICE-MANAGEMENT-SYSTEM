/**
 * CleanSpark Services Page - Fully Integrated with Backend API
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
    
    if (currentLocationFilter !== 'all') {
        filteredServices = filteredServices.filter(service => 
            service.location === currentLocationFilter
        );
    }
    
    if (currentSearchTerm) {
        const searchLower = currentSearchTerm.toLowerCase();
        filteredServices = filteredServices.filter(service => 
            service.name.toLowerCase().includes(searchLower) ||
            (service.description && service.description.toLowerCase().includes(searchLower))
        );
    }
    
    renderServices(filteredServices);
    
    if (filteredServices.length === 0) {
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

function renderServices(services) {
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
    
    container.innerHTML = services.map((service, index) => `
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

    attachServiceEventListeners();
}

function attachServiceEventListeners() {
    document.querySelectorAll('.book-service-btn').forEach(btn => {
        btn.removeEventListener('click', handleBookButtonClick);
        btn.addEventListener('click', handleBookButtonClick);
    });

    document.querySelectorAll('.info-btn').forEach(btn => {
        btn.removeEventListener('click', handleInfoButtonClick);
        btn.addEventListener('click', handleInfoButtonClick);
    });

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

// ===== SERVICE MODAL (EXACT SAME AS INDEX PAGE) =====
let currentModal = null;

async function showServiceModal(serviceId) {
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

function resetSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value === '') {
        currentSearchTerm = '';
        filterAndDisplayServices();
    }
}

function handleLocationChange() {
    const locationSelect = document.getElementById('locationSelect');
    currentLocationFilter = locationSelect ? locationSelect.value : 'all';
    filterAndDisplayServices();
    const selectedText = locationSelect?.options[locationSelect.selectedIndex]?.text || 'All Islands';
    showNotification(`Filtering services for ${selectedText}`, 'info');
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
    console.log('Services page initializing...');
    
    updateUIBasedOnLogin();
    
    await loadServicesFromAPI();
    
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    if (searchBtn) searchBtn.addEventListener('click', performSearch);
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
        searchInput.addEventListener('input', resetSearch);
    }
    
    const locationSelect = document.getElementById('locationSelect');
    if (locationSelect) {
        locationSelect.addEventListener('change', handleLocationChange);
    }
    
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
                        showNotification('Thank you for subscribing!', 'success');
                        emailInput.value = '';
                    } else {
                        showNotification(result.message || 'Subscription failed', 'danger');
                    }
                } else {
                    showNotification('Please enter a valid email address', 'danger');
                }
            }
        });
    }
    
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', openSidebar);
    }
    
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }
    
    console.log('Services page initialized successfully');
    console.log(`Total services loaded: ${allServices.length}`);
});

window.openSidebar = openSidebar;
window.closeSidebar = closeSidebar;