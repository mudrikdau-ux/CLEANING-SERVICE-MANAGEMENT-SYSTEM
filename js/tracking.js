// ========== BOOKINGS DATABASE ==========
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
let bookingList = null;
const sidebarMenuItems = document.querySelectorAll(".menu li");
const hamburgerBtn = document.getElementById("hamburgerToggle");
const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
const mobileOverlay = document.getElementById("mobileOverlay");
const mainSidebar = document.getElementById("mainSidebar");
const dynamicPanel = document.getElementById("dynamicPanel");
const notificationIcon = document.getElementById("notificationIcon");
const messageIcon = document.getElementById("messageIcon");

// ========== HELPER FUNCTIONS ==========
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification-toast');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    
    let icon = 'bi-info-circle-fill';
    let borderColor = '#0d6efd';
    if (type === 'success') {
        icon = 'bi-check-circle-fill';
        borderColor = '#198754';
    } else if (type === 'danger') {
        icon = 'bi-exclamation-triangle-fill';
        borderColor = '#dc3545';
    } else if (type === 'warning') {
        icon = 'bi-exclamation-triangle-fill';
        borderColor = '#ffc107';
    }
    
    notification.style.borderLeftColor = borderColor;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="bi ${icon}" style="color: ${borderColor};"></i>
            <span>${escapeHtml(message)}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification && notification.remove) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

function closeSidebar() {
    if (window.innerWidth <= 992) {
        mainSidebar.classList.remove('mobile-open');
        mobileOverlay.classList.remove('active');
    }
}

function openSidebar() {
    if (window.innerWidth <= 992) {
        mainSidebar.classList.add('mobile-open');
        mobileOverlay.classList.add('active');
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ========== LOAD BOOKINGS FUNCTION ==========
function loadBookings(type) {
    bookingList = document.getElementById("bookingList");
    if (!bookingList) return;
    
    let filtered = bookings.filter(b => b.status === type);
    
    if (filtered.length === 0) {
        bookingList.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-inbox"></i>
                <h5 class="fw-semibold">No ${type} jobs found</h5>
                <p class="text-muted">You're all caught up — nothing here for now.</p>
                <button class="btn btn-outline-primary mt-3 rounded-pill px-4 explore-services-btn">
                    <i class="bi bi-plus-circle"></i> Book New Service
                </button>
            </div>
        `;
        const exploreBtn = document.querySelector(".explore-services-btn");
        if (exploreBtn) {
            exploreBtn.addEventListener("click", () => showNotification("📅 Booking service dialog would open here", "success"));
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
    
    document.querySelectorAll(".pay-now-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const bookingId = btn.getAttribute("data-id");
            showNotification(`Processing payment for booking #${bookingId}. This would open payment gateway.`, "success");
        });
    });
}

