import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Phone, Settings, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { createEscalation } from '../lib/escalations';

const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    state: 'Maharashtra',
    district: 'Gadchiroli',
    trade: 'Electrician',
    concern: 'safety',
    time: 'Evening',
  });

  const isLanguageScreen = location.pathname === '/language';
  const noBackRoutes = ['/', '/dashboard', '/counsellor', '/cases', '/escalations', '/reports', '/thanks'];
  const showBack = !isLanguageScreen && !noBackRoutes.includes(location.pathname);

  const handleSubmit = () => {
    if (!form.phone.trim()) return;
    createEscalation({
      name: form.name,
      phone: form.phone,
      state: form.state,
      district: form.district,
      trade: form.trade,
      concern: form.concern,
      time: form.time,
      summary: `${form.name || 'Family member'} requested support for the ${form.trade} pathway and the ${form.concern} concern.`,
      triggerReason: `${form.concern.charAt(0).toUpperCase() + form.concern.slice(1)} concern`,
      priority: form.concern === 'safety' || form.concern === 'earning potential' ? 'High' : 'Medium',
    });

    setIsModalOpen(false);
    setForm({
      name: '',
      phone: '',
      state: 'Maharashtra',
      district: 'Gadchiroli',
      trade: 'Electrician',
      concern: 'safety',
      time: 'Evening',
    });
    navigate('/counsellor?status=open');
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <div className="topbar-brand">
            <ShieldCheck size={20} />
            <span>CareerSarthi</span>
          </div>
          {showBack && (
            <button className="icon-button" onClick={() => navigate(-1)} aria-label="Back">
              <ArrowLeft size={20} />
            </button>
          )}

          <div className="lang-toggle">
            <button className={lang === 'hi' ? 'active' : ''} onClick={() => setLang('hi')}>हिन्दी</button>
            <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>English</button>
          </div>
        </div>

        <div className="topbar-actions">
          {!isLanguageScreen && (
            <button className="primary-inline-button" onClick={() => setIsModalOpen(true)}>
              <Phone size={16} />
              Talk to a counsellor
            </button>
          )}

          <button className="icon-button" aria-label="Notifications">
            <Bell size={18} />
          </button>

          <button className="icon-button" onClick={() => navigate('/settings')} aria-label="Settings">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="eyebrow">Need more help?</div>
                <h3>Request a counsellor callback</h3>
              </div>
              <button className="close-button" onClick={() => setIsModalOpen(false)}>×</button>
            </div>

            <div className="modal-form-grid">
              <label>
                <span>Name</span>
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Full name" />
              </label>
              <label>
                <span>Phone</span>
                <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="10-digit phone" />
              </label>
              <label>
                <span>State</span>
                <select value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })}>
                  <option>Maharashtra</option>
                  <option>Rajasthan</option>
                  <option>Uttar Pradesh</option>
                </select>
              </label>
              <label>
                <span>District</span>
                <select value={form.district} onChange={(event) => setForm({ ...form, district: event.target.value })}>
                  <option>Gadchiroli</option>
                  <option>Mumbai</option>
                  <option>Jaipur</option>
                  <option>Lucknow</option>
                </select>
              </label>
              <label>
                <span>Trade</span>
                <select value={form.trade} onChange={(event) => setForm({ ...form, trade: event.target.value })}>
                  <option>Electrician</option>
                  <option>COPA</option>
                  <option>Fitter</option>
                </select>
              </label>
              <label>
                <span>Concern</span>
                <select value={form.concern} onChange={(event) => setForm({ ...form, concern: event.target.value })}>
                  <option value="earning potential">earning potential</option>
                  <option value="job security">job security</option>
                  <option value="social status">social status</option>
                  <option value="safety">safety</option>
                  <option value="cost">cost</option>
                </select>
              </label>
              <label className="full-width">
                <span>Preferred callback time</span>
                <select value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })}>
                  <option>Morning</option>
                  <option>Afternoon</option>
                  <option>Evening</option>
                </select>
              </label>
            </div>

            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="primary-button" onClick={handleSubmit}>Request counsellor</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopBar;
