# @copilotkitnext/vue

Vue 3 bindings for CopilotKit2 - providers and composables for integrating AI agents into Vue applications.

## Installation

```bash
pnpm add @copilotkitnext/vue @copilotkitnext/core
```

## Usage

```vue
<script setup lang="ts">
import { useCopilotKit } from '@copilotkitnext/vue'
</script>

<template>
  <CopilotKitProvider runtime-url="/api/copilotkit">
    <slot />
  </CopilotKitProvider>
</template>
```

## v1 Scope

- **Providers**: `CopilotKitProvider`, `CopilotChatConfigurationProvider`
- **Composables**: `useCopilotKit`, `useAgent`, `useFrontendTool`, `useHumanInTheLoop`, `useSuggestions`, `useConfigureSuggestions`, `useAgentContext`, `useCopilotChatConfiguration`
- **Core**: `CopilotKitCoreVue` - Vue-specific core with render tool call management

Chat UI components (sidebar, popup, message views, etc.) are not included in v1.
