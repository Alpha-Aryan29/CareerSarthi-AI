import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import locationsData from '../../data/locations.json';
import tradesData from '../../data/trades.json';
import outcomeRecordsData from '../../data/outcome_records.json';
import type { LocationRecord, Trade, OutcomeRecord } from '../../types';
import OutcomeDataCard from '../../components/OutcomeDataCard';

const CompareCitiesScreen: React.FC = () => {
  const { lang, t } = useLanguage();
  
  const [tradeId, setTradeId] = useState<string>('trade-001');
  const [city1, setCity1] = useState<string>('loc-mh-mumbai');
  const [city2, setCity2] = useState<string>('loc-mh-gadchiroli');

  const trades = tradesData as Trade[];
  const districts = locationsData.filter(l => l.level === 'district') as LocationRecord[];

  const getOutcome = (districtId: string, tId: string): OutcomeRecord | undefined => {
    const district = districts.find(d => d.id === districtId);
    if (!district) return undefined;
    
    const dRecord = outcomeRecordsData.find(o => o.trade_id === tId && o.location_id === districtId);
    if (dRecord) return dRecord as OutcomeRecord;

    return outcomeRecordsData.find(o => o.trade_id === tId && o.location_id === district.parent_id) as OutcomeRecord;
  };

  const outcome1 = getOutcome(city1, tradeId);
  const outcome2 = getOutcome(city2, tradeId);
  const selectedTrade = trades.find(t => t.id === tradeId);

  const selectStyle = {
    width: '100%', height: '48px', padding: '0 12px', fontSize: '16px',
    borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)'
  };

  return (
    <div className="screen-padding">
      <h1 style={{ marginBottom: '24px' }}>{t('compare_cities_title')}</h1>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>{t('calc_trade_label')}</label>
        <select style={selectStyle} value={tradeId} onChange={e => setTradeId(e.target.value)}>
          {trades.map(t => <option key={t.id} value={t.id}>{lang === 'hi' ? t.name_hi : t.name_en}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>{t('compare_city_one')}</label>
          <select style={selectStyle} value={city1} onChange={e => setCity1(e.target.value)}>
            {districts.map(d => <option key={d.id} value={d.id}>{lang === 'hi' ? d.name_hi : d.name_en}</option>)}
          </select>
          {outcome1 ? <OutcomeDataCard outcome={outcome1} trade={selectedTrade} /> : <p>{t('compare_no_data')}</p>}
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>{t('compare_city_two')}</label>
          <select style={selectStyle} value={city2} onChange={e => setCity2(e.target.value)}>
            {districts.map(d => <option key={d.id} value={d.id}>{lang === 'hi' ? d.name_hi : d.name_en}</option>)}
          </select>
          {outcome2 ? <OutcomeDataCard outcome={outcome2} trade={selectedTrade} /> : <p>{t('compare_no_data')}</p>}
        </div>
      </div>
    </div>
  );
};

export default CompareCitiesScreen;
