import { VisualizationFormatter } from '../formatter';
import { AxisEngine } from '../axis-engine';
import { TooltipEngine } from '../tooltip-engine';
import { LegendEngine } from '../legend-engine';
import { VISUALIZATION_REGISTRY } from '../registry';
import { VisualizationBuilder } from '../builder';
import { VisualizationColorSystem } from '../color-system';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('TRACK.STUDIO — PHASE 14 VISUALIZATION TEST SUITE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// =========================================================
// 1. FORMATTER TESTS
// =========================================================
function runFormatterTests() {
  console.log('\n[1/8] RUNNING FORMATTER LIBRARY TESTS...');

  // Distance
  assert(VisualizationFormatter.format(10000, 'distance') === '10.00 km', '10000 meters formats to 10.00 km');
  assert(VisualizationFormatter.format(1609.34, 'distance', 'miles') === '1.00 mi', '1609.34 meters formats to 1.00 mi');

  // Duration
  assert(VisualizationFormatter.format(3665, 'duration') === '1:01:05', '3665 seconds formats to 1:01:05');
  assert(VisualizationFormatter.format(45, 'duration') === '0:45', '45 seconds formats to 0:45');

  // Pace
  assert(VisualizationFormatter.format(4.1667, 'pace') === '4:00 /km', '4.1667 m/s formats to 4:00 /km pace');
  assert(VisualizationFormatter.format(4.4704, 'pace', 'miles') === '6:00 /mi', '4.4704 m/s formats to 6:00 /mi pace');

  // Power & Cadence
  assert(VisualizationFormatter.format(285.4, 'power') === '285 W', '285.4 watts formats to 285 W');
  assert(VisualizationFormatter.format(92.1, 'cadence') === '92 rpm', '92.1 rpm formats to 92 rpm');
}

// =========================================================
// 2. AXIS TESTS
// =========================================================
function runAxisTests() {
  console.log('\n[2/8] RUNNING AXIS ENGINE TESTS...');

  const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const linearAxis = AxisEngine.generateAxis('score', 'linear', 'Score Value', values, { tickDensity: 'medium' });

  assert(linearAxis.min === 10, 'Linear Axis identifies minimum limit: 10');
  assert(linearAxis.max === 100, 'Linear Axis identifies maximum limit: 100');
  assert(linearAxis.ticks!.length === 5, 'Medium density generates exactly 5 ticks');
  assert(linearAxis.ticks![0] === 10, 'First tick matches min value');
  assert(linearAxis.ticks![4] === 100, 'Last tick matches max value');
}

// =========================================================
// 3. TOOLTIP TESTS
// =========================================================
function runTooltipTests() {
  console.log('\n[3/8] RUNNING TOOLTIP ENGINE TESTS...');

  const items = [
    { key: 'ctl', label: 'CTL', value: 85, formattedValue: '85', color: '#000' },
    { key: 'tsb', label: 'TSB', value: 5, formattedValue: '5', color: '#fff' }
  ];

  const tooltip = TooltipEngine.compile('Active Stats', items, { mode: 'comparison' });
  assert(tooltip.title === 'Active Stats', 'Tooltip retains title correctly');
  assert(tooltip.items.length === 2, 'Tooltip items match compiled count');
  assert(tooltip.accessibleLabel.includes('Comparing'), 'Tooltip compiles compared accessible description labels');
}

// =========================================================
// 4. LEGEND TESTS
// =========================================================
function runLegendTests() {
  console.log('\n[4/8] RUNNING LEGEND ENGINE TESTS...');

  const items = [
    { key: 'b_key', label: 'Beta Series', color: '#111' },
    { key: 'a_key', label: 'Alpha Series', color: '#222' }
  ];

  const sortedLegend = LegendEngine.buildLegend(items, { sortBy: 'label' });
  assert(sortedLegend.items[0].key === 'a_key', 'Alphabetical sorting places Alpha Series at index 0');
  assert(sortedLegend.items[1].key === 'b_key', 'Alphabetical sorting places Beta Series at index 1');
}

// =========================================================
// 5. ACCESSIBILITY TESTS
// =========================================================
function runAccessibilityTests() {
  console.log('\n[5/8] RUNNING ACCESSIBILITY COMPLIANCE TESTS...');

  const mockData = [{ date: '2026-07-01', ctl: 70, atl: 65, tsb: 5 }];
  const model = VisualizationBuilder.build('perf-trend', mockData, {
    xAxisKey: 'date',
    xAxisLabel: 'Date',
    xAxisScale: 'time',
    yAxisKey: 'ctl',
    yAxisLabel: 'Fitness Score',
    yAxisScale: 'linear',
    seriesKeys: [{ key: 'ctl', label: 'CTL' }]
  });

  assert(model.accessibility.ariaLabel.includes('perf-trend'), 'Accessible helper label mentions active registration id');
  assert(model.accessibility.alternativeData.length === 1, 'Alternative reader table holds tabular data');
}

// =========================================================
// 6. RESPONSIVE TESTS
// =========================================================
function runResponsiveTests() {
  console.log('\n[6/8] RUNNING RESPONSIVE DENSITY TESTS...');

  const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const denseAxis = AxisEngine.generateAxis('month', 'categorical', 'Months', categories, { tickDensity: 'low' });

  assert(denseAxis.ticks!.length < categories.length, 'Low density scale drops ticks to prevent overflow on tight viewports');
  assert(denseAxis.ticks![denseAxis.ticks!.length - 1] === 'Dec', 'Low density scale preserves the final boundary ticks label');
}

// =========================================================
// 7. REGISTRY TESTS
// =========================================================
function runRegistryTests() {
  console.log('\n[7/8] RUNNING VISUAL REGISTRY INTEGRITY TESTS...');

  const keys = Object.keys(VISUALIZATION_REGISTRY);
  assert(keys.length >= 5, 'Visualization Registry contains baseline widgets metrics configurations');
  
  keys.forEach((k) => {
    const r = VISUALIZATION_REGISTRY[k];
    assert(r.id === k, `Registry ID matches key: ${k}`);
    assert(r.requiredFields.length > 0, `Registry "${k}" lists required fields`);
  });
}

// =========================================================
// 8. SERIALIZATION TESTS
// =========================================================
function runSerializationTests() {
  console.log('\n[8/8] RUNNING STATE SERIALIZATION TESTS...');

  const mockData = [{ date: '2026-07-01', ctl: 70, atl: 65, tsb: 5 }];
  const model = VisualizationBuilder.build('perf-trend', mockData, {
    xAxisKey: 'date',
    xAxisLabel: 'Date',
    xAxisScale: 'time',
    yAxisKey: 'ctl',
    yAxisLabel: 'Fitness Score',
    yAxisScale: 'linear',
    seriesKeys: [{ key: 'ctl', label: 'CTL' }]
  });

  const serialized = JSON.stringify(model);
  const parsed = JSON.parse(serialized);

  assert(parsed.id === 'perf-trend', 'Model serializes and parses cleanly without data loss');
}

// Run test routines
try {
  runFormatterTests();
  runAxisTests();
  runTooltipTests();
  runLegendTests();
  runAccessibilityTests();
  runResponsiveTests();
  runRegistryTests();
  runSerializationTests();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`TEST SUITE OVERVIEW:`);
  console.log(`  PASSED: ${passCount}`);
  console.log(`  FAILED: ${failCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
} catch (e) {
  console.error('Fatal execution crash inside visualization tests:', e);
  process.exit(1);
}
