import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { GOOGLE_MAPS_API_KEY, hasGoogleMapsApiKey } from '../../config/googleMaps';
import { DEFAULT_CITY_CENTER } from '../../data/passenger';
import { getRegionFromCoordinates } from '../../services/maps/geometry';
import { Coordinates } from '../../types/passenger';

export interface RouteMapCameraRef {
  fitBounds: (
    ne: [number, number],
    sw: [number, number],
    paddingConfig?: number | number[],
    animationDuration?: number
  ) => void;
  setCamera: (config: {
    animationDuration?: number;
    centerCoordinate?: [number, number];
    zoomLevel?: number;
  }) => void;
}

interface RouteMarker {
  anchor?: { x: number; y: number };
  coords: Coordinates;
  element: React.ReactElement;
  id: string;
}

interface GoogleRouteMapProps {
  cameraRef?: React.RefObject<RouteMapCameraRef | null>;
  language: 'en' | 'uk';
  markers: RouteMarker[];
  onMapPress?: () => void;
  onUserLocationUpdate?: (coords: Coordinates) => void;
  routeCoordinates?: Coordinates[];
  routeLineColor?: string;
  scrollEnabled?: boolean;
  showUserLocation?: boolean;
  style: StyleProp<ViewStyle>;
}

function buildMapHtml(opts: {
  apiKey: string;
  center: { lat: number; lng: number };
  language: string;
  markers: Array<{ id: string; lat: number; lng: number; color: string }>;
  routeCoords: Array<{ lat: number; lng: number }>;
  routeColor: string;
  zoom: number;
}): string {
  const markersJSON = JSON.stringify(opts.markers);
  const routeJSON = JSON.stringify(opts.routeCoords);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body,#map{width:100%;height:100%;overflow:hidden}
.leaflet-control-attribution{font-size:9px!important;opacity:.7}
.marker-pickup{width:28px;height:28px;border-radius:50%;background:#fff;border:3.5px solid #197A68;display:flex;align-items:center;justify-content:center}
.marker-pickup-inner{width:10px;height:10px;border-radius:50%;background:#197A68}
.marker-destination{width:28px;height:28px;border-radius:50%;background:#C94A4A;border:3px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:800}
.marker-driver{width:30px;height:30px;border-radius:50%;background:#197A68;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px}
.marker-default{width:22px;height:22px;border-radius:50%;background:#3B82F6;border:3px solid #fff}
</style>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>
<body>
<div id="map"></div>
<script>
(function(){
  var map = L.map('map',{
    center:[${opts.center.lat},${opts.center.lng}],
    zoom:${opts.zoom},
    zoomControl:false,
    attributionControl:true
  });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
    maxZoom:19,
    attribution:'© OpenStreetMap'
  }).addTo(map);

  var markersData = ${markersJSON};
  var routeCoords = ${routeJSON};
  var routeColor = '${opts.routeColor}';
  var apiKey = '${opts.apiKey}';
  var markerLayers = [];
  var routeLayer = null;

  function getMarkerHtml(m){
    if(m.id==='pickup') return '<div class="marker-pickup"><div class="marker-pickup-inner"></div></div>';
    if(m.id==='destination') return '<div class="marker-destination">⚑</div>';
    if(m.id==='driver') return '<div class="marker-driver">🚗</div>';
    return '<div class="marker-default"></div>';
  }

  function renderMarkers(data){
    markerLayers.forEach(function(l){map.removeLayer(l)});
    markerLayers=[];
    data.forEach(function(m){
      var icon = L.divIcon({html:getMarkerHtml(m),className:'',iconSize:[28,28],iconAnchor:[14,14]});
      var ml = L.marker([m.lat,m.lng],{icon:icon}).addTo(map);
      markerLayers.push(ml);
    });
  }

  function renderRoute(coords){
    if(routeLayer){map.removeLayer(routeLayer);routeLayer=null}
    if(!coords||coords.length<2) return;
    var latlngs=coords.map(function(c){return[c.lat,c.lng]});
    routeLayer=L.polyline(latlngs,{color:routeColor,weight:5,opacity:0.85,lineCap:'round',lineJoin:'round'}).addTo(map);
  }

  function fitAll(){
    var bounds=[];
    markerLayers.forEach(function(ml){bounds.push(ml.getLatLng())});
    if(routeLayer){
      routeLayer.getLatLngs().forEach(function(ll){bounds.push(ll)});
    }
    if(bounds.length>=2){
      map.fitBounds(L.latLngBounds(bounds),{padding:[50,40],animate:true,duration:0.5});
    }
  }

  function fetchDirections(origin,dest){
    if(!apiKey) return;
    var url='https://maps.googleapis.com/maps/api/directions/json?origin='+origin.lat+','+origin.lng+'&destination='+dest.lat+','+dest.lng+'&key='+apiKey+'&language=${opts.language}';
    // Can't call Directions API from browser (CORS), use route coords from RN
  }

  renderMarkers(markersData);
  renderRoute(routeCoords);
  if(markersData.length>=2||routeCoords.length>=2){
    setTimeout(fitAll,300);
  }

  // Listen for messages from React Native
  document.addEventListener('message',function(e){handleMsg(e)});
  window.addEventListener('message',function(e){handleMsg(e)});

  function handleMsg(e){
    try{
      var msg=JSON.parse(e.data);
      if(msg.type==='updateMarkers'){
        renderMarkers(msg.markers);
      }
      if(msg.type==='updateRoute'){
        routeColor=msg.color||routeColor;
        renderRoute(msg.coords);
      }
      if(msg.type==='fitBounds'){
        if(msg.ne&&msg.sw){
          map.fitBounds([[msg.sw[0],msg.sw[1]],[msg.ne[0],msg.ne[1]]],{padding:[msg.padding||40,msg.padding||40],animate:true});
        }else{
          fitAll();
        }
      }
      if(msg.type==='setCamera'){
        if(msg.center) map.setView([msg.center[0],msg.center[1]],msg.zoom||14,{animate:true});
      }
      if(msg.type==='fullUpdate'){
        if(msg.markers) renderMarkers(msg.markers);
        if(msg.coords) {routeColor=msg.color||routeColor; renderRoute(msg.coords);}
        setTimeout(fitAll,200);
      }
    }catch(err){}
  }

  map.on('click',function(e){
    window.ReactNativeWebView.postMessage(JSON.stringify({type:'mapPress',lat:e.latlng.lat,lng:e.latlng.lng}));
  });

  map.on('moveend',function(){
    var c=map.getCenter();
    window.ReactNativeWebView.postMessage(JSON.stringify({type:'moveEnd',lat:c.lat,lng:c.lng,zoom:map.getZoom()}));
  });

  // Signal ready
  window.ReactNativeWebView.postMessage(JSON.stringify({type:'ready'}));
})();
</script>
</body>
</html>`;
}

function GoogleRouteMap({
  cameraRef,
  language,
  markers,
  onMapPress,
  routeCoordinates = [],
  routeLineColor = '#1A73E8',
  scrollEnabled = true,
  style,
}: GoogleRouteMapProps) {
  const webViewRef = useRef<WebView | null>(null);
  const [isReady, setIsReady] = useState(false);

  const initialRegion = useMemo(() => {
    return getRegionFromCoordinates(
      [...routeCoordinates, ...markers.map((m) => m.coords)],
      DEFAULT_CITY_CENTER
    );
  }, [markers, routeCoordinates]);

  const markerData = useMemo(
    () =>
      markers.map((m) => ({
        id: m.id,
        lat: m.coords.latitude,
        lng: m.coords.longitude,
        color: m.id === 'pickup' ? '#197A68' : m.id === 'destination' ? '#C94A4A' : '#3B82F6',
      })),
    [markers]
  );

  const routeData = useMemo(
    () => routeCoordinates.map((c) => ({ lat: c.latitude, lng: c.longitude })),
    [routeCoordinates]
  );

  const htmlContent = useMemo(
    () =>
      buildMapHtml({
        apiKey: hasGoogleMapsApiKey() ? GOOGLE_MAPS_API_KEY : '',
        center: { lat: initialRegion.latitude, lng: initialRegion.longitude },
        language,
        markers: markerData,
        routeCoords: routeData,
        routeColor: routeLineColor,
        zoom: 13,
      }),
    // Only build HTML once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Send updates to WebView when data changes
  useEffect(() => {
    if (!isReady || !webViewRef.current) return;

    webViewRef.current.postMessage(
      JSON.stringify({
        type: 'fullUpdate',
        markers: markerData,
        coords: routeData,
        color: routeLineColor,
      })
    );
  }, [isReady, markerData, routeData, routeLineColor]);

  // Camera ref integration
  useEffect(() => {
    if (!cameraRef) return;

    cameraRef.current = {
      fitBounds: (ne, sw, paddingConfig) => {
        if (!webViewRef.current || !isReady) return;
        const padding = typeof paddingConfig === 'number' ? paddingConfig : 40;
        webViewRef.current.postMessage(
          JSON.stringify({ type: 'fitBounds', ne, sw, padding })
        );
      },
      setCamera: (config) => {
        if (!webViewRef.current || !isReady) return;
        webViewRef.current.postMessage(
          JSON.stringify({
            type: 'setCamera',
            center: config.centerCoordinate,
            zoom: config.zoomLevel,
          })
        );
      },
    };

    return () => {
      cameraRef.current = null;
    };
  }, [cameraRef, isReady]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data);
        if (msg.type === 'ready') {
          setIsReady(true);
        }
        if (msg.type === 'mapPress' && onMapPress) {
          onMapPress();
        }
      } catch {
        // Ignore parse errors
      }
    },
    [onMapPress]
  );

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        scrollEnabled={scrollEnabled}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMessage}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        bounces={false}
        setSupportMultipleWindows={false}
        cacheEnabled
      />
    </View>
  );
}

export default memo(GoogleRouteMap);

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: '#E9EFE9',
  },
});
