import React, { useState, useEffect } from 'react';
import { validateTicketCode } from '../api';

export default function QrGateScanner({ tickets, prefillCode, onScanComplete }) {
  const [codeInput, setCodeInput] = useState(prefillCode || '');
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    if (prefillCode) setCodeInput(prefillCode);
  }, [prefillCode]);

  const handleScan = async (targetCode) => {
    const codeToVerify = targetCode || codeInput;
    if (!codeToVerify) return;

    const res = await validateTicketCode(codeToVerify);
    setScanResult(res);
    onScanComplete();
  };

  return (
    <div className="scanner-layout">
      {/* LEFT: OPTICAL QR GATE SCANNER TERMINAL */}
      <div className="surface-box">
        <span style={{ color: '#ff758f', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
          Turnstile Optical Verifier
        </span>
        <h2 style={{ fontSize: '1.45rem', margin: '4px 0 16px' }}>
          QR-Based Ticket Validation Terminal
        </h2>

        <div className="scanner-viewport">
          <div className="laser-line" />
          <div style={{ fontFamily: 'Space Mono', fontSize: '0.9rem', color: '#ff758f', marginBottom: '8px' }}>
            [ OPTICAL QR SENSOR ACTIVE ]
          </div>
          <p style={{ fontSize: '0.82rem', color: '#b8aed0', maxWidth: '280px', textAlign: 'center' }}>
            Enter Ticket ID or click any pass on the right to simulate an instant camera QR scan.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
          <input
            type="text"
            className="pulse-input"
            style={{ fontFamily: 'Space Mono' }}
            placeholder="Enter Ticket ID (e.g. PLS-884210)"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
          />
          <button className="coral-btn" onClick={() => handleScan(codeInput)}>
            Verify QR Pass
          </button>
        </div>

        {/* SCAN RESULT BANNER */}
        {scanResult && (
          <div
            style={{
              marginTop: '18px',
              padding: '16px',
              borderRadius: '14px',
              border: `2px solid ${
                scanResult.status === 'APPROVED'
                  ? '#10b981'
                  : scanResult.status === 'DUPLICATE'
                  ? '#ffb703'
                  : '#ff4d6d'
              }`,
              background: 'rgba(11, 7, 19, 0.75)'
            }}
          >
            <div
              style={{
                fontFamily: 'Space Mono',
                fontWeight: 700,
                fontSize: '0.95rem',
                color:
                  scanResult.status === 'APPROVED'
                    ? '#10b981'
                    : scanResult.status === 'DUPLICATE'
                    ? '#ffb703'
                    : '#ff4d6d'
              }}
            >
              [{scanResult.status}] {scanResult.message}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: ONE-CLICK PASS SIMULATOR */}
      <div className="surface-box">
        <span style={{ color: '#ff758f', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
          Live Gate Queue
        </span>
        <h3 style={{ fontSize: '1.3rem', margin: '4px 0 14px' }}>
          1-Click Simulate QR Scan from Issued Passes
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tickets.map((t) => (
            <div
              key={t.ticketId}
              style={{
                background: '#140d22',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px',
                padding: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <strong style={{ fontFamily: 'Space Mono', color: '#ff758f' }}>{t.ticketId}</strong>
                  <span className={`status-pill ${t.status}`}>{t.status}</span>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '4px' }}>
                  {t.attendeeName} • {t.quantity}x {t.tierName}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#b8aed0' }}>{t.eventTitle}</div>
              </div>

              <button
                className="coral-btn"
                style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                onClick={() => {
                  setCodeInput(t.ticketId);
                  handleScan(t.ticketId);
                }}
              >
                📷 Scan QR Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}