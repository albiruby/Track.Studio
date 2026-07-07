import { VisualizationTheme } from '@/types/visualization';

export const SLATE_PALETTE = [
  '#0f172a', // Slate 900
  '#334155', // Slate 700
  '#475569', // Slate 600
  '#64748b', // Slate 500
  '#94a3b8', // Slate 400
  '#cbd5e1', // Slate 300
];

export const CONTRAST_PALETTE = [
  '#0284c7', // Sky 600
  '#0d9488', // Teal 600
  '#b45309', // Amber 700
  '#dc2626', // Red 600
  '#7c3aed', // Violet 600
  '#db2777', // Pink 600
];

export class VisualizationColorSystem {
  /**
   * Generates a fully compliant visualization theme based on a generic preset key
   */
  public static getTheme(preset: 'slate' | 'high-contrast'): VisualizationTheme {
    if (preset === 'high-contrast') {
      return {
        colors: {
          success: '#16a34a', // Green 600
          warning: '#ca8a04', // Yellow 600
          critical: '#dc2626', // Red 600
          neutral: '#4b5563', // Gray 600
          primary: '#0f172a', // Slate 900
          secondary: '#2563eb', // Blue 600
          palette: CONTRAST_PALETTE,
        },
        gridColor: '#e2e8f0', // Slate 200
        backgroundColor: '#ffffff',
      };
    }

    // Default Slate palette
    return {
      colors: {
        success: '#10b981', // Emerald 500
        warning: '#f59e0b', // Amber 500
        critical: '#ef4444', // Red 500
        neutral: '#6b7280', // Gray 500
        primary: '#1e293b', // Slate 800
        secondary: '#475569', // Slate 600
        palette: SLATE_PALETTE,
      },
      gridColor: '#f1f5f9', // Slate 100
      backgroundColor: '#ffffff',
    };
  }
}
