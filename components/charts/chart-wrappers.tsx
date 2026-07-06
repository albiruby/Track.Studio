'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useTheme } from '@/providers/theme-provider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Helper for dynamic colors based on theme mode
function useChartTheme() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return {
    gridColor: isDark ? '#1f2937' : '#e2e8f0',
    textColor: isDark ? '#9ca3af' : '#64748b',
    primaryColor: isDark ? '#f8fafc' : '#0f172a',
    accentColor: isDark ? '#60a5fa' : '#3b82f6',
    successColor: isDark ? '#34d399' : '#10b981',
    warningColor: isDark ? '#fbbf24' : '#f59e0b',
    dangerColor: isDark ? '#f87171' : '#ef4444',
    cardBackground: isDark ? '#111827' : '#ffffff',
    borderColor: isDark ? '#374151' : '#cbd5e1',
  };
}

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export function ChartCard({ title, description, children, className, headerAction }: ChartCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 p-5">
        <div className="space-y-1">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-xs text-muted-foreground/80 leading-normal">
              {description}
            </CardDescription>
          )}
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div className="h-[280px] w-full mt-2">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Custom High Contrast Slate Tooltip for Recharts
 */
export function CustomChartTooltip({ active, payload, label, unit = '' }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card text-card-foreground p-3 rounded-md border border-border shadow-lg font-sans max-w-xs text-xs space-y-1.5">
        {label && <p className="font-semibold text-muted-foreground font-mono uppercase text-[10px] tracking-wider mb-1">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-4 justify-between">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-mono font-bold text-foreground">
              {entry.value} {entry.unit || unit}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

interface ChartProps {
  data: any[];
  xAxisKey: string;
  series: {
    key: string;
    name: string;
    color?: string;
  }[];
  height?: number | string;
}

/**
 * Line Chart Wrapper Template
 */
export function LineChartWrapper({ data, xAxisKey, series }: ChartProps) {
  const themeColors = useChartTheme();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
        <XAxis
          dataKey={xAxisKey}
          stroke={themeColors.textColor}
          fontSize={10}
          tickLine={false}
          axisLine={false}
          dy={10}
          className="font-mono"
        />
        <YAxis
          stroke={themeColors.textColor}
          fontSize={10}
          tickLine={false}
          axisLine={false}
          dx={-10}
          className="font-mono"
        />
        <Tooltip content={<CustomChartTooltip />} cursor={{ stroke: themeColors.gridColor, strokeWidth: 1 }} />
        <Legend
          verticalAlign="top"
          height={36}
          iconType="circle"
          iconSize={8}
          className="text-[11px] font-medium text-muted-foreground"
        />
        {series.map((s, idx) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color || (idx === 0 ? themeColors.primaryColor : themeColors.accentColor)}
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 1 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

/**
 * Area Chart Wrapper Template
 */
export function AreaChartWrapper({ data, xAxisKey, series }: ChartProps) {
  const themeColors = useChartTheme();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <defs>
          {series.map((s, idx) => {
            const color = s.color || (idx === 0 ? themeColors.accentColor : themeColors.successColor);
            return (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
        <XAxis
          dataKey={xAxisKey}
          stroke={themeColors.textColor}
          fontSize={10}
          tickLine={false}
          axisLine={false}
          dy={10}
          className="font-mono"
        />
        <YAxis
          stroke={themeColors.textColor}
          fontSize={10}
          tickLine={false}
          axisLine={false}
          dx={-10}
          className="font-mono"
        />
        <Tooltip content={<CustomChartTooltip />} />
        <Legend
          verticalAlign="top"
          height={36}
          iconType="circle"
          iconSize={8}
          className="text-[11px] font-medium text-muted-foreground"
        />
        {series.map((s, idx) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color || (idx === 0 ? themeColors.accentColor : themeColors.successColor)}
            strokeWidth={2}
            fill={`url(#grad-${s.key})`}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

/**
 * Bar Chart Wrapper Template
 */
export function BarChartWrapper({ data, xAxisKey, series }: ChartProps) {
  const themeColors = useChartTheme();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
        <XAxis
          dataKey={xAxisKey}
          stroke={themeColors.textColor}
          fontSize={10}
          tickLine={false}
          axisLine={false}
          dy={10}
          className="font-mono"
        />
        <YAxis
          stroke={themeColors.textColor}
          fontSize={10}
          tickLine={false}
          axisLine={false}
          dx={-10}
          className="font-mono"
        />
        <Tooltip content={<CustomChartTooltip />} cursor={{ fill: themeColors.gridColor, opacity: 0.1 }} />
        <Legend
          verticalAlign="top"
          height={36}
          iconType="circle"
          iconSize={8}
          className="text-[11px] font-medium text-muted-foreground"
        />
        {series.map((s, idx) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            fill={s.color || (idx === 0 ? themeColors.primaryColor : themeColors.accentColor)}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * Scatter Chart Wrapper Template (For Pacing Decoupling & Scatter Plots)
 */
export function ScatterChartWrapper({ data, xAxisKey, series }: ChartProps) {
  const themeColors = useChartTheme();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gridColor} />
        <XAxis
          type="number"
          dataKey={xAxisKey}
          stroke={themeColors.textColor}
          fontSize={10}
          tickLine={false}
          axisLine={false}
          dy={10}
          className="font-mono"
        />
        <YAxis
          type="number"
          stroke={themeColors.textColor}
          fontSize={10}
          tickLine={false}
          axisLine={false}
          dx={-10}
          className="font-mono"
        />
        <Tooltip content={<CustomChartTooltip />} cursor={{ strokeDasharray: '3 3' }} />
        <Legend
          verticalAlign="top"
          height={36}
          iconType="circle"
          iconSize={8}
          className="text-[11px] font-medium text-muted-foreground"
        />
        {series.map((s, idx) => (
          <Scatter
            key={s.key}
            name={s.name}
            data={data}
            fill={s.color || (idx === 0 ? themeColors.accentColor : themeColors.dangerColor)}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}

/**
 * Radar Chart Wrapper Template (For Zone distribution profiles)
 */
interface RadarChartProps {
  data: any[];
  angleKey: string;
  dataKey: string;
  name: string;
  color?: string;
}

export function RadarChartWrapper({ data, angleKey, dataKey, name, color }: RadarChartProps) {
  const themeColors = useChartTheme();
  const activeColor = color || themeColors.accentColor;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" r="80%" data={data}>
        <PolarGrid stroke={themeColors.gridColor} />
        <PolarAngleAxis
          dataKey={angleKey}
          stroke={themeColors.textColor}
          fontSize={10}
          className="font-sans"
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 'auto']}
          stroke={themeColors.textColor}
          fontSize={9}
          className="font-mono"
        />
        <Radar
          name={name}
          dataKey={dataKey}
          stroke={activeColor}
          fill={activeColor}
          fillOpacity={0.25}
        />
        <Tooltip content={<CustomChartTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

/**
 * Pie Chart Wrapper Template
 */
interface PieChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
}

export function PieChartWrapper({ data }: PieChartProps) {
  const themeColors = useChartTheme();
  const fallbackColors = [
    themeColors.primaryColor,
    themeColors.accentColor,
    themeColors.successColor,
    themeColors.warningColor,
    themeColors.dangerColor,
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || fallbackColors[index % fallbackColors.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomChartTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          iconSize={8}
          className="text-[11px] font-medium text-muted-foreground"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
