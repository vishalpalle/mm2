import React, { useState } from 'react';
import { Play, Pause, Volume2, Radio, MessageSquare, User, Globe, Hash, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export default function AudioIntelligence() {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(45);
  const duration = 187;

  const transcript = [
    { 
      id: 1, 
      time: '00:00:12', 
      seconds: 12,
      speaker: 'Speaker 1', 
      text: 'Charlie-Two-Three, this is Command. Report your current position.',
      keywords: ['Command', 'position'],
      confidence: 0.95 
    },
    { 
      id: 2, 
      time: '00:00:18', 
      seconds: 18,
      speaker: 'Speaker 2', 
      text: 'Command, Charlie-Two-Three. We are at grid reference Quebec-Seven-Four-Nine, bearing one-eight-zero.',
      keywords: ['Quebec-Seven-Four-Nine', 'bearing', 'one-eight-zero'],
      confidence: 0.92 
    },
    { 
      id: 3, 
      time: '00:00:28', 
      seconds: 28,
      speaker: 'Speaker 1', 
      text: 'Copy that. Maintain surveillance on the target vessel. Report any suspicious activity immediately.',
      keywords: ['surveillance', 'target vessel', 'suspicious'],
      confidence: 0.94 
    },
    { 
      id: 4, 
      time: '00:00:38', 
      seconds: 38,
      speaker: 'Speaker 2', 
      text: 'Affirmative. Target is currently stationary. No movement detected in the past fifteen minutes.',
      keywords: ['target', 'stationary', 'no movement'],
      confidence: 0.91 
    },
    { 
      id: 5, 
      time: '00:00:45', 
      seconds: 45,
      speaker: 'Speaker 1', 
      text: 'Roger. Continue monitoring. Command out.',
      keywords: ['monitoring'],
      confidence: 0.96 
    },
  ];

  const speakers = [
    { id: 1, name: 'Speaker 1', voiceprint: 'VP-A1B2C3', role: 'Command Officer', confidence: 0.89, segments: 3 },
    { id: 2, name: 'Speaker 2', voiceprint: 'VP-D4E5F6', role: 'Field Operative', confidence: 0.91, segments: 2 },
  ];

  const keywords = [
    { word: 'Command', count: 3, category: 'callsign', importance: 'high' },
    { word: 'target', count: 2, category: 'objective', importance: 'high' },
    { word: 'position', count: 2, category: 'location', importance: 'medium' },
    { word: 'surveillance', count: 1, category: 'operation', importance: 'high' },
    { word: 'vessel', count: 1, category: 'asset', importance: 'medium' },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex">
      {/* Left: Waveform Viewer */}
      <div className="w-2/3 p-6 space-y-4">
        <div className="glass-panel rounded-lg overflow-hidden">
          {/* Audio Info Header */}
          <div className="bg-[#14141a] border-b border-border/50 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-['Space_Grotesk'] mb-1">COMMS_2401_A</h3>
                <p className="text-xs text-muted-foreground">Maritime Communication Intercept</p>
              </div>
              <Badge className="bg-[#d4a25e]/20 text-[#d4a25e] border-[#d4a25e]/30">
                Classification: SECRET
              </Badge>
            </div>
            <div className="grid grid-cols-4 gap-3 text-xs font-mono">
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <span className="ml-2 text-[#3dd4c4]">{formatTime(duration)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Format:</span>
                <span className="ml-2">WAV 48kHz</span>
              </div>
              <div>
                <span className="text-muted-foreground">Source:</span>
                <span className="ml-2 text-[#d4a25e]">Radio Intercept</span>
              </div>
              <div>
                <span className="text-muted-foreground">Channel:</span>
                <span className="ml-2">VHF 156.8MHz</span>
              </div>
            </div>
          </div>

          {/* Waveform Display */}
          <div className="relative h-64 bg-[#0a0a0f] p-6">
            {/* Waveform visualization */}
            <div className="h-full flex items-center gap-0.5">
              {Array.from({ length: 100 }).map((_, i) => {
                const height = Math.sin(i * 0.3) * 40 + Math.random() * 30 + 30;
                const isActive = i < (currentTime / duration) * 100;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-colors ${
                      isActive ? 'bg-[#3dd4c4]' : 'bg-[#2a2a34]'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>

            {/* Transcript highlight markers */}
            {transcript.map((item) => {
              const position = (item.seconds / duration) * 100;
              const isNear = Math.abs(item.seconds - currentTime) < 5;
              return (
                <div
                  key={item.id}
                  className={`absolute bottom-4 w-0.5 h-8 transition-all cursor-pointer ${
                    isNear ? 'bg-[#d4a25e] h-12' : 'bg-[#d4a25e]/50'
                  }`}
                  style={{ left: `${position}%` }}
                  onClick={() => setCurrentTime(item.seconds)}
                >
                  {isNear && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-[#d4a25e] text-[#0a0a0f] px-2 py-1 rounded text-xs font-mono">
                      {item.speaker}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Current time indicator */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-[#3dd4c4]"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-[#3dd4c4] rounded-full" />
            </div>
          </div>

          {/* Controls */}
          <div className="bg-[#14141a] border-t border-border/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => setPlaying(!playing)}
                  className="w-10 h-10 p-0 bg-[#3dd4c4] hover:bg-[#2a8a7e] text-[#0a0a0f]"
                >
                  {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <div className="font-mono text-sm">
                  <span className="text-[#3dd4c4]">{formatTime(currentTime)}</span>
                  <span className="text-muted-foreground"> / {formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <div className="w-24 h-1.5 bg-[#1e1e26] rounded-full">
                  <div className="w-3/4 h-full bg-[#3dd4c4] rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transcript with Timestamps */}
        <div className="glass-panel rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-['Space_Grotesk']">ASR Transcript</h3>
            <Badge variant="outline" className="text-[#3dd4c4] border-[#3dd4c4]/30">
              Real-time
            </Badge>
          </div>

          <ScrollArea className="h-80 custom-scrollbar pr-4">
            <div className="space-y-4">
              {transcript.map((item) => {
                const isActive = Math.abs(item.seconds - currentTime) < 3;
                return (
                  <div 
                    key={item.id}
                    className={`p-4 rounded-lg transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#3dd4c4]/10 border border-[#3dd4c4]/30' 
                        : 'bg-[#1e1e26] border border-transparent hover:border-border/50'
                    }`}
                    onClick={() => setCurrentTime(item.seconds)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-[#d4a25e]" />
                        <span className="text-sm font-medium">{item.speaker}</span>
                        <span className="text-xs text-muted-foreground font-mono">{item.time}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {(item.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <p className="text-sm leading-relaxed">
                      {item.text.split(' ').map((word, i) => {
                        const isKeyword = item.keywords.some(kw => 
                          word.toLowerCase().includes(kw.toLowerCase().replace(/[^a-z0-9]/g, ''))
                        );
                        return (
                          <span 
                            key={i}
                            className={isKeyword ? 'text-[#3dd4c4] font-medium' : ''}
                          >
                            {word}{' '}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Right: Intelligence Panels */}
      <div className="w-1/3 border-l border-border/50">
        <ScrollArea className="h-full custom-scrollbar">
          <div className="p-6 space-y-4">
            <Tabs defaultValue="speakers" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-[#1e1e26]">
                <TabsTrigger value="speakers">Speakers</TabsTrigger>
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="speakers" className="space-y-3 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm">Speaker Diarization</h3>
                  <Badge variant="outline" className="text-[#d4a25e] border-[#d4a25e]/30">
                    {speakers.length} Speakers
                  </Badge>
                </div>

                {speakers.map((speaker) => (
                  <div key={speaker.id} className="glass-panel rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-[#d4a25e]" />
                          <span className="font-['Space_Grotesk'] text-sm">{speaker.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{speaker.role}</div>
                      </div>
                      <Badge className="bg-[#d4a25e]/20 text-[#d4a25e]">
                        {(speaker.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>

                    <div className="glass-panel bg-[#1e1e26] rounded p-2 text-xs font-mono">
                      <div className="text-muted-foreground">Voiceprint ID</div>
                      <div className="text-[#3dd4c4] mt-1">{speaker.voiceprint}</div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Segments</span>
                        <span className="font-mono">{speaker.segments}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Model</span>
                        <span className="font-mono text-[#d4a25e]">Pyannote-v3</span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="glass-panel rounded-lg p-4 mt-4">
                  <h4 className="text-sm mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#4a8ad4]" />
                    Language Detection
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">English</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-[#1e1e26] rounded-full overflow-hidden">
                          <div className="w-[99%] h-full bg-[#3dd4c4]" />
                        </div>
                        <span className="font-mono text-[#3dd4c4]">99%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="keywords" className="space-y-3 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm">Keyword Spotting</h3>
                  <Badge variant="outline" className="text-[#3dd4c4] border-[#3dd4c4]/30">
                    {keywords.length} Keywords
                  </Badge>
                </div>

                {keywords.map((kw, idx) => (
                  <div key={idx} className="glass-panel rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-[#3dd4c4]" />
                        <span className="font-mono text-sm">{kw.word}</span>
                      </div>
                      <Badge 
                        variant="outline"
                        className={`text-xs ${
                          kw.importance === 'high' ? 'text-[#d43d3d] border-[#d43d3d]/30' :
                          kw.importance === 'medium' ? 'text-[#d4a25e] border-[#d4a25e]/30' :
                          'text-[#3dd4c4] border-[#3dd4c4]/30'
                        }`}
                      >
                        {kw.importance.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Occurrences</span>
                        <span className="font-mono text-[#3dd4c4]">{kw.count}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category</span>
                        <Badge variant="outline" className="text-xs h-5">
                          {kw.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="glass-panel rounded-lg p-4 mt-4">
                  <h4 className="text-sm mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#d4a25e]" />
                    Keyword Distribution
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Callsigns</span>
                      <span className="font-mono text-[#3dd4c4]">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Objectives</span>
                      <span className="font-mono text-[#d4a25e]">2</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Locations</span>
                      <span className="font-mono">2</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-3 mt-4">
                <div className="glass-panel rounded-lg p-4">
                  <h4 className="text-sm mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#3dd4c4]" />
                    Semantic Embeddings
                  </h4>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model</span>
                      <span className="text-[#3dd4c4]">Whisper-v3-large</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Embedding Size</span>
                      <span>1024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Indexed</span>
                      <span className="text-[#3dd4c4]">Yes</span>
                    </div>
                  </div>
                </div>

                <div className="glass-panel rounded-lg p-4">
                  <h4 className="text-sm mb-3">Confidence Scores</h4>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Transcription</span>
                        <span className="font-mono text-[#3dd4c4]">94%</span>
                      </div>
                      <div className="h-1.5 bg-[#1e1e26] rounded-full overflow-hidden">
                        <div className="w-[94%] h-full bg-[#3dd4c4]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Diarization</span>
                        <span className="font-mono text-[#d4a25e]">90%</span>
                      </div>
                      <div className="h-1.5 bg-[#1e1e26] rounded-full overflow-hidden">
                        <div className="w-[90%] h-full bg-[#d4a25e]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Keywords</span>
                        <span className="font-mono text-[#4a8ad4]">88%</span>
                      </div>
                      <div className="h-1.5 bg-[#1e1e26] rounded-full overflow-hidden">
                        <div className="w-[88%] h-full bg-[#4a8ad4]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel rounded-lg p-4">
                  <h4 className="text-sm mb-3 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-[#d4a25e]" />
                    Source Attribution
                  </h4>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Source Type</span>
                      <span className="text-[#d4a25e]">Radio Intercept</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Channel</span>
                      <span>VHF 156.8MHz</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Classification</span>
                      <span className="text-[#d43d3d]">SECRET</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capture Time</span>
                      <span>2026-01-29 14:45</span>
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
