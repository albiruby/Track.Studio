import { CanonicalActivity, CanonicalAthlete, CanonicalStream } from '@/lib/data-platform/canonical/types';

export interface ComputedMetric<T = any> {
  metricId: string;
  athleteId: string;
  activityId?: string; // Optional (undefined for multi-activity or athlete-level metrics)
  value: T;
  units: string;
  formulaVersion: string;
  metricVersion: string;
  timestamp: string; // ISO 8601
  inputReferences: string[]; // List of source fields, streams, or activity IDs used
}

export interface MetricDefinition {
  metricId: string;
  name: string;
  category: MetricCategory;
  scientificDefinition: string;
  formulaDescription: string;
  units: string;
  dependencies: string[];
  assumptions: string[];
  limitations: string[];
  version: string;
  reference: string;
  status: 'active' | 'deprecated' | 'experimental';
}

export type MetricCategory =
  | 'activity'
  | 'pacing'
  | 'heart-rate'
  | 'power'
  | 'cadence'
  | 'elevation'
  | 'load'
  | 'efficiency'
  | 'consistency'
  | 'performance'
  | 'recovery'
  | 'environmental'
  | 'data-quality';

export interface HRZoneConfig {
  restingHr: number;
  maxHr: number;
  zones: {
    z1: [number, number]; // [min, max] percents or bpm
    z2: [number, number];
    z3: [number, number];
    z4: [number, number];
    z5: [number, number];
  };
}

export interface PowerZoneConfig {
  ftp: number;
  zones: {
    z1: [number, number]; // Watts range
    z2: [number, number];
    z3: [number, number];
    z4: [number, number];
    z5: [number, number];
    z6: [number, number];
    z7: [number, number];
  };
}
