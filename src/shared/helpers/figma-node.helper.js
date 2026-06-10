export default class FigmaNodeHelper {
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
    const page = FigmaNodeHelper.getPageNode(node);
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
}
