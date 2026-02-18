# AGENTS.md - Vue demo parity rules

## Scope

- Scope: `src/v2.x/apps/vue/demo/**`.
- Goal: mirror `src/v2.x/apps/react/demo/**` behavior and flow as closely as possible.

## Source of truth

- Treat the React demo as canonical for routes, runtime wiring, and UI interaction patterns.
- Prefer equivalent structure and naming when Nuxt conventions allow it.

## Parity constraints

- Do not add Vue-only product features, routes, or workflow changes.
- Keep runtime endpoint behavior aligned with React (`/api/copilotkit`, `/api/copilotkit-single`, `/api/copilotkit-mcp`).
- If a React behavior cannot be mirrored yet because package primitives are missing, keep the route scaffolded and minimal until parity primitives land.

## Implementation guidance

- Mirror route coverage first: `/`, `/single`, `/mcp-apps`, `/sidebar`, `/popup`.
- Mirror interaction semantics second (thread behavior, tool handling, suggestions, dev console usage).
- Keep deviations explicit and temporary.

## Validation

Run after meaningful changes:

1. `pnpm -C src/v2.x/apps/vue/demo dev`
2. `pnpm -C src/v2.x/apps/vue/demo build`
