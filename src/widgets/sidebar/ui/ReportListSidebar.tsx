'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/src/shared/ui/input';
import { Report } from '@/src/entities/report/model/types';
import { cn } from '@/src/shared/lib/utils';

interface ReportListSidebarProps {
  reports: Report[];
  onReportClick: (id: string) => void;
  className?: string;
}

/**
 * 지도에 표시된 제보 목록과 검색 기능을 제공하는 사이드바 위젯입니다.
 */
export const ReportListSidebar = ({
  reports,
  onReportClick,
  className,
}: ReportListSidebarProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // 검색어에 따른 필터링된 목록
  const filteredReports = useMemo(() => {
    if (!searchTerm.trim()) return reports;

    const term = searchTerm.toLowerCase();
    return reports.filter((report) => report.comment.toLowerCase().includes(term));
  }, [reports, searchTerm]);

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-20 flex h-full w-[360px] flex-col bg-white/95 shadow-2xl backdrop-blur-md transition-transform',
        className,
      )}
    >
      {/* 헤더 영역: 검색창 */}
      <div className="flex flex-col gap-4 border-b p-6 pt-10">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">실시간 제보 현황</h1>
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="제보 내용 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 pl-10"
          />
        </div>
      </div>

      {/* 목록 영역 */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto p-4">
        {filteredReports.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-center text-slate-400">
            <p className="text-sm">현재 영역에 제보가 없거나</p>
            <p className="text-sm">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredReports.map((report) => {
              const date = new Date(report.created_at);
              const timeString = new Intl.DateTimeFormat('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              }).format(date);

              return (
                <button
                  key={report.id}
                  onClick={() => onReportClick(report.id)}
                  className="group flex w-full flex-col gap-2 rounded-xl border bg-white p-4 text-left shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">실시간 제보</span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">{timeString}</span>
                  </div>
                  <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">
                    {report.comment}
                  </p>

                  {/* 반응 집계 (간략히) */}
                  <div className="mt-1 flex items-center gap-3">
                    {report.helpful_count > 0 && (
                      <span className="text-[11px] text-blue-500">
                        도움돼요 {report.helpful_count}
                      </span>
                    )}
                    {report.still_valid_count > 0 && (
                      <span className="text-[11px] text-green-500">
                        유효함 {report.still_valid_count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
