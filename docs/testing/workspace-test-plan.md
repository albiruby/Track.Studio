# Track.Studio — Workspace Framework Test Plan

This document defines the functional validation scripts for the Track.Studio workspace layouts and shell integrations.

---

## 1. Test Suite: Keyboard Shortcuts & Focus
| Test Case ID | Action | Expected Output | Status |
|---|---|---|---|
| TC-KB-01 | Press `Ctrl + /` anywhere on screen | Primary sidebar toggles between Expanded and Collapsed states. | Pass |
| TC-KB-02 | Press `Ctrl + K` anywhere on screen | Command Palette modal slides open, automatically focusing input. | Pass |
| TC-KB-03 | Press `Esc` inside Command Palette or Dropdown | Modal or active dropdown immediately closes. | Pass |
| TC-KB-04 | Press `ArrowDown` inside Command Palette search results | Highlights the next command in the list with a high-contrast ring. | Pass |

---

## 2. Test Suite: Active State Synchronization
| Test Case ID | Action | Expected Output | Status |
|---|---|---|---|
| TC-SYNC-01 | Click "Sync Feeds" in Top Bar | Webhook sync begins. Status changes to "Syncing (10%)". Progress bar pulses. | Pass |
| TC-SYNC-02 | Wait 2 seconds for Sync Completion | Recovers with "Success" toast, triggers new workout notification inside bell. | Pass |
| TC-ATH-01 | Click "John Runner" in Athlete Selector, choose "Sarah Pace" | Context updates. Success toast appears; main content area registers profile update. | Pass |

---

## 3. Test Suite: Notification Center Integration
| Test Case ID | Action | Expected Output | Status |
|---|---|---|---|
| TC-NOTIF-01 | Click notification bell icon in Top Bar | Slidout overlay renders all Warning, Critical, and Ingestion alerts. | Pass |
| TC-NOTIF-02 | Click "Mark read" on individual alert | Alert updates to read state; unread indicator counter decrements. | Pass |
| TC-NOTIF-03 | Click "Purge all alerts" in dropdown footer | Notifications list empties; renders elegant "Clear of notifications" state. | Pass |

---

## 4. Test Suite: Special Layout Validations
| Test Case ID | Target Layout | Action / Simulation | Expected Outcome |
|---|---|---|---|
| TC-LY-01 | Offline Layout | Toggle connection retry button | Triggers "Pinging Ingestion Channels" loading spinner and network heartbeat. |
| TC-LY-02 | Empty Workspace | Checkbox interaction on milestones | Toggles task complete state, updates "tasks remaining" status indicator. |
| TC-LY-03 | Error Layout | Render with mock diagnostics prop | Diagnostic panel displays scrollable stack trace box. |
