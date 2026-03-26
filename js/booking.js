// ========== BOOKING FORM FUNCTIONALITY ==========

(function() {
    'use strict';
    
    // Check if user is logged in
    function isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }
    
    // Redirect to login if not logged in
    if (!isLoggedIn()) {
        const bookingData = {
            attempted: true,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
        alert('Please login to continue with booking');
        window.location.href = 'login.html';
        return;
    }
    
    // DOM Elements
    const phases = document.querySelectorAll('.phase');
    const nextBtns = document.querySelectorAll('.next');
    const bookingForm = document.getElementById('bookingForm');
    
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
    const paymentSelect = document.getElementById('payment');
    
    // Calculate total price
    function calculateTotal() {
        let cleaners = parseInt(cleanersInp.value) || 1;
        let hours = parseInt(hoursInp.value) || 0;
        let basePrice = cleaners * hours * 20000;
        
        if (materialsSelect.value === 'Yes') {
            basePrice += 10000;
        }
        
        // Apply 5% discount for weekly or multiple bookings
        if (freqSelect.value === 'Weekly' || freqSelect.value === 'Multiple') {
            basePrice = basePrice * 0.95;
        }
        
        // Add cash payment fee if selected
        if (paymentSelect && paymentSelect.value === 'Cash (+TZS 5,000)') {
            basePrice += 5000;
        }
        
        return Math.round(basePrice);
    }
    
    // Refresh summary display
    function refreshSummary() {
        // Basic fields
        sumCleaners.innerText = cleanersInp.value || '1';
        sumHours.innerText = hoursInp.value || '0';
        sumFreq.innerText = freqSelect.value;
        sumMaterials.innerText = materialsSelect.value;
        
        // Property
        let propVal = propertySelect.value;
        if (!propVal && streetInp?.value) {
            propVal = streetInp.value.split(' ')[0] + '...';
        }
        sumProperty.innerText = propVal || '—';
        
        // Date & Time
        sumDate.innerText = dateInp.value || '—';
        sumTime.innerText = timeInp.value || '—';
        
        // Name
        let first = fnameInp.value.trim() || '';
        let last = lnameInp.value.trim() || '';
        sumName.innerText = (first || last) ? `${first} ${last}`.trim() : '—';
        
        // Total
        const total = calculateTotal();
        sumTotal.innerText = 'TZS ' + total.toLocaleString('en-US');
        
        // Update review panel if active
        updateReviewPanel();
    }
    
    // Update review panel content
    function updateReviewPanel() {
        const reviewDiv = document.getElementById('review');
        if (!reviewDiv) return;
        
        let cleaners = parseInt(cleanersInp.value) || 1;
        let hours = parseInt(hoursInp.value) || 0;
        let addr = `${streetInp?.value || ''}, ${cityInp?.value || ''}`.trim();
        addr = addr.replace(/^,|,$/g, '') || '—';
        let propVal = propertySelect.value || 'Not selected';
        let total = calculateTotal();
        let instructions = instructionsInp?.value || 'None';
        
        reviewDiv.innerHTML = `
            <div class="review-row">
                <span><i class="fas fa-broom"></i> Service:</span>
                <strong>${cleaners} cleaner(s) × ${hours} hours (${freqSelect.value})</strong>
            </div>
            <div class="review-row">
                <span><i class="fas fa-box"></i> Materials:</span>
                <strong>${materialsSelect.value}</strong>
            </div>
            <div class="review-row">
                <span><i class="fas fa-home"></i> Address:</span>
                <strong>${addr} (${propVal})</strong>
            </div>
            <div class="review-row">
                <span><i class="fas fa-calendar"></i> Schedule:</span>
                <strong>${dateInp.value || '—'} at ${timeInp.value || '—'}</strong>
            </div>
            <div class="review-row">
                <span><i class="fas fa-user"></i> Contact:</span>
                <strong>${fnameInp.value || ''} ${lnameInp.value || ''}</strong>
            </div>
            <div class="review-row">
                <span><i class="fas fa-envelope"></i> Email:</span>
                <strong>${emailInp?.value || 'Not provided'}</strong>
            </div>
            <div class="review-row">
                <span><i class="fas fa-comment"></i> Instructions:</span>
                <strong>${instructions}</strong>
            </div>
            <div class="review-row fw-bold mt-3 pt-2" style="border-top: 2px solid #cbd5e0;">
                <span><i class="fas fa-credit-card"></i> Total Amount:</span>
                <strong style="color: #0d6efd; font-size: 1.1rem;">TZS ${total.toLocaleString('en-US')}</strong>
            </div>
        `;
    }
    
    // Show specific phase with validation
    function showPhase(phaseId) {
        // Hide all phases
        phases.forEach(phase => {
            phase.classList.remove('active');
        });
        
        // Show target phase
        const targetPhase = document.getElementById(phaseId);
        if (targetPhase) {
            targetPhase.classList.add('active');
            refreshSummary();
            
            // Scroll to top of form on mobile
            if (window.innerWidth <= 768) {
                document.querySelector('.phase-container').scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }
    }
    
    // Validate current phase before proceeding
    function validatePhase(currentPhaseId, nextPhaseId) {
        switch(currentPhaseId) {
            case 'phase1':
                if (!cleanersInp.value || cleanersInp.value < 1) {
                    alert('Please enter number of cleaners (minimum 1)');
                    cleanersInp.focus();
                    return false;
                }
                if (!hoursInp.value || hoursInp.value < 1) {
                    alert('Please enter number of hours (minimum 1)');
                    hoursInp.focus();
                    return false;
                }
                break;
                
            case 'phase2':
                if (!propertySelect.value) {
                    alert('Please select a property type');
                    propertySelect.focus();
                    return false;
                }
                break;
                
            case 'phase3':
                if (!streetInp.value || !cityInp.value) {
                    alert('Please enter your full address (street and city)');
                    streetInp.focus();
                    return false;
                }
                break;
                
            case 'phase4':
                if (!dateInp.value) {
                    alert('Please select a preferred date');
                    dateInp.focus();
                    return false;
                }
                if (!timeInp.value) {
                    alert('Please select a preferred time');
                    timeInp.focus();
                    return false;
                }
                // Validate date is not in the past
                const selectedDate = new Date(dateInp.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (selectedDate < today) {
                    alert('Please select a future date');
                    dateInp.focus();
                    return false;
                }
                break;
                
            case 'phase5':
                if (!fnameInp.value.trim()) {
                    alert('Please enter your first name');
                    fnameInp.focus();
                    return false;
                }
                if (!lnameInp.value.trim()) {
                    alert('Please enter your last name');
                    lnameInp.focus();
                    return false;
                }
                if (!emailInp.value.trim()) {
                    alert('Please enter your email address');
                    emailInp.focus();
                    return false;
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailInp.value)) {
                    alert('Please enter a valid email address');
                    emailInp.focus();
                    return false;
                }
                break;
        }
        return true;
    }
    
    // Add event listeners to Next buttons
    nextBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const nextId = this.getAttribute('data-next');
            if (!nextId) return;
            
            // Get current active phase
            let currentPhaseId = null;
            phases.forEach(phase => {
                if (phase.classList.contains('active')) {
                    currentPhaseId = phase.id;
                }
            });
            
            // Validate current phase
            if (currentPhaseId && !validatePhase(currentPhaseId, nextId)) {
                return;
            }
            
            // Show next phase
            showPhase(nextId);
        });
    });
    
    // Add live updates to all inputs
    const liveInputs = [
        cleanersInp, hoursInp, freqSelect, materialsSelect, 
        propertySelect, streetInp, cityInp, dateInp, timeInp, 
        fnameInp, lnameInp, emailInp, instructionsInp, paymentSelect
    ];
    
    liveInputs.forEach(inp => {
        if (inp) {
            inp.addEventListener('input', refreshSummary);
            inp.addEventListener('change', refreshSummary);
        }
    });
    
    // Handle form submission
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Final validation for all fields
        const finalValidation = [
            { field: cleanersInp, msg: 'Cleaners count required' },
            { field: hoursInp, msg: 'Hours required' },
            { field: propertySelect, msg: 'Property type required' },
            { field: streetInp, msg: 'Street address required' },
            { field: cityInp, msg: 'City required' },
            { field: dateInp, msg: 'Date required' },
            { field: timeInp, msg: 'Time required' },
            { field: fnameInp, msg: 'First name required' },
            { field: lnameInp, msg: 'Last name required' },
            { field: emailInp, msg: 'Email required' }
        ];
        
        for (let item of finalValidation) {
            if (!item.field || !item.field.value) {
                alert(item.msg);
                item.field?.focus();
                return;
            }
        }
        
        const paymentMethod = paymentSelect ? paymentSelect.value : 'Mobile Money';
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userEmail = user.email || emailInp.value;
        const totalAmount = calculateTotal();
        
        // Create booking object
        const bookingDetails = {
            bookingId: 'BK-' + Date.now(),
            date: new Date().toISOString(),
            cleaners: cleanersInp.value,
            hours: hoursInp.value,
            frequency: freqSelect.value,
            materials: materialsSelect.value,
            propertyType: propertySelect.value,
            address: `${streetInp.value}, ${cityInp.value}`,
            scheduleDate: dateInp.value,
            scheduleTime: timeInp.value,
            customerName: `${fnameInp.value} ${lnameInp.value}`,
            email: userEmail,
            instructions: instructionsInp?.value || '',
            paymentMethod: paymentMethod,
            totalAmount: totalAmount
        };
        
        // Save booking to localStorage
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        bookings.push(bookingDetails);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        // Show success message
        alert(`✅ Booking Confirmed!\n\nBooking ID: ${bookingDetails.bookingId}\nService: ${cleanersInp.value} Cleaner(s) × ${hoursInp.value} Hours\nTotal: TZS ${totalAmount.toLocaleString()}\nPayment: ${paymentMethod}\n\nConfirmation sent to ${userEmail}`);
        
        // Clear form or redirect
        if (confirm('Would you like to start a new booking?')) {
            // Reset form to phase 1
            showPhase('phase1');
            // Clear sensitive data but keep defaults
            instructionsInp.value = '';
            streetInp.value = '';
            cityInp.value = '';
            postal.value = '';
        } else {
            // Redirect to dashboard or home
            window.location.href = 'index.html';
        }
    });
    
    // Initialize summary and set default values
    refreshSummary();
    
    // Set default property if not set
    if (propertySelect && !propertySelect.value) {
        propertySelect.value = 'Apartment';
    }
    
    // Set min date to today
    if (dateInp) {
        const today = new Date().toISOString().split('T')[0];
        dateInp.min = today;
    }
    
    // Clear pending booking flag
    localStorage.removeItem('pendingBooking');
    
    // Log welcome message
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user.email) {
        console.log('✓ Welcome back, ' + user.email);
    }
    
    console.log('✓ Booking system initialized successfully');
})();