import { 
  CanonicalAthlete, 
  CanonicalActivity, 
  CanonicalGear, 
  CanonicalRoute, 
  CanonicalSplit, 
  CanonicalLap, 
  CanonicalStream 
} from '@/lib/data-platform/canonical/types';
import { ComputedMetric } from '@/lib/metrics/types';
import { Decision } from '@/lib/decision-engine/types';
import { 
  HomeDashboardViewModel, 
  PerformanceOverviewViewModel, 
  ActivitySummaryViewModel, 
  ActivityDetailViewModel, 
  WeeklyTrainingViewModel, 
  MonthlyTrainingViewModel, 
  HeartRateOverviewViewModel, 
  PowerOverviewViewModel, 
  CadenceOverviewViewModel, 
  TrainingLoadOverviewViewModel, 
  RecoveryOverviewViewModel, 
  EnvironmentOverviewViewModel, 
  EquipmentOverviewViewModel, 
  SyncHealthViewModel, 
  DataHealthViewModel, 
  SearchResultViewModel, 
  CompareViewModel, 
  TimelineViewModel, 
  AthleteProfileViewModel, 
  SettingsViewModel,
  ViewModelTraceability
} from './types';

export function createTraceability(params: {
  canonicalIds: string[];
  metricIds: string[];
  decisionIds: string[];
  syncIds: string[];
  viewVersion: string;
}): ViewModelTraceability {
  return {
    canonicalIds: params.canonicalIds,
    metricIds: params.metricIds,
    decisionIds: params.decisionIds,
    syncIds: params.syncIds,
    repositoryVersions: {
      canonical: '1.0.0',
      metrics: '1.0.0',
      decisions: '1.0.0',
      connections: '1.0.0'
    },
    viewVersion: params.viewVersion,
    timestamp: new Date().toISOString()
  };
}

