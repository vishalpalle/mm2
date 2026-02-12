import React from 'react';
import { Activity, CheckCircle2, AlertTriangle, Clock, Cpu, Database, Zap, TrendingUp, Video, Image, AudioLines, FileText } from 'lucide-react';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Progress } from './ui/progress';

export default function PipelineMonitor() {
  const pipelines = [
    {
      id: 1,
      name: 'Video Intelligence Pipeline',
      icon: Video,
      color: '#3dd4c4',
      status: 'active',
      throughput: '45 fps',
      models: ['YOLOv8-Naval', 'TempNet-Maritime', 'Whisper-v3'],
      queueSize: 3,
      processed: 1205,
      errors: 2,
      avgLatency: '245ms',
    },
    {
      id: 2,
      name: 'Image Intelligence Pipeline',
      icon: Image,
      color: '#d4a25e',
      status: 'active',
      throughput: '120 img/min',
      models: ['YOLOv8-Maritime', 'CLIP-ViT-L/14', 'Tesseract-v5'],
      queueSize: 1,
      processed: 956,
      errors: 1,
      avgLatency: '180ms',
    },
    {
      id: 3,
      name: 'Audio Intelligence Pipeline',
      icon: AudioLines,
      color: '#4a8ad4',
      status: 'active',
      throughput: '8x realtime',
      models: ['Whisper-v3-large', 'Pyannote-v3'],
      queueSize: 0,
      processed: 428,
      errors: 0,
      avgLatency: '520ms',
    },
    {
      id: 4,
      name: 'Document Intelligence Pipeline',
      icon: FileText,
      color: '#8a8b92',
      status: 'idle',
      throughput: '25 pages/min',
      models: ['spaCy-en-core', 'all-MiniLM-L6-v2'],
      queueSize: 0,
      processed: 258,
      errors: 1,
      avgLatency: '310ms',
    },
    {
      id: 5,
      name: 'Cross-Modal Indexing',
      icon: Database,
      color: '#3dd4c4',
      status: 'active',
      throughput: '500 vec/sec',
      models: ['FAISS', 'Elasticsearch'],
      queueSize: 5,
      processed: 2847,
      errors: 3,
      avgLatency: '95ms',
    },
  ];

  const processingStages = [
    { stage: 'Ingestion', status: 'healthy', processed: 2847, errors: 0, latency: '12ms' },
    { stage: 'Preprocessing', status: 'healthy', processed: 2845, errors: 2, latency: '45ms' },
    { stage: 'Feature Extraction', status: 'warning', processed: 2840, errors: 5, latency: '280ms' },
    { stage: 'Indexing', status: 'healthy', processed: 2835, errors: 5, latency: '95ms' },
    { stage: 'Search Ready', status: 'healthy', processed: 2835, errors: 0, latency: '8ms' },
  ];

  const recentJobs = [
    { id: 1, asset: 'Patrol_Cam_042.mp4', type: 'video', pipeline: 'Video Intelligence', status: 'completed', duration: '2.4s', confidence: 0.94 },
    { id: 2, asset: 'SAR_IMG_1847.tiff', type: 'image', pipeline: 'Image Intelligence', status: 'completed', duration: '1.8s', confidence: 0.89 },
    { id: 3, asset: 'COMMS_2401.wav', type: 'audio', pipeline: 'Audio Intelligence', status: 'processing', duration: '5.2s', confidence: null },
    { id: 4, asset: 'INTEL_RPT_059.pdf', type: 'document', pipeline: 'Document Intelligence', status: 'completed', duration: '3.1s', confidence: 0.87 },
    { id: 5, asset: 'UAV_Feed_183.mp4', type: 'video', pipeline: 'Video Intelligence', status: 'failed', duration: '0.8s', confidence: null },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'healthy': case 'completed': return '#3dd4c4';
      case 'warning': case 'processing': return '#d4a25e';
      case 'error': case 'failed': return '#d43d3d';
      case 'idle': return '#8a8b92';
      default: return '#8a8b92';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': case 'healthy': case 'completed': return CheckCircle2;
      case 'warning': case 'processing': return Clock;
      case 'error': case 'failed': return AlertTriangle;
      default: return Activity;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="font-['Space_Grotesk']">Pipeline Monitor</h2>
        <p className="text-sm text-muted-foreground">Real-time intelligence processing pipeline status and analytics</p>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#3dd4c4]/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#3dd4c4]" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Active Pipelines</div>
              <div className="text-2xl font-['Space_Grotesk'] text-[#3dd4c4]">4/5</div>
            </div>
          </div>
          <Progress value={80} className="h-1 [&>div]:bg-[#3dd4c4]" />
        </div>

        <div className="glass-panel rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#d4a25e]/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#d4a25e]" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Throughput</div>
              <div className="text-2xl font-['Space_Grotesk'] text-[#d4a25e]">2.4K/hr</div>
            </div>
          </div>
          <Progress value={67} className="h-1 [&>div]:bg-[#d4a25e]" />
        </div>

        <div className="glass-panel rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#4a8ad4]/20 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-[#4a8ad4]" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">GPU Utilization</div>
              <div className="text-2xl font-['Space_Grotesk'] text-[#4a8ad4]">67%</div>
            </div>
          </div>
          <Progress value={67} className="h-1 [&>div]:bg-[#4a8ad4]" />
        </div>

        <div className="glass-panel rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#3dd4c4]/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#3dd4c4]" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Avg Latency</div>
              <div className="text-2xl font-['Space_Grotesk'] text-[#3dd4c4]">215ms</div>
            </div>
          </div>
          <Progress value={45} className="h-1 [&>div]:bg-[#3dd4c4]" />
        </div>
      </div>

      {/* Pipeline Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {pipelines.map((pipeline) => {
          const Icon = pipeline.icon;
          const StatusIcon = getStatusIcon(pipeline.status);
          
          return (
            <div key={pipeline.id} className="glass-panel rounded-lg p-5 glow-hover transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${pipeline.color}20`, border: `1px solid ${pipeline.color}40` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: pipeline.color }} />
                  </div>
                  <div>
                    <h4 className="font-['Space_Grotesk'] text-sm mb-1">{pipeline.name}</h4>
                    <div className="flex items-center gap-2">
                      <StatusIcon className="w-3 h-3" style={{ color: getStatusColor(pipeline.status) }} />
                      <span className="text-xs capitalize" style={{ color: getStatusColor(pipeline.status) }}>
                        {pipeline.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="glass-panel bg-[#1e1e26] rounded p-3 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Throughput</span>
                    <span style={{ color: pipeline.color }}>{pipeline.throughput}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Queue Size</span>
                    <Badge variant="outline" className="h-5" style={{ borderColor: `${pipeline.color}40` }}>
                      {pipeline.queueSize}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processed</span>
                    <span className="text-[#3dd4c4]">{pipeline.processed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Latency</span>
                    <span>{pipeline.avgLatency}</span>
                  </div>
                  {pipeline.errors > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Errors</span>
                      <span className="text-[#d43d3d]">{pipeline.errors}</span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-2">Active Models</div>
                  <div className="flex flex-wrap gap-1.5">
                    {pipeline.models.map((model, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="text-xs"
                        style={{ 
                          color: pipeline.color,
                          borderColor: `${pipeline.color}30`
                        }}
                      >
                        {model}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Processing Stages Flow */}
        <div className="glass-panel rounded-lg p-6">
          <h3 className="font-['Space_Grotesk'] mb-4">Processing Pipeline Flow</h3>
          <div className="space-y-4">
            {processingStages.map((stage, idx) => {
              const StatusIcon = getStatusIcon(stage.status);
              const color = getStatusColor(stage.status);

              return (
                <div key={idx}>
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${color}20`, border: `1px solid ${color}` }}
                    >
                      <StatusIcon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{stage.stage}</span>
                        <Badge 
                          variant="outline" 
                          className="text-xs capitalize"
                          style={{ color, borderColor: `${color}40` }}
                        >
                          {stage.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                        <span>{stage.processed.toLocaleString()} processed</span>
                        {stage.errors > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-[#d43d3d]">{stage.errors} errors</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{stage.latency}</span>
                      </div>
                    </div>
                  </div>
                  {idx < processingStages.length - 1 && (
                    <div className="ml-4 h-6 border-l-2 border-dashed border-border/50" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="glass-panel rounded-lg p-6">
          <h3 className="font-['Space_Grotesk'] mb-4">Recent Processing Jobs</h3>
          <ScrollArea className="h-[400px] custom-scrollbar pr-3">
            <div className="space-y-3">
              {recentJobs.map((job) => {
                const StatusIcon = getStatusIcon(job.status);
                const color = getStatusColor(job.status);

                return (
                  <div 
                    key={job.id}
                    className="p-3 rounded-lg bg-[#1e1e26] border border-border/30 hover:border-border/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <StatusIcon className="w-4 h-4 shrink-0" style={{ color }} />
                        <span className="text-sm font-mono truncate">{job.asset}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="text-xs capitalize ml-2"
                        style={{ color, borderColor: `${color}40` }}
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{job.pipeline}</span>
                      <span>•</span>
                      <span className="font-mono">{job.duration}</span>
                      {job.confidence && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[#3dd4c4]">
                            {(job.confidence * 100).toFixed(0)}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Model Versions */}
      <div className="glass-panel rounded-lg p-6">
        <h3 className="font-['Space_Grotesk'] mb-4">Deployed Model Versions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { model: 'YOLOv8-Naval', version: 'v2.1.4', updated: '2026-01-15', status: 'production' },
            { model: 'CLIP-ViT-L/14', version: 'v1.0.0', updated: '2026-01-10', status: 'production' },
            { model: 'Whisper-v3-large', version: 'v3.0.2', updated: '2026-01-20', status: 'production' },
            { model: 'spaCy-en-core', version: 'v3.7.2', updated: '2026-01-05', status: 'production' },
          ].map((model, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-[#1e1e26] border border-border/30">
              <div className="flex items-start justify-between mb-2">
                <div className="font-mono text-sm text-[#3dd4c4]">{model.model}</div>
                <Badge variant="outline" className="text-xs text-[#3dd4c4] border-[#3dd4c4]/30">
                  {model.status}
                </Badge>
              </div>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span>{model.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span>{model.updated}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
