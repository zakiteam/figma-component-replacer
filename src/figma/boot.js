import ComponentReplacerHelper from "../shared/helpers/component-replacer.helper";
import ComponentScannerHelper from "../shared/helpers/component-scanner.helper";

// This file runs in Figma's main plugin runtime, not inside the Vue iframe.
// Only this runtime can access the Figma Plugin API and mutate document nodes.
figma.showUI(__html__, { width: 920, height: 640, themeColors: true });

// Keep real Figma node references here. The UI iframe only receives serializable summaries and ids.
const state = {
  groups: new Map(),
  localComponents: new Map()
};

async function scanFile() {
  const scanResult = await ComponentScannerHelper.scanFile(figma, state);

  // Send plain data back to the iframe UI after the Figma document has been scanned.
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

// Messages sent from the Vue iframe arrive here through parent.postMessage(...).
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
