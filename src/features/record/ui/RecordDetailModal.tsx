'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/ui/dialog';
import { Button } from '@/src/shared/ui/button';
import { fetchRecordById } from '@/src/entities/record/api/fetch-record-by-id';
import { ReactionType } from '@/src/entities/record/api/post-reaction';
import { postRecordComplaint } from '@/src/entities/record/api/post-record-complaint';
import { deleteRecord } from '@/src/entities/record/api/delete-record';
import { Record } from '@/src/entities/record/model/types';
import { useRecordStore } from '@/src/entities/record/model/useRecordStore';
import { useMapStore } from '@/src/shared/model/useMapStore';
import { useReaction } from '@/src/features/record/model/useReaction';
import { AuthPasswordModal } from './AuthPasswordModal';
import { EditRecordModal } from './EditRecordModal';
import { cn, formatRelativeTime } from '@/src/shared/lib/utils';

interface RecordDetailModalProps {
  onRefresh?: () => void;
}

const REACTION_LIST: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'like', emoji: '❤️', label: '좋아요' },
  { type: 'amazing', emoji: '😮', label: '놀라워요' },
  { type: 'funny', emoji: '😂', label: '웃겨요' },
  { type: 'sad', emoji: '😢', label: '슬퍼요' },
];

/**
 * 모달 내부에 표시될 개별 기록 아이템 컴포넌트
 */
