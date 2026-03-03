<script setup lang="ts">
import { computed, defineComponent, h, onBeforeUnmount, ref } from "vue";
import type { AssistantMessage, Message } from "@ag-ui/core";
import { StreamMarkdown } from "streamdown-vue";
import { useCopilotChatConfiguration } from "../../providers/useCopilotChatConfiguration";
import { CopilotChatDefaultLabels } from "../../providers/types";
import {
  IconCheck,
  IconCopy,
  IconDownload,
  IconRefreshCw,
  IconThumbsDown,
  IconThumbsUp,
  IconVolume2,
} from "../icons";
import CopilotChatToolCallsView from "./CopilotChatToolCallsView.vue";
import "katex/dist/katex.min.css";

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

function extractFileNameFromUrl(url: string, fallback: string) {
  try {
    const parsed = new URL(url, "https://copilotkit.local");
    const pathname = parsed.pathname.split("/").filter(Boolean).pop();
    if (pathname) {
      return decodeURIComponent(pathname);
    }
  } catch {
    return fallback;
  }
  return fallback;
}

function triggerDownload(href: string, fileName: string) {
  if (typeof document === "undefined") {
    return;
  }
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

function triggerBlobDownload(content: string, mimeType: string, fileName: string) {
  if (typeof window === "undefined" || typeof URL === "undefined") {
    return;
  }
  const blob = new Blob([content], { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);
  triggerDownload(objectUrl, fileName);
  URL.revokeObjectURL(objectUrl);
}

function extractTableRows(tableElement: HTMLTableElement): string[][] {
  return Array.from(tableElement.querySelectorAll("tr")).map((row) =>
    Array.from(row.querySelectorAll("th, td")).map((cell) => (cell.textContent ?? "").trim()),
  );
}

function toMarkdownTable(rows: string[][]): string {
  if (!rows.length) {
    return "";
  }

  const width = Math.max(...rows.map((row) => row.length), 0);
  if (!width) {
    return "";
  }

  const sanitize = (value: string) => value.replace(/\|/g, "\\|").replace(/\n/g, " ");
  const padRow = (row: string[]) => Array.from({ length: width }, (_, index) => sanitize(row[index] ?? ""));
  const [header = Array.from({ length: width }, () => ""), ...body] = rows.map(padRow);
  const separator = Array.from({ length: width }, () => "---");
  const lines = [
    `| ${header.join(" | ")} |`,
    `| ${separator.join(" | ")} |`,
    ...body.map((row) => `| ${row.join(" | ")} |`),
  ];

  return lines.join("\n");
}

function toCsvTable(rows: string[][]): string {
  const escape = (value: string) => `"${value.replace(/"/g, "\"\"")}"`;
  return rows.map((row) => row.map((cell) => escape(cell ?? "")).join(",")).join("\n");
}

const MarkdownImage = defineComponent({
  name: "CopilotMarkdownImage",
  inheritAttrs: false,
  props: {
    src: {
      type: String,
      default: "",
    },
    alt: {
      type: String,
      default: "",
    },
  },
  setup(imageProps, { attrs }) {
    async function handleDownload() {
      if (!imageProps.src) {
        return;
      }

      const fileName = extractFileNameFromUrl(imageProps.src, "image");
      try {
        const response = await fetch(imageProps.src);
        if (!response.ok) {
          throw new Error("Failed to fetch image");
        }
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        triggerDownload(objectUrl, fileName);
        URL.revokeObjectURL(objectUrl);
      } catch {
        triggerDownload(imageProps.src, fileName);
      }
    }

    return () => {
      const imageAttrs = {
        ...attrs,
        src: imageProps.src,
        alt: imageProps.alt,
        class: ["max-w-full rounded-lg", attrs.class].filter(Boolean).join(" "),
        "data-streamdown": "image",
      } as Record<string, unknown>;

      delete imageAttrs.className;

      return h("div", { class: "group relative my-4 inline-block", "data-streamdown": "image-wrapper" }, [
        h("img", imageAttrs),
        h("div", {
          class: "pointer-events-none absolute inset-0 hidden rounded-lg bg-black/10 group-hover:block",
        }),
        h(
          "button",
          {
            type: "button",
            class:
              "absolute right-2 bottom-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border bg-background/90 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-background opacity-0 group-hover:opacity-100",
            title: "Download image",
            onClick: handleDownload,
          },
          [h(IconDownload, { class: "size-[14px]" })],
        ),
      ]);
    };
  },
});

const MarkdownTable = defineComponent({
  name: "CopilotMarkdownTable",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const tableRef = ref<HTMLTableElement | null>(null);
    const copied = ref(false);
    let copiedTimeout: ReturnType<typeof setTimeout> | null = null;

    const resetCopied = () => {
      if (copiedTimeout) {
        clearTimeout(copiedTimeout);
      }
      copied.value = true;
      copiedTimeout = setTimeout(() => {
        copied.value = false;
        copiedTimeout = null;
      }, 2000);
    };

    async function handleCopyTable() {
      const tableElement = tableRef.value;
      if (!tableElement) {
        return;
      }
      const markdown = toMarkdownTable(extractTableRows(tableElement));
      if (!markdown) {
        return;
      }
      try {
        await navigator.clipboard.writeText(markdown);
      } catch {
      }
      resetCopied();
    }

    function handleDownloadTable() {
      const tableElement = tableRef.value;
      if (!tableElement) {
        return;
      }
      const csv = toCsvTable(extractTableRows(tableElement));
      if (!csv) {
        return;
      }
      triggerBlobDownload(csv, "text/csv;charset=utf-8", "table.csv");
    }

    onBeforeUnmount(() => {
      if (copiedTimeout) {
        clearTimeout(copiedTimeout);
      }
    });

    return () => {
      const tableAttrs = {
        ...attrs,
        ref: tableRef,
        class: ["w-full border-collapse border border-border", attrs.class].filter(Boolean).join(" "),
        "data-streamdown": "table",
      } as Record<string, unknown>;
      delete tableAttrs.className;

      const actionButtonClass =
        "cursor-pointer p-1 text-muted-foreground transition-all hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50";

      return h("div", { class: "my-4 flex flex-col space-y-2", "data-streamdown": "table-wrapper" }, [
        h("div", { class: "flex items-center justify-end gap-1" }, [
          h(
            "button",
            {
              type: "button",
              class: actionButtonClass,
              title: "Copy table",
              onClick: handleCopyTable,
            },
            [h(copied.value ? IconCheck : IconCopy, { class: "size-[14px]" })],
          ),
          h(
            "button",
            {
              type: "button",
              class: actionButtonClass,
              title: "Download table",
              onClick: handleDownloadTable,
            },
            [h(IconDownload, { class: "size-[14px]" })],
          ),
        ]),
        h("div", { class: "overflow-x-auto" }, [h("table", tableAttrs, slots.default?.() ?? [])]),
      ]);
    };
  },
});

const markdownComponents = {
  img: MarkdownImage,
  table: MarkdownTable,
};

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
    <StreamMarkdown
      v-if="hasContent"
      class="copilot-chat-assistant-markdown"
      :content="normalizedContent"
      :components="markdownComponents"
      :shiki-theme="{ light: 'github-light', dark: 'github-dark' }"
    />

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

<style>
.copilot-chat-assistant-markdown [data-streamdown="p"] {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
}

.copilot-chat-assistant-markdown [data-streamdown="p"]:first-child {
  margin-top: 0;
}

.copilot-chat-assistant-markdown [data-streamdown="code-block"] {
  background: transparent;
  border: 1px solid oklch(0.922 0 0);
  border-radius: 14px;
  margin: 1rem 0;
  overflow: hidden;
}

.copilot-chat-assistant-markdown [data-streamdown="code-block-header"] {
  background: transparent;
  border-bottom: none;
  color: oklch(0.556 0 0);
  display: flex;
  font-size: 12px;
  justify-content: space-between;
  padding: 12px;
}

.copilot-chat-assistant-markdown [data-streamdown="code-body"] {
  background: transparent;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 14px;
  line-height: 20px;
  padding: 16px;
}

.copilot-chat-assistant-markdown [data-streamdown="code-lang"] {
  background: transparent;
  color: oklch(0.556 0 0);
  font-size: 12px;
  margin-left: 4px;
  padding: 0;
  text-transform: lowercase;
}

.copilot-chat-assistant-markdown [data-streamdown="code-actions"] {
  align-items: center;
  display: flex;
  gap: 8px;
}

.copilot-chat-assistant-markdown [data-streamdown="download-button"],
.copilot-chat-assistant-markdown [data-streamdown="copy-button"] {
  background: transparent;
  border: none;
  border-radius: 0;
  color: oklch(0.556 0 0);
  padding: 4px;
}

.copilot-chat-assistant-markdown [data-streamdown="download-button"]:hover,
.copilot-chat-assistant-markdown [data-streamdown="copy-button"]:hover {
  background: transparent;
  color: oklch(0.205 0 0);
}

.copilot-chat-assistant-markdown [data-streamdown="pre"] {
  background: transparent;
  border: none;
  line-height: 20px;
  margin: 0;
  padding: 0;
}

.copilot-chat-assistant-markdown [data-streamdown="code"] {
  background: transparent;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 14px;
  line-height: 20px;
}

.copilot-chat-assistant-markdown .sr-only {
  border: 0;
  clip: rect(0, 0, 0, 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

.copilot-chat-assistant-markdown [data-streamdown="download-button"] svg,
.copilot-chat-assistant-markdown [data-streamdown="copy-button"] svg {
  height: 14px;
  width: 14px;
}
</style>