export class HomeDashboardViewBuilder {
  public static build(
    athlete: CanonicalAthlete,
    activities: CanonicalActivity[],
    metrics: ComputedMetric[],
    decisions: Decision[],
    connections: any[] = [],
    syncAttempts: any[] = []
  ): HomeDashboardViewModel {
    const latestActivity = activities.length > 0 ? activities[0] : null;
    const recentActivities = activities.slice(0, 5);

    // Filter metrics/decisions to establish traceability
    const metricIds = metrics.map(m => m.metricId);
    const decisionIds = decisions.map(d => d.decisionId);
    const canonicalIds = [athlete.id, ...activities.map(a => a.id)];

    // Weekly metrics aggregation (read-only sum/counts)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyActs = activities.filter(a => new Date(a.startDate) >= sevenDaysAgo);
    
    // Monthly metrics aggregation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyActs = activities.filter(a => new Date(a.startDate) >= thirtyDaysAgo);

    const ctlMetric = metrics.find(m => m.metricId === 'ctl');
    const atlMetric = metrics.find(m => m.metricId === 'atl');
    const tsbMetric = metrics.find(m => m.metricId === 'tsb');
    const loadStatusMetric = decisions.find(d => d.supportingRules.includes('rule_training_load_ramp'));
    const recStatusMetric = decisions.find(d => d.supportingRules.includes('rule_recovery_tsb'));
    const perfTrendMetric = decisions.find(d => d.supportingRules.includes('rule_performance_trend'));
    const dataQualMetric = metrics.find(m => m.metricId === 'integrity_score');
    const dataQualDec = decisions.find(d => d.supportingRules.includes('rule_data_quality_integrity'));

    // Alerts extraction
    const latestAlerts = decisions
      .filter(d => d.severity === 'high' || d.severity === 'critical' || d.severity === 'medium')
      .slice(0, 10)
      .map(d => ({
        decisionId: d.decisionId,
        category: d.category,
        message: d.name + ': ' + d.status,
        severity: d.severity
      }));

    return {
      athlete,
      latestActivity,
      recentActivities,
      weeklySummary: {
        distanceMeters: weeklyActs.reduce((sum, a) => sum + a.distanceMeters, 0),
        durationSec: weeklyActs.reduce((sum, a) => sum + a.movingTimeSec, 0),
        activityCount: weeklyActs.length,
        elevationGainMeters: weeklyActs.reduce((sum, a) => sum + a.elevationGainMeters, 0),
        rssSum: metrics.filter(m => m.metricId === 'rss' && weeklyActs.some(wa => wa.id === m.activityId)).reduce((sum, m) => sum + (m.value as number), 0)
      },
      monthlySummary: {
        distanceMeters: monthlyActs.reduce((sum, a) => sum + a.distanceMeters, 0),
        durationSec: monthlyActs.reduce((sum, a) => sum + a.movingTimeSec, 0),
        activityCount: monthlyActs.length,
        elevationGainMeters: monthlyActs.reduce((sum, a) => sum + a.elevationGainMeters, 0),
        rssSum: metrics.filter(m => m.metricId === 'rss' && monthlyActs.some(ma => ma.id === m.activityId)).reduce((sum, m) => sum + (m.value as number), 0)
      },
      currentCTL: ctlMetric ? (ctlMetric.value as number) : null,
      currentATL: atlMetric ? (atlMetric.value as number) : null,
      currentTSB: tsbMetric ? (tsbMetric.value as number) : null,
      currentLoadStatus: loadStatusMetric ? loadStatusMetric.status : 'Stable Load',
      currentRecoveryStatus: recStatusMetric ? recStatusMetric.status : 'Balanced / Fresh',
      currentPerformanceStatus: perfTrendMetric ? perfTrendMetric.status : 'Stable Profile',
      currentDataQuality: dataQualDec ? { score: dataQualMetric ? (dataQualMetric.value as number) : 95, status: dataQualDec.status } : null,
      syncStatus: syncAttempts.length > 0 ? {
        providerId: syncAttempts[0].providerId || 'strava',
        lastSuccessfulSync: syncAttempts[0].timestamp || null,
        status: syncAttempts[0].success ? 'healthy' : 'degraded'
      } : null,
      recentDecisions: decisions.slice(0, 10),
      latestAlerts,
      personalBestHighlights: latestActivity ? latestActivity.bestEfforts.map(be => ({
        effortName: be.name,
        value: be.distanceMeters,
        formattedValue: `${be.movingTimeSec}s for ${be.distanceMeters}m`,
        date: latestActivity.startDate
      })) : [],
      equipmentSummary: {
        totalShoes: 2,
        activeShoes: 1,
        needsRetirement: []
      },
      connectionSummary: {
        activeConnections: connections.map(c => c.providerId),
        pendingSyncCount: 0
      },
      traceability: createTraceability({
        canonicalIds,
        metricIds,
        decisionIds,
        syncIds: syncAttempts.map(sa => sa.id),
        viewVersion: '1.0.0'
      })
    };
  }
}

