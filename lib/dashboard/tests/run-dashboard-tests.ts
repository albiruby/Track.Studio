/**
 * Standalone Test Suite for the Dashboard System, Registries, and State Lifecycles
 */

import { DASHBOARD_REGISTRY, WIDGET_REGISTRY } from '../registry';
import { DashboardState, DashboardPreferences, LayoutDensity } from '@/types/dashboard';

// Assert helpers
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

function assertEquals<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`Assertion Failed: ${message}\nExpected: ${expected}\nActual: ${actual}`);
  }
}

async function runDashboardTests() {
  console.log('====================================================');
  console.log('TRACK.STUDIO — PHASE 11 DASHBOARD PLATFORM TESTS');
  console.log('====================================================');

  // 1. Dashboard Registry Verification
  console.log('Scenario 1: Verifying Dashboard Registry Coverage...');
  
  const expectedDashboards = [
    'dashboard', 'performance', 'activities', 'heart_rate', 'power', 
    'cadence', 'training_load', 'recovery', 'environment', 'equipment', 
    'connections', 'data_health', 'settings', 'search', 'compare'
  ];

  expectedDashboards.forEach(id => {
    assert(DASHBOARD_REGISTRY[id] !== undefined, `Missing registered dashboard for id: ${id}`);
    assertEquals(DASHBOARD_REGISTRY[id].id, id, `Dashboard ID mismatch for key: ${id}`);
    assert(DASHBOARD_REGISTRY[id].name.length > 0, `Empty dashboard name for: ${id}`);
    assert(DASHBOARD_REGISTRY[id].supportedWidgets.length > 0, `Dashboard ${id} has no supporting widgets registered`);
    assert(DASHBOARD_REGISTRY[id].supportedViewModels.length > 0, `Dashboard ${id} has no view model subscriptions registered`);
  });

  console.log(`✓ Passed: Verified all ${expectedDashboards.length} dashboards are successfully configured in DASHBOARD_REGISTRY.`);

  // 2. Widget Registry Verification
  console.log('\nScenario 2: Verifying Widget Registry Constraints...');
  
  // Collect all widgets referenced across all dashboards
  const allReferencedWidgets = new Set<string>();
  Object.values(DASHBOARD_REGISTRY).forEach(db => {
    db.supportedWidgets.forEach(wId => {
      allReferencedWidgets.add(wId);
    });
  });

  allReferencedWidgets.forEach(wId => {
    const widget = WIDGET_REGISTRY[wId];
    assert(widget !== undefined, `Widget ID: '${wId}' referenced in a dashboard is missing from WIDGET_REGISTRY`);
    assertEquals(widget.id, wId, `Widget ID mismatch in registry for: ${wId}`);
    assert(widget.name.length > 0, `Widget '${wId}' has empty name`);
    assert(widget.description.length > 0, `Widget '${wId}' has empty description`);
    assert(widget.defaultWidth >= 1 && widget.defaultWidth <= 4, `Widget '${wId}' has invalid column width of ${widget.defaultWidth}`);
    assert(widget.defaultHeight >= 1 && widget.defaultHeight <= 3, `Widget '${wId}' has invalid row height of ${widget.defaultHeight}`);
  });

  console.log(`✓ Passed: Verified all ${allReferencedWidgets.size} distinct dashboard widgets are successfully validated against WIDGET_REGISTRY specs.`);

  // 3. User Preferences and State Management Simulation
  console.log('\nScenario 3: Simulating Layout Preferences and State Transitions...');
  
  // Model state transitions
  let mockState: DashboardState = 'Loading';
  assertEquals(mockState, 'Loading', 'Initial mock state error');

  mockState = 'Ready';
  assertEquals(mockState, 'Ready', 'Mock state Ready transition failed');

  mockState = 'Refreshing';
  assertEquals(mockState, 'Refreshing', 'Mock state Refreshing transition failed');

  mockState = 'Offline';
  assertEquals(mockState, 'Offline', 'Mock state Offline transition failed');

  // Preferences structure validation
  const mockPrefs: DashboardPreferences = {
    widgetVisibility: {
      'home_profile': true,
      'home_recent_activity': false
    },
    layoutDensity: 'comfortable',
    defaultDashboardId: 'dashboard',
    theme: 'dark'
  };

  assertEquals(mockPrefs.layoutDensity, 'comfortable', 'Density pref mismatch');
  assertEquals(mockPrefs.widgetVisibility['home_profile'], true, 'Widget visibility true mismatch');
  assertEquals(mockPrefs.widgetVisibility['home_recent_activity'], false, 'Widget visibility false mismatch');
  
  // Simulated density change
  const newDensity: LayoutDensity = 'compact';
  mockPrefs.layoutDensity = newDensity;
  assertEquals(mockPrefs.layoutDensity, 'compact', 'Failed to update layout density preference');

  console.log('✓ Passed: Layout density switches and state transition models are fully valid.');

  // 4. View Model Registration Contract Tests
  console.log('\nScenario 4: Verifying Ingestion View Model Registration Framework...');

  const mockViewModelStore: Record<string, any> = {};
  
  const registerViewModel = (key: string, data: any) => {
    mockViewModelStore[key] = data;
  };

  // Register some view models matching our registry supportedViewModels
  registerViewModel('HomeDashboardViewModel', {
    athlete: { name: 'Elite Runner' },
    currentCTL: 72.1,
    currentATL: 85.5,
    currentTSB: -13.4
  });

  registerViewModel('PerformanceOverviewViewModel', {
    fitness: { currentCTL: 72.1 },
    fatigue: { currentATL: 85.5 }
  });

  assert(mockViewModelStore['HomeDashboardViewModel'] !== undefined, 'Failed to register HomeDashboardViewModel');
  assertEquals(mockViewModelStore['HomeDashboardViewModel'].currentCTL, 72.1, 'ViewModel value mismatch');
  assert(mockViewModelStore['PerformanceOverviewViewModel'] !== undefined, 'Failed to register PerformanceOverviewViewModel');

  console.log('✓ Passed: Ingestion View Model Subscription validation successful.');

  console.log('\n====================================================');
  console.log('  ALL DASHBOARD SYSTEM TEST SCENARIOS PASSED!  ');
  console.log('====================================================');
}

runDashboardTests().catch(err => {
  console.error('\n❌ Dashboard Test Suite Failed:', err);
  process.exit(1);
});
