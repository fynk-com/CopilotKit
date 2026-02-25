<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import type { AssistantMessage, Message } from "@ag-ui/core";
import { useCopilotChatConfiguration } from "../../providers/useCopilotChatConfiguration";
import { CopilotChatDefaultLabels } from "../../providers/types";
import {
  IconCheck,
  IconCopy,
  IconRefreshCw,
  IconThumbsDown,
  IconThumbsUp,
  IconVolume2,
} from "../icons";
import CopilotChatToolCallsView from "./CopilotChatToolCallsView.vue";

const props = withDefaults(
  defineProps<{
    message: AssistantMessage;
    messages?: Message[];
    isRunning?: boolean;
    toolbarVisible?: boolean;
    onThumbsUp?: (message: AssistantMessage) => void;
    onThumbsDown?: (message: AssistantMessage) => void;
    onReadAloud?: (message: AssistantMessage) => void;
    onRegenerate?: (message: AssistantMessage) => void;
  }>(),
  {
    messages: () => [],
    isRunning: false,
    toolbarVisible: true,
    onThumbsUp: undefined,
    onThumbsDown: undefined,
    onReadAloud: undefined,
    onRegenerate: undefined,
  },
);

const emit = defineEmits<{
  "thumbs-up": [message: AssistantMessage];
  "thumbs-down": [message: AssistantMessage];
  "read-aloud": [message: AssistantMessage];
  regenerate: [message: AssistantMessage];
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

function normalizeContent(content: unknown): string {
  if (!content) {
    return "";
  }

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    const parts = content as Array<{ type?: unknown; text?: unknown }>;
    return parts
      .map((part) => {
        if (
          part &&
          typeof part === "object" &&
          "type" in part &&
          part.type === "text" &&
          typeof part.text === "string"
        ) {
          return part.text;
        }
        return "";
      })
      .filter((text) => text.length > 0)
      .join("\n");
  }

  return "";
}

const normalizedContent = computed(() => normalizeContent(props.message.content));
const hasContent = computed(() => normalizedContent.value.trim().length > 0);
const hasThumbsUp = computed(() => typeof props.onThumbsUp === "function");
const hasThumbsDown = computed(() => typeof props.onThumbsDown === "function");
const hasReadAloud = computed(() => typeof props.onReadAloud === "function");
const hasRegenerate = computed(() => typeof props.onRegenerate === "function");
const isLatestAssistantMessage = computed(
  () => props.messages[props.messages.length - 1]?.id === props.message.id,
);
const shouldShowToolbar = computed(
  () => props.toolbarVisible && hasContent.value && !(props.isRunning && isLatestAssistantMessage.value),
);

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
  const content = normalizedContent.value;
  if (!content) return;

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(content);
      resetCopiedStateWithDelay();
    } catch {
      resetCopiedStateWithDelay();
    }
  } else {
    resetCopiedStateWithDelay();
  }
}

function handleThumbsUp() {
  props.onThumbsUp?.(props.message);
  emit("thumbs-up", props.message);
}

function handleThumbsDown() {
  props.onThumbsDown?.(props.message);
  emit("thumbs-down", props.message);
}

function handleReadAloud() {
  props.onReadAloud?.(props.message);
  emit("read-aloud", props.message);
}

function handleRegenerate() {
  props.onRegenerate?.(props.message);
  emit("regenerate", props.message);
}

onBeforeUnmount(() => {
  if (copiedResetTimeout) {
    clearTimeout(copiedResetTimeout);
  }
});
</script>

<template>
  <div
    class="prose max-w-full break-words dark:prose-invert"
    :data-message-id="message.id"
    v-bind="$attrs"
  >
    <div v-if="hasContent" class="whitespace-pre-wrap">{{ normalizedContent }}</div>

    <CopilotChatToolCallsView :message="message" :messages="messages">
      <template v-for="(_, slotName) in $slots" :key="slotName" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps" />
      </template>
    </CopilotChatToolCallsView>

    <div v-if="shouldShowToolbar" class="w-full bg-transparent flex items-center -ml-[5px] -mt-[0px]">
      <div class="flex items-center gap-1">
        <button
          type="button"
          :class="toolbarButtonClass"
          :aria-label="labels.assistantMessageToolbarCopyMessageLabel"
          :title="labels.assistantMessageToolbarCopyMessageLabel"
          @click="handleCopyMessage"
        >
          <IconCheck v-if="copied" class="size-[18px]" />
          <IconCopy v-else class="size-[18px]" />
        </button>

        <button
          v-if="hasThumbsUp"
          type="button"
          :class="toolbarButtonClass"
          :aria-label="labels.assistantMessageToolbarThumbsUpLabel"
          :title="labels.assistantMessageToolbarThumbsUpLabel"
          @click="handleThumbsUp"
        >
          <IconThumbsUp class="size-[18px]" />
        </button>

        <button
          v-if="hasThumbsDown"
          type="button"
          :class="toolbarButtonClass"
          :aria-label="labels.assistantMessageToolbarThumbsDownLabel"
          :title="labels.assistantMessageToolbarThumbsDownLabel"
          @click="handleThumbsDown"
        >
          <IconThumbsDown class="size-[18px]" />
        </button>

        <button
          v-if="hasReadAloud"
          type="button"
          :class="toolbarButtonClass"
          :aria-label="labels.assistantMessageToolbarReadAloudLabel"
          :title="labels.assistantMessageToolbarReadAloudLabel"
          @click="handleReadAloud"
        >
          <IconVolume2 class="size-[20px]" />
        </button>

        <button
          v-if="hasRegenerate"
          type="button"
          :class="toolbarButtonClass"
          :aria-label="labels.assistantMessageToolbarRegenerateLabel"
          :title="labels.assistantMessageToolbarRegenerateLabel"
          @click="handleRegenerate"
        >
          <IconRefreshCw class="size-[18px]" />
        </button>

        <slot name="toolbar-items" />
      </div>
    </div>
  </div>
</template>
