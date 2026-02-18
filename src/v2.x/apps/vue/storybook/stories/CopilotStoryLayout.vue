<script setup lang="ts">
import { CopilotChatConfigurationProvider, CopilotKitProvider } from "@copilotkitnext/vue";

withDefaults(
  defineProps<{
    threadId?: string;
    isModalDefaultOpen?: boolean;
  }>(),
  {
    threadId: "story-copilot-layout",
    isModalDefaultOpen: true,
  },
);
</script>

<template>
  <CopilotKitProvider runtime-url="https://copilotkit.ai">
    <CopilotChatConfigurationProvider
      :thread-id="threadId"
      :is-modal-default-open="isModalDefaultOpen"
    >
      <div style="min-height: 100vh; background: var(--color-background, #fff); color: var(--color-foreground, #020617)">
        <div style="margin: 0 auto; max-width: 1000px; padding: 24px">
          <h1 style="margin: 0 0 8px; font-size: 30px">Project Dashboard</h1>
          <p style="margin: 0; color: #64748b">
            Vue story scaffold mirroring the React Storybook layout contract.
          </p>
        </div>
        <slot />
      </div>
    </CopilotChatConfigurationProvider>
  </CopilotKitProvider>
</template>
