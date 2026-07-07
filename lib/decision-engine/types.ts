import { ComputedMetric } from '@/lib/metrics/types';
import { CanonicalActivity, CanonicalAthlete } from '@/lib/data-platform/canonical/types';

export type DecisionCategory =
  | 'training_load'
  | 'fatigue'
  | 'recovery'
  | 'fitness'
  | 'running_efficiency'
  | 'heart_rate'
  | 'pacing'
  | 'power'
  | 'cadence'
  | 'elevation'
  | 'performance'
  | 'consistency'
  | 'data_quality'
  | 'environment'
  | 'equipment'
  | 'sync_health';

export type SeverityLevel = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface ThresholdBand {
  label: string;
  min: number;
  max: number;
  color?: string; // Optional hex or Tailwind color class
}

export interface ThresholdConfig {
  thresholdId: string;
  name: string;
  category: DecisionCategory;
  bands: ThresholdBand[];
  version: string;
  description: string;
}

export interface RuleDefinition {
  ruleId: string;
  name: string;
  category: DecisionCategory;
  scientificPurpose: string;
  inputMetrics: string[]; // List of metricIds required
  priority: number; // Higher number evaluated last or takes precedence
  dependencies: string[]; // Other rule IDs that should run first
  version: string;
  reference: string;
  status: 'active' | 'deprecated' | 'experimental';
}

export interface DecisionEvaluationContext {
  athlete: CanonicalAthlete;
  activity?: CanonicalActivity;
  metrics: ComputedMetric[]; // All computed metrics for context
  history?: CanonicalActivity[]; // Historical activities
  allDecisions?: Decision[]; // Previously generated decisions for dependency checks
}

export interface Decision {
  decisionId: string; // athleteId_activityId_ruleId or athleteId_ruleId_timestamp
  athleteId: string;
  activityId?: string;
  category: DecisionCategory;
  name: string;
  status: string; // Outcome label, e.g. "Optimal", "High", "Critical", etc.
  severity: SeverityLevel;
  score: number; // Normalized score 0-100
  supportingMetrics: Record<string, any>; // actual computed metrics mapping
  supportingRules: string[];
  thresholdVersion: string;
  ruleVersion: string;
  scientificReferences: string[];
  generatedTimestamp: string;
  confidence: number; // confidence score based on sensor presence (0.0 to 1.0)
  explanationCode: string; // e.g. "TL_HIGH_STRAIN", "HR_HIGH_DRIFT"
}
