# Shared Helpers

This folder contains class-based helper modules shared across runtimes.

Current responsibilities:

- `translation.helper.js`: translates string keys and applies placeholders.
- `figma-node.helper.js`: reads common Figma node metadata such as page and path.
- `component-data.helper.js`: normalizes component and group data for UI consumption.
- `component-scanner.helper.js`: scans the Figma document for local components and orphan component groups.
- `component-replacer.helper.js`: selects, replaces, and auto-matches component instances.
- `figma-ui-messenger.helper.js`: wraps message passing between the iframe UI and the Figma runtime.
- `clipboard.helper.js`: wraps clipboard writes with a fallback for plugin iframe environments.

Keep helpers focused. If a helper starts handling multiple concerns, split it into a more specific helper rather than growing it into a catch-all.
