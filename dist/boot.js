(() => {
  // src/shared/helpers/figma-node.helper.js
  var FigmaNodeHelper = class _FigmaNodeHelper {
    static isInstance(node) {
      return node.type === "INSTANCE";
    }
    static isComponent(node) {
      return node.type === "COMPONENT";
    }
    static getPageNode(node) {
      let current = node;
      while (current && current.type !== "PAGE") {
        current = current.parent;
      }
      return current || null;
    }
    static getPageName(node) {
      const page = _FigmaNodeHelper.getPageNode(node);
      return page ? page.name : "Unknown page";
    }
    static getNodePath(node) {
      const names = [];
      let current = node;
      while (current && current.type !== "DOCUMENT") {
        names.unshift(current.name);
        current = current.parent;
      }
      return names.join(" / ");
    }
  };

  // src/shared/data/locale/strings.locale.js
  var strings_locale_default = {
    en: {
      zcr_app_title: "Z Component Replacer",
      zcr_auto_match: "Auto match",
      zcr_scan: "Scan",
      zcr_close: "Close",
      zcr_scanning: "Scanning...",
      zcr_auto_replace_in_progress: "Automatic replacement in progress...",
      zcr_loading_plugin: "Preparing plugin...",
      zcr_loading_scan: "Scanning document...",
      zcr_loading_replace: "Replacing components...",
      zcr_loading_auto_replace: "Replacing exact name matches...",
      zcr_filter_orphans_placeholder: "Filter orphan components",
      zcr_summary: "{groups} groups - {instances} instances - {localComponents} local components",
      zcr_no_filter_results: "No results for this filter.",
      zcr_no_orphans_found: "No orphan components found.",
      zcr_orphan_missing_component: "Orphan: missing component",
      zcr_orphan_external_library: "Orphan: external library",
      zcr_instances_count: "{count} instances - {page}",
      zcr_select_orphan_empty: "Select an orphan component from the list.",
      zcr_status_label: "Status",
      zcr_instances_label: "Instances",
      zcr_example_label: "Example",
      zcr_replace_with_local_component: "Replace with local component",
      zcr_search_local_component_placeholder: "Search local component",
      zcr_choose_component: "Choose a component...",
      zcr_missing_main_component_warning: "This group contains instances with a missing main component. Figma may not be able to replace all of them.",
      zcr_copy_name: "Copy name",
      zcr_select_instances: "Select instances",
      zcr_replace_all: "Replace all",
      zcr_replacement_note: "The replacement is applied to all centralized instances in this group.",
      zcr_component_option: "{name} - {page}",
      zcr_missing_main_component_name: "Instance without main component",
      zcr_external_library: "External library",
      zcr_missing_component: "Missing component",
      zcr_group_not_found: "Group not found. Run the scan again.",
      zcr_no_selectable_instances: "No selectable instances in this group.",
      zcr_instance_page_not_found: "Could not find the instance page.",
      zcr_selected_instances_on_page: "Selected {count} instances on page {page}.",
      zcr_replacement_unavailable: "Replacement is not available. Run the scan again.",
      zcr_replaced_instances: "Replaced {count} instances.",
      zcr_replaced_instances_with_failures: "Replaced {count} instances, {failed} failed.",
      zcr_auto_replace_result: "Auto: {replaced} instances replaced, {unmatchedGroups} groups without a match, {ambiguousGroups} ambiguous."
    }
  };

  // src/shared/helpers/translation.helper.js
  function getAppLocale() {
    if (typeof window !== "undefined" && window.ZComponentReplacer && window.ZComponentReplacer.locale) {
      return window.ZComponentReplacer.locale;
    }
    if (typeof navigator !== "undefined" && navigator.language) {
      return navigator.language.split("-")[0];
    }
    return "en";
  }
  function getLocalizationOverride(strings) {
    if (typeof window === "undefined" || !window.ZComponentReplacer) {
      return strings;
    }
    return window.ZComponentReplacer.localization || strings;
  }
  var TranslationHelper = class _TranslationHelper {
    constructor(translation) {
      _TranslationHelper.translation = translation;
    }
    static translate(key, placeholders = {}, activeLang = getAppLocale()) {
      const strings = getLocalizationOverride(_TranslationHelper.translation || strings_locale_default);
      const language = strings[activeLang] ? activeLang : "en";
      try {
        if (!strings[language] || strings[language][key] === void 0) {
          return key;
        }
        let translatedString = strings[language][key];
        for (const placeholder in placeholders) {
          if (Object.prototype.hasOwnProperty.call(placeholders, placeholder)) {
            const value = placeholders[placeholder];
            const singleBraceRegex = new RegExp("\\{" + placeholder + "\\}", "g");
            const doubleBraceRegex = new RegExp("\\{\\{" + placeholder + "\\}\\}", "g");
            translatedString = translatedString.replace(doubleBraceRegex, value).replace(singleBraceRegex, value);
          }
        }
        return translatedString;
      } catch (error) {
        return key;
      }
    }
    static innerTranslation(translation, params) {
      const regex = /(\[([\d])+\])/gm;
      return translation.replace(regex, (match, $1, $2) => {
        return params[$2];
      });
    }
  };

  // src/shared/helpers/component-data.helper.js
  var translate = TranslationHelper.translate;
  var ComponentDataHelper = class {
    static isLocalComponent(component) {
      return component && component.type === "COMPONENT" && !component.remote;
    }
    static getGroupKey(instance, mainComponent) {
      if (!mainComponent) {
        return "missing-main-component";
      }
      if (mainComponent.key) {
        return "component-key:" + mainComponent.key;
      }
      return "component-id:" + mainComponent.id;
    }
    static getGroupName(mainComponent) {
      if (!mainComponent) {
        return translate("zcr_missing_main_component_name");
      }
      const setName = mainComponent.parent && mainComponent.parent.type === "COMPONENT_SET" ? mainComponent.parent.name + " / " : "";
      return setName + mainComponent.name;
    }
    static groupToListItem(group) {
      const first = group.instances[0];
      return {
        id: group.id,
        name: group.name,
        source: group.source,
        count: group.instances.length,
        samplePage: first ? FigmaNodeHelper.getPageName(first) : "",
        samplePath: first ? FigmaNodeHelper.getNodePath(first) : "",
        hasMissingMainComponent: group.hasMissingMainComponent
      };
    }
    static componentToListItem(component) {
      const setName = component.parent && component.parent.type === "COMPONENT_SET" ? component.parent.name + " / " : "";
      return {
        id: component.id,
        name: setName + component.name,
        page: FigmaNodeHelper.getPageName(component)
      };
    }
    static normalizeName(name) {
      return String(name).trim().toLowerCase();
    }
  };

  // src/shared/helpers/component-replacer.helper.js
  var translate2 = TranslationHelper.translate;
  var ComponentReplacerHelper = class _ComponentReplacerHelper {
    static async selectInstances(figmaApi, state2, groupId) {
      const group = state2.groups.get(groupId);
      if (!group) {
        figmaApi.notify(translate2("zcr_group_not_found"));
        return;
      }
      const firstInstance = group.instances.find((node) => !node.removed);
      if (!firstInstance) {
        figmaApi.notify(translate2("zcr_no_selectable_instances"));
        return;
      }
      const current = FigmaNodeHelper.getPageNode(firstInstance);
      if (!current) {
        figmaApi.notify(translate2("zcr_instance_page_not_found"));
        return;
      }
      await figmaApi.setCurrentPageAsync(current);
      const visibleSelection = group.instances.filter((node) => {
        return !node.removed && FigmaNodeHelper.getPageNode(node) === current;
      });
      figmaApi.currentPage.selection = visibleSelection;
      if (visibleSelection.length > 0) {
        figmaApi.viewport.scrollAndZoomIntoView(visibleSelection);
      }
      if (visibleSelection.length < group.instances.length) {
        figmaApi.notify(translate2("zcr_selected_instances_on_page", {
          count: visibleSelection.length,
          page: current.name
        }));
      }
    }
    static replaceGroup(figmaApi, state2, groupId, replacementId) {
      const group = state2.groups.get(groupId);
      const replacement = state2.localComponents.get(replacementId);
      if (!group || !replacement) {
        figmaApi.notify(translate2("zcr_replacement_unavailable"));
        return { replaced: 0, failed: 0 };
      }
      let replaced = 0;
      let failed = 0;
      for (const instance of group.instances) {
        if (instance.removed) {
          failed += 1;
          continue;
        }
        try {
          instance.swapComponent(replacement);
          replaced += 1;
        } catch (error) {
          failed += 1;
        }
      }
      figmaApi.notify(
        failed === 0 ? translate2("zcr_replaced_instances", { count: replaced }) : translate2("zcr_replaced_instances_with_failures", { count: replaced, failed })
      );
      return { replaced, failed };
    }
    static autoReplaceExactMatches(figmaApi, state2) {
      const componentsByName = /* @__PURE__ */ new Map();
      for (const component of state2.localComponents.values()) {
        const name = ComponentDataHelper.normalizeName(ComponentDataHelper.componentToListItem(component).name);
        const existing = componentsByName.get(name);
        if (existing) {
          existing.push(component);
        } else {
          componentsByName.set(name, [component]);
        }
      }
      let matchedGroups = 0;
      let ambiguousGroups = 0;
      let unmatchedGroups = 0;
      let replaced = 0;
      let failed = 0;
      for (const group of state2.groups.values()) {
        const matches = componentsByName.get(ComponentDataHelper.normalizeName(group.name)) || [];
        if (matches.length === 0) {
          unmatchedGroups += 1;
          continue;
        }
        if (matches.length > 1) {
          ambiguousGroups += 1;
          continue;
        }
        matchedGroups += 1;
        const result = _ComponentReplacerHelper.replaceGroup(figmaApi, state2, group.id, matches[0].id);
        replaced += result.replaced;
        failed += result.failed;
      }
      figmaApi.notify(translate2("zcr_auto_replace_result", {
        replaced,
        unmatchedGroups,
        ambiguousGroups
      }));
      return {
        matchedGroups,
        ambiguousGroups,
        unmatchedGroups,
        replaced,
        failed
      };
    }
  };

  // src/shared/helpers/component-scanner.helper.js
  var translate3 = TranslationHelper.translate;
  var ComponentScannerHelper = class _ComponentScannerHelper {
    static async scanFile(figmaApi, state2) {
      await figmaApi.loadAllPagesAsync();
      const localComponents = _ComponentScannerHelper.collectLocalComponents(figmaApi, state2);
      const orphanGroups = await _ComponentScannerHelper.collectOrphanGroups(figmaApi, state2);
      return {
        orphanGroups,
        localComponents
      };
    }
    static collectLocalComponents(figmaApi, state2) {
      const components = figmaApi.root.findAll(FigmaNodeHelper.isComponent).filter(ComponentDataHelper.isLocalComponent).sort((a, b) => {
        return ComponentDataHelper.componentToListItem(a).name.localeCompare(
          ComponentDataHelper.componentToListItem(b).name
        );
      });
      state2.localComponents = new Map(components.map((component) => [component.id, component]));
      return components.map(ComponentDataHelper.componentToListItem);
    }
    static async collectOrphanGroups(figmaApi, state2) {
      const groups = /* @__PURE__ */ new Map();
      const instances = figmaApi.root.findAll(FigmaNodeHelper.isInstance);
      const instanceMainComponents = await Promise.all(
        instances.map(async (instance) => {
          return {
            instance,
            mainComponent: await instance.getMainComponentAsync()
          };
        })
      );
      for (const { instance, mainComponent } of instanceMainComponents) {
        const shouldList = !mainComponent || mainComponent.remote;
        if (!shouldList) {
          continue;
        }
        const id = ComponentDataHelper.getGroupKey(instance, mainComponent);
        const existing = groups.get(id);
        if (existing) {
          existing.instances.push(instance);
          continue;
        }
        groups.set(id, {
          id,
          name: ComponentDataHelper.getGroupName(mainComponent),
          source: mainComponent ? translate3("zcr_external_library") : translate3("zcr_missing_component"),
          instances: [instance],
          hasMissingMainComponent: !mainComponent
        });
      }
      state2.groups = groups;
      return Array.from(groups.values()).map(ComponentDataHelper.groupToListItem).sort((a, b) => a.name.localeCompare(b.name));
    }
  };

  // src/figma/boot.js
  figma.showUI(__html__, { width: 920, height: 640, themeColors: true });
  var state = {
    groups: /* @__PURE__ */ new Map(),
    localComponents: /* @__PURE__ */ new Map()
  };
  async function scanFile() {
    const scanResult = await ComponentScannerHelper.scanFile(figma, state);
    figma.ui.postMessage({
      type: "scan-result",
      orphanGroups: scanResult.orphanGroups,
      localComponents: scanResult.localComponents
    });
  }
  function postLoading(messageKey, placeholders = {}) {
    figma.ui.postMessage({
      type: "loading",
      messageKey,
      placeholders
    });
  }
  figma.ui.onmessage = async (message) => {
    if (message.type === "scan") {
      postLoading("zcr_loading_scan");
      await scanFile();
      return;
    }
    if (message.type === "select-group") {
      await ComponentReplacerHelper.selectInstances(figma, state, message.groupId);
      return;
    }
    if (message.type === "replace-group") {
      postLoading("zcr_loading_replace");
      const result = ComponentReplacerHelper.replaceGroup(figma, state, message.groupId, message.replacementId);
      await scanFile();
      figma.ui.postMessage({
        type: "replace-result",
        replaced: result.replaced,
        failed: result.failed
      });
      return;
    }
    if (message.type === "auto-replace-exact") {
      postLoading("zcr_loading_auto_replace");
      const result = ComponentReplacerHelper.autoReplaceExactMatches(figma, state);
      await scanFile();
      figma.ui.postMessage({
        type: "auto-replace-result",
        matchedGroups: result.matchedGroups,
        ambiguousGroups: result.ambiguousGroups,
        unmatchedGroups: result.unmatchedGroups,
        replaced: result.replaced,
        failed: result.failed
      });
      return;
    }
    if (message.type === "close") {
      figma.closePlugin();
    }
  };
})();
