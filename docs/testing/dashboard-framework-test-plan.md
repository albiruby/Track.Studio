# Dashboard Framework Test Plan

This test plan defines the manual and automated validation procedures required to certify the integrity of the Track.Studio Dashboard Platform.

---

## 1. AUTOMATED TESTS
The automated test suite in `/lib/dashboard/tests/run-dashboard-tests.ts` runs directly on the server to verify:

### Test Case 1.1: Dashboard Registry Exhaustiveness
- **Method**: Loop through all 15 expected IDs.
- **Criteria**: Each ID must match a defined configuration with valid category strings, layout templates, non-empty arrays for supported widgets and view models, and written documentation.

### Test Case 1.2: Widget Referential Integrity
- **Method**: Aggregate every widget referenced inside the dashboard list and cross-examine them against the master `WIDGET_REGISTRY`.
- **Criteria**: Zero missing references. Every registered widget must obey columns/rows guidelines (`width: 1-4`, `height: 1-3`).

### Test Case 1.3: Preferences Mutation
- **Method**: Instantiates mock `DashboardPreferences` and updates layout density and visibility maps.
- **Criteria**: Preferences update correctly and match mutated structures cleanly.

---

## 2. MANUAL & UI INTERACTIVITY TESTS

### Test Case 2.1: URL Hash Integration
- **Step**: Type `#performance` or `#heart_rate` directly in the browser's address bar.
- **Expected**: The dashboard immediately renders the specified screen layout. The sidebar active highlight automatically shifts to match the route.

### Test Case 2.2: Keyboard Shortcuts (Alt Hotkeys)
- **Step**: Focus the page and press `Alt + 1` (Home), `Alt + 2` (Performance), `Alt + 3` (Activities), through `Alt + 9` (Equipment).
- **Expected**: Instantly transitions views, triggers a temporary confirmation notification, and updates the URL hash.
- **Step**: Press `Alt + D` repeatedly.
- **Expected**: Rotates padding densities sequentially (`compact` ➔ `comfortable` ➔ `spacious`) and rearranges page spacing in real-time.

### Test Case 2.3: Responsive Layouts
- **Step**: Resize the viewport down to 360px (mobile width).
- **Expected**: Bento and grid grids gracefully reflow into standard single-column stacks with touch targets of 44px or greater.
- **Step**: Expand viewport to 1440px (desktop).
- **Expected**: Multicolumn structures assemble properly without page-width overflow.
