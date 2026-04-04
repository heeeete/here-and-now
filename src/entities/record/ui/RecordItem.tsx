'use client';

import { Record } from '../model/types';
import { cn } from '@/src/shared/lib/utils';

interface RecordItemProps {
  record: Record;
  onClick: (id: string) => void;
  variant?: 'list' | 'card';
  className?: string;
}

export const RecordItem = ({ record, onClick, variant = 'list', className }: RecordItemProps) => {
  const date = new Date(record.created_at);
  const timeString = new Intl.DateTimeFormat('ko-KR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  }).format(date);

  // 공통 서브 텍스트 스타일
  const subTextStyle = "text-[11px] font-bold text-blue-600";
  const timeTextStyle = "text-[10px] font-medium text-slate-400";
  const commentTextStyle = "line-clamp-2 text-[13px] leading-relaxed font-bold text-slate-700";
  const reactionTextStyle = "text-[10px] font-bold";

  if (variant === 'card') {
    // 모바일 하단 가로 스크롤용 카드 디자인
    return (
      <button
        onClick={() => onClick(record.id)}
        className={cn(
          'flex w-[280px] shrink-0 flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-lg transition-all active:scale-95',
          className
        )}
      >
        <div className="flex items-center justify-between">
          <span className={subTextStyle}>실시간 기록</span>
          <span className={timeTextStyle}>{timeString}</span>
        </div>
        <p className={commentTextStyle}>
          {record.comment}
        </p>
        <div className="mt-1 flex items-center gap-3">
          {record.like_count > 0 && (
            <span className={cn(reactionTextStyle, "text-blue-500")}>❤️ {record.like_count}</span>
          )}
          {record.amazing_count > 0 && (
            <span className={cn(reactionTextStyle, "text-yellow-500")}>😮 {record.amazing_count}</span>
          )}
          {record.funny_count > 0 && (
            <span className={cn(reactionTextStyle, "text-green-500")}>😂 {record.funny_count}</span>
          )}
          {record.sad_count > 0 && (
            <span className={cn(reactionTextStyle, "text-slate-500")}>😢 {record.sad_count}</span>
          )}
        </div>
      </button>
    );
  }

  // 기본 리스트형 (PC 사이드바용)
  return (
    <button
      onClick={() => onClick(record.id)}
      className={cn(
        'group flex w-full flex-col gap-2 border-b border-slate-50 bg-white p-4 text-left transition-all hover:bg-blue-50/30 active:scale-[0.98]',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className={subTextStyle}>실시간 기록</span>
        <span className={timeTextStyle}>{timeString}</span>
      </div>
      <p className={commentTextStyle}>
        {record.comment}
      </p>
      <div className="mt-1 flex items-center gap-3">
        {record.like_count > 0 && (
          <span className={cn(reactionTextStyle, "text-blue-500")}>❤️ {record.like_count}</span>
        )}
        {record.amazing_count > 0 && (
          <span className={cn(reactionTextStyle, "text-yellow-500")}>😮 {record.amazing_count}</span>
        )}
        {record.funny_count > 0 && (
          <span className={cn(reactionTextStyle, "text-green-500")}>😂 {record.funny_count}</span>
        )}
        {record.sad_count > 0 && (
          <span className={cn(reactionTextStyle, "text-slate-500")}>😢 {record.sad_count}</span>
        )}
      </div>
    </button>
  );
};
