/* ============================================================
   /api/booking.js — Vercel Serverless Function
   Handles tuk tuk booking form submissions:
   1. Validates input & location
   2. Creates/finds Square customer
   3. Creates Square calendar booking (Appointments API)
   4. Creates Square draft order (for invoicing)
   5. Sends email notification to Bad Neighbour
   ============================================================ */

const { Client, Environment } = require('square');
const { Resend } = require('resend');

/* ----------------------------------------------------------
   BLOCKED LOCATIONS (same list as frontend — server-side check)
---------------------------------------------------------- */
const BLOCKED = [
  'adelaide hills', 'mount lofty', 'stirling', 'crafers', 'bridgewater',
  'hahndorf', 'lobethal', 'woodside', 'birdwood', 'gumeracha',
  'mount barker', 'nairne', 'littlehampton', 'echunga', 'meadows',
  'macclesfield', 'strathalbyn', 'mylor', 'aldgate', 'basket range',
  'norton summit', 'uraidla', 'summertown', 'piccadilly', 'greenhill',
  'carey gully', 'ashton', 'lenswood', 'forest range', 'charleston',
  'mount pleasant', 'williamstown', 'chain of ponds', 'kersbrook',
  'mount torrens', 'palmer', 'mannum', 'murray bridge', 'victor harbor',
  'port augusta', 'port lincoln', 'whyalla', 'mount gambier', 'clare',
  'barossa', 'tanunda', 'nuriootpa', 'angaston', 'lyndoch', 'kapunda',
  'renmark', 'berri', 'loxton', 'waikerie', 'riverland'
];

function isBlocked(location) {
  const lower = location.toLowerCase().trim();
  return BLOCKED.some(s => lower.includes(s));
}

/* ----------------------------------------------------------
   PACKAGE CONFIG
---------------------------------------------------------- */
const PACKAGES = {
  small:  { name: 'Small Package — Up to 80 guests', cents: 80000 },
  medium: { name: 'Medium Package — Up to 150 guests', cents: 150000 },
  large:  { name: 'Large Event — 150+ guests (custom quote)', cents: 0 }
};

