"use client";
import { useState } from "react";
import MapGL, { Marker, NavigationControl, GeolocateControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapboxMapProps {
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
}

export default function MapboxMap({ 
  initialLat = 41.3851, 
  initialLng = 2.1734, 
  initialZoom = 12 
}: MapboxMapProps) {
  const [viewState, setViewState] = useState({
    latitude: initialLat,
    longitude: initialLng,
    zoom: initialZoom,
  });

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <MapGL
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />
        
        {/* Example marker */}
        <Marker 
          longitude={initialLng} 
          latitude={initialLat} 
          anchor="bottom"
        >
          <div style={{
            background: "red",
            borderRadius: "50%",
            width: "20px",
            height: "20px",
            border: "2px solid white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
          }} />
        </Marker>
      </MapGL>
    </div>
  );
}
