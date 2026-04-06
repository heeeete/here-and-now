'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { MobileSearchOverlay } from '@/src/features/record/ui/MobileSearchOverlay';
import { MobileRecordCarousel } from '@/src/widgets/record-carousel/ui/MobileRecordCarousel';
import { useMapStore } from '@/src/shared/model/useMapStore';

/**
 * 모바일 전용 검색바 및 검색 레이어 제어
 */
export const MobileSearchController = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <div className="absolute top-4 right-4 left-4 z-10 md:hidden">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex h-12 w-full items-center gap-3 rounded-2xl border bg-white/95 px-4 shadow-xl backdrop-blur-md transition-all active:scale-[0.98]"
        >
          <Search className="size-5 text-slate-400" />
          <span className="text-[15px] font-medium text-slate-400">어디로 이동할까요?</span>
        </button>
      </div>
      {isSearchOpen && <MobileSearchOverlay onClose={() => setIsSearchOpen(false)} />}
    </>
  );
};

/**
 * 지도 하단 오버레이 (안내 문구 + 모바일 카고)
 */
export const HomeBottomOverlay = () => {
  const selectedLocation = useMapStore((state) => state.selectedLocation);

  if (selectedLocation) return null;

  return (
    <>
      <MobileRecordCarousel />
      <div className="pointer-events-none absolute bottom-0 left-1/2 z-10 flex -translate-x-1/2 animate-bounce items-center gap-1.5 rounded-full bg-slate-900/70 px-3 py-1.5 text-[10px] font-bold whitespace-nowrap text-white shadow-lg backdrop-blur-sm md:bottom-6 md:px-4 md:py-2 md:text-[11px]">
        <span>지도를 클릭해 기록해보세요 · 기록은 24시간 후 사라져요</span>
      </div>
    </>
  );
};
