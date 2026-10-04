import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import { BarChart3, Compass, Headphones, Home, Menu, MessageSquare, ShieldCheck, UserRound } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboardRoute = ['/dashboard', '/reports'].includes(location.pathname);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const familyItems = [
    { label: 'Home', href: '/', icon: Home, matches: (path: string) => path === '/' },
    { label: 'Counsel', href: '/chat', icon: MessageSquare, matches: (path: string) => ['/chat', '/sentiment-start', '/sentiment-end'].includes(path) },
    { label: 'Explore', href: '/explore', icon: Compass, matches: (path: string) => ['/explore', '/compare-trades', '/compare-cities', '/earnings-calculator'].includes(path) || path.startsWith('/trade/') },
    { label: 'Help', href: '/escalation', icon: Headphones, matches: (path: string) => ['/escalation', '/settings', '/thanks'].includes(path) },
  ];
  const staffItems = [
    { label: 'Counsellor', href: '/counsellor', icon: UserRound, matches: (path: string) => ['/counsellor', '/cases', '/escalations'].includes(path) },
    { label: 'Admin Dashboard', href: '/dashboard', icon: BarChart3, matches: (path: string) => ['/dashboard', '/reports'].includes(path) },
  ];

  return (
    <div className={`app-container platform-shell ${isDashboardRoute ? 'dashboard-app-shell' : ''}`}>
      <button
        type="button"
        className="shell-mobile-nav-toggle"
        aria-expanded={isMobileNavOpen}
        onClick={() => setIsMobileNavOpen((isOpen) => !isOpen)}
      >
        <Menu size={18} />
        <span>{isMobileNavOpen ? 'Close navigation' : 'Navigation'}</span>
      </button>
      <aside className={`sidebar-nav ${!isMobileNavOpen ? 'mobile-nav-collapsed' : ''}`}>
        <div className="brand-block">
          <div className="brand-mark"><ShieldCheck size={18} /></div>
          <div>
            <div className="brand-title">CareerSarthi</div>
            <div className="brand-subtitle">AI Counselling + Support</div>
          </div>
        </div>

        <nav className="sidebar-menu" aria-label="Main navigation">
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
            <div className="sidebar-section-label">Staff</div>
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
          <div className="sidebar-card-label">Trust</div>
          <div className="sidebar-card-title">AI-assisted, Human-supported</div>
          <p>Verified information + Human guidance</p>
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
