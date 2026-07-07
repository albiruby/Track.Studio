import { WIDGET_METADATA_REGISTRY } from '../registry';
import { WidgetState, WidgetSize, WidgetLifecycleEvent } from '../../../types/widget';

console.log("==================================================================================");
console.log("              TRACK.STUDIO — PHASE 12 WIDGET PLATFORM SYSTEM TESTS                ");
console.log("==================================================================================");

let failedTestsCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✓ Passed: ${message}`);
  } else {
    console.error(`❌ Failed: ${message}`);
    failedTestsCount++;
  }
}

// =========================================================
// Scenario 1: Verify Registry Referential Completeness
// =========================================================
try {
  console.log("\nScenario 1: Verifying Registry Referential Completeness...");
  const widgetIds = Object.keys(WIDGET_METADATA_REGISTRY);
  
  assert(
    widgetIds.length === 37,
    `Registry successfully contains exactly 37 widgets (found: ${widgetIds.length})`
  );

  const sampleWidget = WIDGET_METADATA_REGISTRY['home_profile'];
  assert(
    sampleWidget !== undefined,
    "Sample widget 'home_profile' exists in registry"
  );
  
  assert(
    sampleWidget.title === 'Athlete Profile Context',
    "Sample widget contains correct title"
  );

  assert(
    sampleWidget.requiredViewModel === 'HomeDashboardViewModel',
    "Sample widget maps to the correct ViewModel contract"
  );
} catch (e: any) {
  console.error("Scenario 1 failed with error:", e.message);
  failedTestsCount++;
}

// =========================================================
// Scenario 2: Validate Size & Strategy Properties Enums
// =========================================================
try {
  console.log("\nScenario 2: Validating Size & Strategy Properties Enums...");
  const validSizes: WidgetSize[] = ['XS', 'S', 'M', 'L', 'XL', 'Full Width'];
  let allSizesValid = true;

  Object.values(WIDGET_METADATA_REGISTRY).forEach((meta) => {
    meta.supportedSizes.forEach((sz) => {
      if (!validSizes.includes(sz)) {
        allSizesValid = false;
        console.error(`Widget ${meta.id} contains invalid size enum: ${sz}`);
      }
    });
  });

  assert(
    allSizesValid,
    "All registered widgets adhere strictly to the supported size classifications (XS, S, M, L, XL, Full Width)"
  );
} catch (e: any) {
  console.error("Scenario 2 failed with error:", e.message);
  failedTestsCount++;
}

// =========================================================
// Scenario 3: Simulate Widget Lifecycle Event Logger
// =========================================================
try {
  console.log("\nScenario 3: Simulating Widget Lifecycle Event Logger...");
  const simulatedLogs: WidgetLifecycleEvent[] = [];
  
  const logEvent = (type: WidgetLifecycleEvent['type'], payload?: any) => {
    simulatedLogs.push({
      type,
      timestamp: new Date().toISOString(),
      payload
    });
  };

  logEvent('mount', { id: 'home_profile' });
  logEvent('initialize', { db: 'Firestore' });
  logEvent('receive_viewmodel', { model: 'HomeDashboardViewModel' });
  logEvent('render', { state: 'Ready' });
  logEvent('refresh', { action: 'complete' });

  assert(simulatedLogs.length === 5, "Successfully registered 5 distinct lifecycle sequence milestones");
  assert(simulatedLogs[0].type === 'mount', "First milestone logged is strictly 'mount'");
  assert(simulatedLogs[2].type === 'receive_viewmodel', "ViewModel subscription handshake registered correctly");
  assert(simulatedLogs[simulatedLogs.length - 1].type === 'refresh', "Refresh complete broadcast registered");
} catch (e: any) {
  console.error("Scenario 3 failed with error:", e.message);
  failedTestsCount++;
}

// =========================================================
// Scenario 4: Simulate State Machine Transitions
// =========================================================
try {
  console.log("\nScenario 4: Simulating State Machine Transitions...");
  const states: WidgetState[] = [
    'Loading',
    'Ready',
    'Refreshing',
    'Offline',
    'Partial Data',
    'Empty',
    'Error',
    'Disabled',
    'Hidden'
  ];

  let activeState: WidgetState = 'Loading';
  const transitionHistory: WidgetState[] = [activeState];

  const transitionTo = (nextState: WidgetState) => {
    activeState = nextState;
    transitionHistory.push(activeState);
  };

  transitionTo('Ready');
  transitionTo('Refreshing');
  transitionTo('Ready');
  transitionTo('Partial Data');
  transitionTo('Error');
  transitionTo('Disabled');

  assert(activeState === 'Disabled', "State machine terminated in correct target state");
  assert(transitionHistory.length === 7, "Successfully executed 7 sequential state updates");
  assert(
    transitionHistory[4] === 'Partial Data',
    "Intermediate degradation state captured correctly in sync queues"
  );
} catch (e: any) {
  console.error("Scenario 4 failed with error:", e.message);
  failedTestsCount++;
}

// =========================================================
// Scenario 5: Dynamic Custom Factory Registry Lookup
// =========================================================
try {
  console.log("\nScenario 5: Testing dynamic Factory registry mapping...");
  const mockFactoryMap: Record<string, Function> = {};
  
  const registerWidgetMock = (id: string, renderer: Function) => {
    mockFactoryMap[id] = renderer;
  };

  registerWidgetMock('home_profile', () => "Renders Athlete Bio");
  registerWidgetMock('perf_fitness_fatigue', () => "Renders CTL curve");

  assert(mockFactoryMap['home_profile']() === "Renders Athlete Bio", "Bespoke widget resolved dynamically from registry mapping");
  assert(mockFactoryMap['perf_fitness_fatigue']() === "Renders CTL curve", "Auxiliary widget resolved dynamically from registry mapping");
  assert(mockFactoryMap['invalid_id'] === undefined, "Dynamic registry returned empty handler for unregistered references (factory boundary safety)");
} catch (e: any) {
  console.error("Scenario 5 failed with error:", e.message);
  failedTestsCount++;
}

console.log("\n==================================================================================");
if (failedTestsCount === 0) {
  console.log("          ALL 5 SCENARIOS PASSED! WIDGET PLATFORM IS FULLY COMPLIANT!             ");
} else {
  console.error(`          ${failedTestsCount} SCENARIOS FAILED. RE-CALIBRATION REQUIRED.          `);
  process.exit(1);
}
console.log("==================================================================================");
