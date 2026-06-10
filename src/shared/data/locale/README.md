# Locale Data

This folder contains localization dictionaries.

`strings.locale.js` is the single source of truth for user-facing strings used by both the Vue UI and the Figma runtime notifications.

Add new keys here before using them through `TranslationHelper.translate(...)`. Prefer stable, namespaced keys with the `zcr_` prefix.
