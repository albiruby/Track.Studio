# Dashboard Composition Engine Test Plan

This document details the validation strategies and testing parameters for the Dashboard Composition Engine.

## Test Scenarios

### Scenario 1: Basic Template Lookups
- **Objective**: Verify that templates for all 15 dashboards load accurately without raising errors.
- **Criteria**: No undefined template entries, all fields conform to the `DashboardTemplate` interface.

### Scenario 2: Layout Resolution & Grid Math
- **Objective**: Test that layout resolver yields correct column bounds across breakpoints.
- **Criteria**:
  - `width: 1920px` -> `ultra-wide` -> `6` columns.
  - `width: 1200px` -> `desktop` -> `4` columns.
  - `width: 800px` -> `tablet` -> `2` columns.
  - `width: 400px` -> `mobile` -> `1` column.

### Scenario 3: Responsive Scale Downscaling
- **Objective**: Ensure wide widgets scale to fit narrower breakpoints seamlessly.
- **Criteria**: Large size `L` scales to `Full Width` on 1-column mobile layouts.

### Scenario 4: Composition Persistence & Reset
- **Objective**: Check that custom preferences store securely, survive reloads, and reset correctly.
- **Criteria**:
  - Modifying order/size caches local data.
  - Reset purges customizations and returns templates to default.

### Scenario 5: Version Schema Migrations
- **Objective**: Confirm older version configurations upgrade safely on version bump.
- **Criteria**:
  - Outdated custom cache is preserved but safely upgraded.
  - New supported widgets from template are merged into the layout stream without dropping the user's historical overrides.

## Executing Tests

Run the test suite from the root workspace directory using:

```bash
npm run test
```
This executes both Dashboard platform and Widget platform suites including composition tests.
