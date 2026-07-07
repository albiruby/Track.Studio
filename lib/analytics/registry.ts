import { ViewRegistryEntry } from './types';

export class ViewRegistry {
  private static registry: Map<string, ViewRegistryEntry> = new Map([
    [
      'home_dashboard',
      {
        viewId: 'home_dashboard',
        viewName: 'Home Dashboard View Model',
        category: 'dashboard',
        dependencies: ['athlete', 'activities', 'metrics', 'decisions', 'connections'],
        repositoriesUsed: ['CanonicalRepository', 'MetricRepository', 'DecisionRepository', 'ConnectionRepository'],
        cachePolicy: 'memory',
        refreshPolicy: 'lazy',
        version: '1.0.0',
        status: 'active',
        documentationLink: '/docs/modules/view-models.md#home-dashboard'
      }
    ],
    [
      'performance_overview',
      {
        viewId: 'performance_overview',
        viewName: 'Performance Overview View Model',
        category: 'performance',
        dependencies: ['athlete', 'metrics', 'activities'],
        repositoriesUsed: ['CanonicalRepository', 'MetricRepository'],
        cachePolicy: 'memory',
        refreshPolicy: 'lazy',
        version: '1.0.0',
        status: 'active',
        documentationLink: '/docs/modules/view-models.md#performance-overview'
      }
    ],
    [
      'activity_summary',
      {
        viewId: 'activity_summary',
        viewName: 'Activity Summary View Model',
        category: 'activities',
        dependencies: ['activity', 'decisions'],
        repositoriesUsed: ['CanonicalRepository', 'DecisionRepository'],
        cachePolicy: 'memory',
        refreshPolicy: 'eager',
        version: '1.0.0',
        status: 'active',
        documentationLink: '/docs/modules/view-models.md#activity-summary'
      }
    ],
    [
      'activity_detail',
      {
        viewId: 'activity_detail',
        viewName: 'Activity Detail View Model',
        category: 'activities',
        dependencies: ['activity', 'metrics', 'decisions', 'laps', 'splits', 'streams', 'gear'],
        repositoriesUsed: ['CanonicalRepository', 'MetricRepository', 'DecisionRepository'],
        cachePolicy: 'memory',
        refreshPolicy: 'lazy',
        version: '1.0.0',
        status: 'active',
        documentationLink: '/docs/modules/view-models.md#activity-detail'
      }
    ],
    [
      'weekly_training',
      {
        viewId: 'weekly_training',
        viewName: 'Weekly Training View Model',
        category: 'training',
        dependencies: ['athlete', 'activities', 'metrics'],
        repositoriesUsed: ['CanonicalRepository', 'MetricRepository'],
        cachePolicy: 'memory',
        refreshPolicy: 'lazy',
        version: '1.0.0',
        status: 'active',
        documentationLink: '/docs/modules/view-models.md#weekly-training'
      }
    ],
    [
      'monthly_training',
      {
        viewId: 'monthly_training',
        viewName: 'Monthly Training View Model',
        category: 'training',
        dependencies: ['athlete', 'activities', 'decisions'],
        repositoriesUsed: ['CanonicalRepository', 'DecisionRepository'],
        cachePolicy: 'memory',
        refreshPolicy: 'lazy',
        version: '1.0.0',
        status: 'active',
        documentationLink: '/docs/modules/view-models.md#monthly-training'
      }
    ],
    [
      'heart_rate_overview',
      {
        viewId: 'heart_rate_overview',
        viewName: 'Heart Rate Overview View Model',
        category: 'physiological',
        dependencies: ['athlete', 'metrics', 'activities'],
        repositoriesUsed: ['CanonicalRepository', 'MetricRepository'],
        cachePolicy: 'memory',
        refreshPolicy: 'lazy',
        version: '1.0.0',
        status: 'active',
        documentationLink: '/docs/modules/view-models.md#heart-rate-overview'
      }
    ],
    [
      'power_overview',
      {
        viewId: 'power_overview',
        viewName: 'Power Overview View Model',
        category: 'performance',
        dependencies: ['athlete', 'metrics', 'activities'],
        repositoriesUsed: ['CanonicalRepository', 'MetricRepository'],
        cachePolicy: 'memory',
        refreshPolicy: 'lazy',
        version: '1.0.0',
        status: 'active',
        documentationLink: '/docs/modules/view-models.md#power-overview'
      }
    ],
    [
      'cadence_overview',
      {
        viewId: 'cadence_overview',
        viewName: 'Cadence Overview View Model',
        category: 'biomechanical',
        dependencies: ['athlete', 'activities'],
        repositoriesUsed: ['CanonicalRepository'],
        cachePolicy: 'memory',
        refreshPolicy: 'lazy',
        version: '1.0.0',
        status: 'active',
        documentationLink: '/docs/modules/view-models.md#cadence-overview'
      }
    ],
    [
      'training_load_overview',
      {
        viewId: 'training_load_overview',
        viewName: 'Training Load Overview View Model',
        category: 'training',
        dependencies: ['athlete', 'metrics'],
        repositoriesUsed: ['MetricRepository'],
        cachePolicy: 'memory',
        refreshPolicy: 'lazy',
        version: '1.0.0',
        status: 'active',
        documentationLink: '/docs/modules/view-models.md#training-load-overview'
      }
    ],
    [
      'recovery_overview',
      {
        viewId: 'recovery_overview',
        viewName: 'Recovery Overview View Model',
        category: 'physiological',
        dependencies: ['athlete', 'metrics'],
        repositoriesUsed: ['MetricRepository'],
        cachePolicy: 'memory',
        refreshPolicy: 'lazy',
        version: '1.0.0',
        status: 'active',
        documentationLink: '/docs/modules/view-models.md#recovery-overview'
      }
    ],
    [
      'environment_overview',
      {
        viewId: 'environment_overview',
        viewName: 'Environment Overview View Model',
        category: 'environmental',
        dependencies: ['athlete', 'activities'],
        repositoriesUsed: ['CanonicalRepository'],
        cachePolicy: 'memory',
        refreshPolicy: 'lazy',
        version: '1.0.0',
        status: 'active',
        documentationLink: '/docs/modules/view-models.md#environment-overview'
      }
    ],
    [
      'equipment_overview',
      {
        viewId: 'equipment_overview',
        viewName: 'Equipment Overview View Model',
        category: 'equipment',
        dependencies: ['athlete', 'gear'],
        repositoriesUsed: ['CanonicalRepository'],
        cachePolicy: 'memory',
        refreshPolicy: 'lazy',
        version: '1.0.0',
        status: 'active',
        documentationLink: '/docs/modules/view-models.md#equipment-overview'
      }
    ],
    [
      'sync_health',
      {
        viewId: 'sync_health',
        viewName: 'Sync Health View Model',
        category: 'system',
        dependencies: ['athlete', 'connections'],
        repositoriesUsed: ['ConnectionRepository'],
        cachePolicy: 'memory',
        refreshPolicy: 'eager',
        version: '1.0.0',
        status: 'active',
        documentationLink: '/docs/modules/view-models.md#sync-health'
      }
    ],
    [
      'data_health',
      {
        viewId: 'data_health',
        viewName: 'Data Health View Model',
        category: 'system',
        dependencies: ['athlete', 'metrics', 'activities'],
        repositoriesUsed: ['CanonicalRepository', 'MetricRepository'],
        cachePolicy: 'memory',
        refreshPolicy: 'lazy',
        version: '1.0.0',
        status: 'active',
        documentationLink: '/docs/modules/view-models.md#data-health'
      }
    ],
    [
      'search_result',
      {
        viewId: 'search_result',
        viewName: 'Search Result View Model',
        category: 'search',
        dependencies: ['activities', 'gear', 'routes'],
        repositoriesUsed: ['CanonicalRepository'],
        cachePolicy: 'none',
        refreshPolicy: 'eager',
        version: '1.0.0',
        status: 'active',
        documentationLink: '/docs/modules/view-models.md#search-result'
      }
    ],
    [
      'compare',
      {
        viewId: 'compare',
        viewName: 'Compare View Model',
        category: 'activities',
        dependencies: ['activity', 'metrics', 'decisions'],
        repositoriesUsed: ['CanonicalRepository', 'MetricRepository', 'DecisionRepository'],
        cachePolicy: 'none',
        refreshPolicy: 'eager',
        version: '1.0.0',
        status: 'active',
        documentationLink: '/docs/modules/view-models.md#compare'
      }
    ],
    [
      'timeline',
      {
        viewId: 'timeline',
        viewName: 'Timeline View Model',
        category: 'dashboard',
        dependencies: ['athlete', 'activities', 'connections'],
        repositoriesUsed: ['CanonicalRepository', 'ConnectionRepository'],
        cachePolicy: 'memory',
        refreshPolicy: 'lazy',
        version: '1.0.0',
        status: 'active',
        documentationLink: '/docs/modules/view-models.md#timeline'
      }
    ],
    [
      'athlete_profile',
      {
        viewId: 'athlete_profile',
        viewName: 'Athlete Profile View Model',
        category: 'athlete',
        dependencies: ['athlete', 'metrics', 'connections'],
        repositoriesUsed: ['CanonicalRepository', 'MetricRepository', 'ConnectionRepository'],
        cachePolicy: 'memory',
        refreshPolicy: 'lazy',
        version: '1.0.0',
        status: 'active',
        documentationLink: '/docs/modules/view-models.md#athlete-profile'
      }
    ],
    [
      'settings',
      {
        viewId: 'settings',
        viewName: 'Settings View Model',
        category: 'athlete',
        dependencies: ['athlete'],
        repositoriesUsed: ['CanonicalRepository'],
        cachePolicy: 'memory',
        refreshPolicy: 'lazy',
        version: '1.0.0',
        status: 'active',
        documentationLink: '/docs/modules/view-models.md#settings'
      }
    ]
  ]);

  public static get(viewId: string): ViewRegistryEntry | undefined {
    return this.registry.get(viewId);
  }

  public static list(): ViewRegistryEntry[] {
    return Array.from(this.registry.values());
  }
}
