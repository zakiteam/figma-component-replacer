import stringsLocale from "../data/locale/strings.locale";

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

export default class TranslationHelper {
  constructor(translation) {
    TranslationHelper.translation = translation;
  }

  static translate(key, placeholders = {}, activeLang = getAppLocale()) {
    const strings = getLocalizationOverride(TranslationHelper.translation || stringsLocale);
    const language = strings[activeLang] ? activeLang : "en";

    try {
      if (!strings[language] || strings[language][key] === undefined) {
        return key;
      }

      let translatedString = strings[language][key];

      for (const placeholder in placeholders) {
        if (Object.prototype.hasOwnProperty.call(placeholders, placeholder)) {
          const value = placeholders[placeholder];
          const singleBraceRegex = new RegExp("\\{" + placeholder + "\\}", "g");
          const doubleBraceRegex = new RegExp("\\{\\{" + placeholder + "\\}\\}", "g");
          translatedString = translatedString
            .replace(doubleBraceRegex, value)
            .replace(singleBraceRegex, value);
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
}
