import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import Button from '../../components/ui/Button';
import ListenButton from '../../components/ui/ListenButton';
import { createEscalation } from '../../lib/escalations';

const EscalationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Gadchiroli');
  const [trade, setTrade] = useState('Electrician');
  const [concern, setConcern] = useState('safety');
  const [time, setTime] = useState('Evening');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    createEscalation({
      name,
      phone,
      state,
      district,
      trade,
      concern,
      time,
      triggerReason: `${concern.charAt(0).toUpperCase() + concern.slice(1)} concern`,
      summary: `${name || 'Family member'} requested follow-up for the ${trade} pathway and the ${concern} concern.`,
      priority: concern === 'safety' || concern === 'earning potential' ? 'High' : 'Medium',
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="screen-padding" style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-success)', marginBottom: '16px' }}>{t('escalation_success')}</h2>
        <Button onClick={() => navigate('/counsellor?status=open')} style={{ marginTop: '32px' }}>
          View queue
        </Button>
      </div>
    );
  }

  return (
    <div className="screen-padding" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h1 style={{ marginTop: '16px', marginBottom: '24px' }}>{t('escalation_title')}</h1>

      <div style={{ backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', marginBottom: '24px' }}>
        <p style={{ marginBottom: '16px' }}>{t('escalation_desc')}</p>
        <ListenButton text={t('escalation_desc')} />
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        <label>
          <span style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" style={{ width: '100%', height: '56px', padding: '0 16px', borderRadius: '12px', border: '2px solid var(--color-border)' }} />
        </label>
        <label>
          <span style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('escalation_phone')}</span>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10 digit number" style={{ width: '100%', height: '56px', padding: '0 16px', borderRadius: '12px', border: '2px solid var(--color-border)' }} />
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <label>
            <span style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>State</span>
            <select value={state} onChange={(e) => setState(e.target.value)} style={{ width: '100%', height: '56px', padding: '0 12px', borderRadius: '12px', border: '2px solid var(--color-border)' }}>
              <option>Maharashtra</option>
              <option>Rajasthan</option>
              <option>Uttar Pradesh</option>
            </select>
          </label>
          <label>
            <span style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>District</span>
            <select value={district} onChange={(e) => setDistrict(e.target.value)} style={{ width: '100%', height: '56px', padding: '0 12px', borderRadius: '12px', border: '2px solid var(--color-border)' }}>
              <option>Gadchiroli</option>
              <option>Mumbai</option>
              <option>Jaipur</option>
              <option>Lucknow</option>
            </select>
          </label>
          <label>
            <span style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Trade</span>
            <select value={trade} onChange={(e) => setTrade(e.target.value)} style={{ width: '100%', height: '56px', padding: '0 12px', borderRadius: '12px', border: '2px solid var(--color-border)' }}>
              <option>Electrician</option>
              <option>COPA</option>
              <option>Fitter</option>
            </select>
          </label>
          <label>
            <span style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Concern</span>
            <select value={concern} onChange={(e) => setConcern(e.target.value)} style={{ width: '100%', height: '56px', padding: '0 12px', borderRadius: '12px', border: '2px solid var(--color-border)' }}>
              <option value="earning potential">earning potential</option>
              <option value="job security">job security</option>
              <option value="social status">social status</option>
              <option value="safety">safety</option>
              <option value="cost">cost</option>
            </select>
          </label>
        </div>

        <div style={{ marginTop: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('escalation_time')}</label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {['Morning', 'Afternoon', 'Evening'].map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTime(slot)}
                className={time === slot ? 'chip-button active' : 'chip-button'}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={!phone || !time} style={{ marginTop: '24px' }}>
        {t('btn_submit')}
      </Button>
    </div>
  );
};

export default EscalationScreen;