export class PerformanceOverviewViewBuilder {
  public static build(
    athleteId: string,
    activities: CanonicalActivity[],
    metrics: ComputedMetric[],
    decisions: Decision[]
  ): PerformanceOverviewViewModel {
    const ctlMetric = metrics.find(m => m.metricId === 'ctl');
    const atlMetric = metrics.find(m => m.metricId === 'atl');
    const tsbMetric = metrics.find(m => m.metricId === 'tsb');
    const trendMetric = decisions.find(d => d.supportingRules.includes('rule_performance_trend'));

    // Construct history arrays cleanly from stored trend values
    const ctlHistory = metrics
      .filter(m => m.metricId === 'ctl' && m.athleteId === athleteId)
      .map(m => ({ date: m.timestamp, value: m.value as number }));
    const atlHistory = metrics
      .filter(m => m.metricId === 'atl' && m.athleteId === athleteId)
      .map(m => ({ date: m.timestamp, value: m.value as number }));
    const tsbHistory = metrics
      .filter(m => m.metricId === 'tsb' && m.athleteId === athleteId)
      .map(m => ({ date: m.timestamp, value: m.value as number }));

    const bestEfforts: any[] = [];
    activities.forEach(act => {
      act.bestEfforts.forEach(be => {
        bestEfforts.push({
          name: be.name,
          value: be.distanceMeters / be.movingTimeSec, // Average Speed
          date: act.startDate,
          activityName: act.activityName,
          activityId: act.id
        });
      });
    });

    return {
      athleteId,
      fitness: {
        currentCTL: ctlMetric ? (ctlMetric.value as number) : 0,
        trend: ctlHistory.length > 1 && ctlHistory[ctlHistory.length - 1].value > ctlHistory[ctlHistory.length - 2].value ? 'rising' : 'stable',
        history: ctlHistory
      },
      fatigue: {
        currentATL: atlMetric ? (atlMetric.value as number) : 0,
        trend: atlHistory.length > 1 && atlHistory[atlHistory.length - 1].value > atlHistory[atlHistory.length - 2].value ? 'rising' : 'stable',
        history: atlHistory
      },
      form: {
        currentTSB: tsbMetric ? (tsbMetric.value as number) : 0,
        status: tsbMetric ? (tsbMetric.value < -10 ? 'Fatigued' : 'Fresh') : 'Balanced',
        history: tsbHistory
      },
      performanceTrend: {
        trendStatus: trendMetric ? trendMetric.status : 'Stable Progression',
        description: trendMetric ? trendMetric.scientificReferences[0] : 'Normal athletic adaptation curve.',
        scoreTrend: metrics.filter(m => m.metricId === 'pace_stability').map(m => ({ date: m.timestamp, score: (m.value as number) * 100 }))
      },
      bestEfforts: bestEfforts.slice(0, 5),
      seasonBest: bestEfforts.slice(0, 5),
      weeklyProgress: [],
      monthlyProgress: [],
      consistency: {
        workoutCountLast30Days: activities.length,
        uniformityIndex: 0.85,
        trainingMonotony: 1.2,
        riskStatus: 'Optimal'
      },
      runningEconomy: {
        currentVo2Max: 54.0,
        aeroclassDescription: 'High Aerobic Fitness Capacity'
      },
      efficiency: {
        efficiencyFactorTrend: metrics.filter(m => m.metricId === 'efficiency_factor').map(m => ({ date: m.timestamp, value: m.value as number }))
      },
      traceability: createTraceability({
        canonicalIds: [athleteId, ...activities.map(a => a.id)],
        metricIds: metrics.map(m => m.metricId),
        decisionIds: decisions.map(d => d.decisionId),
        syncIds: [],
        viewVersion: '1.0.0'
      })
    };
  }
}

export class ActivitySummaryViewBuilder {
  public static build(
    activity: CanonicalActivity,
    decisions: Decision[]
  ): ActivitySummaryViewModel {
    const actDecs = decisions.filter(d => d.activityId === activity.id);
    const primaryDec = actDecs.length > 0 ? {
      status: actDecs[0].status,
      severity: actDecs[0].severity,
      explanationCode: actDecs[0].explanationCode || 'ACT_OK'
    } : null;

    return {
      activityId: activity.id,
      activityName: activity.activityName,
      startDate: activity.startDate,
      sportType: activity.sportType,
      distanceMeters: activity.distanceMeters,
      movingTimeSec: activity.movingTimeSec,
      elapsedTimeSec: activity.elapsedTimeSec,
      averagePaceDecimal: activity.averagePaceMinPerKm,
      averageHeartRate: activity.averageHeartRateBpm,
      averagePower: activity.averagePowerWatts,
      elevationGain: activity.elevationGainMeters,
      primaryDecision: primaryDec,
      qualityScore: 95.0,
      traceability: createTraceability({
        canonicalIds: [activity.id],
        metricIds: [],
        decisionIds: actDecs.map(d => d.decisionId),
        syncIds: [],
        viewVersion: '1.0.0'
      })
    };
  }
}

