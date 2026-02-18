import type { Meta, StoryObj } from "@storybook/vue3-vite";
import CopilotStoryLayout from "./CopilotStoryLayout.vue";

const meta = {
  title: "UI/CopilotChatSuggestionView",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Scaffold placeholder mirroring React `CopilotChatSuggestionView.stories.tsx`.",
      },
    },
  },
  render: () => ({
    components: { CopilotStoryLayout },
    template: `
      <CopilotStoryLayout>
        <section style="padding: 24px 24px 40px">
          <h2 style="margin: 0 0 8px; font-size: 22px; line-height: 1.2">
            UI/CopilotChatSuggestionView
          </h2>
          <p style="margin: 0; color: #64748b">
            Scaffold placeholder mirroring React \`CopilotChatSuggestionView.stories.tsx\`.
          </p>
        </section>
      </CopilotStoryLayout>
    `,
  }),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scaffold: Story = {};
