import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Phone, Settings } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { createEscalation, readEscalations, type EscalationCase } from '../lib/escalations';
import locationData from '../data/locations.json';
import tradeData from '../data/trades.json';
import concernData from '../data/concern_categories.json';

const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittedCaseId, setSubmittedCaseId] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [caseUpdates, setCaseUpdates] = useState<EscalationCase[]>(readEscalations);
  const [formError, setFormError] = useState('');
  const [readNotifications, setReadNotifications] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('careersarthi-read-notifications');
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
    } catch (error) {
      console.error('Unable to read notification preferences', error);
      return [];
    }
  });
  const [form, setForm] = useState({
    name: '',
    phone: '',
    state: 'Maharashtra',
    district: 'Gadchiroli',
    trade: 'Electrician',
    concern: 'safety',
    time: 'Evening',
  });
  useEffect(() => {
    const refreshCases = () => setCaseUpdates(readEscalations());
    window.addEventListener('careersarthi-cases-updated', refreshCases);
    return () => window.removeEventListener('careersarthi-cases-updated', refreshCases);
  }, []);

  const isLanguageScreen = location.pathname === '/language';
  const caseStatusLabelKeys: Record<EscalationCase['status'], Parameters<typeof t>[0]> = {
    open: 'case_status_open',
    claimed: 'case_status_claimed',
    scheduled: 'case_status_scheduled',
    in_call: 'case_status_in_call',
    resolved: 'case_status_resolved',
    unreachable: 'case_status_unreachable',
  };
  const states = locationData.filter((item) => item.level === 'state');
  const selectedState = states.find((item) => item.name_en === form.state);
  const districts = locationData.filter((item) => item.level === 'district' && item.parent_id === selectedState?.id);
  const concernCodes: Record<string, string> = {
    earning_potential: 'earning potential',
    job_security: 'job security',
    social_status: 'social status',
    growth_further_education: 'growth/further education',
    safety: 'safety',
    distance_travel: 'distance/travel',
    cost: 'cost',
    only_for_failures: 'only for failures',
    other: 'other',
  };
  const noBackRoutes = ['/', '/dashboard', '/counsellor', '/cases', '/escalations', '/reports', '/thanks'];
  const showBack = !isLanguageScreen && !noBackRoutes.includes(location.pathname);
  const notifications = caseUpdates
    .filter((item) => item.status !== 'open' && item.updatedAt)
    .sort((a, b) => new Date(b.updatedAt || b.timestamp).getTime() - new Date(a.updatedAt || a.timestamp).getTime())
    .map((item) => ({
      id: `${item.id}-${item.updatedAt || item.timestamp}`,
      title: `${t('notification_case_updated')} #${item.id}`,
      description: `${locationData.find((district) => district.name_en === item.district)?.[lang === 'hi' ? 'name_hi' : 'name_en'] || item.district} · ${tradeData.find((trade) => trade.name_en === item.trade)?.[lang === 'hi' ? 'name_hi' : 'name_en'] || item.trade} · ${t(caseStatusLabelKeys[item.status])}`,
      href: `/escalation?case=${encodeURIComponent(item.id)}`,
    }));
  const unreadCount = notifications.filter((item) => !readNotifications.includes(item.id)).length;

  const markNotificationRead = (id: string) => {
    const nextRead = [...new Set([...readNotifications, id])];
    setReadNotifications(nextRead);
    try {
      localStorage.setItem('careersarthi-read-notifications', JSON.stringify(nextRead));
    } catch (error) {
      console.error('Unable to save notification preferences', error);
    }
  };

  const markAllNotificationsRead = () => {
    const nextRead = notifications.map((item) => item.id);
    setReadNotifications(nextRead);
    try {
      localStorage.setItem('careersarthi-read-notifications', JSON.stringify(nextRead));
    } catch (error) {
      console.error('Unable to save notification preferences', error);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedPhone = form.phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      setFormError(t('callback_invalid_phone'));
      return;
    }
    try {
      const concernLabel = concernData.find((item) => concernCodes[item.code] === form.concern);
      const tradeLabel = tradeData.find((item) => item.name_en === form.trade);
      const createdCase = createEscalation({
        name: form.name,
        phone: normalizedPhone,
        state: form.state,
        district: form.district,
        trade: form.trade,
        concern: form.concern,
        time: form.time,
        summary: t('callback_request_summary')
          .replace('{name}', form.name || (lang === 'hi' ? 'परिवार के सदस्य' : 'Family member'))
          .replace('{trade}', tradeLabel ? (lang === 'hi' ? tradeLabel.name_hi : tradeLabel.name_en) : form.trade)
          .replace('{concern}', concernLabel ? (lang === 'hi' ? concernLabel.label_hi : concernLabel.label_en) : form.concern),
        triggerReason: `${form.concern.charAt(0).toUpperCase() + form.concern.slice(1)} concern`,
        priority: form.concern === 'safety' || form.concern === 'earning potential' ? 'High' : 'Medium',
      });
      setSubmittedCaseId(createdCase.id);
    } catch (error) {
      console.error('Unable to save callback request', error);
      setFormError(t('callback_save_error'));
      return;
    }

    setFormError('');
    setForm({
      name: '',
      phone: '',
      state: 'Maharashtra',
      district: 'Gadchiroli',
      trade: 'Electrician',
      concern: 'safety',
      time: 'Evening',
    });
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          {showBack && (
            <button className="icon-button" onClick={() => navigate(-1)} aria-label={t('btn_back')}>
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
            <button className="primary-inline-button" onClick={() => { setSubmittedCaseId(''); setIsModalOpen(true); }}>
              <Phone size={16} />
              {t('btn_talk_person')}
            </button>
          )}

          <div className="notification-anchor">
            <button
              type="button"
              className="icon-button notification-trigger"
              onClick={() => setIsNotificationsOpen((open) => !open)}
              aria-expanded={isNotificationsOpen}
              aria-label={t('notifications_title')}
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
            </button>
            {isNotificationsOpen && (
              <section className="notification-panel" aria-label={t('notifications_title')}>
                <div className="notification-panel-heading">
                  <div>
                    <strong>{t('notifications_title')}</strong>
                    <span>{unreadCount ? t('notifications_unread_count').replace('{count}', String(unreadCount)) : t('notifications_all_read')}</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="text-button"
                      onClick={markAllNotificationsRead}
                    >
                      {t('notifications_mark_read')}
                    </button>
                  )}
                </div>
                <div className="notification-list">
                  {notifications.length === 0 && <p className="notification-empty">{t('notification_no_case_updates')}</p>}
                  {notifications.map((item) => (
                    <button
                      type="button"
                      className={`notification-item ${!readNotifications.includes(item.id) ? 'unread' : ''}`}
                      key={item.id}
                      onClick={() => {
                        markNotificationRead(item.id);
                        setIsNotificationsOpen(false);
                        navigate(item.href);
                      }}
                    >
                      <span className="notification-dot" />
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.description}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          <button
            className={`icon-button ${location.pathname === '/settings' ? 'active' : ''}`}
            onClick={() => navigate('/settings')}
            aria-label={t('settings_title')}
            aria-current={location.pathname === '/settings' ? 'page' : undefined}
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => { setSubmittedCaseId(''); setIsModalOpen(false); }}>
          <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="callback-dialog-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="eyebrow">{t('callback_eyebrow')}</div>
                <h3 id="callback-dialog-title">{t('callback_title')}</h3>
              </div>
              <button type="button" className="close-button" onClick={() => { setSubmittedCaseId(''); setIsModalOpen(false); }} aria-label={t('btn_close')}>×</button>
            </div>

            {submittedCaseId ? (
              <div className="callback-submission-success">
                <strong>{t('callback_request_received')}</strong>
                <p>{t('callback_reference')}: {submittedCaseId}</p>
                <p>{t('callback_next_steps')}</p>
                <button type="button" className="primary-button" onClick={() => { setSubmittedCaseId(''); setIsModalOpen(false); }}>{t('btn_close')}</button>
              </div>
            ) : <>
            <p className="callback-form-intro">{t('callback_summary_description')}</p>
            <form onSubmit={handleSubmit}>
              <div className="modal-form-grid">
                <label>
                  <span>{t('callback_name')}</span>
                  <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder={t('callback_name')} autoComplete="name" />
                </label>
                <label>
                  <span>{t('callback_phone')}</span>
                  <input type="tel" value={form.phone} onChange={(event) => { setForm({ ...form, phone: event.target.value }); setFormError(''); }} placeholder={t('callback_phone_hint')} autoComplete="tel-national" inputMode="numeric" required aria-invalid={Boolean(formError)} aria-describedby={formError ? 'callback-error' : undefined} />
                  {formError && <small className="form-error" id="callback-error">{formError}</small>}
                </label>
                <label>
                  <span>{t('callback_state')}</span>
                  <select value={form.state} onChange={(event) => {
                    const nextState = states.find((item) => item.name_en === event.target.value);
                    const nextDistrict = locationData.find((item) => item.level === 'district' && item.parent_id === nextState?.id);
                    setForm({ ...form, state: event.target.value, district: nextDistrict?.name_en || '' });
                  }}>
                    {states.map((state) => <option key={state.id} value={state.name_en}>{lang === 'hi' ? state.name_hi : state.name_en}</option>)}
                  </select>
                </label>
                <label>
                  <span>{t('callback_district')}</span>
                  <select value={form.district} onChange={(event) => setForm({ ...form, district: event.target.value })}>
                    {districts.map((district) => <option key={district.id} value={district.name_en}>{lang === 'hi' ? district.name_hi : district.name_en}</option>)}
                  </select>
                </label>
                <label>
                  <span>{t('callback_trade')}</span>
                  <select value={form.trade} onChange={(event) => setForm({ ...form, trade: event.target.value })}>
                    {tradeData.map((trade) => <option key={trade.id} value={trade.name_en}>{lang === 'hi' ? trade.name_hi : trade.name_en}</option>)}
                  </select>
                </label>
                <label>
                  <span>{t('callback_concern')}</span>
                  <select value={form.concern} onChange={(event) => setForm({ ...form, concern: event.target.value })}>
                    {concernData.map((item) => (
                      <option key={item.code} value={concernCodes[item.code]}>{lang === 'hi' ? item.label_hi : item.label_en}</option>
                    ))}
                  </select>
                </label>
                <label className="full-width">
                  <span>{t('callback_time')}</span>
                  <select value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })}>
                    <option value="Morning">{t('escalation_morning')}</option>
                    <option value="Afternoon">{t('escalation_afternoon')}</option>
                    <option value="Evening">{t('escalation_evening')}</option>
                  </select>
                </label>
              </div>

              <div className="callback-summary-preview">
                <strong>{t('callback_summary_title')}</strong>
                <p>{concernData.find((item) => concernCodes[item.code] === form.concern)?.[lang === 'hi' ? 'label_hi' : 'label_en']} · {tradeData.find((item) => item.name_en === form.trade)?.[lang === 'hi' ? 'name_hi' : 'name_en']} · {locationData.find((item) => item.name_en === form.district)?.[lang === 'hi' ? 'name_hi' : 'name_en']}</p>
                <small>{t('callback_privacy_note')}</small>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => { setSubmittedCaseId(''); setIsModalOpen(false); }}>{t('callback_cancel')}</button>
                <button type="submit" className="primary-button">{t('callback_submit')}</button>
              </div>
            </form>
            </>}
          </div>
        </div>
      )}
    </>
  );
};

export default TopBar;
