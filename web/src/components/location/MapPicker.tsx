import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapPicker.css';

interface MapPickerProps {
  mapboxToken?: string | null;
  latitude?: number;
  longitude?: number;
  onSelect: (lat: number, lng: number) => void;
}

export const MapPicker = ({ mapboxToken, latitude, longitude, onSelect }: MapPickerProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || mapRef.current) return;

    mapboxgl.accessToken = mapboxToken;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitude ?? 78.9629, latitude ?? 20.5937],
      zoom: latitude && longitude ? 12 : 4,
    });

    mapRef.current = map;

    map.on('click', (e) => {
      const { lat, lng } = e.lngLat;
      onSelect(lat, lng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [mapboxToken, latitude, longitude, onSelect]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (latitude == null || longitude == null) return;
    const map = mapRef.current;
    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker({ color: '#1976d2' })
        .setLngLat([longitude, latitude])
        .addTo(map);
    } else {
      markerRef.current.setLngLat([longitude, latitude]);
    }
    map.easeTo({ center: [longitude, latitude], zoom: 14 });
  }, [latitude, longitude]);

  if (!mapboxToken) {
    return (
      <div className="map-picker-fallback">
        Mapbox token missing. Map picker disabled.
      </div>
    );
  }

  return <div ref={mapContainer} className="map-picker" />;
};


