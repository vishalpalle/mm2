import React, { useState } from 'react';
import { Upload, Video, Image, AudioLines, FileText, X, CheckCircle2, Clock, AlertTriangle, MapPin, Calendar, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';

interface UploadPanelProps {
  onClose: () => void;
  onVideoProcessed: (payload: {
    analysis: any;
    videoFile: File;
  }) => void;
}



const isVideoFile = (file: File) => {
  return file.type.startsWith('video');
};


export default function UploadPanel({ onClose ,onVideoProcessed}: UploadPanelProps) {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [dragging, setDragging] = useState(false);

  const acceptedTypes = {
    video: ['.mp4', '.mov', '.avi', '.mkv'],
    image: ['.jpg', '.jpeg', '.png', '.tiff', '.tif'],
    audio: ['.wav', '.mp3', '.flac', '.m4a'],
    document: ['.pdf', '.docx', '.txt', '.md'],
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('video')) return <Video className="w-5 h-5 text-[#3dd4c4]" />;
    if (type.startsWith('image')) return <Image className="w-5 h-5 text-[#d4a25e]" />;
    if (type.startsWith('audio')) return <AudioLines className="w-5 h-5 text-[#4a8ad4]" />;
    return <FileText className="w-5 h-5 text-[#8a8b92]" />;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
  const newFiles = files.map((file, idx) => ({
    id: Date.now() + idx,
    file, // 👈 keep raw file
    name: file.name,
    size: file.size,
    type: file.type,
    status: 'ready',
    progress: 0,
    source: 'UAV',
    classification: 'SECRET',
    region: '',
    timeWindow: '',
    analysis: null, // 👈 backend response
  }));
  setUploadedFiles(prev => [...prev, ...newFiles]);
};


 const processFile = async (fileObj: any) => {
  setUploadedFiles(prev =>
    prev.map(f =>
      f.id === fileObj.id
        ? { ...f, status: 'uploading', progress: 30 }
        : f
    )
  );

  try {
    if (isVideoFile(fileObj.file)) {
      const formData = new FormData();
      formData.append('file', fileObj.file, fileObj.file.name);

      const res = await fetch('http://127.0.0.1:8000/upload-video', {
        method: 'POST',
        headers: {
          accept: 'application/json',
        },
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Video processing failed: ${errText}`);
      }

      const analysis = await res.json();

      // TEMP: frontend playback (browser-selected file)
      analysis.video_url = URL.createObjectURL(fileObj.file);

      if (typeof onVideoProcessed === 'function') {
        onVideoProcessed({
          analysis,
          videoFile: fileObj.file,
        });
      }

      // update local file state
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileObj.id
            ? {
                ...f,
                status: 'indexed',
                progress: 100,
                analysis,
              }
            : f
        )
      );
    }
  } catch (err) {
    console.error(err);
    setUploadedFiles(prev =>
      prev.map(f =>
        f.id === fileObj.id ? { ...f, status: 'error' } : f
      )
    );
  }
};


  const processingStages = [
    { stage: 'Ingested', icon: CheckCircle2, color: '#3dd4c4' },
    { stage: 'Preprocessing', icon: Clock, color: '#d4a25e' },
    { stage: 'Feature Extraction', icon: Clock, color: '#d4a25e' },
    { stage: 'Indexed', icon: CheckCircle2, color: '#3dd4c4' },
    { stage: 'Searchable', icon: CheckCircle2, color: '#3dd4c4' },
  ];

  return (
    <div className="glass-panel rounded-lg overflow-hidden max-h-[85vh] flex flex-col">
      {/* Header */}
      <div className="bg-[#14141a] border-b border-border/50 p-6 flex items-center justify-between">
        <div>
          <h2 className="font-['Space_Grotesk'] mb-1">Upload Media</h2>
          <p className="text-sm text-muted-foreground">
            Upload video, image, audio, or document files for intelligence processing
          </p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          className="shrink-0"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-6 space-y-6">
          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
              dragging 
                ? 'border-[#3dd4c4] bg-[#3dd4c4]/5' 
                : 'border-border/50 hover:border-border'
            }`}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#3dd4c4]/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-[#3dd4c4]" />
            </div>
            <h3 className="font-['Space_Grotesk'] mb-2">Drop files here or click to browse</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Supports MP4, MOV, JPG, PNG, TIFF, WAV, MP3, PDF, DOCX
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
              id="file-input"
              accept={Object.values(acceptedTypes).flat().join(',')}
            />
            <label htmlFor="file-input">
              <Button className="bg-[#3dd4c4] hover:bg-[#2a8a7e] text-[#0a0a0f]" asChild>
                <span>Select Files</span>
              </Button>
            </label>
          </div>

          {/* Processing Pipeline Preview */}
          {uploadedFiles.length === 0 && (
            <div className="glass-panel rounded-lg p-6">
              <h3 className="font-['Space_Grotesk'] text-sm mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#d4a25e]" />
                Processing Pipeline
              </h3>
              <div className="space-y-3">
                {processingStages.map((stage, idx) => {
                  const Icon = stage.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ 
                          backgroundColor: `${stage.color}20`,
                          border: `1px solid ${stage.color}40`
                        }}
                      >
                        <Icon className="w-4 h-4" style={{ color: stage.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">{stage.stage}</div>
                      </div>
                      {idx < processingStages.length - 1 && (
                        <div className="h-px flex-1 bg-border/50" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-['Space_Grotesk']">Uploaded Files ({uploadedFiles.length})</h3>
                <Button
                  size="sm"
                  onClick={() => uploadedFiles.forEach(f => f.status === 'ready' && processFile(f))}
                  className="bg-[#3dd4c4] hover:bg-[#2a8a7e] text-[#0a0a0f]"
                >
                  Process All
                </Button>
              </div>

              {uploadedFiles.map((file) => (
                <div key={file.id} className="glass-panel rounded-lg p-4 space-y-4">
                  <div className="flex items-start gap-4">
                    {/* File Icon */}
                    <div className="w-12 h-12 rounded-lg bg-[#1e1e26] flex items-center justify-center shrink-0">
                      {getFileIcon(file.type)}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate mb-1">{file.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          {file.status === 'ready' && (
                            <Badge variant="outline" className="text-[#8a8b92] border-[#8a8b92]/30">
                              Ready
                            </Badge>
                          )}
                          {file.status === 'uploading' && (
                            <Badge variant="outline" className="text-[#d4a25e] border-[#d4a25e]/30">
                              Uploading
                            </Badge>
                          )}
                          {file.status === 'processing' && (
                            <Badge variant="outline" className="text-[#d4a25e] border-[#d4a25e]/30">
                              Processing
                            </Badge>
                          )}
                          {file.status === 'indexed' && (
                            <Badge className="bg-[#3dd4c4]/20 text-[#3dd4c4] border-[#3dd4c4]/30">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Indexed
                            </Badge>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-8 h-8"
                            onClick={() => setUploadedFiles(uploadedFiles.filter(f => f.id !== file.id))}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {file.status === 'uploading' && (
                        <div className="mb-3">
                          <Progress value={file.progress} className="h-1.5 [&>div]:bg-[#3dd4c4]" />
                        </div>
                      )}

                      {/* Metadata Form */}
                      {file.status === 'ready' && (
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Source</Label>
                            <Select 
                              value={file.source}
                              onValueChange={(value:any) => {
                                setUploadedFiles(prev => prev.map(f => 
                                  f.id === file.id ? { ...f, source: value } : f
                                ));
                              }}
                            >
                              <SelectTrigger className="h-9 bg-[#1e1e26] text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="UAV">UAV</SelectItem>
                                <SelectItem value="Satellite">Satellite</SelectItem>
                                <SelectItem value="Patrol">Patrol Camera</SelectItem>
                                <SelectItem value="OSINT">OSINT</SelectItem>
                                <SelectItem value="AIS">AIS</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Classification</Label>
                            <Select 
                              value={file.classification}
                              onValueChange={(value:any) => {
                                setUploadedFiles(prev => prev.map(f => 
                                  f.id === file.id ? { ...f, classification: value } : f
                                ));
                              }}
                            >
                              <SelectTrigger className="h-9 bg-[#1e1e26] text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="UNCLASSIFIED">UNCLASSIFIED</SelectItem>
                                <SelectItem value="CONFIDENTIAL">CONFIDENTIAL</SelectItem>
                                <SelectItem value="SECRET">SECRET</SelectItem>
                                <SelectItem value="TOP SECRET">TOP SECRET</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Region / AOI</Label>
                            <Input 
                              placeholder="e.g., Mediterranean"
                              className="h-9 bg-[#1e1e26] text-xs"
                              value={file.region}
                              onChange={(e) => {
                                setUploadedFiles(prev => prev.map(f => 
                                  f.id === file.id ? { ...f, region: e.target.value } : f
                                ));
                              }}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Time Window</Label>
                            <Input 
                              type="datetime-local"
                              className="h-9 bg-[#1e1e26] text-xs"
                              value={file.timeWindow}
                              onChange={(e) => {
                                setUploadedFiles(prev => prev.map(f => 
                                  f.id === file.id ? { ...f, timeWindow: e.target.value } : f
                                ));
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Processing Status */}
                      {(file.status === 'processing' || file.status === 'indexed') && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            {processingStages.map((stage, idx) => {
                              const Icon = stage.icon;
                              const isComplete = file.status === 'indexed' || idx < 3;
                              return (
                                <React.Fragment key={idx}>
                                  <div 
                                    className={`flex items-center gap-1.5 px-2 py-1 rounded ${
                                      isComplete ? 'bg-[#3dd4c4]/10' : 'bg-[#1e1e26]'
                                    }`}
                                  >
                                    <Icon 
                                      className="w-3 h-3" 
                                      style={{ color: isComplete ? stage.color : '#8a8b92' }} 
                                    />
                                    <span className={isComplete ? 'text-foreground' : 'text-muted-foreground'}>
                                      {stage.stage}
                                    </span>
                                  </div>
                                  {idx < processingStages.length - 1 && (
                                    <div className="w-4 h-px bg-border/50" />
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      {file.status === 'ready' && (
                        <Button
                        size="sm"
                        onClick={() => processFile(file)}
                        className="mt-3 bg-[#3dd4c4] hover:bg-[#2a8a7e] text-[#0a0a0f]"
                      >
                        Start Processing
                      </Button>

                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
