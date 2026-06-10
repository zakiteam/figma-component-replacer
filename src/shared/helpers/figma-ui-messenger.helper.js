export default class FigmaUiMessengerHelper {
  static postPluginMessage(message) {
    // The Vue app runs inside Figma's UI iframe. window.parent is Figma's iframe host.
    window.parent.postMessage({ pluginMessage: message }, "*");
  }
  static listen(callback) {
    // The main plugin runtime replies with figma.ui.postMessage(...), which arrives on the iframe window.
    window.onmessage = (event) => {
      const message = event.data.pluginMessage;

      if (!message) {
        return;
      }

      callback(message);
    };
  }
}
