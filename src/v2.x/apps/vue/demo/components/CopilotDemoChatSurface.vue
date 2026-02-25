<script setup lang="ts">
import { computed, ref, toRaw, watch } from "vue";
import type { Message } from "@ag-ui/core";
import {
  CopilotChatInput,
  CopilotChatMessageView,
  useAgent,
  useCopilotChatConfiguration,
} from "@copilotkitnext/vue";

const config = useCopilotChatConfiguration();
const { agent } = useAgent({
  get agentId() {
    return config.value?.agentId;
  },
});

const draft = ref("");
const hasSeededMessages = ref(false);

const seededMessages: Message[] = [
  {
    id: "user-1",
    role: "user",
    content: "Show me the current setup status for the Vue port.",
  },
  {
    id: "assistant-1",
    role: "assistant",
    content:
      "Vue demo scaffold is up. This screen is intentionally minimal and mirrors the React demo route layout for parity work.",
  },
];

const messages = computed(() => agent.value?.messages ?? []);
const isRunning = computed(() => agent.value?.isRunning ?? false);

watch(
  agent,
  (currentAgent) => {
    const runtimeAgent = toRaw(currentAgent);
    if (!runtimeAgent || hasSeededMessages.value) return;
    if (runtimeAgent.messages.length === 0) {
      runtimeAgent.setMessages(seededMessages);
    }
    hasSeededMessages.value = true;
  },
  { immediate: true },
);

function createMessageId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function handleSubmitMessage(content: string) {
  const runtimeAgent = toRaw(agent.value);
  if (!runtimeAgent) return;

  runtimeAgent.addMessage({
    id: createMessageId(),
    role: "user",
    content,
  });

  try {
    await runtimeAgent.runAgent();
  } catch (error) {
    console.error("Failed to run Vue demo agent:", error);
  }
}

function handleStop() {
  toRaw(agent.value)?.abortRun();
}
</script>

<template>
  <section style="max-width: 900px; display: flex; flex-direction: column; gap: 16px">
    <CopilotChatMessageView :messages="messages" :is-running="isRunning" />
    <CopilotChatInput
      v-model="draft"
      :is-running="isRunning"
      :show-stop-button="true"
      @submit-message="handleSubmitMessage"
      @stop="handleStop"
    />
  </section>
</template>
