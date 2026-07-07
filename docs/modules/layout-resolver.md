# Layout Resolver & Responsive Constraints

The `LayoutResolver` and `ResponsiveLayoutResolver` handle mathematical scaling constraints, container breakpoints, and layout rendering metadata translation.

## Responsive Breakpoints

Track.Studio utilizes fluid, container-based breakpoints instead of global viewport coordinates. This guarantees high-density charts render correctly even when sidebar drawers are expanded or collapsed.

| Breakpoint | Minimum Width | Maximum Width | Grid Columns | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile** | `0px` | `767px` | `1` | Small screens / Linear single columns |
| **Tablet** | `768px` | `1023px` | `2` | Split views / Dual columns |
| **Desktop** | `1024px` | `1599px` | `4` | Main standard workspace layouts |
| **Ultra-Wide** | `1600px` | `No Limit` | `6` | Full bento-grid expansions |

## Scaled Constraints Algorithm

To prevent grid overflow and visual distortion on smaller breakpoints, widgets with wide horizontal spans are dynamically scaled down using static boundaries.

```typescript
export class ResponsiveLayoutResolver {
  public static scaleWidgetSize(size: WidgetSize, maxCols: number): WidgetSize {
    if (maxCols === 1) {
      return 'Full Width';
    }
    if (maxCols === 2) {
      if (size === 'L' || size === 'XL' || size === 'Full Width') {
        return 'Full Width';
      }
      return size;
    }
    return size;
  }
}
```

## Resolution Pipeline

On container resizing or preference mutations, the resolution pipeline executes the following sequence:

1. **Observe Dimensions**: `ResizeObserver` sends current width bounds to the Context Provider.
2. **Break Match**: `ResponsiveLayoutResolver.resolveBreakpoint` matches the width against the four standard breakpoint ranges.
3. **Fetch Active Template**: The orchestrator grabs the `DashboardTemplate` from the registry.
4. **Merge Preferences**: Matches user-defined sizing, visibility, and ordering against the template specification.
5. **Constraint Sizing**: Applies scale logic to guarantee no widget exceeds the active breakpoint's total column width.
6. **Compile Resolved Layout**: Emits a `ResolvedLayout` containing columns, gaps, breakpoint indicators, and ordered widgets.
