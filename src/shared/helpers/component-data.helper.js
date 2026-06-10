import FigmaNodeHelper from "./figma-node.helper";
import TranslationHelper from "./translation.helper";

const translate = TranslationHelper.translate;

export default class ComponentDataHelper {
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

    const setName = mainComponent.parent && mainComponent.parent.type === "COMPONENT_SET"
      ? mainComponent.parent.name + " / "
      : "";

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
    const setName = component.parent && component.parent.type === "COMPONENT_SET"
      ? component.parent.name + " / "
      : "";

    return {
      id: component.id,
      name: setName + component.name,
      page: FigmaNodeHelper.getPageName(component)
    };
  }

  static normalizeName(name) {
    return String(name).trim().toLowerCase();
  }
}
