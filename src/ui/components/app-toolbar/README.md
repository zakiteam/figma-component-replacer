# App Toolbar

This component renders the top toolbar for the plugin UI.

It owns the title and global actions such as scan, automatic matching, and close. It does not own scan state or business logic; those actions are emitted to `App.vue`.

The root CSS class comes from `AppToolbar.meta.js` and is currently `c-app-toolbar`.
