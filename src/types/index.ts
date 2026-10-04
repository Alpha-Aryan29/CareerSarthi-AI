export interface Trade {
  id: string;
  code: string;
  name_en: string;
  name_hi: string;
  sector: string;
  entry_nsqf_level: number;
  description_en: string;
  description_hi: string;
  is_active: boolean;
}

export interface OutcomeRecord {
  id: string;
  trade_id: string;
  provider_id: string | null;
  location_id: string;
  scope: 'provider' | 'district' | 'state' | 'national';
  cohort_year: number;
  placement_rate_pct: number | null;
  earnings_p25_inr: number | null;
  earnings_median_inr: number | null;
  earnings_p75_inr: number | null;
  sample_size: number | null;
  data_type: 'public_benchmark' | 'pilot_demo' | 'verified';
  source_name: string;
  source_year: number;
  notes: string | null;
}

export interface PathwayStep {
  id: string;
  trade_id: string;
  step_order: number;
  nsqf_level: number | null;
  title_en: string;
  title_hi: string;
  description_en: string;
  description_hi: string;
  step_type: 'qualification' | 'job_role' | 'further_education';
  typical_duration_months: number | null;
}

export interface ConcernCategory {
  code: string;
  label_en: string;
  label_hi: string;
  is_sensitive: boolean;
  sort_order: number;
  icon: string;
}

export interface LocationRecord {
  id: string;
  level: 'state' | 'district' | 'block';
  parent_id: string | null;
  state_code: string;
  name_en: string;
  name_hi: string;
  setting?: 'urban' | 'semi_urban' | 'rural';
}

export interface LookupItem {
  code: string;
  label_en: string;
  label_hi: string;
  sort_order: number;
  icon?: string;
}

export interface Provider {
  id: string;
  name_en: string;
  name_hi: string;
  location_id: string;
  trades_offered: string[];
}

export interface TradeRanking {
  trade: Trade;
  score: number;
  reasons_en: string[];
  reasons_hi: string[];
}
