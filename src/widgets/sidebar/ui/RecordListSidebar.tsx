'use client';

import * as React from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { Input } from '@/src/shared/ui/input';
import { Button } from '@/src/shared/ui/button';
import { cn } from '@/src/shared/lib/utils';
import { useRecordStore } from '@/src/entities/record/model/useRecordStore';
import { RecordItem } from '@/src/entities/record/ui/RecordItem';
import { PlaceItem } from '@/src/entities/record/ui/PlaceItem';
import { useSearchPlaces } from '@/src/features/record/model/useSearchPlaces';

interface RecordListSidebarProps {
  className?: string;
}

/**
 * 지도에 표시된 기록 목록과 장소 검색 기능을 제공하는 사이드바 위젯입니다. (PC용)
 */
export const RecordListSidebar = ({ className }: RecordListSidebarProps) => {
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    isLoading,
    search,
    selectPlace,
    reset,
    hasSearched,
  } = useSearchPlaces();

  // 검색 모드 판별 (검색어가 있거나, 검색 결과가 있거나, 혹은 막 검색을 수행했거나)
  const isSearchMode = searchTerm !== '' || searchResults.length > 0 || hasSearched;

  const records = useRecordStore((state) => state.records);
  const setSelectedRecordId = useRecordStore((state) => state.setSelectedRecordId);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search(searchTerm);
  };

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-20 flex h-full w-[360px] flex-col border-r border-slate-200/70 bg-white',
        className,
      )}
    >
      <div className="border-b border-slate-100 px-5 pt-6 pb-4">
        <div className="flex items-center gap-2">
          {isSearchMode && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              onClick={reset}
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}

          <div className="min-w-0">
            <h1 className="text-[18px] font-semibold tracking-[-0.02em] text-slate-900">
              {isSearchMode ? '장소 검색' : '실시간 기록'}
            </h1>
            <p className="mt-0.5 text-[12px] text-slate-400">
              {isSearchMode
                ? '장소명이나 주소로 검색할 수 있어요'
                : '현재 지도 영역에 표시된 기록이에요'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative mt-4">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="장소 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 rounded-2xl border-slate-200 bg-slate-50 pr-3 pl-10 text-[14px] shadow-none placeholder:text-slate-400 focus-visible:bg-white"
          />
        </form>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isSearchMode ? (
          <div className="px-3 py-3">
            {isLoading ? (
              <div className="flex min-h-[240px] items-center justify-center">
                <p className="text-[14px] text-slate-400">검색 중...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="flex flex-col gap-2">
                {searchResults.map((place, idx) => (
                  <PlaceItem
                    key={`${place.mapx}-${place.mapy}-${idx}`}
                    place={place}
                    onClick={selectPlace}
                  />
                ))}
              </div>
            ) : hasSearched ? (
              /* 검색을 실제로 수행했는데 결과가 없을 때만 멘트 노출 */
              <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
                <p className="text-[15px] font-medium text-slate-700">검색 결과가 없어요</p>
                <p className="mt-1 text-[13px] leading-5 text-slate-400">
                  다른 장소명이나 주소로 다시 검색해보세요
                </p>
              </div>
            ) : (
              /* 검색 전 (장소 검색 모드에 진입은 했으나 아직 검색어를 입력하지 않았을 때) */
              <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
                <p className="text-[15px] font-medium text-slate-700">궁금한 장소를 검색해보세요</p>
                <p className="mt-1 text-[13px] leading-5 text-slate-400">
                  실시간 현장 상황을 바로 확인할 수 있어요
                </p>
              </div>
            )}
          </div>
        ) : records.length === 0 ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
            <p className="text-[15px] font-medium text-slate-700">표시할 기록이 없어요</p>
            <p className="mt-1 text-[13px] leading-5 text-slate-400">
              현재 지도 영역을 옮기거나 장소를 검색해보세요
            </p>
          </div>
        ) : (
          <div className="flex flex-col px-3 py-3">
            <div className="mb-2 px-2 text-[12px] font-medium text-slate-400">
              기록 {records.length}개
            </div>

            <div className="flex flex-col gap-2">
              {records.map((record) => (
                <RecordItem
                  key={record.id}
                  record={record}
                  onClick={setSelectedRecordId}
                  className="rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
