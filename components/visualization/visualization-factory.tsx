'use client';

import React from 'react';
import { VisualizationModel, VisualizationType } from '@/types/visualization';
import { VisualizationProvider, useVisualization } from './visualization-context';
import { VisualizationLegend } from './visualization-legend';
import { VisualizationTooltip } from './visualization-tooltip';
import { VisualizationAxis } from './visualization-axis';
import { VisualizationAccessibility } from './visualization-accessibility';
import { LineChart, BarChart2, AreaChart, Circle, Award } from 'lucide-react';

interface VisualizationFactoryProps {
  model: VisualizationModel;
}

function InnerVisualizationRenderer() {
  const { model, triggerHover, clearHover, activeRecordIndex, setActiveRecordIndex } = useVisualization();

  if (!model) return null;

  const data = model.formattedData;
  const palette = model.theme.colors.palette;

  const renderMockChartSVG = () => {
    const width = 500;
    const height = 180;
    const padding = 20;

    // Build mock lines or areas strictly to demonstrate representation of formattedData
    if (data.length === 0) {
      return (
        <svg className="w-full h-full min-h-[180px] bg-muted/10 rounded border border-dashed border-border flex items-center justify-center">
          <text x="50%" y="50%" textAnchor="middle" fill="#64748b" className="text-[10px] font-mono">
            NO COMPATIBLE VIEWMODEL RECORDS FOUND
          </text>
        </svg>
      );
    }

    const maxVal = 100;
    const pointsCount = data.length;
    const stepX = (width - padding * 2) / (pointsCount - 1 || 1);

    const handlePointHover = (index: number, record: any) => {
      setActiveRecordIndex(index);
      const tooltipItems = model.requiredFields.slice(1).map((field, idx) => ({
        key: field,
        label: field.toUpperCase(),
        value: record[field],
        formattedValue: String(record[field]),
        color: palette[idx % palette.length],
      }));
      triggerHover(`Record #${index + 1}`, tooltipItems);
    };

    switch (model.type) {
      case 'bar':
      case 'stacked-bar':
      case 'horizontal-bar':
        return (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[180px] overflow-visible">
            {/* Grid Lines */}
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke={model.theme.gridColor} strokeWidth={1} strokeDasharray="3 3" />
            
            {data.map((record, idx) => {
              const x = padding + idx * stepX;
              const barHeight = Math.max(20, (Number(record[model.requiredFields[1]]) || 40) % (height - padding * 2));
              const barWidth = Math.max(10, stepX * 0.6);
              return (
                <rect
                  key={idx}
                  x={x - barWidth / 2}
                  y={height - padding - barHeight}
                  width={barWidth}
                  height={barHeight}
                  fill={palette[0]}
                  rx={2}
                  className={`cursor-pointer transition-all duration-150 ${activeRecordIndex === idx ? 'fill-primary stroke-foreground stroke-2 opacity-100' : 'opacity-85 hover:opacity-100'}`}
                  onMouseEnter={() => handlePointHover(idx, record)}
                  onMouseLeave={clearHover}
                />
              );
            })}
          </svg>
        );

      case 'area':
      case 'line':
      default:
        // Area or Line representation
        const points = data.map((record, idx) => {
          const x = padding + idx * stepX;
          const y = height - padding - ((Number(record[model.requiredFields[1]]) || 30) % (height - padding * 2));
          return { x, y };
        });

        const dPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
        const areaPath = points.length > 0 
          ? `${dPath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z` 
          : '';

        return (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[180px] overflow-visible">
            {/* Grid Lines */}
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke={model.theme.gridColor} strokeWidth={1} strokeDasharray="3 3" />

            {model.type === 'area' && (
              <path d={areaPath} fill={`${palette[0]}22`} stroke="none" />
            )}

            <path d={dPath} fill="none" stroke={palette[0]} strokeWidth={2} className="transition-all" />

            {points.map((p, idx) => (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r={activeRecordIndex === idx ? 6 : 4}
                fill={activeRecordIndex === idx ? model.theme.colors.success : palette[0]}
                stroke={model.theme.backgroundColor}
                strokeWidth={1.5}
                className="cursor-pointer transition-all hover:scale-125"
                onMouseEnter={() => handlePointHover(idx, data[idx])}
                onMouseLeave={clearHover}
              />
            ))}
          </svg>
        );
    }
  };

  const getIcon = (type: VisualizationType) => {
    switch (type) {
      case 'bar':
      case 'stacked-bar':
      case 'horizontal-bar':
        return <BarChart2 className="h-4 w-4 text-muted-foreground" />;
      case 'area':
        return <AreaChart className="h-4 w-4 text-muted-foreground" />;
      case 'line':
      default:
        return <LineChart className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="relative border border-border bg-card rounded-lg flex flex-col shadow-sm select-none" id={`visualization-factory-renderer-${model.id}`}>
      {/* Title Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          {getIcon(model.type)}
          <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
            {model.id} Details ({model.type})
          </span>
        </div>
        <div className="text-[10px] font-mono text-muted-foreground uppercase bg-secondary/15 py-0.5 px-1.5 rounded">
          ViewModel: {model.inputViewModel}
        </div>
      </div>

      {/* Main Graphic Area */}
      <div className="flex p-4 gap-4 items-stretch min-h-[220px]">
        {/* Left Y Axis */}
        <VisualizationAxis axis={model.yAxis} position="left" />

        {/* Dynamic Graphic */}
        <div className="flex-1 relative min-h-[180px] bg-muted/5 rounded p-2 border border-border/30">
          {renderMockChartSVG()}
          
          {/* Dynamic interactive tooltip overlay */}
          <VisualizationTooltip />
        </div>
      </div>

      {/* Bottom X Axis */}
      <div className="pl-16 pr-4 pb-2">
        <VisualizationAxis axis={model.xAxis} position="bottom" />
      </div>

      {/* Dynamic legend */}
      <VisualizationLegend />

      {/* Accessibility Table Controls */}
      <VisualizationAccessibility />
    </div>
  );
}

export function VisualizationFactory({ model }: VisualizationFactoryProps) {
  return (
    <VisualizationProvider initialModel={model}>
      <InnerVisualizationRenderer />
    </VisualizationProvider>
  );
}
