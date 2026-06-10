# Orphan List

This component renders the centralized list of orphan component groups.

It receives already-scanned group data from `App.vue`, displays status and counts, and emits the selected group id when the user chooses a row.

It should not scan the Figma document or replace instances directly. Those responsibilities belong to shared helpers called from the Figma runtime.

The root CSS class comes from `OrphanList.meta.js` and is currently `c-orphan-list`.
