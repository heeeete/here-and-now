'use client';

import { Record } from '../model/types';
import { cn } from '@/src/shared/lib/utils';

interface RecordItemProps {
  record: Record;
  onClick: (id: string) => void;
  variant?: 'list' | 'card';
  className?: string;
}

interface ReactionBadgeProps {
  emoji: string;
  count: number;
  className?: string;
}

const ReactionBadge = ({ emoji, count, className }: ReactionBadgeProps) => {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-medium text-slate-700',
        className,
      )}
    >
      <span>{emoji}</span>
      <span>{count}</span>
    </span>
  );
};

export const RecordItem = ({ record, onClick, variant = 'list', className }: RecordItemProps) => {
  const date = new Date(record.created_at);

  const timeString = new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  const isCard = variant === 'card';

  return (
    <button
      onClick={() => onClick(record.id)}
      className={cn(
        'w-full text-left transition-all duration-200 active:scale-[0.985]',
        isCard
          ? 'flex w-[280px] shrink-0 flex-col rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-0.5'
          : 'flex flex-col border-b border-slate-100 bg-white px-4 py-4 hover:bg-slate-50/70',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-400 tabular-nums">{timeString}</span>
      </div>

      <p
        className={cn(
          'mt-2 tracking-[-0.02em] break-words text-slate-900',
          isCard
            ? 'line-clamp-3 text-[15px] leading-6 font-semibold'
            : 'line-clamp-2 text-[14px] leading-6 font-medium',
        )}
      >
        {record.comment}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ReactionBadge emoji="❤️" count={record.like_count} />
        <ReactionBadge emoji="😮" count={record.amazing_count} />
        <ReactionBadge emoji="😂" count={record.funny_count} />
        <ReactionBadge emoji="😢" count={record.sad_count} />
      </div>
    </button>
  );
};
