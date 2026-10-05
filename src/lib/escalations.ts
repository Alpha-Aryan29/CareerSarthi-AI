export type EscalationPriority = 'High' | 'Medium' | 'Low';
export type EscalationStatus = 'open' | 'claimed' | 'scheduled' | 'in_call' | 'resolved' | 'unreachable';
export type ConcernType =
  | 'earning potential'
  | 'job security'
  | 'social status'
  | 'growth/further education'
  | 'safety'
  | 'distance/travel'
  | 'cost'
  | 'only for failures'
  | 'other';

export interface CounsellingSession {
  id: string;
  concern: ConcernType;
  trade: string;
  district: string;
  sentimentBefore: number | null;
  sentimentAfter: number | null;
  escalated: boolean;
  resolved: boolean;
  createdAt: string;
  demo: boolean;
}

export interface EscalationCase {
  id: string;
  sessionId?: string;
  name?: string;
  phone: string;
  time: string;
  status: EscalationStatus;
  timestamp: string;
  updatedAt?: string;
  claimedAt?: string;
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

const STORAGE_KEY = 'careersarthi-shared-store';

export const concernOptions = ['earning potential', 'job security', 'social status', 'growth/further education', 'safety', 'distance/travel', 'cost', 'only for failures', 'other'] as const;

const demoSessions: CounsellingSession[] = Array.from({ length: 30 }, (_, index) => {
  const locations = [
    ['Mumbai', 'Maharashtra'], ['Gadchiroli', 'Maharashtra'], ['Jaipur', 'Rajasthan'],
    ['Lucknow', 'Uttar Pradesh'], ['Pune', 'Maharashtra'], ['Nagpur', 'Maharashtra'],
    ['Nashik', 'Maharashtra'],
  ];
  const concerns = concernOptions.slice(0, 8);
  const [district] = locations[index % locations.length];
  const concern = concerns[index % concerns.length];
  const before = 1.7 + (index % 14) / 10;
  return {
    id: `demo-session-${index + 1}`,
    concern,
    trade: ['Electrician', 'Fitter', 'COPA', 'Health Sanitary Inspector'][index % 4],
    district,
    sentimentBefore: before,
    sentimentAfter: Math.min(5, before + 0.4 + (index % 5) / 10),
    escalated: index % 3 === 0,
    resolved: index % 5 !== 0,
    createdAt: `2026-10-${String((index % 5) + 1).padStart(2, '0')}T10:00:00.000Z`,
    demo: true,
  };
});

interface SharedStore {
  cases: EscalationCase[];
  sessions: CounsellingSession[];
}

const readSharedStore = (): SharedStore => {
  const defaults = { cases: [...seedCases], sessions: demoSessions };
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !('cases' in parsed) || !('sessions' in parsed)) {
        throw new Error('Stored counselling store has an invalid shape');
      }
      const store = parsed as SharedStore;
      if (!Array.isArray(store.cases) || !Array.isArray(store.sessions)) {
        throw new Error('Stored counselling store collections are invalid');
      }
      return store;
    }

    const legacyCases = localStorage.getItem('escalations');
    const legacySessions = localStorage.getItem('careersarthi-sessions');
    const migrated = {
      cases: legacyCases ? JSON.parse(legacyCases) as EscalationCase[] : defaults.cases,
      sessions: legacySessions ? JSON.parse(legacySessions) as CounsellingSession[] : defaults.sessions,
    };
    if (!Array.isArray(migrated.cases) || !Array.isArray(migrated.sessions)) {
      throw new Error('Legacy counselling records are invalid');
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    if (legacyCases) localStorage.removeItem('escalations');
    if (legacySessions) localStorage.removeItem('careersarthi-sessions');
    return migrated;
  } catch (error) {
    console.error('Unable to read shared counselling records', error);
    return defaults;
  }
};

