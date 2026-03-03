<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, ref, watch } from "vue";
import { useCopilotChatConfiguration } from "../../providers/useCopilotChatConfiguration";
import { CopilotChatDefaultLabels } from "../../providers/types";
import { IconArrowUp, IconMic, IconPlus, IconSquare } from "../icons";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    disabled?: boolean;
    placeholder?: string;
    autoFocus?: boolean;
    clearOnSubmit?: boolean;
    showDisclaimer?: boolean;
    isRunning?: boolean;
    showStopButton?: boolean;
    enableAddFile?: boolean;
    enableStartTranscribe?: boolean;
  }>(),
  {
    disabled: false,
    autoFocus: false,
    clearOnSubmit: true,
    showDisclaimer: true,
    isRunning: false,
    showStopButton: true,
    enableAddFile: undefined,
    enableStartTranscribe: undefined,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  "submit-message": [value: string];
  stop: [];
  "add-file": [];
  "start-transcribe": [];
}>();

const config = useCopilotChatConfiguration();
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const localValue = ref(props.modelValue ?? "");
const isComposing = ref(false);
const instance = getCurrentInstance();

const isControlled = computed(() => props.modelValue !== undefined);
const inputValue = computed(() => (isControlled.value ? (props.modelValue ?? "") : localValue.value));
const labels = computed(() => config.value?.labels ?? CopilotChatDefaultLabels);
const resolvedPlaceholder = computed(() => props.placeholder ?? labels.value.chatInputPlaceholder);
const canSubmit = computed(() => !props.disabled && inputValue.value.trim().length > 0);
const canSend = computed(() => canSubmit.value && !(props.isRunning && props.showStopButton));
const vnodeProps = computed(
  () => (instance?.vnode.props ?? {}) as Record<string, unknown>,
);

function hasListener(listenerName: string) {
  const listener = vnodeProps.value[listenerName];
  if (Array.isArray(listener)) {
    return listener.length > 0;
  }
  return !!listener;
}

const hasAddFileAction = computed(() => props.enableAddFile ?? hasListener("onAddFile"));
const hasStartTranscribeAction = computed(
  () => props.enableStartTranscribe ?? hasListener("onStartTranscribe"),
);

watch(
  () => props.modelValue,
  (next) => {
    if (isControlled.value) {
      localValue.value = next ?? "";
    }
  },
);

onMounted(() => {
  if (props.autoFocus) {
    textareaRef.value?.focus();
  }
});

function handleInput(event: Event) {
  const nextValue = (event.target as HTMLTextAreaElement).value;
  if (isControlled.value) {
    emit("update:modelValue", nextValue);
    return;
  }
  localValue.value = nextValue;
}

function submit() {
  if (!canSend.value) return;
  const trimmed = inputValue.value.trim();
  if (!trimmed) return;

  emit("submit-message", trimmed);

  if (props.clearOnSubmit) {
    emit("update:modelValue", "");
    localValue.value = "";
  }
}

function handleKeydown(event: KeyboardEvent) {
  const key = event.key?.toLowerCase();
  const code = event.code?.toLowerCase();
  if (key !== "enter" && code !== "enter" && code !== "numpadenter") return;
  if (event.shiftKey) return;
  if (props.disabled) return;
  if (isComposing.value || event.isComposing) return;

  event.preventDefault();
  submit();
}

function handleContainerClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null;
  if (!target) return;
  if (target.tagName === "BUTTON" || target.closest("button")) return;
  textareaRef.value?.focus();
}

function handleAddFile() {
  if (!hasAddFileAction.value || props.disabled) return;
  emit("add-file");
}

function handleStartTranscribe() {
  if (!hasStartTranscribeAction.value || props.disabled) return;
  emit("start-transcribe");
}
</script>

<template>
  <div class="w-full" v-bind="$attrs">
    <div
      data-testid="copilot-chat-input-shell"
      class="flex w-full cursor-text flex-col overflow-visible rounded-[28px] bg-white bg-clip-padding shadow-[0_4px_4px_0_#0000000a,0_0_1px_0_#0000009e] contain-inline-size dark:bg-[#303030]"
      @click="handleContainerClick"
    >
      <div class="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 px-3 py-2">
        <div class="flex items-center">
          <button
            type="button"
            data-testid="copilot-chat-input-add"
            :aria-label="labels.chatInputToolbarAddButtonLabel"
            :disabled="disabled || !hasAddFileAction"
            class="ml-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-transparent text-[#444444] transition-colors hover:bg-[#f8f8f8] hover:text-[#333333] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#444444] dark:text-white dark:hover:bg-[#404040] dark:hover:text-[#FFFFFF] dark:disabled:hover:bg-transparent dark:disabled:hover:text-[#CCCCCC]"
            @click="handleAddFile"
          >
            <IconPlus class="size-[20px]" />
          </button>
        </div>

        <div class="relative flex min-h-[50px] min-w-0 items-center">
          <textarea
            ref="textareaRef"
            data-testid="copilot-chat-input-textarea"
            :value="inputValue"
            :placeholder="resolvedPlaceholder"
            :disabled="disabled"
            rows="1"
            class="w-full bg-transparent py-3 pr-5 text-[16px] leading-6 text-foreground antialiased outline-none placeholder:text-[#00000077] disabled:opacity-60 dark:placeholder:text-[#fffc]"
            style="overflow: auto; resize: none"
            @input="handleInput"
            @keydown="handleKeydown"
            @compositionstart="isComposing = true"
            @compositionend="isComposing = false"
          />
        </div>

        <div class="flex items-center justify-end gap-2">
          <button
            v-if="hasStartTranscribeAction"
            type="button"
            data-testid="copilot-chat-input-start-transcribe"
            :aria-label="labels.chatInputToolbarStartTranscribeButtonLabel"
            :disabled="disabled"
            class="mr-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-transparent text-[#444444] transition-colors hover:bg-[#f8f8f8] hover:text-[#333333] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#444444] dark:text-white dark:hover:bg-[#404040] dark:hover:text-[#FFFFFF] dark:disabled:hover:bg-transparent dark:disabled:hover:text-[#CCCCCC]"
            @click="handleStartTranscribe"
          >
            <IconMic class="size-[18px]" />
          </button>
          <button
            v-if="isRunning && showStopButton"
            type="button"
            data-testid="copilot-chat-input-stop"
            aria-label="Stop generating"
            :disabled="disabled"
            class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-transparent text-[#444444] transition-colors hover:bg-[#f8f8f8] hover:text-[#333333] disabled:cursor-not-allowed disabled:opacity-50 dark:text-white dark:hover:bg-[#404040] dark:hover:text-[#FFFFFF]"
            @click="emit('stop')"
          >
            <IconSquare class="size-[18px] fill-current" />
          </button>
          <div class="mr-[10px]">
            <button
              type="button"
              data-testid="copilot-chat-input-send"
              aria-label="Send message"
              :disabled="!canSend"
              class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white transition-colors hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#00000014] disabled:text-[rgb(13,13,13)] disabled:hover:opacity-100 dark:bg-white dark:text-black dark:disabled:bg-[#454545] dark:disabled:text-white"
              @click="submit"
            >
              <IconArrowUp class="size-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <p
      v-if="showDisclaimer"
      data-testid="copilot-chat-input-disclaimer"
      class="mx-auto max-w-3xl px-4 py-3 text-center text-xs text-muted-foreground"
    >
      {{ labels.chatDisclaimerText }}
    </p>
  </div>
</template>
