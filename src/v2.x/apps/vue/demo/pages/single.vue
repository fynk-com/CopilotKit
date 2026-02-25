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
  useConfigureSuggestions,
  useCopilotChatConfiguration,
  useFrontendTool,
} from "@copilotkitnext/vue";

const SingleEndpointRouteContent = defineComponent({
  name: "SingleEndpointRouteContent",
  setup() {
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
        id: "single-user-1",
        role: "user",
        content: "Can you confirm single-endpoint mode is active?",
      },
      {
        id: "single-assistant-1",
        role: "assistant",
        content:
          "Single endpoint route scaffold is active. Runtime calls flow through /api/copilotkit-single for Vue parity.",
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
        console.error("Failed to run Vue single-endpoint demo agent:", error);
      }
    }

    function handleStop() {
      toRaw(agent.value)?.abortRun();
    }

    return () =>
      h("div", { style: "display: flex; flex-direction: column; min-height: 100vh; margin: 0; padding: 16px; gap: 16px" }, [
        h("h1", { style: "margin: 0; font-size: 1.5rem; line-height: 1.3" }, "Single Endpoint Demo"),
        h(
          "p",
          { style: "margin: 0; color: #475569; max-width: 840px" },
          "Route structure mirrors React single-page demo while using the current Vue chat primitives.",
        ),
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
        ]),
      ]);
  },
});
</script>

<template>
  <CopilotKitProvider runtime-url="/api/copilotkit-single" :use-single-endpoint="true" show-dev-console="auto">
    <CopilotChatConfigurationProvider thread-id="xyz">
      <SingleEndpointRouteContent />
    </CopilotChatConfigurationProvider>
  </CopilotKitProvider>
</template>
