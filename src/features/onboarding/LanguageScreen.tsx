import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import Button from '../../components/ui/Button';

const LanguageScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setLang } = useLanguage();

  const handleSelect = (lang: string) => {
    setLang(lang);
    navigate('/consent');
  };

  return (
    <div className="screen-padding" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h1 style={{ marginTop: '32px', marginBottom: '48px', textAlign: 'center' }}>
        Welcome / स्वागत है
      </h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: 'auto', marginBottom: 'auto' }}>
        <Button 
          onClick={() => handleSelect('hi')}
          style={{ height: '80px', fontSize: '24px' }}
        >
          हिन्दी
        </Button>
        
        <Button 
          onClick={() => handleSelect('en')}
          style={{ height: '80px', fontSize: '24px' }}
        >
          English
        </Button>
      </div>
    </div>
  );
};

export default LanguageScreen;
