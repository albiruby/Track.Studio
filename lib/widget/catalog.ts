/**
 * Track.Studio — Widget Catalog
 * Consolidates metadata, capabilities, contracts, and documentation into a single searchable entity.
 */

import { WIDGET_REGISTRY } from '@/lib/dashboard/registry';
import { WidgetRegistryEntry } from '@/types/dashboard';
import { WidgetCapabilities, WIDGET_CAPABILITIES_REGISTRY } from './capabilities';
import { WidgetDocEntry, WIDGET_DOCUMENTATION_REGISTRY } from './documentation';

export interface CatalogEntry {
  id: string;
  metadata: WidgetRegistryEntry;
  capabilities: WidgetCapabilities;
  documentation?: WidgetDocEntry;
}

export class WidgetCatalog {
  private static catalog: Record<string, CatalogEntry> = {};

  /**
   * Generates the consolidated catalog from separate registries on load
   */
  static {
    Object.keys(WIDGET_REGISTRY).forEach((id) => {
      const metadata = WIDGET_REGISTRY[id];
      const capabilities = WIDGET_CAPABILITIES_REGISTRY[id] || {
        widgetId: id,
        supportedSizes: ['M'],
        isResizable: false,
        isZoomable: false,
        supportedExports: [],
        interactiveFeatures: {
          tooltips: false,
          zoneFiltering: false,
          metricToggles: false,
          fullscreenZoom: false
        },
        offlineAvailability: 'unavailable'
      };
      const documentation = WIDGET_DOCUMENTATION_REGISTRY[id];

      this.catalog[id] = {
        id,
        metadata,
        capabilities,
        documentation
      };
    });
  }

  /**
   * Retrieves a catalog entry by ID
   */
  public static getEntry(id: string): CatalogEntry | null {
    return this.catalog[id] || null;
  }

  /**
   * Retrieves all catalog entries
   */
  public static getAllEntries(): CatalogEntry[] {
    return Object.values(this.catalog);
  }

  /**
   * Filters entries by category or capability
   */
  public static search(query: string): CatalogEntry[] {
    const term = query.toLowerCase();
    return this.getAllEntries().filter(
      (entry) =>
        entry.id.includes(term) ||
        entry.metadata.name.toLowerCase().includes(term) ||
        entry.metadata.description.toLowerCase().includes(term)
    );
  }
}
