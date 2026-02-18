import type { Message } from "@ag-ui/core";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { CopilotChatMessageView } from "@copilotkitnext/vue";
import CopilotStoryLayout from "./CopilotStoryLayout.vue";

const messages: Message[] = [
  {
    id: "user-1",
    role: "user",
    content: "Can we keep Vue and React behavior aligned?",
    timestamp: new Date(),
  },
  {
    id: "assistant-1",
    role: "assistant",
    content:
      "Yes. This Storybook starts as a parity scaffold and will be filled with Vue equivalents of React stories.",
    timestamp: new Date(),
  },
];

const meta = {
  title: "UI/CopilotChatMessageView",
  parameters: {
    layout: "fullscreen",
  },
  render: () => ({
    components: {
      CopilotStoryLayout,
      CopilotChatMessageView,
    },
    setup() {
      return { messages };
    },
    template: `
      <CopilotStoryLayout>
        <section style="padding: 24px 24px 40px">
          <CopilotChatMessageView :messages="messages" />
        </section>
      </CopilotStoryLayout>
    `,
  }),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scaffold: Story = {};
