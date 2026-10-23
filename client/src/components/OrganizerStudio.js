import React, { useState } from 'react';
import { createNewEvent } from '../api';

export default function OrganizerStudio({ events, tickets, onEventCreated, notify }) {
  const [form, setForm] = useState({
    title: '',
    category: 'Music & Hip-Hop',
    date: '2026-12-24',
    time: '19:30 IST',
    venue: '',
    city: 'Nagpur',
    organizer: 'Pulse Live Productions',
    banner: '',
    description: '',
    tier1Name: 'General Access',
    tier1Price: 999,
    tier1Cap: 150,
    tier2Name: 'VIP Fan Pit',
    tier2Price: 2499,
    tier2Cap: 50
  });

  const totalRevenue = tickets.reduce((acc, t) => acc + Number(t.totalPaid || 0), 0);
  const totalTicketsSold = tickets.reduce((acc, t) => acc + Number(t.quantity || 0), 0);
  const checkedInCount = tickets.filter((t) => t.status === 'CHECKED-IN').length;

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createNewEvent({
        title: form.title,
        category: form.category,
        date: form.date,
        time: form.time,
        venue: form.venue,
        city: form.city,
        organizer: form.organizer,
        banner: form.banner,
        description: form.description,
        tiers: [
          { name: form.tier1Name, price: Number(form.tier1Price), capacity: Number(form.tier1Cap), sold: 0 },
          { name: form.tier2Name, price: Number(form.tier2Price), capacity: Number(form.tier2Cap), sold: 0 }
        ]
      });
      setForm({ ...form, title: '', venue: '', description: '' });
      onEventCreated();
      notify('New Event Published to Discovery Feed!');
    } catch (err) {
      notify(err.message);
    }
  };

  return (
    <div>
      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '26px' }}>
        <div className="surface-box" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.78rem', color: '#b8aed0', textTransform: 'uppercase' }}>Gross Box-Office Revenue</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#10b981', fontFamily: 'Space Mono', marginTop: '6px' }}>
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="surface-box" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.78rem', color: '#b8aed0', textTransform: 'uppercase' }}>Total Passes Minted</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#ff758f', fontFamily: 'Space Mono', marginTop: '6px' }}>
            {totalTicketsSold} Seats
          </div>
        </div>

        <div className="surface-box" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '0.78rem', color: '#b8aed0', textTransform: 'uppercase' }}>QR Gate Check-Ins</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#ffb703', fontFamily: 'Space Mono', marginTop: '6px' }}>
            {checkedInCount} / {tickets.length} Verified
          </div>
        </div>
      </div>

      {/* CREATE NEW EVENT FORM */}
      <div className="surface-box">
        <h3 style={{ fontSize: '1.35rem', marginBottom: '16px' }}>+ Launch New Event & Configure Seat Tiers</h3>
        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          <input
            className="pulse-input"
            placeholder="Event Title *"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            className="pulse-input"
            placeholder="Category (e.g. Music & Hip-Hop)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <input
            type="date"
            className="pulse-input"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <input
            className="pulse-input"
            placeholder="Venue Name *"
            required
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
          />
          <input
            className="pulse-input"
            placeholder="City (e.g. Nagpur, Mumbai)"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <input
            className="pulse-input"
            placeholder="Banner Image URL (Optional)"
            value={form.banner}
            onChange={(e) => setForm({ ...form, banner: e.target.value })}
          />
          <input
            className="pulse-input"
            placeholder="Tier 1 Price (₹)"
            type="number"
            value={form.tier1Price}
            onChange={(e) => setForm({ ...form, tier1Price: e.target.value })}
          />
          <input
            className="pulse-input"
            placeholder="Tier 2 VIP Price (₹)"
            type="number"
            value={form.tier2Price}
            onChange={(e) => setForm({ ...form, tier2Price: e.target.value })}
          />
          <button type="submit" className="coral-btn">
            Publish Event Live
          </button>
        </form>
      </div>

      {/* ATTENDEE MANIFEST TABLE */}
      <div className="surface-box">
        <h3 style={{ fontSize: '1.3rem', marginBottom: '14px' }}>Live Attendee & Payment Gateway Ledger</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Pass ID</th>
              <th>Attendee</th>
              <th>Event</th>
              <th>Tier & Qty</th>
              <th>Gateway Ref</th>
              <th>Total Paid</th>
              <th>Gate Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.ticketId}>
                <td style={{ fontFamily: 'Space Mono', color: '#ff758f', fontWeight: 700 }}>{t.ticketId}</td>
                <td>{t.attendeeName}</td>
                <td>{t.eventTitle}</td>
                <td>{t.quantity}x {t.tierName}</td>
                <td style={{ fontFamily: 'Space Mono', fontSize: '0.8rem', color: '#b8aed0' }}>
                  {t.paymentTxnId} ({t.paymentMethod})
                </td>
                <td style={{ fontFamily: 'Space Mono', color: '#10b981', fontWeight: 700 }}>
                  ₹{Number(t.totalPaid).toLocaleString('en-IN')}
                </td>
                <td>
                  <span className={`status-pill ${t.status}`}>{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}