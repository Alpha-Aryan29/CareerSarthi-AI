import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import Button from '../../components/ui/Button';
import ListenButton from '../../components/ui/ListenButton';

const ConsentScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="screen-padding" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h1 style={{ marginTop: '16px', marginBottom: '24px' }}>
        {t('consent_title')}
      </h1>
      
      <div style={{ backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
        <p style={{ marginBottom: '16px' }}>{t('consent_text')}</p>
        <ListenButton text={t('consent_text')} />
      </div>
      
      <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Button onClick={() => navigate('/mode')}>
          {t('btn_i_agree')}
        </Button>
        <Button variant="secondary" onClick={() => navigate('/language')}>
          {t('btn_not_now')}
        </Button>
      </div>
    </div>
  );
};

export default ConsentScreen;
