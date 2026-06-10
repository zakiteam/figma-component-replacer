<template>
  <section :class="componentClass">
    <div v-if="!group" :class="`${componentClass}__empty`">{{ t("zcr_select_orphan_empty") }}</div>

    <div v-else :class="`${componentClass}__panel`">
      <h2 :class="`${componentClass}__title`">{{ group.name }}</h2>

      <div :class="`${componentClass}__grid`">
        <div :class="`${componentClass}__label`">{{ t("zcr_status_label") }}</div>
        <div>{{ statusText }}</div>
        <div :class="`${componentClass}__label`">{{ t("zcr_instances_label") }}</div>
        <div>{{ group.count }}</div>
        <div :class="`${componentClass}__label`">{{ t("zcr_example_label") }}</div>
        <div :class="`${componentClass}__path`">{{ group.samplePath }}</div>
      </div>

      <label :class="`${componentClass}__label`" for="replacementSearch">{{ t("zcr_replace_with_local_component") }}</label>
      <div :class="`${componentClass}__replacement`">
        <input
          id="replacementSearch"
          v-model="replacementQuery"
          :class="`${componentClass}__input`"
          type="search"
          :placeholder="t('zcr_search_local_component_placeholder')"
        />
        <select v-model="replacementId" :class="`${componentClass}__select`">
          <option value="">{{ t("zcr_choose_component") }}</option>
          <option
            v-for="component in filteredComponents"
            :key="component.id"
            :value="component.id"
          >
            {{ t("zcr_component_option", { name: component.name, page: component.page }) }}
          </option>
        </select>
      </div>

      <div v-if="group.hasMissingMainComponent" :class="`${componentClass}__warning`">
        {{ t("zcr_missing_main_component_warning") }}
      </div>

      <div :class="`${componentClass}__actions`">
        <button :class="[`${componentClass}__button`, `${componentClass}__button--secondary`]" type="button" @click="copyName">{{ t("zcr_copy_name") }}</button>
        <button :class="[`${componentClass}__button`, `${componentClass}__button--secondary`]" type="button" @click="$emit('select-instances', group.id)">{{ t("zcr_select_instances") }}</button>
        <button :class="[`${componentClass}__button`, `${componentClass}__button--primary`]" type="button" :disabled="!replacementId" @click="replace">{{ t("zcr_replace_all") }}</button>
      </div>

      <p :class="`${componentClass}__note`">{{ t("zcr_replacement_note") }}</p>
    </div>
  </section>
</template>

<script>
import { computed, ref, watch } from "vue";
import TranslationHelper from "../../../shared/helpers/translation.helper";
import ComponentInfo from "./OrphanDetail.meta";
import "./style/OrphanDetail.css";

const { class: componentClass } = ComponentInfo;

export default {
  name: ComponentInfo.name,
  props: {
    group: {
      type: Object,
      default: null
    },
    localComponents: {
      type: Array,
      required: true
    }
  },
  emits: ["copy-name", "select-instances", "replace"],
  setup(props, { emit }) {
    const replacementQuery = ref("");
    const replacementId = ref("");

    const statusText = computed(() => {
      if (!props.group) {
        return "";
      }

      return props.group.hasMissingMainComponent
        ? TranslationHelper.translate("zcr_orphan_missing_component")
        : TranslationHelper.translate("zcr_orphan_external_library");
    });

    const filteredComponents = computed(() => {
      const query = replacementQuery.value.trim().toLowerCase();

      if (!query) {
        return props.localComponents;
      }

      return props.localComponents.filter((component) => {
        return [
          component.name,
          component.page
        ].join(" ").toLowerCase().includes(query);
      });
    });

    watch(() => props.group && props.group.id, () => {
      replacementQuery.value = "";
      replacementId.value = "";
    });

    function copyName() {
      if (!props.group) {
        return;
      }

      replacementQuery.value = props.group.name;
      replacementId.value = "";
      emit("copy-name", props.group.name);
    }

    function replace() {
      if (!props.group || !replacementId.value) {
        return;
      }

      emit("replace", {
        groupId: props.group.id,
        replacementId: replacementId.value
      });
    }

    return {
      componentClass,
      replacementQuery,
      replacementId,
      statusText,
      filteredComponents,
      copyName,
      replace,
      t: TranslationHelper.translate
    };
  }
};
</script>
