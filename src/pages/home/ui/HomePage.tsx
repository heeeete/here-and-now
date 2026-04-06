import { NaverMap } from '@/src/widgets/map/ui/NaverMap';
import { CreateRecordModal } from '@/src/features/record/ui/CreateRecordModal';
import { RecordDetailModal } from '@/src/features/record/ui/RecordDetailModal';
import { RecordListSidebar } from '@/src/widgets/sidebar/ui/RecordListSidebar';
import { MobileSearchController, HomeBottomOverlay } from './HomeOverlays';

/**
 * 서비스의 메인 홈 페이지 (Server Component)
 * - PC: 좌측 사이드바 + 지도
 * - 모바일: 상단 플로팅 검색바 + 하단 가로 스크롤 기록 카드 + 전체화면 검색 레이어
 */
export default function HomePage() {
  return (
    <main className="fixed inset-0 flex h-dvh w-full overflow-hidden bg-slate-50">
      {/* 1. PC 전용 사이드바 (Client Component 지만 독립적임) */}
      <RecordListSidebar className="hidden md:flex" />

      {/* 2. 메인 지도 영역 */}
      <div className="relative flex-1 overflow-hidden">
        {/* 2-1. 모바일 전용 상단 플로팅 검색바 (Client Interaction 분리) */}
        <MobileSearchController />

        {/* 2-2. 네이버 지도 (Client Component) */}
        <NaverMap />

        {/* 2-3. 하단 안내 및 모바일 기록 리스트 (Client State 분리) */}
        <HomeBottomOverlay />
      </div>

      {/* 3. 공용 모달들 (모두 각자 내부에서 상태를 구독함) */}
      <CreateRecordModal />
      <RecordDetailModal />
    </main>
  );
}
