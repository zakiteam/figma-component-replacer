import ComponentDataHelper from "./component-data.helper";
import FigmaNodeHelper from "./figma-node.helper";
import TranslationHelper from "./translation.helper";

const translate = TranslationHelper.translate;

export default class ComponentScannerHelper {
  static async scanFile(figmaApi, state) {
    await figmaApi.loadAllPagesAsync();

    const localComponents = ComponentScannerHelper.collectLocalComponents(figmaApi, state);
    const orphanGroups = await ComponentScannerHelper.collectOrphanGroups(figmaApi, state);

    return {
      orphanGroups,
      localComponents
    };
  }

  static collectLocalComponents(figmaApi, state) {
    const components = figmaApi.root.findAll(FigmaNodeHelper.isComponent)
      .filter(ComponentDataHelper.isLocalComponent)
      .sort((a, b) => {
        return ComponentDataHelper.componentToListItem(a).name.localeCompare(
          ComponentDataHelper.componentToListItem(b).name
        );
      });

    state.localComponents = new Map(components.map((component) => [component.id, component]));

    return components.map(ComponentDataHelper.componentToListItem);
  }

  static async collectOrphanGroups(figmaApi, state) {
    const groups = new Map();
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
        source: mainComponent ? translate("zcr_external_library") : translate("zcr_missing_component"),
        instances: [instance],
        hasMissingMainComponent: !mainComponent
      });
    }

    state.groups = groups;

    return Array.from(groups.values())
      .map(ComponentDataHelper.groupToListItem)
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
