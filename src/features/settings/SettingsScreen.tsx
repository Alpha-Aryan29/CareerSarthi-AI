import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useLanguage } from '../../hooks/useLanguage';
import Button from '../../components/ui/Button';

const SettingsScreen: React.FC = () => {
  const { lang, setLang } = useLanguage();
  const { 
    textSize, setTextSize,
    simpleMode, setSimpleMode,
    highContrast, setHighContrast,
    readAloud, setReadAloud,
    audioSpeed, setAudioSpeed
  } = useSettings();

  const sectionStyle = {
    padding: '16px',
    backgroundColor: 'var(--color-surface)',
    borderRadius: '12px',
    marginBottom: '16px',
    border: '1px solid var(--color-border)',
  };

  const labelStyle = {
    fontWeight: 600,
    marginBottom: '8px',
    display: 'block'
  };

  return (
    <div className="screen-padding" style={{ paddingBottom: '100px' }}>
      <h1 style={{ marginBottom: '24px' }}>Settings</h1>

      <div style={sectionStyle}>
        <label style={labelStyle}>Language / भाषा</label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant={lang === 'en' ? 'primary' : 'secondary'} onClick={() => setLang('en')} style={{ flex: 1, minHeight: '48px' }}>English</Button>
          <Button variant={lang === 'hi' ? 'primary' : 'secondary'} onClick={() => setLang('hi')} style={{ flex: 1, minHeight: '48px' }}>हिन्दी</Button>
        </div>
      </div>

      <div style={sectionStyle}>
        <label style={labelStyle}>Text Size</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant={textSize === 'normal' ? 'primary' : 'secondary'} onClick={() => setTextSize('normal')} style={{ flex: 1, minHeight: '48px' }}>Normal</Button>
          <Button variant={textSize === 'large' ? 'primary' : 'secondary'} onClick={() => setTextSize('large')} style={{ flex: 1, minHeight: '48px' }}>Large</Button>
          <Button variant={textSize === 'extra_large' ? 'primary' : 'secondary'} onClick={() => setTextSize('extra_large')} style={{ flex: 1, minHeight: '48px' }}>X-Large</Button>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <label style={labelStyle}>Simple Mode</label>
            <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>More icons, less text</span>
          </div>
          <input 
            type="checkbox" 
            checked={simpleMode} 
            onChange={(e) => setSimpleMode(e.target.checked)} 
            style={{ width: '24px', height: '24px' }}
          />
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <label style={labelStyle}>High Contrast</label>
            <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Darker text, clearer borders</span>
          </div>
          <input 
            type="checkbox" 
            checked={highContrast} 
            onChange={(e) => setHighContrast(e.target.checked)} 
            style={{ width: '24px', height: '24px' }}
          />
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Read Replies Aloud</label>
            <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Auto-play assistant messages</span>
          </div>
          <input 
            type="checkbox" 
            checked={readAloud} 
            onChange={(e) => setReadAloud(e.target.checked)} 
            style={{ width: '24px', height: '24px' }}
          />
        </div>

        {readAloud && (
          <div>
            <label style={{ ...labelStyle, fontSize: '14px' }}>Audio Speed</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant={audioSpeed === 'normal' ? 'primary' : 'secondary'} onClick={() => setAudioSpeed('normal')} style={{ flex: 1, minHeight: '48px' }}>Normal</Button>
              <Button variant={audioSpeed === 'slow' ? 'primary' : 'secondary'} onClick={() => setAudioSpeed('slow')} style={{ flex: 1, minHeight: '48px' }}>Slow</Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default SettingsScreen;
