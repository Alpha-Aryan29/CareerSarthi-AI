export type EscalationPriority = 'High' | 'Medium' | 'Low';
export type EscalationStatus = 'open' | 'claimed' | 'in_call' | 'resolved' | 'unreachable';
export type ConcernType = 'earning potential' | 'job security' | 'social status' | 'safety' | 'cost';

export interface EscalationCase {
  id: string;
  name?: string;
  phone: string;
  time: string;
  status: EscalationStatus;
  timestamp: string;
  priority: EscalationPriority;
  triggerReason: string;
  summary: string;
  district: string;
  state: string;
  trade: string;
  concern: ConcernType;
  sentimentBefore: number;
  sentimentAfter: number;
}

const seedCases: EscalationCase[] = [
  {
    id: 'seed-1',
    name: 'Leela Goyal',
    phone: '9876543210',
    time: 'Evening',
    status: 'open',
    timestamp: '2026-10-05T09:00:00.000Z',
    priority: 'High',
    triggerReason: 'Safety concern',
    summary: 'Parent is worried about travel distance and workshop safety before enrolling in the Electrician pathway.',
    district: 'Gadchiroli',
    state: 'Maharashtra',
    trade: 'Electrician',
    concern: 'safety',
    sentimentBefore: 1.8,
    sentimentAfter: 2.9,
  },
  {
    id: 'seed-2',
    name: 'Amit Verma',
    phone: '9123456780',
    time: 'Morning',
    status: 'claimed',
    timestamp: '2026-10-04T15:30:00.000Z',
    priority: 'Medium',
    triggerReason: 'Cost question',
    summary: 'Learner asked for a clearer comparison between course cost and likely earnings in the COPA pathway.',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    trade: 'COPA',
    concern: 'cost',
    sentimentBefore: 2.4,
    sentimentAfter: 3.5,
  },
  {
    id: 'seed-3',
    name: 'Hina Sharma',
    phone: '9988776655',
    time: 'Afternoon',
    status: 'resolved',
    timestamp: '2026-10-03T11:15:00.000Z',
    priority: 'Low',
    triggerReason: 'Further education route',
    summary: 'Family wanted to understand diploma and lateral degree paths after a skills course.',
    district: 'Jaipur',
    state: 'Rajasthan',
    trade: 'Fitter',
    concern: 'job security',
    sentimentBefore: 2.3,
    sentimentAfter: 3.7,
  },
  {
    id: 'seed-4',
    name: 'Rahul Nair',
    phone: '9345678901',
    time: 'Morning',
    status: 'in_call',
    timestamp: '2026-10-05T08:15:00.000Z',
    priority: 'High',
    triggerReason: 'Placement confidence',
    summary: 'Parent is seeking reassurance on placement quality and employer trust for training outcomes in Mumbai.',
    district: 'Mumbai',
    state: 'Maharashtra',
    trade: 'Electrician',
    concern: 'earning potential',
    sentimentBefore: 2.1,
    sentimentAfter: 3.8,
  },
  {
    id: 'seed-5',
    name: 'Sonia Meena',
    phone: '9034567890',
    time: 'Evening',
    status: 'unreachable',
    timestamp: '2026-10-02T12:20:00.000Z',
    priority: 'Medium',
    triggerReason: 'Social status concern',
    summary: 'Family asked whether the trade is respected in the local community and among households.',
    district: 'Jaipur',
    state: 'Rajasthan',
    trade: 'COPA',
    concern: 'social status',
    sentimentBefore: 2.5,
    sentimentAfter: 3.1,
  },
];

const STORAGE_KEY = 'escalations';

export const concernOptions = ['earning potential', 'job security', 'social status', 'safety', 'cost'] as const;
export const districtOptions = ['Mumbai', 'Gadchiroli', 'Jaipur', 'Lucknow'];

export function readEscalations(): EscalationCase[] {
  if (typeof window === 'undefined') {
    return [...seedCases];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedCases));
      return [...seedCases];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedCases));
      return [...seedCases];
    }

    return parsed.map((item) => ({
      ...item,
      status: item.status || 'open',
      priority: item.priority || 'Medium',
      concern: item.concern || 'safety',
      sentimentBefore: item.sentimentBefore ?? 2.2,
      sentimentAfter: item.sentimentAfter ?? 3.4,
    }));
  } catch (error) {
    console.error('Unable to read escalation records', error);
    return [...seedCases];
  }
}

