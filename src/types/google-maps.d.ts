
declare global {
  interface Window {
    initMap: () => google.maps.Map | undefined;
  }
}

export {};