const writeSharedStore = (store: SharedStore) => {
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export function readCounsellingSessions(): CounsellingSession[] {
  return readSharedStore().sessions;
}

export function writeCounsellingSession(session: CounsellingSession) {
  if (typeof window === 'undefined') return;
  const store = readSharedStore();
  const sessions = store.sessions;
  const next = sessions.some((item) => item.id === session.id)
    ? sessions.map((item) => item.id === session.id ? { ...item, ...session, demo: false } : item)
    : [{ ...session, demo: false }, ...sessions];
  writeSharedStore({ ...store, sessions: next });
}

export function getSessionDistrictInsights(sessions: CounsellingSession[]) {
  const grouped = new Map<string, CounsellingSession[]>();
  sessions.forEach((session) => grouped.set(session.district, [...(grouped.get(session.district) || []), session]));
  return [...grouped.entries()].map(([district, rows]) => {
    const concernCounts = new Map<string, number>();
    rows.forEach((row) => concernCounts.set(row.concern, (concernCounts.get(row.concern) || 0) + 1));
    const dominantConcern = [...concernCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'other';
    const beforeRatings = rows.flatMap((row) => row.sentimentBefore === null ? [] : [row.sentimentBefore]);
    const afterRatings = rows.flatMap((row) => row.sentimentAfter === null ? [] : [row.sentimentAfter]);
    const avgBefore = beforeRatings.length ? beforeRatings.reduce((sum, rating) => sum + rating, 0) / beforeRatings.length : null;
    const avgAfter = afterRatings.length ? afterRatings.reduce((sum, rating) => sum + rating, 0) / afterRatings.length : null;
    const escalatedRate = rows.filter((row) => row.escalated).length / rows.length;
    const unresolvedSentiment = avgAfter === null ? 0 : (5 - avgAfter) / 4;
    const resistance = Math.round((escalatedRate * 70 + unresolvedSentiment * 30) * 100) / 100;
    return {
      district,
      cases: rows.length,
      avgBefore: avgBefore === null ? null : Number(avgBefore.toFixed(1)),
      avgAfter: avgAfter === null ? null : Number(avgAfter.toFixed(1)),
      resistance,
      dominantConcern,
      dominantTrade: [...new Set(rows.map((row) => row.trade))]
        .map((trade) => ({ trade, count: rows.filter((row) => row.trade === trade).length }))
        .sort((a, b) => b.count - a.count)[0]?.trade || 'Not selected',
    };
  });
}

export function getSessionConcernCounts(sessions: CounsellingSession[]) {
  return concernOptions.map((concern) => ({
    name: concern,
    value: sessions.filter((session) => session.concern === concern).length,
  }));
}

export function getResistanceIndex(sessions: CounsellingSession[]) {
  if (!sessions.length) return 0;
  const escalatedRate = sessions.filter((session) => session.escalated).length / sessions.length;
  const afterRatings = sessions.flatMap((session) => session.sentimentAfter === null ? [] : [session.sentimentAfter]);
  const averageAfter = afterRatings.length
    ? afterRatings.reduce((sum, rating) => sum + rating, 0) / afterRatings.length
    : null;
  return Math.round((escalatedRate * 70 + (averageAfter === null ? 0 : ((5 - averageAfter) / 4) * 30)) * 100) / 100;
}

export function readEscalations(): EscalationCase[] {
  try {
    return readSharedStore().cases.map((item) => ({
      ...item,
      status: item.status || 'open',
      priority: item.priority || 'Medium',
      concern: item.concern || 'other',
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
  writeSharedStore({ ...readSharedStore(), cases });
  window.dispatchEvent(new Event('careersarthi-cases-updated'));
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
  sessionId?: string;
  sentimentBefore?: number;
  sentimentAfter?: number;
}): EscalationCase {
  const previousSession = input.sessionId
    ? readCounsellingSessions().find((session) => session.id === input.sessionId)
    : undefined;
  const sessionSentimentBefore = input.sentimentBefore ?? previousSession?.sentimentBefore ?? null;
  const sessionSentimentAfter = input.sentimentAfter ?? previousSession?.sentimentAfter ?? null;
  const sentimentBefore = sessionSentimentBefore ?? 3;
  const sentimentAfter = sessionSentimentAfter ?? sentimentBefore;
  const record: EscalationCase = {
    id: `case-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    name: input.name || 'New family member',
    phone: input.phone,
    state: input.state || 'Maharashtra',
    district: input.district || 'Mumbai',
    trade: input.trade || 'Electrician',
    concern: (concernOptions as readonly string[]).includes(input.concern) ? (input.concern as ConcernType) : 'other',
    time: input.time || 'Evening',
    status: 'open',
    timestamp: new Date().toISOString(),
    priority: input.priority || 'High',
    triggerReason: input.triggerReason || 'Human support requested',
    summary:
      input.summary ||
      `Family requested a callback to understand the ${input.trade || 'selected'} pathway and the ${input.concern || 'safety'} concern with more guidance.`,
    sentimentBefore,
    sentimentAfter,
  };
  record.sessionId = input.sessionId || record.id;

  const existing = readEscalations();
  const next = [record, ...existing];
  writeEscalations(next);
  writeCounsellingSession({
    id: input.sessionId || record.id,
    concern: record.concern,
    trade: record.trade,
    district: record.district,
    sentimentBefore: sessionSentimentBefore,
    sentimentAfter: sessionSentimentAfter,
    escalated: true,
    resolved: false,
    createdAt: record.timestamp,
    demo: false,
  });
  return record;
}

export function getStatusCounts(cases: EscalationCase[]) {
  return {
    open: cases.filter((item) => item.status === 'open').length,
    claimed: cases.filter((item) => item.status === 'claimed').length,
    scheduled: cases.filter((item) => item.status === 'scheduled').length,
    inCall: cases.filter((item) => item.status === 'in_call').length,
    resolved: cases.filter((item) => item.status === 'resolved').length,
    unreachable: cases.filter((item) => item.status === 'unreachable').length,
    highPriority: cases.filter((item) => item.priority === 'High').length,
    total: cases.length,
  };
}

export function getCaseFilters(cases: EscalationCase[], filters: { status?: string; priority?: string; district?: string; trade?: string; concern?: string; caseId?: string }) {
  return cases.filter((item) => {
    const matchesStatus = !filters.status || filters.status === 'all' ? true : item.status === filters.status;
    const matchesPriority = !filters.priority || filters.priority === 'all' ? true : item.priority.toLowerCase() === filters.priority.toLowerCase();
    const matchesDistrict = !filters.district || filters.district === 'all' ? true : item.district.toLowerCase() === filters.district.toLowerCase();
    const matchesTrade = !filters.trade || filters.trade === 'all' ? true : item.trade.toLowerCase() === filters.trade.toLowerCase();
    const matchesConcern = !filters.concern || filters.concern === 'all' ? true : item.concern.toLowerCase() === filters.concern.toLowerCase();
    const matchesCase = !filters.caseId || item.id === filters.caseId;

    return matchesStatus && matchesPriority && matchesDistrict && matchesTrade && matchesConcern && matchesCase;
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
