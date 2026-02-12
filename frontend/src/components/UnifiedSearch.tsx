import React, { useState } from 'react';
import { Search, Filter, Video, Image, AudioLines, FileText, TrendingUp, Clock, MapPin, Target, HelpCircle, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';

export default function UnifiedSearch() {
  const [searchMode, setSearchMode] = useState<'hybrid' | 'lexical' | 'semantic'>('hybrid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState([70]);

  const results = [
    {
      id: 1,
      type: 'video',
      title: 'Patrol_Cam_042',
      snippet: 'Vessel rendezvous detected at coordinates. Multiple cargo ships in formation.',
      thumbnail: 'https://images.unsplash.com/photo-1731579884331-95c1da04e988?w=400',
      semanticScore: 0.94,
      lexicalScore: 0.87,
      timestamp: '00:02:15',
      source: 'UAV Feed',
      pipeline: 'Video Intelligence',
      matches: ['vessel', 'rendezvous', 'cargo ships'],
      metadata: { location: 'Mediterranean', classification: 'SECRET' }
    },
    {
      id: 2,
      type: 'image',
      title: 'SAR_IMG_1847',
      snippet: 'Port infrastructure with multiple vessels. Hull number IMO 9234567 identified.',
      thumbnail: 'https://images.unsplash.com/photo-1760888330763-39c28be84782?w=400',
      semanticScore: 0.91,
      lexicalScore: 0.82,
      timestamp: null,
      source: 'Satellite',
      pipeline: 'Image Intelligence',
      matches: ['vessels', 'port', 'IMO 9234567'],
      metadata: { location: 'Malta', classification: 'SECRET' }
    },
    {
      id: 3,
      type: 'audio',
      title: 'COMMS_2401',
      snippet: 'Target vessel confirmed at grid reference. Maintain surveillance protocol.',
      thumbnail: null,
      semanticScore: 0.89,
      lexicalScore: 0.91,
      timestamp: '00:00:28',
      source: 'Radio Intercept',
      pipeline: 'Audio Intelligence',
      matches: ['target vessel', 'surveillance'],
      metadata: { channel: 'VHF 156.8MHz', classification: 'SECRET' }
    },
    {
      id: 4,
      type: 'document',
      title: 'INTEL_RPT_059',
      snippet: 'Maritime activity analysis showing increased vessel traffic and potential transshipment operations.',
      thumbnail: null,
      semanticScore: 0.87,
      lexicalScore: 0.88,
      timestamp: null,
      source: 'Intelligence Report',
      pipeline: 'Document Intelligence',
      matches: ['maritime activity', 'vessel traffic', 'transshipment'],
      metadata: { date: '2026-01-29', classification: 'SECRET//NOFORN' }
    },
    {
      id: 5,
      type: 'video',
      title: 'UAV_Feed_183',
      snippet: 'Loitering activity detected near restricted zone. Multiple contacts tracked.',
      thumbnail: 'https://images.unsplash.com/photo-1731579884331-95c1da04e988?w=400',
      semanticScore: 0.85,
      lexicalScore: 0.79,
      timestamp: '00:05:42',
      source: 'UAV Feed',
      pipeline: 'Video Intelligence',
      matches: ['loitering', 'restricted zone'],
      metadata: { location: 'Coastal Region', classification: 'CONFIDENTIAL' }
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-[#3dd4c4]" />;
      case 'image': return <Image className="w-4 h-4 text-[#d4a25e]" />;
      case 'audio': return <AudioLines className="w-4 h-4 text-[#4a8ad4]" />;
      case 'document': return <FileText className="w-4 h-4 text-[#8a8b92]" />;
      default: return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return '#3dd4c4';
    if (score >= 0.8) return '#d4a25e';
    return '#8a8b92';
  };

  return (
    <div className="h-full flex">
      {/* Left: Search and Filters */}
      <div className={`${showFilters ? 'w-80' : 'w-0'} transition-all duration-300 border-r border-border/50 overflow-hidden`}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-['Space_Grotesk']">Search Filters</h3>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowFilters(false)}
              className="w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Media Type Filter */}
          <div className="space-y-3">
            <h4 className="text-sm text-muted-foreground">Media Type</h4>
            <div className="space-y-2">
              {[
                { label: 'Video', icon: Video, color: '#3dd4c4' },
                { label: 'Image', icon: Image, color: '#d4a25e' },
                { label: 'Audio', icon: AudioLines, color: '#4a8ad4' },
                { label: 'Document', icon: FileText, color: '#8a8b92' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between p-2 rounded hover:bg-[#1e1e26]">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" style={{ color: item.color }} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Range */}
          <div className="space-y-3">
            <h4 className="text-sm text-muted-foreground">Time Range</h4>
            <Select defaultValue="24h">
              <SelectTrigger className="bg-[#1e1e26]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Confidence Threshold */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm text-muted-foreground">Min Confidence</h4>
              <span className="text-sm font-mono text-[#3dd4c4]">{confidenceThreshold[0]}%</span>
            </div>
            <Slider
              value={confidenceThreshold}
              onValueChange={setConfidenceThreshold}
              max={100}
              step={5}
              className="[&_[role=slider]]:bg-[#3dd4c4] [&_[role=slider]]:border-[#3dd4c4]"
            />
          </div>

          {/* Source Type */}
          <div className="space-y-3">
            <h4 className="text-sm text-muted-foreground">Source Type</h4>
            <Select defaultValue="all">
              <SelectTrigger className="bg-[#1e1e26]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="uav">UAV Feed</SelectItem>
                <SelectItem value="satellite">Satellite</SelectItem>
                <SelectItem value="patrol">Patrol Camera</SelectItem>
                <SelectItem value="radio">Radio Intercept</SelectItem>
                <SelectItem value="osint">OSINT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Classification Level */}
          <div className="space-y-3">
            <h4 className="text-sm text-muted-foreground">Classification</h4>
            <Select defaultValue="all">
              <SelectTrigger className="bg-[#1e1e26]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="ts">TOP SECRET</SelectItem>
                <SelectItem value="s">SECRET</SelectItem>
                <SelectItem value="c">CONFIDENTIAL</SelectItem>
                <SelectItem value="u">UNCLASSIFIED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full bg-[#d43d3d] hover:bg-[#b83535] text-white">
            Clear All Filters
          </Button>
        </div>
      </div>

      {/* Right: Search and Results */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Search Bar */}
        <div className="p-6 border-b border-border/50 space-y-4">
          <div className="flex gap-3">
            {!showFilters && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(true)}
                className="border-[#3dd4c4]/30"
              >
                <Filter className="w-4 h-4" />
              </Button>
            )}
            
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across video, image, audio, and documents..."
                className="pl-11 h-12 bg-[#1e1e26] border-border/50 focus:border-[#3dd4c4]"
              />
            </div>

            <Button className="h-12 px-6 bg-[#3dd4c4] hover:bg-[#2a8a7e] text-[#0a0a0f]">
              Search
            </Button>
          </div>

          {/* Search Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">Search Mode:</span>
            <div className="flex gap-2">
              {[
                { mode: 'lexical' as const, label: 'Lexical (BM25)', desc: 'Keyword matching' },
                { mode: 'semantic' as const, label: 'Semantic (Vector)', desc: 'Meaning-based' },
                { mode: 'hybrid' as const, label: 'Hybrid', desc: 'Best of both' },
              ].map((item) => (
                <Button
                  key={item.mode}
                  size="sm"
                  variant={searchMode === item.mode ? 'default' : 'outline'}
                  onClick={() => setSearchMode(item.mode)}
                  className={searchMode === item.mode ? 'bg-[#3dd4c4] text-[#0a0a0f]' : 'border-border/50'}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <ScrollArea className="flex-1 custom-scrollbar">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                Found <span className="text-[#3dd4c4] font-mono">{results.length}</span> results in{' '}
                <span className="font-mono">0.24s</span>
              </div>
              <Select defaultValue="relevance">
                <SelectTrigger className="w-40 bg-[#1e1e26]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Sort by Relevance</SelectItem>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="confidence">Sort by Confidence</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {results.map((result) => (
              <div key={result.id} className="glass-panel rounded-lg p-5 glow-hover cursor-pointer transition-all hover:border-[#3dd4c4]/30">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  {result.thumbnail && (
                    <div className="w-32 h-24 rounded overflow-hidden shrink-0 bg-[#1e1e26]">
                      <img 
                        src={result.thumbnail} 
                        alt={result.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(result.type)}
                        <h4 className="font-['Space_Grotesk'] text-sm">{result.title}</h4>
                        {result.timestamp && (
                          <Badge variant="outline" className="text-xs font-mono border-[#d4a25e]/30 text-[#d4a25e]">
                            {result.timestamp}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-mono text-right">
                          <div className="text-muted-foreground">Semantic</div>
                          <div style={{ color: getScoreColor(result.semanticScore) }}>
                            {(result.semanticScore * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div className="text-xs font-mono text-right">
                          <div className="text-muted-foreground">Lexical</div>
                          <div style={{ color: getScoreColor(result.lexicalScore) }}>
                            {(result.lexicalScore * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                      {result.snippet.split(' ').map((word, i) => {
                        const isMatch = result.matches.some(match => 
                          word.toLowerCase().includes(match.toLowerCase().split(' ')[0])
                        );
                        return (
                          <span key={i} className={isMatch ? 'text-[#3dd4c4] font-medium' : ''}>
                            {word}{' '}
                          </span>
                        );
                      })}
                    </p>

                    <div className="flex items-center gap-3 text-xs">
                      <Badge variant="outline" className="text-[#3dd4c4] border-[#3dd4c4]/30">
                        {result.source}
                      </Badge>
                      <Badge variant="outline" className="border-border/50">
                        {result.pipeline}
                      </Badge>
                      {result.metadata.location && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {result.metadata.location}
                        </div>
                      )}
                      <Badge variant="outline" className="text-[#d43d3d] border-[#d43d3d]/30 ml-auto">
                        {result.metadata.classification}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Why this result? */}
                <details className="mt-4 pt-4 border-t border-border/50">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Why this result?
                  </summary>
                  <div className="mt-3 p-3 bg-[#1e1e26] rounded text-xs space-y-2">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-[#3dd4c4] mt-0.5" />
                      <div>
                        <div className="text-[#3dd4c4] font-medium mb-1">Semantic Match</div>
                        <div className="text-muted-foreground">
                          Vector embedding similarity of {(result.semanticScore * 100).toFixed(1)}% indicates strong conceptual relevance to your query.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Target className="w-3.5 h-3.5 text-[#d4a25e] mt-0.5" />
                      <div>
                        <div className="text-[#d4a25e] font-medium mb-1">Keyword Matches</div>
                        <div className="text-muted-foreground">
                          Found direct matches: {result.matches.map((m, i) => (
                            <span key={i} className="text-[#3dd4c4]">
                              {i > 0 && ', '}{m}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
