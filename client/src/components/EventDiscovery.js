import React, { useState } from 'react';
import { checkoutBooking } from '../api';

export default function EventDiscovery({ events, onBookingSuccess, notify }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('ALL');

  // Booking & Payment Gateway Modal State
  const [activeEvent, setActiveEvent] = useState(null);
  const [selectedTier, setSelectedTier] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [attendeeName, setAttendeeName] = useState('Tanmay Pandey');
  const [attendeeEmail, setAttendeeEmail] = useState('tanmay.pandey@pulse.live');
  const [paymentMethod, setPaymentMethod] = useState('UPI Instant (GPay / PhonePe)');
  const [upiId, setUpiId] = useState('tanmay@okaxis');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const categories = ['ALL', ...Array.from(new Set(events.map((e) => e.category)))];
  const cities = ['ALL', ...Array.from(new Set(events.map((e) => e.city)))];

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || ev.category === selectedCategory;
    const matchesCity = selectedCity === 'ALL' || ev.city === selectedCity;
    return matchesSearch && matchesCat && matchesCity;
  });

  const openBookingModal = (ev) => {
    setActiveEvent(ev);
    setSelectedTier(ev.tiers[0]?.name || '');
    setQuantity(1);
  };

  const currentTierObj = activeEvent?.tiers.find((t) => t.name === selectedTier);
  const subtotal = (currentTierObj?.price || 0) * quantity;
  const convenienceFee = Math.round(subtotal * 0.02);
  const grandTotal = subtotal + convenienceFee;

  const handlePaymentAndBook = async (e) => {
    e.preventDefault();
    if (!activeEvent || !selectedTier) return;

    try {
      setIsProcessingPayment(true);
      // Simulate 900ms payment gateway handshake
      await new Promise((r) => setTimeout(r, 900));

      const data = await checkoutBooking({
        eventId: activeEvent.id,
        tierName: selectedTier,
        quantity,
        attendeeName,
        attendeeEmail,
        paymentMethod
      });

      setActiveEvent(null);
      onBookingSuccess(data);
      notify(`Payment Approved! QR Pass ${data.ticket.ticketId} generated.`);
    } catch (err) {
      notify(err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div>
      {/* SEARCH & FILTER BAR */}
      <section className="discovery-hero">
        <div>
          <span style={{ color: '#ff758f', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Live Experience Discovery
          </span>
          <h1 style={{ fontSize: '1.9rem', marginTop: '4px' }}>
            Book Verified QR Passes for Concerts, Tech Summits & Arenas
          </h1>
        </div>

        <div className="search-strip">
          <input
            type="text"
            className="pulse-input"
            placeholder="🔍 Search by artist, event title, or stadium venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className="pulse-input"
            style={{ maxWidth: '200px' }}
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c === 'ALL' ? '📍 All Cities' : `📍 ${c}`}
              </option>
            ))}
          </select>
        </div>

        <div className="chip-row">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* EVENT GRID */}
      <div className="event-grid">
        {filteredEvents.map((ev) => {
          const lowestPrice = Math.min(...ev.tiers.map((t) => t.price));
          const totalLeft = ev.tiers.reduce((acc, t) => acc + (t.capacity - t.sold), 0);

          return (
            <article key={ev.id} className="event-poster-card">
              <div>
                <div className="poster-img-box">
                  <img src={ev.banner} alt={ev.title} />
                  <div className="poster-top-badges">
                    <span className="cat-tag">{ev.category}</span>
                    <span className="city-tag">{ev.city}</span>
                  </div>
                </div>

                <div className="poster-content">
                  <div className="poster-date">
                    📅 {ev.date} • {ev.time}
                  </div>
                  <h3 className="poster-title">{ev.title}</h3>
                  <div className="poster-venue">📍 {ev.venue}, {ev.city}</div>
                  <p style={{ fontSize: '0.84rem', color: '#b8aed0', lineHeight: 1.5 }}>
                    {ev.description}
                  </p>

                  <div className="tier-preview-pills">
                    {ev.tiers.map((t) => (
                      <span key={t.name} className="tier-mini-pill">
                        {t.name}: ₹{t.price} ({t.capacity - t.sold} left)
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="poster-footer">
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#b8aed0' }}>
                    {totalLeft} Total Passes Available
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ff758f' }}>
                    From ₹{lowestPrice.toLocaleString('en-IN')}
                  </div>
                </div>

                <button className="coral-btn" onClick={() => openBookingModal(ev)}>
                  Book Pass →
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* INTERACTIVE CHECKOUT & PAYMENT GATEWAY MODAL */}
      {activeEvent && (
        <div className="modal-overlay" onClick={() => setActiveEvent(null)}>
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span className="cat-tag">PULSE SECURE CHECKOUT</span>
              <button className="ghost-btn" onClick={() => setActiveEvent(null)}>✕</button>
            </div>

            <h2 style={{ fontSize: '1.35rem', marginBottom: '4px' }}>{activeEvent.title}</h2>
            <p style={{ color: '#b8aed0', fontSize: '0.85rem', marginBottom: '18px' }}>
              📍 {activeEvent.venue}, {activeEvent.city} • {activeEvent.date}
            </p>

            <form onSubmit={handlePaymentAndBook} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#b8aed0' }}>1. Select Ticket Tier</label>
                <select
                  className="pulse-input"
                  style={{ width: '100%', marginTop: '6px' }}
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                >
                  {activeEvent.tiers.map((t) => (
                    <option key={t.name} value={t.name} disabled={t.capacity - t.sold <= 0}>
                      {t.name} — ₹{t.price} ({t.capacity - t.sold} seats available)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#b8aed0' }}>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="pulse-input"
                    style={{ width: '100%', marginTop: '6px' }}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: '#b8aed0' }}>Attendee Full Name</label>
                  <input
                    type="text"
                    required
                    className="pulse-input"
                    style={{ width: '100%', marginTop: '6px' }}
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#b8aed0' }}>Attendee Email (For QR Dispatch)</label>
                <input
                  type="email"
                  required
                  className="pulse-input"
                  style={{ width: '100%', marginTop: '6px' }}
                  value={attendeeEmail}
                  onChange={(e) => setAttendeeEmail(e.target.value)}
                />
              </div>

              {/* PAYMENT GATEWAY MODULE */}
              <div style={{ background: '#140d22', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,77,109,0.25)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ff758f', marginBottom: '10px' }}>
                  💳 PULSE PAYMENT GATEWAY (256-BIT ENCRYPTED)
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  {['UPI Instant (GPay / PhonePe)', 'Credit / Debit Card', 'NetBanking'].map((method) => (
                    <button
                      type="button"
                      key={method}
                      className={`filter-chip ${paymentMethod === method ? 'active' : ''}`}
                      onClick={() => setPaymentMethod(method)}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  required
                  className="pulse-input"
                  style={{ width: '100%', fontSize: '0.86rem' }}
                  placeholder={
                    paymentMethod.includes('UPI')
                      ? 'Enter Virtual Payment Address (e.g. tanmay@okaxis)'
                      : 'Enter 16-Digit Card / Account Reference'
                  }
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />

                <div style={{ marginTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b8aed0' }}>
                    <span>Subtotal ({quantity}x {selectedTier})</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b8aed0', marginTop: '4px' }}>
                    <span>Platform & QR Minting Fee (2%)</span>
                    <span>₹{convenienceFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', color: '#10b981', marginTop: '8px' }}>
                    <span>Total Payable</span>
                    <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <button type="submit" className="coral-btn" disabled={isProcessingPayment}>
                {isProcessingPayment
                  ? '⚡ Authorizing Payment & Minting QR Code...'
                  : `Authorize ₹${grandTotal.toLocaleString('en-IN')} & Generate QR Pass`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}