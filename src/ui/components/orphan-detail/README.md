# Orphan Detail

This component renders details and replacement controls for the selected orphan component group.

It owns local UI state for filtering replacement components and selecting the target component id. It emits user actions such as copy name, select instances, and replace.

It should not perform Figma mutations directly. Replacement requests are emitted to `App.vue`, then sent to the Figma runtime.

The root CSS class comes from `OrphanDetail.meta.js` and is currently `c-orphan-detail`.
