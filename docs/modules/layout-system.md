# Track.Studio — Layout System Documentation

This document describes the structured layouts available in the Track.Studio Workspace.

---

## 1. Workspace Layout (`WorkspaceLayout`)
The standard template for internal data dashboards. It contains:
- **Sidebar Grid**: Pinned or collapsed sidebar column.
- **Top Bar**: Search trigger, Active Athlete context switcher, Sync controller, Theme toggler, Notification center, and User profile card.
- **Page Framework**:
  - `title` / `subtitle`: Header block.
  - `toolbar` / `actions`: Quick filters and primary buttons.
  - `filtersSlot`: Expandable/collapsible filters section.
  - `contentSlot`: Primary viewport.
  - `sidePanelSlot`: Sliding inspect drawer on the right.
  - `footerSlot`: Standard status meters and copyright metrics.

---

## 2. Supporting Specialized Layouts

### Authentication Layout (`AuthenticationLayout`)
- Centered, clean, high-contrast container for login, sign-up, and forgot password screens.
- Suppresses all peripheral navigation to prevent route leakage prior to session generation.

### Fullscreen Layout (`FullscreenLayout`)
- Expands the main viewport to utilize 100% of the browser width and height.
- Intended for immersive GIS maps, full-screen chart analyses, or workout replays.

### Error Layout (`ErrorLayout`)
- Handles 404, 500, Unauthorized, and Forbidden states.
- Embeds collapsible stack traces/diagnostics for developers, with quick-action retry loops.

### Maintenance Layout (`MaintenanceLayout`)
- Displays scheduled maintenance bulletins and re-calibration progress bars.

### Offline Layout (`OfflineLayout`)
- Detects browser network dropouts and blocks interaction, offering interactive re-connection simulation.

### Empty Workspace Layout (`EmptyWorkspaceLayout`)
- Present when an athlete profile has zero workouts. Guide users through a 4-step onboarding pipeline (Google auth, linking Strava, heart rate thresholds, and first historical sync).

### Print Layout (`PrintLayout`)
- High-contrast, borderless, grayscale stylesheet optimizing dashboards for physical paper printing.
