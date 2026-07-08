/**
 * Track.Studio — Widget Library Runtime
 * Core registration and resolution engine for actual widget React components and their lifecycles.
 */

import React from 'react';
import { CatalogEntry, WidgetCatalog } from './catalog';
import { WidgetValidation, ValidationResult } from './validation';

export interface WidgetRenderProps {
  widgetId: string;
  viewModel?: any;
  visualizationModel?: any;
}

export type WidgetComponent = React.ComponentType<WidgetRenderProps>;

export interface WidgetDefinition {
  widgetId: string;
  component: WidgetComponent;
  validate?: (viewModel: any) => ValidationResult;
}

export class WidgetLibrary {
  private static registeredComponents: Record<string, WidgetDefinition> = {};

  /**
   * Registers a widget component and its verification triggers
   */
  public static registerWidget(definition: WidgetDefinition): void {
    this.registeredComponents[definition.widgetId] = definition;
  }

  /**
   * Resolves a registered widget definition by ID
   */
  public static getWidget(widgetId: string): WidgetDefinition | null {
    return this.registeredComponents[widgetId] || null;
  }

  /**
   * Lists all registered custom widget components
   */
  public static getRegisteredIds(): string[] {
    return Object.keys(this.registeredComponents);
  }

  /**
   * Validates ViewModel input for a widget, falling back to default validation
   */
  public static validateViewModel(widgetId: string, viewModel: any): ValidationResult {
    const def = this.getWidget(widgetId);
    if (def && def.validate) {
      return def.validate(viewModel);
    }
    // Fall back to general validation engine
    return WidgetValidation.validate(widgetId, viewModel);
  }

  /**
   * Retrieves catalog info + component registration in one package
   */
  public static resolve(widgetId: string): {
    catalog: CatalogEntry | null;
    definition: WidgetDefinition | null;
  } {
    return {
      catalog: WidgetCatalog.getEntry(widgetId),
      definition: this.getWidget(widgetId)
    };
  }
}
