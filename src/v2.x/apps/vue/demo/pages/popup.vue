<script setup lang="ts">
import { CopilotKitProvider } from "@copilotkitnext/vue";
</script>

<template>
  <CopilotKitProvider runtime-url="/api/copilotkit" show-dev-console="auto">
    <div style="min-height: 100vh; background: linear-gradient(135deg, #f1f5f9 0%, #ffffff 50%, #e2e8f0 100%)">
      <main style="margin: 0 auto; width: 100%; max-width: 1120px; display: flex; flex-direction: column; gap: 32px; padding: 48px 24px 160px">
        <section style="display: flex; flex-direction: column; gap: 12px">
          <span style="display: inline-flex; width: fit-content; align-items: center; border-radius: 999px; background: rgba(15, 23, 42, 0.08); padding: 4px 12px; font-size: 0.75rem; font-weight: 600; color: #334155">
            Overlay Chat Demo
          </span>
          <h1 style="margin: 0; font-size: 1.875rem; line-height: 1.2; color: #0f172a">Copilot Popup Demo</h1>
          <p style="margin: 0; max-width: 820px; color: #475569">
            This route mirrors the React popup page scaffolding. The Vue `CopilotPopup` primitive is not ported yet,
            so the overlay interaction is intentionally deferred.
          </p>
        </section>

        <section style="display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))">
          <article
            v-for="index in 6"
            :key="index"
            style="border: 1px solid #e2e8f0; border-radius: 1rem; background: #ffffff; padding: 24px; box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08)"
          >
            <h2 style="margin: 0; font-size: 1.125rem; color: #0f172a">In-Flow Task {{ index }}</h2>
            <p style="margin: 10px 0 0; font-size: 0.925rem; color: #64748b">
              Placeholder task card matching the React popup route content structure.
            </p>
          </article>
        </section>

        <section style="border: 1px dashed #94a3b8; border-radius: 12px; padding: 16px; background: #ffffff; color: #475569">
          Pending parity primitive: `CopilotPopup`.
        </section>
      </main>
    </div>
  </CopilotKitProvider>
</template>
