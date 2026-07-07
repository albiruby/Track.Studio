import { DashboardTemplateRegistry } from '../template-registry';
import { LayoutResolver, ResponsiveLayoutResolver } from '../layout-resolver';
import { WidgetResolver } from '../widget-resolver';
import { CompositionPersistence } from '../persistence';
import { DashboardCompositionEngine } from '../engine';
import { DashboardTemplate, CompositionPreferences, Breakpoint } from '@/types/composition';

// Mock simple environment for localStorage inside Node.js CLI testing
if (typeof window === 'undefined') {
  const store: Record<string, string> = {};
  (global as any).window = {};
  (global as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

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
console.log('TRACK.STUDIO — PHASE 13 COMPOSITION ENGINE TEST SUITE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// =========================================================
// 1. REGISTRY INTEGRITY TESTS
// =========================================================
function runRegistryTests() {
  console.log('\n[1/5] RUNNING TEMPLATE REGISTRY TESTS...');
  
  const templateKeys = Object.keys(DashboardTemplateRegistry);
  assert(templateKeys.length === 15, `DashboardTemplateRegistry must define exactly 15 templates (found: ${templateKeys.length})`);
  
  templateKeys.forEach((id) => {
    const template = DashboardTemplateRegistry[id];
    assert(!!template, `Template with ID "${id}" is defined`);
    assert(template.dashboardId === id, `Template dashboardId matches key ID: ${id}`);
    assert(!!template.layoutType, `Template "${id}" has layoutType: ${template.layoutType}`);
    assert(template.widgetOrder.length > 0, `Template "${id}" defines at least 1 widget`);
    assert(template.responsiveRules.length > 0, `Template "${id}" specifies responsive bounds`);
    assert(template.version === '1.0.0' || template.version === '0.1.0', `Template version format valid: ${template.version}`);
  });
}

// =========================================================
// 2. RESPONSIVE BREAKPOINT & SCALING TESTS
// =========================================================
function runResponsiveTests() {
  console.log('\n[2/5] RUNNING RESPONSIVE & GRID SCALING TESTS...');

  // Breakpoint matching
  assert(ResponsiveLayoutResolver.resolveBreakpoint(1920) === 'ultra-wide', 'Width 1920 matches ultra-wide breakpoint');
  assert(ResponsiveLayoutResolver.resolveBreakpoint(1400) === 'desktop', 'Width 1400 matches desktop breakpoint');
  assert(ResponsiveLayoutResolver.resolveBreakpoint(900) === 'tablet', 'Width 900 matches tablet breakpoint');
  assert(ResponsiveLayoutResolver.resolveBreakpoint(450) === 'mobile', 'Width 450 matches mobile breakpoint');

  // Widget downscaling limits
  assert(ResponsiveLayoutResolver.scaleWidgetSize('L', 1) === 'Full Width', 'L size downscales to Full Width on 1-col layouts');
  assert(ResponsiveLayoutResolver.scaleWidgetSize('XL', 1) === 'Full Width', 'XL size downscales to Full Width on 1-col layouts');
  assert(ResponsiveLayoutResolver.scaleWidgetSize('L', 2) === 'Full Width', 'L size downscales to Full Width on 2-col layouts');
  assert(ResponsiveLayoutResolver.scaleWidgetSize('S', 2) === 'S', 'S size remains unchanged on 2-col layouts');
  assert(ResponsiveLayoutResolver.scaleWidgetSize('XL', 4) === 'XL', 'XL size remains unchanged on 4-col layouts');
}

// =========================================================
// 3. LAYOUT RESOLVER TESTS
// =========================================================
function runLayoutTests() {
  console.log('\n[3/5] RUNNING LAYOUT RESOLVER MOUNT TESTS...');

  const template = DashboardTemplateRegistry['dashboard'];
  assert(!!template, 'Primary home dashboard template fetched');

  // Resolve standard layout
  const resolvedDesktop = LayoutResolver.resolve(template, null, 1200);
  assert(resolvedDesktop.breakpoint === 'desktop', 'Resolved desktop breakpoint for width 1200');
  assert(resolvedDesktop.cols === 4, 'Resolved columns: 4');
  assert(resolvedDesktop.widgets.length === template.widgetOrder.length, 'Resolved widget count matches template');
  assert(resolvedDesktop.widgets[0].isVisible === true, 'Default widgets resolved as visible');

  // Resolve mobile layout
  const resolvedMobile = LayoutResolver.resolve(template, null, 400);
  assert(resolvedMobile.breakpoint === 'mobile', 'Resolved mobile breakpoint for width 400');
  assert(resolvedMobile.cols === 1, 'Resolved columns: 1');
  assert(resolvedMobile.widgets[0].size === 'Full Width', 'Widget scale constrained to Full Width on mobile viewport');
}

// =========================================================
// 4. PERSISTENCE & CACHING TESTS
// =========================================================
function runPersistenceTests() {
  console.log('\n[4/5] RUNNING STORAGE PERSISTENCE TESTS...');

  const template = DashboardTemplateRegistry['dashboard'];
  
  // Save preferences
  const customPrefs: CompositionPreferences = {
    widgetOrder: [...template.widgetOrder].reverse(), // Inverted sequence
    widgetVisibility: { [template.widgetOrder[0]]: false }, // Hide first widget
    widgetSize: { [template.widgetOrder[0]]: 'XL' },
    layoutType: 'grid',
    collapsedSections: ['test_collapsed'],
    version: template.version
  };

  const saveResult = CompositionPersistence.save('dashboard', customPrefs);
  assert(saveResult === true, 'Successfully saved custom composition preferences to localStorage');

  // Load preferences
  const loaded = CompositionPersistence.load('dashboard', template);
  assert(loaded.layoutType === 'grid', 'Loaded preferences preserve layoutType override: grid');
  assert(loaded.widgetOrder[0] === template.widgetOrder[template.widgetOrder.length - 1], 'Loaded preferences preserve inverted ordering sequence');
  assert(loaded.widgetVisibility[template.widgetOrder[0]] === false, 'Loaded preferences preserve custom visibility flag (false)');
  assert(loaded.collapsedSections.includes('test_collapsed'), 'Loaded preferences preserve collapsed sections list');

  // Reset preferences
  const resetPrefs = CompositionPersistence.reset('dashboard', template);
  assert(resetPrefs.widgetVisibility[template.widgetOrder[0]] === true, 'Resetting purges customizations and restores template visibility');
}

// =========================================================
// 5. MIGRATION & SCHEMAS TESTS
// =========================================================
function runMigrationTests() {
  console.log('\n[5/5] RUNNING VERSION SCHEMA MIGRATION TESTS...');

  const template = DashboardTemplateRegistry['dashboard'];

  const stalePrefs: Partial<CompositionPreferences> = {
    widgetOrder: [template.widgetOrder[0]], // Saved layout is missing new widgets
    widgetVisibility: { [template.widgetOrder[0]]: false },
    widgetSize: { [template.widgetOrder[0]]: 'S' },
    layoutType: 'bento',
    collapsedSections: [],
    version: '0.1.0' // Older version flag
  };

  // Perform migration
  const migrated = CompositionPersistence.migrate(stalePrefs, template);
  
  assert(migrated.version === template.version, `Preferences version successfully upgraded to latest: ${template.version}`);
  assert(migrated.widgetVisibility[template.widgetOrder[0]] === false, 'Stale layout visibility rules are preserved post-migration');
  assert(migrated.widgetOrder.length === template.widgetOrder.length, 'Missing/new widgets defined in latest template are cleanly appended');
  assert(migrated.widgetOrder.includes(template.widgetOrder[1]), 'Appended new widgets exist in migrated sequence');
}

// Run test routines
try {
  runRegistryTests();
  runResponsiveTests();
  runLayoutTests();
  runPersistenceTests();
  runMigrationTests();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`TEST COMPILATION OVERVIEW:`);
  console.log(`  PASSED: ${passCount}`);
  console.log(`  FAILED: ${failCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
} catch (e) {
  console.error('Fatal execution crash inside composition tests:', e);
  process.exit(1);
}
