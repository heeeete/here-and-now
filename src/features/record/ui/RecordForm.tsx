'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/src/shared/ui/button';
import { Input } from '@/src/shared/ui/input';
import { Label } from '@/src/shared/ui/label';
import { Textarea } from '@/src/shared/ui/textarea';

export const recordSchema = z.object({
  comment: z.string().min(1, '한 줄 코멘트를 입력해주세요').max(50, '50자 이내로 작성해주세요'),
  password: z.string().min(4, '비밀번호는 4자리 이상이어야 합니다'),
});

export type RecordFormValues = z.infer<typeof recordSchema>;

interface RecordFormProps {
  defaultValues?: Partial<RecordFormValues>;
  onSubmit: (values: RecordFormValues) => Promise<void>;
  submitLabel: string;
  isSubmitting: boolean;
  hidePassword?: boolean;
}

const PASSWORD_STORAGE_KEY = 'nowhere_last_password';

export const RecordForm = ({
  defaultValues,
  onSubmit,
  submitLabel,
  isSubmitting,
  hidePassword = false,
}: RecordFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RecordFormValues>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      comment: defaultValues?.comment || '',
      password: defaultValues?.password || '',
    },
  });

  // 로컬 스토리지에서 마지막 비밀번호 불러오기
  useEffect(() => {
    if (!hidePassword && !defaultValues?.password) {
      const savedPassword = localStorage.getItem(PASSWORD_STORAGE_KEY);
      if (savedPassword) {
        setValue('password', savedPassword);
      }
    }
  }, [hidePassword, defaultValues?.password, setValue]);

  const handleFormSubmit = async (values: RecordFormValues) => {
    if (!hidePassword) {
      localStorage.setItem(PASSWORD_STORAGE_KEY, values.password);
    }
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 py-2">
      {/* 코멘트 */}
      <div className="space-y-2">
        <Label htmlFor="comment" className="text-[13px] font-bold text-slate-700">
          한 줄 코멘트
        </Label>
        <Textarea
          id="comment"
          placeholder="지금 이곳의 생생한 상황을 한 줄로 알려주세요"
          {...register('comment')}
          className="h-20 resize-none border-slate-100 bg-slate-50/50 focus:bg-white"
        />
        {errors.comment && (
          <p className="text-xs font-medium text-red-500">{errors.comment.message}</p>
        )}
      </div>

      {/* 비밀번호 */}
      {!hidePassword && (
        <div className="space-y-2">
          <Label htmlFor="password" className="text-[13px] font-bold text-slate-700">
            관리용 비밀번호
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="수정/삭제 시 필요합니다 (4자리 이상)"
            {...register('password')}
            className="border-slate-100 bg-slate-50/50 focus:bg-white"
          />
          {errors.password && (
            <p className="text-xs font-medium text-red-500">{errors.password.message}</p>
          )}
        </div>
      )}

      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full bg-blue-600 font-bold text-white shadow-lg hover:bg-blue-700 disabled:bg-slate-200"
        >
          {isSubmitting ? '처리 중...' : submitLabel}
        </Button>
      </div>
    </form>
  );
};