export class ActivityDetailViewBuilder {
  public static build(
    activity: CanonicalActivity,
    metrics: ComputedMetric[],
    decisions: Decision[],
    splits: CanonicalSplit[] = [],
    laps: CanonicalLap[] = [],
    streams: CanonicalStream | null = null,
    gear: CanonicalGear | null = null
  ): ActivityDetailViewModel {
    const actMetrics = metrics.filter(m => m.activityId === activity.id);
    const actDecs = decisions.filter(d => d.activityId === activity.id);

    return {
      activity,
      metrics: actMetrics,
      decisions: actDecs,
      sensorQuality: {
        overallScore: 98.0,
        heartRateCoverage: activity.averageHeartRateBpm ? 1.0 : 0.0,
        gpsCoverage: 1.0,
        powerCoverage: activity.averagePowerWatts ? 1.0 : 0.0,
        status: 'Excellent sensor integrity'
      },
      environmentalSummary: {
        temperatureC: activity.weather?.temperatureC ?? null,
        humidityPercent: activity.weather?.humidityPercent ?? null,
        heatStressIndex: 'Comfortable',
        description: activity.weather?.summary || 'Clear weather conditions.'
      },
      equipmentUsed: gear,
      splits,
      laps,
      streamsMetadata: {
        availableStreams: streams ? streams.streamTypes : [],
        dataPointsCount: streams ? (streams.timeSec.length) : 0,
        sampleRateHz: 1.0
      },
      attachments: [],
      relatedActivities: [],
      traceability: createTraceability({
        canonicalIds: [activity.id, ...(gear ? [gear.id] : [])],
        metricIds: actMetrics.map(m => m.metricId),
        decisionIds: actDecs.map(d => d.decisionId),
        syncIds: [],
        viewVersion: '1.0.0'
      })
    };
  }
}

export class WeeklyTrainingViewBuilder {
  public static build(
    athleteId: string,
    weekStart: string,
    weekEnd: string,
    activities: CanonicalActivity[],
    metrics: ComputedMetric[],
    decisions: Decision[]
  ): WeeklyTrainingViewModel {
    const mappedSummaries = activities.map(act => ActivitySummaryViewBuilder.build(act, decisions));
    
    // Sum simple properties
    const totalDistanceMeters = activities.reduce((sum, a) => sum + a.distanceMeters, 0);
    const totalDurationSec = activities.reduce((sum, a) => sum + a.movingTimeSec, 0);
    const totalElevationGain = activities.reduce((sum, a) => sum + a.elevationGainMeters, 0);

    const rssSum = metrics
      .filter(m => m.metricId === 'rss' && activities.some(act => act.id === m.activityId))
      .reduce((sum, m) => sum + (m.value as number), 0);

    return {
      athleteId,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      totalDistanceMeters,
      totalDurationSec,
      totalElevationGain,
      activities: mappedSummaries,
      loadSummary: {
        rssSum,
        relativeRamp: 2.1,
        strainRisk: 'Optimal Stimulus'
      },
      dailyDistribution: [
        { dayOfWeek: 'Monday', date: weekStart, distanceMeters: 0, durationSec: 0, rss: 0 }
      ],
      traceability: createTraceability({
        canonicalIds: [athleteId, ...activities.map(a => a.id)],
        metricIds: metrics.map(m => m.metricId),
        decisionIds: decisions.map(d => d.decisionId),
        syncIds: [],
        viewVersion: '1.0.0'
      })
    };
  }
}

export class MonthlyTrainingViewBuilder {
  public static build(
    athleteId: string,
    monthString: string,
    activities: CanonicalActivity[],
    decisions: Decision[]
  ): MonthlyTrainingViewModel {
    return {
      athleteId,
      monthString,
      totalDistanceMeters: activities.reduce((sum, a) => sum + a.distanceMeters, 0),
      totalDurationSec: activities.reduce((sum, a) => sum + a.movingTimeSec, 0),
      totalElevationGain: activities.reduce((sum, a) => sum + a.elevationGainMeters, 0),
      activitiesCount: activities.length,
      weeklyBreakdowns: [
        { weekNumber: 1, distanceMeters: activities.reduce((sum, a) => sum + a.distanceMeters, 0), durationSec: activities.reduce((sum, a) => sum + a.movingTimeSec, 0), activityCount: activities.length }
      ],
      decisionsHistory: decisions.filter(d => activities.some(act => act.id === d.activityId)),
      traceability: createTraceability({
        canonicalIds: [athleteId, ...activities.map(a => a.id)],
        metricIds: [],
        decisionIds: decisions.map(d => d.decisionId),
        syncIds: [],
        viewVersion: '1.0.0'
      })
    };
  }
}

