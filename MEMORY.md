<state_snapshot>
  <planning>
    <overall_goal>
      Maintain the Halloween BONK! theme while providing a hidden, secure developer utility for project file inspection and extraction.
    </overall_goal>

    <active_constraints>
      - Portrait orientation with safe-area handling.
      - HTML5 Canvas 2D rendering with offscreen caching.
      - Ranked eligibility latched at round start.
      - Developer utility must remain invisible to normal users.
      - Secret trigger: 10 taps on "Tuning" title within 8 seconds, password "gg".
      - No runtime filesystem access; use build-time Vite manifest.
    </active_constraints>

    <task_state>
      1. [DONE] Implement build-time manifest generation plugin.
      2. [DONE] Create file viewer components (list, preview, search, tree).
      3. [DONE] Implement secret trigger and password gating in Settings.
      4. [DONE] Integrate lazy-loading for developer utility.
    </task_state>
  </planning>

  <engineering>
    <key_knowledge>
      - Project manifest is generated at build time via `vite.config.ts` and exposed as `virtual:project-file-manifest`.
      - Developer viewer is lazy-loaded via `React.lazy` to avoid bundle bloat.
      - Secret trigger uses `performance.now()` and a rolling 8-second window for tap detection.
      - File viewer supports two search modes: NAMES ONLY and NAMES + CONTENT.
      - Clipboard operations include a fallback to a hidden textarea for compatibility.
    </key_knowledge>

    <artifact_trail>
      - vite.config.ts: Added `projectFileManifestPlugin` to scan and index project files.
      - src/ui/SettingsPanel.tsx: Attached secret tap listener to the "Tuning" title.
      - src/components/ProjectFileViewer.tsx: Created main UI for file searching, selection, and management.
      - src/components/DevUnlockOverlay.tsx: Added password gate for developer access.
      - src/dev/projectFileDiscovery.ts: Added logic for searching and content indexing.
    </artifact_trail>

    <file_system_state>
      - CREATED: src/types/projectFiles.ts, src/types/virtual-project-file-manifest.d.ts, src/dev/projectFileDiscovery.ts, src/dev/projectTree.ts, src/components/ProjectFileViewer.tsx, src/components/ProjectFilePreview.tsx, src/components/DevUnlockOverlay.tsx
      - MODIFIED: vite.config.ts, src/ui/SettingsPanel.tsx
    </file_system_state>

    <recent_actions>
      - write_file src/types/projectFiles.ts → defined manifest types
      - write_file src/dev/projectFileDiscovery.ts → implemented search and copy helpers
      - write_file src/components/ProjectFileViewer.tsx → created main viewer UI
      - replace_file_content vite.config.ts → added project manifest plugin
      - replace_file_content src/ui/SettingsPanel.tsx → added secret tap trigger
    </recent_actions>
  </engineering>
</state_snapshot>