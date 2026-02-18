# Vue Demo (Nuxt)

Nuxt SSR demo for `@copilotkitnext/vue` with strict parity intent against the React demo.

## Parity policy

- Canonical reference: `src/v2.x/apps/react/demo`.
- Match React route set, endpoint contracts, and interaction semantics before adding anything else.
- No Vue-only workflows or features in this app.
- Temporary gaps are allowed only when Vue package primitives are still being ported.

## Current status

- App and server endpoint scaffolding are in place.
- Route skeletons are present for:
  - `/`
  - `/single`
  - `/mcp-apps`
  - `/sidebar`
  - `/popup`
- Endpoint routes are present for:
  - `GET/POST /api/copilotkit/**`
  - `POST /api/copilotkit-single`
  - `GET/POST /api/copilotkit-mcp/**`

## Local setup

1. Add required env vars in `.env` (same as React demo), for example:

```bash
OPENAI_API_KEY=sk-...
```

2. Install deps from repo root:

```bash
pnpm install
```

3. Start the demo:

```bash
pnpm -C src/v2.x/apps/vue/demo dev
```
