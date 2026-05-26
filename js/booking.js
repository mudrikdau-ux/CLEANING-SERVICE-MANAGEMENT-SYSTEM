// ========== ENHANCED BOOKING WITH REAL MAP, PROFESSIONAL VALIDATION & REALISTIC PAYMENT ==========

(function() {
    'use strict';
    
    // Check login
    function isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }
    
    if (!isLoggedIn()) {
        localStorage.setItem('pendingBooking', JSON.stringify({ attempted: true, timestamp: new Date().toISOString() }));
        showValidationToast('warning', 'Login Required', 'Please login to continue with booking. Redirecting to login page...');
        setTimeout(() => { window.location.href = 'login.html'; }, 2000);
        return;
    }
    
    // DOM Elements
    const phases = document.querySelectorAll('.phase');
    const nextBtns = document.querySelectorAll('.next');
    const prevBtns = document.querySelectorAll('.prev');
    const bookingForm = document.getElementById('bookingForm');
    const progressSteps = document.querySelectorAll('.progress-step');
    
    // Summary Elements
    const sumCleaners = document.getElementById('sumCleaners');
    const sumHours = document.getElementById('sumHours');
    const sumFreq = document.getElementById('sumFreq');
    const sumMaterials = document.getElementById('sumMaterials');
    const sumProperty = document.getElementById('sumProperty');
    const sumDate = document.getElementById('sumDate');
    const sumTime = document.getElementById('sumTime');
    const sumName = document.getElementById('sumName');
    const sumTotal = document.getElementById('sumTotal');
    
    // Form Inputs
    const cleanersInp = document.getElementById('cleaners');
    const hoursInp = document.getElementById('hours');
    const freqSelect = document.getElementById('frequency');
    const materialsSelect = document.getElementById('materials');
    const propertySelect = document.getElementById('propertyType');
    const streetInp = document.getElementById('street');
    const cityInp = document.getElementById('city');
    const dateInp = document.getElementById('date');
    const timeInp = document.getElementById('time');
    const fnameInp = document.getElementById('fname');
    const lnameInp = document.getElementById('lname');
    const emailInp = document.getElementById('email');
    const instructionsInp = document.getElementById('instructions');
    const phoneInp = document.getElementById('phone');
    const latInp = document.getElementById('latitude');
    const lngInp = document.getElementById('longitude');
    
    // Payment related
    let selectedPaymentMethod = null;
    let selectedProvider = null;
    let currentBookingData = null;
    let receiptModal = null;
    let shareModal = null;
    
    // Map related
    let locationMap = null;
    let locationMarker = null;
    
    // Mobile Money Providers with details
    const mobileProviders = ['M-PESA', 'AIRTEL Money', 'Tigo Pesa', 'HaloPesa', 'Azam Pesa', 'YAS (Mix)'];
    // Bank Providers
    const bankProviders = ['CRDB Bank', 'NMB Bank', 'NBC Bank', 'Stanbic', 'Absa', 'Exim Bank'];
    
    // ========== PROFESSIONAL VALIDATION TOAST SYSTEM ==========
    function showValidationToast(type, title, message, duration = 4500) {
        const container = document.getElementById('toastContainer');
        
        const iconMap = {
            'warning': 'fa-exclamation-triangle',
            'error': 'fa-times-circle',
            'info': 'fa-info-circle',
            'success': 'fa-check-circle'
        };
        
        const icon = iconMap[type] || iconMap['info'];
        const iconClass = type;
        
        const toast = document.createElement('div');
        toast.className = 'validation-toast';
        toast.innerHTML = `
            <div class="toast-icon ${iconClass}">
                <i class="fas ${icon}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Close button handler
        toast.querySelector('.toast-close').addEventListener('click', () => {
            removeToast(toast);
        });
        
        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (toast.parentNode) {
                    removeToast(toast);
                }
            }, duration);
        }
        
        return toast;
    }
    
    function removeToast(toast) {
        toast.classList.add('removing');
        toast.addEventListener('animationend', () => {
            if (toast.parentNode) {
                toast.remove();
            }
        });
    }
    
    // Clear all validation errors
    function clearAllValidationErrors() {
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        document.querySelectorAll('.invalid-feedback.show').forEach(el => el.classList.remove('show'));
    }
    
    // Show field validation error
    function showFieldError(field, message) {
        field.classList.add('is-invalid');
        const feedback = field.parentElement.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.textContent = message || 'This field is required';
            feedback.classList.add('show');
        }
        field.focus();
        // Remove error on input
        const removeError = () => {
            field.classList.remove('is-invalid');
            const fb = field.parentElement.querySelector('.invalid-feedback');
            if (fb) fb.classList.remove('show');
            field.removeEventListener('input', removeError);
        };
        field.addEventListener('input', removeError);
    }
    
    // ========== INTERACTIVE MAP SYSTEM ==========
    function initMap() {
        const mapElement = document.getElementById('locationMap');
        if (!mapElement) return;
        
        // Zanzibar Stone Town coordinates
        const defaultLat = -6.1659;
        const defaultLng = 39.2026;
        const defaultZoom = 14;
        
        // Initialize Leaflet map
        locationMap = L.map('locationMap', {
            center: [defaultLat, defaultLng],
            zoom: defaultZoom,
            zoomControl: true,
            scrollWheelZoom: true
        });
        
        // Add tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(locationMap);
        
        // Try to get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;
                    locationMap.setView([userLat, userLng], 15);
                    if (!locationMarker) {
                        placeMarker(userLat, userLng);
                    }
                    showValidationToast('info', 'Location Detected', 'We found your approximate location. You can adjust the pin on the map.');
                },
                (error) => {
                    console.log('Geolocation not available or denied:', error.message);
                    showValidationToast('info', 'Location Not Detected', 'Please click on the map to pin your exact location.');
                },
                { timeout: 10000, enableHighAccuracy: true }
            );
        } else {
            showValidationToast('info', 'Location Service', 'Please click on the map to pin your exact location.');
        }
        
        // Handle map click to place marker
        locationMap.on('click', function(e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            placeMarker(lat, lng);
        });
        
        // Fix map size issue on hidden containers
        setTimeout(() => {
            locationMap.invalidateSize();
        }, 300);
    }
    
    function placeMarker(lat, lng) {
        // Remove existing marker
        if (locationMarker) {
            locationMap.removeLayer(locationMarker);
        }
        
        // Create custom icon
        const customIcon = L.divIcon({
            className: 'custom-map-pin',
            html: `<div style="background: linear-gradient(135deg, #667eea, #764ba2); width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(102,126,234,0.5); border: 3px solid white;"><div style="transform: rotate(45deg); color: white; font-size: 14px;">📍</div></div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36]
        });
        
        // Place new marker
        locationMarker = L.marker([lat, lng], { icon: customIcon }).addTo(locationMap);
        
        // Add popup
        locationMarker.bindPopup(`
            <strong style="color: #667eea;">📍 Your Location</strong><br>
            <small>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}</small>
        `).openPopup();
        
        // Update hidden fields
        if (latInp) latInp.value = lat.toFixed(6);
        if (lngInp) lngInp.value = lng.toFixed(6);
        
        // Update coordinates display
        const coordinatesText = document.getElementById('coordinatesText');
        const mapCoordinates = document.getElementById('mapCoordinates');
        const mapOverlayInfo = document.getElementById('mapOverlayInfo');
        
        if (coordinatesText) {
            coordinatesText.textContent = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
        }
        if (mapCoordinates) {
            mapCoordinates.style.display = 'flex';
        }
        if (mapOverlayInfo) {
            mapOverlayInfo.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i> Location pinned successfully!';
            setTimeout(() => {
                mapOverlayInfo.innerHTML = '<i class="fas fa-map-pin"></i> Click on the map to adjust your location';
            }, 3000);
        }
        
        // Reverse geocode to get address
        reverseGeocode(lat, lng);
    }
    
    function reverseGeocode(lat, lng) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`)
            .then(response => response.json())
            .then(data => {
                if (data && data.display_name) {
                    const address = data.display_name;
                    // Auto-fill address fields if empty
                    if (!streetInp.value.trim()) {
                        const road = data.address?.road || data.address?.path || '';
                        const houseNumber = data.address?.house_number || '';
                        streetInp.value = (houseNumber ? houseNumber + ', ' : '') + road;
                        refreshSummary();
                    }
                    if (!cityInp.value.trim()) {
                        cityInp.value = data.address?.city || data.address?.town || data.address?.suburb || data.address?.county || '';
                        refreshSummary();
                    }
                }
            })
            .catch(err => console.log('Reverse geocoding failed:', err));
    }
    
    // Refresh map size when phase becomes visible
    function refreshMapSize() {
        if (locationMap) {
            setTimeout(() => {
                locationMap.invalidateSize();
            }, 200);
        }
    }
    
    // ========== CALCULATE TOTAL PRICE ==========
    function calculateTotal() {
        let cleaners = parseInt(cleanersInp.value) || 1;
        let hours = parseInt(hoursInp.value) || 0;
        let basePrice = cleaners * hours * 20000;
        if (materialsSelect.value === 'Yes') basePrice += 10000;
        if (freqSelect.value === 'Weekly') basePrice = Math.round(basePrice * 0.95);
        if (selectedPaymentMethod === 'cash') basePrice += 5000;
        return Math.round(basePrice);
    }
    
    function refreshSummary() {
        sumCleaners.innerText = cleanersInp.value || '1';
        sumHours.innerText = hoursInp.value || '0';
        sumFreq.innerText = freqSelect.value;
        sumMaterials.innerText = materialsSelect.value;
        let propVal = propertySelect.value;
        if (!propVal && streetInp?.value) propVal = streetInp.value.split(' ')[0] + '...';
        sumProperty.innerText = propVal || '—';
        sumDate.innerText = dateInp.value || '—';
        sumTime.innerText = timeInp.value || '—';
        let first = fnameInp.value.trim() || '', last = lnameInp.value.trim() || '';
        sumName.innerText = (first || last) ? `${first} ${last}`.trim() : '—';
        const total = calculateTotal();
        sumTotal.innerText = 'TZS ' + total.toLocaleString('en-US');
        updateReviewPanel();
    }
    
    function updateReviewPanel() {
        const reviewDiv = document.getElementById('review');
        if (!reviewDiv) return;
        let cleaners = parseInt(cleanersInp.value) || 1;
        let hours = parseInt(hoursInp.value) || 0;
        let addr = `${streetInp?.value || ''}, ${cityInp?.value || ''}`.trim().replace(/^,|,$/g, '') || '—';
        let total = calculateTotal();
        let lat = latInp?.value;
        let lng = lngInp?.value;
        let locInfo = (lat && lng) ? `<i class="fas fa-map-pin text-success"></i> Pinned` : `<i class="fas fa-exclamation-circle text-warning"></i> Not pinned`;
        
        reviewDiv.innerHTML = `
            <div class="review-row"><span><i class="fas fa-broom"></i> Service:</span><strong>${cleaners} cleaner(s) × ${hours} hours (${freqSelect.value})</strong></div>
            <div class="review-row"><span><i class="fas fa-box"></i> Materials:</span><strong>${materialsSelect.value}</strong></div>
            <div class="review-row"><span><i class="fas fa-home"></i> Address:</span><strong>${addr} (${propertySelect.value || 'Not selected'})</strong></div>
            <div class="review-row"><span><i class="fas fa-map-marker-alt"></i> Location:</span><strong>${locInfo}</strong></div>
            <div class="review-row"><span><i class="fas fa-calendar"></i> Schedule:</span><strong>${dateInp.value || '—'} at ${timeInp.value || '—'}</strong></div>
            <div class="review-row"><span><i class="fas fa-user"></i> Contact:</span><strong>${fnameInp.value || ''} ${lnameInp.value || ''}</strong></div>
            <div class="review-row"><span><i class="fas fa-envelope"></i> Email:</span><strong>${emailInp?.value || 'Not provided'}</strong></div>
            <div class="review-row fw-bold mt-3 pt-2" style="border-top: 2px solid #cbd5e0;"><span>Total Amount:</span><strong style="color: #0d6efd;">TZS ${total.toLocaleString('en-US')}</strong></div>
        `;
    }
    
    function updateProgress(currentPhaseId) {
        const currentPhaseNumber = parseInt(currentPhaseId.replace('phase', ''));
        progressSteps.forEach((step) => {
            const stepPhase = step.getAttribute('data-phase');
            const stepNumber = parseInt(stepPhase.replace('phase', ''));
            step.classList.remove('active', 'completed');
            if (stepNumber === currentPhaseNumber) step.classList.add('active');
            else if (stepNumber < currentPhaseNumber) step.classList.add('completed');
        });
        progressSteps.forEach(step => {
            const stepPhase = step.getAttribute('data-phase');
            const stepNumber = parseInt(stepPhase.replace('phase', ''));
            step.onclick = () => { if (stepNumber <= parseInt(currentPhaseId.replace('phase', ''))) showPhase(stepPhase); };
        });
    }
    
    function showPhase(phaseId) {
        phases.forEach(phase => phase.classList.remove('active'));
        const targetPhase = document.getElementById(phaseId);
        if (targetPhase) {
            targetPhase.classList.add('active');
            clearAllValidationErrors();
            refreshSummary();
            updateProgress(phaseId);
            
            // Refresh map if going to phase 3
            if (phaseId === 'phase3') {
                refreshMapSize();
            }
            
            if (window.innerWidth <= 768) {
                document.querySelector('.phase-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }
    
    // ========== ENHANCED VALIDATION ==========
    function validatePhase(currentPhaseId) {
        clearAllValidationErrors();
        
        switch(currentPhaseId) {
            case 'phase1':
                if (!cleanersInp.value || cleanersInp.value < 1 || cleanersInp.value > 10) {
                    showFieldError(cleanersInp, 'Please enter number of cleaners (1-10)');
                    showValidationToast('warning', 'Missing Information', 'Please specify the number of cleaners required.');
                    return false;
                }
                if (!hoursInp.value || hoursInp.value < 1 || hoursInp.value > 12) {
                    showFieldError(hoursInp, 'Please enter hours needed (1-12)');
                    showValidationToast('warning', 'Missing Information', 'Please specify how many hours of service you need.');
                    return false;
                }
                break;
                
            case 'phase2':
                if (!propertySelect.value) {
                    showFieldError(propertySelect, 'Please select a property type');
                    showValidationToast('warning', 'Property Type Required', 'Please select your property type to continue.');
                    return false;
                }
                break;
                
            case 'phase3':
                if (!streetInp.value.trim()) {
                    showFieldError(streetInp, 'Please enter your street address');
                    showValidationToast('warning', 'Address Required', 'Please provide your street address for accurate service delivery.');
                    return false;
                }
                if (!cityInp.value.trim()) {
                    showFieldError(cityInp, 'Please enter your city or area');
                    showValidationToast('warning', 'City Required', 'Please specify your city or area name.');
                    return false;
                }
                if (!latInp.value || !lngInp.value) {
                    showValidationToast('warning', 'Map Location Required', 'Please click on the map to pin your exact location before proceeding.');
                    const mapEl = document.getElementById('locationMap');
                    if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    return false;
                }
                break;
                
            case 'phase4':
                if (!dateInp.value) {
                    showFieldError(dateInp, 'Please select a preferred date');
                    showValidationToast('warning', 'Date Required', 'Please select your preferred service date.');
                    return false;
                }
                const selectedDate = new Date(dateInp.value + 'T00:00:00');
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (selectedDate < today) {
                    showFieldError(dateInp, 'Please select a future date');
                    showValidationToast('warning', 'Invalid Date', 'The selected date has already passed. Please choose a future date.');
                    return false;
                }
                if (!timeInp.value) {
                    showFieldError(timeInp, 'Please select a preferred time');
                    showValidationToast('warning', 'Time Required', 'Please select your preferred service time.');
                    return false;
                }
                break;
                
            case 'phase5':
                if (!fnameInp.value.trim()) {
                    showFieldError(fnameInp, 'Please enter your first name');
                    showValidationToast('warning', 'Name Required', 'Please enter your first name to continue.');
                    return false;
                }
                if (!lnameInp.value.trim()) {
                    showFieldError(lnameInp, 'Please enter your last name');
                    showValidationToast('warning', 'Name Required', 'Please enter your last name to continue.');
                    return false;
                }
                if (!emailInp.value.trim()) {
                    showFieldError(emailInp, 'Please enter your email address');
                    showValidationToast('warning', 'Email Required', 'Please provide your email address for booking confirmation.');
                    return false;
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInp.value)) {
                    showFieldError(emailInp, 'Please enter a valid email address');
                    showValidationToast('warning', 'Invalid Email', 'The email format appears to be incorrect. Please check and try again.');
                    return false;
                }
                if (phoneInp.value.trim() && !/^\+?[\d\s-]{9,15}$/.test(phoneInp.value.trim())) {
                    showFieldError(phoneInp, 'Please enter a valid phone number');
                    showValidationToast('warning', 'Invalid Phone', 'Please enter a valid phone number in the format +255 XXX XXX XXX.');
                    return false;
                }
                break;
        }
        return true;
    }
    
    // ========== PAYMENT UI - REALISTIC PAYMENT DETAILS ==========
    function renderPaymentDetails(method) {
        const container = document.getElementById('paymentDetailsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (method === 'mobile_money') {
            renderMobileMoneyDetails(container);
        } else if (method === 'bank_transfer') {
            renderBankTransferDetails(container);
        } else if (method === 'card') {
            renderCardDetails(container);
        }
    }
    
    function renderMobileMoneyDetails(container) {
        let html = `
            <div class="payment-details-card">
                <h6><i class="fas fa-mobile-alt"></i> Mobile Money Payment</h6>
                <div class="mb-3">
                    <label class="form-label">Select Provider <span class="text-danger">*</span></label>
                    <div class="provider-grid" id="providerGrid">
        `;
        
        mobileProviders.forEach(prov => {
            html += `<div class="provider-btn" data-provider="${prov}"><strong>${prov}</strong></div>`;
        });
        
        html += `
                    </div>
                    <div class="invalid-feedback">Please select a provider</div>
                </div>
                <div class="mb-3">
                    <label class="form-label" for="paymentAccount">Mobile Money Number <span class="text-danger">*</span></label>
                    <input type="tel" id="paymentAccount" class="form-control" placeholder="e.g., 0712345678">
                    <div class="invalid-feedback">Please enter a valid mobile money number</div>
                </div>
                <div class="mb-3">
                    <label class="form-label" for="paymentName">Account Holder Name <span class="text-danger">*</span></label>
                    <input type="text" id="paymentName" class="form-control" placeholder="Full name as registered">
                    <div class="invalid-feedback">Please enter the account holder name</div>
                </div>
                <div class="mb-3">
                    <label class="form-label" for="paymentPin">Transaction PIN <span class="text-danger">*</span></label>
                    <input type="password" id="paymentPin" class="form-control" placeholder="Enter your PIN to confirm" maxlength="6">
                    <div class="invalid-feedback">Please enter your PIN</div>
                </div>
                <button type="button" id="processPaymentBtn" class="btn btn-success w-100 mt-2">
                    <i class="fas fa-lock me-2"></i> Pay TZS ${calculateTotal().toLocaleString('en-US')}
                </button>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Provider selection handlers
        document.querySelectorAll('.provider-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.provider-btn').forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                selectedProvider = this.getAttribute('data-provider');
            });
        });
        
        // Payment button handler
        document.getElementById('processPaymentBtn').addEventListener('click', () => processMobileMoneyPayment());
    }
    
    function processMobileMoneyPayment() {
        const accountInput = document.getElementById('paymentAccount');
        const nameInput = document.getElementById('paymentName');
        const pinInput = document.getElementById('paymentPin');
        
        clearAllValidationErrors();
        let hasError = false;
        
        if (!selectedProvider) {
            showValidationToast('warning', 'Provider Required', 'Please select a mobile money provider.');
            hasError = true;
        }
        if (!accountInput?.value.trim()) {
            showFieldError(accountInput, 'Please enter your mobile money number');
            hasError = true;
        } else if (!/^\d{9,12}$/.test(accountInput.value.replace(/\s/g, ''))) {
            showFieldError(accountInput, 'Please enter a valid mobile number (9-12 digits)');
            hasError = true;
        }
        if (!nameInput?.value.trim()) {
            showFieldError(nameInput, 'Please enter the account holder name');
            hasError = true;
        }
        if (!pinInput?.value.trim() || pinInput.value.length < 4) {
            showFieldError(pinInput, 'Please enter a valid PIN (4-6 digits)');
            hasError = true;
        }
        
        if (hasError) {
            showValidationToast('error', 'Payment Incomplete', 'Please complete all payment details before confirming.');
            return;
        }
        
        finalizePayment('mobile_money', accountInput.value);
    }
    
    function renderBankTransferDetails(container) {
        let html = `
            <div class="payment-details-card">
                <h6><i class="fas fa-university"></i> Bank Transfer Payment</h6>
                <div class="mb-3">
                    <label class="form-label">Select Bank <span class="text-danger">*</span></label>
                    <div class="provider-grid" id="providerGrid">
        `;
        
        bankProviders.forEach(prov => {
            html += `<div class="provider-btn" data-provider="${prov}"><strong>${prov}</strong></div>`;
        });
        
        html += `
                    </div>
                    <div class="invalid-feedback">Please select a bank</div>
                </div>
                <div class="mb-3">
                    <label class="form-label" for="paymentAccount">Account Number <span class="text-danger">*</span></label>
                    <input type="text" id="paymentAccount" class="form-control" placeholder="Enter your bank account number">
                    <div class="invalid-feedback">Please enter a valid account number</div>
                </div>
                <div class="mb-3">
                    <label class="form-label" for="paymentName">Account Holder Name <span class="text-danger">*</span></label>
                    <input type="text" id="paymentName" class="form-control" placeholder="Full name on bank account">
                    <div class="invalid-feedback">Please enter the account holder name</div>
                </div>
                <div class="mb-3">
                    <label class="form-label" for="paymentPin">Transaction Password <span class="text-danger">*</span></label>
                    <input type="password" id="paymentPin" class="form-control" placeholder="Enter your banking password">
                    <div class="invalid-feedback">Please enter your password</div>
                </div>
                <div class="alert alert-info mt-3" style="font-size: 0.85rem;">
                    <i class="fas fa-info-circle me-2"></i> Bank transfers may take 1-3 business days to process. Your booking will be confirmed once payment is received.
                </div>
                <button type="button" id="processPaymentBtn" class="btn btn-success w-100 mt-2">
                    <i class="fas fa-lock me-2"></i> Pay TZS ${calculateTotal().toLocaleString('en-US')}
                </button>
            </div>
        `;
        
        container.innerHTML = html;
        
        document.querySelectorAll('.provider-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.provider-btn').forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                selectedProvider = this.getAttribute('data-provider');
            });
        });
        
        document.getElementById('processPaymentBtn').addEventListener('click', () => processBankPayment());
    }
    
    function processBankPayment() {
        const accountInput = document.getElementById('paymentAccount');
        const nameInput = document.getElementById('paymentName');
        const pinInput = document.getElementById('paymentPin');
        
        clearAllValidationErrors();
        let hasError = false;
        
        if (!selectedProvider) {
            showValidationToast('warning', 'Bank Required', 'Please select your bank.');
            hasError = true;
        }
        if (!accountInput?.value.trim()) {
            showFieldError(accountInput, 'Please enter your account number');
            hasError = true;
        } else if (!/^\d{6,20}$/.test(accountInput.value.replace(/\s/g, ''))) {
            showFieldError(accountInput, 'Please enter a valid account number (6-20 digits)');
            hasError = true;
        }
        if (!nameInput?.value.trim()) {
            showFieldError(nameInput, 'Please enter the account holder name');
            hasError = true;
        }
        if (!pinInput?.value.trim()) {
            showFieldError(pinInput, 'Please enter your banking password');
            hasError = true;
        }
        
        if (hasError) {
            showValidationToast('error', 'Payment Incomplete', 'Please complete all payment details before confirming.');
            return;
        }
        
        finalizePayment('bank_transfer', accountInput.value);
    }
    
    function renderCardDetails(container) {
        let html = `
            <div class="payment-details-card">
                <h6><i class="fas fa-credit-card"></i> Card Payment</h6>
                <div class="mb-3">
                    <label class="form-label">Card Type <span class="text-danger">*</span></label>
                    <div class="provider-grid" id="providerGrid">
                        <div class="provider-btn" data-provider="Visa"><i class="fab fa-cc-visa" style="font-size: 1.2rem;"></i> <strong>Visa</strong></div>
                        <div class="provider-btn" data-provider="Mastercard"><i class="fab fa-cc-mastercard" style="font-size: 1.2rem;"></i> <strong>Mastercard</strong></div>
                    </div>
                    <div class="invalid-feedback">Please select a card type</div>
                </div>
                <div class="mb-3">
                    <label class="form-label" for="paymentAccount">Card Number <span class="text-danger">*</span></label>
                    <input type="text" id="paymentAccount" class="form-control" placeholder="1234 5678 9012 3456" maxlength="19">
                    <div class="invalid-feedback">Please enter a valid 16-digit card number</div>
                </div>
                <div class="mb-3">
                    <label class="form-label" for="paymentName">Cardholder Name <span class="text-danger">*</span></label>
                    <input type="text" id="paymentName" class="form-control" placeholder="Name on card">
                    <div class="invalid-feedback">Please enter the cardholder name</div>
                </div>
                <div class="card-input-row mb-3">
                    <div>
                        <label class="form-label" for="paymentExpiry">Expiry Date <span class="text-danger">*</span></label>
                        <input type="text" id="paymentExpiry" class="form-control" placeholder="MM/YY" maxlength="5">
                        <div class="invalid-feedback">Please enter a valid expiry date</div>
                    </div>
                    <div>
                        <label class="form-label" for="paymentCvv">CVV <span class="text-danger">*</span></label>
                        <input type="text" id="paymentCvv" class="form-control" placeholder="123" maxlength="4">
                        <div class="invalid-feedback">Please enter a valid CVV</div>
                    </div>
                </div>
                <div class="alert alert-info mt-3" style="font-size: 0.85rem;">
                    <i class="fas fa-shield-alt me-2"></i> Your card details are encrypted and secure. We do not store your full card information.
                </div>
                <button type="button" id="processPaymentBtn" class="btn btn-success w-100 mt-2">
                    <i class="fas fa-lock me-2"></i> Pay TZS ${calculateTotal().toLocaleString('en-US')}
                </button>
            </div>
        `;
        
        container.innerHTML = html;
        
        document.querySelectorAll('.provider-grid .provider-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.provider-grid .provider-btn').forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                selectedProvider = this.getAttribute('data-provider');
            });
        });
        
        // Format card number
        const cardInput = document.getElementById('paymentAccount');
        if (cardInput) {
            cardInput.addEventListener('input', function(e) {
                let val = e.target.value.replace(/\s/g, '').replace(/[^\d]/g, '');
                if (val.length > 16) val = val.slice(0, 16);
                e.target.value = val.replace(/(\d{4})/g, '$1 ').trim();
            });
        }
        
        // Format expiry date
        const expiryInput = document.getElementById('paymentExpiry');
        if (expiryInput) {
            expiryInput.addEventListener('input', function(e) {
                let val = e.target.value.replace(/[^\d]/g, '');
                if (val.length > 4) val = val.slice(0, 4);
                if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
                e.target.value = val;
            });
        }
        
        document.getElementById('processPaymentBtn').addEventListener('click', () => processCardPayment());
    }
    
    function processCardPayment() {
        const cardInput = document.getElementById('paymentAccount');
        const nameInput = document.getElementById('paymentName');
        const expiryInput = document.getElementById('paymentExpiry');
        const cvvInput = document.getElementById('paymentCvv');
        
        clearAllValidationErrors();
        let hasError = false;
        
        if (!selectedProvider) {
            showValidationToast('warning', 'Card Type Required', 'Please select Visa or Mastercard.');
            hasError = true;
        }
        
        const cardNum = cardInput?.value.replace(/\s/g, '') || '';
        if (!cardNum) {
            showFieldError(cardInput, 'Please enter your card number');
            hasError = true;
        } else if (!/^\d{16}$/.test(cardNum)) {
            showFieldError(cardInput, 'Please enter a valid 16-digit card number');
            hasError = true;
        }
        
        if (!nameInput?.value.trim()) {
            showFieldError(nameInput, 'Please enter the cardholder name');
            hasError = true;
        }
        
        const expiry = expiryInput?.value || '';
        if (!expiry) {
            showFieldError(expiryInput, 'Please enter the expiry date');
            hasError = true;
        } else if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            showFieldError(expiryInput, 'Please enter a valid expiry date (MM/YY)');
            hasError = true;
        } else {
            const [month, year] = expiry.split('/').map(Number);
            const now = new Date();
            const currentYear = now.getFullYear() % 100;
            const currentMonth = now.getMonth() + 1;
            if (month < 1 || month > 12 || (year < currentYear || (year === currentYear && month < currentMonth))) {
                showFieldError(expiryInput, 'Card has expired. Please use a valid card.');
                hasError = true;
            }
        }
        
        const cvv = cvvInput?.value || '';
        if (!cvv) {
            showFieldError(cvvInput, 'Please enter the CVV');
            hasError = true;
        } else if (!/^\d{3,4}$/.test(cvv)) {
            showFieldError(cvvInput, 'Please enter a valid CVV (3-4 digits)');
            hasError = true;
        }
        
        if (hasError) {
            showValidationToast('error', 'Payment Incomplete', 'Please check your card details and try again.');
            return;
        }
        
        finalizePayment('card', cardNum.slice(-4));
    }
    
    function finalizePayment(method, accountMask) {
        const totalAmount = calculateTotal();
        
        let methodLabel = '';
        if (method === 'mobile_money') methodLabel = `Mobile Money (${selectedProvider})`;
        else if (method === 'bank_transfer') methodLabel = `Bank Transfer (${selectedProvider})`;
        else if (method === 'card') methodLabel = `${selectedProvider} Card`;
        
        const transactionId = 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
        
        const bookingData = {
            bookingId: 'BK-' + Date.now(),
            date: new Date().toISOString(),
            cleaners: cleanersInp.value,
            hours: hoursInp.value,
            frequency: freqSelect.value,
            materials: materialsSelect.value,
            propertyType: propertySelect.value,
            address: `${streetInp.value}, ${cityInp.value}`,
            latitude: latInp.value,
            longitude: lngInp.value,
            scheduleDate: dateInp.value,
            scheduleTime: timeInp.value,
            customerName: `${fnameInp.value} ${lnameInp.value}`,
            email: emailInp.value,
            phone: phoneInp?.value || '',
            instructions: instructionsInp?.value || '',
            paymentMethod: methodLabel,
            totalAmount: totalAmount,
            paymentStatus: 'completed',
            transactionId: transactionId,
            paymentAccount: accountMask,
            paidAt: new Date().toISOString()
        };
        
        // Save booking
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        bookings.push(bookingData);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        currentBookingData = bookingData;
        
        showValidationToast('success', 'Payment Successful!', 'Your payment has been processed successfully.');
        
        // Launch celebration animation
        launchCelebration();
        
        setTimeout(() => showReceipt(bookingData), 800);
    }
    
    function processCashPayment() {
        const totalAmount = calculateTotal();
        
        const bookingData = {
            bookingId: 'BK-' + Date.now(),
            date: new Date().toISOString(),
            cleaners: cleanersInp.value,
            hours: hoursInp.value,
            frequency: freqSelect.value,
            materials: materialsSelect.value,
            propertyType: propertySelect.value,
            address: `${streetInp.value}, ${cityInp.value}`,
            latitude: latInp.value,
            longitude: lngInp.value,
            scheduleDate: dateInp.value,
            scheduleTime: timeInp.value,
            customerName: `${fnameInp.value} ${lnameInp.value}`,
            email: emailInp.value,
            phone: phoneInp?.value || '',
            instructions: instructionsInp?.value || '',
            paymentMethod: 'Cash (+TZS 5,000)',
            totalAmount: totalAmount,
            paymentStatus: 'pending',
            transactionId: null,
            paidAt: null,
            cashPending: true
        };
        
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        bookings.push(bookingData);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        const pendingCash = JSON.parse(localStorage.getItem('pendingCashPayments') || '[]');
        pendingCash.push({ bookingId: bookingData.bookingId, customerName: bookingData.customerName, amount: totalAmount, address: bookingData.address });
        localStorage.setItem('pendingCashPayments', JSON.stringify(pendingCash));
        
        currentBookingData = bookingData;
        
        showValidationToast('success', 'Booking Confirmed!', 'Cash payment will be collected by staff on arrival.');
        
        launchCelebration();
        
        setTimeout(() => showReceipt(bookingData), 800);
    }
    
    function showReceipt(booking) {
        const receiptContent = document.getElementById('receiptContent');
        const isPending = booking.paymentStatus === 'pending';
        
        let paymentStatusHtml = isPending ? 
            `<div class="text-center my-3"><span class="payment-pending-badge"><i class="fas fa-clock me-1"></i> PENDING PAYMENT</span><p class="text-muted small mt-2">Payment will be collected by staff upon service delivery. Staff will validate and you'll receive confirmation.</p></div>` :
            `<div class="text-center my-2 text-success"><i class="fas fa-check-circle fa-2x"></i><p class="mt-1">Payment Confirmed</p></div>`;
        
        receiptContent.innerHTML = `
            <div class="text-center mb-3" id="receiptHeaderContent">
                <strong>CleanSpark</strong>
                <p class="text-muted small">Official Payment Receipt</p>
            </div>
            <div class="border-top border-bottom py-2 mb-2">
                <div class="d-flex justify-content-between"><span>Booking ID:</span><strong>${booking.bookingId}</strong></div>
                <div class="d-flex justify-content-between"><span>Date:</span><span>${new Date(booking.scheduleDate).toLocaleDateString()}</span></div>
                <div class="d-flex justify-content-between"><span>Time:</span><span>${booking.scheduleTime}</span></div>
            </div>
            <div class="mb-2">
                <div class="d-flex justify-content-between"><span>Customer:</span><strong>${booking.customerName}</strong></div>
                <div class="d-flex justify-content-between"><span>Service:</span><span>${booking.cleaners} cleaner(s) × ${booking.hours} hrs</span></div>
                <div class="d-flex justify-content-between"><span>Frequency:</span><span>${booking.frequency}</span></div>
                <div class="d-flex justify-content-between"><span>Address:</span><span>${booking.address}</span></div>
                ${booking.latitude ? `<div class="d-flex justify-content-between"><span>Coordinates:</span><span>${booking.latitude}, ${booking.longitude}</span></div>` : ''}
            </div>
            <div class="border-top border-bottom py-2 my-2">
                <div class="d-flex justify-content-between"><span>Payment Method:</span><strong>${booking.paymentMethod}</strong></div>
                ${booking.transactionId ? `<div class="d-flex justify-content-between"><span>Transaction ID:</span><span>${booking.transactionId}</span></div>` : ''}
                ${booking.paymentAccount ? `<div class="d-flex justify-content-between"><span>Account ending:</span><span>****${booking.paymentAccount}</span></div>` : ''}
                <div class="d-flex justify-content-between fw-bold mt-2"><span>Total Amount:</span><span style="color:#0d6efd;">TZS ${booking.totalAmount.toLocaleString()}</span></div>
            </div>
            ${paymentStatusHtml}
            <div class="text-center text-muted small mt-3">
                <i class="fas fa-envelope"></i> Receipt sent to: ${booking.email}
            </div>
        `;
        
        receiptModal = new bootstrap.Modal(document.getElementById('receiptModal'));
        receiptModal.show();
    }
    
    // ========== CELEBRATION FUNCTION ==========
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
    
    // ========== RECEIPT DOWNLOAD FUNCTIONALITY ==========
    function downloadReceipt() {
        const receiptContent = document.getElementById('receiptContent');
        
        const clone = receiptContent.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.left = '-9999px';
        clone.style.top = '0';
        clone.style.width = '600px';
        clone.style.padding = '30px';
        clone.style.background = 'white';
        clone.style.borderRadius = '16px';
        clone.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
        document.body.appendChild(clone);
        
        html2canvas(clone, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false
        }).then(canvas => {
            document.body.removeChild(clone);
            
            const link = document.createElement('a');
            link.download = `CleanSpark_Receipt_${currentBookingData?.bookingId || 'booking'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            showValidationToast('success', 'Downloaded!', 'Receipt downloaded successfully.');
        }).catch(error => {
            console.error('Download failed:', error);
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                <head>
                    <title>CleanSpark Receipt</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
                        .receipt { border: 2px solid #e2e8f0; border-radius: 16px; padding: 30px; }
                        strong { color: #2d3748; }
                        .text-center { text-align: center; }
                        .border-top { border-top: 1px solid #e2e8f0; padding-top: 10px; }
                        .border-bottom { border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
                        .d-flex { display: flex; justify-content: space-between; margin: 8px 0; }
                        .text-success { color: #198754; }
                        .text-muted { color: #6c757d; }
                        .fw-bold { font-weight: bold; }
                        .mt-2 { margin-top: 10px; }
                        .mt-3 { margin-top: 15px; }
                        .my-2 { margin: 10px 0; }
                        .my-3 { margin: 15px 0; }
                        .mb-2 { margin-bottom: 10px; }
                        .small { font-size: 0.875rem; }
                    </style>
                </head>
                <body>
                    <div class="receipt">
                        ${receiptContent.innerHTML}
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        });
    }
    
    // ========== SHARE FUNCTIONALITY ==========
    function shareReceiptModal() {
        shareModal = new bootstrap.Modal(document.getElementById('shareModal'));
        shareModal.show();
    }
    
    window.shareVia = function(platform) {
        if (!currentBookingData) return;
        
        const booking = currentBookingData;
        const shareText = `CleanSpark Cleaning Service Booking Confirmed!\n\nBooking ID: ${booking.bookingId}\nService: ${booking.cleaners} cleaner(s) × ${booking.hours} hrs\nDate: ${booking.scheduleDate} at ${booking.scheduleTime}\nAmount: TZS ${booking.totalAmount.toLocaleString()}\n\nThank you for choosing CleanSpark!`;
        const shareUrl = `https://CleanSpark.co.tz/booking/${booking.bookingId}`;
        
        let url = '';
        
        switch(platform) {
            case 'whatsapp':
                url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
                window.open(url, '_blank');
                break;
            case 'email':
                url = `mailto:?subject=CleanSpark Booking Confirmation - ${booking.bookingId}&body=${encodeURIComponent(shareText + '\n\nView details: ' + shareUrl)}`;
                window.location.href = url;
                break;
            case 'sms':
                url = `sms:?body=${encodeURIComponent(shareText)}`;
                window.location.href = url;
                break;
            case 'copy':
                navigator.clipboard.writeText(shareText + '\n\n' + shareUrl).then(() => {
                    showValidationToast('success', 'Copied!', 'Receipt details copied to clipboard.');
                }).catch(() => {
                    showValidationToast('error', 'Copy Failed', 'Failed to copy. Please try again.');
                });
                break;
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
                window.open(url, '_blank', 'width=600,height=400');
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText.substring(0, 200))}&url=${encodeURIComponent(shareUrl)}`;
                window.open(url, '_blank', 'width=600,height=400');
                break;
        }
        
        if (shareModal) {
            shareModal.hide();
        }
    };
    
    // ========== PAYMENT METHOD SELECTION ==========
    function initPaymentSelection() {
        const paymentCards = document.querySelectorAll('.payment-option-card');
        paymentCards.forEach(card => {
            card.addEventListener('click', function() {
                paymentCards.forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                selectedPaymentMethod = this.getAttribute('data-method');
                selectedProvider = null;
                
                if (selectedPaymentMethod === 'cash') {
                    const container = document.getElementById('paymentDetailsContainer');
                    container.innerHTML = `
                        <div class="payment-details-card">
                            <h6><i class="fas fa-money-bill-wave"></i> Cash Payment</h6>
                            <div class="alert alert-warning">
                                <i class="fas fa-info-circle me-2"></i> 
                                Cash payment includes an additional <strong>TZS 5,000</strong> service fee. 
                                Total amount: <strong>TZS ${calculateTotal().toLocaleString('en-US')}</strong>
                            </div>
                            <p class="text-muted small">Payment will be collected by our staff on arrival. Payment will remain pending until staff validates.</p>
                            <button type="button" id="confirmCashBtn" class="btn btn-success w-100">
                                <i class="fas fa-check me-2"></i> Confirm Cash Booking
                            </button>
                        </div>
                    `;
                    document.getElementById('confirmCashBtn').addEventListener('click', () => processCashPayment());
                } else {
                    renderPaymentDetails(selectedPaymentMethod);
                }
                
                refreshSummary();
            });
        });
    }
    
    // ========== NAVIGATION BUTTONS ==========
    nextBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const nextId = this.getAttribute('data-next');
            let currentPhaseId = null;
            phases.forEach(phase => { if (phase.classList.contains('active')) currentPhaseId = phase.id; });
            if (currentPhaseId && !validatePhase(currentPhaseId)) return;
            if (nextId) showPhase(nextId);
        });
    });
    
    prevBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const prevId = this.getAttribute('data-prev');
            if (prevId) showPhase(prevId);
        });
    });
    
    // ========== LIVE INPUT LISTENERS ==========
    const liveInputs = [cleanersInp, hoursInp, freqSelect, materialsSelect, propertySelect, streetInp, cityInp, dateInp, timeInp, fnameInp, lnameInp, emailInp, instructionsInp, phoneInp];
    liveInputs.forEach(inp => { 
        if (inp) { 
            inp.addEventListener('input', refreshSummary); 
            inp.addEventListener('change', refreshSummary); 
        } 
    });
    
    bookingForm.addEventListener('submit', (e) => e.preventDefault());
    
    // ========== INITIALIZATION ==========
    // Set min date and defaults
    if (dateInp) {
        const today = new Date().toISOString().split('T')[0];
        dateInp.min = today;
        dateInp.value = today;
    }
    if (timeInp) timeInp.value = '09:00';
    if (fnameInp) fnameInp.value = '';
    if (lnameInp) lnameInp.value = '';
    if (emailInp) {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (user.email) emailInp.value = user.email;
    }
    if (propertySelect && !propertySelect.value) propertySelect.value = 'Apartment';
    
    // Initialize map
    initMap();
    
    refreshSummary();
    updateProgress('phase1');
    initPaymentSelection();
    
    // ========== RECEIPT MODAL BUTTONS ==========
    document.getElementById('closeReceiptBtn')?.addEventListener('click', () => {
        receiptModal?.hide();
        window.location.href = 'index.html';
    });
    document.getElementById('moreBookingBtn')?.addEventListener('click', () => {
        receiptModal?.hide();
        window.location.href = 'service.html';
        instructionsInp.value = '';
        streetInp.value = '';
        cityInp.value = '';
        if (latInp) latInp.value = '';
        if (lngInp) lngInp.value = '';
        selectedPaymentMethod = null;
        selectedProvider = null;
        document.getElementById('paymentDetailsContainer').innerHTML = '';
        document.querySelectorAll('.payment-option-card').forEach(c => c.classList.remove('selected'));
        if (locationMarker) {
            locationMap.removeLayer(locationMarker);
            locationMarker = null;
        }
        const mapCoordinates = document.getElementById('mapCoordinates');
        if (mapCoordinates) mapCoordinates.style.display = 'none';
        const mapOverlayInfo = document.getElementById('mapOverlayInfo');
        if (mapOverlayInfo) mapOverlayInfo.innerHTML = '<i class="fas fa-map-pin"></i> Click on the map to pin your exact location';
        showPhase('phase1');
        refreshSummary();
        refreshMapSize();
    });
    
    document.getElementById('downloadReceiptBtn')?.addEventListener('click', () => {
        downloadReceipt();
    });
    
    document.getElementById('shareReceiptBtn')?.addEventListener('click', () => {
        shareReceiptModal();
    });
    
    localStorage.removeItem('pendingBooking');
    console.log('✓ Enhanced booking system with interactive map, professional validation & realistic payment ready');
})();