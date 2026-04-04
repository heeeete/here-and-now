'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/ui/dialog';
import { postReport } from '@/src/entities/report/api/post-report';
import { ReportForm, ReportFormValues } from './ReportForm';

interface CreateReportModalProps {
  location: { lat: number; lng: number } | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateReportModal = ({
  location,
  onOpenChange,
  onSuccess,
}: CreateReportModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: ReportFormValues) => {
    if (!location) return;

    setIsSubmitting(true);
    try {
      await postReport({
        ...values,
        latitude: location.lat,
        longitude: location.lng,
      });
      onSuccess();
      onOpenChange(false);
    } catch {
      alert('제보 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={!!location} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-auto right-4 bottom-4 left-auto translate-x-0 translate-y-0 sm:max-w-sm">
        <div className="max-h-[80vh] overflow-y-auto pr-2">
          <DialogHeader>
            <DialogTitle>지금 여기 제보하기</DialogTitle>
          </DialogHeader>

          <ReportForm onSubmit={onSubmit} submitLabel="제보 등록하기" isSubmitting={isSubmitting} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
