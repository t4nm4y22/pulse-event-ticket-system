import React from 'react';

export default function MyPassesWallet({ tickets, onJumpToScanner, notify }) {
  const copyCode = (ticketId) => {
    navigator.clipboard.writeText(ticketId);
    notify(`Copied Pass ID ${ticketId} to clipboard!`);
  };

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span style={{ color: '#ff758f', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
            Cryptographic QR Pass Wallet
          </span>
          <h2 style={{ fontSize: '1.7rem' }}>My Booked Event Passes ({tickets.length})</h2>
        </div>
      </div>

      <div className="ticket-stub-grid">
        {tickets.map((t) => (
          <div key={t.ticketId} className="perforated-ticket">
            <div className="stub-left">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className={`status-pill ${t.status}`}>{t.status}</span>
                  <span style={{ fontFamily: 'Space Mono', fontSize: '0.76rem', color: '#b8aed0' }}>
                    {t.paymentTxnId}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.22rem', marginBottom: '6px' }}>{t.eventTitle}</h3>
                <p style={{ fontSize: '0.84rem', color: '#b8aed0' }}>📍 {t.venue}</p>
                <p style={{ fontSize: '0.84rem', color: '#ffb703', marginTop: '4px', fontFamily: 'Space Mono' }}>
                  🗓️ {t.eventDate} • {t.eventTime}
                </p>
              </div>

              <div style={{ background: 'rgba(11,7,19,0.5)', padding: '12px', borderRadius: '12px', fontSize: '0.83rem' }}>
                <div><strong>Attendee:</strong> {t.attendeeName}</div>
                <div><strong>Tier & Qty:</strong> {t.quantity}x {t.tierName}</div>
                <div><strong>Paid via {t.paymentMethod}:</strong> ₹{Number(t.totalPaid).toLocaleString('en-IN')}</div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="ghost-btn" style={{ fontSize: '0.78rem' }} onClick={() => copyCode(t.ticketId)}>
                  📋 Copy ID ({t.ticketId})
                </button>
                <button className="coral-btn" style={{ padding: '8px 14px', fontSize: '0.78rem' }} onClick={() => onJumpToScanner(t.ticketId)}>
                  Test at QR Gate Scanner →
                </button>
              </div>
            </div>

            <div className="stub-right">
              <div className="qr-frame">
                <img src={t.qrCode} alt={`QR Code for ${t.ticketId}`} />
              </div>
              <div style={{ fontFamily: 'Space Mono', fontWeight: 700, fontSize: '0.95rem', color: '#ff758f' }}>
                {t.ticketId}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#b8aed0' }}>
                {t.status === 'CHECKED-IN'
                  ? `Scanned at ${new Date(t.checkedInAt).toLocaleTimeString()}`
                  : 'Present QR at Venue Turnstile'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}