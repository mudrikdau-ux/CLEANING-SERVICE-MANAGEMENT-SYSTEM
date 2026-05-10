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
  const toastContainer = document.getElementById('toastContainer');

  // Set current year
  const yearSpan = document.getElementById('currentYear');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // ---- Toast notification system ----
  function showToast(message, type = 'error') {
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-exclamation-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    else if (type === 'warning') iconClass = 'fa-exclamation-triangle';
    
    toast.innerHTML = `
      <i class="fas ${iconClass} toast-icon"></i>
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="Close notification">&times;</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Add close button functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      toast.remove();
    });
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 4000);
  }

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
                  <option value="Cleaner">
                  <option value="Office Cleaner">
                  <option value="Housekeeper">
                  <option value="Janitor">
                  <option value="Supervisor">
                  <option value="Cleaning Assistant">
                  <option value="Sanitation Worker">
                  <option value="Floor Cleaner">
                  <option value="Waste Management Staff">
                  <option value="Cleaning Team Leader">
                  <option value="Window Cleaner">
                  <option value="Carpet Cleaner">
                  <option value="Restroom Attendant">
                  <option value="Industrial Cleaner">
                  <option value="Residential Cleaner">
                  <option value="Cleaning Inspector">
                  <option value="Disinfection Specialist">
                  <option value="Laundry Attendant">
                  <option value="Pressure Washer">
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
              <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">All required documents must be uploaded to proceed. <span style="color:var(--danger);">*Required</span></p>
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
            <h4 style="margin-bottom: 1rem;"><i class="fas fa-clipboard-check"></i> Review Your Application</h4>
            <p style="color: var(--text-muted); margin-bottom: 1.2rem; font-size:0.9rem;">Click each section to expand and review your details before submitting.</p>
            <div class="review-accordion" id="reviewAccordion">
              <!-- Accordion items will be populated by populateReview() -->
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
      { key: 'cv', label: 'CV / Resume', icon: 'fa-file-pdf', required: true },
      { key: 'nationalId', label: 'National ID', icon: 'fa-id-card', required: true },
      { key: 'introLetter', label: 'Introduction Letter / Local Government Letter', icon: 'fa-file-alt', required: true },
      { key: 'applicationLetter', label: 'Application Letter', icon: 'fa-file-word', required: false },
      { key: 'certificates', label: 'Certificates', icon: 'fa-certificate', required: false },
      { key: 'passportPhoto', label: 'Passport Size Photo', icon: 'fa-camera', required: true },
      { key: 'other', label: 'Other Documents', icon: 'fa-paperclip', required: false }
    ];

    docTypes.forEach(doc => {
      const card = document.createElement('div');
      card.className = 'upload-card';
      card.dataset.docKey = doc.key;
      card.dataset.required = doc.required;
      card.innerHTML = `
        ${doc.required ? '<span class="required-badge">Required</span>' : '<span class="optional-badge">Optional</span>'}
        <i class="fas ${doc.icon}"></i>
        <span>${doc.label}</span>
        <span class="file-name" id="file-${doc.key}"></span>
      `;
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
          card.classList.add('upload-success');
          card.classList.remove('upload-error');
        } else {
          delete uploadedFiles[doc.key];
          const nameSpan = document.getElementById(`file-${doc.key}`);
          if (nameSpan) nameSpan.textContent = '';
          card.classList.remove('upload-success');
        }
      });
      
      uploadGrid.appendChild(card);
    });

    // Attach step navigation
    attachStepNavigation();
    
    // Step navigation event listeners
    document.getElementById('nextToStep3')?.addEventListener('click', () => {
      if (validateStep2()) {
        goToStep(3);
        populateReview();
      }
    });
    
    document.getElementById('prevToStep1')?.addEventListener('click', () => goToStep(1));
    
    document.getElementById('prevToStep2')?.addEventListener('click', () => goToStep(2));
    
    document.getElementById('nextToStep2')?.addEventListener('click', () => {
      if (validateStep1()) goToStep(2);
    });

    document.getElementById('jobForm').addEventListener('submit', handleSubmit);
  }

  function attachStepNavigation() {
    // Additional listeners if needed
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
    const errorFields = [];
    
    required.forEach(id => {
      const el = document.getElementById(id);
      if (!el || !el.value.trim()) {
        el?.classList.add('input-error');
        valid = false;
        errorFields.push(el?.previousElementSibling?.textContent?.trim() || id);
      } else {
        el?.classList.remove('input-error');
      }
    });
    
    // Additional validation for email format
    const emailEl = document.getElementById('email');
    if (emailEl && emailEl.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
      emailEl.classList.add('input-error');
      valid = false;
      showToast('Please enter a valid email address.', 'error');
      return false;
    }
    
    // Additional validation for age
    const ageEl = document.getElementById('age');
    if (ageEl && ageEl.value.trim()) {
      const age = parseInt(ageEl.value);
      if (isNaN(age) || age < 18 || age > 80) {
        ageEl.classList.add('input-error');
        valid = false;
        showToast('Age must be between 18 and 80 years.', 'warning');
        return false;
      }
    }
    
    if (!valid) {
      showToast('Please complete all required fields before continuing.', 'error');
      
      // Highlight missing fields with animation
      setTimeout(() => {
        required.forEach(id => {
          const el = document.getElementById(id);
          if (!el || !el.value.trim()) {
            el?.classList.add('input-error');
          }
        });
      }, 100);
    }
    
    return valid;
  }
  
  function validateStep2() {
    // Validate required document uploads
    const requiredDocs = ['cv', 'nationalId', 'introLetter', 'passportPhoto'];
    const missingDocs = [];
    let allDocsValid = true;
    
    requiredDocs.forEach(docKey => {
      if (!uploadedFiles[docKey]) {
        allDocsValid = false;
        missingDocs.push(docKey);
        // Highlight the upload card
        const card = document.querySelector(`.upload-card[data-doc-key="${docKey}"]`);
        if (card) {
          card.classList.add('upload-error');
          setTimeout(() => card.classList.remove('upload-error'), 2000);
        }
      }
    });
    
    // Validate other required fields in step 2
    const requiredFields = ['education', 'experience', 'skills', 'position', 'availability'];
    let fieldsValid = true;
    const missingFields = [];
    
    requiredFields.forEach(id => {
      const el = document.getElementById(id);
      if (!el || !el.value.trim()) {
        el?.classList.add('input-error');
        fieldsValid = false;
        missingFields.push(id);
      } else {
        el?.classList.remove('input-error');
      }
    });
    
    if (!allDocsValid && !fieldsValid) {
      showToast('Please complete all required fields and upload all required documents before continuing.', 'error');
      return false;
    } else if (!allDocsValid) {
      showToast('Please upload all required documents: CV/Resume, National ID, Introduction Letter, and Passport Photo.', 'error');
      return false;
    } else if (!fieldsValid) {
      showToast('Please complete all required fields in this section before continuing.', 'error');
      return false;
    }
    
    return true;
  }

  function populateReview() {
    const accordion = document.getElementById('reviewAccordion');
    if (!accordion) return;
    
    const formData = getFormData();
    const documentsData = getDocumentsData();
    
    // Create accordion sections
    const sections = [
      {
        title: 'Personal Information',
        icon: 'fa-user',
        data: [
          { label: 'Full Name', value: formData.fullName },
          { label: 'Email', value: formData.email },
          { label: 'Phone', value: formData.phone },
          { label: 'Address', value: formData.address },
          { label: 'Age', value: formData.age },
          { label: 'Gender', value: formData.gender }
        ]
      },
      {
        title: 'Professional Details',
        icon: 'fa-briefcase',
        data: [
          { label: 'Position Applying For', value: formData.position },
          { label: 'Education', value: formData.education },
          { label: 'Experience', value: formData.experience },
          { label: 'Skills', value: formData.skills },
          { label: 'Availability', value: formData.availability },
          { label: 'Additional Notes', value: formData.notes || 'None provided' }
        ]
      },
      {
        title: 'Uploaded Documents',
        icon: 'fa-paperclip',
        data: documentsData
      }
    ];
    
    // Build the accordion HTML
    accordion.innerHTML = '';
    
    sections.forEach((section, index) => {
      const accordionItem = document.createElement('div');
      accordionItem.className = 'review-accordion-item';
      
      // Create header
      const header = document.createElement('div');
      header.className = 'review-accordion-header';
      header.innerHTML = `
        <div class="section-title-text">
          <i class="fas ${section.icon} section-icon"></i>
          <span>${section.title}</span>
        </div>
        <i class="fas fa-chevron-down expand-icon"></i>
      `;
      
      // Create body
      const body = document.createElement('div');
      body.className = 'review-accordion-body';
      
      const detailGrid = document.createElement('div');
      detailGrid.className = 'review-detail-grid';
      
      section.data.forEach(item => {
        const detailItem = document.createElement('div');
        detailItem.className = 'review-detail-item';
        detailItem.innerHTML = `
          <span class="review-detail-label">${item.label}</span>
          <span class="review-detail-value">${item.value}</span>
        `;
        detailGrid.appendChild(detailItem);
      });
      
      body.appendChild(detailGrid);
      accordionItem.appendChild(header);
      accordionItem.appendChild(body);
      accordion.appendChild(accordionItem);
      
      // Add click event listener to the header
      header.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const item = this.parentElement;
        const isExpanded = item.classList.contains('expanded');
        
        // Close all other accordion items
        accordion.querySelectorAll('.review-accordion-item').forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('expanded');
          }
        });
        
        // Toggle current item
        if (isExpanded) {
          item.classList.remove('expanded');
        } else {
          item.classList.add('expanded');
        }
      });
    });
  }
  
  function getFormData() {
    return {
      fullName: document.getElementById('fullName')?.value || '-',
      email: document.getElementById('email')?.value || '-',
      phone: document.getElementById('phone')?.value || '-',
      address: document.getElementById('address')?.value || '-',
      age: document.getElementById('age')?.value || '-',
      gender: document.getElementById('gender')?.value || '-',
      position: document.getElementById('position')?.value || '-',
      education: document.getElementById('education')?.value || '-',
      experience: document.getElementById('experience')?.value || '-',
      skills: document.getElementById('skills')?.value || '-',
      availability: document.getElementById('availability')?.value || '-',
      notes: document.getElementById('notes')?.value || ''
    };
  }
  
  function getDocumentsData() {
    const docs = [
      { key: 'cv', label: 'CV / Resume' },
      { key: 'nationalId', label: 'National ID' },
      { key: 'introLetter', label: 'Introduction Letter' },
      { key: 'applicationLetter', label: 'Application Letter' },
      { key: 'certificates', label: 'Certificates' },
      { key: 'passportPhoto', label: 'Passport Photo' },
      { key: 'other', label: 'Other Documents' }
    ];
    
    return docs.map(doc => ({
      label: doc.label,
      value: uploadedFiles[doc.key] ? uploadedFiles[doc.key].name : 'Not uploaded'
    }));
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
        <h2 style="margin-top:1rem;">Application Submitted Successfully!</h2>
        <div class="success-card">
          <p style="font-size: 1.1rem; font-weight: 500; color: var(--text-main); margin-bottom: 0.8rem;">
            <i class="fas fa-envelope" style="color: var(--success);"></i> 
            We'll review your application and contact or email you soon.
          </p>
          <p style="color: var(--text-muted);">Thank you for your interest in joining CleanSpark!</p>
        </div>
        <p>Your reference number:</p>
        <div class="reference-number" style="font-size:1.3rem; margin:1rem 0;">${ref}</div>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Please save this number for future reference.</p>
        <div class="btn-group" style="justify-content:center; margin-top:2rem;">
          <button class="btn btn-outline" id="downloadSummaryBtn"><i class="fas fa-download"></i> Download Summary</button>
          <button class="btn btn-outline" id="printBtn"><i class="fas fa-print"></i> Print</button>
          <button class="btn btn-primary" id="returnHomeBtn"><i class="fas fa-home"></i> Return Home</button>
        </div>
      </div>
    `;
    launchConfetti();
    showToast('Application submitted successfully! Reference: ' + ref, 'success');
    
    document.getElementById('returnHomeBtn')?.addEventListener('click', () => {
      renderApplicationForm();
      // Reset uploaded files
      for (let key in uploadedFiles) {
        delete uploadedFiles[key];
      }
    });
    document.getElementById('printBtn')?.addEventListener('click', () => window.print());
    document.getElementById('downloadSummaryBtn')?.addEventListener('click', () => {
      showToast('Summary download feature will be available soon.', 'warning');
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