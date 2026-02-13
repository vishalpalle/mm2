import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Video, Image, AudioLines, FileText, Layers, Clock, Target, Navigation, ZoomIn, ZoomOut, Maximize2, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';

// Fix for default Leaflet icons in webpack/vite environments
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const createCustomIcon = (color: string) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px ${color};"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

const aircraftIcon = L.divIcon({
  className: 'aircraft-icon',
  html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3dd4c4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Map Controller Component to handle updates
function MapController({ center, zoom }: { center: [number, number], zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

interface MapIntelligenceProps {
  visualTelemetry?: any[];
  currentTime?: number;
}

export default function MapIntelligence({ visualTelemetry = [], currentTime = 0 }: MapIntelligenceProps) {
  const [activeLayers, setActiveLayers] = useState({
    video: true,
    image: true,
    audio: true,
    document: true,
    tracks: true,
  });

  // Find current active telemetry/position
  // Search for the frame matching current time, or default to first frame
  const currentFrame = visualTelemetry.find(t =>
    // Approximate match or exact match depending on time resolution
    Math.abs((t.time || t.timestamp || 0) - currentTime) < 0.5
  ) || visualTelemetry[0];

  const currentPos: [number, number] = currentFrame
    ? [currentFrame.telemetry?.lat || currentFrame.lat || 0, currentFrame.telemetry?.lon || currentFrame.lon || 0]
    : [35.85, 14.51]; // Default fallback

  // Calculate Flight Path (Polyline)
  const flightPath = useMemo(() => {
    // Sort by time just in case
    return visualTelemetry
      .filter(t => (t.telemetry?.lat && t.telemetry?.lon) || (t.lat && t.lon))
      .sort((a, b) => (a.time || a.timestamp || 0) - (b.time || b.timestamp || 0))
      .map(t => [t.telemetry?.lat || t.lat, t.telemetry?.lon || t.lon] as [number, number]);
  }, [visualTelemetry]);


  // Mock Static Markers for context (can be dynamic too)
  const staticMarkers = [
    { id: 101, type: 'image', lat: 35.8989, lon: 14.5146, title: 'SAR_IMG_1847', severity: 'medium' },
    { id: 102, type: 'audio', lat: 35.8750, lon: 14.4980, title: 'COMMS_2401', severity: 'high' }
  ];

  return (
    <div className="h-full flex">
      <div className="flex-1 relative bg-[#0a0a0f]">

        <MapContainer
          center={currentPos}
          zoom={13}
          style={{ height: '100%', width: '100%', background: '#0a0a0f' }}
          zoomControl={false}
        >
          <MapController center={currentPos} />

          {/* Dark Matter Tile Layer (CartoDB) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Flight Path */}
          {activeLayers.tracks && flightPath.length > 0 && (
            <Polyline
              positions={flightPath}
              color="#3dd4c4"
              weight={2}
              opacity={0.6}
              dashArray="5, 10"
            />
          )}

          {/* Aircraft Marker */}
          <Marker position={currentPos} icon={aircraftIcon}>
            <Popup className="custom-popup">
              <div className="text-sm font-mono text-[#0a0a0f]">
                <b>ISR Platform</b><br />
                Alt: {currentFrame?.telemetry?.alt || currentFrame?.alt || 'N/A'} ft<br />
                Spd: {currentFrame?.telemetry?.speed || currentFrame?.speed || 'N/A'} km/h
              </div>
            </Popup>
          </Marker>

          {/* Telemetry Detections (History) */}
          {activeLayers.video && visualTelemetry.map((frame, idx) => {
            if (frame.target_detected || frame.object) {
              const pos: [number, number] = [frame.telemetry?.lat || frame.lat, frame.telemetry?.lon || frame.lon];
              if (pos[0] === 0) return null; // Skip invalid
              return (
                <Marker key={`det-${idx}`} position={pos} icon={createCustomIcon('#d43d3d')}>
                  <Popup>Target Detected @ {frame.time}s</Popup>
                </Marker>
              );
            }
            return null;
          })}

          {/* Static Context Markers */}
          {staticMarkers.map(m => (
            activeLayers[m.type as keyof typeof activeLayers] && (
              <Marker key={m.id} position={[m.lat, m.lon]} icon={createCustomIcon('#d4a25e')}>
                <Popup>{m.title}</Popup>
              </Marker>
            )
          ))}

        </MapContainer>

        {/* Overlays (Zoom, Legend) - simplified version provided */}
        <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
          <Badge variant="outline" className="bg-[#0a0a0f]/80 backdrop-blur text-[#3dd4c4] border-[#3dd4c4]/30 pointer-events-auto">
            <Shield className="w-3 h-3 mr-1" />
            Live Tracking
          </Badge>
        </div>
      </div>

      {/* Right Sidebar Control - Keep existing layout structure */}
      <div className="w-80 border-l border-border/50 flex flex-col bg-[#0a0a0f]/90 backdrop-blur">
        <div className="p-4 border-b border-border/50">
          <h4 className="text-sm font-['Space_Grotesk'] mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#3dd4c4]" />
            Map Layers
          </h4>
          <div className="space-y-2">
            {['video', 'tracks', 'image', 'audio'].map(layer => (
              <div key={layer} className="flex items-center justify-between p-2 rounded hover:bg-[#1e1e26]">
                <span className="text-sm capitalize">{layer}</span>
                <Switch
                  checked={activeLayers[layer as keyof typeof activeLayers]}
                  onCheckedChange={(c) => setActiveLayers(p => ({ ...p, [layer]: c }))}
                />
              </div>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Current Telemetry</h4>
            {currentFrame && (
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lat</span>
                  <span className="text-[#3dd4c4]">{currentPos[0].toFixed(5)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lon</span>
                  <span className="text-[#3dd4c4]">{currentPos[1].toFixed(5)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alt</span>
                  <span className="text-[#d4a25e]">{currentFrame.telemetry?.alt || currentFrame.alt || '-'} ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Speed</span>
                  <span className="text-[#d4a25e]">{currentFrame.telemetry?.speed || currentFrame.speed || '-'} km/h</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
