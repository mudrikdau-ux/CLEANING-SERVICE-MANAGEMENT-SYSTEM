// jobapplication.js - FULLY INTEGRATED WITH BACKEND
// CleanSpark Job Application with Backend API Integration

(function () {
  // ===== BACKEND API ENDPOINTS =====
  // GET /api/jobs/settings - Get application settings (is_open, deadline, positions_available, min_age, max_age)
  // GET /api/jobs - Get all applications (admin)
  // POST /api/jobs/apply - Submit application with files
  // GET /api/jobs/track/:reference - Track application by reference
  // GET /api/jobs/stats - Get application statistics (admin)
  // PUT /api/jobs/settings - Update application settings (admin)

  // ===== STATE =====
  let currentStep = 1;
  const totalSteps = 3;
  let uploadedFiles = {};
  let currentView = 'form';
  let applicationSettings = {
    is_open: true,
    application_deadline: null,
    positions_available: [],
    min_age: 18,
    max_age: 60
  };
  let isLoading = false;

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

  // ===== TOAST NOTIFICATION =====
  function showToast(message, type = 'error') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let iconClass = type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${iconClass} toast-icon"></i><span class="toast-message">${escapeHtml(message)}</span><button class="toast-close">&times;</button>`;
    toastContainer.appendChild(toast);
    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 5000);
  }

  function escapeHtml(str) { if (!str) return ''; return str.replace(/[&<>]/g, function(m) { if (m === '&') return '&amp;'; if (m === '<') return '&lt;'; if (m === '>') return '&gt;'; return m; }); }

  // ===== LOAD APPLICATION SETTINGS FROM BACKEND =====
  async function loadApplicationSettings() {
    try {
      const response = await API.jobApplications.getSettings();
      if (response.success && response.settings) {
        applicationSettings = response.settings;
        updateGlobalBadge(applicationSettings.is_open);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading settings:', error);
      applicationSettings.is_open = true;
      updateGlobalBadge(true);
      return false;
    }
  }

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

  function checkDeadline() {
    if (applicationSettings.application_deadline && new Date(applicationSettings.application_deadline) < new Date()) {
      applicationSettings.is_open = false;
      updateGlobalBadge(false);
      return false;
    }
    return true;
  }

  // ===== RENDER CLOSED STATE =====
  function renderClosedState() {
    currentView = 'closed';
    dynamicPanel.innerHTML = `
      <div class="closed-card">
        <div class="closed-icon"><i class="fas fa-lock"></i></div>
        <h2>Job applications are currently closed.</h2>
        <p>We are not accepting applications at this moment. Please check back later or follow CleanSpark for upcoming opportunities.</p>
        <div style="margin-top: 0.5rem; color: var(--text-muted);"><i class="far fa-clock"></i> Deadline: ${applicationSettings.application_deadline || 'TBD'}</div>
        <button class="btn btn-outline" id="goToTrackingFromClosed" style="margin-top: 1rem;"><i class="fas fa-search"></i> Track Existing Application</button>
      </div>
    `;
    document.getElementById('goToTrackingFromClosed')?.addEventListener('click', () => renderTrackingInterface());
  }

  // ===== RENDER APPLICATION FORM =====
  function renderApplicationForm() {
    currentView = 'form';
    dynamicPanel.innerHTML = `
      <div class="form-container" id="applicationFormContainer">
        <div class="step-progress" id="stepProgress">
          <div class="step active" data-step="1"><div class="step-circle">1</div><span class="step-label">Personal</span></div>
          <div class="step" data-step="2"><div class="step-circle">2</div><span class="step-label">Experience & Docs</span></div>
          <div class="step" data-step="3"><div class="step-circle">3</div><span class="step-label">Review & Submit</span></div>
        </div>
        <form id="jobForm" novalidate>
          <div class="form-step active-step" id="step1">
            <div class="form-grid">
              <div class="form-group"><label><i class="fas fa-user"></i> Full Name <span class="required-star">*</span></label><input type="text" id="fullName" placeholder="John Doe" required></div>
              <div class="form-group"><label><i class="fas fa-map-pin"></i> Address <span class="required-star">*</span></label><input type="text" id="address" placeholder="Street, City" required></div>
              <div class="form-group"><label><i class="fas fa-calendar"></i> Age <span class="required-star">*</span></label><input type="number" id="age" placeholder="18+" min="18" max="80" required></div>
              <div class="form-group"><label><i class="fas fa-venus-mars"></i> Gender <span class="required-star">*</span></label><select id="gender" required><option value="">Select...</option><option value="Male">Male</option><option value="Female">Female</option><option value="Non-binary">Non-binary</option><option value="Prefer not to say">Prefer not to say</option></select></div>
              <div class="form-group"><label><i class="fas fa-phone"></i> Phone <span class="required-star">*</span></label><input type="tel" id="phone" placeholder="+255 XXX XXX XXX" required></div>
              <div class="form-group"><label><i class="fas fa-envelope"></i> Email <span class="required-star">*</span></label><input type="email" id="email" placeholder="you@example.com" required></div>
            </div>
            <div class="btn-group"><button type="button" class="btn btn-primary" id="nextToStep2">Next <i class="fas fa-arrow-right"></i></button></div>
          </div>

          <div class="form-step" id="step2">
            <div class="form-grid">
              <div class="form-group"><label><i class="fas fa-graduation-cap"></i> Education Level <span class="required-star">*</span></label><select id="education" required><option value="">Select</option><option>High School</option><option>Associate</option><option>Bachelor's</option><option>Master's</option><option>PhD</option></select></div>
              <div class="form-group"><label><i class="fas fa-briefcase"></i> Experience (years) <span class="required-star">*</span></label><input type="text" id="experience" placeholder="e.g., 3 years" required></div>
              <div class="form-group"><label><i class="fas fa-tools"></i> Skills <span class="required-star">*</span></label><input type="text" id="skills" placeholder="Cleaning, Organization, Time management" required></div>
              <div class="form-group"><label><i class="fas fa-bullseye"></i> Position Applying For <span class="required-star">*</span></label><input type="text" id="position" placeholder="Job title" required list="jobList"><datalist id="jobList"><option value="Cleaner"><option value="Office Cleaner"><option value="Housekeeper"><option value="Janitor"><option value="Supervisor"><option value="Cleaning Assistant"><option value="Window Cleaner"><option value="Carpet Cleaner"><option value="Industrial Cleaner"><option value="Residential Cleaner"></datalist></div>
              <div class="form-group"><label><i class="fas fa-clock"></i> Availability <span class="required-star">*</span></label><select id="availability" required><option value="">Select</option><option>Immediate</option><option>2 weeks</option><option>1 month</option></select></div>
            </div>
            <div class="form-group full-width" style="margin-top: 0.5rem;"><label><i class="fas fa-pencil-alt"></i> Additional Notes</label><textarea id="notes" rows="2" placeholder="Tell us about yourself..."></textarea></div>

            <div class="upload-section" style="margin-top: 1.8rem;">
              <h4 style="margin-bottom: 0.8rem;"><i class="fas fa-paperclip"></i> Supporting Documents</h4>
              <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">All required documents must be uploaded to proceed. <span style="color:var(--danger);">*Required</span></p>
              <div class="upload-grid" id="uploadGrid"></div>
            </div>
            <div class="btn-group">
              <button type="button" class="btn btn-outline" id="prevToStep1"><i class="fas fa-arrow-left"></i> Back</button>
              <button type="button" class="btn btn-primary" id="nextToStep3">Review <i class="fas fa-arrow-right"></i></button>
            </div>
          </div>

          <div class="form-step" id="step3">
            <h4 style="margin-bottom: 1rem;"><i class="fas fa-clipboard-check"></i> Review Your Application</h4>
            <p style="color: var(--text-muted); margin-bottom: 1.2rem;">Click each section to expand and review your details before submitting.</p>
            <div class="review-accordion" id="reviewAccordion"></div>
            <div class="btn-group">
              <button type="button" class="btn btn-outline" id="prevToStep2"><i class="fas fa-arrow-left"></i> Back</button>
              <button type="submit" class="btn btn-primary" id="submitApplicationBtn"><i class="fas fa-paper-plane"></i> Submit Application</button>
            </div>
          </div>
        </form>
      </div>
    `;

    buildUploadCards();
    attachStepNavigation();
    
    document.getElementById('nextToStep3')?.addEventListener('click', () => { if (validateStep2()) { goToStep(3); populateReview(); } });
    document.getElementById('prevToStep1')?.addEventListener('click', () => goToStep(1));
    document.getElementById('prevToStep2')?.addEventListener('click', () => goToStep(2));
    document.getElementById('nextToStep2')?.addEventListener('click', () => { if (validateStep1()) goToStep(2); });
    document.getElementById('jobForm').addEventListener('submit', handleSubmit);
  }

  function buildUploadCards() {
    const uploadGrid = document.getElementById('uploadGrid');
    if (!uploadGrid) return;
    const docTypes = [
      { key: 'cv', label: 'CV / Resume', icon: 'fa-file-pdf', required: true },
      { key: 'nationalId', label: 'National ID', icon: 'fa-id-card', required: true },
      { key: 'introductionLetter', label: 'Introduction Letter', icon: 'fa-file-alt', required: true },
      { key: 'passportPhoto', label: 'Passport Size Photo', icon: 'fa-camera', required: true },
      { key: 'applicationLetter', label: 'Application Letter', icon: 'fa-file-word', required: false },
      { key: 'certificate', label: 'Certificate', icon: 'fa-certificate', required: false },
      { key: 'other', label: 'Other Documents', icon: 'fa-paperclip', required: false }
    ];
    uploadGrid.innerHTML = '';
    docTypes.forEach(doc => {
      const card = document.createElement('div');
      card.className = 'upload-card';
      card.dataset.docKey = doc.key;
      card.dataset.required = doc.required;
      card.innerHTML = `${doc.required ? '<span class="required-badge">Required</span>' : '<span class="optional-badge">Optional</span>'}<i class="fas ${doc.icon}"></i><span>${doc.label}</span><span class="file-name" id="file-${doc.key}"></span>`;
      const input = document.createElement('input');
      input.type = 'file';
      input.className = 'hidden-file-input';
      input.id = `input-${doc.key}`;
      input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
      card.appendChild(input);
      card.addEventListener('click', (e) => { if (e.target.tagName !== 'INPUT') input.click(); });
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) { uploadedFiles[doc.key] = file; document.getElementById(`file-${doc.key}`).textContent = file.name; card.classList.add('upload-success'); }
        else { delete uploadedFiles[doc.key]; document.getElementById(`file-${doc.key}`).textContent = ''; card.classList.remove('upload-success'); }
      });
      uploadGrid.appendChild(card);
    });
  }

  function goToStep(step) {
    currentStep = step;
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active-step'));
    document.getElementById(`step${step}`).classList.add('active-step');
    document.querySelectorAll('.step').forEach(s => { const stepNum = parseInt(s.dataset.step); s.classList.remove('active', 'completed'); if (stepNum === step) s.classList.add('active'); else if (stepNum < step) s.classList.add('completed'); });
  }

  function attachStepNavigation() {}

  function validateStep1() {
    const required = ['fullName','address','age','gender','phone','email'];
    let valid = true;
    required.forEach(id => { const el = document.getElementById(id); if (!el || !el.value.trim()) { el?.classList.add('input-error'); valid = false; } else { el?.classList.remove('input-error'); } });
    const emailEl = document.getElementById('email');
    if (emailEl && emailEl.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) { emailEl.classList.add('input-error'); valid = false; showToast('Please enter a valid email address.', 'error'); return false; }
    const ageEl = document.getElementById('age');
    if (ageEl && ageEl.value.trim()) { const age = parseInt(ageEl.value); if (isNaN(age) || age < applicationSettings.min_age || age > applicationSettings.max_age) { ageEl.classList.add('input-error'); valid = false; showToast(`Age must be between ${applicationSettings.min_age} and ${applicationSettings.max_age}.`, 'warning'); return false; } }
    if (!valid) showToast('Please complete all required fields.', 'error');
    return valid;
  }

  function validateStep2() {
    const requiredDocs = ['cv', 'nationalId', 'introductionLetter', 'passportPhoto'];
    let allDocsValid = true;
    requiredDocs.forEach(docKey => { if (!uploadedFiles[docKey]) { allDocsValid = false; const card = document.querySelector(`.upload-card[data-doc-key="${docKey}"]`); if (card) { card.classList.add('upload-error'); setTimeout(() => card.classList.remove('upload-error'), 2000); } } });
    const requiredFields = ['education', 'experience', 'skills', 'position', 'availability'];
    let fieldsValid = true;
    requiredFields.forEach(id => { const el = document.getElementById(id); if (!el || !el.value.trim()) { el?.classList.add('input-error'); fieldsValid = false; } else { el?.classList.remove('input-error'); } });
    if (!allDocsValid) { showToast('Please upload all required documents.', 'error'); return false; }
    if (!fieldsValid) { showToast('Please complete all required fields.', 'error'); return false; }
    return true;
  }

  function populateReview() {
    const accordion = document.getElementById('reviewAccordion');
    if (!accordion) return;
    const formData = getFormData();
    const documentsData = getDocumentsData();
    const sections = [
      { title: 'Personal Information', icon: 'fa-user', data: [{ label: 'Full Name', value: formData.fullName }, { label: 'Email', value: formData.email }, { label: 'Phone', value: formData.phone }, { label: 'Address', value: formData.address }, { label: 'Age', value: formData.age }, { label: 'Gender', value: formData.gender }] },
      { title: 'Professional Details', icon: 'fa-briefcase', data: [{ label: 'Position', value: formData.position }, { label: 'Education', value: formData.education }, { label: 'Experience', value: formData.experience }, { label: 'Skills', value: formData.skills }, { label: 'Availability', value: formData.availability }, { label: 'Notes', value: formData.notes || 'None' }] },
      { title: 'Uploaded Documents', icon: 'fa-paperclip', data: documentsData }
    ];
    accordion.innerHTML = '';
    sections.forEach((section, index) => {
      const accordionItem = document.createElement('div'); accordionItem.className = 'review-accordion-item';
      const header = document.createElement('div'); header.className = 'review-accordion-header'; header.innerHTML = `<div class="section-title-text"><i class="fas ${section.icon} section-icon"></i><span>${section.title}</span></div><i class="fas fa-chevron-down expand-icon"></i>`;
      const body = document.createElement('div'); body.className = 'review-accordion-body';
      const detailGrid = document.createElement('div'); detailGrid.className = 'review-detail-grid';
      section.data.forEach(item => { const detailItem = document.createElement('div'); detailItem.className = 'review-detail-item'; detailItem.innerHTML = `<span class="review-detail-label">${item.label}</span><span class="review-detail-value">${escapeHtml(item.value)}</span>`; detailGrid.appendChild(detailItem); });
      body.appendChild(detailGrid);
      accordionItem.appendChild(header); accordionItem.appendChild(body); accordion.appendChild(accordionItem);
      header.addEventListener('click', function() { const item = this.parentElement; const isExpanded = item.classList.contains('expanded'); accordion.querySelectorAll('.review-accordion-item').forEach(otherItem => { if (otherItem !== item) otherItem.classList.remove('expanded'); }); if (isExpanded) item.classList.remove('expanded'); else item.classList.add('expanded'); });
    });
  }

  function getFormData() { return { fullName: document.getElementById('fullName')?.value || '-', email: document.getElementById('email')?.value || '-', phone: document.getElementById('phone')?.value || '-', address: document.getElementById('address')?.value || '-', age: document.getElementById('age')?.value || '-', gender: document.getElementById('gender')?.value || '-', position: document.getElementById('position')?.value || '-', education: document.getElementById('education')?.value || '-', experience: document.getElementById('experience')?.value || '-', skills: document.getElementById('skills')?.value || '-', availability: document.getElementById('availability')?.value || '-', notes: document.getElementById('notes')?.value || '' }; }
  function getDocumentsData() { const docs = [{ key: 'cv', label: 'CV / Resume' }, { key: 'nationalId', label: 'National ID' }, { key: 'introductionLetter', label: 'Introduction Letter' }, { key: 'passportPhoto', label: 'Passport Photo' }, { key: 'applicationLetter', label: 'Application Letter' }, { key: 'certificate', label: 'Certificate' }, { key: 'other', label: 'Other Documents' }]; return docs.map(doc => ({ label: doc.label, value: uploadedFiles[doc.key] ? uploadedFiles[doc.key].name : 'Not uploaded' })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateStep2()) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('full_name', document.getElementById('fullName').value.trim());
    formData.append('address', document.getElementById('address').value.trim());
    formData.append('age', document.getElementById('age').value.trim());
    formData.append('gender', document.getElementById('gender').value);
    formData.append('phone', document.getElementById('phone').value.trim());
    formData.append('email', document.getElementById('email').value.trim());
    formData.append('education_level', document.getElementById('education').value);
    formData.append('experience_years', document.getElementById('experience').value);
    formData.append('skills', document.getElementById('skills').value.trim());
    formData.append('position_applying', document.getElementById('position').value.trim());
    formData.append('availability', document.getElementById('availability').value);
    formData.append('additional_notes', document.getElementById('notes').value || '');
    
    const fileMappings = { cv: 'cv_file', nationalId: 'national_id_file', introductionLetter: 'introduction_letter_file', passportPhoto: 'passport_photo_file', applicationLetter: 'application_letter_file', certificate: 'certificate_file', other: 'other_docs_file' };
    for (const [key, file] of Object.entries(uploadedFiles)) { if (fileMappings[key]) formData.append(fileMappings[key], file); }
    
    try {
      const result = await API.jobApplications.submit(formData);
      if (result.success) {
        const refNumber = result.reference_number || 'CS-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        launchConfetti();
        showToast('Application submitted successfully! Reference: ' + refNumber, 'success');
        showSuccessPage(refNumber);
        Object.keys(uploadedFiles).forEach(key => delete uploadedFiles[key]);
      } else { showToast(result.message || 'Application failed. Please try again.', 'error'); setLoading(false); }
    } catch (error) { console.error('Submit error:', error); showToast(error.message || 'Failed to submit application.', 'error'); setLoading(false); }
  }

  function showSuccessPage(refNumber) {
    dynamicPanel.innerHTML = `
      <div class="success-message">
        <div class="checkmark-animated"><i class="fas fa-check-circle"></i></div>
        <h2>Application Submitted Successfully!</h2>
        <div class="success-card"><p><i class="fas fa-envelope"></i> We'll review your application and contact you soon.</p></div>
        <p>Your reference number:</p>
        <div class="reference-number" style="font-size:1.3rem; margin:1rem 0;">${refNumber}</div>
        <p style="color: var(--text-muted);">Please save this number for future reference.</p>
        <div class="btn-group" style="justify-content:center; margin-top:2rem;">
          <button class="btn btn-outline" id="trackNewBtn"><i class="fas fa-search"></i> Track Application</button>
          <button class="btn btn-primary" id="returnHomeBtn"><i class="fas fa-home"></i> Return Home</button>
        </div>
      </div>
    `;
    document.getElementById('trackNewBtn')?.addEventListener('click', () => renderTrackingInterface(refNumber));
    document.getElementById('returnHomeBtn')?.addEventListener('click', () => { if (applicationSettings.is_open && checkDeadline()) renderApplicationForm(); else renderClosedState(); });
  }

  function setLoading(loading) { isLoading = loading; const btn = document.getElementById('submitApplicationBtn'); if (btn) { btn.disabled = loading; btn.innerHTML = loading ? '<span class="spinner-border spinner-border-sm me-2"></span> Submitting...' : '<i class="fas fa-paper-plane"></i> Submit Application'; } }

  // ===== TRACKING INTERFACE =====
  async function renderTrackingInterface(prefillRef = '') {
    currentView = 'tracking';
    dynamicPanel.innerHTML = `
      <div class="tracking-interface">
        <div class="back-btn-container"><button class="back-btn" id="backToApplicationBtn"><i class="fas fa-arrow-left"></i> Back to Application</button></div>
        <div class="tracking-header"><div class="tracking-header-icon"><i class="fas fa-binoculars"></i></div><h2>Track Your Application</h2><p>Enter your application reference number to check your status</p></div>
        <div class="tracking-search-box">
          <div class="tracking-input-group">
            <div class="tracking-input-wrapper"><label><i class="fas fa-hashtag"></i> Reference Number</label><input type="text" id="trackingRefInput" class="tracking-input-field" placeholder="e.g., CS-XXXXXXXX" value="${prefillRef}" autocomplete="off"></div>
            <button class="track-btn" id="trackBtn"><i class="fas fa-search"></i> Track</button>
          </div>
        </div>
        <div id="trackingResultContainer"></div>
      </div>
    `;
    document.getElementById('backToApplicationBtn')?.addEventListener('click', () => { if (applicationSettings.is_open && checkDeadline()) renderApplicationForm(); else renderClosedState(); });
    document.getElementById('trackBtn')?.addEventListener('click', () => handleTrackApplication());
    document.getElementById('trackingRefInput')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleTrackApplication(); });
    if (prefillRef) setTimeout(() => handleTrackApplication(), 300);
  }

  async function handleTrackApplication() {
    const refInput = document.getElementById('trackingRefInput');
    const resultContainer = document.getElementById('trackingResultContainer');
    const trackBtn = document.getElementById('trackBtn');
    const ref = refInput?.value.trim();
    if (!ref) { showToast('Please enter a reference number.', 'warning'); return; }
    
    trackBtn.disabled = true;
    trackBtn.innerHTML = '<span class="loading-spinner"></span> Searching...';
    resultContainer.innerHTML = '<div class="text-center" style="padding:2rem;"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
    
    try {
      const response = await API.jobApplications.trackByReference(ref);
      if (response.success && response.tracking) {
        renderTrackingResult(response.tracking);
        showToast('Application found!', 'success');
      } else { renderNoResult(resultContainer, ref); showToast('No application found with this reference.', 'warning'); }
    } catch (error) {
      console.error('Tracking error:', error);
      renderNoResult(resultContainer, ref);
      showToast(error.message || 'Failed to track application.', 'error');
    } finally { trackBtn.disabled = false; trackBtn.innerHTML = '<i class="fas fa-search"></i> Track'; }
  }

  function renderTrackingResult(tracking) {
    const container = document.getElementById('trackingResultContainer');
    if (!container) return;
    let statusClass = '', statusLabel = '';
    switch (tracking.status) {
      case 'pending': statusClass = 'status-pending'; statusLabel = 'Pending'; break;
      case 'reviewed': statusClass = 'status-review'; statusLabel = 'Under Review'; break;
      case 'shortlisted': statusClass = 'status-shortlisted'; statusLabel = 'Shortlisted'; break;
      case 'rejected': statusClass = 'status-rejected'; statusLabel = 'Not Selected'; break;
      case 'hired': statusClass = 'status-approved'; statusLabel = 'Hired!'; break;
      default: statusClass = 'status-pending'; statusLabel = 'Pending';
    }
    const timelineHtml = tracking.timeline?.map((step, idx) => `<div class="timeline-step ${step.status}"><div class="timeline-dot">${step.status === 'completed' ? '<i class="fas fa-check"></i>' : step.status === 'pending' ? idx + 1 : '<i class="fas fa-spinner"></i>'}</div><span class="timeline-label">${step.stage}</span>${step.date ? `<span style="font-size:0.7rem;">${new Date(step.date).toLocaleDateString()}</span>` : ''}</div>`).join('') || '';
    container.innerHTML = `
      <div class="tracking-result">
        <div class="result-card">
          <div class="result-header"><div class="result-header-left"><span class="result-ref">${tracking.reference_number}</span><button class="copy-ref-btn" id="copyRefBtn"><i class="fas fa-copy"></i> Copy</button></div><span class="status-pill ${statusClass}"><i class="fas ${tracking.status === 'hired' ? 'fa-check-circle' : tracking.status === 'rejected' ? 'fa-times-circle' : 'fa-clock'}"></i> ${statusLabel}</span></div>
          <div class="timeline-section"><h4><i class="fas fa-route"></i> Application Progress</h4><div class="timeline">${timelineHtml}</div></div>
          <div class="details-section"><h4><i class="fas fa-info-circle"></i> Details</h4><div class="details-grid"><div class="detail-item"><span class="detail-label">Position</span><span class="detail-value">${tracking.position}</span></div><div class="detail-item"><span class="detail-label">Current Stage</span><span class="detail-value">${tracking.current_stage}</span></div><div class="detail-item"><span class="detail-label">Submitted</span><span class="detail-value">${new Date(tracking.date).toLocaleDateString()}</span></div></div></div>
          <div class="status-message">${getStatusMessageFromTracking(tracking)}</div>
        </div>
      </div>
    `;
    document.getElementById('copyRefBtn')?.addEventListener('click', () => { navigator.clipboard?.writeText(tracking.reference_number); showToast('Reference copied!', 'success'); });
    container.scrollIntoView({ behavior: 'smooth' });
  }

  function getStatusMessageFromTracking(tracking) {
    switch (tracking.status) {
      case 'pending': return '<p><i class="fas fa-clock"></i> Your application has been received and is pending review.</p>';
      case 'reviewed': return '<p><i class="fas fa-search"></i> Your application is currently under review.</p>';
      case 'shortlisted': return '<p><i class="fas fa-star"></i> Congratulations! You have been shortlisted.</p>';
      case 'rejected': return '<p><i class="fas fa-info-circle"></i> Thank you for applying. We have moved forward with other candidates.</p>';
      case 'hired': return '<p><i class="fas fa-trophy"></i> Congratulations! Welcome to the CleanSpark team!</p>';
      default: return '';
    }
  }

  function renderNoResult(container, ref) {
    container.innerHTML = `<div class="no-result-card"><div class="no-result-icon"><i class="fas fa-search"></i></div><h3>No Application Found</h3><p>No application found with reference "<strong>${escapeHtml(ref)}</strong>".</p></div>`;
    container.scrollIntoView({ behavior: 'smooth' });
  }

  // ===== CONFETTI =====
  function launchConfetti() {
    if (!confettiCanvas || !ctx) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    const particles = [];
    for (let i = 0; i < 120; i++) particles.push({ x: Math.random() * confettiCanvas.width, y: Math.random() * confettiCanvas.height - confettiCanvas.height, r: Math.random() * 6 + 2, d: Math.random() * 30 + 5, color: `hsl(${Math.random() * 360}, 80%, 60%)`, tilt: Math.random() * 10 });
    let animationId;
    function draw() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      for (let p of particles) { ctx.beginPath(); ctx.fillStyle = p.color; ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); p.y += p.d * 0.5; p.x += Math.sin(p.tilt) * 0.5; if (p.y > confettiCanvas.height) p.y = -10; }
      animationId = requestAnimationFrame(draw);
    }
    draw();
    setTimeout(() => { cancelAnimationFrame(animationId); ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height); }, 4000);
  }

  // ===== INITIALIZATION =====
  document.addEventListener('DOMContentLoaded', async function() {
    await loadApplicationSettings();
    if (applicationSettings.is_open && checkDeadline()) { renderApplicationForm(); }
    else { renderClosedState(); }
    
    document.getElementById('trackingBtn')?.addEventListener('click', () => { if (currentView !== 'tracking') renderTrackingInterface(); });
  });
})();