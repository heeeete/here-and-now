'use client';

import { useRecordStore } from '@/src/entities/record/model/useRecordStore';
import { RecordItem } from '@/src/entities/record/ui/RecordItem';

/**
 * 모바일용 실시간 기록 가로 스크롤 캐러셀 위젯
 * - 앱의 전역 상태(Store)를 사용하여 데이터를 구독하고 액션을 수행합니다.
 */
export const MobileRecordCarousel = () => {
  const records = useRecordStore((state) => state.records);
  const setSelectedRecordId = useRecordStore((state) => state.setSelectedRecordId);

  if (records.length === 0) return null;

  return (
    <div className="absolute bottom-6 left-0 right-0 z-10 md:hidden">
      <div className="flex w-full gap-3 overflow-x-auto px-4 pb-4 no-scrollbar">
        {records.map((record) => (
          <RecordItem
            key={record.id}
            record={record}
            variant="card"
            onClick={setSelectedRecordId}
          />
        ))}
      </div>
    </div>
  );
};
