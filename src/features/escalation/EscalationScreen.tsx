import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import Button from '../../components/ui/Button';
import ListenButton from '../../components/ui/ListenButton';

const EscalationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [phone, setPhone] = useState('');
  const [time, setTime] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    // Save to localStorage for the counsellor view to read
    const cases = JSON.parse(localStorage.getItem('escalations') || '[]');
    cases.push({
      id: Date.now().toString(),
      phone,
      time,
      status: 'open',
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('escalations', JSON.stringify(cases));
    
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="screen-padding" style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-success)', marginBottom: '16px' }}>{t('escalation_success')}</h2>
        <Button onClick={() => navigate(-1)} style={{ marginTop: '32px' }}>
          Back to chat
        </Button>
      </div>
    );
  }

  const OptionCard: React.FC<{ selected: boolean; onClick: () => void; label: string }> = ({ selected, onClick, label }) => (
    <div 
      onClick={onClick}
      style={{
        padding: '16px',
        borderRadius: '12px',
        border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
        backgroundColor: selected ? '#F0FDF4' : 'var(--color-surface)',
        cursor: 'pointer',
        textAlign: 'center',
        fontWeight: selected ? 600 : 400,
        color: selected ? 'var(--color-primary)' : 'var(--color-text)',
        flex: 1
      }}
    >
      {label}
    </div>
  );

  return (
    <div className="screen-padding" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h1 style={{ marginTop: '16px', marginBottom: '24px' }}>{t('escalation_title')}</h1>
      
      <div style={{ backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', marginBottom: '32px' }}>
        <p style={{ marginBottom: '16px' }}>{t('escalation_desc')}</p>
        <ListenButton text={t('escalation_desc')} />
      </div>

      <div style={{ flex: 1 }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('escalation_phone')}</label>
        <input 
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="10 digit number"
          style={{
            width: '100%',
            height: '56px',
            padding: '0 16px',
            fontSize: '18px',
            borderRadius: '12px',
            border: '2px solid var(--color-border)',
            marginBottom: '32px'
          }}
        />

        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('escalation_time')}</label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <OptionCard selected={time === 'morning'} onClick={() => setTime('morning')} label={t('escalation_morning')} />
          <OptionCard selected={time === 'afternoon'} onClick={() => setTime('afternoon')} label={t('escalation_afternoon')} />
          <OptionCard selected={time === 'evening'} onClick={() => setTime('evening')} label={t('escalation_evening')} />
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={!phone || !time} style={{ marginTop: '32px' }}>
        {t('btn_submit')}
      </Button>
    </div>
  );
};

export default EscalationScreen;
