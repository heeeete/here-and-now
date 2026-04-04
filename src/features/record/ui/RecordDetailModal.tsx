'use client';

import { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/ui/dialog';
import { Button } from '@/src/shared/ui/button';
import { fetchRecordById } from '@/src/entities/record/api/fetch-record-by-id';
import { postReaction, ReactionType } from '@/src/entities/record/api/post-reaction';
import { deleteReaction } from '@/src/entities/record/api/delete-reaction';
import { postRecordComplaint } from '@/src/entities/record/api/post-record-complaint';
import { deleteRecord } from '@/src/entities/record/api/delete-record';
import { Record } from '@/src/entities/record/model/types';
import { useRecordStore } from '@/src/entities/record/model/useRecordStore';
import { AuthPasswordModal } from './AuthPasswordModal';
import { EditRecordModal } from './EditRecordModal';
import { cn } from '@/src/shared/lib/utils';

interface RecordDetailModalProps {
  onRefresh?: () => void;
}

interface SavedReaction {
  id: string;
  type: ReactionType;
}

const REACTIONS_STORAGE_KEY = 'nowhere_user_reactions_v3';
const DEVICE_ID_KEY = 'nowhere_device_id';

const getDeviceId = () => {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      deviceId = crypto.randomUUID();
    } else {
      deviceId = 'idx-' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
};

const REACTION_LIST: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'like', emoji: '❤️', label: '좋아요' },
  { type: 'amazing', emoji: '😮', label: '놀라워요' },
  { type: 'funny', emoji: '😂', label: '웃겨요' },
  { type: 'sad', emoji: '😢', label: '슬퍼요' },
];

