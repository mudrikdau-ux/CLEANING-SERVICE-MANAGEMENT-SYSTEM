// ========== BOOKINGS DATABASE (Enhanced with rich data) ==========
const bookings = [
    { id: 101, status: "upcoming", service: "Premium Home Deep Cleaning", date: "2026-04-05", price: "$89", address: "Stone Town, Unguja" },
    { id: 102, status: "upcoming", service: "AC Maintenance & Filter Replacement", date: "2026-04-12", price: "$120", address: "Mbweni Residence" },
    { id: 103, status: "delivered", service: "Office Carpet Steam Cleaning", date: "2026-03-18", price: "$210", address: "Vikokotoni Business Hub" },
    { id: 104, status: "delivered", service: "Kitchen Sanitization Service", date: "2026-03-02", price: "$75", address: "Shangani District" },
    { id: 105, status: "cancelled", service: "Balcony Pressure Washing", date: "2026-02-28", price: "$55", address: "Kiwengwa Beach Area" },
    { id: 106, status: "unpaid", service: "Full Villa Cleaning (4 Rooms)", date: "2026-03-22", price: "$340", address: "Fumba Town", unpaidAmount: "$340" },
    { id: 107, status: "unpaid", service: "Upholstery & Mattress Deep Clean", date: "2026-03-20", price: "$98", address: "Michenzani" }
];

// ========== DOM ELEMENTS ==========
const bookingList = document.getElementById("bookingList");
const tabs = document.querySelectorAll(".tab");
const sidebarMenuItems = document.querySelectorAll(".menu li");
const hamburgerBtn = document.getElementById("hamburgerToggle");
const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
const mobileOverlay = document.getElementById("mobileOverlay");
const mainSidebar = document.getElementById("mainSidebar");
const dynamicPanel = document.getElementById("dynamicPanel");

// ========== HELPER FUNCTIONS ==========
// Escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Show professional toast notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'position-fixed bottom-0 end-0 p-3 m-3 bg-white rounded-4 shadow-lg border-start border-4';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '280px';
    notification.style.maxWidth = '350px';
    notification.style.animation = 'slideIn 0.3s ease-out';
    
    let borderColor = '#0d6efd';
    let icon = 'bi-info-circle-fill';
    if (type === 'success') {
        borderColor = '#198754';
        icon = 'bi-check-circle-fill';
    } else if (type === 'danger') {
        borderColor = '#dc3545';
        icon = 'bi-exclamation-triangle-fill';
    }
    
    notification.style.borderLeftColor = borderColor;
    notification.innerHTML = `
        <div class="d-flex align-items-center gap-2">
            <i class="bi ${icon} text-${type === 'success' ? 'success' : type === 'danger' ? 'danger' : 'primary'}" style="font-size: 1.2rem;"></i>
            <span class="fw-medium flex-grow-1">${escapeHtml(message)}</span>
            <button class="btn-close btn-sm" onclick="this.closest('div').remove()"></button>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        if (notification && notification.remove) notification.remove();
    }, 3000);
}

// Close sidebar function
function closeSidebar() {
    if (window.innerWidth <= 992) {
        mainSidebar.classList.remove('mobile-open');
        mobileOverlay.classList.remove('active');
    }
}

// Open sidebar function
function openSidebar() {
    if (window.innerWidth <= 992) {
        mainSidebar.classList.add('mobile-open');
        mobileOverlay.classList.add('active');
    }
}

// ========== LOAD BOOKINGS FUNCTION ==========
function loadBookings(type) {
    if (!bookingList) return;
    
    let filtered = bookings.filter(b => b.status === type);
    
    if (filtered.length === 0) {
        bookingList.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-inbox"></i>
                <h5 class="fw-semibold">No ${type} jobs found</h5>
                <p class="text-muted">You're all caught up — nothing here for now.</p>
                <button class="btn btn-outline-primary mt-3 rounded-pill px-4" id="exploreServicesBtn">
                    <i class="bi bi-plus-circle"></i> Book New Service
                </button>
            </div>
        `;
        const exploreBtn = document.getElementById("exploreServicesBtn");
        if (exploreBtn) {
            exploreBtn.addEventListener("click", () => showNotification("📅 Booking service dialog (demo feature)", "success"));
        }
        return;
    }
    
    let html = '<div class="booking-grid">';
    filtered.forEach(booking => {
        let badgeClass = "";
        let badgeText = booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
        
        if (booking.status === "upcoming") badgeClass = "badge-upcoming";
        else if (booking.status === "delivered") badgeClass = "badge-delivered";
        else if (booking.status === "cancelled") badgeClass = "badge-cancelled";
        else if (booking.status === "unpaid") badgeClass = "badge-unpaid";
        
        // Icon based on service type
        let iconName = "bi-brightness-alt-high";
        if (booking.service.includes("Clean")) iconName = "bi-droplet";
        if (booking.service.includes("AC")) iconName = "bi-snow2";
        if (booking.service.includes("Carpet")) iconName = "bi-grid-3x3-gap-fill";
        if (booking.service.includes("Kitchen")) iconName = "bi-egg-fried";
        if (booking.service.includes("Villa")) iconName = "bi-house-heart";
        if (booking.service.includes("Upholstery")) iconName = "bi-couch";
        
        html += `
            <div class="booking-card">
                <div class="d-flex flex-wrap justify-content-between align-items-start">
                    <div class="d-flex gap-3">
                        <div class="service-icon"><i class="bi ${iconName} fs-4"></i></div>
                        <div>
                            <h5 class="fw-bold mb-2">${escapeHtml(booking.service)}</h5>
                            <div class="d-flex flex-wrap gap-3 mt-1">
                                <span><i class="bi bi-calendar3 me-1 text-secondary"></i> ${booking.date}</span>
                                <span><i class="bi bi-pin-map-fill me-1 text-secondary"></i> ${escapeHtml(booking.address)}</span>
                                <span><i class="bi bi-cash-stack me-1 text-secondary"></i> ${booking.price}</span>
                            </div>
                        </div>
                    </div>
                    <div class="mt-2 mt-sm-0">
                        <span class="booking-badge ${badgeClass}">${badgeText.toUpperCase()}</span>
                        ${booking.status === "unpaid" ? `<button class="btn btn-sm btn-danger ms-2 rounded-pill pay-now-btn" data-id="${booking.id}"><i class="bi bi-credit-card"></i> Pay Now</button>` : ''}
                    </div>
                </div>
                <hr>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted-custom"><i class="bi bi-chat-left-text"></i> Reference: CSMS-${booking.id}</small>
                    ${booking.status === "upcoming" ? `<span class="badge bg-light text-dark border"><i class="bi bi-bell"></i> 2 days reminder</span>` : ''}
                </div>
            </div>
        `;
    });
    html += '</div>';
    bookingList.innerHTML = html;
    
    // Attach pay now button events
    document.querySelectorAll(".pay-now-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const bookingId = btn.getAttribute("data-id");
            showNotification(`Processing payment for booking #${bookingId}`, "success");
        });
    });
}

