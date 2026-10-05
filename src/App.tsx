import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './hooks/useLanguage';
import Layout from './components/Layout';
import LanguageScreen from './features/onboarding/LanguageScreen';
import ConsentScreen from './features/onboarding/ConsentScreen';
import ModeScreen from './features/onboarding/ModeScreen';
import LocationScreen from './features/onboarding/LocationScreen';
import HomeScreen from './features/home/HomeScreen';
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
import FamilySummaryScreen from './features/summary/FamilySummaryScreen';
import TradeListScreen from './features/explore/TradeListScreen';
import TradeDetailScreen from './features/explore/TradeDetailScreen';
import CompareTradesScreen from './features/explore/CompareTradesScreen';
import EarningsCalculatorScreen from './features/explore/EarningsCalculatorScreen';

const ThankYouPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="screen-padding" style={{ textAlign: 'center', marginTop: '48px' }}>
      <h2>{t('thanks_title')}</h2>
      <p style={{ marginTop: '16px' }}>{t('thanks_message')}</p>
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/language" element={<LanguageScreen />} />
            <Route path="/consent" element={<ConsentScreen />} />
            <Route path="/mode" element={<ModeScreen />} />
            <Route path="/location" element={<LocationScreen />} />
            
            <Route path="/profile-learner" element={<LearnerProfileScreen />} />
            <Route path="/profile-parent" element={<ParentProfileScreen />} />
            
            <Route path="/summary" element={<AgreementScreen />} />
            <Route path="/family-summary" element={<FamilySummaryScreen />} />
            <Route path="/sentiment-start" element={<SentimentScreen isStart={true} next="/chat" />} />
            
            <Route path="/chat" element={<ChatScreen />} />
            <Route path="/explore" element={<TradeListScreen />} />
            <Route path="/trade/:tradeId" element={<TradeDetailScreen />} />
            <Route path="/compare-trades" element={<CompareTradesScreen />} />
            <Route path="/compare-cities" element={<CompareCitiesScreen />} />
            <Route path="/earnings-calculator" element={<EarningsCalculatorScreen />} />
            
            <Route path="/escalation" element={<EscalationScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/sentiment-end" element={<SentimentScreen isStart={false} next="/thanks" />} />
            
            <Route path="/thanks" element={<ThankYouPage />} />
            
            {/* Staff routes reuse the shared dashboard and escalation queue. */}
            <Route path="/counsellor" element={<CounsellorView />} />
            <Route path="/cases" element={<CounsellorView />} />
            <Route path="/escalations" element={<CounsellorView />} />
            <Route path="/reports" element={<DashboardView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
