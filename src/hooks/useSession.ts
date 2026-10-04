import { create } from 'zustand';

interface SessionState {
  mode: 'learner' | 'parent' | 'both' | null;
  setMode: (mode: 'learner' | 'parent' | 'both') => void;
  
  locationStateId: string | null;
  locationDistrictId: string | null;
  setLocation: (stateId: string, districtId: string) => void;

  learnerEducationId: string | null;
  learnerAgeBandId: string | null;
  learnerInterestIds: string[];
  setLearnerProfile: (educationId: string, ageBandId: string, interestIds: string[]) => void;

  parentConcernIds: string[];
  parentIncomeBracketId: string | null;
  setParentProfile: (concernIds: string[], incomeBracketId: string | null) => void;
  
  sentimentStart: number | null;
  setSentimentStart: (rating: number) => void;
  sentimentEnd: number | null;
  setSentimentEnd: (rating: number) => void;
}

export const useSession = create<SessionState>((set) => ({
  mode: null,
  setMode: (mode) => set({ mode }),
  
  locationStateId: null,
  locationDistrictId: null,
  setLocation: (stateId, districtId) => set({ locationStateId: stateId, locationDistrictId: districtId }),

  learnerEducationId: null,
  learnerAgeBandId: null,
  learnerInterestIds: [],
  setLearnerProfile: (learnerEducationId, learnerAgeBandId, learnerInterestIds) => set({ learnerEducationId, learnerAgeBandId, learnerInterestIds }),

  parentConcernIds: [],
  parentIncomeBracketId: null,
  setParentProfile: (parentConcernIds, parentIncomeBracketId) => set({ parentConcernIds, parentIncomeBracketId }),
  
  sentimentStart: null,
  setSentimentStart: (rating) => set({ sentimentStart: rating }),
  sentimentEnd: null,
  setSentimentEnd: (rating) => set({ sentimentEnd: rating }),
}));
