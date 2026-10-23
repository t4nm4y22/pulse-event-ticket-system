const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'data', 'db.json');

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (err) {
    return { events: [], tickets: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Seed initial demo QR ticket on first boot so My Passes & QR Scanner work immediately
async function ensureDemoTicket() {
  const db = readDB();
  if (db.tickets.length === 0 && db.events.length > 0) {
    const ev = db.events[0];
    const ticketId = 'PLS-884210';
    const payload = JSON.stringify({
      ticketId,
      eventId: ev.id,
      eventTitle: ev.title,
      holder: 'Tanmay Pandey',
      tier: 'VIP Elevate Deck',
      qty: 2
    });
    const qrDataUrl = await QRCode.toDataURL(payload, {
      margin: 1,
      color: { dark: '#0b0713', light: '#ffffff' }
    });

    db.tickets.push({
      ticketId,
      paymentTxnId: 'PAY-9920184',
      eventId: ev.id,
      eventTitle: ev.title,
      eventDate: ev.date,
      eventTime: ev.time,
      venue: `${ev.venue}, ${ev.city}`,
      attendeeName: 'Tanmay Pandey',
      attendeeEmail: 'tanmay@pulse.live',
      tierName: 'VIP Elevate Deck',
      quantity: 2,
      unitPrice: 2499,
      convenienceFee: 99,
      totalPaid: 5097,
      paymentMethod: 'UPI Instant (GPay)',
      status: 'VALID',
      qrCode: qrDataUrl,
      bookedAt: new Date().toISOString(),
      checkedInAt: null
    });
    writeDB(db);
  }
}
ensureDemoTicket();

// GET all events & tickets
app.get('/api/bootstrap', (req, res) => {
  const db = readDB();
  res.json(db);
});

// POST create a new event (Organizer Dashboard)
app.post('/api/events', (req, res) => {
  const { title, category, date, time, venue, city, organizer, banner, description, tiers } = req.body;
  if (!title || !date || !venue) {
    return res.status(400).json({ error: 'Title, date, and venue are required.' });
  }

  const db = readDB();
  const newEvent = {
    id: `EVT-${400 + db.events.length + 1}`,
    title: title.trim(),
    category: category || 'Music & Hip-Hop',
    date,
    time: time || '19:00 IST',
    venue: venue.trim(),
    city: city || 'Nagpur',
    organizer: organizer || 'Pulse Official Partner',
    banner: banner || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
    description: description || 'Curated live experience powered by Pulse QR ticketing.',
    tiers: Array.isArray(tiers) && tiers.length > 0 ? tiers : [
      { name: 'General Access', price: 799, capacity: 150, sold: 0 },
      { name: 'VIP Lounge', price: 2199, capacity: 40, sold: 0 }
    ]
  };

  db.events.unshift(newEvent);
  writeDB(db);
  res.status(201).json(newEvent);
});

// POST Checkout & Payment Gateway Integration + QR Code Ticket Generation
app.post('/api/bookings/checkout', async (req, res) => {
  try {
    const { eventId, tierName, quantity, attendeeName, attendeeEmail, paymentMethod } = req.body;
    const qty = Number(quantity) || 1;

    const db = readDB();
    const event = db.events.find((e) => e.id === eventId);
    if (!event) return res.status(404).json({ error: 'Event not found.' });

    const tier = event.tiers.find((t) => t.name === tierName);
    if (!tier) return res.status(400).json({ error: 'Selected ticket tier not found.' });

    const remaining = tier.capacity - tier.sold;
    if (remaining < qty) {
      return res.status(400).json({ error: `Only ${remaining} seats left in ${tierName}.` });
    }

    // Update sold inventory
    tier.sold += qty;

    const subtotal = tier.price * qty;
    const convenienceFee = Math.round(subtotal * 0.02);
    const totalPaid = subtotal + convenienceFee;

    const ticketId = `PLS-${Math.floor(100000 + Math.random() * 900000)}`;
    const paymentTxnId = `PAY-${Date.now().toString().slice(-7)}`;

    const qrPayload = JSON.stringify({
      ticketId,
      paymentTxnId,
      eventId: event.id,
      eventTitle: event.title,
      holder: attendeeName,
      tier: tier.name,
      qty
    });

    const qrCode = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      color: { dark: '#0b0713', light: '#ffffff' }
    });

    const newTicket = {
      ticketId,
      paymentTxnId,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      venue: `${event.venue}, ${event.city}`,
      attendeeName: attendeeName.trim(),
      attendeeEmail: attendeeEmail.trim(),
      tierName: tier.name,
      quantity: qty,
      unitPrice: tier.price,
      convenienceFee,
      totalPaid,
      paymentMethod: paymentMethod || 'UPI QR Instant',
      status: 'VALID',
      qrCode,
      bookedAt: new Date().toISOString(),
      checkedInAt: null
    };

    db.tickets.unshift(newTicket);
    writeDB(db);

    res.status(201).json({
      ticket: newTicket,
      events: db.events,
      tickets: db.tickets
    });
  } catch (err) {
    res.status(500).json({ error: 'Checkout processing failed.' });
  }
});

// POST QR Ticket Validation at Venue Gate
app.post('/api/tickets/validate', (req, res) => {
  const { codeInput } = req.body;
  if (!codeInput) {
    return res.status(400).json({ valid: false, status: 'ERROR', message: 'Provide a Ticket ID or QR payload.' });
  }

  let extractedTicketId = codeInput.trim();
  // Support both raw Ticket ID ("PLS-884210") and full JSON QR string
  if (extractedTicketId.startsWith('{')) {
    try {
      const parsed = JSON.parse(extractedTicketId);
      if (parsed.ticketId) extractedTicketId = parsed.ticketId;
    } catch (e) {}
  }

  const db = readDB();
  const ticket = db.tickets.find(
    (t) => t.ticketId.toUpperCase() === extractedTicketId.toUpperCase()
  );

  if (!ticket) {
    return res.status(404).json({
      valid: false,
      status: 'INVALID',
      message: `Counterfeit or Unregistered Pass (${extractedTicketId}). Access Denied!`
    });
  }

  if (ticket.status === 'CHECKED-IN') {
    return res.status(409).json({
      valid: false,
      status: 'DUPLICATE',
      message: `DUPLICATE SCAN BLOCKED! Already checked in at ${new Date(ticket.checkedInAt).toLocaleTimeString()}.`,
      ticket
    });
  }

  ticket.status = 'CHECKED-IN';
  ticket.checkedInAt = new Date().toISOString();
  writeDB(db);

  res.json({
    valid: true,
    status: 'APPROVED',
    message: `ACCESS GRANTED — Welcome ${ticket.attendeeName} (${ticket.quantity}x ${ticket.tierName})`,
    ticket,
    tickets: db.tickets
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🎟️ PULSE Event & Ticketing Server running on http://localhost:${PORT}`);
});