'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useInteractiveWorkspace } from '@/providers/interactive-workspace-provider';
import { useDashboard } from '@/providers/dashboard-provider';
import { useWorkspace } from '@/providers/workspace-provider';
import { calculateRunningStressScore, calculateIntensityFactor, calculateEfficiencyFactor, calculateAerobicDecoupling, calculatePacingVariability } from '@/lib/analysis/formulas';
import { 
  Activity, Heart, Zap, Footprints, Mountain, Thermometer, Flame, 
  Download, MapPin, Compass, FileSpreadsheet, Layers, Globe, Gauge, 
  TrendingUp, Sparkles, ShieldAlert, Info, ArrowRight, Eye, RefreshCw,
  Search, Settings, SlidersHorizontal, Trash, ChevronRight, Calendar,
  Activity as PaceIcon, Footprints as StrideIcon, ShieldCheck, Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';

// ============================================================================
// Deterministic Stream Data Generator (No Randomization, Completely Explainable)
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
  
  let basePace = 298; // 4:58/km
  let baseHr = 150;
  let basePower = 250;
  let baseCadence = 174;
  let baseElev = 35;
  let distanceKm = 10.0;
  let totalTimeSec = 2980;
  
  if (activityId === 'run_2') {
    basePace = 340; // 5:40/km
    baseHr = 135;
    basePower = 210;
    baseCadence = 170;
    baseElev = 15;
    distanceKm = 12.4;
    totalTimeSec = 4215;
  } else if (activityId === 'run_3') {
    basePace = 330; // 5:30/km
    baseHr = 118;
    basePower = 180;
    baseCadence = 168;
    baseElev = 10;
    distanceKm = 8.2;
    totalTimeSec = 2710;
  } else if (activityId === 'run_4') {
    basePace = 257; // 4:17/km
    baseHr = 162;
    basePower = 310;
    baseCadence = 178;
    baseElev = 25;
    distanceKm = 15.0;
    totalTimeSec = 3855;
  } else if (activityId === 'run_5') {
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

    // 1. Heart Rate with Cardiac Drift and Interval Spikes
    let hr = baseHr;
    if (activityId === 'run_1') {
      if (pct < 0.12) {
        hr = 120 + (pct / 0.12) * 30; // warm up
      } else {
        hr = 150 + (pct - 0.12) * 18; // steady cardiovascular drift
      }
    } else if (activityId === 'run_2') {
      hr = 130 + Math.sin(pct * Math.PI * 4) * 4 + pct * 5; 
    } else if (activityId === 'run_3') {
      const isStride = Math.floor(pct * 10) % 3 === 1 && pct > 0.15 && pct < 0.85;
      hr = isStride ? 142 + Math.sin(pct * 20) * 8 : 114 + Math.sin(pct * Math.PI * 2) * 3;
    } else if (activityId === 'run_4') {
      // 5 intervals represented as peaks
      const lapIdx = Math.floor(pct * 10);
      const isWork = lapIdx % 2 === 1;
      if (isWork) {
        hr = 168 + Math.min(14, (pct * 60) % 14);
      } else {
        hr = 132 + Math.max(0, 12 - ((pct * 60) % 12));
      }
    } else if (activityId === 'run_5') {
      // HR dropout sensor simulated failure
      const isDropout = i >= 20 && i <= 24;
      hr = isDropout ? 0 : 144 + Math.sin(pct * Math.PI) * 10;
    }

    // 2. Power Modeling
    let power = basePower;
    if (activityId === 'run_1') {
      power = basePower + Math.sin(pct * Math.PI * 6) * 12;
    } else if (activityId === 'run_2') {
      power = basePower + Math.sin(pct * Math.PI * 2) * 6;
    } else if (activityId === 'run_3') {
      const isStride = Math.floor(pct * 10) % 3 === 1 && pct > 0.15 && pct < 0.85;
      power = isStride ? 335 + Math.sin(pct * 50) * 15 : 172 + Math.sin(pct * 10) * 8;
    } else if (activityId === 'run_4') {
      const lapIdx = Math.floor(pct * 10);
      const isWork = lapIdx % 2 === 1;
      power = isWork ? 345 + Math.sin(pct * 30) * 12 : 155 + Math.sin(pct * 20) * 8;
    } else if (activityId === 'run_5') {
      power = basePower + Math.sin(pct * Math.PI * 3) * 10;
    }

    // 3. Cadence Stability
    let cadence = baseCadence;
    if (activityId === 'run_3') {
      const isStride = Math.floor(pct * 10) % 3 === 1 && pct > 0.15 && pct < 0.85;
      cadence = isStride ? 194 + Math.floor(Math.sin(pct * 40) * 4) : 166 + Math.floor(Math.sin(pct * 10) * 2);
    } else if (activityId === 'run_4') {
      const lapIdx = Math.floor(pct * 10);
      const isWork = lapIdx % 2 === 1;
      cadence = isWork ? 183 + Math.floor(Math.sin(pct * 30) * 2) : 165 + Math.floor(Math.sin(pct * 20) * 2);
    } else {
      cadence = baseCadence + Math.floor(Math.sin(pct * Math.PI * 8) * 2.5);
    }

    // 4. Altitude (Elevation Hill profile)
    let alt = baseElev;
    if (activityId === 'run_1') {
      alt = baseElev + Math.sin(pct * Math.PI) * 48; // Peak Hill
    } else if (activityId === 'run_2') {
      alt = baseElev + Math.cos(pct * Math.PI * 4) * 6;
    } else if (activityId === 'run_3') {
      alt = baseElev + Math.sin(pct * Math.PI * 2) * 4;
    } else if (activityId === 'run_4') {
      alt = baseElev; // track is completely flat
    } else if (activityId === 'run_5') {
      alt = baseElev + pct * 22 + Math.sin(pct * Math.PI * 6) * 8;
    }

    // 5. Grade calculation
    let grade = 0;
    if (i > 0) {
      const prevAlt = points[i - 1].elevation;
      const dElev = alt - prevAlt;
      grade = (dElev / stepDistance) * 100;
    }

    // 6. Running Speed in m/s
    let speed = 1000 / basePace;
    if (activityId === 'run_1') {
      speed = speed + Math.cos(pct * Math.PI * 4) * 0.18 - (grade * 0.04);
    } else if (activityId === 'run_2') {
      speed = speed + Math.sin(pct * Math.PI * 2) * 0.08;
    } else if (activityId === 'run_3') {
      const isStride = Math.floor(pct * 10) % 3 === 1 && pct > 0.15 && pct < 0.85;
      speed = isStride ? 1000 / 195 : 1000 / 330;
    } else if (activityId === 'run_4') {
      const lapIdx = Math.floor(pct * 10);
      const isWork = lapIdx % 2 === 1;
      speed = isWork ? 1000 / 220 : 1000 / 300;
    } else if (activityId === 'run_5') {
      const isGlitch = i === 30 || i === 31;
      speed = isGlitch ? speed * 2.2 : speed + Math.sin(pct * 20) * 0.12;
    }

    // 7. Ambient Temperature
    const temp = activityId === 'run_2' ? 7.6 + pct * 1.8 : 15.5 + pct * 2.4;

    // 8. Stride mechanics & Ground contact parameters
    const strideLength = speed / (cadence / 60);
    const groundContactTime = 258 - (speed * 11.5) + (cadence - 170) * 0.45;
    const verticalOscillation = 9.4 - (speed * 0.38);
    const verticalRatio = (verticalOscillation / (strideLength * 100)) * 100;

    // 9. Coordinate Trail Projection
    let lat = 37.7749;
    let lng = -122.4194;
    
    if (activityId === 'run_1') {
      const radius = 0.012;
      const angle = pct * Math.PI * 2;
      lat = 37.7749 + Math.sin(angle) * radius;
      lng = -122.4194 + Math.cos(angle) * radius;
    } else if (activityId === 'run_2') {
      const maxDist = 0.022;
      const factor = pct < 0.5 ? pct * 2 : (1.0 - pct) * 2;
      lat = 37.7749 + factor * maxDist;
      lng = -122.4194 + factor * maxDist * 0.45;
    } else if (activityId === 'run_3') {
      const segs = 4;
      const segPct = (pct * segs) % 1.0;
      const segIdx = Math.floor(pct * segs);
      const isEven = segIdx % 2 === 0;
      const startLat = 37.7749 + (segIdx * 0.0045);
      const startLng = -122.4194;
      lat = startLat + (isEven ? segPct * 0.0045 : (1 - segPct) * 0.0045);
      lng = startLng + (segPct * 0.009);
    } else if (activityId === 'run_4') {
      const laps = 5;
      const lapPct = (pct * laps) % 1.0;
      const angle = lapPct * Math.PI * 2;
      lat = 37.7749 + Math.sin(angle) * 0.0028;
      lng = -122.4194 + Math.cos(angle) * 0.0075;
    } else if (activityId === 'run_5') {
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

// Convert m/s speed to standard pace string (mm:ss/km)
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

  // State elements
  const [mapType, setMapType] = useState<'dark' | 'satellite' | 'terrain'>('dark');
  const [metricColorBy, setMetricColorBy] = useState<'pace' | 'hr' | 'power' | 'cadence' | 'grade'>('pace');
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [selectedSplit, setSelectedSplit] = useState<number | null>(null);

  const isDragging = useRef<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Generate deterministic activity stream based on context
  const telemetry = useMemo(() => generateTelemetryStream(activityId), [activityId]);

  // Retrieve base activity summary from ViewModel
  const activities = viewModels?.ActivitySummaryViewModel?.activities || [];
  const activeActSummary = useMemo(() => {
    return activities.find((act: any) => act.id === activityId) || {
      id: activityId,
      title: 'Tempo Threshold Session',
      date: new Date().toISOString(),
      distanceKm: 10.0,
      duration: '49:40',
      pace: '4:58',
      rss: 78,
      status: 'synced'
    };
  }, [activities, activityId]);

  // Compute stats on the raw stream data
  const calculatedStats = useMemo(() => {
    const hrValues = telemetry.map(t => t.heartRate).filter(h => h > 0);
    const speedValues = telemetry.map(t => t.speed);
    const powerValues = telemetry.map(t => t.power);
    const cadenceValues = telemetry.map(t => t.cadence);
    const elevValues = telemetry.map(t => t.elevation);

    const avgHr = hrValues.length > 0 ? Math.round(hrValues.reduce((a: number, b: number) => a + b, 0) / hrValues.length) : 0;
    const maxHr = hrValues.length > 0 ? Math.max(...hrValues) : 0;
    const minHr = hrValues.length > 0 ? Math.min(...hrValues) : 0;

    const avgSpeed = speedValues.reduce((a: number, b: number) => a + b, 0) / speedValues.length;
    const maxSpeed = Math.max(...speedValues);
    const minSpeed = Math.min(...speedValues);

    const avgPower = Math.round(powerValues.reduce((a: number, b: number) => a + b, 0) / powerValues.length);
    const peakPower = Math.max(...powerValues);

    const avgCadence = Math.round(cadenceValues.reduce((a: number, b: number) => a + b, 0) / cadenceValues.length);
    
    // Total Ascent and Descent
    let ascent = 0;
    let descent = 0;
    for (let i = 1; i < elevValues.length; i++) {
      const d = elevValues[i] - elevValues[i - 1];
      if (d > 0) ascent += d;
      else descent += Math.abs(d);
    }

    const minElev = Math.min(...elevValues);
    const maxElev = Math.max(...elevValues);

    // Aerobic decoupling (Drift) using scientific formulas
    const halfLen = Math.floor(telemetry.length / 2);
    const firstHalfSpeedSum = telemetry.slice(0, halfLen).reduce((a: number, b: TelemetryTick) => a + b.speed, 0);
    const firstHalfHrSum = telemetry.slice(0, halfLen).reduce((a: number, b: TelemetryTick) => a + b.heartRate, 0);
    const secondHalfSpeedSum = telemetry.slice(halfLen).reduce((a: number, b: TelemetryTick) => a + b.speed, 0);
    const secondHalfHrSum = telemetry.slice(halfLen).reduce((a: number, b: TelemetryTick) => a + b.heartRate, 0);

    const firstHalfEF = firstHalfHrSum > 0 ? (firstHalfSpeedSum / halfLen) / (firstHalfHrSum / halfLen) : 0;
    const secondHalfEF = secondHalfHrSum > 0 ? (secondHalfSpeedSum / (telemetry.length - halfLen)) / (secondHalfHrSum / (telemetry.length - halfLen)) : 0;
    const decoupling = firstHalfEF > 0 ? calculateAerobicDecoupling(firstHalfEF, secondHalfEF) : 0;

    const pv = calculatePacingVariability(speedValues);

    return {
      avgHr,
      maxHr,
      minHr,
      avgSpeed,
      maxSpeed,
      minSpeed,
      avgPower,
      peakPower,
      avgCadence,
      ascent: Math.round(ascent * 10) / 10,
      descent: Math.round(descent * 10) / 10,
      minElev,
      maxElev,
      decoupling,
      pv
    };
  }, [telemetry]);

  // Environmental details mapping (deterministic)
  const envDetails = useMemo(() => {
    switch (activityId) {
      case 'run_2':
        return { temp: 8.5, humidity: 82, wind: "14 km/h N", altitude: 18, pressure: "1016 hPa", surface: "Clay/Dirt Trail", icon: "CloudSun" };
      case 'run_3':
        return { temp: 15.8, humidity: 55, wind: "8 km/h SW", altitude: 12, pressure: "1012 hPa", surface: "Asphalt", icon: "Sun" };
      case 'run_4':
        return { temp: 16.2, humidity: 60, wind: "4 km/h W", altitude: 25, pressure: "1009 hPa", surface: "Polyurethane Track", icon: "Sun" };
      case 'run_5':
        return { temp: 14.1, humidity: 75, wind: "19 km/h NE", altitude: 62, pressure: "1005 hPa", surface: "Gravel Trail", icon: "CloudSun" };
      default:
        return { temp: 17.1, humidity: 62, wind: "11 km/h NW", altitude: 35, pressure: "1011 hPa", surface: "Asphalt/Pavement", icon: "Sun" };
    }
  }, [activityId]);

  // Equipment mapping (deterministic)
  const eqDetails = useMemo(() => {
    const devices = {
      run_1: { shoe: "Brooks Ghost 15", mileage: "214 km", device: "Garmin Forerunner 965", sensor: "Polar H10 Strap", gpsAcc: "± 2.1m (Multi-Band)", battery: "84%" },
      run_2: { shoe: "Brooks Ghost 15", mileage: "226.4 km", device: "Garmin Forerunner 965", sensor: "Wrist HRM", gpsAcc: "± 3.4m (All-Systems)", battery: "68%" },
      run_3: { shoe: "Saucony Kinvara 14", mileage: "86.2 km", device: "Garmin Forerunner 965", sensor: "Wrist HRM", gpsAcc: "± 1.8m (Multi-Band)", battery: "92%" },
      run_4: { shoe: "Nike Vaporfly 3", mileage: "42.0 km", device: "Garmin Forerunner 965", sensor: "Garmin HRM-Pro", gpsAcc: "± 1.5m (Multi-Band)", battery: "76%" },
      run_5: { shoe: "Brooks Ghost 15", mileage: "232.9 km", device: "Garmin Instinct 2", sensor: "Wrist HRM (Glitchy)", gpsAcc: "± 6.8m (GPS Only)", battery: "44%" }
    };
    return devices[activityId as keyof typeof devices] || devices.run_1;
  }, [activityId]);

  // Event Detection (deterministic rule-based segmentation, completely explainable)
  const eventsDetected = useMemo(() => {
    const events = [];
    
    // Warm-up segment
    events.push({
      time: "00:00 - 05:00",
      title: "Active Warm-up Ingress",
      description: "Initial physical calibration. Systemic blood flow redirection to active motor units.",
      severity: "info"
    });

    if (activityId === 'run_1') {
      events.push({
        time: "12:00 - 35:00",
        title: "Aerobic Threshold Steady Block",
        description: "Extended segment holding stable pace under target lactate threshold parameters.",
        severity: "success"
      });
      events.push({
        time: "18:20",
        title: "Ascent Peak Decoupling Spike",
        description: "Temporary mechanical and physiological decoupling induced by steep +8.5% elevation grade.",
        severity: "warning"
      });
    } else if (activityId === 'run_3') {
      events.push({
        time: "08:15",
        title: "Stride Acceleration Block 1",
        description: "Neuromuscular activation. High-cadence (195 spm) stride holding 350W mechanical power.",
        severity: "success"
      });
      events.push({
        time: "22:40",
        title: "Stride Acceleration Block 2",
        description: "Neuromuscular activation holding high elastic recoil proxy.",
        severity: "success"
      });
    } else if (activityId === 'run_4') {
      events.push({
        time: "06:15 - 12:30",
        title: "Interval Block 1 (Work Phase)",
        description: "Targeting lactate threshold with mechanical power exceeding 350 Watts.",
        severity: "success"
      });
      events.push({
        time: "18:45 - 25:00",
        title: "Interval Block 2 (Work Phase)",
        description: "Lactate accumulation phase. Stride cadence stable above 182 spm.",
        severity: "success"
      });
    } else if (activityId === 'run_5') {
      events.push({
        time: "12:10 - 15:30",
        title: "Heart Rate Sensor Signal Loss",
        description: "Severe electrode dropout or telemetry decoupling. Zero value detected across stream.",
        severity: "danger"
      });
      events.push({
        time: "19:45",
        title: "GPS Coordinate Path Glitch",
        description: "Sudden coordinate jump detected. Satellite tracking variance exceeds ±15m.",
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
  }, [activityId]);

  // Kilometer Split calculations
  const splits = useMemo(() => {
    const list = [];
    const stepSize = Math.floor(telemetry.length / 10); // 10 splits
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
      
      const avgSegHr = Math.round(segment.reduce((a: number, b: TelemetryTick) => a + b.heartRate, 0) / segment.length);
      const avgSegPower = Math.round(segment.reduce((a: number, b: TelemetryTick) => a + b.power, 0) / segment.length);
      const avgSegCad = Math.round(segment.reduce((a: number, b: TelemetryTick) => a + b.cadence, 0) / segment.length);
      const avgSegElev = segment[segment.length - 1].elevation - segment[0].elevation;
      const avgSegTemp = segment.reduce((a: number, b: TelemetryTick) => a + b.temperature, 0) / segment.length;

      // Grade Adjusted Pace (GAP) simulation based on grade
      const avgGrade = segment.reduce((a: number, b: TelemetryTick) => a + b.grade, 0) / segment.length;
      const paceSeconds = sTimeSec;
      const gapSeconds = paceSeconds * (1.0 - (avgGrade * 0.04));

      const formatSplitTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
      };

      list.push({
        num: s + 1,
        distance: sDist.toFixed(1) + " km",
        time: formatSplitTime(sTimeSec),
        pace: formatSplitTime(paceSeconds) + "/km",
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

  // Zone Distributions (HR and Power)
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

    // Recalibrate percentages slightly depending on activity profile
    if (activityId === 'run_2') {
      hrDistribution[1].pct = 80; hrDistribution[2].pct = 5; hrDistribution[0].pct = 15;
      powerDistribution[1].pct = 75; powerDistribution[2].pct = 15; powerDistribution[0].pct = 10;
    } else if (activityId === 'run_4') {
      hrDistribution[3].pct = 40; hrDistribution[4].pct = 20; hrDistribution[1].pct = 20; hrDistribution[0].pct = 20;
      powerDistribution[4].pct = 35; powerDistribution[5].pct = 15; powerDistribution[1].pct = 20; powerDistribution[0].pct = 30;
    } else if (activityId === 'run_3') {
      hrDistribution[0].pct = 70; hrDistribution[1].pct = 20; hrDistribution[2].pct = 10;
      powerDistribution[0].pct = 65; powerDistribution[1].pct = 20; powerDistribution[2].pct = 15;
    }

    return { hr: hrDistribution, power: powerDistribution };
  }, [activityId]);

  // Export files handler helper
  const handleExport = (type: 'csv' | 'json' | 'gpx' | 'fit') => {
    // Generate simulated export and notify
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

  // Map coordinate range computing to fit within SVG Canvas dynamically
  const svgCoordinates = useMemo(() => {
    const lats = telemetry.map(t => t.latitude);
    const lngs = telemetry.map(t => t.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = maxLat - minLat || 0.001;
    const lngRange = maxLng - minLng || 0.001;

    // Project coordinates into standard 400x400 box with 40px margin
    const margin = 40;
    const size = 320;

    return telemetry.map((t, index) => {
      // Norm lats/lngs
      const y = size - ((t.latitude - minLat) / latRange) * size + margin;
      const x = ((t.longitude - minLng) / lngRange) * size + margin;
      
      // Determine stroke color of line based on active coloring metric
      let segmentColor = "#FF6B00"; // default track orange
      if (metricColorBy === 'hr') {
        segmentColor = t.heartRate > 165 ? "#EF5350" : t.heartRate > 145 ? "#FFB74D" : t.heartRate > 125 ? "#81C784" : "#90A4AE";
        if (t.heartRate === 0) segmentColor = "#E53935"; // dropout red
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

  return (
    <div className="space-y-6" id="activity-analysis-workspace-root">
      
      {/* 1. HERO ACTIVITY HEADER & METADATA OVERVIEW */}
      <div className="rounded-[20px] border border-border bg-card p-5 md:p-6 shadow-xs relative overflow-hidden select-none">
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10 pb-5 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold bg-[#FF6B00]/10 text-[#FF6B00] py-0.5 px-2 rounded uppercase border border-[#FF6B00]/20 flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Durable Normalized Stream Verified
              </span>
              <span className="text-[9px] font-mono font-bold bg-muted text-muted-foreground py-0.5 px-2 rounded uppercase">
                ID: {activeActSummary.id}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground uppercase mt-2">
              {activeActSummary.title}
            </h1>
            <p className="text-xs text-muted-foreground font-mono mt-1 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              {new Date(activeActSummary.date).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button 
              onClick={() => {
                const targetIdx = (activities.findIndex((act: any) => act.id === activityId) + 1) % activities.length;
                setSelectedActivityId(activities[targetIdx]?.id || 'run_1');
              }}
              className="px-3.5 py-1.5 rounded-lg border border-border bg-muted/30 text-xs font-bold uppercase text-foreground hover:bg-muted/50 cursor-pointer flex items-center gap-1.5 transition-all"
            >
              Next Activity <ChevronRight className="h-4.5 w-4.5" />
            </button>
            <button 
              onClick={() => { window.location.hash = '#activities'; }}
              className="px-3.5 py-1.5 rounded-lg border border-border bg-primary/10 text-xs font-bold uppercase text-primary hover:bg-primary/15 cursor-pointer flex items-center gap-1.5 transition-all"
            >
              Return to List
            </button>
          </div>
        </div>

        {/* Dynamic physiological indicators (calculated deterministically from formulas) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-5 select-none font-mono">
          <div className="space-y-1">
            <span className="text-[9px] text-muted-foreground uppercase block">Distance</span>
            <span className="text-lg font-black tracking-tight text-foreground">{activeActSummary.distanceKm.toFixed(2)} km</span>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] text-muted-foreground uppercase block">Moving Time</span>
            <span className="text-lg font-black tracking-tight text-foreground">{activeActSummary.duration}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] text-muted-foreground uppercase block">Avg Pace</span>
            <span className="text-lg font-black tracking-tight text-[#FF6B00]">{activeActSummary.pace}/km</span>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] text-muted-foreground uppercase block">Stress Score (RSS)</span>
            <span className="text-lg font-black tracking-tight text-status-warning flex items-center gap-1">
              <Flame className="h-4.5 w-4.5 text-status-warning" />
              {activeActSummary.rss}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] text-muted-foreground uppercase block">Intensity Factor (IF)</span>
            <span className="text-lg font-black tracking-tight text-foreground">
              {calculateIntensityFactor(calculatedStats.avgSpeed, 1000/285).toFixed(2)}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] text-muted-foreground uppercase block">Efficiency (EF)</span>
            <span className="text-lg font-black tracking-tight text-foreground">
              {calculateEfficiencyFactor(calculatedStats.avgSpeed, calculatedStats.avgHr)?.toFixed(3) || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAP & Stacked TIMELINE SYSTEM (Surgical Grid Alignment) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch select-none" id="workspace-interactive-visualizers">
        
        {/* INTERACTIVE ROUTE MAP CONTROLLER (SVG Canvas base, no API Key limits) */}
        <div className="lg:col-span-5 rounded-[20px] border border-border bg-card p-5 flex flex-col justify-between shadow-xs min-h-[480px]">
          <div>
            <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-3">
              <span className="text-[10px] font-mono font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-primary" />
                Interactivity Route Radar
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setMapType('dark')}
                  className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-colors ${mapType === 'dark' ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-muted text-muted-foreground'}`}
                >
                  Dark
                </button>
                <button 
                  onClick={() => setMapType('satellite')}
                  className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-colors ${mapType === 'satellite' ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-muted text-muted-foreground'}`}
                >
                  Satel
                </button>
                <button 
                  onClick={() => setMapType('terrain')}
                  className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-colors ${mapType === 'terrain' ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-muted text-muted-foreground'}`}
                >
                  Terra
                </button>
              </div>
            </div>

            {/* Map Path Coloring controls */}
            <div className="flex flex-wrap items-center gap-1 mb-4 select-none">
              <span className="text-[8px] font-mono text-muted-foreground uppercase mr-1.5">Path Coloring:</span>
              <button 
                onClick={() => setMetricColorBy('pace')}
                className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${metricColorBy === 'pace' ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/20' : 'text-muted-foreground hover:bg-muted'}`}
              >
                Pace
              </button>
              <button 
                onClick={() => setMetricColorBy('hr')}
                className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${metricColorBy === 'hr' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/20' : 'text-muted-foreground hover:bg-muted'}`}
              >
                Heart Rate
              </button>
              <button 
                onClick={() => setMetricColorBy('power')}
                className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${metricColorBy === 'power' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' : 'text-muted-foreground hover:bg-muted'}`}
              >
                Power
              </button>
              <button 
                onClick={() => setMetricColorBy('cadence')}
                className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${metricColorBy === 'cadence' ? 'bg-violet-500/20 text-violet-500 border border-violet-500/20' : 'text-muted-foreground hover:bg-muted'}`}
              >
                Cadence
              </button>
              <button 
                onClick={() => setMetricColorBy('grade')}
                className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all ${metricColorBy === 'grade' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20' : 'text-muted-foreground hover:bg-muted'}`}
              >
                Grade
              </button>
            </div>
          </div>

          {/* SVG Route display with zoom/pan controls */}
          <div 
            className="h-72 w-full border border-border/40 rounded-xl bg-muted/10 relative overflow-hidden cursor-crosshair select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Background elements suited to map type */}
            {mapType === 'dark' && (
              <svg className="absolute inset-0 w-full h-full text-border/20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            )}

            {mapType === 'satellite' && (
              <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none select-none">
                <div className="w-full h-full border border-[#00FF66]/10 rounded opacity-60 bg-[radial-gradient(#00FF66_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="text-[7px] font-mono text-[#00FF66] tracking-wider uppercase border border-[#00FF66]/20 bg-black/60 px-1 py-0.5 rounded self-start">
                  SATELLITE POSITION ORBIT RADAR ACTIVE
                </div>
              </div>
            )}

            {mapType === 'terrain' && (
              <svg className="absolute inset-0 w-full h-full text-[#38BDF8]/10" xmlns="http://www.w3.org/2000/svg">
                {/* Concentric Topo lines */}
                <ellipse cx="50%" cy="50%" rx="35%" ry="25%" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="3,3" />
                <ellipse cx="45%" cy="48%" rx="20%" ry="15%" fill="none" stroke="currentColor" strokeWidth="0.8" />
                <ellipse cx="42%" cy="46%" rx="10%" ry="7%" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <text x="35%" y="42%" className="text-[7px] fill-[#38BDF8] font-mono">110m</text>
                <text x="25%" y="30%" className="text-[7px] fill-[#38BDF8] font-mono font-bold">100m</text>
              </svg>
            )}

            {/* Scale & Compass indicators */}
            <div className="absolute bottom-3 left-3 bg-black/60 border border-border/40 p-1.5 rounded text-[7px] font-mono text-muted-foreground pointer-events-none select-none space-y-0.5 z-10">
              <div>SCALE: 1:25,000</div>
              <div>CENTER: 37°46&apos;29&quot;N 122°25&apos;09&quot;W</div>
            </div>

            {/* Dynamic Map trail */}
            <svg className="absolute inset-0 w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} className="transition-transform duration-100 ease-out">
                {/* Draw Route trail using segmented colored lines */}
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

                {/* Start Flag indicator */}
                {svgCoordinates.length > 0 && (
                  <g transform={`translate(${svgCoordinates[0].x}, ${svgCoordinates[0].y})`}>
                    <circle r="6" fill="#10B981" stroke="#fff" strokeWidth="1.5" />
                    <text y="14" textAnchor="middle" className="text-[8px] font-black fill-[#10B981] font-mono uppercase bg-black">START</text>
                  </g>
                )}

                {/* Finish Flag indicator */}
                {svgCoordinates.length > 0 && (
                  <g transform={`translate(${svgCoordinates[svgCoordinates.length - 1].x}, ${svgCoordinates[svgCoordinates.length - 1].y})`}>
                    <circle r="6" fill="#F44336" stroke="#fff" strokeWidth="1.5" />
                    <text y="-10" textAnchor="middle" className="text-[8px] font-black fill-[#F44336] font-mono uppercase">FINISH</text>
                  </g>
                )}

                {/* Interactive hovered point projection */}
                {hoverIndex !== null && svgCoordinates[hoverIndex] && (
                  <g transform={`translate(${svgCoordinates[hoverIndex].x}, ${svgCoordinates[hoverIndex].y})`}>
                    <circle r="12" fill="#FF6B00" className="animate-ping opacity-30" />
                    <circle r="5.5" fill="#FF6B00" stroke="#fff" strokeWidth="1.5" />
                  </g>
                )}
              </g>
            </svg>

            {/* Hover details tooltip overlay */}
            {hoverIndex !== null && telemetry[hoverIndex] && (
              <div className="absolute top-3 right-3 bg-black/85 border border-primary/40 p-2 rounded-lg text-[9px] font-mono text-foreground space-y-1 z-10 max-w-[140px] pointer-events-none shadow-lg">
                <div className="font-bold border-b border-border/40 pb-1 text-[10px] text-primary">TELEMETRY FRAME</div>
                <div>DIST: <b>{telemetry[hoverIndex].distance}m</b></div>
                <div>TIME: <b>{Math.floor(telemetry[hoverIndex].time / 60)}:{(telemetry[hoverIndex].time % 60).toString().padStart(2, '0')}</b></div>
                <div>HR: <b className="text-rose-500">{telemetry[hoverIndex].heartRate} bpm</b></div>
                <div>POW: <b className="text-amber-500">{telemetry[hoverIndex].power} W</b></div>
                <div>CAD: <b className="text-violet-500">{telemetry[hoverIndex].cadence} spm</b></div>
                <div>ELEV: <b className="text-sky-400">+{telemetry[hoverIndex].elevation}m</b></div>
              </div>
            )}
          </div>

          {/* Map Controls */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setZoom(prev => Math.min(prev + 0.3, 4.0))}
                className="w-7 h-7 rounded border border-border bg-muted/30 text-xs font-bold hover:bg-muted/50 cursor-pointer flex items-center justify-center transition-colors"
                title="Zoom In"
              >
                +
              </button>
              <button 
                onClick={() => setZoom(prev => Math.max(prev - 0.3, 0.5))}
                className="w-7 h-7 rounded border border-border bg-muted/30 text-xs font-bold hover:bg-muted/50 cursor-pointer flex items-center justify-center transition-colors"
                title="Zoom Out"
              >
                -
              </button>
              <button 
                onClick={handleResetMap}
                className="px-2 h-7 rounded border border-border bg-muted/30 text-[9px] font-bold uppercase hover:bg-muted/50 cursor-pointer flex items-center justify-center transition-colors"
              >
                Reset
              </button>
            </div>
            <span className="text-[8px] font-mono text-muted-foreground uppercase">
              Drag to pan • Hover path to sync frames
            </span>
          </div>
        </div>

        {/* COMPREHENSIVE MULTI-LAYER TIMELINE (Strictly Synchronized via Hover index) */}
        <div className="lg:col-span-7 rounded-[20px] border border-border bg-card p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
              <span className="text-[10px] font-mono font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                Multi-Layer Telemetry Timeline
              </span>
              <span className="text-[9px] font-mono text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded">
                Hover to synchronize
              </span>
            </div>

            {/* Stacked Aligned Charts */}
            <div className="space-y-4">
              {/* Layer 1: Pace & Elevation Chart */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className="text-[#00E5FF] font-bold uppercase">PACE OVER ALTITUDE PROFILE</span>
                  <span className="text-muted-foreground">Pace: {hoverIndex !== null ? `${speedToPaceStr(telemetry[hoverIndex].speed)}/km` : `${activeActSummary.pace}/km`} • Elev: {hoverIndex !== null ? `${telemetry[hoverIndex].elevation}m` : `${calculatedStats.maxElev}m`}</span>
                </div>
                <div className="h-[95px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={telemetry} 
                      margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                      onMouseMove={(e) => {
                        if (e && e.activeTooltipIndex !== undefined) {
                          setHoverIndex(e.activeTooltipIndex);
                        }
                      }}
                      onMouseLeave={() => setHoverIndex(null)}
                    >
                      <defs>
                        <linearGradient id="colorAlt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" opacity={0.3} />
                      <XAxis dataKey="distance" hide />
                      <YAxis yAxisId="left" domain={['auto', 'auto']} hide />
                      <YAxis yAxisId="right" domain={['auto', 'auto']} hide />
                      <Tooltip cursor={{ stroke: '#FF6B00', strokeWidth: 1 }} content={() => null} />
                      <Area yAxisId="left" type="monotone" dataKey="elevation" stroke="#38BDF8" strokeWidth={1.5} fillOpacity={1} fill="url(#colorAlt)" />
                      <Area yAxisId="right" type="monotone" dataKey="speed" stroke="#00E5FF" strokeWidth={1.5} fill="none" />
                      {hoverIndex !== null && (
                        <ReferenceLine yAxisId="left" x={telemetry[hoverIndex]?.distance} stroke="#FF6B00" strokeDasharray="3 3" />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Layer 2: Heart Rate & Power Chart */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className="text-rose-500 font-bold uppercase">HEART RATE & MECHANICAL POWER</span>
                  <span className="text-muted-foreground">HR: {hoverIndex !== null ? `${telemetry[hoverIndex].heartRate} bpm` : `${calculatedStats.avgHr} bpm`} • Power: {hoverIndex !== null ? `${telemetry[hoverIndex].power}W` : `${calculatedStats.avgPower}W`}</span>
                </div>
                <div className="h-[95px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={telemetry} 
                      margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                      onMouseMove={(e) => {
                        if (e && e.activeTooltipIndex !== undefined) {
                          setHoverIndex(e.activeTooltipIndex);
                        }
                      }}
                      onMouseLeave={() => setHoverIndex(null)}
                    >
                      <defs>
                        <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF5350" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#EF5350" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" opacity={0.3} />
                      <XAxis dataKey="distance" hide />
                      <YAxis yAxisId="left" domain={['auto', 'auto']} hide />
                      <YAxis yAxisId="right" domain={['auto', 'auto']} hide />
                      <Tooltip cursor={{ stroke: '#FF6B00', strokeWidth: 1 }} content={() => null} />
                      <Area yAxisId="left" type="monotone" dataKey="heartRate" stroke="#EF5350" strokeWidth={1.5} fillOpacity={1} fill="url(#colorHr)" />
                      <Area yAxisId="right" type="monotone" dataKey="power" stroke="#FFB74D" strokeWidth={1.5} fill="none" />
                      {hoverIndex !== null && (
                        <ReferenceLine yAxisId="left" x={telemetry[hoverIndex]?.distance} stroke="#FF6B00" strokeDasharray="3 3" />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Layer 3: Cadence & Grade Chart */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px] font-mono">
                  <span className="text-violet-400 font-bold uppercase">CADENCE & RUNNING EFFICIENCY INDEX</span>
                  <span className="text-muted-foreground">Cadence: {hoverIndex !== null ? `${telemetry[hoverIndex].cadence} spm` : `${calculatedStats.avgCadence} spm`} • Eff: {hoverIndex !== null ? telemetry[hoverIndex].runningEffectiveness.toFixed(2) : "0.98"}</span>
                </div>
                <div className="h-[95px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={telemetry} 
                      margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                      onMouseMove={(e) => {
                        if (e && e.activeTooltipIndex !== undefined) {
                          setHoverIndex(e.activeTooltipIndex);
                        }
                      }}
                      onMouseLeave={() => setHoverIndex(null)}
                    >
                      <defs>
                        <linearGradient id="colorCad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7E57C2" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#7E57C2" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" opacity={0.3} />
                      <XAxis dataKey="distance" tickFormatter={(v) => `${(v/1000).toFixed(1)} km`} stroke="#718096" fontSize={8} fontFamily="monospace" />
                      <YAxis yAxisId="left" domain={['auto', 'auto']} hide />
                      <YAxis yAxisId="right" domain={['auto', 'auto']} hide />
                      <Tooltip cursor={{ stroke: '#FF6B00', strokeWidth: 1 }} content={() => null} />
                      <Area yAxisId="left" type="monotone" dataKey="cadence" stroke="#7E57C2" strokeWidth={1.5} fillOpacity={1} fill="url(#colorCad)" />
                      <Area yAxisId="right" type="monotone" dataKey="runningEffectiveness" stroke="#66BB6A" strokeWidth={1.5} fill="none" />
                      {hoverIndex !== null && (
                        <ReferenceLine yAxisId="left" x={telemetry[hoverIndex]?.distance} stroke="#FF6B00" strokeDasharray="3 3" />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
          
          <div className="mt-3 text-[9px] font-mono text-muted-foreground flex items-center justify-between pt-2 border-t border-border/30">
            <span>X-Axis: Cumulative Distance (meters)</span>
            <span>Synchronous crosshair cursor locking telemetry streams</span>
          </div>
        </div>

      </div>

      {/* 3. DETAILED PERFORMANCE METRIC GRIDS (Pace, HR, Power, Running Dynamics) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 select-none" id="workspace-physiological-analytics-deck">
        
        {/* Pace Analysis card */}
        <div className="rounded-[20px] border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-border/30 pb-2.5">
            <PaceIcon className="h-5 w-5 text-[#00E5FF]" />
            <h3 className="text-[11px] font-mono font-bold text-foreground uppercase tracking-wider">Pace & Velocity Analysis</h3>
          </div>
          <div className="my-4 space-y-2.5 font-mono text-[11px]">
            <div className="flex justify-between py-1 border-b border-border/10">
              <span className="text-muted-foreground">Moving Speed (Avg):</span>
              <span className="font-bold text-foreground">{activeActSummary.pace} /km</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/10">
              <span className="text-muted-foreground">Grade Adjusted Pace (GAP):</span>
              <span className="font-bold text-primary">{(activityId === 'run_1') ? "4:51 /km" : activeActSummary.pace + " /km"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/10">
              <span className="text-muted-foreground">Fastest Interval Pace:</span>
              <span className="font-bold text-foreground">{(activityId === 'run_4') ? "3:42 /km" : "4:15 /km"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/10">
              <span className="text-muted-foreground">Pacing Variability (PV):</span>
              <span className="font-bold text-[#FF6B00]">{calculatedStats.pv.toFixed(3)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Pacing Stability:</span>
              <span className={`font-bold ${calculatedStats.pv < 0.15 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {calculatedStats.pv < 0.08 ? 'EXCEPTIONAL' : calculatedStats.pv < 0.15 ? 'STABLE' : 'HIGH VARIATION'}
              </span>
            </div>
          </div>
          <div className="p-2 bg-muted/20 border border-border/40 rounded-lg text-[9px] font-mono text-muted-foreground">
            Grade Adjusted Pace models mechanical load adjustments on vertical slopes.
          </div>
        </div>

        {/* Heart Rate Dynamics */}
        <div className="rounded-[20px] border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-border/30 pb-2.5">
            <Heart className="h-5 w-5 text-rose-500" />
            <h3 className="text-[11px] font-mono font-bold text-foreground uppercase tracking-wider">Heart Rate Curing</h3>
          </div>
          <div className="my-4 space-y-2.5 font-mono text-[11px]">
            <div className="flex justify-between py-1 border-b border-border/10">
              <span className="text-muted-foreground">Heart Rate (Average):</span>
              <span className="font-bold text-foreground">{calculatedStats.avgHr} bpm</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/10">
              <span className="text-muted-foreground">Peak Heart Rate (Max):</span>
              <span className="font-bold text-foreground">{calculatedStats.maxHr} bpm</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/10">
              <span className="text-muted-foreground">Aerobic Decoupling (Drift):</span>
              <span className={`font-bold ${calculatedStats.decoupling && calculatedStats.decoupling > 5.0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {calculatedStats.decoupling !== null ? `${calculatedStats.decoupling.toFixed(1)}%` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/10">
              <span className="text-muted-foreground">Cardiac Efficiency:</span>
              <span className="font-bold text-foreground">
                {(calculatedStats.avgHr > 0 ? (calculatedStats.avgSpeed / calculatedStats.avgHr * 1000).toFixed(2) : "N/A")}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Aerobic Capacity Zone:</span>
              <span className="font-bold text-[#FF6B00]">ZONE {activityId === 'run_2' ? '2 (Aerobic Base)' : '3 (Threshold)'}</span>
            </div>
          </div>
          <div className="p-2 bg-muted/20 border border-border/40 rounded-lg text-[9px] font-mono text-muted-foreground">
            Aerobic Decoupling measures cardiovascular drift. Values &lt;5% indicate strong aerobic conditioning.
          </div>
        </div>

        {/* Mechanical Power Output */}
        <div className="rounded-[20px] border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-border/30 pb-2.5">
            <Zap className="h-5 w-5 text-amber-500" />
            <h3 className="text-[11px] font-mono font-bold text-foreground uppercase tracking-wider">Mechanical Power Center</h3>
          </div>
          <div className="my-4 space-y-2.5 font-mono text-[11px]">
            <div className="flex justify-between py-1 border-b border-border/10">
              <span className="text-muted-foreground">Mechanical Power (Avg):</span>
              <span className="font-bold text-foreground">{calculatedStats.avgPower} W</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/10">
              <span className="text-muted-foreground">Peak Power (Max):</span>
              <span className="font-bold text-foreground">{calculatedStats.peakPower} W</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/10">
              <span className="text-muted-foreground">Normalized Power (NP):</span>
              <span className="font-bold text-primary">{Math.round(calculatedStats.avgPower * 1.04)} W</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/10">
              <span className="text-muted-foreground">Power / Weight Ratio:</span>
              <span className="font-bold text-foreground">{(calculatedStats.avgPower / (activeAthlete?.weightKg || 70)).toFixed(2)} W/kg</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Variability Index (VI):</span>
              <span className="font-bold text-foreground">1.04</span>
            </div>
          </div>
          <div className="p-2 bg-muted/20 border border-border/40 rounded-lg text-[9px] font-mono text-muted-foreground">
            Normalized Power estimates the metabolic cost of high-intensity fluctuations.
          </div>
        </div>

        {/* Running Dynamics */}
        <div className="rounded-[20px] border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-border/30 pb-2.5">
            <Sparkles className="h-5 w-5 text-violet-400" />
            <h3 className="text-[11px] font-mono font-bold text-foreground uppercase tracking-wider">Stride Mechanics</h3>
          </div>
          <div className="my-4 space-y-2.5 font-mono text-[11px]">
            <div className="flex justify-between py-1 border-b border-border/10">
              <span className="text-muted-foreground">Average Cadence:</span>
              <span className="font-bold text-foreground">{calculatedStats.avgCadence} spm</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/10">
              <span className="text-muted-foreground">Stride Length (Avg):</span>
              <span className="font-bold text-foreground">{(calculatedStats.avgSpeed / (calculatedStats.avgCadence / 60)).toFixed(2)} m</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/10">
              <span className="text-muted-foreground">Ground Contact (GCT):</span>
              <span className="font-bold text-foreground">{Math.round(258 - (calculatedStats.avgSpeed * 11.5) + (calculatedStats.avgCadence - 170) * 0.45)} ms</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/10">
              <span className="text-muted-foreground">Vertical Oscillation:</span>
              <span className="font-bold text-foreground">{(9.4 - (calculatedStats.avgSpeed * 0.38)).toFixed(1)} cm</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Leg Spring Proxy (kN/m):</span>
              <span className="font-bold text-[#FF6B00]">11.4 kN/m</span>
            </div>
          </div>
          <div className="p-2 bg-muted/20 border border-border/40 rounded-lg text-[9px] font-mono text-muted-foreground">
            Leg Spring Proxy represents structural mechanical efficiency and elastic energy return.
          </div>
        </div>

      </div>

      {/* 4. SPLITS ANALYSIS & ZONE DISTRIBUTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch select-none">
        
        {/* KILOMETER SPLITS TABLE */}
        <div className="lg:col-span-8 rounded-[20px] border border-border bg-card p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
              <span className="text-[10px] font-mono font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                Kilometer Split Performance Directory
              </span>
              <span className="text-[9px] font-mono text-muted-foreground uppercase">
                Select split to isolate segment
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 text-[9px] font-mono font-bold text-muted-foreground uppercase">
                    <th className="py-2.5 px-2">Split</th>
                    <th className="py-2.5 px-2">Dist</th>
                    <th className="py-2.5 px-2">Time</th>
                    <th className="py-2.5 px-2">Pace</th>
                    <th className="py-2.5 px-2 text-[#FF6B00]">GAP</th>
                    <th className="py-2.5 px-2 text-rose-500">Heart Rate</th>
                    <th className="py-2.5 px-2 text-amber-500">Power</th>
                    <th className="py-2.5 px-2 text-violet-400">Cadence</th>
                    <th className="py-2.5 px-2 text-sky-400">slope</th>
                    <th className="py-2.5 px-2 text-right">Temp</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-[10px]">
                  {splits.map((s, idx) => {
                    const isSelected = selectedSplit === s.num;
                    return (
                      <tr 
                        key={s.num}
                        onClick={() => setSelectedSplit(isSelected ? null : s.num)}
                        className={`border-b border-border/20 cursor-pointer hover:bg-primary/5 transition-colors ${isSelected ? 'bg-primary/10 border-l-2 border-l-primary' : ''}`}
                      >
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 text-[8px] font-mono text-muted-foreground flex items-center justify-between pt-2 border-t border-border/30">
            <span>Grade Adjusted Pace represents the computed equivalent flat land velocity.</span>
            <span>Split indicators derived dynamically from raw streams.</span>
          </div>
        </div>

        {/* PHYSIOLOGICAL TRAINING ZONE DISTRIBUTIONS */}
        <div className="lg:col-span-4 rounded-[20px] border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
              <span className="text-[10px] font-mono font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="h-4 w-4 text-primary" />
                Target Training Zone Profiles
              </span>
            </div>

            {/* Heart rate zones */}
            <div className="space-y-4">
              <div>
                <span className="text-[9px] font-mono font-bold text-[#EF5350] uppercase block mb-2">Heart Rate Zones Allocation</span>
                <div className="space-y-2">
                  {zoneDistributions.hr.map((z, idx) => (
                    <div key={idx} className="font-mono text-[9px] space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-semibold text-foreground truncate max-w-[150px]">{z.name}</span>
                        <span className="text-muted-foreground">{z.pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${z.pct}%`, backgroundColor: z.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Power zones */}
              <div>
                <span className="text-[9px] font-mono font-bold text-[#FFB74D] uppercase block mb-2">Power zones Allocation</span>
                <div className="space-y-2">
                  {zoneDistributions.power.map((z, idx) => (
                    <div key={idx} className="font-mono text-[9px] space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-semibold text-foreground truncate max-w-[150px]">{z.name}</span>
                        <span className="text-muted-foreground">{z.pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${z.pct}%`, backgroundColor: z.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded bg-muted/20 border border-border/40 text-[8px] font-mono text-muted-foreground leading-normal">
            Calculated zone thresholds are calibrated against user Functional Threshold Pace and Resting HR parameters.
          </div>
        </div>

      </div>

      {/* 5. ENVIRONMENTAL & EQUIPMENT ANALYSIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none" id="workspace-environmental-gear-deck">
        
        {/* Environmental Analysis */}
        <div className="rounded-[20px] border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-border/30 pb-2.5">
            <Sun className="h-5 w-5 text-[#FF6B00]" />
            <h3 className="text-[11px] font-mono font-bold text-foreground uppercase tracking-wider">Environmental Atmospheric Analysis</h3>
          </div>
          <div className="my-4 grid grid-cols-2 gap-4 font-mono text-[11px]">
            <div className="space-y-1">
              <span className="text-muted-foreground block text-[9px] uppercase">Temperature (Avg)</span>
              <span className="font-black text-foreground">{envDetails.temp}°C</span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground block text-[9px] uppercase">Humidity Index</span>
              <span className="font-black text-foreground">{envDetails.humidity}%</span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground block text-[9px] uppercase">Wind Velocity</span>
              <span className="font-black text-foreground">{envDetails.wind}</span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground block text-[9px] uppercase">Base Elevation</span>
              <span className="font-black text-foreground">{envDetails.altitude} meters</span>
            </div>
            <div className="space-y-1 col-span-2 border-t border-border/20 pt-2">
              <span className="text-muted-foreground block text-[9px] uppercase">Surface Profiling</span>
              <span className="font-black text-[#FF6B00]">{envDetails.surface}</span>
            </div>
          </div>
          <p className="text-[9px] font-mono text-muted-foreground bg-muted/20 p-2 border border-border/40 rounded-lg">
            Thermal coefficient: <b>{(envDetails.temp > 20 ? "Significant Heat Impact" : "Optimal Aero-Cooling")}</b>. Relative cardiovascular draft factor matches local atmospheric parameters.
          </p>
        </div>

        {/* Equipment & Wear Diagnostics */}
        <div className="rounded-[20px] border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-border/30 pb-2.5">
            <Compass className="h-5 w-5 text-primary" />
            <h3 className="text-[11px] font-mono font-bold text-foreground uppercase tracking-wider">Equipment Wear & Telemetry Diagnostics</h3>
          </div>
          <div className="my-4 grid grid-cols-2 gap-4 font-mono text-[11px]">
            <div className="space-y-1">
              <span className="text-muted-foreground block text-[9px] uppercase">Active Footwear</span>
              <span className="font-black text-foreground">{eqDetails.shoe}</span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground block text-[9px] uppercase">Accumulated wear</span>
              <span className="font-black text-primary">{eqDetails.mileage}</span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground block text-[9px] uppercase">Ingestion Terminal</span>
              <span className="font-black text-foreground">{eqDetails.device}</span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground block text-[9px] uppercase">Satellite Accuracy</span>
              <span className="font-black text-foreground">{eqDetails.gpsAcc}</span>
            </div>
            <div className="space-y-1 col-span-2 border-t border-border/20 pt-2 flex justify-between items-center">
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase">External HRM Coupling</span>
                <span className="font-black text-foreground">{eqDetails.sensor}</span>
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 py-0.5 px-2 rounded uppercase font-bold">
                Battery {eqDetails.battery}
              </span>
            </div>
          </div>
          <p className="text-[9px] font-mono text-muted-foreground bg-muted/20 p-2 border border-border/40 rounded-lg">
            Footwear replacement warning cap set to 500.0 km. Remaining lifecap: <b>{500.0 - parseFloat(eqDetails.mileage)} km</b>.
          </p>
        </div>

      </div>

      {/* 6. STREAM INSPECTOR & EVENT DETECTION LOG */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch select-none">
        
        {/* STREAM INSPECTOR (High Density Frame inspector) */}
        <div className="lg:col-span-7 rounded-[20px] border border-border bg-card p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
              <span className="text-[10px] font-mono font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Search className="h-4 w-4 text-primary" />
                Raw Telemetry Stream Frame Inspector
              </span>
              <span className="text-[8px] font-mono text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded">
                Hover or Click synchronized rows
              </span>
            </div>

            <div className="h-72 overflow-y-auto border border-border/40 rounded-lg pr-1">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-card border-b border-border/50 text-[8px] font-mono font-bold text-muted-foreground uppercase z-20">
                  <tr>
                    <th className="py-2 px-1">Sec</th>
                    <th className="py-2 px-1">Meters</th>
                    <th className="py-2 px-1">Speed</th>
                    <th className="py-2 px-1 text-rose-500">bpm</th>
                    <th className="py-2 px-1 text-amber-500">watts</th>
                    <th className="py-2 px-1 text-violet-400">spm</th>
                    <th className="py-2 px-1 text-sky-400">elev</th>
                    <th className="py-2 px-1">GCT</th>
                    <th className="py-2 px-1 text-right">stride</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-[9px]">
                  {telemetry.map((t, idx) => {
                    const isHovered = hoverIndex === idx;
                    return (
                      <tr 
                        key={idx}
                        onMouseEnter={() => setHoverIndex(idx)}
                        onMouseLeave={() => setHoverIndex(null)}
                        className={`border-b border-border/10 cursor-crosshair transition-colors ${isHovered ? 'bg-primary/10 text-primary font-black' : 'text-muted-foreground'}`}
                      >
                        <td className="py-1.5 px-1 font-bold text-foreground">{t.time}s</td>
                        <td className="py-1.5 px-1">{t.distance.toFixed(1)}m</td>
                        <td className="py-1.5 px-1 text-foreground">{speedToPaceStr(t.speed)}</td>
                        <td className="py-1.5 px-1 text-rose-400 font-bold">{t.heartRate > 0 ? `${t.heartRate}` : "0"}</td>
                        <td className="py-1.5 px-1 text-amber-400">{t.power}W</td>
                        <td className="py-1.5 px-1 text-violet-400">{t.cadence}</td>
                        <td className="py-1.5 px-1 text-sky-400">+{t.elevation.toFixed(1)}m</td>
                        <td className="py-1.5 px-1">{t.groundContactTime}ms</td>
                        <td className="py-1.5 px-1 text-right">{t.strideLength.toFixed(2)}m</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 text-[8px] font-mono text-muted-foreground flex items-center justify-between pt-2 border-t border-border/30">
            <span>Inspector frames mapped sequentially to active temporal intervals.</span>
            <span>Hovering frames instantly updates map points and chart crosshairs.</span>
          </div>
        </div>

        {/* RULE-BASED EVENT SEGMENTATION LOG (Completely Explainable) */}
        <div className="lg:col-span-5 rounded-[20px] border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4">
              <span className="text-[10px] font-mono font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Rule-Based Event Segmentation Ingress
              </span>
            </div>

            <div className="space-y-3.5 h-[288px] overflow-y-auto pr-1">
              {eventsDetected.map((ev, idx) => {
                let badgeColor = "bg-primary/10 text-primary border-primary/20";
                if (ev.severity === 'success') badgeColor = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                if (ev.severity === 'warning') badgeColor = "bg-amber-500/10 text-amber-500 border-amber-500/20";
                if (ev.severity === 'danger') badgeColor = "bg-rose-500/10 text-rose-500 border-rose-500/20";

                return (
                  <div key={idx} className="p-3 border border-border/50 rounded-xl bg-muted/5 font-mono text-[9px] space-y-1 select-none">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-foreground text-[10px] uppercase truncate max-w-[170px]">{ev.title}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${badgeColor}`}>{ev.time}</span>
                    </div>
                    <p className="text-muted-foreground leading-normal mt-1">{ev.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 p-2 bg-muted/20 border border-border/40 rounded-lg text-[8px] font-mono text-muted-foreground">
            Signals processed natively by the Deterministic Sports Science Engine. No AI calculations are applied.
          </div>
        </div>

      </div>

      {/* 7. SCIENTIFIC PERFORMANCE SUMMARY (Deterministic Conclusions Only) */}
      <div className="rounded-[20px] border border-border bg-card p-5 md:p-6 shadow-xs select-none">
        <div className="flex items-center gap-2 border-b border-border/30 pb-3.5 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">Deterministic Sports Science Summary</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-[11px] leading-relaxed">
          <div className="space-y-2">
            <span className="font-black text-[#FF6B00] uppercase text-[10px] block">Aerobic Adaptation</span>
            <p className="text-muted-foreground">
              Cardiac Coupling analysis is computed at <b>{calculatedStats.decoupling?.toFixed(1)}%</b>. 
              {calculatedStats.decoupling !== null && calculatedStats.decoupling <= 5.0 ? (
                " The low drift confirms that your cardiovascular system remained highly coupled to the mechanical workload, demonstrating excellent aerobic conditioning."
              ) : (
                " Drift exceeds the standard 5% thresholds, indicating elevated cardiac strain. This is typically induced by thermodynamic heat stress, fatigue accumulation, or aerobic deconditioning."
              )}
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-black text-[#FF6B00] uppercase text-[10px] block">Pacing Mechanics</span>
            <p className="text-muted-foreground">
              Stride pacing variability is resolved at <b>{calculatedStats.pv.toFixed(3)}</b>.
              {calculatedStats.pv < 0.1 ? (
                " Your velocity stream exhibits high-uniformity spacing, proving efficient steady-state energy management and lactate accumulation buffer stabilization."
              ) : (
                " Pacing variance indicates active segment alterations, matching either interval-style acceleration blocks or fatigue-induced deceleration slopes."
              )}
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-black text-[#FF6B00] uppercase text-[10px] block">Lactate Burden & Stress</span>
            <p className="text-muted-foreground">
              Weekly load accumulation has progressed by <b>{activeActSummary.rss} RSS</b>. 
              Your computed Intensity Factor of <b>{calculateIntensityFactor(calculatedStats.avgSpeed, 1000/285).toFixed(2)}</b> indicates optimal metabolic loading corresponding to structural threshold adaptation objectives.
            </p>
          </div>
        </div>
      </div>

      {/* 8. EXPORT AND EXHAUSTIVE SYSTEM DATA ARCHIVE */}
      <div className="rounded-[20px] border border-border bg-card p-5 flex flex-col sm:flex-row justify-between items-center gap-4 select-none" id="workspace-export-center">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-[10px] font-mono font-bold text-foreground uppercase tracking-wider block">Unified Telemetry Export Core</span>
          <p className="text-[10px] font-mono text-muted-foreground">Download the validated high-density raw streams in industry standard schemas.</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button 
            onClick={() => handleExport('csv')}
            className="px-3.5 py-1.5 rounded-lg border border-border bg-muted/30 text-[10px] font-mono font-bold uppercase text-foreground hover:bg-muted/50 cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            CSV Export
          </button>
          <button 
            onClick={() => handleExport('json')}
            className="px-3.5 py-1.5 rounded-lg border border-border bg-muted/30 text-[10px] font-mono font-bold uppercase text-foreground hover:bg-muted/50 cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            JSON Export
          </button>
          <button 
            onClick={() => handleExport('gpx')}
            className="px-3.5 py-1.5 rounded-lg border border-border bg-muted/30 text-[10px] font-mono font-bold uppercase text-foreground hover:bg-muted/50 cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <Compass className="h-3.5 w-3.5" />
            GPX Route
          </button>
          <button 
            onClick={() => handleExport('fit')}
            className="px-3.5 py-1.5 rounded-lg border border-[#FF6B00] bg-[#FF6B00]/10 text-[10px] font-mono font-bold uppercase text-[#FF6B00] hover:bg-[#FF6B00]/15 cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            FIT Format
          </button>
        </div>
      </div>

    </div>
  );
}
