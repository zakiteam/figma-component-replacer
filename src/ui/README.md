# UI Runtime

This folder contains the Vue application that runs inside the Figma plugin iframe.

The UI is responsible for rendering state, collecting user intent, and sending messages to the Figma runtime through `FigmaUiMessengerHelper`.

The UI should not access Figma document nodes directly. Requests that need Figma data should be sent to `src/figma/boot.js`, which delegates to shared helpers and replies with `figma.ui.postMessage(...)`.
