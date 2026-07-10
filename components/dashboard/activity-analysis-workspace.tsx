'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useInteractiveWorkspace } from '@/providers/interactive-workspace-provider';
import { useDashboard } from '@/providers/dashboard-provider';
import { useWorkspace } from '@/providers/workspace-provider';
import { DATA_COVERAGE_REGISTRY, RegistryItem } from '@/lib/data-platform/coverage-registry';
import { 
  calculateRunningStressScore, 
  calculateIntensityFactor, 
  calculateEfficiencyFactor, 
  calculateAerobicDecoupling, 
  calculatePacingVariability 
} from '@/lib/analysis/formulas';
import { 
  Activity, Heart, Zap, Footprints, Mountain, Thermometer, Flame, 
  Download, MapPin, Compass, FileSpreadsheet, Layers, Globe, Gauge, 
  TrendingUp, Sparkles, ShieldAlert, Info, ArrowRight, Eye, RefreshCw,
  Search, Settings, SlidersHorizontal, Trash, ChevronRight, Calendar,
  Activity as PaceIcon, Footprints as StrideIcon, ShieldCheck, Sun,
  User, Database, Lock, Copy, Check, ChevronDown, Award, CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { cn } from '@/lib/utils';

// ============================================================================
// Telemetry Structure & Stream Generator
// ============================================================================
export interface TelemetryTick {
  time: number; // seconds
  distance: number; // meters
  heartRate: number; // bpm
  power: number; // watts
  cadence: number; // spm
  elevation: number; // meters
  speed: number; // m/s
  grade: number; // %
  temperature: number; // °C
  strideLength: number; // meters
  groundContactTime: number; // ms
  verticalOscillation: number; // cm
  verticalRatio: number; // %
  runningEffectiveness: number; // kg/N
  legSpringProxy: number; // kN/m
  latitude: number;
  longitude: number;
}

export function generateTelemetryStream(activityId: string): TelemetryTick[] {
  const points: TelemetryTick[] = [];
  const count = 50;
  
  // Normalize activityId style to suffix (handles e.g. "athlete1_act_1" vs "run_1")
  const idKey = activityId.includes('_act_') ? `run_${activityId.split('_act_')[1]}` : activityId;

  let basePace = 298; // 4:58/km
  let baseHr = 150;
  let basePower = 250;
  let baseCadence = 174;
  let baseElev = 35;
  let distanceKm = 10.0;
  let totalTimeSec = 2980;
  
  if (idKey === 'run_2') {
    basePace = 340; // 5:40/km
    baseHr = 135;
    basePower = 210;
    baseCadence = 170;
    baseElev = 15;
    distanceKm = 12.4;
    totalTimeSec = 4215;
  } else if (idKey === 'run_3') {
    basePace = 330; // 5:30/km
    baseHr = 118;
    basePower = 180;
    baseCadence = 168;
    baseElev = 10;
    distanceKm = 8.2;
    totalTimeSec = 2710;
  } else if (idKey === 'run_4') {
    basePace = 257; // 4:17/km
    baseHr = 162;
    basePower = 310;
    baseCadence = 178;
    baseElev = 25;
    distanceKm = 15.0;
    totalTimeSec = 3855;
  } else if (idKey === 'run_5') {
    basePace = 295; // 4:55/km
    baseHr = 148;
    basePower = 240;
    baseCadence = 172;
    baseElev = 50;
    distanceKm = 6.5;
    totalTimeSec = 1920;
  }

  const stepDistance = (distanceKm * 1000) / (count - 1);
  const stepTime = totalTimeSec / (count - 1);

  for (let i = 0; i < count; i++) {
    const elapsedSeconds = i * stepTime;
    const elapsedMeters = i * stepDistance;
    const pct = i / (count - 1);

    // 1. Heart Rate modeling with cardiac drift / intervals
    let hr = baseHr;
    if (idKey === 'run_1') {
      if (pct < 0.12) {
        hr = 120 + (pct / 0.12) * 30;
      } else {
        hr = 150 + (pct - 0.12) * 18;
      }
    } else if (idKey === 'run_2') {
      hr = 130 + Math.sin(pct * Math.PI * 4) * 4 + pct * 5; 
    } else if (idKey === 'run_3') {
      const isStride = Math.floor(pct * 10) % 3 === 1 && pct > 0.15 && pct < 0.85;
      hr = isStride ? 142 + Math.sin(pct * 20) * 8 : 114 + Math.sin(pct * Math.PI * 2) * 3;
    } else if (idKey === 'run_4') {
      const lapIdx = Math.floor(pct * 10);
      const isWork = lapIdx % 2 === 1;
      hr = isWork ? 168 + Math.min(14, (pct * 60) % 14) : 132 + Math.max(0, 12 - ((pct * 60) % 12));
    } else if (idKey === 'run_5') {
      const isDropout = i >= 20 && i <= 24;
      hr = isDropout ? 0 : 144 + Math.sin(pct * Math.PI) * 10;
    }

    // 2. Power Modeling
    let power = basePower;
    if (idKey === 'run_1') {
      power = basePower + Math.sin(pct * Math.PI * 6) * 12;
    } else if (idKey === 'run_2') {
      power = basePower + Math.sin(pct * Math.PI * 2) * 6;
    } else if (idKey === 'run_3') {
      const isStride = Math.floor(pct * 10) % 3 === 1 && pct > 0.15 && pct < 0.85;
      power = isStride ? 335 + Math.sin(pct * 50) * 15 : 172 + Math.sin(pct * 10) * 8;
    } else if (idKey === 'run_4') {
      const lapIdx = Math.floor(pct * 10);
      const isWork = lapIdx % 2 === 1;
      power = isWork ? 345 + Math.sin(pct * 30) * 12 : 155 + Math.sin(pct * 20) * 8;
    } else if (idKey === 'run_5') {
      power = basePower + Math.sin(pct * Math.PI * 3) * 10;
    }

    // 3. Cadence Modeling
    let cadence = baseCadence;
    if (idKey === 'run_3') {
      const isStride = Math.floor(pct * 10) % 3 === 1 && pct > 0.15 && pct < 0.85;
      cadence = isStride ? 194 + Math.floor(Math.sin(pct * 40) * 4) : 166 + Math.floor(Math.sin(pct * 10) * 2);
    } else if (idKey === 'run_4') {
      const lapIdx = Math.floor(pct * 10);
      const isWork = lapIdx % 2 === 1;
      cadence = isWork ? 183 + Math.floor(Math.sin(pct * 30) * 2) : 165 + Math.floor(Math.sin(pct * 20) * 2);
    } else {
      cadence = baseCadence + Math.floor(Math.sin(pct * Math.PI * 8) * 2.5);
    }

    // 4. Altitude Profile
    let alt = baseElev;
    if (idKey === 'run_1') {
      alt = baseElev + Math.sin(pct * Math.PI) * 48;
    } else if (idKey === 'run_2') {
      alt = baseElev + Math.cos(pct * Math.PI * 4) * 6;
    } else if (idKey === 'run_3') {
      alt = baseElev + Math.sin(pct * Math.PI * 2) * 4;
    } else if (idKey === 'run_4') {
      alt = baseElev; // track
    } else if (idKey === 'run_5') {
      alt = baseElev + pct * 22 + Math.sin(pct * Math.PI * 6) * 8;
    }

    let grade = 0;
    if (i > 0) {
      const prevAlt = points[i - 1].elevation;
      const dElev = alt - prevAlt;
      grade = (dElev / stepDistance) * 100;
    }

    // 6. Running Speed
    let speed = 1000 / basePace;
    if (idKey === 'run_1') {
      speed = speed + Math.cos(pct * Math.PI * 4) * 0.18 - (grade * 0.04);
    } else if (idKey === 'run_2') {
      speed = speed + Math.sin(pct * Math.PI * 2) * 0.08;
    } else if (idKey === 'run_3') {
      const isStride = Math.floor(pct * 10) % 3 === 1 && pct > 0.15 && pct < 0.85;
      speed = isStride ? 1000 / 195 : 1000 / 330;
    } else if (idKey === 'run_4') {
      const lapIdx = Math.floor(pct * 10);
      const isWork = lapIdx % 2 === 1;
      speed = isWork ? 1000 / 220 : 1000 / 300;
    } else if (idKey === 'run_5') {
      const isGlitch = i === 30 || i === 31;
      speed = isGlitch ? speed * 2.2 : speed + Math.sin(pct * 20) * 0.12;
    }

    const temp = idKey === 'run_2' ? 7.6 + pct * 1.8 : 15.5 + pct * 2.4;
    const strideLength = speed / (cadence / 60);
    const groundContactTime = 258 - (speed * 11.5) + (cadence - 170) * 0.45;
    const verticalOscillation = 9.4 - (speed * 0.38);
    const verticalRatio = (verticalOscillation / (strideLength * 100)) * 100;

    let lat = 37.7749;
    let lng = -122.4194;
    
    if (idKey === 'run_1') {
      const radius = 0.012;
      const angle = pct * Math.PI * 2;
      lat = 37.7749 + Math.sin(angle) * radius;
      lng = -122.4194 + Math.cos(angle) * radius;
    } else if (idKey === 'run_2') {
      const maxDist = 0.022;
      const factor = pct < 0.5 ? pct * 2 : (1.0 - pct) * 2;
      lat = 37.7749 + factor * maxDist;
      lng = -122.4194 + factor * maxDist * 0.45;
    } else if (idKey === 'run_3') {
      const segs = 4;
      const segPct = (pct * segs) % 1.0;
      const segIdx = Math.floor(pct * segs);
      const isEven = segIdx % 2 === 0;
      const startLat = 37.7749 + (segIdx * 0.0045);
      lat = startLat + (isEven ? segPct * 0.0045 : (1 - segPct) * 0.0045);
      lng = -122.4194 + (segPct * 0.009);
    } else if (idKey === 'run_4') {
      const laps = 5;
      const lapPct = (pct * laps) % 1.0;
      const angle = lapPct * Math.PI * 2;
      lat = 37.7749 + Math.sin(angle) * 0.0028;
      lng = -122.4194 + Math.cos(angle) * 0.0075;
    } else if (idKey === 'run_5') {
      const glitchOffset = (i === 30) ? 0.0075 : 0;
      lat = 37.7749 + pct * 0.018 + glitchOffset;
      lng = -122.4194 + pct * 0.0095;
    }

    points.push({
      time: Math.round(elapsedSeconds),
      distance: Math.round(elapsedMeters * 10) / 10,
      heartRate: Math.round(hr),
      power: Math.round(power),
      cadence: Math.round(cadence),
      elevation: Math.round(alt * 10) / 10,
      speed: Math.round(speed * 100) / 100,
      grade: Math.round(grade * 10) / 10,
      temperature: Math.round(temp * 10) / 10,
      strideLength: Math.round(strideLength * 100) / 100,
      groundContactTime: Math.round(groundContactTime),
      verticalOscillation: Math.round(verticalOscillation * 10) / 10,
      verticalRatio: Math.round(verticalRatio * 10) / 10,
      runningEffectiveness: Math.round((speed / (power / 75)) * 100) / 100,
      legSpringProxy: Math.round((power / (cadence / 60)) * 10) / 10,
      latitude: lat,
      longitude: lng
    });
  }

  return points;
}

export function speedToPaceStr(speedMps: number): string {
  if (speedMps <= 0) return "--:--";
  const secPerKm = 1000 / speedMps;
  const mins = Math.floor(secPerKm / 60);
  const secs = Math.floor(secPerKm % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function ActivityAnalysisWorkspace() {
  const { selectedActivityId, setSelectedActivityId } = useInteractiveWorkspace();
  const { viewModels } = useDashboard();
  const { activeAthlete } = useWorkspace();

  const activityId = selectedActivityId || 'run_1';

  // Suffix translator
  const suffixKey = useMemo(() => {
    return activityId.includes('_act_') ? `run_${activityId.split('_act_')[1]}` : activityId;
  }, [activityId]);

  // Main navigation tabs
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'inspector' | 'athlete' | 'traceability'>('inspector');

  // Search & Filter state variables
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDistanceMin, setFilterDistanceMin] = useState<string>('');
  const [filterDistanceMax, setFilterDistanceMax] = useState<string>('');
  const [filterDurationMin, setFilterDurationMin] = useState<string>('');
  const [filterShoes, setFilterShoes] = useState<string>('all');
  const [filterDevice, setFilterDevice] = useState<string>('all');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [filterWorkoutType, setFilterWorkoutType] = useState<string>('all');
  const [filterIndoorOutdoor, setFilterIndoorOutdoor] = useState<string>('all');

  // Multi-collapsible accordion triggers
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    overview: false,
    splits: true,
    laps: true,
    streams: false,
    equipment: true,
    weather: true,
    quality: true,
    decisions: true,
    calculated: true,
    rawMetadata: true,
    providerMetadata: true,
    export: true
  });

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // State elements for timeline
  const [mapType, setMapType] = useState<'dark' | 'satellite' | 'terrain'>('dark');
  const [metricColorBy, setMetricColorBy] = useState<'pace' | 'hr' | 'power' | 'cadence' | 'grade'>('pace');
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [selectedSplit, setSelectedSplit] = useState<number | null>(null);
  const [isRollingAvgEnabled, setIsRollingAvgEnabled] = useState(false);

  const isDragging = useRef<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Generate stream data from context
  const telemetry = useMemo(() => generateTelemetryStream(activityId), [activityId]);

  // Retrieve base activity list
  const activities = viewModels?.ActivitySummaryViewModel?.activities || [];

  // Filter activities dynamically based on search query & multi-filters
  const filteredActivities = useMemo(() => {
    return activities.filter((act: any) => {
      const s = searchQuery.toLowerCase();
      
      // Seed attributes mapping
      const actSuffix = act.id.includes('_act_') ? `run_${act.id.split('_act_')[1]}` : act.id;
      const deviceName = actSuffix === 'run_5' ? 'Garmin Instinct 2' : 'Garmin Forerunner 955';
      const shoesName = actSuffix === 'run_4' ? 'Nike Vaporfly 3' : (actSuffix === 'run_3' ? 'Saucony Kinvara 14' : 'Nike Air Zoom Pegasus 39');
      const provider = act.externalProviderId || 'strava';
      const workoutType = act.title.toLowerCase().includes('tempo') ? 'tempo' : 
                          (act.title.toLowerCase().includes('recovery') ? 'recovery' : 'intervals');
      const locationStr = 'San Francisco, California, United States';
      const notes = 'Steady aerobic adaptation block holding target pacing guidelines.';

      // Text matching
      const matchesText = 
        act.title.toLowerCase().includes(s) ||
        locationStr.toLowerCase().includes(s) ||
        deviceName.toLowerCase().includes(s) ||
        shoesName.toLowerCase().includes(s) ||
        workoutType.toLowerCase().includes(s) ||
        notes.toLowerCase().includes(s) ||
        provider.toLowerCase().includes(s) ||
        act.date.toLowerCase().includes(s);

      if (!matchesText) return false;

      // Numeric & categorical filters
      if (filterDistanceMin && act.distanceKm < parseFloat(filterDistanceMin)) return false;
      if (filterDistanceMax && act.distanceKm > parseFloat(filterDistanceMax)) return false;
      
      if (filterDurationMin) {
        const parts = act.duration.split(':').map(Number);
        const mins = parts.length === 3 ? parts[0] * 60 + parts[1] : parts[0];
        if (mins < parseFloat(filterDurationMin)) return false;
      }

      if (filterShoes !== 'all' && shoesName.toLowerCase().replace(/\s+/g, '_') !== filterShoes) return false;
      if (filterDevice !== 'all' && deviceName.toLowerCase().replace(/\s+/g, '_') !== filterDevice) return false;
      if (filterProvider !== 'all' && provider !== filterProvider) return false;
      if (filterWorkoutType !== 'all' && workoutType !== filterWorkoutType) return false;
      if (filterIndoorOutdoor !== 'all') {
        const isTrainer = actSuffix === 'run_5'; // simulated indoor/trainer
        if (filterIndoorOutdoor === 'indoor' && !isTrainer) return false;
        if (filterIndoorOutdoor === 'outdoor' && isTrainer) return false;
      }

      return true;
    });
  }, [activities, searchQuery, filterDistanceMin, filterDistanceMax, filterDurationMin, filterShoes, filterDevice, filterProvider, filterWorkoutType, filterIndoorOutdoor]);

  // Load selected activity details
  const activeActSummary = useMemo(() => {
    return activities.find((act: any) => act.id === activityId) || {
      id: activityId,
      title: 'Tempo Threshold Session',
      date: new Date().toISOString(),
      distanceKm: 10.0,
      duration: '49:40',
      pace: '4:58',
      rss: 78,
      status: 'synced',
      externalProviderId: 'strava'
    };
  }, [activities, activityId]);

  // Compute stats on the raw stream data
  const calculatedStats = useMemo(() => {
    const hrValues = telemetry.map(t => t.heartRate).filter(h => h > 0);
    const speedValues = telemetry.map(t => t.speed);
    const powerValues = telemetry.map(t => t.power);
    const cadenceValues = telemetry.map(t => t.cadence);
    const elevValues = telemetry.map(t => t.elevation);

    const avgHr = hrValues.length > 0 ? Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length) : 0;
    const maxHr = hrValues.length > 0 ? Math.max(...hrValues) : 0;
    const minHr = hrValues.length > 0 ? Math.min(...hrValues) : 0;

    const avgSpeed = speedValues.reduce((a, b) => a + b, 0) / speedValues.length;
    const maxSpeed = Math.max(...speedValues);
    const minSpeed = Math.min(...speedValues);

    const avgPower = Math.round(powerValues.reduce((a, b) => a + b, 0) / powerValues.length);
    const peakPower = Math.max(...powerValues);

    const avgCadence = Math.round(cadenceValues.reduce((a, b) => a + b, 0) / cadenceValues.length);
    
    let ascent = 0;
    let descent = 0;
    for (let i = 1; i < elevValues.length; i++) {
      const d = elevValues[i] - elevValues[i - 1];
      if (d > 0) ascent += d;
      else descent += Math.abs(d);
    }

    const minElev = Math.min(...elevValues);
    const maxElev = Math.max(...elevValues);

    const halfLen = Math.floor(telemetry.length / 2);
    const firstHalfSpeedSum = telemetry.slice(0, halfLen).reduce((a, b) => a + b.speed, 0);
    const firstHalfHrSum = telemetry.slice(0, halfLen).reduce((a, b) => a + b.heartRate, 0);
    const secondHalfSpeedSum = telemetry.slice(halfLen).reduce((a, b) => a + b.speed, 0);
    const secondHalfHrSum = telemetry.slice(halfLen).reduce((a, b) => a + b.heartRate, 0);

    const firstHalfEF = firstHalfHrSum > 0 ? (firstHalfSpeedSum / halfLen) / (firstHalfHrSum / halfLen) : 0;
    const secondHalfEF = secondHalfHrSum > 0 ? (secondHalfSpeedSum / (telemetry.length - halfLen)) / (secondHalfHrSum / (telemetry.length - halfLen)) : 0;
    const decoupling = firstHalfEF > 0 ? calculateAerobicDecoupling(firstHalfEF, secondHalfEF) : 0;

    const pv = calculatePacingVariability(speedValues);

    return {
      avgHr, maxHr, minHr,
      avgSpeed, maxSpeed, minSpeed,
      avgPower, peakPower, avgCadence,
      ascent: Math.round(ascent * 10) / 10,
      descent: Math.round(descent * 10) / 10,
      minElev, maxElev, decoupling, pv
    };
  }, [telemetry]);

  // Environmental mapping
  const envDetails = useMemo(() => {
    switch (suffixKey) {
      case 'run_2':
        return { temp: 8.5, humidity: 82, wind: "14 km/h N", altitude: 18, pressure: "1016 hPa", surface: "Clay/Dirt Trail", icon: "CloudSun", precipProb: 10 };
      case 'run_3':
        return { temp: 15.8, humidity: 55, wind: "8 km/h SW", altitude: 12, pressure: "1012 hPa", surface: "Asphalt", icon: "Sun", precipProb: 0 };
      case 'run_4':
        return { temp: 16.2, humidity: 60, wind: "4 km/h W", altitude: 25, pressure: "1009 hPa", surface: "Polyurethane Track", icon: "Sun", precipProb: 0 };
      case 'run_5':
        return { temp: 14.1, humidity: 75, wind: "19 km/h NE", altitude: 62, pressure: "1005 hPa", surface: "Gravel Trail", icon: "CloudSun", precipProb: 5 };
      default:
        return { temp: 17.1, humidity: 62, wind: "11 km/h NW", altitude: 35, pressure: "1011 hPa", surface: "Asphalt/Pavement", icon: "Sun", precipProb: 0 };
    }
  }, [suffixKey]);

  // Equipment detail mapping
  const eqDetails = useMemo(() => {
    const devices = {
      run_1: { shoe: "Nike Air Zoom Pegasus 39", mileage: "450 km", device: "Garmin Forerunner 955", sensor: "Garmin HRM-Dual", gpsAcc: "± 1.8m (Dual-Band)", battery: "84%" },
      run_2: { shoe: "Nike Air Zoom Pegasus 39", mileage: "462 km", device: "Garmin Forerunner 955", sensor: "Wrist Optical HRM", gpsAcc: "± 2.5m (GPS Only)", battery: "68%" },
      run_3: { shoe: "Saucony Kinvara 14", mileage: "86 km", device: "Garmin Forerunner 955", sensor: "Wrist Optical HRM", gpsAcc: "± 1.8m (Dual-Band)", battery: "92%" },
      run_4: { shoe: "Nike Vaporfly 3", mileage: "42 km", device: "Garmin Forerunner 955", sensor: "Polar H10 Strap", gpsAcc: "± 1.2m (High Precision)", battery: "76%" },
      run_5: { shoe: "Nike Air Zoom Pegasus 39", mileage: "475 km", device: "Garmin Instinct 2", sensor: "Wrist Optical HRM", gpsAcc: "± 5.4m (Standard GPS)", battery: "44%" }
    };
    return devices[suffixKey as keyof typeof devices] || devices.run_1;
  }, [suffixKey]);

  // Rule-Based Decision and Alerts Log
  const eventsDetected = useMemo(() => {
    const events = [];
    
    events.push({
      time: "00:00 - 05:00",
      title: "Active Warm-up Ingress",
      description: "Initial physical calibration. Systemic blood flow redirection to active motor units.",
      severity: "info"
    });

    if (suffixKey === 'run_1') {
      events.push({
        time: "12:00 - 35:00",
        title: "Aerobic Threshold Steady Block",
        description: "Extended segment holding stable pace under target lactate threshold parameters.",
        severity: "success"
      });
      events.push({
        time: "18:20",
        title: "Ascent Peak Decoupling Spike",
        description: "Temporary mechanical and physiological decoupling induced by steep elevation slope.",
        severity: "warning"
      });
    } else if (suffixKey === 'run_3') {
      events.push({
        time: "08:15",
        title: "Stride Acceleration Block 1",
        description: "Neuromuscular activation. High-cadence (195 spm) stride holding peak mechanical power.",
        severity: "success"
      });
    } else if (suffixKey === 'run_4') {
      events.push({
        time: "06:15 - 12:30",
        title: "Interval Block 1 (Work Phase)",
        description: "Targeting lactate threshold with mechanical power exceeding 345 Watts.",
        severity: "success"
      });
    } else if (suffixKey === 'run_5') {
      events.push({
        time: "12:10 - 15:30",
        title: "Heart Rate Sensor Signal Loss",
        description: "Severe electrode dropout or telemetry decoupling. Zero value detected across stream.",
        severity: "danger"
      });
    }

    events.push({
      time: "End Segment",
      title: "Active Recovery Cooldown",
      description: "Metabolic clearance and structural deceleration phase.",
      severity: "info"
    });

    return events;
  }, [suffixKey]);

  // Kilometer Splits computation
  const splits = useMemo(() => {
    const list = [];
    const stepSize = Math.floor(telemetry.length / 10);
    const totalKm = activeActSummary.distanceKm;
    const splitDist = totalKm / 10;

    for (let s = 0; s < 10; s++) {
      const startIdx = s * stepSize;
      const endIdx = Math.min((s + 1) * stepSize, telemetry.length - 1);
      const segment = telemetry.slice(startIdx, endIdx + 1);

      const sDist = splitDist;
      const sTimeSec = (activeActSummary.duration.includes(':') 
        ? (activeActSummary.duration.split(':').reduce((acc: number, time: string) => (60 * acc) + +time, 0)) 
        : 2980) / 10;
      
      const avgSegHr = Math.round(segment.reduce((a, b) => a + b.heartRate, 0) / segment.length);
      const avgSegPower = Math.round(segment.reduce((a, b) => a + b.power, 0) / segment.length);
      const avgSegCad = Math.round(segment.reduce((a, b) => a + b.cadence, 0) / segment.length);
      const avgSegElev = segment[segment.length - 1].elevation - segment[0].elevation;
      const avgSegTemp = segment.reduce((a, b) => a + b.temperature, 0) / segment.length;
      const avgGrade = segment.reduce((a, b) => a + b.grade, 0) / segment.length;
      
      const gapSeconds = sTimeSec * (1.0 - (avgGrade * 0.04));

      const formatSplitTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const secVal = Math.floor(secs % 60);
        return `${m}:${secVal < 10 ? '0' : ''}${secVal}`;
      };

      list.push({
        num: s + 1,
        distance: sDist.toFixed(1) + " km",
        time: formatSplitTime(sTimeSec),
        pace: formatSplitTime(sTimeSec) + "/km",
        gap: formatSplitTime(gapSeconds) + "/km",
        hr: avgSegHr > 0 ? `${avgSegHr} bpm` : "N/A",
        power: `${avgSegPower} W`,
        cadence: `${avgSegCad} spm`,
        elev: `${avgSegElev > 0 ? '+' : ''}${Math.round(avgSegElev)}m`,
        temp: `${avgSegTemp.toFixed(1)}°C`
      });
    }

    return list;
  }, [telemetry, activeActSummary]);

  // HR & Power Zone allocations
  const zoneDistributions = useMemo(() => {
    const hrDistribution = [
      { name: 'Z1 Active Recovery', range: '60 - 120 bpm', pct: 15, color: '#90A4AE' },
      { name: 'Z2 Aerobic Endurance', range: '121 - 140 bpm', pct: 45, color: '#4CAF50' },
      { name: 'Z3 Tempo/Steady', range: '141 - 159 bpm', pct: 25, color: '#FFEB3B' },
      { name: 'Z4 Lactate Threshold', range: '160 - 175 bpm', pct: 10, color: '#FF9800' },
      { name: 'Z5 Anaerobic Capacity', range: '176+ bpm', pct: 5, color: '#F44336' },
    ];

    const powerDistribution = [
      { name: 'Z1 Active Recovery', range: '0 - 150 W', pct: 10, color: '#90A4AE' },
      { name: 'Z2 Endurance', range: '151 - 200 W', pct: 35, color: '#4CAF50' },
      { name: 'Z3 Tempo', range: '201 - 240 W', pct: 30, color: '#81C784' },
      { name: 'Z4 Threshold', range: '241 - 275 W', pct: 15, color: '#FFD54F' },
      { name: 'Z5 VO2 Max', range: '276 - 310 W', pct: 7, color: '#FFB74D' },
      { name: 'Z6 Anaerobic', range: '311 - 360 W', pct: 2, color: '#E57373' },
      { name: 'Z7 Neuromuscular', range: '361+ W', pct: 1, color: '#EF5350' },
    ];

    if (suffixKey === 'run_2') {
      hrDistribution[1].pct = 80; hrDistribution[2].pct = 5; hrDistribution[0].pct = 15;
      powerDistribution[1].pct = 75; powerDistribution[2].pct = 15; powerDistribution[0].pct = 10;
    } else if (suffixKey === 'run_4') {
      hrDistribution[3].pct = 40; hrDistribution[4].pct = 20; hrDistribution[1].pct = 20; hrDistribution[0].pct = 20;
      powerDistribution[4].pct = 35; powerDistribution[5].pct = 15; powerDistribution[1].pct = 20; powerDistribution[0].pct = 30;
    } else if (suffixKey === 'run_3') {
      hrDistribution[0].pct = 70; hrDistribution[1].pct = 20; hrDistribution[2].pct = 10;
      powerDistribution[0].pct = 65; powerDistribution[1].pct = 20; powerDistribution[2].pct = 15;
    }

    return { hr: hrDistribution, power: powerDistribution };
  }, [suffixKey]);

  // Export pipeline handler
  const handleExport = (type: 'csv' | 'json' | 'gpx' | 'fit') => {
    const dataString = type === 'json' 
      ? JSON.stringify(telemetry, null, 2)
      : type === 'csv'
        ? "timestamp,cumulative_distance,heart_rate,power,cadence,elevation,speed,grade,temp\n" + 
          telemetry.map(t => `${t.time},${t.distance},${t.heartRate},${t.power},${t.cadence},${t.elevation},${t.speed},${t.grade},${t.temperature}`).join("\n")
        : `<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="Track.Studio"><trk><trkseg>` + 
          telemetry.map(t => `<trkpt lat="${t.latitude}" lon="${t.longitude}"><ele>${t.elevation}</ele><time>${new Date(Date.now() - t.time * 1000).toISOString()}</time></trkpt>`).join("") + 
          `</trkseg></trk></gpx>`;

    const blob = new Blob([dataString], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `track_studio_${activityId}_export.${type}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyRawData = () => {
    navigator.clipboard.writeText(JSON.stringify(telemetry, null, 2));
    alert("Raw Activity Stream copied to clipboard.");
  };

  // Projected SVG coordinates
  const svgCoordinates = useMemo(() => {
    const lats = telemetry.map(t => t.latitude);
    const lngs = telemetry.map(t => t.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = maxLat - minLat || 0.001;
    const lngRange = maxLng - minLng || 0.001;

    const margin = 40;
    const size = 320;

    return telemetry.map((t, index) => {
      const y = size - ((t.latitude - minLat) / latRange) * size + margin;
      const x = ((t.longitude - minLng) / lngRange) * size + margin;
      
      let segmentColor = "#FF6B00"; 
      if (metricColorBy === 'hr') {
        segmentColor = t.heartRate > 165 ? "#EF5350" : t.heartRate > 145 ? "#FFB74D" : t.heartRate > 125 ? "#81C784" : "#90A4AE";
        if (t.heartRate === 0) segmentColor = "#E53935";
      } else if (metricColorBy === 'power') {
        segmentColor = t.power > 320 ? "#D32F2F" : t.power > 260 ? "#FFB300" : t.power > 200 ? "#4CAF50" : "#78909C";
      } else if (metricColorBy === 'pace') {
        const paceSec = t.speed > 0 ? 1000 / t.speed : 9999;
        segmentColor = paceSec < 260 ? "#00E5FF" : paceSec < 310 ? "#00B0FF" : paceSec < 360 ? "#2979FF" : "#1A237E";
      } else if (metricColorBy === 'cadence') {
        segmentColor = t.cadence > 180 ? "#7E57C2" : t.cadence > 170 ? "#4CAF50" : "#B0BEC5";
      } else if (metricColorBy === 'grade') {
        segmentColor = t.grade > 4 ? "#F44336" : t.grade < -2 ? "#2196F3" : "#4CAF50";
      }

      return { x, y, color: segmentColor, tick: t, index };
    });
  }, [telemetry, metricColorBy]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleResetMap = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Programmatic Search/Filter reset
  const resetFilters = () => {
    setSearchQuery('');
    setFilterDistanceMin('');
    setFilterDistanceMax('');
    setFilterDurationMin('');
    setFilterShoes('all');
    setFilterDevice('all');
    setFilterProvider('all');
    setFilterWorkoutType('all');
    setFilterIndoorOutdoor('all');
  };

  return (
    <div className="space-y-6 select-none font-sans" id="activity-analysis-workspace-root">
      
      {/* PERSPECTIVE WORKSPACE SELECTOR */}
      <div className="flex border-b border-border/60 pb-3 gap-4" id="workspace-navigator">
        <button
          onClick={() => setActiveWorkspaceTab('inspector')}
          className={cn(
            "text-xs font-mono font-black uppercase pb-1 border-b-2 tracking-tight transition-all flex items-center gap-1.5 cursor-pointer",
            activeWorkspaceTab === 'inspector' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Activity className="h-4 w-4" />
          Active Workout Inspector
        </button>
        <button
          onClick={() => setActiveWorkspaceTab('athlete')}
          className={cn(
            "text-xs font-mono font-black uppercase pb-1 border-b-2 tracking-tight transition-all flex items-center gap-1.5 cursor-pointer",
            activeWorkspaceTab === 'athlete' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <User className="h-4 w-4" />
          Athlete Performance Profile
        </button>
        <button
          onClick={() => setActiveWorkspaceTab('traceability')}
          className={cn(
            "text-xs font-mono font-black uppercase pb-1 border-b-2 tracking-tight transition-all flex items-center gap-1.5 cursor-pointer",
            activeWorkspaceTab === 'traceability' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Database className="h-4 w-4" />
          Data Ingestion & Traceability Audit
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* VIEW 1: MAIN WORKOUT INSPECTOR */}
        {activeWorkspaceTab === 'inspector' && (
          <motion.div
            key="inspector"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* UNIFIED ACTIVITY SEARCH & FILTER CONSOLE */}
            <div className="rounded-[20px] border border-border bg-card p-5 shadow-xs space-y-4" id="ingestion-filter-console">
              <div className="flex items-center justify-between border-b border-border/30 pb-3">
                <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="h-4 w-4" />
                  Unified Ingestion Search & Filters
                </span>
                <button 
                  onClick={resetFilters}
                  className="text-[9px] font-mono font-bold uppercase text-rose-500 hover:underline cursor-pointer"
                >
                  [ Clear All Filters ]
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {/* Text Keyword Search */}
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-[9px] font-mono text-muted-foreground uppercase block">Keyword (Name, Location, Device, Shoes)</span>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search synchronized runs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-[10px] bg-muted/30 border border-border rounded pl-8 pr-3 py-1.5 outline-none focus:border-primary/50 font-mono font-medium uppercase"
                    />
                  </div>
                </div>

                {/* Distance Filter */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-muted-foreground uppercase block">Distance Range (Min - Max km)</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filterDistanceMin}
                      onChange={(e) => setFilterDistanceMin(e.target.value)}
                      className="w-full text-[10px] bg-muted/30 border border-border rounded px-2 py-1 outline-none focus:border-primary/50 font-mono text-center"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filterDistanceMax}
                      onChange={(e) => setFilterDistanceMax(e.target.value)}
                      className="w-full text-[10px] bg-muted/30 border border-border rounded px-2 py-1 outline-none focus:border-primary/50 font-mono text-center"
                    />
                  </div>
                </div>

                {/* Duration Filter */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-muted-foreground uppercase block">Min Duration (mins)</span>
                  <input
                    type="number"
                    placeholder="Min Mins"
                    value={filterDurationMin}
                    onChange={(e) => setFilterDurationMin(e.target.value)}
                    className="w-full text-[10px] bg-muted/30 border border-border rounded px-2 py-1 outline-none focus:border-primary/50 font-mono text-center"
                  />
                </div>

                {/* Shoe Selector */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-muted-foreground uppercase block">Shoe Sensor model</span>
                  <select
                    value={filterShoes}
                    onChange={(e) => setFilterShoes(e.target.value)}
                    className="w-full text-[10px] bg-muted/30 border border-border rounded px-2 py-1 outline-none focus:border-primary/50 font-mono uppercase h-7"
                  >
                    <option value="all">ALL SHOES</option>
                    <option value="nike_air_zoom_pegasus_39">Pegasus 39</option>
                    <option value="saucony_kinvara_14">Kinvara 14</option>
                    <option value="nike_vaporfly_3">Vaporfly 3</option>
                  </select>
                </div>

                {/* Workout Type Selector */}
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-muted-foreground uppercase block">Workout category</span>
                  <select
                    value={filterWorkoutType}
                    onChange={(e) => setFilterWorkoutType(e.target.value)}
                    className="w-full text-[10px] bg-muted/30 border border-border rounded px-2 py-1 outline-none focus:border-primary/50 font-mono uppercase h-7"
                  >
                    <option value="all">ALL WORKOUTS</option>
                    <option value="tempo">Tempo Base</option>
                    <option value="recovery">Recovery Strides</option>
                    <option value="intervals">Lactate Intervals</option>
                  </select>
                </div>
              </div>

              {/* Advanced Row: Device, Provider, Environment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-1">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-muted-foreground uppercase block">Satellite Device Terminal</span>
                  <select
                    value={filterDevice}
                    onChange={(e) => setFilterDevice(e.target.value)}
                    className="w-full text-[10px] bg-muted/30 border border-border rounded px-2 py-1 outline-none focus:border-primary/50 font-mono uppercase h-7"
                  >
                    <option value="all">ALL DEVICES</option>
                    <option value="garmin_forerunner_955">Forerunner 955</option>
                    <option value="garmin_instinct_2">Instinct 2</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-muted-foreground uppercase block">Ingestion Provider source</span>
                  <select
                    value={filterProvider}
                    onChange={(e) => setFilterProvider(e.target.value)}
                    className="w-full text-[10px] bg-muted/30 border border-border rounded px-2 py-1 outline-none focus:border-primary/50 font-mono uppercase h-7"
                  >
                    <option value="all">ALL PROVIDERS</option>
                    <option value="strava">STRAVA API</option>
                    <option value="intervals-icu">INTERVALS.ICU</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-muted-foreground uppercase block">Atmospheric Environmental Factor</span>
                  <select
                    value={filterIndoorOutdoor}
                    onChange={(e) => setFilterIndoorOutdoor(e.target.value)}
                    className="w-full text-[10px] bg-muted/30 border border-border rounded px-2 py-1 outline-none focus:border-primary/50 font-mono uppercase h-7"
                  >
                    <option value="all">ALL ENVIRONMENT</option>
                    <option value="outdoor">OUTDOOR SLOPES</option>
                    <option value="indoor">INDOOR TRAINER</option>
                  </select>
                </div>

                <div className="lg:col-span-2 flex items-end justify-between text-[9px] font-mono text-muted-foreground pb-1">
                  <span>Filtered Matching Index: <b className="text-foreground">{filteredActivities.length} of {activities.length} runs</b></span>
                  <span>Ingestion Engine: <b className="text-emerald-500">Locked</b></span>
                </div>
              </div>
            </div>

            {/* SELECTION MATRIX FOR FILTERED RUNS */}
            <div className="rounded-[20px] border border-border bg-card p-5 shadow-xs" id="filtered-activities-deck">
              <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase block mb-3">Matching Ingests Index Directory</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {filteredActivities.length === 0 ? (
                  <div className="col-span-full text-center py-6 text-xs text-muted-foreground font-mono uppercase border border-dashed border-border rounded-xl">
                    No synchronized runs match your active search metrics.
                  </div>
                ) : (
                  filteredActivities.map((act: any) => {
                    const isSelected = activityId === act.id;
                    return (
                      <button
                        key={act.id}
                        onClick={() => setSelectedActivityId(act.id)}
                        className={cn(
                          "p-3 rounded-xl border text-left font-mono text-[10px] transition-all relative overflow-hidden flex flex-col justify-between h-24 hover:scale-[1.01] cursor-pointer",
                          isSelected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-muted/10 hover:bg-muted/20"
                        )}
                      >
                        <div className="space-y-1">
                          <div className="flex justify-between items-center gap-1">
                            <span className="text-[8px] text-muted-foreground truncate block">{new Date(act.date).toLocaleDateString()}</span>
                            <span className="text-[7.5px] font-bold bg-muted-foreground/10 text-muted-foreground py-0.5 px-1 rounded uppercase">
                              {act.externalProviderId || 'strava'}
                            </span>
                          </div>
                          <span className="font-bold text-foreground truncate block leading-tight uppercase">{act.title}</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-2 border-t border-border/20">
                          <span className="font-extrabold text-foreground">{act.distanceKm.toFixed(1)} km</span>
                          <span className="text-[8.5px] text-primary font-bold">{act.pace}/km</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* ACTIVE WORKOUT HERO HEADER */}
            <div className="rounded-[20px] border border-border bg-card p-5 md:p-6 shadow-xs relative overflow-hidden" id="workout-detail-hero">
              <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10 pb-5 border-b border-border/40">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[8px] font-mono font-bold bg-[#FF6B00]/10 text-[#FF6B00] py-0.5 px-2 rounded uppercase border border-[#FF6B00]/20 flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Durable normalized Stream lock
                    </span>
                    <span className="text-[8px] font-mono font-bold bg-muted text-muted-foreground py-0.5 px-2 rounded uppercase">
                      ID: {activeActSummary.id}
                    </span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground uppercase">
                    {activeActSummary.title}
                  </h1>
                  <p className="text-xs text-muted-foreground font-mono mt-1 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    {new Date(activeActSummary.date).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      const targetIdx = (activities.findIndex((act: any) => act.id === activityId) + 1) % activities.length;
                      setSelectedActivityId(activities[targetIdx]?.id || 'run_1');
                    }}
                    className="px-3 py-1.5 rounded-lg border border-border bg-muted/40 text-[9px] font-mono font-bold uppercase hover:bg-muted/60 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    Next Activity <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Dynamic core physiological indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-5 select-none font-mono">
                <div className="space-y-1">
                  <span className="text-[8.5px] text-muted-foreground uppercase block">Distance</span>
                  <span className="text-lg font-black tracking-tight text-foreground">{activeActSummary.distanceKm.toFixed(2)} km</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[8.5px] text-muted-foreground uppercase block">Moving Time</span>
                  <span className="text-lg font-black tracking-tight text-foreground">{activeActSummary.duration}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[8.5px] text-muted-foreground uppercase block">Avg Pace</span>
                  <span className="text-lg font-black tracking-tight text-[#FF6B00]">{activeActSummary.pace}/km</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[8.5px] text-muted-foreground uppercase block">Stress Score (RSS)</span>
                  <span className="text-lg font-black tracking-tight text-status-warning flex items-center gap-1">
                    <Flame className="h-4.5 w-4.5 text-status-warning" />
                    {activeActSummary.rss}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[8.5px] text-muted-foreground uppercase block">Intensity Factor (IF)</span>
                  <span className="text-lg font-black tracking-tight text-foreground">
                    {calculateIntensityFactor(calculatedStats.avgSpeed, 1000/285).toFixed(2)}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[8.5px] text-muted-foreground uppercase block">Efficiency (EF)</span>
                  <span className="text-lg font-black tracking-tight text-foreground">
                    {calculateEfficiencyFactor(calculatedStats.avgSpeed, calculatedStats.avgHr)?.toFixed(3) || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* HIGH-FIDELITY COLLAPSIBLE SECTIONS ACCORDION */}
            <div className="space-y-4" id="workout-collapsible-accordion">
              
              {/* 1. OVERVIEW SECTION */}
              <div className="border border-border bg-card rounded-[20px] overflow-hidden">
                <button
                  onClick={() => toggleSection('overview')}
                  className="w-full flex items-center justify-between p-5 font-mono text-xs font-bold uppercase border-b border-border/30 bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    <span>01. Core physiological Overview</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", !collapsedSections.overview && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {!collapsedSections.overview && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-[11px]">
                        <div className="p-3.5 bg-muted/10 border border-border/40 rounded-xl space-y-1">
                          <span className="text-muted-foreground block text-[9px] uppercase">Aerobic Energy Load</span>
                          <span className="text-sm font-black text-foreground">{(activeActSummary.rss * 0.45).toFixed(1)} kcal/min</span>
                        </div>
                        <div className="p-3.5 bg-muted/10 border border-border/40 rounded-xl space-y-1">
                          <span className="text-muted-foreground block text-[9px] uppercase">Lactate Burden</span>
                          <span className="text-sm font-black text-primary">{(calculateIntensityFactor(calculatedStats.avgSpeed, 1000/285) * 100).toFixed(0)}% FTP</span>
                        </div>
                        <div className="p-3.5 bg-muted/10 border border-border/40 rounded-xl space-y-1">
                          <span className="text-muted-foreground block text-[9px] uppercase">Active Ascent</span>
                          <span className="text-sm font-black text-foreground">+{calculatedStats.ascent}m</span>
                        </div>
                        <div className="p-3.5 bg-muted/10 border border-border/40 rounded-xl space-y-1">
                          <span className="text-muted-foreground block text-[9px] uppercase">Active Descent</span>
                          <span className="text-sm font-black text-foreground">-{calculatedStats.descent}m</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 2. SPLITS (1KM) */}
              <div className="border border-border bg-card rounded-[20px] overflow-hidden">
                <button
                  onClick={() => toggleSection('splits')}
                  className="w-full flex items-center justify-between p-5 font-mono text-xs font-bold uppercase border-b border-border/30 bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-primary" />
                    <span>02. Kilometer splits directory</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", !collapsedSections.splits && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {!collapsedSections.splits && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                          <thead>
                            <tr className="border-b border-border/50 text-[9px] font-mono font-bold text-muted-foreground uppercase">
                              <th className="py-2.5 px-2">Split km</th>
                              <th className="py-2.5 px-2">Dist</th>
                              <th className="py-2.5 px-2">Time</th>
                              <th className="py-2.5 px-2">Pace</th>
                              <th className="py-2.5 px-2 text-[#FF6B00]">GAP</th>
                              <th className="py-2.5 px-2 text-rose-500">Heart Rate</th>
                              <th className="py-2.5 px-2 text-amber-500">Power</th>
                              <th className="py-2.5 px-2 text-violet-400">Cadence</th>
                              <th className="py-2.5 px-2 text-sky-400">Slope</th>
                              <th className="py-2.5 px-2 text-right">Temp</th>
                            </tr>
                          </thead>
                          <tbody className="font-mono text-[10px]">
                            {splits.map((s) => (
                              <tr key={s.num} className="border-b border-border/20 hover:bg-primary/5 transition-colors">
                                <td className="py-2.5 px-2 font-black text-foreground">{s.num}</td>
                                <td className="py-2.5 px-2 text-muted-foreground">{s.distance}</td>
                                <td className="py-2.5 px-2 text-foreground font-semibold">{s.time}</td>
                                <td className="py-2.5 px-2 text-foreground font-semibold">{s.pace}</td>
                                <td className="py-2.5 px-2 text-[#FF6B00] font-bold">{s.gap}</td>
                                <td className="py-2.5 px-2 text-rose-400 font-bold">{s.hr}</td>
                                <td className="py-2.5 px-2 text-amber-400">{s.power}</td>
                                <td className="py-2.5 px-2 text-violet-400">{s.cadence}</td>
                                <td className="py-2.5 px-2 text-sky-400">{s.elev}</td>
                                <td className="py-2.5 px-2 text-right text-muted-foreground">{s.temp}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. LAPS */}
              <div className="border border-border bg-card rounded-[20px] overflow-hidden">
                <button
                  onClick={() => toggleSection('laps')}
                  className="w-full flex items-center justify-between p-5 font-mono text-xs font-bold uppercase border-b border-border/30 bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <span>03. Laps Ingest directory</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", !collapsedSections.laps && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {!collapsedSections.laps && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                          <thead>
                            <tr className="border-b border-border/50 text-[9px] font-mono font-bold text-muted-foreground uppercase">
                              <th className="py-2.5 px-2">Lap Index</th>
                              <th className="py-2.5 px-2">Lap Name</th>
                              <th className="py-2.5 px-2">Distance (m)</th>
                              <th className="py-2.5 px-2">Moving time (s)</th>
                              <th className="py-2.5 px-2 text-rose-500">Avg HR</th>
                              <th className="py-2.5 px-2 text-amber-500">Avg Power</th>
                              <th className="py-2.5 px-2 text-violet-400">Avg Cadence</th>
                              <th className="py-2.5 px-2 text-right">Speed (m/s)</th>
                            </tr>
                          </thead>
                          <tbody className="font-mono text-[10px]">
                            <tr className="border-b border-border/20">
                              <td className="py-2.5 px-2 font-black text-foreground">1</td>
                              <td className="py-2.5 px-2 text-muted-foreground">Calibration Phase</td>
                              <td className="py-2.5 px-2">1,000 m</td>
                              <td className="py-2.5 px-2">298 s</td>
                              <td className="py-2.5 px-2 text-rose-400 font-bold">{calculatedStats.avgHr - 12} bpm</td>
                              <td className="py-2.5 px-2 text-amber-400">{calculatedStats.avgPower - 25} W</td>
                              <td className="py-2.5 px-2 text-violet-400">{calculatedStats.avgCadence} spm</td>
                              <td className="py-2.5 px-2 text-right">3.35 m/s</td>
                            </tr>
                            <tr className="border-b border-border/20">
                              <td className="py-2.5 px-2 font-black text-foreground">2</td>
                              <td className="py-2.5 px-2 text-muted-foreground">Target Tempo Block</td>
                              <td className="py-2.5 px-2">8,000 m</td>
                              <td className="py-2.5 px-2">2,384 s</td>
                              <td className="py-2.5 px-2 text-rose-400 font-bold">{calculatedStats.avgHr} bpm</td>
                              <td className="py-2.5 px-2 text-amber-400">{calculatedStats.avgPower} W</td>
                              <td className="py-2.5 px-2 text-violet-400">{calculatedStats.avgCadence + 2} spm</td>
                              <td className="py-2.5 px-2 text-right">3.36 m/s</td>
                            </tr>
                            <tr className="border-b border-border/20">
                              <td className="py-2.5 px-2 font-black text-foreground">3</td>
                              <td className="py-2.5 px-2 text-muted-foreground">Metabolic Cooldown</td>
                              <td className="py-2.5 px-2">1,000 m</td>
                              <td className="py-2.5 px-2">298 s</td>
                              <td className="py-2.5 px-2 text-rose-400 font-bold">{calculatedStats.avgHr - 18} bpm</td>
                              <td className="py-2.5 px-2 text-amber-400">{calculatedStats.avgPower - 50} W</td>
                              <td className="py-2.5 px-2 text-violet-400">{calculatedStats.avgCadence - 2} spm</td>
                              <td className="py-2.5 px-2 text-right">3.35 m/s</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 4. STREAMS TIMELINE & GPS MAP */}
              <div className="border border-border bg-card rounded-[20px] overflow-hidden">
                <button
                  onClick={() => toggleSection('streams')}
                  className="w-full flex items-center justify-between p-5 font-mono text-xs font-bold uppercase border-b border-border/30 bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <span>04. Multi-layer streams timeline & GPS Route map</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", !collapsedSections.streams && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {!collapsedSections.streams && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* SVG ROUTE MAP */}
                        <div className="lg:col-span-5 rounded-xl border border-border bg-muted/5 p-4 flex flex-col justify-between h-[400px]">
                          <div>
                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/30">
                              <span className="text-[9px] font-mono font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Globe className="h-4 w-4 text-primary" />
                                Route Map projection
                              </span>
                              <div className="flex items-center gap-1">
                                {['dark', 'satellite', 'terrain'].map((type) => (
                                  <button
                                    key={type}
                                    onClick={() => setMapType(type as any)}
                                    className={cn(
                                      "px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-all cursor-pointer",
                                      mapType === type ? "bg-primary/25 text-primary border border-primary/30" : "bg-muted text-muted-foreground hover:bg-muted/70"
                                    )}
                                  >
                                    {type}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Stream coloring options */}
                            <div className="flex flex-wrap items-center gap-1 mb-4 select-none">
                              <span className="text-[8px] font-mono text-muted-foreground uppercase mr-1.5">Map path:</span>
                              {['pace', 'hr', 'power', 'cadence', 'grade'].map((metric) => (
                                <button
                                  key={metric}
                                  onClick={() => setMetricColorBy(metric as any)}
                                  className={cn(
                                    "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase transition-all cursor-pointer",
                                    metricColorBy === metric ? "bg-primary/20 text-primary border border-primary/20" : "text-muted-foreground hover:bg-muted"
                                  )}
                                >
                                  {metric}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Canvas trail */}
                          <div 
                            className="h-56 w-full border border-border/40 rounded-xl bg-muted/10 relative overflow-hidden cursor-crosshair select-none"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                          >
                            <svg className="absolute inset-0 w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
                              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} className="transition-transform duration-100 ease-out">
                                {svgCoordinates.map((pt, index) => {
                                  if (index === 0) return null;
                                  const prev = svgCoordinates[index - 1];
                                  return (
                                    <line 
                                      key={index}
                                      x1={prev.x}
                                      y1={prev.y}
                                      x2={pt.x}
                                      y2={pt.y}
                                      stroke={pt.color}
                                      strokeWidth={hoverIndex === index ? 6.5 : 4}
                                      className="transition-all cursor-pointer"
                                      onMouseEnter={() => setHoverIndex(index)}
                                    />
                                  );
                                })}

                                {svgCoordinates.length > 0 && (
                                  <g transform={`translate(${svgCoordinates[0].x}, ${svgCoordinates[0].y})`}>
                                    <circle r="6" fill="#10B981" stroke="#fff" strokeWidth="1.5" />
                                  </g>
                                )}

                                {svgCoordinates.length > 0 && (
                                  <g transform={`translate(${svgCoordinates[svgCoordinates.length - 1].x}, ${svgCoordinates[svgCoordinates.length - 1].y})`}>
                                    <circle r="6" fill="#F44336" stroke="#fff" strokeWidth="1.5" />
                                  </g>
                                )}
                              </g>
                            </svg>
                          </div>

                          <div className="mt-2 flex items-center justify-between text-[8px] font-mono text-muted-foreground">
                            <span>Drag to pan route trail</span>
                            <button onClick={handleResetMap} className="underline uppercase font-bold cursor-pointer hover:text-primary">Reset</button>
                          </div>
                        </div>

                        {/* HIGH-FIDELITY CHANNELS */}
                        <div className="lg:col-span-7 space-y-4">
                          <div className="flex items-center justify-between border-b border-border/30 pb-2">
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-primary">Synchronized Stream Channels</span>
                            <div className="flex items-center gap-1.5">
                              <input 
                                type="checkbox" 
                                id="rolling-avg-checkbox" 
                                checked={isRollingAvgEnabled} 
                                onChange={(e) => setIsRollingAvgEnabled(e.target.checked)}
                                className="rounded bg-muted border-border text-primary focus:ring-0 cursor-pointer h-3 w-3"
                              />
                              <label htmlFor="rolling-avg-checkbox" className="text-[8px] font-mono text-muted-foreground uppercase cursor-pointer">Rolling Average</label>
                            </div>
                          </div>

                          {/* Channel 1: HR & Power */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[9px] font-mono">
                              <span className="text-rose-500 font-bold uppercase">Heart rate (bpm) / Power (W)</span>
                              <span className="text-muted-foreground">
                                HR: {hoverIndex !== null ? `${telemetry[hoverIndex].heartRate} bpm` : `${calculatedStats.avgHr} bpm`} • 
                                Power: {hoverIndex !== null ? `${telemetry[hoverIndex].power} W` : `${calculatedStats.avgPower} W`}
                              </span>
                            </div>
                            <div className="h-20 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={telemetry} margin={{ top: 2, right: 2, left: 0, bottom: 2 }} onMouseMove={(e) => e && e.activeTooltipIndex !== undefined && setHoverIndex(e.activeTooltipIndex)} onMouseLeave={() => setHoverIndex(null)}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" opacity={0.15} />
                                  <XAxis dataKey="distance" hide />
                                  <YAxis yAxisId="left" domain={['auto', 'auto']} hide />
                                  <YAxis yAxisId="right" domain={['auto', 'auto']} hide />
                                  <Area yAxisId="left" type="monotone" dataKey="heartRate" stroke="#EF5350" strokeWidth={1.5} fill="#EF5350" fillOpacity={0.1} />
                                  <Area yAxisId="right" type="monotone" dataKey="power" stroke="#FFB74D" strokeWidth={1.5} fill="none" />
                                  {hoverIndex !== null && <ReferenceLine yAxisId="left" x={telemetry[hoverIndex]?.distance} stroke="#FF6B00" strokeDasharray="3 3" />}
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Channel 2: Cadence & Speed */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[9px] font-mono">
                              <span className="text-violet-400 font-bold uppercase">Cadence (spm) / speed (m/s)</span>
                              <span className="text-muted-foreground">
                                Cad: {hoverIndex !== null ? `${telemetry[hoverIndex].cadence} spm` : `${calculatedStats.avgCadence} spm`} • 
                                Speed: {hoverIndex !== null ? `${speedToPaceStr(telemetry[hoverIndex].speed)}/km` : `${activeActSummary.pace}/km`}
                              </span>
                            </div>
                            <div className="h-20 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={telemetry} margin={{ top: 2, right: 2, left: 0, bottom: 2 }} onMouseMove={(e) => e && e.activeTooltipIndex !== undefined && setHoverIndex(e.activeTooltipIndex)} onMouseLeave={() => setHoverIndex(null)}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" opacity={0.15} />
                                  <XAxis dataKey="distance" hide />
                                  <YAxis yAxisId="left" domain={['auto', 'auto']} hide />
                                  <YAxis yAxisId="right" domain={['auto', 'auto']} hide />
                                  <Area yAxisId="left" type="monotone" dataKey="cadence" stroke="#7E57C2" strokeWidth={1.5} fill="#7E57C2" fillOpacity={0.1} />
                                  <Area yAxisId="right" type="monotone" dataKey="speed" stroke="#00E5FF" strokeWidth={1.5} fill="none" />
                                  {hoverIndex !== null && <ReferenceLine yAxisId="left" x={telemetry[hoverIndex]?.distance} stroke="#FF6B00" strokeDasharray="3 3" />}
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Channel 3: Elevation & Temperature */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[9px] font-mono">
                              <span className="text-sky-400 font-bold uppercase">Elevation (m) / Temperature (°C)</span>
                              <span className="text-muted-foreground">
                                Alt: {hoverIndex !== null ? `${telemetry[hoverIndex].elevation}m` : `${calculatedStats.maxElev}m`} • 
                                Temp: {hoverIndex !== null ? `${telemetry[hoverIndex].temperature}°C` : `${envDetails.temp}°C`}
                              </span>
                            </div>
                            <div className="h-20 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={telemetry} margin={{ top: 2, right: 2, left: 0, bottom: 2 }} onMouseMove={(e) => e && e.activeTooltipIndex !== undefined && setHoverIndex(e.activeTooltipIndex)} onMouseLeave={() => setHoverIndex(null)}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" opacity={0.15} />
                                  <XAxis dataKey="distance" tickFormatter={(v) => `${(v/1000).toFixed(1)} km`} stroke="#718096" fontSize={8} fontFamily="monospace" />
                                  <YAxis yAxisId="left" domain={['auto', 'auto']} hide />
                                  <YAxis yAxisId="right" domain={['auto', 'auto']} hide />
                                  <Area yAxisId="left" type="monotone" dataKey="elevation" stroke="#38BDF8" strokeWidth={1.5} fill="#38BDF8" fillOpacity={0.1} />
                                  <Area yAxisId="right" type="monotone" dataKey="temperature" stroke="#FF6B00" strokeWidth={1.5} fill="none" />
                                  {hoverIndex !== null && <ReferenceLine yAxisId="left" x={telemetry[hoverIndex]?.distance} stroke="#FF6B00" strokeDasharray="3 3" />}
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 5. EQUIPMENT */}
              <div className="border border-border bg-card rounded-[20px] overflow-hidden">
                <button
                  onClick={() => toggleSection('equipment')}
                  className="w-full flex items-center justify-between p-5 font-mono text-xs font-bold uppercase border-b border-border/30 bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-primary" />
                    <span>05. Equipment sensor & Footwear Wear Diagnostics</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", !collapsedSections.equipment && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {!collapsedSections.equipment && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-[11px]">
                        <div className="space-y-3">
                          <span className="font-bold text-foreground block uppercase text-[10px] tracking-wider">Wear Mileage status</span>
                          <div>
                            <div className="flex justify-between mb-1 text-[10px]">
                              <span>{eqDetails.shoe}</span>
                              <span className="font-bold">{eqDetails.mileage} / 500.0 km</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${(parseFloat(eqDetails.mileage) / 500) * 100}%` }} />
                            </div>
                          </div>
                          <span className="text-[9px] text-muted-foreground uppercase block">
                            Remaining Shoe Lifecap: <b>{(500 - parseFloat(eqDetails.mileage)).toFixed(1)} km</b>
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-muted-foreground text-[9px] uppercase">Device Terminal</span>
                            <span className="font-black text-foreground block">{eqDetails.device}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-muted-foreground text-[9px] uppercase">Satellite system</span>
                            <span className="font-black text-foreground block">{eqDetails.gpsAcc}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-muted-foreground text-[9px] uppercase">Telemetry Heart rate sensor</span>
                            <span className="font-black text-foreground block">{eqDetails.sensor}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-muted-foreground text-[9px] uppercase">Terminal Battery</span>
                            <span className="font-black text-emerald-500 block">CONNECTED ({eqDetails.battery})</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 6. WEATHER */}
              <div className="border border-border bg-card rounded-[20px] overflow-hidden">
                <button
                  onClick={() => toggleSection('weather')}
                  className="w-full flex items-center justify-between p-5 font-mono text-xs font-bold uppercase border-b border-border/30 bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-primary" />
                    <span>06. Atmospheric environmental weather parameters</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", !collapsedSections.weather && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {!collapsedSections.weather && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-[11px]">
                        <div className="space-y-1">
                          <span className="text-muted-foreground block text-[9px] uppercase">Ambient Temperature</span>
                          <span className="font-black text-foreground block text-sm">{envDetails.temp}°C</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground block text-[9px] uppercase">Humidity coefficient</span>
                          <span className="font-black text-foreground block text-sm">{envDetails.humidity}%</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground block text-[9px] uppercase">Wind velocity</span>
                          <span className="font-black text-foreground block text-sm">{envDetails.wind}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground block text-[9px] uppercase">Precipitation probability</span>
                          <span className="font-black text-foreground block text-sm">{envDetails.precipProb}%</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 7. DATA QUALITY */}
              <div className="border border-border bg-card rounded-[20px] overflow-hidden">
                <button
                  onClick={() => toggleSection('quality')}
                  className="w-full flex items-center justify-between p-5 font-mono text-xs font-bold uppercase border-b border-border/30 bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>07. Inbound Stream Data Quality & Fidelity scores</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", !collapsedSections.quality && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {!collapsedSections.quality && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-[11px]">
                        <div className="p-4 rounded-xl bg-muted/10 border border-border/40 space-y-2">
                          <span className="text-muted-foreground block text-[9px] uppercase">Fidelity Index score</span>
                          <span className="text-xl font-black text-emerald-500 block">{(suffixKey === 'run_5' ? 82.4 : 99.8).toFixed(1)}%</span>
                          <p className="text-[9px] text-muted-foreground leading-relaxed">
                            {suffixKey === 'run_5' 
                              ? "Electrode dropouts detected across heart rate streaming channel. Coordinates variance flag raised." 
                              : "Standard 1Hz ingestion frames synchronized cleanly. No signal loss detected across active heart rate or power channels."}
                          </p>
                        </div>

                        <div className="space-y-2 col-span-2">
                          <span className="font-bold text-foreground block uppercase text-[10px] tracking-wider">Error Isolation Log</span>
                          <div className="space-y-2">
                            <div className="flex justify-between py-1 border-b border-border/10">
                              <span>Total Telemetry Frames Ingested</span>
                              <span className="font-bold">50 frames</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-border/10">
                              <span>Sensor Dropout frames detected</span>
                              <span className={cn("font-bold", suffixKey === 'run_5' ? "text-rose-500" : "text-emerald-500")}>
                                {suffixKey === 'run_5' ? "5 drops" : "0 drops"}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-border/10">
                              <span>GPS Coordinate jumps detected</span>
                              <span className={cn("font-bold", suffixKey === 'run_5' ? "text-rose-500" : "text-emerald-500")}>
                                {suffixKey === 'run_5' ? "1 jump" : "0 jumps"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 8. DECISIONS & ALERTS */}
              <div className="border border-border bg-card rounded-[20px] overflow-hidden">
                <button
                  onClick={() => toggleSection('decisions')}
                  className="w-full flex items-center justify-between p-5 font-mono text-xs font-bold uppercase border-b border-border/30 bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-primary" />
                    <span>08. Rule-Based Diagnostic Decisions & alerts</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", !collapsedSections.decisions && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {!collapsedSections.decisions && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 space-y-3">
                        {eventsDetected.map((ev, idx) => {
                          const badgeColor = ev.severity === 'success' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                             ev.severity === 'warning' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                             ev.severity === 'danger' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-primary/10 text-primary border-primary/20";
                          return (
                            <div key={idx} className="p-3 border border-border/50 rounded-xl bg-muted/5 font-mono text-[10px] space-y-1">
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-foreground uppercase">{ev.title}</span>
                                <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold border", badgeColor)}>{ev.time}</span>
                              </div>
                              <p className="text-muted-foreground leading-normal mt-1">{ev.description}</p>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 9. CALCULATED METRICS */}
              <div className="border border-border bg-card rounded-[20px] overflow-hidden">
                <button
                  onClick={() => toggleSection('calculated')}
                  className="w-full flex items-center justify-between p-5 font-mono text-xs font-bold uppercase border-b border-border/30 bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span>09. Calculated mathematical sports metrics</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", !collapsedSections.calculated && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {!collapsedSections.calculated && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-[11px]">
                        <div className="p-3 bg-muted/10 border border-border/40 rounded-xl space-y-1">
                          <span className="text-muted-foreground block text-[8.5px] uppercase">Pacing Variability (PV)</span>
                          <span className="text-sm font-bold text-[#FF6B00] block">{calculatedStats.pv.toFixed(3)}</span>
                          <span className="text-[7.5px] text-emerald-500 block font-bold">STABLE</span>
                        </div>
                        <div className="p-3 bg-muted/10 border border-border/40 rounded-xl space-y-1">
                          <span className="text-muted-foreground block text-[8.5px] uppercase">Aerobic decoupling</span>
                          <span className="text-sm font-bold text-emerald-500 block">{calculatedStats.decoupling !== null ? `${calculatedStats.decoupling.toFixed(1)}%` : 'N/A'}</span>
                          <span className="text-[7.5px] text-muted-foreground block uppercase">Cardiovascular Drift</span>
                        </div>
                        <div className="p-3 bg-muted/10 border border-border/40 rounded-xl space-y-1">
                          <span className="text-muted-foreground block text-[8.5px] uppercase">Cardiac efficiency</span>
                          <span className="text-sm font-bold text-foreground block">
                            {(calculatedStats.avgHr > 0 ? (calculatedStats.avgSpeed / calculatedStats.avgHr * 1000).toFixed(2) : "N/A")}
                          </span>
                          <span className="text-[7.5px] text-muted-foreground block uppercase">m/beat/km</span>
                        </div>
                        <div className="p-3 bg-muted/10 border border-border/40 rounded-xl space-y-1">
                          <span className="text-muted-foreground block text-[8.5px] uppercase">Leg Spring Proxy</span>
                          <span className="text-sm font-bold text-foreground block">11.4 kN/m</span>
                          <span className="text-[7.5px] text-muted-foreground block uppercase">Elastic Recoil proxy</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 10. RAW METADATA */}
              <div className="border border-border bg-card rounded-[20px] overflow-hidden">
                <button
                  onClick={() => toggleSection('rawMetadata')}
                  className="w-full flex items-center justify-between p-5 font-mono text-xs font-bold uppercase border-b border-border/30 bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    <span>10. Normalized activity firestore Document</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", !collapsedSections.rawMetadata && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {!collapsedSections.rawMetadata && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 font-mono text-[10px] space-y-2">
                        <div className="flex justify-between items-center pb-2 border-b border-border/30">
                          <span className="font-bold text-foreground">Firestore Document Path</span>
                          <span className="text-muted-foreground">users/{activeAthlete.id}/canonical_activities/{activeActSummary.id}</span>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-xl max-h-56 overflow-y-auto scrollbar-thin">
                          <pre className="text-muted-foreground text-[9px] uppercase leading-normal">
                            {JSON.stringify({
                              id: activeActSummary.id,
                              athleteId: activeAthlete.id,
                              activityName: activeActSummary.title,
                              sportType: "running",
                              startDate: activeActSummary.date,
                              distanceMeters: activeActSummary.distanceKm * 1000,
                              movingTimeSec: calculatedStats.avgSpeed > 0 ? activeActSummary.distanceKm * 1000 / calculatedStats.avgSpeed : 2980,
                              averageHeartRateBpm: calculatedStats.avgHr,
                              averagePowerWatts: calculatedStats.avgPower,
                              averageCadenceRpm: calculatedStats.avgCadence,
                              metadata: {
                                schemaVersion: "1.0.0",
                                importedAt: new Date().toISOString(),
                                transformationVersion: "1.0.0"
                              }
                            }, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 11. PROVIDER METADATA */}
              <div className="border border-border bg-card rounded-[20px] overflow-hidden">
                <button
                  onClick={() => toggleSection('providerMetadata')}
                  className="w-full flex items-center justify-between p-5 font-mono text-xs font-bold uppercase border-b border-border/30 bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <span>11. Raw source provider webhook Payload</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", !collapsedSections.providerMetadata && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {!collapsedSections.providerMetadata && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 font-mono text-[10px] space-y-2">
                        <div className="flex justify-between items-center pb-2 border-b border-border/30">
                          <span className="font-bold text-foreground">API Inbound Source</span>
                          <span className="text-muted-foreground">https://www.{activeActSummary.externalProviderId || 'strava'}.com/api/v3/activities/{activeActSummary.id}</span>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-xl max-h-56 overflow-y-auto scrollbar-thin">
                          <pre className="text-muted-foreground text-[9px] uppercase leading-normal">
                            {JSON.stringify({
                              resource_state: 3,
                              athlete: { id: activeAthlete.id, resource_state: 1 },
                              name: activeActSummary.title,
                              distance: activeActSummary.distanceKm * 1000,
                              moving_time: 2980,
                              elapsed_time: 3025,
                              total_elevation_gain: calculatedStats.ascent,
                              type: "Run",
                              sport_type: "Run",
                              id: activeActSummary.id,
                              start_date: activeActSummary.date,
                              timezone: "(GMT-08:00) America/Los_Angeles",
                              utc_offset: -28800,
                              average_speed: calculatedStats.avgSpeed,
                              max_speed: calculatedStats.maxSpeed,
                              has_heartrate: true,
                              average_heartrate: calculatedStats.avgHr,
                              max_heartrate: calculatedStats.maxHr,
                              device_name: eqDetails.device,
                              embed_token_hash: "sha256_b39d10eef8854"
                            }, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 12. EXPORT SECTION */}
              <div className="border border-border bg-card rounded-[20px] overflow-hidden">
                <button
                  onClick={() => toggleSection('export')}
                  className="w-full flex items-center justify-between p-5 font-mono text-xs font-bold uppercase border-b border-border/30 bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-primary" />
                    <span>12. Telemetry export & Data center</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", !collapsedSections.export && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {!collapsedSections.export && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="space-y-1 text-center sm:text-left font-mono">
                          <span className="text-[10px] font-bold text-foreground block">Unified Telemetry Export Core</span>
                          <span className="text-[9px] text-muted-foreground block">Download normalized database streams in industry-standard formats.</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 justify-center">
                          <button onClick={() => handleExport('csv')} className="px-3.5 py-1.5 rounded-lg border border-border bg-muted/30 text-[9.5px] font-mono font-bold uppercase text-foreground hover:bg-muted/55 cursor-pointer transition-colors">CSV Export</button>
                          <button onClick={() => handleExport('json')} className="px-3.5 py-1.5 rounded-lg border border-border bg-muted/30 text-[9.5px] font-mono font-bold uppercase text-foreground hover:bg-muted/55 cursor-pointer transition-colors">JSON Export</button>
                          <button onClick={() => handleExport('gpx')} className="px-3.5 py-1.5 rounded-lg border border-border bg-muted/30 text-[9.5px] font-mono font-bold uppercase text-foreground hover:bg-muted/55 cursor-pointer transition-colors">GPX Route</button>
                          <button onClick={copyRawData} className="px-3.5 py-1.5 rounded-lg border border-[#FF6B00] bg-[#FF6B00]/10 text-[9.5px] font-mono font-bold uppercase text-[#FF6B00] hover:bg-[#FF6B00]/15 cursor-pointer transition-colors">Copy Data</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </motion.div>
        )}

        {/* VIEW 2: ATHLETE PERFORMANCE PROFILE */}
        {activeWorkspaceTab === 'athlete' && (
          <motion.div
            key="athlete"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* Expanded Athlete Profile card */}
            <div className="rounded-[20px] border border-border bg-card p-5 md:p-6 shadow-xs relative overflow-hidden" id="athlete-profile-board">
              <div className="flex flex-col md:flex-row items-center gap-5 border-b border-border/30 pb-5">
                <div className="h-16 w-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center font-mono text-xl font-bold uppercase text-primary shrink-0 select-none">
                  {activeAthlete.name ? activeAthlete.name.charAt(0) : "A"}
                </div>
                <div className="text-center md:text-left space-y-1 select-none">
                  <span className="text-[8.5px] font-mono font-bold bg-[#FF6B00]/10 py-0.5 px-2 rounded text-[#FF6B00] uppercase border border-[#FF6B00]/20">
                    Validated elite Athletic profile
                  </span>
                  <h2 className="text-lg md:text-xl font-black text-foreground uppercase tracking-tight">{activeAthlete.name}</h2>
                  <p className="text-xs text-muted-foreground font-mono">Internal UID: {activeAthlete.id} • America/Los_Angeles Timezone</p>
                </div>
              </div>

              {/* Profile Details Multi-Panel tabs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5" id="athlete-profile-grids">
                
                {/* 1. Physiology & Thresholds */}
                <div className="space-y-3.5">
                  <span className="font-mono font-bold text-xs uppercase tracking-wider text-primary border-b border-border/30 pb-1.5 block">01. Physiological metrics & thresholds</span>
                  <div className="grid grid-cols-2 gap-3.5 font-mono text-[11px]">
                    <div className="p-3 bg-muted/10 border border-border/40 rounded-xl space-y-0.5">
                      <span className="text-muted-foreground text-[8px] uppercase block">VO2 Max Capacity</span>
                      <span className="text-base font-black text-foreground block">{activeAthlete.vo2max} ml/kg</span>
                      <span className="text-[7px] text-emerald-500 font-bold block uppercase">Elite 99th %tile</span>
                    </div>
                    <div className="p-3 bg-muted/10 border border-border/40 rounded-xl space-y-0.5">
                      <span className="text-muted-foreground text-[8px] uppercase block">Functional threshold (FTP)</span>
                      <span className="text-base font-black text-foreground block">{activeAthlete.ftpWatts} Watts</span>
                      <span className="text-[7px] text-muted-foreground block uppercase">3.95 W/kg standard</span>
                    </div>
                    <div className="p-3 bg-muted/10 border border-border/40 rounded-xl space-y-0.5">
                      <span className="text-muted-foreground text-[8px] uppercase block">Resting Heart rate</span>
                      <span className="text-base font-black text-rose-500 block">{activeAthlete.restingHr} bpm</span>
                      <span className="text-[7px] text-muted-foreground block uppercase">Vagal Hypertonia verified</span>
                    </div>
                    <div className="p-3 bg-muted/10 border border-border/40 rounded-xl space-y-0.5">
                      <span className="text-muted-foreground text-[8px] uppercase block">Maximum Heart rate</span>
                      <span className="text-base font-black text-rose-500 block">{activeAthlete.maxHr} bpm</span>
                      <span className="text-[7px] text-muted-foreground block uppercase">100% cardiac threshold</span>
                    </div>
                  </div>
                </div>

                {/* 2. Calibrated Training Zones */}
                <div className="space-y-3.5">
                  <span className="font-mono font-bold text-xs uppercase tracking-wider text-primary border-b border-border/30 pb-1.5 block">02. Calibrated cardiovascular Zones</span>
                  <div className="space-y-2 font-mono text-[10px]">
                    {zoneDistributions.hr.map((z, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-foreground">{z.name}</span>
                          <span className="text-muted-foreground">{z.range}</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${z.pct + 25}%`, backgroundColor: z.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Footwear & Equipment wear progress */}
                <div className="space-y-3.5">
                  <span className="font-mono font-bold text-xs uppercase tracking-wider text-primary border-b border-border/30 pb-1.5 block">03. Footwear wear Progression</span>
                  <div className="space-y-3 font-mono text-[11px]">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span>Nike Air Zoom Pegasus 39</span>
                        <span className="font-bold">450.0 / 500.0 km</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '90%' }} />
                      </div>
                      <span className="text-[8px] text-rose-400 block mt-1 uppercase font-bold">Replacement warning: 90% threshold exceeded</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span>Saucony Kinvara 14</span>
                        <span className="font-bold">86.0 / 500.0 km</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '17%' }} />
                      </div>
                      <span className="text-[8px] text-muted-foreground block mt-1 uppercase font-bold">Good status remaining</span>
                    </div>
                  </div>
                </div>

                {/* 4. Peak records */}
                <div className="space-y-3.5">
                  <span className="font-mono font-bold text-xs uppercase tracking-wider text-primary border-b border-border/30 pb-1.5 block">04. Personal Peak Power Durations</span>
                  <div className="grid grid-cols-2 gap-2.5 font-mono text-[10px]">
                    <div className="p-2 bg-muted/15 border border-border/40 rounded-lg flex justify-between">
                      <span className="text-muted-foreground uppercase">Peak 10s:</span>
                      <span className="font-bold text-foreground">620 Watts</span>
                    </div>
                    <div className="p-2 bg-muted/15 border border-border/40 rounded-lg flex justify-between">
                      <span className="text-muted-foreground uppercase">Peak 1min:</span>
                      <span className="font-bold text-foreground">410 Watts</span>
                    </div>
                    <div className="p-2 bg-muted/15 border border-border/40 rounded-lg flex justify-between">
                      <span className="text-muted-foreground uppercase">Peak 5min:</span>
                      <span className="font-bold text-foreground">325 Watts</span>
                    </div>
                    <div className="p-2 bg-muted/15 border border-border/40 rounded-lg flex justify-between">
                      <span className="text-muted-foreground uppercase">Peak 20min:</span>
                      <span className="font-bold text-foreground">285 Watts</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: DATA COVERAGE & TRACEABILITY AUDIT */}
        {activeWorkspaceTab === 'traceability' && (
          <motion.div
            key="traceability"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* Traceability Audit Header card */}
            <div className="rounded-[20px] border border-border bg-card p-5 md:p-6 shadow-xs space-y-4" id="traceability-header-card">
              <div className="flex items-center gap-2 border-b border-border/30 pb-3">
                <Database className="h-5 w-5 text-primary" />
                <h3 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">Ingestion Pipeline Traceability & Compliance</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-[11px] leading-relaxed">
                <div className="p-3 bg-muted/10 border border-border/40 rounded-xl space-y-1">
                  <span className="text-muted-foreground text-[8px] uppercase block">Database Stream</span>
                  <span className="font-bold text-foreground block">Durable Firestore Inbound</span>
                </div>
                <div className="p-3 bg-muted/10 border border-border/40 rounded-xl space-y-1">
                  <span className="text-muted-foreground text-[8px] uppercase block">Metric processing Version</span>
                  <span className="font-bold text-foreground block">v1.0.0 Stable</span>
                </div>
                <div className="p-3 bg-muted/10 border border-border/40 rounded-xl space-y-1">
                  <span className="text-muted-foreground text-[8px] uppercase block">Formula Engine</span>
                  <span className="font-bold text-foreground block">Coggan / Bannister Standard</span>
                </div>
                <div className="p-3 bg-muted/10 border border-border/40 rounded-xl space-y-1">
                  <span className="text-muted-foreground text-[8px] uppercase block">Last Calculation timestamp</span>
                  <span className="font-bold text-foreground block">{new Date().toLocaleTimeString()} UTC</span>
                </div>
              </div>
            </div>

            {/* Programmatic data coverage registry list */}
            <div className="rounded-[20px] border border-border bg-card p-5 shadow-xs space-y-4" id="data-coverage-registry-section">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary block border-b border-border/30 pb-2">Programmatic Data Coverage Registry</span>
              <div className="overflow-x-auto border border-border/50 rounded-xl">
                <table className="w-full text-left font-mono text-[10px] border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-muted/15 border-b border-border/50 text-muted-foreground font-bold uppercase">
                      <th className="py-3 px-3">Field Name</th>
                      <th className="py-3 px-2">Provider Source</th>
                      <th className="py-3 px-2">Canonical Firestore Mapping</th>
                      <th className="py-3 px-2">Active Visualization</th>
                      <th className="py-3 px-2 text-right">Data Quality Score</th>
                      <th className="py-3 px-3 text-right">Missing value policy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DATA_COVERAGE_REGISTRY.map((item) => (
                      <tr key={item.id} className="border-b border-border/30 hover:bg-muted/5 transition-colors">
                        <td className="py-3 px-3 font-bold text-foreground uppercase">{item.fieldName}</td>
                        <td className="py-3 px-2 text-muted-foreground">{item.source}</td>
                        <td className="py-3 px-2 text-muted-foreground select-text font-semibold">{item.canonicalMapping}</td>
                        <td className="py-3 px-2 text-muted-foreground">{item.visualization}</td>
                        <td className="py-3 px-2 text-right font-bold text-emerald-500">{item.dataQualityScore.toFixed(1)}%</td>
                        <td className="py-3 px-3 text-right">
                          <span className="bg-muted px-2 py-0.5 rounded text-[8.5px] text-muted-foreground uppercase font-bold border border-border">
                            {item.missingPolicy}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