// ========== MENU ITEM HANDLERS ==========
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
            const newTabs = document.querySelectorAll(".tab");
            if (newTabs.length > 0) {
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
                        <button class="btn btn-sm btn-outline-primary rounded-pill accept-quote-btn">Accept Quote</button>
                    </div>
                    <div class="booking-card">
                        <div class="d-flex justify-content-between align-items-center">
                            <div><i class="bi bi-file-pdf-fill text-danger fs-3 me-2"></i> <strong>Carpet Sanitizing</strong></div>
                            <span class="badge bg-success">Approved</span>
                        </div>
                        <p class="mt-2">Estimated: $97 · Valid until 2026-04-05</p>
                        <button class="btn btn-sm btn-outline-success rounded-pill proceed-quote-btn">Proceed</button>
                    </div>
                </div>
            `;
            dynamicPanel.innerHTML = content;
            setTimeout(() => {
                document.querySelectorAll('.accept-quote-btn, .proceed-quote-btn').forEach(btn => {
                    btn.addEventListener('click', () => showNotification('Quote accepted! Our team will contact you shortly.', 'success'));
                });
            }, 100);
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
                        <div class="mb-2"><i class="bi bi-house-door me-2"></i> Full Villa Cleaning · $340 (Due: Mar 30, 2026)</div>
                        <div class="mb-3"><i class="bi bi-couch me-2"></i> Upholstery Cleaning · $98 (Due: Mar 28, 2026)</div>
                        <button class="btn btn-primary rounded-pill px-4 pay-all-btn"><i class="bi bi-credit-card"></i> Pay All Now</button>
                    </div>
                </div>
            `;
            dynamicPanel.innerHTML = content;
            setTimeout(() => {
                const payAllBtn = document.querySelector('.pay-all-btn');
                if (payAllBtn) {
                    payAllBtn.addEventListener('click', () => showNotification('Redirecting to payment gateway for total $438.00', 'success'));
                }
            }, 100);
            break;
        
        case "support":
            title = "Support";
            content = `
                <div class="section-header">
                    <h1 class="page-title"><i class="bi bi-headset text-primary me-2"></i>Support Center</h1>
                </div>
                <div class="booking-grid">
                    <div class="booking-card">
                        <h5 class="fw-bold mb-3"><i class="bi bi-chat-dots me-2"></i>Live Chat Support</h5>
                        <p class="text-muted">Available Monday - Friday, 8AM - 6PM (EAT)</p>
                        <button class="btn btn-primary rounded-pill px-4 start-chat-btn"><i class="bi bi-chat"></i> Start Live Chat</button>
                    </div>
                    <div class="booking-card">
                        <h5 class="fw-bold mb-3"><i class="bi bi-telephone me-2"></i>Call Us</h5>
                        <p class="mb-1"><strong>Hotline:</strong> +255 800 111 222</p>
                        <p><strong>Emergency:</strong> +255 777 123 456</p>
                    </div>
                    <div class="booking-card">
                        <h5 class="fw-bold mb-3"><i class="bi bi-envelope me-2"></i>Email Support</h5>
                        <p class="mb-1">General: support@csms.co.tz</p>
                        <p>Billing: billing@csms.co.tz</p>
                    </div>
                </div>
            `;
            dynamicPanel.innerHTML = content;
            setTimeout(() => {
                const startChatBtn = document.querySelector('.start-chat-btn');
                if (startChatBtn) {
                    startChatBtn.addEventListener('click', () => showNotification('Connecting to support agent...', 'info'));
                }
            }, 100);
            break;
            
        case "settings":
            title = "Settings";
            content = `
                <div class="section-header">
                    <h1 class="page-title"><i class="bi bi-sliders2 text-primary me-2"></i>Settings</h1>
                </div>
                <div class="settings-card">
                    <h5 class="fw-bold mb-4">Notification Preferences</h5>
                    <div class="form-check form-switch mb-3">
                        <input class="form-check-input" type="checkbox" id="emailNotif" checked>
                        <label class="form-check-label fw-medium" for="emailNotif">Email Notifications</label>
                        <p class="small text-muted mb-0">Receive booking confirmations and updates via email</p>
                    </div>
                    <div class="form-check form-switch mb-3">
                        <input class="form-check-input" type="checkbox" id="smsNotif">
                        <label class="form-check-label fw-medium" for="smsNotif">SMS Alerts</label>
                        <p class="small text-muted mb-0">Get instant SMS notifications for booking status</p>
                    </div>
                    <div class="form-check form-switch mb-4">
                        <input class="form-check-input" type="checkbox" id="pushNotif" checked>
                        <label class="form-check-label fw-medium" for="pushNotif">Push Notifications</label>
                        <p class="small text-muted mb-0">Receive browser notifications for updates</p>
                    </div>
                    <hr>
                    <h5 class="fw-bold mb-3">Language & Region</h5>
                    <select class="form-select mb-4" style="max-width: 300px;">
                        <option>English (UK)</option>
                        <option>Swahili</option>
                        <option>Arabic</option>
                    </select>
                    <button class="btn btn-primary rounded-pill px-4 save-settings-btn">Save Settings</button>
                </div>
            `;
            dynamicPanel.innerHTML = content;
            setTimeout(() => {
                const saveBtn = document.querySelector('.save-settings-btn');
                if (saveBtn) {
                    saveBtn.addEventListener('click', () => showNotification('Settings saved successfully!', 'success'));
                }
            }, 100);
            break;
            
        case "feedback":
            title = "Feedback";
            content = `
                <div class="section-header">
                    <h1 class="page-title"><i class="bi bi-chat-dots text-primary me-2"></i>Feedback</h1>
                </div>
                <div class="settings-card">
                    <p class="text-muted mb-4">We value your feedback! Help us improve our services.</p>
                    <div class="mb-3">
                        <label class="form-label fw-medium">Rating</label>
                        <div class="d-flex gap-2">
                            <i class="bi bi-star fs-3 text-warning star-rating" data-rating="1"></i>
                            <i class="bi bi-star fs-3 text-warning star-rating" data-rating="2"></i>
                            <i class="bi bi-star fs-3 text-warning star-rating" data-rating="3"></i>
                            <i class="bi bi-star fs-3 text-warning star-rating" data-rating="4"></i>
                            <i class="bi bi-star fs-3 text-warning star-rating" data-rating="5"></i>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-medium">Your Comments</label>
                        <textarea class="form-control" rows="4" placeholder="Share your experience with CSMS..."></textarea>
                    </div>
                    <button class="btn btn-primary rounded-pill px-4 submit-feedback-btn">Submit Feedback</button>
                </div>
            `;
            dynamicPanel.innerHTML = content;
            setTimeout(() => {
                const stars = document.querySelectorAll('.star-rating');
                let selectedRating = 0;
                stars.forEach(star => {
                    star.addEventListener('click', function() {
                        const rating = parseInt(this.getAttribute('data-rating'));
                        selectedRating = rating;
                        stars.forEach((s, index) => {
                            if (index < rating) {
                                s.classList.remove('bi-star');
                                s.classList.add('bi-star-fill');
                            } else {
                                s.classList.remove('bi-star-fill');
                                s.classList.add('bi-star');
                            }
                        });
                    });
                });
                const submitBtn = document.querySelector('.submit-feedback-btn');
                if (submitBtn) {
                    submitBtn.addEventListener('click', () => {
                        if (selectedRating > 0) {
                            showNotification(`Thank you for your ${selectedRating}-star feedback!`, 'success');
                        } else {
                            showNotification('Please select a rating before submitting', 'warning');
                        }
                    });
                }
            }, 100);
            break;
            
        case "terms":
            title = "Terms & Conditions";
            content = `
                <div class="section-header">
                    <h1 class="page-title"><i class="bi bi-file-earmark-text text-primary me-2"></i>Terms & Conditions</h1>
                </div>
                <div class="settings-card">
                    <h5 class="fw-bold mb-3">Service Agreement</h5>
                    <p class="text-muted">By using CSMS services, you agree to our service policies, cancellation terms, and privacy policy. Last updated: March 2026.</p>
                    <hr>
                    <h6 class="fw-bold">Key Terms:</h6>
                    <ul class="mt-2">
                        <li><strong>Cancellation Policy:</strong> Free cancellation up to 24 hours before service. Late cancellations may incur a 50% fee.</li>
                        <li><strong>Quality Guarantee:</strong> 100% satisfaction guaranteed or we'll re-clean for free within 48 hours.</li>
                        <li><strong>Payment Terms:</strong> Payments are due upon completion of service unless otherwise agreed.</li>
                        <li><strong>Privacy:</strong> Your data is protected according to our privacy policy.</li>
                        <li><strong>Liability:</strong> CSMS is fully insured for all services provided.</li>
                    </ul>
                    <button class="btn btn-outline-primary rounded-pill px-4 mt-3 agree-terms-btn">I Agree to Terms</button>
                </div>
            `;
            dynamicPanel.innerHTML = content;
            setTimeout(() => {
                const agreeBtn = document.querySelector('.agree-terms-btn');
                if (agreeBtn) {
                    agreeBtn.addEventListener('click', () => showNotification('Thank you for agreeing to our terms!', 'success'));
                }
            }, 100);
            break;
            
        case "delete":
            title = "Delete Account";
            content = `
                <div class="section-header">
                    <h1 class="page-title text-danger"><i class="bi bi-trash3 text-danger me-2"></i>Delete Account</h1>
                </div>
                <div class="settings-card border border-danger">
                    <div class="text-center p-4">
                        <i class="bi bi-exclamation-triangle-fill text-danger" style="font-size: 48px;"></i>
                        <h5 class="fw-bold text-danger mt-3">Warning: This action is permanent!</h5>
                        <p class="text-muted mt-3">Deleting your account will remove all your data, booking history, and saved information. This action cannot be undone.</p>
                        <div class="form-check mb-3">
                            <input class="form-check-input" type="checkbox" id="confirmDelete">
                            <label class="form-check-label" for="confirmDelete">
                                I understand that this action is permanent and irreversible
                            </label>
                        </div>
                        <button class="btn btn-danger rounded-pill px-4 confirm-delete-btn" disabled>Request Account Deletion</button>
                        <p class="small text-muted mt-3">Or contact support to discuss account options</p>
                    </div>
                </div>
            `;
            dynamicPanel.innerHTML = content;
            setTimeout(() => {
                const confirmCheckbox = document.getElementById('confirmDelete');
                const deleteBtn = document.querySelector('.confirm-delete-btn');
                if (confirmCheckbox && deleteBtn) {
                    confirmCheckbox.addEventListener('change', function() {
                        deleteBtn.disabled = !this.checked;
                    });
                    deleteBtn.addEventListener('click', () => {
                        showNotification('Account deletion request submitted. You will receive a confirmation email.', 'warning');
                    });
                }
            }, 100);
            break;
            
        case "logout":
            showNotification("You have been logged out successfully. Redirecting to login page...", "success");
            dynamicPanel.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-box-arrow-right" style="font-size: 64px;"></i>
                    <h4 class="mt-3">Logged Out</h4>
                    <p class="text-muted">You have been successfully logged out.</p>
                    <button class="btn btn-primary rounded-pill px-4 login-redirect-btn">Login Again</button>
                </div>
            `;
            setTimeout(() => {
                const loginBtn = document.querySelector('.login-redirect-btn');
                if (loginBtn) {
                    loginBtn.addEventListener('click', () => {
                        showNotification('Redirecting to login page...', 'info');
                        setTimeout(() => {
                            renderPanel('bookings');
                            const bookingsMenuItem = document.querySelector('.menu li[data-menu="bookings"]');
                            if (bookingsMenuItem) {
                                sidebarMenuItems.forEach(li => li.classList.remove('active'));
                                bookingsMenuItem.classList.add('active');
                            }
                        }, 1500);
                    });
                }
            }, 100);
            break;
            
        default:
            dynamicPanel.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-grid"></i>
                    <h4>CSMS Dashboard</h4>
                    <p>Select an option from the menu</p>
                </div>
            `;
    }
    
    if (menuType !== "bookings" && menuType !== "logout") {
        showNotification(`${title} section loaded`, "success");
    }
    
    closeSidebar();
}

