import React from 'react';
import { Activity, Video, Image, AudioLines, FileText, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard() {
  const stats = [
    { label: 'Total Assets', value: '2,847', change: '+12%', icon: Activity, color: '#3dd4c4' },
    { label: 'Video Intelligence', value: '1,205', change: '+8%', icon: Video, color: '#d4a25e' },
    { label: 'Image Analysis', value: '956', change: '+15%', icon: Image, color: '#3dd4c4' },
    { label: 'Audio Signals', value: '428', change: '+5%', icon: AudioLines, color: '#d4a25e' },
    { label: 'Documents', value: '258', change: '+22%', icon: FileText, color: '#3dd4c4' },
    { label: 'Active Alerts', value: '7', change: '-3', icon: AlertTriangle, color: '#d43d3d' },
  ];

  const ingestionData = [
    { time: '00:00', video: 45, image: 120, audio: 20, document: 15 },
    { time: '04:00', video: 32, image: 98, audio: 15, document: 12 },
    { time: '08:00', video: 78, image: 156, audio: 35, document: 28 },
    { time: '12:00', video: 95, image: 178, audio: 42, document: 31 },
    { time: '16:00', video: 88, image: 165, audio: 38, document: 29 },
    { time: '20:00', video: 62, image: 142, audio: 28, document: 22 },
  ];

  const mediaDistribution = [
    { name: 'Video', value: 1205, color: '#3dd4c4' },
    { name: 'Image', value: 956, color: '#d4a25e' },
    { name: 'Audio', value: 428, color: '#4a8ad4' },
    { name: 'Document', value: 258, color: '#8a8b92' },
  ];

  const recentActivity = [
    { id: 1, type: 'video', asset: 'Patrol_Cam_042', event: 'Vessel Detection', confidence: 0.94, time: '2 min ago', status: 'indexed' },
    { id: 2, type: 'image', asset: 'SAR_IMG_1847', event: 'Ship Classification', confidence: 0.89, time: '5 min ago', status: 'indexed' },
    { id: 3, type: 'audio', asset: 'COMMS_2401', event: 'Speaker Identified', confidence: 0.91, time: '8 min ago', status: 'indexed' },
    { id: 4, type: 'document', asset: 'INTEL_RPT_059', event: 'Entity Extraction', confidence: 0.87, time: '12 min ago', status: 'indexed' },
    { id: 5, type: 'video', asset: 'UAV_Feed_183', event: 'Activity Detection', confidence: 0.96, time: '15 min ago', status: 'processing' },
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="font-['Space_Grotesk']">Intelligence Overview</h2>
        <p className="text-sm text-muted-foreground">Real-time multimodal intelligence aggregation and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-panel rounded-lg p-4 glow-hover cursor-pointer transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-[#1e1e26]">
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${stat.change.startsWith('+') ? 'text-[#3dd4c4] border-[#3dd4c4]/30' : 'text-[#d43d3d] border-[#d43d3d]/30'}`}
                >
                  {stat.change}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-['Space_Grotesk']" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ingestion Timeline */}
        <div className="lg:col-span-2 glass-panel rounded-lg p-6">
          <div className="mb-4">
            <h3 className="font-['Space_Grotesk']">24-Hour Ingestion Pipeline</h3>
            <p className="text-xs text-muted-foreground mt-1">Media processing throughput by type</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={ingestionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(232, 233, 235, 0.05)" />
              <XAxis dataKey="time" stroke="#8a8b92" style={{ fontSize: '12px' }} />
              <YAxis stroke="#8a8b92" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#14141a', 
                  border: '1px solid rgba(232, 233, 235, 0.1)',
                  borderRadius: '8px',
                  fontFamily: 'JetBrains Mono'
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="video" stroke="#3dd4c4" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="image" stroke="#d4a25e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="audio" stroke="#4a8ad4" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="document" stroke="#8a8b92" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Media Distribution */}
        <div className="glass-panel rounded-lg p-6">
          <div className="mb-4">
            <h3 className="font-['Space_Grotesk']">Media Distribution</h3>
            <p className="text-xs text-muted-foreground mt-1">Asset type breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={mediaDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {mediaDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#14141a', 
                  border: '1px solid rgba(232, 233, 235, 0.1)',
                  borderRadius: '8px',
                  fontFamily: 'JetBrains Mono'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {mediaDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-mono" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-panel rounded-lg p-6">
        <div className="mb-4">
          <h3 className="font-['Space_Grotesk']">Recent Intelligence Activity</h3>
          <p className="text-xs text-muted-foreground mt-1">Latest processed assets and extractions</p>
        </div>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-center gap-4 p-4 rounded-lg bg-[#1e1e26] hover:bg-[#2a2a34] transition-colors cursor-pointer border border-border/30"
            >
              <div className="p-2 rounded-lg bg-[#0a0a0f]">
                {getTypeIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm truncate">{activity.asset}</span>
                  <Badge variant="outline" className="text-xs border-[#3dd4c4]/30 text-[#3dd4c4]">
                    {activity.event}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono">Confidence: {(activity.confidence * 100).toFixed(0)}%</span>
                  <span>•</span>
                  <span>{activity.time}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activity.status === 'indexed' ? (
                  <Badge className="bg-[#3dd4c4]/20 text-[#3dd4c4] border-[#3dd4c4]/30">Indexed</Badge>
                ) : (
                  <Badge className="bg-[#d4a25e]/20 text-[#d4a25e] border-[#d4a25e]/30">Processing</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
