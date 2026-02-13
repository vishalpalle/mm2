import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, MapPin, Target, Clock } from 'lucide-react';

import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

/* =======================
   Types (API-aligned)
   ======================= */

export interface VideoAnalysis {
  video_id: string;
  metadata: {
    fps: number;
    frame_count: number;
    resolution: string;
    duration_sec: number;
  };
  embedded_telemetry?: {
    container?: {
      filename: string;
      duration_sec: number;
      bit_rate: string;
      size_bytes: string;
    };
    video_stream?: {
      codec: string;
      width: number;
      height: number;
      fps: number;
    };
    audio_stream?: {
      codec: string;
      sample_rate: string;
      channels: number;
    };
  };
  visual_telemetry?: {
    time: number;
    telemetry: {
      speed?: number;
      alt?: number;
      lat?: number;
      lon?: number;
    };
    object?: {
      label: string;
      conf: number;
      box: number[];
    };
  }[];

}

interface Props {
  analysis: VideoAnalysis;
  videoFile: File;
}

/* =======================
   Component
   ======================= */

export default function VideoIntelligence({ analysis, videoFile }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [videoUrl, setVideoUrl] = useState<string>('');
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const duration = analysis.metadata.duration_sec;

  const telemetryData = analysis.visual_telemetry || [];

  /* Create blob URL */
  useEffect(() => {
    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2, '0')}:${sec
      .toString()
      .padStart(2, '0')}`;
  };

  const activeFrame = telemetryData.find(
    d => Math.abs(d.time - currentTime) < 0.5
  );



  const togglePlay = () => {
    if (!videoRef.current) return;
    playing ? videoRef.current.pause() : videoRef.current.play();
    setPlaying(!playing);
  };

  const jumpTo = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    videoRef.current.play();
    setPlaying(true);
  };

  return (
    <div className="h-full flex">
      {/* ================= VIDEO PANEL ================= */}
      <div className="w-2/3 p-6 space-y-4">
        <div className="glass-panel rounded-lg overflow-hidden">
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-cover"
              muted
              onTimeUpdate={() =>
                setCurrentTime(videoRef.current?.currentTime ?? 0)
              }
            />

            {/* Bounding Box Overlay */}
            {activeFrame?.object && (
              <div
                className="absolute border-2 border-[#d43d3d] bg-[#d43d3d]/20"
                style={{
                  left: `${activeFrame.object.box[0] * 100 - (activeFrame.object.box[2] * 100 / 2)}%`,
                  top: `${activeFrame.object.box[1] * 100 - (activeFrame.object.box[3] * 100 / 2)}%`,
                  width: `${activeFrame.object.box[2] * 100}%`,
                  height: `${activeFrame.object.box[3] * 100}%`,
                }}
              >
                <div className="absolute -top-6 left-0 bg-[#d43d3d] text-white text-xs px-1">
                  {activeFrame.object.label} ({Math.round(activeFrame.object.conf * 100)}%)
                </div>
              </div>
            )}



            <div className="absolute bottom-4 left-4 glass-panel px-3 py-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-[#3dd4c4]" />
                {activeFrame?.telemetry?.lat?.toFixed(4) ?? "35.8522"}° N, {activeFrame?.telemetry?.lon?.toFixed(4) ?? "14.5156"}° E
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-3 h-3 text-[#d4a25e]" />
                Alt: {activeFrame?.telemetry?.alt ?? 0} ft | Speed: {activeFrame?.telemetry?.speed ?? 0} kts
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-4 bg-[#14141a] space-y-3">
            <div className="h-2 bg-[#1e1e26] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#3dd4c4] to-[#2a8a7e]"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            <div className="flex justify-between items-center">
              <Button size="sm" onClick={togglePlay}>
                {playing ? <Pause /> : <Play />}
              </Button>
              <span className="font-mono text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="w-1/3 border-l border-border/50">
        <ScrollArea className="h-full">
          <div className="p-6">
            <Tabs defaultValue="overview">
              {/* TAB HEADER */}
              <TabsList className="flex gap-3 bg-transparent mb-6">
                <TabsTrigger
                  value="overview"
                  className="
              px-4 py-2 rounded-lg text-sm
              data-[state=active]:bg-[#3dd4c4]/20
              data-[state=active]:text-[#3dd4c4]
              bg-[#1e1e26] text-muted-foreground
            "
                >
                  Overview
                </TabsTrigger>

                <TabsTrigger
                  value="telemetry"
                  className="
              px-4 py-2 rounded-lg text-sm
              data-[state=active]:bg-[#d4a25e]/20
              data-[state=active]:text-[#d4a25e]
              bg-[#1e1e26] text-muted-foreground
            "
                >
                  Telemetry
                </TabsTrigger>

                <TabsTrigger
                  value="detections"
                  className="
              px-4 py-2 rounded-lg text-sm
              data-[state=active]:bg-[#4a8ad4]/20
              data-[state=active]:text-[#4a8ad4]
              bg-[#1e1e26] text-muted-foreground
            "
                >
                  Detections
                </TabsTrigger>
              </TabsList>

              {/* OVERVIEW */}
              <TabsContent value="overview" className="space-y-4">
                <div className="glass-panel p-4 space-y-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Primary Object</div>
                    <div className="text-lg font-bold text-[#3dd4c4]">
                      {activeFrame?.object?.label || "Scanning..."}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Threat Level</div>
                    <Badge className={activeFrame?.object?.label === 'airplane' ? "bg-[#d4a25e] text-black" : "bg-[#3dd4c4]/20 text-[#3dd4c4]"}>
                      {activeFrame?.object?.label === 'airplane' ? "MEDIUM" : "LOW"}
                    </Badge>
                  </div>
                </div>
              </TabsContent>

              {/* TELEMETRY */}
              <TabsContent value="telemetry" className="space-y-3">
                <div className="glass-panel p-4 text-sm space-y-2">
                  <div>Speed: {activeFrame?.telemetry?.speed ?? 'N/A'} kts</div>
                  <div>Altitude: {activeFrame?.telemetry?.alt ?? 'N/A'} ft</div>
                  <div>Latitude: {activeFrame?.telemetry?.lat ?? 'N/A'}</div>
                  <div>Longitude: {activeFrame?.telemetry?.lon ?? 'N/A'}</div>
                </div>
              </TabsContent>

              {/* DETECTIONS */}
              <TabsContent value="detections" className="space-y-3">
                <div className="glass-panel p-4 text-sm space-y-2">
                  <div>Target: {activeFrame?.object?.label ?? 'None'}</div>
                  <div>Confidence: {activeFrame?.object?.conf ? (activeFrame.object.conf * 100).toFixed(1) + '%' : 'N/A'}</div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>

    </div>
  );
}
