'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/ui/dialog';
import { postRecord } from '@/src/entities/record/api/post-record';
import { useMapStore } from '@/src/shared/model/useMapStore';
import { useRecordStore } from '@/src/entities/record/model/useRecordStore';
import { RecordForm, RecordFormValues } from './RecordForm';

interface CreateRecordModalProps {
  onSuccess?: () => void;
}

export const CreateRecordModal = ({ onSuccess }: CreateRecordModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { selectedLocation, setSelectedLocation } = useMapStore();
  const { refreshRecords } = useRecordStore();

  const onSubmit = async (values: RecordFormValues) => {
    if (!selectedLocation) return;

    setIsSubmitting(true);
    try {
      await postRecord({
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        ...values,
        password: values.password as string, // 타입 단언 추가
      });

      // 데이터 새로고침
      void refreshRecords();
      onSuccess?.();
      setSelectedLocation(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '등록 중 오류가 발생했습니다.';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={!!selectedLocation} onOpenChange={(open) => !open && setSelectedLocation(null)}>
      <DialogContent className="fixed bottom-4 left-1/2 top-auto w-[calc(100%-2rem)] -translate-x-1/2 translate-y-0 sm:max-w-sm md:left-auto md:right-4 md:translate-x-0">
        <div className="max-h-[80vh] overflow-y-auto pr-2">
          <DialogHeader>
            <DialogTitle>지금 여기 기록하기</DialogTitle>
          </DialogHeader>

          <RecordForm onSubmit={onSubmit} submitLabel="기록 남기기" isSubmitting={isSubmitting} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
