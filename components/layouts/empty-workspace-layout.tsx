'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { 
  Sparkles, 
  CheckSquare, 
  Square, 
  Database, 
  Settings, 
  User, 
  Play, 
  Flame, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { useWorkspace } from '@/providers/workspace-provider';

export function EmptyWorkspaceLayout() {
  const { toast } = useToast();
  const { triggerSync } = useWorkspace();
  
  // Checklist State
  const [tasks, setTasks] = useState([
    { id: 'auth', label: 'Authenticate Google / Firebase Profile', done: true, icon: User },
    { id: 'strava', label: 'Establish Strava API Webhook Connection', done: false, icon: Database },
    { id: 'thresholds', label: 'Calibrate FTP & Heart Rate Zones', done: false, icon: Settings },
    { id: 'sync', label: 'Trigger First Historic Ingestion Sync', done: false, icon: Flame }
  ]);

  const toggleTask = (taskId: string) => {
    setTasks(prev => 
      prev.map(t => {
        if (t.id === taskId) {
          const nextState = !t.done;
          toast({
            title: nextState ? 'Milestone Checked' : 'Milestone Unchecked',
            description: `${t.label} updated in setup schedule.`,
          });
          return { ...t, done: nextState };
        }
        return t;
      })
    );
  };

  const isAllComplete = tasks.every(t => t.done);

  return (
    <div 
      className="min-h-[500px] flex items-center justify-center p-4 sm:p-6 select-none"
      id="empty-workspace-layout-container"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-xl overflow-hidden flex flex-col md:flex-row relative"
      >
        {/* Decorative branding top highlight */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-foreground" />

        {/* Left Side: Illustration / Info Hero */}
        <div className="md:w-2/5 bg-muted/30 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border">
          <div className="space-y-4">
            <div className="h-8 w-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold">
              <Compass className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Workspace Seed</h2>
              <h1 className="text-sm font-bold uppercase text-foreground leading-tight">No Ingestion Data</h1>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                Your Track.Studio workspace is completely empty. Complete the calibration tasks to initialize the performance engine.
              </p>
            </div>
          </div>

          <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest hidden md:block pt-8">
            Platform Init Protocol 1.0
          </div>
        </div>

        {/* Right Side: Interactive Checklist */}
        <div className="flex-1 p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">Setup Checklist</h3>
            <p className="text-xs text-muted-foreground font-medium">Complete these milestones to launch the analytical dashboards:</p>
          </div>

          {/* Checklist Area */}
          <div className="space-y-2.5">
            {tasks.map(task => {
              const TaskIcon = task.icon;
              return (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="w-full text-left flex items-center justify-between p-3 rounded border border-border bg-card hover:bg-secondary/20 transition-all cursor-pointer group"
                  id={`onboarding-task-${task.id}`}
                >
                  <div className="flex items-center gap-3">
                    <TaskIcon className={`h-4 w-4 shrink-0 transition-colors ${task.done ? 'text-status-success' : 'text-muted-foreground group-hover:text-foreground'}`} />
                    <span className={`text-xs font-semibold leading-tight transition-colors ${task.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {task.label}
                    </span>
                  </div>
                  
                  {task.done ? (
                    <CheckSquare className="h-4.5 w-4.5 text-status-success shrink-0" />
                  ) : (
                    <Square className="h-4.5 w-4.5 text-muted-foreground/50 group-hover:text-foreground shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Setup CTA Action */}
          <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className={`h-4.5 w-4.5 ${isAllComplete ? 'text-status-success animate-pulse' : 'text-muted-foreground/40'}`} />
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                {isAllComplete ? 'Ready to launch' : '3 tasks remaining'}
              </span>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={() => {
                // Perform setup action simulation
                triggerSync();
                toast({
                  title: 'Ingestion Pipeline Fired',
                  description: 'Connecting Strava webhook models...',
                });
              }}
              className="h-8.5 uppercase text-[10px] gap-2"
              id="empty-workspace-cta-btn"
            >
              <span>Initialize Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
