import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Move, Layers, Target, Type, MapPin, Thermometer, Radio, FileImage } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export default function ImageIntelligence() {
  const [zoom, setZoom] = useState(100);
  const [layerToggles, setLayerToggles] = useState({
    objects: true,
    ocr: true,
    heatmap: false,
  });

  const detections = [
    { id: 1, type: 'Naval Vessel', name: 'Cargo Ship (Bulk Carrier)', confidence: 0.96, hull: 'IMO 9234567', x: 240, y: 180 },
    { id: 2, type: 'Naval Vessel', name: 'Container Ship', confidence: 0.91, hull: 'MMSI 235894120', x: 520, y: 280 },
    { id: 3, type: 'Infrastructure', name: 'Crane (Port)', confidence: 0.88, hull: null, x: 120, y: 80 },
  ];

  const ocrResults = [
    { text: 'IMO 9234567', confidence: 0.94, type: 'Hull Number', x: 250, y: 190 },
    { text: 'MAERSK', confidence: 0.89, type: 'Company', x: 240, y: 210 },
    { text: 'TERMINAL 5', confidence: 0.92, type: 'Signage', x: 140, y: 60 },
  ];

  const geoMetadata = {
    lat: 35.8522,
    lon: 14.5156,
    altitude: 1200,
    bearing: 127,
    location: 'Mediterranean Sea, Malta Region',
    captureTime: '2026-01-29 14:23:15 UTC',
    sensor: 'EO/IR Dual Band',
  };

  const entityExtraction = [
    { entity: 'Cargo Ship', type: 'Asset', confidence: 0.96 },
    { entity: 'Malta', type: 'Location', confidence: 0.89 },
    { entity: 'Port Infrastructure', type: 'Facility', confidence: 0.88 },
  ];

  return (
    <div className="h-full flex">
      {/* Left: Image Viewer */}
      <div className="w-2/3 p-6 space-y-4">
        <div className="glass-panel rounded-lg overflow-hidden">
          {/* Toolbar */}
          <div className="bg-[#14141a] border-b border-border/50 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setZoom(Math.max(50, zoom - 10))}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-mono px-2">{zoom}%</span>
              <Button size="sm" variant="ghost" onClick={() => setZoom(Math.min(200, zoom + 10))}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <Move className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={layerToggles.objects} 
                  onCheckedChange={(checked) => setLayerToggles({...layerToggles, objects: checked})}
                />
                <span className="text-sm">Objects</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={layerToggles.ocr} 
                  onCheckedChange={(checked) => setLayerToggles({...layerToggles, ocr: checked})}
                />
                <span className="text-sm">OCR</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={layerToggles.heatmap} 
                  onCheckedChange={(checked) => setLayerToggles({...layerToggles, heatmap: checked})}
                />
                <span className="text-sm">Heatmap</span>
              </div>
            </div>
          </div>

          {/* Image Display */}
          <div className="relative aspect-video bg-black overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1760888330763-39c28be84782?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWxpdGFyeSUyMG5hdmFsJTIwdmVzc2VsJTIwc2hpcHxlbnwxfHx8fDE3Njk2NzAzNzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Satellite imagery"
              className="w-full h-full object-cover"
              style={{ transform: `scale(${zoom / 100})` }}
            />

            {/* Object Detection Overlays */}
            {layerToggles.objects && detections.map((det) => (
              <div
                key={det.id}
                className="absolute border-2 border-[#3dd4c4] rounded"
                style={{
                  left: `${(det.x / 640) * 100}%`,
                  top: `${(det.y / 360) * 100}%`,
                  width: '120px',
                  height: '80px',
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top left',
                }}
              >
                <div className="absolute -top-6 left-0 bg-[#3dd4c4] text-[#0a0a0f] px-2 py-0.5 text-xs font-mono rounded whitespace-nowrap">
                  {det.name} {(det.confidence * 100).toFixed(0)}%
                </div>
              </div>
            ))}

            {/* OCR Overlays */}
            {layerToggles.ocr && ocrResults.map((ocr, idx) => (
              <div
                key={idx}
                className="absolute"
                style={{
                  left: `${(ocr.x / 640) * 100}%`,
                  top: `${(ocr.y / 360) * 100}%`,
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top left',
                }}
              >
                <div className="bg-[#d4a25e] text-[#0a0a0f] px-2 py-0.5 text-xs font-mono rounded whitespace-nowrap border-2 border-[#d4a25e]">
                  {ocr.text}
                </div>
              </div>
            ))}

            {/* Heatmap Overlay */}
            {layerToggles.heatmap && (
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 45% 55%, rgba(212, 61, 61, 0.3) 0%, transparent 30%), radial-gradient(circle at 75% 70%, rgba(212, 162, 94, 0.2) 0%, transparent 25%)',
                }}
              />
            )}

            {/* Metadata Overlay */}
            <div className="absolute top-4 left-4 glass-panel px-3 py-2 text-xs font-mono">
              <div className="text-[#3dd4c4]">SAR_IMG_1847</div>
              <div className="text-muted-foreground mt-1">Sensor: {geoMetadata.sensor}</div>
            </div>

            <div className="absolute top-4 right-4 glass-panel px-3 py-2 text-xs font-mono">
              <Badge className="bg-[#d4a25e]/20 text-[#d4a25e] border-[#d4a25e]/30">
                Classification: SECRET
              </Badge>
            </div>
          </div>

          {/* Image Info Bar */}
          <div className="bg-[#14141a] border-t border-border/50 p-3 text-xs font-mono">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-[#3dd4c4]" />
                  <span>{geoMetadata.lat.toFixed(4)}° N, {geoMetadata.lon.toFixed(4)}° E</span>
                </div>
                <span className="text-muted-foreground">|</span>
                <div className="flex items-center gap-2">
                  <Target className="w-3 h-3 text-[#d4a25e]" />
                  <span>Altitude: {geoMetadata.altitude}m | Bearing: {geoMetadata.bearing}°</span>
                </div>
              </div>
              <span className="text-muted-foreground">{geoMetadata.captureTime}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="glass-panel rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Objects</div>
            <div className="text-xl font-['Space_Grotesk'] text-[#3dd4c4]">{detections.length}</div>
          </div>
          <div className="glass-panel rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">OCR Results</div>
            <div className="text-xl font-['Space_Grotesk'] text-[#d4a25e]">{ocrResults.length}</div>
          </div>
          <div className="glass-panel rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Avg Confidence</div>
            <div className="text-xl font-['Space_Grotesk'] text-[#3dd4c4]">92%</div>
          </div>
          <div className="glass-panel rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Resolution</div>
            <div className="text-xl font-['Space_Grotesk'] text-muted-foreground">4K</div>
          </div>
        </div>
      </div>

      {/* Right: Intelligence Panels */}
      <div className="w-1/3 border-l border-border/50">
        <ScrollArea className="h-full custom-scrollbar">
          <div className="p-6 space-y-4">
            <Tabs defaultValue="detections" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-[#1e1e26]">
                <TabsTrigger value="detections">Detections</TabsTrigger>
                <TabsTrigger value="ocr">OCR</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
              </TabsList>

              <TabsContent value="detections" className="space-y-3 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm">Object Detection</h3>
                  <Badge variant="outline" className="text-[#3dd4c4] border-[#3dd4c4]/30">
                    {detections.length} Objects
                  </Badge>
                </div>

                {detections.map((det) => (
                  <div key={det.id} className="glass-panel rounded-lg p-4 space-y-3 glow-hover cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="w-4 h-4 text-[#3dd4c4]" />
                          <span className="font-['Space_Grotesk'] text-sm">{det.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{det.type}</div>
                      </div>
                      <Badge className="bg-[#3dd4c4]/20 text-[#3dd4c4]">
                        {(det.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>

                    {det.hull && (
                      <div className="glass-panel bg-[#1e1e26] rounded p-2 text-xs font-mono">
                        <div className="text-muted-foreground">Identifier</div>
                        <div className="text-[#d4a25e] mt-1">{det.hull}</div>
                      </div>
                    )}

                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Position</span>
                        <span>X:{det.x} Y:{det.y}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Model</span>
                        <span className="text-[#3dd4c4]">YOLOv8-Maritime</span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="glass-panel rounded-lg p-4 mt-4">
                  <h4 className="text-sm mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#d4a25e]" />
                    Scene Classification
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Port/Harbor</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-[#1e1e26] rounded-full overflow-hidden">
                          <div className="w-[85%] h-full bg-[#3dd4c4]" />
                        </div>
                        <span className="font-mono text-[#3dd4c4]">85%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Industrial</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-[#1e1e26] rounded-full overflow-hidden">
                          <div className="w-[12%] h-full bg-[#d4a25e]" />
                        </div>
                        <span className="font-mono">12%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ocr" className="space-y-3 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm">OCR Results</h3>
                  <Badge variant="outline" className="text-[#d4a25e] border-[#d4a25e]/30">
                    {ocrResults.length} Texts
                  </Badge>
                </div>

                {ocrResults.map((ocr, idx) => (
                  <div key={idx} className="glass-panel rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Type className="w-4 h-4 text-[#d4a25e]" />
                          <span className="font-mono text-sm">{ocr.text}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{ocr.type}</div>
                      </div>
                      <Badge className="bg-[#d4a25e]/20 text-[#d4a25e]">
                        {(ocr.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>

                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Position</span>
                        <span>X:{ocr.x} Y:{ocr.y}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">OCR Engine</span>
                        <span className="text-[#d4a25e]">Tesseract-v5</span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="glass-panel rounded-lg p-4 mt-4">
                  <h4 className="text-sm mb-3">Entity Extraction</h4>
                  <div className="space-y-2">
                    {entityExtraction.map((entity, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[#3dd4c4] border-[#3dd4c4]/30">
                            {entity.type}
                          </Badge>
                          <span>{entity.entity}</span>
                        </div>
                        <span className="font-mono text-muted-foreground">{(entity.confidence * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="metadata" className="space-y-3 mt-4">
                <div className="glass-panel rounded-lg p-4">
                  <h4 className="text-sm mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#3dd4c4]" />
                    Geospatial Metadata
                  </h4>
                  <div className="space-y-2.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Latitude</span>
                      <span className="text-[#3dd4c4]">{geoMetadata.lat.toFixed(4)}° N</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Longitude</span>
                      <span className="text-[#3dd4c4]">{geoMetadata.lon.toFixed(4)}° E</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Altitude</span>
                      <span>{geoMetadata.altitude}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bearing</span>
                      <span>{geoMetadata.bearing}°</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location</span>
                      <span className="text-right">{geoMetadata.location}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel rounded-lg p-4">
                  <h4 className="text-sm mb-3 flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-[#d4a25e]" />
                    Sensor Information
                  </h4>
                  <div className="space-y-2.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sensor Type</span>
                      <span className="text-[#d4a25e]">{geoMetadata.sensor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capture Time</span>
                      <span>{geoMetadata.captureTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Source</span>
                      <span className="text-[#3dd4c4]">Satellite</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resolution</span>
                      <span>3840x2160 (4K)</span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel rounded-lg p-4">
                  <h4 className="text-sm mb-3 flex items-center gap-2">
                    <FileImage className="w-4 h-4 text-[#4a8ad4]" />
                    Embedding Summary
                  </h4>
                  <div className="space-y-2.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model</span>
                      <span className="text-[#4a8ad4]">CLIP-ViT-L/14</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dimensions</span>
                      <span>768</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Indexed</span>
                      <span className="text-[#3dd4c4]">Yes</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