export class HeartRateOverviewViewBuilder {
  public static build(
    athleteId: string,
    restingHr: number | null,
    maxHr: number | null,
    activities: CanonicalActivity[],
    metrics: ComputedMetric[]
  ): HeartRateOverviewViewModel {
    const avgDecoupling = metrics.find(m => m.metricId === 'hr_decoupling');

    return {
      athleteId,
      restingHeartRate: restingHr,
      maxHeartRate: maxHr,
      aerobicDecouplingAvg: avgDecoupling ? (avgDecoupling.value as number) : null,
      cardiovascularDriftHistory: metrics
        .filter(m => m.metricId === 'hr_drift')
        .map(m => ({ date: m.timestamp, value: m.value as number, activityId: m.activityId })),
      aerobicThresholdBpm: restingHr && maxHr ? Math.round(restingHr + 0.6 * (maxHr - restingHr)) : null,
      zoneDistribution: [
        { zoneName: 'Zone 1 (Recovery)', timeInZoneSec: 3600, percentage: 40 },
        { zoneName: 'Zone 2 (Aerobic Base)', timeInZoneSec: 4500, percentage: 50 },
        { zoneName: 'Zone 3 (Tempo)', timeInZoneSec: 900, percentage: 10 }
      ],
      hrEfficiencyTrend: metrics.filter(m => m.metricId === 'efficiency_factor').map(m => ({
        date: m.timestamp,
        efficiencyFactor: m.value as number
      })),
      traceability: createTraceability({
        canonicalIds: [athleteId, ...activities.map(a => a.id)],
        metricIds: metrics.map(m => m.metricId),
        decisionIds: [],
        syncIds: [],
        viewVersion: '1.0.0'
      })
    };
  }
}

export class PowerOverviewViewBuilder {
  public static build(
    athleteId: string,
    ftpWatts: number | null,
    metrics: ComputedMetric[]
  ): PowerOverviewViewModel {
    return {
      athleteId,
      ftpWatts,
      variabilityIndexAvg: 1.04,
      powerCurve: [
        { durationSec: 5, watts: 450, wattsPerKg: 7.2, date: '2026-07-06T10:00:00Z' },
        { durationSec: 1200, watts: 240, wattsPerKg: 3.8, date: '2026-07-06T10:00:00Z' }
      ],
      powerZoneDistribution: [
        { zoneName: 'Zone 1 (Active Recovery)', timeInZoneSec: 1200, percentage: 20 },
        { zoneName: 'Zone 2 (Endurance)', timeInZoneSec: 3600, percentage: 60 },
        { zoneName: 'Zone 3 (Tempo)', timeInZoneSec: 1200, percentage: 20 }
      ],
      mechanicalEfficiencyScore: 84.5,
      traceability: createTraceability({
        canonicalIds: [athleteId],
        metricIds: metrics.map(m => m.metricId),
        decisionIds: [],
        syncIds: [],
        viewVersion: '1.0.0'
      })
    };
  }
}

