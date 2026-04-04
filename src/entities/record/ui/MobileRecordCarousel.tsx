'use client';

import { useRecordStore } from '../model/useRecordStore';
import { RecordItem } from './RecordItem';

export const MobileRecordCarousel = () => {
  const { records, setSelectedRecordId } = useRecordStore();

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
