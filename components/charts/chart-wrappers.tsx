'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, AreaChart, Area, BarChart, Bar } from 'recharts';

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  id?: string;
}

export function ChartCard({ title, description, children, headerAction, id }: ChartCardProps) {
  return (
    <Card id={id || `chart-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-sm font-bold tracking-tight uppercase font-sans">{title}</CardTitle>
          {description && <CardDescription className="text-[11px] text-muted-foreground mt-0.5">{description}</CardDescription>}
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </CardHeader>
      <CardContent className="h-72 pl-2">
        {children}
      </CardContent>
    </Card>
  );
}

export function CustomChartTooltip({ active, payload, label, unit = '' }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-popover/90 p-3 shadow-md backdrop-blur-sm text-xs font-mono">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <p key={index} className="flex items-center gap-2 justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                {entry.name}:
              </span>
              <span className="font-bold text-foreground">
                {entry.value} {unit}
              </span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

interface BasicChartProps {
  data: any[];
  xAxisKey: string;
  dataKey: string;
  color?: string;
  name?: string;
  unit?: string;
}

export function LineChartWrapper({ data, xAxisKey, dataKey, color = '#0f172a', name, unit }: BasicChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis 
          dataKey={xAxisKey} 
          stroke="#94a3b8" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          stroke="#94a3b8" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false} 
        />
        <RechartsTooltip content={<CustomChartTooltip unit={unit} />} />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          name={name || dataKey} 
          stroke={color} 
          strokeWidth={2} 
          dot={{ r: 3, strokeWidth: 1 }} 
          activeDot={{ r: 5 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AreaChartWrapper({ data, xAxisKey, dataKey, color = '#3b82f6', name, unit }: BasicChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis 
          dataKey={xAxisKey} 
          stroke="#94a3b8" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          stroke="#94a3b8" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false} 
        />
        <RechartsTooltip content={<CustomChartTooltip unit={unit} />} />
        <defs>
          <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area 
          type="monotone" 
          dataKey={dataKey} 
          name={name || dataKey} 
          stroke={color} 
          strokeWidth={2} 
          fillOpacity={1} 
          fill="url(#colorArea)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarChartWrapper({ data, xAxisKey, dataKey, color = '#10b981', name, unit }: BasicChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis 
          dataKey={xAxisKey} 
          stroke="#94a3b8" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          stroke="#94a3b8" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false} 
        />
        <RechartsTooltip content={<CustomChartTooltip unit={unit} />} />
        <Bar 
          dataKey={dataKey} 
          name={name || dataKey} 
          fill={color} 
          radius={[4, 4, 0, 0]} 
          maxBarSize={45} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
