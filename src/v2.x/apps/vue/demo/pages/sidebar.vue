<script setup lang="ts">
import { CopilotKitProvider } from "@copilotkitnext/vue";
</script>

<template>
  <CopilotKitProvider runtime-url="/api/copilotkit" show-dev-console="auto">
    <div style="min-height: 100vh; background: linear-gradient(135deg, #f1f5f9 0%, #ffffff 50%, #e2e8f0 100%)">
      <main style="margin: 0 auto; width: 100%; max-width: 1120px; display: flex; flex-direction: column; gap: 32px; padding: 48px 24px">
        <section style="display: flex; flex-direction: column; gap: 12px">
          <h1 style="margin: 0; font-size: 1.875rem; line-height: 1.2; color: #0f172a">Copilot Sidebar Demo</h1>
          <p style="margin: 0; max-width: 820px; color: #475569">
            This route mirrors the React sidebar page structure and content. The Vue `CopilotSidebar` primitive is not
            ported yet, so this route remains scaffold-only for now.
          </p>
        </section>

        <section style="display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))">
          <article
            v-for="index in 4"
            :key="index"
            style="border: 1px solid #e2e8f0; border-radius: 1rem; background: #ffffff; padding: 24px; box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08)"
          >
            <h2 style="margin: 0; font-size: 1.125rem; color: #0f172a">Project Card {{ index }}</h2>
            <p style="margin: 10px 0 0; font-size: 0.925rem; color: #64748b">
              Placeholder content to keep page-level parity while waiting for `CopilotSidebar` in the Vue package.
            </p>
          </article>
        </section>

        <section style="border: 1px dashed #94a3b8; border-radius: 12px; padding: 16px; background: #ffffff; color: #475569">
          Pending parity primitive: `CopilotSidebar`.
        </section>
      </main>
    </div>
  </CopilotKitProvider>
</template>
