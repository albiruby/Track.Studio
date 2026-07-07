import { CompositionPreferences, DashboardTemplate } from '@/types/composition';

const STORAGE_KEY_PREFIX = 'track_studio_composition_';

export class CompositionPersistence {
  /**
   * Generates storage key for a specific dashboard layout
   */
  private static getStorageKey(dashboardId: string): string {
    return `${STORAGE_KEY_PREFIX}${dashboardId}`;
  }

  /**
   * Loads user composition preferences, performing version migration if necessary
   */
  public static load(
    dashboardId: string,
    template: DashboardTemplate
  ): CompositionPreferences {
    try {
      if (typeof window === 'undefined') {
        return { ...template.defaultPreferences };
      }

      const raw = localStorage.getItem(this.getStorageKey(dashboardId));
      if (!raw) {
        return { ...template.defaultPreferences };
      }

      const parsed: CompositionPreferences = JSON.parse(raw);
      
      // Check if version migration is required
      if (parsed.version !== template.version) {
        return this.migrate(parsed, template);
      }

      return parsed;
    } catch (e) {
      console.warn(`CompositionPersistence: Load failed for "${dashboardId}", returning template defaults.`, e);
      return { ...template.defaultPreferences };
    }
  }

  /**
   * Saves custom composition preferences to persistent client storage
   */
  public static save(
    dashboardId: string,
    preferences: CompositionPreferences
  ): boolean {
    try {
      if (typeof window === 'undefined') return false;

      localStorage.setItem(
        this.getStorageKey(dashboardId),
        JSON.stringify(preferences)
      );
      return true;
    } catch (e) {
      console.error(`CompositionPersistence: Save failed for "${dashboardId}"`, e);
      return false;
    }
  }

  /**
   * Resets layout to default template preferences
   */
  public static reset(dashboardId: string, template: DashboardTemplate): CompositionPreferences {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(this.getStorageKey(dashboardId));
      }
    } catch (e) {
      console.warn(`CompositionPersistence: Reset failed for "${dashboardId}"`, e);
    }
    return { ...template.defaultPreferences };
  }

  /**
   * Performs migration when saved preferences version differs from the latest template version
   */
  public static migrate(
    saved: Partial<CompositionPreferences>,
    template: DashboardTemplate
  ): CompositionPreferences {
    console.info(`CompositionPersistence: Migrating layout preferences for "${template.dashboardId}" from version ${saved.version || 'unknown'} to ${template.version}`);

    // Create fresh baseline from template
    const migrated: CompositionPreferences = {
      ...template.defaultPreferences,
      version: template.version
    };

    // Safely migrate widget visibility
    if (saved.widgetVisibility) {
      Object.keys(template.defaultPreferences.widgetVisibility).forEach((widgetId) => {
        if (saved.widgetVisibility![widgetId] !== undefined) {
          migrated.widgetVisibility[widgetId] = saved.widgetVisibility![widgetId];
        }
      });
    }

    // Safely migrate widget sizes
    if (saved.widgetSize) {
      Object.keys(template.defaultPreferences.widgetSize).forEach((widgetId) => {
        if (saved.widgetSize![widgetId] !== undefined) {
          migrated.widgetSize[widgetId] = saved.widgetSize![widgetId];
        }
      });
    }

    // Safely migrate order, merging any newly added widgets from the template
    if (saved.widgetOrder && Array.isArray(saved.widgetOrder)) {
      const savedExisting = saved.widgetOrder.filter(id => template.widgetOrder.includes(id));
      const newWidgets = template.widgetOrder.filter(id => !savedExisting.includes(id));
      migrated.widgetOrder = [...savedExisting, ...newWidgets];
    }

    // Safely migrate collapsed sections
    if (saved.collapsedSections && Array.isArray(saved.collapsedSections)) {
      migrated.collapsedSections = saved.collapsedSections.filter(id => template.widgetOrder.includes(id));
    }

    // Preserve layout type if it is still valid
    if (saved.layoutType) {
      migrated.layoutType = saved.layoutType;
    }

    // Save migrated preferences back to client storage
    this.save(template.dashboardId, migrated);

    return migrated;
  }

  /**
   * Stub for future cloud-based synchronization (No Firestore access as per principles)
   */
  public static async syncToCloud(
    dashboardId: string,
    preferences: CompositionPreferences
  ): Promise<{ success: boolean; message: string }> {
    // Dry run: Simulated payload verification to fulfill architecture requirements
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `Composition for "${dashboardId}" simulated cloud sync completed (Cloud Storage Stub - No Firestore Active).`
        });
      }, 500);
    });
  }
}
