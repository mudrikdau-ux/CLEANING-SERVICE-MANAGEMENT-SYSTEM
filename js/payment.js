// ================================================================
// PAYMENT PAGE - COMPLETE JAVASCRIPT
// ================================================================

let selectedMethod = null;
let invoiceData = null;
let bookingId = null;
let invoiceId = null;

// Get invoice ID from URL
function getInvoiceId() {
    const path = window.location.pathname;
    const parts = path.split('/');
    return parts[parts.length - 1];
}

// Load invoice details
async function loadInvoice() {
    invoiceId = getInvoiceId();
    
    if (!invoiceId || invoiceId === 'payment.html' || isNaN(invoiceId)) {
        showError('Invalid invoice ID. Please check your payment link.');
        return;
    }

    try {
        const token = localStorage.getItem('cleanspark_token') || sessionStorage.getItem('cleanspark_token');
        
        if (!token) {
            showError('Please login to make a payment.');
            setTimeout(() => window.location.href = 'login.html', 2000);
            return;
        }

        const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:5000/api'
            : '/api';

        const response = await fetch(`${baseUrl}/bookings/invoices/${invoiceId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                showError('Session expired. Please login again.');
                setTimeout(() => window.location.href = 'login.html', 2000);
                return;
            }
            throw new Error('Failed to load invoice');
        }

        const result = await response.json();
        invoiceData = result.invoice;
        bookingId = invoiceData.booking_id;

        if (!invoiceData) {
            throw new Error('Invoice not found');
        }

        // Populate UI
        document.getElementById('invoiceNumber').textContent = invoiceData.invoice_number || 'N/A';
        document.getElementById('serviceName').textContent = invoiceData.service_name || 'Cleaning Service';
        document.getElementById('dueDate').textContent = invoiceData.due_date ? new Date(invoiceData.due_date).toLocaleDateString() : 'N/A';
        
        const amount = invoiceData.total_amount || 0;
        document.getElementById('totalAmount').textContent = `TZS ${Number(amount).toLocaleString()}`;
        document.getElementById('confirmTotal').textContent = `TZS ${Number(amount).toLocaleString()}`;
        document.getElementById('confirmInvoice').textContent = invoiceData.invoice_number || 'N/A';
        document.getElementById('confirmService').textContent = invoiceData.service_name || 'Cleaning Service';

        // Hide loading, show content
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('paymentContent').style.display = 'block';

    } catch (error) {
        console.error('Load invoice error:', error);
        showError(error.message || 'Failed to load invoice details.');
    }
}

function showError(message) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
    document.getElementById('errorMessage').textContent = message;
}

function retryLoad() {
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('loadingState').style.display = 'block';
    loadInvoice();
}

// Payment method selection
function selectMethod(method) {
    selectedMethod = method;
    document.querySelectorAll('.payment-method-option').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.payment-method-option i').forEach(el => el.style.display = 'none');

    const methodMap = {
        card: { el: 'methodCard', check: 'checkCard', fields: 'cardFields' },
        mobile: { el: 'methodMobile', check: 'checkMobile', fields: 'mobileFields' },
        bank: { el: 'methodBank', check: 'checkBank', fields: 'bankFields' }
    };

    const m = methodMap[method];
    if (m) {
        document.getElementById(m.el).classList.add('selected');
        document.getElementById(m.check).style.display = 'block';
        document.querySelectorAll('#step2 .mb-3, #step2 .row').forEach(el => el.style.display = 'none');
        document.getElementById(m.fields).style.display = 'block';
        document.getElementById(m.fields).querySelectorAll('.mb-3, .row').forEach(el => el.style.display = 'block');
    }

    document.getElementById('step1Btn').disabled = false;
}

// Step navigation
function goToStep1() {
    showStep(1);
}

function goToStep2() {
    if (!selectedMethod) {
        document.getElementById('step1Btn').disabled = true;
        return;
    }
    showStep(2);
}

function goToStep3() {
    // Validate account details
    let accountValue = '';
    if (selectedMethod === 'card') {
        const cardNum = document.getElementById('cardNumber').value.replace(/\s/g, '');
        if (cardNum.length < 16) {
            showToast('Please enter a valid card number', 'error');
            return;
        }
        accountValue = cardNum.slice(-4);
    } else if (selectedMethod === 'mobile') {
        const mobile = document.getElementById('mobileNumber').value;
        if (mobile.length < 10) {
            showToast('Please enter a valid mobile number', 'error');
            return;
        }
        accountValue = mobile;
    } else if (selectedMethod === 'bank') {
        const account = document.getElementById('bankAccount').value;
        if (account.length < 5) {
            showToast('Please enter a valid account number', 'error');
            return;
        }
        accountValue = account;
    }

    document.getElementById('confirmMethod').textContent = {
        card: 'Credit/Debit Card',
        mobile: 'Mobile Money',
        bank: 'Bank Transfer'
    }[selectedMethod] || selectedMethod;

    document.getElementById('confirmAccount').textContent = accountValue || 'N/A';

    showStep(3);
}

function showStep(step) {
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`step${i}`).classList.remove('active');
        document.getElementById(`step${i}Dot`).classList.remove('active', 'completed');
        if (i < step) document.getElementById(`step${i}Dot`).classList.add('completed');
        else if (i === step) document.getElementById(`step${i}Dot`).classList.add('active');
    }
    document.getElementById(`step${step}`).classList.add('active');
    
    // Update lines
    for (let i = 1; i <= 2; i++) {
        const line = document.getElementById(`line${i}`);
        if (line) {
            line.classList.toggle('completed', i < step);
        }
    }

    // Focus first PIN input on step 3
    if (step === 3) {
        setTimeout(() => document.getElementById('pin1').focus(), 300);
    }
}

// PIN input handling
function movePin(current, next) {
    const input = document.getElementById(`pin${current}`);
    if (input.value.length === 1 && next) {
        document.getElementById(`pin${next}`).focus();
    }
    document.getElementById('pinError').style.display = 'none';
}

// Process payment
async function processPayment() {
    // Get PIN
    let pin = '';
    for (let i = 1; i <= 4; i++) {
        pin += document.getElementById(`pin${i}`).value;
    }

    if (pin.length !== 4) {
        document.getElementById('pinError').style.display = 'block';
        return;
    }

    const btn = document.querySelector('#step3 .btn-success');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="loading-spinner"></span> Processing...';

    try {
        const token = localStorage.getItem('cleanspark_token') || sessionStorage.getItem('cleanspark_token');
        if (!token) {
            showToast('Please login first', 'error');
            window.location.href = 'login.html';
            return;
        }

        const baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:5000/api'
            : '/api';

        // 1. Update payment status via callback
        const paymentData = {
            invoice_id: parseInt(invoiceId),
            booking_id: parseInt(bookingId),
            transaction_id: `TXN-${Date.now()}`,
            payment_method: selectedMethod,
            amount_paid: invoiceData.total_amount,
            payment_status: 'completed',
            customer_email: invoiceData.customer_email || 'customer@example.com',
            customer_name: invoiceData.customer_name || 'Customer'
        };

        const callbackResponse = await fetch(`${baseUrl}/payments/callback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData)
        });

        if (!callbackResponse.ok) {
            const err = await callbackResponse.json();
            throw new Error(err.message || 'Payment processing failed');
        }

        const result = await callbackResponse.json();

        if (result.success) {
            // 2. Also update via the regular payment endpoint for history
            await fetch(`${baseUrl}/payments/pay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    booking_id: parseInt(bookingId),
                    amount: invoiceData.total_amount,
                    payment_method: selectedMethod,
                    transaction_id: `TXN-${Date.now()}`,
                    reference: `INV-${invoiceId}`
                })
            }).catch(() => {});

            showPaymentSuccess();
        } else {
            throw new Error(result.message || 'Payment failed');
        }

    } catch (error) {
        console.error('Payment error:', error);
        showToast(error.message || 'Payment failed. Please try again.', 'error');
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function showPaymentSuccess() {
    const content = document.getElementById('paymentContent');
    content.innerHTML = `
        <div class="payment-success">
            <div class="checkmark">✅</div>
            <h3 style="color:#16a34a;font-weight:700;">Payment Successful!</h3>
            <p style="color:#64748b;">Your payment has been confirmed.</p>
            <p style="color:#64748b;font-size:13px;">A confirmation email has been sent to you.</p>
            <div style="margin-top:24px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
                <a href="/tracking.html" class="btn-primary" style="text-decoration:none;display:inline-block;width:auto;padding:10px 24px;">
                    <i class="bi bi-box-arrow-in-right me-2"></i> Go to Dashboard
                </a>
                <a href="/services.html" class="btn-outline" style="text-decoration:none;display:inline-block;padding:10px 24px;border-radius:8px;">
                    <i class="bi bi-plus-circle me-2"></i> Book More Services
                </a>
            </div>
        </div>
    `;
}

function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast-message');
    if (existing) existing.remove();

    const colors = {
        success: '#16a34a',
        error: '#dc2626',
        info: '#1a5276'
    };

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.style.background = colors[type] || colors.info;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// Card number formatting
document.getElementById('cardNumber')?.addEventListener('input', function() {
    let value = this.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.value = formatted;
});

// Expiry date formatting
document.getElementById('expiryDate')?.addEventListener('input', function() {
    let value = this.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
        const month = parseInt(value.slice(0, 2));
        if (month > 12) value = '12' + value.slice(2);
    }
    if (value.length > 2) {
        this.value = value.slice(0, 2) + '/' + value.slice(2);
    } else {
        this.value = value;
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', loadInvoice);

// Make functions globally accessible
window.selectMethod = selectMethod;
window.goToStep1 = goToStep1;
window.goToStep2 = goToStep2;
window.goToStep3 = goToStep3;
window.processPayment = processPayment;
window.movePin = movePin;
window.retryLoad = retryLoad;
window.showStep = showStep;
window.showToast = showToast;