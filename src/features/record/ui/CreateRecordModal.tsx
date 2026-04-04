'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/src/shared/ui/dialog';
import { postRecord } from '@/src/entities/record/api/post-record';
import { useMapStore } from '@/src/shared/model/useMapStore';
import { useRecordStore } from '@/src/entities/record/model/useRecordStore';
import { RecordForm, RecordFormValues } from './RecordForm';

interface CreateRecordModalProps {
  onSuccess?: () => void;
}

export const CreateRecordModal = ({
  onSuccess,
}: CreateRecordModalProps) => {
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
    <Dialog 
      open={!!selectedLocation} 
      onOpenChange={(open) => !open && setSelectedLocation(null)}
    >
      <DialogContent className="fixed bottom-4 left-auto right-4 top-auto translate-x-0 translate-y-0 sm:max-w-sm">
        <div className="max-h-[80vh] overflow-y-auto pr-2">
          <DialogHeader>
            <DialogTitle>지금 여기는 어떤가요?</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              선택한 위치의 생생한 현장 상황을 기록으로 남겨주세요.
            </DialogDescription>
          </DialogHeader>

          <RecordForm
            onSubmit={onSubmit}
            submitLabel="기록 남기기"
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
