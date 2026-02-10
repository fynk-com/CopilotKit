# AGENTS.md - `@copilotkitnext/vue` parity guide

This file defines how agents should keep `@copilotkitnext/vue` aligned with upstream `@copilotkitnext/react`.

## Scope and goal

- Scope: `src/v2.x/packages/vue/**`.
- Primary goal: preserve **semantic parity** with React for core hooks/providers/types.
- Secondary goal: keep Vue idiomatic where framework mechanics require it, while minimizing public API drift.

## Canonical source of truth

- Treat `src/v2.x/packages/react` as the canonical behavioral reference.
- For non-chat core APIs, parity means:
  - same intent,
  - same runtime semantics,
  - same edge-case handling,
  - equivalent test coverage.
- Do not mirror React line-by-line; mirror behavior.

## Package boundary rules

- `@copilotkitnext/vue` is core and UI-agnostic.
- Chat UI/component parity belongs in a separate `@copilotkitnext/vue-ui` scope.
- Do not pull chat-specific rendering/component concerns into the core Vue package.

## API compatibility policy

- Keep public API names and shapes as close to React as possible.
- If Vue requires a difference, choose the smallest possible divergence and document it.
- Prefer explicit type exports from `.ts` files and re-export from package barrels.
- Keep provider/hook/type barrels aligned with React export intent.

## Vue-specific translation principles

- Providers:
  - use default slots by default;
  - preserve React provider semantics (inheritance, precedence, defaults).
- Reactivity:
  - prefer safe, explicit reactivity over clever shortcuts;
  - avoid passing Vue reactive proxies into APIs that clone/serialize unless normalized.
- Hook dependencies:
  - use Vue `WatchSource`-based dependencies to mirror React deps behavior.
- Tool rendering:
  - preserve wildcard/specific/agent-scoped semantics from React.

## Testing parity strategy

- Follow an integration-first strategy using real `CopilotKitCore` behavior where practical.
- Maintain parity test coverage for:
  - providers (`CopilotKitProvider`, chat configuration provider),
  - hooks (`useAgent`, `useAgentContext`, `useSuggestions`, `useConfigureSuggestions`, `useFrontendTool`, `useHumanInTheLoop`),
  - type helpers (`defineToolCallRenderer`).
- Keep shared test utilities for agent simulation and provider mounting to reduce drift and duplication.
- Parity requirement is semantic, not snapshot/structure identity.

## Build and dependency alignment

- Keep bundling/externalization intent aligned with React package behavior.
- Keep shared dependency versions aligned with sibling packages (`core`, `react`, `angular`) unless an intentional repo-wide upgrade occurs.
- Avoid introducing dynamic type-import workarounds when a direct typed import pattern used by React is available.
- For web inspector behavior, mirror React's runtime loading strategy and use test-time mocks in Vue tests.

## Validation gates (required)

Run all three after meaningful changes:

1. `pnpm -C src/v2.x/packages/vue lint`
2. `pnpm -C src/v2.x/packages/vue check-types`
3. `pnpm -C src/v2.x/packages/vue test`

When touching package integration/build behavior, also run:

- `pnpm -C src/v2.x/packages/vue build`
- `pnpm turbo run build --filter=@copilotkitnext/vue`

## Parity update workflow

When React changes:

1. Identify impacted React hooks/providers/types and tests.
2. Port behavior to Vue with minimal API drift.
3. Port/add equivalent Vue tests for the changed behavior.
4. Run validation gates.
5. If divergence remains, document the reason and keep it explicit and minimal.
