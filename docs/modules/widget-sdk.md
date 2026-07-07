# Widget SDK Reference

The Widget SDK provides the TypeScript types, context providers, and lifecycle Hooks required to author or instantiate widgets in Track.Studio.

---

## 1. Type Interfaces

All widgets are declared using strict schema structures defined in `@/types/widget`:

```typescript
export type WidgetState = 
  | 'Loading' 
  | 'Ready' 
  | 'Refreshing' 
  | 'Offline' 
  | 'Partial Data' 
  | 'Empty' 
  | 'Error' 
  | 'Disabled' 
  | 'Hidden';

export type WidgetSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'Full Width';

export interface WidgetPreferences {
  size: WidgetSize;
  isCollapsed: boolean;
  isPinned: boolean;
  isFavorite: boolean;
  customTitle?: string;
}

export interface WidgetMetadata {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  version: string;
  ownerDashboards: string[];
  requiredViewModel: string;
  requiredPermissions: string[];
  supportedSizes: WidgetSize[];
  refreshStrategy: 'manual' | 'interval' | 'realtime';
  documentation: string;
  defaultWidth: number;
  defaultHeight: number;
}
```

---

## 2. Dynamic Lifecycle Hook (`useWidget`)

The SDK exports `useWidget()` to interact with the underlying state backplane.

### Hook Capabilities

```typescript
const {
  widgetStates,          // Record<string, WidgetState>
  widgetPreferences,     // Record<string, WidgetPreferences>
  widgetVisibility,      // Record<string, boolean>
  widgetErrors,          // Record<string, string | null>
  widgetEvents,          // Record<string, WidgetLifecycleEvent[]>
  fullscreenWidgetId,    // string | null
  
  setWidgetState,        // (id, state) => void
  setWidgetVisibility,   // (id, visible) => void
  setWidgetError,        // (id, errorString) => void
  refreshWidget,         // (id) => Promise<void>
  toggleFullscreen,      // (id) => void
  toggleCollapse,        // (id) => void
  toggleFavorite,        // (id) => void
  resetWidget            // (id) => void
} = useWidget();
```

---

## 3. Dynamic Factory Injection

To extend the platform with bespoke view renderers without violating the "no switch-case" principle, developers can register custom components at runtime:

```typescript
import { registerCustomWidget } from '@/components/widget/widget-factory';

// Register custom override for 'home_profile'
registerCustomWidget('home_profile', ({ widgetId }) => {
  return (
    <div className="p-4 font-sans">
      <h3>Athlete Heart Rate Limits</h3>
      {/* Bespoke rendering goes here */}
    </div>
  );
});
```
