/* ============================================================
   /api/booking.js — Vercel Serverless Function
   Handles tuk tuk booking form submissions:
   1. Validates input & location
   2. Creates/finds Square customer
   3. Creates Square draft order
   4. Sends email notification to Bad Neighbour
   ============================================================ */

const { SquareClient, SquareEnvironment } = require('square');
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
  small:  { name: 'Small Package — Up to 100 guests', cents: 100000 },
  medium: { name: 'Medium Package — 100 to 250 guests', cents: 200000 },
  large:  { name: 'Large Package — 250+ guests', cents: 300000 }
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
    const { name, email, phone, date, event_type, guests, address, message } = req.body;

    /* ---- Validate required fields ---- */
    if (!name || !email || !phone || !date || !event_type || !guests || !address) {
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

    /* ============================================================
       SQUARE: Create customer + draft order
       ============================================================ */
    if (hasSquare) {
      const square = new SquareClient({
        token: process.env.SQUARE_ACCESS_TOKEN,
        environment: SquareEnvironment.Production
      });

      /* -- Find or create customer -- */
      const searchResult = await square.customers.search({
        query: {
          filter: {
            emailAddress: { exact: email }
          }
        }
      });

      if (searchResult.customers && searchResult.customers.length > 0) {
        squareCustomerId = searchResult.customers[0].id;
      } else {
        const createResult = await square.customers.create({
          givenName: name.split(' ')[0],
          familyName: name.split(' ').slice(1).join(' ') || '',
          emailAddress: email,
          phoneNumber: phone
        });
        squareCustomerId = createResult.customer.id;
      }

      /* -- Create draft order -- */
      const orderNote = [
        `Event Type: ${event_type}`,
        `Event Date: ${date}`,
        `Location: ${address}`,
        `Guest Count: ${pkg.name}`,
        message ? `Notes: ${message}` : ''
      ].filter(Boolean).join('\n');

      const idempotencyKey = `tuktuk-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const orderResult = await square.orders.create({
        order: {
          locationId: process.env.SQUARE_LOCATION_ID,
          customerId: squareCustomerId,
          lineItems: [
            {
              name: `Tuk Tuk Booking — ${pkg.name}`,
              quantity: '1',
              basePriceMoney: {
                amount: BigInt(pkg.cents),
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
          note: orderNote,
          state: 'DRAFT'
        },
        idempotencyKey: idempotencyKey
      });

      squareOrderId = orderResult.order.id;
    }

    /* ============================================================
       EMAIL: Notify Bad Neighbour
       ============================================================ */
    if (hasEmail) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const priceFormatted = `$${(pkg.cents / 100).toLocaleString('en-AU')}`;
      const emailBody = `
        <h2>New Tuk Tuk Booking Enquiry</h2>
        <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
          <tr><td style="padding:8px 16px 8px 0;font-weight:bold;">Name</td><td style="padding:8px 0;">${name}</td></tr>
          <tr><td style="padding:8px 16px 8px 0;font-weight:bold;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px 16px 8px 0;font-weight:bold;">Phone</td><td style="padding:8px 0;"><a href="tel:${phone}">${phone}</a></td></tr>
          <tr><td style="padding:8px 16px 8px 0;font-weight:bold;">Event Date</td><td style="padding:8px 0;">${date}</td></tr>
          <tr><td style="padding:8px 16px 8px 0;font-weight:bold;">Event Type</td><td style="padding:8px 0;">${event_type}</td></tr>
          <tr><td style="padding:8px 16px 8px 0;font-weight:bold;">Package</td><td style="padding:8px 0;">${pkg.name}</td></tr>
          <tr><td style="padding:8px 16px 8px 0;font-weight:bold;">Price</td><td style="padding:8px 0;">${priceFormatted}</td></tr>
          <tr><td style="padding:8px 16px 8px 0;font-weight:bold;">Location</td><td style="padding:8px 0;">${address}</td></tr>
          ${message ? `<tr><td style="padding:8px 16px 8px 0;font-weight:bold;">Message</td><td style="padding:8px 0;">${message}</td></tr>` : ''}
        </table>
        ${squareOrderId ? `<p style="margin-top:20px;font-size:13px;color:#666;">Square Draft Order ID: ${squareOrderId}</p>` : ''}
        <p style="margin-top:20px;font-size:13px;color:#666;">Open your Square Dashboard to review and send the invoice.</p>
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
      squareOrderId: squareOrderId || null
    });

  } catch (err) {
    console.error('Booking error:', err);
    return res.status(500).json({
      error: 'Something went wrong. Please try again or contact us directly.'
    });
  }
};
