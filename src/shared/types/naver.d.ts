/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  namespace naver {
    namespace maps {
      class Map {
        constructor(element: string | HTMLElement, options: MapOptions);
        setCenter(latlng: LatLng | LatLngLiteral): void;
        getCenter(): LatLng;
        panTo(latlng: LatLng | LatLngLiteral): void;
        addListener(eventName: string, listener: (event: any) => void): MapEventListener;
        getZoom(): number;
        setZoom(zoom: number, effect?: boolean): void;
        getBounds(): LatLngBounds;
        getProjection(): MapSystemProjection;
      }

      class MapSystemProjection {
        fromCoordToOffset(latlng: LatLng): Point;
      }

      interface MapOptions {
        center?: LatLng | LatLngLiteral;
        zoom?: number;
        minZoom?: number;
        maxZoom?: number;
        logoControl?: boolean;
        mapDataControl?: boolean;
        scaleControl?: boolean;
        zoomControl?: boolean;
      }

      class LatLng {
        constructor(lat: number, lng: number);
        lat(): number;
        lng(): number;
      }

      interface LatLngLiteral {
        lat: number;
        lng: number;
      }

      class LatLngBounds {
        getSW(): LatLng;
        getNE(): LatLng;
      }

      class Marker {
        constructor(options: MarkerOptions);
        setMap(map: Map | null): void;
        setPosition(position: LatLng | LatLngLiteral): void;
      }

      interface MarkerOptions {
        position: LatLng | LatLngLiteral;
        map: Map;
        icon?: string | HtmlIcon;
        title?: string;
      }

      interface HtmlIcon {
        content: string;
        size?: Size;
        anchor?: Point;
      }

      interface MapEventListener {
        eventName: string;
        listener: (event: any) => void;
      }

      namespace Event {
        function addListener(target: any, eventName: string, listener: (event: any) => void): MapEventListener;
        function removeListener(listener: MapEventListener): void;
      }

      class Size {
        constructor(width: number, height: number);
      }

      class Point {
        constructor(x: number, y: number);
        x: number;
        y: number;
      }
    }
  }
}

export {};
