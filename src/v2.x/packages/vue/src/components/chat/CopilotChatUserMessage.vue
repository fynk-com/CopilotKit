<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import type { UserMessage } from "@ag-ui/core";
import { useCopilotChatConfiguration } from "../../providers/useCopilotChatConfiguration";
import { CopilotChatDefaultLabels } from "../../providers/types";
import { IconCheck, IconChevronLeft, IconChevronRight, IconCopy, IconEdit } from "../icons";

interface OnEditMessageProps {
  message: UserMessage;
}

interface OnSwitchToBranchProps {
  message: UserMessage;
  branchIndex: number;
  numberOfBranches: number;
}

const props = withDefaults(
  defineProps<{
    message: UserMessage;
    branchIndex?: number;
    numberOfBranches?: number;
    onEditMessage?: (props: OnEditMessageProps) => void;
    onSwitchToBranch?: (props: OnSwitchToBranchProps) => void;
  }>(),
  {
    branchIndex: 0,
    numberOfBranches: 1,
    onEditMessage: undefined,
    onSwitchToBranch: undefined,
  },
);

defineSlots<{
  "toolbar-items"?: () => unknown;
}>();

const emit = defineEmits<{
  "edit-message": [payload: OnEditMessageProps];
  "switch-to-branch": [payload: OnSwitchToBranchProps];
}>();

const config = useCopilotChatConfiguration();
const labels = computed(() => config.value?.labels ?? CopilotChatDefaultLabels);
const copied = ref(false);
let copiedResetTimeout: ReturnType<typeof setTimeout> | null = null;

const toolbarButtonClass = [
  "inline-flex h-8 w-8 items-center justify-center rounded-md p-0",
  "cursor-pointer text-[rgb(93,93,93)] transition-colors hover:bg-[#E8E8E8]",
  "hover:text-[rgb(93,93,93)] dark:text-[rgb(243,243,243)] dark:hover:bg-[#303030]",
  "dark:hover:text-[rgb(243,243,243)] disabled:pointer-events-none disabled:opacity-50",
].join(" ");

function flattenUserMessageContent(content?: UserMessage["content"]): string {
  if (!content) {
    return "";
  }

  if (typeof content === "string") {
    return content;
  }

  return content
    .map((part) => {
      if (
        part &&
        typeof part === "object" &&
        "type" in part &&
        (part as { type?: unknown }).type === "text" &&
        typeof (part as { text?: unknown }).text === "string"
      ) {
        return (part as { text: string }).text;
      }
      return "";
    })
    .filter((text) => text.length > 0)
    .join("\n");
}

const flattenedContent = computed(() => flattenUserMessageContent(props.message.content));
const isMultiline = computed(() => flattenedContent.value.includes("\n"));
const hasEditAction = computed(() => typeof props.onEditMessage === "function");
const showBranchNavigation = computed(
  () => props.numberOfBranches > 1 && !!props.onSwitchToBranch,
);

const canGoPrev = computed(() => props.branchIndex > 0);
const canGoNext = computed(() => props.branchIndex < props.numberOfBranches - 1);

function resetCopiedStateWithDelay() {
  if (copiedResetTimeout) {
    clearTimeout(copiedResetTimeout);
  }
  copied.value = true;
  copiedResetTimeout = setTimeout(() => {
    copied.value = false;
    copiedResetTimeout = null;
  }, 2000);
}

async function handleCopyMessage() {
  if (!flattenedContent.value) return;

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(flattenedContent.value);
      resetCopiedStateWithDelay();
    } catch {
      resetCopiedStateWithDelay();
    }
  } else {
    resetCopiedStateWithDelay();
  }
}

function handleEditMessage() {
  const payload = { message: props.message };
  props.onEditMessage?.(payload);
  emit("edit-message", payload);
}

function switchToBranch(branchIndex: number) {
  const payload = {
    branchIndex,
    numberOfBranches: props.numberOfBranches,
    message: props.message,
  };
  props.onSwitchToBranch?.(payload);
  emit("switch-to-branch", payload);
}

onBeforeUnmount(() => {
  if (copiedResetTimeout) {
    clearTimeout(copiedResetTimeout);
  }
});
</script>

<template>
  <div class="flex flex-col items-end group pt-10" :data-message-id="message.id" v-bind="$attrs">
    <div
      class="prose dark:prose-invert bg-muted relative max-w-[80%] rounded-[18px] px-4 py-1.5 inline-block whitespace-pre-wrap"
      :data-multiline="isMultiline ? 'true' : undefined"
      :class="{ 'py-3': isMultiline }"
    >
      {{ flattenedContent }}
    </div>

    <div class="w-full bg-transparent flex items-center justify-end -mr-[5px] mt-[4px] invisible group-hover:visible">
      <div class="flex items-center gap-1 justify-end">
        <slot name="toolbar-items" />

        <button
          type="button"
          :class="toolbarButtonClass"
          :aria-label="labels.userMessageToolbarCopyMessageLabel"
          :title="labels.userMessageToolbarCopyMessageLabel"
          @click="handleCopyMessage"
        >
          <IconCheck v-if="copied" class="size-[18px]" />
          <IconCopy v-else class="size-[18px]" />
        </button>

        <button
          v-if="hasEditAction"
          type="button"
          :class="toolbarButtonClass"
          :aria-label="labels.userMessageToolbarEditMessageLabel"
          :title="labels.userMessageToolbarEditMessageLabel"
          @click="handleEditMessage"
        >
          <IconEdit class="size-[18px]" />
        </button>

        <div v-if="showBranchNavigation" class="flex items-center gap-1">
          <button
            type="button"
            :class="toolbarButtonClass"
            class="h-6 w-6 p-0"
            :disabled="!canGoPrev"
            aria-label="Previous branch"
            title="Previous branch"
            @click="switchToBranch(branchIndex - 1)"
          >
            <IconChevronLeft class="size-[20px]" />
          </button>
          <span class="text-sm text-muted-foreground px-0 font-medium">
            {{ branchIndex + 1 }}/{{ numberOfBranches }}
          </span>
          <button
            type="button"
            :class="toolbarButtonClass"
            class="h-6 w-6 p-0"
            :disabled="!canGoNext"
            aria-label="Next branch"
            title="Next branch"
            @click="switchToBranch(branchIndex + 1)"
          >
            <IconChevronRight class="size-[20px]" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
