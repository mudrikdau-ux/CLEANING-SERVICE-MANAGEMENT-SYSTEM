(function() {
    // DOM elements
    const phases = document.querySelectorAll('.phase');
    const nextBtns = document.querySelectorAll('.next');
    const bookingForm = document.getElementById('bookingForm');
    
    // Summary spans
    const sumCleaners = document.getElementById('sumCleaners');
    const sumHours = document.getElementById('sumHours');
    const sumFreq = document.getElementById('sumFreq');
    const sumMaterials = document.getElementById('sumMaterials');
    const sumProperty = document.getElementById('sumProperty');
    const sumDate = document.getElementById('sumDate');
    const sumTime = document.getElementById('sumTime');
    const sumName = document.getElementById('sumName');
    const sumTotal = document.getElementById('sumTotal');

    // Inputs
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

    // Helper: refresh summary values
    function refreshSummary() {
      // basic fields
      sumCleaners.innerText = cleanersInp.value || '1';
      sumHours.innerText = hoursInp.value || '0';
      sumFreq.innerText = freqSelect.value;
      sumMaterials.innerText = materialsSelect.value;

      // property (show short version)
      let propVal = propertySelect.value;
      if (!propVal && streetInp?.value) propVal = streetInp.value.split(' ')[0] + '…';
      sumProperty.innerText = propVal || '—';

      // date & time
      sumDate.innerText = dateInp.value || '—';
      sumTime.innerText = timeInp.value || '—';

      // name
      let first = fnameInp.value.trim() || '';
      let last = lnameInp.value.trim() || '';
      sumName.innerText = (first || last) ? `${first} ${last}`.trim() : '—';

      // total calculation (TZS)
      let cleaners = parseInt(cleanersInp.value) || 1;
      let hours = parseInt(hoursInp.value) || 0;
      let base = cleaners * hours * 20000;
      if (materialsSelect.value === 'Yes') base += 10000;

      // cash payment extra not added here (just summary)
      sumTotal.innerText = 'TZS ' + base.toLocaleString('en-US');
      
      // also generate review panel content if phase6 active
      const reviewDiv = document.getElementById('review');
      if (reviewDiv) {
        let addr = `${streetInp?.value || ''}, ${cityInp?.value || ''}`.trim().replace(/^,|,$/g,'') || '—';
        reviewDiv.innerHTML = `
          <div class="review-row"><span>Service:</span> <strong>${cleaners} cleaner(s), ${hours} hrs (${freqSelect.value})</strong></div>
          <div class="review-row"><span>Materials:</span> <strong>${materialsSelect.value}</strong></div>
          <div class="review-row"><span>Address:</span> ${addr} (${propVal})</div>
          <div class="review-row"><span>When:</span> ${dateInp.value || '—'} at ${timeInp.value || '—'}</div>
          <div class="review-row"><span>Contact:</span> ${fnameInp.value || ''} ${lnameInp.value || ''} </div>
          <div class="review-row fw-bold mt-2">Total: TZS ${base.toLocaleString()}</div>
        `;
      }
    }

    // navigation: hide all, show target
    function showPhase(phaseId) {
      phases.forEach(p => p.classList.remove('active'));
      const target = document.getElementById(phaseId);
      if (target) target.classList.add('active');
      refreshSummary(); // update summary whenever phase changes
    }

    // add click listeners to "Next" buttons
    nextBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        const nextId = this.getAttribute('data-next');
        if (nextId) {
          // tiny validation (simple)
          if (nextId === 'phase2' && !cleanersInp.value) { alert('Please fill cleaners'); return; }
          if (nextId === 'phase3' && !propertySelect.value) { alert('Select property type'); return; }
          if (nextId === 'phase4' && (!streetInp.value || !cityInp.value)) { alert('Enter full address'); return; }
          if (nextId === 'phase5' && !dateInp.value) { alert('Pick a date'); return; }
          if (nextId === 'phase6' && (!fnameInp.value || !lnameInp.value)) { alert('Enter name'); return; }
          // everything ok
          showPhase(nextId);
        }
      });
    });

    // also previous could be added but requirement: only next, no extra features

    // live update summary on input change
    const liveInputs = [cleanersInp, hoursInp, freqSelect, materialsSelect, propertySelect, streetInp, cityInp, dateInp, timeInp, fnameInp, lnameInp];
    liveInputs.forEach(inp => {
      if (inp) inp.addEventListener('input', refreshSummary);
      if (inp && inp.tagName === 'SELECT') inp.addEventListener('change', refreshSummary);
    });

    // handle final submit (prevent page reload)
    bookingForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const paymentMethod = document.getElementById('payment').value;
      alert(`✅ Booking confirmed (demo). Payment: ${paymentMethod}. A professional summary would be sent.`);
      // you could reset or stay
    });

    // initial summary
    refreshSummary();

    // ensure addressFields are tidy, but not required further
    // also set default property placeholder
    if (!propertySelect.value) propertySelect.value = 'Apartment';
  })();