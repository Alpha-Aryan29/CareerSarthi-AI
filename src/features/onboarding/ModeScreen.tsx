import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useSession } from '../../hooks/useSession';
import { User, Users } from 'lucide-react';

const ModeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { setMode } = useSession();

  const handleSelect = (mode: 'learner' | 'parent' | 'both') => {
    setMode(mode);
    navigate('/location');
  };

  const cardStyle = {
    width: '100%',
    padding: '24px',
    borderRadius: '16px',
    border: '2px solid var(--color-border)',
    backgroundColor: 'var(--color-surface)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    cursor: 'pointer',
    marginBottom: '16px'
  };

  return (
    <div className="screen-padding">
      <h1 style={{ marginTop: '16px', marginBottom: '32px' }}>{t('mode_title')}</h1>
      
      <button 
        style={{ ...cardStyle, border: '2px solid var(--color-primary)', backgroundColor: '#F0FDF4' }} 
        onClick={() => handleSelect('both')}
      >
        <Users size={48} color="var(--color-primary)" />
        <div style={{ textAlign: 'left' }}>
          <h3 style={{ color: 'var(--color-primary)' }}>{t('mode_both')}</h3>
          <span style={{ fontSize: '14px', color: 'var(--color-primary)' }}>⭐ {t('mode_recommend')}</span>
        </div>
      </button>

      <button style={cardStyle} onClick={() => handleSelect('learner')}>
        <User size={32} color="var(--color-text-muted)" />
        <h3 style={{ color: 'var(--color-text)' }}>{t('mode_learner')}</h3>
      </button>

      <button style={cardStyle} onClick={() => handleSelect('parent')}>
        <User size={32} color="var(--color-text-muted)" />
        <h3 style={{ color: 'var(--color-text)' }}>{t('mode_parent')}</h3>
      </button>
    </div>
  );
};

export default ModeScreen;
