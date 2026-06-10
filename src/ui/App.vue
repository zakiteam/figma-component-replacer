<template>
  <div :class="componentClass">
    <AppToolbar
      @scan="scan"
      @auto-replace="autoReplaceExact"
      @close="closePlugin"
    />

    <div v-if="isLoading" :class="`${componentClass}__loader`" role="status" aria-live="polite">
      <div :class="`${componentClass}__loader-indicator`"></div>
      <div :class="`${componentClass}__loader-text`">{{ loadingMessage }}</div>
    </div>

    <main :class="`${componentClass}__content`">
      <aside :class="`${componentClass}__sidebar`">
        <div :class="`${componentClass}__summary`">{{ summaryText }}</div>
        <div :class="`${componentClass}__search`">
          <input v-model="orphanQuery" :class="`${componentClass}__search-input`" type="search" :placeholder="t('zcr_filter_orphans_placeholder')" />
        </div>

        <OrphanList
          :groups="filteredGroups"
          :selected-group-id="selectedGroupId"
          :has-orphan-groups="orphanGroups.length > 0"
          @select="selectGroup"
        />
      </aside>

      <OrphanDetail
        :group="selectedGroup"
        :local-components="localComponents"
        @copy-name="copyName"
        @select-instances="selectInstances"
        @replace="replaceGroup"
      />
    </main>
  </div>
</template>

<script>
import { computed, onMounted, ref } from "vue";
import ComponentInfo from "./App.meta";
import AppToolbar from "./components/app-toolbar/AppToolbar.vue";
import OrphanDetail from "./components/orphan-detail/OrphanDetail.vue";
import OrphanList from "./components/orphan-list/OrphanList.vue";
import ClipboardHelper from "../shared/helpers/clipboard.helper";
import FigmaUiMessengerHelper from "../shared/helpers/figma-ui-messenger.helper";
import TranslationHelper from "../shared/helpers/translation.helper";
import "./style/App.css";

const { class: componentClass } = ComponentInfo;

export default {
  name: "App",
  components: {
    AppToolbar,
    OrphanDetail,
    OrphanList
  },
  setup() {
    const orphanGroups = ref([]);
    const localComponents = ref([]);
    const selectedGroupId = ref(null);
    const orphanQuery = ref("");
    const isLoading = ref(true);
    const loadingMessage = ref(TranslationHelper.translate("zcr_loading_plugin"));

    const selectedGroup = computed(() => {
      return orphanGroups.value.find((group) => group.id === selectedGroupId.value) || null;
    });

    const filteredGroups = computed(() => {
      const query = orphanQuery.value.trim().toLowerCase();

      if (!query) {
        return orphanGroups.value;
      }

      return orphanGroups.value.filter((group) => {
        return [
          group.name,
          group.source,
          group.samplePage,
          group.samplePath
        ].join(" ").toLowerCase().includes(query);
      });
    });

    const summaryText = computed(() => {
      if (isLoading.value) {
        return loadingMessage.value;
      }

      const orphanCount = orphanGroups.value.reduce((total, group) => total + group.count, 0);

      return TranslationHelper.translate("zcr_summary", {
        groups: orphanGroups.value.length,
        instances: orphanCount,
        localComponents: localComponents.value.length
      });
    });

    function showLoader(messageKey, placeholders = {}) {
      isLoading.value = true;
      loadingMessage.value = TranslationHelper.translate(messageKey, placeholders);
    }

    function hideLoader() {
      isLoading.value = false;
    }

    function scan() {
      showLoader("zcr_loading_scan");
      FigmaUiMessengerHelper.postPluginMessage({ type: "scan" });
    }

    function autoReplaceExact() {
      showLoader("zcr_loading_auto_replace");
      FigmaUiMessengerHelper.postPluginMessage({ type: "auto-replace-exact" });
    }

    function closePlugin() {
      FigmaUiMessengerHelper.postPluginMessage({ type: "close" });
    }

    function selectGroup(groupId) {
      selectedGroupId.value = groupId;
    }

    function copyName(groupName) {
      ClipboardHelper.copyText(groupName);
    }

    function selectInstances(groupId) {
      FigmaUiMessengerHelper.postPluginMessage({
        type: "select-group",
        groupId
      });
    }

    function replaceGroup(payload) {
      showLoader("zcr_loading_replace");
      FigmaUiMessengerHelper.postPluginMessage({
        type: "replace-group",
        groupId: payload.groupId,
        replacementId: payload.replacementId
      });
    }

    function applyScanResult(message) {
      orphanGroups.value = message.orphanGroups;
      localComponents.value = message.localComponents;

      if (!orphanGroups.value.some((group) => group.id === selectedGroupId.value)) {
        selectedGroupId.value = orphanGroups.value[0] ? orphanGroups.value[0].id : null;
      }

      hideLoader();
    }

    onMounted(() => {
      FigmaUiMessengerHelper.listen((message) => {
        if (message.type === "loading") {
          showLoader(message.messageKey, message.placeholders);
        }

        if (message.type === "scan-result") {
          applyScanResult(message);
        }

        if (message.type === "replace-result" || message.type === "auto-replace-result") {
          hideLoader();
        }
      });

      requestAnimationFrame(() => {
        scan();
      });
    });

    return {
      orphanGroups,
      componentClass,
      localComponents,
      selectedGroupId,
      selectedGroup,
      orphanQuery,
      filteredGroups,
      summaryText,
      isLoading,
      loadingMessage,
      scan,
      autoReplaceExact,
      closePlugin,
      selectGroup,
      copyName,
      selectInstances,
      replaceGroup,
      t: TranslationHelper.translate
    };
  }
};
</script>
