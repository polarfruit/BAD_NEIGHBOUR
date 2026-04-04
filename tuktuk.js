/* ============================================================
   BAD NEIGHBOUR — tuktuk.js
   Booking form logic: location validation, pricing, submission
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const form       = document.getElementById('booking-form');
  const addressIn  = document.getElementById('book-address');
  const guestsIn   = document.getElementById('book-guests');
  const dateIn     = document.getElementById('book-date');
  const hint       = document.getElementById('location-hint');
  const estimate   = document.getElementById('booking-estimate');
  const blocked    = document.getElementById('booking-blocked');
  const priceEl    = document.getElementById('estimate-price');
  const successEl  = document.getElementById('booking-success');
  const submitBtn  = document.getElementById('booking-submit');

  if (!form) return;

  /* ----------------------------------------------------------
     Set minimum date to today
  ---------------------------------------------------------- */
  const today = new Date().toISOString().split('T')[0];
  if (dateIn) dateIn.setAttribute('min', today);

  /* ----------------------------------------------------------
     BLOCKED LOCATIONS — Adelaide Hills & regional
  ---------------------------------------------------------- */
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

  /* ----------------------------------------------------------
     PACKAGE PRICING
  ---------------------------------------------------------- */
  const pricing = {
    small:  1000,
    medium: 2000,
    large:  3000
  };

  function formatPrice(amount) {
    return '$' + amount.toLocaleString('en-AU');
  }

  /* ----------------------------------------------------------
     UPDATE ESTIMATE when guest or address changes
  ---------------------------------------------------------- */
  function updateEstimate() {
    const address = addressIn.value.trim();
    const guests  = guestsIn.value;

    // Reset
    estimate.style.display = 'none';
    blocked.style.display  = 'none';
    hint.textContent       = '';
    hint.className         = 'tuktuk-form-hint';

    if (!address) return;

    // Check blocked locations
    if (isBlocked(address)) {
      blocked.style.display = 'block';
      hint.textContent = 'This location is outside our service area.';
      hint.className = 'tuktuk-form-hint tuktuk-form-hint--blocked';
      return;
    }

    // Location is OK
    hint.textContent = 'Great — this location is within our service area.';
    hint.className = 'tuktuk-form-hint tuktuk-form-hint--ok';

    // Show price if package selected
    if (guests && pricing[guests]) {
      priceEl.textContent = formatPrice(pricing[guests]);
      estimate.style.display = 'block';
    }
  }

  addressIn.addEventListener('input', updateEstimate);
  addressIn.addEventListener('change', updateEstimate);
  guestsIn.addEventListener('change', updateEstimate);

  /* ----------------------------------------------------------
     FORM SUBMISSION — POST to /api/booking
  ---------------------------------------------------------- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const address = addressIn.value.trim();

    // Block if location is outside range
    if (isBlocked(address)) {
      blocked.style.display = 'block';
      blocked.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Collect form data
    const data = {
      name:       document.getElementById('book-name').value,
      email:      document.getElementById('book-email').value,
      phone:      document.getElementById('book-phone').value,
      date:       document.getElementById('book-date').value,
      event_type: document.getElementById('book-event-type').value,
      guests:     guestsIn.value,
      address:    address,
      message:    document.getElementById('book-message').value
    };

    // Disable submit
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

      // Success
      form.style.display      = 'none';
      successEl.style.display  = 'block';
      successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (err) {
      // Show error, re-enable button
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Enquiry';
      alert(err.message || 'Something went wrong. Please try again.');
    }
  });

});
