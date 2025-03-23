
// Type definitions for Google Maps JavaScript API 3.47
declare interface Window {
  google: typeof google;
  initGoogleMapsCallback?: () => void;
}

declare namespace google.maps {
  class Map {
    constructor(mapDiv: Element, opts?: MapOptions);
    fitBounds(bounds: LatLngBounds | LatLngBoundsLiteral, padding?: number | Padding): void;
    getBounds(): LatLngBounds;
    getCenter(): LatLng;
    getDiv(): Element;
    getHeading(): number;
    getMapTypeId(): MapTypeId;
    getProjection(): Projection;
    getStreetView(): StreetViewPanorama;
    getTilt(): number;
    getZoom(): number;
    panBy(x: number, y: number): void;
    panTo(latLng: LatLng | LatLngLiteral): void;
    panToBounds(latLngBounds: LatLngBounds | LatLngBoundsLiteral, padding?: number | Padding): void;
    setCenter(latlng: LatLng | LatLngLiteral): void;
    setHeading(heading: number): void;
    setMapTypeId(mapTypeId: MapTypeId): void;
    setOptions(options: MapOptions): void;
    setStreetView(panorama: StreetViewPanorama): void;
    setTilt(tilt: number): void;
    setZoom(zoom: number): void;
  }
  
  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    mapTypeId?: MapTypeId;
    mapTypeControl?: boolean;
    fullscreenControl?: boolean;
  }

  class LatLng {
    constructor(lat: number, lng: number, noWrap?: boolean);
    equals(other: LatLng): boolean;
    lat(): number;
    lng(): number;
    toString(): string;
    toUrlValue(precision?: number): string;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface LatLngBoundsLiteral {
    east: number;
    north: number;
    south: number;
    west: number;
  }

  class LatLngBounds {
    constructor(sw?: LatLng | LatLngLiteral, ne?: LatLng | LatLngLiteral);
    contains(latLng: LatLng | LatLngLiteral): boolean;
    equals(other: LatLngBounds | LatLngBoundsLiteral): boolean;
    extend(point: LatLng | LatLngLiteral): LatLngBounds;
    getCenter(): LatLng;
    getNorthEast(): LatLng;
    getSouthWest(): LatLng;
    intersects(other: LatLngBounds | LatLngBoundsLiteral): boolean;
    isEmpty(): boolean;
    toSpan(): LatLng;
    toString(): string;
    toUrlValue(precision?: number): string;
    union(other: LatLngBounds | LatLngBoundsLiteral): LatLngBounds;
  }

  interface Padding {
    bottom: number;
    left: number;
    right: number;
    top: number;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    getAnimation(): Animation;
    getClickable(): boolean;
    getCursor(): string;
    getDraggable(): boolean;
    getIcon(): string | Icon | Symbol;
    getLabel(): MarkerLabel;
    getMap(): Map | StreetViewPanorama;
    getOpacity(): number;
    getPosition(): LatLng | undefined;
    getShape(): MarkerShape;
    getTitle(): string;
    getVisible(): boolean;
    getZIndex(): number;
    setAnimation(animation: Animation | null): void;
    setClickable(flag: boolean): void;
    setCursor(cursor: string): void;
    setDraggable(flag: boolean): void;
    setIcon(icon: string | Icon | Symbol): void;
    setLabel(label: string | MarkerLabel): void;
    setMap(map: Map | StreetViewPanorama | null): void;
    setOpacity(opacity: number): void;
    setOptions(options: MarkerOptions): void;
    setPosition(latlng: LatLng | LatLngLiteral): void;
    setShape(shape: MarkerShape): void;
    setTitle(title: string): void;
    setVisible(visible: boolean): void;
    setZIndex(zIndex: number): void;
  }

  interface MarkerOptions {
    position: LatLng | LatLngLiteral;
    title?: string;
    map?: Map | StreetViewPanorama;
    icon?: string | Icon | Symbol;
    label?: string | MarkerLabel;
    clickable?: boolean;
    crossOnDrag?: boolean;
    cursor?: string;
    draggable?: boolean;
    opacity?: number;
    optimized?: boolean;
    shape?: MarkerShape;
    visible?: boolean;
    zIndex?: number;
  }

  interface Icon {
    url: string;
    anchor?: Point;
    labelOrigin?: Point;
    origin?: Point;
    scaledSize?: Size;
    size?: Size;
  }

  interface MarkerLabel {
    text: string;
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
  }

  interface MarkerShape {
    coords: number[];
    type: string;
  }

  class SymbolPath {
    static BACKWARD_CLOSED_ARROW: number;
    static BACKWARD_OPEN_ARROW: number;
    static CIRCLE: number;
    static FORWARD_CLOSED_ARROW: number;
    static FORWARD_OPEN_ARROW: number;
  }

  interface Symbol {
    anchor?: Point;
    fillColor?: string;
    fillOpacity?: number;
    labelOrigin?: Point;
    path: SymbolPath | string;
    rotation?: number;
    scale?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
  }

  enum MapTypeId {
    HYBRID = 'hybrid',
    ROADMAP = 'roadmap',
    SATELLITE = 'satellite',
    TERRAIN = 'terrain'
  }

  class Point {
    constructor(x: number, y: number);
    x: number;
    y: number;
    equals(other: Point): boolean;
    toString(): string;
  }

  class Size {
    constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
    height: number;
    width: number;
    equals(other: Size): boolean;
    toString(): string;
  }

  class Circle {
    constructor(opts?: CircleOptions);
    getBounds(): LatLngBounds;
    getCenter(): LatLng;
    getDraggable(): boolean;
    getEditable(): boolean;
    getMap(): Map;
    getRadius(): number;
    getVisible(): boolean;
    setCenter(center: LatLng | LatLngLiteral): void;
    setDraggable(draggable: boolean): void;
    setEditable(editable: boolean): void;
    setMap(map: Map | null): void;
    setOptions(options: CircleOptions): void;
    setRadius(radius: number): void;
    setVisible(visible: boolean): void;
  }

  interface CircleOptions {
    center?: LatLng | LatLngLiteral;
    clickable?: boolean;
    draggable?: boolean;
    editable?: boolean;
    fillColor?: string;
    fillOpacity?: number;
    map?: Map;
    radius?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokePosition?: StrokePosition;
    strokeWeight?: number;
    visible?: boolean;
    zIndex?: number;
  }

  enum StrokePosition {
    CENTER,
    INSIDE,
    OUTSIDE
  }

  class Polygon {
    constructor(opts?: PolygonOptions);
    getDraggable(): boolean;
    getEditable(): boolean;
    getMap(): Map;
    getPath(): MVCArray<LatLng>;
    getPaths(): MVCArray<MVCArray<LatLng>>;
    getVisible(): boolean;
    setDraggable(draggable: boolean): void;
    setEditable(editable: boolean): void;
    setMap(map: Map | null): void;
    setOptions(options: PolygonOptions): void;
    setPath(path: MVCArray<LatLng> | LatLng[] | LatLngLiteral[]): void;
    setPaths(paths: MVCArray<MVCArray<LatLng>> | MVCArray<LatLng> | LatLng[][] | LatLngLiteral[][] | LatLng[] | LatLngLiteral[]): void;
    setVisible(visible: boolean): void;
  }

  interface PolygonOptions {
    clickable?: boolean;
    draggable?: boolean;
    editable?: boolean;
    fillColor?: string;
    fillOpacity?: number;
    map?: Map;
    paths?: MVCArray<MVCArray<LatLng>> | MVCArray<LatLng> | LatLng[][] | LatLngLiteral[][] | LatLng[] | LatLngLiteral[];
    strokeColor?: string;
    strokeOpacity?: number;
    strokePosition?: StrokePosition;
    strokeWeight?: number;
    visible?: boolean;
    zIndex?: number;
  }

  class MVCArray<T> {
    constructor(array?: T[]);
    clear(): void;
    forEach(callback: (elem: T, i: number) => void): void;
    getArray(): T[];
    getAt(i: number): T;
    getLength(): number;
    insertAt(i: number, elem: T): void;
    pop(): T;
    push(elem: T): number;
    removeAt(i: number): T;
    setAt(i: number, elem: T): void;
  }

  abstract class MVCObject {
    constructor();
    addListener(eventName: string, handler: (...args: any[]) => void): MapsEventListener;
    bindTo(key: string, target: MVCObject, targetKey?: string, noNotify?: boolean): void;
    get(key: string): any;
    notify(key: string): void;
    set(key: string, value: any): void;
    setValues(values: object): void;
    unbind(key: string): void;
    unbindAll(): void;
  }

  interface MapsEventListener {
    remove(): void;
  }

  interface Projection {
    fromLatLngToPoint(latLng: LatLng, point?: Point): Point;
    fromPointToLatLng(pixel: Point, noWrap?: boolean): LatLng;
  }

  class StreetViewPanorama {
    constructor(container: Element, opts?: StreetViewPanoramaOptions);
    controls: MVCArray<Node>[];
  }

  interface StreetViewPanoramaOptions {
    addressControl?: boolean;
    addressControlOptions?: StreetViewAddressControlOptions;
    clickToGo?: boolean;
    disableDefaultUI?: boolean;
    disableDoubleClickZoom?: boolean;
    enableCloseButton?: boolean;
    imageDateControl?: boolean;
    linksControl?: boolean;
    panControl?: boolean;
    panControlOptions?: PanControlOptions;
    pano?: string;
    panoProvider?: (pano: string) => StreetViewPanoramaData;
    position?: LatLng | LatLngLiteral;
    pov?: StreetViewPov;
    scrollwheel?: boolean;
    visible?: boolean;
    zoom?: number;
    zoomControl?: boolean;
    zoomControlOptions?: ZoomControlOptions;
  }

  interface StreetViewAddressControlOptions {
    position?: ControlPosition;
  }

  interface PanControlOptions {
    position?: ControlPosition;
  }

  interface StreetViewPanoramaData {
    copyright?: string;
    imageDate?: string;
    links?: StreetViewLink[];
    location?: StreetViewLocation;
    tiles?: StreetViewTileData;
  }

  interface StreetViewLink {
    description?: string;
    heading?: number;
    pano?: string;
  }

  interface StreetViewLocation {
    description?: string;
    latLng?: LatLng;
    pano?: string;
    shortDescription?: string;
  }

  interface StreetViewTileData {
    centerHeading?: number;
    tileSize?: Size;
    worldSize?: Size;
  }

  interface StreetViewPov {
    heading?: number;
    pitch?: number;
  }

  interface ZoomControlOptions {
    position?: ControlPosition;
  }

  enum ControlPosition {
    BOTTOM_CENTER,
    BOTTOM_LEFT,
    BOTTOM_RIGHT,
    LEFT_BOTTOM,
    LEFT_CENTER,
    LEFT_TOP,
    RIGHT_BOTTOM,
    RIGHT_CENTER,
    RIGHT_TOP,
    TOP_CENTER,
    TOP_LEFT,
    TOP_RIGHT
  }
}
