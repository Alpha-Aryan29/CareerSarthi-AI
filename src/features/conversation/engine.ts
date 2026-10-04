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
  requiresEscalation?: boolean;
  concernCode?: string;
}

const keywords: Record<string, string[]> = {
  earning_potential: ['earn', 'money', 'salary', 'income', 'pay', 'कमाई', 'वेतन', 'पैसे', 'सैलरी'],
  job_security: ['job', 'security', 'placement', 'नौकरी', 'रोजगार', 'सुरक्षा'],
  social_status: ['respect', 'status', 'social', 'standing', 'prestige', 'सम्मान', 'सामाजिक', 'प्रतिष्ठा'],
  growth_further_education: ['growth', 'study', 'education', 'degree', 'पढ़ाई', 'विकास', 'आगे', 'डिग्री'],
  safety: ['safe', 'safety', 'risk', 'risky', 'danger', 'सुरक्षा', 'खतरा', 'सुरक्षित'],
  distance_travel: ['distance', 'travel', 'commute', 'far', 'time', 'दूरी', 'यात्रा', 'आना', 'जाना'],
  cost: ['cost', 'fee', 'expense', 'money', 'fees', 'लागत', 'फीस', 'खर्च'],
  only_for_failures: ['fail', 'failed', 'not for failed', 'only for failed', 'फेल', 'असफल', 'रद्द'],
};

const getTargetOutcome = (locationId: string | null) => {
  const targetLocation = locationId || 'loc-rj-jaipur';
  const targetTrade = 'trade-001';

  const trade = tradesData.find((item) => item.id === targetTrade) as Trade;

  let outcome = outcomeRecordsData.find(
    (record) => record.trade_id === targetTrade && record.location_id === targetLocation
  ) as OutcomeRecord;

  if (!outcome) {
    const district = locationsData.find((location) => location.id === targetLocation);
    if (district && district.parent_id) {
      outcome = outcomeRecordsData.find(
        (record) => record.trade_id === targetTrade && record.location_id === district.parent_id
      ) as OutcomeRecord;
    }
  }

  return { trade, outcome, targetLocation };
};

