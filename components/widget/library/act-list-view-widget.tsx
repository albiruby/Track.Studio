/**
 * Track.Studio — Activity Index Directory Widget (act_list_view)
 * Renders high-density listing of synchronized runs.
 */

'use client';

import React, { useState } from 'react';
import { WidgetRenderProps } from '@/lib/widget/library';
import { WidgetValidation } from '@/lib/widget/validation';
import { ActivityListViewModel } from '@/lib/widget/contracts';
import { ShieldAlert, Compass, Search, Flame, ArrowRight } from 'lucide-react';

export function ActListViewWidget({ widgetId, viewModel }: WidgetRenderProps) {
  const [filterText, setFilterText] = useState('');

  if (!viewModel) {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground font-mono uppercase">
        No active training feed synchronized.
      </div>
    );
  }

  const validation = WidgetValidation.validateActivityList(viewModel);
  if (!validation.isValid) {
    return (
      <div className="p-5 border border-status-danger/35 bg-status-danger/5 text-status-danger rounded-lg flex items-start gap-3 select-none">
        <ShieldAlert className="h-5 w-5 shrink-0" />
        <div className="text-xs font-mono leading-relaxed">
          <span className="font-bold uppercase block mb-1">CONTRACT VALIDATION ERROR:</span>
          {validation.error}
        </div>
      </div>
    );
  }

  const { activities } = viewModel as ActivityListViewModel;

  const filteredActivities = activities.filter((act) =>
    act.title.toLowerCase().includes(filterText.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'synced':
        return <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[8px] font-mono font-bold uppercase py-0.5 px-1.5 rounded">synced</span>;
      case 'pending':
        return <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[8px] font-mono font-bold uppercase py-0.5 px-1.5 rounded animate-pulse">pending</span>;
      case 'corrupt':
        return <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[8px] font-mono font-bold uppercase py-0.5 px-1.5 rounded">signal error</span>;
      default:
        return <span className="bg-secondary text-muted-foreground text-[8px] font-mono font-bold uppercase py-0.5 px-1.5 rounded">unknown</span>;
    }
  };

  return (
    <div className="p-4 sm:p-5 h-full flex flex-col justify-between select-none" id="widget-activity-index-directory">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
          <div>
            <span className="text-[9px] font-mono font-bold bg-[#FF6B00]/10 py-0.5 px-1.5 rounded text-[#FF6B00] uppercase">
              Activity History
            </span>
            <h4 className="text-sm font-bold text-foreground mt-1 uppercase tracking-tight">
              Synchronized Ingests ({activities.length})
            </h4>
          </div>

          <div className="relative shrink-0 w-full sm:max-w-[180px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search run feeds..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full text-xs bg-muted/50 border border-border rounded pl-8 pr-3 py-1.5 outline-none focus:border-primary font-medium"
            />
          </div>
        </div>

        {/* High-density listing table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left font-mono text-[10px] leading-normal border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-bold uppercase">
                <th className="py-2.5 px-1">Session Target</th>
                <th className="py-2.5 px-1">Distance</th>
                <th className="py-2.5 px-1">Duration</th>
                <th className="py-2.5 px-1">Avg Pace</th>
                <th className="py-2.5 px-1">Stress (RSS)</th>
                <th className="py-2.5 px-1 text-right">Fidelity</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-muted-foreground font-medium uppercase text-[9px]">
                    No synchronized activities match your search term.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((act) => (
                  <tr key={act.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors cursor-pointer group">
                    <td className="py-3 px-1 font-bold text-foreground uppercase truncate max-w-[150px]">
                      {act.title}
                      <span className="text-[8px] text-muted-foreground block font-normal mt-0.5">{new Date(act.date).toLocaleDateString()}</span>
                    </td>
                    <td className="py-3 px-1 font-bold text-foreground">{act.distanceKm.toFixed(2)}km</td>
                    <td className="py-3 px-1 text-muted-foreground">{act.duration}</td>
                    <td className="py-3 px-1 text-muted-foreground">{act.pace}/km</td>
                    <td className="py-3 px-1 text-status-warning font-bold flex items-center gap-1">
                      <Flame className="h-3 w-3 shrink-0" />
                      {act.rss}
                    </td>
                    <td className="py-3 px-1 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {getStatusBadge(act.status)}
                        <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-[9px] font-mono text-muted-foreground pt-2.5 border-t border-border/30 flex items-center justify-between">
        <span>Feed status: Online</span>
        <span>Showing {filteredActivities.length} of {activities.length} workouts</span>
      </div>
    </div>
  );
}
