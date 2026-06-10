# Shared

This folder contains code and data shared by the Figma runtime and the Vue UI runtime.

Shared modules should be class-based or plain data modules, with no direct Vue component dependencies. If a helper needs to interact with Figma, pass the Figma API object into the helper instead of importing or assuming globals where possible.

This folder is the right place for domain logic, translation utilities, component mapping logic, and data that must stay consistent across runtimes.
