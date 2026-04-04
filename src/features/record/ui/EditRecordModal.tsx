'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/ui/dialog';
import { postRecordUpdate } from '@/src/entities/record/api/post-record-update';
import { Record } from '@/src/entities/record/model/types';
import { RecordForm, RecordFormValues } from './RecordForm';

interface EditRecordModalProps {
  record: Record | null;
  isOpen: boolean;
  password?: string;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditRecordModal = ({
  record,
  isOpen,
  password = '',
  onOpenChange,
  onSuccess,
}: EditRecordModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: RecordFormValues) => {
    if (!record?.id) return;

    setIsSubmitting(true);
    try {
      await postRecordUpdate(record.id, password, values);
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '수정 중 오류가 발생했습니다.';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="fixed bottom-4 left-auto right-4 top-auto translate-x-0 translate-y-0 sm:max-w-sm">
        <div className="max-h-[80vh] overflow-y-auto pr-2">
          <DialogHeader>
            <DialogTitle>기록 수정하기</DialogTitle>
            <p className="text-xs text-muted-foreground">
              현재 상황에 맞게 내용을 업데이트해주세요.
            </p>
          </DialogHeader>

          {record && (
            <RecordForm
              defaultValues={{
                comment: record.comment || '',
                password: '',
              }}
              onSubmit={onSubmit}
              submitLabel="수정 완료"
              isSubmitting={isSubmitting}
              hidePassword
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
