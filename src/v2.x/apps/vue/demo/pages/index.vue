<script setup lang="ts">
import { computed, defineComponent, h, ref, toRaw, watch } from "vue";
import { z } from "zod";
import type { Message } from "@ag-ui/core";
import {
  CopilotChatConfigurationProvider,
  CopilotChatInput,
  CopilotChatMessageView,
  CopilotKitProvider,
  useAgent,
  useAgentContext,
  useConfigureSuggestions,
  useCopilotChatConfiguration,
  useFrontendTool,
} from "@copilotkitnext/vue";

const selectedThreadId = ref<"thread---a" | "thread---b" | "thread---c">("thread---a");

const threadOptions: Array<{ id: typeof selectedThreadId.value; label: string }> = [
  { id: "thread---a", label: "Thread A" },
  { id: "thread---b", label: "Thread B" },
  { id: "thread---c", label: "Thread C" },
];

const DefaultChatRouteContent = defineComponent({
  name: "DefaultChatRouteContent",
  props: {
    threadId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const config = useCopilotChatConfiguration();
    const { agent } = useAgent({
      get agentId() {
        return config.value?.agentId;
      },
    });

    const draft = ref("");
    const hasSeededMessages = ref(false);

    useConfigureSuggestions({
      instructions: "Suggest follow-up tasks based on the current page content",
      available: "always",
    });

    useAgentContext({
      description: "The current Thread ID is:",
      value: computed(() => props.threadId),
    });

    useFrontendTool({
      name: "sayHello",
      parameters: z.object({
        name: z.string(),
      }),
      handler: async ({ name }) => {
        if (typeof window !== "undefined") {
          window.alert(`Hello ${name}`);
        }
        return `Hello ${name}`;
      },
    });

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
          "Vue route-level scaffold is in place. This page mirrors the React default demo route structure while the full CopilotChat primitive is still being ported.",
      },
    ];

    const messages = computed(() => agent.value?.messages ?? []);
    const isRunning = computed(() => agent.value?.isRunning ?? false);

    watch(
      [agent, () => props.threadId],
      ([currentAgent]) => {
        const runtimeAgent = toRaw(currentAgent);
        if (!runtimeAgent) return;
        if (hasSeededMessages.value) return;
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

    return () =>
      h("div", { style: "display: flex; flex-direction: column; gap: 16px; min-height: 0; flex: 1" }, [
        h(CopilotChatMessageView, {
          messages: messages.value,
          isRunning: isRunning.value,
        }),
        h(CopilotChatInput, {
          modelValue: draft.value,
          "onUpdate:modelValue": (value: string) => {
            draft.value = value;
          },
          isRunning: isRunning.value,
          showStopButton: true,
          onSubmitMessage: handleSubmitMessage,
          onStop: handleStop,
        }),
      ]);
  },
});
</script>

<template>
  <CopilotKitProvider runtime-url="/api/copilotkit" show-dev-console="auto">
    <CopilotChatConfigurationProvider :thread-id="selectedThreadId">
      <main style="display: flex; flex-direction: column; height: 100vh; margin: 0; padding: 16px; gap: 16px">
        <div style="display: flex; gap: 10px; justify-content: center">
          <button
            v-for="thread in threadOptions"
            :key="thread.id"
            type="button"
            :aria-pressed="thread.id === selectedThreadId"
            :style="{
              padding: '6px 14px',
              borderRadius: '20px',
              border: thread.id === selectedThreadId ? '2px solid #111827' : '1px solid #d1d5db',
              backgroundColor: thread.id === selectedThreadId ? '#111827' : '#ffffff',
              color: thread.id === selectedThreadId ? '#ffffff' : '#111827',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease-in-out',
            }"
            @click="selectedThreadId = thread.id"
          >
            {{ thread.label }}
          </button>
        </div>
        <DefaultChatRouteContent :thread-id="selectedThreadId" />
      </main>
    </CopilotChatConfigurationProvider>
  </CopilotKitProvider>
</template>
