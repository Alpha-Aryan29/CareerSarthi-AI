import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useSession } from '../../hooks/useSession';
import Button from '../../components/ui/Button';
import locationsData from '../../data/locations.json';
import type { LocationRecord } from '../../types';

const LocationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { setLocation, mode } = useSession();

  const states = locationsData.filter(l => l.level === 'state') as LocationRecord[];
  
  const [selectedState, setSelectedState] = useState<string>(states[0]?.id || '');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');

  const districts = locationsData.filter(
    l => l.level === 'district' && l.parent_id === selectedState
  ) as LocationRecord[];

  const handleContinue = () => {
    if (selectedState && selectedDistrict) {
      setLocation(selectedState, selectedDistrict);
      if (mode === 'parent') {
        navigate('/profile-parent');
      } else {
        navigate('/profile-learner');
      }
    }
  };

  const selectStyle = {
    width: '100%',
    height: '56px',
    padding: '0 16px',
    fontSize: '18px',
    borderRadius: '12px',
    border: '2px solid var(--color-border)',
    backgroundColor: 'var(--color-surface)',
    marginBottom: '24px'
  };

  return (
    <div className="screen-padding" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h1 style={{ marginTop: '16px', marginBottom: '32px' }}>{t('location_title')}</h1>
      
      <div style={{ flex: 1 }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('location_state')}</label>
        <select 
          style={selectStyle}
          value={selectedState}
          onChange={(e) => {
            setSelectedState(e.target.value);
            setSelectedDistrict('');
          }}
        >
          {states.map(s => (
            <option key={s.id} value={s.id}>
              {lang === 'hi' ? s.name_hi : s.name_en}
            </option>
          ))}
        </select>

        {selectedState && (
          <>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{t('location_district')}</label>
            <select 
              style={selectStyle}
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="" disabled>--</option>
              {districts.map(d => (
                <option key={d.id} value={d.id}>
                  {lang === 'hi' ? d.name_hi : d.name_en}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      <Button 
        onClick={handleContinue} 
        disabled={!selectedState || !selectedDistrict}
        style={{ marginTop: '32px' }}
      >
        {t('btn_continue')}
      </Button>
    </div>
  );
};

export default LocationScreen;