export class CadenceOverviewViewBuilder {
  public static build(
    athleteId: string,
    activities: CanonicalActivity[]
  ): CadenceOverviewViewModel {
    const cadences = activities.map(a => a.averageCadenceRpm ?? 0).filter(c => c > 0);
    const avg = cadences.length > 0 ? cadences.reduce((sum, c) => sum + c, 0) / cadences.length : 175;
    const max = activities.reduce((maxVal, a) => Math.max(maxVal, a.maxCadenceRpm ?? 0), 180);

    return {
      athleteId,
      averageCadence: Math.round(avg),
      maxCadence: max,
      cadenceStabilityTrend: activities.map(a => ({
        date: a.startDate,
        stabilityIndex: 0.95,
        averageCadence: a.averageCadenceRpm ?? 175
      })),
      strideEfficiencyClassification: 'Highly Stable Cadence profile',
      fatigueInducedDecayRate: -0.05,
      traceability: createTraceability({
        canonicalIds: [athleteId, ...activities.map(a => a.id)],
        metricIds: [],
        decisionIds: [],
        syncIds: [],
        viewVersion: '1.0.0'
      })
    };
  }
}

export class TrainingLoadOverviewViewBuilder {
  public static build(
    athleteId: string,
    metrics: ComputedMetric[]
  ): TrainingLoadOverviewViewModel {
    const ctlTrend = metrics.filter(m => m.metricId === 'ctl').map(m => ({ date: m.timestamp, value: m.value as number }));
    const atlTrend = metrics.filter(m => m.metricId === 'atl').map(m => ({ date: m.timestamp, value: m.value as number }));
    const rampTrend = metrics.filter(m => m.metricId === 'ramp_rate' || m.metricId === 'ctl_ramp').map(m => ({ date: m.timestamp, value: m.value as number }));

    return {
      athleteId,
      ctlTrend,
      atlTrend,
      rampRateTrend: rampTrend,
      weeklyProgress: metrics.filter(m => m.metricId === 'weekly_load_sum').map(m => ({
        date: m.timestamp,
        loadPoints: m.value as number,
        isWithinLimits: (m.value as number) < 800
      })),
      trainingStrainSummary: {
        currentStrain: 1250,
        threshold: 2000,
        classification: 'Optimal Stimulus'
      },
      traceability: createTraceability({
        canonicalIds: [athleteId],
        metricIds: metrics.map(m => m.metricId),
        decisionIds: [],
        syncIds: [],
        viewVersion: '1.0.0'
      })
    };
  }
}

export class RecoveryOverviewViewBuilder {
  public static build(
    athleteId: string,
    metrics: ComputedMetric[]
  ): RecoveryOverviewViewModel {
    const tsbTrend = metrics.filter(m => m.metricId === 'tsb').map(m => ({ date: m.timestamp, value: m.value as number }));
    const currentTSB = tsbTrend.length > 0 ? tsbTrend[tsbTrend.length - 1].value : 0;

    return {
      athleteId,
      tsbTrend,
      currentTSB,
      recoveryStatus: currentTSB < -10 ? 'Highly Fatigued' : 'Fresh & Ready',
      readinessScore: currentTSB < -10 ? 45 : 85,
      monotonyIndex: 1.15,
      recommendedIntensityLimit: currentTSB < -10 ? 'Active Recovery Run Only' : 'High Intensity Workout Approved',
      traceability: createTraceability({
        canonicalIds: [athleteId],
        metricIds: metrics.map(m => m.metricId),
        decisionIds: [],
        syncIds: [],
        viewVersion: '1.0.0'
      })
    };
  }
}

export class EnvironmentOverviewViewBuilder {
  public static build(
    athleteId: string,
    activities: CanonicalActivity[]
  ): EnvironmentOverviewViewModel {
    const extremeWeatherCount = activities.filter(a => a.weather && (a.weather.temperatureC ?? 15) > 30).length;

    return {
      athleteId,
      extremeWeatherCount,
      heatAcclimatizationScore: 78.0,
      temperatureImpactTrend: activities.map(a => ({
        date: a.startDate,
        temperatureC: a.weather?.temperatureC ?? 15,
        averageHeartRate: a.averageHeartRateBpm ?? 150,
        relativePace: a.averagePaceMinPerKm
      })),
      comfortableRunsPercentage: 85.0,
      traceability: createTraceability({
        canonicalIds: [athleteId, ...activities.map(a => a.id)],
        metricIds: [],
        decisionIds: [],
        syncIds: [],
        viewVersion: '1.0.0'
      })
    };
  }
}

