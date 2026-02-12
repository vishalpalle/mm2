import React, { useState } from 'react';
import {
  LayoutDashboard,
  Video,
  Image as ImageIcon,
  AudioLines,
  FileText,
  Search,
  Map,
  Activity,
  Upload,
  ChevronLeft,
  ChevronRight,
  Database,
} from 'lucide-react';

import { Button } from './components/ui/button';
import { ScrollArea } from './components/ui/scroll-area';

import Dashboard from './components/Dashboard';
import VideoIntelligence, {
  VideoAnalysis,
} from './components/VideoIntelligence';
import ImageIntelligence from './components/ImageIntelligence';
import AudioIntelligence from './components/AudioIntelligence';
import DocumentIntelligence from './components/DocumentIntelligence';
import UnifiedSearch from './components/UnifiedSearch';
import MapIntelligence from './components/MapIntelligence';
import PipelineMonitor from './components/PipelineMonitor';
import UploadPanel from './components/UploadPanel';

type ViewType =
  | 'dashboard'
  | 'video'
  | 'image'
  | 'audio'
  | 'document'
  | 'search'
  | 'map'
  | 'pipeline';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [mapViewActive, setMapViewActive] = useState(false);

  // ✅ STORE BOTH
  const [videoAnalysis, setVideoAnalysis] =
    useState<VideoAnalysis | null>(null);
  const [videoFile, setVideoFile] =
    useState<File | null>(null);

  // ✅ MUST MATCH UploadPanel SIGNATURE
  const handleVideoProcessed = (payload: {
    analysis: VideoAnalysis;
    videoFile: File;
  }) => {
    setVideoAnalysis(payload.analysis);
    setVideoFile(payload.videoFile);
    setUploadOpen(false);
    setCurrentView('video');
  };

  const navItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'video' as ViewType, label: 'Video', icon: Video },
    { id: 'image' as ViewType, label: 'Image', icon: ImageIcon },
    { id: 'audio' as ViewType, label: 'Audio', icon: AudioLines },
    { id: 'document' as ViewType, label: 'Document', icon: FileText },
    { id: 'search' as ViewType, label: 'Unified Search', icon: Search },
    { id: 'map' as ViewType, label: 'Map Intelligence', icon: Map },
    { id: 'pipeline' as ViewType, label: 'Pipeline Monitor', icon: Activity },
  ];

  const renderView = () => {
    if (mapViewActive) return <MapIntelligence />;

    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;

      case 'video':
        if (!videoAnalysis || !videoFile) {
          return (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#3dd4c4]/10 flex items-center justify-center">
                <Video className="w-8 h-8 text-[#3dd4c4]" />
              </div>
              <h2 className="text-xl font-['Space_Grotesk']">No Video Loaded</h2>
              <p className="text-muted-foreground max-w-md text-center">
                Upload a video from the dashboard or using the upload button above to view intelligence analysis.
              </p>
              <Button onClick={() => setUploadOpen(true)} className="bg-[#3dd4c4] text-[#0a0a0f] hover:bg-[#2a8a7e]">
                <Upload className="mr-2 w-4 h-4" />
                Upload Video
              </Button>
            </div>
          );
        }
        return (
          <VideoIntelligence
            analysis={videoAnalysis}
            videoFile={videoFile}
          />
        );

      case 'image':
        return <ImageIntelligence />;

      case 'audio':
        return <AudioIntelligence />;

      case 'document':
        return <DocumentIntelligence />;

      case 'search':
        return <UnifiedSearch />;

      case 'map':
        return <MapIntelligence />;

      case 'pipeline':
        return <PipelineMonitor />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="dark min-h-screen bg-[#0a0a0f] text-foreground">
      {/* TOP BAR */}
      <div className="sticky top-0 z-50 border-b p-4 flex justify-between">
        <div className="flex items-center gap-2">
          <Database />
          <span>Multimodal Intelligence Search</span>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2" />
            Upload Media
          </Button>

          <Button variant="outline" onClick={() => setMapViewActive(!mapViewActive)}>
            <Map className="mr-2" />
            Map View
          </Button>
        </div>
      </div>

      {/* UPLOAD MODAL */}
      {uploadOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-4xl">
            <UploadPanel
              onClose={() => setUploadOpen(false)}
              onVideoProcessed={handleVideoProcessed}
            />
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
      {/* ================= MAIN LAYOUT ================= */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div
          className={`${sidebarCollapsed ? 'w-16' : 'w-64'
            } transition-all duration-300 glass-panel border-r border-border/50 flex flex-col`}
        >
          {/* Collapse Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-12 flex items-center justify-center border-b border-border/50 hover:bg-[#1e1e26]"
          >
            {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>

          {/* Navigation */}
          <ScrollArea className="flex-1 custom-scrollbar">
            <div className="p-2 space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id && !mapViewActive;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setMapViewActive(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                        ? 'bg-[#3dd4c4]/20 text-[#3dd4c4] border border-[#3dd4c4]/30'
                        : 'hover:bg-[#1e1e26] text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          {/* System Status */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-border/50 space-y-2">
              <div className="text-xs text-muted-foreground font-mono">
                SYSTEM STATUS
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">GPU Usage</span>
                  <span className="text-[#3dd4c4] font-mono">67%</span>
                </div>
                <div className="h-1 bg-[#1e1e26] rounded-full overflow-hidden">
                  <div className="h-full w-[67%] bg-gradient-to-r from-[#3dd4c4] to-[#2a8a7e]" />
                </div>

                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-muted-foreground">Storage</span>
                  <span className="text-[#d4a25e] font-mono">2.4TB</span>
                </div>
                <div className="h-1 bg-[#1e1e26] rounded-full overflow-hidden">
                  <div className="h-full w-[43%] bg-gradient-to-r from-[#d4a25e] to-[#8a6d3e]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {renderView()}
        </div>
      </div>

    </div>
  );
}
