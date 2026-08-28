export type MapMarkerLayerState = {
  sdkSelected: boolean;
  sdkUser: boolean;
  fallbackSelected: boolean;
  fallbackUser: boolean;
};

export function getMapMarkerLayerState(mapSdkReady: boolean, hasUserPosition: boolean): MapMarkerLayerState {
  return {
    sdkSelected: mapSdkReady,
    sdkUser: mapSdkReady && hasUserPosition,
    fallbackSelected: !mapSdkReady,
    fallbackUser: !mapSdkReady && hasUserPosition,
  };
}

export function shouldRenderFallbackUserMarker(mapSdkReady: boolean, hasUserPosition: boolean) {
  return getMapMarkerLayerState(mapSdkReady, hasUserPosition).fallbackUser;
}

export function shouldRenderSdkUserMarker(mapSdkReady: boolean, hasUserPosition: boolean) {
  return getMapMarkerLayerState(mapSdkReady, hasUserPosition).sdkUser;
}
