import { useState, useEffect, useCallback } from 'react';
import { ReactionType, postReaction } from '@/src/entities/record/api/post-reaction';
import { deleteReaction } from '@/src/entities/record/api/delete-reaction';

export interface SavedReaction {
  id: string;
  type: ReactionType;
}

const REACTIONS_STORAGE_KEY = 'nowhere_user_reactions_v4';
const DEVICE_ID_KEY = 'nowhere_device_id';

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
 * - 낙관적 업데이트(Optimistic Update) 적용으로 빠른 사용자 경험 제공
 */
export const useReaction = (
  recordId: string | null, 
  onUpdate: () => Promise<void>
) => {
  const [userReactions, setUserReactions] = useState<SavedReaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
// 1. 초기 상태 로드
useEffect(() => {
  const loadReactions = () => {
    if (!recordId) {
      setUserReactions([]);
      return;
    }
    const all = JSON.parse(localStorage.getItem(REACTIONS_STORAGE_KEY) || '{}');
    setUserReactions(Array.isArray(all[recordId]) ? all[recordId] : []);
  };
  loadReactions();
}, [recordId]);

// 2. 반응 처리 (낙관적 업데이트 로직)
const handleReaction = useCallback(async (type: ReactionType) => {
  if (!recordId || isProcessing) return;

  const deviceId = getDeviceId();
  const existing = userReactions.find(r => r.type === type);
  const isActive = !!existing;

  // 2-1. UI 즉시 업데이트
  const prevReactions = [...userReactions];
  const newReactions = isActive
    ? userReactions.filter(r => r.type !== type)
    : [...userReactions, { id: 'temp-' + Date.now(), type }];

  setUserReactions(newReactions);
  setIsProcessing(true); // 로딩 시작

  try {
    if (isActive) {
      await deleteReaction({ recordId, deviceId, type });
    } else {
      await postReaction(recordId, type, deviceId);
    }

    // 2-2. 서버 성공 시 로컬 스토리지 최종 동기화
    const all = JSON.parse(localStorage.getItem(REACTIONS_STORAGE_KEY) || '{}');
    all[recordId] = newReactions;
    localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(all));

    // 2-3. 서버 집계 데이터 백그라운드 갱신
    void onUpdate();
  } catch (err) {
    // 2-4. 실패 시 롤백
    console.error('Reaction failed:', err);
    setUserReactions(prevReactions);
    alert('반응 처리에 실패했습니다. 다시 시도해주세요.');
  } finally {
    setIsProcessing(false); // 로딩 종료
  }
}, [recordId, userReactions, isProcessing, onUpdate]);
  return {
    userReactions,
    isProcessing,
    handleReaction
  };
};
