import ComponentDataHelper from "./component-data.helper";
import FigmaNodeHelper from "./figma-node.helper";
import TranslationHelper from "./translation.helper";

const translate = TranslationHelper.translate;

export default class ComponentReplacerHelper {
  static async selectInstances(figmaApi, state, groupId) {
    const group = state.groups.get(groupId);

    if (!group) {
      figmaApi.notify(translate("zcr_group_not_found"));
      return;
    }

    const firstInstance = group.instances.find((node) => !node.removed);

    if (!firstInstance) {
      figmaApi.notify(translate("zcr_no_selectable_instances"));
      return;
    }

    const current = FigmaNodeHelper.getPageNode(firstInstance);

    if (!current) {
      figmaApi.notify(translate("zcr_instance_page_not_found"));
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
      figmaApi.notify(translate("zcr_selected_instances_on_page", {
        count: visibleSelection.length,
        page: current.name
      }));
    }
  }

  static replaceGroup(figmaApi, state, groupId, replacementId) {
    const group = state.groups.get(groupId);
    const replacement = state.localComponents.get(replacementId);

    if (!group || !replacement) {
      figmaApi.notify(translate("zcr_replacement_unavailable"));
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
      failed === 0
        ? translate("zcr_replaced_instances", { count: replaced })
        : translate("zcr_replaced_instances_with_failures", { count: replaced, failed })
    );

    return { replaced, failed };
  }

  static autoReplaceExactMatches(figmaApi, state) {
    const componentsByName = new Map();

    for (const component of state.localComponents.values()) {
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

    for (const group of state.groups.values()) {
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
      const result = ComponentReplacerHelper.replaceGroup(figmaApi, state, group.id, matches[0].id);
      replaced += result.replaced;
      failed += result.failed;
    }

    figmaApi.notify(translate("zcr_auto_replace_result", {
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
}