export const RecordDetailModal = ({
  onRefresh,
}: RecordDetailModalProps) => {
  const selectedRecordId = useRecordStore((state) => state.selectedRecordId);
  const setSelectedRecordId = useRecordStore((state) => state.setSelectedRecordId);
  const refreshRecords = useRecordStore((state) => state.refreshRecords);
  
  const [record, setRecord] = useState<Record | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [userReaction, setUserReaction] = useState<SavedReaction | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'edit' | 'delete' | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [verifiedPassword, setVerifiedPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 반응 기록 로드
  useEffect(() => {
    if (!selectedRecordId) {
      setUserReaction(null);
      setRecord(null);
      return;
    }
    const reactions = JSON.parse(localStorage.getItem(REACTIONS_STORAGE_KEY) || '{}');
    setUserReaction(reactions[selectedRecordId] || null);
  }, [selectedRecordId]);

  const fetchDetail = useCallback(async (id: string) => {
    const data = await fetchRecordById(id);
    setRecord(data);
  }, []);

  useEffect(() => {
    if (selectedRecordId && !isEditModalOpen) {
      void fetchDetail(selectedRecordId);
    }
  }, [selectedRecordId, isEditModalOpen, fetchDetail]);

  useEffect(() => {
    if (!record?.expires_at) return;

    const now = new Date().getTime();
    const expires = new Date(record.expires_at).getTime();
    const diff = expires - now;

    if (diff <= 0) {
      setTimeLeft('만료됨');
    } else {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}시간 ${mins}분 남음`);
    }
  }, [record?.expires_at]);

  const handleReaction = async (type: ReactionType) => {
    if (!selectedRecordId || !record || isProcessing) return;

    const reactions = JSON.parse(localStorage.getItem(REACTIONS_STORAGE_KEY) || '{}');
    const existing = reactions[selectedRecordId] as SavedReaction | undefined;
    const deviceId = getDeviceId();

    setIsProcessing(true);
    try {
      if (existing && existing.type === type) {
        await deleteReaction({ recordId: selectedRecordId, deviceId });
        delete reactions[selectedRecordId];
        localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(reactions));
        setUserReaction(null);
        
        setRecord(prev => {
          if (!prev) return null;
          const countKey = `${type}_count` as keyof Record;
          const currentCount = prev[countKey] as number;
          return {
            ...prev,
            [countKey]: Math.max(0, currentCount - 1),
          };
        });
        return;
      }

      await deleteReaction({ recordId: selectedRecordId, deviceId });
      const newReaction = await postReaction(selectedRecordId, type, deviceId);
      
      if (!newReaction) throw new Error('반응 등록 실패');

      const savedData: SavedReaction = { id: newReaction.id, type };
      reactions[selectedRecordId] = savedData;
      localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(reactions));
      setUserReaction(savedData);

      setRecord(prev => {
        if (!prev) return null;
        
        const updates: Partial<Record> = {};
        
        if (existing) {
          const oldKey = `${existing.type}_count` as keyof Record;
          const oldCount = Number(prev[oldKey]) || 0;
          Object.assign(updates, { [oldKey]: Math.max(0, oldCount - 1) });
        }
        
        const newKey = `${type}_count` as keyof Record;
        const newCount = Number(prev[newKey]) || 0;
        Object.assign(updates, { [newKey]: newCount + 1 });
        
        return { ...prev, ...updates };
      });

    } catch (err) {
      console.error('Reaction error:', err);
      void fetchDetail(selectedRecordId);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReportComplaint = async () => {
    if (!selectedRecordId) return;
    if (!confirm('이 기록을 신고하시겠습니까?')) return;

    try {
      await postRecordComplaint(selectedRecordId);
      alert('신고가 접수되었습니다.');
      setSelectedRecordId(null);
    } catch {
      alert('신고 중 오류가 발생했습니다.');
    }
  };

  const handleAuthConfirm = async (password: string) => {
    if (!selectedRecordId) return;

    try {
      if (authMode === 'delete') {
        if (!confirm('정말로 이 기록을 삭제하시겠습니까?')) return;
        await deleteRecord(selectedRecordId, password);
        alert('삭제되었습니다.');
        setIsAuthModalOpen(false);
        setSelectedRecordId(null);
        void refreshRecords();
        onRefresh?.();
      } else if (authMode === 'edit') {
        const { postVerifyPassword } =
          await import('@/src/entities/record/api/post-verify-password');
        await postVerifyPassword(selectedRecordId, password);

        setVerifiedPassword(password);
        setIsAuthModalOpen(false);
        setIsEditModalOpen(true);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '비밀번호가 일치하지 않습니다.';
      alert(message);
    }
  };

  return (
    <>
      <Dialog 
        open={!!selectedRecordId} 
        onOpenChange={(open) => !open && setSelectedRecordId(null)}
      >
        <DialogContent className="fixed top-auto right-4 bottom-4 left-auto w-[320px] translate-x-0 translate-y-0 overflow-hidden p-0 sm:max-w-[320px]">
          <div className="flex flex-col pt-5">
            <div className="p-5 pb-0">
              <DialogHeader className="gap-1.5">
                <div className="flex items-center justify-end">
                  <span className="text-[11px] font-semibold text-red-500">{timeLeft}</span>
                </div>
                <DialogTitle className="mt-1 text-base leading-snug font-bold break-keep">
                  {record?.comment}
                </DialogTitle>
                <p className="text-[10px] text-slate-400">
                  {record?.created_at && new Date(record.created_at).toLocaleTimeString()} 기록
                </p>
              </DialogHeader>
            </div>

            <div className="grid grid-cols-4 gap-1.5 p-5 pt-4">
              {REACTION_LIST.map((item) => {
                const isActive = userReaction?.type === item.type;
                const countKey = `${item.type}_count` as keyof Record;
                const count = record ? (record[countKey] as number) || 0 : 0;

                return (
                  <Button
                    key={item.type}
                    variant={isActive ? 'default' : 'outline'}
                    disabled={isProcessing}
                    className={cn(
                      'flex h-14 flex-col items-center justify-center gap-1 border-slate-100 bg-slate-50/50 transition-all px-0',
                      isActive
                        ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-600'
                        : 'hover:border-blue-100 hover:bg-blue-50',
                    )}
                    onClick={() => handleReaction(item.type)}
                  >
                    <span className="text-lg leading-none">{item.emoji}</span>
                    <span className={cn(
                      'text-[10px] font-bold leading-none',
                      isActive ? 'text-white' : 'text-slate-500'
                    )}>
                      {count}
                    </span>
                  </Button>
                );
              })}
            </div>

            <div className="flex flex-row items-stretch gap-0 border-t border-slate-100 bg-slate-50/30 p-0 sm:justify-start">
              <Button
                variant="ghost"
                className="h-11 flex-1 rounded-none text-[11px] font-medium text-slate-400 hover:bg-slate-100 hover:text-red-500"
                onClick={handleReportComplaint}
              >
                신고
              </Button>
              <div className="w-px bg-slate-100" />
              <Button
                variant="ghost"
                className="h-11 flex-1 rounded-none text-[11px] font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                onClick={() => {
                  setAuthMode('edit');
                  setIsAuthModalOpen(true);
                }}
              >
                수정
              </Button>
              <div className="w-px bg-slate-100" />
              <Button
                variant="ghost"
                className="h-11 flex-1 rounded-none text-[11px] font-medium text-slate-400 hover:bg-slate-100 hover:text-red-600"
                onClick={() => {
                  setAuthMode('delete');
                  setIsAuthModalOpen(true);
                }}
              >
                삭제
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AuthPasswordModal
        isOpen={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        onConfirm={handleAuthConfirm}
        title={authMode === 'edit' ? '기록 수정' : '기록 삭제'}
        description="비밀번호를 입력해주세요."
      />

      <EditRecordModal
        record={record}
        isOpen={isEditModalOpen}
        password={verifiedPassword}
        onOpenChange={setIsEditModalOpen}
        onSuccess={() => {
          setIsEditModalOpen(false);
          if (selectedRecordId) void fetchDetail(selectedRecordId);
          void refreshRecords();
          onRefresh?.();
        }}
      />
    </>
  );
};
