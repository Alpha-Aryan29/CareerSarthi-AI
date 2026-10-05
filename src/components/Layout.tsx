import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import { BarChart3, Compass, Headphones, Home, Menu, MessageSquare, UserRound } from 'lucide-react';
import CareerSarthiLogo from './CareerSarthiLogo';
import { useLanguage } from '../hooks/useLanguage';
import { useSettings } from '../hooks/useSettings';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { simpleMode } = useSettings();
  const isDashboardRoute = ['/dashboard', '/reports'].includes(location.pathname);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const familyItems = [
    { label: t('nav_home'), href: '/', icon: Home, matches: (path: string) => path === '/' },
    { label: t('nav_counsel'), href: '/chat', icon: MessageSquare, matches: (path: string) => ['/chat', '/sentiment-start', '/sentiment-end'].includes(path) },
    { label: t('nav_explore'), href: '/explore', icon: Compass, matches: (path: string) => ['/explore', '/compare-trades', '/compare-cities', '/earnings-calculator'].includes(path) || path.startsWith('/trade/') },
    { label: t('nav_help'), href: '/escalation', icon: Headphones, matches: (path: string) => ['/escalation', '/settings', '/thanks'].includes(path) },
  ];
  const staffItems = [
    { label: t('nav_counsellor'), href: '/counsellor', icon: UserRound, matches: (path: string) => ['/counsellor', '/cases', '/escalations'].includes(path) },
    { label: t('nav_dashboard'), href: '/dashboard', icon: BarChart3, matches: (path: string) => ['/dashboard', '/reports'].includes(path) },
  ];

  return (
    <div className={`app-container platform-shell ${isDashboardRoute ? 'dashboard-app-shell' : ''}`} data-simple-mode={simpleMode}>
      <button
        type="button"
        className="shell-mobile-nav-toggle"
        aria-expanded={isMobileNavOpen}
        onClick={() => setIsMobileNavOpen((isOpen) => !isOpen)}
      >
        <Menu size={18} />
        <span>{isMobileNavOpen ? t('nav_close') : t('nav_open')}</span>
      </button>
      <aside className={`sidebar-nav ${!isMobileNavOpen ? 'mobile-nav-collapsed' : ''}`}>
        <div className="brand-block">
          <div className="brand-mark"><CareerSarthiLogo /></div>
          <div>
            <div className="brand-title">CareerSarthi AI</div>
            <div className="brand-subtitle">{t('brand_subtitle')}</div>
          </div>
        </div>

        <nav className="sidebar-menu" aria-label={t('nav_aria')}>
          <div className="sidebar-section">
            {familyItems.map(({ label, href, icon: Icon, matches }) => (
              <button
                key={label}
                type="button"
                className={`nav-item ${matches(location.pathname) ? 'active' : ''}`}
                aria-current={matches(location.pathname) ? 'page' : undefined}
                onClick={() => {
                  navigate(href);
                  setIsMobileNavOpen(false);
                }}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="sidebar-section staff-navigation">
            <div className="sidebar-section-label">{t('nav_staff')}</div>
            {staffItems.map(({ label, href, icon: Icon, matches }) => (
              <button
                key={label}
                type="button"
                className={`nav-item ${matches(location.pathname) ? 'active' : ''}`}
                aria-current={matches(location.pathname) ? 'page' : undefined}
                onClick={() => {
                  navigate(href);
                  setIsMobileNavOpen(false);
                }}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="sidebar-card">
          <div className="sidebar-card-label">{t('nav_trust')}</div>
          <div className="sidebar-card-title">{t('nav_human_support')}</div>
          <p>{t('nav_sourced_guidance')}</p>
        </div>
      </aside>

      <div className="platform-main">
        <TopBar />
        <main className="platform-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
