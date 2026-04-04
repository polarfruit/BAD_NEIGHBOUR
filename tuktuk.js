/* ============================================================
   BAD NEIGHBOUR — tuktuk.js
   Booking form: date range calendar, time, location, pricing
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
     CUSTOM CALENDAR — date range support
     Click once = single date, click a second date = range
     ============================================================ */
  const cal       = document.getElementById('tuktuk-cal');
  const calTitle  = document.getElementById('cal-title');
  const calGrid   = document.getElementById('cal-grid');
  const calDaysH  = document.getElementById('cal-days-header');
  const calPrev   = document.getElementById('cal-prev');
  const calNext   = document.getElementById('cal-next');
  const calDone   = document.getElementById('cal-done');

  const today     = new Date();
  today.setHours(0, 0, 0, 0);

  let viewYear    = today.getFullYear();
  let viewMonth   = today.getMonth();
  let startDate   = null;  // first click
  let endDate     = null;  // second click (range end)

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

  function formatDisplay(date) {
    const dayName = date.toLocaleDateString('en-AU', { weekday: 'short' });
    const d = date.getDate();
    const monthName = date.toLocaleDateString('en-AU', { month: 'short' });
    const yr = date.getFullYear();
    return `${dayName} ${d} ${monthName} ${yr}`;
  }

  function toIso(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function isSameDay(a, b) {
    return a && b && a.getTime() === b.getTime();
  }

  function isInRange(date) {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  }

  function updateDateField() {
    if (startDate && endDate && !isSameDay(startDate, endDate)) {
      dateIn.value = `${formatDisplay(startDate)} — ${formatDisplay(endDate)}`;
      dateIso.value = `${toIso(startDate)} to ${toIso(endDate)}`;
    } else if (startDate) {
      dateIn.value = formatDisplay(startDate);
      dateIso.value = toIso(startDate);
    } else {
      dateIn.value = '';
      dateIso.value = '';
    }
  }

  function renderCalendar() {
    calGrid.innerHTML = '';
    calTitle.textContent = `${MONTHS[viewMonth]} ${viewYear}`;

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const startOffset = (firstDay + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 0; i < startOffset; i++) {
      const empty = document.createElement('span');
      empty.className = 'tuktuk-cal-cell tuktuk-cal-cell--empty';
      calGrid.appendChild(empty);
    }

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
      if (isSameDay(cellDate, today)) {
        cell.classList.add('tuktuk-cal-cell--today');
      }

      // Start date
      if (isSameDay(cellDate, startDate)) {
        cell.classList.add('tuktuk-cal-cell--selected');
        if (endDate && !isSameDay(startDate, endDate)) {
          cell.classList.add('tuktuk-cal-cell--range-start');
        }
      }

      // End date
      if (endDate && isSameDay(cellDate, endDate) && !isSameDay(startDate, endDate)) {
        cell.classList.add('tuktuk-cal-cell--selected');
        cell.classList.add('tuktuk-cal-cell--range-end');
      }

      // In range (between start and end)
      if (isInRange(cellDate) && !isSameDay(cellDate, startDate) && !isSameDay(cellDate, endDate)) {
        cell.classList.add('tuktuk-cal-cell--in-range');
      }

      cell.addEventListener('click', () => {
        if (!startDate || (startDate && endDate)) {
          // First click or reset
          startDate = cellDate;
          endDate = null;
        } else {
          // Second click — set range
          if (cellDate < startDate) {
            endDate = startDate;
            startDate = cellDate;
          } else {
            endDate = cellDate;
          }
        }
        updateDateField();
        renderCalendar();
      });

      calGrid.appendChild(cell);
    }

    calPrev.disabled = (viewYear === today.getFullYear() && viewMonth === today.getMonth());
  }

  // Confirm button closes calendar
  calDone.addEventListener('click', () => {
    if (startDate) {
      cal.classList.remove('open');
    }
  });

  // Toggle calendar
  dateIn.addEventListener('click', () => {
    cal.classList.toggle('open');
  });

  // Close when clicking outside
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
     BLOCKED LOCATIONS
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
     PRICING
     ============================================================ */
  const pricing = { small: 1000, medium: 2000, large: 3000 };

  function formatPrice(amount) {
    return '$' + amount.toLocaleString('en-AU');
  }

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
      // Multiply by number of days if multi-day
      let days = 1;
      if (startDate && endDate) {
        days = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      }
      const total = pricing[guests] * days;
      const dayLabel = days > 1 ? ` (${days} days)` : '';
      priceEl.textContent = formatPrice(total) + dayLabel;
      estimate.style.display = 'block';
    }
  }

  addressIn.addEventListener('input', updateEstimate);
  addressIn.addEventListener('change', updateEstimate);
  guestsIn.addEventListener('change', updateEstimate);

  // Also update estimate when dates change
  const origUpdateDateField = updateDateField;
  const dateObserver = new MutationObserver(updateEstimate);
  dateIso.addEventListener('change', updateEstimate);
  // Patch updateDateField to also trigger estimate
  const _origUpdate = updateDateField;

  /* ============================================================
     FORM SUBMISSION
     ============================================================ */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const address = addressIn.value.trim();

    if (!dateIso.value) {
      dateIn.focus();
      cal.classList.add('open');
      return;
    }

    if (isBlocked(address)) {
      blocked.style.display = 'block';
      blocked.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Calculate days and total
    let days = 1;
    if (startDate && endDate) {
      days = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    }
    const basePrice = pricing[guestsIn.value] || 0;
    const totalPrice = basePrice * days;

    const data = {
      name:       document.getElementById('book-name').value,
      email:      document.getElementById('book-email').value,
      phone:      document.getElementById('book-phone').value,
      date:       dateIso.value,
      time_start: document.getElementById('book-time-start').value,
      time_end:   document.getElementById('book-time-end').value,
      days:       days,
      event_type: document.getElementById('book-event-type').value,
      guests:     guestsIn.value,
      address:    address,
      message:    document.getElementById('book-message').value,
      total_price: totalPrice
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
      if (!response.ok) throw new Error(result.error || 'Something went wrong.');

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
