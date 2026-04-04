'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/shared/ui/alert-dialog';
import { Input } from '@/src/shared/ui/input';
import { cn } from '@/src/shared/lib/utils';

interface AuthPasswordModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password: string) => void;
  title: string;
  description: string;
  isDelete?: boolean;
}

/**
 * 수정/삭제 전 비밀번호를 확인하는 모달입니다.
 */
export const AuthPasswordModal = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  isDelete = false,
}: AuthPasswordModalProps) => {
  const [password, setPassword] = useState('');

  const handleConfirm = () => {
    if (!password.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    onConfirm(password);
    setPassword('');
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="fixed top-auto right-4 bottom-4 left-auto w-[320px] translate-x-0 translate-y-0 sm:max-w-[320px]">
        <AlertDialogHeader>
          <AlertDialogTitle className={cn(isDelete ? "text-red-600" : "text-slate-900")}>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-[13px] font-medium text-slate-500">{description}</p>
            <Input
              type="password"
              placeholder="비밀번호 4자리 이상"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              autoFocus
            />
          </div>
        </div>

        <AlertDialogFooter className="flex-row gap-2 sm:justify-end">
          <AlertDialogCancel variant="outline" className="flex-1">
            취소
          </AlertDialogCancel>
          <AlertDialogAction 
            className={cn(
              "flex-1 font-bold text-white",
              isDelete ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
            )}
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
          >
            {isDelete ? "삭제하기" : "확인"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
