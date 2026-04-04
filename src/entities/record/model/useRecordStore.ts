import { create } from 'zustand';
import { Record } from './types';
import { fetchActiveRecords } from '../api/fetch-active-records';

interface RecordState {
  records: Record[];
  selectedRecordId: string | null;
  isLoading: boolean;
  
  // 액션
  setRecords: (records: Record[]) => void;
  setSelectedRecordId: (id: string | null) => void;
  
  // 데이터 패칭 비즈니스 로직
  refreshRecords: (bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => Promise<void>;
}

/**
 * 기록(Record) 데이터와 관련된 전역 상태를 관리하는 스토어
 */
export const useRecordStore = create<RecordState>((set) => ({
  records: [],
  selectedRecordId: null,
  isLoading: false,
  
  setRecords: (records) => set({ records }),
  setSelectedRecordId: (id) => set({ selectedRecordId: id }),
  
  refreshRecords: async (bounds) => {
    set({ isLoading: true });
    try {
      const data = await fetchActiveRecords(bounds);
      set({ records: data });
    } finally {
      set({ isLoading: false });
    }
  },
}));
