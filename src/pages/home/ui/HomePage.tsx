'use client';

import { useCallback, useRef, useMemo } from 'react';
import { NaverMap } from '@/src/widgets/map/ui/NaverMap';
import { CreateRecordModal } from '@/src/features/record/ui/CreateRecordModal';
import { RecordDetailModal } from '@/src/features/record/ui/RecordDetailModal';
import { RecordListSidebar } from '@/src/widgets/sidebar/ui/RecordListSidebar';
import { useRecordStore } from '@/src/entities/record/model/useRecordStore';
import { useMapStore } from '@/src/shared/model/useMapStore';
import { debounce } from '@/src/shared/lib/utils';

/**
 * 서비스의 메인 홈 페이지
 * - 전역 상태(Zustand)를 사용하여 지도의 좌표 및 기록 데이터를 관리합니다.
 */
export default function HomePage() {
  const refreshRecords = useRecordStore((state) => state.refreshRecords);
  const selectedLocation = useMapStore((state) => state.selectedLocation);
  
  // 현재 지도의 영역 정보를 추적하기 위한 Ref (컴포넌트 리렌더링과 무관하게 유지)
  const currentBoundsRef = useRef<{
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } | null>(null);

  // 디바운스된 데이터 새로고침 함수 (500ms)
  const debouncedRefresh = useMemo(
    () => debounce((bounds: { 
      minLat: number; 
      maxLat: number; 
      minLng: number; 
      maxLng: number 
    }) => refreshRecords(bounds), 500),
    [refreshRecords]
  );

  // 지도의 영역이 변경될 때 호출되는 핸들러
  const handleBoundsChange = useCallback((bounds: { 
    minLat: number; 
    maxLat: number; 
    minLng: number; 
    maxLng: number 
  }) => {
    currentBoundsRef.current = bounds;
    debouncedRefresh(bounds);
  }, [debouncedRefresh]);

  return (
    <main className="relative flex h-screen w-full overflow-hidden bg-slate-50">
      {/* 사이드바 - 기록 목록 및 장소 검색 */}
      <RecordListSidebar className="hidden md:flex" />

      {/* 메인 지도 영역 */}
      <div className="relative flex-1">
        <NaverMap onBoundsChange={handleBoundsChange} />

        {/* 하단 안내 레이어 */}
        {!selectedLocation && (
          <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 animate-bounce items-center gap-2 whitespace-nowrap rounded-full bg-slate-900/80 px-4 py-2.5 text-[12px] font-bold text-white shadow-2xl backdrop-blur-md md:px-6 md:py-3 md:text-sm">
            <span>📍 지도를 클릭해 현장을 기록해보세요</span>
          </div>
        )}
      </div>

      {/* 모달 레이어들 - 내부적으로 스토어를 구독하여 동작 */}
      <CreateRecordModal />
      <RecordDetailModal />
    </main>
  );
}
