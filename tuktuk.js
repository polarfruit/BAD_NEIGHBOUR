/* ============================================================
   BAD NEIGHBOUR — tuktuk.js
   Booking form: custom calendar, location validation, pricing
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const form       = document.getElementById('booking-form');
  const addressIn  = document.getElementById('book-address');
  const guestsIn   = document.getElementById('book-guests');
  const dateIn     = document.getElementById('book-date');
  const dateIso    = document.getElementById('book-date-iso');
  const hint       = document.getElementById('location-hint');
  const estimate   = document.getElementById('booking-estimate');
  const blocked    = document.getElementById('booking-blocked');
  const priceEl    = document.getElementById('estimate-price');
  const successEl  = document.getElementById('booking-success');
  const submitBtn  = document.getElementById('booking-submit');

  if (!form) return;

  /* ============================================================
     CUSTOM CALENDAR
     ============================================================ */
  const cal       = document.getElementById('tuktuk-cal');
  const calTitle  = document.getElementById('cal-title');
  const calGrid   = document.getElementById('cal-grid');
  const calDaysH  = document.getElementById('cal-days-header');
  const calPrev   = document.getElementById('cal-prev');
  const calNext   = document.getElementById('cal-next');

  const today     = new Date();
  today.setHours(0, 0, 0, 0);

  let viewYear    = today.getFullYear();
  let viewMonth   = today.getMonth();
  let selectedDate = null;

  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const DAYS   = ['Mo','Tu','We','Th','Fr','Sa','Su'];

  // Day header row
  DAYS.forEach(d => {
    const el = document.createElement('span');
    el.className = 'tuktuk-cal-day-name';
    el.textContent = d;
    calDaysH.appendChild(el);
  });

  function renderCalendar() {
    calGrid.innerHTML = '';
    calTitle.textContent = `${MONTHS[viewMonth]} ${viewYear}`;

    // First day of month (adjust so Monday = 0)
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const startOffset = (firstDay + 6) % 7; // Monday-based
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    // Empty cells before first day
    for (let i = 0; i < startOffset; i++) {
      const empty = document.createElement('span');
      empty.className = 'tuktuk-cal-cell tuktuk-cal-cell--empty';
      calGrid.appendChild(empty);
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'tuktuk-cal-cell';
      cell.textContent = d;

      const cellDate = new Date(viewYear, viewMonth, d);
      cellDate.setHours(0, 0, 0, 0);

      // Past dates
      if (cellDate < today) {
        cell.classList.add('tuktuk-cal-cell--past');
        cell.disabled = true;
      }

      // Today
      if (cellDate.getTime() === today.getTime()) {
        cell.classList.add('tuktuk-cal-cell--today');
      }

      // Selected
      if (selectedDate && cellDate.getTime() === selectedDate.getTime()) {
        cell.classList.add('tuktuk-cal-cell--selected');
      }

      cell.addEventListener('click', () => {
        selectedDate = cellDate;

        // Format display: "Sat 5 Apr 2026"
        const dayName = cellDate.toLocaleDateString('en-AU', { weekday: 'short' });
        const monthName = cellDate.toLocaleDateString('en-AU', { month: 'short' });
        dateIn.value = `${dayName} ${d} ${monthName} ${viewYear}`;

        // ISO format for the API
        const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        dateIso.value = iso;

        cal.classList.remove('open');
        renderCalendar(); // re-render to show selection
      });

      calGrid.appendChild(cell);
    }

    // Disable prev if current month
    calPrev.disabled = (viewYear === today.getFullYear() && viewMonth === today.getMonth());
  }

  // Toggle calendar
  dateIn.addEventListener('click', () => {
    cal.classList.toggle('open');
  });

  // Close calendar when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.tuktuk-date-wrap')) {
      cal.classList.remove('open');
    }
  });

  calPrev.addEventListener('click', () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });

  calNext.addEventListener('click', () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });

  renderCalendar();

  /* ============================================================
     BLOCKED LOCATIONS — Adelaide Hills & regional
     ============================================================ */
  const blockedSuburbs = [
    'adelaide hills', 'mount lofty', 'stirling', 'crafers', 'bridgewater',
    'hahndorf', 'lobethal', 'woodside', 'birdwood', 'gumeracha',
    'mount barker', 'nairne', 'littlehampton', 'echunga', 'meadows',
    'macclesfield', 'strathalbyn', 'mylor', 'aldgate', 'basket range',
    'norton summit', 'uraidla', 'summertown', 'piccadilly', 'greenhill',
    'carey gully', 'ashton', 'lenswood', 'forest range', 'lobethal',
    'charleston', 'mount pleasant', 'williamstown', 'chain of ponds',
    'kersbrook', 'williamstown', 'mount torrens', 'palmer',
    'mannum', 'murray bridge', 'victor harbor', 'port augusta',
    'port lincoln', 'whyalla', 'mount gambier', 'clare', 'barossa',
    'tanunda', 'nuriootpa', 'angaston', 'lyndoch', 'kapunda',
    'renmark', 'berri', 'loxton', 'waikerie', 'riverland'
  ];

  function isBlocked(location) {
    const lower = location.toLowerCase().trim();
    return blockedSuburbs.some(s => lower.includes(s));
  }

  /* ============================================================
     PACKAGE PRICING
     ============================================================ */
  const pricing = {
    small:  1000,
    medium: 2000,
    large:  3000
  };

  function formatPrice(amount) {
    return '$' + amount.toLocaleString('en-AU');
  }

  /* ============================================================
     UPDATE ESTIMATE
     ============================================================ */
  function updateEstimate() {
    const address = addressIn.value.trim();
    const guests  = guestsIn.value;

    estimate.style.display = 'none';
    blocked.style.display  = 'none';
    hint.textContent       = '';
    hint.className         = 'tuktuk-form-hint';

    if (!address) return;

    if (isBlocked(address)) {
      blocked.style.display = 'block';
      hint.textContent = 'This location is outside our service area.';
      hint.className = 'tuktuk-form-hint tuktuk-form-hint--blocked';
      return;
    }

    hint.textContent = 'This location is within our service area.';
    hint.className = 'tuktuk-form-hint tuktuk-form-hint--ok';

    if (guests && pricing[guests]) {
      priceEl.textContent = formatPrice(pricing[guests]);
      estimate.style.display = 'block';
    }
  }

  addressIn.addEventListener('input', updateEstimate);
  addressIn.addEventListener('change', updateEstimate);
  guestsIn.addEventListener('change', updateEstimate);

  /* ============================================================
     FORM SUBMISSION
     ============================================================ */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const address = addressIn.value.trim();

    // Validate date
    if (!dateIso.value) {
      dateIn.focus();
      cal.classList.add('open');
      return;
    }

    // Block bad locations
    if (isBlocked(address)) {
      blocked.style.display = 'block';
      blocked.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const data = {
      name:       document.getElementById('book-name').value,
      email:      document.getElementById('book-email').value,
      phone:      document.getElementById('book-phone').value,
      date:       dateIso.value,
      event_type: document.getElementById('book-event-type').value,
      guests:     guestsIn.value,
      address:    address,
      message:    document.getElementById('book-message').value
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong.');
      }

      form.style.display      = 'none';
      successEl.style.display  = 'block';
      successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Enquiry';
      alert(err.message || 'Something went wrong. Please try again.');
    }
  });

});
