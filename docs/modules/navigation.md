# Track.Studio — Navigation System Documentation

This document describes the design, keybindings, and accessibility controls of the **Track.Studio Navigation & Sidebar System**.

---

## 1. Sidebar Collapsible State
The Navigation Sidebar supports two adaptive modes:
- **Expanded (Default)**: Full labels, active category groupings, search markers, and favorite toggles.
- **Collapsed**: Compact, icon-only layout to maximize screen estate for complex charts. Hovering over icons shows high-contrast tooltip overlays.

---

## 2. Favorites System
Any core navigation link (e.g. Performance, Heart Rate, Equipment) can be "favorited":
- Favoriting a link adds a duplicate high-priority shortcut link to the "Favorites" section at the top of the sidebar.
- State is preserved inside the Workspace Provider and triggers localized toast alerts.

---

## 3. Keyboard Navigation & Accessibility
The navigation sidebar implements rigorous accessibility constraints:
- **Tab Targetting**: The sidebar is focusable via `tabIndex={0}`.
- **Arrow Keys**: Pressing `ArrowDown` and `ArrowUp` inside the active sidebar moves a visual ring between navigation items.
- **Enter/Space**: Pressing `Enter` or `Space` on a focused item triggers instant route redirection.

---

## 4. Responsive Mobile Drawer
On viewport widths `< 768px`, the sidebar translates off-screen:
- A compact Hamburger button appears in the Top Bar.
- Activating the Hamburger slides out a smooth, touch-friendly navigation drawer.
- Backdrop blur and Esc-closability are fully supported.
