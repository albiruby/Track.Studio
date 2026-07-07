# Widget Platform Architecture

The Track.Studio Widget Platform is a modular, runtime-driven UI rendering engine designed to instantiate and control analytical viewports without hardcoded switch-case statement blocks. It acts as the bridge between normalized view models and high-contrast presentation layouts.

---

## 1. Platform Design Pattern

The platform utilizes a strict registry-to-factory flow to guarantee extensibility and safety boundaries:

```
[Dashboard Registry / Routing]
              ↓ (Subscribed Widget IDs)
      [Widget Registry] (Resolves Metadata)
              ↓
       [Widget Context] (Mounts, Syncs Preferences & States)
              ↓
       [Widget Factory] (Binds Container + Resolves Custom Override/Renderer)
              ↓
  [Widget Container (OOTB Overlays)]
              ↓
[Widget Renderer (Telemetry / Logs Board)]
```

---

## 2. Core Constraints

To preserve deterministic reliability and explainable calculation invariants, the Widget Platform enforces three critical constraints:
1. **No direct Firestore Access**: All widgets are consumer-only; they do not query databases or create side-effect locks.
2. **No Business Calculations**: Performance metrics (CTL, ATL, TSB, RSS) must be computed in the backend or analysis engines and passed via ViewModels.
3. **VM-Driven Presentation**: If the subscribed ViewModel fails to push packets, the widget transitions cleanly to predefined empty or error states.

---

## 3. Supported SIZES & Adaptive Grid

The platform maps layout preferences to structured tailwind grid-spanning classes:
- **XS**: `col-span-1 h-[160px]` (Ultra compact stats summary)
- **S**: `col-span-1 h-[220px]` (Compact sensor check)
- **M**: `col-span-1 md:col-span-2 h-[300px]` (Standard bento item)
- **L**: `col-span-1 md:col-span-3 h-[400px]` (Large telemetry visualization)
- **XL**: `col-span-1 md:col-span-4 h-[480px]` (High-density stream tables)
- **Full Width**: `col-span-1 md:col-span-4 w-full h-[320px]` (Horizontal metric timeline)

---

## 4. State Management Overlays

Every widget container contains dedicated overlays triggered dynamically by the `WidgetProvider` state machine:
- **Loading**: High-contrast, non-blocking spinner to mask initial connection handshakes.
- **Ready**: Seamless presentation viewport.
- **Refreshing**: Translucent overlay with pulse ring, allowing cached metrics to remain partially visible while background queues execute.
- **Offline**: Connection alert board with action reconnect hooks.
- **Empty**: Informational illustration board when no normalized runs are synced.
- **Partial Data**: Non-obtrusive warning banner for degraded satellite or packet inputs.
- **Error**: High-contrast diagnostics terminal displaying stack trace strings with a hot-reset trigger.