const RecordDetailItem = ({ 
  record: initialRecord, 
  onRefresh 
}: { 
  record: Record; 
  onRefresh?: () => void 
}) => {
  const [record, setRecord] = useState<Record>(initialRecord);
  const refreshRecords = useRecordStore((state) => state.refreshRecords);
  const updateRecord = useRecordStore((state) => state.updateRecord);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'edit' | 'delete' | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [verifiedPassword, setVerifiedPassword] = useState('');

  const fetchLatest = useCallback(async () => {
    const data = await fetchRecordById(record.id);
    if (data) {
      setRecord(data);
      updateRecord(record.id, data);
    }
  }, [record.id, updateRecord]);

  const { userReactions, isProcessing, handleReaction } = useReaction(record.id, fetchLatest);

  const handleReportComplaint = async () => {
    if (!confirm('이 기록을 신고하시겠습니까?')) return;
    try {
      await postRecordComplaint(record.id);
      alert('신고가 접수되었습니다.');
    } catch {
      alert('신고 중 오류가 발생했습니다.');
    }
  };

  const handleAuthConfirm = async (password: string) => {
    try {
      if (authMode === 'delete') {
        if (!confirm('정말로 이 기록을 삭제하시겠습니까?')) return;
        await deleteRecord(record.id, password);
        alert('삭제되었습니다.');
        setIsAuthModalOpen(false);
        void refreshRecords();
        onRefresh?.();
      } else if (authMode === 'edit') {
        const { postVerifyPassword } = await import('@/src/entities/record/api/post-verify-password');
        await postVerifyPassword(record.id, password);
        setVerifiedPassword(password);
        setIsAuthModalOpen(false);
        setIsEditModalOpen(true);
      }
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : '비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div className="flex flex-col border-b border-slate-100 last:border-0">
      <div className="p-5 pb-0">
        <p className="text-[10px] font-bold text-blue-600 mb-1">
          {formatRelativeTime(record.created_at)}
        </p>
        <h3 className="text-[15px] leading-snug font-bold text-slate-900 break-words">
          {record.comment}
        </h3>
      </div>

      <div className="grid grid-cols-4 gap-1.5 p-5 pt-4">
        {REACTION_LIST.map((item) => {
          const isActive = userReactions.some((r) => r.type === item.type);
          const countKey = `${item.type}_count` as keyof Record;
          const count = (record[countKey] as number) || 0;

          return (
            <Button
              key={item.type}
              variant={isActive ? 'default' : 'outline'}
              disabled={isProcessing}
              className={cn(
                'flex h-12 flex-col items-center justify-center gap-0.5 border-slate-100 bg-slate-50/50 px-0 transition-all',
                isActive
                  ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-600'
                  : 'hover:border-blue-100 hover:bg-blue-50',
              )}
              onClick={() => handleReaction(item.type)}
            >
              <span className="text-base leading-none">{item.emoji}</span>
              <span className={cn('text-[9px] font-bold', isActive ? 'text-white' : 'text-slate-500')}>
                {count}
              </span>
            </Button>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-1 px-5 pb-4">
        <Button
          variant="ghost"
          className="h-7 px-2 text-[10px] font-bold text-slate-400 hover:text-red-500"
          onClick={handleReportComplaint}
        >
          신고
        </Button>
        <Button
          variant="ghost"
          className="h-7 px-2 text-[10px] font-bold text-slate-400 hover:text-slate-900"
          onClick={() => {
            setAuthMode('edit');
            setIsAuthModalOpen(true);
          }}
        >
          수정
        </Button>
        <Button
          variant="ghost"
          className="h-7 px-2 text-[10px] font-bold text-slate-400 hover:text-red-600"
          onClick={() => {
            setAuthMode('delete');
            setIsAuthModalOpen(true);
          }}
        >
          삭제
        </Button>
      </div>

      <AuthPasswordModal
        isOpen={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        onConfirm={handleAuthConfirm}
        title={authMode === 'edit' ? '기록 수정' : '기록 삭제'}
        description="비밀번호를 입력해주세요."
        isDelete={authMode === 'delete'}
      />

      <EditRecordModal
        record={record}
        isOpen={isEditModalOpen}
        password={verifiedPassword}
        onOpenChange={setIsEditModalOpen}
        onSuccess={() => {
          setIsEditModalOpen(false);
          void fetchLatest();
          onRefresh?.();
        }}
      />
    </div>
  );
};

export const RecordDetailModal = ({ onRefresh }: RecordDetailModalProps) => {
  const records = useRecordStore((state) => state.records);
  const isLoading = useRecordStore((state) => state.isLoading);
  const selectedRecordId = useRecordStore((state) => state.selectedRecordId);
  const setSelectedRecordId = useRecordStore((state) => state.setSelectedRecordId);
  const setSelectedLocation = useMapStore((state) => state.setSelectedLocation);

  // 선택된 기록과 동일한 좌표를 가진 모든 기록 찾기
  const relatedRecords = useMemo(() => {
    if (!selectedRecordId) return [];
    const mainRecord = records.find((r) => r.id === selectedRecordId);
    
    // 만약 선택된 ID의 기록이 없으면, 같은 좌표의 다른 기록이라도 있는지 확인해야 함
    // (삭제 시나리오 대응)
    if (!mainRecord) {
      return [];
    }

    return records
      .filter((r) => r.latitude === mainRecord.latitude && r.longitude === mainRecord.longitude)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // 최신순
  }, [selectedRecordId, records]);

  // 데이터 업데이트 후 보여줄 기록이 없으면 모달 닫기
  useEffect(() => {
    if (selectedRecordId && !isLoading && relatedRecords.length === 0) {
      setSelectedRecordId(null);
    }
  }, [selectedRecordId, isLoading, relatedRecords.length, setSelectedRecordId]);

  const handleCreateHere = () => {
    if (relatedRecords.length === 0) return;
    const { latitude, longitude } = relatedRecords[0];
    setSelectedLocation({ lat: latitude, lng: longitude });
    setSelectedRecordId(null);
  };

  if (!selectedRecordId) return null;

  return (
    <Dialog open={!!selectedRecordId} onOpenChange={(open) => !open && setSelectedRecordId(null)}>
      <DialogContent className="fixed top-auto right-4 bottom-4 left-1/2 flex max-h-[85vh] w-[calc(100%-2rem)] -translate-x-1/2 translate-y-0 flex-col overflow-hidden border-0 p-0 sm:max-w-[360px] md:right-4 md:left-auto md:translate-x-0">
        <DialogHeader className="shrink-0 border-b bg-white p-4">
          <DialogTitle className="text-sm font-bold text-slate-900">
            이 위치의 기록 <span className="text-blue-600">{relatedRecords.length}</span>개
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto bg-white">
          {relatedRecords.map((record) => (
            <RecordDetailItem key={record.id} record={record} onRefresh={onRefresh} />
          ))}
        </div>

        <div className="shrink-0 p-2 bg-slate-50 border-t">
          <Button className="w-full h-11 rounded-xl font-bold shadow-lg" onClick={handleCreateHere}>
            나도 여기에 기록하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
