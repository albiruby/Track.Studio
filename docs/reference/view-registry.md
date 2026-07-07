# View Registry

The View Registry maps every system View Model to standard architectural configuration files. This metadata enables lazy/eager loading optimization, caching options, and developer traceability.

## Schema

```typescript
export interface ViewRegistryEntry {
  viewId: string;
  viewName: string;
  category: string;
  dependencies: string[];
  repositoriesUsed: string[];
  cachePolicy: 'memory' | 'session' | 'none';
  refreshPolicy: 'lazy' | 'eager';
  version: string;
  status: 'active' | 'deprecated' | 'experimental';
  documentationLink: string;
}
```

## System Definitions

Track.Studio defines 20 standard view entries in `ViewRegistry` covering:
- **Dashboard Views** (`home_dashboard`, `timeline`)
- **Performance Views** (`performance_overview`, `power_overview`, `training_load_overview`)
- **Physiological/Biomech Views** (`heart_rate_overview`, `cadence_overview`, `recovery_overview`)
- **Activity Detail Views** (`activity_detail`, `activity_summary`, `compare`)
- **System Administration** (`sync_health`, `data_health`, `settings`)