export const processMessage = (
  text: string,
  locationId: string | null,
  lang: string
): Omit<ChatMessage, 'id' | 'sender'> => {
  const lowerText = text.toLowerCase();

  if (/(talk to a person|talk to human|call a counsellor|need a person|human help|expert|counsellor)/i.test(text)) {
    return {
      text: lang === 'hi'
        ? 'मैं आपके लिए एक व्यक्ति से बात करने का विकल्प लेकर आ सकता हूँ। हम इस पर अधिक स्पष्टता और सहायता के लिए कॉलबैक फॉर्म खोलते हैं।'
        : 'I can connect you to a person for a clearer explanation and support. We can open the callback option for that.',
      requiresEscalation: true,
      concernCode: 'other'
    };
  }

  let matchedConcern: string | null = null;

  for (const [concern, words] of Object.entries(keywords)) {
    if (words.some((word) => lowerText.includes(word))) {
      matchedConcern = concern;
      break;
    }
  }

  const { trade, outcome } = getTargetOutcome(locationId);

  const cityNameEn = outcome ? locationsData.find((location) => location.id === outcome.location_id)?.name_en : 'your city';
  const cityNameHi = outcome ? locationsData.find((location) => location.id === outcome.location_id)?.name_hi : 'आपका शहर';
  const sampleTextEn = outcome ? `of the ${outcome.sample_size} trainees sampled ` : '';
  const sampleTextHi = outcome ? `(${outcome.sample_size} प्रशिक्षुओं के नमूने में से) ` : '';

  if (matchedConcern === 'earning_potential') {
    return {
      text: lang === 'hi'
        ? `${cityNameHi} में इलेक्ट्रीशियन के लिए, डेटा दिखाता है कि कमाई ₹${outcome?.earnings_p25_inr} से ₹${outcome?.earnings_p75_inr} प्रति माह के बीच है। सैंपल में औसत कमाई ₹${outcome?.earnings_median_inr} है।`
        : `In ${cityNameEn}, the Electrician data shows earnings from ₹${outcome?.earnings_p25_inr} to ₹${outcome?.earnings_p75_inr} per month. The median in the sample is ₹${outcome?.earnings_median_inr}.`,
      outcomeData: outcome,
      trade,
      concernCode: matchedConcern
    };
  }

  if (matchedConcern === 'job_security') {
    return {
      text: lang === 'hi'
        ? `${cityNameHi} में इलेक्ट्रीशियन के लिए प्लेसमेंट दर ${sampleTextHi}${outcome?.placement_rate_pct}% है।`
        : `In ${cityNameEn}, the placement rate is ${outcome?.placement_rate_pct}% ${sampleTextEn}for Electrician trainees.`,
      outcomeData: outcome,
      trade,
      concernCode: matchedConcern
    };
  }

  if (matchedConcern === 'social_status') {
    return {
      text: lang === 'hi'
        ? 'इस क्षेत्र में डेटा का मतलब है कि यह ट्रेड चार्ट में दिखाए गए परिणामों के आधार पर वैध विकल्प है। सामाजिक प्रतिष्ठा का अनुभव हर परिवार में अलग हो सकता है, इसलिए यह डेटा उस फैसले के लिए एक आधार देता है।'
        : 'The data in this area shows this trade as a valid option based on the recorded outcomes. Social respect can vary from family to family, so this information gives a grounded reference for the decision.',
      outcomeData: outcome,
      trade,
      concernCode: matchedConcern
    };
  }

  if (matchedConcern === 'growth_further_education') {
    const steps = pathwayStepsData.filter((pathway) => pathway.trade_id === trade.id) as PathwayStep[];
    return {
      text: lang === 'hi'
        ? 'हाँ, इस ट्रेड में आगे की पढ़ाई और पदोन्नति के कई रास्ते हैं। डेटा कार्ड और Career Ladder में आप NSQF स्तर और आगे की शिक्षा के विकल्प देख सकते हैं।'
        : 'Yes, there are clear routes for growth and further education in this trade. The data card and career ladder show the NSQF steps and further study options available.',
      pathwaySteps: steps.sort((a, b) => a.step_order - b.step_order),
      concernCode: matchedConcern
    };
  }

  if (matchedConcern === 'safety') {
    return {
      text: lang === 'hi'
        ? 'सुरक्षा के बारे में विचार आपके लिए महत्वपूर्ण है। इस पर निर्णय लेने से पहले, कार्यस्थान, दूरी और प्रशिक्षण की स्थिति के बारे में स्थानीय डेटा देखें। अगर यह चिंता अभी भी बनी रहती है, तो हम एक व्यक्ति से बात करने का विकल्प दे सकते हैं।'
        : 'Safety is an important consideration. Before deciding, check the local data on training conditions, travel distance and the work context. If this concern still remains, we can offer a person to talk with you.',
      requiresEscalation: true,
      concernCode: matchedConcern
    };
  }

  if (matchedConcern === 'distance_travel') {
    return {
      text: lang === 'hi'
        ? 'दूरी और यात्रा की लागत भी निर्णयों में भूमिका निभाती है। डेटा कार्ड में उपलब्ध स्थान और ट्रेनिंग की स्थिति को देखकर, आप यह तुलना कर सकते हैं कि कौन-सा विकल्प आपके लिए सबसे सुलभ है।'
        : 'Distance and travel also matter in the decision. By checking the location data and training availability in the data card, you can compare which option is more practical for you.',
      concernCode: matchedConcern
    };
  }

  if (matchedConcern === 'cost') {
    return {
      text: lang === 'hi'
        ? 'लागत का सवाल स्पष्ट रूप से देखा जा सकता है। डेटा कार्ड में प्रवेश, ट्रेनिंग और कमाई के आंकड़े दिए गए हैं, ताकि आप लागत और परिणामों के बीच तुलना कर सकें।'
        : 'The cost question can be reviewed directly. The data card shows the training and earnings figures so you can compare the cost against the likely outcomes.',
      outcomeData: outcome,
      trade,
      concernCode: matchedConcern
    };
  }

  if (matchedConcern === 'only_for_failures') {
    return {
      text: lang === 'hi'
        ? 'इस ट्रेड को केवल उन लोगों के लिए नहीं माना जाता है जो फेल हुए हैं। डेटा में देखी गई कमाई और प्लेसमेंट दर बताती है कि यह ट्रेड सीखने, प्रशिक्षण और योग्यतापूर्वक कौशल के आधार पर भी एक विकल्प है।'
        : 'This trade is not only for students who failed. The earnings and placement figures show that it is also a pathway based on skill, training and readiness, not only on academic setbacks.',
      outcomeData: outcome,
      trade,
      concernCode: matchedConcern
    };
  }

  return {
    text: lang === 'hi'
      ? 'मेरे पास इस सवाल का सीधा जवाब नहीं है। मैं कमाई, नौकरी की सुरक्षा, आगे की पढ़ाई, और सुरक्षा जैसे विषयों पर डेटा के आधार पर उत्तर दे सकता हूँ। अगर आप चाहें, तो एक व्यक्ति से बात करें।'
      : 'I do not have a direct answer for that. I can answer using data on earnings, job security, further education, and safety. If you want, we can also connect you with a person.',
    isFallback: true,
    requiresEscalation: true,
    concernCode: 'other'
  };
};
