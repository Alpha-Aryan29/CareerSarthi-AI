import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import { Home, MessageSquare, Compass, HelpCircle } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isStaffRoute = location.pathname === '/counsellor' || location.pathname === '/dashboard';
  const showBottomNav = !isStaffRoute && location.pathname !== '/language' && location.pathname !== '/consent';

  return (
    <div className="app-container">
      <TopBar />
      <main style={{ flex: 1, paddingBottom: showBottomNav ? '80px' : '32px' }}>
        {children}
      </main>

      {showBottomNav && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '640px',
          height: '72px',
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
          zIndex: 50
        }}>
          <button onClick={() => navigate('/mode')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-muted)' }}>
            <Home size={24} />
            <span style={{ fontSize: '12px', marginTop: '4px' }}>Home</span>
          </button>
          <button onClick={() => navigate('/chat')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: location.pathname.includes('/chat') ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
            <MessageSquare size={24} />
            <span style={{ fontSize: '12px', marginTop: '4px' }}>Counsel</span>
          </button>
          <button onClick={() => navigate('/explore')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: location.pathname.includes('/explore') || location.pathname.includes('/trade/') || location.pathname.includes('/compare-trades') || location.pathname.includes('/earnings-calculator') ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
            <Compass size={24} />
            <span style={{ fontSize: '12px', marginTop: '4px' }}>Explore</span>
          </button>
          <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: location.pathname === '/settings' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
            <HelpCircle size={24} />
            <span style={{ fontSize: '12px', marginTop: '4px' }}>Help</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default Layout;
