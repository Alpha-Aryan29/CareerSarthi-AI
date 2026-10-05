import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Phone, Settings } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { createEscalation } from '../lib/escalations';
import CareerSarthiLogo from './CareerSarthiLogo';
import { useSession } from '../hooks/useSession';

const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();
  const { learnerInterestIds, parentConcernIds, locationDistrictId } = useSession();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
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

  const isLanguageScreen = location.pathname === '/language';
  const noBackRoutes = ['/', '/dashboard', '/counsellor', '/cases', '/escalations', '/reports', '/thanks'];
  const showBack = !isLanguageScreen && !noBackRoutes.includes(location.pathname);
  const notifications = [
    {
      id: 'profile',
      title: learnerInterestIds.length ? t('notification_profile_ready') : t('notification_profile_incomplete'),
      description: learnerInterestIds.length ? t('notification_profile_ready_desc') : t('notification_profile_incomplete_desc'),
      href: learnerInterestIds.length ? '/family-summary' : '/language',
    },
    {
      id: 'location',
      title: locationDistrictId ? t('notification_city_ready') : t('notification_city_missing'),
      description: locationDistrictId ? t('notification_city_ready_desc') : t('notification_city_missing_desc'),
      href: '/location',
    },
    {
      id: 'family',
      title: parentConcernIds.length ? t('notification_family_saved') : t('notification_family_prompt'),
      description: parentConcernIds.length ? t('notification_family_saved_desc') : t('notification_family_prompt_desc'),
      href: '/profile-parent',
    },
  ];
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
      createEscalation({
        name: form.name,
        phone: normalizedPhone,
        state: form.state,
        district: form.district,
        trade: form.trade,
        concern: form.concern,
        time: form.time,
        summary: `${form.name || 'Family member'} requested support for the ${form.trade} pathway and the ${form.concern} concern.`,
        triggerReason: `${form.concern.charAt(0).toUpperCase() + form.concern.slice(1)} concern`,
        priority: form.concern === 'safety' || form.concern === 'earning potential' ? 'High' : 'Medium',
      });
    } catch (error) {
      console.error('Unable to save callback request', error);
      setFormError(t('callback_save_error'));
      return;
    }

    setIsModalOpen(false);
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
    navigate('/counsellor?status=open');
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <div className="topbar-brand">
            <CareerSarthiLogo className="topbar-logo" />
            <span>CareerSarthi AI</span>
          </div>
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
            <button className="primary-inline-button" onClick={() => setIsModalOpen(true)}>
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

          <button className="icon-button" onClick={() => navigate('/settings')} aria-label={t('settings_title')}>
            <Settings size={18} />
          </button>
        </div>
      </header>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="callback-dialog-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="eyebrow">{t('callback_eyebrow')}</div>
                <h3 id="callback-dialog-title">{t('callback_title')}</h3>
              </div>
              <button type="button" className="close-button" onClick={() => setIsModalOpen(false)} aria-label={t('btn_close')}>×</button>
            </div>

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
                  <select value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })}>
                    <option>Maharashtra</option>
                    <option>Rajasthan</option>
                    <option>Uttar Pradesh</option>
                  </select>
                </label>
                <label>
                  <span>{t('callback_district')}</span>
                  <select value={form.district} onChange={(event) => setForm({ ...form, district: event.target.value })}>
                    <option>Gadchiroli</option>
                    <option>Mumbai</option>
                    <option>Jaipur</option>
                    <option>Lucknow</option>
                  </select>
                </label>
                <label>
                  <span>{t('callback_trade')}</span>
                  <select value={form.trade} onChange={(event) => setForm({ ...form, trade: event.target.value })}>
                    <option>Electrician</option>
                    <option>COPA</option>
                    <option>Fitter</option>
                  </select>
                </label>
                <label>
                  <span>{t('callback_concern')}</span>
                  <select value={form.concern} onChange={(event) => setForm({ ...form, concern: event.target.value })}>
                    <option value="earning potential">earning potential</option>
                    <option value="job security">job security</option>
                    <option value="social status">social status</option>
                    <option value="safety">safety</option>
                    <option value="cost">cost</option>
                  </select>
                </label>
                <label className="full-width">
                  <span>{t('callback_time')}</span>
                  <select value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })}>
                    <option>{t('escalation_morning')}</option>
                    <option>{t('escalation_afternoon')}</option>
                    <option>{t('escalation_evening')}</option>
                  </select>
                </label>
              </div>

              <div className="callback-summary-preview">
                <strong>{t('callback_summary_title')}</strong>
                <p>{form.concern} · {form.trade} · {form.district}</p>
                <small>{t('callback_privacy_note')}</small>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setIsModalOpen(false)}>{t('callback_cancel')}</button>
                <button type="submit" className="primary-button">{t('callback_submit')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TopBar;
