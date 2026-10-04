import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Phone, Settings } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useSession } from '../hooks/useSession';
import locationsData from '../data/locations.json';
import type { LocationRecord } from '../types';

const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();
  const { locationDistrictId, setLocation } = useSession();

  const districts = locationsData.filter(l => l.level === 'district') as LocationRecord[];

  const isLanguageScreen = location.pathname === '/language';
  const showBack = !isLanguageScreen && location.pathname !== '/thanks';

  return (
    <header style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '16px',
      borderBottom: '1px solid var(--color-border)',
      backgroundColor: 'var(--color-surface)',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {showBack && (
          <button 
            onClick={() => navigate(-1)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              padding: '8px', 
              display: 'flex', 
              alignItems: 'center',
              color: 'var(--color-text)' 
            }}
            aria-label="Back"
          >
            <ArrowLeft size={24} />
          </button>
        )}
        <div style={{ display: 'flex', background: 'var(--color-background)', borderRadius: '8px', padding: '4px' }}>
          <button 
            onClick={() => setLang('hi')}
            style={{
              padding: '4px 12px',
              border: 'none',
              borderRadius: '4px',
              background: lang === 'hi' ? 'var(--color-surface)' : 'transparent',
              fontWeight: lang === 'hi' ? 'bold' : 'normal',
              boxShadow: lang === 'hi' ? 'var(--shadow-sm)' : 'none',
              color: 'var(--color-text)'
            }}
          >
            हिन्दी
          </button>
          <button 
            onClick={() => setLang('en')}
            style={{
              padding: '4px 12px',
              border: 'none',
              borderRadius: '4px',
              background: lang === 'en' ? 'var(--color-surface)' : 'transparent',
              fontWeight: lang === 'en' ? 'bold' : 'normal',
              boxShadow: lang === 'en' ? 'var(--shadow-sm)' : 'none',
              color: 'var(--color-text)'
            }}
          >
            English
          </button>
        </div>
      </div>
      
      {!isLanguageScreen && location.pathname !== '/location' && locationDistrictId && (
        <select 
          value={locationDistrictId} 
          onChange={e => {
            const district = districts.find(d => d.id === e.target.value);
            if (district) setLocation(district.parent_id || '', district.id);
          }}
          style={{
            maxWidth: '120px',
            height: '32px',
            borderRadius: '4px',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-background)',
            fontSize: '14px',
            padding: '0 4px',
          }}
        >
          {districts.map(d => (
            <option key={d.id} value={d.id}>{lang === 'hi' ? d.name_hi : d.name_en}</option>
          ))}
        </select>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        {!isLanguageScreen && location.pathname !== '/escalation' && (
          <button 
            onClick={() => navigate('/escalation')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              background: 'none',
              border: '1px solid var(--color-primary)',
              color: 'var(--color-primary)',
              padding: '6px 12px',
              borderRadius: '999px',
              fontSize: '14px',
              fontWeight: 500,
              minHeight: '48px'
            }}
          >
            <Phone size={16} />
            {t('btn_talk_person')}
          </button>
        )}
        <button 
          onClick={() => navigate('/settings')}
          style={{ background: 'none', border: 'none', padding: '8px', display: 'flex', alignItems: 'center', color: 'var(--color-text)', minHeight: '48px' }}
        >
          <Settings size={24} />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
