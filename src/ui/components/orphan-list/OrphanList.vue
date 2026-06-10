<template>
  <div :class="componentClass">
    <div v-if="groups.length === 0" :class="`${componentClass}__empty`">
      {{ hasOrphanGroups ? t("zcr_no_filter_results") : t("zcr_no_orphans_found") }}
    </div>

    <button
      v-for="group in groups"
      :key="group.id"
      :class="[
        `${componentClass}__item`,
        group.id === selectedGroupId && `${componentClass}__item--active`
      ]"
      type="button"
      @click="$emit('select', group.id)"
    >
      <span
        :class="[
          `${componentClass}__status`,
          !group.hasMissingMainComponent && `${componentClass}__status--remote`
        ]"
      >
        {{ statusText(group) }}
      </span>

      <span :class="`${componentClass}__title`">
        <span :class="`${componentClass}__name`">{{ group.name }}</span>
        <span :class="`${componentClass}__badge`">{{ group.count }}</span>
      </span>

      <span :class="`${componentClass}__meta`">{{ t("zcr_instances_count", { count: group.count, page: group.samplePage }) }}</span>
    </button>
  </div>
</template>

<script>
import TranslationHelper from "../../../shared/helpers/translation.helper";
import ComponentInfo from "./OrphanList.meta";
import "./style/OrphanList.css";

const { class: componentClass } = ComponentInfo;

export default {
  name: ComponentInfo.name,
  props: {
    groups: {
      type: Array,
      required: true
    },
    selectedGroupId: {
      type: String,
      default: null
    },
    hasOrphanGroups: {
      type: Boolean,
      required: true
    }
  },
  emits: ["select"],
  setup() {
    function statusText(group) {
      return group.hasMissingMainComponent
        ? TranslationHelper.translate("zcr_orphan_missing_component")
        : TranslationHelper.translate("zcr_orphan_external_library");
    }

    return {
      componentClass,
      statusText,
      t: TranslationHelper.translate
    };
  }
};
</script>
