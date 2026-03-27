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

// ===== SEARCH =====
function performSearch() {
    const input = document.querySelector('.search-input');
    const term = input ? input.value.trim() : '';
    if (term) {
        showNotification('Searching for: ' + term, 'info');
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

    // Search
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-input');
    if (searchBtn) searchBtn.addEventListener('click', performSearch);
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
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
                    showNotification('Thank you for subscribing to our newsletter!', 'success');
                    emailInput.value = '';
                } else {
                    showNotification('Please enter a valid email address', 'danger');
                }
            }
        });
    }

    // Carousel
    const carousel = document.getElementById('carouselAds');
    if (carousel && typeof bootstrap !== 'undefined') {
        new bootstrap.Carousel(carousel, { interval: 5000, wrap: true, pause: 'hover' });
    }

    // Tooltips
    if (typeof bootstrap !== 'undefined') {
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
            new bootstrap.Tooltip(el);
        });
    }
});