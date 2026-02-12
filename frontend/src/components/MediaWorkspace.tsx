import React, { useState } from 'react';
import UploadPanel from './UploadPanel';
import VideoIntelligence, {
  VideoAnalysis,
} from './VideoIntelligence';

export default function MediaWorkspace() {
  const [videoAnalysis, setVideoAnalysis] =
    useState<VideoAnalysis | null>(null);

  const [videoFile, setVideoFile] =
    useState<File | null>(null);

  const [showUpload, setShowUpload] = useState(true);

  // ✅ MATCHES UploadPanel CONTRACT
  const handleVideoProcessed = ({
    analysis,
    videoFile,
  }: {
    analysis: VideoAnalysis;
    videoFile: File;
  }) => {
    setVideoAnalysis(analysis);
    setVideoFile(videoFile);
    setShowUpload(false);
  };

  return (
    <div className="h-full w-full">
      {showUpload && (
        <UploadPanel
          onClose={() => setShowUpload(false)}
          onVideoProcessed={handleVideoProcessed}
        />
      )}

      {!showUpload && videoAnalysis && videoFile && (
        <VideoIntelligence
          analysis={videoAnalysis}
          videoFile={videoFile}
        />
      )}
    </div>
  );
}
