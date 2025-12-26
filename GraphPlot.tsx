import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label 
} from 'recharts';
import { GraphPoint } from '../types';

interface GraphPlotProps {
  data: GraphPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/95 border border-cyan-500 p-3 shadow-[0_0_15px_rgba(34,211,238,0.5)] rounded backdrop-blur-md">
        <p className="text-cyan-400 font-mono text-sm border-b border-cyan-900 pb-1 mb-1 font-bold">COORDINATES</p>
        <p className="text-white font-mono text-xs">x : {Number(label).toFixed(3)}</p>
        <p className="text-pink-400 font-mono text-xs">y : {Number(payload[0].value).toFixed(3)}</p>
      </div>
    );
  }
  return null;
};

const GraphPlot: React.FC<GraphPlotProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-purple-800 bg-black/50 text-purple-400 rounded-lg group hover:border-cyan-500 transition-colors">
        <div className="w-16 h-16 border-2 border-purple-600 rounded-full flex items-center justify-center animate-spin-slow mb-4 opacity-50 group-hover:opacity-100 group-hover:border-cyan-400">
           <div className="w-2 h-2 bg-current rounded-full"></div>
        </div>
        <p className="font-mono text-lg animate-pulse">NO_DATA_STREAM</p>
        <p className="text-xs opacity-50 font-mono">Menunggu input persamaan...</p>
      </div>
    );
  }

  // Calculate domain padding for better view
  const xValues = data.map(p => p.x);
  const yValues = data.map(p => p.y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  // Add slight padding to the domain
  const domainX = [minX, maxX];
  // Expand Y domain slightly
  const paddingY = (maxY - minY) * 0.1 || 1; 
  const domainY = [minY - paddingY, maxY + paddingY];

  return (
    <div className="w-full h-96 bg-[#050505] border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.15)] p-2 rounded-lg relative overflow-hidden group">
      {/* Detailed Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none"></div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
          
          {/* Main Axes (x=0 and y=0) */}
          <ReferenceLine x={0} stroke="#64748b" strokeWidth={2} />
          <ReferenceLine y={0} stroke="#64748b" strokeWidth={2} />

          <XAxis 
            dataKey="x" 
            type="number" 
            domain={domainX} 
            allowDataOverflow={false}
            stroke="#a855f7" 
            tick={{ fill: '#a855f7', fontSize: 10, fontFamily: 'monospace' }}
            tickCount={10}
            interval="preserveStartEnd"
            tickLine={{ stroke: '#a855f7' }}
          >
             <Label value="x" offset={0} position="insideBottomRight" fill="#a855f7" fontSize={12} fontWeight="bold" />
          </XAxis>

          <YAxis 
            type="number" 
            domain={domainY} 
            allowDataOverflow={false}
            stroke="#a855f7" 
            tick={{ fill: '#a855f7', fontSize: 10, fontFamily: 'monospace' }}
            tickCount={8}
            width={40}
            tickLine={{ stroke: '#a855f7' }}
          >
             <Label value="f(x)" angle={-90} position="insideLeft" fill="#a855f7" fontSize={12} fontWeight="bold" />
          </YAxis>

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f472b6', strokeWidth: 1, strokeDasharray: '4 4' }} />

          <Line 
            type="monotone" 
            dataKey="y" 
            stroke="#22d3ee" 
            strokeWidth={3} 
            dot={false} 
            activeDot={{ r: 6, fill: '#f472b6', stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive={true}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Corner Accents */}
      <div className="absolute top-0 right-0 p-2 pointer-events-none">
        <div className="flex items-center gap-2 text-[10px] text-cyan-500 font-mono bg-black/40 px-2 py-1 rounded border border-cyan-900">
           <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
           LIVE_PLOT_RENDERER
        </div>
      </div>
    </div>
  );
};

export default GraphPlot;