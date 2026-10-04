import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './hooks/useLanguage';
import Layout from './components/Layout';
import LanguageScreen from './features/onboarding/LanguageScreen';
import ConsentScreen from './features/onboarding/ConsentScreen';
import ModeScreen from './features/onboarding/ModeScreen';
import LocationScreen from './features/onboarding/LocationScreen';
import LearnerProfileScreen from './features/profile/LearnerProfileScreen';
import ParentProfileScreen from './features/profile/ParentProfileScreen';
import AgreementScreen from './features/summary/AgreementScreen';
import ChatScreen from './features/conversation/ChatScreen';
import EscalationScreen from './features/escalation/EscalationScreen';
import SettingsScreen from './features/settings/SettingsScreen';
import CompareCitiesScreen from './features/explore/CompareCitiesScreen';
import CounsellorView from './features/counsellor/CounsellorView';
import DashboardView from './features/dashboard/DashboardView';
import SentimentScreen from './features/sentiment/SentimentScreen';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/language" replace />} />
            <Route path="/language" element={<LanguageScreen />} />
            <Route path="/consent" element={<ConsentScreen />} />
            <Route path="/mode" element={<ModeScreen />} />
            <Route path="/location" element={<LocationScreen />} />
            
            <Route path="/profile-learner" element={<LearnerProfileScreen />} />
            <Route path="/profile-parent" element={<ParentProfileScreen />} />
            
            <Route path="/summary" element={<AgreementScreen />} />
            <Route path="/sentiment-start" element={<SentimentScreen isStart={true} next="/chat" />} />
            
            <Route path="/chat" element={<ChatScreen />} />
            <Route path="/compare-cities" element={<CompareCitiesScreen />} />
            
            <Route path="/escalation" element={<EscalationScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/sentiment-end" element={<SentimentScreen isStart={false} next="/thanks" />} />
            
            <Route path="/thanks" element={
              <div className="screen-padding" style={{ textAlign: 'center', marginTop: '48px' }}>
                <h2>Thank You</h2>
                <p style={{ marginTop: '16px' }}>Your session is complete.</p>
              </div>
            } />
            
            {/* Staff routes */}
            <Route path="/counsellor" element={<CounsellorView />} />
            <Route path="/dashboard" element={<DashboardView />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
