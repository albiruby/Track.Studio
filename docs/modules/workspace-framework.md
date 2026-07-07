# Track.Studio — Workspace Framework Documentation

This document describes the design, API, and state integration of the **Track.Studio Application Shell and Workspace Framework**.

---

## 1. Overview
The Workspace Framework serves as the unified shell for all views in the Track.Studio platform. It establishes:
- Consistent branding, grid layout, and keyboard shortcuts.
- Context-aware state managers (active athlete, synchronization queues, notifications, compact/high-density views).
- Responsive side-drawers, overlays, and modals.
- Complete visual isolation of pages from low-level authentication and database logic.

---

## 2. Global State (`WorkspaceProvider`)
All workspace components must be wrapped in `<WorkspaceProvider>` (located in `/providers/workspace-provider.tsx`). This context exposes:

| State Key | Type | Description |
|---|---|---|
| `isSidebarCollapsed` | `boolean` | Controls whether the sidebar renders text descriptions or only icons. |
| `activeAthlete` | `AthleteProfile` | Currently selected athlete context.Recalculates performance curves on change. |
| `syncStatus` | `'idle' \| 'syncing' \| 'success' \| 'failed'` | Active status of external webhook ingestion channels. |
| `notifications` | `WorkspaceNotification[]` | Local FIFO queue of critical warnings, system events, and sync alerts. |
| `isCommandPaletteOpen`| `boolean` | State toggle for the floating `Ctrl + K` overlay. |
| `isCompactMode` | `boolean` | Compress margin/padding variables for professional high-density dashboards. |

---

## 3. Global Keybindings
The framework registers workspace-level event listeners on mounting:
- **`Ctrl + /`**: Collapses or expands the primary Navigation Sidebar.
- **`Ctrl + K`**: Launches the global Command Palette overlay.
- **`Escape`**: Safely closes all active dropdown panels, drawers, modals, and the command palette.
