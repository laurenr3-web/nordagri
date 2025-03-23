
declare namespace google.maps {
  class Map {
    constructor(mapDiv: HTMLElement, opts?: MapOptions);
    setCenter(latLng: LatLng | LatLngLiteral): void;
    setZoom(zoom: number): void;
    setOptions(options: MapOptions): void;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    setMap(map: Map | null): void;
    setPosition(latLng: LatLng | LatLngLiteral): void;
    setTitle(title: string): void;
    setIcon(icon: Icon | string | null): void;
  }

  class Size {
    constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
  }

  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    mapTypeId?: string;
    mapTypeControl?: boolean;
    fullscreenControl?: boolean;
    streetViewControl?: boolean;
  }

  interface MarkerOptions {
    position: LatLng | LatLngLiteral;
    map?: Map;
    title?: string;
    icon?: Icon | string;
  }

  interface Icon {
    url: string;
    scaledSize?: Size;
  }

  interface LatLng {
    lat(): number;
    lng(): number;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  const MapTypeId: {
    ROADMAP: string;
    HYBRID: string;
    SATELLITE: string;
    TERRAIN: string;
  };
}
