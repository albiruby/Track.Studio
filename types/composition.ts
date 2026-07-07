import { WidgetSize } from './widget';

export type LayoutType =
  | 'grid'
  | 'split'
  | 'stack'
  | 'bento'
  | 'single-column'
  | 'two-column'
  | 'three-column'
  | 'responsive-auto'
  | 'future-custom-layout';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'ultra-wide';

export interface ResponsiveRule {
  breakpoint: Breakpoint;
  minWidth: number;
  maxWidth?: number;
  cols: number;
  widgetSizes?: Record<string, WidgetSize>;
  visibilityOverride?: Record<string, boolean>;
}

export interface CompositionPreferences {
  widgetOrder: string[];
  widgetVisibility: Record<string, boolean>;
  widgetSize: Record<string, WidgetSize>;
  layoutType: LayoutType;
  collapsedSections: string[];
  version: string;
}

export interface DashboardTemplate {
  dashboardId: string;
  layoutType: LayoutType;
  gridDefinition: {
    cols: number;
    gap: string;
    autoFlow?: string;
  };
  widgetOrder: string[];
  widgetVisibility: Record<string, boolean>;
  widgetSize: Record<string, WidgetSize>;
  responsiveRules: ResponsiveRule[];
  minWidth?: number;
  maxWidth?: number;
  collapsedSections?: string[];
  defaultPreferences: CompositionPreferences;
  version: string;
}

export interface ResolvedWidget {
  id: string;
  size: WidgetSize;
  isVisible: boolean;
  orderIndex: number;
  isCollapsed: boolean;
}

export interface ResolvedLayout {
  dashboardId: string;
  layoutType: LayoutType;
  cols: number;
  gap: string;
  widgets: ResolvedWidget[];
  breakpoint: Breakpoint;
}
