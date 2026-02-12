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
  fused_frame_count: number;
  fused_frames: {
    frame_id: string;
    start_time: number;
    end_time: number;
    confidence: number;
    path: string;
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
  const frames = analysis.fused_frames;

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

  const activeFrame = frames.find(
    f => currentTime >= f.start_time && currentTime <= f.end_time
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

            {activeFrame && (
              <div className="absolute top-4 left-4 glass-panel px-3 py-1 text-xs font-mono">
                <div className="text-[#3dd4c4]">FUSED SEGMENT</div>
                <div className="text-[#d4a25e]">
                  Confidence: {activeFrame.confidence.toFixed(2)}
                </div>
                <div className="text-muted-foreground">
                  {formatTime(activeFrame.start_time)} →{' '}
                  {formatTime(activeFrame.end_time)}
                </div>
              </div>
            )}

            <div className="absolute bottom-4 left-4 glass-panel px-3 py-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-[#3dd4c4]" />
                35.8522° N, 14.5156° E
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-3 h-3 text-[#d4a25e]" />
                Bearing: 127° | Speed: 12 kts
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
      <Tabs defaultValue="activities">
        {/* TAB HEADER */}
        <TabsList className="flex gap-3 bg-transparent mb-6">
          <TabsTrigger
            value="activities"
            className="
              px-4 py-2 rounded-lg text-sm
              data-[state=active]:bg-[#3dd4c4]/20
              data-[state=active]:text-[#3dd4c4]
              bg-[#1e1e26] text-muted-foreground
            "
          >
            Activities
          </TabsTrigger>

          <TabsTrigger
            value="audio"
            className="
              px-4 py-2 rounded-lg text-sm
              data-[state=active]:bg-[#d4a25e]/20
              data-[state=active]:text-[#d4a25e]
              bg-[#1e1e26] text-muted-foreground
            "
          >
            Audio
          </TabsTrigger>

          <TabsTrigger
            value="metadata"
            className="
              px-4 py-2 rounded-lg text-sm
              data-[state=active]:bg-[#4a8ad4]/20
              data-[state=active]:text-[#4a8ad4]
              bg-[#1e1e26] text-muted-foreground
            "
          >
            Metadata
          </TabsTrigger>
        </TabsList>

        {/* ACTIVITIES */}
        <TabsContent value="activities" className="space-y-4">
          {frames.map(f => (
            <div key={f.frame_id} className="glass-panel p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-sm">
                  {formatTime(f.start_time)} → {formatTime(f.end_time)}
                </span>
                <Badge className="bg-[#3dd4c4]/20 text-[#3dd4c4]">
                  {f.confidence.toFixed(2)}
                </Badge>
              </div>

              <Button
                size="sm"
                className="w-full"
                onClick={() => jumpTo(f.start_time)}
              >
                Jump to Segment
              </Button>
            </div>
          ))}
        </TabsContent>

        {/* AUDIO */}
        <TabsContent value="audio" className="space-y-3">
          <div className="glass-panel p-4 text-sm space-y-2">
            <div>Codec: {analysis.embedded_telemetry?.audio_stream?.codec}</div>
            <div>Sample Rate: {analysis.embedded_telemetry?.audio_stream?.sample_rate}</div>
            <div>Channels: {analysis.embedded_telemetry?.audio_stream?.channels}</div>
          </div>
        </TabsContent>

        {/* METADATA */}
        <TabsContent value="metadata" className="space-y-3">
          <div className="glass-panel p-4 text-sm space-y-2">
            <div>Video ID: {analysis.video_id}</div>
            <div>FPS: {analysis.metadata.fps}</div>
            <div>Resolution: {analysis.metadata.resolution}</div>
            <div>Frames: {analysis.metadata.frame_count}</div>
            <div>Duration: {analysis.metadata.duration_sec}s</div>
            <div>Codec: {analysis.embedded_telemetry?.video_stream?.codec}</div>
            <div>Bitrate: {analysis.embedded_telemetry?.container?.bit_rate}</div>
            <div>
              File Size: {analysis.embedded_telemetry?.container?.size_bytes} bytes
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
