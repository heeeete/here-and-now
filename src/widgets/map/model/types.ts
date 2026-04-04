export interface Report {
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
  reports?: Report[];
  selectedLocation?: { lat: number; lng: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerClick?: (reportId: string) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
  className?: string;
}
