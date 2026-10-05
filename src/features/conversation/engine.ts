import locationsData from '../../data/locations.json';
import outcomeRecordsData from '../../data/outcome_records.json';
import tradesData from '../../data/trades.json';
import pathwayStepsData from '../../data/pathway_steps.json';
import incomeBracketsData from '../../data/income_brackets.json';
import educationLevelsData from '../../data/education_levels.json';
import type { OutcomeRecord, PathwayStep, Trade } from '../../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  outcomeData?: OutcomeRecord;
  trade?: Trade;
  pathwaySteps?: PathwayStep[];
  isFallback?: boolean;
  isAnswer?: boolean;
  requiresEscalation?: boolean;
  concernCode?: string;
  suggestedQuestions?: string[];
}

export interface ChatProfile {
  locationId: string | null;
  interestIds: string[];
  educationId: string | null;
  incomeBracketId: string | null;
}

const concernKeywords: Record<string, string[]> = {
  earning_potential: ['earn', 'earning', 'salary', 'income', 'pay', 'money', 'kamai', 'kamayi', 'paisa', 'tankha', 'कमाई', 'वेतन', 'पैसे', 'तनख्वाह'],
  job_security: ['job security', 'job', 'placement', 'employment', 'naukri', 'rojgar', 'job milegi', 'नौकरी', 'रोजगार', 'प्लेसमेंट'],
  social_status: ['respect', 'status', 'social', 'standing', 'prestige', 'izzat', 'samman', 'सम्मान', 'इज्जत', 'प्रतिष्ठा', 'समाज'],
  growth_further_education: ['growth', 'study', 'education', 'degree', 'promotion', 'career path', 'aage padh', 'padhai', 'पढ़ाई', 'विकास', 'आगे', 'डिग्री', 'पदोन्नति'],
  safety: ['safe', 'safety', 'risk', 'danger', 'suraksha', 'surakshit', 'khatra', 'सुरक्षा', 'सुरक्षित', 'खतरा'],
  distance_travel: ['distance', 'travel', 'commute', 'far', 'transport', 'door', 'safar', 'aana jana', 'दूरी', 'यात्रा', 'आना जाना', 'परिवहन'],
  cost: ['cost', 'fee', 'fees', 'expense', 'afford', 'kharcha', 'lagat', 'फीस', 'खर्च', 'लागत', 'महंगा'],
  only_for_failures: ['only for failures', 'only for failed', 'failed student', 'fail', 'failure', 'nikamma', 'fail hone', 'फेल', 'असफल', 'नाकाम'],
};

const interestTrades: Record<string, string> = {
  electrical: 'trade-001',
  mechanical: 'trade-002',
  computers: 'trade-003',
  healthcare: 'trade-004',
};

const money = (value: number | null | undefined) =>
  value == null ? null : `₹${value.toLocaleString('en-IN')}`;

const getConcern = (text: string) => {
  const normalized = text.toLocaleLowerCase('en-IN');
  const scores = Object.entries(concernKeywords).map(([code, words]) => ({
    code,
    score: words.reduce((score, word) => score + (normalized.includes(word) ? Math.max(1, word.split(/\s+/).length) : 0), 0),
  })).sort((a, b) => b.score - a.score);
  return scores[0]?.score ? scores[0] : null;
};

const getTrade = (profile: ChatProfile): Trade => {
  const preferredId = profile.interestIds.map((interest) => interestTrades[interest]).find(Boolean);
  return (tradesData.find((trade) => trade.id === preferredId) || tradesData[0]) as Trade;
};

const getOutcome = (tradeId: string, locationId: string | null): OutcomeRecord | undefined => {
  const location = locationsData.find((item) => item.id === locationId);
  const direct = outcomeRecordsData.find((record) =>
    record.trade_id === tradeId && record.location_id === locationId && record.scope !== 'provider'
  );
  const parent = location?.parent_id
    ? outcomeRecordsData.find((record) => record.trade_id === tradeId && record.location_id === location.parent_id && record.scope === 'state')
    : undefined;
  return (direct || parent) as OutcomeRecord | undefined;
};

