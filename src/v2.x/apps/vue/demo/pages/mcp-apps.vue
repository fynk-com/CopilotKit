<script setup lang="ts">
import { CopilotKitProvider } from "@copilotkitnext/vue";
</script>

<template>
  <CopilotKitProvider runtime-url="/api/copilotkit-mcp" show-dev-console="auto">
    <div style="min-height: 100vh; background: linear-gradient(135deg, #f1f5f9 0%, #ffffff 50%, #e2e8f0 100%)">
      <main style="margin: 0 auto; width: 100%; max-width: 1120px; display: flex; flex-direction: column; gap: 32px; padding: 48px 24px">
        <section style="display: flex; flex-direction: column; gap: 12px">
          <h1 style="margin: 0; font-size: 1.875rem; line-height: 1.2; color: #0f172a">MCP Apps Demo</h1>
          <p style="margin: 0; max-width: 860px; color: #475569">
            This route mirrors the React MCP apps page structure. The Vue `CopilotSidebar` primitive required by this
            route is not ported yet, so this page remains scaffold-only.
          </p>
          <div style="border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; padding: 16px; color: #475569">
            <p style="margin: 0; font-weight: 600; color: #0f172a">Available MCP Tools (ext-apps)</p>
            <ul style="margin: 12px 0 0; padding-left: 20px; display: grid; gap: 6px">
              <li><code>get-time</code> - Current server time</li>
              <li><code>get-budget-data</code> - Interactive budget allocation</li>
              <li><code>get-cohort-data</code> - Cohort analysis heatmap</li>
              <li><code>get-customer-data</code> - Customer segmentation analysis</li>
              <li><code>get-scenario-data</code> - SaaS scenario modeling</li>
              <li><code>play-sheet-music</code> - Music notation rendering</li>
              <li><code>get-system-stats</code> - System monitoring dashboard</li>
              <li><code>show_threejs_scene</code> - 3D visualization</li>
              <li><code>play_video</code> - Video player</li>
              <li><code>get-first-degree-links</code> - Wikipedia link explorer</li>
            </ul>
          </div>
        </section>

        <section style="display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))">
          <article
            v-for="index in 4"
            :key="index"
            style="border: 1px solid #e2e8f0; border-radius: 1rem; background: #ffffff; padding: 24px; box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08)"
          >
            <h2 style="margin: 0; font-size: 1.125rem; color: #0f172a">Demo Card {{ index }}</h2>
            <p style="margin: 10px 0 0; font-size: 0.925rem; color: #64748b">
              Route-level placeholder while waiting for interactive sidebar rendering in Vue.
            </p>
          </article>
        </section>

        <section style="border: 1px dashed #94a3b8; border-radius: 12px; padding: 16px; background: #ffffff; color: #475569">
          Pending parity primitive: `CopilotSidebar` with MCP activity surface.
        </section>
      </main>
    </div>
  </CopilotKitProvider>
</template>
