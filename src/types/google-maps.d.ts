
declare global {
  interface Window {
    google: typeof google;
    initMap: () => google.maps.Map | undefined;
  }
}

declare namespace google.maps {
  class Map {
    constructor(mapDiv: HTMLElement, opts?: MapOptions);
    setCenter(latLng: LatLng | LatLngLiteral): void;
    getCenter(): LatLng;
    setZoom(zoom: number): void;
    getZoom(): number;
    addControl(control: MVCObject, position?: ControlPosition): void;
    setFog(options: FogOptions): void;
    easeTo(options: EaseToOptions): void;
    on(eventName: string, handler: Function): void;
    scrollZoom: {
      disable(): void;
    };
  }

  interface MapOptions {
    center: LatLng | LatLngLiteral;
    zoom: number;
    pitch?: number;
    projection?: string;
    style?: string;
  }

  interface FogOptions {
    color?: string;
    'high-color'?: string;
    'horizon-blend'?: number;
  }

  interface EaseToOptions {
    center: LatLng | LatLngLiteral;
    duration: number;
    easing: (n: number) => number;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
    toJSON(): LatLngLiteral;
    toString(): string;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  class Marker {
    constructor(opts: MarkerOptions);
    setMap(map: Map | null): void;
    getMap(): Map | null;
  }

  interface MarkerOptions {
    position: LatLng | LatLngLiteral;
    map?: Map;
    title?: string;
    icon?: string;
  }

  class NavigationControl {
    constructor(options?: { visualizePitch?: boolean });
  }

  enum ControlPosition {
    TOP_LEFT,
    TOP_CENTER,
    TOP_RIGHT,
    LEFT_TOP,
    LEFT_CENTER,
    LEFT_BOTTOM,
    RIGHT_TOP,
    RIGHT_CENTER,
    RIGHT_BOTTOM,
    BOTTOM_LEFT,
    BOTTOM_CENTER,
    BOTTOM_RIGHT
  }

  class MVCObject {}
}

export {};
