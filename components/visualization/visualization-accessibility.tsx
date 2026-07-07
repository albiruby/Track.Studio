'use client';

import React, { useState } from 'react';
import { useVisualization } from './visualization-context';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function VisualizationAccessibility() {
  const { model } = useVisualization();
  const [showAltTable, setShowAltTable] = useState<boolean>(false);

  if (!model || !model.accessibility) return null;

  const { ariaLabel, summaryTableId, description, alternativeData } = model.accessibility;

  // Grab the keys to display as headers
  const headers = alternativeData.length > 0 ? Object.keys(alternativeData[0]) : [];

  return (
    <div className="w-full select-none" id={`accessibility-${model.id}`}>
      {/* Visual Aria Helper Indicator */}
      <span className="sr-only" aria-live="polite">
        {ariaLabel}
      </span>

      <div className="flex items-center justify-between p-3 border-t border-border/50 bg-muted/20 rounded-b-md text-[10px]">
        <span className="font-mono text-muted-foreground">
          {description}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAltTable(!showAltTable)}
          className="h-7 text-[9px] uppercase font-bold py-1 px-2.5 flex items-center gap-1.5 cursor-pointer font-mono"
        >
          {showAltTable ? (
            <>
              <EyeOff className="h-3 w-3" />
              Hide Accessible Table
            </>
          ) : (
            <>
              <Eye className="h-3 w-3" />
              Show Accessible Table
            </>
          )}
        </Button>
      </div>

      {showAltTable && (
        <div className="p-4 bg-card border border-border rounded mt-3 max-h-[300px] overflow-auto shadow-sm">
          <table className="w-full text-left text-[11px] font-mono border-collapse" id={summaryTableId}>
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {headers.map((h) => (
                  <th key={h} className="p-2 font-bold text-foreground capitalize">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alternativeData.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-border/50 hover:bg-muted/35">
                  {headers.map((h) => (
                    <td key={h} className="p-2 text-muted-foreground">
                      {row[h] !== undefined && row[h] !== null ? String(row[h]) : '--'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