export const processMessage = (text: string, profile: ChatProfile, lang: string): Omit<ChatMessage, 'id' | 'sender'> => {
  const normalized = text.toLocaleLowerCase('en-IN');
  if (/(talk to (a )?(person|human)|call a counsellor|need (a )?person|human help|expert|counsellor|सलाहकार से बात|इंसान से बात)/i.test(normalized)) {
    return {
      text: lang === 'hi'
        ? 'आपके सवाल के लिए व्यक्ति से बात करना उचित रहेगा। मैंने आपकी चुनी हुई चिंता और प्रोफ़ाइल का सार जोड़ दिया है।'
        : 'A person may be better placed to help with this question. I have included your selected concern and profile in the summary.',
      isFallback: true,
      requiresEscalation: true,
      concernCode: getConcern(text)?.code || 'other',
      trade: getTrade(profile),
    };
  }

  const match = getConcern(text);
  if (!match || match.score < 1) {
    return {
      text: lang === 'hi'
        ? 'मुझे आपके सवाल की चिंता स्पष्ट रूप से पहचानने में भरोसा नहीं है। आप कमाई, नौकरी की सुरक्षा, सम्मान, आगे की पढ़ाई, सुरक्षा, दूरी, लागत, या इस धारणा के बारे में पूछ सकते हैं कि यह केवल फेल विद्यार्थियों के लिए है।'
        : 'I am not confident that I understood the concern in your question. You can ask about earnings, job security, respect, further study, safety, travel distance, cost, or the idea that this is only for students who failed.',
      isFallback: true,
      concernCode: 'other',
      trade: getTrade(profile),
      suggestedQuestions: lang === 'hi'
        ? ['इस ट्रेड में कितनी कमाई हो सकती है?', 'मेरे जिले में नौकरी मिलने की क्या संभावना है?', 'क्या इससे आगे पढ़ाई कर सकते हैं?']
        : ['What could someone earn in this trade?', 'What placement data is available for my district?', 'Can I continue studying after this course?'],
    };
  }

  const trade = getTrade(profile);
  const outcome = getOutcome(trade.id, profile.locationId);
  const district = locationsData.find((item) => item.id === profile.locationId);
  const city = district ? (lang === 'hi' ? district.name_hi : district.name_en) : (lang === 'hi' ? 'आपका जिला' : 'your district');
  const tradeName = lang === 'hi' ? trade.name_hi : trade.name_en;
  const incomeBracket = incomeBracketsData.find((item) => item.code === profile.incomeBracketId);
  const education = educationLevelsData.find((item) => item.code === profile.educationId);
  const source = outcome ? `${outcome.source_name}, ${outcome.source_year}` : null;
  const sourceNote = source
    ? (lang === 'hi' ? `स्रोत: ${source}। यह पायलट डेटा है, भविष्य की गारंटी नहीं।` : `Source: ${source}. This is pilot data, not a guarantee of future results.`)
    : (lang === 'hi' ? 'इस ट्रेड और जिले के लिए कोई मिलान वाला परिणाम डेटा उपलब्ध नहीं है।' : 'No matching outcome record is available for this trade and district.');
  let answer = '';
  let pathwaySteps: PathwayStep[] | undefined;
  const code = match.code;

  if (code === 'earning_potential') {
    const low = money(outcome?.earnings_p25_inr);
    const high = money(outcome?.earnings_p75_inr);
    const median = money(outcome?.earnings_median_inr);
    answer = lang === 'hi'
      ? `${city} में ${tradeName} के उपलब्ध डेटा में मासिक कमाई ${low && high ? `${low} से ${high}` : 'दर्ज नहीं'} और मध्य मान ${median || 'दर्ज नहीं'} है। ${profile.incomeBracketId && incomeBracket ? `आपकी दर्ज आय श्रेणी: ${incomeBracket.label_hi}।` : ''} ${sourceNote}`
      : `For ${tradeName} in ${city}, the available monthly earnings range is ${low && high ? `${low}–${high}` : 'not recorded'}, with a median of ${median || 'not recorded'}. ${profile.incomeBracketId && incomeBracket ? `Saved household income bracket: ${incomeBracket.label_en}.` : ''} ${sourceNote}`;
  } else if (code === 'job_security') {
    answer = lang === 'hi'
      ? `${city} में ${tradeName} के उपलब्ध बैच का प्लेसमेंट ${outcome?.placement_rate_pct == null ? 'दर्ज नहीं' : `${outcome.placement_rate_pct}%`} है${outcome?.sample_size ? ` (${outcome.sample_size} प्रशिक्षु)` : ''}। प्लेसमेंट नौकरी की गारंटी नहीं है। ${sourceNote}`
      : `The recorded placement rate for ${tradeName} in ${city} is ${outcome?.placement_rate_pct == null ? 'not available' : `${outcome.placement_rate_pct}%`}${outcome?.sample_size ? ` (${outcome.sample_size} trainees)` : ''}. Placement is not a job guarantee. ${sourceNote}`;
  } else if (code === 'growth_further_education') {
    pathwaySteps = (pathwayStepsData.filter((item) => item.trade_id === trade.id) as PathwayStep[]).sort((a, b) => a.step_order - b.step_order);
    answer = pathwaySteps.length
      ? lang === 'hi'
        ? `${tradeName} में आगे बढ़ने के रास्ते नीचे दिए गए प्रशिक्षण/शिक्षा चरणों में दिखाए गए हैं। उपलब्ध योग्यता: ${education?.label_hi || 'प्रोफ़ाइल में दर्ज नहीं'}। ${sourceNote}`
        : `Progression options for ${tradeName} are shown in the training and education steps below. Saved learner education: ${education?.label_en || 'not provided'}. ${sourceNote}`
      : lang === 'hi'
        ? `${tradeName} के लिए आगे की पढ़ाई के विशिष्ट चरण उपलब्ध डेटा में दर्ज नहीं हैं। ${sourceNote}`
        : `Specific further-study steps for ${tradeName} are not recorded in the available data. ${sourceNote}`;
  } else if (code === 'safety') {
    answer = lang === 'hi'
      ? `${tradeName} में सुरक्षा का आकलन स्थानीय कार्यस्थल और यात्रा की परिस्थितियों पर निर्भर करता है; उपलब्ध परिणाम डेटा इन बातों की पुष्टि नहीं करता। ${sourceNote}`
      : `Safety in ${tradeName} depends on the specific workplace and travel conditions; the available outcome data does not verify those conditions. ${sourceNote}`;
  } else if (code === 'distance_travel') {
    answer = lang === 'hi'
      ? `${city} में चयनित जिले के परिणाम नीचे दिए गए हैं, लेकिन उपलब्ध डेटा प्रशिक्षण केंद्र तक की वास्तविक दूरी नहीं बताता। प्रवेश से पहले केंद्र और यात्रा की व्यवस्था की पुष्टि करें। ${sourceNote}`
      : `The results below are for the selected district, ${city}, but this dataset does not give actual travel distances to training centres. Confirm the centre and commute before enrolling. ${sourceNote}`;
  } else if (code === 'cost') {
    answer = lang === 'hi'
      ? `इस डेटा में प्रशिक्षण शुल्क शामिल नहीं है, इसलिए वास्तविक लागत की तुलना नहीं की जा सकती। ${tradeName} की उपलब्ध कमाई सीमा ${money(outcome?.earnings_p25_inr) || 'दर्ज नहीं'}–${money(outcome?.earnings_p75_inr) || 'दर्ज नहीं'} प्रति माह है। ${sourceNote}`
      : `Training fees are not included in this dataset, so total cost cannot be compared here. The available ${tradeName} earnings range is ${money(outcome?.earnings_p25_inr) || 'not recorded'}–${money(outcome?.earnings_p75_inr) || 'not recorded'} per month. ${sourceNote}`;
  } else if (code === 'social_status') {
    answer = lang === 'hi'
      ? `उपलब्ध परिणाम डेटा सामाजिक सम्मान को नहीं मापता। यह ${tradeName} के प्लेसमेंट और कमाई के आंकड़े दिखा सकता है, लेकिन समुदाय में सम्मान का अनुभव परिवार और स्थान के अनुसार बदलता है। ${sourceNote}`
      : `The available outcome data does not measure social respect. It can show placement and earnings figures for ${tradeName}, but how a trade is viewed varies by family and community. ${sourceNote}`;
  } else {
    answer = lang === 'hi'
      ? `कौशल-आधारित प्रशिक्षण केवल परीक्षा में असफल विद्यार्थियों के लिए नहीं है। उपयुक्तता रुचि, योग्यता और उपलब्ध प्रशिक्षण पर निर्भर करती है। ${sourceNote}`
      : `Skills training is not only for students who failed an exam. Suitability depends on interests, eligibility, and available training. ${sourceNote}`;
  }

  return { text: answer, outcomeData: outcome, trade, pathwaySteps, concernCode: code, isAnswer: true };
};

export const requestGroundedLlmAnswer = async (
  question: string,
  context: string,
  lang: string,
  signal?: AbortSignal,
): Promise<string | null> => {
  const endpoint = import.meta.env.VITE_LLM_PROXY_URL;
  if (!endpoint) return null;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question,
      context,
      language: lang,
      instruction: 'Answer only from context. If context lacks an answer, say so plainly. Do not add facts, estimates, or sources.',
    }),
    signal,
  });
  if (!response.ok) throw new Error(`LLM proxy returned ${response.status}`);
  const result: unknown = await response.json();
  if (!result || typeof result !== 'object' || !('answer' in result) || typeof result.answer !== 'string') {
    throw new Error('LLM proxy returned an invalid answer payload');
  }
  return result.answer;
};