// ========== TAB HANDLERS ==========
function initTabs() {
    if (!tabs.length) return;
    
    // Get active tab or default to upcoming
    const activeTab = document.querySelector(".tab.active");
    const defaultType = activeTab ? activeTab.getAttribute("data-type") : "upcoming";
    loadBookings(defaultType);
    
    tabs.forEach(tab => {
        tab.addEventListener("click", function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove("active"));
            // Add active class to clicked tab
            this.classList.add("active");
            // Load bookings based on type
            const type = this.getAttribute("data-type");
            loadBookings(type);
        });
    });
}

// ========== MENU ITEM HANDLERS (ALL MENUS WORK) ==========
function renderPanel(menuType) {
    let title = "";
    let content = "";
    
    switch(menuType) {
        case "bookings":
            title = "My Bookings";
            content = `
                <div class="section-header">
                    <h1 class="page-title"><i class="bi bi-journal-bookmark-fill text-primary me-2"></i>My Bookings</h1>
                </div>
                <div class="tabs" id="filterTabs">
                    <button class="tab active" data-type="upcoming"><i class="bi bi-calendar-week"></i> Upcoming</button>
                    <button class="tab" data-type="delivered"><i class="bi bi-truck"></i> Delivered</button>
                    <button class="tab" data-type="cancelled"><i class="bi bi-x-circle"></i> Cancelled</button>
                    <button class="tab" data-type="unpaid"><i class="bi bi-exclamation-triangle"></i> Unpaid</button>
                </div>
                <div id="bookingList" class="booking-box"></div>
            `;
            dynamicPanel.innerHTML = content;
            // Re-initialize tabs and booking list
            const newTabs = document.querySelectorAll(".tab");
            const newBookingList = document.getElementById("bookingList");
            if (newTabs.length > 0 && newBookingList) {
                window.currentBookingList = newBookingList;
                const activeType = document.querySelector(".tab.active")?.getAttribute("data-type") || "upcoming";
                loadBookings(activeType);
                newTabs.forEach(tab => {
                    tab.addEventListener("click", function() {
                        newTabs.forEach(t => t.classList.remove("active"));
                        this.classList.add("active");
                        const type = this.getAttribute("data-type");
                        loadBookings(type);
                    });
                });
            }
            break;
            
        case "quotes":
            title = "My Quotes";
            content = `
                <div class="section-header">
                    <h1 class="page-title"><i class="bi bi-file-text-fill text-primary me-2"></i>My Quotes</h1>
                </div>
                <div class="booking-grid">
                    <div class="booking-card">
                        <div class="d-flex justify-content-between align-items-center">
                            <div><i class="bi bi-file-pdf-fill text-danger fs-3 me-2"></i> <strong>Office Deep Cleaning</strong></div>
                            <span class="badge bg-warning text-dark">Pending</span>
                        </div>
                        <p class="mt-2">Estimated: $189 · Valid until 2026-04-10</p>
                        <button class="btn btn-sm btn-outline-primary rounded-pill">Accept Quote</button>
                    </div>
                    <div class="booking-card">
                        <div class="d-flex justify-content-between align-items-center">
                            <div><i class="bi bi-file-pdf-fill text-danger fs-3 me-2"></i> <strong>Carpet Sanitizing</strong></div>
                            <span class="badge bg-success">Approved</span>
                        </div>
                        <p class="mt-2">Estimated: $97 · Valid until 2026-04-05</p>
                        <button class="btn btn-sm btn-outline-success rounded-pill">Proceed</button>
                    </div>
                </div>
            `;
            dynamicPanel.innerHTML = content;
            break;
            
        case "profile":
            title = "My Profile";
            content = `
                <div class="section-header">
                    <h1 class="page-title"><i class="bi bi-person-circle text-primary me-2"></i>My Profile</h1>
                </div>
                <div class="bg-white rounded-4 p-4 shadow-sm">
                    <div class="d-flex gap-4 align-items-center flex-wrap">
                        <div class="avatar" style="width:90px;height:90px;font-size:42px;background:linear-gradient(135deg,#0d6efd,#0a58ca);">A</div>
                        <div>
                            <h3 class="fw-bold">Aly Hassan</h3>
                            <p><i class="bi bi-envelope"></i> aly@csms.co.tz</p>
                            <p><i class="bi bi-phone"></i> +255 777 123 456</p>
                            <button class="btn btn-outline-primary rounded-pill px-4">Edit Profile</button>
                        </div>
                    </div>
                </div>
            `;
            dynamicPanel.innerHTML = content;
            break;
            
        case "payments":
            title = "Outstanding Payments";
            content = `
                <div class="section-header">
                    <h1 class="page-title"><i class="bi bi-credit-card-2-front text-primary me-2"></i>Outstanding Payments</h1>
                </div>
                <div class="booking-grid">
                    <div class="booking-card">
                        <div class="d-flex justify-content-between align-items-center">
                            <span><strong>Total Outstanding</strong></span>
                            <span class="fs-4 fw-bold text-danger">$438.00</span>
                        </div>
                        <hr>
                        <div><i class="bi bi-house-door"></i> Full Villa Cleaning · $340 (Due: Mar 30)</div>
                        <div class="mt-2"><i class="bi bi-couch"></i> Upholstery Cleaning · $98 (Due: Mar 28)</div>
                        <button class="btn btn-primary mt-3 rounded-pill">Pay All Now</button>
                    </div>
                </div>
            `;
            dynamicPanel.innerHTML = content;
            break;
            
        case "locations":
            title = "Saved Locations";
            content = `<div class="bg-white rounded-4 p-4"><i class="bi bi-geo-alt-fill text-primary"></i> <strong>Home:</strong> Stone Town, Unguja<br><i class="bi bi-briefcase-fill mt-2"></i> <strong>Office:</strong> Vikokotoni Complex<br><button class="btn btn-outline-secondary mt-3 rounded-pill">+ Add New Location</button></div>`;
            dynamicPanel.innerHTML = `<h1 class="page-title"><i class="bi bi-geo-alt"></i> ${title}</h1>${content}`;
            break;
            
        case "methods":
            title = "Payment Methods";
            content = `<div class="bg-white rounded-4 p-4"><i class="bi bi-credit-card"></i> Visa ending in 1234<br><i class="bi bi-bank2 mt-2"></i> Mobile Money (Airtel Money)<br><button class="btn btn-outline-primary mt-3 rounded-pill">Add New Method</button></div>`;
            dynamicPanel.innerHTML = `<h1 class="page-title"><i class="bi bi-wallet2"></i> ${title}</h1>${content}`;
            break;
            
        case "support":
            title = "Support";
            content = `<div class="bg-white rounded-4 p-4"><i class="bi bi-headset"></i> Live Chat: 8AM - 6PM<br>📞 Hotline: +255 800 111 222<br>✉️ Email: support@csms.co.tz<br><button class="btn btn-primary mt-3 rounded-pill">Start Chat</button></div>`;
            dynamicPanel.innerHTML = `<h1 class="page-title"><i class="bi bi-headset"></i> ${title}</h1>${content}`;
            break;
            
        case "settings":
            title = "Settings";
            content = `<div class="bg-white rounded-4 p-4"><div class="form-check form-switch"><input class="form-check-input" type="checkbox" checked> Email Notifications</div><div class="form-check form-switch mt-3"><input class="form-check-input" type="checkbox"> SMS Alerts</div><div class="form-check form-switch mt-3"><input class="form-check-input" type="checkbox"> Push Notifications</div></div>`;
            dynamicPanel.innerHTML = `<h1 class="page-title"><i class="bi bi-sliders2"></i> ${title}</h1>${content}`;
            break;
            
        case "feedback":
            title = "Feedback";
            content = `<div class="bg-white rounded-4 p-4"><textarea class="form-control mb-3" rows="4" placeholder="Share your experience with CSMS..."></textarea><button class="btn btn-primary rounded-pill px-4">Submit Feedback</button></div>`;
            dynamicPanel.innerHTML = `<h1 class="page-title"><i class="bi bi-chat-dots"></i> ${title}</h1>${content}`;
            break;
            
        case "terms":
            title = "Terms & Conditions";
            content = `<div class="bg-white rounded-4 p-4"><p class="text-muted">By using CSMS services, you agree to our service policies, cancellation terms, and privacy policy. Updated March 2026.</p><ul><li>24h cancellation policy</li><li>Quality guarantee</li><li>Secure payments</li></ul></div>`;
            dynamicPanel.innerHTML = `<h1 class="page-title"><i class="bi bi-file-earmark-text"></i> ${title}</h1>${content}`;
            break;
            
        case "delete":
            title = "Delete Account";
            content = `<div class="bg-white rounded-4 p-4 border border-danger"><p class="text-danger"><i class="bi bi-exclamation-triangle-fill"></i> Warning: This action is permanent.</p><p>Request account deletion by contacting support or click below.</p><button class="btn btn-outline-danger rounded-pill">Request Deletion</button></div>`;
            dynamicPanel.innerHTML = `<h1 class="page-title text-danger"><i class="bi bi-trash3"></i> ${title}</h1>${content}`;
            break;
            
        case "logout":
            showNotification("You have been logged out successfully", "success");
            dynamicPanel.innerHTML = `<div class="empty-state"><i class="bi bi-box-arrow-right"></i><h4>Logged Out</h4><p>Redirecting to login page...</p></div>`;
            break;
            
        default:
            dynamicPanel.innerHTML = `<div class="empty-state"><i class="bi bi-grid"></i><h4>CSMS Dashboard</h4></div>`;
    }
    
    if (menuType !== "bookings" && menuType !== "logout") {
        showNotification(`${title} section loaded`, "success");
    }
    
    // Close sidebar after menu click on mobile
    closeSidebar();
}

// ========== SIDEBAR MENU CLICK HANDLERS ==========
sidebarMenuItems.forEach(item => {
    item.addEventListener("click", function() {
        const menuType = this.getAttribute("data-menu");
        
        // Update active class
        sidebarMenuItems.forEach(li => li.classList.remove("active"));
        this.classList.add("active");
        
        // Render selected panel
        renderPanel(menuType);
    });
});

// ========== HAMBURGER MENU TOGGLE ==========
if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openSidebar();
    });
}

// Close button inside sidebar (for mobile)
if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener("click", closeSidebar);
}

// Close sidebar when clicking overlay
if (mobileOverlay) {
    mobileOverlay.addEventListener("click", closeSidebar);
}

// Handle window resize - auto close sidebar on resize to desktop
window.addEventListener("resize", () => {
    if (window.innerWidth > 992) {
        closeSidebar();
    }
});

// ========== INITIALIZE ==========
document.addEventListener("DOMContentLoaded", () => {
    // Initialize with bookings view
    renderPanel("bookings");
    // Ensure bookings menu is active
    const bookingsMenuItem = document.querySelector('.menu li[data-menu="bookings"]');
    if (bookingsMenuItem) {
        bookingsMenuItem.classList.add("active");
    }
});