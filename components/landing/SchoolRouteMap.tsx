import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Coordinates } from '../../utils/schoolContact';

// Displays the public school pin only. Visitor location and routing are not connected yet.
export const SchoolRouteMap: React.FC<{ destination: Coordinates }> = ({ destination }) => {
  const container = useRef<HTMLDivElement>(null);
  const [tileError, setTileError] = useState(false);
  useEffect(() => {
    if (!container.current) return;
    const map = L.map(container.current, { scrollWheelZoom: false, zoomControl: false }).setView([destination.latitude, destination.longitude], 17);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    }).on('tileerror', () => setTileError(true)).addTo(map);
    L.circleMarker([destination.latitude, destination.longitude], { radius: 9, color: '#ffffff', weight: 3, fillColor: '#171717', fillOpacity: 1 })
      .addTo(map).bindTooltip('Defined Domains · School', { permanent: true, direction: 'top', offset: [0, -10] });
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container.current);
    return () => { observer.disconnect(); map.remove(); };
  }, [destination.latitude, destination.longitude]);
  return <div className="relative isolate overflow-hidden bg-neutral-100">
    <div ref={container} role="region" aria-label="Satellite map showing the school entrance" className="h-[340px] w-full sm:h-[440px] lg:h-[510px]" />
    <span className="pointer-events-none absolute left-3 top-3 z-[500] rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-medium text-neutral-700">Satellite view</span>
    {tileError && <p role="status" className="absolute bottom-8 left-3 right-14 z-[500] rounded-md bg-white p-3 text-xs text-neutral-700">Some satellite images could not load. You can still open directions in Google Maps below.</p>}
  </div>;
};
