# Source

This folder contains the source files used to build the Figma plugin.

The code is split by runtime:

- `figma`: code that runs in the Figma Plugin API main context.
- `ui`: Vue code that runs inside the plugin iframe.
- `shared`: framework-neutral helpers and data used by both runtimes.

Keep runtime-specific side effects inside their owning folder. Shared code should stay free of UI assumptions and should only touch Figma APIs when the API object is passed in explicitly.