export class EquipmentOverviewViewBuilder {
  public static build(
    athleteId: string,
    gearList: CanonicalGear[]
  ): EquipmentOverviewViewModel {
    const shoes = gearList.map(g => ({
      gearId: g.id,
      name: g.name,
      brand: g.brandName,
      model: g.modelName,
      distanceMeters: g.distanceMeters,
      mileageLimitMeters: 800000, // 800km standard
      percentageUsed: (g.distanceMeters / 800000) * 100,
      needsReplacement: g.distanceMeters > 750000,
      retired: g.retired,
      addedDate: g.sourceMetadata?.importedAt || '2026-01-01'
    }));

    return {
      athleteId,
      shoes,
      injuryRiskAssessment: gearList.map(g => ({
        gearId: g.id,
        riskLevel: g.distanceMeters > 750000 ? 'high' : 'low'
      })),
      traceability: createTraceability({
        canonicalIds: [athleteId, ...gearList.map(g => g.id)],
        metricIds: [],
        decisionIds: [],
        syncIds: [],
        viewVersion: '1.0.0'
      })
    };
  }
}

export class SyncHealthViewBuilder {
  public static build(
    athleteId: string,
    connections: any[],
    attempts: any[]
  ): SyncHealthViewModel {
    const providers = connections.map(conn => {
      const providerAttempts = attempts.filter(att => att.providerId === conn.providerId);
      const errors = providerAttempts.filter(att => !att.success);

      return {
        providerId: conn.providerId,
        status: errors.length > 2 ? 'failed' : 'active' as any,
        lastSyncTime: providerAttempts.length > 0 ? providerAttempts[0].timestamp : null,
        totalSyncs: providerAttempts.length,
        successCount: providerAttempts.length - errors.length,
        errorCount: errors.length,
        syncHistory: providerAttempts.slice(0, 10).map(att => ({
          id: att.id,
          timestamp: att.timestamp,
          success: att.success,
          message: att.message || null
        }))
      };
    });

    return {
      athleteId,
      providers,
      overallSystemHealth: 'Excellent',
      traceability: createTraceability({
        canonicalIds: [athleteId],
        metricIds: [],
        decisionIds: [],
        syncIds: attempts.map(att => att.id),
        viewVersion: '1.0.0'
      })
    };
  }
}

export class DataHealthViewBuilder {
  public static build(
    athleteId: string,
    activities: CanonicalActivity[],
    metrics: ComputedMetric[]
  ): DataHealthViewModel {
    return {
      athleteId,
      overallIntegrityScore: 98.2,
      sensorCoverage: {
        heartRateCount: activities.filter(a => a.averageHeartRateBpm).length,
        powerCount: activities.filter(a => a.averagePowerWatts).length,
        cadenceCount: activities.filter(a => a.averageCadenceRpm).length,
        totalActivities: activities.length
      },
      anomalyLogs: [],
      traceability: createTraceability({
        canonicalIds: [athleteId, ...activities.map(a => a.id)],
        metricIds: metrics.map(m => m.metricId),
        decisionIds: [],
        syncIds: [],
        viewVersion: '1.0.0'
      })
    };
  }
}

export class SearchResultViewBuilder {
  public static build(
    query: string,
    activities: CanonicalActivity[],
    gear: CanonicalGear[],
    routes: CanonicalRoute[],
    offset = 0,
    limit = 20
  ): SearchResultViewModel {
    const paginatedActivities = activities.slice(offset, offset + limit).map(act => ActivitySummaryViewBuilder.build(act, []));

    return {
      query,
      activities: paginatedActivities,
      shoes: gear,
      routes,
      totalCount: activities.length + gear.length + routes.length,
      pagination: {
        cursor: null,
        offset,
        limit,
        total: activities.length
      },
      traceability: createTraceability({
        canonicalIds: [...activities.map(a => a.id), ...gear.map(g => g.id), ...routes.map(r => r.id)],
        metricIds: [],
        decisionIds: [],
        syncIds: [],
        viewVersion: '1.0.0'
      })
    };
  }
}

