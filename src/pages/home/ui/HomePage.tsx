'use client';

import { useCallback, useRef, useMemo, useState } from 'react';
import { NaverMap } from '@/src/widgets/map/ui/NaverMap';
import { CreateRecordModal } from '@/src/features/record/ui/CreateRecordModal';
import { RecordDetailModal } from '@/src/features/record/ui/RecordDetailModal';
import { RecordListSidebar } from '@/src/widgets/sidebar/ui/RecordListSidebar';
import { MobileSearchOverlay } from '@/src/features/record/ui/MobileSearchOverlay';
import { MobileRecordCarousel } from '@/src/widgets/record-carousel/ui/MobileRecordCarousel';
import { useRecordStore } from '@/src/entities/record/model/useRecordStore';
import { useMapStore } from '@/src/shared/model/useMapStore';
import { debounce } from '@/src/shared/lib/utils';
import { Search } from 'lucide-react';

/**
 * 서비스의 메인 홈 페이지
 * - PC: 좌측 사이드바 + 지도
 * - 모바일: 상단 플로팅 검색바 + 하단 가로 스크롤 기록 카드 + 전체화면 검색 레이어
 */
export default function HomePage() {
  const refreshRecords = useRecordStore((state) => state.refreshRecords);
  const selectedLocation = useMapStore((state) => state.selectedLocation);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // 현재 지도의 영역 정보를 추적하기 위한 Ref
  const currentBoundsRef = useRef<{
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } | null>(null);

  const debouncedRefresh = useMemo(
    () =>
      debounce(
        (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) =>
          refreshRecords(bounds),
        500,
      ),
    [refreshRecords],
  );

  const handleBoundsChange = useCallback(
    (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => {
      currentBoundsRef.current = bounds;
      debouncedRefresh(bounds);
    },
    [debouncedRefresh],
  );

  return (
    <main className="fixed inset-0 flex h-dvh w-full overflow-hidden bg-slate-50">
      {/* 1. PC 전용 사이드바 */}
      <RecordListSidebar className="hidden md:flex" />

      {/* 2. 메인 지도 영역 */}
      <div className="relative flex-1 overflow-hidden">
        {/* 2-1. 모바일 전용 상단 플로팅 검색바 */}
        <div className="absolute top-4 right-4 left-4 z-10 md:hidden">
          <button
            onClick={() => setIsMobileSearchOpen(true)}
            className="flex h-12 w-full items-center gap-3 rounded-2xl border bg-white/95 px-4 shadow-xl backdrop-blur-md transition-all active:scale-[0.98]"
          >
            <Search className="size-5 text-slate-400" />
            <span className="text-[15px] font-medium text-slate-400">어디로 이동할까요?</span>
          </button>
        </div>

        <NaverMap onBoundsChange={handleBoundsChange} />

        {/* 2-2. 모바일 전용 하단 가로 스크롤 기록 목록 */}
        {!selectedLocation && <MobileRecordCarousel />}

        {/* 하단 안내 레이어 */}
        {!selectedLocation && (
          <div className="pointer-events-none absolute bottom-48 left-1/2 z-10 flex -translate-x-1/2 animate-bounce items-center gap-1.5 rounded-full bg-slate-900/70 px-3 py-1.5 text-[10px] font-bold whitespace-nowrap text-white shadow-lg backdrop-blur-sm md:bottom-6 md:px-4 md:py-2 md:text-[11px]">
            <span>지도를 클릭해 기록해보세요</span>
          </div>
        )}
      </div>

      {/* 3. 모달 및 레이어들 */}

      {/* 3-1. 모바일 전용 전체 화면 검색 레이어 */}
      {isMobileSearchOpen && <MobileSearchOverlay onClose={() => setIsMobileSearchOpen(false)} />}

      {/* 3-2. 공용 모달들 */}
      <CreateRecordModal />
      <RecordDetailModal />
    </main>
  );
}