// ========== SIDEBAR MENU CLICK HANDLERS ==========
sidebarMenuItems.forEach(item => {
    item.addEventListener("click", function() {
        const menuType = this.getAttribute("data-menu");
        sidebarMenuItems.forEach(li => li.classList.remove("active"));
        this.classList.add("active");
        renderPanel(menuType);
    });
});

// ========== FOOTER NEWSLETTER FORM HANDLING ==========
function initFooterNewsletter() {
    const newsletterForm = document.querySelector('.footer .newsletter-form');
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
}

// ========== ADD NOTIFICATION STYLES ==========
function addNotificationStyles() {
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        .notification-toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            min-width: 280px;
            max-width: 350px;
            border-left: 4px solid #4bb543;
            animation: slideInRight 0.3s ease-out;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 15px 20px;
        }
        
        .notification-content i {
            font-size: 1.2rem;
        }
        
        .notification-content span {
            flex: 1;
            font-size: 0.9rem;
            color: #1a202c;
        }
        
        .notification-close {
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            color: #999;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .notification-close:hover {
            color: #333;
        }
        
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
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(notificationStyles);
}

// ========== HAMBURGER MENU TOGGLE ==========
if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openSidebar();
    });
}

if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener("click", closeSidebar);
}

if (mobileOverlay) {
    mobileOverlay.addEventListener("click", closeSidebar);
}

window.addEventListener("resize", () => {
    if (window.innerWidth > 992) {
        closeSidebar();
    }
});

if (notificationIcon) {
    notificationIcon.addEventListener('click', () => showNotification('You have 3 new notifications', 'info'));
}
if (messageIcon) {
    messageIcon.addEventListener('click', () => showNotification('No new messages', 'info'));
}

// ========== INITIALIZE ==========
document.addEventListener("DOMContentLoaded", () => {
    addNotificationStyles();
    renderPanel("bookings");
    initFooterNewsletter();
    
    const bookingsMenuItem = document.querySelector('.menu li[data-menu="bookings"]');
    if (bookingsMenuItem) {
        sidebarMenuItems.forEach(li => li.classList.remove('active'));
        bookingsMenuItem.classList.add('active');
    }
    
    console.log('Tracking page fully loaded and initialized');
});

// ========== EXPORT FUNCTIONS FOR GLOBAL USE ==========
window.showNotification = showNotification;
window.closeSidebar = closeSidebar;
window.openSidebar = openSidebar;