// ========== ENHANCED BOOKING WITH FULL PAYMENT PROCESSING & RECEIPT FEATURES ==========

(function() {
    'use strict';
    
    // Check login
    function isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }
    
    if (!isLoggedIn()) {
        localStorage.setItem('pendingBooking', JSON.stringify({ attempted: true, timestamp: new Date().toISOString() }));
        alert('Please login to continue with booking');
        window.location.href = 'login.html';
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
    
    // Payment related
    let selectedPaymentMethod = null;
    let selectedProvider = null;
    let currentBookingData = null;
    let receiptModal = null;
    let shareModal = null;
    
    // Mobile Money Providers
    const mobileProviders = ['M-PESA', 'AIRTEL Money', 'Tigo Pesa', 'HaloPesa', 'Azam Pesa', 'YAS'];
    // Bank Providers
    const bankProviders = ['CRDB Bank', 'NMB Bank', 'NBC Bank', 'Stanbic', 'Absa', 'Exim Bank'];
    
    // Calculate total price
    function calculateTotal() {
        let cleaners = parseInt(cleanersInp.value) || 1;
        let hours = parseInt(hoursInp.value) || 0;
        let basePrice = cleaners * hours * 20000;
        if (materialsSelect.value === 'Yes') basePrice += 10000;
        if (freqSelect.value === 'Weekly' || freqSelect.value === 'Multiple') basePrice = basePrice * 0.95;
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
        reviewDiv.innerHTML = `
            <div class="review-row"><span><i class="fas fa-broom"></i> Service:</span><strong>${cleaners} cleaner(s) × ${hours} hours (${freqSelect.value})</strong></div>
            <div class="review-row"><span><i class="fas fa-box"></i> Materials:</span><strong>${materialsSelect.value}</strong></div>
            <div class="review-row"><span><i class="fas fa-home"></i> Address:</span><strong>${addr} (${propertySelect.value || 'Not selected'})</strong></div>
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
            refreshSummary();
            updateProgress(phaseId);
            if (window.innerWidth <= 768) document.querySelector('.phase-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    function validatePhase(currentPhaseId) {
        switch(currentPhaseId) {
            case 'phase1':
                if (!cleanersInp.value || cleanersInp.value < 1) { alert('Please enter number of cleaners'); cleanersInp.focus(); return false; }
                if (!hoursInp.value || hoursInp.value < 1) { alert('Please enter number of hours'); hoursInp.focus(); return false; }
                break;
            case 'phase2':
                if (!propertySelect.value) { alert('Please select a property type'); propertySelect.focus(); return false; }
                break;
            case 'phase3':
                if (!streetInp.value || !cityInp.value) { alert('Please enter your full address'); streetInp.focus(); return false; }
                break;
            case 'phase4':
                if (!dateInp.value) { alert('Please select a date'); dateInp.focus(); return false; }
                if (!timeInp.value) { alert('Please select a time'); timeInp.focus(); return false; }
                const selectedDate = new Date(dateInp.value);
                const today = new Date(); today.setHours(0,0,0,0);
                if (selectedDate < today) { alert('Please select a future date'); dateInp.focus(); return false; }
                break;
            case 'phase5':
                if (!fnameInp.value.trim()) { alert('Please enter first name'); fnameInp.focus(); return false; }
                if (!lnameInp.value.trim()) { alert('Please enter last name'); lnameInp.focus(); return false; }
                if (!emailInp.value.trim()) { alert('Please enter email'); emailInp.focus(); return false; }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInp.value)) { alert('Please enter valid email'); emailInp.focus(); return false; }
                break;
        }
        return true;
    }
    
    // Payment UI: Render provider selection based on method
    function renderPaymentDetails(method) {
        const container = document.getElementById('paymentDetailsContainer');
        if (!container) return;
        
        let providers = [];
        let title = '';
        let placeholder = '';
        
        if (method === 'mobile_money') {
            providers = mobileProviders;
            title = 'Select Mobile Money Provider';
            placeholder = 'Enter Mobile Money number (e.g., 0712345678)';
        } else if (method === 'bank_transfer') {
            providers = bankProviders;
            title = 'Select Bank';
            placeholder = 'Enter Account Number';
        } else if (method === 'card') {
            title = 'Card Details';
            placeholder = 'Enter Card Number (16 digits)';
        }
        
        let html = `<h6 class="mb-3">${title}</h6>`;
        
        if (providers.length > 0) {
            html += `<div class="provider-grid" id="providerGrid">`;
            providers.forEach(prov => {
                html += `<div class="provider-btn" data-provider="${prov}"><strong>${prov}</strong></div>`;
            });
            html += `</div>`;
        }
        
        html += `<div class="mb-3">
            <label class="form-label">${method === 'card' ? 'Card Number' : (method === 'mobile_money' ? 'Mobile Number' : 'Account Number')}</label>
            <input type="text" id="paymentAccount" class="form-control" placeholder="${placeholder}">
        </div>`;
        
        html += `<div class="mb-3">
            <label class="form-label">Security PIN / Password</label>
            <input type="password" id="paymentPin" class="form-control" placeholder="Enter your secure PIN">
        </div>`;
        
        html += `<button type="button" id="processPaymentBtn" class="btn btn-success w-100 mt-2">Confirm Payment</button>`;
        
        container.innerHTML = html;
        
        // Add provider click handlers
        if (providers.length > 0) {
            document.querySelectorAll('.provider-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.provider-btn').forEach(b => b.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedProvider = this.getAttribute('data-provider');
                });
            });
        }
        
        document.getElementById('processPaymentBtn').addEventListener('click', () => processPayment(method));
    }
    
    function processPayment(method) {
        const accountInput = document.getElementById('paymentAccount');
        const pinInput = document.getElementById('paymentPin');
        
        if (!accountInput?.value.trim()) {
            alert(`Please enter your ${method === 'card' ? 'card number' : (method === 'mobile_money' ? 'mobile number' : 'account number')}`);
            return;
        }
        if (!pinInput?.value.trim()) {
            alert('Please enter your security PIN/password');
            return;
        }
        
        if (method === 'mobile_money' && !selectedProvider) {
            alert('Please select a mobile money provider');
            return;
        }
        if (method === 'bank_transfer' && !selectedProvider) {
            alert('Please select a bank');
            return;
        }
        
        // For demo, any PIN works. In real system, validate with backend.
        const totalAmount = calculateTotal();
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        const paymentStatus = 'completed';
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
            scheduleDate: dateInp.value,
            scheduleTime: timeInp.value,
            customerName: `${fnameInp.value} ${lnameInp.value}`,
            email: emailInp.value,
            phone: document.getElementById('phone')?.value || '',
            instructions: instructionsInp?.value || '',
            paymentMethod: method === 'mobile_money' ? `Mobile Money (${selectedProvider})` : (method === 'bank_transfer' ? `Bank Transfer (${selectedProvider})` : (method === 'card' ? 'Visa/Mastercard' : 'Cash')),
            totalAmount: totalAmount,
            paymentStatus: paymentStatus,
            transactionId: transactionId,
            paymentAccount: accountInput.value.slice(-4),
            paidAt: new Date().toISOString()
        };
        
        // Save booking
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        bookings.push(bookingData);
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        currentBookingData = bookingData;
        showReceipt(bookingData);
    }
    
    function processCashPayment() {
        const totalAmount = calculateTotal();
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        const bookingData = {
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
            email: emailInp.value,
            phone: document.getElementById('phone')?.value || '',
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
        
        // Also store in pending cash payments for staff
        const pendingCash = JSON.parse(localStorage.getItem('pendingCashPayments') || '[]');
        pendingCash.push({ bookingId: bookingData.bookingId, customerName: bookingData.customerName, amount: totalAmount, address: bookingData.address });
        localStorage.setItem('pendingCashPayments', JSON.stringify(pendingCash));
        
        currentBookingData = bookingData;
        showReceipt(bookingData);
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
    
    // ========== RECEIPT DOWNLOAD FUNCTIONALITY ==========
    function downloadReceipt() {
        const receiptContent = document.getElementById('receiptContent');
        
        // Create a clean clone for downloading
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
            
            // Convert to image and download
            const link = document.createElement('a');
            link.download = `CleanSpark_Receipt_${currentBookingData?.bookingId || 'booking'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // Show success toast
            showToast('Receipt downloaded successfully!', 'success');
        }).catch(error => {
            console.error('Download failed:', error);
            // Fallback: print-friendly version
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                <head>
                    <title>CSMS Receipt</title>
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
    
    // Make shareVia available globally for onclick handlers
    window.shareVia = function(platform) {
        if (!currentBookingData) return;
        
        const booking = currentBookingData;
        const shareText = `CSMS Cleaning Service Booking Confirmed!\n\nBooking ID: ${booking.bookingId}\nService: ${booking.cleaners} cleaner(s) × ${booking.hours} hrs\nDate: ${booking.scheduleDate} at ${booking.scheduleTime}\nAmount: TZS ${booking.totalAmount.toLocaleString()}\n\nThank you for choosing CSMS!`;
        const shareUrl = `https://csms.co.tz/booking/${booking.bookingId}`;
        
        let url = '';
        
        switch(platform) {
            case 'whatsapp':
                url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
                window.open(url, '_blank');
                break;
            case 'email':
                url = `mailto:?subject=CSMS Booking Confirmation - ${booking.bookingId}&body=${encodeURIComponent(shareText + '\n\nView details: ' + shareUrl)}`;
                window.location.href = url;
                break;
            case 'sms':
                url = `sms:?body=${encodeURIComponent(shareText)}`;
                window.location.href = url;
                break;
            case 'copy':
                navigator.clipboard.writeText(shareText + '\n\n' + shareUrl).then(() => {
                    showToast('Receipt details copied to clipboard!', 'success');
                }).catch(() => {
                    showToast('Failed to copy. Please try again.', 'error');
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
        
        // Close share modal if open
        if (shareModal) {
            shareModal.hide();
        }
    };
    
    // Toast notification
    function showToast(message, type = 'success') {
        // Remove existing toast
        const existingToast = document.querySelector('.custom-toast');
        if (existingToast) existingToast.remove();
        
        const toast = document.createElement('div');
        toast.className = 'custom-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: ${type === 'success' ? '#198754' : '#dc3545'};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 9999;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Add animation styles dynamically
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(styleSheet);
    
    // Payment method selection handlers
    function initPaymentSelection() {
        const paymentCards = document.querySelectorAll('.payment-option-card');
        paymentCards.forEach(card => {
            card.addEventListener('click', function() {
                paymentCards.forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                selectedPaymentMethod = this.getAttribute('data-method');
                
                if (selectedPaymentMethod === 'cash') {
                    const container = document.getElementById('paymentDetailsContainer');
                    container.innerHTML = `
                        <div class="alert alert-warning">
                            <i class="fas fa-info-circle"></i> Cash payment (+TZS 5,000) will be collected by our staff on arrival.
                            Payment will remain pending until staff validates.
                        </div>
                        <button type="button" id="confirmCashBtn" class="btn btn-success w-100">Confirm Cash Booking</button>
                    `;
                    document.getElementById('confirmCashBtn').addEventListener('click', () => processCashPayment());
                } else {
                    renderPaymentDetails(selectedPaymentMethod);
                }
            });
        });
    }
    
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
    
    const liveInputs = [cleanersInp, hoursInp, freqSelect, materialsSelect, propertySelect, streetInp, cityInp, dateInp, timeInp, fnameInp, lnameInp, emailInp, instructionsInp];
    liveInputs.forEach(inp => { if (inp) { inp.addEventListener('input', refreshSummary); inp.addEventListener('change', refreshSummary); } });
    
    bookingForm.addEventListener('submit', (e) => e.preventDefault());
    
    // Set min date and defaults
    if (dateInp) {
        const today = new Date().toISOString().split('T')[0];
        dateInp.min = today;
        dateInp.value = today;
    }
    if (timeInp) timeInp.value = '09:00';
    if (fnameInp) fnameInp.value = '';
    if (lnameInp) lnameInp.value = '';
    if (emailInp && !emailInp.value) {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (user.email) emailInp.value = user.email;
    }
    if (propertySelect && !propertySelect.value) propertySelect.value = 'Apartment';
    
    refreshSummary();
    updateProgress('phase1');
    initPaymentSelection();
    
    // Receipt modal buttons
    document.getElementById('closeReceiptBtn')?.addEventListener('click', () => {
        receiptModal?.hide();
        window.location.href = 'index.html';
    });
    document.getElementById('moreBookingBtn')?.addEventListener('click', () => {
        receiptModal?.hide();
        window.location.href = 'service.html';
        // Reset form to phase 1
        instructionsInp.value = '';
        streetInp.value = '';
        cityInp.value = '';
        selectedPaymentMethod = null;
        selectedProvider = null;
        document.getElementById('paymentDetailsContainer').innerHTML = '';
        document.querySelectorAll('.payment-option-card').forEach(c => c.classList.remove('selected'));
        showPhase('phase1');
        refreshSummary();
    });
    
    // Download receipt button
    document.getElementById('downloadReceiptBtn')?.addEventListener('click', () => {
        downloadReceipt();
    });
    
    // Share receipt button
    document.getElementById('shareReceiptBtn')?.addEventListener('click', () => {
        shareReceiptModal();
    });
    
    localStorage.removeItem('pendingBooking');
    console.log('✓ Enhanced booking system with receipt download & share features ready');
})();