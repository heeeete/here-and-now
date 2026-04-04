'use client';

import { useState, useCallback, useRef } from 'react';
import { NaverMap } from '@/src/widgets/map/ui/NaverMap';
import { CreateReportModal } from '@/src/features/report/ui/CreateReportModal';
import { ReportDetailModal } from '@/src/features/report/ui/ReportDetailModal';
import { ReportListSidebar } from '@/src/widgets/sidebar/ui/ReportListSidebar';
import { fetchActiveReports } from '@/src/entities/report/api/fetch-active-reports';
import { Report } from '@/src/entities/report/model/types';

export default function HomePage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  
  // 현재 지도의 영역 정보를 추적하기 위한 Ref
  const currentBoundsRef = useRef<{
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } | null>(null);

  // 디바운스 타이머를 관리하기 위한 Ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 제보 목록 가져오기 (영역 정보가 있으면 필터링)
  const fetchReports = useCallback(async () => {
    const data = await fetchActiveReports(currentBoundsRef.current || undefined);
    setReports((data || []) as Report[]);
  }, []);

  // 지도의 영역이 변경되었을 때 호출되는 핸들러 (디바운스 적용)
  const handleBoundsChange = useCallback((bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }) => {
    currentBoundsRef.current = bounds;
    
    // 이전 타이머가 있다면 취소
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 300ms 후에 데이터 요청 (사용자가 지도를 계속 움직이는 동안은 요청하지 않음)
    debounceTimerRef.current = setTimeout(() => {
      fetchReports();
    }, 300);
  }, [fetchReports]);

  // 핸들러 함수들 메모이제이션
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setSelectedReportId(null);
  }, []);

  const handleMarkerClick = useCallback((reportId: string) => {
    setSelectedReportId(reportId);
    setSelectedLocation(null);
  }, []);

  const handleCreateModalOpenChange = useCallback((open: boolean) => {
    if (!open) setSelectedLocation(null);
  }, []);

  const handleDetailModalOpenChange = useCallback((open: boolean) => {
    if (!open) setSelectedReportId(null);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* 사이드바 영역 */}
      <ReportListSidebar
        reports={reports}
        onReportClick={handleMarkerClick}
        className="hidden md:flex"
      />

      {/* 지도 영역 */}
      <NaverMap
        reports={reports}
        selectedLocation={selectedLocation}
        onMapClick={handleMapClick}
        onMarkerClick={handleMarkerClick}
        onBoundsChange={handleBoundsChange}
        className="h-full w-full"
      />

      {/* 상단 검색바 / 필터 (UI 전용) - 사이드바가 있는 데스크탑에서는 숨김 */}
      <div className="absolute top-4 left-1/2 z-10 w-full max-w-md -translate-x-1/2 px-4 md:hidden">
        <div className="flex h-12 items-center rounded-full bg-white px-6 shadow-lg ring-1 ring-black/5">
          <span className="text-sm font-medium text-slate-500">
            지금 어디의 상황이 궁금하신가요?
          </span>
        </div>
      </div>

      {/* 제보 작성 모달 (우측 하단) */}
      <CreateReportModal
        location={selectedLocation}
        onOpenChange={handleCreateModalOpenChange}
        onSuccess={fetchReports}
      />

      {/* 제보 상세 모달 (우측 하단) */}
      <ReportDetailModal
        reportId={selectedReportId}
        onOpenChange={handleDetailModalOpenChange}
        onRefresh={fetchReports}
      />

      {/* 하단 제보 안내 (도움말) */}
      {!selectedLocation && !selectedReportId && (
        <div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2">
          <div className="rounded-full bg-black/70 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm">
            지도를 클릭하여 지금 이 순간을 제보해보세요!
          </div>
        </div>
      )}
    </div>
  );
}