export function writeEscalations(cases: EscalationCase[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

export function createEscalation(input: {
  name?: string;
  phone: string;
  state: string;
  district: string;
  trade: string;
  concern: ConcernType | string;
  time: string;
  summary?: string;
  triggerReason?: string;
  priority?: EscalationPriority;
}): EscalationCase {
  const record: EscalationCase = {
    id: `case-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    name: input.name || 'New family member',
    phone: input.phone,
    state: input.state || 'Maharashtra',
    district: input.district || 'Mumbai',
    trade: input.trade || 'Electrician',
    concern: (concernOptions as readonly string[]).includes(input.concern) ? (input.concern as ConcernType) : 'safety',
    time: input.time || 'Evening',
    status: 'open',
    timestamp: new Date().toISOString(),
    priority: input.priority || 'High',
    triggerReason: input.triggerReason || 'Human support requested',
    summary:
      input.summary ||
      `Family requested a callback to understand the ${input.trade || 'selected'} pathway and the ${input.concern || 'safety'} concern with more guidance.`,
    sentimentBefore: 2.1,
    sentimentAfter: 3.3,
  };

  const existing = readEscalations();
  const next = [record, ...existing];
  writeEscalations(next);
  return record;
}

export function getStatusCounts(cases: EscalationCase[]) {
  return {
    open: cases.filter((item) => item.status === 'open').length,
    claimed: cases.filter((item) => item.status === 'claimed').length,
    inCall: cases.filter((item) => item.status === 'in_call').length,
    resolved: cases.filter((item) => item.status === 'resolved').length,
    unreachable: cases.filter((item) => item.status === 'unreachable').length,
    highPriority: cases.filter((item) => item.priority === 'High').length,
    total: cases.length,
  };
}

export function getCaseFilters(cases: EscalationCase[], filters: { status?: string; priority?: string; district?: string; trade?: string; concern?: string }) {
  return cases.filter((item) => {
    const matchesStatus = !filters.status || filters.status === 'all' ? true : item.status === filters.status;
    const matchesPriority = !filters.priority || filters.priority === 'all' ? true : item.priority.toLowerCase() === filters.priority.toLowerCase();
    const matchesDistrict = !filters.district || filters.district === 'all' ? true : item.district.toLowerCase() === filters.district.toLowerCase();
    const matchesTrade = !filters.trade || filters.trade === 'all' ? true : item.trade.toLowerCase() === filters.trade.toLowerCase();
    const matchesConcern = !filters.concern || filters.concern === 'all' ? true : item.concern.toLowerCase() === filters.concern.toLowerCase();

    return matchesStatus && matchesPriority && matchesDistrict && matchesTrade && matchesConcern;
  });
}

export function getDistrictInsightRows(cases: EscalationCase[]) {
  const districtMap = new Map<string, { district: string; state: string; cases: number; avgBefore: number; avgAfter: number; resistance: number; dominantConcern: string }>();

  for (const item of cases) {
    const prev = districtMap.get(item.district) || {
      district: item.district,
      state: item.state,
      cases: 0,
      avgBefore: 0,
      avgAfter: 0,
      resistance: 0,
      dominantConcern: item.concern,
    };

    prev.cases += 1;
    prev.avgBefore += item.sentimentBefore;
    prev.avgAfter += item.sentimentAfter;
    prev.resistance += item.priority === 'High' ? 30 : item.priority === 'Medium' ? 20 : 12;
    if (item.status !== 'resolved') {
      prev.resistance += item.status === 'open' ? 12 : 8;
    }
    prev.dominantConcern = item.concern;
    districtMap.set(item.district, prev);
  }

  return [...districtMap.values()].map((item) => ({
    ...item,
    avgBefore: Number((item.avgBefore / Math.max(item.cases, 1)).toFixed(1)),
    avgAfter: Number((item.avgAfter / Math.max(item.cases, 1)).toFixed(1)),
    resistance: Math.min(100, Math.round(item.resistance / Math.max(item.cases, 1))),
  }));
}

export function getConcernCounts(cases: EscalationCase[]) {
  return concernOptions.map((concern) => ({
    name: concern,
    value: cases.filter((item) => item.concern === concern).length,
  }));
}
