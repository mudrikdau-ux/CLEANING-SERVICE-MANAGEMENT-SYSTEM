// jobapplication.js
// CleanSpark Job Application - fully functional logic with status check, multi-step form, uploads, confetti

(function () {
  // ---- APPLICATION WINDOW STATUS (simulated - can be dynamic) ----
  // Set to true to simulate OPEN window, false for CLOSED
  const APPLICATION_WINDOW_OPEN = true; // Change to false to test closed state

  // ---- State ----
  let currentStep = 1;
  const totalSteps = 3;
  // Store uploaded file names for display
  const uploadedFiles = {};

  // DOM elements
  const dynamicPanel = document.getElementById('dynamicPanel');
  const globalStatusBadge = document.getElementById('globalStatusBadge');
  const globalStatusText = document.getElementById('globalStatusText');
  const confettiCanvas = document.getElementById('confettiCanvas');
  const ctx = confettiCanvas?.getContext('2d');

  // Set current year
  const yearSpan = document.getElementById('currentYear');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // ---- Initialize UI based on window status ----
  function updateGlobalBadge(isOpen) {
    if (!globalStatusBadge || !globalStatusText) return;
    if (isOpen) {
      globalStatusBadge.className = 'status-badge status-open';
      globalStatusText.textContent = 'Applications Open';
    } else {
      globalStatusBadge.className = 'status-badge status-closed';
      globalStatusText.textContent = 'Applications Closed';
    }
  }

  function renderClosedState() {
    dynamicPanel.innerHTML = `
      <div class="closed-card">
        <div class="closed-icon">
          <i class="fas fa-lock"></i>
        </div>
        <h2>Job applications are currently closed.</h2>
        <p>We are not accepting applications at this moment. Please check back later or follow CleanSpark for upcoming opportunities.</p>
        <div style="margin-top: 0.5rem; color: var(--text-muted);">
          <i class="far fa-clock"></i> Next opening: TBD
        </div>
      </div>
    `;
  }

  // ---- Build application form (multi-step) ----
  function renderApplicationForm() {
    dynamicPanel.innerHTML = `
      <div class="form-container" id="applicationFormContainer">
        <!-- Step indicator -->
        <div class="step-progress" id="stepProgress">
          <div class="step active" data-step="1">
            <div class="step-circle">1</div>
            <span class="step-label">Personal</span>
          </div>
          <div class="step" data-step="2">
            <div class="step-circle">2</div>
            <span class="step-label">Experience & Docs</span>
          </div>
          <div class="step" data-step="3">
            <div class="step-circle">3</div>
            <span class="step-label">Review & Submit</span>
          </div>
        </div>

        <!-- Form steps -->
        <form id="jobForm" novalidate>
          <!-- Step 1: Personal Info -->
          <div class="form-step active-step" id="step1">
            <div class="form-grid">
              <div class="form-group">
                <label><i class="fas fa-user"></i> Full Name</label>
                <input type="text" id="fullName" placeholder="John Doe" required>
              </div>
              <div class="form-group">
                <label><i class="fas fa-map-pin"></i> Address</label>
                <input type="text" id="address" placeholder="Street, City" required>
              </div>
              <div class="form-group">
                <label><i class="fas fa-calendar"></i> Age</label>
                <input type="number" id="age" placeholder="18+" min="18" max="80" required>
              </div>
              <div class="form-group">
                <label><i class="fas fa-venus-mars"></i> Gender</label>
                <select id="gender" required>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div class="form-group">
                <label><i class="fas fa-phone"></i> Phone</label>
                <input type="tel" id="phone" placeholder="+1 234 567 890" required>
              </div>
              <div class="form-group">
                <label><i class="fas fa-envelope"></i> Email</label>
                <input type="email" id="email" placeholder="you@example.com" required>
              </div>
            </div>
            <div class="btn-group">
              <button type="button" class="btn btn-primary" id="nextToStep2">Next <i class="fas fa-arrow-right"></i></button>
            </div>
          </div>

          <!-- Step 2: Professional + Documents -->
          <div class="form-step" id="step2">
            <div class="form-grid">
              <div class="form-group">
                <label><i class="fas fa-graduation-cap"></i> Education Level</label>
                <select id="education" required>
                  <option value="">Select</option>
                  <option>High School</option><option>Associate</option><option>Bachelor's</option><option>Master's</option><option>PhD</option>
                </select>
              </div>
              <div class="form-group">
                <label><i class="fas fa-briefcase"></i> Experience (years)</label>
                <input type="text" id="experience" placeholder="e.g., 3 years" required>
              </div>
              <div class="form-group">
                <label><i class="fas fa-tools"></i> Skills</label>
                <input type="text" id="skills" placeholder="e.g., Solar, Python" required>
              </div>
              <div class="form-group">
                <label><i class="fas fa-bullseye"></i> Position Applying For</label>
                <input type="text" id="position" placeholder="Job title" required list="jobList">
                <datalist id="jobList">
                  <option value="Solar Technician">
                  <option value="Energy Analyst">
                  <option value="Project Manager">
                  <option value="Field Engineer">
                </datalist>
              </div>
              <div class="form-group">
                <label><i class="fas fa-clock"></i> Availability</label>
                <select id="availability" required>
                  <option value="">Select</option><option>Immediate</option><option>2 weeks</option><option>1 month</option>
                </select>
              </div>
            </div>
            <div class="form-group full-width" style="margin-top: 0.5rem;">
              <label><i class="fas fa-pencil-alt"></i> Additional Notes</label>
              <textarea id="notes" rows="2" placeholder="Tell us about yourself..."></textarea>
            </div>

            <!-- Document upload section -->
            <div class="upload-section" style="margin-top: 1.8rem;">
              <h4 style="margin-bottom: 0.8rem; display: flex; gap:0.4rem;"><i class="fas fa-paperclip"></i> Supporting Documents</h4>
              <div class="upload-grid" id="uploadGrid">
                <!-- Each upload card generated dynamically for cleaner JS binding -->
              </div>
            </div>
            <div class="btn-group">
              <button type="button" class="btn btn-outline" id="prevToStep1"><i class="fas fa-arrow-left"></i> Back</button>
              <button type="button" class="btn btn-primary" id="nextToStep3">Review <i class="fas fa-arrow-right"></i></button>
            </div>
          </div>

          <!-- Step 3: Review & Submit -->
          <div class="form-step" id="step3">
            <div class="review-card" style="background: #f8fafc; border-radius: 12px; padding: 1.5rem;">
              <h4><i class="fas fa-check-circle"></i> Summary</h4>
              <div id="reviewContent" class="review-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:1rem;">
                <!-- filled by JS -->
              </div>
            </div>
            <div class="btn-group">
              <button type="button" class="btn btn-outline" id="prevToStep2"><i class="fas fa-arrow-left"></i> Back</button>
              <button type="submit" class="btn btn-primary" id="submitApplicationBtn"><i class="fas fa-paper-plane"></i> Submit Application</button>
            </div>
          </div>
        </form>
      </div>
    `;

    // Build upload cards dynamically
    const uploadGrid = document.getElementById('uploadGrid');
    const docTypes = [
      { key: 'cv', label: 'CV / Resume', icon: 'fa-file-pdf' },
      { key: 'nationalId', label: 'National ID', icon: 'fa-id-card' },
      { key: 'introLetter', label: 'Intro Letter', icon: 'fa-file-alt' },
      { key: 'applicationLetter', label: 'Application Letter', icon: 'fa-file-word' },
      { key: 'certificates', label: 'Certificates', icon: 'fa-certificate' },
      { key: 'passportPhoto', label: 'Passport Photo', icon: 'fa-camera' },
      { key: 'other', label: 'Other Docs', icon: 'fa-paperclip' }
    ];

    docTypes.forEach(doc => {
      const card = document.createElement('div');
      card.className = 'upload-card';
      card.dataset.docKey = doc.key;
      card.innerHTML = `<i class="fas ${doc.icon}"></i><span>${doc.label}</span><span class="file-name" id="file-${doc.key}"></span>`;
      const input = document.createElement('input');
      input.type = 'file';
      input.className = 'hidden-file-input';
      input.id = `input-${doc.key}`;
      input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.txt';
      card.appendChild(input);
      
      card.addEventListener('click', (e) => {
        if (e.target.tagName !== 'INPUT') input.click();
      });
      
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          uploadedFiles[doc.key] = file;
          const nameSpan = document.getElementById(`file-${doc.key}`);
          if (nameSpan) nameSpan.textContent = file.name;
        }
      });
      
      uploadGrid.appendChild(card);
    });

    // Attach step navigation
    attachStepNavigation();
    // Pre-fill review on step 3 load
    document.getElementById('nextToStep3')?.addEventListener('click', () => {
      goToStep(3);
      populateReview();
    });
    document.getElementById('prevToStep1')?.addEventListener('click', () => goToStep(1));
    document.getElementById('prevToStep2')?.addEventListener('click', () => goToStep(2));
    document.getElementById('nextToStep2')?.addEventListener('click', () => {
      if (validateStep1()) goToStep(2);
    });

    document.getElementById('jobForm').addEventListener('submit', handleSubmit);
  }

  function attachStepNavigation() {
    // additional listeners if needed
  }

  function goToStep(step) {
    currentStep = step;
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active-step'));
    document.getElementById(`step${step}`).classList.add('active-step');
    
    document.querySelectorAll('.step').forEach(s => {
      const stepNum = parseInt(s.dataset.step);
      s.classList.remove('active', 'completed');
      if (stepNum === step) s.classList.add('active');
      else if (stepNum < step) s.classList.add('completed');
    });
  }

  function validateStep1() {
    const required = ['fullName','address','age','gender','phone','email'];
    let valid = true;
    required.forEach(id => {
      const el = document.getElementById(id);
      if (!el || !el.value.trim()) {
        el?.style?.setProperty('border-color', '#b82e2e');
        valid = false;
      } else {
        el.style.borderColor = '';
      }
    });
    if (!valid) alert('Please fill all required fields in Step 1.');
    return valid;
  }

  function populateReview() {
    const reviewDiv = document.getElementById('reviewContent');
    if (!reviewDiv) return;
    const fields = {
      'Full Name': document.getElementById('fullName')?.value || '-',
      'Email': document.getElementById('email')?.value || '-',
      'Phone': document.getElementById('phone')?.value || '-',
      'Position': document.getElementById('position')?.value || '-',
      'Education': document.getElementById('education')?.value || '-',
      'Experience': document.getElementById('experience')?.value || '-'
    };
    let html = '';
    for (let [key, val] of Object.entries(fields)) {
      html += `<div><strong>${key}:</strong> ${val}</div>`;
    }
    reviewDiv.innerHTML = html;
  }

  function generateReference() {
    return 'CS-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  function launchConfetti() {
    if (!confettiCanvas || !ctx) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    const particles = [];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * confettiCanvas.height - confettiCanvas.height,
        r: Math.random() * 6 + 2,
        d: Math.random() * 30 + 5,
        color: `hsl(${Math.random() * 360}, 80%, 60%)`,
        tilt: Math.random() * 10
      });
    }
    let animationId;
    function draw() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      for (let p of particles) {
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fill();
        p.y += p.d * 0.5;
        p.x += Math.sin(p.tilt) * 0.5;
        if (p.y > confettiCanvas.height) p.y = -10;
      }
      animationId = requestAnimationFrame(draw);
    }
    draw();
    setTimeout(() => {
      cancelAnimationFrame(animationId);
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }, 4000);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const ref = generateReference();
    dynamicPanel.innerHTML = `
      <div class="success-message">
        <div class="checkmark-animated"><i class="fas fa-check-circle"></i></div>
        <h2 style="margin-top:1rem;">Application Submitted!</h2>
        <p>Your reference number:</p>
        <div class="reference-number" style="font-size:1.3rem; margin:1rem 0;">${ref}</div>
        <p style="color: var(--text-muted);">We'll review your application and contact you soon.</p>
        <div class="btn-group" style="justify-content:center; margin-top:2rem;">
          <button class="btn btn-outline" id="downloadSummaryBtn"><i class="fas fa-download"></i> Download Summary</button>
          <button class="btn btn-outline" id="printBtn"><i class="fas fa-print"></i> Print</button>
          <button class="btn btn-primary" id="returnHomeBtn"><i class="fas fa-home"></i> Return Home</button>
        </div>
      </div>
    `;
    launchConfetti();
    document.getElementById('returnHomeBtn')?.addEventListener('click', () => {
      renderApplicationForm();
    });
    document.getElementById('printBtn')?.addEventListener('click', () => window.print());
    document.getElementById('downloadSummaryBtn')?.addEventListener('click', () => {
      alert('Summary download simulated. In production, generate PDF.');
    });
  }

  // ---- Main initialization ----
  updateGlobalBadge(APPLICATION_WINDOW_OPEN);
  if (APPLICATION_WINDOW_OPEN) {
    renderApplicationForm();
  } else {
    renderClosedState();
  }
})();