export class CompareViewBuilder {
  public static build(
    athleteId: string,
    baseActivity: ActivityDetailViewModel,
    targetActivity: ActivityDetailViewModel
  ): CompareViewModel {
    return {
      athleteId,
      baseActivity,
      targetActivity,
      metricsDifference: [
        {
          metricId: 'distance',
          metricName: 'Distance',
          baseValue: baseActivity.activity.distanceMeters,
          targetValue: targetActivity.activity.distanceMeters,
          absoluteDiff: targetActivity.activity.distanceMeters - baseActivity.activity.distanceMeters,
          percentageDiff: ((targetActivity.activity.distanceMeters - baseActivity.activity.distanceMeters) / baseActivity.activity.distanceMeters) * 100
        }
      ],
      pacingComparison: [],
      traceability: createTraceability({
        canonicalIds: [baseActivity.activity.id, targetActivity.activity.id],
        metricIds: [],
        decisionIds: [],
        syncIds: [],
        viewVersion: '1.0.0'
      })
    };
  }
}

export class TimelineViewBuilder {
  public static build(
    athleteId: string,
    activities: CanonicalActivity[]
  ): TimelineViewModel {
    return {
      athleteId,
      events: activities.map(act => ({
        id: `event_${act.id}`,
        date: act.startDate,
        type: 'activity',
        title: act.activityName,
        description: `Ran ${act.distanceMeters} meters in ${act.movingTimeSec} seconds.`,
        severity: 'info',
        referenceId: act.id
      })),
      pagination: {
        nextCursor: null,
        hasMore: false
      },
      traceability: createTraceability({
        canonicalIds: [athleteId, ...activities.map(a => a.id)],
        metricIds: [],
        decisionIds: [],
        syncIds: [],
        viewVersion: '1.0.0'
      })
    };
  }
}

export class AthleteProfileViewBuilder {
  public static build(
    athlete: CanonicalAthlete,
    metrics: ComputedMetric[]
  ): AthleteProfileViewModel {
    const ctl = metrics.find(m => m.metricId === 'ctl')?.value ?? null;
    const atl = metrics.find(m => m.metricId === 'atl')?.value ?? null;
    const tsb = metrics.find(m => m.metricId === 'tsb')?.value ?? null;

    return {
      athlete,
      currentStatusSummary: {
        ctl: ctl as number | null,
        atl: atl as number | null,
        tsb: tsb as number | null,
        restingHeartRate: athlete.restingHeartRateBpm,
        maxHeartRate: athlete.maxHeartRateBpm,
        ftp: athlete.ftpWatts,
        vo2Max: athlete.vO2Max
      },
      systemCredentials: [
        { providerId: 'strava', configured: true, scopes: ['activity:read_all'] }
      ],
      traceability: createTraceability({
        canonicalIds: [athlete.id],
        metricIds: metrics.map(m => m.metricId),
        decisionIds: [],
        syncIds: [],
        viewVersion: '1.0.0'
      })
    };
  }
}

export class SettingsViewBuilder {
  public static build(
    athleteId: string
  ): SettingsViewModel {
    return {
      athleteId,
      thresholds: {
        tsbFormZones: {
          highlyFatigued: [-100, -30],
          fatigued: [-30, -10],
          optimal: [-10, 5],
          peaking: [5, 25],
          transition: [25, 100]
        },
        weeklyRampLimits: [1.5, 5.0],
        cardiacDriftCriticalLimit: 15.0,
        gearMileageReplacementLimitMeters: 800000
      },
      syncPreferences: {
        autoSyncEnabled: true,
        notificationPreferences: ['email', 'in_app']
      },
      traceability: createTraceability({
        canonicalIds: [athleteId],
        metricIds: [],
        decisionIds: [],
        syncIds: [],
        viewVersion: '1.0.0'
      })
    };
  }
}
