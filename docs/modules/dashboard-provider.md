# Dashboard Provider & State Machine

## Overview
The `DashboardProvider` is the state orchestration node for all performance views in Track.Studio. It serves as the primary reactive listener for window hash changes, keyboard events, and custom widget visibility settings.

---

## State Transitions

The active dashboard transitions across standard lifecycle statuses defined by `DashboardState`:

```
 [Mount/HashChange] ──> (Loading)
                           │
                           ▼ (400ms simulate view-model compile)
                       (Ready) ───[Connection Lost]───> (Offline)
                           │
                 [User clicks Refresh]
                           │
                           ▼
                      (Refreshing) ───[Payload Empty]──> (Empty)
                           │
                  [Sync fails or crash]
                           │
                           ▼
                        (Error)
```

---

## Interactive Preferences Persistence
User preference overrides are saved automatically to `localStorage` under the key `track_studio_dashboard_prefs`:
```typescript
export interface DashboardPreferences {
  widgetVisibility: Record<string, boolean>; // Maps widgetId -> visible status
  layoutDensity: 'compact' | 'comfortable' | 'spacious';
  defaultDashboardId: string;
  theme: 'light' | 'dark' | 'system';
}
```

---

## Dynamic Keybindings (Alt-Harnesses)
To enable fast expert access, global keydown listeners bind specific Alt combinations:

1. **Dashboard Navigation**:
   - `Alt + 1` → Jump to **Home Dashboard** (`#dashboard`)
   - `Alt + 2` → Jump to **Performance Dashboard** (`#performance`)
   - `Alt + 3` → Jump to **Activities Dashboard** (`#activities`)
   - `Alt + 4` → Jump to **Heart Rate Dashboard** (`#heart_rate`)
   - `Alt + 5` → Jump to **Power Dashboard** (`#power`)
   - `Alt + 6` → Jump to **Cadence Dashboard** (`#cadence`)
   - `Alt + 7` → Jump to **Training Load Dashboard** (`#training_load`)
   - `Alt + 8` → Jump to **Recovery Dashboard** (`#recovery`)
   - `Alt + 9` → Jump to **Equipment Dashboard** (`#equipment`)

2. **Density Toggle**:
   - `Alt + D` → Cycle layout density modes sequentially: `compact` ➔ `comfortable` ➔ `spacious`.

---

## Hook Interface
Components leverage `useDashboard()` to safely interact with active metrics:
```typescript
const { 
  activeDashboardId, 
  setActiveDashboardId,
  dashboardState,
  preferences,
  refreshDashboard,
  updateWidgetVisibility,
  updateLayoutDensity
} = useDashboard();
```
