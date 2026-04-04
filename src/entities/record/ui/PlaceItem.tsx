'use client';

import { MapPin } from 'lucide-react';
import { cn } from '@/src/shared/lib/utils';

export interface Place {
  title: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
  category: string;
}

interface PlaceItemProps {
  place: Place;
  onClick: (place: Place) => void;
  className?: string;
}

export const PlaceItem = ({ place, onClick, className }: PlaceItemProps) => {
  return (
    <button
      onClick={() => onClick(place)}
      className={cn(
        'group flex w-full flex-col gap-1 rounded-xl border bg-white p-4 text-left shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50/30 active:scale-[0.98]',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600">
          <MapPin className="size-4" />
        </div>
        <div>
          <h3
            className="font-bold text-slate-800 text-sm"
            dangerouslySetInnerHTML={{ __html: place.title }}
          />
          <p className="text-xs text-slate-500 line-clamp-1">{place.roadAddress || place.address}</p>
          <p className="mt-1 text-[10px] text-slate-400">{place.category}</p>
        </div>
      </div>
    </button>
  );
};
