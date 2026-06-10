# UI Components

This folder contains Vue UI components.

Each component should live in its own folder and follow this structure:

```txt
component-name/
  ComponentName.vue
  ComponentName.meta.js
  style/
    ComponentName.css
```

Component styles should use BEM class names with a `.c-` prefix, using the class name from the component metadata as the block name.
