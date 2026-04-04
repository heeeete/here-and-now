export interface Record {
  id: string;
  latitude: number;
  longitude: number;
  comment: string;
}

export interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface NaverMapProps {
  records?: Record[];
  selectedLocation?: { lat: number; lng: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerClick?: (recordId: string) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
  className?: string;
}
