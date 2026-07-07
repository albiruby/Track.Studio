# Dashboard Composition Engine

The Dashboard Composition Engine is the core orchestration layer responsible for dynamically assembling and arranging widgets into dashboard layouts. Following Track.Studio standards, this module is strictly deterministic, registry-driven, and contains zero business logic, performance metrics calculations, or database queries.

## Domain Model & Flow

```
+-----------------------------+
|  DashboardTemplateRegistry  | (15 default dashboard specifications)
+--------------+--------------+
               |
               v
+--------------+--------------+
| DashboardCompositionEngine  | (Central orchestrator & coordinator)
+-------+--------------+------+
        |              |
        v              v
+-------+-----+  +-----+------+
| Layout      |  | Widget     |
| Resolver    |  | Resolver   | (Resolves registry lookups)
+-------+-----+  +-----+------+
        |              |
        v              v
+-------+--------------+------+
|    CompositionPersistence   | (localStorage + version migration)
+--------------+--------------+
               |
               v
+--------------+--------------+
|     CompositionProvider     | (ResizeObserver & React Context)
+-----------------------------+
```

## Core Responsibilities

1. **Deterministic Assemblage**: Composes layouts strictly based on static templates combined with user preferences.
2. **Dynamic Spanning & Responsive Scale**: Controls widget width and grid column counts depending on physical parent container size.
3. **Pristine State Isolation**: Never imports Firestore, repository dependencies, or metrics execution engines. It only organizes layout indices.
4. **Seamless Version Migration**: Identifies client preferences mismatches on layout schema version bump and migrates old custom structures cleanly.

## Key APIs

### `DashboardCompositionEngine`

```typescript
class DashboardCompositionEngine {
  static getTemplate(dashboardId: string): DashboardTemplate;
  static getPreferences(dashboardId: string): CompositionPreferences;
  static compose(dashboardId: string, width: number, customPrefs?: CompositionPreferences): ResolvedLayout;
  static updatePreferences(dashboardId: string, updates: Partial<CompositionPreferences>): CompositionPreferences;
  static reset(dashboardId: string): CompositionPreferences;
}
```

- **`compose`**: Generates a finalized `ResolvedLayout` consisting of layout dimensions, breakpoint matches, and a sorted list of fully visible or hidden `ResolvedWidget` records.
- **`updatePreferences`**: Modifies the active user layout, such as resizing a single widget or changing the priority index order.
