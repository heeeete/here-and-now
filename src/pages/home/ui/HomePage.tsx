'use client';

import { useCallback, useRef } from 'react';
import { NaverMap } from '@/src/widgets/map/ui/NaverMap';
import { CreateRecordModal } from '@/src/features/record/ui/CreateRecordModal';
import { RecordDetailModal } from '@/src/features/record/ui/RecordDetailModal';
import { RecordListSidebar } from '@/src/widgets/sidebar/ui/RecordListSidebar';
import { useRecordStore } from '@/src/entities/record/model/useRecordStore';

/**
 * 서비스의 메인 홈 페이지
 * - 전역 상태(Zustand)를 사용하여 지도의 좌표 및 기록 데이터를 관리합니다.
 */
export default function HomePage() {
  const { refreshRecords } = useRecordStore();
  
  // 현재 지도의 영역 정보를 추적하기 위한 Ref (컴포넌트 리렌더링과 무관하게 유지)
  const currentBoundsRef = useRef<{
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } | null>(null);

  // 지도의 영역이 변경될 때 호출되는 핸들러
  const handleBoundsChange = useCallback((bounds: { 
    minLat: number; 
    maxLat: number; 
    minLng: number; 
    maxLng: number 
  }) => {
    currentBoundsRef.current = bounds;
    void refreshRecords(bounds);
  }, [refreshRecords]);

  return (
    <main className="relative flex h-screen w-full overflow-hidden bg-slate-50">
      {/* 사이드바 - 기록 목록 및 장소 검색 */}
      <RecordListSidebar className="hidden md:flex" />

      {/* 메인 지도 영역 */}
      <div className="relative flex-1">
        <NaverMap onBoundsChange={handleBoundsChange} />
      </div>

      {/* 모달 레이어들 - 내부적으로 스토어를 구독하여 동작 */}
      <CreateRecordModal />
      <RecordDetailModal />
    </main>
  );
}
