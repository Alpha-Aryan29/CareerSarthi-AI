import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useLanguage } from '../../hooks/useLanguage';
import Button from '../../components/ui/Button';

const SettingsScreen: React.FC = () => {
  const { lang, setLang, t } = useLanguage();
  const { 
    textSize, setTextSize,
    simpleMode, setSimpleMode,
    highContrast, setHighContrast,
    readAloud, setReadAloud,
    audioSpeed, setAudioSpeed
  } = useSettings();

  const labelStyle = {
    fontWeight: 600,
    marginBottom: '8px',
    display: 'block'
  };

  return (
    <div className="page-shell settings-shell screen-padding">
      <header className="settings-heading">
        <div className="eyebrow">{t('nav_help')}</div>
        <h1>{t('settings_title')}</h1>
      </header>

      <section className="settings-section">
        <label style={labelStyle}>{t('settings_language')}</label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant={lang === 'en' ? 'primary' : 'secondary'} aria-pressed={lang === 'en'} onClick={() => setLang('en')} style={{ flex: 1, minHeight: '48px' }}>{t('settings_english')}</Button>
          <Button variant={lang === 'hi' ? 'primary' : 'secondary'} aria-pressed={lang === 'hi'} onClick={() => setLang('hi')} style={{ flex: 1, minHeight: '48px' }}>हिन्दी</Button>
        </div>
        {lang === 'hi' && <p className="settings-language-note">{t('settings_language_note')}</p>}
      </section>

      <section className="settings-section">
        <label style={labelStyle}>{t('settings_text_size')}</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant={textSize === 'normal' ? 'primary' : 'secondary'} onClick={() => setTextSize('normal')} style={{ flex: 1, minHeight: '48px' }}>{t('settings_normal')}</Button>
          <Button variant={textSize === 'large' ? 'primary' : 'secondary'} onClick={() => setTextSize('large')} style={{ flex: 1, minHeight: '48px' }}>{t('settings_large')}</Button>
          <Button variant={textSize === 'extra_large' ? 'primary' : 'secondary'} onClick={() => setTextSize('extra_large')} style={{ flex: 1, minHeight: '48px' }}>{t('settings_x_large')}</Button>
        </div>
      </section>

      <section className="settings-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <label htmlFor="setting-simple-mode" style={labelStyle}>{t('settings_simple_mode')}</label>
            <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{t('settings_simple_mode_description')}</span>
          </div>
          <input 
            id="setting-simple-mode"
            type="checkbox" 
            checked={simpleMode} 
            onChange={(e) => setSimpleMode(e.target.checked)} 
            style={{ width: '24px', height: '24px' }}
          />
        </div>
      </section>

      <section className="settings-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <label htmlFor="setting-high-contrast" style={labelStyle}>{t('settings_high_contrast')}</label>
            <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{t('settings_high_contrast_description')}</span>
          </div>
          <input 
            id="setting-high-contrast"
            type="checkbox" 
            checked={highContrast} 
            onChange={(e) => setHighContrast(e.target.checked)} 
            style={{ width: '24px', height: '24px' }}
          />
        </div>
      </section>

      <section className="settings-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <label htmlFor="setting-read-aloud" style={labelStyle}>{t('settings_read_replies_aloud')}</label>
            <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{t('settings_read_replies_description')}</span>
          </div>
          <input 
            id="setting-read-aloud"
            type="checkbox" 
            checked={readAloud} 
            onChange={(e) => setReadAloud(e.target.checked)} 
            style={{ width: '24px', height: '24px' }}
          />
        </div>

        {readAloud && (
          <div>
            <label style={{ ...labelStyle, fontSize: '14px' }}>{t('settings_audio_speed')}</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant={audioSpeed === 'normal' ? 'primary' : 'secondary'} onClick={() => setAudioSpeed('normal')} style={{ flex: 1, minHeight: '48px' }}>{t('settings_normal')}</Button>
              <Button variant={audioSpeed === 'slow' ? 'primary' : 'secondary'} onClick={() => setAudioSpeed('slow')} style={{ flex: 1, minHeight: '48px' }}>{t('settings_slow')}</Button>
            </div>
          </div>
        )}
      </section>

    </div>
  );
};

export default SettingsScreen;
