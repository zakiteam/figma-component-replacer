<template>
  <header :class="componentClass">
    <h1 :class="`${componentClass}__title`">{{ t("zcr_app_title") }}</h1>
    <div :class="`${componentClass}__actions`">
      <button :class="`${componentClass}__button`" type="button" @click="$emit('auto-replace')">{{ t("zcr_auto_match") }}</button>
      <button :class="`${componentClass}__button`" type="button" @click="$emit('scan')">{{ t("zcr_scan") }}</button>
      <button :class="`${componentClass}__button`" type="button" @click="$emit('close')">{{ t("zcr_close") }}</button>
    </div>
  </header>
</template>

<script>
import TranslationHelper from "../../../shared/helpers/translation.helper";
import ComponentInfo from "./AppToolbar.meta";
import "./style/AppToolbar.css";

const { class: componentClass } = ComponentInfo;

export default {
  name: ComponentInfo.name,
  emits: ["scan", "auto-replace", "close"],
  setup() {
    return {
      componentClass,
      t: TranslationHelper.translate
    };
  }
};
</script>
