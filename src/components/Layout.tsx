import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import { BarChart3, Compass, Headphones, Home, MessageSquare, UserRound } from 'lucide-react';
import CareerSarthiLogo from './CareerSarthiLogo';
import { useLanguage } from '../hooks/useLanguage';
import { useSettings } from '../hooks/useSettings';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { simpleMode } = useSettings();
  const isDashboardRoute = ['/dashboard', '/reports'].includes(location.pathname);
  const [staffVisible, setStaffVisible] = useState(() => {
    try {
      return sessionStorage.getItem('careersarthi-staff-access') === 'true';
    } catch (error) {
      console.error('Unable to read staff access state', error);
      return false;
    }
  });
  const isStaffRoute = ['/counsellor', '/cases', '/escalations', '/dashboard', '/reports'].includes(location.pathname);
  const openStaffLogin = () => {
    const pin = window.prompt(t('staff_pin_prompt'));
    if (pin === '1234') {
      try {
        sessionStorage.setItem('careersarthi-staff-access', 'true');
        setStaffVisible(true);
      } catch (error) {
        console.error('Unable to save staff access state', error);
      }
    } else if (pin !== null) {
      window.alert(t('staff_pin_invalid'));
    }
  };

  const familyItems = [
    { label: t('nav_home'), href: '/', icon: Home, matches: (path: string) => path === '/' },
    { label: t('nav_counsel'), href: '/chat', icon: MessageSquare, matches: (path: string) => ['/chat', '/sentiment-start', '/sentiment-end'].includes(path) },
    { label: t('nav_explore'), href: '/explore', icon: Compass, matches: (path: string) => ['/explore', '/compare-trades', '/compare-cities', '/earnings-calculator'].includes(path) || path.startsWith('/trade/') },
    { label: t('nav_help'), href: '/escalation', icon: Headphones, matches: (path: string) => ['/escalation', '/thanks'].includes(path) },
  ];
  const staffItems = [
    { label: t('nav_counsellor'), href: '/counsellor', icon: UserRound, matches: (path: string) => ['/counsellor', '/cases', '/escalations'].includes(path) },
    { label: t('nav_dashboard'), href: '/dashboard', icon: BarChart3, matches: (path: string) => ['/dashboard', '/reports'].includes(path) },
  ];

  return (
    <div className={`app-container platform-shell ${isDashboardRoute ? 'dashboard-app-shell' : ''} ${isStaffRoute ? 'staff-shell' : 'family-shell'}`} data-simple-mode={simpleMode}>
      {isStaffRoute ? (
        <header className="staff-app-header">
          <button type="button" className="staff-wordmark" onClick={() => navigate('/dashboard')}>
            <span>CareerSarthi AI</span><small>{t('nav_staff')}</small>
          </button>
          <nav className="staff-top-navigation" aria-label={t('nav_staff')}>
            {staffVisible && staffItems.map(({ label, href, icon: Icon, matches }) => (
              <button key={href} type="button" className={matches(location.pathname) ? 'active' : ''} aria-current={matches(location.pathname) ? 'page' : undefined} onClick={() => navigate(href)}>
                <Icon size={17} /><span>{label}</span>
              </button>
            ))}
            {staffVisible ? (
              <button type="button" className="staff-login-button" onClick={() => {
                try {
                  sessionStorage.removeItem('careersarthi-staff-access');
                } catch (error) {
                  console.error('Unable to clear staff access state', error);
                }
                setStaffVisible(false);
                navigate('/');
              }}>{t('staff_logout')}</button>
            ) : (
              <button type="button" className="staff-login-button" onClick={openStaffLogin}>{t('staff_login')}</button>
            )}
          </nav>
        </header>
      ) : (
        <header className="family-nav-header">
          <button type="button" className="family-brand" onClick={() => navigate('/')} aria-label="CareerSarthi AI">
            <span className="family-brand-mark"><CareerSarthiLogo /></span>
            <span>CareerSarthi <strong>AI</strong></span>
          </button>
          <nav className="family-top-navigation" aria-label={t('nav_aria')}>
            {familyItems.map(({ label, href, icon: Icon, matches }) => (
              <button key={href} type="button" className={matches(location.pathname) ? 'active' : ''} aria-current={matches(location.pathname) ? 'page' : undefined} onClick={() => navigate(href)}>
                <Icon size={17} /><span>{label}</span>
              </button>
            ))}
          </nav>
          {!staffVisible && <button type="button" className="staff-login-button family-staff-login" onClick={openStaffLogin}>{t('staff_login')}</button>}
        </header>
      )}
      <div className="platform-main">
        <TopBar />
        <main className="platform-content">
          {isStaffRoute && !staffVisible ? (
            <section className="staff-login-gate">
              <h1>{t('staff_login_required')}</h1>
              <p>{t('staff_demo_pin')}</p>
              <button type="button" className="primary-button" onClick={openStaffLogin}>{t('staff_login')}</button>
            </section>
          ) : children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
