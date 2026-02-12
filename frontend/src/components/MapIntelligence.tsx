import React, { useState } from 'react';
import { MapPin, Video, Image, AudioLines, FileText, Layers, Clock, Target, Navigation, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';

export default function MapIntelligence() {
  const [activeLayers, setActiveLayers] = useState({
    video: true,
    image: true,
    audio: true,
    document: true,
    tracks: true,
  });
  const [timePosition, setTimePosition] = useState([75]);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);

  const mapMarkers = [
    {
      id: 1,
      type: 'video',
      lat: 35.8522,
      lon: 14.5156,
      title: 'Patrol_Cam_042',
      event: 'Vessel Rendezvous',
      timestamp: '14:23:15',
      confidence: 0.94,
      severity: 'high',
    },
    {
      id: 2,
      type: 'image',
      lat: 35.8989,
      lon: 14.5146,
      title: 'SAR_IMG_1847',
      event: 'Ship Classification',
      timestamp: '14:18:42',
      confidence: 0.89,
      severity: 'medium',
    },
    {
      id: 3,
      type: 'audio',
      lat: 35.8750,
      lon: 14.4980,
      title: 'COMMS_2401',
      event: 'Radio Intercept',
      timestamp: '14:12:08',
      confidence: 0.91,
      severity: 'high',
    },
    {
      id: 4,
      type: 'video',
      lat: 35.8200,
      lon: 14.5300,
      title: 'UAV_Feed_183',
      event: 'Loitering Activity',
      timestamp: '13:45:22',
      confidence: 0.86,
      severity: 'medium',
    },
  ];

  const vesselTracks = [
    { id: 1, name: 'Vessel A', points: [
      { lat: 35.82, lon: 14.50 },
      { lat: 35.84, lon: 14.51 },
      { lat: 35.85, lon: 14.515 },
      { lat: 35.8522, lon: 14.5156 },
    ]},
    { id: 2, name: 'Vessel B', points: [
      { lat: 35.88, lon: 14.48 },
      { lat: 35.87, lon: 14.50 },
      { lat: 35.86, lon: 14.51 },
      { lat: 35.8522, lon: 14.5156 },
    ]},
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'image': return Image;
      case 'audio': return AudioLines;
      case 'document': return FileText;
      default: return MapPin;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return '#3dd4c4';
      case 'image': return '#d4a25e';
      case 'audio': return '#4a8ad4';
      case 'document': return '#8a8b92';
      default: return '#3dd4c4';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#d43d3d';
      case 'medium': return '#d4a25e';
      case 'low': return '#3dd4c4';
      default: return '#8a8b92';
    }
  };

  return (
    <div className="h-full flex">
      {/* Main Map */}
      <div className="flex-1 relative">
        {/* Map Container */}
        <div className="absolute inset-0 bg-[#0a0a0f]">
          {/* Satellite Background */}
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1542382248-cc0aa645262c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYXRlbGxpdGUlMjBpbWFnZXJ5JTIwZWFydGglMjBuaWdodHxlbnwxfHx8fDE3Njk2NzAzNzB8MA&ixlib=rb-4.1.0&q=80&w=1080)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* Grid Overlay */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(rgba(61, 212, 196, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(61, 212, 196, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }} />

          {/* Coordinate Grid Labels */}
          <div className="absolute top-4 left-4 font-mono text-xs text-[#3dd4c4]">
            35.82°N - 35.90°N
          </div>
          <div className="absolute bottom-4 left-4 font-mono text-xs text-[#3dd4c4]">
            14.48°E - 14.54°E
          </div>

          {/* Vessel Tracks */}
          {activeLayers.tracks && vesselTracks.map((track) => (
            <svg key={track.id} className="absolute inset-0 pointer-events-none">
              <polyline
                points={track.points.map(p => 
                  `${((p.lon - 14.48) / (14.54 - 14.48)) * 100}%,${((35.90 - p.lat) / (35.90 - 35.82)) * 100}%`
                ).join(' ')}
                fill="none"
                stroke="#3dd4c4"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.5"
              />
            </svg>
          ))}

          {/* Map Markers */}
          {mapMarkers.map((marker) => {
            if (!activeLayers[marker.type as keyof typeof activeLayers]) return null;
            
            const Icon = getTypeIcon(marker.type);
            const color = getTypeColor(marker.type);
            const x = ((marker.lon - 14.48) / (14.54 - 14.48)) * 100;
            const y = ((35.90 - marker.lat) / (35.90 - 35.82)) * 100;
            const isSelected = selectedMarker === marker.id;

            return (
              <div
                key={marker.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all"
                style={{ 
                  left: `${x}%`, 
                  top: `${y}%`,
                  zIndex: isSelected ? 100 : 50,
                }}
                onClick={() => setSelectedMarker(marker.id)}
              >
                {/* Pulse Animation */}
                <div 
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ 
                    backgroundColor: color,
                    opacity: 0.3,
                  }}
                />
                
                {/* Marker Icon */}
                <div 
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isSelected ? 'scale-125 shadow-lg' : 'scale-100'
                  }`}
                  style={{ 
                    backgroundColor: `${color}20`,
                    borderColor: color,
                    boxShadow: isSelected ? `0 0 20px ${color}` : 'none',
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>

                {/* Marker Label */}
                {isSelected && (
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-64 glass-panel rounded-lg p-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-['Space_Grotesk'] text-sm mb-1">{marker.title}</div>
                        <div className="text-xs text-muted-foreground">{marker.event}</div>
                      </div>
                      <Badge 
                        variant="outline"
                        style={{ 
                          color: getSeverityColor(marker.severity),
                          borderColor: `${getSeverityColor(marker.severity)}40`
                        }}
                      >
                        {marker.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Position</span>
                        <span className="text-[#3dd4c4]">{marker.lat.toFixed(4)}°N, {marker.lon.toFixed(4)}°E</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time</span>
                        <span>{marker.timestamp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Confidence</span>
                        <span style={{ color }}>{(marker.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <Button size="sm" className="w-full mt-3 bg-[#1e1e26] hover:bg-[#2a2a34]">
                      View Details
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button size="icon" variant="outline" className="glass-panel border-border/50">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="outline" className="glass-panel border-border/50">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="outline" className="glass-panel border-border/50">
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="outline" className="glass-panel border-border/50">
              <Navigation className="w-4 h-4" />
            </Button>
          </div>

          {/* Scale */}
          <div className="absolute bottom-4 right-4 glass-panel rounded px-3 py-2 text-xs font-mono">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-20 h-0.5 bg-[#3dd4c4]" />
              <span className="text-[#3dd4c4]">10 km</span>
            </div>
          </div>
        </div>

        {/* Time Slider */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-[600px] glass-panel rounded-lg p-4">
          <div className="flex items-center gap-4">
            <Clock className="w-4 h-4 text-[#d4a25e]" />
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-muted-foreground">00:00 UTC</span>
                <span className="text-[#3dd4c4]">Current: 18:30 UTC</span>
                <span className="text-muted-foreground">24:00 UTC</span>
              </div>
              <Slider
                value={timePosition}
                onValueChange={setTimePosition}
                max={100}
                step={1}
                className="[&_[role=slider]]:bg-[#3dd4c4] [&_[role=slider]]:border-[#3dd4c4]"
              />
            </div>
            <Button size="sm" variant="outline" className="border-[#3dd4c4]/30">
              <Play className="w-3 h-3 mr-1" />
              Replay
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Inset Map and Controls */}
      <div className="w-96 border-l border-border/50 flex flex-col">
        {/* Inset Overview Map */}
        <div className="p-4 border-b border-border/50">
          <h4 className="text-sm font-['Space_Grotesk'] mb-3">Global Overview</h4>
          <div className="aspect-video rounded-lg overflow-hidden border border-border/50 relative">
            <img 
              src="https://images.unsplash.com/photo-1542382248-cc0aa645262c?w=400"
              alt="Global map"
              className="w-full h-full object-cover opacity-60"
            />
            {/* AOI Indicator */}
            <div className="absolute top-1/2 left-1/2 w-8 h-8 border-2 border-[#d43d3d] rounded animate-pulse" style={{
              transform: 'translate(-50%, -50%)',
            }} />
            <div className="absolute bottom-2 right-2 text-xs font-mono text-[#3dd4c4]">
              Mediterranean AO
            </div>
          </div>
        </div>

        {/* Layer Controls */}
        <div className="p-4 border-b border-border/50">
          <h4 className="text-sm font-['Space_Grotesk'] mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#3dd4c4]" />
            Map Layers
          </h4>
          <div className="space-y-2">
            {[
              { key: 'video', label: 'Video Detections', icon: Video, color: '#3dd4c4', count: 2 },
              { key: 'image', label: 'Image Sightings', icon: Image, color: '#d4a25e', count: 1 },
              { key: 'audio', label: 'Audio Geo-tags', icon: AudioLines, color: '#4a8ad4', count: 1 },
              { key: 'document', label: 'Document References', icon: FileText, color: '#8a8b92', count: 0 },
              { key: 'tracks', label: 'Vessel Tracks', icon: Navigation, color: '#3dd4c4', count: 2 },
            ].map((layer) => {
              const Icon = layer.icon;
              return (
                <div 
                  key={layer.key}
                  className="flex items-center justify-between p-2 rounded hover:bg-[#1e1e26] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color: layer.color }} />
                    <span className="text-sm">{layer.label}</span>
                    <Badge variant="outline" className="text-xs" style={{ borderColor: `${layer.color}40` }}>
                      {layer.count}
                    </Badge>
                  </div>
                  <Switch
                    checked={activeLayers[layer.key as keyof typeof activeLayers]}
                    onCheckedChange={(checked) => 
                      setActiveLayers({ ...activeLayers, [layer.key]: checked })
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Event List */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border/50">
            <h4 className="text-sm font-['Space_Grotesk']">Timeline Events</h4>
          </div>
          <ScrollArea className="flex-1 custom-scrollbar">
            <div className="p-4 space-y-3">
              {mapMarkers.map((marker) => {
                const Icon = getTypeIcon(marker.type);
                const color = getTypeColor(marker.type);
                const isSelected = selectedMarker === marker.id;

                return (
                  <div
                    key={marker.id}
                    className={`p-3 rounded-lg transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-[#3dd4c4]/10 border border-[#3dd4c4]/30' 
                        : 'bg-[#1e1e26] border border-transparent hover:border-border/50'
                    }`}
                    onClick={() => setSelectedMarker(marker.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${color}20`, border: `1px solid ${color}` }}
                      >
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium truncate">{marker.title}</span>
                          <Badge 
                            variant="outline"
                            className="text-xs"
                            style={{ 
                              color: getSeverityColor(marker.severity),
                              borderColor: `${getSeverityColor(marker.severity)}40`
                            }}
                          >
                            {marker.severity}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">{marker.event}</div>
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{marker.timestamp}</span>
                          <span className="text-muted-foreground">•</span>
                          <span style={{ color }}>{(marker.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Map Stats */}
        <div className="p-4 border-t border-border/50 grid grid-cols-2 gap-3">
          <div className="glass-panel rounded p-2">
            <div className="text-xs text-muted-foreground">Total Events</div>
            <div className="text-lg font-['Space_Grotesk'] text-[#3dd4c4]">4</div>
          </div>
          <div className="glass-panel rounded p-2">
            <div className="text-xs text-muted-foreground">Active Tracks</div>
            <div className="text-lg font-['Space_Grotesk'] text-[#d4a25e]">2</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Play(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
