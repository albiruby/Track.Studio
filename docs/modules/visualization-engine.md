# Visualization Engine

The Visualization Engine is a core orchestration layer in Track.Studio responsible for transforming analytical ViewModels into highly structured, presentation-ready Visualization Models. Following performance design principles, this engine is purely mathematical, side-effect free, and performs no scientific calculations or database requests.

```
+-----------------------------------+
|            ViewModel              | (Strongly typed query payloads)
+-----------------+-----------------+
                  |
                  v
+-----------------+-----------------+
|       VisualizationBuilder        | (Synthesizes presentation options)
+-----------------+-----------------+
                  |
                  v
+-----------------+-----------------+
|        VisualizationModel         | (Final, static presentation model)
+--------+-----------------+--------+
         |                 |
         v                 v
+--------+--------+  +-----+--------+
|  Chart Adapter  |  | Accessibility| (Screen reader tables)
+--------+--------+  +-----+--------+
         |                 |
         v                 v
+--------+--------+  +-----+--------+
| Chart Renderer  |  | Accessible UI|
+-----------------+  +--------------+
```

## Key Capabilities

1. **Strict Decoupling**: Ensures view rendering logic has absolutely zero knowledge of physical database structures or raw formula heuristics.
2. **Accessible High-Contrast Styles**: Forces charts to use semantic palettes that conform with contrast thresholds.
3. **Screen Reader alternative representation**: Auto-generates readable, raw tabular accessibility matrices mirroring raw canvas plots.
4. **Adaptive Scaling Limits**: Constrains axis intervals and tick marks relative to the current physical responsive box coordinates.
