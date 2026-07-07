# Dashboard Framework Module

## Overview
The Dashboard Framework in Track.Studio serves as a highly modular presentation layer. It is decoupled entirely from any sports metric computations, database logic, or rule executions. It is designed to consume structured, normalized View Models emitted by the **Analytics Query Engine** and display them across multiple dashboard environments.

---

## Architecture Flow

```
  Analytics Query Engine
          ↓
     View Models (Pure JSON Contracts)
          ↓
     DashboardProvider (Lifecycle & Preferences Store)
          ↓
     DashboardLayout (Responsive Grid & Bento Containers)
          ↓
     WidgetContainers (Header, Toolbars, Content Slots, Skeletons)
          ↓
     DashboardPageRenderer (Active View Mapper)
```

---

## Core Components

### 1. `DashboardRegistry` (`/lib/dashboard/registry.ts`)
A single, centralized registry listing all 15 operational dashboards and their attributes:
- **Dashboard ID**: Unique URL hash key.
- **Category**: Grouping criteria (e.g. `Sensor Insights`, `Analytics Engine`).
- **Supported View Models**: Explicit list of contracts this dashboard is designed to bind to.
- **Supported Widgets**: Array of children widget keys.
- **Layout Template**: Grid configuration style (`grid`, `bento`, `split`, `vertical`, `connections`).
- **Documentation**: Human-readable descriptions explaining the focus of each dashboard.

### 2. `DashboardProvider` (`/providers/dashboard-provider.tsx`)
A Next.js Client Context Provider managing:
- **State States**: `Loading` | `Refreshing` | `Offline` | `Partial Data` | `Empty` | `Error` | `Ready`.
- **Keyboard Shortcuts**: Allows users to press `Alt + [1-9]` to jump between dashboards instantly and `Alt + d` to cycle through layout densities.
- **Preferences**: Tracks which widgets are visible, current density padding mode, and active default landing pages.

### 3. `WidgetContainer` (`/components/dashboard/widget-container.tsx`)
A robust wrapper providing standardized templates for:
- Header sections (Title, Subtitle, Info tags).
- Operations Toolbars (Local refresh hooks, fullscreen toggles, visibility toggles).
- Error state fallbacks.
- Empty state fallbacks.
- Global loading and offline skeletons.
- Standardized Footer blocks with synchronization timestamps.

### 4. `DashboardGrid` (`/components/dashboard/dashboard-grid.tsx`)
Responsive container supporting complex alignments:
- **Bento**: Asymmetric spanning of columns tailored to grid priorities.
- **Split**: Left/Right double-column setups.
- **Vertical**: Streamlined single-column vertical configuration.
- **Grid**: Highly symmetrical responsive columns.
- **Collapsible Section Container**: Allows dividing widget arrays into clear, named, collapsible panels.
