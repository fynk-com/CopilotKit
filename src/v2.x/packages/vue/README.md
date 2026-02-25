# @copilotkitnext/vue

Vue 3 bindings for CopilotKit2: providers, composables, and chat rendering primitives for integrating AI agents into Vue applications.

## Installation

```bash
pnpm add @copilotkitnext/vue @copilotkitnext/core
```

## Basic Usage

```vue
<script setup lang="ts">
import { CopilotKitProvider } from "@copilotkitnext/vue";
</script>

<template>
  <CopilotKitProvider runtime-url="/api/copilotkit">
    <slot />
  </CopilotKitProvider>
</template>
```

## Chat Rendering (Slot-Based)

`@copilotkitnext/vue` uses Vue named/scoped slots for message, activity, and tool rendering:

- `CopilotChatMessageView`
- `CopilotChatToolCallsView`
- `CopilotChatInput`

```vue
<template>
  <CopilotChatMessageView :messages="messages" :is-running="isRunning">
    <template #message-before="{ message, runId, messageIndexInRun }">
      <MessageMeta :id="message.id" :run-id="runId" :index-in-run="messageIndexInRun" />
    </template>

    <template #assistant-message="{ message }">
      <AssistantBubble :content="message.content" />
    </template>

    <template #activity-mcp-apps="{ content }">
      <MyMcpActivity :content="content" />
    </template>

    <template #tool-call-search_docs="{ args, status, result }">
      <SearchDocsToolCall :args="args" :status="status" :result="result" />
    </template>

    <template #tool-call="{ name, args, status }">
      <GenericToolCall :name="name" :args="args" :status="status" />
    </template>
  </CopilotChatMessageView>
</template>
```

Supported message-level slots:

- `message-before`
- `assistant-message`
- `user-message`
- `activity-<activityType>` (dynamic)
- `activity-message` (fallback)
- `message-after`
- `cursor`

Supported tool-level slots:

- `tool-call-<toolName>` (dynamic)
- `tool-call` (fallback)

## Current Scope

- **Providers**: `CopilotKitProvider`, `CopilotChatConfigurationProvider`
- **Composables**: `useCopilotKit`, `useCopilotChatConfiguration`, `useAgent`, `useAgentContext`, `useFrontendTool`, `useHumanInTheLoop`, `useSuggestions`, `useConfigureSuggestions`
- **Components**: `CopilotChatAssistantMessage`, `CopilotChatUserMessage`, `CopilotChatMessageView`, `CopilotChatToolCallsView`, `CopilotChatInput`, `MCPAppsActivityRenderer`
- **Core**: `CopilotKitCoreVue`

## Icon Foundation (Internal)

- Chat/UI components should import icons from `src/components/icons/index.ts`.
- Do not import from `lucide-vue-next` directly in Vue package components.
- This adapter is internal and intentionally not exported from the package root.

## Text Input (MVP)

```vue
<script setup lang="ts">
import { ref } from "vue";
import { CopilotChatConfigurationProvider, CopilotChatInput } from "@copilotkitnext/vue";

const input = ref("");

function onSubmitMessage(value: string) {
  console.log("submit:", value);
}
</script>

<template>
  <CopilotChatConfigurationProvider thread-id="thread-1" agent-id="default">
    <CopilotChatInput
      v-model="input"
      @submit-message="onSubmitMessage"
    />
  </CopilotChatConfigurationProvider>
</template>
```

## React Parity Notes

The package follows the same single-package strategy as `@copilotkitnext/react`, with semantic parity for tool/activity/custom message rendering.

- In React, UI customization is driven by provider render arrays and `useRender*` hooks.
- In Vue, the same behavior is exposed through named/scoped slots on chat view components.
- Runtime semantics remain equivalent (tool matching precedence, tool status progression, activity fallback behavior).

## Architectural Decision: Render APIs -> Slots

Vue intentionally does not expose React-style provider render arrays (`renderToolCalls`, `renderActivityMessages`, `renderCustomMessages`) or `useRender*` hooks.  
Instead, the mirror strategy is deterministic slot translation at chat view boundaries.

Translation map:

| React surface | Vue surface |
| --- | --- |
| `renderToolCalls` / `useRenderToolCall` specific tool renderer | `#tool-call-<toolName>` |
| `renderToolCalls` wildcard renderer (`name: "*"` ) | `#tool-call` |
| `renderActivityMessages` specific activity renderer | `#activity-<activityType>` |
| `renderActivityMessages` fallback renderer | `#activity-message` |
| `renderCustomMessages` (`position: "before"`) | `#message-before` |
| `renderCustomMessages` (`position: "after"`) | `#message-after` |

Deterministic rules:

1. Keep precedence equivalent to React:
   Specific match first, fallback second.
2. Keep status semantics equivalent for tools:
   `inProgress` -> `executing` -> `complete`.
3. Keep built-in MCP apps fallback behavior:
   If no matching slot handles `mcp-apps`, render `MCPAppsActivityRenderer`.
4. Keep slot payloads stable and parity-tested against React behavior (not component internals).

This is an architectural constraint for future parity work: new React render-hook behavior should be mirrored by extending slot contracts, not by re-introducing provider render props in Vue.
