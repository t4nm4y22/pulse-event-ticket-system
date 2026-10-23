const API_BASE = 'http://localhost:5000/api';

export async function fetchBootstrapData() {
  const res = await fetch(`${API_BASE}/bootstrap`);
  if (!res.ok) throw new Error('Failed to load platform data');
  return res.json();
}

export async function checkoutBooking(payload) {
  const res = await fetch(`${API_BASE}/bookings/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Booking failed');
  return data;
}

export async function validateTicketCode(codeInput) {
  const res = await fetch(`${API_BASE}/tickets/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ codeInput })
  });
  return res.json();
}

export async function createNewEvent(payload) {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Could not create event');
  return data;
}