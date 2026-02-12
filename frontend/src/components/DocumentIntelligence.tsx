import React, { useState } from 'react';
import { FileText, MapPin, Building, Users, Calendar, Target, TrendingUp, Shield, Hash } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export default function DocumentIntelligence() {
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  const documentText = `INTELLIGENCE REPORT #059
Classification: SECRET//NOFORN
Date: 2026-01-29
Subject: Maritime Activity Analysis - Mediterranean Region

Executive Summary:
Recent surveillance operations in the Mediterranean Sea have identified increased maritime activity near grid reference Quebec-Seven-Four-Nine. Multiple vessels of interest have been observed conducting operations consistent with potential transshipment activities.

Vessel Identification:
Primary vessel identified as cargo ship IMO 9234567 operating under Maltese flag registration. Secondary vessel MMSI 235894120 observed in close proximity for extended duration (2.5 hours).

Geographic Analysis:
Operations centered at coordinates 35.8522° N, 14.5156° E within Maltese territorial waters. Port infrastructure at Valletta observed as primary staging area.

Temporal Pattern:
Activity peak observed between 1400-1800 UTC across multiple observation periods. Pattern suggests coordinated operational schedule.

Recommendation:
Continue enhanced monitoring. Deploy additional ISR assets to maintain persistent surveillance of identified vessels and associated infrastructure.`;

  const entities = [
    { 
      type: 'Location', 
      icon: MapPin, 
      color: '#3dd4c4',
      items: [
        { name: 'Mediterranean Sea', confidence: 0.96, mentions: 2, context: 'Geographic region' },
        { name: 'Malta', confidence: 0.94, mentions: 2, context: 'Territorial waters' },
        { name: 'Valletta', confidence: 0.91, mentions: 1, context: 'Port city' },
        { name: 'Quebec-Seven-Four-Nine', confidence: 0.89, mentions: 1, context: 'Grid reference' },
      ]
    },
    { 
      type: 'Asset', 
      icon: Target, 
      color: '#d4a25e',
      items: [
        { name: 'IMO 9234567', confidence: 0.98, mentions: 1, context: 'Cargo vessel identifier' },
        { name: 'MMSI 235894120', confidence: 0.95, mentions: 1, context: 'Maritime identifier' },
        { name: 'Cargo Ship', confidence: 0.93, mentions: 1, context: 'Vessel type' },
      ]
    },
    { 
      type: 'Organization', 
      icon: Building, 
      color: '#4a8ad4',
      items: [
        { name: 'Maltese Flag', confidence: 0.88, mentions: 1, context: 'Registration' },
      ]
    },
    { 
      type: 'Event', 
      icon: Activity, 
      color: '#d43d3d',
      items: [
        { name: 'Transshipment Activity', confidence: 0.87, mentions: 1, context: 'Suspected operation' },
        { name: 'Surveillance Operation', confidence: 0.92, mentions: 2, context: 'Intelligence collection' },
      ]
    },
  ];

  const geoparsedLocations = [
    { name: 'Mediterranean Sea', lat: 35.8522, lon: 14.5156, type: 'Region', confidence: 0.96 },
    { name: 'Malta', lat: 35.9375, lon: 14.3754, type: 'Country', confidence: 0.94 },
    { name: 'Valletta', lat: 35.8989, lon: 14.5146, type: 'City', confidence: 0.91 },
  ];

  const topics = [
    { name: 'Maritime Surveillance', relevance: 0.94, keywords: ['surveillance', 'monitoring', 'ISR'] },
    { name: 'Vessel Tracking', relevance: 0.89, keywords: ['vessel', 'ship', 'cargo'] },
    { name: 'Transshipment', relevance: 0.82, keywords: ['transshipment', 'activity', 'operations'] },
    { name: 'Geographic Intelligence', relevance: 0.76, keywords: ['coordinates', 'location', 'region'] },
  ];

  const getEntityIcon = (Icon: any, color: string) => {
    return <Icon className="w-4 h-4" style={{ color }} />;
  };

  return (
    <div className="h-full flex">
      {/* Left: Document Viewer */}
      <div className="w-2/3 p-6 space-y-4">
        <div className="glass-panel rounded-lg overflow-hidden">
          {/* Document Header */}
          <div className="bg-[#14141a] border-b border-border/50 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-['Space_Grotesk'] mb-1 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#3dd4c4]" />
                  INTEL_RPT_059.pdf
                </h3>
                <p className="text-xs text-muted-foreground">Intelligence Report - Maritime Activity Analysis</p>
              </div>
              <Badge className="bg-[#d43d3d]/20 text-[#d43d3d] border-[#d43d3d]/30">
                SECRET//NOFORN
              </Badge>
            </div>
            <div className="grid grid-cols-4 gap-3 text-xs font-mono">
              <div>
                <span className="text-muted-foreground">Pages:</span>
                <span className="ml-2 text-[#3dd4c4]">1 of 3</span>
              </div>
              <div>
                <span className="text-muted-foreground">Format:</span>
                <span className="ml-2">PDF</span>
              </div>
              <div>
                <span className="text-muted-foreground">Size:</span>
                <span className="ml-2">2.4MB</span>
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>
                <span className="ml-2 text-[#d4a25e]">2026-01-29</span>
              </div>
            </div>
          </div>

          {/* Document Content */}
          <ScrollArea className="h-[600px] custom-scrollbar">
            <div className="p-8 bg-[#0a0a0f]">
              <div className="max-w-3xl mx-auto bg-white text-black p-8 rounded shadow-2xl font-serif leading-relaxed">
                {documentText.split('\n\n').map((paragraph, idx) => {
                  const highlightedText = paragraph.split(' ').map((word, wordIdx) => {
                    // Check if word matches any entity
                    let isEntity = false;
                    let entityColor = '';
                    let entityType = '';

                    entities.forEach(entityGroup => {
                      entityGroup.items.forEach(item => {
                        if (word.includes(item.name) || item.name.includes(word.replace(/[,:]/g, ''))) {
                          isEntity = true;
                          entityColor = entityGroup.color;
                          entityType = entityGroup.type;
                        }
                      });
                    });

                    if (isEntity) {
                      return (
                        <span
                          key={wordIdx}
                          className="font-semibold cursor-pointer hover:underline px-0.5 rounded"
                          style={{ 
                            color: entityColor,
                            backgroundColor: `${entityColor}15`
                          }}
                          onClick={() => setSelectedEntity(word)}
                        >
                          {word}{' '}
                        </span>
                      );
                    }

                    return <span key={wordIdx}>{word} </span>;
                  });

                  return (
                    <p key={idx} className="mb-4 text-sm">
                      {highlightedText}
                    </p>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Document Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="glass-panel rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Entities</div>
            <div className="text-xl font-['Space_Grotesk'] text-[#3dd4c4]">
              {entities.reduce((sum, e) => sum + e.items.length, 0)}
            </div>
          </div>
          <div className="glass-panel rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Locations</div>
            <div className="text-xl font-['Space_Grotesk'] text-[#d4a25e]">{geoparsedLocations.length}</div>
          </div>
          <div className="glass-panel rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Topics</div>
            <div className="text-xl font-['Space_Grotesk'] text-[#4a8ad4]">{topics.length}</div>
          </div>
          <div className="glass-panel rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Confidence</div>
            <div className="text-xl font-['Space_Grotesk'] text-[#3dd4c4]">91%</div>
          </div>
        </div>
      </div>

      {/* Right: Entity Extraction Panels */}
      <div className="w-1/3 border-l border-border/50">
        <ScrollArea className="h-full custom-scrollbar">
          <div className="p-6 space-y-4">
            <Tabs defaultValue="entities" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-[#1e1e26]">
                <TabsTrigger value="entities">Entities</TabsTrigger>
                <TabsTrigger value="locations">Locations</TabsTrigger>
                <TabsTrigger value="topics">Topics</TabsTrigger>
              </TabsList>

              <TabsContent value="entities" className="space-y-3 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm">Named Entity Recognition</h3>
                  <Badge variant="outline" className="text-[#3dd4c4] border-[#3dd4c4]/30">
                    {entities.reduce((sum, e) => sum + e.items.length, 0)} Found
                  </Badge>
                </div>

                {entities.map((entityGroup, idx) => {
                  const Icon = entityGroup.icon;
                  return (
                    <div key={idx} className="glass-panel rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="w-4 h-4" style={{ color: entityGroup.color }} />
                        <h4 className="text-sm font-['Space_Grotesk']">{entityGroup.type}</h4>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {entityGroup.items.length}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        {entityGroup.items.map((item, itemIdx) => (
                          <div 
                            key={itemIdx}
                            className="p-3 rounded bg-[#1e1e26] hover:bg-[#2a2a34] transition-colors cursor-pointer"
                            onClick={() => setSelectedEntity(item.name)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{item.name}</span>
                              <Badge 
                                className="text-xs"
                                style={{ 
                                  backgroundColor: `${entityGroup.color}20`,
                                  color: entityGroup.color,
                                  borderColor: `${entityGroup.color}30`
                                }}
                              >
                                {(item.confidence * 100).toFixed(0)}%
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">{item.context}</div>
                            <div className="text-xs text-muted-foreground font-mono mt-1">
                              {item.mentions} mention{item.mentions > 1 ? 's' : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="glass-panel rounded-lg p-4">
                  <h4 className="text-sm mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#d4a25e]" />
                    Source Credibility
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Reliability</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-[#1e1e26] rounded-full overflow-hidden">
                          <div className="w-[92%] h-full bg-[#3dd4c4]" />
                        </div>
                        <span className="font-mono text-[#3dd4c4]">A</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Credibility</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-[#1e1e26] rounded-full overflow-hidden">
                          <div className="w-[88%] h-full bg-[#d4a25e]" />
                        </div>
                        <span className="font-mono text-[#d4a25e]">2</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="locations" className="space-y-3 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm">Geoparsed Locations</h3>
                  <Badge variant="outline" className="text-[#3dd4c4] border-[#3dd4c4]/30">
                    {geoparsedLocations.length} Locations
                  </Badge>
                </div>

                {geoparsedLocations.map((loc, idx) => (
                  <div key={idx} className="glass-panel rounded-lg p-4 space-y-3 glow-hover cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-[#3dd4c4]" />
                          <span className="font-['Space_Grotesk'] text-sm">{loc.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{loc.type}</div>
                      </div>
                      <Badge className="bg-[#3dd4c4]/20 text-[#3dd4c4]">
                        {(loc.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>

                    <div className="glass-panel bg-[#1e1e26] rounded p-3 text-xs font-mono space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Latitude</span>
                        <span className="text-[#3dd4c4]">{loc.lat.toFixed(4)}° N</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Longitude</span>
                        <span className="text-[#3dd4c4]">{loc.lon.toFixed(4)}° E</span>
                      </div>
                    </div>

                    <Button 
                      size="sm" 
                      className="w-full bg-[#1e1e26] hover:bg-[#2a2a34]"
                    >
                      Show on Map
                    </Button>
                  </div>
                ))}

                <div className="glass-panel rounded-lg p-4 mt-4">
                  <h4 className="text-sm mb-3">Geocoding Model</h4>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Engine</span>
                      <span className="text-[#3dd4c4]">spaCy-en-core</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Geocoder</span>
                      <span className="text-[#d4a25e]">Nominatim</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Confidence</span>
                      <span className="text-[#3dd4c4]">94%</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="topics" className="space-y-3 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm">Topic Modeling</h3>
                  <Badge variant="outline" className="text-[#4a8ad4] border-[#4a8ad4]/30">
                    LDA Analysis
                  </Badge>
                </div>

                {topics.map((topic, idx) => (
                  <div key={idx} className="glass-panel rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#4a8ad4]" />
                        <span className="font-['Space_Grotesk'] text-sm">{topic.name}</span>
                      </div>
                      <Badge className="bg-[#4a8ad4]/20 text-[#4a8ad4]">
                        {(topic.relevance * 100).toFixed(0)}%
                      </Badge>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1.5">Keywords</div>
                      <div className="flex gap-1.5 flex-wrap">
                        {topic.keywords.map((kw, kidx) => (
                          <Badge 
                            key={kidx} 
                            variant="outline" 
                            className="text-xs text-[#4a8ad4] border-[#4a8ad4]/30"
                          >
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="h-1.5 bg-[#1e1e26] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#4a8ad4] to-[#3dd4c4]"
                        style={{ width: `${topic.relevance * 100}%` }}
                      />
                    </div>
                  </div>
                ))}

                <div className="glass-panel rounded-lg p-4 mt-4">
                  <h4 className="text-sm mb-3 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-[#d4a25e]" />
                    Vector Embeddings
                  </h4>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model</span>
                      <span className="text-[#d4a25e]">all-MiniLM-L6-v2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dimensions</span>
                      <span>384</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Indexed</span>
                      <span className="text-[#3dd4c4]">Yes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Chunks</span>
                      <span className="text-[#4a8ad4]">12</span>
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
