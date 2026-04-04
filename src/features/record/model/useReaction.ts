import { useState, useEffect, useCallback } from 'react';
import { ReactionType, postReaction } from '@/src/entities/record/api/post-reaction';
import { deleteReaction } from '@/src/entities/record/api/delete-reaction';
import { Record } from '@/src/entities/record/model/types';

interface SavedReaction {
  id: string;
  type: ReactionType;
}

const REACTIONS_STORAGE_KEY = 'nowhere_user_reactions_v3';
const DEVICE_ID_KEY = 'nowhere_device_id';

// 기기 ID 헬퍼 (내부용)
const getDeviceId = () => {
  if (typeof window === 'undefined') return '';
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

/**
 * 기록에 대한 반응(좋아요 등) 로직을 관리하는 훅
 */
export const useReaction = (recordId: string | null, initialRecord: Record | null) => {
  const [userReaction, setUserReaction] = useState<SavedReaction | null>(null);
  const [record, setRecord] = useState<Record | null>(initialRecord);
  const [isProcessing, setIsProcessing] = useState(false);

  // 초기 레코드 동기화
  useEffect(() => {
    setRecord(initialRecord);
  }, [initialRecord]);

  // 로컬 스토리지에서 내 반응 정보 로드
  useEffect(() => {
    if (!recordId) {
      setUserReaction(null);
      return;
    }
    const reactions = JSON.parse(localStorage.getItem(REACTIONS_STORAGE_KEY) || '{}');
    setUserReaction(reactions[recordId] || null);
  }, [recordId]);

  const handleReaction = useCallback(async (type: ReactionType) => {
    if (!recordId || !record || isProcessing) return;

    const reactions = JSON.parse(localStorage.getItem(REACTIONS_STORAGE_KEY) || '{}');
    const existing = reactions[recordId] as SavedReaction | undefined;
    const deviceId = getDeviceId();

    setIsProcessing(true);
    try {
      // 1. 토글 취소
      if (existing && existing.type === type) {
        await deleteReaction({ recordId, deviceId });
        delete reactions[recordId];
        localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(reactions));
        setUserReaction(null);
        
        setRecord(prev => {
          if (!prev) return null;
          const countKey = `${type}_count` as keyof Record;
          return { ...prev, [countKey]: Math.max(0, (prev[countKey] as number) - 1) };
        });
        return;
      }

      // 2. 수정 또는 신규
      await deleteReaction({ recordId, deviceId });
      const newReaction = await postReaction(recordId, type, deviceId);
      
      if (!newReaction) throw new Error('반응 등록 실패');

      const savedData: SavedReaction = { id: newReaction.id, type };
      reactions[recordId] = savedData;
      localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(reactions));
      setUserReaction(savedData);

      // 낙관적 업데이트
      setRecord(prev => {
        if (!prev) return null;
        
        const updates: Partial<Record> = {};
        if (existing) {
          const oldKey = `${existing.type}_count` as keyof Record;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (updates as any)[oldKey] = Math.max(0, (prev[oldKey] as number) - 1);
        }
        const newKey = `${type}_count` as keyof Record;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (updates as any)[newKey] = ((prev[newKey] as number) || 0) + 1;
        
        return { ...prev, ...updates };
      });

    } catch (err) {
      console.error('Reaction error:', err);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [recordId, record, isProcessing]);

  return {
    record,
    setRecord,
    userReaction,
    isProcessing,
    handleReaction
  };
};
