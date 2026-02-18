<script setup lang="ts">
import type { Message } from "@ag-ui/core";
import {
  CopilotChatConfigurationProvider,
  CopilotChatMessageView,
  CopilotKitProvider,
} from "@copilotkitnext/vue";

const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    runtimeUrl: string;
    useSingleEndpoint?: boolean;
  }>(),
  {
    useSingleEndpoint: false,
  },
);

const messages: Message[] = [
  {
    id: "user-1",
    role: "user",
    content: "Show me the current setup status for the Vue port.",
    timestamp: new Date(),
  },
  {
    id: "assistant-1",
    role: "assistant",
    content:
      "Vue demo scaffold is up. This screen is intentionally minimal and mirrors the React demo route layout for parity work.",
    timestamp: new Date(),
  },
];
</script>

<template>
  <CopilotKitProvider
    :runtime-url="props.runtimeUrl"
    :use-single-endpoint="props.useSingleEndpoint"
    show-dev-console="auto"
  >
    <CopilotChatConfigurationProvider thread-id="vue-demo-thread">
      <main style="display: flex; min-height: 100vh; flex-direction: column; gap: 20px; padding: 24px">
        <header style="display: flex; flex-direction: column; gap: 8px">
          <h1 style="margin: 0; font-size: 28px">{{ props.title }}</h1>
          <p style="margin: 0; color: #475569">{{ props.description }}</p>
          <nav style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 8px; font-weight: 600">
            <NuxtLink to="/">Default</NuxtLink>
            <NuxtLink to="/single">Single Endpoint</NuxtLink>
            <NuxtLink to="/mcp-apps">MCP Apps</NuxtLink>
            <NuxtLink to="/sidebar">Sidebar</NuxtLink>
            <NuxtLink to="/popup">Popup</NuxtLink>
          </nav>
        </header>

        <section style="max-width: 900px">
          <CopilotChatMessageView :messages="messages" />
        </section>
      </main>
    </CopilotChatConfigurationProvider>
  </CopilotKitProvider>
</template>
