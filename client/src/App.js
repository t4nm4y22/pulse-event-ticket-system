import React, { useEffect, useState, useCallback } from 'react';
import './App.css';
import { fetchBootstrapData } from './api';
import EventDiscovery from './components/EventDiscovery';
import MyPassesWallet from './components/MyPassesWallet';
import QrGateScanner from './components/QrGateScanner';
import OrganizerStudio from './components/OrganizerStudio';

export default function App() {
  const [activeTab, setActiveTab] = useState('DISCOVER');
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [scannerPrefill, setScannerPrefill] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  const notify = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      const data = await fetchBootstrapData();
      setEvents(data.events || []);
      setTickets(data.tickets || []);
    } catch (err) {
      console.error('Error loading PULSE data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div>
      {/* TOP NAVIGATION */}
      <header className="pulse-navbar">
        <div className="pulse-logo">
          <div className="pulse-badge-icon">P</div>
          <div>
            <div className="pulse-brand-text">PULSE // LIVE</div>
            <div style={{ fontSize: '0.7rem', color: '#b8aed0', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Event Discovery & QR Pass Engine
            </div>
          </div>
        </div>

        <nav className="pulse-nav-tabs">
          <button
            className={`pulse-tab ${activeTab === 'DISCOVER' ? 'active' : ''}`}
            onClick={() => setActiveTab('DISCOVER')}
          >
            🎪 Discover Events
            <span className="tab-counter">{events.length}</span>
          </button>

          <button
            className={`pulse-tab ${activeTab === 'PASSES' ? 'active' : ''}`}
            onClick={() => setActiveTab('PASSES')}
          >
            🎟️ My QR Passes
            <span className="tab-counter">{tickets.length}</span>
          </button>

          <button
            className={`pulse-tab ${activeTab === 'SCANNER' ? 'active' : ''}`}
            onClick={() => setActiveTab('SCANNER')}
          >
            📷 QR Gate Scanner
          </button>

          <button
            className={`pulse-tab ${activeTab === 'ORGANIZER' ? 'active' : ''}`}
            onClick={() => setActiveTab('ORGANIZER')}
          >
            📊 Organizer Dashboard
          </button>
        </nav>
      </header>

      {/* MAIN STAGE */}
      <main className="pulse-container">
        {activeTab === 'DISCOVER' && (
          <EventDiscovery
            events={events}
            notify={notify}
            onBookingSuccess={(data) => {
              setEvents(data.events);
              setTickets(data.tickets);
              setActiveTab('PASSES');
            }}
          />
        )}

        {activeTab === 'PASSES' && (
          <MyPassesWallet
            tickets={tickets}
            notify={notify}
            onJumpToScanner={(ticketId) => {
              setScannerPrefill(ticketId);
              setActiveTab('SCANNER');
            }}
          />
        )}

        {activeTab === 'SCANNER' && (
          <QrGateScanner
            tickets={tickets}
            prefillCode={scannerPrefill}
            onScanComplete={loadData}
          />
        )}

        {activeTab === 'ORGANIZER' && (
          <OrganizerStudio
            events={events}
            tickets={tickets}
            onEventCreated={loadData}
            notify={notify}
          />
        )}
      </main>

      {/* FLOATING TOAST ALERT */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #ff4d6d, #9d4edd)',
            color: 'white',
            padding: '14px 22px',
            borderRadius: '14px',
            fontWeight: 700,
            boxShadow: '0 14px 30px rgba(0,0,0,0.5)',
            zIndex: 400
          }}
        >
          ⚡ {toastMsg}
        </div>
      )}
    </div>
  );
}