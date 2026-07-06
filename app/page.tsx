'use client';

import React from 'react';
import { motion } from 'motion/react';
import { 
  Activity, 
  Database, 
  Cpu, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  Settings, 
  AlertTriangle,
  ArrowRight,
  Code
} from 'lucide-react';
import { useFirebase, FirebaseProvider } from '@/providers/firebase-provider';

function DashboardContent() {
  const { isConfigured, user, loginWithGoogle, logout } = useFirebase();

  const domains = [
    {
      id: 'data-platform',
      name: 'Data Platform',
      status: 'Ready (Stubbed)',
      icon: Database,
      desc: 'OAuth, API connection sync, validation, and canonical data schema storage.',
      color: 'border-blue-500/30 text-blue-500 bg-blue-50/50'
    },
    {
      id: 'analysis-engine',
      name: 'Analysis Engine',
      status: 'Ready (Pure Formulas)',
      icon: Cpu,
      desc: 'Deterministic mathematical sports formulas (pacing, RSS, EF, decoupling).',
      color: 'border-emerald-500/30 text-emerald-500 bg-emerald-50/50'
    },
    {
      id: 'performance-engine',
      name: 'Performance Engine',
      status: 'Ready (Algorithms)',
      icon: TrendingUp,
      desc: 'Weighted training load decay algorithms (Fitness CTL, Fatigue ATL, Form TSB).',
      color: 'border-amber-500/30 text-amber-500 bg-amber-50/50'
    },
    {
      id: 'presentation-layer',
      name: 'Presentation Layer',
      status: 'Active (Shell)',
      icon: Activity,
      desc: 'Polished atomic design typography, layout grids, and core container structure.',
      color: 'border-purple-500/30 text-purple-500 bg-purple-50/50'
    },
    {
      id: 'ai-assistant',
      name: 'AI Assistant',
      status: 'Future Scope',
      icon: Sparkles,
      desc: 'Optional conversational interpreter plugin (Not in MVP).',
      color: 'border-slate-300/30 text-slate-400 bg-slate-50'
    }
  ];

  const infrastructureFiles = [
    { path: '/types/data-platform.ts', type: 'Shared Types', desc: 'Canonical Normalized Run schemas' },
    { path: '/types/athlete.ts', type: 'Shared Types', desc: 'Athlete thresholds & HR/Pace zones' },
    { path: '/types/analysis.ts', type: 'Shared Types', desc: 'Single activity mathematical shapes' },
    { path: '/types/performance.ts', type: 'Shared Types', desc: 'Multi-activity trend data shapes' },
    { path: '/lib/firebase.ts', type: 'Infrastructure', desc: 'Firebase Firestore & Auth client init' },
    { path: '/lib/firebase-error.ts', type: 'Infrastructure', desc: 'Hardened Firestore error standard' },
    { path: '/lib/analysis/formulas.ts', type: 'Pure Utilities', desc: 'Deterministic athletic equations' },
    { path: '/lib/performance/algorithms.ts', type: 'Pure Utilities', desc: 'CTL / ATL training load algorithms' },
    { path: '/lib/utils.ts', type: 'Utilities', desc: 'Running pace, distance, duration formatters' },
    { path: '/firestore.rules', type: 'Security', desc: 'Zero-Trust Attribute Access rules' },
    { path: '/firebase-blueprint.json', type: 'Blueprint', desc: 'Data schema definition' },
    { path: '/AGENTS.md', type: 'System Principles', desc: 'Persistent developer directives' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Upper Premium Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white font-mono font-bold tracking-tighter text-sm">
              T.S
            </div>
            <div>
              <span className="font-mono tracking-wider font-bold text-slate-900">TRACK.STUDIO</span>
              <span className="ml-2 text-[10px] font-mono font-medium tracking-tight uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                PROD-READY FOUNDATION
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isConfigured ? (
              user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono text-slate-500">{user.email}</span>
                  <button 
                    onClick={logout}
                    className="text-xs px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 transition text-slate-700 font-mono"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button 
                  onClick={loginWithGoogle}
                  className="text-xs px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 transition text-white font-mono"
                >
                  Connect Profile
                </button>
              )
            ) : (
              <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-mono font-medium flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" /> Config Pending
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-12">
        {/* Project Greeting Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-8 md:p-12 shadow-xl relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-sans font-semibold tracking-tight leading-tight">
              Platform Foundation Initialized.
            </h1>
            <p className="mt-4 text-slate-300 text-base md:text-lg font-light leading-relaxed">
              Track.Studio is configured for professional deterministic running performance evaluation. 
              The folder architecture, shared schemas, pure sports mathematics libraries, and secure Firebase rules have been fully established.
            </p>
            
            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero-Trust Security Active</span>
              </div>
              <span className="text-slate-500">•</span>
              <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs font-medium">
                <Code className="w-4 h-4" />
                <span>Modular Schema Layer Bound</span>
              </div>
            </div>
          </div>
        </div>

        {/* Firebase Onboarding Guide */}
        {!isConfigured && (
          <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-6 mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center space-x-2 text-amber-700">
                <Settings className="w-5 h-5" />
                <h3 className="font-semibold text-sm font-sans">Firebase Database Provisioning Pending</h3>
              </div>
              <p className="text-xs text-amber-600 leading-relaxed">
                The developer environment is currently utilizing a safe placeholder. To provision your live Cloud Firestore 
                and Authentication databases, accept the Firebase terms when prompted in the AI Studio UI.
              </p>
            </div>
            <button className="whitespace-nowrap bg-amber-600 text-white font-mono text-xs font-medium px-4 py-2.5 rounded hover:bg-amber-700 transition flex items-center shadow-sm">
              Awaiting Setup <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Columns - Domains Overview */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-sans font-medium text-slate-800 tracking-tight flex items-center">
              <Code className="w-5 h-5 mr-2 text-slate-500" /> Architectural Domains
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {domains.map((domain) => {
                const Icon = domain.icon;
                return (
                  <div 
                    key={domain.id} 
                    className="border border-slate-200 bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded ${domain.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-mono text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-150">
                          {domain.status}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-900 text-sm font-sans">{domain.name}</h3>
                      <p className="mt-2 text-xs text-slate-500 leading-relaxed font-light">
                        {domain.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Directory File Manifest */}
          <div className="space-y-6">
            <h2 className="text-xl font-sans font-medium text-slate-800 tracking-tight flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-500" /> Foundation Manifest
            </h2>
            
            <div className="border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-slate-50 p-3.5 border-b border-slate-200">
                <span className="font-mono text-xs text-slate-500 font-medium uppercase tracking-wider">
                  Configured Infrastructure
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
                {infrastructureFiles.map((file) => (
                  <div key={file.path} className="p-3 hover:bg-slate-50 transition flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-slate-800 truncate">{file.path}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{file.desc}</p>
                    </div>
                    <span className="whitespace-nowrap font-mono text-[9px] font-bold text-slate-400 uppercase tracking-tight bg-slate-100 px-1.5 py-0.5 rounded">
                      {file.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RootDashboard() {
  return (
    <FirebaseProvider>
      <DashboardContent />
    </FirebaseProvider>
  );
}