/* ----------------------------------------------------------
   HANDLER
---------------------------------------------------------- */
module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, phone, date, time_start, time_end, days, event_type, guests, address, message, total_price } = req.body;

    /* ---- Validate required fields ---- */
    if (!name || !email || !phone || !date || !time_start || !time_end || !event_type || !guests || !address) {
      return res.status(400).json({ error: 'All required fields must be filled in.' });
    }

    /* ---- Validate location ---- */
    if (isBlocked(address)) {
      return res.status(400).json({
        error: 'Sorry, the Tuk Tuk cannot reach that location. We service the Adelaide metro area only.'
      });
    }

    /* ---- Validate package ---- */
    const pkg = PACKAGES[guests];
    if (!pkg) {
      return res.status(400).json({ error: 'Invalid package selection.' });
    }

    /* ---- Validate date is in the future ---- */
    const eventDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (eventDate < today) {
      return res.status(400).json({ error: 'Event date must be in the future.' });
    }

    /* ---- Check if Square credentials exist ---- */
    const hasSquare = process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID;
    const hasEmail = process.env.RESEND_API_KEY;

    let squareCustomerId = null;
    let squareOrderId = null;
    let squareBookingId = null;
    let bookingDebug = {};

    /* ============================================================
       SQUARE: Customer + Calendar Booking + Draft Order
       ============================================================ */
    if (hasSquare) {
      const square = new Client({
        accessToken: process.env.SQUARE_ACCESS_TOKEN,
        environment: Environment.Production
      });

      const locationId = process.env.SQUARE_LOCATION_ID;

      /* -- Find or create customer -- */
      const searchResult = await square.customersApi.searchCustomers({
        query: {
          filter: {
            emailAddress: { exact: email }
          }
        }
      });

      if (searchResult.result.customers && searchResult.result.customers.length > 0) {
        squareCustomerId = searchResult.result.customers[0].id;
      } else {
        const createResult = await square.customersApi.createCustomer({
          givenName: name.split(' ')[0],
          familyName: name.split(' ').slice(1).join(' ') || '',
          emailAddress: email,
          phoneNumber: phone
        });
        squareCustomerId = createResult.result.customer.id;
      }

      const numDays = days || 1;
      const totalCents = pkg.cents * numDays;
      const noteLines = [
        `Event Type: ${event_type}`,
        `Event Date: ${date}${numDays > 1 ? ` (${numDays} days)` : ''}`,
        `Time: ${time_start} — ${time_end}`,
        `Location: ${address}`,
        `Guest Count: ${pkg.name}`,
        message ? `Notes: ${message}` : ''
      ].filter(Boolean).join('\n');

      /* -- Calendar Booking (Square Appointments) -- */
      try {
        let serviceVariationId = null;
        let serviceVariationVersion = null;
        let teamMemberId = null;

        // Find service — iterate through catalog pages
        let cursor = undefined;
        let found = false;
        do {
          const catalogResult = await square.catalogApi.listCatalog(cursor, 'APPOINTMENT_SERVICE');
          const objects = catalogResult.result.objects || [];
          for (const obj of objects) {
            const variations = obj.itemData?.variations || [];
            if (variations.length > 0) {
              serviceVariationId = variations[0].id;
              serviceVariationVersion = BigInt(variations[0].version);
              found = true;
              break;
            }
          }
          cursor = catalogResult.result.cursor;
        } while (cursor && !found);

        bookingDebug.serviceFound = !!serviceVariationId;

        // Find team member
        const teamResult = await square.teamApi.searchTeamMembers({
          query: { filter: { status: 'ACTIVE', locationIds: [locationId] } }
        });
        const members = teamResult.result.teamMembers || [];
        if (members.length > 0) {
          teamMemberId = members[0].id;
        }

        bookingDebug.teamMemberFound = !!teamMemberId;

        if (!serviceVariationId || !teamMemberId) {
          bookingDebug.skipped = true;
          bookingDebug.reason = !serviceVariationId ? 'No appointment service found in catalog' : 'No active team member found';
        } else {
          // Build start datetime in RFC 3339 (Adelaide UTC+9:30)
          const eventDateStr = date.includes(' to ') ? date.split(' to ')[0] : date;
          // Ensure time is HH:MM format
          const timeParts = time_start.match(/(\d{1,2}):(\d{2})/);
          const startHour = timeParts ? timeParts[1].padStart(2, '0') : '09';
          const startMin = timeParts ? timeParts[2] : '00';
          const startAt = `${eventDateStr}T${startHour}:${startMin}:00+09:30`;

          bookingDebug.startAt = startAt;
          bookingDebug.serviceVariationId = serviceVariationId;
          bookingDebug.teamMemberId = teamMemberId;

          const bookingKey = `tuktuk-bk-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

          const bookingResult = await square.bookingsApi.createBooking({
            booking: {
              locationId: locationId,
              customerId: squareCustomerId,
              startAt: startAt,
              appointmentSegments: [{
                serviceVariationId: serviceVariationId,
                teamMemberId: teamMemberId,
                serviceVariationVersion: serviceVariationVersion
              }],
              customerNote: noteLines
            },
            idempotencyKey: bookingKey
          });

          squareBookingId = bookingResult.result.booking?.id || null;
          bookingDebug.success = true;
        }
      } catch (bookingErr) {
        bookingDebug.error = bookingErr.message || String(bookingErr);
        // Try to get Square API error details
        if (bookingErr.errors) {
          bookingDebug.squareErrors = bookingErr.errors;
        }
        console.error('Calendar booking failed:', JSON.stringify(bookingDebug));
      }

      /* -- Draft Order (for invoicing) -- */
      const idempotencyKey = `tuktuk-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const orderResult = await square.ordersApi.createOrder({
        order: {
          locationId: locationId,
          customerId: squareCustomerId,
          lineItems: [
            {
              name: `Tuk Tuk Booking — ${pkg.name}${numDays > 1 ? ` x ${numDays} days` : ''}`,
              quantity: '1',
              basePriceMoney: {
                amount: BigInt(totalCents),
                currency: 'AUD'
              }
            }
          ],
          metadata: {
            event_type: event_type,
            event_date: date,
            event_location: address,
            customer_phone: phone
          },
          note: noteLines,
          state: 'DRAFT'
        },
        idempotencyKey: idempotencyKey
      });

      squareOrderId = orderResult.result.order.id;
    }

    /* ============================================================
       EMAIL: Notify Bad Neighbour
       ============================================================ */
    if (hasEmail) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const numDaysEmail = days || 1;
      const totalFormatted = `$${((pkg.cents * numDaysEmail) / 100).toLocaleString('en-AU')}`;
      const perDayFormatted = `$${(pkg.cents / 100).toLocaleString('en-AU')}`;
      const daysLabel = numDaysEmail > 1 ? ` (${numDaysEmail} days @ ${perDayFormatted}/day)` : '';
      const emailBody = `
        <h2>New Tuk Tuk Booking Enquiry</h2>
        <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
          <tr><td style="padding:8px 16px 8px 0;font-weight:bold;">Name</td><td style="padding:8px 0;">${name}</td></tr>
          <tr><td style="padding:8px 16px 8px 0;font-weight:bold;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px 16px 8px 0;font-weight:bold;">Phone</td><td style="padding:8px 0;"><a href="tel:${phone}">${phone}</a></td></tr>
          <tr><td style="padding:8px 16px 8px 0;font-weight:bold;">Event Date</td><td style="padding:8px 0;">${date}${numDaysEmail > 1 ? ` (${numDaysEmail} days)` : ''}</td></tr>
          <tr><td style="padding:8px 16px 8px 0;font-weight:bold;">Time</td><td style="padding:8px 0;">${time_start} — ${time_end}</td></tr>
          <tr><td style="padding:8px 16px 8px 0;font-weight:bold;">Event Type</td><td style="padding:8px 0;">${event_type}</td></tr>
          <tr><td style="padding:8px 16px 8px 0;font-weight:bold;">Package</td><td style="padding:8px 0;">${pkg.name}</td></tr>
          <tr><td style="padding:8px 16px 8px 0;font-weight:bold;">Total</td><td style="padding:8px 0;">${totalFormatted}${daysLabel}</td></tr>
          <tr><td style="padding:8px 16px 8px 0;font-weight:bold;">Location</td><td style="padding:8px 0;">${address}</td></tr>
          ${message ? `<tr><td style="padding:8px 16px 8px 0;font-weight:bold;">Message</td><td style="padding:8px 0;">${message}</td></tr>` : ''}
        </table>
        ${squareBookingId ? `<p style="margin-top:20px;font-size:13px;color:#666;">Calendar Booking created — check your Square Appointments to accept/decline.</p>` : ''}
        ${squareOrderId ? `<p style="margin-top:10px;font-size:13px;color:#666;">Square Draft Order ID: ${squareOrderId}</p>` : ''}
        <p style="margin-top:10px;font-size:13px;color:#666;">Open your Square Dashboard to review and send the invoice.</p>
      `;

      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Tuk Tuk Bookings <bookings@badneighbour.au>',
        to: process.env.NOTIFICATION_EMAIL || 'hello@badneighbour.au',
        subject: `New Tuk Tuk Booking — ${name} — ${event_type} — ${date}`,
        html: emailBody
      });
    }

    /* ---- Success ---- */
    return res.status(200).json({
      success: true,
      message: 'Booking enquiry received. We\'ll review and get back to you within 24 hours.',
      squareOrderId: squareOrderId || null,
      squareBookingId: squareBookingId || null,
      _debug: bookingDebug || null
    });

  } catch (err) {
    console.error('Booking error:', err);
    const errDetail = err.errors ? err.errors.map(e => e.detail || e.code).join('; ') : (err.message || String(err));
    return res.status(500).json({
      error: 'Something went wrong. Please try again or contact us directly.',
      _debug: { message: errDetail, type: err.constructor?.name }
    });
  }
};
