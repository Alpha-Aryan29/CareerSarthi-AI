import locationsData from '../../data/locations.json';
import outcomeRecordsData from '../../data/outcome_records.json';
import tradesData from '../../data/trades.json';
import pathwayStepsData from '../../data/pathway_steps.json';
import type { OutcomeRecord, PathwayStep, Trade } from '../../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  outcomeData?: OutcomeRecord;
  trade?: Trade;
  pathwaySteps?: PathwayStep[];
  isFallback?: boolean;
}

// Simple keyword matching for the demo
const keywords: Record<string, string[]> = {
  earning_potential: ['earn', 'money', 'salary', 'income', 'pay', 'कमाई', 'वेतन', 'पैसे', 'सैलरी'],
  job_security: ['job', 'security', 'placement', 'नौकरी', 'रोजगार', 'सुरक्षा'],
  growth_further_education: ['growth', 'study', 'education', 'degree', 'पढ़ाई', 'विकास', 'आगे', 'डिग्री'],
};

export const processMessage = (
  text: string, 
  locationId: string | null, 
  lang: string
): Omit<ChatMessage, 'id' | 'sender'> => {
  const lowerText = text.toLowerCase();
  let matchedConcern: string | null = null;

  for (const [concern, words] of Object.entries(keywords)) {
    if (words.some(w => lowerText.includes(w))) {
      matchedConcern = concern;
      break;
    }
  }

  // Demo fallback
  const targetLocation = locationId || 'loc-rj-jaipur';
  const targetTrade = 'trade-001'; // Electrician

  const trade = tradesData.find(t => t.id === targetTrade) as Trade;
  
  let outcome = outcomeRecordsData.find(o => o.trade_id === targetTrade && o.location_id === targetLocation) as OutcomeRecord;
  if (!outcome) {
    const district = locationsData.find(l => l.id === targetLocation);
    if (district && district.parent_id) {
      outcome = outcomeRecordsData.find(o => o.trade_id === targetTrade && o.location_id === district.parent_id) as OutcomeRecord;
    }
  }

  const cityNameEn = outcome ? locationsData.find(l => l.id === outcome.location_id)?.name_en : '';
  const cityNameHi = outcome ? locationsData.find(l => l.id === outcome.location_id)?.name_hi : '';
  const sampleTextEn = outcome ? `of the ${outcome.sample_size} trainees sampled ` : '';
  const sampleTextHi = outcome ? `(${outcome.sample_size} प्रशिक्षुओं के नमूने में से) ` : '';

  if (matchedConcern === 'earning_potential') {
    return {
      text: lang === 'hi' 
        ? `${cityNameHi} में इलेक्ट्रीशियन के लिए, डेटा दिखाता है कि कमाई ₹${outcome?.earnings_p25_inr} से ₹${outcome?.earnings_p75_inr} प्रति माह के बीच होती है। औसत कमाई ₹${outcome?.earnings_median_inr} है।`
        : `In ${cityNameEn}, for the Electrician trade, data shows earnings range from ₹${outcome?.earnings_p25_inr} to ₹${outcome?.earnings_p75_inr} per month. The median is ₹${outcome?.earnings_median_inr}.`,
      outcomeData: outcome,
      trade
    };
  }

  if (matchedConcern === 'job_security') {
    return {
      text: lang === 'hi'
        ? `${cityNameHi} में इलेक्ट्रीशियन के लिए प्लेसमेंट दर ${sampleTextHi}${outcome?.placement_rate_pct}% है।`
        : `In ${cityNameEn}, ${outcome?.placement_rate_pct}% ${sampleTextEn}were placed as Electricians.`,
      outcomeData: outcome,
      trade
    };
  }

  if (matchedConcern === 'growth_further_education') {
    const steps = pathwayStepsData.filter(p => p.trade_id === targetTrade) as PathwayStep[];
    return {
      text: lang === 'hi'
        ? `हाँ, ITI के बाद आगे पढ़ाई और विकास के कई रास्ते हैं। आप B.Voc जैसी डिग्री भी कर सकते हैं।`
        : `Yes, there are clear paths for growth and further education after an ITI certificate. You can even pursue a B.Voc degree.`,
      pathwaySteps: steps.sort((a, b) => a.step_order - b.step_order)
    };
  }

  // Fallback
  return {
    text: lang === 'hi' 
      ? 'मेरे पास इस सवाल का सीधा जवाब नहीं है। मैं कमाई, नौकरी की सुरक्षा, और आगे की पढ़ाई जैसे विषयों पर डेटा दिखा सकता हूँ। अगर आप चाहें, तो आप हमारे किसी विशेषज्ञ से बात कर सकते हैं।'
      : 'I don\'t have a direct answer for that. I can help with data on earnings, job security, and further education. You can also talk to a person for more help.',
    isFallback: true
  };
};
